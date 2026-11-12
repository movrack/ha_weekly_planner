"""Global mode helpers (docs/adr/0001): pure functions, no Home Assistant objects.

A mode is the state of one external selector shared by every program. A program keeps its schedules in
``profiles`` (storage key unchanged); a profile belongs to a mode when its NAME equals the mode name.
The first profile of a program is its default profile: it applies when there is no selector.
"""

from __future__ import annotations

from collections.abc import Iterable
from copy import deepcopy
from typing import Any
import uuid

# Value of ``active_profiles[program_id]`` when the program has no profile for the active mode.
NO_PROFILE = ""
# Stand-in profile of such a program: no schedule and no day-off setting, so only "the rest of the time" applies.
EMPTY_PROFILE: dict[str, Any] = {"id": NO_PROFILE, "name": "", "days": [[] for _ in range(7)]}


def profile_slots(profile: dict) -> Iterable[dict]:
    """Every slot a profile stores: the seven days, then its own day-off day (issue #54) when it has one.

    A day off that copies a weekday stores no slot (it is a live reference to that day).
    """
    for day in profile["days"]:
        yield from day
    yield from (profile.get("holiday") or {}).get("day") or ()


def profile_named(program: dict, name: str) -> dict | None:
    return next((p for p in program["profiles"] if p["name"] == name), None)


def effective_profile(program: dict, profile: dict) -> dict:
    """The profile whose schedules apply for ``profile``: its source when it follows another mode
    (docs/adr/0002, one step only), else itself. A source that is missing or itself follows is ignored."""
    target = profile.get("follows")
    if not target:
        return profile
    source = profile_named(program, target)
    if source is None or source is profile or source.get("follows"):
        return profile
    return source


def profile_for_mode(program: dict, mode: str | None) -> str:
    """Profile id a program uses for ``mode``: its default (first) profile when there is no mode,
    the profile named ``mode``, else ``NO_PROFILE``. A mode that follows another one uses the profile of
    its source (the schedules are not copied)."""
    profiles = program["profiles"]
    if mode is None:
        return effective_profile(program, profiles[0])["id"]
    own = profile_named(program, mode)
    return NO_PROFILE if own is None else effective_profile(program, own)["id"]


def check_follows(profiles: list[dict]) -> None:
    """Rules of ``follows`` (docs/adr/0002); raises ``ValueError`` with a readable message.

    A mode follows an existing other mode (its source). A source follows nobody and a mode that is followed
    follows nobody: no chain, no loop, not itself. A mode that follows has no schedule of its own.
    """
    by_name = {p["name"]: p for p in profiles}
    sources = {p["follows"] for p in profiles if p.get("follows")}
    for profile in profiles:
        target = profile.get("follows")
        if not target:
            continue
        name = profile["name"]
        if target == name:
            raise ValueError(f"Mode '{name}' cannot follow itself")
        source = by_name.get(target)
        if source is None:
            raise ValueError(f"Mode '{name}' follows '{target}', which does not exist in this program")
        if source.get("follows"):
            raise ValueError(f"Mode '{name}' cannot follow '{target}': '{target}' already follows another mode")
        if name in sources:
            raise ValueError(f"Mode '{name}' cannot follow '{target}': another mode already follows '{name}'")
        if any(day for day in profile["days"]):
            raise ValueError(f"Mode '{name}' follows '{target}' and has its own schedules: it can have only one of the two")
        if profile.get("holiday"):
            raise ValueError(f"Mode '{name}' follows '{target}' and has its own day off: it uses the day off of '{target}'")


def copy_days(days: list[list[dict]]) -> list[list[dict]]:
    """Independent copy of the seven days: new slot ids, the random-time seed of each slot kept."""
    out = []
    for day in days:
        copies = []
        for slot in deepcopy(day):
            slot.setdefault("seed", slot["id"])
            slot["id"] = uuid.uuid4().hex[:12]
            copies.append(slot)
        out.append(copies)
    return out


def copy_holiday(holiday: dict | None) -> dict | None:
    """Independent copy of a day-off setting: a copied weekday stays an index, an own day gets new slot ids."""
    if not holiday:
        return None
    if "day" in holiday:
        return {"day": copy_days([holiday["day"]])[0]}
    return dict(holiday)


def _take_schedules(profile: dict, source: dict | None) -> None:
    """``profile`` stops following: it gets a copy of the days and of the day-off setting of ``source``."""
    profile["days"] = copy_days(source["days"]) if source else [[] for _ in range(7)]
    holiday = copy_holiday(source.get("holiday")) if source else None
    if holiday:
        profile["holiday"] = holiday
    else:
        profile.pop("holiday", None)
    profile.pop("follows", None)


def set_follow(program: dict, mode: str, follows: str | None) -> dict:
    """The program with mode ``mode`` following ``follows``, or (``None``) stopped following with a copy of
    the schedules of its source. The mode gets a profile when it has none. Raises ``ValueError``; the
    revision is left to the caller."""
    profiles = deepcopy(program["profiles"])
    own = next((p for p in profiles if p["name"] == mode), None)
    if follows is None:
        if own is not None and own.get("follows"):
            source = next((p for p in profiles if p["name"] == own["follows"]), None)
            _take_schedules(own, source)
    else:
        if own is None:
            own = {"id": uuid.uuid4().hex[:12], "name": mode, "days": [[] for _ in range(7)]}
            profiles.append(own)
        own["follows"] = follows
        own["days"] = [[] for _ in range(7)]
        own.pop("holiday", None)  # it uses the day off of its source
        check_follows(profiles)
    return {**program, "profiles": profiles}


def retarget_follows(program: dict, old: str, new: str) -> None:
    """Modes that followed ``old`` follow ``new`` (the source was renamed)."""
    for profile in program["profiles"]:
        if profile.get("follows") == old:
            profile["follows"] = new


def detach_followers(programs: Iterable[dict], name: str) -> list[dict]:
    """The source mode ``name`` is going away: each mode that followed it keeps a copy of its schedules and
    stops following. Returns ``[{"program_id", "mode"}]`` for each such mode (revision bumped)."""
    lost = []
    for program in programs:
        source = profile_named(program, name)
        if source is None:
            continue
        for profile in program["profiles"]:
            if profile.get("follows") == name:
                _take_schedules(profile, source)
                lost.append({"program_id": program["id"], "mode": profile["name"]})
        if any(item["program_id"] == program["id"] for item in lost):
            program["revision"] = program.get("revision", 0) + 1
    return lost


def apply_default_mode(programs: Iterable[dict], default_mode: str | None,
                       options: Iterable[str] = ()) -> list[str]:
    """Rename each program's default (first) profile to ``default_mode``; returns the renamed program ids.

    This is how existing schedules move under the default option. Nothing is renamed when a profile
    already carries that name, nor when the first profile is named after another known option
    (``options``, read from the selector when it is available): it is a real mode of its own.
    """
    if not default_mode:
        return []
    known = set(options)
    renamed = []
    for program in programs:
        profiles = program["profiles"]
        if any(p["name"] == default_mode for p in profiles) or profiles[0]["name"] in known:
            continue
        retarget_follows(program, profiles[0]["name"], default_mode)
        profiles[0]["name"] = default_mode
        program["revision"] = program.get("revision", 0) + 1
        renamed.append(program["id"])
    return renamed


MAX_RENAMES = 10  # rename records kept in the runtime (``mode_renames``)


def profile_names(programs: Iterable[dict]) -> list[str]:
    """Every distinct profile name of every program, in order of first appearance."""
    names: list[str] = []
    for program in programs:
        for profile in program["profiles"]:
            if profile["name"] and profile["name"] not in names:
                names.append(profile["name"])
    return names


def unambiguous_rename(seen: list[str], now: list[str], programs: Iterable[dict]) -> tuple[str, str] | None:
    """``(old, new)`` when the selector options went from ``seen`` to ``now`` by exactly one renamed option.

    Same count, same order, one name differs, the old name is a profile name in some program and the
    new one is a profile name nowhere. Anything else is ambiguous: ``None``, nothing is guessed.
    """
    if len(seen) != len(now) or len(set(now)) != len(now):
        return None
    diff = [(a, b) for a, b in zip(seen, now, strict=True) if a != b]
    if len(diff) != 1:
        return None
    old, new = diff[0]
    names = profile_names(programs)
    if old in names and new not in names and old not in now:
        return old, new
    return None


def rename_profile(programs: Iterable[dict], old: str, new: str) -> tuple[list[str], list[str]]:
    """Rename profile ``old`` to ``new`` in every program that has it (revision bump).

    A program that already has a profile ``new`` is left alone. Returns ``(renamed ids, skipped ids)``.
    """
    renamed, skipped = [], []
    for program in programs:
        profiles = program["profiles"]
        source = next((p for p in profiles if p["name"] == old), None)
        if source is None:
            continue
        if any(p["name"] == new for p in profiles):
            skipped.append(program["id"])
            continue
        retarget_follows(program, old, new)
        source["name"] = new
        program["revision"] = program.get("revision", 0) + 1
        renamed.append(program["id"])
    return renamed, skipped


def delete_profile(programs: Iterable[dict], name: str) -> tuple[list[str], list[str]]:
    """Delete profile ``name`` from every program that has it, except when it is the program's last profile.

    Returns ``(deleted from ids, skipped ids)``.
    """
    done, skipped = [], []
    for program in programs:
        profiles = program["profiles"]
        if not any(p["name"] == name for p in profiles):
            continue
        if len(profiles) < 2:
            skipped.append(program["id"])
            continue
        detach_followers([program], name)  # the modes that followed it keep a copy
        program["profiles"] = [p for p in program["profiles"] if p["name"] != name]
        program["revision"] = program.get("revision", 0) + 1
        done.append(program["id"])
    return done, skipped


def orphan_modes(programs: Iterable[dict], options: list[str]) -> list[str]:
    """Profile names that are no option of the selector (« sans option »); empty while the options are unknown."""
    if not options:
        return []
    return [n for n in profile_names(programs) if n not in options]


def mode_proposals(programs: Iterable[dict], options: list[str]) -> list[dict]:
    """For each orphan: the options no program has a profile for yet (the candidates of a rename)."""
    programs = list(programs)
    orphans = orphan_modes(programs, options)
    used = set(profile_names(programs))
    candidates = [o for o in options if o not in used]
    return [{"old": name, "candidates": list(candidates)} for name in orphans]
