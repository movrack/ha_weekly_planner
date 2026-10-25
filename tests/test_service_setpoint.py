"""Generic "service" setpoints: one-shot services on any entity."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.exceptions import HomeAssistantError, ServiceValidationError

from custom_components.weekly_planner.const import DOMAIN

from .test_engine import go_to, program, setup, slot, tick
from .test_engine import local

VACUUM = "vacuum.rocky"
SERVICE = {"kind": "service", "service": "vacuum.start", "data": {}}


def vacuum_program():
    return program(
        slots=[slot("clean", "23:00", None, by_entity={VACUUM: SERVICE})],
        entities=[{"entity_id": VACUUM, "default": {"kind": "none"}}],
    )


def register(hass, error=None):
    calls = []

    async def handler(call):
        calls.append(call)
        if error:
            raise error

    hass.services.async_register("vacuum", "start", handler)
    hass.states.async_set(VACUUM, "docked")
    return calls


async def test_runs_at_start_with_target(hass, hass_storage, freezer):
    calls = register(hass)
    await setup(hass, hass_storage, freezer, [vacuum_program()], local(26, 22, 0))
    await go_to(hass, freezer, local(26, 23, 0))
    assert len(calls) == 1 and calls[0].data["entity_id"] == [VACUUM] or calls[0].data["entity_id"] == VACUUM


async def test_never_rerun_at_restart(hass, hass_storage, freezer):
    calls = register(hass)
    engine = await setup(hass, hass_storage, freezer, [vacuum_program()], local(26, 22, 0))
    await go_to(hass, freezer, local(26, 23, 5))
    assert len(calls) == 1
    await engine.async_recompute("startup")
    await engine.async_apply_now("office")
    await tick(hass, freezer, timedelta(minutes=30))
    assert len(calls) == 1


async def test_end_refused(hass, hass_storage, freezer, hass_ws_client):
    register(hass)
    await setup(hass, hass_storage, freezer, [], None)
    ws = await hass_ws_client(hass)
    bad = program(slots=[slot("clean", "23:00", "23:30", by_entity={VACUUM: SERVICE})],
                  entities=[{"entity_id": VACUUM, "default": {"kind": "none"}}])
    bad.pop("id")
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": bad})
    res = await ws.receive_json()
    assert not res["success"] and "service_has_no_end" in res["error"]["message"]


async def test_unknown_service_refused(hass, hass_storage, freezer, hass_ws_client):
    register(hass)
    await setup(hass, hass_storage, freezer, [], None)
    ws = await hass_ws_client(hass)
    bad = vacuum_program()
    bad["profiles"][0]["days"][0][0]["actions"]["by_entity"][VACUUM] = {"kind": "service", "service": "vacuum.nope"}
    bad.pop("id")
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": bad})
    res = await ws.receive_json()
    assert not res["success"] and "unknown_service" in res["error"]["message"]


async def test_validation_error_not_retried(hass, hass_storage, freezer):
    calls = register(hass, ServiceValidationError("bad"))
    await setup(hass, hass_storage, freezer, [vacuum_program()], local(26, 22, 0))
    await go_to(hass, freezer, local(26, 23, 0))
    assert len(calls) == 1
    await tick(hass, freezer, timedelta(minutes=30))
    assert len(calls) == 1


async def test_other_errors_retried(hass, hass_storage, freezer):
    calls = register(hass, HomeAssistantError("offline"))
    await setup(hass, hass_storage, freezer, [vacuum_program()], local(26, 22, 0))
    await go_to(hass, freezer, local(26, 23, 0))
    assert len(calls) == 1
    await tick(hass, freezer, timedelta(minutes=1, seconds=5))
    assert len(calls) == 2
    await tick(hass, freezer, timedelta(minutes=2, seconds=5))
    assert len(calls) == 3
