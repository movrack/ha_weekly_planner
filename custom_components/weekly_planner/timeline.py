"""Turn a day of slots into concrete, timezone-aware occurrences.

Pure functions, no Home Assistant state: the sun provider is injected so the rules
(midnight crossing, solar bounds, daylight saving time) can be tested in isolation.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from hashlib import sha256
import json
from datetime import date, datetime, time, timedelta, tzinfo, UTC

SUN_EVENTS = ("dawn", "sunrise", "sunset", "dusk")
MIN_SLOT = timedelta(minutes=5)
NOON = time(12, 0)

# (event, local date) -> aware datetime, or None when the event does not happen that day
SunProvider = Callable[[str, date], datetime | None]


@dataclass(frozen=True, slots=True)
class Occurrence:
    """One slot placed on the calendar. Datetimes are in UTC: comparing or subtracting
    aware datetimes that share a zone uses wall-clock values, which is wrong around DST.
    """

    slot_id: str
    start: datetime
    end: datetime | None  # None for a one-shot slot
    ignored: str | None = None  # reason when the slot does not run that day

    @property
    def runs(self) -> bool:
        return self.ignored is None


def parse_clock(value: str) -> tuple[int, int]:
    """'HH:MM' → (hours, minutes); '24:00' is allowed."""
    hours, minutes = (int(part) for part in value.split(":"))
    if not (0 <= minutes < 60 and (0 <= hours < 24 or (hours, minutes) == (24, 0))):
        raise ValueError(f"invalid time {value!r}")
    return hours, minutes


def local_datetime(day: date, hours: int, minutes: int, tz: tzinfo) -> tuple[datetime, bool]:
    """Wall-clock time on a day → (aware datetime, existed).

    A time skipped by daylight saving moves forward (02:30 → 03:30); an ambiguous time
    takes its first occurrence. ``existed`` is False for a skipped time.
    """
    if (hours, minutes) == (24, 0):
        day, hours = day + timedelta(days=1), 0
    naive = datetime(day.year, day.month, day.day, hours, minutes, tzinfo=tz, fold=0)
    normalized = naive.astimezone(UTC).astimezone(tz)
    existed = (normalized.hour, normalized.minute) == (hours, minutes)
    return normalized, existed


def resolve(
    spec: dict, day: date, tz: tzinfo, sun: SunProvider
) -> tuple[datetime | None, bool]:
    """Resolve a time spec on a day → (aware datetime or None, existed)."""
    if "time" in spec:
        return local_datetime(day, *parse_clock(spec["time"]), tz)

    event = spec["sun"]
    if event not in SUN_EVENTS:
        raise ValueError(f"unknown sun event {event!r}")
    moment = sun(event, day)
    if moment is None:
        return None, True
    moment = (moment + timedelta(minutes=spec.get("offset", 0))).astimezone(tz)
    for key, too_far in (("earliest", lambda m, b: m < b), ("latest", lambda m, b: m > b)):
        if bound := spec.get(key):
            limit, _ = local_datetime(day, *parse_clock(bound), tz)
            if too_far(moment, limit):
                moment = limit
    # keep 5-minute steps so bars and comparisons stay aligned
    moment = moment.replace(second=0, microsecond=0)
    return moment - timedelta(minutes=moment.minute % 5), True


def _delay(moment: datetime, spec: dict, identity: tuple[str, ...], day: date, edge: str, *, boundary_day: date | None = None) -> datetime:
    """Stable occurrence-specific elapsed delay, independent of process random state."""
    maximum = spec.get("random_minutes", 0)
    if not maximum:
        return moment
    seed = json.dumps([*identity, day.isoformat(), edge], ensure_ascii=True).encode()
    minutes = int.from_bytes(sha256(seed).digest(), "big") % (maximum + 1)
    try:
        delayed = (_utc(moment) + timedelta(minutes=minutes)).astimezone(moment.tzinfo)
    except OverflowError:  # end of the supported calendar: keep the configured time
        return moment
    if "sun" in spec and spec.get("latest"):
        limit, _ = local_datetime(boundary_day or day, *parse_clock(spec["latest"]), moment.tzinfo)
        delayed = min(_utc(delayed), _utc(limit)).astimezone(moment.tzinfo)
    return delayed


def occurrence(
    slot: dict, day: date, tz: tzinfo, sun: SunProvider, *, identity: tuple[str, ...] = ()
) -> Occurrence:
    """Place one slot on a given day.

    The end lands on the next day when it would otherwise not be after the start and
    falls before noon (22:00 → 06:00, sunset → 07:00). Any other empty or negative slot,
    a slot shorter than 5 minutes, or a slot entirely inside a skipped DST hour is ignored
    for that day.
    """
    slot_id = slot["id"]
    identity = (*identity, slot_id)
    start, start_existed = resolve(slot["start"], day, tz, sun)
    if start is None:
        return Occurrence(slot_id, _utc(_midnight(day, tz)), None, "sun_event_missing")
    base_start = start
    start = _delay(start, slot["start"], identity, day, "start")
    if slot.get("end") is None:
        return Occurrence(slot_id, _utc(start), None)

    end, end_existed = resolve(slot["end"], day, tz, sun)
    if end is None:
        return Occurrence(slot_id, _utc(start), None, "sun_event_missing")
    if not start_existed and not end_existed:
        return Occurrence(slot_id, _utc(start), _utc(end), "skipped_by_dst")
    end_day = day
    if _utc(end) <= _utc(base_start) and end.timetz().replace(tzinfo=None) < NOON:
        end_day = day + timedelta(days=1)
        end, _ = resolve(slot["end"], end_day, tz, sun)
        if end is None:
            return Occurrence(slot_id, _utc(start), None, "sun_event_missing")
    end = _delay(end, slot["end"], identity, day, "end", boundary_day=end_day)
    start_utc, end_utc = _utc(start), _utc(end)
    if end_utc <= start_utc:
        return Occurrence(slot_id, start_utc, end_utc, "empty")
    if end_utc - start_utc < MIN_SLOT:
        return Occurrence(slot_id, start_utc, end_utc, "too_short")
    return Occurrence(slot_id, start_utc, end_utc)


def day_occurrences(
    slots: list[dict], day: date, tz: tzinfo, sun: SunProvider, *, identity: tuple[str, ...] = ()
) -> list[Occurrence]:
    """All slots of a day, sorted, with overlaps trimmed (the later slot loses)."""
    placed = sorted((occurrence(s, day, tz, sun, identity=identity) for s in slots), key=lambda o: o.start)
    result: list[Occurrence] = []
    last_end: datetime | None = None
    for occ in placed:
        if occ.runs and last_end is not None and occ.start < last_end:
            if occ.end is None or occ.end - last_end < MIN_SLOT:
                occ = Occurrence(occ.slot_id, occ.start, occ.end, "overlap")
            else:
                occ = Occurrence(occ.slot_id, last_end, occ.end, None)
        if occ.runs and occ.end is not None:
            last_end = max(last_end, occ.end) if last_end else occ.end
        result.append(occ)
    return result


def _midnight(day: date, tz: tzinfo) -> datetime:
    return local_datetime(day, 0, 0, tz)[0]


def _utc(moment: datetime) -> datetime:
    return moment.astimezone(UTC)
