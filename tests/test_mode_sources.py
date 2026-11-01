"""Generic external modes and manual mode selection."""
from copy import deepcopy

import pytest
from homeassistant.exceptions import ServiceValidationError
from custom_components.weekly_planner.validation import check_program, ProgramError
from .helpers import Recorder, local, program, setup, slot, labels


def sourced():
    p = program()
    p['profiles'].append({'id': 'away', 'name': 'Vacation', 'days': [[slot('away', '08:00', '12:00', 't19')] for _ in range(7)]})
    p['mode_source'] = {'entity_id': 'sensor.house_mode', 'mappings': {'absent': 'away', 'present': 'base'}}
    return p


async def test_source_startup_changes_fallback_and_manual(hass, hass_storage, freezer):
    rec = Recorder(hass)
    hass.states.async_set('sensor.house_mode', 'absent')
    engine = await setup(hass, hass_storage, freezer, [sourced()], local(26, 9))
    assert engine.active_profile_id('office') == 'away'
    assert rec.calls[-1][1] == {'temperature': 19}
    for state, status in [('other', 'unmapped'), ('unknown', 'unavailable'), ('unavailable', 'unavailable')]:
        rec.calls.clear()
        hass.states.async_set('sensor.house_mode', state)
        await hass.async_block_till_done()
        assert engine.active_profile_id('office') == 'away'
        assert engine.program_status('office')['mode_source_status'] == status
        assert not rec.calls
    with pytest.raises(ServiceValidationError):
        await engine.async_set_profile('office', 'base')
    hass.states.async_set('sensor.house_mode', 'present')
    await hass.async_block_till_done()
    assert engine.active_profile_id('office') == 'base'
    assert rec.calls[-1][1] == {'temperature': 21}
    engine.store.programs[0].pop('mode_source')
    await engine.async_config_changed()
    await engine.async_set_profile('office', 'away')
    assert engine.active_profile_id('office') == 'away'
    with pytest.raises(ServiceValidationError):
        await engine.async_set_profile('office', 'missing')


def test_source_validates_references_and_preserves_raw_states():
    p = sourced()
    checked = check_program(p, {l['id']: l for l in labels()})
    assert checked['mode_source'] == p['mode_source']
    p = deepcopy(p)
    p['profiles'].pop()
    with pytest.raises(ProgramError, match='unknown_mode_profile'):
        check_program(p, {l['id']: l for l in labels()})


async def test_manual_profile_websocket(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    p = sourced()
    p.pop('mode_source')
    engine = await setup(hass, hass_storage, freezer, [p], None)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({'type': 'weekly_planner/program/set_profile', 'program_id': 'office', 'profile_id': 'away'})
    assert (await ws.receive_json())['success']
    assert engine.active_profile_id('office') == 'away'
    engine.store.programs[0]['mode_source'] = sourced()['mode_source']
    await ws.send_json_auto_id({'type': 'weekly_planner/program/set_profile', 'program_id': 'office', 'profile_id': 'base'})
    assert not (await ws.receive_json())['success']


async def test_shared_source_switches_atomically_without_replays_or_unrelated_actions(hass, hass_storage, freezer):
    rec = Recorder(hass)
    for entity_id in ("climate.second", "climate.third"):
        hass.states.async_set(entity_id, "heat")
    first = sourced()
    first["profiles"][1]["days"] = [[slot("point", "09:05", None, "t25")] for _ in range(7)]
    second = deepcopy(first)
    second["id"] = "second"
    second["entities"][0]["entity_id"] = "climate.second"
    third = program("third", entities=[{"entity_id": "climate.third", "default_label": "t15", "label_overrides": {}}])
    hass.states.async_set("sensor.house_mode", "present")
    engine = await setup(hass, hass_storage, freezer, [first, second, third], local(26, 9))
    rec.calls.clear()
    observed = []
    engine.add_listener(lambda: observed.append([engine.active_profile_id("office"), engine.active_profile_id("second")]))
    # Move the clock without firing the timer: switching must not replay 09:05 in the new modes.
    freezer.move_to(local(26, 9, 6))
    hass.states.async_set("sensor.house_mode", "absent")
    await hass.async_block_till_done()
    assert rec.calls == [("climate.set_temperature", {"temperature": 15})] * 2
    assert observed and all(pair == ["away", "away"] for pair in observed)


async def test_inactive_schedule_save_does_not_reapply_active_actions(hass, hass_storage, freezer, hass_ws_client):
    rec = Recorder(hass)
    p = sourced()
    p.pop("mode_source")
    engine = await setup(hass, hass_storage, freezer, [p], None)
    ws = await hass_ws_client(hass)
    freezer.move_to(local(26, 9))
    await engine.async_recompute("startup")
    await hass.async_block_till_done()
    rec.calls.clear()
    await ws.send_json_auto_id({"type": "weekly_planner/get"})
    draft = (await ws.receive_json())["result"]["programs"][0]
    draft["profiles"][1]["days"][0][0]["label"] = "t25"
    await ws.send_json_auto_id({"type": "weekly_planner/program/save", "program": draft})
    result = await ws.receive_json()
    assert result["success"]
    await hass.async_block_till_done()
    assert not rec.calls
    draft = result["result"]["program"]
    draft["profiles"][0]["days"][0][0]["label"] = "t19"
    await ws.send_json_auto_id({"type": "weekly_planner/program/save", "program": draft})
    assert (await ws.receive_json())["success"]
    await hass.async_block_till_done()
    assert rec.calls == [("climate.set_temperature", {"temperature": 19})]


async def test_manual_selection_before_ready_notifies_without_actions(hass, hass_storage, freezer):
    rec = Recorder(hass)
    p = sourced()
    p.pop("mode_source")
    engine = await setup(hass, hass_storage, freezer, [p], local(26, 9))
    engine._ready = False
    updates = []
    engine.add_listener(lambda: updates.append(engine.active_profile_id("office")))
    rec.calls.clear()
    await engine.async_set_profile("office", "away")
    assert updates == ["away"]
    assert engine.store.runtime["programs"]["office"]["active_profile"] == "away"
    assert not rec.calls


async def test_source_rejects_own_selector_and_survives_restart_unavailable(hass, hass_storage, freezer):
    from datetime import timedelta
    from homeassistant.helpers import entity_registry as er
    from custom_components.weekly_planner.const import DOMAIN
    from .helpers import tick

    Recorder(hass)
    hass.states.async_set("sensor.house_mode", "absent")
    engine = await setup(hass, hass_storage, freezer, [sourced()], local(26, 9))
    own_select = er.async_get(hass).async_get_entity_id("select", DOMAIN, f"{engine.entry_id}_profile_office")
    invalid = sourced()
    invalid["mode_source"]["entity_id"] = own_select
    with pytest.raises(ProgramError, match="circular_mode_source"):
        check_program(invalid, engine.labels, hass, engine.descriptions)
    await tick(hass, freezer, timedelta(seconds=6))
    hass.states.async_set("sensor.house_mode", "unavailable")
    await hass.async_block_till_done()
    assert await hass.config_entries.async_reload(engine.entry_id)
    await tick(hass, freezer, timedelta(seconds=31))
    restarted = hass.config_entries.async_get_entry(engine.entry_id).runtime_data
    assert restarted.active_profile_id("office") == "away"
    assert restarted.program_status("office")["mode_source_status"] == "unavailable"
