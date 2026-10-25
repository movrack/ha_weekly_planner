"""Engine scenarios in a real Home Assistant test instance with simulated time."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from homeassistant.core import Context, HomeAssistant, ServiceCall
from homeassistant.util import dt as dt_util

from custom_components.weekly_planner.const import DOMAIN

TZ = ZoneInfo("Europe/Brussels")
CLIMATE = "climate.office"
COVER = "cover.office"


def local(day: int, h: int, m: int = 0) -> datetime:
    """October 2026: 26 = Monday."""
    return datetime(2026, 10, day, h, m, tzinfo=TZ)


def program(pid="office", slots=None, priority=10, reapply=True, entities=None, conditions=None):
    slots = slots if slots is not None else [slot("s1", "08:00", "12:00", "climate_comfort")]
    return {
        "id": pid, "name": pid, "priority": priority, "enabled": True, "reapply": reapply,
        "created_at": "2026-01-01T00:00:00+00:00", "revision": 1,
        "conditions": conditions or [],
        "entities": entities or [{"entity_id": CLIMATE, "default": {"kind": "mode", "value": "climate_eco"}}],
        "profiles": [{"id": "base", "name": "Base", "days": [list(slots) for _ in range(7)]}],
    }


def slot(sid, start, end, mode=None, by_entity=None, conditions=None):
    actions: dict[str, Any] = {"by_type": {}, "by_entity": by_entity or {}}
    if mode:
        actions["by_type"][mode.split("_")[0]] = mode
    return {"id": sid, "start": {"time": start}, "end": {"time": end} if end else None,
            "actions": actions, "conditions": conditions or []}


class FakeClimate:
    """A climate entity whose services update its state (optionally late)."""

    def __init__(self, hass: HomeAssistant, delay: timedelta | None = None) -> None:
        self.hass = hass
        self.delay = delay
        self.calls: list[tuple[str, dict]] = []
        hass.states.async_set(CLIMATE, "heat", {"preset_mode": "none", "temperature": 15,
                                                "preset_modes": ["none", "eco", "comfort", "boost"]})
        for service in ("set_preset_mode", "set_temperature", "set_hvac_mode"):
            hass.services.async_register("climate", service, self._handle)

    async def _handle(self, call: ServiceCall) -> None:
        data = {k: v for k, v in call.data.items() if k != "entity_id"}
        self.calls.append((call.service, data))
        state = self.hass.states.get(CLIMATE)
        attrs = dict(state.attributes)
        value = state.state
        if call.service == "set_preset_mode":
            attrs["preset_mode"] = data["preset_mode"]
        elif call.service == "set_temperature":
            attrs["temperature"] = data["temperature"]
            attrs["preset_mode"] = "none"
        else:
            value = data["hvac_mode"]
        if self.delay is None:
            self.hass.states.async_set(CLIMATE, value, attrs, context=call.context)
        else:
            self.pending = (value, attrs)

    def confirm_late(self) -> None:
        """Cloud refresh: the state arrives with a brand new context."""
        value, attrs = self.pending
        self.hass.states.async_set(CLIMATE, value, attrs, context=Context())

    def manual(self, preset: str) -> None:
        state = self.hass.states.get(CLIMATE)
        self.hass.states.async_set(CLIMATE, state.state, {**state.attributes, "preset_mode": preset},
                                   context=Context(user_id="someone"))

    @property
    def preset(self) -> str:
        return self.hass.states.get(CLIMATE).attributes["preset_mode"]


async def setup(hass: HomeAssistant, hass_storage, freezer, programs, start: datetime, **options):
    await hass.config.async_update(time_zone="Europe/Brussels")
    freezer.move_to(start)
    hass_storage[DOMAIN] = {"version": 1, "minor_version": 1, "key": DOMAIN,
                            "data": {"vacation": False, "modes": _modes(), "programs": programs}}
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=options)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=31))  # stabilization
    return entry.runtime_data


def _modes():
    from custom_components.weekly_planner.store import DEFAULT_MODES
    return [dict(m) for m in DEFAULT_MODES]


async def tick(hass: HomeAssistant, freezer, delta: timedelta) -> None:
    freezer.tick(delta)
    async_fire_time_changed(hass, dt_util.utcnow())
    await hass.async_block_till_done()


async def go_to(hass, freezer, moment: datetime) -> None:
    await tick(hass, freezer, moment.astimezone(dt_util.UTC) - dt_util.utcnow())


# ----------------------------------------------------------------------------- scenarios


async def test_start_and_end_of_slot(hass, hass_storage, freezer):  # S1
    climate = FakeClimate(hass)
    await setup(hass, hass_storage, freezer, [program()], local(26, 7, 0))
    assert climate.preset == "eco"  # startup outside slot: default applied (Q-B / S38)
    await go_to(hass, freezer, local(26, 8, 0))
    assert climate.preset == "comfort"
    await go_to(hass, freezer, local(26, 12, 0))
    assert climate.preset == "eco"


async def test_manual_override_kept_until_end(hass, hass_storage, freezer):  # S5
    climate = FakeClimate(hass)
    await setup(hass, hass_storage, freezer, [program()], local(26, 8, 30))
    assert climate.preset == "comfort"
    await tick(hass, freezer, timedelta(minutes=5))
    climate.manual("boost")
    await hass.async_block_till_done()
    await go_to(hass, freezer, local(26, 11, 0))
    assert climate.preset == "boost"  # nothing re-applied
    await go_to(hass, freezer, local(26, 12, 0))
    assert climate.preset == "eco"  # the end still runs


async def test_late_cloud_confirmation_is_not_an_override(hass, hass_storage, freezer):  # S14
    climate = FakeClimate(hass, delay=timedelta(minutes=2))
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 7, 55))
    await go_to(hass, freezer, local(26, 8, 0))
    await tick(hass, freezer, timedelta(minutes=2))
    climate.confirm_late()
    await hass.async_block_till_done()
    assert "override" not in engine.rt(CLIMATE)


async def test_reapply_off_waits_for_next_transition(hass, hass_storage, freezer):  # S7
    climate = FakeClimate(hass)
    await setup(hass, hass_storage, freezer, [program(reapply=False)], local(26, 9, 0))
    assert climate.preset == "none"  # not re-applied after restart
    await go_to(hass, freezer, local(26, 12, 0))
    assert climate.preset == "eco"


async def test_contiguous_slots_end_clears_manual_change(hass, hass_storage, freezer):  # S39
    climate = FakeClimate(hass)
    slots = [slot("a", "06:00", "08:00", "climate_comfort"), slot("b", "08:00", "10:00", "climate_comfort")]
    await setup(hass, hass_storage, freezer, [program(slots=slots)], local(26, 6, 30))
    await tick(hass, freezer, timedelta(minutes=5))
    climate.manual("boost")
    await hass.async_block_till_done()
    await go_to(hass, freezer, local(26, 8, 0))
    assert climate.preset == "comfort"


async def test_priority_hand_back(hass, hass_storage, freezer):  # S9
    climate = FakeClimate(hass)
    low = program("low", [slot("l", "08:00", "20:00", "climate_comfort")], priority=20)
    high = program("high", [slot("h", "10:00", "12:00", "climate_boost")], priority=1)
    await setup(hass, hass_storage, freezer, [low, high], local(26, 9, 0))
    assert climate.preset == "comfort"
    await go_to(hass, freezer, local(26, 10, 0))
    assert climate.preset == "boost"
    await go_to(hass, freezer, local(26, 12, 0))
    assert climate.preset == "comfort"


async def test_voluntary_override_with_deadline(hass, hass_storage, freezer):  # S35
    climate = FakeClimate(hass)
    await setup(hass, hass_storage, freezer, [program()], local(26, 8, 30))
    await hass.services.async_call(DOMAIN, "override", {
        "entity_id": CLIMATE, "setpoint": {"kind": "preset", "preset": "boost"},
        "duration": {"hours": 1}}, blocking=True)
    await hass.async_block_till_done()
    assert climate.preset == "boost"
    await go_to(hass, freezer, local(26, 9, 35))
    assert climate.preset == "comfort"


async def test_vacation_applies_default(hass, hass_storage, freezer):  # S12
    climate = FakeClimate(hass)
    await setup(hass, hass_storage, freezer, [program()], local(26, 9, 0))
    await hass.services.async_call("switch", "turn_on",
                                   {"entity_id": "switch.weekly_planner_vacation"}, blocking=True)
    await hass.async_block_till_done()
    assert climate.preset == "eco"
    await go_to(hass, freezer, local(27, 9, 0))
    assert climate.preset == "eco"  # programs suspended


async def test_unavailable_then_back(hass, hass_storage, freezer):  # S13
    climate = FakeClimate(hass)
    await setup(hass, hass_storage, freezer, [program()], local(26, 7, 0))
    hass.states.async_set(CLIMATE, "unavailable", {})
    await go_to(hass, freezer, local(26, 8, 0))
    hass.states.async_set(CLIMATE, "heat", {"preset_mode": "eco", "temperature": 15})
    await hass.async_block_till_done()
    await hass.async_block_till_done()
    assert climate.preset == "comfort"


async def test_one_shot_slot(hass, hass_storage, freezer):  # S24
    climate = FakeClimate(hass)
    slots = [slot("shot", "05:00", None, "climate_boost")]
    await setup(hass, hass_storage, freezer, [program(slots=slots)], local(26, 4, 0))
    await go_to(hass, freezer, local(26, 5, 0))
    assert climate.preset == "boost"
    await go_to(hass, freezer, local(26, 6, 0))
    assert climate.preset == "boost"  # no end, nothing undone
