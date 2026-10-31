"""Decide, for every managed entity, which program drives it right now.

Pure logic (no Home Assistant objects). Inputs are the stored programs plus small callables
for the things that depend on live state (conditions, sun times).
See docs/SPEC.md § 5.1 and § 5.4.
"""

from __future__ import annotations

from collections.abc import Callable, Iterable
from dataclasses import dataclass
from datetime import date, datetime, timedelta, tzinfo

from .const import DEFAULT_PRIORITY
from .timeline import Occurrence, SunProvider, day_occurrences

# conditions list -> bool (all must hold); evaluated by the caller with debounce
ConditionCheck = Callable[[list[dict]], bool]
# (program, entity_id, label_id) -> action of the label for this entity, None when there is none
Resolve = Callable[[dict, str, "str | None"], "dict | None"]


def default_label(program: dict, entity_id: str) -> str | None:
    for entity in program["entities"]:
        if entity["entity_id"] == entity_id:
            return entity.get("default_label")
    return None


@dataclass(frozen=True, slots=True)
class Segment:
    """What an entity should be doing now, and since/until when."""

    key: tuple  # identity: ("slot", program, slot, start_iso) | ("default", program) | ("free",)
    program_id: str | None
    slot_id: str | None
    action: dict | None  # None: nothing to send (free entity, or no default label / incompatible)
    label: str | None = None  # id of the label the action comes from
    start: datetime | None = None
    end: datetime | None = None

    @property
    def in_slot(self) -> bool:
        return self.key[0] == "slot"


def active_profile(program: dict, active_profiles: dict[str, str]) -> dict:
    profiles = program["profiles"]
    wanted = active_profiles.get(program["id"], program.get("active_profile"))
    return next((p for p in profiles if p["id"] == wanted), profiles[0])


def occurrences_around(
    profile: dict, moment: datetime, tz: tzinfo, sun: SunProvider, days: Iterable[int] = (-1, 0, 1),
    *, program_id: str = ""
) -> list[tuple[Occurrence, dict]]:
    """Occurrences of a profile for the days around ``moment`` (yesterday covers midnight)."""
    local_day = moment.astimezone(tz).date()
    result: list[tuple[Occurrence, dict]] = []
    for delta in days:
        day: date = local_day + timedelta(days=delta)
        slots = profile["days"][day.weekday()]
        by_id = {s["id"]: s for s in slots}
        for occ in day_occurrences(slots, day, tz, sun, identity=(program_id, profile["id"])):
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
    resolve: Resolve,
) -> tuple[Occurrence, dict] | None:
    """The slot of this program running at ``moment`` that acts on this entity, if any."""
    for occ, slot in occurrences_around(profile, moment, tz, sun, program_id=program["id"]):
        if not occ.runs or occ.end is None:
            continue  # one-shot slots (no end) are events, handled by the engine
        if occ.start <= moment < occ.end and conditions_ok(slot.get("conditions", [])):
            if resolve(program, entity_id, slot.get("label")) is not None:
                return occ, slot
    return None


def resolve_entity(
    entity_id: str,
    programs: list[dict],
    resolve: Resolve,
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
        key=lambda p: (p.get("priority", DEFAULT_PRIORITY), p.get("created_at", "")),
    )
    if not candidates:
        return Segment(("free",), None, None, None)

    for program in candidates:
        if not conditions_ok(program.get("conditions", [])):
            continue
        profile = active_profile(program, active_profiles)
        found = running_slot(program, profile, entity_id, moment, tz, sun, conditions_ok, resolve)
        if found:
            occ, slot = found
            return Segment(
                ("slot", program["id"], slot["id"], occ.start.isoformat()),
                program["id"],
                slot["id"],
                resolve(program, entity_id, slot.get("label")),
                slot.get("label"),
                start=occ.start,
                end=occ.end,
            )

    owner = candidates[0]
    label = default_label(owner, entity_id)
    return Segment(("default", owner["id"]), owner["id"], None, resolve(owner, entity_id, label), label)


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
        for occ, _slot in occurrences_around(profile, moment, tz, sun, days=(-1, 0, 1, 2), program_id=program["id"]):
            if not occ.runs:
                continue
            for edge in (occ.start, occ.end):
                if edge is not None and edge > moment and (best is None or edge < best):
                    best = edge
    return best
