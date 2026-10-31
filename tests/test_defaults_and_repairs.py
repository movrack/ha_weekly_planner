"""reapply_default option, single default priority, and refreshed missing-entities repair."""

from __future__ import annotations

from copy import deepcopy

import pytest

from homeassistant.helpers import entity_registry as er, issue_registry as ir

from custom_components.weekly_planner.const import DEFAULT_PRIORITY, DOMAIN
from custom_components.weekly_planner.validation import PROGRAM, check_program

from .helpers import CLIMATE, Recorder, labels, local, program, setup, slot

ISSUE = "missing_entities"


def _issue(hass):
    return ir.async_get(hass).async_get_issue(DOMAIN, ISSUE)


def _lbl():
    return {label["id"]: label for label in labels()}


# -- reapply_default --------------------------------------------------------------


def test_check_program_uses_option_when_reapply_missing():
    prog = program()
    prog.pop("reapply")
    assert check_program(deepcopy(prog), _lbl(), reapply_default=False)["reapply"] is False
    assert check_program(deepcopy(prog), _lbl(), reapply_default=True)["reapply"] is True
    assert check_program(deepcopy(prog), _lbl())["reapply"] is True  # option default


def test_explicit_reapply_wins_over_option():
    assert check_program(program(reapply=True), _lbl(), reapply_default=False)["reapply"] is True
    assert check_program(program(reapply=False), _lbl(), reapply_default=True)["reapply"] is False


@pytest.mark.parametrize("option", [True, False])
async def test_get_and_save_follow_reapply_option(hass, hass_storage, freezer, hass_ws_client, option):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [], None, reapply_default=option)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    data = (await ws.receive_json())["result"]
    assert data["defaults"] == {"reapply": option, "priority": DEFAULT_PRIORITY}
    new = program()
    new.pop("id"); new.pop("reapply"); new.pop("priority"); new.pop("revision")
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": new})
    saved = (await ws.receive_json())["result"]["program"]
    assert saved["reapply"] is option and saved["priority"] == DEFAULT_PRIORITY


async def test_subscribe_snapshot_carries_defaults(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [], None, reapply_default=False)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/subscribe"})
    await ws.receive_json()
    event = (await ws.receive_json())["event"]
    assert event["defaults"] == {"reapply": False, "priority": 10}


async def test_existing_program_keeps_stored_reapply(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [program(reapply=True)], None, reapply_default=False)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    prog = (await ws.receive_json())["result"]["programs"][0]
    assert prog["reapply"] is True
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": prog})
    assert (await ws.receive_json())["result"]["program"]["reapply"] is True


# -- default priority -------------------------------------------------------------


def test_one_default_priority():
    assert DEFAULT_PRIORITY == 10
    prog = program()
    prog.pop("priority")
    assert PROGRAM(prog)["priority"] == DEFAULT_PRIORITY


async def test_engine_missing_priority_sorts_as_default(hass, hass_storage, freezer):
    Recorder(hass)
    stored = program("stored", [slot("s", "08:00", "20:00", "t19")], priority=DEFAULT_PRIORITY + 1)
    missing = program("missing", [slot("m", "08:00", "20:00", "t25")])
    missing.pop("priority")
    engine = await setup(hass, hass_storage, freezer, [stored, missing], local(26, 9, 0))
    assert engine._priority("missing") == DEFAULT_PRIORITY  # noqa: SLF001
    assert engine.segment(CLIMATE).program_id == "missing"  # 10 beats 11 (it used to lose against it at 100)
    assert engine.store.program("stored")["priority"] == DEFAULT_PRIORITY + 1  # stored values untouched


# -- missing-entities repair -------------------------------------------------------


async def test_repair_refreshed_on_save_without_registry_event(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], None)
    assert _issue(hass) is None  # the recorder created the state
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    prog = (await ws.receive_json())["result"]["programs"][0]
    prog["entities"].append({"entity_id": "light.ghost", "default_label": None, "label_overrides": {}})
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": prog})
    saved = (await ws.receive_json())["result"]["program"]
    assert _issue(hass) is not None and "light.ghost" in _issue(hass).translation_placeholders["details"]
    # editing the entities again to drop it clears the issue
    saved["entities"] = saved["entities"][:1]
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": saved})
    assert (await ws.receive_json())["success"]
    assert _issue(hass) is None
    assert engine.store.programs


async def test_repair_refreshed_when_program_deleted(hass, hass_storage, freezer, hass_ws_client):
    ghost = program("ghost", entities=[{"entity_id": "light.ghost", "default_label": None, "label_overrides": {}}])
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [program(), ghost], None)
    assert _issue(hass) is not None
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/delete", "program_id": "ghost"})
    assert (await ws.receive_json())["success"]
    assert _issue(hass) is None


async def test_repair_cleared_when_entity_is_created(hass, hass_storage, freezer):
    Recorder(hass)
    ghost = program("ghost", entities=[{"entity_id": "light.ghost", "default_label": None, "label_overrides": {}}])
    await setup(hass, hass_storage, freezer, [ghost], local(26, 7, 0))
    assert _issue(hass) is not None
    er.async_get(hass).async_get_or_create("light", "test", "ghost", suggested_object_id="ghost")
    await hass.async_block_till_done()
    assert _issue(hass) is None


async def test_repair_recomputed_on_reload_service(hass, hass_storage, freezer):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 7, 0))
    assert _issue(hass) is None
    hass.states.async_remove(CLIMATE)  # a state-only entity vanishes: no registry event
    assert _issue(hass) is None
    await hass.services.async_call(DOMAIN, "reload", blocking=True)
    await hass.async_block_till_done()
    assert hass.config_entries.async_get_entry(engine.entry_id) is not None
    assert _issue(hass) is not None
