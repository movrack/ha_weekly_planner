"""Resolution of the winning program per entity (S9, S10, S11, S12, Q-J)."""

from datetime import datetime, UTC
from zoneinfo import ZoneInfo

from custom_components.weekly_planner.actions import resolve_action
from custom_components.weekly_planner.resolver import next_transition, resolve_entity

TZ = ZoneInfo("Europe/Brussels")
E = "climate.office"
LABELS = {
    "comfort": {"id": "comfort", "action": {"kind": "service", "service": "climate.set_preset_mode", "data": {"preset_mode": "comfort"}}},
    "eco": {"id": "eco", "action": {"kind": "service", "service": "climate.set_preset_mode", "data": {"preset_mode": "eco"}}},
}


def no_sun(event, day):
    return None


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
    outside = resolve(progs, 13)
    assert outside.key == ("default", "a") and outside.action["data"]["preset_mode"] == "eco"


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
