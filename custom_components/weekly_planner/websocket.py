"""Websocket API used by the card (spec § 9)."""

from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.service import async_get_all_descriptions
from homeassistant.util import dt as dt_util

from .const import CONF_ADMIN_ONLY, DEFAULT_PRIORITY, DOMAIN
from .checks import program_warnings
from .engine import PlannerEngine
from .frontend import CARD_VERSION_KEY
from .resolver import active_profile, occurrences_around
from .store import new_id
from .actions import needs_admin
from .validation import PROGRAM, ProgramError, admin_required, check_label, check_program, label_users, with_defaults


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
                    ws_label_delete, ws_preview, ws_journal, ws_set_enabled, ws_set_profile):
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
            and old_mode is not None and old_mode == new_mode)


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
    inactive_mode_edit = bool(existing) and _is_inactive_mode_edit(engine, existing, program)
    program["revision"] = program.get("revision", 0) + 1
    program.setdefault("created_at", existing.get("created_at") if existing else dt_util.utcnow().isoformat())
    if existing:
        engine.store.programs[engine.store.programs.index(existing)] = program
    else:
        engine.store.programs.append(program)
    engine.store.save_config()
    await engine.async_config_changed(reapply=not inactive_mode_edit)
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


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/preview",
    vol.Required("program_id"): str,
    vol.Optional("date"): vol.Match(r"^\d{4}-\d{2}-\d{2}$"),
    vol.Optional("profile_id"): str,
})
@callback
def ws_preview(hass, connection, msg) -> None:
    """Concrete slots of a day (sun times resolved, ignored slots flagged)."""
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
    result = []
    for occ, slot in occurrences_around(profile, noon, engine.tz, engine.sun, days=(0,), program_id=program["id"]):
        result.append({
            "slot_id": slot["id"], "start": occ.start.isoformat(),
            "end": occ.end.isoformat() if occ.end else None, "ignored": occ.ignored,
            "sun": "sun" in slot["start"] or "sun" in (slot.get("end") or {}),
        })
    connection.send_result(msg["id"], {"date": day.isoformat(), "slots": result})


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
    vol.Required("type"): f"{DOMAIN}/program/set_profile",
    vol.Required("program_id"): str,
    vol.Required("profile_id"): str,
})
@websocket_api.async_response
async def ws_set_profile(hass, connection, msg) -> None:
    """Select a manual mode with the same access as the native select."""
    engine = _engine(hass)
    if engine is None or engine.store.program(msg["program_id"]) is None:
        connection.send_error(msg["id"], "not_found", "Unknown program")
        return
    try:
        await engine.async_set_profile(msg["program_id"], msg["profile_id"])
    except ServiceValidationError as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    connection.send_result(msg["id"])
