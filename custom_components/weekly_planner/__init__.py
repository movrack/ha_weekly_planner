"""Weekly Planner: weekly time-slot scheduling for any Home Assistant entity."""

from __future__ import annotations

import logging

from homeassistant.components import persistent_notification
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from . import services, websocket
from .const import DOMAIN
from .engine import PlannerEngine
from .frontend import async_register_card, async_unregister_card
from .store import ConfigStoreError, PlannerStore

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SWITCH, Platform.SELECT]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type WeeklyPlannerConfigEntry = ConfigEntry[PlannerEngine]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register services and the websocket API once."""
    services.async_register(hass)
    websocket.async_register(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: WeeklyPlannerConfigEntry) -> bool:
    """Set up Weekly Planner from a config entry."""
    store = PlannerStore(hass)
    try:
        await store.async_load()
    except ConfigStoreError as err:
        # Never start from scratch over an unreadable file (spec § 8, S28).
        _LOGGER.error("Weekly Planner configuration unreadable, read-only mode: %s", err)
        persistent_notification.async_create(
            hass,
            "The Weekly Planner configuration file could not be read. Programs are paused "
            "and nothing will be overwritten. Restore `.storage/weekly_planner` from a backup.",
            title="Weekly Planner",
            notification_id=f"{DOMAIN}_storage",
        )
        return False

    engine = PlannerEngine(hass, store, dict(entry.options), entry.entry_id)
    entry.runtime_data = engine
    await async_register_card(hass)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await engine.async_start()
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))
    return True


async def _async_options_updated(hass: HomeAssistant, entry: WeeklyPlannerConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: WeeklyPlannerConfigEntry) -> bool:
    """Unload a config entry."""
    await entry.runtime_data.async_stop()
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Clean up when the integration is removed (spec § 9, S33)."""
    await async_unregister_card(hass)
    store = PlannerStore(hass)
    await store.async_remove()
