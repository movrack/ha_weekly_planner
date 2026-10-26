"""Websocket API: save, revision conflicts, rights, deletion (S18, S19, S34)."""

from __future__ import annotations

from custom_components.weekly_planner.const import DOMAIN

from .helpers import CLIMATE, Recorder, act, labels, program, setup, slot


async def _client(hass, hass_ws_client):
    return await hass_ws_client(hass)


async def test_save_and_conflict(hass, hass_storage, freezer, hass_ws_client):  # S34
    Recorder(hass)
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
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [], None)
    ws = await _client(hass, hass_ws_client)
    bad = program(slots=[slot("a", "08:00", "12:00", "t21"), slot("b", "11:00", "13:00", "t15")])
    bad.pop("id")
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": bad})
    res = await ws.receive_json()
    assert not res["success"] and res["error"]["code"] == "invalid"


async def test_admin_only_and_sensitive(hass, hass_storage, freezer, hass_ws_client, hass_read_only_access_token):  # S19
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [program()], None, admin_only=True)
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    data = (await ws.receive_json())["result"]
    assert data["can_edit"] is False
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": data["programs"][0]})
    assert (await ws.receive_json())["error"]["code"] == "unauthorized"


async def test_sensitive_label_needs_admin_even_without_admin_only(hass, hass_storage, freezer, hass_ws_client, hass_read_only_access_token):
    Recorder(hass)
    hass.services.async_register("lock", "unlock", lambda call: None)
    await setup(hass, hass_storage, freezer, [], None)
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/label/save", "label": {
        "name": "Unlock", "color": "#112233", "action": act("lock.unlock")}})
    assert (await ws.receive_json())["error"]["code"] == "unauthorized"


async def test_delete_applies_default(hass, hass_storage, freezer, hass_ws_client):  # S18
    climate = Recorder(hass)
    allday = program(slots=[slot("d", "00:00", "24:00", "t21")])
    engine = await setup(hass, hass_storage, freezer, [allday], None)
    assert climate.calls[-1][1] == {"temperature": 21}
    ws = await _client(hass, hass_ws_client)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/delete", "program_id": "office"})
    assert (await ws.receive_json())["success"]
    await hass.async_block_till_done()
    assert climate.calls[-1][1] == {"temperature": 15} and not engine.store.programs


async def test_warnings(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    hass.states.async_set("switch.schedule_abc", "on", {"entities": [CLIMATE]})
    await setup(hass, hass_storage, freezer, [program()], None)
    ws = await _client(hass, hass_ws_client)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    codes = {w["code"] for w in (await ws.receive_json())["result"]["warnings"]["office"]}
    assert "scheduler" in codes


async def test_card_version_in_get_and_subscribe(hass, hass_storage, freezer, hass_ws_client):
    """The data carries the version of the card the integration serves (hash of the bundle)."""
    from hashlib import sha256

    from custom_components.weekly_planner.frontend import CARD_FILE

    Recorder(hass)
    await setup(hass, hass_storage, freezer, [program()], None)
    expected = sha256(CARD_FILE.read_bytes()).hexdigest()[:12]
    ws = await _client(hass, hass_ws_client)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    assert (await ws.receive_json())["result"]["card_version"] == expected
    await ws.send_json_auto_id({"type": f"{DOMAIN}/subscribe"})
    assert (await ws.receive_json())["success"]
    assert (await ws.receive_json())["event"]["card_version"] == expected
