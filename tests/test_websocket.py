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


async def test_allowed_services_saved_and_warned(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    entities = [{"entity_id": CLIMATE, "default_label": "t15", "label_overrides": {},
                 "allowed_services": ["climate.set_temperature"]}]
    prog = program(slots=[slot("s1", "08:00", "12:00", "boost")], entities=entities)
    await setup(hass, hass_storage, freezer, [prog], None)
    ws = await _client(hass, hass_ws_client)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    data = (await ws.receive_json())["result"]
    assert data["programs"][0]["entities"][0]["allowed_services"] == ["climate.set_temperature"]
    # the preset label is not among the allowed services: skipped with a warning
    warnings = data["warnings"]["office"]
    assert any(w["code"] == "incompatible_label" and "boost" in w["detail"] for w in warnings)
    # the list must be a list of service ids
    bad = data["programs"][0]
    bad["entities"][0]["allowed_services"] = "climate.set_temperature"
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": bad})
    assert not (await ws.receive_json())["success"]


async def test_explicit_empty_services_persist_and_never_call_devices(hass, hass_storage, freezer, hass_ws_client):
    from datetime import timedelta

    from homeassistant.util import dt as dt_util

    from .helpers import go_to

    recorder = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [], None)
    ws = await _client(hass, hass_ws_client)
    prog = program(entities=[{"entity_id": CLIMATE, "default_label": "t15",
                              "allowed_services": [], "restrict_services": True}])
    prog.pop("id")
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": prog})
    result = await ws.receive_json()
    assert result["success"]
    saved = result["result"]["program"]
    assert saved["entities"][0]["restrict_services"] is True
    assert saved["entities"][0]["allowed_services"] == []
    await hass.async_block_till_done()
    await ws.close()
    tomorrow = dt_util.now() + timedelta(days=1)
    await go_to(hass, freezer, tomorrow.replace(hour=9, minute=0, second=0, microsecond=0))
    await go_to(hass, freezer, tomorrow.replace(hour=13, minute=0, second=0, microsecond=0))
    assert recorder.calls == []  # neither the slot nor the default sends an action
    await engine.store._config.async_save(engine.store.config)
    stored = hass_storage[DOMAIN]["data"]["programs"][0]["entities"][0]
    assert stored["restrict_services"] is True and stored["allowed_services"] == []


async def test_toggle_during_startup_updates_all_views_without_device_actions(
    hass, hass_storage, freezer, hass_ws_client,
):
    """Configuration stays live while startup stabilization defers physical actions."""
    from homeassistant.helpers import entity_registry as er

    recorder = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], None)
    registry = er.async_get(hass)
    entity_id = registry.async_get_entity_id("switch", DOMAIN, f"{engine.entry_id}_program_office")
    assert entity_id is not None
    assert hass.states.get(entity_id).state == "on"
    subscribers = [await hass_ws_client(hass), await hass_ws_client(hass)]
    for client in subscribers:
        await client.send_json_auto_id({"type": f"{DOMAIN}/subscribe"})
        assert (await client.receive_json())["success"]
        assert (await client.receive_json())["event"]["programs"][0]["enabled"] is True
    writer = await hass_ws_client(hass)
    # Exercise the same pre-ready branch as the 30-second startup stabilization.
    engine._ready = False
    recorder.calls.clear()
    await writer.send_json_auto_id({
        "type": f"{DOMAIN}/program/set_enabled", "program_id": "office", "enabled": False,
    })
    assert (await writer.receive_json())["success"]
    await hass.async_block_till_done()
    assert engine.store.program("office")["enabled"] is False
    assert hass.states.get(entity_id).state == "off"
    for client in subscribers:
        assert (await client.receive_json())["event"]["programs"][0]["enabled"] is False
    assert recorder.calls == []  # disabling must not send the default before startup is ready

    # A change through Home Assistant's switch must reach those same subscribed cards.
    await hass.services.async_call("switch", "turn_on", {"entity_id": entity_id}, blocking=True)
    await hass.async_block_till_done()
    assert engine.store.program("office")["enabled"] is True
    assert hass.states.get(entity_id).state == "on"
    for client in subscribers:
        assert (await client.receive_json())["event"]["programs"][0]["enabled"] is True
    assert recorder.calls == []
