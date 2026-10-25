"""Resolution of the winning program per entity (S9, S10, S11, S12, Q-J)."""

from datetime import datetime, UTC
from zoneinfo import ZoneInfo

from custom_components.weekly_planner.resolver import next_transition, resolve_entity

TZ = ZoneInfo("Europe/Brussels")
E = "climate.office"
MODES = {
    "comfort": {"id": "comfort", "type": "climate", "value": {"kind": "preset", "preset": "comfort"}},
    "eco": {"id": "eco", "type": "climate", "value": {"kind": "preset", "preset": "eco"},
            "exceptions": {"climate.bath": {"kind": "temperature", "temperature": 18}}},
}


def no_sun(event, day):
    return None


def all_true(conditions):
    return True


def program(pid, priority, slots, default_mode="eco", enabled=True, conditions=None, entities=(E,)):
    week = [list(slots) for _ in range(7)]
    return {
        "id": pid,
        "priority": priority,
        "enabled": enabled,
        "conditions": conditions or [],
        "entities": [{"entity_id": e, "default": {"kind": "mode", "value": default_mode}} for e in entities],
        "profiles": [{"id": "p", "name": "Base", "days": week}],
    }


def slot(sid, start, end, mode="comfort", conditions=None):
    return {"id": sid, "start": {"time": start}, "end": {"time": end},
            "actions": {"by_type": {"climate": mode}}, "conditions": conditions or []}


def local(h, m=0):  # Wednesday 2026-10-28
    return datetime(2026, 10, 28, h, m, tzinfo=TZ).astimezone(UTC)


def resolve(programs, h, m=0, **kw):
    return resolve_entity(E, programs, MODES, local(h, m), TZ, no_sun, kw.pop("cond", all_true), **kw)


def test_inside_and_outside_slot():
    progs = [program("a", 1, [slot("s1", "08:00", "12:00")])]
    inside = resolve(progs, 9)
    assert inside.in_slot and inside.setpoint == {"kind": "preset", "preset": "comfort"}
    outside = resolve(progs, 13)
    assert outside.key == ("default", "a") and outside.setpoint["preset"] == "eco"


def test_mode_exception_per_entity():
    progs = [program("a", 1, [slot("s1", "08:00", "12:00", mode="eco")], entities=("climate.bath",))]
    seg = resolve_entity("climate.bath", progs, MODES, local(9), TZ, no_sun, all_true)
    assert seg.setpoint == {"kind": "temperature", "temperature": 18}


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
