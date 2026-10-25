"""Persistence: configuration (programs, modes), runtime state and decision journal.

Three versioned stores (spec § 8). The configuration store refuses to start from scratch
when a file existed but could not be read, so a corrupt file never silently wipes the
user's programs.
"""

from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timedelta
import logging
from pathlib import Path
import shutil
from typing import Any
import uuid

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN, STORAGE_MINOR_VERSION, STORAGE_VERSION

_LOGGER = logging.getLogger(__name__)

JOURNAL_DAYS = 14

DEFAULT_MODES: list[dict[str, Any]] = [
    {"id": "climate_comfort", "type": "climate", "name": "Comfort", "color": "#ff9800",
     "icon": "mdi:sofa", "value": {"kind": "preset", "preset": "comfort"}},
    {"id": "climate_eco", "type": "climate", "name": "Eco", "color": "#2196f3",
     "icon": "mdi:leaf", "value": {"kind": "preset", "preset": "eco"}},
    {"id": "climate_night", "type": "climate", "name": "Night", "color": "#7e57c2",
     "icon": "mdi:weather-night", "value": {"kind": "temperature", "temperature": 16}},
    {"id": "climate_boost", "type": "climate", "name": "Boost", "color": "#f44336",
     "icon": "mdi:rocket-launch", "value": {"kind": "preset", "preset": "boost"}},
    {"id": "climate_frost", "type": "climate", "name": "Frost protection", "color": "#b0bec5",
     "icon": "mdi:snowflake", "value": {"kind": "temperature", "temperature": 7}},
    {"id": "cover_open", "type": "cover", "name": "Open", "color": "#ffc107",
     "icon": "mdi:window-shutter-open", "value": {"kind": "open"}},
    {"id": "cover_closed", "type": "cover", "name": "Closed", "color": "#455a64",
     "icon": "mdi:window-shutter", "value": {"kind": "close"}},
    {"id": "cover_favorite", "type": "cover", "name": "Favorite", "color": "#8bc34a",
     "icon": "mdi:star", "value": {"kind": "position", "position": 30}},
    {"id": "light_on", "type": "light", "name": "On", "color": "#ffeb3b",
     "icon": "mdi:lightbulb-on", "value": {"kind": "on"}},
    {"id": "light_off", "type": "light", "name": "Off", "color": "#616161",
     "icon": "mdi:lightbulb-off", "value": {"kind": "off"}},
    {"id": "switch_on", "type": "switch", "name": "On", "color": "#4caf50",
     "icon": "mdi:power-plug", "value": {"kind": "on"}},
    {"id": "switch_off", "type": "switch", "name": "Off", "color": "#616161",
     "icon": "mdi:power-plug-off", "value": {"kind": "off"}},
]


def new_id() -> str:
    return uuid.uuid4().hex[:12]


# Names of the starting modes in the languages shipped with the integration.
MODE_NAMES_FR = {
    "climate_comfort": "Confort", "climate_eco": "Éco", "climate_night": "Nuit",
    "climate_boost": "Boost", "climate_frost": "Hors-gel", "cover_open": "Ouvert",
    "cover_closed": "Fermé", "cover_favorite": "Favori", "light_on": "Allumée",
    "light_off": "Éteinte", "switch_on": "Allumé", "switch_off": "Éteint",
}


def empty_config(language: str = "en") -> dict[str, Any]:
    """Fresh configuration with the starting modes named in the instance language."""
    modes = deepcopy(DEFAULT_MODES)
    if language.startswith("fr"):
        for mode in modes:
            mode["name"] = MODE_NAMES_FR.get(mode["id"], mode["name"])
    return {"vacation": False, "modes": modes, "programs": []}


class ConfigStoreError(Exception):
    """The configuration file exists but cannot be used."""


class _VersionedStore(Store):
    """Store with an explicit migration hook (none needed yet for version 1)."""

    async def _async_migrate_func(self, old_major: int, old_minor: int, old_data: dict) -> dict:
        _LOGGER.info("Migrating %s from %s.%s", self.key, old_major, old_minor)
        return old_data


class PlannerStore:
    """Configuration, runtime and journal stores."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._config = _VersionedStore(hass, STORAGE_VERSION, DOMAIN,
                                       minor_version=STORAGE_MINOR_VERSION, atomic_writes=True)
        self._runtime = _VersionedStore(hass, 1, f"{DOMAIN}.runtime", atomic_writes=True)
        self._journal = _VersionedStore(hass, 1, f"{DOMAIN}.journal", atomic_writes=True)
        self.config: dict[str, Any] = empty_config(hass.config.language)
        self.runtime: dict[str, Any] = {"entities": {}, "programs": {}, "adaptive": {}}
        self.journal: list[dict[str, Any]] = []
        self.read_only = False

    @property
    def _config_path(self) -> Path:
        return Path(self.hass.config.path(".storage", DOMAIN))

    async def async_load(self) -> None:
        existed = await self.hass.async_add_executor_job(self._config_path.exists)
        try:
            data = await self._config.async_load()
        except Exception as err:  # noqa: BLE001 - unsupported version, invalid JSON…
            self.read_only = True
            raise ConfigStoreError(str(err)) from err
        if data is None and existed:
            # Home Assistant renamed a corrupt file aside: never start from scratch silently.
            self.read_only = True
            raise ConfigStoreError("configuration file unreadable")
        self.config = data if data is not None else empty_config(self.hass.config.language)
        self.runtime = await self._runtime.async_load() or self.runtime
        self.journal = (await self._journal.async_load() or {}).get("segments", [])

    async def async_backup(self) -> None:
        """Copy the configuration file aside (before a migration or a risky change)."""
        src = self._config_path
        if await self.hass.async_add_executor_job(src.exists):
            stamp = dt_util.utcnow().strftime("%Y%m%d%H%M%S")
            await self.hass.async_add_executor_job(
                shutil.copy2, src, src.with_name(f"{DOMAIN}.backup-{stamp}")
            )

    def save_config(self) -> None:
        if self.read_only:
            raise ConfigStoreError("configuration is read-only")
        self._config.async_delay_save(lambda: self.config, 1)

    def save_runtime(self) -> None:
        self._runtime.async_delay_save(lambda: self.runtime, 1)

    def record_segment(self, entry: dict[str, Any]) -> None:
        """Append a decided segment to the journal (keeps 14 days)."""
        limit = (dt_util.utcnow() - timedelta(days=JOURNAL_DAYS)).isoformat()
        self.journal = [e for e in self.journal if e.get("at", "") >= limit]
        self.journal.append(entry)
        self._journal.async_delay_save(lambda: {"segments": self.journal}, 5)

    async def async_remove(self) -> None:
        for store in (self._config, self._runtime, self._journal):
            await store.async_remove()

    # -- helpers -----------------------------------------------------------------

    @property
    def modes(self) -> dict[str, dict]:
        return {m["id"]: m for m in self.config["modes"]}

    @property
    def programs(self) -> list[dict]:
        return self.config["programs"]

    def program(self, program_id: str) -> dict | None:
        return next((p for p in self.programs if p["id"] == program_id), None)

    def entity_runtime(self, entity_id: str) -> dict[str, Any]:
        return self.runtime["entities"].setdefault(entity_id, {})

    @staticmethod
    def now_iso() -> str:
        return dt_util.utcnow().isoformat()

    @staticmethod
    def parse(value: str | None) -> datetime | None:
        return dt_util.parse_datetime(value) if value else None
