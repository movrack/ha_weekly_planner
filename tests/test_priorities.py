"""Competition groups and ranks (issue #60): pure logic, storage migration and the WebSocket commands."""

import pytest

from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.priorities import (
    apply_order,
    components,
    renumber_all,
    settle_saved,
    write_ranks,
)

from .helpers import CLIMATE, COVER, Recorder, act, label, labels, program, setup, slot


def prog(pid: str, devices: list[str], priority: int = 1, created: str = "2026-01-01") -> dict:
    return {"id": pid, "priority": priority, "created_at": created, "revision": 1,
            "entities": [{"entity_id": d} for d in devices]}


def ids(group: list[dict]) -> list[str]:
    return [p["id"] for p in group]


def test_programs_sharing_a_device_compete_transitively_and_the_others_do_not():
    programs = [prog("a", ["x"], 2), prog("b", ["x", "y"], 1), prog("c", ["y"], 3), prog("d", ["z"]), prog("e", ["w"])]
    groups = components(programs)
    assert [ids(g) for g in groups] == [["b", "a", "c"], ["d"], ["e"]]  # rank order, d and e compete with nobody


def test_ties_go_to_the_oldest_program():
    programs = [prog("new", ["x"], 1, "2026-02-01"), prog("old", ["x"], 1, "2026-01-01")]
    assert ids(components(programs)[0]) == ["old", "new"]


def test_migration_renumbers_each_group_keeping_its_order():
    programs = [prog("a", ["x"], 50), prog("b", ["x"], 10), prog("c", ["y"], 10), prog("d", ["y"], 7, "2026-03-01"),
                prog("e", ["z"], 80)]
    renumber_all(programs)
    assert {p["id"]: p["priority"] for p in programs} == {"a": 2, "b": 1, "c": 2, "d": 1, "e": 1}


@pytest.mark.parametrize(("others", "saved", "before", "order", "renumber"), [
    # no competition
    ([prog("a", ["x"])], prog("s", ["y"]), set(), [], False),
    # a new program competing with one group goes last
    ([prog("a", ["x"], 1), prog("b", ["x"], 2)], prog("s", ["x"], 1), set(), ["a", "b", "s"], True),
    # an existing program keeping its competition keeps its rank
    ([prog("a", ["x"], 1), prog("b", ["x"], 3)], prog("s", ["x"], 2), {"x"}, ["a", "s", "b"], False),
    # a device added that joins another group: it goes last of it
    ([prog("a", ["x"], 1), prog("b", ["y"], 1), prog("c", ["y"], 2)], prog("s", ["x", "y"], 1), {"x"},
     ["a", "b", "c", "s"], True),
])
def test_a_saved_program_is_placed_in_its_group(others, saved, before, order, renumber):
    group, rewrite = settle_saved([*others, saved], saved, before)
    assert (ids(group), rewrite) == (order, renumber)


def test_a_program_merging_two_groups_interleaves_them_by_rank_and_goes_last():
    others = [prog("a1", ["x"], 1, "2026-01-02"), prog("a2", ["x"], 2), prog("b1", ["y"], 1, "2026-01-01"),
              prog("b2", ["y"], 5), prog("b3", ["y"], 9)]
    merging = prog("s", ["x", "y"], 1)
    group, rewrite = settle_saved([*others, merging], merging, set())
    assert ids(group) == ["b1", "a1", "a2", "b2", "b3", "s"]  # firsts (oldest first), seconds, thirds
    assert rewrite is True


def test_order_chosen_by_the_user_replaces_the_default_and_unknown_ids_are_ignored():
    group = [prog("a", ["x"]), prog("b", ["x"]), prog("s", ["x"])]
    assert ids(apply_order(group, ["new", "gone", "a", "b"], "s")) == ["s", "a", "b"]
    assert ids(apply_order(group, ["b"], "s")) == ["b", "a", "s"]  # members not listed follow


def test_ranks_are_rewritten_with_a_new_revision_only_where_they_change():
    programs = [prog("a", ["x"], 1), prog("b", ["x"], 3), prog("s", ["x"], 2)]
    changed = write_ranks(programs, [programs[2], programs[0], programs[1]], same_revision="s")
    assert {p["id"]: (p["priority"], p["revision"]) for p in programs} == {"a": (2, 2), "b": (3, 1), "s": (1, 1)}
    assert ids(changed) == ["s", "a"]


# -- storage -----------------------------------------------------------------------


async def test_older_storage_gets_ranks_without_changing_the_order(hass, hass_storage, freezer):
    Recorder(hass)
    hass_storage[DOMAIN] = {"version": 3, "minor_version": 2, "key": DOMAIN, "data": {
        "vacation": False, "labels": [], "programs": [program("late", priority=60), program("early", priority=5)]}}
    from homeassistant.config_entries import ConfigEntryState
    from pytest_homeassistant_custom_component.common import MockConfigEntry
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    assert entry.state is ConfigEntryState.LOADED
    assert {p["id"]: p["priority"] for p in entry.runtime_data.store.programs} == {"early": 1, "late": 2}
    assert hass_storage[DOMAIN]["minor_version"] == 3


# -- WebSocket ---------------------------------------------------------------------


def two_programs() -> list[dict]:
    return [program("a", priority=1), program("b", priority=2), program("c", priority=3)]


async def priorities(ws, order):
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/priorities", "order": order})
    return await ws.receive_json()


async def test_priorities_set_ranks_in_one_go_and_the_winner_changes(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, two_programs(), None)
    ws = await hass_ws_client(hass)
    reply = await priorities(ws, [{"id": "c", "revision": 1}, {"id": "a", "revision": 1}, {"id": "b", "revision": 1}])
    assert reply["success"]
    assert {p["id"]: (p["priority"], p["revision"]) for p in engine.store.programs} == {
        "c": (1, 2), "a": (2, 2), "b": (3, 2)}
    assert {p["id"] for p in reply["result"]["programs"]} == {"a", "b", "c"}
    assert engine.segment(CLIMATE).program_id == "c"


async def test_priorities_keep_everything_when_one_revision_is_stale(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, two_programs(), None)
    ws = await hass_ws_client(hass)
    reply = await priorities(ws, [{"id": "c", "revision": 1}, {"id": "a", "revision": 7}, {"id": "b", "revision": 1}])
    assert reply["error"]["code"] == "conflict"
    assert [(p["id"], p["priority"], p["revision"]) for p in engine.store.programs] == [
        ("a", 1, 1), ("b", 2, 1), ("c", 3, 1)]


@pytest.mark.parametrize(("order", "code"), [
    ([{"id": "a", "revision": 1}, {"id": "ghost", "revision": 1}], "not_found"),
    ([{"id": "a", "revision": 1}, {"id": "a", "revision": 1}], "invalid"),
])
async def test_priorities_refuse_unknown_and_repeated_programs(hass, hass_storage, freezer, hass_ws_client, order, code):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, two_programs(), None)
    assert (await priorities(await hass_ws_client(hass), order))["error"]["code"] == code


async def test_priorities_follow_the_editing_right(hass, hass_storage, freezer, hass_ws_client, hass_read_only_access_token):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, two_programs(), None, admin_only=True)
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    reply = await priorities(ws, [{"id": "b", "revision": 1}, {"id": "a", "revision": 1}])
    assert reply["error"]["code"] == "unauthorized"
    assert engine.store.program("a")["priority"] == 1


async def test_priorities_of_a_sensitive_program_need_an_administrator(hass, hass_storage, freezer, hass_ws_client,
                                                                       hass_read_only_access_token):
    Recorder(hass)
    hass.services.async_register("lock", "unlock", lambda call: None)
    sensitive = program("b", [slot("u", "08:00", None, "unlock")], priority=2)
    engine = await setup(hass, hass_storage, freezer, [program("a", priority=1), sensitive], None,
                         extra_labels=[*labels(), label("unlock", act("lock.unlock"))])
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    reply = await priorities(ws, [{"id": "b", "revision": 1}, {"id": "a", "revision": 1}])
    assert reply["error"]["code"] == "unauthorized"
    assert engine.store.program("a")["priority"] == 1


async def save(ws, prog, **extra):
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": prog, **extra})
    return await ws.receive_json()


async def test_a_new_program_sharing_a_device_goes_last_and_the_group_is_renumbered(hass, hass_storage, freezer,
                                                                                    hass_ws_client):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program("a", priority=1), program("b", priority=4)], None)
    ws = await hass_ws_client(hass)
    new = {**program("x", priority=10), "id": "", "revision": 0}
    new.pop("created_at")
    reply = await save(ws, new)
    assert reply["success"]
    assert {p["name"]: p["priority"] for p in engine.store.programs} == {"a": 1, "b": 2, "x": 3}


async def test_the_order_sent_with_a_save_applies_atomically_with_the_new_program(hass, hass_storage, freezer,
                                                                                  hass_ws_client):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program("a", priority=1), program("b", priority=2)], None)
    ws = await hass_ws_client(hass)
    new = {**program("x"), "id": "", "revision": 0}
    reply = await save(ws, new, group_order=["b", "new", "a"])
    assert reply["success"]
    assert {p["name"]: p["priority"] for p in engine.store.programs} == {"b": 1, "x": 2, "a": 3}


async def test_a_program_alone_keeps_its_priority_and_deleting_keeps_the_gaps(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, two_programs(), None)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/delete", "program_id": "b"})
    assert (await ws.receive_json())["success"]
    assert [p["priority"] for p in engine.store.programs] == [1, 3]
    lone = {**program("lone", entities=[{"entity_id": COVER, "default_label": None, "label_overrides": {}}],
                      priority=42), "id": "", "revision": 0}
    assert (await save(ws, lone))["result"]["program"]["priority"] == 42
