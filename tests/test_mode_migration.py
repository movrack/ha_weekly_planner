"""Migration 2 -> 3: the mode becomes global (docs/adr/0001); the repair issue and the removed selects."""

from __future__ import annotations

from datetime import timedelta

from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.helpers import entity_registry as er, issue_registry as ir

from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.migration import migrate_config_v2

from .helpers import Recorder, labels, local, program, slot, tick



def old_program(pid: str, source: str | None = None, *, modes: tuple[str, ...] = ("Base",), active: str | None = None) -> dict:
    """A program as stored by version 2: several profiles, maybe an active one and a mode source."""
    prog = program(pid)
    prog["name"] = pid.title()
    prog["profiles"] = [{"id": name.lower(), "name": name,
                         "days": [[slot(f"{name}{i}", "08:00", "12:00", "t21")] for i in range(1)] * 7} for name in modes]
    if active:
        prog["active_profile"] = active
    if source:
        prog["mode_source"] = {"entity_id": source, "mappings": {"x": modes[0].lower()}}
    return prog


def v2(*programs: dict) -> dict:
    return {"vacation": False, "labels": [], "programs": list(programs)}


def test_same_source_for_every_program_becomes_the_selector():
    old = v2(old_program("a", "input_select.house", modes=("Base", "Away"), active="away"),
             old_program("b", "input_select.house", modes=("Base", "Away")),
             old_program("c", modes=("Solo",)))
    out = migrate_config_v2(old)
    assert out["mode_selector"] == "input_select.house"
    assert out["default_mode"] == "Away"  # the active profile of the first program
    for prog in out["programs"]:
        assert "mode_source" not in prog and "active_profile" not in prog
    a, b, c = out["programs"]
    assert [p["name"] for p in a["profiles"]] == ["Base", "Away"]  # "Away" exists already: nothing renamed
    assert [p["name"] for p in b["profiles"]] == ["Base", "Away"]
    assert [p["name"] for p in c["profiles"]] == ["Away"]  # its default profile moves under the default option
    assert c["profiles"][0]["id"] == "solo" and c["revision"] == 2
    assert out["mode_migration"] == {"programs": [{"name": "A", "mode_source": "input_select.house"},
                                                   {"name": "B", "mode_source": "input_select.house"}]}
    assert old["programs"][0]["mode_source"]  # the input is untouched


def test_different_sources_leave_the_selector_empty():
    out = migrate_config_v2(v2(old_program("a", "input_select.one"), old_program("b", "sensor.two", modes=("Base", "Eco"))))
    assert out["mode_selector"] is None and out["default_mode"] is None
    assert [p["name"] for p in out["programs"][0]["profiles"]] == ["Base"]  # no selector: nothing renamed
    assert out["mode_migration"]["programs"] == [{"name": "A", "mode_source": "input_select.one"},
                                                  {"name": "B", "mode_source": "sensor.two"}]


def test_no_mode_source_only_names_programs_with_several_modes():
    out = migrate_config_v2(v2(old_program("a"), old_program("b", modes=("Base", "Eco"), active="eco")))
    assert out["mode_selector"] is None and out["default_mode"] is None
    assert out["mode_migration"] == {"programs": [{"name": "B", "mode_source": None}]}
    assert [p["name"] for p in out["programs"][1]["profiles"]] == ["Base", "Eco"]  # kept, matched later by name
    assert "active_profile" not in out["programs"][1]


def test_nothing_to_report_without_mode_sources_or_extra_modes():
    out = migrate_config_v2(v2(old_program("a"), old_program("b")))
    assert "mode_migration" not in out and out["mode_selector"] is None


def test_default_mode_falls_back_to_the_first_profile_name_and_is_kept_when_set():
    out = migrate_config_v2(v2(old_program("a", "input_select.house", modes=("Home", "Away"), active="ghost")))
    assert out["default_mode"] == "Home"
    already = {**v2(old_program("a", "input_select.house", modes=("Home", "Away"), active="away")),
               "default_mode": "Home"}
    assert migrate_config_v2(already)["default_mode"] == "Home"
    assert migrate_config_v2(v2()) == {"vacation": False, "labels": [], "programs": [],
                                      "mode_selector": None, "default_mode": None}


async def _setup_v2(hass, hass_storage, freezer, programs):
    await hass.config.async_update(time_zone="Europe/Brussels")
    freezer.move_to(local(26, 9))
    hass_storage[DOMAIN] = {"version": 2, "minor_version": 1, "key": DOMAIN,
                            "data": {"vacation": False, "labels": labels(), "programs": programs}}
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    registry = er.async_get(hass)
    stale = [registry.async_get_or_create("select", DOMAIN, f"{entry.entry_id}_profile_{p['id']}", config_entry=entry,
                                          suggested_object_id=f"{p['id']}_mode") for p in programs]
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=31))
    return entry, stale


async def test_one_repair_issue_names_the_programs_and_the_selects_are_removed(hass, hass_storage, freezer):
    Recorder(hass)
    hass.states.async_set("input_select.house", "Away", {"options": ["Base", "Away"]})
    programs = [old_program("salon", "input_select.house", modes=("Base", "Away"), active="away"),
                old_program("chambre", "input_select.house", modes=("Base", "Away")),
                old_program("cave", modes=("Only",)),
                old_program("bureau", modes=("Base", "Eco"))]
    entry, stale = await _setup_v2(hass, hass_storage, freezer, programs)
    engine = entry.runtime_data
    assert hass_storage[DOMAIN]["version"] == 3
    assert engine.store.config["mode_selector"] == "input_select.house" and engine.store.config["default_mode"] == "Away"
    assert "mode_migration" not in engine.store.config  # handled once
    issues = [i for i in ir.async_get(hass).issues.values() if i.domain == DOMAIN]
    assert [i.issue_id for i in issues] == ["modes_now_global"]
    issue = issues[0]
    assert issue.translation_key == "modes_now_global" and issue.is_fixable is False
    names = issue.translation_placeholders["programs"]
    assert names == "Salon (input_select.house); Chambre (input_select.house); Bureau"  # not the single-mode "Cave"
    registry = er.async_get(hass)
    assert all(registry.async_get(entity.entity_id) is None for entity in stale)
    assert not hass.states.async_entity_ids("select")
    assert engine.active_mode == "Away"


async def test_different_entities_leave_no_selector_and_name_each_entity_in_the_issue(hass, hass_storage, freezer):
    Recorder(hass)
    entry, _stale = await _setup_v2(hass, hass_storage, freezer, [
        old_program("a", "input_select.one"), old_program("b", "sensor.two", modes=("Base", "Eco"))])
    assert entry.runtime_data.store.config["mode_selector"] is None
    issue = ir.async_get(hass).async_get_issue(DOMAIN, "modes_now_global")
    assert issue.translation_placeholders["programs"] == "A (input_select.one); B (sensor.two)"


async def test_no_issue_when_nothing_changes_for_the_user(hass, hass_storage, freezer):
    Recorder(hass)
    entry, stale = await _setup_v2(hass, hass_storage, freezer, [old_program("a"), old_program("b")])
    assert ir.async_get(hass).async_get_issue(DOMAIN, "modes_now_global") is None
    assert er.async_get(hass).async_get(stale[0].entity_id) is None  # the select is removed all the same
    assert entry.runtime_data.active_mode is None


def test_runtime_active_profile_wins_over_the_config_one():
    old = v2(old_program("a", "input_select.house", modes=("Base", "Away", "Eco"), active="away"))
    assert migrate_config_v2(old, {"a": "eco"})["default_mode"] == "Eco"
    assert migrate_config_v2(old, {"other": "eco"})["default_mode"] == "Away"  # no runtime entry: config


async def test_real_stored_v2_uses_the_runtime_active_profile(hass, hass_storage, freezer):
    Recorder(hass)
    hass.states.async_set("input_select.house", "Eco", {"options": ["Base", "Away", "Eco"]})
    hass_storage[f"{DOMAIN}.runtime"] = {"version": 2, "minor_version": 1, "key": f"{DOMAIN}.runtime",
                                         "data": {"entities": {}, "programs": {"salon": {"active_profile": "eco"}}}}
    prog = old_program("salon", "input_select.house", modes=("Base", "Away", "Eco"), active="away")
    entry, _stale = await _setup_v2(hass, hass_storage, freezer, [prog])
    config = entry.runtime_data.store.config
    assert config["default_mode"] == "Eco" and config["mode_selector"] == "input_select.house"
    assert "active_profile" not in config["programs"][0]
    assert "active_profile" not in entry.runtime_data.store.runtime["programs"].get("salon", {})
