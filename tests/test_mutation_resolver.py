"""Mutation-testing survivors of resolver.py: how a slot is cut at the midnight next to a day off."""

from __future__ import annotations

from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfo

from custom_components.weekly_planner.resolver import Holiday, _cut, occurrences_around
from custom_components.weekly_planner.timeline import Occurrence

B = datetime(2026, 10, 28, 0, 0, tzinfo=UTC)


def test_a_slot_starting_at_or_after_the_cut_is_ignored_and_keeps_its_times():
    for start in (B, B + timedelta(hours=1)):
        occ = Occurrence("s", start, start + timedelta(hours=2))
        assert _cut(occ, B) == Occurrence("s", start, start + timedelta(hours=2), "holiday_cut")
    one_shot = Occurrence("o", B, None)
    assert _cut(one_shot, B) == Occurrence("o", B, None, "holiday_cut")


def test_a_slot_that_already_ignored_or_ending_by_the_cut_is_left_as_it_is():
    ignored = Occurrence("i", B - timedelta(hours=2), B + timedelta(hours=1), "overlap")
    assert _cut(ignored, B) is ignored
    inside = Occurrence("a", B - timedelta(hours=3), B - timedelta(hours=1))
    assert _cut(inside, B) is inside
    shot = Occurrence("o", B - timedelta(hours=1), None)
    assert _cut(shot, B) is shot
    touching = Occurrence("t", B - timedelta(minutes=4), B)
    assert _cut(touching, B) is touching  # it ends exactly at the cut: nothing to cut, even though it is short


def test_a_slot_crossing_the_cut_stops_there_and_a_rest_under_five_minutes_is_ignored():
    long = Occurrence("l", B - timedelta(hours=2), B + timedelta(hours=3))
    assert _cut(long, B) == Occurrence("l", B - timedelta(hours=2), B)
    exactly = Occurrence("e", B - timedelta(minutes=5), B + timedelta(hours=1))
    assert _cut(exactly, B) == Occurrence("e", B - timedelta(minutes=5), B)  # five minutes is enough
    short = Occurrence("s", B - timedelta(minutes=4), B + timedelta(hours=1))
    assert _cut(short, B) == Occurrence("s", B - timedelta(minutes=4), B, "too_short")


def test_the_cut_is_the_local_midnight_of_the_house_not_of_the_server():
    new_york = ZoneInfo("America/New_York")
    wed = date(2026, 10, 28)
    profile = {"id": "p", "name": "Base", "days": [[{"id": "n", "start": {"time": "22:00"}, "end": {"time": "06:00"}}] for _ in range(7)],
               "holiday": {"day": [{"id": "n2", "start": {"time": "22:00"}, "end": {"time": "06:00"}}]}}
    moment = datetime(2026, 10, 28, 12, 0, tzinfo=new_york)
    placed = occurrences_around(profile, moment, new_york, lambda e, d: None, days=(0,), program_id="p", holiday=Holiday(day=wed))
    occ = next(o for o, slot in placed if slot["id"] == "n2")
    assert occ.start == datetime(2026, 10, 28, 22, 0, tzinfo=new_york).astimezone(UTC)
    assert occ.end == datetime(2026, 10, 29, 0, 0, tzinfo=new_york).astimezone(UTC)
