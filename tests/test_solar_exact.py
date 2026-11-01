"""Solar times start at their exact minute (seconds dropped, never rounded to a 5-minute step)."""

from __future__ import annotations

from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfo

import pytest

from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.timeline import day_occurrences, occurrence

from .helpers import Recorder, go_to, local, program, setup

BRUSSELS = ZoneInfo("Europe/Brussels")
DAY = date(2026, 11, 2)  # a Monday, winter time (UTC+1)


def sun_at(h: int, m: int, s: int, micro: int = 0):
    """Every solar event of every day at the given UTC time (seconds included, like astral)."""
    return lambda event, day: datetime(day.year, day.month, day.day, h, m, s, micro, tzinfo=UTC)


def utc(day: date, h: int, m: int) -> datetime:
    return datetime(day.year, day.month, day.day, h, m, tzinfo=UTC)


def place(start, end=None, tz=UTC, day=DAY, sun=sun_at(16, 17, 12)):
    return occurrence({"id": "s", "start": start, "end": end}, day, tz, sun)


@pytest.mark.parametrize("event", ["sunrise", "sunset", "dawn", "dusk"])
def test_seconds_are_dropped_not_rounded(event):
    assert place({"sun": event}).start == utc(DAY, 16, 17)
    late = place({"sun": event}, sun=sun_at(16, 19, 59, 999_999)).start
    assert late == utc(DAY, 16, 19)  # truncated to the minute, not to 16:20 nor 16:15


def test_offsets_keep_the_exact_minute():
    assert place({"sun": "sunset", "offset": 13}).start == utc(DAY, 16, 30)
    assert place({"sun": "sunset", "offset": -7}).start == utc(DAY, 16, 10)
    assert place({"sun": "sunset", "offset": -240}).start == utc(DAY, 12, 17)


def test_bounds_apply_before_the_minute_is_kept():
    assert place({"sun": "sunset", "earliest": "16:23"}).start == utc(DAY, 16, 23)
    assert place({"sun": "sunset", "latest": "16:11"}).start == utc(DAY, 16, 11)
    # inside the bounds: the solar minute itself
    assert place({"sun": "sunset", "earliest": "16:00", "latest": "17:00"}).start == utc(DAY, 16, 17)
    # local bounds in another zone (UTC+1)
    assert place({"sun": "sunset", "earliest": "17:21"}, tz=BRUSSELS).start == utc(DAY, 16, 21)


def test_random_delay_counts_from_the_exact_minute():
    base = place({"sun": "sunset"}).start
    delayed = place({"sun": "sunset", "random_minutes": 3}).start
    assert base == utc(DAY, 16, 17) and base <= delayed <= base + timedelta(minutes=3)
    assert delayed.second == 0


def test_minimum_length_against_an_exact_solar_start():
    assert place({"sun": "sunset"}, {"time": "16:22"}).runs  # 5 minutes
    assert place({"sun": "sunset"}, {"time": "16:21"}).ignored == "too_short"
    assert place({"time": "16:12"}, {"sun": "sunset"}).runs  # ends at 16:17, 5 minutes
    assert place({"time": "16:13"}, {"sun": "sunset"}).ignored == "too_short"


def _day(*slots):
    return day_occurrences([{"id": sid, "start": s, "end": e} for sid, s, e in slots], DAY, UTC, sun_at(16, 17, 12))


def test_adjacent_to_a_solar_time_is_not_an_overlap():
    a, b = _day(("a", {"time": "15:00"}, {"sun": "sunset"}), ("b", {"sun": "sunset"}, {"time": "18:00"}))
    assert a.runs and a.end == utc(DAY, 16, 17)
    assert b.runs and b.start == utc(DAY, 16, 17)  # 12 s of the event never create an overlap


def test_overlap_near_a_solar_time_trims_to_the_minute():
    a, b = _day(("a", {"time": "15:00"}, {"time": "16:19"}), ("b", {"sun": "sunset"}, {"time": "18:00"}))
    assert b.runs and b.start == utc(DAY, 16, 19)
    a, b = _day(("a", {"sun": "sunset"}, {"time": "16:30"}), ("b", {"time": "16:20"}, {"time": "16:34"}))
    assert a.runs and a.start == utc(DAY, 16, 17)
    assert b.ignored == "overlap"  # 4 minutes left after the solar slot
    a, b = _day(("a", {"sun": "sunset"}, {"time": "16:30"}), ("b", {"time": "16:20"}, {"time": "16:35"}))
    assert b.runs and b.start == utc(DAY, 16, 30)


def test_daylight_saving_days():
    spring, autumn = date(2026, 3, 29), date(2026, 10, 25)
    # sunrise 05:21:40 UTC on the spring change; -240 min lands after the skipped hour (03:21 CEST)
    occ = place({"sun": "sunrise", "offset": -240}, tz=BRUSSELS, day=spring, sun=sun_at(5, 21, 40))
    assert occ.start == utc(spring, 1, 21) and occ.start.astimezone(BRUSSELS).hour == 3
    # an earliest bound inside the skipped hour moves forward (02:30 -> 03:30 CEST)
    occ = place({"sun": "sunrise", "offset": -240, "earliest": "02:30"}, tz=BRUSSELS, day=spring, sun=sun_at(0, 3, 9))
    assert occ.start == utc(spring, 1, 30)
    # autumn change: the solar minute is kept in UTC whatever the wall clock
    occ = place({"sun": "sunrise"}, {"time": "12:00"}, tz=BRUSSELS, day=autumn, sun=sun_at(6, 31, 47))
    assert occ.start == utc(autumn, 6, 31) and occ.start.astimezone(BRUSSELS).minute == 31


def _solar_program():
    prog = program()
    solar = {"id": "s1", "start": {"sun": "sunset"}, "end": {"time": "23:00"}, "label": "t21", "conditions": []}
    prog["profiles"][0]["days"] = [[dict(solar)] for _ in range(7)]
    return prog


def _fake_astral(monkeypatch):
    monkeypatch.setattr("custom_components.weekly_planner.engine.get_astral_event_date",
                        lambda hass, event, day: datetime(day.year, day.month, day.day, 16, 17, 12, 345_678, tzinfo=UTC))


async def test_engine_starts_at_the_exact_minute(hass, hass_storage, freezer, monkeypatch):
    _fake_astral(monkeypatch)
    rec = Recorder(hass)
    await setup(hass, hass_storage, freezer, [_solar_program()], local(26, 16, 0))  # 15:00 UTC
    assert rec.calls == [("climate.set_temperature", {"temperature": 15})]
    await go_to(hass, freezer, datetime(2026, 10, 26, 16, 16, 59, tzinfo=UTC))
    assert len(rec.calls) == 1  # 16:15 is no longer a start
    await go_to(hass, freezer, datetime(2026, 10, 26, 16, 17, 0, tzinfo=UTC))
    assert rec.calls[-1] == ("climate.set_temperature", {"temperature": 21})


async def test_preview_shows_the_same_minute(hass, hass_storage, freezer, hass_ws_client, monkeypatch):
    _fake_astral(monkeypatch)
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [_solar_program()], None)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/preview", "program_id": "office", "date": "2026-10-26"})
    slots = (await ws.receive_json())["result"]["slots"]
    assert slots == [{"slot_id": "s1", "start": "2026-10-26T16:17:00+00:00",
                      "end": "2026-10-26T22:00:00+00:00", "ignored": None, "sun": True}]
