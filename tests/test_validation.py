"""Rules, boundaries and error codes of ``validation.py`` (pinned after mutation testing)."""

from __future__ import annotations

from copy import deepcopy
from types import SimpleNamespace

import pytest
import voluptuous as vol

from custom_components.weekly_planner import validation as v
from custom_components.weekly_planner.const import DEFAULT_PRIORITY

from .helpers import CLIMATE, labels, program, slot


def _lbl():
    return {label["id"]: label for label in labels()}


def _error(func, *args, **kw) -> str:
    with pytest.raises(vol.Invalid) as exc:
        func(*args, **kw)
    return exc.value.msg


def _check(prog, **kw):
    return v.check_program(deepcopy(prog), _lbl(), **kw)


class _Services:
    def __init__(self, *known):
        self.known = known

    def has_service(self, domain, name):
        return f"{domain}.{name}" in self.known


def _hass(*known):
    return SimpleNamespace(services=_Services(*known))


# -- times ------------------------------------------------------------------------


@pytest.mark.parametrize("value", [0, 1, 240])
def test_random_minutes_bounds_accepted(value):
    assert v._random_minutes(value) == value


@pytest.mark.parametrize("value", [-1, 241, True, 5.0, "5", None])
def test_random_minutes_rejected(value):
    assert _error(v._random_minutes, value) == "invalid_random_minutes"


def test_clock_returns_the_text_and_rejects_garbage():
    assert v._clock("08:30") == "08:30"
    with pytest.raises(Exception):
        v._clock("25:00")


def test_fixed_time_spec():
    assert v.TIME_SPEC({"time": "08:00", "random_minutes": 10}) == {"time": "08:00", "random_minutes": 10}
    for bad in ({}, {"time": "08:00", "x": 1}, {"time": "08:00", "random_minutes": 241}, "08:00"):
        with pytest.raises(vol.Invalid):
            v.TIME_SPEC(bad)


def test_solar_time_defaults_and_bounds():
    assert v.TIME_SPEC({"sun": "sunset"}) == {"sun": "sunset", "offset": 0}
    for offset in (-240, 240):
        assert v.TIME_SPEC({"sun": "sunrise", "offset": offset})["offset"] == offset
    for offset in (-241, 241, "5", 1.5):
        with pytest.raises(vol.Invalid):
            v.TIME_SPEC({"sun": "sunrise", "offset": offset})
    with pytest.raises(vol.Invalid):
        v.TIME_SPEC({"sun": "noon"})
    assert v.TIME_SPEC({"sun": "sunset", "random_minutes": 240})["random_minutes"] == 240
    with pytest.raises(vol.Invalid):
        v.TIME_SPEC({"sun": "sunset", "random_minutes": 241})


def test_solar_limits_must_be_ordered_but_may_be_equal():
    ok = {"sun": "sunset", "earliest": "17:00", "latest": "17:00"}
    assert v.TIME_SPEC(ok)["earliest"] == "17:00"
    assert _error(v.TIME_SPEC, {"sun": "sunset", "earliest": "18:00", "latest": "17:00"}) == "earliest_after_latest"
    # one limit alone, or an unset one, is never compared
    assert v.TIME_SPEC({"sun": "sunset", "earliest": "23:00"})["earliest"] == "23:00"
    assert v.TIME_SPEC({"sun": "sunset", "latest": "01:00"})["latest"] == "01:00"


# -- action shapes ----------------------------------------------------------------


def test_service_data_must_be_a_dict_without_targets():
    assert v._service_data({"a": 1}) == {"a": 1}
    assert _error(v._service_data, []) == "invalid_service_data"
    for key in v.TARGET_KEYS:
        assert _error(v._service_data, {key: "x"}) == "service_data_target"
    assert v.TARGET_KEYS == ("entity_id", "device_id", "area_id", "floor_id", "label_id")


def test_service_sources_rules():
    source = {"entity_id": "sensor.t", "type": "number"}
    assert v._service_sources({"temperature": source}) == {"temperature": source}
    assert _error(v._service_sources, []) == "invalid_service_data_sources"
    for key in (*v.TARGET_KEYS, "target"):
        assert _error(v._service_sources, {key: source}) == "service_data_target"
    for bad in ({"": source}, {"k" * 256: source}, {"k": {**source, "type": "date"}},
                {"k": {**source, "attribute": ""}}, {"k": {**source, "attribute": "a" * 256}},
                {"k": {"type": "number"}}, {"k": {"entity_id": "sensor.t"}}):
        with pytest.raises(vol.Invalid):
            v._service_sources(bad)
    ok = {"k" * 255: {**source, "attribute": "a" * 255}}
    assert v._service_sources(ok) == ok
    for kind in ("number", "boolean", "string", "native"):
        v._service_sources({"k": {**source, "type": kind}})


def test_action_schema():
    service = {"kind": "service", "service": "climate.turn_on"}
    assert v.ACTION(service)["data"] == {}
    assert v.ACTION({**service, "target_entity_id": "light.a"})["target_entity_id"] == "light.a"
    assert v.ACTION({"kind": "scene", "scene": "scene.work_1"})["scene"] == "scene.work_1"
    for bad in ({"kind": "scene", "scene": "scene.Work"}, {"kind": "scene", "scene": "light.work"},
                {"kind": "scene", "scene": "scene."}, {"kind": "scene", "scene": "xscene.a"},
                {"kind": "other"}, {"kind": "service"},
                {**service, "target_entity_id": "bad"}, {**service, "data": {"entity_id": "x"}}):
        with pytest.raises(vol.Invalid):
            v.ACTION(bad)


def test_label_schema():
    action = {"kind": "service", "service": "light.turn_on"}
    base = {"id": "l", "name": "x" * 30, "action": action}
    assert v.LABEL(base)["color"] == "#9e9e9e"
    assert v.LABEL({**base, "color": "#AbCdEf"})["color"] == "#AbCdEf"
    for bad in ({**base, "name": ""}, {**base, "name": "x" * 31}, {**base, "color": "#12345"},
                {**base, "color": "#1234567"}, {**base, "color": "123456"}, {**base, "color": "#12345g"},
                {k: x for k, x in base.items() if k != "id"},
                {k: x for k, x in base.items() if k != "action"}):
        with pytest.raises(vol.Invalid):
            v.LABEL(bad)


def test_condition_schema():
    cond = {"entity_id": "sensor.t", "value": 1}
    assert v.CONDITION(cond)["op"] == "eq"
    for op in ("eq", "ne", "lt", "gt"):
        assert v.CONDITION({**cond, "op": op})["op"] == op
    for value in ("a", 1, 1.5, True):
        assert v.CONDITION({**cond, "value": value})["value"] == value
    assert v.CONDITION({**cond, "attribute": None})["attribute"] is None
    for bad in ({**cond, "op": "ge"}, {**cond, "value": None}, {"entity_id": "sensor.t"}, {"value": 1},
                {**cond, "value": [1]}):
        with pytest.raises(vol.Invalid):
            v.CONDITION(bad)


def test_slot_schema_limits():
    base = slot("s", "08:00", "09:00")
    assert v.SLOT({k: x for k, x in base.items() if k != "conditions"})["conditions"] == []
    cond = {"entity_id": "sensor.t", "value": 1}
    assert len(v.SLOT({**base, "conditions": [cond] * 10})["conditions"]) == 10
    for bad in ({**base, "conditions": [cond] * 11}, {k: x for k, x in base.items() if k != "label"},
                {k: x for k, x in base.items() if k != "id"}, {k: x for k, x in base.items() if k != "start"}):
        with pytest.raises(vol.Invalid):
            v.SLOT(bad)
    assert v.SLOT({**base, "end": None, "color": None})["end"] is None
    assert v.SLOT({**base, "end": {"sun": "sunset"}})["end"]["sun"] == "sunset"


def test_profile_schema_limits():
    day = [slot("s", "08:00", "09:00")]
    week = [day] * 7
    assert v.PROFILE({"id": "p", "name": "n" * 40, "days": week})
    for bad in ({"id": "p", "name": "", "days": week}, {"id": "p", "name": "n" * 41, "days": week},
                {"id": "p", "name": "n", "days": week[:6]}, {"id": "p", "name": "n", "days": week + [[]]},
                {"id": "p", "name": "n", "days": [[]] * 6 + [[slot(f"s{i}", "08:00", "09:00") for i in range(51)]]}):
        with pytest.raises(vol.Invalid):
            v.PROFILE(bad)
    fifty = [slot(f"s{i}", "08:00", "09:00") for i in range(50)]
    assert v.PROFILE({"id": "p", "name": "n", "days": [fifty] + [[]] * 6})


def test_entity_schema():
    entity = v.ENTITY({"entity_id": CLIMATE})
    assert entity == {"entity_id": CLIMATE, "default_label": None, "label_overrides": {},
                      "allowed_services": [], "restrict_services": False}
    assert v.ENTITY({"entity_id": CLIMATE, "allowed_services": ["climate.set_temperature"]})
    for bad in ("climate", "Climate.x", "climate.", ".x", "a.b.c", 1):
        with pytest.raises(vol.Invalid):
            v.ENTITY({"entity_id": CLIMATE, "allowed_services": [bad]})
    with pytest.raises(vol.Invalid):
        v.ENTITY({"entity_id": CLIMATE, "restrict_services": "yes"})


# -- program schema ---------------------------------------------------------------


def test_program_defaults_and_limits():
    prog = _check({k: x for k, x in program().items() if k not in ("priority", "enabled", "revision")})
    assert (prog["priority"], prog["enabled"], prog["revision"]) == (DEFAULT_PRIORITY, True, 0)
    for priority in (1, 100):
        assert _check(program(priority=priority))["priority"] == priority
    for priority in (0, 101):
        with pytest.raises(vol.Invalid):
            _check(program(priority=priority))
    with pytest.raises(vol.Invalid):
        _check({**program(), "name": ""})
    assert _check({**program(), "name": "n" * 60})
    with pytest.raises(vol.Invalid):
        _check({**program(), "name": "n" * 61})
    with pytest.raises(vol.Invalid):
        _check({**program(), "entities": []})


def test_program_entity_and_profile_count_limits():
    one = {"entity_id": CLIMATE, "default_label": "t15", "label_overrides": {}}
    assert _check({**program(), "entities": [one] * 100})
    with pytest.raises(vol.Invalid):
        _check({**program(), "entities": [one] * 101})
    base = program()["profiles"][0]
    profiles = [{**base, "id": f"p{i}", "name": f"n{i}"} for i in range(21)]
    assert _check({**program(), "profiles": profiles[:20]})
    with pytest.raises(vol.Invalid):
        _check({**program(), "profiles": profiles})
    with pytest.raises(vol.Invalid):
        _check({**program(), "profiles": []})


# -- semantic rules ---------------------------------------------------------------


def _mode_program(mappings, entity_id="input_select.mode"):
    prog = program()
    prog["profiles"].append({**prog["profiles"][0], "id": "eco", "name": "Eco"})
    prog["mode_source"] = {"entity_id": entity_id, "mappings": mappings}
    return prog


def test_mode_source_rules():
    assert _check(_mode_program({"home": "base", "away": "eco"}))
    assert _error(_check, _mode_program({"home": "missing"})) == "unknown_mode_profile"
    assert _error(_check, _mode_program({"home": "base", "away": "ghost"})) == "unknown_mode_profile"
    assert _error(_check, _mode_program({" ": "base"})) == "empty_mode_state"
    with pytest.raises(vol.Invalid):
        _check(_mode_program({}))
    with pytest.raises(vol.Invalid):
        _check(_mode_program({"": "base"}))


def test_circular_mode_source_only_for_our_own_entities(hass):
    from homeassistant.helpers import entity_registry as er

    from custom_components.weekly_planner.const import DOMAIN

    registry = er.async_get(hass)
    registry.async_get_or_create("switch", DOMAIN, "own", suggested_object_id="own")
    registry.async_get_or_create("switch", "other", "foreign", suggested_object_id="foreign")
    assert _error(_check, _mode_program({"a": "base"}, "switch.own"), hass=hass) == "circular_mode_source"
    assert _check(_mode_program({"a": "base"}, "switch.foreign"), hass=hass)
    assert _check(_mode_program({"a": "base"}, "switch.unknown"), hass=hass)


def test_duplicate_profile_names():
    prog = program()
    prog["profiles"].append({**prog["profiles"][0], "id": "other"})
    assert _error(_check, prog) == "duplicate_profile_name"
    prog["profiles"][1]["name"] = "Other"
    assert _check(prog)


def test_unknown_labels_are_named():
    prog = program()
    prog["entities"][0]["default_label"] = "ghost"
    assert _error(_check, prog) == "unknown_label:ghost"
    prog = program()
    prog["entities"][0]["label_overrides"] = {"ghost2": {"kind": "scene", "scene": "scene.a"}}
    assert _error(_check, prog) == "unknown_label:ghost2"
    prog = program(slots=[slot("s", "08:00", "09:00", "ghost3")])
    assert _error(_check, prog) == "unknown_label:ghost3"
    assert _check(program(default=None))["entities"][0]["default_label"] is None


def test_override_service_is_checked_against_the_entity_but_scene_is_not():
    prog = program()
    prog["entities"][0]["label_overrides"] = {"t21": {"kind": "service", "service": "light.turn_on"}}
    hass = _hass("light.turn_on")
    assert _error(_check, prog, hass=hass, descriptions={}) == f"service_not_for_entity:light.turn_on:{CLIMATE}"
    prog["entities"][0]["label_overrides"] = {"t21": {"kind": "scene", "scene": "scene.work"}}
    assert _check(prog, hass=hass, descriptions={})


def test_check_label_checks_service_only_for_service_actions():
    service = {"id": "l", "name": "L", "action": {"kind": "service", "service": "light.turn_on"}}
    assert v.check_label(deepcopy(service))["color"] == "#9e9e9e"
    assert _error(v.check_label, deepcopy(service), _hass()) == "unknown_service:light.turn_on"
    assert v.check_label(deepcopy(service), _hass("light.turn_on"))
    scene = {"id": "l", "name": "L", "action": {"kind": "scene", "scene": "scene.a"}}
    assert v.check_label(scene, _hass())
    # a label has no entity: a foreign domain is fine
    assert v.check_label(deepcopy(service), _hass("light.turn_on"), descriptions={})


# -- _check_service ---------------------------------------------------------------


@pytest.mark.parametrize("service", [None, 5, "nodot", "a.b.c"])
def test_check_service_rejects_malformed_names(service):
    assert _error(v._check_service, None, None, None, {"service": service}) == f"unknown_service:{service}"


def test_check_service_accepts_single_dot_without_hass():
    v._check_service(None, None, None, {"service": "a.b"})
    v._check_service(None, None, None, {"service": "a.b", "data": {}})
    v._check_service(None, None, None, {"service": "a.b"})  # data absent is fine


def test_check_service_data_must_be_dict():
    assert _error(v._check_service, None, None, None, {"service": "a.b", "data": []}) == "invalid_service_data:a.b"
    assert _error(v._check_service, None, None, None, {"service": "a.b", "data": None}) == "invalid_service_data:a.b"


def test_check_service_with_hass():
    hass = _hass("light.turn_on", "climate.turn_on")
    assert _error(v._check_service, hass, {}, None, {"service": "light.nope"}) == "unknown_service:light.nope"
    v._check_service(hass, {}, None, {"service": "light.turn_on"})  # no entity: nothing more to check
    v._check_service(hass, {}, "light.a", {"service": "light.turn_on"})
    assert (_error(v._check_service, hass, {}, "climate.a", {"service": "light.turn_on"})
            == "service_not_for_entity:light.turn_on:climate.a")
    # the action's own target wins over the entity of the program
    v._check_service(hass, {}, "climate.a", {"service": "light.turn_on", "target_entity_id": "light.b"})
    assert (_error(v._check_service, hass, {}, "light.a", {"service": "light.turn_on", "target_entity_id": "climate.b"})
            == "service_not_for_entity:light.turn_on:climate.b")


# -- service_accepts / _target_accepts --------------------------------------------


def test_service_accepts_own_domain_or_target_domain():
    assert v.service_accepts({}, "light.turn_on", "light.a")
    assert not v.service_accepts({}, "light.turn_on", "switch.a")
    assert v.service_accepts(None, "homeassistant.turn_on", "switch.a")
    desc = {"homeassistant": {"turn_on": {"target": {"entity": {"domain": ["switch", "light"]}}}}}
    assert v.service_accepts(desc, "homeassistant.turn_on", "switch.a")
    assert not v.service_accepts(desc, "homeassistant.turn_on", "climate.a")


def test_target_accepts_shapes():
    accepts = v._target_accepts
    assert accepts(None, "d", "n", "x")
    assert not accepts({}, "d", "n", "x")
    assert not accepts({"d": {}}, "d", "n", "x")
    assert not accepts({"d": {"n": None}}, "d", "n", "x")
    assert not accepts({"d": {"n": {}}}, "d", "n", "x")
    assert not accepts({"d": {"n": {"target": {}}}}, "d", "n", "x")
    assert accepts({"d": {"n": {"target": {"entity": {}}}}}, "d", "n", "x")  # no domain filter
    assert accepts({"d": {"n": {"target": {"entity": None}}}}, "d", "n", "x")
    assert accepts({"d": {"n": {"target": {"device": {}}}}}, "d", "n", "x")
    assert accepts({"d": {"n": {"target": {"entity": {"domain": "x"}}}}}, "d", "n", "x")
    assert not accepts({"d": {"n": {"target": {"entity": {"domain": "y"}}}}}, "d", "n", "x")
    many = {"d": {"n": {"target": {"entity": [{"domain": "y"}, {"domain": ["z", "x"]}]}}}}
    assert accepts(many, "d", "n", "x")
    assert not accepts(many, "d", "n", "w")
    other_service = {"d": {"other": {"target": {}}}}
    assert not accepts(other_service, "d", "n", "x")
    assert not accepts({"e": {"n": {"target": {}}}}, "d", "n", "x")


def test_as_list():
    assert v._as_list("a") == ["a"]
    assert v._as_list(["a", "b"]) == ["a", "b"]


def test_with_defaults_keeps_explicit_values():
    assert v.with_defaults({"a": 1}, False) == {"reapply": False, "a": 1}
    assert v.with_defaults({"reapply": True}, False) == {"reapply": True}
    assert v.with_defaults({})["reapply"] is True


# -- overlaps ---------------------------------------------------------------------


def _week(*per_day):
    days = [[] for _ in range(7)]
    for index, slots in per_day:
        days[index] = slots
    return days


def _fixed(sid, start, end, rs=0, re=0):
    spec = slot(sid, start, end)
    if rs:
        spec["start"]["random_minutes"] = rs
    if re:
        spec["end"]["random_minutes"] = re
    return spec


def test_adjacent_slots_do_not_overlap_but_crossing_ones_do():
    v._check_week_overlaps(_week((0, [_fixed("a", "08:00", "09:00"), _fixed("b", "09:00", "10:00")])))
    for second in (("08:59", "10:00"), ("07:00", "08:01"), ("08:30", "08:45")):
        days = _week((0, [_fixed("a", "08:00", "09:00"), _fixed("b", *second)]))
        assert _error(v._check_week_overlaps, days) == "overlapping_slots"
        assert _error(v._check_overlaps, days[0]) == "overlapping_slots"


def test_overlap_check_is_order_independent():
    days = _week((2, [_fixed("b", "10:00", "11:00"), _fixed("a", "09:30", "10:30")]))
    assert _error(v._check_week_overlaps, days) == "overlapping_slots"
    # a short slot inside a long one, after another slot, is still caught
    inner = [_fixed("a", "08:00", "12:00"), _fixed("b", "09:00", "09:30"), _fixed("c", "11:00", "11:30")]
    assert _error(v._check_week_overlaps, _week((0, inner))) == "overlapping_slots"


def test_reject_overlaps_uses_the_latest_end_seen():
    from datetime import datetime

    t = lambda h: datetime(2026, 1, 5, h)  # noqa: E731
    with pytest.raises(v.ProgramError):
        v._reject_overlaps([(t(8), t(12), False), (t(9), t(10), False), (t(11), t(13), False)])
    v._reject_overlaps([(t(8), t(9), False), (t(9), t(10), False)])
    v._reject_overlaps([])


def test_overnight_slot_spills_into_the_next_day_and_sunday_into_monday():
    night = _fixed("a", "22:00", "06:00")
    morning = _fixed("b", "05:00", "07:00")
    days = _week((0, [night]), (1, [morning]))
    # the historical per-day rule trims the spill of a slot without delay; only each day alone is checked
    v._check_week_overlaps(days)
    delayed_night = _fixed("a", "22:00", "06:00", 0, 30)
    days = _week((0, [delayed_night]), (1, [_fixed("b", "06:10", "07:00")]))
    assert _error(v._check_week_overlaps, days) == "overlapping_slots"
    sunday = _week((6, [_fixed("a", "22:00", "06:00", 0, 30)]), (0, [_fixed("b", "06:10", "07:00")]))
    assert _error(v._check_week_overlaps, sunday) == "overlapping_slots"
    far = _week((0, [delayed_night]), (1, [_fixed("b", "06:30", "07:00")]))
    v._check_week_overlaps(far)


def test_random_delay_only_conflicts_when_windows_intersect():
    a = _fixed("a", "08:00", "09:00", 0, 20)
    v._check_week_overlaps(_week((0, [a, _fixed("b", "09:20", "10:00")])))
    assert _error(v._check_week_overlaps, _week((0, [a, _fixed("b", "09:19", "10:00")]))) == "overlapping_slots"
    # the earlier slot may also be the delayed one or the later one
    late = _fixed("b", "09:00", "10:00", 5, 0)
    assert _error(v._check_week_overlaps, _week((0, [_fixed("a", "08:00", "09:10"), late]))) == "overlapping_slots"


def test_random_window_too_short():
    ok = _fixed("a", "08:00", "08:15", 10, 0)
    v._check_week_overlaps(_week((0, [ok])))
    short = _fixed("a", "08:00", "08:14", 10, 0)
    assert _error(v._check_week_overlaps, _week((0, [short]))) == "random_window_too_short"
    assert _error(v._check_week_overlaps, _week((0, [_fixed("a", "08:00", "08:04", 0, 5)]))) == "random_window_too_short"
    v._check_week_overlaps(_week((0, [_fixed("a", "08:00", "08:05", 0, 5)])))
    empty = _fixed("a", "18:00", "13:00", 5, 0)
    assert _error(v._check_week_overlaps, _week((0, [empty]))) == "random_window_too_short"
    # without a delay a too short slot is only ignored at runtime
    v._check_week_overlaps(_week((0, [_fixed("a", "08:00", "08:02")])))


def test_slots_without_fixed_bounds_are_skipped():
    solar_start = {"id": "a", "start": {"sun": "sunset"}, "end": {"time": "23:00"}, "label": "t21", "conditions": []}
    solar_end = {"id": "b", "start": {"time": "08:00"}, "end": {"sun": "sunset"}, "label": "t21", "conditions": []}
    one_shot = {"id": "c", "start": {"time": "08:00"}, "end": None, "label": "t21", "conditions": []}
    no_end = {"id": "d", "start": {"time": "08:00"}, "label": "t21", "conditions": []}
    overlapping = [solar_start, solar_end, one_shot, no_end, _fixed("e", "08:00", "09:00"), _fixed("f", "08:30", "09:30")]
    assert _error(v._check_overlaps, overlapping) == "overlapping_slots"
    v._check_overlaps(overlapping[:5])


def test_program_runs_the_overlap_check_for_each_profile():
    prog = program(slots=[_fixed("a", "08:00", "10:00"), _fixed("b", "09:00", "11:00")])
    assert _error(_check, prog) == "overlapping_slots"
    prog = program()
    prog["profiles"].append({"id": "p2", "name": "Two", "days": _week((3, [_fixed("a", "08:00", "10:00"),
                                                                              _fixed("b", "09:00", "11:00")]))})
    assert _error(_check, prog) == "overlapping_slots"


# -- admin and users --------------------------------------------------------------


def test_admin_required():
    safe = _lbl()
    assert not v.admin_required(program(), safe)
    admin_action = {"kind": "service", "service": "shell_command.run", "data": {}}
    from custom_components.weekly_planner.actions import needs_admin
    assert needs_admin(admin_action)
    dangerous = {**safe, "t15": {**safe["t15"], "action": admin_action}}
    assert v.admin_required(program(), dangerous)  # default label
    assert v.admin_required(program(default=None, slots=[slot("s", "08:00", "09:00", "t15")]), dangerous)  # slot label
    override = program()
    override["entities"][0]["label_overrides"] = {"t21": admin_action}
    assert v.admin_required(override, safe)
    assert not v.admin_required(program(default=None, slots=[]), dangerous)  # unused
    assert not v.admin_required(program(default="ghost"), safe)  # unknown label


def test_label_users():
    first = program("a", slots=[slot("s", "08:00", "09:00", "t19")])
    second = program("b", slots=[])
    second["entities"][0]["default_label"] = "t25"
    third = program("c", slots=[])
    third["entities"][0]["label_overrides"] = {"boost": {"kind": "scene", "scene": "scene.a"}}
    fourth = program("d", slots=[])
    del fourth["entities"][0]["label_overrides"]
    programs = [first, second, third, fourth]
    assert v.label_users(programs, "t19") == ["a"]
    assert v.label_users(programs, "t25") == ["b"]
    assert v.label_users(programs, "boost") == ["c"]
    assert v.label_users(programs, "t15") == ["a", "c", "d"]
    assert v.label_users(programs, "none") == []


# -- survivors of the second mutation run -----------------------------------------


def test_service_source_keys_must_be_strings():
    source = {"entity_id": "sensor.t", "type": "number"}
    with pytest.raises(vol.Invalid):
        v._service_sources({("a",): source})


def test_service_accepts_splits_on_the_first_dot_only():
    assert v.service_accepts({}, "light.turn.on", "light.a.b")
    assert not v.service_accepts({}, "light.turn.on", "switch.a.b")
    assert not v.service_accepts({}, "turn.on.light", "light.a")


def test_ignored_slots_reserve_no_interval():
    too_short = _fixed("a", "08:00", "08:03")
    empty = _fixed("b", "18:00", "13:00")
    v._check_overlaps([too_short, _fixed("c", "08:01", "09:00")])
    v._check_overlaps([empty, _fixed("c", "14:00", "15:00")])
    v._check_week_overlaps(_week((0, [too_short, _fixed("c", "08:01", "09:00")])))


def test_touching_windows_do_not_overlap_even_when_delayed():
    delayed_later = _fixed("b", "09:00", "10:00", 0, 5)
    v._check_week_overlaps(_week((0, [delayed_later, _fixed("a", "08:00", "09:00")])))
