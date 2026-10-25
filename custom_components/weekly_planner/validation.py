"""Validation of programs and modes sent by the card (spec § 8)."""

from __future__ import annotations

from datetime import date
from typing import Any
from zoneinfo import ZoneInfo

import voluptuous as vol

from homeassistant.helpers import config_validation as cv

from .setpoints import is_one_shot, needs_admin
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

SETPOINT = vol.Schema({
    vol.Required("kind"): str,
    vol.Optional("brightness"): vol.All(vol.Coerce(int), vol.Range(min=1, max=100)),
    vol.Optional("color_temp_kelvin"): vol.All(vol.Coerce(int), vol.Range(min=1000, max=12000)),
    vol.Optional("effect"): str,
}, extra=vol.ALLOW_EXTRA)

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
    vol.Required("actions"): vol.Schema({
        vol.Optional("by_type", default=dict): {str: str},
        vol.Optional("by_entity", default=dict): {cv.entity_id: SETPOINT},
    }),
})

PROFILE = vol.Schema({
    vol.Required("id"): str,
    vol.Required("name"): vol.All(str, vol.Length(min=1, max=40)),
    vol.Required("days"): vol.All([[SLOT]], vol.Length(min=7, max=7)),
})

DEFAULT = vol.Schema({
    vol.Required("kind"): vol.In(("mode", "setpoint", "previous", "none")),
    vol.Optional("value"): vol.Any(None, str, SETPOINT),
})

ENTITY = vol.Schema({
    vol.Required("entity_id"): cv.entity_id,
    vol.Optional("default", default={"kind": "none"}): DEFAULT,
    vol.Optional("grace_s"): vol.Any(None, vol.All(int, vol.Range(min=0, max=3600))),
    vol.Optional("force_permanent", default=False): bool,
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
    vol.Optional("main_type"): vol.Any(None, str),
    vol.Optional("conditions", default=list): [CONDITION],
    vol.Required("entities"): vol.All([ENTITY], vol.Length(min=1)),
    vol.Optional("active_profile"): vol.Any(None, str),
    vol.Required("profiles"): vol.All([PROFILE], vol.Length(min=1)),
})

MODE = vol.Schema({
    vol.Required("id"): str,
    vol.Required("type"): str,
    vol.Required("name"): vol.All(str, vol.Length(min=1, max=40)),
    vol.Optional("color", default="#9e9e9e"): str,
    vol.Optional("icon"): vol.Any(None, str),
    vol.Required("value"): SETPOINT,
    vol.Optional("exceptions", default=dict): {cv.entity_id: SETPOINT},
})


class ProgramError(vol.Invalid):
    """A program breaks a rule that the schema cannot express."""


def _check_service(hass: Any, descriptions: dict | None, entity_id: str, setpoint: dict) -> None:
    """A generic service setpoint: known service, usable on the entity, data is a dict."""
    service = setpoint.get("service")
    if not isinstance(service, str) or service.count(".") != 1:
        raise ProgramError(f"unknown_service:{service}")
    if not isinstance(setpoint.get("data", {}), dict):
        raise ProgramError(f"invalid_service_data:{service}")
    if hass is None:
        return
    domain, name = service.split(".")
    if not hass.services.has_service(domain, name):
        raise ProgramError(f"unknown_service:{service}")
    entity_domain = entity_id.split(".", 1)[0]
    if domain != entity_domain and not _target_accepts(descriptions, domain, name, entity_domain):
        raise ProgramError(f"service_not_for_entity:{service}:{entity_id}")


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


def check_program(program: dict, modes: dict[str, dict], hass: Any = None, descriptions: dict | None = None) -> dict:
    """Schema + semantic rules: unique profile names, known modes, no overlap on a day."""
    program = PROGRAM(program)
    names = [p["name"] for p in program["profiles"]]
    if len(set(names)) != len(names):
        raise ProgramError("duplicate_profile_name")
    entity_ids = {e["entity_id"] for e in program["entities"]}
    for profile in program["profiles"]:
        for day_slots in profile["days"]:
            for slot in day_slots:
                for mode_id in slot["actions"]["by_type"].values():
                    if mode_id not in modes:
                        raise ProgramError(f"unknown_mode:{mode_id}")
                for eid, setpoint in slot["actions"]["by_entity"].items():
                    if eid not in entity_ids:
                        raise ProgramError(f"entity_not_in_program:{eid}")
                    if setpoint["kind"] == "service":
                        if slot.get("end") is not None:
                            raise ProgramError(f"service_has_no_end:{eid}")
                        _check_service(hass, descriptions, eid, setpoint)
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


def admin_required(program: dict, modes: dict[str, dict]) -> bool:
    """Does the program contain setpoints only an administrator may schedule?"""
    for profile in program["profiles"]:
        for day_slots in profile["days"]:
            for slot in day_slots:
                if any(needs_admin(sp) for sp in slot["actions"]["by_entity"].values()):
                    return True
    return any(needs_admin(e.get("default", {}).get("value")) for e in program["entities"]
               if isinstance(e.get("default", {}).get("value"), dict))


def unsupported_presets(program: dict, modes: dict[str, dict], get_state) -> list[str]:
    """Presets the program would send to an entity that does not offer them (spec § 6)."""
    from .resolver import default_of, slot_setpoint

    problems: set[str] = set()

    def check(entity_id: str, setpoint: dict | None) -> None:
        if not setpoint or setpoint.get("kind") != "preset":
            return
        state = get_state(entity_id)
        offered = (state.attributes.get("preset_modes") or []) if state else None
        if offered is not None and setpoint["preset"] not in offered:
            problems.add(f"{entity_id}: {setpoint['preset']}")

    for entity in program["entities"]:
        eid = entity["entity_id"]
        check(eid, default_of(program, eid, modes)[1])
        for profile in program["profiles"]:
            for day in profile["days"]:
                for slot in day:
                    check(eid, slot_setpoint(slot, eid, modes))
    return sorted(problems)
