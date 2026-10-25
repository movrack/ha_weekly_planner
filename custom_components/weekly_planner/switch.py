"""Switches: one per program (enabled / suspended) and the global vacation switch."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .engine import PlannerEngine


def device_info(entry: ConfigEntry) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name="Weekly Planner",
        entry_type=DeviceEntryType.SERVICE,
    )


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    engine: PlannerEngine = entry.runtime_data
    known: set[str] = set()

    async_add_entities([VacationSwitch(engine, entry)])

    @callback
    def sync_programs() -> None:
        new = [ProgramSwitch(engine, entry, p["id"]) for p in engine.store.programs if p["id"] not in known]
        known.update(e.program_id for e in new)
        if new:
            async_add_entities(new)

    sync_programs()
    entry.async_on_unload(engine.add_listener(sync_programs))


class _Base(SwitchEntity):
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


class VacationSwitch(_Base):
    """Suspend every program and apply defaults."""

    _attr_translation_key = "vacation"
    _attr_icon = "mdi:bag-suitcase"

    def __init__(self, engine: PlannerEngine, entry: ConfigEntry) -> None:
        super().__init__(engine, entry)
        self._attr_unique_id = f"{entry.entry_id}_vacation"

    @property
    def is_on(self) -> bool:
        return bool(self.engine.store.config.get("vacation"))

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.engine.async_set_vacation(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.engine.async_set_vacation(False)


class ProgramSwitch(_Base):
    """Enable or suspend one program; attributes describe what it does now."""

    def __init__(self, engine: PlannerEngine, entry: ConfigEntry, program_id: str) -> None:
        super().__init__(engine, entry)
        self.program_id = program_id
        self._attr_unique_id = f"{entry.entry_id}_program_{program_id}"

    @property
    def _program(self) -> dict | None:
        return self.engine.store.program(self.program_id)

    @property
    def available(self) -> bool:
        return self._program is not None

    @property
    def name(self) -> str | None:
        program = self._program
        return program["name"] if program else None

    @property
    def icon(self) -> str | None:
        program = self._program
        return program.get("icon") or "mdi:calendar-clock" if program else None

    @property
    def is_on(self) -> bool:
        program = self._program
        return bool(program and program.get("enabled", True))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return self.engine.program_status(self.program_id)

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.engine.async_set_enabled(self.program_id, True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.engine.async_set_enabled(self.program_id, False)
