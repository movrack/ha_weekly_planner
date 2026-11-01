"""Day placement of slots: midnight, sun bounds, daylight saving time (S2, S3, S4, S26, S27)."""

from datetime import date, datetime, timedelta, UTC
from zoneinfo import ZoneInfo

import pytest

from custom_components.weekly_planner.timeline import (
    day_occurrences,
    local_datetime,
    occurrence,
    parse_clock,
)

TZ = ZoneInfo("Europe/Brussels")
SUMMER = date(2026, 6, 21)
WINTER = date(2026, 12, 21)


def fake_sun(event: str, day: date) -> datetime:
    """Rough Brussels sun times: sunset 21:58 in June, 16:40 in December."""
    local = {
        ("sunset", 6): (21, 58),
        ("sunset", 12): (16, 40),
        ("sunrise", 6): (5, 28),
        ("sunrise", 12): (8, 44),
        ("dusk", 6): (22, 43),
        ("dawn", 6): (4, 42),
    }[(event, day.month)]
    return datetime(day.year, day.month, day.day, *local, tzinfo=TZ).astimezone(UTC)


def slot(start, end=None, sid="s"):
    return {"id": sid, "start": start, "end": end}


def at(day, h, m, plus_days=0):
    d = day + timedelta(days=plus_days)
    return datetime(d.year, d.month, d.day, h, m, tzinfo=TZ)


def test_simple_slot():
    occ = occurrence(slot({"time": "08:00"}, {"time": "17:30"}), SUMMER, TZ, fake_sun)
    assert occ.runs and occ.start == at(SUMMER, 8, 0) and occ.end == at(SUMMER, 17, 30)


def test_crosses_midnight():  # S2
    occ = occurrence(slot({"time": "22:00"}, {"time": "06:00"}), SUMMER, TZ, fake_sun)
    assert occ.runs and occ.end == at(SUMMER, 6, 0, plus_days=1)


def test_end_of_day_2400():  # S27
    occ = occurrence(slot({"time": "20:00"}, {"time": "24:00"}), SUMMER, TZ, fake_sun)
    assert occ.runs and occ.end == at(SUMMER, 0, 0, plus_days=1)


@pytest.mark.parametrize("bad", ["24:05", "25:00", "07:60"])
def test_invalid_clock(bad):
    with pytest.raises(ValueError):
        parse_clock(bad)


def test_typed_minutes_are_not_snapped():
    assert parse_clock("12:03") == (12, 3)
    occ = occurrence(slot({"time": "08:17"}, {"time": "08:23"}), SUMMER, TZ, fake_sun)
    assert occ.runs and occ.start == at(SUMMER, 8, 17) and occ.end == at(SUMMER, 8, 23)
    assert occurrence(slot({"time": "08:17"}, {"time": "08:20"}), SUMMER, TZ, fake_sun).ignored


def test_sun_with_offset_and_bounds():  # S3
    spec = {"sun": "sunset", "offset": 15, "earliest": "18:00", "latest": "21:00"}
    summer = occurrence(slot(spec, {"time": "23:00"}), SUMMER, TZ, fake_sun)
    winter = occurrence(slot(spec, {"time": "23:00"}), WINTER, TZ, fake_sun)
    assert summer.start == at(SUMMER, 21, 0)  # 22:13 capped at 21:00
    assert winter.start == at(WINTER, 18, 0)  # 16:55 raised to 18:00


def test_sun_rounded_to_five_minutes():
    occ = occurrence(slot({"sun": "sunset"}, {"time": "23:00"}), SUMMER, TZ, fake_sun)
    assert occ.start == at(SUMMER, 21, 55)


def test_sun_slot_empty_that_day():  # S26
    occ = occurrence(slot({"sun": "sunset"}, {"time": "21:00"}), SUMMER, TZ, fake_sun)
    assert occ.ignored == "empty"
    assert occurrence(slot({"sun": "sunset"}, {"time": "21:00"}), WINTER, TZ, fake_sun).runs


def test_sun_to_next_morning():
    occ = occurrence(slot({"sun": "sunset"}, {"time": "07:00"}), WINTER, TZ, fake_sun)
    assert occ.runs and occ.end == at(WINTER, 7, 0, plus_days=1)


def test_five_minutes_is_enough():
    occ = occurrence(slot({"sun": "sunset"}, {"time": "22:00"}), SUMMER, TZ, fake_sun)
    assert occ.runs and occ.end - occ.start == timedelta(minutes=5)


def test_one_shot_slot():
    occ = occurrence(slot({"time": "05:00"}), SUMMER, TZ, fake_sun)
    assert occ.runs and occ.end is None


# --- daylight saving time (S4) ---------------------------------------------
SPRING = date(2026, 3, 29)  # 02:00 → 03:00
AUTUMN = date(2026, 10, 25)  # 03:00 → 02:00


def test_skipped_time_moves_forward():
    moment, existed = local_datetime(SPRING, 2, 30, TZ)
    assert not existed and (moment.hour, moment.minute) == (3, 30)


def test_slot_inside_skipped_hour_is_ignored():
    occ = occurrence(slot({"time": "02:15"}, {"time": "02:45"}), SPRING, TZ, fake_sun)
    assert occ.ignored == "skipped_by_dst"


def test_ambiguous_time_takes_first_occurrence():
    moment, existed = local_datetime(AUTUMN, 2, 30, TZ)
    assert existed and moment.utcoffset() == timedelta(hours=2)


def test_autumn_night_lasts_one_hour_more():
    occ = occurrence(slot({"time": "22:00"}, {"time": "06:00"}), date(2026, 10, 24), TZ, fake_sun)
    assert occ.end - occ.start == timedelta(hours=9)


# --- whole day ----------------------------------------------------------------


def test_overlap_trims_the_later_slot():
    slots = [
        slot({"time": "08:00"}, {"time": "12:00"}, "a"),
        slot({"time": "11:00"}, {"time": "14:00"}, "b"),
        slot({"time": "11:30"}, {"time": "11:55"}, "c"),
    ]
    a, b, c = day_occurrences(slots, SUMMER, TZ, fake_sun)
    assert a.runs and a.end == at(SUMMER, 12, 0)
    assert b.runs and b.start == at(SUMMER, 12, 0)
    assert c.ignored == "overlap"
