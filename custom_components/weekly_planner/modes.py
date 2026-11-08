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
