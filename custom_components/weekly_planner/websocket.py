"""Websocket API used by the card (spec § 9)."""

from __future__ import annotations

from copy import deepcopy
from datetime import date, datetime, timedelta
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.service import async_get_all_descriptions
from homeassistant.util import dt as dt_util

from .const import CONF_ADMIN_ONLY, CONF_HOLIDAY_ENTITY, CONF_HOLIDAY_INVERT, DEFAULT_PRIORITY, DOMAIN
from .checks import program_warnings
from .engine import MAX_PAUSE_DAYS, PlannerEngine
from .frontend import CARD_VERSION_KEY
from .resolver import NO_HOLIDAY, Holiday, OccurrenceCache, active_profile, occurrences_around
from .slots import normalise_slot_entities, remove_device_from_slots
from .store import new_id
from .actions import needs_admin
from .modes import apply_default_mode, profile_slots
from .validation import (
    PROGRAM, ProgramError, admin_required, check_label, check_mode_config, check_program, keep_pause, label_users, with_defaults,
)


async def _descriptions(hass: HomeAssistant) -> dict | None:
    """Service descriptions (which entity a service suits); None when they cannot be read."""
    try:
        return await async_get_all_descriptions(hass)
    except Exception:  # noqa: BLE001 - without them every service is accepted
        return None


def _engine(hass: HomeAssistant) -> PlannerEngine | None:
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    return entries[0].runtime_data if entries else None


def _may_edit(hass: HomeAssistant, connection) -> bool:
    engine = _engine(hass)
    if engine is None:
        return False
    return connection.user.is_admin or not engine.options.get(CONF_ADMIN_ONLY, False)


def _editor_engine(hass: HomeAssistant, connection, msg) -> PlannerEngine | None:
    """The engine when this connection may edit; otherwise answers the error and returns None."""
    engine = _engine(hass)
    if engine is None or not _may_edit(hass, connection):
        connection.send_error(msg["id"], "unauthorized", "Editing is reserved to administrators")
        return None
    return engine


@callback
def async_register(hass: HomeAssistant) -> None:
    for handler in (ws_get, ws_subscribe, ws_program_save, ws_program_delete, ws_label_save,
                    ws_label_delete, ws_preview, ws_journal, ws_set_enabled, ws_pause, ws_set_mode,
                    ws_resolve_mode, ws_undo_mode_rename, ws_mode_follow, ws_dismiss_mode_rename, ws_holiday):
        websocket_api.async_register_command(hass, handler)


def _is_inactive_mode_edit(engine: PlannerEngine, existing: dict, program: dict) -> bool:
    """Only another mode's hours changed: the active mode's action must not be re-sent."""
    # Normalize legacy defaults before comparing metadata, without changing stored data.
    try:
        old = PROGRAM(with_defaults(existing, engine.reapply_default))
    except vol.Invalid:
        return False
    active_id = engine.active_profile_id(existing["id"])
    metadata = lambda p: {k: v for k, v in p.items() if k not in {"profiles", "revision"}}
    old_mode = next((p for p in old["profiles"] if p["id"] == active_id), None)
    new_mode = next((p for p in program["profiles"] if p["id"] == active_id), None)
    return (old["profiles"] != program["profiles"] and metadata(old) == metadata(program)
            and old_mode == new_mode)


def _snapshot(engine: PlannerEngine) -> dict[str, Any]:
    # Copy the envelope: permissions are always individualized per connection.
    return dict(engine.shared_notification_view(lambda: _build_snapshot(engine)))


def _build_snapshot(engine: PlannerEngine) -> dict[str, Any]:
    with engine.shared_pass():  # one input view and occurrence/sun cache for every program status
        return _snapshot_data(engine)


def _snapshot_data(engine: PlannerEngine) -> dict[str, Any]:
    entities = {
        eid: {k: rt.get(k) for k in ("segment", "target", "suppressed", "pending")}
        for eid, rt in engine.store.runtime["entities"].items()
    }
    return {
        "vacation": engine.store.config.get("vacation", False),
        "labels": engine.store.config.get("labels", []),
        "mode": {
            "selector": engine.store.config.get("mode_selector"),
            "default": engine.store.config.get("default_mode"),
            "active": engine.active_mode,
            "options": engine.mode_options(),
            "available": engine.mode_available,
            "orphans": engine.mode_orphans(),
            "proposals": engine.mode_proposals(),
            "renamed": engine.mode_renames(),
            "follow_lost": engine.mode_follow_lost(),
        },
        # Day off (issue #54): the entity of the house (None: the feature is hidden) and whether today is one.
        "holiday_entity": engine.store.config.get(CONF_HOLIDAY_ENTITY),
        "holiday_invert": bool(engine.store.config.get(CONF_HOLIDAY_INVERT, False)),
        "holiday_today": engine.holiday_today,
        "programs": engine.store.programs,
        "status": {p["id"]: engine.program_status(p["id"]) for p in engine.store.programs},
        "warnings": {p["id"]: program_warnings(engine.hass, engine.store.programs, p, engine)
                     for p in engine.store.programs},
        "entities": entities,
        "read_only": engine.store.read_only,
        "can_edit": True,
        "card_version": engine.hass.data.get(CARD_VERSION_KEY),
        # Initial values the card offers for a NEW program (additive field).
        "defaults": {"reapply": engine.reapply_default, "priority": DEFAULT_PRIORITY},
    }


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/get"})
@websocket_api.async_response
async def ws_get(hass, connection, msg) -> None:
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "Weekly Planner is not loaded")
        return
    data = _snapshot(engine)
    data["can_edit"] = _may_edit(hass, connection)
    data["is_admin"] = connection.user.is_admin
    connection.send_result(msg["id"], data)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/subscribe"})
@callback
def ws_subscribe(hass, connection, msg) -> None:
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "Weekly Planner is not loaded")
        return

    @callback
    def forward() -> None:
        data = _snapshot(engine)
        data["can_edit"] = _may_edit(hass, connection)
        connection.send_message(websocket_api.event_message(msg["id"], data))

    connection.subscriptions[msg["id"]] = engine.add_listener(forward)
    connection.send_result(msg["id"])
    forward()


def _clean_slot_entities(existing: dict | None, program: dict) -> dict:
    """D5 before validation: devices that left the program leave every slot list (all modes), then lists are normalised.

    Removal runs first so ``unknown_slot_entity`` is never raised for a device the user just removed.
    Malformed data is left untouched for ``check_program`` to refuse.
    """
    try:
        if existing:
            kept = {e["entity_id"] for e in program["entities"]}
            for old in existing.get("entities", []):
                if old["entity_id"] not in kept:
                    program = remove_device_from_slots(program, old["entity_id"])
        return normalise_slot_entities(program)
    except (KeyError, TypeError, AttributeError):
        return program


def _keep_holidays(existing: dict | None, program: dict) -> dict:
    """A profile sent without a ``holiday`` key keeps its stored day-off setting (a card that does not know
    the key never erases it); ``holiday: null`` clears it. A mode that now follows another keeps none."""
    if not existing or not isinstance(program.get("profiles"), list):
        return program
    stored = {p.get("id"): p["holiday"] for p in existing.get("profiles", []) if p.get("holiday")}
    if not stored:
        return program
    profiles = []
    for profile in program["profiles"]:
        if (isinstance(profile, dict) and "holiday" not in profile and profile.get("id") in stored
                and not profile.get("follows")):
            profile = {**profile, "holiday": deepcopy(stored[profile["id"]])}
        profiles.append(profile)
    return {**program, "profiles": profiles}


def _chart_metadata_only(before: dict | None, after: dict, reapply_default: bool = True) -> bool:
    """Only display sources changed: do not re-evaluate schedules or send device services."""
    if before is None:
        return False
    try:
        before = PROGRAM(with_defaults(before, reapply_default))
    except vol.Invalid:
        return False

    def scheduling(program: dict) -> dict:
        return {**program, "entities": [
            {key: value for key, value in entity.items() if key != "chart_sources"}
            for entity in program["entities"]
        ]}

    sources_changed = [entity.get("chart_sources") for entity in before["entities"]] != [
        entity.get("chart_sources") for entity in after["entities"]
    ]
    return sources_changed and scheduling(before) == scheduling(after)


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/program/save",
    vol.Required("program"): dict,
})
@websocket_api.async_response
async def ws_program_save(hass, connection, msg) -> None:
    engine = _editor_engine(hass, connection, msg)
    if engine is None:
        return
    program = dict(msg["program"])
    is_new = not program.get("id")
    if is_new:
        program["id"] = new_id()
        program["created_at"] = dt_util.utcnow().isoformat()
    existing = engine.store.program(program["id"])
    if existing and existing.get("revision", 0) != program.get("revision", 0):
        connection.send_error(msg["id"], "conflict", "Modified elsewhere, reload")  # S34
        return
    try:
        descriptions = await _descriptions(hass)
        program = _clean_slot_entities(existing, _keep_holidays(existing, program))
        program = check_program(program, engine.labels, hass, descriptions, engine.reapply_default)
    except vol.Invalid as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    if admin_required(program, engine.labels) and not connection.user.is_admin:
        connection.send_error(msg["id"], "unauthorized", "Sensitive actions are reserved to administrators")
        return
    # Metadata loading may suspend while another editor saves or deletes this program.
    # Re-read and compare immediately before mutation, without another await.
    previous = existing
    existing = engine.store.program(program["id"])
    if previous is not None and existing is None:
        connection.send_error(msg["id"], "not_found", "Unknown program")
        return
    if existing and existing.get("revision", 0) != program.get("revision", 0):
        connection.send_error(msg["id"], "conflict", "Modified elsewhere, reload")
        return
    program = keep_pause(existing, program, keep_enabled=True)  # an edit never ends a pause
    chart_metadata_only = _chart_metadata_only(existing, program, engine.reapply_default)
    inactive_mode_edit = bool(existing) and _is_inactive_mode_edit(engine, existing, program)
    program["revision"] = program.get("revision", 0) + 1
    program.setdefault("created_at", existing.get("created_at") if existing else dt_util.utcnow().isoformat())
    if existing:
        engine.store.programs[engine.store.programs.index(existing)] = program
    else:
        config = engine.store.config
        if config.get("mode_selector"):  # a new program starts under the default mode
            apply_default_mode([program], config.get("default_mode"), engine.mode_options())
        engine.store.programs.append(program)
    engine.store.save_config()
    await engine.async_config_changed(reapply=not inactive_mode_edit, metadata_only=chart_metadata_only)
    connection.send_result(msg["id"], {"program": program})


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/program/delete",
    vol.Required("program_id"): str,
})
@websocket_api.async_response
async def ws_program_delete(hass, connection, msg) -> None:
    engine = _editor_engine(hass, connection, msg)
    if engine is None:
        return
    program = engine.store.program(msg["program_id"])
    if program is None:
        connection.send_error(msg["id"], "not_found", "Unknown program")
        return
    await engine.async_set_enabled(program["id"], False)  # default applied once (S18)
    engine.store.programs.remove(program)
    engine.store.runtime["programs"].pop(program["id"], None)
    engine.store.save_config()
    await engine.async_remove_program_entities(program)
    await engine.async_config_changed()
    connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/label/save",
    vol.Required("label"): dict,
})
@websocket_api.async_response
async def ws_label_save(hass, connection, msg) -> None:
    """Create or change a label (shared by every program)."""
    engine = _editor_engine(hass, connection, msg)
    if engine is None:
        return
    label = dict(msg["label"])
    label.setdefault("id", new_id())
    try:
        label = check_label(label, hass, await _descriptions(hass))
    except vol.Invalid as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    if needs_admin(label["action"]) and not connection.user.is_admin:
        connection.send_error(msg["id"], "unauthorized", "Sensitive actions are reserved to administrators")
        return
    labels = engine.store.config.setdefault("labels", [])
    index = next((i for i, x in enumerate(labels) if x["id"] == label["id"]), None)
    if index is None:
        labels.append(label)
    else:
        labels[index] = label
    engine.store.save_config()
    await engine.async_config_changed()
    connection.send_result(msg["id"], {"label": label})


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/label/delete",
    vol.Required("label_id"): str,
})
@websocket_api.async_response
async def ws_label_delete(hass, connection, msg) -> None:
    """Delete a label, refused while a program uses it."""
    engine = _editor_engine(hass, connection, msg)
    if engine is None:
        return
    users = label_users(engine.store.programs, msg["label_id"])
    if users:
        connection.send_error(msg["id"], "in_use", ", ".join(users))
        return
    engine.store.config["labels"] = [x for x in engine.store.config.get("labels", []) if x["id"] != msg["label_id"]]
    engine.store.save_config()
    await engine.async_config_changed()
    connection.send_result(msg["id"])


def _preview_slot(occ, slot: dict) -> dict[str, Any]:
    item = {
        "slot_id": slot["id"], "start": occ.start.isoformat(),
        "end": occ.end.isoformat() if occ.end else None, "ignored": occ.ignored,
        "sun": "sun" in slot["start"] or "sun" in (slot.get("end") or {}),
    }
    if slot.get("entities") is not None:
        item["entities"] = list(slot["entities"])
    return item


def _per_device_preview(engine: PlannerEngine, program: dict, profile: dict, noon: datetime,
                        holiday: Holiday = NO_HOLIDAY) -> dict[str, Any]:
    """Programs with per-device lists: slots as placed (never trimmed together) and the full timeline of each device."""
    cache = OccurrenceCache()
    tz, sun, pid = engine.tz, engine.sun, program["id"]
    midnight = datetime(noon.year, noon.month, noon.day, tzinfo=tz)
    slots = [_preview_slot(occ, slot) for occ, slot in cache.entry(profile, noon.date(), tz, sun, pid, holiday).placed]
    by_entity: dict[str, list] = {}
    for entity in program["entities"]:
        eid = entity["entity_id"]
        by_entity[eid] = [
            _preview_slot(occ, slot)
            for occ, slot in occurrences_around(profile, noon, tz, sun, days=(-1, 0), program_id=pid, cache=cache,
                                                entity_id=eid, holiday=holiday)
            if occ.start >= midnight or (occ.end is not None and occ.end > midnight)  # previous-day spill only
        ]
    return {"slots": slots, "by_entity": by_entity}


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/preview",
    vol.Required("program_id"): str,
    vol.Optional("date"): vol.Match(r"^\d{4}-\d{2}-\d{2}$"),
    vol.Optional("profile_id"): str,
})
@callback
def ws_preview(hass, connection, msg) -> None:
    """Concrete slots of a day (sun times resolved, ignored slots flagged).

    ``holiday``: the date is today and today is a day off (issue #54); the slots are then those that really
    run (the day-off setting of the mode, when it has one). Yesterday and tomorrow are always normal days.
    """
    engine = _engine(hass)
    program = engine.store.program(msg["program_id"]) if engine else None
    if program is None:
        connection.send_error(msg["id"], "not_found", "Unknown program")
        return
    day = date.fromisoformat(msg["date"]) if msg.get("date") else dt_util.now().date()
    profiles = engine._profiles()  # noqa: SLF001
    if msg.get("profile_id"):
        profiles = {**profiles, program["id"]: msg["profile_id"]}
    profile = active_profile(program, profiles)
    noon = datetime(day.year, day.month, day.day, 12, tzinfo=engine.tz)
    holiday = engine.holiday_view()
    is_holiday = holiday.day == day
    if any("entities" in slot for slot in profile_slots(profile)):
        connection.send_result(msg["id"], {"date": day.isoformat(), "holiday": is_holiday,
                                           **_per_device_preview(engine, program, profile, noon, holiday)})
        return
    result = []
    for occ, slot in occurrences_around(profile, noon, engine.tz, engine.sun, days=(0,), program_id=program["id"],
                                        holiday=holiday):
        result.append(_preview_slot(occ, slot))
    connection.send_result(msg["id"], {"date": day.isoformat(), "holiday": is_holiday, "slots": result})


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/journal",
    vol.Optional("entity_id"): str,
    vol.Optional("days", default=1): vol.All(int, vol.Range(min=1, max=14)),
})
@callback
def ws_journal(hass, connection, msg) -> None:
    """Segments actually decided (past of the chart, spec § 10.4)."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "Weekly Planner is not loaded")
        return
    since = (dt_util.utcnow() - timedelta(days=msg["days"])).isoformat()
    entries = [e for e in engine.store.journal
               if e.get("at", "") >= since and (not msg.get("entity_id") or e["entity_id"] == msg["entity_id"])]
    connection.send_result(msg["id"], {"segments": entries})


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/program/set_enabled",
    vol.Required("program_id"): str,
    vol.Required("enabled"): bool,
})
@websocket_api.async_response
async def ws_set_enabled(hass, connection, msg) -> None:
    """Enable or suspend a program (open to everyone, like the switch entity)."""
    engine = _engine(hass)
    if engine is None or engine.store.program(msg["program_id"]) is None:
        connection.send_error(msg["id"], "not_found", "Unknown program")
        return
    await engine.async_set_enabled(msg["program_id"], msg["enabled"])
    connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/program/pause",
    vol.Required("program_id"): str,
    vol.Optional("days", default=None): vol.Any(None, vol.All(int, vol.Range(min=1, max=MAX_PAUSE_DAYS))),
    vol.Optional("hours", default=None): vol.Any(None, vol.All(int, vol.Range(min=1, max=MAX_PAUSE_DAYS * 24))),
})
@websocket_api.async_response
async def ws_pause(hass, connection, msg) -> None:
    """Suspend a program for ``days`` days and/or ``hours`` hours (neither: resume now); open to everyone like set_enabled."""
    engine = _engine(hass)
    if engine is None or engine.store.program(msg["program_id"]) is None:
        connection.send_error(msg["id"], "not_found", "Unknown program")
        return
    await engine.async_pause(msg["program_id"], msg["days"], msg["hours"])
    connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/mode/set",
    vol.Required("mode_selector"): vol.Any(None, str),
    vol.Required("default_mode"): vol.Any(None, str),
})
@websocket_api.async_response
async def ws_set_mode(hass, connection, msg) -> None:
    """Set the global mode selector and the default mode (same rights as saving a program)."""
    engine = _editor_engine(hass, connection, msg)
    if engine is None:
        return
    try:
        selector = msg["mode_selector"] or None
        state = hass.states.get(selector) if selector else None
        options = [o for o in state.attributes.get("options") or [] if isinstance(o, str)] if state else None
        settings = check_mode_config(selector, msg["default_mode"], hass, options)
    except vol.Invalid as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    renamed = await engine.async_set_mode_config(settings["mode_selector"], settings["default_mode"])
    connection.send_result(msg["id"], {**settings, "renamed_programs": renamed})


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/mode/resolve",
    vol.Required("old"): str,
    vol.Required("new"): vol.Any(None, str),
})
@websocket_api.async_response
async def ws_resolve_mode(hass, connection, msg) -> None:
    """Match a mode with no option to an option (``new``), or delete it from every program (``new`` null).

    Result: ``{renamed: [program ids], skipped: [program ids]}``. Same rights as saving a program.
    """
    engine = _editor_engine(hass, connection, msg)
    if engine is None:
        return
    old, new = msg["old"], msg["new"]
    options = engine.mode_options()
    if old in options:
        connection.send_error(msg["id"], "invalid", "This mode is still an option of the selector")
        return
    if new is not None and new not in options:
        connection.send_error(msg["id"], "invalid", "Unknown option of the mode selector")
        return
    renamed, skipped = await engine.async_resolve_mode(old, new)
    connection.send_result(msg["id"], {"renamed": renamed, "skipped": skipped})


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/mode/undo_rename",
    vol.Required("new"): str,
})
@websocket_api.async_response
async def ws_undo_mode_rename(hass, connection, msg) -> None:
    """Reverse the latest automatic rename to ``new`` (same rights as saving a program)."""
    engine = _editor_engine(hass, connection, msg)
    if engine is None:
        return
    record = await engine.async_undo_mode_rename(msg["new"])
    if record is None:
        connection.send_error(msg["id"], "not_found", "No rename to undo for this mode")
        return
    connection.send_result(msg["id"], {"old": record["old"], "new": record["new"]})


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/program/mode_follow",
    vol.Required("program_id"): str,
    vol.Required("mode"): vol.All(str, vol.Length(min=1, max=40)),
    vol.Required("follows"): vol.Any(None, vol.All(str, vol.Length(min=1, max=40))),
})
@websocket_api.async_response
async def ws_mode_follow(hass, connection, msg) -> None:
    """In a program, make a mode follow another one (its schedules are those of the source), or (``follows`` null)
    stop following: the mode keeps a copy of the schedules of the source. Same rights as saving a program."""
    engine = _editor_engine(hass, connection, msg)
    if engine is None:
        return
    if not engine.store.config.get("mode_selector"):
        connection.send_error(msg["id"], "invalid", "Modes need a mode selector")
        return
    try:
        program = await engine.async_set_mode_follow(msg["program_id"], msg["mode"], msg["follows"])
    except ValueError as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    if program is None:
        connection.send_error(msg["id"], "not_found", "Unknown program")
        return
    connection.send_result(msg["id"], {"program": program})


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/mode/dismiss_rename",
    vol.Required("new"): str,
})
@websocket_api.async_response
async def ws_dismiss_mode_rename(hass, connection, msg) -> None:
    """Hide the "Renamed from ..." notice of mode ``new`` for everybody (same rights as saving a program)."""
    engine = _editor_engine(hass, connection, msg)
    if engine is None:
        return
    if not await engine.async_dismiss_mode_rename(msg["new"]):
        connection.send_error(msg["id"], "not_found", "No rename to dismiss for this mode")
        return
    connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/program/holiday",
    vol.Required("program_id"): str,
    vol.Required("profile_id"): str,
    vol.Required("holiday"): vol.Any(None, dict),
    vol.Optional("revision"): int,
})
@websocket_api.async_response
async def ws_holiday(hass, connection, msg) -> None:
    """Set (``{"copy": 0..6}`` or ``{"day": [slots]}``) or clear (null) the day-off setting of one mode of a
    program (issue #54). Same rights and checks as saving the program; a mode that follows has none."""
    engine = _editor_engine(hass, connection, msg)
    if engine is None:
        return
    existing = engine.store.program(msg["program_id"])
    if existing is None:
        connection.send_error(msg["id"], "not_found", "Unknown program")
        return
    if "revision" in msg and existing.get("revision", 0) != msg["revision"]:
        connection.send_error(msg["id"], "conflict", "Modified elsewhere, reload")
        return
    if not any(p["id"] == msg["profile_id"] for p in existing["profiles"]):
        connection.send_error(msg["id"], "not_found", "Unknown mode")
        return
    program = deepcopy(existing)
    for profile in program["profiles"]:
        if profile["id"] == msg["profile_id"]:
            profile["holiday"] = msg["holiday"]
    try:
        descriptions = await _descriptions(hass)
        program = check_program(_clean_slot_entities(existing, program), engine.labels, hass, descriptions,
                                engine.reapply_default)
    except vol.Invalid as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    if admin_required(program, engine.labels) and not connection.user.is_admin:
        connection.send_error(msg["id"], "unauthorized", "Sensitive actions are reserved to administrators")
        return
    current = engine.store.program(program["id"])  # re-read after the await, as program/save does
    if current is None:
        connection.send_error(msg["id"], "not_found", "Unknown program")
        return
    if current.get("revision", 0) != existing.get("revision", 0):
        connection.send_error(msg["id"], "conflict", "Modified elsewhere, reload")
        return
    program = keep_pause(current, program, keep_enabled=True)
    active = engine.active_profile_id(program["id"]) == msg["profile_id"]
    program["revision"] = current.get("revision", 0) + 1
    engine.store.programs[engine.store.programs.index(current)] = program
    engine.store.save_config()
    # Editing another mode's day off never re-sends the active mode's actions.
    await engine.async_config_changed(reapply=active)
    connection.send_result(msg["id"], {"program": program})
