"""More engine scenarios: profiles, skip, conditions, retries, registry, storage, journal."""

from __future__ import annotations

from datetime import timedelta

from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import entity_registry as er, issue_registry as ir

from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.store import PlannerStore

from .helpers import CLIMATE, Recorder, go_to, local, program, setup, slot, temp, tick

VACUUM = "vacuum.rocky"


async def test_profile_change_mid_slot(hass, hass_storage, freezer):  # S36
    rec = Recorder(hass)
    prog = program()
    prog["profiles"].append({"id": "summer", "name": "Été",
                             "days": [[slot("x", "08:00", "12:00", "t25")] for _ in range(7)]})
    engine = await setup(hass, hass_storage, freezer, [prog], local(26, 9, 0))
    await engine.async_set_profile("office", "summer")
    await hass.async_block_till_done()
    assert rec.calls[-1][1] == {"temperature": 25}


async def test_skip_next_and_apply_now(hass, hass_storage, freezer):  # S42
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 7, 0))
    count = len(rec.calls)
    engine.skip_next("office")
    await go_to(hass, freezer, local(26, 8, 0))
    assert len(rec.calls) == count  # start skipped
    await engine.async_apply_now("office")
    await hass.async_block_till_done()
    assert rec.calls[-1][1] == {"temperature": 21}


async def test_missed_end_is_caught_up(hass, hass_storage, freezer):  # S8
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program(reapply=False)], local(26, 9, 0))
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    engine.store.runtime["entities"][CLIMATE]["segment"] = ["slot", "office", "s1", "x"]
    await engine.store._runtime.async_save(engine.store.runtime)  # noqa: SLF001
    await hass.config_entries.async_unload(entry.entry_id)
    freezer.move_to(local(26, 13, 0))
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=31))
    assert rec.calls[-1][1] == {"temperature": 15}  # the end runs although reapply is off


async def test_stale_action_dropped(hass, hass_storage, freezer):  # S21
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 9, 0))
    count = len(rec.calls)
    await engine._async_send_call(  # noqa: SLF001
        CLIMATE, temp(30), "test", ["slot", "office", "s1", "stale"], False)
    assert len(rec.calls) == count


async def test_condition_debounce(hass, hass_storage, freezer):  # S30
    rec = Recorder(hass)
    hass.states.async_set("input_boolean.home", "on")
    cond = [{"entity_id": "input_boolean.home", "op": "eq", "value": "on"}]
    await setup(hass, hass_storage, freezer, [program(conditions=cond)], local(26, 9, 0), debounce_min=2)
    assert rec.calls[-1][1] == {"temperature": 21}
    hass.states.async_set("input_boolean.home", "off")
    await tick(hass, freezer, timedelta(minutes=1))
    hass.states.async_set("input_boolean.home", "on")
    await tick(hass, freezer, timedelta(minutes=3))
    assert rec.calls[-1][1] == {"temperature": 21}  # bounce ignored
    hass.states.async_set("input_boolean.home", "off")
    await tick(hass, freezer, timedelta(minutes=3))
    assert rec.calls[-1][1] == {"temperature": 15}


async def test_rename_entity_follows(hass, hass_storage, freezer):  # S32
    registry = er.async_get(hass)
    registry.async_get_or_create("climate", "test", "office", suggested_object_id="office")
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 7, 0))
    registry.async_update_entity(CLIMATE, new_entity_id="climate.bureau")
    await hass.async_block_till_done()
    assert engine.store.programs[0]["entities"][0]["entity_id"] == "climate.bureau"


async def test_removed_entity_raises_repair(hass, hass_storage, freezer):
    await setup(hass, hass_storage, freezer, [program()], local(26, 7, 0))
    assert ir.async_get(hass).async_get_issue(DOMAIN, "missing_entities") is not None


async def test_corrupt_storage_is_read_only(hass, hass_storage):  # S28
    hass_storage[DOMAIN] = {"version": 99, "minor_version": 1, "key": DOMAIN, "data": {}}
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert not await hass.config_entries.async_setup(entry.entry_id)
    assert hass_storage[DOMAIN]["version"] == 99  # untouched


async def test_service_error_is_retried_then_notified(hass, hass_storage, freezer):
    prog = program(slots=[slot("clean", "23:00", None, "start")],
                   entities=[{"entity_id": VACUUM, "default_label": None, "label_overrides": {}}])
    hass.states.async_set(VACUUM, "docked")
    calls: list = []

    async def failing(call):
        calls.append(call)
        raise HomeAssistantError("offline")

    hass.services.async_register("vacuum", "start", failing)
    await setup(hass, hass_storage, freezer, [prog], local(26, 22, 0))
    await go_to(hass, freezer, local(26, 23, 0))
    assert len(calls) == 1
    for minutes, expected in ((1, 2), (2, 3), (5, 4), (10, 5), (15, 6)):
        await tick(hass, freezer, timedelta(minutes=minutes, seconds=5))
        assert len(calls) == expected
    await tick(hass, freezer, timedelta(minutes=30))
    assert len(calls) == 6  # given up after the last step
    from homeassistant.components import persistent_notification

    notifications = persistent_notification._async_get_or_create_notifications(hass)  # noqa: SLF001
    assert f"{DOMAIN}_{VACUUM}_failed" in notifications


async def test_validation_error_is_not_retried(hass, hass_storage, freezer):
    calls: list = []

    async def refuse(call):
        calls.append(call)
        raise ServiceValidationError("not valid")

    hass.services.async_register("climate", "set_temperature", refuse)
    hass.states.async_set(CLIMATE, "heat", {})
    await setup(hass, hass_storage, freezer, [program()], local(26, 9, 0))
    count = len(calls)
    assert count >= 1
    await tick(hass, freezer, timedelta(minutes=30))
    assert len(calls) == count


async def test_journal_records_decisions_and_sent_actions(hass, hass_storage, freezer, hass_ws_client):  # S31
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [program(slots=[slot("d", "00:00", "24:00", "t21")])], None)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/journal", "entity_id": CLIMATE})
    entries = (await ws.receive_json())["result"]["segments"]
    assert any(e.get("segment") and e["action"]["data"] == {"temperature": 21} for e in entries)
    assert any(e.get("sent") and e["action"]["data"] == {"temperature": 21} for e in entries)


async def test_storage_version_two(hass, hass_storage, freezer):  # S20
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 7, 0))
    assert hass_storage[DOMAIN]["version"] == 2
    store = PlannerStore(hass)
    await store.async_load()
    assert store.programs[0]["id"] == "office" and "modes" not in store.config and store.config["labels"]
    assert engine.store.read_only is False
