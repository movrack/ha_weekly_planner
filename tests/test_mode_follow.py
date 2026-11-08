"""A mode follows another one (docs/adr/0002, spec 37.2): resolution, rules, websocket, source gone, rename, YAML."""

from __future__ import annotations

from copy import deepcopy

import pytest
import voluptuous as vol

from custom_components.weekly_planner import yaml_file
from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.modes import (
    check_follows, copy_days, detach_followers, profile_for_mode, rename_profile, set_follow,
)
from custom_components.weekly_planner.validation import check_program

from .helpers import Recorder, labels, local, setup, slot
from .test_global_mode import CONFIG, OPTIONS, SECOND, SELECTOR, choose, moded, snapshot, started
from .test_mode_rename import _options, _resolve, _start
from .test_yaml_file import _doc, _edit, _issue, _later
from .test_yaml_file import _start as _yaml_start


def _empty() -> list[list]:
    return [[] for _ in range(7)]


def _follower(pid: str = "office", source: str = "Home", name: str = "Night") -> dict:
    """moded() (Home 21 degrees, Away 19 degrees) plus the mode ``name`` that follows ``source``."""
    prog = moded(pid)
    prog["profiles"].append({"id": "night", "name": name, "days": _empty(), "follows": source})
    return prog


async def _command(ws, kind: str, **payload) -> dict:
    await ws.send_json_auto_id({"type": f"{DOMAIN}/{kind}", **payload})
    return await ws.receive_json()


async def _follow(ws, mode, follows, pid="office") -> dict:
    return await _command(ws, "program/mode_follow", program_id=pid, mode=mode, follows=follows)


def _program(engine, pid="office") -> dict:
    return engine.store.program(pid)


def _profile(engine, name, pid="office") -> dict:
    return next(p for p in _program(engine, pid)["profiles"] if p["name"] == name)


# -- pure rules -------------------------------------------------------------------------------------------


def _profiles() -> list[dict]:
    return [{"id": "h", "name": "Home", "days": [[slot("a", "08:00", "09:00")] for _ in range(7)]},
            {"id": "a", "name": "Away", "days": _empty()},
            {"id": "n", "name": "Night", "days": _empty()}]


def test_profile_for_mode_goes_to_the_source_in_one_step():
    prog = {"id": "p", "profiles": _profiles()}
    assert profile_for_mode(prog, "Night") == "n"
    prog["profiles"][2]["follows"] = "Home"
    assert profile_for_mode(prog, "Night") == "h" and profile_for_mode(prog, "Home") == "h"
    assert profile_for_mode(prog, "Away") == "a" and profile_for_mode(prog, "Nowhere") == ""
    prog["profiles"][2]["name"] = "Home"  # same name as the source: it cannot be its own source
    prog["profiles"][0]["name"] = "Other"
    prog["profiles"][2]["follows"] = "Other"
    assert profile_for_mode(prog, "Home") == "h"
    # first profile (no selector) that follows
    prog["profiles"][0]["follows"] = "Away"
    assert profile_for_mode(prog, None) == "a"


def test_a_broken_link_is_ignored_by_the_resolution_not_followed_twice():
    prog = {"id": "p", "profiles": _profiles()}
    prog["profiles"][2]["follows"] = "Gone"  # source missing: own (empty) schedules
    assert profile_for_mode(prog, "Night") == "n"
    prog["profiles"][2]["follows"] = "Away"
    prog["profiles"][1]["follows"] = "Home"  # a chain written by hand: one step only, never followed twice
    assert profile_for_mode(prog, "Night") == "n"


@pytest.mark.parametrize(("change", "message"), [
    (lambda p: p[2].update(follows="Night"), "cannot follow itself"),
    (lambda p: p[2].update(follows="Nowhere"), "does not exist"),
    (lambda p: (p[1].update(follows="Home"), p[2].update(follows="Away")), "already follows"),
    (lambda p: (p[1].update(follows="Night"), p[2].update(follows="Away")), "already follows"),
    (lambda p: p[0].update(follows="Away"), "its own schedules"),
])
def test_check_follows_refuses_with_a_clear_message(change, message):
    profiles = _profiles()
    change(profiles)
    with pytest.raises(ValueError, match=message):
        check_follows(profiles)


def test_check_follows_accepts_two_followers_of_one_source():
    profiles = _profiles()
    profiles[1]["follows"] = profiles[2]["follows"] = "Home"
    check_follows(profiles)


def test_set_follow_and_stop_with_a_copy():
    prog = {"id": "p", "revision": 3, "profiles": _profiles()}
    prog["profiles"][0]["days"][0][0]["seed"] = "keepme"
    following = set_follow(prog, "Away", "Home")
    assert following["profiles"][1]["follows"] == "Home" and prog["profiles"][1].get("follows") is None  # input untouched
    new = set_follow(following, "Brand new", "Home")  # no profile yet: created
    assert [p["name"] for p in new["profiles"]][-1] == "Brand new" and new["profiles"][-1]["follows"] == "Home"
    stopped = set_follow(new, "Away", None)
    away = stopped["profiles"][1]
    assert "follows" not in away and away["id"] == "a"
    assert away["days"][0][0]["start"] == {"time": "08:00"} and away["days"][0][0]["seed"] == "keepme"
    assert away["days"][0][0]["id"] != "a" and away["days"][0][0]["id"] != stopped["profiles"][0]["days"][0][0]["id"]
    assert set_follow(prog, "Away", None)["profiles"] == prog["profiles"]  # not following: nothing to do


def test_set_follow_refuses_what_check_follows_refuses():
    prog = {"id": "p", "profiles": _profiles()}
    for mode, target in (("Home", "Home"), ("Away", "Nowhere")):
        with pytest.raises(ValueError):
            set_follow(prog, mode, target)
    chained = set_follow(prog, "Away", "Home")
    with pytest.raises(ValueError, match="already follows"):
        set_follow(chained, "Night", "Away")  # target follows
    with pytest.raises(ValueError, match="already follows"):
        set_follow(chained, "Home", "Night")  # already a source
    assert set_follow(prog, "Home", "Away")["profiles"][0]["follows"] == "Away"  # fine: Away follows nobody


def test_rename_and_detach_keep_followers_consistent():
    progs = [{"id": "p", "revision": 1, "profiles": _profiles()}]
    progs[0]["profiles"][2]["follows"] = "Home"
    renamed, _ = rename_profile(progs, "Home", "Maison")
    assert renamed == ["p"] and progs[0]["profiles"][2]["follows"] == "Maison"
    lost = detach_followers(progs, "Maison")
    assert lost == [{"program_id": "p", "mode": "Night"}] and "follows" not in progs[0]["profiles"][2]
    assert progs[0]["profiles"][2]["days"][0][0]["label"] == "t21"
    assert detach_followers(progs, "Nobody") == []
    assert copy_days(_empty()) == _empty()


def test_check_program_enforces_the_rules_and_drops_a_null_follows():
    prog = _follower()
    assert check_program(prog, {x["id"]: x for x in labels()})["profiles"][2]["follows"] == "Home"
    bad = deepcopy(prog)
    bad["profiles"][2]["days"][0] = [slot("x", "01:00", "02:00")]
    with pytest.raises(vol.Invalid, match="its own schedules"):
        check_program(bad, {x["id"]: x for x in labels()})
    null = deepcopy(prog)
    null["profiles"][2]["follows"] = None
    assert "follows" not in check_program(null, {x["id"]: x for x in labels()})["profiles"][2]


# -- engine -----------------------------------------------------------------------------------------------


async def test_a_follower_applies_the_schedules_of_its_source_and_sees_later_changes(
        hass, hass_storage, freezer, hass_ws_client):
    engine, ws, rec = await _start(hass, hass_storage, freezer, hass_ws_client, [_follower()], state="Night")
    assert engine.active_mode == "Night"
    source = _profile(engine, "Home")
    assert engine.active_profile_id("office") == source["id"]
    # the source changes: the follower, active, applies it at once (a normal edit of the active schedules)
    program = deepcopy(_program(engine))
    for day in _profile_in(program, "Home")["days"]:
        day[0]["label"] = "t19"
    rec.calls.clear()
    msg = await _command(ws, "program/save", program=program)
    assert msg["success"], msg
    await hass.async_block_till_done()
    assert [d["temperature"] for n, d in rec.calls if n == "climate.set_temperature"] == [19]


def _profile_in(program, name):
    return next(p for p in program["profiles"] if p["name"] == name)


async def test_switching_to_a_follower_mode_uses_the_source_schedules(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, rec = await _start(hass, hass_storage, freezer, hass_ws_client, [_follower()], state="Away")
    rec.calls.clear()
    await _options(hass, OPTIONS, "Night")
    assert [d["temperature"] for n, d in rec.calls if n == "climate.set_temperature"] == [21]
    data = await snapshot(ws)
    night = _profile_in(data["programs"][0], "Night")
    assert night["follows"] == "Home" and night["days"] == _empty()  # snapshot exposes the link
    assert data["status"]["office"]["no_schedule_for_mode"] is False


async def test_editing_an_inactive_source_does_not_touch_the_active_mode(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, rec = await _start(hass, hass_storage, freezer, hass_ws_client, [_follower()], state="Away")
    rec.calls.clear()
    program = deepcopy(_program(engine))
    program["profiles"][0]["days"][0][0]["label"] = "t19"  # Home is followed by the inactive Night
    assert (await _command(ws, "program/save", program=program))["success"]
    await hass.async_block_till_done()
    assert rec.calls == []


# -- websocket --------------------------------------------------------------------------------------------


async def test_ws_follow_then_stop_with_a_copy(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, rec = await _start(hass, hass_storage, freezer, hass_ws_client, [moded()], state="Away")
    revision = _program(engine)["revision"]
    msg = await _follow(ws, "Away", "Home")
    assert msg["success"] and msg["result"]["program"]["revision"] == revision + 1
    away = _profile(engine, "Away")
    assert away["follows"] == "Home" and away["days"] == _empty() and away["id"] == "away"
    assert engine.active_profile_id("office") == _profile(engine, "Home")["id"]
    rec.calls.clear()
    msg = await _follow(ws, "Away", None)
    assert msg["success"]
    away = _profile(engine, "Away")
    assert "follows" not in away and away["id"] == "away"
    assert [s["label"] for s in away["days"][0]] == ["t21"]
    home_ids = {s["id"] for d in _profile(engine, "Home")["days"] for s in d}
    assert not home_ids & {s["id"] for d in away["days"] for s in d}  # a copy, not shared slots
    assert engine.active_profile_id("office") == "away"
    assert (await _follow(ws, "Away", None))["success"]  # not following: nothing to do


async def test_ws_follow_creates_the_profile_of_a_mode_without_schedules(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, [moded()])
    assert (await _follow(ws, "Night", "Home"))["success"]
    assert _profile(engine, "Night")["follows"] == "Home"


@pytest.mark.parametrize(("mode", "target", "text"), [
    ("Home", "Home", "cannot follow itself"),
    ("Away", "Nowhere", "does not exist"),
    ("Nowhere", "Home", "not a mode of the selector"),
])
async def test_ws_refuses_self_unknown_target_and_unknown_mode(hass, hass_storage, freezer, hass_ws_client, mode, target, text):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, [moded()])
    msg = await _follow(ws, mode, target)
    assert not msg["success"] and msg["error"]["code"] == "invalid" and text in msg["error"]["message"]
    assert all("follows" not in p for p in _program(engine)["profiles"])


async def test_ws_refuses_chains_and_loops(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, [_follower()])
    # Night follows Home: Home cannot follow Away (it is followed), Away cannot follow Night (it follows)
    msg = await _follow(ws, "Home", "Away")
    assert not msg["success"] and "already follows" in msg["error"]["message"]
    msg = await _follow(ws, "Away", "Night")
    assert not msg["success"] and "already follows" in msg["error"]["message"]
    msg = await _follow(ws, "Home", "Night")  # the loop Home -> Night -> Home
    assert not msg["success"]
    assert _profile(engine, "Home").get("follows") is None and _profile(engine, "Night")["follows"] == "Home"


async def test_ws_follow_unknown_program_no_selector_and_rights(hass, hass_storage, freezer, hass_ws_client, hass_admin_user):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, [moded()])
    msg = await _follow(ws, "Away", "Home", pid="ghost")
    assert not msg["success"] and msg["error"]["code"] == "not_found"
    engine.store.config["mode_selector"] = None
    msg = await _follow(ws, "Away", "Home")
    assert not msg["success"] and "selector" in msg["error"]["message"]


async def test_ws_follow_needs_the_editing_right(hass, hass_storage, freezer, hass_ws_client, hass_read_only_access_token):
    Recorder(hass)
    choose(hass, "Home", ["Home", "Night"])
    engine = await setup(hass, hass_storage, freezer, [moded()], None, config=CONFIG, admin_only=True)
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    msg = await _follow(ws, "Away", "Home")
    assert not msg["success"] and msg["error"]["code"] == "unauthorized"
    assert _profile(engine, "Away").get("follows") is None


async def test_program_save_refuses_follows_next_to_schedules(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, [moded()])
    program = deepcopy(_program(engine))
    program["profiles"][1]["follows"] = "Home"  # Away still has its own schedules
    msg = await _command(ws, "program/save", program=program)
    assert not msg["success"] and msg["error"]["code"] == "invalid" and "its own schedules" in msg["error"]["message"]


# -- the source goes away / is renamed ----------------------------------------------------------------------


def _orphan_source() -> dict:
    """Home, Away and Night: Night follows Away, which the selector (Home, Night) no longer offers."""
    return _follower(source="Away")


async def test_deleting_the_source_leaves_a_copy_and_a_notice(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, [_orphan_source()],
                                    options=["Home", "Night"])
    data = await snapshot(ws)
    assert data["mode"]["orphans"] == ["Away"] and data["mode"]["follow_lost"] == []
    msg = await _resolve(ws, "Away", None)
    assert msg["success"] and msg["result"]["renamed"] == ["office"]
    night = _profile(engine, "Night")
    assert "follows" not in night and [s["label"] for s in night["days"][3]] == ["t19"]  # the last schedules of Away
    assert [p["name"] for p in _program(engine)["profiles"]] == ["Home", "Night"]
    record = (await snapshot(ws))["mode"]["follow_lost"]
    assert len(record) == 1 and (record[0]["source"], record[0]["modes"], record[0]["programs"]) == ("Away", ["Night"], ["office"])
    assert record[0]["at"]


async def test_deleting_a_mode_nobody_follows_leaves_no_notice(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, [moded()], options=["Home", "Night"])
    assert (await _resolve(ws, "Away", None))["success"]
    assert (await snapshot(ws))["mode"]["follow_lost"] == []


async def test_resolving_a_rename_moves_the_links(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, [_orphan_source()],
                                    options=["Home", "Other", "Night"])
    assert (await _resolve(ws, "Away", "Other"))["success"]
    assert _profile(engine, "Night")["follows"] == "Other" and _profile(engine, "Other")["id"] == "away"


async def test_automatic_rename_moves_the_links_and_undo_moves_them_back(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, [_orphan_source()], state="Home")
    await _options(hass, ["Home", "Elsewhere", "Night"], "Home")
    assert _profile(engine, "Night")["follows"] == "Elsewhere"
    msg = await _command(ws, "mode/undo_rename", new="Elsewhere")
    assert msg["success"]
    assert _profile(engine, "Night")["follows"] == "Away" and _profile(engine, "Away")["id"] == "away"
    assert engine.active_profile_id("office") == "base"  # Home active: untouched


async def test_renaming_the_source_while_the_follower_is_active_keeps_the_effective_schedules(
        hass, hass_storage, freezer, hass_ws_client):
    engine, ws, rec = await _start(hass, hass_storage, freezer, hass_ws_client, [_orphan_source()], state="Night")
    assert engine.active_profile_id("office") == "away"
    rec.calls.clear()
    await _options(hass, ["Home", "Elsewhere", "Night"], "Night")
    assert engine.active_profile_id("office") == "away" and not rec.calls


async def test_default_mode_rename_on_selector_change_moves_the_links(hass, hass_storage, freezer, hass_ws_client):
    engine, ws, _rec = await _start(hass, hass_storage, freezer, hass_ws_client, [_follower()])
    # the first profile (Home) is renamed to the default mode by mode/set when it is not an option itself
    choose(hass, "Maison", ["Maison", "Away", "Night"])
    msg = await _command(ws, "mode/set", mode_selector=SELECTOR, default_mode="Maison")
    assert msg["success"], msg
    assert [p["name"] for p in _program(engine)["profiles"]][0] == "Maison"
    assert _profile(engine, "Night")["follows"] == "Maison"


# -- YAML -------------------------------------------------------------------------------------------------


async def test_yaml_export_and_import_are_symmetrical(hass, hass_storage, freezer, yaml_in_tmp):
    hass.states.async_set(SELECTOR, "Base", {"options": ["Base", "Away", "Holiday"]})
    prog = {**_yaml_program()}
    await setup_yaml(hass, hass_storage, freezer, prog)
    doc = _doc(yaml_in_tmp)
    modes = doc["programs"][0]["modes"]
    assert modes["Holiday"] == {"follows": "Base"} and "mon" in modes["Base"]
    # unchanged export is accepted as it is and does not change the revision
    revision = hass.config_entries.async_entries(DOMAIN)[0].runtime_data.store.programs[0]["revision"]
    engine = hass.config_entries.async_entries(DOMAIN)[0].runtime_data
    # a hand edit: Away follows Base too, Holiday keeps following
    _edit(yaml_in_tmp, lambda d: d["programs"][0]["modes"].update(Away={"follows": "Base"}))
    await _later(hass, freezer, 31)
    assert _issue(hass) is None
    assert _profile(engine, "Away", "office")["follows"] == "Base" and _profile(engine, "Away")["days"] == _empty()
    assert _profile(engine, "Holiday")["id"] == "holiday"  # ids are kept by name
    assert engine.store.programs[0]["revision"] == revision + 1
    # and back to schedules of its own
    _edit(yaml_in_tmp, lambda d: d["programs"][0]["modes"].update(Away={"mon": [
        {"id": "x", "start": {"time": "01:00"}, "end": {"time": "02:00"}, "label": "t15"}]}))
    await _later(hass, freezer, 31)
    assert "follows" not in _profile(engine, "Away") and _profile(engine, "Away")["days"][0][0]["id"] == "x"


def _yaml_program() -> dict:
    prog = moded()
    prog["profiles"][0]["name"] = "Base"
    prog["profiles"][1]["name"] = "Away"
    prog["profiles"][1]["days"] = _empty()
    prog["profiles"].append({"id": "holiday", "name": "Holiday", "days": _empty(), "follows": "Base"})
    return prog


async def setup_yaml(hass, hass_storage, freezer, prog):
    Recorder(hass)
    return await setup(hass, hass_storage, freezer, [prog], local(26, 7),
                       config={"mode_selector": SELECTOR, "default_mode": "Base"})


@pytest.mark.parametrize(("mutate", "text"), [
    (lambda m: m.update(Holiday={"follows": "Base", "mon": [
        {"id": "x", "start": {"time": "01:00"}, "end": {"time": "02:00"}, "label": "t15"}]}), "its own schedules"),
    (lambda m: m.update(Holiday={"follows": "Nowhere"}), "does not exist"),
    (lambda m: m.update(Holiday={"follows": "Holiday"}), "itself"),
    (lambda m: m.update(Holiday={"follows": "Away"}, Away={"follows": "Base"}), "already follows"),
    (lambda m: m.update(Base={"follows": "Away"}), "already follows"),
    (lambda m: m.update(Holiday={"follows": 5}), "must be the name of a mode"),
    (lambda m: m.update(Holiday={"follows": "Base", "tuesday": []}), "follows: <mode>"),
])
async def test_yaml_refuses_bad_links_with_a_clear_message(hass, hass_storage, freezer, yaml_in_tmp, mutate, text):
    hass.states.async_set(SELECTOR, "Base", {"options": ["Base", "Away", "Holiday"]})
    engine = await setup_yaml(hass, hass_storage, freezer, _yaml_program())
    before = deepcopy(engine.store.programs)
    _edit(yaml_in_tmp, lambda d: mutate(d["programs"][0]["modes"]))
    await _later(hass, freezer, 31)
    issue = _issue(hass)
    assert issue is not None and text in issue.translation_placeholders["error"]
    assert engine.store.programs == before
