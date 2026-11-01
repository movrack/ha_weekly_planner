"""Websocket with per-device schedules (issue #34, LOT 3): save normalisation, preview ``by_entity``, snapshots."""

from __future__ import annotations

from copy import deepcopy

from custom_components.weekly_planner.const import DOMAIN

from .helpers import CLIMATE, COVER, Recorder, program, setup, slot

BEDROOM = "climate.bedroom"


def for_(sl: dict, *entities: str) -> dict:
    return {**sl, "entities": list(entities)}


def devices(*ids: str) -> list[dict]:
    return [{"entity_id": eid, "default_label": None, "label_overrides": {}} for eid in ids]


def owner(**kwargs) -> dict:
    """Climate 07:00-22:00 only for the climate, cover 07:00-09:00 only for the cover (overlapping in time)."""
    slots = [for_(slot("thermo", "07:00", "22:00", "t15"), CLIMATE), for_(slot("shut", "07:00", "09:00", "close"), COVER)]
    return program(slots=slots, entities=devices(CLIMATE, COVER), **kwargs)


async def ask(ws, payload: dict) -> dict:
    await ws.send_json_auto_id(payload)
    return await ws.receive_json()


async def save(ws, prog: dict) -> dict:
    return await ask(ws, {"type": f"{DOMAIN}/program/save", "program": prog})


async def test_owner_case_saves_and_previews_per_device(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [], None)
    ws = await hass_ws_client(hass)
    new = owner()
    new.pop("id")
    res = await save(ws, new)
    assert res["success"], res
    saved = res["result"]["program"]
    res = await ask(ws, {"type": f"{DOMAIN}/preview", "program_id": saved["id"], "date": "2026-10-26"})
    result = res["result"]
    assert result["date"] == "2026-10-26"
    # CET: 07:00 local = 06:00Z. Overlapping slots are NOT trimmed against each other at the top level.
    assert result["slots"] == [
        {"slot_id": "thermo", "start": "2026-10-26T06:00:00+00:00", "end": "2026-10-26T21:00:00+00:00",
         "ignored": None, "sun": False, "entities": [CLIMATE]},
        {"slot_id": "shut", "start": "2026-10-26T06:00:00+00:00", "end": "2026-10-26T08:00:00+00:00",
         "ignored": None, "sun": False, "entities": [COVER]},
    ]
    assert result["by_entity"] == {
        CLIMATE: [{"slot_id": "thermo", "start": "2026-10-26T06:00:00+00:00", "end": "2026-10-26T21:00:00+00:00",
                   "ignored": None, "sun": False, "entities": [CLIMATE]}],
        COVER: [{"slot_id": "shut", "start": "2026-10-26T06:00:00+00:00", "end": "2026-10-26T08:00:00+00:00",
                 "ignored": None, "sun": False, "entities": [COVER]}],
    }


async def test_preview_without_lists_keeps_the_old_response(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [program(slots=[slot("a", "08:00", "12:00", "t21"), slot("b", "11:00", "13:00", "t15")])],
                None)
    ws = await hass_ws_client(hass)
    res = await ask(ws, {"type": f"{DOMAIN}/preview", "program_id": "office", "date": "2026-10-26"})
    # fixture of the response before #34: globally trimmed, no "entities", no "by_entity"
    assert res["result"] == {"date": "2026-10-26", "slots": [
        {"slot_id": "a", "start": "2026-10-26T07:00:00+00:00", "end": "2026-10-26T11:00:00+00:00", "ignored": None, "sun": False},
        {"slot_id": "b", "start": "2026-10-26T11:00:00+00:00", "end": "2026-10-26T12:00:00+00:00", "ignored": None, "sun": False},
    ]}
    assert "by_entity" not in res["result"]


async def test_previous_day_spill_in_by_entity_on_dst_day(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    night = for_(slot("night", "22:00", "06:00", "close"), COVER)
    prog = program(slots=[night, for_(slot("day", "08:00", "10:00", "t21"), CLIMATE)], entities=devices(CLIMATE, COVER))
    await setup(hass, hass_storage, freezer, [prog], None)
    ws = await hass_ws_client(hass)
    # 2026-10-25: DST ends (03:00 CEST -> 02:00 CET)
    res = (await ask(ws, {"type": f"{DOMAIN}/preview", "program_id": "office", "date": "2026-10-25"}))["result"]
    cover = res["by_entity"][COVER]
    spill = cover[0]
    assert spill["slot_id"] == "night" and spill["start"] == "2026-10-24T20:00:00+00:00"  # 22:00 CEST the day before
    assert spill["end"] == "2026-10-25T05:00:00+00:00"  # 06:00 CET
    assert [o["slot_id"] for o in cover] == ["night", "night"]  # spill + the evening one of the day itself
    assert [o["slot_id"] for o in res["by_entity"][CLIMATE]] == ["day"]
    assert all(o["start"] != "2026-10-24T20:00:00+00:00" for o in res["by_entity"][CLIMATE])
    assert [o["slot_id"] for o in res["slots"]] == ["day", "night"]  # main list: only the day itself


async def test_save_normalises_lists(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [], None)
    ws = await hass_ws_client(hass)
    slots = [for_(slot("all", "07:00", "08:00", "t21"), COVER, CLIMATE),  # every device -> absent
             for_(slot("dup", "09:00", "10:00", "t21"), CLIMATE, CLIMATE)]  # duplicates dropped
    new = program(slots=slots, entities=devices(CLIMATE, COVER))
    new.pop("id")
    saved = (await save(ws, new))["result"]["program"]
    day = saved["profiles"][0]["days"][0]
    assert "entities" not in day[0] and day[1]["entities"] == [CLIMATE]
    # a single-device program never keeps a list
    single = program(pid="solo", slots=[for_(slot("one", "07:00", "08:00", "t21"), CLIMATE)])
    single.pop("id")
    day = (await save(ws, single))["result"]["program"]["profiles"][0]["days"][0]
    assert "entities" not in day[0]


async def test_removing_a_device_cleans_lists_in_every_mode(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    hass.states.async_set(BEDROOM, "heat", {"temperature": 10})
    prog = program(slots=[], entities=devices(CLIMATE, COVER, BEDROOM))
    base = [for_(slot("both", "07:00", "08:00", "t21"), CLIMATE, COVER), for_(slot("only", "09:00", "10:00", "close"), COVER),
            for_(slot("rest", "11:00", "12:00", "t21"), COVER, BEDROOM)]
    prog["profiles"] = [
        {"id": "base", "name": "Base", "days": [deepcopy(base) for _ in range(7)]},
        {"id": "away", "name": "Away", "days": [deepcopy(base) for _ in range(7)]},
    ]
    await setup(hass, hass_storage, freezer, [prog], None)
    ws = await hass_ws_client(hass)
    edited = (await ask(ws, {"type": f"{DOMAIN}/get"}))["result"]["programs"][0]
    edited["entities"] = [e for e in edited["entities"] if e["entity_id"] != COVER]
    res = await save(ws, edited)
    assert res["success"], res  # no unknown_slot_entity for the device just removed
    assert [e["entity_id"] for e in res["result"]["program"]["entities"]] == [CLIMATE, BEDROOM]
    for profile in res["result"]["program"]["profiles"]:
        for day in profile["days"]:
            by_id = {s["id"]: s for s in day}
            assert "only" not in by_id  # its only device left: deleted
            assert by_id["both"]["entities"] == [CLIMATE]
            assert by_id["rest"]["entities"] == [BEDROOM]


async def test_unknown_device_in_a_list_is_still_refused(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [], None)
    ws = await hass_ws_client(hass)
    bad = owner()
    bad.pop("id")
    bad["profiles"][0]["days"][0][0]["entities"] = ["climate.nowhere"]
    res = await save(ws, bad)
    assert not res["success"] and res["error"]["code"] == "invalid" and "unknown_slot_entity" in res["error"]["message"]


async def test_conflict_revision_unchanged_with_lists(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [owner()], None)
    ws = await hass_ws_client(hass)
    prog = (await ask(ws, {"type": f"{DOMAIN}/get"}))["result"]["programs"][0]
    first = await save(ws, prog)
    assert first["success"] and first["result"]["program"]["revision"] == 2
    again = await save(ws, prog)
    assert not again["success"] and again["error"]["code"] == "conflict"


async def test_list_save_permissions_unchanged(hass, hass_storage, freezer, hass_ws_client, hass_read_only_access_token):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [owner()], None, admin_only=True)
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    data = (await ask(ws, {"type": f"{DOMAIN}/get"}))["result"]
    assert data["can_edit"] is False
    assert (await save(ws, data["programs"][0]))["error"]["code"] == "unauthorized"


async def test_snapshot_and_subscribe_carry_lists_seed_and_skip_targets(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    prog = owner()
    for day in prog["profiles"][0]["days"]:
        day[0]["seed"] = "shared"
    engine = await setup(hass, hass_storage, freezer, [prog], None)
    ws = await hass_ws_client(hass)
    data = (await ask(ws, {"type": f"{DOMAIN}/get"}))["result"]
    day = data["programs"][0]["profiles"][0]["days"][0]
    assert day[0]["entities"] == [CLIMATE] and day[0]["seed"] == "shared" and day[1]["entities"] == [COVER]
    assert "skip_next_targets" in data["status"]["office"]
    await ws.send_json_auto_id({"type": f"{DOMAIN}/subscribe"})
    assert (await ws.receive_json())["success"]
    event = (await ws.receive_json())["event"]
    assert event["programs"][0]["profiles"][0]["days"][0][1]["entities"] == [COVER]
    assert "skip_next_targets" in event["status"]["office"]


async def test_label_save_never_rejects_incompatibility(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [owner()], None)
    ws = await hass_ws_client(hass)
    data = (await ask(ws, {"type": f"{DOMAIN}/get"}))["result"]
    shut = next(x for x in data["labels"] if x["id"] == "close")  # a cover label used by a slot listing only the cover
    shut = {**shut, "name": "Close it"}
    res = await ask(ws, {"type": f"{DOMAIN}/label/save", "label": shut})
    assert res["success"], res
    # a climate temperature on a cover-only slot is saved (warning only), never refused
    mismatch = owner()
    for day in mismatch["profiles"][0]["days"]:
        day[1]["label"] = "t21"
    res = await save(ws, {**(await ask(ws, {"type": f"{DOMAIN}/get"}))["result"]["programs"][0],
                          "profiles": mismatch["profiles"]})
    assert res["success"], res
