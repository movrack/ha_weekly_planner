"""Services: resume, override, apply_now, skip_next, reload (spec § 9)."""

from __future__ import annotations

from datetime import timedelta

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import ServiceValidationError, Unauthorized
from homeassistant.helpers import config_validation as cv
from homeassistant.util import dt as dt_util

from .const import CONF_ADMIN_ONLY, DOMAIN
from .engine import PlannerEngine
from .setpoints import is_one_shot, needs_admin
from .validation import SETPOINT

RESUME = vol.Schema({
    vol.Optional("entity_id"): cv.entity_ids,
    vol.Optional("program_id"): str,
})
OVERRIDE = vol.Schema({
    vol.Required("entity_id"): cv.entity_ids,
    vol.Required("setpoint"): SETPOINT,
    vol.Exclusive("duration", "end"): cv.positive_time_period,
    vol.Exclusive("until", "end"): cv.datetime,
})
PROGRAM = vol.Schema({vol.Required("program_id"): str, vol.Optional("cancel", default=False): bool})


def _engine(hass: HomeAssistant) -> PlannerEngine:
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    if not entries:
        raise ServiceValidationError("Weekly Planner is not loaded")
    return entries[0].runtime_data


async def _is_admin(hass: HomeAssistant, call: ServiceCall) -> bool:
    if call.context.user_id is None:
        return True  # automations and scripts
    user = await hass.auth.async_get_user(call.context.user_id)
    return bool(user and user.is_admin)


def async_register(hass: HomeAssistant) -> None:
    async def resume(call: ServiceCall) -> None:
        engine = _engine(hass)
        entities = list(call.data.get("entity_id", []))
        if program_id := call.data.get("program_id"):
            program = engine.store.program(program_id)
            if program is None:
                raise ServiceValidationError(f"Unknown program {program_id}")
            entities += [e["entity_id"] for e in program["entities"]]
        await engine.async_resume(sorted(set(entities)))

    async def override(call: ServiceCall) -> None:
        engine = _engine(hass)
        setpoint = call.data["setpoint"]
        if is_one_shot(setpoint):
            raise ServiceValidationError("Overrides need a state setpoint, not a one-shot action")
        if needs_admin(setpoint) and not await _is_admin(hass, call):
            raise Unauthorized()
        now = dt_util.utcnow()
        until = None
        if "duration" in call.data:
            until = now + call.data["duration"]
        elif "until" in call.data:
            until = dt_util.as_utc(call.data["until"])
            if until <= now:
                raise ServiceValidationError("The end of the override is in the past")
        if until and until - now > timedelta(days=7):
            raise ServiceValidationError("An override lasts 7 days at most")
        managed = engine.managed_entities()
        for entity_id in call.data["entity_id"]:
            if entity_id not in managed:
                raise ServiceValidationError(f"{entity_id} is not in a program")
            await engine.async_override(entity_id, setpoint, until)

    async def apply_now(call: ServiceCall) -> None:
        await _check_edit(hass, call)
        await _engine(hass).async_apply_now(call.data["program_id"])

    async def skip_next(call: ServiceCall) -> None:
        await _check_edit(hass, call)
        _engine(hass).skip_next(call.data["program_id"], call.data["cancel"])

    async def reload(call: ServiceCall) -> None:
        if not await _is_admin(hass, call):
            raise Unauthorized()
        entries = hass.config_entries.async_entries(DOMAIN)
        if entries:
            await hass.config_entries.async_reload(entries[0].entry_id)

    hass.services.async_register(DOMAIN, "resume", resume, schema=RESUME)
    hass.services.async_register(DOMAIN, "override", override, schema=OVERRIDE)
    hass.services.async_register(DOMAIN, "apply_now", apply_now, schema=PROGRAM)
    hass.services.async_register(DOMAIN, "skip_next", skip_next, schema=PROGRAM)
    hass.services.async_register(DOMAIN, "reload", reload)


async def _check_edit(hass: HomeAssistant, call: ServiceCall) -> None:
    engine = _engine(hass)
    if engine.options.get(CONF_ADMIN_ONLY) and not await _is_admin(hass, call):
        raise Unauthorized()
