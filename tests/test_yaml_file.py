"""YAML mirror of the configuration (spec § 37.3)."""

from __future__ import annotations

import json
from datetime import timedelta

import pytest
import yaml
from homeassistant.helpers import issue_registry as ir

from custom_components.weekly_planner import yaml_file
from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.store import ConfigStoreError

from .helpers import Recorder, local, program, setup, tick


def _issue(hass):
    return ir.async_get(hass).async_get_issue(DOMAIN, yaml_file.ISSUE)


def _load(path):
    return yaml.safe_load(path.read_text())


def _doc(path):
    return _load(path)


async def _start(hass, hass_storage, freezer, programs=None):
    Recorder(hass)
    return await setup(hass, hass_storage, freezer, programs if programs is not None else [program()],
                       local(26, 7))


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
    assert list(doc) == ["version", "vacation", "labels", "programs"]
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
    lambda d: d["programs"][0]["profiles"][0]["days"][0][0].update(label="nope"),
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
