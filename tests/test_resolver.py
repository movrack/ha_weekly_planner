"""Resolution of the winning program per entity (S9, S10, S11, S12, Q-J)."""

from copy import deepcopy
from datetime import UTC, datetime
from zoneinfo import ZoneInfo

import pytest

from custom_components.weekly_planner.actions import resolve_action
from custom_components.weekly_planner.const import DEFAULT_PRIORITY
from custom_components.weekly_planner.modes import EMPTY_PROFILE, NO_PROFILE
from custom_components.weekly_planner.resolver import (
    OccurrenceCache,
    active_profile,
    device_groups_around,
    next_transition,
    occurrences_around,
    resolve_entity,
    running_slot,
)
from custom_components.weekly_planner.timeline import place_day

from .helpers import AKL, WEDNESDAY, no_sun

TZ = ZoneInfo("Europe/Brussels")
E = "climate.office"
LABELS = {
    "comfort": {"id": "comfort", "action": {"kind": "service", "service": "climate.set_preset_mode", "data": {"preset_mode": "comfort"}}},
    "eco": {"id": "eco", "action": {"kind": "service", "service": "climate.set_preset_mode", "data": {"preset_mode": "eco"}}},
}


def all_true(conditions):
    return True


def program(pid, priority, slots, default_mode="eco", enabled=True, conditions=None, entities=(E,), overrides=None):
    week = [list(slots) for _ in range(7)]
    return {
        "id": pid,
        "priority": priority,
        "enabled": enabled,
        "conditions": conditions or [],
        "entities": [{"entity_id": e, "default_label": default_mode, "label_overrides": (overrides or {}).get(e, {})}
                     for e in entities],
        "profiles": [{"id": "p", "name": "Base", "days": week}],
    }


def slot(sid, start, end, mode="comfort", conditions=None):
    return {"id": sid, "start": {"time": start}, "end": {"time": end}, "label": mode, "conditions": conditions or []}


def resolve_label(program, entity_id, label_id):
    return resolve_action(program, entity_id, label_id, LABELS)


def local(h, m=0):  # Wednesday 2026-10-28
    return datetime(2026, 10, 28, h, m, tzinfo=TZ).astimezone(UTC)


def resolve(programs, h, m=0, **kw):
    return resolve_entity(E, programs, resolve_label, local(h, m), TZ, no_sun, kw.pop("cond", all_true), **kw)


def test_inside_and_outside_slot():
    progs = [program("a", 1, [slot("s1", "08:00", "12:00")])]
    inside = resolve(progs, 9)
    assert inside.in_slot and inside.action["data"] == {"preset_mode": "comfort"}
    assert (inside.program_id, inside.slot_id, inside.label) == ("a", "s1", "comfort")
    assert inside.start == local(8) and inside.end == local(12)
    outside = resolve(progs, 13)
    assert outside.key == ("default", "a") and outside.action["data"]["preset_mode"] == "eco"
    assert (outside.program_id, outside.slot_id, outside.label) == ("a", None, "eco")


def test_label_override_per_entity():
    own = {"kind": "service", "service": "climate.set_temperature", "data": {"temperature": 18}}
    progs = [program("a", 1, [slot("s1", "08:00", "12:00", mode="eco")], entities=("climate.bath",),
                     overrides={"climate.bath": {"eco": own}})]
    seg = resolve_entity("climate.bath", progs, resolve_label, local(9), TZ, no_sun, all_true)
    assert seg.action == own


def test_priority_and_hand_back():  # S9
    low = program("low", 2, [slot("l", "08:00", "20:00", mode="comfort")])
    high = program("high", 1, [slot("h", "10:00", "12:00", mode="eco")])
    assert resolve([low, high], 11).program_id == "high"
    back = resolve([low, high], 13)
    assert back.program_id == "low" and back.in_slot


def test_contiguous_slots_are_distinct_segments():  # S39
    progs = [program("a", 1, [slot("s1", "06:00", "08:00"), slot("s2", "08:00", "10:00")])]
    assert resolve(progs, 7).key != resolve(progs, 9).key


def test_program_condition():  # S10
    progs = [program("a", 1, [slot("s1", "08:00", "12:00")], conditions=[{"entity_id": "x"}])]
    seg = resolve(progs, 9, cond=lambda c: not c)
    assert seg.key == ("default", "a")


def test_slot_condition():  # S11
    progs = [program("a", 1, [slot("s1", "08:00", "12:00", conditions=[{"entity_id": "x"}])])]
    assert not resolve(progs, 9, cond=lambda c: not c).in_slot
    assert resolve(progs, 9).in_slot


def test_vacation_frees_entities():  # S12
    progs = [program("a", 1, [slot("s1", "08:00", "12:00")])]
    assert resolve(progs, 9, vacation=True).key == ("free",)


def test_disabled_program_frees_its_entities():  # Q-J
    off = program("off", 1, [], enabled=False)
    other = program("other", 2, [slot("s", "08:00", "10:00")], default_mode="comfort")
    seg = resolve([off, other], 11)
    assert seg.key == ("default", "other")


def test_next_transition_crosses_midnight():
    progs = [program("a", 1, [slot("night", "22:00", "06:00")])]
    nxt = next_transition(progs, local(23), TZ, no_sun)
    assert nxt == datetime(2026, 10, 29, 6, 0, tzinfo=TZ).astimezone(UTC)


def test_allowed_services_restrict_labels():
    labels = {
        **LABELS,
        "temp": {"id": "temp", "action": {"kind": "service", "service": "climate.set_temperature", "data": {"temperature": 19}}},
        "scene": {"id": "scene", "action": {"kind": "scene", "scene": "scene.soir"}},
    }
    prog = program("a", 1, [])
    prog["entities"][0]["allowed_services"] = ["climate.set_temperature"]
    assert resolve_action(prog, E, "temp", labels)["data"] == {"temperature": 19}
    assert resolve_action(prog, E, "eco", labels) is None  # preset service not allowed
    assert resolve_action(prog, E, "scene", labels) is not None  # scenes stay allowed
    prog["entities"][0]["allowed_services"] = []
    assert resolve_action(prog, E, "eco", labels) is not None  # empty = all
    prog["entities"][0]["allowed_services"] = ["climate.set_temperature"]
    prog["entities"][0]["label_overrides"] = {"temp": {"kind": "service", "service": "climate.set_hvac_mode", "data": {}}}
    assert resolve_action(prog, E, "temp", labels) is None  # an override is checked too


def test_explicit_empty_service_selection_skips_services_but_keeps_scenes():
    prog = program("a", 1, [])
    entity = prog["entities"][0]
    # Old programs with an absent or empty list retain their actions.
    assert resolve_action(prog, E, "eco", LABELS) is not None
    entity.update(allowed_services=[], restrict_services=False)
    assert resolve_action(prog, E, "eco", LABELS) is not None
    entity["restrict_services"] = True
    assert resolve_action(prog, E, "eco", LABELS) is None
    scene = {"id": "scene", "action": {"kind": "scene", "scene": "scene.evening"}}
    assert resolve_action(prog, E, "scene", {"scene": scene}) == scene["action"]
    entity["allowed_services"] = ["climate.set_preset_mode"]
    assert resolve_action(prog, E, "eco", LABELS) is not None


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
# -- third mutation run: resolver -------------------------------------------------------------------------------


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
    expected = place_day([slot], WEDNESDAY, AKL, _no_sun, identity=("a", "p"))[0]
    got = occurrences_around(profile, _at(12), AKL, _no_sun, days=(0,), program_id="a", cache=cache)
    assert got[0][0] == expected
    other = occurrences_around(profile, _at(12), AKL, _no_sun, days=(0,), program_id="b", cache=cache)
    assert other[0][0] != expected
    assert place_day([slot], WEDNESDAY, AKL, _no_sun, identity=("", "p"))[0] != expected
    default = occurrences_around(profile, _at(12), AKL, _no_sun, days=(0,), cache=cache)
    assert default[0][0] == place_day([slot], WEDNESDAY, AKL, _no_sun, identity=("", "p"))[0]


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
    first = cache.day(profile, WEDNESDAY, AKL, _no_sun, "p1", CLI)
    assert _view(first) == [("a", _at(8), _at(10), None), ("b", _at(10), _at(11), None)]
    assert _view(cache.day(profile, WEDNESDAY, AKL, _no_sun, "p1", COV)) == _view(first)
    # an edited (replaced) profile never hits the stale day
    edited = deepcopy(profile)
    edited["days"][WED] = [_s("c", "12:00", "13:00")]
    assert _view(cache.day(edited, WEDNESDAY, AKL, _no_sun, "p1", CLI)) == [("c", _at(12), _at(13), None)]
    assert _view(cache.day(profile, WEDNESDAY, AKL, _no_sun, "p1", CLI)) == _view(first)
    # a different program id on the same profile object is a different day
    assert cache.entry(profile, WEDNESDAY, AKL, _no_sun, "p1") is cache.entry(profile, WEDNESDAY, AKL, _no_sun, "p1")
    assert cache.entry(profile, WEDNESDAY, AKL, _no_sun, "p1") is not cache.entry(profile, WEDNESDAY, AKL, _no_sun, "p2")


def test_day_device_without_lists_or_without_device_trims_every_slot_together():
    prog = _prog("p1", {WED: [_s("a", "08:00", "10:00"), _s("b", "09:00", "11:00")]}, entities=(CLI, COV))
    entry = OccurrenceCache().entry(prog["profiles"][0], WEDNESDAY, AKL, _no_sun, "p1")
    expected = [("a", _at(8), _at(10), None), ("b", _at(10), _at(11), None)]
    assert entry.lists is False
    assert _view(entry.device(CLI)) == expected
    assert _view(entry.device(None)) == expected
    assert [_view(g) for g in entry.groups([CLI, COV])] == [expected]


def test_day_device_with_lists_trims_per_device_and_none_means_all_slots():
    prog = _prog("p1", {WED: [_s("a", "08:00", "10:00", [CLI]), _s("b", "09:00", "11:00", [COV]),
                              _s("c", "09:30", "10:30", [CLI, COV])]}, entities=(CLI, COV))
    entry = OccurrenceCache().entry(prog["profiles"][0], WEDNESDAY, AKL, _no_sun, "p1")
    assert entry.lists is True
    assert _view(entry.device(CLI)) == [("a", _at(8), _at(10), None), ("c", _at(10), _at(10, 30), None)]
    assert _view(entry.device(COV)) == [("b", _at(9), _at(11), None), ("c", _at(9, 30), _at(10, 30), "overlap")]
    assert _view(entry.device(None)) == [("a", _at(8), _at(10), None), ("b", _at(10), _at(11), None),
                                         ("c", _at(9, 30), _at(10, 30), "overlap")]


def test_day_groups_are_one_timeline_per_set_of_slots():
    prog = _prog("p1", {WED: [_s("a", "08:00", "09:00", [CLI]), _s("b", "10:00", "11:00", [COV, "light.x"])]},
                 entities=(CLI, COV, "light.x"))
    entry = OccurrenceCache().entry(prog["profiles"][0], WEDNESDAY, AKL, _no_sun, "p1")
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


@pytest.mark.parametrize(
    ("moment", "expected"),
    [(_at(7, 59), _at(8)), (_at(8), _at(9)), (_at(9), _at(10)), (_at(10, 59), _at(11))],
    ids=["just before a start", "at a start", "at an end", "just before an end"],
)
def test_next_transition_is_strictly_after_the_moment_at_the_exact_edges(moment, expected):
    prog = _prog("a", {WED: [_s("s", "08:00", "09:00"), _s("t", "10:00", "11:00")]})
    assert _transition([prog], moment) == expected


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
    assert _view(cache.day(profile, WEDNESDAY, AKL, _sunny, "a", CLI)) == expected
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


def test_a_start_stop_slot_holds_no_state_between_its_two_events():
    """Issue #93: the device keeps the rest of the time; the engine sends the two settings as events."""
    car = program("car", 10, [{**slot("s", "08:00", "12:00"), "end_label": "eco"}])
    assert resolve([car], 9).key == ("default", "car")


def test_a_timed_pause_still_wakes_for_the_end_of_a_start_stop_slot_only():
    paused = program("car", 10, [{**slot("s", "08:00", "12:00"), "end_label": "eco"}, slot("d", "14:00", "15:00")],
                     enabled=False)
    assert next_transition([paused], local(7), TZ, no_sun) is None  # disabled: nothing at all
    paused["paused_until"] = "2026-10-30T00:00:00+00:00"
    assert next_transition([paused], local(7), TZ, no_sun) == local(12)
    assert next_transition([paused], local(12), TZ, no_sun) == datetime(2026, 10, 29, 12, tzinfo=TZ).astimezone(UTC)
