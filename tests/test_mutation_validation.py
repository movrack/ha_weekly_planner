"""Mutation-testing survivors of validation.py: exact error codes of the day-off rules, device-scoped overlaps."""

from __future__ import annotations

from types import SimpleNamespace

import pytest
import voluptuous as vol

from custom_components.weekly_planner.validation import (
    ProgramError,
    _weekday,
    check_holiday_config,
    check_holiday_loop,
    check_program,
    driven_entities,
)

from .helpers import CLIMATE, COVER, act, label, labels, program, slot

LABELS = {lab["id"]: lab for lab in labels()}


def code(call):
    with pytest.raises(Exception) as caught:  # noqa: PT011 - the type is asserted by the caller
        call()
    return caught.value


def test_the_weekday_of_a_copied_day_off_is_an_integer_from_0_to_6_with_its_own_code():
    assert [_weekday(n) for n in (0, 6)] == [0, 6]
    for bad in (7, -1, True, "1", 1.0):
        error = code(lambda bad=bad: _weekday(bad))
        assert isinstance(error, vol.Invalid) and error.msg == "invalid_holiday_copy"


def test_each_refusal_of_the_day_off_config_has_its_exact_code():
    assert str(code(lambda: check_holiday_config("light.x", False))) == "invalid_holiday_entity_domain"
    assert str(code(lambda: check_holiday_config("switch.boiler", False, driven={"switch.boiler"}))) == "driven_holiday_entity"
    assert str(code(lambda: check_holiday_config(None, "yes"))) == "invalid_holiday_invert"
    assert str(code(lambda: check_holiday_config("switch.x", 1))) == "invalid_holiday_invert"
    assert str(code(lambda: check_holiday_loop(CLIMATE, [program()], labels()))) == "driven_holiday_entity"
    check_holiday_loop(None, [program()], labels())
    check_holiday_loop("switch.free", [program()], labels())


def test_an_entity_of_this_integration_is_refused_with_its_exact_code():
    entry = SimpleNamespace(platform="weekly_planner")
    registry = SimpleNamespace(async_get=lambda _eid: entry)
    import homeassistant.helpers.entity_registry as er
    original = er.async_get
    er.async_get = lambda _hass: registry
    try:
        assert str(code(lambda: check_holiday_config("switch.own", False, object()))) == "circular_holiday_entity"
    finally:
        er.async_get = original


def test_an_entity_without_a_dot_or_with_a_bad_domain_is_refused_whatever_the_dots():
    assert check_holiday_config("calendar.work", False)["holiday_entity"] == "calendar.work"
    assert str(code(lambda: check_holiday_config("sensor.x", False))) == "invalid_holiday_entity_domain"


def test_driven_entities_reads_missing_overrides_scene_members_and_keeps_the_devices():
    bare = program()
    del bare["entities"][0]["label_overrides"]
    labs = [label("sc", {"kind": "scene", "scene": "scene.evening"}), label("noscene", {"kind": "scene"})]
    states = {"scene.evening": SimpleNamespace(attributes={"entity_id": ["light.a", 5, "light.b"]})}

    class States:
        def get(self, eid):
            assert isinstance(eid, str)
            return states.get(eid)

    hass = SimpleNamespace(states=States())
    assert driven_entities([bare], labs, hass) == {CLIMATE, "light.a", "light.b"}
    assert driven_entities([bare], labs) == {CLIMATE}
    odd = {"scene.evening": SimpleNamespace(attributes={"entity_id": "light.a"})}
    states.clear(); states.update(odd)
    assert driven_entities([bare], labs, hass) == {CLIMATE}


def test_slots_on_a_day_off_with_device_lists_may_touch_but_not_overlap():
    entities = [{"entity_id": CLIMATE, "default_label": None, "label_overrides": {}},
                {"entity_id": COVER, "default_label": None, "label_overrides": {}}]
    day = [{**slot("a", "08:00", "09:00", "t21"), "entities": [CLIMATE]},
           {**slot("b", "09:00", "10:00", "t19"), "entities": [CLIMATE]}]
    prog = program(entities=entities)
    prog["profiles"][0]["holiday"] = {"day": day}
    check_program(prog, LABELS)
    day.append({**slot("c", "09:59", "11:00", "t25"), "entities": [CLIMATE]})
    prog["profiles"][0]["holiday"] = {"day": day}
    assert str(code(lambda: check_program(prog, LABELS))) == f"overlapping_slots:{CLIMATE}"
    # sorted by start: the overlap is found whatever the order of the list
    prog["profiles"][0]["holiday"] = {"day": list(reversed(day))}
    assert str(code(lambda: check_program(prog, LABELS))) == f"overlapping_slots:{CLIMATE}"


def test_a_slot_swallowing_a_later_one_on_the_same_device_is_refused_in_the_week_and_on_a_day_off():
    entities = [{"entity_id": CLIMATE, "default_label": None, "label_overrides": {}},
                {"entity_id": COVER, "default_label": None, "label_overrides": {}}]
    long_first = [{**slot("a", "08:00", "12:00", "t21"), "entities": [CLIMATE]},
                  {**slot("b", "09:00", "10:00", "t19"), "entities": [COVER]},
                  {**slot("c", "10:30", "11:00", "t25"), "entities": [CLIMATE]}]
    prog = program(entities=entities, slots=long_first)
    assert str(code(lambda: check_program(prog, LABELS))) == f"overlapping_slots:{CLIMATE}"
    own = program(entities=entities, slots=[])
    own["profiles"][0]["holiday"] = {"day": long_first}
    assert str(code(lambda: check_program(own, LABELS))) == f"overlapping_slots:{CLIMATE}"
    # three slots: only the third conflicts with the first, the second is on another device
    own["profiles"][0]["holiday"] = {"day": [long_first[0], long_first[1]]}
    check_program(own, LABELS)


def test_a_fixed_slot_and_a_slot_with_a_random_delay_that_touch_only_at_their_edge_are_accepted():
    entities = [{"entity_id": CLIMATE, "default_label": None, "label_overrides": {}},
                {"entity_id": COVER, "default_label": None, "label_overrides": {}}]
    first = {**slot("a", "07:00", "08:00", "t21"), "entities": [CLIMATE]}
    second = {**slot("b", "08:00", "09:00", "t19"), "entities": [CLIMATE]}
    second["start"] = {"time": "08:00", "random_minutes": 0}
    check_program(program(entities=entities, slots=[first, second]), LABELS)
