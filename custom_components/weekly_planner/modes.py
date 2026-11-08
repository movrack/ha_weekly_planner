"""Global mode helpers (docs/adr/0001): pure functions, no Home Assistant objects.

A mode is the state of one external selector shared by every program. A program keeps its schedules in
``profiles`` (storage key unchanged); a profile belongs to a mode when its NAME equals the mode name.
The first profile of a program is its default profile: it applies when there is no selector.
"""

from __future__ import annotations

from collections.abc import Iterable
from typing import Any

# Value of ``active_profiles[program_id]`` when the program has no profile for the active mode.
NO_PROFILE = ""
# Stand-in profile of such a program: no schedule, so only "the rest of the time" applies.
EMPTY_PROFILE: dict[str, Any] = {"id": NO_PROFILE, "name": "", "days": [[] for _ in range(7)]}


def profile_for_mode(program: dict, mode: str | None) -> str:
    """Profile id a program uses for ``mode``: its default (first) profile when there is no mode,
    the profile named ``mode``, else ``NO_PROFILE``."""
    profiles = program["profiles"]
    if mode is None:
        return profiles[0]["id"]
    return next((p["id"] for p in profiles if p["name"] == mode), NO_PROFILE)


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
        program["profiles"] = [p for p in profiles if p["name"] != name]
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
