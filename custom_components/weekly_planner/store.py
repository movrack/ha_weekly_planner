"""Persistence: configuration (programs, modes), runtime state and decision journal.

Three versioned stores (spec § 8). The configuration store refuses to start from scratch
when a file existed but could not be read, so a corrupt file never silently wipes the
user's programs.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timedelta
import inspect
import logging
from pathlib import Path
import shutil
from typing import Any
import uuid

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.helpers.translation import async_get_translations
from homeassistant.util import dt as dt_util

from .const import DOMAIN, STORAGE_MINOR_VERSION, STORAGE_VERSION

from .migration import migrate_config_v1, migrate_runtime_v1

_LOGGER = logging.getLogger(__name__)

JOURNAL_DAYS = 14

def new_id() -> str:
    return uuid.uuid4().hex[:12]


def empty_config() -> dict[str, Any]:
    """Fresh configuration."""
    return {"vacation": False, "labels": [], "programs": []}


class ConfigStoreError(Exception):
    """The configuration file exists but cannot be used."""


class _VersionedStore(Store):
    """Store that migrates older versions (docs/SPEC.md § 8.1), keeping a copy of the old file."""

    def __init__(self, *args: Any, migrate: Callable[[dict], dict] | None = None, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self._migrate = migrate

    async def _async_migrate_func(self, old_major: int, old_minor: int, old_data: dict) -> dict:
        _LOGGER.info("Migrating %s from %s.%s", self.key, old_major, old_minor)
        if old_major < self.version and self._migrate is not None:
            path = Path(self.path)
            stamp = dt_util.utcnow().strftime("%Y%m%d%H%M%S")
            if await self.hass.async_add_executor_job(path.exists):
                await self.hass.async_add_executor_job(
                    shutil.copy2, path, path.with_name(f"{path.name}.v{old_major}-backup-{stamp}"))
            result = self._migrate(old_data)
            return await result if inspect.isawaitable(result) else result
        return old_data


class PlannerStore:
    """Configuration, runtime and journal stores."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._config = _VersionedStore(hass, STORAGE_VERSION, DOMAIN,
                                       minor_version=STORAGE_MINOR_VERSION, atomic_writes=True,
                                       migrate=self._migrate_config)
        self._runtime = _VersionedStore(hass, 2, f"{DOMAIN}.runtime", atomic_writes=True,
                                        migrate=migrate_runtime_v1)
        self._journal = _VersionedStore(hass, 1, f"{DOMAIN}.journal", atomic_writes=True)
        self.config: dict[str, Any] = empty_config()
        self.runtime: dict[str, Any] = {"entities": {}, "programs": {}}
        self.journal: list[dict[str, Any]] = []
        self.read_only = False

    async def _migrate_config(self, data: dict) -> dict:
        """Version 1 -> 2, label names of other actions taken from the translated service names."""
        language = self.hass.config.language
        try:
            texts = await async_get_translations(self.hass, language, "services")
        except Exception:  # noqa: BLE001 - names are a nicety, the ids are a fine fallback
            texts = {}
        names = {
            f"{key.split('.')[1]}.{key.split('.')[3]}": value
            for key, value in texts.items()
            if key.startswith("component.") and key.count(".") == 4 and key.endswith(".name")
        }
        return migrate_config_v1(data, language, names)

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
        self.config = data if data is not None else empty_config()
        self.runtime = await self._runtime.async_load() or self.runtime
        self.journal = (await self._journal.async_load() or {}).get("segments", [])

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
