"""Validation of programs and modes sent by the card (spec § 8)."""

from __future__ import annotations

from datetime import date
from typing import Any
from zoneinfo import ZoneInfo

import voluptuous as vol

from homeassistant.helpers import config_validation as cv

from .actions import needs_admin
from .timeline import SUN_EVENTS, day_occurrences, parse_clock


def _clock(value: Any) -> str:
    parse_clock(str(value))
    return str(value)


TIME_SPEC = vol.Any(
    vol.Schema({vol.Required("time"): _clock}),
    vol.Schema({
        vol.Required("sun"): vol.In(SUN_EVENTS),
        vol.Optional("offset", default=0): vol.All(int, vol.Range(min=-240, max=240)),
        vol.Optional("earliest"): _clock,
        vol.Optional("latest"): _clock,
    }),
)

ACTION = vol.Any(
    vol.Schema({
        vol.Required("kind"): "service",
        vol.Required("service"): str,
        vol.Optional("data", default=dict): dict,
    }),
    vol.Schema({
        vol.Required("kind"): "scene",
        vol.Required("scene"): vol.Match(r"^scene\.[a-z0-9_]+$"),
    }),
)

LABEL = vol.Schema({
    vol.Required("id"): str,
    vol.Required("name"): vol.All(str, vol.Length(min=1, max=30)),
    vol.Optional("color", default="#9e9e9e"): vol.Match(r"^#[0-9a-fA-F]{6}$"),
    vol.Required("action"): ACTION,
})

CONDITION = vol.Schema({
    vol.Required("entity_id"): cv.entity_id,
    vol.Optional("attribute"): vol.Any(None, str),
    vol.Optional("op", default="eq"): vol.In(("eq", "ne", "lt", "gt")),
    vol.Required("value"): vol.Any(str, int, float, bool),
})

SLOT = vol.Schema({
    vol.Required("id"): str,
    vol.Required("start"): TIME_SPEC,
    vol.Optional("end"): vol.Any(None, TIME_SPEC),
    vol.Optional("conditions", default=list): [CONDITION],
    vol.Optional("color"): vol.Any(None, str),
    vol.Required("label"): str,
})

PROFILE = vol.Schema({
    vol.Required("id"): str,
    vol.Required("name"): vol.All(str, vol.Length(min=1, max=40)),
    vol.Required("days"): vol.All([[SLOT]], vol.Length(min=7, max=7)),
})

ENTITY = vol.Schema({
    vol.Required("entity_id"): cv.entity_id,
    vol.Optional("default_label", default=None): vol.Any(None, str),
    vol.Optional("label_overrides", default=dict): {str: ACTION},
})

PROGRAM = vol.Schema({
    vol.Required("id"): str,
    vol.Optional("revision", default=0): int,
    vol.Optional("created_at"): str,
    vol.Required("name"): vol.All(str, vol.Length(min=1, max=60)),
    vol.Optional("icon"): vol.Any(None, str),
    vol.Optional("area"): vol.Any(None, str),
    vol.Optional("priority", default=10): vol.All(int, vol.Range(min=1, max=100)),
    vol.Optional("enabled", default=True): bool,
    vol.Optional("reapply", default=True): bool,
    vol.Optional("conditions", default=list): [CONDITION],
    vol.Required("entities"): vol.All([ENTITY], vol.Length(min=1)),
    vol.Optional("active_profile"): vol.Any(None, str),
    vol.Required("profiles"): vol.All([PROFILE], vol.Length(min=1)),
})

class ProgramError(vol.Invalid):
    """A program breaks a rule that the schema cannot express."""


def _check_service(hass: Any, descriptions: dict | None, entity_id: str | None, action: dict) -> None:
    """A service action: known service, data is a dict, usable on the entity (when there is one)."""
    service = action.get("service")
    if not isinstance(service, str) or service.count(".") != 1:
        raise ProgramError(f"unknown_service:{service}")
    if not isinstance(action.get("data", {}), dict):
        raise ProgramError(f"invalid_service_data:{service}")
    if hass is None:
        return
    domain, name = service.split(".")
    if not hass.services.has_service(domain, name):
        raise ProgramError(f"unknown_service:{service}")
    if entity_id is not None and not service_accepts(descriptions, service, entity_id):
        raise ProgramError(f"service_not_for_entity:{service}:{entity_id}")


def service_accepts(descriptions: dict | None, service: str, entity_id: str) -> bool:
    """Does the service suit the entity: its own domain, or a target that accepts the domain."""
    domain, _, name = service.partition(".")
    entity_domain = entity_id.split(".", 1)[0]
    return domain == entity_domain or _target_accepts(descriptions, domain, name, entity_domain)


def _target_accepts(descriptions: dict | None, domain: str, name: str, entity_domain: str) -> bool:
    """Does the service target accept entities of this domain (services.yaml descriptions)?"""
    if descriptions is None:
        return True  # descriptions unavailable: Home Assistant refuses bad targets at call time
    target = (descriptions.get(domain, {}).get(name) or {}).get("target")
    if not target:
        return False
    entity = target.get("entity")
    filters = entity if isinstance(entity, list) else [entity or {}]
    return any(not f.get("domain") or entity_domain in _as_list(f["domain"]) for f in filters)


def _as_list(value: Any) -> list:
    return value if isinstance(value, list) else [value]


def check_label(label: dict, hass: Any = None, descriptions: dict | None = None) -> dict:
    """Schema of a label; its service must exist (the entity is checked where it is used)."""
    label = LABEL(label)
    if label["action"]["kind"] == "service":
        _check_service(hass, descriptions, None, label["action"])
    return label


def check_program(program: dict, labels: dict[str, dict], hass: Any = None, descriptions: dict | None = None) -> dict:
    """Schema + semantic rules: unique profile names, known labels, valid overrides, no overlap on a day."""
    program = PROGRAM(program)
    names = [p["name"] for p in program["profiles"]]
    if len(set(names)) != len(names):
        raise ProgramError("duplicate_profile_name")
    for entity in program["entities"]:
        label_id = entity["default_label"]
        if label_id is not None and label_id not in labels:
            raise ProgramError(f"unknown_label:{label_id}")
        for label_id, action in entity["label_overrides"].items():
            if label_id not in labels:
                raise ProgramError(f"unknown_label:{label_id}")
            if action["kind"] == "service":
                _check_service(hass, descriptions, entity["entity_id"], action)
    for profile in program["profiles"]:
        for day_slots in profile["days"]:
            for slot in day_slots:
                if slot["label"] not in labels:
                    raise ProgramError(f"unknown_label:{slot['label']}")
            _check_overlaps(day_slots)
    return program


def _check_overlaps(day_slots: list[dict]) -> None:
    """Fixed-time slots of a day may not overlap (sun slots are trimmed at run time)."""
    fixed = [s for s in day_slots if "time" in s["start"] and (s.get("end") or {}).get("time")]
    tz = ZoneInfo("UTC")
    occ = day_occurrences(fixed, date(2026, 1, 5), tz, lambda e, d: None)
    if any(o.ignored == "overlap" for o in occ) or _trimmed(fixed, occ):
        raise ProgramError("overlapping_slots")


def _trimmed(slots: list[dict], occ: list) -> bool:
    starts = {s["id"]: s["start"]["time"] for s in slots}
    return any(o.runs and o.start.strftime("%H:%M") != starts[o.slot_id] for o in occ)


def admin_required(program: dict, labels: dict[str, dict]) -> bool:
    """Does the program use actions only an administrator may schedule (through a label or an override)?"""
    if any(needs_admin(a) for e in program["entities"] for a in e["label_overrides"].values()):
        return True
    used = {e["default_label"] for e in program["entities"]}
    used |= {s["label"] for p in program["profiles"] for d in p["days"] for s in d}
    return any(needs_admin((labels.get(label_id) or {}).get("action")) for label_id in used)


def label_users(programs: list[dict], label_id: str) -> list[str]:
    """Names of the programs using a label (slots of any profile, defaults, overrides)."""
    users = []
    for program in programs:
        used = any(e.get("default_label") == label_id or label_id in (e.get("label_overrides") or {})
                   for e in program["entities"])
        used = used or any(s.get("label") == label_id for p in program["profiles"] for d in p["days"] for s in d)
        if used:
            users.append(program["name"])
    return users
