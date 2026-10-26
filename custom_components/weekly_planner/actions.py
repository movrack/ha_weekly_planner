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
from dataclasses import dataclass, field
from typing import Any

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
    ``allowed_services`` when that list is not empty): the entity is skipped.
    """
    label = labels.get(label_id or "")
    if label is None:
        return None
    action = label.get("action")
    for entity in program["entities"]:
        if entity["entity_id"] == entity_id:
            action = (entity.get("label_overrides") or {}).get(label["id"], action)
            allowed = entity.get("allowed_services") or []
            if allowed and action and action.get("kind") == "service" and action.get("service") not in allowed:
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


def call_for(entity_id: str, action: dict) -> Call:
    """The service call that applies an action to an entity."""
    if action["kind"] == "scene":
        return Call("scene", "turn_on", {"entity_id": action["scene"]}, as_target=False)
    domain, service = action["service"].split(".", 1)
    return Call(domain, service, dict(action.get("data") or {}))
