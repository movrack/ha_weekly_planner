"""Service calls and state checks for setpoints (spec § 6)."""

from homeassistant.core import State

from custom_components.weekly_planner.setpoints import calls_for, is_one_shot, matches, needs_admin


def test_climate_mode_then_value():
    calls = calls_for("climate.x", {"kind": "temperature", "temperature": 19, "hvac_mode": "heat"})
    assert [c.service for c in calls] == ["set_hvac_mode", "set_temperature"]


def test_light_brightness_percent():
    (call,) = calls_for("light.x", {"kind": "on", "brightness": 60})
    assert call.service_data("light.x") == {"brightness_pct": 60, "entity_id": "light.x"}


def test_scene_is_one_shot_and_untargeted():
    (call,) = calls_for("light.x", {"kind": "scene", "scene": "scene.soir"})
    assert call.service_data("light.x") == {"entity_id": "scene.soir"}
    assert is_one_shot({"kind": "scene", "scene": "scene.soir"})


def test_admin_only_setpoints():
    assert needs_admin({"kind": "script", "script": "script.x"})
    assert needs_admin({"kind": "action", "action": "lock.unlock"})
    assert not needs_admin({"kind": "preset", "preset": "eco"})


def test_climate_tolerance():
    st = State("climate.x", "heat", {"temperature": 19.1})
    assert matches(st, {"kind": "temperature", "temperature": 19})
    assert not matches(st, {"kind": "temperature", "temperature": 20})


def test_versatile_thermostat_compares_requested_state():  # S23
    # window open: VT applies frost (7°) but the request is still eco
    st = State("climate.vt", "heat", {
        "preset_mode": "frost", "temperature": 7,
        "requested_state": {"hvac_mode": "heat", "preset": "eco", "target_temperature": None},
    })
    assert matches(st, {"kind": "preset", "preset": "eco"})


def test_cover_moving_is_not_checked():  # S25
    st = State("cover.x", "closing", {"current_position": 50})
    assert matches(st, {"kind": "close"}) is None
    assert matches(State("cover.x", "closed", {"current_position": 2}), {"kind": "close"})


def test_unavailable_is_never_a_mismatch():
    assert matches(State("light.x", "unavailable"), {"kind": "on"}) is None


def test_light_brightness_check():
    st = State("light.x", "on", {"brightness": 153})  # 60 %
    assert matches(st, {"kind": "on", "brightness": 60})
    assert not matches(st, {"kind": "on", "brightness": 90})
