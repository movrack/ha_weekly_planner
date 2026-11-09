"""Services: apply_now, skip_next, reload (spec § 9)."""

from __future__ import annotations

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import Unauthorized
from homeassistant.helpers import config_validation as cv

from .const import CONF_ADMIN_ONLY, DOMAIN
from .engine import MAX_PAUSE_DAYS, PlannerEngine

PROGRAM = vol.Schema({vol.Required("program_id"): str, vol.Optional("cancel", default=False): bool})


PAUSE = vol.All(
    vol.Schema({
        vol.Required("program_id"): str,
        vol.Optional("days"): vol.All(vol.Coerce(int), vol.Range(min=0, max=MAX_PAUSE_DAYS)),
        vol.Optional("hours"): vol.All(vol.Coerce(int), vol.Range(min=0, max=MAX_PAUSE_DAYS * 24)),
    }),
    cv.has_at_least_one_key("days", "hours"),
)
RESUME = vol.Schema({vol.Required("program_id"): str})


def _engine(hass: HomeAssistant) -> PlannerEngine:
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    if not entries:
        raise validation_error("not_loaded")
    return entries[0].runtime_data


async def _is_admin(hass: HomeAssistant, call: ServiceCall) -> bool:
    if call.context.user_id is None:
        return True  # automations and scripts
    user = await hass.auth.async_get_user(call.context.user_id)
    return bool(user and user.is_admin)


def async_register(hass: HomeAssistant) -> None:
    async def apply_now(call: ServiceCall) -> None:
        await _check_edit(hass, call)
        await _engine(hass).async_apply_now(call.data["program_id"])

    async def skip_next(call: ServiceCall) -> None:
        await _check_edit(hass, call)
        _engine(hass).skip_next(call.data["program_id"], call.data["cancel"])

    async def pause(call: ServiceCall) -> None:
        await _check_edit(hass, call)
        await _engine(hass).async_pause(call.data["program_id"], call.data.get("days"), call.data.get("hours"))

    async def resume(call: ServiceCall) -> None:
        await _check_edit(hass, call)
        await _engine(hass).async_pause(call.data["program_id"], None)

    async def reload(call: ServiceCall) -> None:
        if not await _is_admin(hass, call):
            raise Unauthorized()
        entries = hass.config_entries.async_entries(DOMAIN)
        if entries:
            await hass.config_entries.async_reload(entries[0].entry_id)

    hass.services.async_register(DOMAIN, "apply_now", apply_now, schema=PROGRAM)
    hass.services.async_register(DOMAIN, "skip_next", skip_next, schema=PROGRAM)
    hass.services.async_register(DOMAIN, "pause", pause, schema=PAUSE)
    hass.services.async_register(DOMAIN, "resume", resume, schema=RESUME)
    hass.services.async_register(DOMAIN, "reload", reload)


async def _check_edit(hass: HomeAssistant, call: ServiceCall) -> None:
    engine = _engine(hass)
    if engine.options.get(CONF_ADMIN_ONLY) and not await _is_admin(hass, call):
        raise Unauthorized()
