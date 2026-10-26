"""Shared helpers: programs, a service recorder, simulated time, engine set-up."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.util import dt as dt_util

from custom_components.weekly_planner.const import DOMAIN

TZ = ZoneInfo("Europe/Brussels")
CLIMATE = "climate.office"
COVER = "cover.office"

SERVICES = {
    "climate": ["set_temperature", "set_preset_mode", "set_hvac_mode"],
    "cover": ["open_cover", "close_cover", "set_cover_position"],
    "light": ["turn_on", "turn_off"],
    "switch": ["turn_on", "turn_off"],
    "vacuum": ["start", "return_to_base"],
    "scene": ["turn_on"],
}


def local(day: int, h: int, m: int = 0) -> datetime:
    """October 2026: 26 = Monday."""
    return datetime(2026, 10, day, h, m, tzinfo=TZ)


def act(service: str, **data: Any) -> dict:
    return {"kind": "service", "service": service, "data": data}


def temp(value: float) -> dict:
    return act("climate.set_temperature", temperature=value)


def scene(entity_id: str) -> dict:
    return {"kind": "scene", "scene": entity_id}


def label(name: str, action: dict, color: str = "#ff9800") -> dict:
    return {"id": name, "name": name, "color": color, "action": action}


def slot(sid: str, start: str, end: str | None, label_id: str | None = "t21", conditions: list | None = None) -> dict:
    return {"id": sid, "start": {"time": start}, "end": {"time": end} if end else None,
            "label": label_id, "conditions": conditions or []}


def program(pid: str = "office", slots: list | None = None, priority: int = 10, reapply: bool = True,
            entities: list | None = None, conditions: list | None = None, default: str | None = "t15") -> dict:
    slots = slots if slots is not None else [slot("s1", "08:00", "12:00", "t21")]
    return {
        "id": pid, "name": pid, "priority": priority, "enabled": True, "reapply": reapply,
        "created_at": "2026-01-01T00:00:00+00:00", "revision": 1, "conditions": conditions or [],
        "entities": entities if entities is not None else [
            {"entity_id": CLIMATE, "default_label": default, "label_overrides": {}}],
        "profiles": [{"id": "base", "name": "Base", "days": [list(slots) for _ in range(7)]}],
    }


def labels() -> list[dict]:
    """Labels shared by the tests: temperatures, a preset, a scene, cover and vacuum actions."""
    return [
        label("t21", temp(21)), label("t15", temp(15), "#2196f3"), label("t19", temp(19)), label("t25", temp(25)),
        label("boost", act("climate.set_preset_mode", preset_mode="boost")),
        label("work", scene("scene.work")), label("close", act("cover.close_cover")),
        label("open", act("cover.open_cover")), label("start", act("vacuum.start")),
        label("light50", act("light.turn_on", brightness_pct=50)),
    ]


class Recorder:
    """Registers the services of the tests and records every call as ``(service, data)``."""

    def __init__(self, hass: HomeAssistant, domains: tuple[str, ...] = tuple(SERVICES), error: Exception | None = None) -> None:
        self.hass = hass
        self.calls: list[tuple[str, dict]] = []
        self.error = error
        for domain in domains:
            for service in SERVICES[domain]:
                hass.services.async_register(domain, service, self._handle)
        hass.states.async_set(CLIMATE, "heat", {"temperature": 10})
        hass.states.async_set(COVER, "open", {"current_position": 100})

    async def _handle(self, call: ServiceCall) -> None:
        data = {k: v for k, v in call.data.items() if k != "entity_id"}
        self.calls.append((f"{call.domain}.{call.service}", data))
        if self.error:
            raise self.error

    @property
    def services(self) -> list[str]:
        return [name for name, _ in self.calls]


async def setup(hass: HomeAssistant, hass_storage, freezer, programs, start: datetime | None,
                extra_labels: list | None = None, **options):
    await hass.config.async_update(time_zone="Europe/Brussels")
    if start is not None:
        freezer.move_to(start)
    hass_storage[DOMAIN] = {"version": 2, "minor_version": 1, "key": DOMAIN,
                            "data": {"vacation": False, "labels": extra_labels or labels(), "programs": programs}}
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=options)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=31))  # stabilization
    return entry.runtime_data


async def tick(hass: HomeAssistant, freezer, delta: timedelta) -> None:
    freezer.tick(delta)
    async_fire_time_changed(hass, dt_util.utcnow())
    await hass.async_block_till_done()


async def go_to(hass, freezer, moment: datetime) -> None:
    await tick(hass, freezer, moment.astimezone(dt_util.UTC) - dt_util.utcnow())
