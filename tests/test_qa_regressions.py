"""Regression coverage for QA findings at scheduling and API boundaries."""

import asyncio
from copy import deepcopy
from dataclasses import replace
from unittest.mock import Mock

from homeassistant.util import dt as dt_util

from custom_components.weekly_planner import websocket
from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.registry import rename_entity

from .helpers import CLIMATE, Recorder, local, program, setup, slot


def test_rename_explicit_references_preserves_literal_data():
    action = {"kind": "service", "service": "switch.turn_on", "target_entity_id": "sensor.old",
              "data_sources": {"value": {"entity_id": "sensor.old", "type": "native"}},
              "data": {"literal": {"entity_id": "sensor.old"}}}
    prog = program()
    prog["mode_source"] = {"entity_id": "sensor.old", "mappings": {}}
    prog["entities"][0]["label_overrides"] = {"t21": deepcopy(action)}
    config = {"programs": [prog], "labels": [{"id": "x", "action": action}]}
    assert rename_entity(config, "sensor.old", "sensor.new")
    assert prog["revision"] == 2
    assert prog["mode_source"]["entity_id"] == "sensor.new"
    for updated in (action, prog["entities"][0]["label_overrides"]["t21"]):
        assert updated["target_entity_id"] == "sensor.new"
        assert updated["data_sources"]["value"]["entity_id"] == "sensor.new"
        assert updated["data"]["literal"]["entity_id"] == "sensor.old"
    assert not rename_entity(config, "sensor.old", "sensor.new")
    assert prog["revision"] == 2


async def test_concurrent_save_rechecks_revision_after_metadata_await(
    hass, hass_storage, freezer, hass_ws_client, monkeypatch
):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], None)
    original = websocket._descriptions
    both_entered = asyncio.Event()
    release = asyncio.Event()
    count = 0

    async def delayed_descriptions(hass):
        nonlocal count
        result = await original(hass)
        count += 1
        if count == 2:
            both_entered.set()
        await release.wait()
        return result

    monkeypatch.setattr(websocket, "_descriptions", delayed_descriptions)
    clients = [await hass_ws_client(hass), await hass_ws_client(hass)]
    for index, client in enumerate(clients):
        edited = deepcopy(engine.store.programs[0])
        edited["name"] = f"Editor {index}"
        await client.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": edited})
    try:
        await asyncio.wait_for(both_entered.wait(), 5)
    finally:
        release.set()
    results = await asyncio.gather(*(client.receive_json() for client in clients))
    assert sum(result["success"] for result in results) == 1
    assert [result["error"]["code"] for result in results if not result["success"]] == ["conflict"]
    assert engine.store.programs[0]["revision"] == 2


async def test_ordinary_attribute_update_does_not_rearm(hass, hass_storage, freezer, monkeypatch):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 9))
    arm = Mock(wraps=engine._arm_timer)
    monkeypatch.setattr(engine, "_arm_timer", arm)
    hass.states.async_set(CLIMATE, "heat", {"temperature": 10, "current_temperature": 18})
    await hass.async_block_till_done()
    arm.assert_not_called()


async def test_condition_pending_deadline_still_rearms(hass, hass_storage, freezer, monkeypatch):
    Recorder(hass)
    hass.states.async_set("binary_sensor.window", "off")
    condition = {"entity_id": "binary_sensor.window", "op": "eq", "value": "off"}
    engine = await setup(hass, hass_storage, freezer, [program(conditions=[condition])], local(26, 9))
    arm = Mock(wraps=engine._arm_timer)
    monkeypatch.setattr(engine, "_arm_timer", arm)
    hass.states.async_set("binary_sensor.window", "on")
    await hass.async_block_till_done()
    assert arm.call_count == 1
    assert engine.conditions.next_settle() is not None
    hass.states.async_set("binary_sensor.window", "off")
    await hass.async_block_till_done()
    assert arm.call_count == 2
    assert engine.conditions.next_settle() is None


async def test_publication_shares_computation_but_not_permissions(
    hass, hass_storage, freezer, monkeypatch
):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 9))
    build = Mock(wraps=websocket._build_snapshot)
    monkeypatch.setattr(websocket, "_build_snapshot", build)
    seen = []

    def first():
        snapshot = websocket._snapshot(engine)
        snapshot["can_edit"] = False

    engine.add_listener(first)
    engine.add_listener(lambda: seen.append(websocket._snapshot(engine)["can_edit"]))
    engine._notify_listeners()
    assert build.call_count == 1 and seen == [True]
    engine._notify_listeners()
    assert build.call_count == 2
    websocket._snapshot(engine)
    assert build.call_count == 3


async def test_websocket_accepts_typed_minutes(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], None)
    client = await hass_ws_client(hass)
    edited = deepcopy(engine.store.programs[0])
    edited["profiles"][0]["days"][0] = [slot("minute", "08:17", "08:23")]
    await client.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": edited})
    result = await client.receive_json()
    assert result["success"]
    assert result["result"]["program"]["profiles"][0]["days"][0][0]["start"] == {"time": "08:17"}


async def test_segment_without_action_cancels_in_flight_task(hass, hass_storage, freezer):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 9))
    started = asyncio.Event()

    async def waiting():
        started.set()
        await asyncio.Event().wait()

    task = asyncio.create_task(waiting())
    engine._tasks[CLIMATE] = task
    await started.wait()
    current = engine.segment(CLIMATE)
    no_action = replace(current, key=("default", "office"), slot_id=None, action=None)
    engine._enter_segment(CLIMATE, no_action, list(no_action.key), dt_util.utcnow())
    await asyncio.gather(task, return_exceptions=True)
    assert task.cancelled()
    assert CLIMATE not in engine._tasks


async def test_obsolete_service_completion_does_not_clear_new_pending_state(
    hass, hass_storage, freezer, monkeypatch
):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 9))
    started = asyncio.Event()
    cancelled = asyncio.Event()
    release = asyncio.Event()

    async def cancellation_resistant_call(self, *args, **kwargs):
        started.set()
        try:
            await release.wait()
        except asyncio.CancelledError:
            cancelled.set()
            await release.wait()

    monkeypatch.setattr(type(hass.services), "async_call", cancellation_resistant_call)
    await engine.async_apply(CLIMATE, "test")
    await started.wait()
    task = engine._tasks[CLIMATE]
    old_segment = engine.segment(CLIMATE)
    new_segment = replace(old_segment, key=("default", "office"), action=None, slot_id=None)
    engine._enter_segment(CLIMATE, new_segment, list(new_segment.key), dt_util.utcnow())
    engine.rt(CLIMATE)["pending"] = True
    sent_before = sum(bool(entry.get("sent")) for entry in engine.store.journal)
    await cancelled.wait()
    release.set()
    await task
    assert engine.rt(CLIMATE)["pending"] is True
    assert sum(bool(entry.get("sent")) for entry in engine.store.journal) == sent_before
