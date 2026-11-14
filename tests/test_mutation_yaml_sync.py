"""Mutation-testing survivors of yaml_file.YamlSync: partial files, exact reasons, logs, revisions."""

from __future__ import annotations

import logging

import pytest
from homeassistant.helpers import issue_registry as ir

from custom_components.weekly_planner import yaml_file

from .helpers import CLIMATE, COVER, Recorder, local, program, setup, slot
from .test_yaml_file import _doc, _edit, _issue, _later, _start

DAY_OFF = "input_boolean.day_off"


async def _started(hass, hass_storage, freezer, programs=None, config=None):
    Recorder(hass)
    return await setup(hass, hass_storage, freezer, programs if programs is not None else [program()], local(26, 7),
                       config=config)


def _sync(engine):
    return engine.store.on_config_saved.__self__


def _error(hass):
    issue = _issue(hass)
    return None if issue is None else issue.translation_placeholders["error"]


async def test_a_file_with_only_one_of_the_day_off_keys_keeps_the_other_from_the_store(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _started(hass, hass_storage, freezer, config={"holiday_entity": DAY_OFF, "holiday_invert": True})
    _edit(yaml_in_tmp, lambda d: (d.pop("holiday_invert", None), d.update(holiday_entity="switch.other")))
    await _later(hass, freezer, 31)
    assert (engine.store.config["holiday_entity"], engine.store.config["holiday_invert"]) == ("switch.other", True)
    _edit(yaml_in_tmp, lambda d: (d.pop("holiday_entity", None), d.update(holiday_invert=False)))
    await _later(hass, freezer, 31)
    assert (engine.store.config["holiday_entity"], engine.store.config["holiday_invert"]) == ("switch.other", False)
    _edit(yaml_in_tmp, lambda d: (d.pop("holiday_entity", None), d.pop("holiday_invert", None), d.update(vacation=True)))
    await _later(hass, freezer, 31)
    assert (engine.store.config["holiday_entity"], engine.store.config["holiday_invert"]) == ("switch.other", False)
    assert _issue(hass) is None


async def test_a_file_without_a_stored_invert_reads_it_as_false(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _started(hass, hass_storage, freezer, config={"holiday_entity": DAY_OFF})
    _edit(yaml_in_tmp, lambda d: (d.pop("holiday_invert", None), d.update(holiday_entity="switch.other")))
    await _later(hass, freezer, 31)
    assert engine.store.config["holiday_invert"] is False and engine.store.config["holiday_entity"] == "switch.other"


async def test_a_file_with_only_one_of_the_mode_keys_changes_only_what_it_names(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _started(hass, hass_storage, freezer)
    _edit(yaml_in_tmp, lambda d: (d.pop("mode_selector"), d.update(default_mode="Home")))
    await _later(hass, freezer, 31)
    assert (engine.store.config["mode_selector"], engine.store.config["default_mode"]) == (None, "Home")
    _edit(yaml_in_tmp, lambda d: (d.pop("default_mode"), d.update(mode_selector="input_select.mode")))
    await _later(hass, freezer, 31)
    assert (engine.store.config["mode_selector"], engine.store.config["default_mode"]) == ("input_select.mode", None)
    _edit(yaml_in_tmp, lambda d: (d.pop("default_mode", None), d.pop("mode_selector", None), d.update(vacation=True)))
    await _later(hass, freezer, 31)
    assert (engine.store.config["mode_selector"], engine.store.config["default_mode"]) == ("input_select.mode", None)


async def test_changing_the_selector_forgets_what_was_remembered_for_the_former_one(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _started(hass, hass_storage, freezer)
    _edit(yaml_in_tmp, lambda d: d.update(mode_selector="input_select.one", default_mode="A"))
    await _later(hass, freezer, 31)
    for key in ("last_mode", "mode_options_seen", "mode_renames", "mode_follow_lost"):
        engine.store.runtime[key] = "remembered"
    _edit(yaml_in_tmp, lambda d: d.update(mode_selector="input_select.one", default_mode="B"))  # same selector
    await _later(hass, freezer, 31)
    assert all(engine.store.runtime.get(key) == "remembered" for key in ("last_mode", "mode_options_seen", "mode_renames", "mode_follow_lost"))
    _edit(yaml_in_tmp, lambda d: d.update(mode_selector="input_select.two", default_mode="B"))  # another selector
    await _later(hass, freezer, 31)
    assert not any(key in engine.store.runtime for key in ("last_mode", "mode_options_seen", "mode_renames", "mode_follow_lost"))


async def test_a_file_without_vacation_means_vacation_off(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _started(hass, hass_storage, freezer)
    _edit(yaml_in_tmp, lambda d: d.update(vacation=True))
    await _later(hass, freezer, 31)
    assert engine.store.config["vacation"] is True
    _edit(yaml_in_tmp, lambda d: d.pop("vacation"))
    await _later(hass, freezer, 31)
    assert engine.store.config["vacation"] is False


@pytest.mark.parametrize(("breaker", "error"), [
    (lambda d: d["labels"].append({"name": "no id"}), "every label needs an id"),
    (lambda d: d["labels"].append("text"), "every label needs an id"),
    (lambda d: d["labels"].append(dict(d["labels"][0])), f"duplicate label id {'t21'}"),
    (lambda d: d["programs"].append("text"), "every program must be a mapping"),
    (lambda d: d["programs"].append(dict(d["programs"][0])), "duplicate program id office"),
])
async def test_a_refused_file_says_why_in_the_log_and_in_the_repair_issue(hass, hass_storage, freezer, yaml_in_tmp, caplog, breaker, error):
    await _start(hass, hass_storage, freezer)
    caplog.set_level(logging.ERROR)
    _edit(yaml_in_tmp, breaker)
    await _later(hass, freezer, 31)
    issue = _issue(hass)
    assert issue.translation_placeholders == {"error": error} and issue.translation_key == yaml_file.ISSUE
    assert issue.is_fixable is False and issue.severity is ir.IssueSeverity.ERROR
    assert f"Weekly Planner ignored {yaml_in_tmp}, nothing was changed: {error}" in caplog.text


async def test_a_long_reason_is_cut_to_500_characters_and_a_refused_file_is_reported_once(hass, hass_storage, freezer, yaml_in_tmp, caplog):
    await _start(hass, hass_storage, freezer)
    caplog.set_level(logging.ERROR)
    long_id = "x" * 600

    def mutate(doc):
        doc["programs"][0]["id"] = long_id
        doc["programs"].append(dict(doc["programs"][0]))

    _edit(yaml_in_tmp, mutate)
    await _later(hass, freezer, 31)
    assert len(_error(hass)) == 500
    await _later(hass, freezer, 31)
    assert caplog.text.count("Weekly Planner ignored") == 1


async def test_an_imported_file_is_logged_and_clears_the_issue(hass, hass_storage, freezer, yaml_in_tmp, caplog):
    await _start(hass, hass_storage, freezer)
    _edit(yaml_in_tmp, lambda d: d.update(vacation="maybe"))
    await _later(hass, freezer, 31)
    assert _issue(hass) is not None
    caplog.set_level(logging.INFO)
    _edit(yaml_in_tmp, lambda d: d.update(vacation=False))
    await _later(hass, freezer, 31)
    assert _issue(hass) is None
    assert f"Weekly Planner imported {yaml_in_tmp}" in caplog.text
    # the same bad file after a good one is reported again
    _edit(yaml_in_tmp, lambda d: d.update(vacation="maybe"))
    await _later(hass, freezer, 31)
    assert _issue(hass) is not None


async def test_a_failed_write_is_logged_with_the_path_and_the_reason(hass, hass_storage, freezer, yaml_in_tmp, caplog, monkeypatch):
    engine = await _start(hass, hass_storage, freezer)
    sync = _sync(engine)
    seen = []

    def boom(path, data, known):
        seen.append((path, known))
        raise OSError("disk full")

    monkeypatch.setattr(yaml_file, "_write_atomic", boom)
    caplog.set_level(logging.WARNING)
    engine.store.programs[0]["name"] = "Renamed"
    await sync._async_write()
    assert f"Weekly Planner could not write {yaml_in_tmp}: disk full" in caplog.text
    assert seen == [(yaml_in_tmp, engine.store.runtime["yaml_hash"])]


async def test_stopping_flushes_a_pending_write_and_nothing_is_scheduled_afterwards(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
    sync = _sync(engine)
    engine.store.programs[0]["name"] = "Pending"
    engine.store.save_config()
    assert sync._timer is not None
    await sync.async_stop()
    assert _doc(yaml_in_tmp)["programs"][0]["name"] == "Pending" and sync._timer is None and sync._unsub_interval is None
    engine.store.save_config()
    assert sync._timer is None  # stopped: no more writes


async def test_the_import_flag_blocks_the_echo_write_only_during_the_import(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
    sync = _sync(engine)
    assert sync._importing is False and sync._stopped is False and sync._live is True
    flags = []
    original = sync._async_apply

    async def spy(*args, **kwargs):
        flags.append(sync._importing)
        sync.schedule_write()
        flags.append(sync._timer)
        return await original(*args, **kwargs)

    sync._async_apply = spy
    _edit(yaml_in_tmp, lambda d: d["programs"][0].update(name="By hand"))
    await _later(hass, freezer, 31)
    assert flags == [True, None] and sync._importing is False


async def test_before_going_live_nothing_is_re_evaluated_and_removed_programs_are_disabled_once_live(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer, [program(), program("second")])
    calls = []
    original = engine.async_set_enabled

    async def spy(pid, enabled):
        calls.append((pid, enabled))
        return await original(pid, enabled)

    engine.async_set_enabled = spy
    _edit(yaml_in_tmp, lambda d: d["programs"].pop(1))
    await _later(hass, freezer, 31)
    assert calls == [("second", False)]


async def test_a_vacation_only_edit_leaves_the_revision_and_a_program_edit_bumps_it(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
    _edit(yaml_in_tmp, lambda d: d.update(vacation=True))  # the first import also normalises the stored program
    await _later(hass, freezer, 31)
    settled = engine.store.programs[0]["revision"]
    _edit(yaml_in_tmp, lambda d: d.update(vacation=False))
    await _later(hass, freezer, 31)
    assert engine.store.programs[0]["revision"] == settled
    _edit(yaml_in_tmp, lambda d: d["programs"][0].update(name="Edited"))
    await _later(hass, freezer, 31)
    assert engine.store.programs[0]["revision"] == settled + 1


async def test_a_program_added_by_hand_gets_revision_1_an_id_and_a_creation_date_and_an_existing_one_keeps_its_date(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
    created = engine.store.programs[0]["created_at"]

    def mutate(doc):
        doc["programs"][0].pop("created_at")
        new = dict(doc["programs"][0])
        new.pop("id"); new.pop("revision")
        new["name"] = "second"
        doc["programs"].append(new)

    _edit(yaml_in_tmp, mutate)
    await _later(hass, freezer, 31)
    first, second = engine.store.programs
    assert first["created_at"] == created
    assert second["revision"] == 1 and second["id"] and second["created_at"]


async def test_a_program_that_never_had_a_creation_date_is_not_given_one_on_a_later_edit(hass, hass_storage, freezer, yaml_in_tmp):
    old = program()
    del old["created_at"]
    engine = await _started(hass, hass_storage, freezer, [old])
    _edit(yaml_in_tmp, lambda d: d["programs"][0].update(name="Edited"))
    await _later(hass, freezer, 31)
    assert "created_at" not in engine.store.programs[0] and engine.store.programs[0]["name"] == "Edited"


async def test_a_hand_edit_resumes_a_paused_program_when_the_file_says_it_is_enabled(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
    engine.store.programs[0].update(enabled=False, paused_until="2099-01-01T00:00:00+00:00")
    engine.store.save_config()
    await _later(hass, freezer, 3)

    def mutate(doc):
        doc["programs"][0]["enabled"] = True
        doc["programs"][0].pop("paused_until", None)

    _edit(yaml_in_tmp, mutate)
    await _later(hass, freezer, 31)
    assert engine.store.programs[0]["enabled"] is True and "paused_until" not in engine.store.programs[0]


async def test_a_device_removed_in_the_file_leaves_every_slot_list(hass, hass_storage, freezer, yaml_in_tmp):
    entities = [{"entity_id": CLIMATE, "default_label": "t15", "label_overrides": {}},
                {"entity_id": COVER, "default_label": None, "label_overrides": {}}]
    shared = {**slot("s1", "08:00", "12:00", "t21"), "entities": [CLIMATE, COVER]}
    engine = await _started(hass, hass_storage, freezer, [program(entities=entities, slots=[shared])])
    _edit(yaml_in_tmp, lambda d: d["programs"][0]["entities"].pop(1))
    await _later(hass, freezer, 31)
    stored = engine.store.programs[0]
    assert [e["entity_id"] for e in stored["entities"]] == [CLIMATE]
    assert all(COVER not in (s.get("entities") or []) for day in stored["profiles"][0]["days"] for s in day)
    assert _issue(hass) is None


async def test_a_file_with_a_holiday_off_the_driven_entities_is_refused_with_the_reason(hass, hass_storage, freezer, yaml_in_tmp):
    await _start(hass, hass_storage, freezer)
    _edit(yaml_in_tmp, lambda d: d.update(holiday_entity=CLIMATE.replace("climate", "switch")))
    await _later(hass, freezer, 31)
    assert _issue(hass) is None  # not a driven entity: accepted
    _edit(yaml_in_tmp, lambda d: d["programs"][0]["entities"][0].update(entity_id="switch.office"))
    await _later(hass, freezer, 31)
    assert _error(hass) == "driven_holiday_entity"
