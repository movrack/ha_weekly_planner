"""Home Assistant rights of the user who saves an action (owner, 2026-11-21).

Weekly Planner adds no rights of its own: a user may store an action only if Home Assistant
would let that same user make the call. The engine later calls services with a system context
(no user), where Home Assistant checks nothing, so this save-time check is what keeps the
planner from giving anybody more power than plain Home Assistant does.

What Home Assistant checks when a call carries a user (``homeassistant/helpers/service.py``):

* an administrator passes everything;
* a service registered with ``async_register_admin_service`` (handler wrapped in
  ``_async_admin_handler``) or as an entity service with ``admin_only=True`` refuses non-admins;
* an entity service refuses a non-admin who may not control (``POLICY_CONTROL``) a target entity.

Limit: a service that checks rights inside its own code (for example with ``verify_domain_control``
or a hand-written test of ``user.is_admin``) cannot be recognised from outside; only the targeted
entities are checked for it.
"""

from __future__ import annotations

from collections.abc import Iterable, Iterator
from functools import partial
from typing import Any

from homeassistant.auth.permissions.const import POLICY_CONTROL, POLICY_READ
from homeassistant.core import HomeAssistant

from .actions import resolve_action
from .modes import profile_slots

_SERVICE_HELPERS = "homeassistant.helpers.service"


def _is_admin_service(hass: HomeAssistant, service: str) -> bool:
    """Is the service registered so that Home Assistant refuses it to non-administrators?"""
    domain, _, name = service.partition(".")
    handler = hass.services.async_services_internal().get(domain, {}).get(name)
    target = getattr(getattr(handler, "job", None), "target", None)
    if not isinstance(target, partial):
        return False
    func = target.func
    if getattr(func, "__module__", None) != _SERVICE_HELPERS:
        return False
    name = getattr(func, "__name__", "")
    return name == "_async_admin_handler" or (
        name == "entity_service_call" and bool(target.keywords.get("admin_only")))


def program_actions(program: dict, labels: dict[str, dict],
                    only_label: str | None = None) -> Iterator[tuple[str, dict]]:
    """(device, action) pairs the program may apply; ``only_label`` keeps those of one label."""
    every = [e["entity_id"] for e in program["entities"]]
    used: dict[str, set[str]] = {entity_id: set() for entity_id in every}
    for entity in program["entities"]:
        if entity.get("default_label"):
            used[entity["entity_id"]].add(entity["default_label"])
    for profile in program["profiles"]:
        for slot in profile_slots(profile):
            for entity_id in slot.get("entities") or every:
                if entity_id in used:
                    used[entity_id].add(slot["label"])
    for entity_id, label_ids in used.items():
        for label_id in label_ids:
            if only_label is None or label_id == only_label:
                action = resolve_action(program, entity_id, label_id, labels)
                if action:
                    yield entity_id, action


def allowed(hass: HomeAssistant, user: Any, pairs: Iterable[tuple[str | None, dict | None]]) -> bool:
    """Would Home Assistant let ``user`` make each call (``device`` None: the action alone)?"""
    if user.is_admin:
        return True
    check = user.permissions.check_entity
    for device, action in pairs:
        if not action:
            continue
        if action.get("kind") == "scene":
            targets = [action["scene"]]
        else:
            if _is_admin_service(hass, action["service"]):
                return False
            target = action.get("target_entity_id", device)
            targets = [target] if target else []
        if not all(check(entity_id, POLICY_CONTROL) for entity_id in targets):
            return False
        sources = (action.get("data_sources") or {}).values()
        if not all(check(source["entity_id"], POLICY_READ) for source in sources):
            return False
    return True


def program_allowed(hass: HomeAssistant, user: Any, program: dict, labels: dict[str, dict]) -> bool:
    """May ``user`` store this program: every action it applies is one they could call themselves."""
    return allowed(hass, user, program_actions(program, labels))


def label_allowed(hass: HomeAssistant, user: Any, label: dict, programs: list[dict],
                  labels: dict[str, dict]) -> bool:
    """May ``user`` store this label: its action alone, then on every device whose programs use it."""
    if not allowed(hass, user, [(None, label["action"])]):
        return False
    labels = {**labels, label["id"]: label}
    return all(allowed(hass, user, program_actions(p, labels, only_label=label["id"]))
               for p in programs)
