"""Global mode chosen by an external selector (docs/adr/0001): engine, websocket, entities."""

from __future__ import annotations

import logging
from datetime import timedelta

from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weekly_planner.const import DOMAIN

from .helpers import CLIMATE, Recorder, local, program, setup, slot, tick

SELECTOR = "input_select.house"
OPTIONS = ["Home", "Away", "Night"]
SECOND = "climate.second"
CONFIG = {"mode_selector": SELECTOR, "default_mode": "Home"}


def moded(pid: str = "office", entity: str = CLIMATE, *, away: list | None = None) -> dict:
    """A program with two modes: Home (21 degrees 08:00-12:00) and Away (19 degrees, or ``away`` slots)."""
    prog = program(pid, entities=[{"entity_id": entity, "default_label": "t15", "label_overrides": {}}])
    prog["profiles"][0]["name"] = "Home"
    slots = away if away is not None else [slot("a", "08:00", "12:00", "t19")]
    prog["profiles"].append({"id": "away", "name": "Away", "days": [list(slots) for _ in range(7)]})
    return prog


def choose(hass, state: str, options: list[str] | None = OPTIONS) -> None:
    hass.states.async_set(SELECTOR, state, {"options": options} if options is not None else {})


async def started(hass, hass_storage, freezer, hass_ws_client, programs, moment=None, rec=None, **kwargs):
    """Engine plus websocket client. The client needs a token issued before the frozen clock moves."""
    engine = await setup(hass, hass_storage, freezer, programs, None, **kwargs)
    ws = await hass_ws_client(hass)
    if moment is not None:
        if rec is not None:
            rec.calls.clear()  # what the first start did at the real clock is not under test
        freezer.move_to(moment)
        await engine.async_recompute("startup")
        await hass.async_block_till_done()
    return engine, ws


async def snapshot(ws) -> dict:
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    return (await ws.receive_json())["result"]


def temperatures(rec: Recorder) -> list:
    return [data["temperature"] for name, data in rec.calls if name == "climate.set_temperature"]


# -- engine -----------------------------------------------------------------------------------


async def test_without_selector_each_program_uses_its_default_profile(hass, hass_storage, freezer, hass_ws_client):
    rec = Recorder(hass)
    engine, ws = await started(hass, hass_storage, freezer, hass_ws_client, [moded()], local(26, 9), rec=rec)
    assert temperatures(rec) == [21]  # the first profile, whatever the name
    assert engine.active_mode is None and engine.mode_options() == []
    data = await snapshot(ws)
    assert data["mode"] == {"selector": None, "default": None, "active": None, "options": [], "available": False,
                            "orphans": [], "proposals": [], "renamed": [], "follow_lost": []}
    status = data["status"]["office"]
    assert status["no_schedule_for_mode"] is False
    assert "active_profile" not in status and "mode_source_status" not in status
    switch = hass.states.get("switch.weekly_planner_office")
    assert "active_profile" not in switch.attributes and switch.attributes["no_schedule_for_mode"] is False


async def test_selector_state_switches_every_program_at_once(hass, hass_storage, freezer, hass_ws_client):
    rec = Recorder(hass)
    hass.states.async_set(SECOND, "heat", {"temperature": 10})
    choose(hass, "Home")
    engine, ws = await started(hass, hass_storage, freezer, hass_ws_client,
                               [moded(), moded("second", SECOND)], local(26, 9), rec=rec, config=CONFIG)
    assert engine.active_mode == "Home" and temperatures(rec) == [21, 21]
    rec.calls.clear()
    choose(hass, "Away")
    await hass.async_block_till_done()
    assert temperatures(rec) == [19, 19]
    assert engine.active_mode == "Away"
    assert engine.active_profile_id("office") == engine.active_profile_id("second") == "away"
    data = await snapshot(ws)
    assert data["mode"] == {"selector": SELECTOR, "default": "Home", "active": "Away",
                            "options": OPTIONS, "available": True,
                            "orphans": [], "proposals": [], "renamed": [], "follow_lost": []}
    assert engine.store.runtime["last_mode"] == "Away"


async def test_mode_change_does_not_replay_past_one_shots(hass, hass_storage, freezer):
    rec = Recorder(hass)
    choose(hass, "Home")
    prog = moded(away=[slot("a", "08:00", "12:00", "t19"), slot("point", "09:05", None, "t25")])
    engine = await setup(hass, hass_storage, freezer, [prog], local(26, 9), config=CONFIG)
    rec.calls.clear()
    freezer.move_to(local(26, 9, 6))  # the timer does not fire: 09:05 is already in the past
    choose(hass, "Away")
    await hass.async_block_till_done()
    assert temperatures(rec) == [19] and engine.active_mode == "Away"


async def test_unavailable_selector_keeps_the_last_mode_and_logs_once(hass, hass_storage, freezer, caplog):
    rec = Recorder(hass)
    choose(hass, "Away")
    engine = await setup(hass, hass_storage, freezer, [moded()], local(26, 9), config=CONFIG)
    assert temperatures(rec) == [19]
    rec.calls.clear()
    with caplog.at_level(logging.INFO, logger="custom_components.weekly_planner.engine"):
        for state in ("unavailable", "unknown", "unavailable"):
            choose(hass, state)
            await hass.async_block_till_done()
            assert engine.active_mode == "Away" and engine.active_profile_id("office") == "away"
            assert engine.mode_available is False
        assert not rec.calls
        assert len([r for r in caplog.records if "no usable state" in r.getMessage()]) == 1
        choose(hass, "Home")
        choose(hass, "Away")
        await hass.async_block_till_done()
        assert len([r for r in caplog.records if "is back" in r.getMessage()]) == 1
    assert engine.mode_available is True


async def test_unmapped_state_keeps_the_last_mode(hass, hass_storage, freezer):
    rec = Recorder(hass)
    choose(hass, "Away")
    engine = await setup(hass, hass_storage, freezer, [moded()], local(26, 9), rec=rec, config=CONFIG)
    rec.calls.clear()
    choose(hass, "Weird")  # not one of the selector options
    await hass.async_block_till_done()
    assert engine.active_mode == "Away" and not rec.calls and engine.mode_available is False


async def test_restart_with_unavailable_selector_uses_last_mode_then_default(hass, hass_storage, freezer):
    Recorder(hass)
    choose(hass, "Away")
    engine = await setup(hass, hass_storage, freezer, [moded()], local(26, 9), config=CONFIG)
    await tick(hass, freezer, timedelta(seconds=6))
    choose(hass, "unavailable")
    await hass.async_block_till_done()
    assert await hass.config_entries.async_reload(engine.entry_id)
    await tick(hass, freezer, timedelta(seconds=31))
    restarted = hass.config_entries.async_get_entry(engine.entry_id).runtime_data
    assert restarted.store.runtime["last_mode"] == "Away"
    assert restarted.active_mode == "Away" and restarted.active_profile_id("office") == "away"
    # no valid mode ever known: the default mode
    restarted.store.runtime.pop("last_mode")
    restarted.store.save_runtime()
    await tick(hass, freezer, timedelta(seconds=6))
    assert await hass.config_entries.async_reload(engine.entry_id)
    await tick(hass, freezer, timedelta(seconds=31))
    again = hass.config_entries.async_get_entry(engine.entry_id).runtime_data
    assert again.active_mode == "Home" and again.active_profile_id("office") == "base"


async def test_program_without_a_profile_for_the_mode_only_has_the_rest_of_the_time(hass, hass_storage, freezer, hass_ws_client):
    rec = Recorder(hass)
    hass.states.async_set(SECOND, "heat", {"temperature": 10})
    choose(hass, "Home")
    only_home = moded("second", SECOND)
    only_home["profiles"].pop()
    engine, ws = await started(hass, hass_storage, freezer, hass_ws_client, [moded(), only_home], local(26, 9),
                               rec=rec, config=CONFIG)
    assert temperatures(rec) == [21, 21]
    rec.calls.clear()
    choose(hass, "Away")
    await hass.async_block_till_done()
    assert sorted(temperatures(rec)) == [15, 19]  # second: its default label, office: the Away slot
    status = (await snapshot(ws))["status"]
    assert status["second"]["no_schedule_for_mode"] is True
    assert status["second"]["current_slots"] == {} and status["second"]["next_change"] is None
    assert status["office"]["no_schedule_for_mode"] is False
    assert engine.active_profile_id("second") is None
    choose(hass, "Night")  # nobody has a profile named Night
    await hass.async_block_till_done()
    status = (await snapshot(ws))["status"]
    assert status["second"]["no_schedule_for_mode"] is status["office"]["no_schedule_for_mode"] is True


async def test_global_suspension_wins_over_the_mode(hass, hass_storage, freezer):
    rec = Recorder(hass)
    choose(hass, "Home")
    engine = await setup(hass, hass_storage, freezer, [moded()], local(26, 9), config=CONFIG)
    await engine.async_set_vacation(True)
    await hass.async_block_till_done()
    rec.calls.clear()
    choose(hass, "Away")
    await hass.async_block_till_done()
    assert 19 not in temperatures(rec) and not engine.segment(CLIMATE).in_slot
    await engine.async_set_vacation(False)
    await hass.async_block_till_done()
    assert temperatures(rec)[-1] == 19  # back from the suspension: the schedule of the active mode


async def test_inactive_schedule_save_does_not_reapply_active_actions(hass, hass_storage, freezer, hass_ws_client):
    rec = Recorder(hass)
    choose(hass, "Home")
    _engine, ws = await started(hass, hass_storage, freezer, hass_ws_client, [moded()], local(26, 9), rec=rec, config=CONFIG)
    rec.calls.clear()
    draft = (await snapshot(ws))["programs"][0]
    draft["profiles"][1]["days"][0][0]["label"] = "t25"  # Away is not the active mode
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": draft})
    result = await ws.receive_json()
    assert result["success"]
    await hass.async_block_till_done()
    assert not rec.calls
    draft = result["result"]["program"]
    draft["profiles"][0]["days"][0][0]["label"] = "t19"  # Home is
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": draft})
    assert (await ws.receive_json())["success"]
    await hass.async_block_till_done()
    assert temperatures(rec) == [19]


# -- configuration command -------------------------------------------------------------------


async def test_set_mode_validates_and_renames_default_profiles(hass, hass_storage, freezer, hass_ws_client):
    rec = Recorder(hass)
    hass.states.async_set(SECOND, "heat", {"temperature": 10})
    choose(hass, "Home")
    base = program()  # one profile, "Base"
    named = moded("second", SECOND)  # already has "Home" and "Away"
    engine, ws = await started(hass, hass_storage, freezer, hass_ws_client, [base, named], local(26, 9))

    async def call(**fields):
        await ws.send_json_auto_id({"type": f"{DOMAIN}/mode/set", **fields})
        return await ws.receive_json()

    for fields, code in (({"mode_selector": "switch.x", "default_mode": None}, "invalid_mode_selector_domain"),
                         ({"mode_selector": SELECTOR, "default_mode": ""}, "invalid_default_mode"),
                         ({"mode_selector": SELECTOR, "default_mode": "x" * 41}, "invalid_default_mode"),
                         ({"mode_selector": SELECTOR, "default_mode": "Holidays"}, "unknown_default_mode")):
        reply = await call(**fields)
        assert not reply["success"] and reply["error"]["code"] == "invalid" and code in reply["error"]["message"]
    assert engine.store.config.get("mode_selector") is None
    rec.calls.clear()
    reply = await call(mode_selector=SELECTOR, default_mode="Home")
    assert reply["success"] and reply["result"]["renamed_programs"] == ["office"]
    assert engine.store.program("office")["profiles"][0]["name"] == "Home"  # the schedules moved under the default option
    assert engine.store.program("office")["profiles"][0]["id"] == "base"
    assert engine.store.program("second")["profiles"][0]["name"] == "Home"
    assert engine.store.config["default_mode"] == "Home" and engine.active_mode == "Home"
    data = await snapshot(ws)
    assert data["mode"]["selector"] == SELECTOR and data["mode"]["options"] == OPTIONS
    reply = await call(mode_selector=None, default_mode=None)  # back to one single mode
    assert reply["success"] and engine.active_mode is None and "last_mode" not in engine.store.runtime


async def test_set_mode_follows_the_program_edit_rights(hass, hass_storage, freezer, hass_ws_client, hass_read_only_access_token):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], None)
    engine.options = {**engine.options, "admin_only": True}  # only administrators edit: refused to a plain user
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/mode/set", "mode_selector": SELECTOR, "default_mode": "Home"})
    assert (await ws.receive_json())["error"]["code"] == "unauthorized"
    assert engine.store.config.get("mode_selector") is None


async def test_set_mode_refuses_the_planners_own_entities(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [program()], None)
    er.async_get(hass).async_get_or_create("select", DOMAIN, "own", suggested_object_id="own")
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/mode/set", "mode_selector": "select.own", "default_mode": None})
    reply = await ws.receive_json()
    assert not reply["success"] and "circular_mode_selector" in reply["error"]["message"]


async def test_new_program_starts_under_the_default_mode(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    choose(hass, "Home")
    engine = await setup(hass, hass_storage, freezer, [], None, config=CONFIG)
    ws = await hass_ws_client(hass)
    new = program()
    new.pop("id")
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": new})
    reply = await ws.receive_json()
    assert reply["success"] and reply["result"]["program"]["profiles"][0]["name"] == "Home"
    assert engine.store.programs[0]["profiles"][0]["name"] == "Home"


async def test_old_card_payloads_are_accepted_and_ignored(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    engine, ws = await started(hass, hass_storage, freezer, hass_ws_client, [program()])
    draft = (await snapshot(ws))["programs"][0]
    draft["active_profile"] = "base"
    draft["mode_source"] = {"entity_id": "input_select.x", "mappings": {"a": "base"}}
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": draft})
    reply = await ws.receive_json()
    assert reply["success"]
    stored = engine.store.programs[0]
    assert "active_profile" not in stored and "mode_source" not in stored
    # the old per-program commands are gone
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/set_profile", "program_id": "office", "profile_id": "base"})
    assert (await ws.receive_json())["error"]["code"] == "unknown_command"


async def test_selector_entity_rename_is_followed(hass, hass_storage, freezer):
    from custom_components.weekly_planner.registry import rename_entity

    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], None, config=CONFIG)
    assert rename_entity(engine.store.config, SELECTOR, "input_select.home_mode")
    assert engine.store.config["mode_selector"] == "input_select.home_mode"


# -- entities ---------------------------------------------------------------------------------


async def test_the_program_select_entities_are_gone(hass, hass_storage, freezer):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [moded()], None)
    assert not hass.states.async_entity_ids("select")
    registry = er.async_get(hass)
    assert not [e for e in registry.entities.values() if e.platform == DOMAIN and e.domain == "select"]
    assert hass.states.get("switch.weekly_planner_office") is not None


async def test_stale_select_registry_entries_are_removed_at_setup(hass, hass_storage, freezer):
    await hass.config.async_update(time_zone="Europe/Brussels")
    hass_storage[DOMAIN] = {"version": 3, "minor_version": 1, "key": DOMAIN,
                            "data": {"vacation": False, "labels": [], "programs": [program()]}}
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    registry = er.async_get(hass)
    stale = registry.async_get_or_create("select", DOMAIN, f"{entry.entry_id}_profile_office", config_entry=entry,
                                         suggested_object_id="office_mode")
    other = registry.async_get_or_create("select", "other_integration", "keep", suggested_object_id="keep")
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert registry.async_get(stale.entity_id) is None
    assert registry.async_get(other.entity_id) is not None
