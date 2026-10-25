"""Remaining scenarios: restart with override, missed end, mode edit, migration, stale action,
journal, card resource, effective target."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.core import HomeAssistant, ServiceCall

from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.store import PlannerStore

from .test_engine import CLIMATE, FakeClimate, go_to, local, program, setup, slot, tick


async def _restart(hass: HomeAssistant, freezer, engine) -> object:
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    await engine.store._runtime.async_save(engine.store.runtime)  # noqa: SLF001 - flush before reload
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=31))
    return entry.runtime_data


async def test_override_survives_restart(hass, hass_storage, freezer):  # S6
    climate = FakeClimate(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 8, 30))
    await tick(hass, freezer, timedelta(minutes=5))
    climate.manual("boost")
    await hass.async_block_till_done()
    await _restart(hass, freezer, engine)
    assert climate.preset == "boost"  # reapply=True but the override wins


async def test_missed_end_is_caught_up(hass, hass_storage, freezer):  # S8
    climate = FakeClimate(hass)
    engine = await setup(hass, hass_storage, freezer, [program(reapply=False)], local(26, 11, 0))
    await tick(hass, freezer, timedelta(minutes=1))
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    await engine.store._runtime.async_save(engine.store.runtime)  # noqa: SLF001
    engine.store.runtime["entities"][CLIMATE]["segment"] = ["slot", "office", "s1", "x"]
    await engine.store._runtime.async_save(engine.store.runtime)  # noqa: SLF001
    await hass.config_entries.async_unload(entry.entry_id)
    climate.hass.states.async_set(CLIMATE, "heat", {**climate.hass.states.get(CLIMATE).attributes,
                                                    "preset_mode": "comfort"})
    freezer.move_to(local(26, 13, 0))
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=31))
    assert climate.preset == "eco"  # end applied although reapply is off


async def test_mode_edit_applies_everywhere(hass, hass_storage, freezer, hass_ws_client):  # S17
    climate = FakeClimate(hass)
    allday = program(slots=[slot("d", "00:00", "24:00", "climate_comfort")])
    engine = await setup(hass, hass_storage, freezer, [allday], None)
    ws = await hass_ws_client(hass)
    mode = dict(engine.store.modes["climate_comfort"])
    mode["value"] = {"kind": "preset", "preset": "boost"}
    await ws.send_json_auto_id({"type": f"{DOMAIN}/mode/save", "mode": mode})
    res = await ws.receive_json()
    assert res["success"], res
    await hass.async_block_till_done()
    assert climate.preset == "boost"


async def test_storage_backup_and_versions(hass, hass_storage, freezer):  # S20
    FakeClimate(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 7, 0))
    assert hass_storage[DOMAIN]["version"] == 1
    store = PlannerStore(hass)
    await store.async_load()
    assert store.programs[0]["id"] == "office"
    assert all("exceptions" in m for m in store.config["modes"])  # normalized on load
    assert engine.store.read_only is False


async def test_stale_action_dropped(hass, hass_storage, freezer):  # S21
    climate = FakeClimate(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 9, 0))
    calls = len(climate.calls)
    # an action created for a segment that is no longer current must not be sent
    await engine._async_send_calls(  # noqa: SLF001
        CLIMATE, {"kind": "preset", "preset": "boost"}, "test", ["slot", "office", "s1", "stale"])
    assert len(climate.calls) == calls and climate.preset == "comfort"


async def test_journal_records_segments(hass, hass_storage, freezer, hass_ws_client):  # S31
    FakeClimate(hass)
    await setup(hass, hass_storage, freezer, [program(slots=[slot("d", "00:00", "24:00", "climate_comfort")])], None)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/journal", "entity_id": CLIMATE})
    segments = (await ws.receive_json())["result"]["segments"]
    assert segments and segments[-1]["segment"][0] == "slot" and segments[-1]["setpoint"]["preset"] == "comfort"


async def test_effective_target_no_retry_during_override(hass, hass_storage, freezer):  # S40
    climate = FakeClimate(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 8, 30))
    await engine.async_override(CLIMATE, {"kind": "preset", "preset": "boost"}, None)
    await hass.async_block_till_done()
    calls = len(climate.calls)
    await tick(hass, freezer, timedelta(minutes=10))
    assert len(climate.calls) == calls  # boost is the effective target: no retry towards comfort
    assert climate.preset == "boost"


async def test_refused_setpoint_not_retried(hass, hass_storage, freezer):
    from homeassistant.exceptions import ServiceValidationError

    calls = []

    async def refuse(call):
        calls.append(call)
        raise ServiceValidationError("Preset mode comfort is not valid")

    FakeClimate(hass)
    hass.services.async_register("climate", "set_preset_mode", refuse)
    await setup(hass, hass_storage, freezer, [program()], local(26, 9, 0))
    count = len(calls)
    assert count >= 1
    await tick(hass, freezer, timedelta(minutes=20))
    assert len(calls) == count  # no retry loop
