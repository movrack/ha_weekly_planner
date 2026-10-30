"""Validation of programs and modes sent by the card (spec § 8)."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import voluptuous as vol

from homeassistant.helpers import config_validation as cv

from .actions import needs_admin
from .timeline import SUN_EVENTS, day_occurrences, parse_clock


def _clock(value: Any) -> str:
    parse_clock(str(value))
    return str(value)


def _random_minutes(value: Any) -> int:
    if type(value) is not int or not 0 <= value <= 240:
        raise vol.Invalid("invalid_random_minutes")
    return value


RANDOM_MINUTES = _random_minutes

TIME_SPEC = vol.Any(
    vol.Schema({vol.Required("time"): _clock, vol.Optional("random_minutes"): RANDOM_MINUTES}),
    vol.Schema({
        vol.Required("sun"): vol.In(SUN_EVENTS),
        vol.Optional("random_minutes"): RANDOM_MINUTES,
        vol.Optional("offset", default=0): vol.All(int, vol.Range(min=-240, max=240)),
        vol.Optional("earliest"): _clock,
        vol.Optional("latest"): _clock,
    }),
)

# Targets are explicit action properties; service data may not redirect them.
TARGET_KEYS = ("entity_id", "device_id", "area_id", "floor_id", "label_id")


def _service_data(value: Any) -> dict:
    if not isinstance(value, dict):
        raise vol.Invalid("invalid_service_data")
    if any(key in value for key in TARGET_KEYS):
        raise vol.Invalid("service_data_target")
    return value


VALUE_SOURCE = vol.Schema({
    vol.Required("entity_id"): cv.entity_id,
    vol.Optional("attribute"): vol.All(str, vol.Length(min=1, max=255)),
    vol.Required("type"): vol.In(("number", "boolean", "string", "native")),
})


def _service_sources(value: Any) -> dict:
    if not isinstance(value, dict):
        raise vol.Invalid("invalid_service_data_sources")
    if any(key in value for key in (*TARGET_KEYS, "target")):
        raise vol.Invalid("service_data_target")
    return vol.Schema({vol.All(str, vol.Length(min=1, max=255)): VALUE_SOURCE})(value)


ACTION = vol.Any(
    vol.Schema({
        vol.Required("kind"): "service",
        vol.Required("service"): str,
        vol.Optional("target_entity_id"): cv.entity_id,
        vol.Optional("data", default=dict): _service_data,
        vol.Optional("data_sources"): _service_sources,
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
    vol.Optional("conditions", default=list): vol.All([CONDITION], vol.Length(max=10)),
    vol.Optional("color"): vol.Any(None, str),
    vol.Required("label"): str,
})

PROFILE = vol.Schema({
    vol.Required("id"): str,
    vol.Required("name"): vol.All(str, vol.Length(min=1, max=40)),
    vol.Required("days"): vol.All([vol.All([SLOT], vol.Length(max=50))], vol.Length(min=7, max=7)),
})

ENTITY = vol.Schema({
    vol.Required("entity_id"): cv.entity_id,
    vol.Optional("default_label", default=None): vol.Any(None, str),
    vol.Optional("label_overrides", default=dict): {str: ACTION},
    # Legacy empty lists allow all services; explicit restriction also permits selecting none.
    vol.Optional("allowed_services", default=list): [vol.All(str, vol.Match(r"^[a-z0-9_]+\.[a-z0-9_]+$"))],
    vol.Optional("restrict_services", default=False): bool,
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
    vol.Required("entities"): vol.All([ENTITY], vol.Length(min=1, max=100)),
    vol.Optional("active_profile"): vol.Any(None, str),
    vol.Optional("mode_source"): vol.Schema({
        vol.Required("entity_id"): cv.entity_id,
        vol.Required("mappings"): vol.All({vol.All(str, vol.Length(min=1)): vol.All(str, vol.Length(min=1))}, vol.Length(min=1)),
    }),
    vol.Required("profiles"): vol.All([PROFILE], vol.Length(min=1, max=20)),
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
    entity_id = action.get("target_entity_id", entity_id)
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
    source = program.get("mode_source")
    if source:
        profile_ids = {p["id"] for p in program["profiles"]}
        if any(pid not in profile_ids for pid in source["mappings"].values()):
            raise ProgramError("unknown_mode_profile")
        if any(not state.strip() for state in source["mappings"]):
            raise ProgramError("empty_mode_state")
        if hass is not None:
            from homeassistant.helpers import entity_registry as er
            from .const import DOMAIN
            entry = er.async_get(hass).async_get(source["entity_id"])
            if entry and entry.platform == DOMAIN:
                raise ProgramError("circular_mode_source")
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
        _check_week_overlaps(profile["days"])
    return program


def _fixed_intervals(day_slots: list[dict], day: date) -> list[tuple]:
    """Reserve each fixed interval's entire random window, before any runtime trim."""
    intervals = []
    for slot in day_slots:
        if "time" not in slot["start"] or not (slot.get("end") or {}).get("time"):
            continue
        base = {**slot, "start": {"time": slot["start"]["time"]},
                "end": {"time": slot["end"]["time"]}}
        occ = day_occurrences([base], day, ZoneInfo("UTC"), lambda e, d: None)[0]
        randomized = slot["start"].get("random_minutes", 0) or slot["end"].get("random_minutes", 0)
        if randomized and (not occ.runs or occ.end - occ.start < timedelta(minutes=5 + slot["start"].get("random_minutes", 0))):
            raise ProgramError("random_window_too_short")
        if occ.runs and occ.end is not None:
            intervals.append((occ.start, occ.end + timedelta(minutes=slot["end"].get("random_minutes", 0)), bool(randomized)))
    return intervals


def _reject_overlaps(intervals: list[tuple]) -> None:
    latest_end = None
    for start, end, *_ in sorted(intervals):
        if latest_end is not None and start < latest_end:
            raise ProgramError("overlapping_slots")
        latest_end = end


def _check_overlaps(day_slots: list[dict]) -> None:
    """Validate a standalone day's fixed windows (solar intervals trim at runtime)."""
    _reject_overlaps(_fixed_intervals(day_slots, date(2026, 1, 5)))


def _check_week_overlaps(days: list[list[dict]]) -> None:
    """Include adjacent days and Sunday-to-Monday spill, including random delays."""
    monday = date(2026, 1, 5)
    intervals = []
    for index in range(8):
        day = monday + timedelta(days=index)
        # slots without a delay keep the historical per-day rule (the runtime trims their spill)
        found = _fixed_intervals(days[index % 7], day)
        _reject_overlaps(found)
        intervals.extend(found)
    for n, (start, end, delayed) in enumerate(intervals):
        for other_start, other_end, other_delayed in intervals[n + 1:]:
            if (delayed or other_delayed) and start < other_end and other_start < end:
                raise ProgramError("overlapping_slots")


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
