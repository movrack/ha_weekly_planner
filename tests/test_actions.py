"""Slot actions of the redesigned card: scenes, switch off, light details, next action."""

from __future__ import annotations

import voluptuous as vol
import pytest

from homeassistant.core import HomeAssistant, ServiceCall, State

from custom_components.weekly_planner.setpoints import calls_for, matches, snapshot
from custom_components.weekly_planner.validation import SETPOINT

from .test_engine import CLIMATE, FakeClimate, go_to, local, program, setup, slot


def record(hass: HomeAssistant, domain: str, services: list[str]) -> list[tuple[str, dict]]:
    calls: list[tuple[str, dict]] = []

    async def handle(call: ServiceCall) -> None:
        calls.append((f"{call.domain}.{call.service}", dict(call.data)))

    for service in services:
        hass.services.async_register(domain, service, handle)
    return calls


# ----------------------------------------------------------------------------- scenes

async def test_scene_in_timed_slot_then_back_to_default(hass, hass_storage, freezer):
    climate = FakeClimate(hass)
    scenes = record(hass, "scene", ["turn_on"])
    slots = [slot("s", "08:00", "10:00", by_entity={CLIMATE: {"kind": "scene", "scene": "scene.work"}})]
    await setup(hass, hass_storage, freezer, [program(slots=slots)], local(26, 7, 0))
    assert climate.preset == "eco"  # default
    await go_to(hass, freezer, local(26, 8, 0))
    assert scenes == [("scene.turn_on", {"entity_id": "scene.work"})]
    await go_to(hass, freezer, local(26, 10, 0))
    assert climate.preset == "eco"  # the slot ended: back to the default
    assert len(scenes) == 1  # a scene is never replayed


async def test_scene_without_end_is_fired_once(hass, hass_storage, freezer):
    FakeClimate(hass)
    scenes = record(hass, "scene", ["turn_on"])
    slots = [slot("s", "08:00", None, by_entity={CLIMATE: {"kind": "scene", "scene": "scene.work"}})]
    await setup(hass, hass_storage, freezer, [program(slots=slots)], local(26, 7, 0))
    await go_to(hass, freezer, local(26, 9, 0))
    assert scenes == [("scene.turn_on", {"entity_id": "scene.work"})]


# ----------------------------------------------------------------------------- switch

def test_switch_off_calls_and_check():
    (call,) = calls_for("switch.x", {"kind": "off"})
    assert (call.domain, call.service) == ("switch", "turn_off")
    assert matches(State("switch.x", "off"), {"kind": "off"})
    assert not matches(State("switch.x", "on"), {"kind": "off"})


async def test_switch_off_as_slot_action(hass, hass_storage, freezer):
    hass.states.async_set("switch.lamp", "on")
    ents = [{"entity_id": "switch.lamp", "default": {"kind": "none"}}]
    slots = [slot("s", "22:00", None, by_entity={"switch.lamp": {"kind": "off"}})]
    await setup(hass, hass_storage, freezer, [program(slots=slots, entities=ents)], local(26, 21, 0))

    async def turn_off(call: ServiceCall) -> None:  # replaces the platform's service
        hass.states.async_set("switch.lamp", "off", context=call.context)

    hass.services.async_register("switch", "turn_off", turn_off)
    await go_to(hass, freezer, local(26, 22, 0))
    assert hass.states.get("switch.lamp").state == "off"


# ----------------------------------------------------------------------------- light

def test_light_effect_and_color_temp_are_sent():
    sp = {"kind": "on", "brightness": 40, "effect": "rainbow", "color_temp_kelvin": 2700}
    (call,) = calls_for("light.x", sp)
    assert call.service_data("light.x") == {
        "entity_id": "light.x", "brightness_pct": 40, "effect": "rainbow", "color_temp_kelvin": 2700}


def test_light_effect_and_color_temp_are_checked():
    attrs = {"brightness": 102, "effect": "rainbow", "color_temp_kelvin": 2700}
    sp = {"kind": "on", "brightness": 40, "effect": "rainbow", "color_temp_kelvin": 2700}
    assert matches(State("light.x", "on", attrs), sp)
    assert not matches(State("light.x", "on", {**attrs, "effect": "none"}), sp)
    assert not matches(State("light.x", "on", {**attrs, "color_temp_kelvin": 4000}), sp)
    assert matches(State("light.x", "on", {**attrs, "color_temp_kelvin": 2750}), sp)


def test_light_snapshot_keeps_effect_or_color_temp():
    st = State("light.x", "on", {"brightness": 255, "effect": "rainbow"})
    assert snapshot(st) == {"kind": "on", "brightness": 100, "effect": "rainbow"}
    st = State("light.x", "on", {"brightness": 255, "color_temp_kelvin": 3000})
    assert snapshot(st)["color_temp_kelvin"] == 3000


def test_light_setpoint_ranges_are_validated():
    assert SETPOINT({"kind": "on", "brightness": 50, "color_temp_kelvin": 2700, "effect": "x"})
    with pytest.raises(vol.Invalid):
        SETPOINT({"kind": "on", "brightness": 150})
    with pytest.raises(vol.Invalid):
        SETPOINT({"kind": "on", "color_temp_kelvin": 50})


# ----------------------------------------------------------------------------- next action

async def test_next_action_in_status(hass, hass_storage, freezer):
    FakeClimate(hass)
    slots = [slot("s", "08:00", "10:00", "climate_comfort")]
    engine = await setup(hass, hass_storage, freezer, [program(slots=slots)], local(26, 7, 0))
    nxt = engine.program_status("office")["next_actions"][CLIMATE]
    assert nxt["setpoint"] == {"kind": "preset", "preset": "comfort"}
    assert nxt["at"].startswith("2026-10-26T07:00")  # 08:00 local = 07:00 UTC
    await go_to(hass, freezer, local(26, 9, 0))
    nxt = engine.program_status("office")["next_actions"][CLIMATE]
    assert nxt["setpoint"] == {"kind": "preset", "preset": "eco"}  # the end gives the default
    assert nxt["at"].startswith("2026-10-26T09:00")


async def test_next_action_of_a_one_shot(hass, hass_storage, freezer):
    FakeClimate(hass)
    slots = [slot("s", "05:00", None, "climate_boost")]
    engine = await setup(hass, hass_storage, freezer, [program(slots=slots)], local(26, 6, 0))
    nxt = engine.next_action(CLIMATE)
    assert nxt["setpoint"] == {"kind": "preset", "preset": "boost"}
    assert nxt["at"].startswith("2026-10-27T04:00")  # tomorrow 05:00 local
