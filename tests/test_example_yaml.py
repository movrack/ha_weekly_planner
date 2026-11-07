"""The shipped example file stays valid: agents copy it (custom_components/weekly_planner/AI_GUIDE.md)."""

from pathlib import Path

from custom_components.weekly_planner.validation import check_label, check_program
from custom_components.weekly_planner.yaml_file import _parse

EXAMPLE = Path(__file__).parents[1] / "custom_components" / "weekly_planner" / "example.yml"


def test_example_passes_the_import_rules() -> None:
    raw = _parse(EXAMPLE.read_bytes())
    labels = {item["id"]: check_label(dict(item)) for item in raw["labels"]}
    assert labels
    for item in raw["programs"]:
        program = check_program(dict(item), labels)
        assert len(program["profiles"][0]["days"]) == 7
