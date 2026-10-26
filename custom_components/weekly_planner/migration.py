"""Migration of the stored data from version 1 (typed setpoints, common modes) to version 2.

Version 2 only knows actions: a Home Assistant service on the entity, or a scene
(docs/SPEC.md § 8.1). Pure functions, no Home Assistant objects.
"""

from __future__ import annotations

from copy import deepcopy
import logging
from typing import Any
import uuid

_LOGGER = logging.getLogger(__name__)

RUNTIME_DROPPED = (
    "override", "grace_until", "attempt", "refused", "adaptive_manual", "permanent_set",
    "outside", "previous_segment", "oneshot",
)


def _service(service: str, data: dict | None = None) -> dict:
    action: dict[str, Any] = {"kind": "service", "service": service}
    if data:
        action["data"] = data
    return action


def convert_setpoint(entity_id: str, sp: Any) -> dict | None:
    """Action equivalent to a version 1 setpoint on an entity, None when there is none."""
    if not isinstance(sp, dict) or "kind" not in sp:
        return None
    domain = entity_id.split(".", 1)[0]
    kind = sp["kind"]
    if kind == "scene":
        return {"kind": "scene", "scene": sp["scene"]}
    if kind == "service":
        return _service(sp["service"], dict(sp.get("data") or {}))
    if kind == "action":
        return _service(sp["action"], dict(sp.get("data") or {}))
    if domain == "climate":
        if kind == "temperature":
            return _service("climate.set_temperature", {"temperature": sp["temperature"]})
        if kind == "preset":
            return _service("climate.set_preset_mode", {"preset_mode": sp["preset"]})
        if kind == "off":
            return _service("climate.set_hvac_mode", {"hvac_mode": "off"})
        if kind == "hvac_mode":
            return _service("climate.set_hvac_mode", {"hvac_mode": sp["hvac_mode"]})
    if domain == "cover":
        if kind == "open":
            return _service("cover.open_cover")
        if kind == "close":
            return _service("cover.close_cover")
        if kind == "position":
            return _service("cover.set_cover_position", {"position": sp["position"]})
        if kind == "tilt":
            return _service("cover.set_cover_tilt_position", {"tilt_position": sp["tilt"]})
    if domain in ("light", "switch", "input_boolean", "fan", "media_player"):
        if kind == "off":
            return _service(f"{domain}.turn_off")
        if kind in ("on", "auto"):
            data: dict[str, Any] = {}
            if domain == "light" and kind == "on":
                if sp.get("brightness") is not None:
                    data["brightness_pct"] = sp["brightness"]
                if sp.get("color_temp_kelvin") is not None:
                    data["color_temp_kelvin"] = sp["color_temp_kelvin"]
                if sp.get("effect"):
                    data["effect"] = sp["effect"]
            if domain == "fan" and sp.get("percentage") is not None:
                data["percentage"] = sp["percentage"]
            return _service(f"{domain}.turn_on", data)
        if domain == "media_player" and kind == "volume":
            return _service("media_player.volume_set", {"volume_level": sp["volume"] / 100})
        if domain == "media_player" and kind == "source":
            return _service("media_player.select_source", {"source": sp["source"]})
    if domain == "water_heater":
        if sp.get("temperature") is not None:
            return _service("water_heater.set_temperature", {"temperature": sp["temperature"]})
        if sp.get("operation_mode"):
            return _service("water_heater.set_operation_mode", {"operation_mode": sp["operation_mode"]})
    if domain == "input_number" and kind == "value":
        return _service("input_number.set_value", {"value": sp["value"]})
    if domain == "input_select" and kind == "option":
        return _service("input_select.select_option", {"option": sp["option"]})
    return None


def _mode_setpoint(modes: dict[str, dict], mode_id: str | None, entity_id: str) -> dict | None:
    mode = modes.get(mode_id or "")
    if mode is None:
        return None
    return (mode.get("exceptions") or {}).get(entity_id, mode.get("value"))


# 12 distinct colours; new labels take the next unused one
PALETTE = (
    "#f44336", "#ff9800", "#ffc107", "#8bc34a", "#26a69a", "#03a9f4",
    "#3f51b2", "#9c27b0", "#e91e63", "#795548", "#607d8b", "#009688",
)

NAMES = {
    "fr": {"open": "Ouvrir", "close": "Fermer", "position": "Position {n} %", "on": "Allumer", "off": "Éteindre"},
    "en": {"open": "Open", "close": "Close", "position": "Position {n} %", "on": "Turn on", "off": "Turn off"},
}


def _number(value: Any, language: str = "en") -> str:
    text = f"{value:g}" if isinstance(value, (int, float)) else str(value)
    return text.replace(".", ",") if language.startswith("fr") else text


def label_name(action: dict, language: str = "en", names: dict[str, str] | None = None) -> str:
    """Short name generated from an action: "18 °C", "Fermer", "Position 30 %", the scene name…"""
    words = NAMES["fr" if language.startswith("fr") else "en"]
    if action["kind"] == "scene":
        return action["scene"].split(".", 1)[1].replace("_", " ").capitalize()
    service, data = action["service"], action.get("data") or {}
    name = service.split(".", 1)[1]
    if service.endswith(".set_temperature") and "temperature" in data:
        return f"{_number(data['temperature'], language)} °C"
    if service == "cover.open_cover":
        return words["open"]
    if service == "cover.close_cover":
        return words["close"]
    if service == "cover.set_cover_position" and "position" in data:
        return words["position"].format(n=_number(data["position"], language))
    if name in ("turn_on", "turn_off") and service.split(".")[0] in ("light", "switch", "input_boolean", "fan"):
        text = words["on" if name == "turn_on" else "off"]
        if "brightness_pct" in data:
            text += f" {_number(data['brightness_pct'], language)} %"
        return text
    return (names or {}).get(service, service)


def label_color(action: dict, position: int) -> str:
    """Warm for hot / on / open, cool or grey for cold / off / close, else the palette in order."""
    if action["kind"] == "service":
        service, data = action["service"], action.get("data") or {}
        if service.endswith(".set_temperature") and isinstance(data.get("temperature"), (int, float)):
            return _temperature_color(data["temperature"])
        if service in ("cover.open_cover",) or service.endswith(".turn_on"):
            return "#ffb300"
        if service in ("cover.close_cover",) or service.endswith(".turn_off"):
            return "#607d8b"
    return PALETTE[position % len(PALETTE)]


TEMPERATURE_STOPS = ((10, (21, 101, 192)), (16, (66, 165, 245)), (18, (255, 193, 7)), (21, (255, 152, 0)), (24, (244, 67, 54)))


def _temperature_color(value: float) -> str:
    """Blue when cold, amber then orange, red when hot (linear between fixed stops)."""
    value = max(TEMPERATURE_STOPS[0][0], min(TEMPERATURE_STOPS[-1][0], value))
    for (t0, c0), (t1, c1) in zip(TEMPERATURE_STOPS, TEMPERATURE_STOPS[1:]):
        if value <= t1:
            f = (value - t0) / (t1 - t0)
            return "#{:02x}{:02x}{:02x}".format(*(round(a + (b - a) * f) for a, b in zip(c0, c1)))
    return "#f44336"


def migrate_config_v1(data: dict, language: str = "en", names: dict[str, str] | None = None) -> dict:
    """Configuration of version 1 -> version 2: modes resolved and setpoints converted to actions,
    identical actions merged into ONE shared label, slots and defaults pointing at labels."""
    data = deepcopy(data)
    modes = {m["id"]: m for m in data.pop("modes", [])}
    labels: list[dict] = []
    by_action: dict[str, dict] = {}
    previous: list[str] = []
    dropped: list[str] = []

    def label_of(action: dict) -> str:
        import json

        key = json.dumps(action, sort_keys=True)
        if key not in by_action:
            name = label_name(action, language, names)
            # Same names are fine ("Allumer" for a lamp and for a plug): a device only lists the
            # labels it is compatible with.
            by_action[key] = {"id": uuid.uuid4().hex[:12], "name": name,
                              "color": label_color(action, len(labels)), "action": action}
            labels.append(by_action[key])
        return by_action[key]["id"]

    for program in data.get("programs", []):
        program.pop("main_type", None)
        for entity in program["entities"]:
            eid = entity["entity_id"]
            entity.pop("force_permanent", None)
            entity.pop("grace_s", None)
            default = entity.pop("default", None) or {"kind": "none"}
            kind = default.get("kind", "none")
            action = None
            if kind == "mode":
                action = convert_setpoint(eid, _mode_setpoint(modes, default.get("value"), eid))
            elif kind == "setpoint":
                action = convert_setpoint(eid, default.get("value"))
            elif kind == "previous":
                previous.append(f"{program['name']}: {eid}")
            entity["default_label"] = label_of(action) if action else None
            entity["label_overrides"] = {}
        entity_ids = [e["entity_id"] for e in program["entities"]]
        for profile in program["profiles"]:
            for day in profile["days"]:
                kept = []
                for slot in day:
                    actions = slot.pop("actions", None) or {}
                    by_type = actions.get("by_type") or {}
                    resolved: dict[str, dict] = {}
                    for eid in entity_ids:
                        direct = (actions.get("by_entity") or {}).get(eid)
                        setpoint = direct if direct is not None else _mode_setpoint(
                            modes, by_type.get(eid.split(".", 1)[0]), eid)
                        if (action := convert_setpoint(eid, setpoint)) is not None:
                            resolved[eid] = action
                    if not resolved:
                        dropped.append(f"{program['name']}: {slot.get('id')}")
                        continue
                    first = next(iter(resolved.values()))
                    slot["label"] = label_of(first)
                    for entity in program["entities"]:
                        action = resolved.get(entity["entity_id"])
                        if action is not None and action != first:
                            entity["label_overrides"].setdefault(slot["label"], action)
                    kept.append(slot)
                day[:] = kept
    data["labels"] = labels
    if previous:
        _LOGGER.warning(
            "Weekly Planner 0.6: the default \"previous state\" no longer exists, "
            "these entities now have no default: %s", "; ".join(previous))
    if dropped:
        _LOGGER.warning("Weekly Planner 0.6: slots without any convertible action were removed: %s", "; ".join(dropped))
    return data


def migrate_runtime_v1(data: dict) -> dict:
    """Runtime of version 1 -> version 2: manual-change bookkeeping and Adaptive Lighting state dropped."""
    data = deepcopy(data)
    data.pop("adaptive", None)
    for rt in (data.get("entities") or {}).values():
        for key in RUNTIME_DROPPED:
            rt.pop(key, None)
        if (retry := rt.get("service_retry")) and "setpoint" in retry:
            retry["action"] = retry.pop("setpoint")
        rt.pop("suppressed", None)
        if isinstance(rt.get("target"), dict) and rt["target"].get("kind") not in ("service", "scene"):
            rt["target"] = None  # rebuilt at the next recompute
    return data
