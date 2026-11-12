"""Mutation-testing survivors of resync.py: the pure rules of ``expected_state``, one test per behaviour.

Wednesday 2026-10-28, Europe/Brussels (UTC+1 after the DST change of 25 October).
"""

from __future__ import annotations

from datetime import UTC, datetime
from types import SimpleNamespace
from zoneinfo import ZoneInfo

from custom_components.weekly_planner import resync
from custom_components.weekly_planner.actions import resolve_action
from custom_components.weekly_planner.const import DEFAULT_PRIORITY
from custom_components.weekly_planner.resolver import OccurrenceCache
from custom_components.weekly_planner.resync import Decision, expected_state, settle_manual_change

TZ = ZoneInfo("Europe/Brussels")
E = "climate.office"
LABELS = {
    "comfort": {"id": "comfort", "action": {"kind": "service", "service": "climate.set_preset_mode", "data": {"preset_mode": "comfort"}}},
    "eco": {"id": "eco", "action": {"kind": "service", "service": "climate.set_preset_mode", "data": {"preset_mode": "eco"}}},
    "night": {"id": "night", "action": {"kind": "service", "service": "climate.set_preset_mode", "data": {"preset_mode": "night"}}},
}


def no_sun(_event, _day):
    return None


def yes(_conditions):
    return True


def local(h, m=0, day=28):
    return datetime(2026, 10, day, h, m, tzinfo=TZ).astimezone(UTC)


def slot(sid, start, end=None, label="comfort", **extra):
    item = {"id": sid, "start": {"time": start}, "label": label, **extra}
    if end:
        item["end"] = {"time": end}
    return item


def prog(pid, slots, *, priority=10, created="2026-01-01", default="eco", entities=(E,), week=None, **extra):
    days = week if week is not None else [list(slots) for _ in range(7)]
    item = {
        "id": pid, "priority": priority, "enabled": True, "conditions": [], "created_at": created,
        "entities": [{"entity_id": e, "default_label": default, "label_overrides": {}} for e in entities],
        "profiles": [{"id": "p", "name": "Base", "days": days}],
    }
    item.update(extra)
    return item


def resolve(program, entity_id, label_id):
    return resolve_action(program, entity_id, label_id, LABELS)


def decide(programs, now, **kwargs):
    kwargs.setdefault("sun", no_sun)
    kwargs.setdefault("conditions_ok", yes)
    tz = kwargs.pop("tz", TZ)
    return expected_state(E, programs, resolve, now, tz, kwargs.pop("sun"), kwargs.pop("conditions_ok"), **kwargs)


def label_of(decision):
    return decision.expected.action["data"]["preset_mode"]


# -- who is considered ------------------------------------------------------------------------


def test_vacation_is_only_skipped_when_asked():
    programs = [prog("a", [slot("s", "08:00")])]
    assert decide(programs, local(9), vacation=True) == Decision(reason="vacation")
    assert decide(programs, local(9)).expected is not None


def test_a_program_without_enabled_key_counts_as_enabled_and_off_or_paused_is_told_apart():
    plain = prog("a", [slot("s", "08:00")])
    del plain["enabled"]
    assert decide([plain], local(9)).expected.program_id == "a"
    assert decide([prog("a", [], enabled=False)], local(9)) == Decision(reason="off")
    assert decide([prog("a", [], enabled=False, paused_until="2026-11-01T00:00:00+00:00")], local(9)) == Decision(reason="paused")
    assert decide([prog("a", [], enabled=False, paused_until=None)], local(9)) == Decision(reason="off")


def test_priority_then_creation_date_decide_simultaneous_starts_and_missing_values_have_defaults():
    old = prog("old", [slot("s", "08:00", label="comfort")], priority=DEFAULT_PRIORITY)
    del old["created_at"]
    young = prog("young", [slot("s", "08:00", label="night")], created="2026-05-01")
    young["priority"] = DEFAULT_PRIORITY
    for order in ([old, young], [young, old]):
        assert decide(order, local(9)).expected.program_id == "old"
    no_priority = prog("none", [slot("s", "08:00", label="comfort")])
    del no_priority["priority"]
    other = prog("other", [slot("s", "08:00", label="night")], priority=DEFAULT_PRIORITY)
    assert decide([no_priority, other], local(9)).expected is not None
    urgent = prog("urgent", [slot("s", "08:00", label="comfort")], priority=1)
    late = prog("late", [slot("s", "08:00", label="night")], priority=2)
    assert decide([late, urgent], local(9)).expected.program_id == "urgent"


def test_the_last_fired_wins_among_equal_programs_and_among_one_shots_of_one_program():
    a = prog("a", [slot("s", "08:00", label="comfort")])
    b = prog("b", [slot("s", "08:00", label="night")], created="2026-01-01")
    assert decide([a, b], local(9)).expected.program_id == "b"
    twin = prog("t", [slot("first", "08:00", label="comfort"), slot("second", "08:00", label="night")])
    best = decide([twin], local(9)).expected
    assert (best.slot_id, label_of(Decision(expected=best))) == ("second", "night")


def test_a_running_slot_and_a_one_shot_of_an_equal_program_starting_together_pick_the_one_shot():
    running = prog("run", [slot("long", "08:00", "12:00", label="comfort")])
    shot = prog("shot", [slot("once", "08:00", label="night")])
    got = decide([running, shot], local(9)).expected
    assert (got.kind, got.program_id) == ("one_shot", "shot")


def test_a_running_slot_is_expected_with_its_ids_label_and_start():
    got = decide([prog("a", [slot("long", "08:00", "12:00", label="comfort")])], local(9)).expected
    assert (got.kind, got.program_id, got.slot_id, got.label, got.start) == ("slot", "a", "long", "comfort", local(8))
    assert got.action["data"] == {"preset_mode": "comfort"}


def test_a_one_shot_carries_its_slot_id_label_and_start():
    got = decide([prog("a", [slot("once", "08:00", label="night")])], local(9)).expected
    assert (got.kind, got.slot_id, got.label, got.start) == ("one_shot", "once", "night", local(8))


# -- the one-shot window ----------------------------------------------------------------------


def test_a_one_shot_starting_exactly_now_counts_and_one_exactly_24_hours_old_is_too_old():
    programs = [prog("a", [slot("once", "08:00", label="night")])]
    assert decide(programs, local(8)).expected.kind == "one_shot"
    assert decide(programs, local(7, 59)).expected.kind == "one_shot"  # yesterday's 08:00 is 23 h 59 old
    week = [[], [], [], [], [], [], []]
    week[2] = [slot("once", "08:00", label="night")]  # Wednesday only
    only_wed = [prog("a", [], week=week, default="eco")]
    assert decide(only_wed, local(8, 0, 29)).expected.kind == "default"  # a day later, exactly 24 h
    week_tue = [[], [], [], [], [], [], []]
    week_tue[1] = [slot("once", "08:00", label="night")]
    none = prog("a", [], week=week_tue, default=None)
    assert decide([none], local(8, 0, 28)) == Decision(reason="too_old")
    assert decide([none], local(7, 59, 28)).expected.kind == "one_shot"


def test_nothing_to_do_is_no_action_or_too_old():
    assert decide([prog("a", [], default=None)], local(9)) == Decision(reason="no_action")


# -- the default and where it starts --------------------------------------------------------------


def test_the_default_starts_when_the_last_schedule_ended_even_two_days_ago():
    week = [[slot("mon", "08:00", "09:00")], [], [], [], [], [], []]  # Monday only; now is Wednesday
    got = decide([prog("a", [], week=week)], local(10)).expected
    assert (got.kind, got.program_id, got.label, got.start) == ("default", "a", "eco", local(9, 0, 26))
    assert got.slot_id is None


def test_a_schedule_ending_exactly_now_starts_the_default_now_and_a_later_one_does_not_count():
    got = decide([prog("a", [slot("s", "07:00", "08:00")])], local(8)).expected
    assert (got.kind, got.start) == ("default", local(8))
    later = prog("a", [slot("s", "17:00", "18:00")], week=[[slot("s", "17:00", "18:00")] if i == 2 else [] for i in range(7)])
    got = decide([later], local(10)).expected
    assert (got.kind, got.start) == ("default", None)


def test_a_one_shot_at_the_exact_end_of_the_last_schedule_does_not_beat_the_default():
    p = prog("a", [slot("t", "07:00", "08:00"), slot("o", "08:00", label="night")])
    # at 08:30 the one-shot is running: it competes (it started after... exactly at the end: the default stays)
    got = decide([p], local(8, 30)).expected
    assert got.kind == "default"


def test_the_end_of_an_earlier_schedule_of_the_same_program_does_not_hide_a_later_one_shot():
    p = prog("a", [slot("t", "06:00", "07:00"), slot("o", "08:00", label="night")])
    got = decide([p], local(9)).expected
    assert (got.kind, got.slot_id) == ("one_shot", "o")


def test_a_slot_listed_after_a_future_one_is_still_read():
    p = prog("a", [slot("future", "17:00", label="night"), slot("past", "08:00", label="comfort")])
    assert decide([p], local(9)).expected.slot_id == "past"


def test_a_slot_whose_label_has_no_action_is_skipped_not_the_rest():
    p = prog("a", [slot("bad", "06:00", label="unknown"), slot("good", "07:00", label="night")])
    assert decide([p], local(9)).expected.slot_id == "good"


def test_conditions_of_the_program_and_of_the_slot_are_asked_and_skip_only_what_fails():
    asked = []

    def conditions(conds):
        asked.append(list(conds))
        return "no" not in conds

    blocked = prog("blocked", [slot("s", "08:00", label="night")], conditions=["no"], priority=1)
    fine = prog("fine", [slot("s", "07:00", label="comfort")], priority=2)
    assert decide([blocked, fine], local(9), conditions_ok=conditions).expected.program_id == "fine"
    shot = prog("a", [slot("a1", "08:00", label="night", conditions=["no"]), slot("a2", "07:00", label="comfort")])
    assert decide([shot], local(9), conditions_ok=conditions).expected.slot_id == "a2"
    assert ["no"] in asked


def test_a_program_or_slot_without_conditions_is_asked_with_an_empty_list():
    def strict(conds):
        assert conds == []
        return True

    bare = prog("a", [{"id": "s", "start": {"time": "08:00"}, "label": "night"}])
    del bare["conditions"]
    assert decide([bare], local(9), conditions_ok=strict).expected.slot_id == "s"


def test_a_one_shot_under_a_higher_priority_running_slot_is_skipped_but_an_equal_priority_one_is_not():
    top = prog("top", [slot("long", "07:00", "12:00", label="comfort")], priority=1)
    low = prog("low", [slot("once", "08:00", label="night")], priority=5)
    assert decide([top, low], local(9)).expected.program_id == "top"
    same = prog("same", [slot("once", "08:00", label="night")], priority=1, created="2026-02-01")
    assert decide([top, same], local(9)).expected.program_id == "same"


def test_a_slot_that_does_not_apply_to_the_device_is_ignored_and_one_that_does_is_kept():
    other = prog("a", [slot("o", "08:00", label="night", entities=["climate.other"])])
    assert decide([other], local(9)).expected.kind == "default"
    mine = prog("a", [slot("o", "08:00", label="night", entities=[E])])
    assert decide([mine], local(9)).expected.slot_id == "o"


def test_other_entities_programs_are_not_considered():
    other = prog("a", [slot("o", "08:00", label="night")], entities=("climate.other",))
    assert decide([other], local(9)) == Decision(reason="off")


def test_the_time_zone_and_the_sun_reach_the_placement():
    sunset = {"time": None}
    p = prog("a", [{"id": "s", "start": {"sun": "sunset"}, "label": "night"}])

    def sun(event, day):
        return datetime(day.year, day.month, day.day, 16, 0, tzinfo=UTC) if event == "sunset" else None

    got = decide([p], local(18), sun=sun).expected  # 17:00 local is 16:00 UTC
    assert (got.kind, got.start) == ("one_shot", datetime(2026, 10, 28, 16, 0, tzinfo=UTC))
    assert sunset
    fixed = decide([prog("a", [slot("s", "08:00", "12:00")])], local(9)).expected
    assert fixed.start == datetime(2026, 10, 28, 7, 0, tzinfo=UTC)  # 08:00 local, not 08:00 UTC


def test_an_own_cache_is_used_and_filled():
    cache = OccurrenceCache()
    decide([prog("a", [slot("s", "08:00")])], local(9), cache=cache)
    assert cache._days


def test_a_profile_chosen_by_the_active_profiles_is_the_one_read():
    p = prog("a", [slot("base", "08:00", label="night")])
    p["profiles"].append({"id": "alt", "name": "Alt", "days": [[slot("alt", "08:30", label="comfort")] for _ in range(7)]})
    assert decide([p], local(9), active_profiles={"a": "alt"}).expected.slot_id == "alt"
    assert decide([p], local(9)).expected.slot_id == "base"


def test_the_holiday_reaches_the_placement():
    from custom_components.weekly_planner.resolver import Holiday

    p = prog("a", [slot("normal", "08:00", label="night")])
    p["profiles"][0]["holiday"] = {"day": [slot("off", "08:30", label="comfort")]}
    assert decide([p], local(9), holiday=Holiday(day=datetime(2026, 10, 28).date())).expected.slot_id == "off"
    assert decide([p], local(9)).expected.slot_id == "normal"
    timed = prog("a", [slot("normal", "08:00", "12:00", label="night")])
    timed["profiles"][0]["holiday"] = {"day": [slot("off", "08:30", "12:00", label="comfort")]}
    assert decide([timed], local(9), holiday=Holiday(day=datetime(2026, 10, 28).date())).expected.slot_id == "off"
    assert decide([timed], local(9)).expected.slot_id == "normal"


# -- the history check --------------------------------------------------------------------------


class _History:
    def __init__(self):
        self.asked = []

    async def async_changed_by_person(self, entity_id, since, until):
        self.asked.append(entity_id)
        return True


async def test_a_one_shot_is_checked_against_the_device_the_action_targets():
    history = _History()
    got = decide([prog("a", [slot("o", "08:00", label="night")])], local(9)).expected
    got.action["target_entity_id"] = "climate.target"
    result = await settle_manual_change(Decision(expected=got), E, local(9), history)
    assert result == Decision(reason="manual_change") and history.asked == ["climate.target"]
    got.action.pop("target_entity_id")
    await settle_manual_change(Decision(expected=got), E, local(9), history)
    assert history.asked[-1] == E


# -- the recorder query ---------------------------------------------------------------------------


def test_the_recorder_query_is_read_only_inclusive_at_the_end_and_ignores_unavailable(monkeypatch):
    import homeassistant.helpers.recorder as recorder_helpers

    seen = {}

    class Session:
        def execute(self, statement):
            seen["sql"] = str(statement.compile(compile_kwargs={"literal_binds": False}))
            return SimpleNamespace(all=lambda: seen["rows"])

    class Scope:
        def __init__(self, **kwargs):
            seen["kwargs"] = kwargs

        def __enter__(self):
            return Session()

        def __exit__(self, *_):
            return False

    monkeypatch.setattr(recorder_helpers, "session_scope", Scope)
    changes = resync.RecorderManualChanges(SimpleNamespace(config=SimpleNamespace(components={"recorder"})))
    seen["rows"] = [("unavailable", b"u"), ("unknown", b"u"), ("on", None)]
    assert changes._query(E, 1.0, 2.0) is False
    assert seen["kwargs"]["read_only"] is True and seen["kwargs"]["hass"] is changes._hass
    sql = " ".join(seen["sql"].split())
    assert "states.last_updated_ts > :last_updated_ts_1" in sql
    assert "states.last_updated_ts <= :last_updated_ts_2" in sql
    assert "ORDER BY states.last_updated_ts" in sql
    assert "JOIN states_meta ON states.metadata_id = states_meta.metadata_id" in sql
    assert sql.startswith("SELECT states.state, states.context_user_id_bin")
    seen["rows"] = [("on", b"u")]
    assert changes._query(E, 1.0, 2.0) is True
    seen["rows"] = [("unknown", b"u"), ("unavailable", b"u")]
    assert changes._query(E, 1.0, 2.0) is False
    seen["rows"] = [("on", None)]
    assert changes._query(E, 1.0, 2.0) is False


def test_a_zone_other_than_the_system_one_places_the_slots_in_that_zone():
    new_york = ZoneInfo("America/New_York")
    p = prog("a", [slot("s", "08:00", "12:00")], week=None)
    now = datetime(2026, 10, 28, 15, 0, tzinfo=UTC)  # 11:00 in New York (EDT)
    got = decide([p], now, tz=new_york).expected
    assert got.start == datetime(2026, 10, 28, 12, 0, tzinfo=UTC)
    nothing_before = decide([prog("a", [slot("s", "08:00", "12:00")])], datetime(2026, 10, 28, 10, 0, tzinfo=UTC), tz=new_york).expected
    assert nothing_before.kind == "default"


def test_a_running_slot_without_action_gives_no_action():
    p = prog("a", [slot("long", "08:00", "12:00", label="unknown")], default=None)
    assert decide([p], local(9)) == Decision(reason="no_action")


def test_the_program_and_device_identity_reach_the_placement():
    from custom_components.weekly_planner.resolver import occurrences_around

    start = {"time": "08:00", "random_minutes": 90}
    shot = {"id": "s", "start": start, "label": "night"}
    p = prog("alpha", [shot])
    p["profiles"][0]["days"] = [[shot] for _ in range(7)]
    want = next(o.start for o, _ in occurrences_around(p["profiles"][0], local(23), TZ, no_sun, days=(0,), program_id="alpha"))
    got = decide([p], local(23)).expected
    assert got.start == want
    twin = prog("beta", [shot])
    other = next(o.start for o, _ in occurrences_around(twin["profiles"][0], local(23), TZ, no_sun, days=(0,), program_id="beta"))
    assert decide([twin], local(23)).expected.start == other


def test_a_device_timeline_is_not_trimmed_by_slots_of_other_devices():
    a = slot("mine", "08:00", "12:00", entities=[E], label="comfort")
    b = slot("theirs", "09:00", "10:00", entities=["climate.other"], label="night")
    p = prog("a", [a, b], entities=(E, "climate.other"))
    got = decide([p], local(13)).expected
    assert (got.kind, got.start) == ("default", local(12))


def test_an_ignored_occurrence_does_not_hide_the_ones_after_it():
    # 2026-03-29: 02:30 does not exist in Europe/Brussels (clocks jump from 02:00 to 03:00)
    shots = [slot("gap", "02:30", label="night"), slot("late", "08:00", label="comfort")]
    p = prog("a", shots)
    got = decide([p], datetime(2026, 3, 29, 12, 0, tzinfo=TZ).astimezone(UTC)).expected
    assert got.slot_id == "late"
