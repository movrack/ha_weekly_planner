"""Websocket API used by the card (spec § 9)."""

from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.util import dt as dt_util

from .const import CONF_ADMIN_ONLY, DOMAIN
from .engine import PlannerEngine
from .resolver import active_profile, occurrences_around
from .store import new_id
from .validation import MODE, ProgramError, admin_required, check_program


def _engine(hass: HomeAssistant) -> PlannerEngine | None:
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    return entries[0].runtime_data if entries else None


def _may_edit(hass: HomeAssistant, connection) -> bool:
    engine = _engine(hass)
    if engine is None:
        return False
    return connection.user.is_admin or not engine.options.get(CONF_ADMIN_ONLY, False)


@callback
def async_register(hass: HomeAssistant) -> None:
    for handler in (ws_get, ws_subscribe, ws_program_save, ws_program_delete, ws_mode_save,
                    ws_mode_delete, ws_preview, ws_journal):
        websocket_api.async_register_command(hass, handler)


def _snapshot(engine: PlannerEngine) -> dict[str, Any]:
    entities = {
        eid: {k: rt.get(k) for k in ("segment", "target", "override", "suppressed", "pending")}
        for eid, rt in engine.store.runtime["entities"].items()
    }
    return {
        "vacation": engine.store.config.get("vacation", False),
        "modes": engine.store.config["modes"],
        "programs": engine.store.programs,
        "status": {p["id"]: engine.program_status(p["id"]) for p in engine.store.programs},
        "entities": entities,
        "read_only": engine.store.read_only,
        "can_edit": True,
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
    engine = _engine(hass)
    if engine is None or not _may_edit(hass, connection):
        connection.send_error(msg["id"], "unauthorized", "Editing is reserved to administrators")
        return
    program = dict(msg["program"])
    is_new = not program.get("id")
    program.setdefault("id", new_id())
    if is_new:
        program["id"] = new_id()
        program["created_at"] = dt_util.utcnow().isoformat()
    existing = engine.store.program(program["id"])
    if existing and existing.get("revision", 0) != program.get("revision", 0):
        connection.send_error(msg["id"], "conflict", "Modified elsewhere, reload")  # S34
        return
    try:
        program = check_program(program, engine.store.modes)
    except vol.Invalid as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    if admin_required(program, engine.store.modes) and not connection.user.is_admin:
        connection.send_error(msg["id"], "unauthorized", "Scripts and actions are reserved to administrators")
        return
    program["revision"] = program.get("revision", 0) + 1
    program.setdefault("created_at", existing.get("created_at") if existing else dt_util.utcnow().isoformat())
    if existing:
        engine.store.programs[engine.store.programs.index(existing)] = program
    else:
        engine.store.programs.append(program)
    engine.store.save_config()
    await engine.async_config_changed()
    connection.send_result(msg["id"], {"program": program})


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/program/delete",
    vol.Required("program_id"): str,
})
@websocket_api.async_response
async def ws_program_delete(hass, connection, msg) -> None:
    engine = _engine(hass)
    if engine is None or not _may_edit(hass, connection):
        connection.send_error(msg["id"], "unauthorized", "Editing is reserved to administrators")
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
    vol.Required("type"): f"{DOMAIN}/mode/save",
    vol.Required("mode"): dict,
})
@websocket_api.async_response
async def ws_mode_save(hass, connection, msg) -> None:
    engine = _engine(hass)
    if engine is None or not _may_edit(hass, connection):
        connection.send_error(msg["id"], "unauthorized", "Editing is reserved to administrators")
        return
    mode = dict(msg["mode"])
    mode.setdefault("id", new_id())
    try:
        mode = MODE(mode)
    except vol.Invalid as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    modes = engine.store.config["modes"]
    index = next((i for i, m in enumerate(modes) if m["id"] == mode["id"]), None)
    if index is None:
        modes.append(mode)
    else:
        modes[index] = mode
    engine.store.save_config()
    await engine.async_config_changed()
    connection.send_result(msg["id"], {"mode": mode})


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/mode/delete",
    vol.Required("mode_id"): str,
})
@websocket_api.async_response
async def ws_mode_delete(hass, connection, msg) -> None:
    engine = _engine(hass)
    if engine is None or not _may_edit(hass, connection):
        connection.send_error(msg["id"], "unauthorized", "Editing is reserved to administrators")
        return
    users = engine.mode_users(msg["mode_id"])
    if users:
        connection.send_error(msg["id"], "in_use", ", ".join(users))
        return
    engine.store.config["modes"] = [m for m in engine.store.config["modes"] if m["id"] != msg["mode_id"]]
    engine.store.save_config()
    await engine.async_config_changed()
    connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/preview",
    vol.Required("program_id"): str,
    vol.Optional("date"): str,
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
    for occ, slot in occurrences_around(profile, noon, engine.tz, engine.sun, days=(0,)):
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
