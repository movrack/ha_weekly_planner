"""Pins behaviour that mutation testing (mutmut) showed was not asserted anywhere."""

from datetime import date, datetime, timedelta, UTC

from custom_components.weekly_planner.const import DEFAULT_PRIORITY
from custom_components.weekly_planner.resolver import active_profile, next_transition
from custom_components.weekly_planner.timeline import occurrence

from .test_resolver import E, TZ, local, no_sun, program, resolve, slot


def test_random_delay_is_pinned_across_releases():
    """The draw is a stable hash: changing the seed or modulus would move every user's slots."""
    spec = {"id": "s", "start": {"time": "08:00", "random_minutes": 240}}
    for day, owner, expected in [
        (date(2026, 6, 22), ("program", "mode"), "11:32"),
        (date(2026, 6, 22), ("a", "p"), "11:28"),
        (date(2026, 6, 21), ("a", "p"), "09:17"),
    ]:
        result = occurrence(spec, day, TZ, no_sun, identity=owner)
        assert result.start.astimezone(TZ).strftime("%H:%M") == expected


def test_winning_slot_segment_carries_program_slot_and_label():
    seg = resolve([program("a", 1, [slot("s1", "08:00", "12:00", mode="comfort")])], 9)
    assert (seg.program_id, seg.slot_id, seg.label) == ("a", "s1", "comfort")
    assert seg.start == local(8) and seg.end == local(12)


def test_default_segment_names_the_owner_program_and_label():
    seg = resolve([program("a", 1, [])], 9)
    assert (seg.program_id, seg.slot_id, seg.label) == ("a", None, "eco")


def test_programs_without_priority_sort_after_explicit_ones_by_creation():
    explicit = program("explicit", DEFAULT_PRIORITY - 1, [])
    first, second = program("first", 0, []), program("second", 0, [])
    del first["priority"], second["priority"]
    first["created_at"], second["created_at"] = "2026-01-01", "2026-02-01"
    assert resolve([second, first, explicit], 9).program_id == "explicit"
    assert resolve([second, first], 9).program_id == "first"


def test_one_shot_slot_does_not_hide_a_later_running_slot():
    one_shot = {"id": "shot", "start": {"time": "07:00"}, "end": None, "label": "eco", "conditions": []}
    progs = [program("a", 1, [one_shot, slot("s1", "08:00", "12:00")])]
    assert resolve(progs, 9).slot_id == "s1"


def test_active_profile_follows_the_selected_mode_and_falls_back():
    prog = program("a", 1, [])
    prog["profiles"].append({"id": "q", "name": "Other", "days": prog["profiles"][0]["days"]})
    assert active_profile(prog, {"a": "q"})["id"] == "q"
    prog["active_profile"] = "q"
    assert active_profile(prog, {})["id"] == "q"
    assert active_profile(prog, {"a": "missing"})["id"] == "p"


def test_next_transition_looks_two_days_ahead_and_picks_the_earliest():
    # Friday-only slot seen from Wednesday evening: only reachable with a 2-day look-ahead.
    prog = program("a", 1, [])
    prog["profiles"][0]["days"] = [[] for _ in range(7)]
    prog["profiles"][0]["days"][4] = [slot("fri", "09:00", "10:00")]
    nxt = next_transition([prog], local(20), TZ, no_sun)
    assert nxt == datetime(2026, 10, 30, 9, 0, tzinfo=TZ).astimezone(UTC)
    early = program("b", 2, [slot("x", "21:00", "21:30"), slot("y", "22:00", "23:00")])
    assert next_transition([prog, early], local(20), TZ, no_sun) == local(21)
    assert next_transition([prog, early], local(21) , TZ, no_sun) == local(21, 30)


def _placed(start, end="NONE", **kw):
    slot_ = {"id": "x", "start": start}
    if end != "NONE":
        slot_["end"] = end
    return occurrence(slot_, date(2026, 10, 28), TZ, kw.get("sun", no_sun), identity=("p", "m"))


def test_missing_sun_event_ignores_the_slot_for_the_day_and_keeps_its_id():
    start_missing = _placed({"sun": "sunset"}, {"time": "23:00"})
    assert (start_missing.slot_id, start_missing.ignored) == ("x", "sun_event_missing")
    assert start_missing.start == datetime(2026, 10, 28, tzinfo=TZ).astimezone(UTC)
    end_missing = _placed({"time": "08:00"}, {"sun": "sunset"})
    assert (end_missing.slot_id, end_missing.ignored) == ("x", "sun_event_missing")
    assert end_missing.start == local(8) and end_missing.end is None


def test_slot_reasons_empty_too_short_and_one_shot():
    one_shot = _placed({"time": "08:00"})
    assert one_shot.runs and one_shot.end is None and one_shot.start == local(8)
    assert _placed({"time": "08:00"}, {"time": "08:03"}).ignored == "too_short"
    ok = _placed({"time": "08:00"}, {"time": "08:05"})
    assert ok.runs and ok.end == local(8, 5)
    assert _placed({"time": "18:00"}, {"time": "13:00"}).ignored == "empty"


def test_overnight_end_lands_on_the_next_day_only_before_noon():
    night = _placed({"time": "22:00"}, {"time": "06:00"})
    assert night.runs and night.end == datetime(2026, 10, 29, 6, tzinfo=TZ).astimezone(UTC)
