"""The shipped example file stays valid: agents copy it (custom_components/weekly_planner/AI_GUIDE.md)."""

from pathlib import Path

from custom_components.weekly_planner.validation import (
    check_label,
    check_mode_config,
    check_program,
)
from custom_components.weekly_planner.yaml_file import _parse, program_from_file

EXAMPLE = Path(__file__).parents[1] / "custom_components" / "weekly_planner" / "example.yml"


def test_example_passes_the_import_rules() -> None:
    raw = _parse(EXAMPLE.read_bytes())
    labels = {item["id"]: check_label(dict(item)) for item in raw["labels"]}
    assert labels
    settings = check_mode_config(raw["mode_selector"], raw["default_mode"])
    assert settings["default_mode"] == "Home"
    for item in raw["programs"]:
        program = check_program(program_from_file(dict(item), None), labels)
        assert [p["name"] for p in program["profiles"]] == ["Home", "Away", "Holiday"]
        assert program["profiles"][2]["follows"] == "Home"
        assert len(program["profiles"][0]["days"]) == 7
        assert program["profiles"][1]["days"][1] == []
