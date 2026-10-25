"""Setpoints: how to apply them (service calls) and how to check them (state comparison).

A setpoint is a small dict: ``{"kind": "...", ...}``. State setpoints describe something
verifiable (a temperature, a position); one-shot setpoints (scene, script, action) are
fire-and-forget. See docs/SPEC.md § 6.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

ONE_SHOT_KINDS = frozenset({"scene", "script", "action"})
# Domains whose services only administrators may schedule (spec § 9).
SENSITIVE_DOMAINS = frozenset({"homeassistant", "hassio", "alarm_control_panel", "lock", "alarmo"})
ADMIN_ONLY_KINDS = frozenset({"script", "action"})

TEMPERATURE_TOLERANCE = 0.2
POSITION_TOLERANCE = 3
BRIGHTNESS_TOLERANCE = 10  # percent
COLOR_TEMP_TOLERANCE = 150  # kelvin (devices round to whole mireds)


@dataclass(frozen=True, slots=True)
class Call:
    """One service call."""

    domain: str
    service: str
    data: dict[str, Any] = field(default_factory=dict)
    target_entity: bool = True  # add the entity as target

    def service_data(self, entity_id: str) -> dict[str, Any]:
        data = dict(self.data)
        if self.target_entity:
            data["entity_id"] = entity_id
        return data


def is_one_shot(setpoint: dict | None) -> bool:
    return bool(setpoint) and setpoint["kind"] in ONE_SHOT_KINDS


def needs_admin(setpoint: dict | None) -> bool:
    """Setpoints that only an administrator may create (whatever ``admin_only`` says)."""
    if not setpoint:
        return False
    if setpoint["kind"] in ADMIN_ONLY_KINDS:
        return True
    action = setpoint.get("action", "")
    return action.split(".", 1)[0] in SENSITIVE_DOMAINS


def calls_for(entity_id: str, setpoint: dict) -> list[Call]:
    """Ordered service calls applying a setpoint (operating mode first, value second)."""
    domain = entity_id.split(".", 1)[0]
    kind = setpoint["kind"]

    if kind == "scene":
        return [Call("scene", "turn_on", {"entity_id": setpoint["scene"]}, target_entity=False)]
    if kind == "script":
        return [Call("script", "turn_on",
                     {"entity_id": setpoint["script"], "variables": setpoint.get("variables", {})},
                     target_entity=False)]
    if kind == "action":
        dom, svc = setpoint["action"].split(".", 1)
        return [Call(dom, svc, setpoint.get("data", {}), target_entity=setpoint.get("target_self", True))]

    if domain == "climate":
        if kind == "off":
            return [Call("climate", "set_hvac_mode", {"hvac_mode": "off"})]
        if kind == "hvac_mode":
            return [Call("climate", "set_hvac_mode", {"hvac_mode": setpoint["hvac_mode"]})]
        calls = []
        if setpoint.get("hvac_mode"):
            calls.append(Call("climate", "set_hvac_mode", {"hvac_mode": setpoint["hvac_mode"]}))
        if kind == "preset":
            calls.append(Call("climate", "set_preset_mode", {"preset_mode": setpoint["preset"]}))
        elif kind == "temperature":
            calls.append(Call("climate", "set_temperature", {"temperature": setpoint["temperature"]}))
        return calls

    if domain == "cover":
        if kind == "open":
            return [Call("cover", "open_cover")]
        if kind == "close":
            return [Call("cover", "close_cover")]
        if kind == "position":
            return [Call("cover", "set_cover_position", {"position": setpoint["position"]})]
        if kind == "tilt":
            return [Call("cover", "set_cover_tilt_position", {"tilt_position": setpoint["tilt"]})]

    if domain in ("light", "switch", "input_boolean", "fan", "media_player"):
        if kind == "off":
            return [Call(domain, "turn_off")]
        if kind == "on":
            data = {k: v for k, v in setpoint.items() if k != "kind"}
            if domain == "light" and "brightness" in data:
                data["brightness_pct"] = data.pop("brightness")
            return [Call(domain, "turn_on", data if domain in ("light", "fan") else {})]
        if kind == "auto" and domain == "light":
            calls = [Call("light", "turn_on")]
            if setpoint.get("adaptive_switch"):
                calls.append(Call("switch", "turn_on", {"entity_id": setpoint["adaptive_switch"]},
                                  target_entity=False))
            if setpoint.get("script"):
                calls.append(Call("script", "turn_on", {"entity_id": setpoint["script"]},
                                  target_entity=False))
            return calls
        if domain == "media_player" and kind == "volume":
            return [Call(domain, "volume_set", {"volume_level": setpoint["volume"] / 100})]
        if domain == "media_player" and kind == "source":
            return [Call(domain, "select_source", {"source": setpoint["source"]})]

    if domain == "water_heater":
        calls = []
        if setpoint.get("operation_mode"):
            calls.append(Call(domain, "set_operation_mode",
                              {"operation_mode": setpoint["operation_mode"]}))
        if setpoint.get("temperature") is not None:
            calls.append(Call(domain, "set_temperature", {"temperature": setpoint["temperature"]}))
        return calls
    if domain == "input_number" and kind == "value":
        return [Call(domain, "set_value", {"value": setpoint["value"]})]
    if domain == "input_select" and kind == "option":
        return [Call(domain, "select_option", {"option": setpoint["option"]})]

    raise ValueError(f"setpoint {kind!r} not supported for {domain}")


def requested(state: Any) -> tuple[str, dict]:
    """(state, attributes) the device was asked for.

    Versatile Thermostat exposes what it was asked (``requested_state``) separately from what
    it currently applies (window, safety…); compare against the request.
    """
    attrs = dict(state.attributes)
    req = attrs.get("requested_state")
    if isinstance(req, dict):
        merged = dict(attrs)
        if req.get("preset") is not None:
            merged["preset_mode"] = req["preset"]
        if req.get("target_temperature") is not None:
            merged["temperature"] = req["target_temperature"]
        hvac = req.get("hvac_mode") or state.state
        return str(hvac), merged
    return state.state, attrs


def matches(state: Any, setpoint: dict | None) -> bool | None:
    """Does the entity already satisfy the setpoint? None when it cannot be checked."""
    if setpoint is None or is_one_shot(setpoint) or state is None:
        return None
    if state.state in ("unavailable", "unknown"):
        return None
    value, attrs = requested(state)
    domain = state.entity_id.split(".", 1)[0]
    kind = setpoint["kind"]

    if domain == "climate":
        if kind == "off":
            return value == "off"
        if kind == "hvac_mode":
            return value == setpoint["hvac_mode"]
        if setpoint.get("hvac_mode") and value != setpoint["hvac_mode"]:
            return False
        if kind == "preset":
            return attrs.get("preset_mode") == setpoint["preset"]
        if kind == "temperature":
            current = attrs.get("temperature")
            return current is not None and abs(float(current) - setpoint["temperature"]) <= TEMPERATURE_TOLERANCE
    if domain == "cover":
        if value in ("opening", "closing"):
            return None  # still moving: compare once stopped
        position = attrs.get("current_position")
        if kind == "open":
            return value == "open" if position is None else position >= 100 - POSITION_TOLERANCE
        if kind == "close":
            return value == "closed" if position is None else position <= POSITION_TOLERANCE
        if kind == "position":
            return position is not None and abs(position - setpoint["position"]) <= POSITION_TOLERANCE
        if kind == "tilt":
            tilt = attrs.get("current_tilt_position")
            return tilt is not None and abs(tilt - setpoint["tilt"]) <= POSITION_TOLERANCE
    if domain in ("light", "switch", "input_boolean", "fan", "media_player"):
        if kind == "off":
            return value == "off"
        if kind in ("on", "auto"):
            if value != "on" and not (domain == "media_player" and value not in ("off", "standby")):
                return False
            if domain == "light" and kind == "on" and "brightness" in setpoint:
                current = attrs.get("brightness")
                if current is None:
                    return False
                if abs(round(current * 100 / 255) - setpoint["brightness"]) > BRIGHTNESS_TOLERANCE:
                    return False
            if domain == "light" and kind == "on":
                if setpoint.get("effect") and attrs.get("effect") != setpoint["effect"]:
                    return False
                kelvin = setpoint.get("color_temp_kelvin")
                if kelvin is not None:
                    current_k = attrs.get("color_temp_kelvin")
                    if current_k is None or abs(current_k - kelvin) > COLOR_TEMP_TOLERANCE:
                        return False
            if domain == "fan" and "percentage" in setpoint:
                return attrs.get("percentage") == setpoint["percentage"]
            return True
        if kind == "volume":
            level = attrs.get("volume_level")
            return level is not None and abs(level * 100 - setpoint["volume"]) <= 2
        if kind == "source":
            return attrs.get("source") == setpoint["source"]
    if domain == "water_heater":
        ok = True
        if setpoint.get("operation_mode"):
            ok &= value == setpoint["operation_mode"]
        if setpoint.get("temperature") is not None:
            current = attrs.get("temperature")
            ok &= current is not None and abs(float(current) - setpoint["temperature"]) <= TEMPERATURE_TOLERANCE
        return ok
    if domain == "input_number" and kind == "value":
        try:
            return abs(float(value) - float(setpoint["value"])) < 1e-6
        except ValueError:
            return False
    if domain == "input_select" and kind == "option":
        return value == setpoint["option"]
    return None


def snapshot(state: Any) -> dict | None:
    """Setpoint reproducing the current state (used for the "previous state" default)."""
    if state is None or state.state in ("unavailable", "unknown"):
        return None
    value, attrs = requested(state)
    domain = state.entity_id.split(".", 1)[0]
    if domain == "climate":
        if value == "off":
            return {"kind": "off"}
        preset = attrs.get("preset_mode")
        if preset and preset not in ("none", "temporary", "permanent"):
            return {"kind": "preset", "preset": preset, "hvac_mode": value}
        if attrs.get("temperature") is not None:
            return {"kind": "temperature", "temperature": attrs["temperature"], "hvac_mode": value}
        return {"kind": "hvac_mode", "hvac_mode": value}
    if domain == "cover":
        if attrs.get("current_position") is not None:
            return {"kind": "position", "position": attrs["current_position"]}
        return {"kind": "open" if value == "open" else "close"}
    if domain in ("light", "switch", "input_boolean", "fan", "media_player"):
        if value == "off":
            return {"kind": "off"}
        setpoint: dict[str, Any] = {"kind": "on"}
        if domain == "light" and attrs.get("brightness") is not None:
            setpoint["brightness"] = round(attrs["brightness"] * 100 / 255)
        if domain == "light" and attrs.get("effect") not in (None, "off"):
            setpoint["effect"] = attrs["effect"]
        elif domain == "light" and attrs.get("color_temp_kelvin") is not None:
            setpoint["color_temp_kelvin"] = attrs["color_temp_kelvin"]
        if domain == "fan" and attrs.get("percentage") is not None:
            setpoint["percentage"] = attrs["percentage"]
        return setpoint
    if domain == "water_heater":
        return {"kind": "water_heater", "operation_mode": value, "temperature": attrs.get("temperature")}
    if domain == "input_number":
        return {"kind": "value", "value": float(value)}
    if domain == "input_select":
        return {"kind": "option", "option": value}
    return None
