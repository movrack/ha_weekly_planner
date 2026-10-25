"""More engine scenarios: defaults, profiles, rights, storage, registry, Adaptive Lighting."""

from __future__ import annotations

from datetime import timedelta

from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import Context, HomeAssistant, ServiceCall
from homeassistant.helpers import entity_registry as er, issue_registry as ir

from custom_components.weekly_planner.const import DOMAIN

from .test_engine import (
    CLIMATE, FakeClimate, _modes, go_to, local, program, setup, slot, tick,
)


async def test_previous_state_with_crossing_programs(hass, hass_storage, freezer):  # S16
    climate = FakeClimate(hass)
    climate.hass.states.async_set(CLIMATE, "heat", {"preset_mode": "eco", "temperature": 15})
    prev = [{"entity_id": CLIMATE, "default": {"kind": "previous"}}]
    a = program("a", [slot("a", "18:00", "22:00", "climate_comfort")], priority=2, entities=prev)
    b = program("b", [slot("b", "21:00", "23:00", "climate_boost")], priority=1, entities=prev)
    await setup(hass, hass_storage, freezer, [a, b], local(26, 17, 0), reapply_default=True)
    await go_to(hass, freezer, local(26, 18, 0))
    assert climate.preset == "comfort"
    await go_to(hass, freezer, local(26, 21, 0))
    assert climate.preset == "boost"
    await go_to(hass, freezer, local(26, 23, 0))
    assert climate.preset == "eco"  # the state before any slot, not "comfort"


async def test_profile_change_mid_slot(hass, hass_storage, freezer):  # S36
    climate = FakeClimate(hass)
    prog = program()
    prog["profiles"].append({"id": "summer", "name": "Été",
                             "days": [[slot("x", "08:00", "12:00", "climate_boost")] for _ in range(7)]})
    engine = await setup(hass, hass_storage, freezer, [prog], local(26, 9, 0))
    assert climate.preset == "comfort"
    await engine.async_set_profile("office", "summer")
    await hass.async_block_till_done()
    assert climate.preset == "boost"


async def test_skip_next_and_apply_now(hass, hass_storage, freezer):  # S42
    climate = FakeClimate(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 7, 0))
    engine.skip_next("office")
    await go_to(hass, freezer, local(26, 8, 0))
    assert climate.preset == "eco"  # start skipped
    await engine.async_apply_now("office")
    await hass.async_block_till_done()
    assert climate.preset == "comfort"


async def test_one_shot_not_replayed_on_restart(hass, hass_storage, freezer):  # S29
    calls: list[ServiceCall] = []
    hass.services.async_register("script", "turn_on", lambda call: calls.append(call))
    FakeClimate(hass)
    slots = [slot("s", "08:00", "12:00", by_entity={CLIMATE: {"kind": "script", "script": "script.x"}})]
    engine = await setup(hass, hass_storage, freezer, [program(slots=slots)], local(26, 9, 0))
    await hass.async_block_till_done()
    assert not calls
    await engine.async_recompute("startup")
    assert not calls


async def test_versatile_thermostat_locked(hass, hass_storage, freezer):  # S22
    climate = FakeClimate(hass)
    hass.states.async_set(CLIMATE, "heat", {"preset_mode": "none", "lock_manager": {
        "is_locked": True, "lock_automations": True}})
    await setup(hass, hass_storage, freezer, [program()], local(26, 9, 0))
    assert not climate.calls


async def test_voluntary_deadline_during_downtime(hass, hass_storage, freezer):  # S44
    climate = FakeClimate(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 8, 30))
    await engine.async_override(CLIMATE, {"kind": "preset", "preset": "boost"}, None)
    await hass.async_block_till_done()
    rt = engine.rt(CLIMATE)
    rt["override"]["until"] = (local(26, 9, 0)).isoformat()
    await go_to(hass, freezer, local(26, 9, 5))
    assert climate.preset == "comfort"


async def test_external_change_replaces_voluntary_override(hass, hass_storage, freezer):  # Q-K
    climate = FakeClimate(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 8, 30))
    await hass.services.async_call(DOMAIN, "override", {
        "entity_id": CLIMATE, "setpoint": {"kind": "preset", "preset": "boost"},
        "duration": {"hours": 1}}, blocking=True)
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(minutes=2))
    climate.manual("eco")
    await hass.async_block_till_done()
    assert engine.rt(CLIMATE)["override"]["origin"] == "external"
    await go_to(hass, freezer, local(26, 10, 0))
    assert climate.preset == "eco"  # kept until the end of the slot
    await go_to(hass, freezer, local(26, 12, 0))
    assert climate.preset == "eco"


async def test_rename_entity_follows(hass, hass_storage, freezer):  # S32
    registry = er.async_get(hass)
    entry = registry.async_get_or_create("climate", "test", "office", suggested_object_id="office")
    assert entry.entity_id == CLIMATE
    FakeClimate(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 7, 0))
    registry.async_update_entity(CLIMATE, new_entity_id="climate.bureau")
    await hass.async_block_till_done()
    assert engine.store.programs[0]["entities"][0]["entity_id"] == "climate.bureau"


async def test_removed_entity_raises_repair(hass, hass_storage, freezer):
    await setup(hass, hass_storage, freezer, [program()], local(26, 7, 0))
    issues = ir.async_get(hass)
    assert issues.async_get_issue(DOMAIN, "missing_entities") is not None


async def test_corrupt_storage_is_read_only(hass, hass_storage, freezer, tmp_path):  # S28
    hass_storage[DOMAIN] = {"version": 99, "minor_version": 1, "key": DOMAIN, "data": {}}
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert not await hass.config_entries.async_setup(entry.entry_id)
    assert hass_storage[DOMAIN]["version"] == 99  # untouched


async def test_condition_debounce(hass, hass_storage, freezer):  # S30
    climate = FakeClimate(hass)
    hass.states.async_set("input_boolean.home", "on")
    cond = [{"entity_id": "input_boolean.home", "op": "eq", "value": "on"}]
    await setup(hass, hass_storage, freezer, [program(conditions=cond)], local(26, 9, 0), debounce_min=2)
    assert climate.preset == "comfort"
    hass.states.async_set("input_boolean.home", "off")
    await tick(hass, freezer, timedelta(minutes=1))
    hass.states.async_set("input_boolean.home", "on")
    await tick(hass, freezer, timedelta(minutes=3))
    assert climate.preset == "comfort"  # bounce ignored
    hass.states.async_set("input_boolean.home", "off")
    await tick(hass, freezer, timedelta(minutes=3))
    assert climate.preset == "eco"


async def test_evohome_released_on_removal(hass, hass_storage, freezer):  # S43
    climate = FakeClimate(hass)
    hass.states.async_set(CLIMATE, "heat", {"preset_mode": "none", "temperature": 15,
                                            "preset_modes": ["none", "temporary", "permanent", "eco", "comfort"]})
    ents = [{"entity_id": CLIMATE, "default": {"kind": "mode", "value": "climate_eco"}, "force_permanent": True}]
    engine = await setup(hass, hass_storage, freezer, [program(entities=ents)], local(26, 9, 0))
    assert ("set_preset_mode", {"preset_mode": "permanent"}) in climate.calls
    await hass.async_block_till_done()  # let the start-up apply finish first
    engine.store.programs.clear()
    await engine.async_config_changed()
    await hass.async_block_till_done()
    assert climate.calls[-1] == ("set_preset_mode", {"preset_mode": "none"}), climate.calls


async def test_adaptive_lighting_manual_control(hass, hass_storage, freezer):  # S37 / S41
    al_calls: list[dict] = []
    hass.services.async_register("adaptive_lighting", "set_manual_control",
                                 lambda call: al_calls.append(dict(call.data)))
    hass.states.async_set("switch.adaptive_lighting_salon", "on", {"configuration": {"lights": ["light.vitrine"]}})
    hass.states.async_set("light.vitrine", "on", {"brightness": 255})

    async def turn_on(call: ServiceCall) -> None:
        hass.states.async_set("light.vitrine", "on",
                              {"brightness": round(call.data.get("brightness_pct", 100) * 255 / 100)},
                              context=call.context)

    hass.services.async_register("light", "turn_on", turn_on)
    hass.services.async_register("light", "turn_off", lambda call: None)
    ents = [{"entity_id": "light.vitrine", "default": {"kind": "none"}}]
    slots = [slot("s", "20:00", "23:00", by_entity={"light.vitrine": {"kind": "on", "brightness": 40}})]
    engine = await setup(hass, hass_storage, freezer, [program(slots=slots, entities=ents)], local(26, 19, 0))
    await go_to(hass, freezer, local(26, 20, 0))
    assert al_calls[-1]["manual_control"] is True
    # Adaptive Lighting adjusts the light with its own context: not an override
    hass.states.async_set("light.vitrine", "on", {"brightness": 200},
                          context=Context(id="01JABCDEFG:al:abc:ntrvl:00001"))
    await hass.async_block_till_done()
    assert "override" not in engine.rt("light.vitrine")
    # the zone switch toggles: manual control is said again
    count = len(al_calls)
    hass.states.async_set("switch.adaptive_lighting_salon", "off", {"configuration": {"lights": ["light.vitrine"]}})
    await hass.async_block_till_done()
    assert len(al_calls) > count
