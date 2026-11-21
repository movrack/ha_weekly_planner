"""Each user keeps their own Home Assistant rights (owner, 2026-11-21): no list of sensitive domains.

Real users: an administrator, a user with the default policy, a user whose policy denies the
program's device. An action may be stored only if Home Assistant would let that user call it.
"""

from __future__ import annotations

from functools import partial

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.core import Context, ServiceCall
from homeassistant.exceptions import Unauthorized
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import service as ha_service
from pytest_homeassistant_custom_component.common import CLIENT_ID, MockUser

from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.rights import _is_admin_service, allowed, program_actions

from .helpers import CLIMATE, Recorder, act, label, labels, program, scene, setup, slot

LOCK = "lock.front"
ERROR = "Your Home Assistant rights do not allow this action"


async def _noop(call: ServiceCall) -> None:
    return None


def _register(hass) -> None:
    """A lock service open to every user, an admin service and an admin-only entity service."""
    hass.services.async_register("lock", "unlock", _noop)
    hass.services.async_register("lock", "lock", partial(_noop))  # a partial that is not an admin wrapper
    ha_service.async_register_admin_service(hass, "wp_test", "restart", _noop)
    ha_service.async_register_entity_service(
        hass, "wp_test", "wipe", admin_only=True, entities={}, func="async_wipe", job_type=None,
        schema=cv.make_entity_service_schema({}))
    hass.states.async_set(LOCK, "locked")


async def _token(hass, user) -> str:
    refresh = await hass.auth.async_create_refresh_token(user, CLIENT_ID)
    return hass.auth.async_create_access_token(refresh)


async def _plain_user(hass) -> MockUser:
    return MockUser(name="Plain", groups=[await hass.auth.async_get_group(GROUP_ID_USER)]).add_to_hass(hass)


def _restricted_user(hass) -> MockUser:
    user = MockUser(name="Lock only").add_to_hass(hass)
    user.mock_policy({"entities": {"entity_ids": {LOCK: True}}})  # may not control the climate
    return user


async def _save_label(ws, action: dict, label_id: str | None = None) -> dict:
    body = {"name": "Test", "color": "#112233", "action": action}
    if label_id:
        body["id"] = label_id
    await ws.send_json_auto_id({"type": f"{DOMAIN}/label/save", "label": body})
    return await ws.receive_json()


async def _save_program(ws, prog: dict) -> dict:
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": prog})
    return await ws.receive_json()


def _refused(res: dict) -> bool:
    return not res["success"] and res["error"] == {"code": "unauthorized", "message": ERROR}


async def test_home_assistant_itself_refuses_admin_services_to_a_plain_user(hass):
    """The detection mirrors Home Assistant: the plain user's own call is refused, the admin service is seen."""
    _register(hass)
    user = await _plain_user(hass)
    with pytest.raises(Unauthorized):
        await hass.services.async_call("wp_test", "restart", {}, blocking=True, context=Context(user_id=user.id))
    with pytest.raises(Unauthorized):
        await hass.services.async_call("wp_test", "wipe", {"entity_id": LOCK}, blocking=True,
                                       context=Context(user_id=user.id))
    await hass.services.async_call("lock", "unlock", {"entity_id": LOCK}, blocking=True,
                                   context=Context(user_id=user.id))
    assert _is_admin_service(hass, "wp_test.restart") and _is_admin_service(hass, "wp_test.wipe")
    assert not _is_admin_service(hass, "lock.unlock") and not _is_admin_service(hass, "lock.lock") and not _is_admin_service(hass, "nothing.here")


async def test_admin_may_save_anything(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    _register(hass)
    await setup(hass, hass_storage, freezer, [program()], None)
    ws = await hass_ws_client(hass)  # the default token belongs to an administrator
    assert (await _save_label(ws, act("lock.unlock")))["success"]
    assert (await _save_label(ws, act("wp_test.restart")))["success"]


async def test_plain_user_keeps_the_rights_of_plain_home_assistant(hass, hass_storage, freezer, hass_ws_client):
    """Default policy: may control every entity (a lock too), may not call an admin service."""
    Recorder(hass)
    _register(hass)
    await setup(hass, hass_storage, freezer, [program()], None)
    ws = await hass_ws_client(hass, await _token(hass, await _plain_user(hass)))
    assert (await _save_label(ws, act("lock.unlock")))["success"]
    assert _refused(await _save_label(ws, act("wp_test.restart")))
    assert _refused(await _save_label(ws, act("wp_test.wipe")))
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    prog = (await ws.receive_json())["result"]["programs"][0]
    prog["name"] = "Bureau"
    assert (await _save_program(ws, prog))["success"]


async def test_restricted_user_is_refused_a_device_they_may_not_control(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    _register(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], None)
    ws = await hass_ws_client(hass, await _token(hass, _restricted_user(hass)))
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    prog = (await ws.receive_json())["result"]["programs"][0]
    prog["name"] = "Bureau"
    assert _refused(await _save_program(ws, prog))  # the program drives the climate
    assert _refused(await _save_label(ws, act("climate.set_temperature", temperature=30), "t21"))  # used on it
    assert (await _save_label(ws, act("lock.unlock")))["success"]  # used nowhere, open service
    assert _refused(await _save_label(ws, {**act("lock.unlock"), "target_entity_id": "lock.garage"}))
    assert engine.store.program("office")["name"] == "office"


def test_program_actions_follow_the_labels_really_applied():
    labs = {x["id"]: x for x in labels()}
    other = "climate.bedroom"
    entities = [{"entity_id": CLIMATE, "default_label": "t15", "label_overrides": {"t21": scene("scene.x")}},
                {"entity_id": other, "default_label": None, "label_overrides": {}}]
    prog = program(slots=[{**slot("s1", "08:00", "12:00", "t21"), "entities": [CLIMATE]},
                          slot("s2", "13:00", "14:00", "t19")], entities=entities)
    pairs = sorted((e, a.get("service", a.get("scene"))) for e, a in program_actions(prog, labs))
    assert pairs == [(other, "climate.set_temperature"), (CLIMATE, "climate.set_temperature"),
                     (CLIMATE, "climate.set_temperature"), (CLIMATE, "scene.x")]
    assert [e for e, _ in program_actions(prog, labs, only_label="t21")] == [CLIMATE]


async def test_sources_need_read_rights_and_scenes_control_rights(hass):
    user = MockUser(name="Lock only").add_to_hass(hass)
    user.mock_policy({"entities": {"entity_ids": {LOCK: True, "scene.ok": True}}})
    source = {"temperature": {"entity_id": "sensor.hidden", "type": "number"}}
    assert not allowed(hass, user, [(LOCK, {**act("lock.unlock"), "data_sources": source})])
    assert allowed(hass, user, [(LOCK, act("lock.unlock")), (None, scene("scene.ok")), (None, None)])
    assert not allowed(hass, user, [(LOCK, scene("scene.other"))])


async def test_admin_only_option_still_reserves_editing(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [program()], None, admin_only=True)
    ws = await hass_ws_client(hass, await _token(hass, await _plain_user(hass)))
    res = await _save_label(ws, act("climate.set_temperature", temperature=20))
    assert res["error"] == {"code": "unauthorized", "message": "Editing is reserved to administrators"}
    admin = await hass_ws_client(hass)
    assert (await _save_label(admin, act("climate.set_temperature", temperature=20)))["success"]


async def test_program_with_a_label_only_an_admin_could_call(hass, hass_storage, freezer, hass_ws_client):
    """A plain user may not reuse, in a program, a label an administrator made with an admin service."""
    Recorder(hass)
    _register(hass)
    await setup(hass, hass_storage, freezer, [], None, extra_labels=[*labels(), label("rs", act("wp_test.restart"))])
    ws = await hass_ws_client(hass, await _token(hass, await _plain_user(hass)))
    prog = program(slots=[slot("s1", "08:00", "12:00", "rs")])
    prog.pop("id")
    assert _refused(await _save_program(ws, prog))
