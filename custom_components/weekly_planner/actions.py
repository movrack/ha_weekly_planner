"""Actions: what a slot (or a default) does to an entity.

A label (shared by all programs) holds an action; slots and defaults only reference labels.
An action is a small dict, in one of two forms (docs/SPEC.md § 6):

* ``{"kind": "service", "service": "climate.set_temperature", "data": {"temperature": 18}}``
  a Home Assistant service called with the entity as its target;
* ``{"kind": "scene", "scene": "scene.evening"}``.

:func:`resolve_action` is the single place that turns a label reference into an action.
"""

from __future__ import annotations

from collections.abc import Callable
from copy import deepcopy
from dataclasses import dataclass, field
import math
from typing import Any

from homeassistant.exceptions import ServiceValidationError

# Domains whose services only administrators may schedule (spec § 9).
SENSITIVE_DOMAINS = frozenset({
    "homeassistant", "hassio", "alarm_control_panel", "lock", "alarmo",
    "shell_command", "python_script", "pyscript", "rest_command",
})


@dataclass(frozen=True, slots=True)
class Call:
    """One service call."""

    domain: str
    service: str
    data: dict[str, Any] = field(default_factory=dict)
    as_target: bool = True  # pass the entity as the call target

    target_entity_id: str | None = None

    def service_data(self) -> dict[str, Any]:
        return dict(self.data)


def resolve_action(
    program: dict,
    entity_id: str,
    label_id: str | None,
    labels: dict[str, dict],
    accepts: Callable[[str, dict], bool] | None = None,
) -> dict | None:
    """Action an entity of a program gets from a label: the ONE place where actions are resolved.

    The entity's own value for the label (``label_overrides``) wins over the action of the label.
    Returns None when there is no label, when the label is unknown, or when the action does not
    suit the entity (``accepts(entity_id, action)`` is False, or its service is not in the entity's
    ``allowed_services`` when that list is not empty or ``restrict_services`` is true): the entity
    is skipped. Legacy missing/empty lists remain unrestricted; an explicitly restricted empty list
    allows no service actions. Scenes are unaffected by this service filter.
    """
    label = labels.get(label_id or "")
    if label is None:
        return None
    action = label.get("action")
    for entity in program["entities"]:
        if entity["entity_id"] == entity_id:
            action = (entity.get("label_overrides") or {}).get(label["id"], action)
            allowed = entity.get("allowed_services") or []
            if (allowed or entity.get("restrict_services", False)) and action and action.get("kind") == "service" and action.get("service") not in allowed:
                return None  # the owner left this service out for the device: incompatible
            break
    if not action or (accepts is not None and not accepts(entity_id, action)):
        return None
    return action


def needs_admin(action: dict | None) -> bool:
    """Actions that only an administrator may create (whatever ``admin_only`` says)."""
    if not action or action.get("kind") != "service":
        return False
    return str(action.get("service", "")).split(".", 1)[0] in SENSITIVE_DOMAINS


def source_value(source: dict, get_state: Callable[[str], Any]) -> Any:
    """Read a source at call time; never substitute an unavailable value or a stored fallback."""
    state = get_state(source["entity_id"])
    if state is None or state.state in ("unknown", "unavailable"):
        raise ServiceValidationError("Value source is unavailable")
    attribute = source.get("attribute")
    value = state.attributes.get(attribute) if attribute else state.state
    if value is None or value in ("unknown", "unavailable", ""):
        raise ServiceValidationError("Value source is missing or unavailable")
    kind = source["type"]
    if kind == "number":
        if isinstance(value, bool) or not isinstance(value, (str, int, float)):
            raise ServiceValidationError("Value source is not a number")
        try:
            value = float(value)
        except (ValueError, OverflowError) as err:
            raise ServiceValidationError("Value source is not a number") from err
        if not math.isfinite(value):
            raise ServiceValidationError("Value source is not a finite number")
        return value
    if kind == "boolean":
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)) and value in (0, 1):
            return bool(value)
        if isinstance(value, str) and value.lower() in ("on", "off", "true", "false", "yes", "no", "1", "0"):
            return value.lower() in ("on", "true", "yes", "1")
        raise ServiceValidationError("Value source is not a boolean")
    if kind == "string":
        if not isinstance(value, (str, int, float, bool)):
            raise ServiceValidationError("Value source is not text")
        if isinstance(value, float) and not math.isfinite(value):
            raise ServiceValidationError("Value source is not finite")
        return str(value)
    if kind != "native":
        raise ServiceValidationError("Unknown value source type")
    _check_native_source(value)
    return deepcopy(value)


def _check_native_source(value: Any) -> None:
    """Native attribute values must remain valid service-data values, including nested numbers."""
    if isinstance(value, float) and not math.isfinite(value):
        raise ServiceValidationError("Value source is not finite")
    if isinstance(value, dict):
        for item in value.values():
            _check_native_source(item)
    elif isinstance(value, list):
        for item in value:
            _check_native_source(item)
    elif value is not None and not isinstance(value, (str, int, float, bool)):
        raise ServiceValidationError("Unsupported native value source")


def call_for(entity_id: str, action: dict, get_state: Callable[[str], Any] | None = None) -> Call:
    """The service call that applies an action to an entity."""
    if action["kind"] == "scene":
        return Call("scene", "turn_on", {"entity_id": action["scene"]}, as_target=False)
    domain, service = action["service"].split(".", 1)
    data = dict(action.get("data") or {})
    for key, source in action.get("data_sources", {}).items():
        if get_state is None:
            raise ServiceValidationError("Value sources require Home Assistant state access")
        try:
            data[key] = source_value(source, get_state)
        except (KeyError, TypeError, AttributeError) as err:
            raise ServiceValidationError(f"Invalid value source for {key}") from err
    return Call(domain, service, data, target_entity_id=action.get("target_entity_id", entity_id))
