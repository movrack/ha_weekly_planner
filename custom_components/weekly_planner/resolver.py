"""Decide, for every managed entity, which program drives it right now.

Pure logic (no Home Assistant objects). Inputs are the stored programs and modes plus
small callables for the things that depend on live state (conditions, sun times).
See docs/SPEC.md § 5.1 and § 5.4.
"""

from __future__ import annotations

from collections.abc import Callable, Iterable
from dataclasses import dataclass
from datetime import date, datetime, timedelta, tzinfo

from .timeline import Occurrence, SunProvider, day_occurrences

# conditions list -> bool (all must hold); evaluated by the caller with debounce
ConditionCheck = Callable[[list[dict]], bool]


@dataclass(frozen=True, slots=True)
class Segment:
    """What an entity should be doing now, and since/until when."""

    key: tuple  # identity: ("slot", program, slot, start_iso) | ("default", program) | ("free",)
    program_id: str | None
    slot_id: str | None
    setpoint: dict | None  # None: nothing to send (free entity or default "none")
    default_kind: str | None = None  # for default segments: mode | setpoint | previous | none
    start: datetime | None = None
    end: datetime | None = None

    @property
    def in_slot(self) -> bool:
        return self.key[0] == "slot"


def entity_type(entity_id: str) -> str:
    return entity_id.split(".", 1)[0]


def mode_setpoint(modes: dict[str, dict], mode_id: str, entity_id: str) -> dict | None:
    """Value of a mode for one entity: its exception if any, else the common value."""
    mode = modes.get(mode_id)
    if mode is None:
        return None
    return mode.get("exceptions", {}).get(entity_id, mode.get("value"))


def slot_setpoint(slot: dict, entity_id: str, modes: dict[str, dict]) -> dict | None:
    """Setpoint a slot gives to an entity (direct setpoint wins over the type's mode)."""
    actions = slot.get("actions", {})
    if (direct := actions.get("by_entity", {}).get(entity_id)) is not None:
        return direct
    if (mode_id := actions.get("by_type", {}).get(entity_type(entity_id))) is not None:
        return mode_setpoint(modes, mode_id, entity_id)
    return None


def default_of(program: dict, entity_id: str, modes: dict[str, dict]) -> tuple[str, dict | None]:
    """(kind, setpoint) of a program's default for an entity."""
    for entity in program["entities"]:
        if entity["entity_id"] == entity_id:
            default = entity.get("default") or {"kind": "none"}
            break
    else:
        return "none", None
    kind = default.get("kind", "none")
    if kind == "mode":
        return kind, mode_setpoint(modes, default.get("value"), entity_id)
    if kind == "setpoint":
        return kind, default.get("value")
    return kind, None  # "previous" is resolved by the engine, "none" sends nothing


def active_profile(program: dict, active_profiles: dict[str, str]) -> dict:
    profiles = program["profiles"]
    wanted = active_profiles.get(program["id"], program.get("active_profile"))
    return next((p for p in profiles if p["id"] == wanted), profiles[0])


def occurrences_around(
    profile: dict, moment: datetime, tz: tzinfo, sun: SunProvider, days: Iterable[int] = (-1, 0, 1)
) -> list[tuple[Occurrence, dict]]:
    """Occurrences of a profile for the days around ``moment`` (yesterday covers midnight)."""
    local_day = moment.astimezone(tz).date()
    result: list[tuple[Occurrence, dict]] = []
    for delta in days:
        day: date = local_day + timedelta(days=delta)
        slots = profile["days"][day.weekday()]
        by_id = {s["id"]: s for s in slots}
        for occ in day_occurrences(slots, day, tz, sun):
            result.append((occ, by_id[occ.slot_id]))
    return result


def running_slot(
    program: dict,
    profile: dict,
    entity_id: str,
    moment: datetime,
    tz: tzinfo,
    sun: SunProvider,
    conditions_ok: ConditionCheck,
    modes: dict[str, dict],
) -> tuple[Occurrence, dict] | None:
    """The slot of this program running at ``moment`` that sets this entity, if any."""
    for occ, slot in occurrences_around(profile, moment, tz, sun):
        if not occ.runs or occ.end is None:
            continue  # one-shot slots are events, handled by the engine
        if occ.start <= moment < occ.end and conditions_ok(slot.get("conditions", [])):
            if slot_setpoint(slot, entity_id, modes) is not None:
                return occ, slot
    return None


def resolve_entity(
    entity_id: str,
    programs: list[dict],
    modes: dict[str, dict],
    moment: datetime,
    tz: tzinfo,
    sun: SunProvider,
    conditions_ok: ConditionCheck,
    *,
    vacation: bool = False,
    active_profiles: dict[str, str] | None = None,
) -> Segment:
    """Winning segment for an entity at ``moment`` (UTC)."""
    active_profiles = active_profiles or {}
    candidates = sorted(
        (
            p
            for p in programs
            if p.get("enabled", True)
            and not vacation
            and any(e["entity_id"] == entity_id for e in p["entities"])
        ),
        key=lambda p: (p.get("priority", 100), p.get("created_at", "")),
    )
    if not candidates:
        return Segment(("free",), None, None, None)

    for program in candidates:
        if not conditions_ok(program.get("conditions", [])):
            continue
        profile = active_profile(program, active_profiles)
        found = running_slot(program, profile, entity_id, moment, tz, sun, conditions_ok, modes)
        if found:
            occ, slot = found
            return Segment(
                ("slot", program["id"], slot["id"], occ.start.isoformat()),
                program["id"],
                slot["id"],
                slot_setpoint(slot, entity_id, modes),
                start=occ.start,
                end=occ.end,
            )

    owner = candidates[0]
    kind, setpoint = default_of(owner, entity_id, modes)
    return Segment(("default", owner["id"]), owner["id"], None, setpoint, default_kind=kind)


def next_transition(
    programs: list[dict],
    moment: datetime,
    tz: tzinfo,
    sun: SunProvider,
    *,
    active_profiles: dict[str, str] | None = None,
) -> datetime | None:
    """Earliest slot start or end strictly after ``moment`` among enabled programs."""
    active_profiles = active_profiles or {}
    best: datetime | None = None
    for program in programs:
        if not program.get("enabled", True):
            continue
        profile = active_profile(program, active_profiles)
        for occ, _slot in occurrences_around(profile, moment, tz, sun, days=(-1, 0, 1, 2)):
            if not occ.runs:
                continue
            for edge in (occ.start, occ.end):
                if edge is not None and edge > moment and (best is None or edge < best):
                    best = edge
    return best
