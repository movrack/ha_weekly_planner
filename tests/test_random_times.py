"""Stable random windows share execution, preview and deadline semantics."""
from copy import deepcopy
from datetime import date, datetime, timedelta, UTC
import subprocess
import sys
from zoneinfo import ZoneInfo

import pytest
import voluptuous as vol

from custom_components.weekly_planner.timeline import occurrence
from custom_components.weekly_planner.resolver import next_transition, occurrences_around, resolve_entity
from custom_components.weekly_planner.validation import TIME_SPEC, _check_overlaps, _check_week_overlaps, ProgramError

TZ = ZoneInfo("Europe/Brussels")
DAY = date(2026, 6, 21)


def sun(event, day):
    return datetime(day.year, day.month, day.day, 20, 3, tzinfo=TZ)


def placed(start, end=None, day=DAY, identity=("program", "mode")):
    return occurrence({"id": "slot", "start": start, "end": end}, day, TZ, sun, identity=identity)


def test_fixed_random_range_and_zero():
    base = placed({"time": "08:17"})
    result = placed({"time": "08:17", "random_minutes": 15})
    assert base.start <= result.start <= base.start + timedelta(minutes=15)
    assert result == placed({"time": "08:17", "random_minutes": 15})
    assert base.start == placed({"time": "08:17", "random_minutes": 0}).start


def test_solar_delay_after_offset_and_latest_cap():
    base = placed({"sun": "sunset", "offset": 15})
    assert base.start == datetime(2026, 6, 21, 20, 18, tzinfo=TZ)  # exact minute, not 20:15
    delayed = placed({"sun": "sunset", "offset": 15, "random_minutes": 15})
    assert base.start <= delayed.start <= base.start + timedelta(minutes=15)
    capped = placed({"sun": "sunset", "latest": "20:00", "random_minutes": 240})
    assert capped.start == datetime(2026, 6, 21, 20, tzinfo=TZ)


def test_draw_varies_by_date_and_owner():
    spec = {"time": "08:00", "random_minutes": 240}
    draws = [placed(spec, day=DAY + timedelta(days=i)).start.astimezone(TZ).time() for i in range(14)]
    assert len(set(draws)) > 1
    assert len({placed(spec, identity=owner).start for owner in [("a", "p"), ("b", "p"), ("a", "q")]}) > 1


def test_draw_survives_fresh_process():
    script = '''from datetime import date
from zoneinfo import ZoneInfo
from custom_components.weekly_planner.timeline import occurrence
print(occurrence({"id":"slot","start":{"time":"08:17","random_minutes":15}}, date(2026,6,21), ZoneInfo("Europe/Brussels"), lambda e,d:None, identity=("program","mode")).start.isoformat())'''
    result = subprocess.check_output([sys.executable, "-c", script], text=True).strip()
    assert result == placed({"time": "08:17", "random_minutes": 15}).start.isoformat()


def test_overnight_end_and_cross_midnight_one_shot():
    result = placed({"time": "22:00", "random_minutes": 15}, {"time": "06:00", "random_minutes": 15})
    assert result.runs and result.end.astimezone(TZ).date() == DAY + timedelta(days=1)
    shot = placed({"time": "23:59", "random_minutes": 240})
    assert shot.end is None and shot == placed({"time": "23:59", "random_minutes": 240})
    assert shot.start < placed({"time": "23:59", "random_minutes": 240}, day=DAY + timedelta(days=1)).start


def test_random_inversion_never_becomes_accidental_overnight():
    results = [placed({"time": "08:00", "random_minutes": 240}, {"time": "08:05"}, day=DAY + timedelta(days=i)) for i in range(14)]
    assert any(not result.runs for result in results)
    assert all(r.end.astimezone(TZ).date() == DAY + timedelta(days=i) for i, r in enumerate(results))
    assert all(not r.runs or r.end - r.start >= timedelta(minutes=5) for r in results)


@pytest.mark.parametrize("day", [date(2026, 3, 29), date(2026, 10, 25)])
def test_delay_elapsed_across_dst(day):
    base = placed({"time": "01:59"}, day=day)
    result = placed({"time": "01:59", "random_minutes": 240}, day=day)
    assert timedelta(0) <= result.start - base.start <= timedelta(minutes=240)
    assert result == placed({"time": "01:59", "random_minutes": 240}, day=day)


@pytest.mark.parametrize("invalid", [-1, 241, True, 1.5, "15", None])
def test_invalid_random_window(invalid):
    with pytest.raises(vol.Invalid):
        TIME_SPEC({"time": "08:00", "random_minutes": invalid})


def fixed(sid, start, end, start_random=0, end_random=0):
    return {"id": sid, "start": {"time": start, "random_minutes": start_random}, "end": {"time": end, "random_minutes": end_random}}


def test_fixed_validation_reserves_max_end_and_min_duration():
    with pytest.raises(ProgramError, match="random_window_too_short"):
        _check_overlaps([fixed("a", "08:00", "08:15", 15)])
    _check_overlaps([fixed("a", "08:00", "08:20", 15)])
    with pytest.raises(ProgramError, match="overlapping_slots"):
        _check_overlaps([fixed("a", "08:00", "09:00", end_random=15), fixed("b", "09:10", "10:00")])
    _check_overlaps([fixed("a", "08:00", "09:00", end_random=15), fixed("b", "09:15", "10:00")])


@pytest.mark.parametrize("weekday", [0, 6])
def test_cross_day_and_week_random_envelopes(weekday):
    days = [[] for _ in range(7)]
    days[weekday] = [fixed("a", "22:00", "23:50", end_random=30)]
    days[(weekday + 1) % 7] = [fixed("b", "00:05", "01:00")]
    with pytest.raises(ProgramError, match="overlapping_slots"):
        _check_week_overlaps(days)


def test_legacy_cross_midnight_without_delay_still_saves():
    days = [[] for _ in range(7)]
    days[0] = [fixed("a", "22:00", "07:00")]
    days[1] = [fixed("b", "06:00", "08:00")]
    _check_week_overlaps(days)


def test_preview_deadline_and_active_resolution_agree():
    slot = {**fixed("slot", "08:00", "10:00", 15, 15), "label": "on"}
    profile = {"id": "mode", "days": [[deepcopy(slot)] for _ in range(7)]}
    program = {"id": "program", "profiles": [profile], "entities": [{"entity_id": "light.test"}]}
    now = datetime(2026, 6, 21, 7, tzinfo=TZ).astimezone(UTC)
    preview = occurrences_around(profile, now, TZ, sun, days=(0,), program_id="program")[0][0]
    assert next_transition([program], now, TZ, sun) == preview.start
    segment = resolve_entity("light.test", [program], lambda p,e,l: {"kind": "service"}, preview.start, TZ, sun, lambda c: True)
    assert segment.start == preview.start and segment.end == preview.end


async def test_random_one_shot_fires_once_without_recompute_replay(hass, hass_storage, freezer):
    from .helpers import Recorder, go_to, local, program, setup, slot, tick

    rec = Recorder(hass)
    shot = slot("shot", "05:00", None, "boost")
    shot["start"]["random_minutes"] = 15
    engine = await setup(hass, hass_storage, freezer, [program(slots=[shot])], local(26, 4, 0))
    rec.calls.clear()
    await go_to(hass, freezer, local(26, 6, 0))
    assert rec.calls == [("climate.set_preset_mode", {"preset_mode": "boost"})]
    for reason in ("startup", "modification", "profile"):
        await engine.async_recompute(reason)
    await engine.async_apply_now("office")
    await hass.async_block_till_done()
    assert [call for call in rec.calls if call[0] == "climate.set_preset_mode"] == [
        ("climate.set_preset_mode", {"preset_mode": "boost"})]


def test_sun_bounds_accept_either_or_both_ordered():
    for extra in ({}, {"earliest": "18:00"}, {"latest": "21:00"},
                  {"earliest": "18:00", "latest": "21:00"}, {"earliest": "20:00", "latest": "20:00"}):
        assert TIME_SPEC({"sun": "sunset", **extra})["sun"] == "sunset"


@pytest.mark.parametrize("earliest,latest", [("21:00", "18:00"), ("20:01", "20:00"), ("24:00", "23:59")])
def test_sun_bounds_reject_earliest_after_latest(earliest, latest):
    with pytest.raises(vol.Invalid, match="earliest_after_latest"):
        TIME_SPEC({"sun": "sunset", "earliest": earliest, "latest": latest})


def test_sun_bounds_still_reject_invalid_clock_and_resolve():
    with pytest.raises(vol.Invalid):
        TIME_SPEC({"sun": "dusk", "earliest": "25:00"})
    spec = {"sun": "sunset", "earliest": "21:00"}
    assert placed(spec).start == datetime(2026, 6, 21, 21, tzinfo=TZ)
    assert placed({"sun": "sunset", "latest": "19:00"}).start == datetime(2026, 6, 21, 19, tzinfo=TZ)
