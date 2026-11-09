"""Validation of programs and modes sent by the card (spec § 8)."""

from __future__ import annotations

from datetime import UTC, date, datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import voluptuous as vol

from homeassistant.helpers import config_validation as cv

from .actions import needs_admin
from .const import DEFAULT_PRIORITY, DEFAULT_REAPPLY, DOMAIN, MODE_NAME_MAX, MODE_SELECTOR_DOMAINS
from .modes import check_follows
from .slots import applicable_ids
from .timeline import SUN_EVENTS, day_occurrences, parse_clock


def _clock(value: Any) -> str:
    parse_clock(str(value))
    return str(value)


def _random_minutes(value: Any) -> int:
    if type(value) is not int or not 0 <= value <= 240:
        raise vol.Invalid("invalid_random_minutes")
    return value


def _sun_bounds(spec: dict) -> dict:
    """A solar time may not be required to come before its own earliest limit."""
    if spec.get("earliest") and spec.get("latest"):
        earliest = parse_clock(spec["earliest"])
        latest = parse_clock(spec["latest"])
        if earliest > latest:
            raise vol.Invalid("earliest_after_latest")
    return spec


_FIXED_TIME = vol.Schema({vol.Required("time"): _clock, vol.Optional("random_minutes"): _random_minutes})
_SUN_TIME = vol.All(
    vol.Schema({
        vol.Required("sun"): vol.In(SUN_EVENTS),
        vol.Optional("random_minutes"): _random_minutes,
        vol.Optional("offset", default=0): vol.All(int, vol.Range(min=-240, max=240)),
        vol.Optional("earliest"): _clock,
        vol.Optional("latest"): _clock,
    }),
    _sun_bounds,
)


def TIME_SPEC(value: Any) -> dict:  # noqa: N802 - used like a schema
    """Fixed or solar time; the error names the actual problem of a solar time."""
    if isinstance(value, dict) and "sun" in value:
        return _SUN_TIME(value)
    return _FIXED_TIME(value)


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
    vol.Optional("entities"): [cv.entity_id],
    vol.Optional("seed"): vol.All(str, vol.Length(min=1, max=255)),
})

PROFILE = vol.Schema({
    vol.Required("id"): str,
    vol.Required("name"): vol.All(str, vol.Length(min=1, max=40)),
    vol.Required("days"): vol.All([vol.All([SLOT], vol.Length(max=50))], vol.Length(min=7, max=7)),
    # The mode follows another mode of the program (docs/adr/0002): its schedules are those of that mode.
    vol.Optional("follows"): vol.Any(None, vol.All(str, vol.Length(min=1, max=40))),
})

CHART_SOURCE = vol.Schema({
    vol.Required("entity_id"): cv.entity_id,
    vol.Required("kind"): vol.In(("numeric", "states")),
    vol.Optional("alias"): vol.All(str, str.strip, vol.Length(min=1, max=60)),
    vol.Optional("states", default=list): vol.All([vol.All(str, vol.Length(min=1, max=255))], vol.Length(max=100)),
})


def _chart_sources(value: Any) -> list:
    sources = vol.Schema([CHART_SOURCE])(value)
    ids = [source["entity_id"] for source in sources]
    if len(ids) != len(set(ids)):
        raise vol.Invalid("duplicate_chart_source")
    return sources


ENTITY = vol.Schema({
    vol.Required("entity_id"): cv.entity_id,
    vol.Optional("default_label", default=None): vol.Any(None, str),
    vol.Optional("label_overrides", default=dict): {str: ACTION},
    # Legacy empty lists allow all services; explicit restriction also permits selecting none.
    vol.Optional("allowed_services", default=list): [vol.All(str, vol.Match(r"^[a-z0-9_]+\.[a-z0-9_]+$"))],
    vol.Optional("restrict_services", default=False): bool,
    vol.Optional("chart_sources"): _chart_sources,
})

def _utc_datetime(value: str | datetime) -> str:
    """An ISO date-time with an offset, normalised to UTC (a timer needs an unambiguous moment).

    A hand-edited YAML file may hold an unquoted date-time, which the parser turns into a datetime.
    """
    try:
        moment = value if isinstance(value, datetime) else datetime.fromisoformat(value)
    except (ValueError, TypeError) as err:
        raise vol.Invalid("invalid_paused_until") from err
    if moment.tzinfo is None:
        raise vol.Invalid("invalid_paused_until")
    return moment.astimezone(UTC).isoformat()


PROGRAM = vol.Schema({
    vol.Required("id"): str,
    vol.Optional("revision", default=0): int,
    vol.Optional("created_at"): str,
    vol.Required("name"): vol.All(str, vol.Length(min=1, max=60)),
    vol.Optional("icon"): vol.Any(None, str),
    vol.Optional("area"): vol.Any(None, str),
    vol.Optional("priority", default=DEFAULT_PRIORITY): vol.All(int, vol.Range(min=1, max=100)),
    vol.Optional("enabled", default=True): bool,
    vol.Optional("paused_until"): vol.Any(None, _utc_datetime),
    vol.Optional("reapply", default=True): bool,
    vol.Optional("conditions", default=list): [CONDITION],
    vol.Required("entities"): vol.All([ENTITY], vol.Length(min=1, max=100)),
    # Per-program modes are gone (docs/adr/0001). The previous card still sends these two keys: they are
    # accepted and dropped by check_program.
    vol.Optional("active_profile"): object,
    vol.Optional("mode_source"): object,
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


def with_defaults(program: dict, reapply_default: bool = DEFAULT_REAPPLY) -> dict:
    """Copy of ``program`` where a missing ``reapply`` takes the global option (priority: schema default)."""
    return {"reapply": reapply_default, **program}


def keep_pause(existing: dict | None, program: dict, *, keep_enabled: bool) -> dict:
    """Editing a paused program never ends its pause: carry over ``paused_until`` unless the new data names one.

    ``keep_enabled``: also keep the program suspended (the card saves whole programs, possibly stale).
    """
    if existing and existing.get("paused_until") and "paused_until" not in program and (
            keep_enabled or program.get("enabled") is False):
        program = {**program, "paused_until": existing["paused_until"], "enabled": False}
    return program


def check_mode_config(selector: Any, default_mode: Any, hass: Any = None, options: list[str] | None = None) -> dict:
    """Global mode settings: ``mode_selector`` (an input_select or select entity, or None) and ``default_mode``.

    Weekly Planner's own entities are refused (circular selection). ``default_mode`` is a nonempty string
    of at most 40 characters; when the selector options are known (``options``) it must be one of them.
    """
    if selector is not None:
        selector = cv.entity_id(selector)
        if selector.split(".", 1)[0] not in MODE_SELECTOR_DOMAINS:
            raise ProgramError("invalid_mode_selector_domain")
        if hass is not None:
            from homeassistant.helpers import entity_registry as er
            entry = er.async_get(hass).async_get(selector)
            if entry and entry.platform == DOMAIN:
                raise ProgramError("circular_mode_selector")
    if default_mode is not None:
        if not isinstance(default_mode, str) or not default_mode.strip() or len(default_mode) > MODE_NAME_MAX:
            raise ProgramError("invalid_default_mode")
        if options and default_mode not in options:
            raise ProgramError("unknown_default_mode")
    return {"mode_selector": selector, "default_mode": default_mode}


def check_program(program: dict, labels: dict[str, dict], hass: Any = None, descriptions: dict | None = None,
                  reapply_default: bool = DEFAULT_REAPPLY) -> dict:
    """Schema + semantic rules: unique profile names, known labels, valid overrides, no overlap on a day.

    A program saved without ``reapply`` takes ``reapply_default`` (the integration option).
    """
    program = PROGRAM(with_defaults(program, reapply_default))
    if program.get("enabled", True) or program.get("paused_until") is None:
        program.pop("paused_until", None)  # only a suspended program can wait for a resume time
    program.pop("active_profile", None)
    program.pop("mode_source", None)
    names = [p["name"] for p in program["profiles"]]
    if len(set(names)) != len(names):
        raise ProgramError("duplicate_profile_name")
    for profile in program["profiles"]:
        if profile.get("follows") is None:
            profile.pop("follows", None)
    try:
        check_follows(program["profiles"])
    except ValueError as err:
        raise ProgramError(str(err)) from err
    for entity in program["entities"]:
        label_id = entity["default_label"]
        if label_id is not None and label_id not in labels:
            raise ProgramError(f"unknown_label:{label_id}")
        for label_id, action in entity["label_overrides"].items():
            if label_id not in labels:
                raise ProgramError(f"unknown_label:{label_id}")
            if action["kind"] == "service":
                _check_service(hass, descriptions, entity["entity_id"], action)
    device_ids = {e["entity_id"]: None for e in program["entities"]}
    has_lists = any("entities" in s for p in program["profiles"] for d in p["days"] for s in d)
    for profile in program["profiles"]:
        for day_slots in profile["days"]:
            for slot in day_slots:
                if slot["label"] not in labels:
                    raise ProgramError(f"unknown_label:{slot['label']}")
                _check_slot_entities(slot, device_ids)
        if has_lists:
            _check_week_overlaps_scoped(profile["days"], list(device_ids))
        else:
            _check_week_overlaps(profile["days"])
    return program


def _check_slot_entities(slot: dict, device_ids: dict) -> None:
    """``slot.entities``: not empty, no duplicate, only devices of the program (no label compatibility check, D6)."""
    targets = slot.get("entities")
    if targets is None:
        return
    if not targets:
        raise ProgramError(f"empty_slot_entities:{slot['id']}")
    seen = set()
    for eid in targets:
        if eid in seen:
            raise ProgramError(f"duplicate_slot_entity:{slot['id']}:{eid}")
        seen.add(eid)
    for eid in targets:
        if eid not in device_ids:
            raise ProgramError(f"unknown_slot_entity:{slot['id']}:{eid}")


def _fixed_intervals(day_slots: list[dict], day: date, entity_ids: list[str] | None = None) -> list[tuple]:
    """Reserve each fixed interval's entire random window, before any runtime trim.

    With ``entity_ids`` (program devices), each interval carries a 4th item: the devices its slot applies to.
    """
    intervals = []
    for slot in day_slots:
        if "time" not in slot["start"] or not (slot.get("end") or {}).get("time"):
            continue
        start_random = slot["start"].get("random_minutes", 0)
        end_random = slot["end"].get("random_minutes", 0)
        base = {**slot, "start": {"time": slot["start"]["time"]},
                "end": {"time": slot["end"]["time"]}}
        occ = day_occurrences([base], day, ZoneInfo("UTC"), lambda e, d: None)[0]
        randomized = bool(start_random or end_random)
        if randomized and (not occ.runs or occ.end - occ.start < timedelta(minutes=5 + start_random)):
            raise ProgramError("random_window_too_short")
        if occ.runs and occ.end is not None:
            interval = (occ.start, occ.end + timedelta(minutes=end_random), randomized)
            if entity_ids is not None:
                interval += (frozenset(applicable_ids(slot, entity_ids)),)
            intervals.append(interval)
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


def _shared_device(first: frozenset, second: frozenset, entity_ids: list[str]) -> str | None:
    """First device (program order) both slots apply to, or None."""
    common = first & second
    return next((eid for eid in entity_ids if eid in common), None) if common else None


def _check_week_overlaps_scoped(days: list[list[dict]], entity_ids: list[str]) -> None:
    """Same rules as ``_check_week_overlaps``, but two slots only conflict when they share a device."""
    monday = date(2026, 1, 5)
    intervals = []
    for index in range(8):
        found = sorted(_fixed_intervals(days[index % 7], monday + timedelta(days=index), entity_ids),
                       key=lambda item: item[:2])
        for n, (start, end, _, ids) in enumerate(found):
            for other_start, other_end, _, other_ids in found[n + 1:]:
                if other_start < end:
                    shared = _shared_device(ids, other_ids, entity_ids)
                    if shared:
                        raise ProgramError(f"overlapping_slots:{shared}")
        intervals.extend(found)
    for n, (start, end, delayed, ids) in enumerate(intervals):
        for other_start, other_end, other_delayed, other_ids in intervals[n + 1:]:
            if (delayed or other_delayed) and start < other_end and other_start < end:
                shared = _shared_device(ids, other_ids, entity_ids)
                if shared:
                    raise ProgramError(f"overlapping_slots:{shared}")


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
