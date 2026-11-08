"""Common entity base: device, naming and engine subscription (shared by switch and select)."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity import Entity

from .const import DOMAIN
from .engine import PlannerEngine


def device_info(entry: ConfigEntry) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name="Weekly Planner",
        entry_type=DeviceEntryType.SERVICE,
    )


class PlannerEntity(Entity):
    """Entity attached to the single Weekly Planner device, refreshed on every engine change."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, engine: PlannerEngine, entry: ConfigEntry) -> None:
        self.engine = engine
        self._attr_device_info = device_info(entry)

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self.engine.add_listener(self._refresh))

    @callback
    def _refresh(self) -> None:
        if self.hass is not None:
            self.async_write_ha_state()
