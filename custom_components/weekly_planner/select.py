"""Select entity per program: its active profile (spec § 5.10)."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .engine import PlannerEngine
from .switch import device_info


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    engine: PlannerEngine = entry.runtime_data
    known: set[str] = set()

    @callback
    def sync_programs() -> None:
        new = [ProfileSelect(engine, entry, p["id"]) for p in engine.store.programs if p["id"] not in known]
        known.update(e.program_id for e in new)
        if new:
            async_add_entities(new)

    sync_programs()
    entry.async_on_unload(engine.add_listener(sync_programs))


class ProfileSelect(SelectEntity):
    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_icon = "mdi:calendar-week"
    _attr_translation_key = "profile"

    def __init__(self, engine: PlannerEngine, entry: ConfigEntry, program_id: str) -> None:
        self.engine = engine
        self.program_id = program_id
        self._attr_unique_id = f"{entry.entry_id}_profile_{program_id}"
        self._attr_device_info = device_info(entry)

    @property
    def _program(self) -> dict | None:
        return self.engine.store.program(self.program_id)

    @property
    def available(self) -> bool:
        return self._program is not None

    @property
    def translation_placeholders(self) -> dict[str, str]:
        program = self._program
        return {"program": program["name"] if program else self.program_id}

    @property
    def options(self) -> list[str]:
        program = self._program
        return [p["name"] for p in program["profiles"]] if program else []

    @property
    def current_option(self) -> str | None:
        program = self._program
        if not program:
            return None
        active = self.engine.active_profile_id(self.program_id)
        return next((p["name"] for p in program["profiles"] if p["id"] == active), None)

    async def async_select_option(self, option: str) -> None:
        program = self._program
        if not program:
            return
        profile = next((p for p in program["profiles"] if p["name"] == option), None)
        if profile:
            await self.engine.async_set_profile(self.program_id, profile["id"])

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self.engine.add_listener(self._refresh))

    @callback
    def _refresh(self) -> None:
        if self.hass is not None:
            self.async_write_ha_state()
