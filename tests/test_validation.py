"""Rules, boundaries and error codes of ``validation.py`` (pinned after mutation testing)."""

from __future__ import annotations

from copy import deepcopy
from datetime import UTC, date, datetime
from types import SimpleNamespace
from zoneinfo import ZoneInfo

import pytest
import voluptuous as vol

from custom_components.weekly_planner import validation as v
from custom_components.weekly_planner.const import DEFAULT_PRIORITY

from .helpers import CLIMATE, COVER, label, labels, program, slot


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
    with pytest.raises(ValueError):
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
    for priority in (1, 100, 101, 5000):  # a rank has no upper limit
        assert _check(program(priority=priority))["priority"] == priority
    for priority in (0, -1):
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


def test_legacy_mode_keys_are_accepted_and_dropped():
    """The previous card still sends ``active_profile`` and ``mode_source``: ignored, never stored."""
    prog = program()
    prog["active_profile"] = "base"
    prog["mode_source"] = {"entity_id": "input_select.mode", "mappings": {"home": "base"}}
    checked = _check(prog)
    assert "active_profile" not in checked and "mode_source" not in checked


def test_mode_config_rules(hass):
    from homeassistant.helpers import entity_registry as er

    from custom_components.weekly_planner.const import DOMAIN

    assert v.check_mode_config(None, None) == {"mode_selector": None, "default_mode": None}
    assert v.check_mode_config("input_select.house", "Home") == {"mode_selector": "input_select.house", "default_mode": "Home"}
    assert v.check_mode_config("select.house", "x" * 40)["default_mode"] == "x" * 40
    assert _error(v.check_mode_config, "switch.house", None) == "invalid_mode_selector_domain"
    with pytest.raises(vol.Invalid):
        v.check_mode_config("not an entity", None)
    for bad in ("", "  ", "x" * 41, 3):
        assert _error(v.check_mode_config, "input_select.house", bad) == "invalid_default_mode"
    assert _error(v.check_mode_config, "input_select.house", "Away", None, ["Home"]) == "unknown_default_mode"
    assert v.check_mode_config("input_select.house", "Home", None, ["Home"])
    registry = er.async_get(hass)
    registry.async_get_or_create("select", DOMAIN, "own", suggested_object_id="own")
    registry.async_get_or_create("select", "other", "foreign", suggested_object_id="foreign")
    assert _error(v.check_mode_config, "select.own", None, hass) == "circular_mode_selector"
    assert v.check_mode_config("select.foreign", None, hass)
    assert v.check_mode_config("select.unknown", None, hass)


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
        assert _error(v._check_day_overlaps, days[0], None) == "overlapping_slots"


def test_overlap_check_is_order_independent():
    days = _week((2, [_fixed("b", "10:00", "11:00"), _fixed("a", "09:30", "10:30")]))
    assert _error(v._check_week_overlaps, days) == "overlapping_slots"
    # a short slot inside a long one, after another slot, is still caught
    inner = [_fixed("a", "08:00", "12:00"), _fixed("b", "09:00", "09:30"), _fixed("c", "11:00", "11:30")]
    assert _error(v._check_week_overlaps, _week((0, inner))) == "overlapping_slots"


def test_reject_overlaps_uses_the_latest_end_seen():
    from datetime import datetime

    t = lambda h: datetime(2026, 1, 5, h)
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
    assert _error(v._check_day_overlaps, overlapping, None) == "overlapping_slots"
    v._check_day_overlaps(overlapping[:5], None)


def test_program_runs_the_overlap_check_for_each_profile():
    prog = program(slots=[_fixed("a", "08:00", "10:00"), _fixed("b", "09:00", "11:00")])
    assert _error(_check, prog) == "overlapping_slots"
    prog = program()
    prog["profiles"].append({"id": "p2", "name": "Two", "days": _week((3, [_fixed("a", "08:00", "10:00"),
                                                                              _fixed("b", "09:00", "11:00")]))})
    assert _error(_check, prog) == "overlapping_slots"


# -- admin and users --------------------------------------------------------------


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
    v._check_day_overlaps([too_short, _fixed("c", "08:01", "09:00")], None)
    v._check_day_overlaps([empty, _fixed("c", "14:00", "15:00")], None)
    v._check_week_overlaps(_week((0, [too_short, _fixed("c", "08:01", "09:00")])))


def test_touching_windows_do_not_overlap_even_when_delayed():
    delayed_later = _fixed("b", "09:00", "10:00", 0, 5)
    v._check_week_overlaps(_week((0, [delayed_later, _fixed("a", "08:00", "09:00")])))


# -- a program paused until a time, and the legacy keys of the card -------------------------------------

LIGHT = "light.office"
PAUSE = "2026-12-01T08:00:00+00:00"
STORED = {"enabled": False, "paused_until": PAUSE}


def _devices(*ids):
    return [{"entity_id": eid, "default_label": None, "label_overrides": {}} for eid in ids]


def _listed(sid, start, end, entities, label="t21"):
    """A slot restricted to some of the program's devices."""
    return {**slot(sid, start, end, label), "entities": entities}


def _devices_program(slots, ids=(CLIMATE, COVER)):
    return program(slots=slots, entities=_devices(*ids))


@pytest.mark.parametrize("keep_enabled", [True, False])
def test_keep_pause_restores_the_pause_when_the_card_sends_the_program_as_disabled(keep_enabled):
    saved = {"name": "x", "enabled": False}
    assert v.keep_pause(STORED, saved, keep_enabled=keep_enabled) == {
        "name": "x", "enabled": False, "paused_until": PAUSE}
    assert saved == {"name": "x", "enabled": False}  # the caller's dict is left alone


@pytest.mark.parametrize(
    ("sent", "keep_enabled", "expected"),
    [
        pytest.param({"name": "x", "enabled": True}, True,
                     {"name": "x", "enabled": False, "paused_until": PAUSE},
                     id="a stale enabled program is suspended again when asked"),
        pytest.param({"name": "x", "enabled": True}, False, {"name": "x", "enabled": True},
                     id="it stays enabled when not asked"),
        pytest.param({"name": "x"}, False, {"name": "x"}, id="silence is not disabled"),
        pytest.param({"name": "x"}, True, {"name": "x", "enabled": False, "paused_until": PAUSE},
                     id="silence is suspended again when asked"),
    ],
)
def test_keep_pause_restores_pause_and_suspension_for_a_stale_program_only_when_asked(
        sent, keep_enabled, expected):
    assert v.keep_pause(STORED, sent, keep_enabled=keep_enabled) == expected


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


@pytest.mark.parametrize(
    ("changes", "expected"),
    [
        pytest.param({"enabled": False, "paused_until": "2026-12-01T09:00:00+01:00"}, PAUSE,
                     id="a suspended program keeps its resume time, normalised to UTC"),
        pytest.param({"enabled": True, "paused_until": PAUSE}, None, id="a running program has none"),
        pytest.param({"paused_until": PAUSE}, None, id="an absent flag means enabled: none"),
        pytest.param({"enabled": False}, None, id="a suspended program without a resume time has none"),
        pytest.param({"enabled": False, "paused_until": None}, None, id="a null resume time is dropped"),
    ],
)
def test_paused_until_survives_only_on_a_suspended_program(changes, expected):
    prog = program()
    prog.pop("enabled", None)
    prog.update(changes)
    assert _check(prog).get("paused_until") == expected


@pytest.mark.parametrize("bad", ["not a date", "2026-12-01T08:00:00", 5, datetime(2026, 12, 1, 8)])
def test_a_paused_until_that_is_not_an_aware_date_is_refused_by_name(bad):
    assert _error(v._utc_datetime, bad) == "invalid_paused_until"
    with pytest.raises(vol.Invalid):
        v.PROGRAM({**program(), "paused_until": bad})


def test_a_yaml_date_time_is_read_as_a_moment_in_its_own_zone():
    aware = datetime(2026, 12, 1, 9, tzinfo=ZoneInfo("Europe/Brussels"))
    assert v._utc_datetime(aware) == "2026-12-01T08:00:00+00:00"


# -- the follows key of a mode ----------------------------------------------------------------------------


def _two_modes(**follows):
    prog = program(slots=[])
    prog["profiles"].append({"id": "alt", "name": "Alt", "days": [[] for _ in range(7)], **follows})
    return prog


@pytest.mark.parametrize("follows", [{"follows": None}, {}])
def test_follows_is_removed_when_none_or_absent(follows):
    assert "follows" not in _check(_two_modes(**follows))["profiles"][1]


def test_follows_is_kept_when_set():
    assert _check(_two_modes(follows="Base"))["profiles"][1]["follows"] == "Base"


@pytest.mark.parametrize(
    ("follows", "message"),
    [("Alt", "Mode 'Alt' cannot follow itself"),
     ("Nope", "Mode 'Alt' follows 'Nope', which does not exist in this program")],
)
def test_follows_errors_are_passed_on_word_for_word(follows, message):
    assert _error(_check, _two_modes(follows=follows)) == message


# -- the devices a slot is restricted to -----------------------------------------------------------------


@pytest.mark.parametrize(
    ("listed", "code"),
    [
        pytest.param([], "empty_slot_entities:a", id="an empty list"),
        pytest.param([CLIMATE, COVER, CLIMATE], f"duplicate_slot_entity:a:{CLIMATE}", id="a device twice"),
        pytest.param([CLIMATE, LIGHT], f"unknown_slot_entity:a:{LIGHT}",
                     id="a device the program does not drive"),
    ],
)
def test_slot_entity_codes_carry_the_slot_id_and_the_entity(listed, code):
    assert _error(_check, _devices_program([_listed("a", "07:00", "09:00", listed)])) == code


def test_a_slot_without_a_list_or_with_known_devices_is_accepted():
    out = _check(_devices_program([slot("a", "07:00", "09:00"), _listed("b", "10:00", "11:00", [COVER])]))
    assert out["profiles"][0]["days"][0][1]["entities"] == [COVER]


@pytest.mark.parametrize(
    ("entities", "known", "code"),
    [
        pytest.param(None, {}, None, id="no list: nothing to check"),
        pytest.param([CLIMATE, COVER], {CLIMATE: None, COVER: None}, None, id="known devices"),
        pytest.param([COVER, CLIMATE, COVER], {CLIMATE: None, COVER: None},
                     f"duplicate_slot_entity:a:{COVER}", id="a device listed again later"),
        pytest.param([LIGHT, LIGHT], {}, f"duplicate_slot_entity:a:{LIGHT}",
                     id="a duplicate is reported before an unknown device"),
    ],
)
def test_slot_entity_helper_is_silent_for_a_missing_list_and_strict_about_the_others(entities, known, code):
    item = {"id": "a"} if entities is None else {"id": "a", "entities": entities}
    if code is None:
        v._check_slot_entities(item, known)
    else:
        with pytest.raises(v.ProgramError) as exc:
            v._check_slot_entities(item, known)
        assert exc.value.msg == code


def test_unknown_label_in_a_slot_is_named_even_with_lists():
    bad = _listed("a", "07:00", "09:00", [CLIMATE], label="ghost")
    assert _error(_check, _devices_program([bad])) == "unknown_label:ghost"


# -- overlaps when slots are restricted to devices --------------------------------------------------------


def test_overlaps_are_per_device_as_soon_as_one_slot_has_a_list():
    _check(_devices_program([_listed("a", "07:00", "09:00", [CLIMATE]), _listed("b", "08:00", "10:00", [COVER])]))
    same_device = [_listed("a", "07:00", "09:00", [CLIMATE]), _listed("b", "08:00", "10:00", [CLIMATE])]
    assert _error(_check, _devices_program(same_device)) == f"overlapping_slots:{CLIMATE}"
    plain = [slot("a", "07:00", "09:00"), slot("b", "08:00", "10:00")]
    assert _error(_check, _devices_program(plain)) == "overlapping_slots"


@pytest.mark.parametrize("end_delay", [0, 15])
def test_fixed_interval_is_start_end_plus_end_delay_and_randomised_flag(end_delay):
    first = slot("a", "08:00", "09:00")
    first["end"]["random_minutes"] = end_delay
    end = datetime(2026, 1, 5, 9, end_delay, tzinfo=UTC)
    assert v._fixed_intervals([first], date(2026, 1, 5)) == [
        (datetime(2026, 1, 5, 8, tzinfo=UTC), end, end_delay > 0)]


def test_fixed_interval_carries_the_devices_of_the_slot_in_program_order():
    day = date(2026, 1, 5)
    ids = [CLIMATE, COVER, LIGHT]
    listed = _listed("a", "08:00", "09:00", [LIGHT, CLIMATE])
    everyone = slot("b", "10:00", "11:00")
    found = v._fixed_intervals([listed, everyone], day, ids)
    assert [item[3] for item in found] == [frozenset({CLIMATE, LIGHT}), frozenset(ids)]
    assert all(len(item) == 4 for item in found)
    assert all(len(item) == 3 for item in v._fixed_intervals([listed, everyone], day))


def test_scoped_overlap_of_a_delayed_slot_across_midnight_names_the_shared_device():
    delayed = _listed("n", "22:00", "06:00", [CLIMATE])
    delayed["end"]["random_minutes"] = 30
    days = _week((6, [delayed]))
    ids = [CLIMATE, COVER]
    days[0] = [_listed("m", "06:10", "07:00", [CLIMATE, COVER])]
    assert _error(v._check_week_overlaps_scoped, days, ids) == f"overlapping_slots:{CLIMATE}"
    days[0] = [_listed("m", "06:10", "07:00", [COVER])]
    v._check_week_overlaps_scoped(days, ids)
    days[0] = [_listed("m", "06:30", "07:00", [CLIMATE])]
    v._check_week_overlaps_scoped(days, ids)


@pytest.mark.parametrize(
    ("first_end_delay", "second_start", "clashes"),
    [
        pytest.param(0, "09:00", False, id="two slots that touch"),
        pytest.param(0, "08:59", True, id="one minute of intersection"),
        pytest.param(30, "09:30", False, id="a delayed window that only touches"),
        pytest.param(30, "09:29", True, id="a delayed window that intersects"),
    ],
)
def test_scoped_overlap_needs_a_real_intersection_for_the_same_device(first_end_delay, second_start, clashes):
    first = _listed("a", "08:00", "09:00", [CLIMATE])
    first["end"]["random_minutes"] = first_end_delay
    days = _week((0, [first, _listed("b", second_start, "10:00", [CLIMATE])]))
    if clashes:
        assert _error(v._check_week_overlaps_scoped, days, [CLIMATE]) == f"overlapping_slots:{CLIMATE}"
    else:
        v._check_week_overlaps_scoped(days, [CLIMATE])


# -- chart sources -----------------------------------------------------------------------------------------


def test_chart_sources_must_be_unique_and_come_back_with_their_defaults():
    one = {"entity_id": "sensor.a", "kind": "numeric"}
    assert v._chart_sources([one, {"entity_id": "sensor.b", "kind": "states", "states": ["on"]}]) == [
        {"entity_id": "sensor.a", "kind": "numeric", "states": []},
        {"entity_id": "sensor.b", "kind": "states", "states": ["on"]},
    ]
    assert _error(v._chart_sources, [one, {**one, "kind": "states"}]) == "duplicate_chart_source"
    assert _error(v._chart_sources, "sensor.a") != "duplicate_chart_source"


# -- the day off: exact codes of its rules ---------------------------------------------------------------


@pytest.mark.parametrize("bad", [7, -1, True, "1", 1.0])
def test_the_weekday_of_a_copied_day_off_is_an_integer_from_0_to_6_with_its_own_code(bad):
    assert _error(v._weekday, bad) == "invalid_holiday_copy"


def test_the_weekdays_of_a_copied_day_off_are_zero_to_six():
    assert [v._weekday(n) for n in (0, 6)] == [0, 6]


@pytest.mark.parametrize(
    ("call", "code"),
    [
        pytest.param(lambda: v.check_holiday_config("light.x", False), "invalid_holiday_entity_domain",
                     id="a domain that is no flag"),
        pytest.param(lambda: v.check_holiday_config("sensor.x", False), "invalid_holiday_entity_domain",
                     id="a sensor"),
        pytest.param(lambda: v.check_holiday_config("switch.boiler", False, driven={"switch.boiler"}),
                     "driven_holiday_entity", id="an entity the programs drive"),
        pytest.param(lambda: v.check_holiday_config(None, "yes"), "invalid_holiday_invert",
                     id="inversion as text"),
        pytest.param(lambda: v.check_holiday_config("switch.x", 1), "invalid_holiday_invert",
                     id="inversion as a number"),
        pytest.param(lambda: v.check_holiday_loop(CLIMATE, [program()], labels()), "driven_holiday_entity",
                     id="a loop through a program"),
    ],
)
def test_each_refusal_of_the_day_off_config_has_its_exact_code(call, code):
    with pytest.raises(vol.Invalid) as caught:
        call()
    assert str(caught.value) == code


def test_the_day_off_config_accepts_a_calendar_a_missing_entity_and_a_free_switch():
    assert v.check_holiday_config("calendar.work", False)["holiday_entity"] == "calendar.work"
    v.check_holiday_loop(None, [program()], labels())
    v.check_holiday_loop("switch.free", [program()], labels())


def test_an_entity_of_this_integration_is_refused_with_its_exact_code(monkeypatch):
    import homeassistant.helpers.entity_registry as er

    registry = SimpleNamespace(async_get=lambda _eid: SimpleNamespace(platform="weekly_planner"))
    monkeypatch.setattr(er, "async_get", lambda _hass: registry)
    assert _error(v.check_holiday_config, "switch.own", False, object()) == "circular_holiday_entity"


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
    assert v.driven_entities([bare], labs, hass) == {CLIMATE, "light.a", "light.b"}
    assert v.driven_entities([bare], labs) == {CLIMATE}
    states["scene.evening"] = SimpleNamespace(attributes={"entity_id": "light.a"})
    assert v.driven_entities([bare], labs, hass) == {CLIMATE}


def _day_off_program(day, **kwargs):
    prog = program(entities=_devices(CLIMATE, COVER), **kwargs)
    prog["profiles"][0]["holiday"] = {"day": day}
    return prog


def test_slots_on_a_day_off_with_device_lists_may_touch_but_not_overlap():
    day = [_listed("a", "08:00", "09:00", [CLIMATE], "t21"), _listed("b", "09:00", "10:00", [CLIMATE], "t19")]
    _check(_day_off_program(day))
    day.append(_listed("c", "09:59", "11:00", [CLIMATE], "t25"))
    assert _error(_check, _day_off_program(day)) == f"overlapping_slots:{CLIMATE}"
    # sorted by start: the overlap is found whatever the order of the list
    assert _error(_check, _day_off_program(list(reversed(day)))) == f"overlapping_slots:{CLIMATE}"


def test_a_slot_swallowing_a_later_one_on_the_same_device_is_refused_in_the_week_and_on_a_day_off():
    long_first = [_listed("a", "08:00", "12:00", [CLIMATE], "t21"),
                  _listed("b", "09:00", "10:00", [COVER], "t19"),
                  _listed("c", "10:30", "11:00", [CLIMATE], "t25")]
    in_the_week = program(entities=_devices(CLIMATE, COVER), slots=long_first)
    assert _error(_check, in_the_week) == f"overlapping_slots:{CLIMATE}"
    assert _error(_check, _day_off_program(long_first, slots=[])) == f"overlapping_slots:{CLIMATE}"
    # only the third conflicts with the first, the second is on another device
    _check(_day_off_program(long_first[:2], slots=[]))


def test_a_fixed_slot_and_a_slot_with_a_random_delay_that_touch_only_at_their_edge_are_accepted():
    first = _listed("a", "07:00", "08:00", [CLIMATE], "t21")
    second = _listed("b", "08:00", "09:00", [CLIMATE], "t19")
    second["start"] = {"time": "08:00", "random_minutes": 0}
    _check(program(entities=_devices(CLIMATE, COVER), slots=[first, second]))
