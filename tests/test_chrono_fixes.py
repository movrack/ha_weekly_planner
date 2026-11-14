"""Performance fixes that must not change behaviour: YAML import off the loop, set lookups, clock cache."""

from __future__ import annotations

import threading

import pytest
import yaml

from custom_components.weekly_planner import yaml_file
from custom_components.weekly_planner.slots import applicable_ids
from custom_components.weekly_planner.timeline import parse_clock

from .test_example_yaml import EXAMPLE
from .test_yaml_file import _doc, _edit, _later, _start


def _documents():
    yield EXAMPLE.read_text()
    yield "version: 1\nlabels: []\nprograms: []\nnote: 'é ü'\nflags: [yes, no, 0o17, 1e3, 2026-01-05]\n"


def test_loaders_give_the_same_result():
    for text in _documents():
        assert yaml.load(text, Loader=yaml.SafeLoader) == yaml.load(text, Loader=yaml_file._LOADER)
        assert yaml.load(text, Loader=yaml.SafeLoader) == yaml.safe_load(text)


def test_c_loader_is_used_when_available():
    expected = getattr(yaml, "CSafeLoader", yaml.SafeLoader)
    assert yaml_file._LOADER is expected


def test_parse_works_with_the_pure_python_loader(monkeypatch):
    data = EXAMPLE.read_bytes()
    fast = yaml_file._parse(data)
    monkeypatch.setattr(yaml_file, "_LOADER", yaml.SafeLoader)
    assert yaml_file._parse(data) == fast
    with pytest.raises(ValueError, match="syntax"):
        yaml_file._parse(b"a: [")


async def test_import_parses_in_a_worker_thread(hass, hass_storage, freezer, yaml_in_tmp, monkeypatch):
    await _start(hass, hass_storage, freezer)
    threads = []
    real = yaml_file._parse

    def spy(data):
        threads.append(threading.get_ident())
        return real(data)

    monkeypatch.setattr(yaml_file, "_parse", spy)
    _edit(yaml_in_tmp, lambda doc: doc["programs"][0].update(name="Edited"))
    await _later(hass, freezer, 31)
    assert threads and threading.get_ident() not in threads
    assert _doc(yaml_in_tmp)["programs"][0]["name"] == "Edited"


ENTITIES=("climate.a", "climate.b", "climate.c")


def test_applicable_ids_keeps_program_order_and_ignores_list_order():
    assert applicable_ids({"entities": ["climate.c", "climate.a"]}, ENTITIES) == ("climate.a", "climate.c")
    assert applicable_ids({"entities": ["climate.a", "climate.a"]}, ENTITIES) == ("climate.a",)
    assert applicable_ids({"entities": ["light.x"]}, ENTITIES) == ()
    assert applicable_ids({"entities": []}, ENTITIES) == ()
    assert applicable_ids({}, ENTITIES) == ENTITIES
    assert applicable_ids({"entities": None}, iter(ENTITIES)) == ENTITIES
    assert applicable_ids({"entities": ["climate.b"]}, (e for e in ENTITIES)) == ("climate.b",)
    assert applicable_ids({"entities": ("climate.b",)}, ["climate.b", "climate.b"]) == ("climate.b", "climate.b")


def test_parse_clock_cache_never_stores_an_error():
    parse_clock.cache_clear()
    for _ in range(3):
        with pytest.raises(ValueError, match="invalid time"):
            parse_clock("25:00")
    assert parse_clock.cache_info().currsize == 0
    assert parse_clock("07:30") == (7, 30) == parse_clock("07:30")
    assert parse_clock("24:00") == (24, 0)
    info = parse_clock.cache_info()
    assert info.currsize == 2 and info.hits == 1
