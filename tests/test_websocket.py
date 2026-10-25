"""Websocket API: save, revision conflicts, rights, deletion (S18, S19, S34)."""

from __future__ import annotations

from custom_components.weekly_planner.const import DOMAIN

from .test_engine import CLIMATE, FakeClimate, program, setup, slot


async def _client(hass, hass_ws_client):
    return await hass_ws_client(hass)


async def test_save_and_conflict(hass, hass_storage, freezer, hass_ws_client):  # S34
    FakeClimate(hass)
    await setup(hass, hass_storage, freezer, [program()], None)
    ws = await _client(hass, hass_ws_client)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    data = (await ws.receive_json())["result"]
    prog = data["programs"][0]
    prog["name"] = "Bureau"
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": prog})
    res = await ws.receive_json()
    assert res["success"] and res["result"]["program"]["revision"] == 2
    # a second editor still holding revision 1 is refused
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": prog})
    res = await ws.receive_json()
    assert not res["success"] and res["error"]["code"] == "conflict"


async def test_overlap_refused(hass, hass_storage, freezer, hass_ws_client):
    FakeClimate(hass)
    await setup(hass, hass_storage, freezer, [], None)
    ws = await _client(hass, hass_ws_client)
    bad = program(slots=[slot("a", "08:00", "12:00", "climate_comfort"), slot("b", "11:00", "13:00", "climate_eco")])
    bad.pop("id")
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": bad})
    res = await ws.receive_json()
    assert not res["success"] and res["error"]["code"] == "invalid"


async def test_admin_only_and_sensitive(hass, hass_storage, freezer, hass_ws_client, hass_read_only_access_token):  # S19
    FakeClimate(hass)
    await setup(hass, hass_storage, freezer, [program()], None, admin_only=True)
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    data = (await ws.receive_json())["result"]
    assert data["can_edit"] is False
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": data["programs"][0]})
    assert (await ws.receive_json())["error"]["code"] == "unauthorized"


async def test_script_needs_admin_even_without_admin_only(hass, hass_storage, freezer, hass_ws_client, hass_read_only_access_token):
    FakeClimate(hass)
    await setup(hass, hass_storage, freezer, [], None)
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    prog = program(slots=[slot("s", "08:00", "09:00", by_entity={CLIMATE: {"kind": "script", "script": "script.x"}})])
    prog.pop("id")
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": prog})
    assert (await ws.receive_json())["error"]["code"] == "unauthorized"


async def test_delete_applies_default(hass, hass_storage, freezer, hass_ws_client):  # S18
    climate = FakeClimate(hass)
    allday = program(slots=[slot("d", "00:00", "24:00", "climate_comfort")])
    engine = await setup(hass, hass_storage, freezer, [allday], None)
    assert climate.preset == "comfort"
    ws = await _client(hass, hass_ws_client)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/delete", "program_id": "office"})
    assert (await ws.receive_json())["success"]
    await hass.async_block_till_done()
    assert climate.preset == "eco" and not engine.store.programs
