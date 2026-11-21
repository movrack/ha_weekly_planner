"""The release archive HACS installs: files at the root, manifest and built card present (#63)."""

from __future__ import annotations

import json
import zipfile

import pytest

from scripts import release_zip

MANIFEST = json.dumps({"domain": "weekly_planner", "version": "0.30.0-beta.1"})
CARD = "frontend/weekly-planner-card.js"


def _zip(path, entries: dict[str, str]):
    with zipfile.ZipFile(path, "w") as archive:
        for name, content in entries.items():
            archive.writestr(name, content)
    return path


@pytest.mark.parametrize(
    ("entries", "expected"),
    [
        ({"manifest.json": MANIFEST, CARD: "x"}, []),
        ({"manifest.json": MANIFEST}, [f"{CARD} is missing (card not built)"]),
        ({"manifest.json": MANIFEST, CARD: ""}, [f"{CARD} is empty"]),
        ({CARD: "x"}, ["manifest.json is not at the root of the archive"]),
        (
            {"custom_components/weekly_planner/manifest.json": MANIFEST,
             f"custom_components/weekly_planner/{CARD}": "x"},
            ["manifest.json is not at the root of the archive", f"{CARD} is missing (card not built)",
             "unexpected entry: custom_components/weekly_planner/manifest.json",
             f"unexpected entry: custom_components/weekly_planner/{CARD}"],
        ),
        ({"manifest.json": MANIFEST, CARD: "x", "__pycache__/engine.cpython-314.pyc": "b"},
         ["unexpected entry: __pycache__/engine.cpython-314.pyc"]),
    ],
    ids=["fit", "card-not-built", "card-empty", "no-manifest", "nested-folder", "pycache"],
)
def test_archive_problems_name_what_hacs_would_get_wrong(tmp_path, entries, expected):
    assert release_zip.problems(_zip(tmp_path / "w.zip", entries), "0.30.0-beta.1") == expected


def test_archive_of_another_version_is_refused(tmp_path):
    file = _zip(tmp_path / "w.zip", {"manifest.json": MANIFEST, CARD: "x"})
    assert release_zip.problems(file, "0.30.0") == ["manifest.json version 0.30.0-beta.1 is not 0.30.0"]


def test_pack_puts_the_integration_files_at_the_root(tmp_path, monkeypatch):
    source = tmp_path / "weekly_planner"
    (source / "frontend").mkdir(parents=True)
    (source / "__pycache__").mkdir()
    (source / "manifest.json").write_text(MANIFEST)
    (source / CARD).write_text("x")
    (source / "__pycache__" / "a.cpython-314.pyc").write_text("b")
    monkeypatch.setattr(release_zip, "SOURCE", source)
    out = tmp_path / "weekly_planner.zip"
    assert release_zip.main(["0.30.0-beta.1", str(out)]) == 0
    assert zipfile.ZipFile(out).namelist() == [CARD, "manifest.json"]
