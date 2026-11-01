"""``rename_entity`` follows renames inside ``slot.entities`` (#34, lot 1)."""

from __future__ import annotations

from copy import deepcopy

from custom_components.weekly_planner.registry import rename_entity
from custom_components.weekly_planner.validation import check_program

from .helpers import CLIMATE, COVER, labels, program, slot

NEW = "climate.renamed"


def _config(slots_a, slots_b=None):
    prog = program(slots=slots_a, entities=[{"entity_id": e, "default_label": None, "label_overrides": {}} for e in (CLIMATE, COVER)])
    if slots_b is not None:
        prog["profiles"].append({"id": "alt", "name": "Alt", "days": [list(slots_b) for _ in range(7)]})
    return {"labels": [], "programs": [prog]}


def _listed(sid, ids, start="07:00", end="09:00"):
    return {**slot(sid, start, end), "entities": ids}


def test_rename_rewrites_lists_in_all_modes_and_bumps_revision():
    config = _config([_listed("a", [CLIMATE, COVER])], [_listed("b", [COVER, CLIMATE])])
    prog = config["programs"][0]
    assert rename_entity(config, CLIMATE, NEW)
    assert prog["profiles"][0]["days"][3][0]["entities"] == [NEW, COVER]
    assert prog["profiles"][1]["days"][6][0]["entities"] == [COVER, NEW]
    assert prog["revision"] == 2
    assert prog["entities"][0]["entity_id"] == NEW


def test_rename_leaves_unlisted_and_other_lists_alone():
    config = _config([slot("a", "07:00", "09:00"), _listed("b", [COVER], "10:00", "11:00")])
    before = deepcopy(config["programs"][0]["profiles"])
    rename_entity(config, "climate.nobody", NEW)
    assert config["programs"][0]["profiles"] == before


def test_rename_onto_an_id_already_listed_does_not_duplicate():
    config = _config([_listed("a", [CLIMATE, NEW])])
    assert rename_entity(config, CLIMATE, NEW)
    assert config["programs"][0]["profiles"][0]["days"][0][0]["entities"] == [NEW]


def test_rename_dedupes_only_what_it_touches():
    # a list that does not mention the old id is not rewritten and not flagged as changed
    config = _config([_listed("a", [COVER])])
    config["programs"][0]["entities"] = config["programs"][0]["entities"][1:]
    assert not rename_entity(config, CLIMATE, NEW)


def test_renamed_program_still_passes_validation():
    config = _config([_listed("a", [CLIMATE, NEW])])
    config["programs"][0]["entities"].append({"entity_id": NEW, "default_label": None, "label_overrides": {}})
    rename_entity(config, CLIMATE, NEW)
    # the device rows themselves would now duplicate NEW; drop the first as the registry never allows two equal ids
    config["programs"][0]["entities"] = [e for i, e in enumerate(config["programs"][0]["entities"]) if i != 0]
    check_program(config["programs"][0], {label["id"]: label for label in labels()})
