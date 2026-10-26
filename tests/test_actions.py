"""Actions: resolution, service calls, rights, validation, next action."""

from __future__ import annotations

import pytest
import voluptuous as vol

from custom_components.weekly_planner.actions import call_for, needs_admin, resolve_action
from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.validation import ACTION

from .helpers import CLIMATE, Recorder, act, go_to, labels, local, program, scene, setup, slot, temp


def test_resolve_action_label_override_and_skip():
    labs = {x["id"]: x for x in labels()}
    prog = program(entities=[
        {"entity_id": CLIMATE, "default_label": "t15", "label_overrides": {}},
        {"entity_id": "climate.bath", "default_label": "t15", "label_overrides": {"t21": temp(22)}}])
    assert resolve_action(prog, CLIMATE, "t21", labs) == temp(21)
    assert resolve_action(prog, "climate.bath", "t21", labs) == temp(22)  # the entity's own value
    assert resolve_action(prog, "climate.bath", "t15", labs) == temp(15)  # no override: the label
    assert resolve_action(prog, CLIMATE, None, labs) is None and resolve_action(prog, CLIMATE, "gone", labs) is None
    refuse = lambda eid, action: eid != "climate.bath"  # noqa: E731
    assert resolve_action(prog, "climate.bath", "t21", labs, refuse) is None  # incompatible: skipped
    assert resolve_action(prog, CLIMATE, "t21", labs, refuse) == temp(21)


def test_call_for_service_and_scene():
    call = call_for(CLIMATE, temp(18))
    assert (call.domain, call.service, call.service_data(), call.as_target) == (
        "climate", "set_temperature", {"temperature": 18}, True)
    call = call_for(CLIMATE, scene("scene.work"))
    assert (call.domain, call.service, call.service_data(), call.as_target) == (
        "scene", "turn_on", {"entity_id": "scene.work"}, False)


def test_sensitive_domains_need_an_admin():
    assert needs_admin(act("lock.unlock"))
    assert needs_admin(act("homeassistant.restart"))
    assert not needs_admin(temp(18)) and not needs_admin(scene("scene.x")) and not needs_admin(None)


def test_action_schema():
    assert ACTION(act("light.turn_on", brightness_pct=50))
    assert ACTION({"kind": "service", "service": "switch.turn_off"})["data"] == {}
    assert ACTION(scene("scene.evening"))
    for bad in ({"kind": "preset", "preset": "eco"}, {"kind": "scene", "scene": "light.x"}, {"kind": "service"}):
        with pytest.raises(vol.Invalid):
            ACTION(bad)


async def test_slot_with_a_service_may_have_an_end(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [], None)
    ws = await hass_ws_client(hass)
    prog = program(slots=[slot("s", "23:00", "23:30", "boost")])
    prog.pop("id")
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": prog})
    assert (await ws.receive_json())["success"]


async def test_label_with_unknown_service_refused(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [], None)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/label/save", "label": {
        "name": "Nope", "color": "#112233", "action": act("climate.nope")}})
    res = await ws.receive_json()
    assert not res["success"] and "unknown_service" in res["error"]["message"]


async def test_old_inline_action_refused(hass, hass_storage, freezer, hass_ws_client):
    await setup(hass, hass_storage, freezer, [], None)
    ws = await hass_ws_client(hass)
    prog = program(slots=[slot("s", "23:00", "23:30", "gone")])
    prog.pop("id")
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": prog})
    res = await ws.receive_json()
    assert not res["success"] and "unknown_label" in res["error"]["message"]


async def test_label_save_then_delete_refused_while_used(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [program()], None)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/label/save", "label": {
        "name": "Cosy", "color": "#aa5500", "action": temp(22)}})
    res = await ws.receive_json()
    assert res["success"] and res["result"]["label"]["id"]
    await ws.send_json_auto_id({"type": f"{DOMAIN}/label/delete", "label_id": "t21"})  # used by the slot
    res = await ws.receive_json()
    assert not res["success"] and res["error"]["code"] == "in_use" and "office" in res["error"]["message"]
    await ws.send_json_auto_id({"type": f"{DOMAIN}/label/delete", "label_id": "t15"})  # used as default
    assert not (await ws.receive_json())["success"]
    await ws.send_json_auto_id({"type": f"{DOMAIN}/label/delete", "label_id": "work"})  # unused
    assert (await ws.receive_json())["success"]


async def test_label_change_applies_to_every_program(hass, hass_storage, freezer, hass_ws_client):
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], None)
    ws = await hass_ws_client(hass)
    freezer.move_to(local(26, 9, 0))
    await engine.async_recompute("startup")
    await hass.async_block_till_done()
    changed = {**next(x for x in labels() if x["id"] == "t21"), "action": temp(23)}
    await ws.send_json_auto_id({"type": f"{DOMAIN}/label/save", "label": changed})
    assert (await ws.receive_json())["success"]
    await hass.async_block_till_done()
    assert rec.calls[-1] == ("climate.set_temperature", {"temperature": 23})


async def test_incompatible_label_is_skipped_and_warned(hass, hass_storage, freezer, hass_ws_client):
    rec = Recorder(hass)
    prog = program(slots=[slot("s", "08:00", "12:00", "close")], default=None)  # a cover label on a climate
    engine = await setup(hass, hass_storage, freezer, [prog], None)
    ws = await hass_ws_client(hass)
    engine.descriptions = {"cover": {"close_cover": {"target": {"entity": {"domain": "cover"}}}}}
    freezer.move_to(local(26, 9, 0))
    rec.calls.clear()
    await engine.async_recompute("startup")
    await hass.async_block_till_done()
    assert rec.calls == []  # skipped for this entity
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    warnings = (await ws.receive_json())["result"]["warnings"]["office"]
    assert any(w["code"] == "incompatible_label" and "close" in w["detail"] for w in warnings)
    assert engine.segment(CLIMATE).key == ("default", "office")


async def test_override_for_one_device_of_a_program(hass, hass_storage, freezer):
    rec = Recorder(hass)
    hass.states.async_set("climate.bath", "heat", {})
    prog = program(entities=[
        {"entity_id": CLIMATE, "default_label": "t15", "label_overrides": {}},
        {"entity_id": "climate.bath", "default_label": "t15", "label_overrides": {"t21": temp(24)}}])
    await setup(hass, hass_storage, freezer, [prog], local(26, 7, 0))
    rec.calls.clear()
    await go_to(hass, freezer, local(26, 8, 0))
    assert sorted(d["temperature"] for _, d in rec.calls) == [21, 24]


async def test_next_action_in_status(hass, hass_storage, freezer):
    Recorder(hass)
    slots = [slot("s", "08:00", "10:00", "t21")]
    engine = await setup(hass, hass_storage, freezer, [program(slots=slots)], local(26, 7, 0))
    nxt = engine.program_status("office")["next_actions"][CLIMATE]
    assert nxt["action"] == temp(21) and nxt["at"].startswith("2026-10-26T07:00")  # 08:00 local
    await go_to(hass, freezer, local(26, 9, 0))
    nxt = engine.program_status("office")["next_actions"][CLIMATE]
    assert nxt["action"] == temp(15) and nxt["at"].startswith("2026-10-26T09:00")  # the end gives the default


async def test_next_action_of_a_one_shot(hass, hass_storage, freezer):
    Recorder(hass)
    slots = [slot("s", "05:00", None, "t25")]
    engine = await setup(hass, hass_storage, freezer, [program(slots=slots)], local(26, 6, 0))
    nxt = engine.next_action(CLIMATE)
    assert nxt["action"] == temp(25) and nxt["at"].startswith("2026-10-27T04:00")  # tomorrow 05:00 local


def test_service_data_cannot_retarget():
    """Service data may not name another target than the device; shell commands are admin-only."""
    import pytest
    import voluptuous as vol

    from custom_components.weekly_planner.actions import needs_admin
    from custom_components.weekly_planner.validation import check_label

    base = {"id": "l1", "name": "Test", "action": {"kind": "service", "service": "light.turn_on", "data": {}}}
    check_label(base)
    for key in ("entity_id", "device_id", "area_id", "floor_id", "label_id"):
        bad = {**base, "action": {**base["action"], "data": {key: "x"}}}
        with pytest.raises(vol.Invalid):
            check_label(bad)
    assert needs_admin({"kind": "service", "service": "shell_command.run"})
