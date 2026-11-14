"""Decide, for every managed entity, which program drives it right now.

Pure logic (no Home Assistant objects). Inputs are the stored programs plus small callables
for the things that depend on live state (conditions, sun times).
See docs/SPEC.md § 5.1 and § 5.4.
"""

from __future__ import annotations

from collections.abc import Callable, Iterable
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta, tzinfo

from .const import DEFAULT_PRIORITY
from .modes import EMPTY_PROFILE, NO_PROFILE
from .slots import applies
from .timeline import MIN_SLOT, Occurrence, SunProvider, local_datetime, place_day, trim

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
    """Profile the program follows now: ``active_profiles[id]`` (a profile id, ``NO_PROFILE`` for none), else its default."""
    profiles = program["profiles"]
    wanted = active_profiles.get(program["id"])
    if wanted == NO_PROFILE:
        return EMPTY_PROFILE
    return next((p for p in profiles if p["id"] == wanted), profiles[0])


Placed = list[tuple[Occurrence, dict]]


@dataclass(frozen=True, slots=True)
class Holiday:
    """Which local dates are days off when schedules are placed (issue #54, docs/SPEC.md § 5.11).

    ``day``: today, when the house declares it a day off; tomorrow and yesterday are always normal days.
    ``after``: a past day off (yesterday): its slots never run into the next day.
    Only a profile with a ``holiday`` setting is concerned; any other profile keeps its normal days.
    """

    day: date | None = None
    after: date | None = None


NO_HOLIDAY = Holiday()


def holiday_setting(profile: dict) -> dict | None:
    """The day-off setting that applies: none when the profile has none or when it is switched off
    (``off``: kept in memory, not applied)."""
    setting = profile.get("holiday")
    return setting if setting and not setting.get("off") else None


def has_holiday(profile: dict) -> bool:
    """Does the profile have a day-off setting that applies (a copied weekday or its own day)?"""
    return holiday_setting(profile) is not None


def day_slots(profile: dict, day: date, is_holiday: bool) -> list[dict]:
    """The slots that run on ``day``: the day-off setting when ``is_holiday`` and the profile has one
    (a live copy of a weekday, or its own day), else the weekday. The only place that picks a day."""
    setting = holiday_setting(profile) if is_holiday else None
    if setting:
        if "copy" in setting:
            return profile["days"][setting["copy"]]
        return setting["day"]
    return profile["days"][day.weekday()]


def _cut_at_end(profile: dict, day: date, holiday: Holiday) -> bool:
    """A day off is a whole day, 00:00 to 24:00: the slots of the day off, of the day before it and of a
    past day off stop at the end of their own day (nothing crosses midnight next to a day off)."""
    if holiday is NO_HOLIDAY or not has_holiday(profile):
        return False
    return day in (holiday.day, holiday.after) or day + timedelta(days=1) == holiday.day


def _cut(occ: Occurrence, boundary: datetime) -> Occurrence:
    """``occ`` stopped at ``boundary`` (the next local midnight); ignored when nothing is left before it."""
    if not occ.runs:
        return occ
    if occ.start >= boundary:
        return Occurrence(occ.slot_id, occ.start, occ.end, "holiday_cut")
    if occ.end is None or occ.end <= boundary:
        return occ
    if boundary - occ.start < MIN_SLOT:
        return Occurrence(occ.slot_id, occ.start, boundary, "too_short")
    return Occurrence(occ.slot_id, occ.start, boundary)


def _day_flags(profile: dict, day: date, holiday: Holiday) -> tuple[bool, bool]:
    """(the day-off setting replaces the day, the day stops at midnight)."""
    if holiday is NO_HOLIDAY:
        return False, False
    return holiday.day == day and has_holiday(profile), _cut_at_end(profile, day, holiday)


def _place(profile: dict, day: date, tz: tzinfo, sun: SunProvider, program_id: str,
           holiday: Holiday = NO_HOLIDAY) -> Placed:
    """Every slot of the profile's day placed on the calendar, sorted by start, not trimmed."""
    is_holiday, cut = _day_flags(profile, day, holiday)
    slots = day_slots(profile, day, is_holiday)
    by_id = {s["id"]: s for s in slots}
    placed = place_day(slots, day, tz, sun, identity=(program_id, profile["id"]))
    if cut:
        boundary = local_datetime(day + timedelta(days=1), 0, 0, tz)[0].astimezone(UTC)
        placed = [_cut(occ, boundary) for occ in placed]
    return [(occ, by_id[occ.slot_id]) for occ in placed]


def _has_lists(placed: Placed) -> bool:
    return any(slot.get("entities") is not None for _occ, slot in placed)


def _trim_for(placed: Placed, entity_id: str | None) -> Placed:
    """Timeline of one device: trim the occurrences of the slots that apply to it (None: every slot)."""
    kept = placed if entity_id is None else [pair for pair in placed if applies(pair[1], entity_id)]
    trimmed = trim([occ for occ, _slot in kept])
    return [(occ, slot) for occ, (_old, slot) in zip(trimmed, kept, strict=True)]


def _profile_day(profile: dict, day: date, tz: tzinfo, sun: SunProvider, program_id: str,
                 entity_id: str | None = None, holiday: Holiday = NO_HOLIDAY) -> Placed:
    """Trimmed occurrences of a day; with ``entity_id``, only the slots that apply to that device."""
    placed = _place(profile, day, tz, sun, program_id, holiday)
    return _trim_for(placed, entity_id if _has_lists(placed) else None)


class _Day:
    """Raw placement of one (profile, program, day) and its memoised per-device trims."""

    __slots__ = ("by_key", "keys", "lists", "placed", "profile", "trimmed")

    def __init__(self, profile: dict, placed: Placed) -> None:
        self.profile = profile  # kept alive: its id() is part of the cache key
        self.placed = placed
        self.lists = _has_lists(placed)
        self.trimmed: Placed | None = None  # every slot (programs without any list)
        self.keys: dict[str, tuple[int, ...]] = {}  # device -> indices of the slots that apply to it
        self.by_key: dict[tuple[int, ...], Placed] = {}  # applicable slots -> trimmed timeline

    def all(self) -> Placed:
        if self.trimmed is None:
            self.trimmed = _trim_for(self.placed, None)
        return self.trimmed

    def key(self, entity_id: str) -> tuple[int, ...]:
        key = self.keys.get(entity_id)
        if key is None:
            key = self.keys[entity_id] = tuple(i for i, (_o, s) in enumerate(self.placed) if applies(s, entity_id))
        return key

    def device(self, entity_id: str | None) -> Placed:
        if not self.lists or entity_id is None:
            return self.all()
        key = self.key(entity_id)
        found = self.by_key.get(key)
        if found is None:
            kept = [self.placed[i] for i in key]
            trimmed = trim([occ for occ, _slot in kept])
            found = self.by_key[key] = [(occ, slot) for occ, (_o, slot) in zip(trimmed, kept, strict=True)]
        return found

    def groups(self, entity_ids: Iterable[str]) -> list[Placed]:
        """Distinct device timelines of the day (one per group of devices sharing the same slots)."""
        if not self.lists:
            return [self.all()]
        seen: dict[tuple[int, ...], Placed] = {}
        for eid in entity_ids:
            key = self.key(eid)
            if key not in seen:
                seen[key] = self.device(eid)
        return list(seen.values())


class OccurrenceCache:
    """Occurrences of a profile per local day, shared by every lookup of one engine pass.

    A day's occurrences depend only on the profile, the day, the time zone and the sun, never on
    the current time, so lookups at different moments of the pass can share them. The profile
    object is part of the key and kept alive: an edited (replaced) profile never hits a stale day.
    The engine creates one cache per pass and drops it afterwards (docs/SPEC.md § 21).

    Per-device schedules (#34): the raw placement is computed once per (profile, program, day); the
    trimmed timeline of a device is memoised per (profile, program, day, applicable slots), so devices
    sharing the same slots share one trim. A day without any ``entities`` list keeps one trimmed list
    for every device: the same work and the same result as before lists existed.
    """

    __slots__ = ("_days",)

    def __init__(self) -> None:
        self._days: dict[tuple, _Day] = {}

    def entry(self, profile: dict, day: date, tz: tzinfo, sun: SunProvider, program_id: str,
              holiday: Holiday = NO_HOLIDAY) -> _Day:
        # The day-off flags are part of the key: a day cached as normal is never served as a day off.
        key = (id(profile), program_id, day, *_day_flags(profile, day, holiday))
        hit = self._days.get(key)
        if hit is not None and hit.profile is profile:
            return hit
        found = self._days[key] = _Day(profile, _place(profile, day, tz, sun, program_id, holiday))
        return found

    def day(self, profile: dict, day: date, tz: tzinfo, sun: SunProvider, program_id: str,
            entity_id: str | None = None, holiday: Holiday = NO_HOLIDAY) -> Placed:
        return self.entry(profile, day, tz, sun, program_id, holiday).device(entity_id)


def occurrences_around(
    profile: dict, moment: datetime, tz: tzinfo, sun: SunProvider, days: Iterable[int] = (-1, 0, 1),
    *, program_id: str = "", cache: OccurrenceCache | None = None, entity_id: str | None = None,
    holiday: Holiday = NO_HOLIDAY,
) -> Placed:
    """Occurrences of a profile for the days around ``moment`` (yesterday covers midnight).

    ``entity_id``: the timeline of that device only (slots that apply to it, trimmed among themselves).
    None trims every slot together, the only timeline of a program without ``entities`` lists.
    """
    local_day = moment.astimezone(tz).date()
    result: Placed = []
    for delta in days:
        day: date = local_day + timedelta(days=delta)
        if cache is None:
            result.extend(_profile_day(profile, day, tz, sun, program_id, entity_id, holiday))
        else:
            result.extend(cache.day(profile, day, tz, sun, program_id, entity_id, holiday))
    return result


def device_groups_around(
    program: dict, profile: dict, moment: datetime, tz: tzinfo, sun: SunProvider, days: Iterable[int],
    *, cache: OccurrenceCache | None = None, holiday: Holiday = NO_HOLIDAY,
) -> list[Placed]:
    """Distinct device timelines of a program per day around ``moment`` (union of the subsets)."""
    cache = cache if cache is not None else OccurrenceCache()
    local_day = moment.astimezone(tz).date()
    ids = [e["entity_id"] for e in program["entities"]]
    result: list[Placed] = []
    for delta in days:
        entry = cache.entry(profile, local_day + timedelta(days=delta), tz, sun, program["id"], holiday)
        result.extend(entry.groups(ids))
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
    cache: OccurrenceCache | None = None,
    holiday: Holiday = NO_HOLIDAY,
) -> tuple[Occurrence, dict] | None:
    """The slot of this program running at ``moment`` that acts on this entity, if any.

    Only the slots that apply to the entity count (``applies`` before ``resolve``): they are trimmed
    among themselves, so a slot of another device neither shortens nor hides this device's slot, and
    a program whose running slot targets other devices does not win the priority arbitration here.
    """
    for occ, slot in occurrences_around(profile, moment, tz, sun, program_id=program["id"], cache=cache,
                                        entity_id=entity_id, holiday=holiday):
        if not occ.runs or occ.end is None:
            continue  # one-shot slots (no end) are events, handled by the engine
        if (occ.start <= moment < occ.end and applies(slot, entity_id) and conditions_ok(slot.get("conditions", []))
                and resolve(program, entity_id, slot.get("label")) is not None):
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
    cache: OccurrenceCache | None = None,
    holiday: Holiday = NO_HOLIDAY,
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
        found = running_slot(program, profile, entity_id, moment, tz, sun, conditions_ok, resolve, cache, holiday)
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

    # Default label (no slot running for this entity): it belongs to the highest-priority program of
    # the entity, as before per-device schedules. Lists change which slots run for a device, never
    # who owns its "rest of the time": the owner's per-entity ``default_label`` already gives each
    # device its own default (None: nothing sent), so a thermostat slot targeting the climate only
    # leaves the cover on its own default.
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
    cache: OccurrenceCache | None = None,
    holiday: Holiday = NO_HOLIDAY,
) -> datetime | None:
    """Earliest slot start or end strictly after ``moment`` among enabled programs.

    With per-device lists, the edges of every distinct device timeline (union of the subsets): an
    extra wake-up is harmless, a missed one is not. Without lists, the one program timeline.
    """
    active_profiles = active_profiles or {}
    best: datetime | None = None
    for program in programs:
        if not program.get("enabled", True):
            continue
        profile = active_profile(program, active_profiles)
        for timeline in device_groups_around(program, profile, moment, tz, sun, (-1, 0, 1, 2), cache=cache,
                                             holiday=holiday):
            for occ, _slot in timeline:
                if not occ.runs:
                    continue
                for edge in (occ.start, occ.end):
                    if edge is not None and edge > moment and (best is None or edge < best):
                        best = edge
    return best
