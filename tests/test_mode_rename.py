"""Option tracking, rename handling, resolve/undo and the repair issue (docs/adr/0001, spec 37.2)."""

from __future__ import annotations

import logging

from homeassistant.helpers import issue_registry as ir

from custom_components.weekly_planner.const import DOMAIN

from .helpers import Recorder, local, setup
from .test_global_mode import CONFIG, OPTIONS, SECOND, SELECTOR, choose, moded, snapshot, started


def _names(engine, pid="office") -> list[str]:
    return [p["name"] for p in engine.store.program(pid)["profiles"]]


def _issue(hass):
    return ir.async_get(hass).async_get_issue(DOMAIN, "mode_option_missing")


async def _start(hass, hass_storage, freezer, hass_ws_client, programs=None, options=OPTIONS, state="Home"):
    rec = Recorder(hass)
    hass.states.async_set(SECOND, "heat", {"temperature": 10})
    choose(hass, state, options)
    engine, ws = await started(hass, hass_storage, freezer, hass_ws_client,
                               programs or [moded(), moded("second", SECOND)], local(26, 9), rec=rec, config=CONFIG)
    return engine, ws, rec


async def _options(hass, options, state):
    choose(hass, state, options)
    await hass.async_block_till_done()


# -- unambiguous rename --------------------------------------------------------------------------


async def test_unambiguous_rename_follows_in_every_program(hass, hass_storage, freezer, hass_ws_client, caplog):
    engine, ws, rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    assert engine.store.runtime["mode_options_seen"] == OPTIONS
    revision = engine.store.program("office")["revision"]
    with caplog.at_level(logging.INFO, logger="custom_components.weekly_planner.engine"):
        await _options(hass, ["Home", "Elsewhere", "Night"], "Home")
    assert _names(engine) == ["Home", "Elsewhere"] and _names(engine, "second") == ["Home", "Elsewhere"]
    assert engine.store.program("office")["revision"] == revision + 1
    assert engine.store.program("office")["profiles"][1]["id"] == "away"  # same profile, same id
    records = engine.store.runtime["mode_renames"]
    assert len(records) == 1 and (records[0]["old"], records[0]["new"]) == ("Away", "Elsewhere") and records[0]["at"]
    assert len([r for r in caplog.records if "was renamed" in r.getMessage()]) == 1
    data = await snapshot(ws)
    assert data["mode"]["orphans"] == [] and data["mode"]["renamed"] == records
    assert _issue(hass) is None


async def test_renaming_the_active_mode_keeps_the_profile_and_sends_nothing(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, rec = await _start(hass, hass_storage, freezer, hass_ws_client, state="Away")
    rec.calls.clear()
    await _options(hass, ["Home", "Elsewhere", "Night"], "Elsewhere")
    assert engine.active_mode == "Elsewhere" and engine.active_profile_id("office") == "away"
    assert not rec.calls and engine.store.runtime["last_mode"] == "Elsewhere"


async def test_renaming_the_default_mode_moves_the_default(hass, hass_storage, freezer, hass_ws_client):
    engine, _ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    await _options(hass, ["Maison", "Away", "Night"], "Maison")
    assert engine.store.config["default_mode"] == "Maison" and _names(engine) == ["Maison", "Away"]


async def test_rename_records_keep_the_last_ten(hass, hass_storage, freezer, hass_ws_client):
    engine, _ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    for i in range(12):
        await _options(hass, ["Home", f"A{i}", "Night"], "Home")
    records = engine.store.runtime["mode_renames"]
    assert len(records) == 10 and records[-1]["new"] == "A11" and records[0]["old"] == "A1"


# -- ambiguous changes: nothing is guessed, nothing is erased -------------------------------------------


async def _assert_untouched(hass, engine, ws, orphans, options):
    assert _names(engine) == ["Home", "Away"] and _names(engine, "second") == ["Home", "Away"]
    assert "mode_renames" not in engine.store.runtime
    data = await snapshot(ws)
    assert data["mode"]["orphans"] == orphans and data["mode"]["options"] == options
    assert _issue(hass) is not None


async def test_option_removed(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    await _options(hass, ["Home", "Night"], "Home")
    await _assert_untouched(hass, engine, ws, ["Away"], ["Home", "Night"])
    assert (await snapshot(ws))["mode"]["proposals"] == [{"old": "Away", "candidates": ["Night"]}]


async def test_options_added(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    await _options(hass, ["Home", "Elsewhere", "Night", "Party"], "Home")
    assert _names(engine) == ["Home", "Away"]
    assert (await snapshot(ws))["mode"]["orphans"] == ["Away"]


async def test_order_changed(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    await _options(hass, ["Away", "Home", "Night"], "Home")
    assert _names(engine) == ["Home", "Away"] and "mode_renames" not in engine.store.runtime
    assert (await snapshot(ws))["mode"]["orphans"] == []


async def test_several_changes(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    await _options(hass, ["Maison", "Elsewhere", "Night"], "Maison")
    assert _names(engine) == ["Home", "Away"] and "mode_renames" not in engine.store.runtime
    data = (await snapshot(ws))["mode"]
    assert data["orphans"] == ["Home", "Away"]
    assert data["proposals"] == [{"old": "Home", "candidates": ["Maison", "Elsewhere", "Night"]},
                                 {"old": "Away", "candidates": ["Maison", "Elsewhere", "Night"]}]
    assert engine.store.config["default_mode"] == "Home"


async def test_new_name_already_a_profile_is_not_a_rename(hass, hass_storage, freezer, hass_ws_client):
    progs = [moded()]
    progs[0]["profiles"].append({"id": "x", "name": "Elsewhere", "days": [[] for _ in range(7)]})
    engine, _ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, progs)
    await _options(hass, ["Home", "Elsewhere", "Night"], "Home")
    assert _names(engine) == ["Home", "Away", "Elsewhere"] and "mode_renames" not in engine.store.runtime


async def test_old_name_without_profile_is_not_a_rename(hass, hass_storage, freezer, hass_ws_client):
    engine, _ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    await _options(hass, ["Home", "Away", "Evening"], "Home")
    assert _names(engine) == ["Home", "Away"] and "mode_renames" not in engine.store.runtime


async def test_unavailable_selector_changes_nothing(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    await _options(hass, None, "unavailable")
    assert engine.store.runtime["mode_options_seen"] == OPTIONS
    data = (await snapshot(ws))["mode"]
    assert data["orphans"] == [] and data["proposals"] == [] and _issue(hass) is None
    await _options(hass, ["Home", "Elsewhere", "Night"], "Home")  # the rename is seen after the return
    assert _names(engine) == ["Home", "Elsewhere"]


async def test_orphans_are_inactive_and_erase_nothing(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    before = [p for p in engine.store.programs]
    snapshot_before = str(before)
    await _options(hass, ["Home", "Night"], "Night")  # no profile for Night, "Away" has no option
    assert engine.active_profile_id("office") is None
    assert str(engine.store.programs) == snapshot_before


# -- undo ---------------------------------------------------------------------------------------


async def test_undo_rename(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    await _options(hass, ["Home", "Elsewhere", "Night"], "Home")
    await ws.send_json_auto_id({"type": f"{DOMAIN}/mode/undo_rename", "new": "Elsewhere"})
    msg = await ws.receive_json()
    assert msg["success"] and msg["result"] == {"old": "Away", "new": "Elsewhere"}
    await hass.async_block_till_done()
    assert _names(engine) == ["Home", "Away"] and _names(engine, "second") == ["Home", "Away"]
    assert engine.store.runtime["mode_renames"] == []
    data = (await snapshot(ws))["mode"]
    assert data["orphans"] == ["Away"] and data["renamed"] == []
    assert _issue(hass) is not None  # "Away" is now an orphan: the user picks what to do


async def test_undo_without_record_is_an_error(hass, hass_storage, freezer, hass_ws_client):
    _engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/mode/undo_rename", "new": "Nope"})
    msg = await ws.receive_json()
    assert not msg["success"] and msg["error"]["code"] == "not_found"


# -- resolve ------------------------------------------------------------------------------------


async def _resolve(ws, old, new):
    await ws.send_json_auto_id({"type": f"{DOMAIN}/mode/resolve", "old": old, "new": new})
    return await ws.receive_json()


async def test_resolve_renames_in_every_program_and_skips_clashes(hass, hass_storage, freezer, hass_ws_client):
    progs = [moded(), moded("second", SECOND), moded("third", "climate.third")]
    progs[1]["profiles"].append({"id": "n", "name": "Night", "days": [[] for _ in range(7)]})
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, progs, ["Home", "Night"])
    assert (await snapshot(ws))["mode"]["orphans"] == ["Away"]
    msg = await _resolve(ws, "Away", "Night")
    assert msg["success"] and msg["result"] == {"renamed": ["office", "third"], "skipped": ["second"]}
    assert _names(engine) == ["Home", "Night"] and _names(engine, "second") == ["Home", "Away", "Night"]
    assert (await snapshot(ws))["mode"]["orphans"] == ["Away"]  # the skipped program still has it
    assert _issue(hass) is not None


async def test_resolve_to_an_option_ends_the_issue(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, options=["Home", "Night"])
    assert _issue(hass) is not None
    placeholders = _issue(hass).translation_placeholders
    assert placeholders == {"modes": "Away", "options": "Night"}
    msg = await _resolve(ws, "Away", "Night")
    assert msg["result"]["renamed"] == ["office", "second"] and msg["result"]["skipped"] == []
    assert _names(engine) == ["Home", "Night"] and _issue(hass) is None
    assert (await snapshot(ws))["mode"]["orphans"] == []


async def test_resolve_delete_keeps_at_least_one_profile(hass, hass_storage, freezer, hass_ws_client):
    progs = [moded(), moded("second", SECOND)]
    progs[1]["profiles"] = [progs[1]["profiles"][1]]  # "second" only has Away
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, progs, ["Home", "Night"])
    msg = await _resolve(ws, "Away", None)
    assert msg["success"] and msg["result"] == {"renamed": ["office"], "skipped": ["second"]}
    assert _names(engine) == ["Home"] and _names(engine, "second") == ["Away"]


async def test_resolve_refuses_unknown_option_and_real_options(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, options=["Home", "Night"])
    msg = await _resolve(ws, "Away", "Nowhere")
    assert not msg["success"] and msg["error"]["code"] == "invalid"
    msg = await _resolve(ws, "Home", None)  # still an option: not an orphan
    assert not msg["success"] and msg["error"]["code"] == "invalid"
    assert _names(engine) == ["Home", "Away"]


async def test_resolve_and_undo_are_for_administrators(hass, hass_storage, freezer, hass_ws_client,
                                                       hass_read_only_access_token):
    Recorder(hass)
    choose(hass, "Home", ["Home", "Night"])
    engine = await setup(hass, hass_storage, freezer, [moded()], None, config=CONFIG)
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    for payload in ({"old": "Away", "new": "Night"}, {"old": "Away", "new": None}):
        await ws.send_json_auto_id({"type": f"{DOMAIN}/mode/resolve", **payload})
        msg = await ws.receive_json()
        assert not msg["success"] and msg["error"]["code"] == "unauthorized"
    await ws.send_json_auto_id({"type": f"{DOMAIN}/mode/undo_rename", "new": "Night"})
    assert (await ws.receive_json())["error"]["code"] == "unauthorized"
    assert _names(engine) == ["Home", "Away"]


# -- repair issue lifecycle --------------------------------------------------------------------------


async def test_issue_lifecycle_without_spam(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    assert _issue(hass) is None
    await _options(hass, ["Home", "Night"], "Home")
    issue = _issue(hass)
    assert issue.translation_key == "mode_option_missing" and issue.is_fixable is False
    assert issue.translation_placeholders == {"modes": "Away", "options": "Night"}
    created = issue.created
    for _ in range(3):  # no change of orphans: neither recreated nor touched
        choose(hass, "Night", ["Home", "Night"])
        choose(hass, "Home", ["Home", "Night"])
        await hass.async_block_till_done()
    assert _issue(hass).created == created
    await _options(hass, ["Home", "Night", "Party"], "Home")  # a new candidate: updated in place
    assert _issue(hass).translation_placeholders["options"] == "Night, Party"
    await _options(hass, ["Home", "Away", "Night", "Party"], "Home")  # the option is back: cleared
    assert _issue(hass) is None
    await _options(hass, ["Home"], "Home")
    assert _issue(hass).translation_placeholders == {"modes": "Away", "options": "-"}
    msg = await _resolve(ws, "Away", None)
    assert msg["success"] and _issue(hass) is None


async def test_selector_change_forgets_renames_and_options(hass, hass_storage, freezer, hass_ws_client):
    engine, _ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    await _options(hass, ["Home", "Elsewhere", "Night"], "Home")
    assert engine.store.runtime["mode_renames"]
    await engine.async_set_mode_config(None, None)
    assert "mode_options_seen" not in engine.store.runtime and "mode_renames" not in engine.store.runtime


async def test_dismiss_rename_hides_the_notice_for_everybody_and_keeps_the_rename(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client)
    await _options(hass, ["Home", "Elsewhere", "Night"], "Home")
    assert len((await snapshot(ws))["mode"]["renamed"]) == 1
    await ws.send_json_auto_id({"type": f"{DOMAIN}/mode/dismiss_rename", "new": "Elsewhere"})
    assert (await ws.receive_json())["success"]
    assert (await snapshot(ws))["mode"]["renamed"] == [] and _names(engine) == ["Home", "Elsewhere"]
    await ws.send_json_auto_id({"type": f"{DOMAIN}/mode/dismiss_rename", "new": "Elsewhere"})
    assert (await ws.receive_json())["error"]["code"] == "not_found"


async def test_dismiss_rename_is_for_administrators(hass, hass_storage, freezer, hass_ws_client, hass_read_only_access_token):
    Recorder(hass)
    choose(hass, "Home", ["Home", "Night"])
    await setup(hass, hass_storage, freezer, [moded()], None, config=CONFIG)
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/mode/dismiss_rename", "new": "Night"})
    assert (await ws.receive_json())["error"]["code"] == "unauthorized"
