"""Mutation-testing survivors of yaml_file.py: the pure helpers (path, day-off keys, render, parse), exact messages."""

from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace

import pytest
import yaml

from custom_components.weekly_planner import yaml_file
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
    expected = "mode m: 'holiday' must be {copy: <day>} or {day: [...]}"
    for bad in ("copy", ["copy"], {}, {"copy": "mon", "day": []}, {"other": 1}, {"copy": "mon", "extra": 1}):
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


def test_parse_refuses_with_exact_messages():
    assert message(lambda: _parse(b"- a"), TypeError) == "the file must be a mapping with labels and programs (empty file refused)"
    assert message(lambda: _parse(b""), TypeError) == "the file must be a mapping with labels and programs (empty file refused)"
    assert message(lambda: _parse(b"version: 2\nlabels: []\nprograms: []"), ValueError) == "unsupported version 2"
    assert message(lambda: _parse(b"labels: []\nprograms: {}"), TypeError) == "'programs' must be a list"
    assert message(lambda: _parse(b"labels: 1\nprograms: []"), TypeError) == "'labels' must be a list"
    assert message(lambda: _parse(b"labels: []\nprograms: []\nvacation: 1"), TypeError) == "'vacation' must be true or false"
    assert message(lambda: _parse(b"labels: []\nprograms: []\nholiday_invert: 1"), TypeError) == "'holiday_invert' must be true or false"
    assert message(lambda: _parse(b"a: [\n"), ValueError).startswith("YAML syntax: ")
    for key in ("mode_selector", "default_mode", "holiday_entity"):
        assert message(lambda key=key: _parse(f"labels: []\nprograms: []\n{key}: 5".encode()), TypeError) == (
            f"'{key}' must be text or empty")
    ok = _parse(b"version: 1\nlabels: []\nprograms: []\nvacation: true\nholiday_invert: false\nmode_selector: null")
    assert ok["vacation"] is True
    assert _parse(b"labels: []\nprograms: []")["programs"] == []
