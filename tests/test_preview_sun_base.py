"""The preview names the sun time before the random delay, so the card shows the same sunset for every device."""

from datetime import UTC, datetime, timedelta, timezone

from custom_components.weekly_planner.timeline import Occurrence
from custom_components.weekly_planner.websocket import _preview_slot

TZ = timezone(timedelta(hours=1))


def _sun(event, day):
    return datetime(day.year, day.month, day.day, 16, 54, 40, tzinfo=TZ)


def _occ(start):
    return Occurrence("s", start.astimezone(UTC), None)


def test_random_sun_time_carries_the_time_before_the_delay():
    slot = {"id": "s", "start": {"sun": "sunset", "random_minutes": 20}}
    start = datetime(2026, 11, 16, 17, 2, tzinfo=TZ)
    item = _preview_slot(_occ(start), slot, TZ, _sun)
    assert datetime.fromisoformat(item["start_base"]) == datetime(2026, 11, 16, 16, 54, tzinfo=TZ)  # whole minute, like every sun time
    assert "end_base" not in item


def test_no_base_without_a_random_delay_or_a_sun_time():
    start = datetime(2026, 11, 16, 16, 54, tzinfo=TZ)
    assert "start_base" not in _preview_slot(_occ(start), {"id": "s", "start": {"sun": "sunset"}}, TZ, _sun)
    assert "start_base" not in _preview_slot(_occ(start), {"id": "s", "start": {"time": "17:00", "random_minutes": 20}}, TZ, _sun)
    assert "start_base" not in _preview_slot(_occ(start), {"id": "s", "start": {"sun": "sunset", "random_minutes": 20}})


def test_end_edge_carries_its_own_base_and_start_stays_without():
    slot = {"id": "s", "start": {"time": "17:00"}, "end": {"sun": "sunset", "random_minutes": 10}}
    start = datetime(2026, 11, 16, 17, 0, tzinfo=TZ)
    end = datetime(2026, 11, 16, 17, 5, tzinfo=TZ)
    item = _preview_slot(Occurrence("s", start.astimezone(UTC), end.astimezone(UTC)), slot, TZ, _sun)
    assert datetime.fromisoformat(item["end_base"]) == datetime(2026, 11, 16, 16, 54, tzinfo=TZ)
    assert "start_base" not in item
    assert item["sun"] is True


def test_both_edges_get_a_base_and_an_open_end_gets_none():
    slot = {"id": "s", "start": {"sun": "sunrise", "random_minutes": 5}, "end": {"sun": "sunset", "random_minutes": 5}}
    start = datetime(2026, 11, 16, 8, 0, tzinfo=TZ)
    end = datetime(2026, 11, 16, 17, 0, tzinfo=TZ)
    both = _preview_slot(Occurrence("s", start.astimezone(UTC), end.astimezone(UTC)), slot, TZ, _sun)
    assert "start_base" in both and "end_base" in both
    open_end = _preview_slot(_occ(start), {"id": "s", "start": slot["start"], "end": None}, TZ, _sun)
    assert "start_base" in open_end and "end_base" not in open_end


def test_base_is_resolved_on_the_local_day_of_the_occurrence():
    days = []

    def sun(event, day):
        days.append(day)
        return datetime(day.year, day.month, day.day, 16, 0, tzinfo=TZ)

    slot = {"id": "s", "start": {"sun": "sunset", "random_minutes": 20}}
    start = datetime(2026, 11, 16, 0, 30, tzinfo=TZ)  # still 15 Nov in UTC, 16 Nov locally
    item = _preview_slot(_occ(start), slot, TZ, sun)
    assert days == [datetime(2026, 11, 16).date()]
    assert datetime.fromisoformat(item["start_base"]).day == 16


def test_no_base_when_the_sun_does_not_rise():
    slot = {"id": "s", "start": {"sun": "sunset", "random_minutes": 20}}
    start = datetime(2026, 11, 16, 17, 0, tzinfo=TZ)
    assert "start_base" not in _preview_slot(_occ(start), slot, TZ, lambda event, day: None)
    assert "start_base" not in _preview_slot(_occ(start), slot, None, _sun)
