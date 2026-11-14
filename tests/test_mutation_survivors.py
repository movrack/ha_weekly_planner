"""Pins behaviour that mutation testing (mutmut) showed was not asserted anywhere."""

from datetime import UTC, date, datetime, timedelta

from custom_components.weekly_planner.const import DEFAULT_PRIORITY
from custom_components.weekly_planner.modes import EMPTY_PROFILE, NO_PROFILE
from custom_components.weekly_planner.resolver import active_profile, next_transition
from custom_components.weekly_planner.timeline import occurrence

from .test_resolver import TZ, local, no_sun, program, resolve, slot


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
    prog["active_profile"] = "q"  # a stale per-program choice is ignored
    assert active_profile(prog, {})["id"] == "p"
    assert active_profile(prog, {"a": "missing"})["id"] == "p"
    assert active_profile(prog, {"a": NO_PROFILE}) is EMPTY_PROFILE  # no profile for the mode: no schedule


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


# -- third mutation run: timeline (a zone that is neither UTC nor the zone of the developer) --------------

from zoneinfo import ZoneInfo

import pytest

from custom_components.weekly_planner.timeline import (
    Occurrence,
    day_occurrences,
    parse_clock,
    place_day,
    trim,
)
from custom_components.weekly_planner.timeline import (
    resolve as resolve_time,
)

AKL = ZoneInfo("Pacific/Auckland")  # UTC+13 in October: wall-clock bugs show whatever the machine zone is
DAY = date(2026, 10, 28)  # a Wednesday


def _utc(day, h, m=0, s=0, tz=AKL):
    return datetime(day.year, day.month, day.day, h, m, s, tzinfo=tz).astimezone(UTC)


def _occ(start, end="NONE", day=DAY, sun=no_sun, sid="x", **extra):
    spec = {"id": sid, "start": start, **extra}
    if end != "NONE":
        spec["end"] = end
    return occurrence(spec, day, AKL, sun, identity=("p", "m"))


def test_error_messages_name_the_bad_value():
    with pytest.raises(ValueError, match=r"^invalid time '25:00'$"):
        parse_clock("25:00")
    with pytest.raises(ValueError, match=r"^unknown sun event 'noon'$"):
        resolve_time({"sun": "noon"}, DAY, AKL, no_sun)


def test_fixed_time_is_read_in_the_given_zone():
    assert resolve_time({"time": "08:00"}, DAY, AKL, no_sun) == (datetime(2026, 10, 28, 8, tzinfo=AKL), True)
    assert resolve_time({"time": "24:00"}, DAY, AKL, no_sun)[0] == datetime(2026, 10, 29, tzinfo=AKL)


def test_missing_sun_event_is_reported_as_existing_none():
    assert resolve_time({"sun": "sunset"}, DAY, AKL, no_sun) == (None, True)


def test_solar_time_is_a_whole_minute_in_the_given_zone():
    def sun(event, day):
        return datetime(2026, 10, 28, 6, 30, 45, 123456, tzinfo=UTC)

    moment, existed = resolve_time({"sun": "sunrise", "offset": 10}, DAY, AKL, sun)
    assert existed is True
    assert (moment.second, moment.microsecond) == (0, 0)
    assert moment == datetime(2026, 10, 28, 6, 40, tzinfo=UTC)
    assert moment.utcoffset() == timedelta(hours=13)


def test_solar_limits_are_read_in_the_given_zone():
    def sun(event, day):
        return datetime(2026, 10, 28, 5, 0, tzinfo=UTC)  # 18:00 in Auckland

    assert resolve_time({"sun": "dawn", "earliest": "19:00"}, DAY, AKL, sun)[0] == datetime(2026, 10, 28, 19, tzinfo=AKL)
    assert resolve_time({"sun": "dawn", "latest": "17:00"}, DAY, AKL, sun)[0] == datetime(2026, 10, 28, 17, tzinfo=AKL)
    assert resolve_time({"sun": "dawn", "earliest": "17:00", "latest": "19:00"}, DAY, AKL, sun)[0] == \
        datetime(2026, 10, 28, 18, tzinfo=AKL)


def test_random_delay_depends_on_non_ascii_seed_bytes():
    """The seed is hashed as ASCII-escaped JSON: an accented seed must keep its draw across releases."""
    spec = {"id": "s", "start": {"time": "08:00", "random_minutes": 240}, "seed": "séjour"}
    assert occurrence(spec, DAY, AKL, no_sun, identity=("p",)).start == _utc(DAY, 9, 51)


def test_random_delay_follows_the_seed_not_the_id():
    def start(sid, **extra):
        return _occ({"time": "08:00", "random_minutes": 240}, sid=sid, **extra).start

    assert start("a", seed="shared") == start("b", seed="shared")
    assert len({start(sid) for sid in "abcdef"}) > 1  # without a seed, each id draws on its own


def test_random_delay_of_a_solar_slot_is_capped_by_latest_on_the_day_it_ends():
    start = {"time": "22:00"}
    end = {"sun": "sunrise", "random_minutes": 240, "latest": "06:30"}
    # the end lands on the next morning (sunrise before noon): the cap is that day's 06:30, not today's
    occ = occurrence({"id": "x", "start": start, "end": end}, DAY, AKL, lambda e, d: _utc(d, 6, 0) if e else None,
                     identity=("p",))
    assert occ.runs
    assert occ.start == _utc(DAY, 22)
    assert occ.end == _utc(date(2026, 10, 29), 6, 30)


def test_slot_with_a_missing_sun_event_starts_at_local_midnight():
    occ = _occ({"sun": "sunset"}, {"time": "23:00"})
    assert occ == Occurrence("x", _utc(DAY, 0), None, "sun_event_missing")


def test_end_sun_event_missing_the_next_morning_keeps_the_start():
    def sun(event, day):
        return _utc(day, 6, 0) if day == DAY else None

    # 22:00 -> sunrise: the sunrise of the day is before the start, so the end moves to a day without sunrise
    occ = _occ({"time": "22:00"}, {"sun": "sunrise"}, sun=sun)
    assert occ == Occurrence("x", _utc(DAY, 22), None, "sun_event_missing")


def test_end_on_the_next_morning_uses_the_sun_of_that_day():
    def sun(event, day):
        return _utc(day, 6, 15)

    occ = _occ({"time": "22:00"}, {"sun": "sunrise"}, sun=sun)
    assert occ == Occurrence("x", _utc(DAY, 22), _utc(date(2026, 10, 29), 6, 15))


def test_end_equal_to_start_lasts_a_whole_day_but_noon_does_not_roll_over():
    assert _occ({"time": "08:00"}, {"time": "08:00"}) == Occurrence("x", _utc(DAY, 8), _utc(date(2026, 10, 29), 8))
    # an end at noon or after is not "the next morning": the slot is empty
    assert _occ({"time": "18:00"}, {"time": "12:00"}) == Occurrence("x", _utc(DAY, 18), _utc(DAY, 12), "empty")
    assert _occ({"time": "18:00"}, {"time": "11:59"}).end == _utc(date(2026, 10, 29), 11, 59)


def test_ignored_slots_carry_their_id_and_both_instants():
    assert _occ({"time": "08:00"}, {"time": "08:04"}, sid="short") == \
        Occurrence("short", _utc(DAY, 8), _utc(DAY, 8, 4), "too_short")
    assert _occ({"time": "18:00"}, {"time": "13:00"}, sid="neg") == \
        Occurrence("neg", _utc(DAY, 18), _utc(DAY, 13), "empty")
    # a random delay that lands the start exactly on the end leaves an empty (not a too short) slot
    delayed = _occ({"time": "08:00", "random_minutes": 5}, {"time": "08:05"}, sid="g")
    assert delayed == Occurrence("g", _utc(DAY, 8, 5), _utc(DAY, 8, 5), "empty")


def test_a_slot_wholly_in_the_dst_gap_is_skipped_but_one_end_in_the_gap_runs():
    gap_day = date(2027, 3, 28)  # Brussels: 02:00 -> 03:00
    brussels = ZoneInfo("Europe/Brussels")

    def place(start, end):
        return occurrence({"id": "x", "start": {"time": start}, "end": {"time": end}}, gap_day, brussels, no_sun)

    both = place("02:10", "02:40")
    assert both.ignored == "skipped_by_dst" and both.slot_id == "x"
    # a skipped time moves forward by the hour that does not exist: 02:10 -> 03:10 (01:10 UTC)
    assert both.start == datetime(2027, 3, 28, 1, 10, tzinfo=UTC)
    assert both.end == datetime(2027, 3, 28, 1, 40, tzinfo=UTC)
    assert place("02:30", "04:00").runs
    assert place("01:00", "02:30").runs


def test_place_day_uses_the_zone_and_the_identity():
    slots = [{"id": "b", "start": {"time": "09:00"}, "end": {"time": "10:00"}},
             {"id": "a", "start": {"time": "08:00", "random_minutes": 240}, "end": {"time": "20:00"}}]
    placed = place_day(slots, DAY, AKL, no_sun, identity=("prog", "mode"))
    assert [o.start for o in placed] == sorted(o.start for o in placed)
    by_id = {o.slot_id: o for o in placed}
    assert by_id["b"].start == _utc(DAY, 9) and by_id["b"].end == _utc(DAY, 10)
    other = place_day(slots, DAY, AKL, no_sun, identity=("other", "mode"))
    assert {o.slot_id: o.start for o in other}["a"] != by_id["a"].start
    assert place_day(slots, DAY, AKL, no_sun, identity=("prog", "mode")) == placed
    assert day_occurrences(slots, DAY, AKL, no_sun, identity=("other", "mode")) == trim(other)


def _o(start_h, end_h, sid="a", start_m=0, end_m=0, ignored=None):
    end = None if end_h is None else _utc(DAY, end_h, end_m)
    return Occurrence(sid, _utc(DAY, start_h, start_m), end, ignored)


def test_trim_keeps_a_slot_starting_exactly_when_the_previous_one_ends():
    first, shot = _o(8, 9), _o(9, None, "shot")
    assert trim([first, shot]) == [first, shot]  # one-shot at the very end: not an overlap
    assert trim([first, _o(8, None, "x", start_m=30)])[1].ignored == "overlap"  # a one-shot inside is


def test_trim_keeps_exactly_five_minutes_and_drops_four():
    first = _o(8, 9)
    kept = trim([first, _o(8, 9, "b", start_m=30, end_m=5)])[1]
    assert kept == Occurrence("b", _utc(DAY, 9), _utc(DAY, 9, 5), None)
    dropped = trim([first, _o(8, 9, "c", start_m=30, end_m=4)])[1]
    assert dropped == Occurrence("c", _utc(DAY, 8, 30), _utc(DAY, 9, 4), "overlap")


def test_trim_moves_the_start_and_keeps_the_id_and_the_end():
    result = trim([_o(8, 10), _o(9, 12, "b")])
    assert result[1] == Occurrence("b", _utc(DAY, 10), _utc(DAY, 12), None)
    one_shot = trim([_o(8, 10), _o(9, None, "shot")])[1]
    assert one_shot == Occurrence("shot", _utc(DAY, 9), None, "overlap")


def test_trim_ignores_ignored_slots_when_computing_the_furthest_end():
    too_short = Occurrence("tiny", _utc(DAY, 10), _utc(DAY, 10, 3), "too_short")
    later = _o(10, 11, "later", start_m=1)
    assert trim([_o(8, 9), too_short, later])[2] == later


# -- third mutation run: validation ---------------------------------------------------------------------------

from copy import deepcopy

import voluptuous as vol

from custom_components.weekly_planner import validation as v

from .helpers import CLIMATE, COVER
from .helpers import labels as _labels
from .helpers import program as _program
from .helpers import slot as _slot

LIGHT = "light.office"
PAUSE = "2026-12-01T08:00:00+00:00"


def _check_program(prog):
    return v.check_program(deepcopy(prog), {item["id"]: item for item in _labels()})


def _reject(prog) -> str:
    with pytest.raises(vol.Invalid) as exc:
        _check_program(prog)
    return exc.value.msg


def _devices(*ids):
    return [{"entity_id": eid, "default_label": None, "label_overrides": {}} for eid in ids]


def _listed(sid, start, end, entities, label="t21"):
    return {**_slot(sid, start, end, label), "entities": entities}


def _devices_program(slots, ids=(CLIMATE, COVER)):
    return _program(slots=slots, entities=_devices(*ids))


# keep_pause: a stale save must not end the pause of a stored paused program

STORED = {"enabled": False, "paused_until": PAUSE}


@pytest.mark.parametrize("keep_enabled", [True, False])
def test_keep_pause_restores_the_pause_when_the_card_sends_the_program_as_disabled(keep_enabled):
    saved = {"name": "x", "enabled": False}
    assert v.keep_pause(STORED, saved, keep_enabled=keep_enabled) == {"name": "x", "enabled": False, "paused_until": PAUSE}
    assert saved == {"name": "x", "enabled": False}  # the caller's dict is left alone


def test_keep_pause_restores_pause_and_suspension_for_a_stale_enabled_program_only_when_asked():
    stale = {"name": "x", "enabled": True}
    assert v.keep_pause(STORED, stale, keep_enabled=True) == {"name": "x", "enabled": False, "paused_until": PAUSE}
    assert v.keep_pause(STORED, stale, keep_enabled=False) == {"name": "x", "enabled": True}
    no_flag = {"name": "x"}
    assert v.keep_pause(STORED, no_flag, keep_enabled=False) == {"name": "x"}  # silence is not "disabled"
    assert v.keep_pause(STORED, no_flag, keep_enabled=True) == {"name": "x", "enabled": False, "paused_until": PAUSE}


@pytest.mark.parametrize("keep_enabled", [True, False])
def test_keep_pause_never_overrides_a_pause_named_by_the_new_data(keep_enabled):
    named = {"name": "x", "enabled": False, "paused_until": "2027-01-01T00:00:00+00:00"}
    assert v.keep_pause(STORED, named, keep_enabled=keep_enabled) == named
    cleared = {"name": "x", "enabled": True, "paused_until": None}
    assert v.keep_pause(STORED, cleared, keep_enabled=keep_enabled) == cleared


@pytest.mark.parametrize("existing", [None, {}, {"enabled": False}, {"enabled": False, "paused_until": None},
                                      {"enabled": True, "paused_until": ""}])
def test_keep_pause_does_nothing_without_a_stored_pause(existing):
    saved = {"name": "x", "enabled": False}
    assert v.keep_pause(existing, saved, keep_enabled=True) == {"name": "x", "enabled": False}


# check_program: resume time and legacy keys


def test_paused_until_survives_only_on_a_suspended_program_and_is_normalised_to_utc():
    paused = _program()
    paused.update(enabled=False, paused_until="2026-12-01T09:00:00+01:00")
    assert _check_program(paused)["paused_until"] == PAUSE
    running = _program()
    running.update(enabled=True, paused_until=PAUSE)
    assert "paused_until" not in _check_program(running)
    no_flag = _program()
    del no_flag["enabled"]
    no_flag["paused_until"] = PAUSE
    assert "paused_until" not in _check_program(no_flag)  # enabled defaults to True


def test_a_suspended_program_without_resume_time_has_no_paused_until_key():
    off = _program()
    off["enabled"] = False
    assert "paused_until" not in _check_program(off)
    off["paused_until"] = None
    assert "paused_until" not in _check_program(off)


def test_legacy_mode_keys_are_dropped_from_the_result():
    prog = _program()
    prog.update(active_profile="base", mode_source="x")
    out = _check_program(prog)
    assert "active_profile" not in out and "mode_source" not in out


def _two_modes(**follows):
    prog = _program(slots=[])
    prog["profiles"].append({"id": "alt", "name": "Alt", "days": [[] for _ in range(7)], **follows})
    return prog


def test_follows_is_kept_when_set_and_removed_when_none():
    assert "follows" not in _check_program(_two_modes(follows=None))["profiles"][1]
    assert _check_program(_two_modes(follows="Base"))["profiles"][1]["follows"] == "Base"
    assert "follows" not in _check_program(_two_modes())["profiles"][1]


def test_follows_errors_are_passed_on_word_for_word():
    assert _reject(_two_modes(follows="Alt")) == "Mode 'Alt' cannot follow itself"
    assert _reject(_two_modes(follows="Nope")) == "Mode 'Alt' follows 'Nope', which does not exist in this program"


# check_program / _check_slot_entities: exact codes


def test_slot_entity_codes_carry_the_slot_id_and_the_entity():
    assert _reject(_devices_program([_listed("a", "07:00", "09:00", [])])) == "empty_slot_entities:a"
    assert _reject(_devices_program([_listed("b", "07:00", "09:00", [CLIMATE, COVER, CLIMATE])])) == \
        f"duplicate_slot_entity:b:{CLIMATE}"
    assert _reject(_devices_program([_listed("c", "07:00", "09:00", [CLIMATE, LIGHT])])) == \
        f"unknown_slot_entity:c:{LIGHT}"


def test_a_slot_without_a_list_or_with_known_devices_is_accepted():
    out = _check_program(_devices_program([_slot("a", "07:00", "09:00"), _listed("b", "10:00", "11:00", [COVER])]))
    assert out["profiles"][0]["days"][0][1]["entities"] == [COVER]


def test_slot_entity_helper_is_silent_for_a_missing_list_and_strict_about_the_others():
    v._check_slot_entities({"id": "a"}, {})
    v._check_slot_entities({"id": "a", "entities": [CLIMATE, COVER]}, {CLIMATE: None, COVER: None})
    with pytest.raises(v.ProgramError) as exc:
        v._check_slot_entities({"id": "a", "entities": [COVER]}, {CLIMATE: None})
    assert exc.value.msg == f"unknown_slot_entity:a:{COVER}"
    with pytest.raises(v.ProgramError) as exc:
        v._check_slot_entities({"id": "a", "entities": [COVER, CLIMATE, COVER]}, {CLIMATE: None, COVER: None})
    assert exc.value.msg == f"duplicate_slot_entity:a:{COVER}"


def test_duplicate_is_reported_before_an_unknown_device():
    with pytest.raises(v.ProgramError) as exc:
        v._check_slot_entities({"id": "a", "entities": [LIGHT, LIGHT]}, {})
    assert exc.value.msg == f"duplicate_slot_entity:a:{LIGHT}"


def test_unknown_label_in_a_slot_is_named_even_with_lists():
    bad = _listed("a", "07:00", "09:00", [CLIMATE], label="ghost")
    assert _reject(_devices_program([bad])) == "unknown_label:ghost"


def test_overlaps_are_per_device_as_soon_as_one_slot_has_a_list():
    other_devices = [_listed("a", "07:00", "09:00", [CLIMATE]), _listed("b", "08:00", "10:00", [COVER])]
    _check_program(_devices_program(other_devices))
    same_device = [_listed("a", "07:00", "09:00", [CLIMATE]), _listed("b", "08:00", "10:00", [CLIMATE])]
    assert _reject(_devices_program(same_device)) == f"overlapping_slots:{CLIMATE}"
    plain = [_slot("a", "07:00", "09:00"), _slot("b", "08:00", "10:00")]
    assert _reject(_devices_program(plain)) == "overlapping_slots"


# _fixed_intervals


def _week_of(*slots):
    days = [[] for _ in range(7)]
    days[0] = list(slots)
    return days


def test_fixed_interval_is_start_end_plus_end_delay_and_randomised_flag():
    day = date(2026, 1, 5)
    a = _slot("a", "08:00", "09:00")
    assert v._fixed_intervals([a], day) == [(datetime(2026, 1, 5, 8, tzinfo=UTC), datetime(2026, 1, 5, 9, tzinfo=UTC), False)]
    a["end"]["random_minutes"] = 15
    assert v._fixed_intervals([a], day) == [(datetime(2026, 1, 5, 8, tzinfo=UTC), datetime(2026, 1, 5, 9, 15, tzinfo=UTC), True)]


def test_fixed_interval_carries_the_devices_of_the_slot_in_program_order():
    day = date(2026, 1, 5)
    ids = [CLIMATE, COVER, LIGHT]
    listed = _listed("a", "08:00", "09:00", [LIGHT, CLIMATE])
    everyone = _slot("b", "10:00", "11:00")
    found = v._fixed_intervals([listed, everyone], day, ids)
    assert [item[3] for item in found] == [frozenset({CLIMATE, LIGHT}), frozenset(ids)]
    assert all(len(item) == 4 for item in found)
    assert all(len(item) == 3 for item in v._fixed_intervals([listed, everyone], day))


def test_random_window_too_short_is_refused_with_its_code_for_each_kind_of_slot():
    short = _slot("a", "08:00", "08:14")
    short["start"]["random_minutes"] = 10
    with pytest.raises(v.ProgramError) as exc:
        v._fixed_intervals([short], date(2026, 1, 5))
    assert exc.value.msg == "random_window_too_short"
    short["end"] = {"time": "08:15"}  # 5 + 10 minutes: just enough
    assert len(v._fixed_intervals([short], date(2026, 1, 5))) == 1
    empty = _slot("b", "18:00", "13:00")
    empty["start"]["random_minutes"] = 5
    assert _error_of(v._fixed_intervals, [empty], date(2026, 1, 5)) == "random_window_too_short"


def _error_of(func, *args):
    with pytest.raises(vol.Invalid) as exc:
        func(*args)
    return exc.value.msg


def test_scoped_overlap_of_a_delayed_slot_across_midnight_names_the_shared_device():
    delayed = _listed("n", "22:00", "06:00", [CLIMATE])
    delayed["end"]["random_minutes"] = 30
    days = _week_of()
    days[6] = [delayed]
    days[0] = [_listed("m", "06:10", "07:00", [CLIMATE, COVER])]
    assert _error_of(v._check_week_overlaps_scoped, days, [CLIMATE, COVER]) == f"overlapping_slots:{CLIMATE}"
    days[0] = [_listed("m", "06:10", "07:00", [COVER])]
    v._check_week_overlaps_scoped(days, [CLIMATE, COVER])
    days[0] = [_listed("m", "06:30", "07:00", [CLIMATE])]
    v._check_week_overlaps_scoped(days, [CLIMATE, COVER])


# -- third mutation run: resolver -------------------------------------------------------------------------------

from custom_components.weekly_planner.resolver import (
    OccurrenceCache,
    device_groups_around,
    occurrences_around,
    resolve_entity,
    running_slot,
)

from .test_resolver import all_true, resolve_label

CLI, COV = "climate.office", "cover.office"


def _at(h, m=0, day=28):
    return datetime(2026, 10, day, h, m, tzinfo=AKL).astimezone(UTC)


def _s(sid, start, end, entities=None, mode="comfort", **extra):
    out = {"id": sid, "start": {"time": start}, "end": {"time": end} if end else None, "label": mode,
           "conditions": [], **extra}
    if entities is not None:
        out["entities"] = entities
    return out


def _prog(pid, days, priority=1, entities=(CLI,), **extra):
    """``days``: {weekday: [slots]} (Monday = 0)."""
    week = [list(days.get(i, [])) for i in range(7)]
    return {"id": pid, "priority": priority, "enabled": True, "conditions": [],
            "entities": [{"entity_id": e, "default_label": "eco", "label_overrides": {}} for e in entities],
            "profiles": [{"id": "p", "name": "Base", "days": week}], **extra}


def _no_sun(event, day):
    return None


def _view(placed):
    """(slot id, start, end, ignored) of every occurrence, in order."""
    return [(slot["id"], occ.start, occ.end, occ.ignored) for occ, slot in placed]


WED = 2  # 2026-10-28


def test_occurrences_around_reads_the_zone_and_the_requested_days_exactly():
    prog = _prog("a", {1: [_s("tue", "08:00", "09:00")], 2: [_s("wed", "08:00", "09:00")],
                       3: [_s("thu", "08:00", "09:00")], 4: [_s("fri", "08:00", "09:00")]})
    profile = prog["profiles"][0]
    # 23:30 on Wednesday in Auckland is still Wednesday in the zone, though already Thursday in Brussels
    moment = _at(23, 30)
    assert [s["id"] for _o, s in occurrences_around(profile, moment, AKL, _no_sun)] == ["tue", "wed", "thu"]
    assert [s["id"] for _o, s in occurrences_around(profile, moment, AKL, _no_sun, days=(1,))] == ["thu"]
    assert [s["id"] for _o, s in occurrences_around(profile, moment, AKL, _no_sun, days=(-1, 2))] == ["tue", "fri"]
    # and the instants are those of the zone
    assert _view(occurrences_around(profile, moment, AKL, _no_sun, days=(0,))) == [("wed", _at(8), _at(9), None)]


@pytest.mark.parametrize("use_cache", [False, True])
def test_occurrences_around_draws_random_delays_with_the_program_and_profile_identity(use_cache):
    slot = _s("r", "08:00", "20:00")
    slot["start"]["random_minutes"] = 240
    prog = _prog("a", {WED: [slot]})
    profile = prog["profiles"][0]
    cache = OccurrenceCache() if use_cache else None
    expected = place_day([slot], DAY, AKL, _no_sun, identity=("a", "p"))[0]
    got = occurrences_around(profile, _at(12), AKL, _no_sun, days=(0,), program_id="a", cache=cache)
    assert got[0][0] == expected
    other = occurrences_around(profile, _at(12), AKL, _no_sun, days=(0,), program_id="b", cache=cache)
    assert other[0][0] != expected
    assert place_day([slot], DAY, AKL, _no_sun, identity=("", "p"))[0] != expected
    default = occurrences_around(profile, _at(12), AKL, _no_sun, days=(0,), cache=cache)
    assert default[0][0] == place_day([slot], DAY, AKL, _no_sun, identity=("", "p"))[0]


@pytest.mark.parametrize("use_cache", [False, True])
def test_occurrences_around_gives_each_device_its_own_timeline_and_none_trims_them_all(use_cache):
    a = _s("a", "08:00", "10:00", [CLI])
    b = _s("b", "09:00", "11:00", [COV])
    prog = _prog("p1", {WED: [a, b]}, entities=(CLI, COV))
    profile = prog["profiles"][0]

    def around(entity):
        cache = OccurrenceCache() if use_cache else None
        return _view(occurrences_around(profile, _at(9, 30), AKL, _no_sun, days=(0,), program_id="p1",
                                        cache=cache, entity_id=entity))

    assert around(CLI) == [("a", _at(8), _at(10), None)]
    assert around(COV) == [("b", _at(9), _at(11), None)]
    # no device given: one timeline for all the slots, the later one loses the overlap
    assert around(None) == [("a", _at(8), _at(10), None), ("b", _at(10), _at(11), None)]
    # a device the program does not list at all (no slot applies): nothing runs for it
    assert around("light.other") == []


def test_cache_day_shares_trims_between_devices_with_the_same_slots_and_not_across_profiles():
    a = _s("a", "08:00", "10:00", [CLI, COV])
    b = _s("b", "09:00", "11:00")
    prog = _prog("p1", {WED: [a, b]}, entities=(CLI, COV))
    profile = prog["profiles"][0]
    cache = OccurrenceCache()
    first = cache.day(profile, DAY, AKL, _no_sun, "p1", CLI)
    assert _view(first) == [("a", _at(8), _at(10), None), ("b", _at(10), _at(11), None)]
    assert _view(cache.day(profile, DAY, AKL, _no_sun, "p1", COV)) == _view(first)
    # an edited (replaced) profile never hits the stale day
    edited = deepcopy(profile)
    edited["days"][WED] = [_s("c", "12:00", "13:00")]
    assert _view(cache.day(edited, DAY, AKL, _no_sun, "p1", CLI)) == [("c", _at(12), _at(13), None)]
    assert _view(cache.day(profile, DAY, AKL, _no_sun, "p1", CLI)) == _view(first)
    # a different program id on the same profile object is a different day
    assert cache.entry(profile, DAY, AKL, _no_sun, "p1") is cache.entry(profile, DAY, AKL, _no_sun, "p1")
    assert cache.entry(profile, DAY, AKL, _no_sun, "p1") is not cache.entry(profile, DAY, AKL, _no_sun, "p2")


def test_day_device_without_lists_or_without_device_trims_every_slot_together():
    prog = _prog("p1", {WED: [_s("a", "08:00", "10:00"), _s("b", "09:00", "11:00")]}, entities=(CLI, COV))
    entry = OccurrenceCache().entry(prog["profiles"][0], DAY, AKL, _no_sun, "p1")
    expected = [("a", _at(8), _at(10), None), ("b", _at(10), _at(11), None)]
    assert entry.lists is False
    assert _view(entry.device(CLI)) == expected
    assert _view(entry.device(None)) == expected
    assert [_view(g) for g in entry.groups([CLI, COV])] == [expected]


def test_day_device_with_lists_trims_per_device_and_none_means_all_slots():
    prog = _prog("p1", {WED: [_s("a", "08:00", "10:00", [CLI]), _s("b", "09:00", "11:00", [COV]),
                              _s("c", "09:30", "10:30", [CLI, COV])]}, entities=(CLI, COV))
    entry = OccurrenceCache().entry(prog["profiles"][0], DAY, AKL, _no_sun, "p1")
    assert entry.lists is True
    assert _view(entry.device(CLI)) == [("a", _at(8), _at(10), None), ("c", _at(10), _at(10, 30), None)]
    assert _view(entry.device(COV)) == [("b", _at(9), _at(11), None), ("c", _at(9, 30), _at(10, 30), "overlap")]
    assert _view(entry.device(None)) == [("a", _at(8), _at(10), None), ("b", _at(10), _at(11), None),
                                         ("c", _at(9, 30), _at(10, 30), "overlap")]


def test_day_groups_are_one_timeline_per_set_of_slots():
    prog = _prog("p1", {WED: [_s("a", "08:00", "09:00", [CLI]), _s("b", "10:00", "11:00", [COV, "light.x"])]},
                 entities=(CLI, COV, "light.x"))
    entry = OccurrenceCache().entry(prog["profiles"][0], DAY, AKL, _no_sun, "p1")
    groups = entry.groups([CLI, COV, "light.x"])
    assert [_view(g) for g in groups] == [[("a", _at(8), _at(9), None)], [("b", _at(10), _at(11), None)]]
    assert len(entry.groups([COV, "light.x"])) == 1  # they share the same slots
    assert [_view(g) for g in entry.groups([])] == []


def test_device_groups_around_covers_the_requested_days_in_the_zone():
    prog = _prog("p1", {1: [_s("tue", "08:00", "09:00", [CLI])], 2: [_s("wed", "08:00", "09:00", [CLI])],
                        3: [_s("thu", "08:00", "09:00", [CLI])]}, entities=(CLI, COV))
    profile = prog["profiles"][0]
    got = device_groups_around(prog, profile, _at(23, 30), AKL, _no_sun, (-1, 1))
    # per day, one timeline for each distinct set of slots: the climate's, then the (empty) cover's
    assert [[s["id"] for _o, s in g] for g in got] == [["tue"], [], ["thu"], []]


def _transition(programs, moment):
    return next_transition(programs, moment, AKL, _no_sun)


def test_next_transition_is_strictly_after_the_moment_at_the_exact_edges():
    prog = _prog("a", {WED: [_s("s", "08:00", "09:00"), _s("t", "10:00", "11:00")]})
    assert _transition([prog], _at(7, 59)) == _at(8)
    assert _transition([prog], _at(8)) == _at(9)
    assert _transition([prog], _at(9)) == _at(10)
    assert _transition([prog], _at(10, 59)) == _at(11)


def test_next_transition_sees_yesterdays_overnight_end_and_tomorrows_start():
    night = _prog("n", {1: [_s("night", "22:00", "06:00")]})  # Tuesday evening
    assert _transition([night], _at(3)) == _at(6)
    tomorrow = _prog("t", {3: [_s("thu", "09:00", "10:00")]})  # only on Thursday
    assert _transition([tomorrow], _at(20)) == _at(9, day=29)
    after = _prog("u", {4: [_s("fri", "09:00", "10:00")]})
    assert _transition([after], _at(20)) == _at(9, day=30)


def test_next_transition_skips_disabled_programs_and_continues_with_the_others():
    off = _prog("off", {WED: [_s("s", "08:00", "09:00")]}, enabled=False)
    on = _prog("on", {WED: [_s("s", "10:00", "11:00")]})
    assert _transition([off, on], _at(7)) == _at(10)
    default_on = _prog("d", {WED: [_s("s", "08:00", "09:00")]})
    del default_on["enabled"]  # a program without the flag is enabled
    assert _transition([default_on], _at(7)) == _at(8)


def test_next_transition_continues_after_an_ignored_slot_of_the_same_day():
    ignored = _s("tiny", "07:00", "07:03")  # too short: ignored, sorted first
    good = _s("good", "08:00", "09:00")
    assert _transition([_prog("a", {WED: [ignored, good]})], _at(6)) == _at(8)


def test_next_transition_reads_each_device_timeline_in_the_zone():
    prog = _prog("a", {WED: [_s("x", "08:00", "09:00", [CLI]), _s("y", "08:30", "10:00", [COV])]}, entities=(CLI, COV))
    assert _transition([prog], _at(8, 10)) == _at(8, 30)
    assert _transition([prog], _at(9, 30)) == _at(10)


def test_next_transition_takes_the_earliest_of_equal_edges_from_several_programs():
    a = _prog("a", {WED: [_s("s", "08:00", "09:00")]})
    b = _prog("b", {WED: [_s("s", "08:00", "09:30")]})
    assert _transition([a, b], _at(7)) == _at(8)
    assert _transition([b, a], _at(8, 30)) == _at(9)


# running_slot / resolve_entity


def _run(prog, entity, moment, cond=all_true, **kw):
    return resolve_entity(entity, [prog] if isinstance(prog, dict) else prog, resolve_label, moment, AKL, _no_sun, cond, **kw)


def test_running_slot_edges_are_start_inclusive_end_exclusive_in_the_zone():
    prog = _prog("a", {WED: [_s("s", "08:00", "09:00")]})
    assert _run(prog, CLI, _at(7, 59)).key == ("default", "a")
    inside = _run(prog, CLI, _at(8))
    assert inside.key == ("slot", "a", "s", _at(8).isoformat()) and (inside.start, inside.end) == (_at(8), _at(9))
    assert _run(prog, CLI, _at(8, 59)).in_slot
    assert _run(prog, CLI, _at(9)).key == ("default", "a")


def test_running_slot_only_considers_slots_that_apply_to_the_entity():
    prog = _prog("a", {WED: [_s("s", "08:00", "09:00", [COV])]}, entities=(CLI, COV))
    assert _run(prog, CLI, _at(8, 30)).key == ("default", "a")
    assert _run(prog, COV, _at(8, 30)).slot_id == "s"


def test_a_slot_of_another_device_neither_hides_nor_shortens_this_devices_slot():
    prog = _prog("a", {WED: [_s("x", "08:00", "10:00", [COV]), _s("y", "09:00", "11:00", [CLI])]}, entities=(CLI, COV))
    seen = _run(prog, CLI, _at(9, 30))
    assert (seen.slot_id, seen.start, seen.end) == ("y", _at(9), _at(11))
    assert _run(prog, COV, _at(9, 30)).slot_id == "x"


def test_conditions_are_passed_as_lists_even_when_the_keys_are_missing():
    received = []

    def cond(conditions):
        received.append(conditions)
        return True

    slot = _s("s", "08:00", "09:00")
    del slot["conditions"]
    prog = _prog("a", {WED: [slot]})
    del prog["conditions"]
    assert _run(prog, CLI, _at(8, 30), cond=cond).in_slot
    assert received == [[], []]  # the program's, then the slot's


def test_running_slot_uses_the_cache_it_is_given_and_works_without():
    prog = _prog("a", {WED: [_s("s", "08:00", "09:00")]})
    cache = OccurrenceCache()
    got = running_slot(prog, prog["profiles"][0], CLI, _at(8, 30), AKL, _no_sun, all_true, resolve_label, cache)
    assert got[1]["id"] == "s" and len(cache._days) == 3
    got = running_slot(prog, prog["profiles"][0], CLI, _at(8, 30), AKL, _no_sun, all_true, resolve_label)
    assert got[1]["id"] == "s"


def test_programs_with_equal_priority_order_by_creation_and_a_missing_date_comes_first():
    dated = _prog("dated", {}, priority=5, created_at="2026-01-01T00:00:00+00:00")
    undated = _prog("undated", {}, priority=5)
    assert _run([dated, undated], CLI, _at(12)).program_id == "undated"
    assert _run([undated, dated], CLI, _at(12)).program_id == "undated"
    late = _prog("late", {}, priority=5, created_at="2027-01-01T00:00:00+00:00")
    assert _run([late, dated], CLI, _at(12)).program_id == "dated"


def test_a_program_whose_conditions_fail_is_skipped_and_the_next_one_may_win():
    blocked = _prog("blocked", {WED: [_s("b", "08:00", "10:00")]}, priority=1, conditions=[{"entity_id": "x"}])
    open_ = _prog("open", {WED: [_s("o", "08:00", "10:00")]}, priority=2)
    seg = _run([blocked, open_], CLI, _at(9), cond=lambda c: not c)
    assert (seg.program_id, seg.slot_id) == ("open", "o")


# -- third mutation run: remaining gaps ---------------------------------------------------------------------


def test_random_delay_of_the_end_is_drawn_apart_from_the_start():
    """The edge name is part of the hash: start and end of a slot draw independently, and stay pinned."""
    spec = {"id": "r", "start": {"time": "08:00", "random_minutes": 240}, "end": {"time": "20:00", "random_minutes": 240}}
    occ = occurrence(spec, DAY, AKL, no_sun, identity=("p", "m"))
    assert occ.start == _utc(DAY, 8) + timedelta(minutes=128)
    assert occ.end == _utc(DAY, 20) + timedelta(minutes=173)


def _sunny(event, day):
    return datetime(day.year, day.month, day.day, 6, 30, tzinfo=AKL).astimezone(UTC)


def _solar_program():
    solar = {"id": "sun", "start": {"sun": "sunrise"}, "end": {"time": "10:00"}, "label": "comfort", "conditions": []}
    return _prog("a", {i: [solar] for i in range(7)})


def test_the_sun_provider_reaches_every_layer_of_the_resolver():
    prog = _solar_program()
    profile = prog["profiles"][0]
    expected = [("sun", _at(6, 30), _at(10), None)]
    assert _view(occurrences_around(profile, _at(8), AKL, _sunny, days=(0,))) == expected
    assert _view(occurrences_around(profile, _at(8), AKL, _sunny, days=(0,), entity_id=CLI)) == expected
    cache = OccurrenceCache()
    assert _view(occurrences_around(profile, _at(8), AKL, _sunny, days=(0,), cache=cache, entity_id=CLI)) == expected
    assert _view(cache.day(profile, DAY, AKL, _sunny, "a", CLI)) == expected
    assert [_view(g) for g in device_groups_around(prog, profile, _at(8), AKL, _sunny, (0,))] == [expected]
    found = running_slot(prog, profile, CLI, _at(8), AKL, _sunny, all_true, resolve_label)
    assert found[0].start == _at(6, 30)
    seg = resolve_entity(CLI, [prog], resolve_label, _at(8), AKL, _sunny, all_true)
    assert seg.in_slot and seg.start == _at(6, 30)
    assert next_transition([prog], _at(5), AKL, _sunny) == _at(6, 30)


def test_next_transition_and_groups_use_the_day_of_the_zone_not_the_one_of_the_machine():
    # 05:00 on Thursday in Auckland is still Wednesday in Europe and in UTC
    prog = _prog("a", {3: [_s("thu", "09:00", "10:00", [CLI])], 2: [_s("wed", "09:00", "10:00", [CLI])]},
                 entities=(CLI, COV))
    moment = _at(5, day=29)
    assert next_transition([prog], moment, AKL, _no_sun) == _at(9, day=29)
    got = device_groups_around(prog, prog["profiles"][0], moment, AKL, _no_sun, (0,))
    assert [[s["id"] for _o, s in g] for g in got] == [["thu"], []]


def test_paused_until_errors_are_named():
    for bad in ("not a date", "2026-12-01T08:00:00", 5):
        assert _error_of(v._utc_datetime, bad) == "invalid_paused_until", bad
        with pytest.raises(vol.Invalid):
            v.PROGRAM({**_program(), "paused_until": bad})
    naive = datetime(2026, 12, 1, 8)
    with pytest.raises(vol.Invalid) as exc:
        v._utc_datetime(naive)
    assert exc.value.msg == "invalid_paused_until"
    aware = datetime(2026, 12, 1, 9, tzinfo=ZoneInfo("Europe/Brussels"))
    assert v._utc_datetime(aware) == "2026-12-01T08:00:00+00:00"  # a YAML date-time arrives as a datetime


def test_chart_sources_must_be_unique_and_come_back_with_their_defaults():
    one = {"entity_id": "sensor.a", "kind": "numeric"}
    assert v._chart_sources([one, {"entity_id": "sensor.b", "kind": "states", "states": ["on"]}]) == [
        {"entity_id": "sensor.a", "kind": "numeric", "states": []},
        {"entity_id": "sensor.b", "kind": "states", "states": ["on"]},
    ]
    assert _error_of(v._chart_sources, [one, {**one, "kind": "states"}]) == "duplicate_chart_source"
    assert _error_of(v._chart_sources, "sensor.a") != "duplicate_chart_source"


def test_scoped_overlap_needs_a_real_intersection_for_the_same_device():
    ids = [CLIMATE]
    v._check_week_overlaps_scoped(_week_of(_listed("a", "08:00", "09:00", [CLIMATE]),
                                           _listed("b", "09:00", "10:00", [CLIMATE])), ids)
    assert _error_of(v._check_week_overlaps_scoped,
                     _week_of(_listed("a", "08:00", "09:00", [CLIMATE]), _listed("b", "08:59", "10:00", [CLIMATE])),
                     ids) == f"overlapping_slots:{CLIMATE}"


def test_scoped_delayed_windows_that_only_touch_do_not_conflict():
    delayed = _listed("a", "08:00", "09:00", [CLIMATE])
    delayed["end"]["random_minutes"] = 30  # reserved until 09:30
    ids = [CLIMATE]
    v._check_week_overlaps_scoped(_week_of(delayed, _listed("b", "09:30", "10:00", [CLIMATE])), ids)
    assert _error_of(v._check_week_overlaps_scoped, _week_of(delayed, _listed("b", "09:29", "10:00", [CLIMATE])),
                     ids) == f"overlapping_slots:{CLIMATE}"
