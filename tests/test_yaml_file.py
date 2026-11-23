"""YAML mirror of the configuration (spec § 37.3)."""

from __future__ import annotations

import json
import logging
from datetime import timedelta
from pathlib import Path
from types import SimpleNamespace

import pytest
import yaml
from homeassistant.helpers import issue_registry as ir

from custom_components.weekly_planner import yaml_file
from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.store import ConfigStoreError
from custom_components.weekly_planner.yaml_file import (
    DAYS,
    _mode_to_file,
    _parse,
    _write_atomic,
    holiday_from_file,
    holiday_to_file,
    program_from_file,
    program_to_file,
    render,
    yaml_path,
)

from .helpers import CLIMATE, COVER, Recorder, local, program, setup, slot, tick


def _issue(hass):
    return ir.async_get(hass).async_get_issue(DOMAIN, yaml_file.ISSUE)


def _load(path):
    return yaml.safe_load(path.read_text())


def _doc(path):
    return _load(path)


async def _start(hass, hass_storage, freezer, programs=None, config=None):
    Recorder(hass)
    return await setup(hass, hass_storage, freezer, programs if programs is not None else [program()],
                       local(26, 7), config=config)


async def _later(hass, freezer, seconds):
    await tick(hass, freezer, timedelta(seconds=seconds))
    await hass.async_block_till_done(wait_background_tasks=True)


def _edit(path, mutate):
    doc = _doc(path)
    mutate(doc)
    path.write_text(yaml.safe_dump(doc, sort_keys=False))


async def test_file_created_at_start(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
    text = yaml_in_tmp.read_text()
    assert text.startswith("# Weekly Planner configuration")
    assert "/local/weekly_planner.yml" in text and "WITHOUT authentication" in text
    doc = _doc(yaml_in_tmp)
    assert list(doc) == ["version", "vacation", "mode_selector", "default_mode", "holiday_entity", "holiday_invert",
                         "labels", "programs"]
    assert doc["version"] == 1 and doc["programs"][0]["id"] == "office"
    assert "runtime" not in text and "entities" in doc["programs"][0]
    assert engine.store.runtime["yaml_hash"] == yaml_file.digest(yaml_in_tmp.read_bytes())
    assert "&id" not in text  # shared objects never become YAML anchors
    assert not list(yaml_in_tmp.parent.glob("*.tmp"))


async def test_ui_save_exports_debounced(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
    before = yaml_in_tmp.read_bytes()
    engine.store.programs[0]["name"] = "Renamed"
    engine.store.save_config()
    engine.store.save_config()  # debounced: one write
    await _later(hass, freezer, 1)
    assert yaml_in_tmp.read_bytes() == before
    await _later(hass, freezer, 2)
    assert _doc(yaml_in_tmp)["programs"][0]["name"] == "Renamed"
    assert engine.store.runtime["yaml_hash"] == yaml_file.digest(yaml_in_tmp.read_bytes())


async def test_unmodified_config_is_not_rewritten(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
    stat = yaml_in_tmp.stat().st_mtime_ns
    engine.store.save_config()
    await _later(hass, freezer, 3)
    assert yaml_in_tmp.stat().st_mtime_ns == stat


async def test_deleted_file_is_recreated(hass, hass_storage, freezer, yaml_in_tmp):
    await _start(hass, hass_storage, freezer)
    yaml_in_tmp.unlink()
    await _later(hass, freezer, 31)
    assert yaml_in_tmp.exists()


async def test_hand_edit_is_imported_without_rewrite(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
    _edit(yaml_in_tmp, lambda d: d["programs"][0].update(name="By hand"))
    hand = yaml_in_tmp.read_bytes()
    await _later(hass, freezer, 31)
    await _later(hass, freezer, 5)
    assert engine.store.programs[0]["name"] == "By hand"
    assert engine.store.programs[0]["revision"] == 2
    assert yaml_in_tmp.read_bytes() == hand  # no write loop
    assert engine.store.runtime["yaml_hash"] == yaml_file.digest(hand)
    assert _issue(hass) is None
    # unchanged afterwards: no further import
    await _later(hass, freezer, 31)
    assert engine.store.programs[0]["revision"] == 2


async def test_hand_edit_adds_and_removes_programs_and_labels(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)

    def mutate(doc):
        new = json.loads(json.dumps(doc["programs"][0]))
        new.pop("id"); new.pop("created_at"); new.pop("revision")
        new["name"] = "second"
        doc["programs"].append(new)
        doc["labels"].append({**doc["labels"][0], "id": "extra", "name": "Extra"})
        doc["vacation"] = True

    _edit(yaml_in_tmp, mutate)
    await _later(hass, freezer, 31)
    assert len(engine.store.programs) == 2 and engine.store.programs[1]["revision"] == 1
    assert engine.store.programs[1]["id"] and engine.store.programs[1]["created_at"]
    assert any(x["id"] == "extra" for x in engine.store.config["labels"])
    assert engine.store.config["vacation"] is True
    _edit(yaml_in_tmp, lambda d: d["programs"].pop(0))
    await _later(hass, freezer, 31)
    assert [p["name"] for p in engine.store.programs] == ["second"]
    assert "office" not in engine.store.runtime["programs"]


@pytest.mark.parametrize("breaker", [
    lambda d: d["programs"][0]["modes"]["Base"]["mon"][0].update(label="nope"),
    lambda d: d["programs"][0].update(priority="high"),
    lambda d: d["programs"].append(d["programs"][0]),
    lambda d: d["labels"].append(d["labels"][0]),
    lambda d: d["labels"].append({"name": "no id"}),
    lambda d: d["labels"].append("text"),
    lambda d: d["programs"].append("text"),
    lambda d: d.update(version=9),
    lambda d: d.update(programs={}),
    lambda d: d.update(vacation="maybe"),
])
async def test_invalid_file_changes_nothing_then_recovers(hass, hass_storage, freezer, yaml_in_tmp, breaker):
    engine = await _start(hass, hass_storage, freezer)
    good = yaml_in_tmp.read_text()
    before = json.dumps(engine.store.config)
    _edit(yaml_in_tmp, breaker)
    bad = yaml_in_tmp.read_text()
    await _later(hass, freezer, 31)
    assert json.dumps(engine.store.config) == before
    assert yaml_in_tmp.read_text() == bad  # never overwritten
    assert _issue(hass) is not None and _issue(hass).translation_placeholders["error"]
    await _later(hass, freezer, 31)  # reported once, still there
    assert _issue(hass) is not None
    yaml_in_tmp.write_text(good.replace("name: office", "name: fixed", 1))
    await _later(hass, freezer, 31)
    assert _issue(hass) is None
    assert engine.store.programs[0]["name"] == "fixed"


@pytest.mark.parametrize("content", ["", "just text", "- a\n- b\n", "a: [1, 2\n", "key: value\n"])
async def test_empty_or_broken_file_is_rejected(hass, hass_storage, freezer, yaml_in_tmp, content):
    engine = await _start(hass, hass_storage, freezer)
    yaml_in_tmp.write_text(content)
    await _later(hass, freezer, 31)
    assert len(engine.store.programs) == 1
    assert _issue(hass) is not None


async def test_invalid_file_is_backed_up_by_ui_save(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
    yaml_in_tmp.write_text("broken: [\n")
    await _later(hass, freezer, 31)
    assert _issue(hass) is not None
    engine.store.programs[0]["name"] = "UI"
    engine.store.save_config()
    await _later(hass, freezer, 3)
    backup = yaml_in_tmp.with_name("weekly_planner.yml.invalid")
    assert backup.read_text() == "broken: [\n"
    assert _doc(yaml_in_tmp)["programs"][0]["name"] == "UI"
    assert _issue(hass) is None


async def test_existing_file_without_hash_is_imported_at_start(hass, hass_storage, freezer, yaml_in_tmp):
    await _start(hass, hass_storage, freezer)
    text = yaml_in_tmp.read_text().replace("name: office", "name: from file", 1)
    await hass.config_entries.async_unload(hass.config_entries.async_entries(DOMAIN)[0].entry_id)
    yaml_in_tmp.write_text(text)
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.runtime_data.store.programs[0]["name"] == "from file"


async def test_reload_service_imports(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
    _edit(yaml_in_tmp, lambda d: d["programs"][0].update(name="reloaded"))
    await hass.services.async_call(DOMAIN, "reload", blocking=True)
    await hass.async_block_till_done()
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    assert entry.runtime_data.store.programs[0]["name"] == "reloaded"
    assert entry.runtime_data is not engine


async def test_pending_write_is_flushed_on_unload(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
    engine.store.programs[0]["name"] = "last"
    engine.store.save_config()
    await hass.config_entries.async_unload(hass.config_entries.async_entries(DOMAIN)[0].entry_id)
    assert _doc(yaml_in_tmp)["programs"][0]["name"] == "last"
    engine.store.save_config()  # stopped: ignored
    assert engine.store.read_only is False


async def test_read_only_store_never_touches_the_file(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
    sync = yaml_file.YamlSync(hass, engine, lambda h: None)
    engine.store.read_only = True
    yaml_in_tmp.write_text("junk")
    await sync.async_start()
    await sync.async_check()
    sync.async_go_live()
    sync.schedule_write()
    await sync.async_stop()
    assert yaml_in_tmp.read_text() == "junk" and _issue(hass) is None
    with pytest.raises(ConfigStoreError):
        engine.store.save_config()


async def test_unwritable_location_only_warns(hass, hass_storage, freezer, yaml_in_tmp, caplog):
    engine = await _start(hass, hass_storage, freezer)
    yaml_in_tmp.unlink()
    blocker = yaml_in_tmp.parent / "x"
    blocker.write_text("")
    sync = yaml_file.YamlSync(hass, engine, lambda h: None)
    sync.path = blocker / "sub" / "weekly_planner.yml"  # parent is a file
    await sync._async_store(b"data")
    assert "could not write" in caplog.text


def test_helpers_edge_cases(tmp_path):
    path = tmp_path / "f.yml"
    assert yaml_file._read_changed(path, None) == (None, None)
    path.write_bytes(b"a")
    key, data = yaml_file._read_changed(path, None)
    assert data == b"a" and yaml_file._read_changed(path, key)[1] is None
    path.unlink()
    path.mkdir()  # unreadable as a file
    assert yaml_file._read_changed(path, None)[1] is None
    with pytest.raises(ValueError, match="syntax"):
        yaml_file._parse(b"\xff\xfe")


async def test_removing_the_integration_deletes_the_file(hass, hass_storage, freezer, yaml_in_tmp):
    await _start(hass, hass_storage, freezer)
    yaml_in_tmp.with_name("weekly_planner.yml.invalid").write_text("x")
    assert await hass.config_entries.async_remove(hass.config_entries.async_entries(DOMAIN)[0].entry_id)
    await hass.async_block_till_done()
    assert not list(yaml_in_tmp.parent.iterdir())


# -- modes in the file (docs/adr/0001) -----------------------------------------------------------------


def _two_modes():
    prog = program()
    prog["profiles"].append({"id": "other", "name": "Away", "days": [[] for _ in range(7)]})
    return prog


async def test_file_shows_modes_by_name_and_the_mode_settings(hass, hass_storage, freezer, yaml_in_tmp):
    hass.states.async_set("input_select.house", "Base", {"options": ["Base", "Away"]})
    await setup(hass, hass_storage, freezer, [_two_modes()], local(26, 7),
                config={"mode_selector": "input_select.house", "default_mode": "Base"})
    doc = _doc(yaml_in_tmp)
    assert doc["mode_selector"] == "input_select.house" and doc["default_mode"] == "Base"
    prog = doc["programs"][0]
    assert "profiles" not in prog and list(prog["modes"]) == ["Base", "Away"]
    assert list(prog["modes"]["Base"]) == ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    assert prog["modes"]["Base"]["mon"][0]["id"] == "s1" and prog["modes"]["Away"]["sun"] == []


async def test_hand_edit_of_modes_keeps_ids_by_name(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer, [_two_modes()])

    def mutate(doc):
        modes = doc["programs"][0]["modes"]
        modes["Night"] = {"mon": [{"id": "n1", "start": {"time": "22:00"}, "end": {"time": "23:00"}, "label": "t15"}]}
        modes["Base"]["mon"][0]["end"] = {"time": "13:00"}
        del modes["Away"]

    _edit(yaml_in_tmp, mutate)
    await _later(hass, freezer, 31)
    assert _issue(hass) is None
    profiles = engine.store.programs[0]["profiles"]
    assert [p["name"] for p in profiles] == ["Base", "Night"]
    assert profiles[0]["id"] == "base" and profiles[1]["id"] not in ("base", "other", "")
    assert profiles[0]["days"][0][0]["end"] == {"time": "13:00"}
    assert len(profiles[1]["days"]) == 7 and profiles[1]["days"][1] == []


async def test_file_without_any_mode_keeps_the_profiles(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer, [_two_modes()])
    _edit(yaml_in_tmp, lambda d: d["programs"][0].update(modes={}, name="kept"))
    await _later(hass, freezer, 31)
    assert [p["id"] for p in engine.store.programs[0]["profiles"]] == ["base", "other"]
    assert engine.store.programs[0]["name"] == "kept"


async def test_old_profiles_format_is_still_imported(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)

    def mutate(doc):
        prog = doc["programs"][0]
        modes = prog.pop("modes")
        prog["profiles"] = [{"id": "base", "name": "Old format", "days": list(modes["Base"].values())}]
        doc.pop("mode_selector"), doc.pop("default_mode")

    _edit(yaml_in_tmp, mutate)
    await _later(hass, freezer, 31)
    assert _issue(hass) is None
    assert [p["name"] for p in engine.store.programs[0]["profiles"]] == ["Old format"]


async def test_modes_and_profiles_together_are_refused(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
    _edit(yaml_in_tmp, lambda d: d["programs"][0].update(profiles=[]))
    await _later(hass, freezer, 31)
    assert _issue(hass) is not None and engine.store.programs[0]["profiles"][0]["name"] == "Base"


async def test_mode_settings_are_imported_and_validated(hass, hass_storage, freezer, yaml_in_tmp):
    hass.states.async_set("input_select.house", "Base", {"options": ["Base", "Away"]})
    engine = await _start(hass, hass_storage, freezer, [_two_modes()])
    _edit(yaml_in_tmp, lambda d: d.update(mode_selector="input_select.house", default_mode="Base"))
    await _later(hass, freezer, 31)
    assert engine.store.config["mode_selector"] == "input_select.house"
    assert engine.store.config["default_mode"] == "Base" and engine.active_mode == "Base"
    for bad in ({"mode_selector": "light.kitchen"}, {"default_mode": "Nope"}, {"mode_selector": 5}):
        _edit(yaml_in_tmp, lambda d, bad=bad: d.update(bad))
        await _later(hass, freezer, 31)
        assert _issue(hass) is not None
        assert engine.store.config["mode_selector"] == "input_select.house"
        _edit(yaml_in_tmp, lambda d: d.update(mode_selector="input_select.house", default_mode="Base"))
        await _later(hass, freezer, 31)
        assert _issue(hass) is None
    _edit(yaml_in_tmp, lambda d: d.update(mode_selector=None, default_mode=None))
    await _later(hass, freezer, 31)
    assert engine.store.config["mode_selector"] is None and engine.active_mode is None


def test_program_conversion_round_trip():
    prog = _two_modes()
    again = yaml_file.program_from_file(yaml_file.program_to_file(prog), prog)
    assert again == prog
    fresh = yaml_file.program_from_file(yaml_file.program_to_file(prog), None)
    assert [p["name"] for p in fresh["profiles"]] == ["Base", "Away"] and fresh["profiles"][0]["id"] != "base"
    with pytest.raises(TypeError):
        yaml_file.program_from_file({"modes": {"A": {"funday": []}}}, None)
    with pytest.raises(TypeError):
        yaml_file.program_from_file({"modes": {1: {}}}, None)
    with pytest.raises(TypeError):
        yaml_file.program_from_file({"modes": []}, None)


"""Mutation-testing survivors of yaml_file.py: the pure helpers (path, day-off keys, render, parse), exact messages."""


def message(call, kind=Exception):
    with pytest.raises(kind) as caught:
        call()
    return str(caught.value)


def test_the_mirror_lives_in_www_under_its_name():
    asked = []
    hass = SimpleNamespace(config=SimpleNamespace(path=lambda *parts: asked.append(parts) or "/cfg/" + "/".join(parts)))
    assert yaml_path(hass) == Path("/cfg/www/weekly_planner.yml") and asked == [("www", "weekly_planner.yml")]


def test_a_day_off_of_the_file_is_one_copy_or_one_day_and_nothing_else():
    assert holiday_from_file("m", None) is None
    assert holiday_from_file("m", {"copy": "sun"}) == {"copy": 6}
    assert holiday_from_file("m", {"day": None}) == {"day": []}
    assert holiday_from_file("m", {"day": [{"id": "x"}]}) == {"day": [{"id": "x"}]}
    assert holiday_from_file("m", {"copy": "mon", "day": [], "off": True}) == {"copy": 0, "day": [], "off": True}
    expected = "mode m: 'holiday' must be {copy: <day>} or {day: [...]}, with an optional off: true"
    for bad in ("copy", ["copy"], {}, {"off": True}, {"copy": "mon", "off": "yes"}, {"other": 1}, {"copy": "mon", "extra": 1}):
        assert message(lambda bad=bad: holiday_from_file("m", bad), TypeError) == expected
    assert message(lambda: holiday_from_file("m", {"copy": "funday"}), TypeError) == (
        "mode m: 'holiday: copy' must be one of mon, tue, wed, thu, fri, sat, sun")


def test_a_day_off_is_written_as_a_weekday_name_or_its_own_day():
    assert holiday_to_file({"copy": 0}) == {"copy": "mon"} and holiday_to_file({"copy": 6}) == {"copy": "sun"}
    assert holiday_to_file({"day": [1]}) == {"day": [1]}


def test_a_mode_is_written_with_its_seven_days_its_day_off_or_only_its_source():
    days = [[{"id": str(n)}] for n in range(7)]
    out = _mode_to_file({"days": days, "holiday": {"copy": 2}})
    assert list(out) == [*DAYS, "holiday"] and out["holiday"] == {"copy": "wed"} and out["tue"] == [{"id": "1"}]
    assert "holiday" not in _mode_to_file({"days": days})
    assert _mode_to_file({"days": days, "follows": "Home"}) == {"follows": "Home"}


def test_a_program_of_the_file_has_exact_refusals_for_modes():
    assert message(lambda: program_from_file({"modes": {}, "profiles": []}, None), ValueError) == (
        "a program has either 'modes' or the old 'profiles', not both")
    assert message(lambda: program_from_file({"modes": []}, None), TypeError) == "'modes' must map a mode name to its days"
    assert message(lambda: program_from_file({"modes": {5: {}}}, None), TypeError) == "mode name 5 must be text"
    expected = "mode M: expected the days mon, tue, wed, thu, fri, sat, sun and holiday, or follows: <mode>"
    for bad in (["mon"], {"funday": []}, "x"):
        assert message(lambda bad=bad: program_from_file({"modes": {"M": bad}}, None), TypeError) == expected
    assert message(lambda: program_from_file({"modes": {"M": {"follows": 3}}}, None), TypeError) == (
        "mode M: 'follows' must be the name of a mode")
    assert program_from_file({"id": "p"}, None) == {"id": "p"}


def test_a_program_of_the_file_becomes_profiles_with_their_day_off_follows_and_kept_ids():
    existing = {"profiles": [{"id": "keep", "name": "Home", "days": []}]}
    item = {"id": "p", "modes": {"Home": {"mon": [{"id": "s"}], "holiday": {"copy": "mon"}}, "Away": {"follows": "Home"},
                                  "Empty": None}}
    out = program_from_file(item, existing)
    home, away, empty = out["profiles"]
    assert home["id"] == "keep" and home["days"][0] == [{"id": "s"}] and home["holiday"] == {"copy": 0}
    assert away["follows"] == "Home" and away["days"] == [[] for _ in range(7)] and "holiday" not in away
    assert empty["days"] == [[] for _ in range(7)] and "follows" not in empty and len(empty["id"]) > 0 and empty["id"] != "keep"
    assert "modes" not in out and out["id"] == "p"
    assert program_from_file({"modes": {}}, existing)["profiles"] is existing["profiles"]
    assert program_from_file({"modes": {}}, None)["profiles"] == []
    back = program_to_file(out)
    assert back["modes"]["Away"] == {"follows": "Home"} and "profiles" not in back and back["id"] == "p"


def test_render_writes_defaults_for_what_is_missing_and_keeps_readable_text():
    doc = yaml.safe_load(render({}).decode())
    assert doc == {"version": 1, "vacation": False, "mode_selector": None, "default_mode": None, "holiday_entity": None,
                   "holiday_invert": False, "labels": [], "programs": []}
    full = render({"vacation": True, "holiday_invert": True, "holiday_entity": "switch.x", "labels": [{"id": "é"}],
                   "programs": [{"id": "p", "profiles": []}]}).decode()
    parsed = yaml.safe_load(full)
    assert parsed["vacation"] is True and parsed["holiday_invert"] is True and parsed["labels"] == [{"id": "é"}]
    assert "é" in full and list(parsed)[:3] == ["version", "vacation", "mode_selector"]  # unicode kept, order kept
    assert parsed["programs"] == [{"id": "p", "modes": {}}]
    assert render({"holiday_invert": 1}).decode().count("holiday_invert: true") == 1


def test_a_file_is_written_even_when_its_folder_does_not_exist_yet_and_an_unimported_one_is_kept(tmp_path):
    target = tmp_path / "a" / "b" / "mirror.yml"
    assert _write_atomic(target, b"one", None) is not None and target.read_bytes() == b"one"
    assert _write_atomic(target, b"one", None) is not None  # same content: nothing to do
    assert not target.with_name("mirror.yml.invalid").exists()
    _write_atomic(target, b"two", "not-the-hash")
    assert target.with_name("mirror.yml.invalid").read_bytes() == b"one" and target.read_bytes() == b"two"
    _write_atomic(target, b"three", yaml_file.digest(b"two"))
    assert target.with_name("mirror.yml.invalid").read_bytes() == b"one"  # a known file is simply replaced


@pytest.mark.parametrize(
    ("text", "kind", "expected"),
    [
        (b"- a", TypeError, "the file must be a mapping with labels and programs (empty file refused)"),
        (b"", TypeError, "the file must be a mapping with labels and programs (empty file refused)"),
        (b"version: 2\nlabels: []\nprograms: []", ValueError, "unsupported version 2"),
        (b"labels: []\nprograms: {}", TypeError, "'programs' must be a list"),
        (b"labels: 1\nprograms: []", TypeError, "'labels' must be a list"),
        (b"labels: []\nprograms: []\nvacation: 1", TypeError, "'vacation' must be true or false"),
        (b"labels: []\nprograms: []\nholiday_invert: 1", TypeError, "'holiday_invert' must be true or false"),
        *[(f"labels: []\nprograms: []\n{key}: 5".encode(), TypeError, f"'{key}' must be text or empty")
          for key in ("mode_selector", "default_mode", "holiday_entity")],
    ],
)
def test_parse_refuses_with_exact_messages(text, kind, expected):
    assert message(lambda: _parse(text), kind) == expected


def test_parse_refuses_a_syntax_error_and_reads_a_good_file():
    assert message(lambda: _parse(b"a: [\n"), ValueError).startswith("YAML syntax: ")
    ok = _parse(b"version: 1\nlabels: []\nprograms: []\nvacation: true\nholiday_invert: false\nmode_selector: null")
    assert ok["vacation"] is True
    assert _parse(b"labels: []\nprograms: []")["programs"] == []


"""Mutation-testing survivors of yaml_file.YamlSync: partial files, exact reasons, logs, revisions."""


DAY_OFF = "input_boolean.day_off"


def _sync(engine):
    return engine.store.on_config_saved.__self__


def _error(hass):
    issue = _issue(hass)
    return None if issue is None else issue.translation_placeholders["error"]


async def test_a_file_with_only_one_of_the_day_off_keys_keeps_the_other_from_the_store(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer, config={"holiday_entity": DAY_OFF, "holiday_invert": True})
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
    engine = await _start(hass, hass_storage, freezer, config={"holiday_entity": DAY_OFF})
    _edit(yaml_in_tmp, lambda d: (d.pop("holiday_invert", None), d.update(holiday_entity="switch.other")))
    await _later(hass, freezer, 31)
    assert engine.store.config["holiday_invert"] is False and engine.store.config["holiday_entity"] == "switch.other"


async def test_a_file_with_only_one_of_the_mode_keys_changes_only_what_it_names(hass, hass_storage, freezer, yaml_in_tmp):
    engine = await _start(hass, hass_storage, freezer)
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
    engine = await _start(hass, hass_storage, freezer)
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
    engine = await _start(hass, hass_storage, freezer)
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
    engine = await _start(hass, hass_storage, freezer, [old])
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
    engine = await _start(hass, hass_storage, freezer, [program(entities=entities, slots=[shared])])
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
