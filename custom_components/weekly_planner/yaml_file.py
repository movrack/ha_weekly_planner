"""YAML mirror of the configuration: ``/config/www/weekly_planner.yml`` (spec § 37.3).

The ``.storage`` store stays the source of truth at runtime. This file is written after every
save made in the interface and can be edited by hand: a changed file is validated with the same
rules as the websocket API and only then replaces the configuration. An invalid file changes
nothing and raises a repair issue.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import voluptuous as vol
import yaml
from homeassistant.core import CALLBACK_TYPE, HassJob, HomeAssistant, callback
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .slots import normalise_slot_entities, remove_device_from_slots
from .store import PlannerStore, new_id
from .validation import check_label, check_mode_config, check_program, keep_pause

_LOGGER = logging.getLogger(__name__)

YAML_VERSION = 1
ISSUE = "yaml_invalid"
WRITE_DELAY_S = 2
CHECK_INTERVAL = timedelta(seconds=30)
HEADER = (
    "# Weekly Planner configuration (generated file).\n"
    "# Edit by hand if you like: a valid change is imported within 30 seconds. Every save made in the\n"
    "# interface rewrites this file, so comments and ordering are not kept.\n"
    "# WARNING: /config/www is served WITHOUT authentication at /local/weekly_planner.yml.\n"
    "# Schedules reveal when the house is empty: do not publish this address.\n"
)


def yaml_path(hass: HomeAssistant) -> Path:
    """Where the mirror lives."""
    return Path(hass.config.path("www", "weekly_planner.yml"))


def remove_files(path: Path) -> None:
    """Delete the mirror (and its leftovers) when the integration is removed."""
    for name in (path.name, f"{path.name}.invalid", f"{path.name}.tmp"):
        path.with_name(name).unlink(missing_ok=True)


DAYS = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")


def program_to_file(program: dict[str, Any]) -> dict[str, Any]:
    """A program as written in the file: ``profiles`` become ``modes: {name: {mon..sun: [...]}}``."""
    out: dict[str, Any] = {}
    for key, value in program.items():
        if key == "profiles":
            out["modes"] = {p["name"]: dict(zip(DAYS, p["days"], strict=True)) for p in value}
        else:
            out[key] = value
    return out


def program_from_file(item: dict[str, Any], existing: dict[str, Any] | None) -> dict[str, Any]:
    """A program of the file as stored: ``modes`` become ``profiles``; the old ``profiles`` list still works.

    A mode keeps the id of the existing profile with the same NAME (a new name gets a fresh id). A profile
    absent from the file is removed, unless the file lists no mode at all (the program keeps its profiles).
    """
    program = dict(item)
    modes = program.pop("modes", None)
    if modes is None:
        return program
    if "profiles" in program:
        raise ValueError("a program has either 'modes' or the old 'profiles', not both")
    if not isinstance(modes, dict):
        raise TypeError("'modes' must map a mode name to its days")
    ids = {p["name"]: p["id"] for p in (existing or {}).get("profiles", [])}
    profiles = []
    for name, days in modes.items():
        if not isinstance(name, str):
            raise TypeError(f"mode name {name!r} must be text")
        if days is None:
            days = {}
        if not isinstance(days, dict) or set(days) - set(DAYS):
            raise TypeError(f"mode {name}: expected the days {', '.join(DAYS)}")
        profiles.append({"id": ids.get(name) or new_id(), "name": name,
                         "days": [days.get(day) or [] for day in DAYS]})
    if not profiles and existing:
        return {**program, "profiles": existing["profiles"]}
    return {**program, "profiles": profiles}


def render(config: dict[str, Any]) -> bytes:
    """The file content for ``config`` (a JSON round trip first: no YAML anchors for shared objects)."""
    plain = json.loads(json.dumps(config))
    body = {
        "version": YAML_VERSION,
        "vacation": plain.get("vacation", False),
        "mode_selector": plain.get("mode_selector"),
        "default_mode": plain.get("default_mode"),
        "labels": plain.get("labels", []),
        "programs": [program_to_file(p) for p in plain.get("programs", [])],
    }
    text = yaml.safe_dump(body, sort_keys=False, allow_unicode=True)
    return (HEADER + "\n" + text).encode()


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _stat_key(path: Path) -> tuple[int, int] | None:
    try:
        info = path.stat()
    except OSError:
        return None
    return info.st_mtime_ns, info.st_size


def _read_changed(path: Path, last: tuple[int, int] | None) -> tuple[tuple[int, int] | None, bytes | None]:
    """(stat, content) of the file; content is None when missing or unchanged since ``last``."""
    key = _stat_key(path)
    if key is None or key == last:
        return key, None
    try:
        return key, path.read_bytes()
    except OSError:
        return key, None


def _write_atomic(path: Path, data: bytes, known_hash: str | None) -> tuple[int, int] | None:
    """Write ``data`` (tmp file + replace); keep an unimported file as ``<name>.invalid`` first."""
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        current = path.read_bytes()
    except OSError:
        current = None
    if current == data:
        return _stat_key(path)
    if current is not None and digest(current) != known_hash:
        path.with_name(f"{path.name}.invalid").write_bytes(current)
    tmp = path.with_name(f"{path.name}.tmp")
    tmp.write_bytes(data)
    os.replace(tmp, path)
    return _stat_key(path)


def _parse(data: bytes) -> dict[str, Any]:
    """Parse and check the shape of the file; raises ``ValueError``/``TypeError`` with a readable reason."""
    try:
        raw = yaml.safe_load(data.decode())
    except (yaml.YAMLError, UnicodeDecodeError) as err:
        raise ValueError(f"YAML syntax: {err}") from err
    if not isinstance(raw, dict):
        raise TypeError("the file must be a mapping with labels and programs (empty file refused)")
    if raw.get("version", YAML_VERSION) != YAML_VERSION:
        raise ValueError(f"unsupported version {raw.get('version')!r}")
    for key in ("labels", "programs"):
        if not isinstance(raw.get(key), list):
            raise TypeError(f"'{key}' must be a list")
    if not isinstance(raw.get("vacation", False), bool):
        raise TypeError("'vacation' must be true or false")
    for key in ("mode_selector", "default_mode"):
        if raw.get(key) is not None and not isinstance(raw[key], str):
            raise TypeError(f"'{key}' must be text or empty")
    return raw


class YamlSync:
    """Keeps the YAML file and the configuration of a ``PlannerStore`` in step."""

    def __init__(self, hass: HomeAssistant, engine: Any, descriptions: Any) -> None:
        self.hass = hass
        self.engine = engine
        self.store: PlannerStore = engine.store
        self._descriptions = descriptions  # coroutine function: hass -> service descriptions | None
        self.path = yaml_path(hass)
        self._lock = asyncio.Lock()
        self._timer: CALLBACK_TYPE | None = None
        self._unsub_interval: CALLBACK_TYPE | None = None
        self._stat: tuple[int, int] | None = None
        self._error_hash: str | None = None  # content already reported as invalid
        self._importing = False
        self._live = False
        self._stopped = False

    # -- lifecycle -------------------------------------------------------------

    async def async_start(self) -> None:
        """Startup: import a changed file, or create the missing one."""
        if self.store.read_only:
            return
        await self.async_check(force=True)

    @callback
    def async_go_live(self) -> None:
        """The engine runs: later imports re-evaluate the schedules; poll the file."""
        self._live = True
        if not self.store.read_only:
            self._unsub_interval = async_track_time_interval(
                self.hass, self._async_tick, CHECK_INTERVAL, cancel_on_shutdown=True)

    async def async_stop(self) -> None:
        self._stopped = True
        if self._unsub_interval:
            self._unsub_interval()
            self._unsub_interval = None
        if self._timer:  # a pending write must not be lost
            self._timer()
            self._timer = None
            if not self.store.read_only:
                await self._async_write()

    # -- export ----------------------------------------------------------------

    @callback
    def schedule_write(self) -> None:
        """Debounced write after a save made in the interface."""
        if self._importing or self._stopped or self.store.read_only:
            return
        if self._timer:
            self._timer()
        self._timer = async_call_later(self.hass, WRITE_DELAY_S, HassJob(self._async_timer, cancel_on_shutdown=True))

    async def _async_timer(self, _now: datetime) -> None:
        self._timer = None
        await self._async_write()

    async def _async_write(self) -> None:
        async with self._lock:
            data = await self.hass.async_add_executor_job(render, self._snapshot())
            await self._async_store(data)

    def _snapshot(self) -> dict[str, Any]:
        # Serialised in the loop (fast) so the executor never reads a dict being edited.
        return json.loads(json.dumps(self.store.config))

    async def _async_store(self, data: bytes) -> None:
        known = self.store.runtime.get("yaml_hash")
        try:
            self._stat = await self.hass.async_add_executor_job(_write_atomic, self.path, data, known)
        except OSError as err:
            _LOGGER.warning("Weekly Planner could not write %s: %s", self.path, err)
            return
        self._remember(digest(data))
        self._error_hash = None
        ir.async_delete_issue(self.hass, DOMAIN, ISSUE)

    def _remember(self, file_hash: str) -> None:
        if self.store.runtime.get("yaml_hash") != file_hash:
            self.store.runtime["yaml_hash"] = file_hash
            self.store.save_runtime()

    # -- import ----------------------------------------------------------------

    async def _async_tick(self, _now: datetime) -> None:
        await self.async_check()

    async def async_check(self, *, force: bool = False) -> None:
        """Create the file when missing, import it when a hand edit changed it."""
        if self.store.read_only:
            return
        async with self._lock:
            stat, data = await self.hass.async_add_executor_job(
                _read_changed, self.path, None if force else self._stat)
            if stat is None:
                await self._async_store(await self.hass.async_add_executor_job(render, self._snapshot()))
                return
            self._stat = stat
            if data is None:
                return
            file_hash = digest(data)
            if file_hash == self.store.runtime.get("yaml_hash"):
                self._error_hash = None
                ir.async_delete_issue(self.hass, DOMAIN, ISSUE)
                return
            await self._async_import(data, file_hash)

    async def _async_import(self, data: bytes, file_hash: str) -> None:
        try:
            labels, programs, vacation, mode = await self._async_validate(data)
        except (ValueError, vol.Invalid, TypeError, KeyError, AttributeError) as err:
            self._reject(file_hash, str(err))
            return
        self._importing = True
        try:
            await self._async_apply(labels, programs, vacation, mode)
        finally:
            self._importing = False
        self._remember(file_hash)
        self._error_hash = None
        ir.async_delete_issue(self.hass, DOMAIN, ISSUE)
        _LOGGER.info("Weekly Planner imported %s", self.path)

    def _reject(self, file_hash: str, error: str) -> None:
        if self._error_hash == file_hash:
            return
        self._error_hash = file_hash
        _LOGGER.error("Weekly Planner ignored %s, nothing was changed: %s", self.path, error)
        ir.async_create_issue(
            self.hass, DOMAIN, ISSUE, is_fixable=False, severity=ir.IssueSeverity.ERROR,
            translation_key=ISSUE, translation_placeholders={"error": error[:500]},
        )

    async def _async_validate(self, data: bytes) -> tuple[list[dict], list[dict], bool, dict | None]:
        """Same rules as ``label/save`` and ``program/save``; nothing is modified."""
        raw = _parse(data)
        descriptions = await self._descriptions(self.hass)
        labels: dict[str, dict] = {}
        for item in raw["labels"]:
            if not isinstance(item, dict) or not item.get("id"):
                raise ValueError("every label needs an id")
            label = check_label(dict(item), self.hass, descriptions)
            if label["id"] in labels:
                raise ValueError(f"duplicate label id {label['id']}")
            labels[label["id"]] = label
        programs: list[dict] = []
        seen: set[str] = set()
        for item in raw["programs"]:
            if not isinstance(item, dict):
                raise TypeError("every program must be a mapping")
            program = dict(item)
            if not program.get("id"):
                program["id"] = new_id()
                program.setdefault("created_at", dt_util.utcnow().isoformat())
            if program["id"] in seen:
                raise ValueError(f"duplicate program id {program['id']}")
            seen.add(program["id"])
            existing = self.store.program(program["id"])
            program = program_from_file(program, existing)
            program = keep_pause(existing, self._clean_slot_entities(existing, program), keep_enabled=False)
            programs.append(check_program(program, labels, self.hass, descriptions,
                                          self.engine.reapply_default))
        mode = None
        if "mode_selector" in raw or "default_mode" in raw:  # a file without them leaves the settings alone
            selector = raw.get("mode_selector") or None
            state = self.hass.states.get(selector) if selector else None
            options = [o for o in state.attributes.get("options") or [] if isinstance(o, str)] if state else None
            mode = check_mode_config(selector, raw.get("default_mode"), self.hass, options)
        return list(labels.values()), programs, raw.get("vacation", False), mode

    @staticmethod
    def _clean_slot_entities(existing: dict | None, program: dict) -> dict:
        """As in the websocket save: devices that left the program leave every slot list."""
        try:
            if existing:
                kept = {e["entity_id"] for e in program["entities"]}
                for old in existing.get("entities", []):
                    if old["entity_id"] not in kept:
                        program = remove_device_from_slots(program, old["entity_id"])
            return normalise_slot_entities(program)
        except (KeyError, TypeError, AttributeError):
            return program

    async def _async_apply(self, labels: list[dict], programs: list[dict], vacation: bool,
                           mode: dict | None = None) -> None:
        store = self.store
        new_ids = {p["id"] for p in programs}
        removed = [p for p in store.programs if p["id"] not in new_ids]
        if self._live:
            for program in removed:
                await self.engine.async_set_enabled(program["id"], False)  # default applied once
        # No await from here to the end of the swap: revisions are taken from the current programs.
        for program in programs:
            existing = store.program(program["id"])
            if existing is None:
                program["revision"] = 1
                program.setdefault("created_at", dt_util.utcnow().isoformat())
                continue
            program.setdefault("created_at", existing.get("created_at"))
            if program.get("created_at") is None:
                program.pop("created_at")
            unchanged = {k: v for k, v in existing.items() if k != "revision"} == {
                k: v for k, v in program.items() if k != "revision"}
            program["revision"] = existing.get("revision", 0) + (0 if unchanged else 1)
        for program in removed:
            store.runtime["programs"].pop(program["id"], None)
        store.config["labels"] = labels
        store.config["programs"] = programs
        store.config["vacation"] = vacation
        if mode is not None:
            if store.config.get("mode_selector") != mode["mode_selector"]:
                for key in ("last_mode", "mode_options_seen", "mode_renames"):
                    store.runtime.pop(key, None)  # remembered for the former selector
                store.save_runtime()
            store.config.update(mode)
        store.save_config(mirror=False)
        for program in removed:
            await self.engine.async_remove_program_entities(program)
        if self._live:
            await self.engine.async_config_changed()
