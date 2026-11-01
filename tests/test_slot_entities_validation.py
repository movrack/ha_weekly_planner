"""Per-device schedules (#34, lot 1): ``slot.entities`` / ``slot.seed`` validation, pair-based overlaps, D5 helpers."""

from __future__ import annotations

from copy import deepcopy

import pytest
import voluptuous as vol

from custom_components.weekly_planner import validation as v
from custom_components.weekly_planner.slots import normalise_slot_entities, remove_device_from_slots

from .helpers import CLIMATE, COVER, labels, program, slot

LIGHT = "light.office"


def _entities(*ids):
    return [{"entity_id": eid, "default_label": None, "label_overrides": {}} for eid in ids]


def _prog(slots, ids=(CLIMATE, COVER)):
    return program(slots=slots, entities=_entities(*ids))


def _with(base, entities=None, **extra):
    return {**base, **({"entities": entities} if entities is not None else {}), **extra}


def _check(prog):
    return v.check_program(deepcopy(prog), {label["id"]: label for label in labels()})


def _error(prog) -> str:
    with pytest.raises(vol.Invalid) as exc:
        _check(prog)
    return exc.value.msg


# --- schema ------------------------------------------------------------------------------------------------------

def test_entities_and_seed_are_accepted_and_kept():
    out = _check(_prog([_with(slot("a", "07:00", "09:00"), [CLIMATE], seed="origin")]))
    assert out["profiles"][0]["days"][0][0]["entities"] == [CLIMATE]
    assert out["profiles"][0]["days"][0][0]["seed"] == "origin"


def test_programs_without_the_fields_are_unchanged():
    out = _check(_prog([slot("a", "07:00", "09:00")]))
    assert "entities" not in out["profiles"][0]["days"][0][0]
    assert "seed" not in out["profiles"][0]["days"][0][0]


def test_invalid_entity_id_and_seed_rejected():
    with pytest.raises(vol.Invalid):
        _check(_prog([_with(slot("a", "07:00", "09:00"), ["not an id"])]))
    with pytest.raises(vol.Invalid):
        _check(_prog([_with(slot("a", "07:00", "09:00"), None, seed="")]))
    with pytest.raises(vol.Invalid):
        _check(_prog([_with(slot("a", "07:00", "09:00"), None, seed=3)]))


# --- semantic codes ----------------------------------------------------------------------------------------------

def test_empty_slot_entities():
    assert _error(_prog([_with(slot("a", "07:00", "09:00"), [])])) == "empty_slot_entities:a"


def test_duplicate_slot_entity():
    assert _error(_prog([_with(slot("a", "07:00", "09:00"), [CLIMATE, CLIMATE])])) == f"duplicate_slot_entity:a:{CLIMATE}"


def test_unknown_slot_entity():
    assert _error(_prog([_with(slot("a", "07:00", "09:00"), [CLIMATE, LIGHT])])) == f"unknown_slot_entity:a:{LIGHT}"


def test_label_incompatibility_is_not_refused_by_the_server():
    # a cover action in a slot listed for the climate only: warning territory (checks.py), never a refusal (D6)
    assert _check(_prog([_with(slot("a", "07:00", "09:00", "close"), [CLIMATE])]))


def test_every_mode_is_checked():
    prog = _prog([slot("a", "07:00", "09:00")])
    prog["profiles"].append({"id": "alt", "name": "Alt", "days": [[_with(slot("b", "07:00", "09:00"), [LIGHT])]] + [[] for _ in range(6)]})
    assert _error(prog) == f"unknown_slot_entity:b:{LIGHT}"


# --- overlaps by pairs -------------------------------------------------------------------------------------------

def test_owner_case_is_accepted():
    _check(_prog([_with(slot("heat", "07:00", "22:00", "t15"), [CLIMATE]), _with(slot("shut", "07:00", "09:00", "close"), [COVER])]))


def test_same_device_overlap_is_refused_with_the_device():
    prog = _prog([_with(slot("a", "07:00", "22:00"), [CLIMATE]), _with(slot("b", "08:00", "09:00"), [CLIMATE])])
    assert _error(prog) == f"overlapping_slots:{CLIMATE}"


def test_unlisted_slot_overlaps_a_listed_one_for_the_shared_device_only():
    prog = _prog([slot("all", "07:00", "09:00"), _with(slot("cl", "08:00", "10:00"), [CLIMATE])])
    assert _error(prog) == f"overlapping_slots:{CLIMATE}"
    prog = _prog([slot("all", "07:00", "09:00"), _with(slot("cv", "08:00", "10:00"), [COVER])], ids=(CLIMATE, COVER))
    assert _error(prog) == f"overlapping_slots:{COVER}"


def test_error_names_the_first_shared_device_in_program_order():
    prog = _prog([_with(slot("a", "07:00", "09:00"), [COVER, CLIMATE, LIGHT]),
                  _with(slot("b", "08:00", "10:00"), [LIGHT, COVER, CLIMATE])], ids=(CLIMATE, COVER, LIGHT))
    assert _error(prog) == f"overlapping_slots:{CLIMATE}"


def test_unlisted_overlap_without_any_list_keeps_the_plain_code():
    assert _error(_prog([slot("a", "07:00", "09:00"), slot("b", "08:00", "10:00")])) == "overlapping_slots"


def test_disjoint_lists_may_overlap_but_an_unlisted_partner_cannot():
    _check(_prog([_with(slot("a", "07:00", "09:00"), [CLIMATE]), _with(slot("b", "07:00", "09:00"), [COVER])]))
    with pytest.raises(vol.Invalid):
        _check(_prog([_with(slot("a", "07:00", "09:00"), [CLIMATE]), _with(slot("b", "07:00", "09:00"), [COVER]),
                      slot("c", "08:00", "08:30")]))


def test_adjacent_slots_with_lists_are_accepted():
    _check(_prog([_with(slot("a", "07:00", "09:00"), [CLIMATE]), _with(slot("b", "09:00", "10:00"), [CLIMATE])]))


def test_overnight_slot_with_lists():
    night = _with(slot("n", "22:00", "06:00"), [CLIMATE])
    _check(_prog([night, _with(slot("c", "23:00", "23:30"), [COVER])]))
    assert _error(_prog([night, _with(slot("c", "23:00", "23:30"), [CLIMATE])])) == f"overlapping_slots:{CLIMATE}"


def test_overnight_spill_into_next_day_is_checked_per_device():
    # Sunday 22:00 -> Monday 06:00 against Monday 05:00: only a shared device conflicts (random delay path)
    days = [[] for _ in range(7)]
    delayed = {**slot("n", "22:00", "06:00"), "entities": [CLIMATE]}
    delayed["start"] = {"time": "22:00", "random_minutes": 10}
    days[6] = [delayed]
    days[0] = [_with(slot("m", "05:30", "07:00"), [COVER])]
    prog = _prog([])
    prog["profiles"][0]["days"] = days
    _check(prog)
    days[0] = [_with(slot("m", "05:30", "07:00"), [CLIMATE])]
    assert _error(prog) == f"overlapping_slots:{CLIMATE}"


def test_random_delay_window_with_lists():
    a = {**slot("a", "07:00", "09:00"), "entities": [CLIMATE], "end": {"time": "09:00", "random_minutes": 30}}
    _check(_prog([a, _with(slot("b", "09:10", "10:00"), [COVER])]))
    assert _error(_prog([a, _with(slot("b", "09:10", "10:00"), [CLIMATE])])) == f"overlapping_slots:{CLIMATE}"


def test_list_equal_to_all_devices_behaves_like_absent():
    assert _error(_prog([_with(slot("a", "07:00", "09:00"), [CLIMATE, COVER]), slot("b", "08:00", "10:00")])).startswith("overlapping_slots:")


# --- helpers (D5) ------------------------------------------------------------------------------------------------

def _days(prog):
    return [[[s.get("entities") for s in day] for day in p["days"]] for p in prog["profiles"]]


def _two_modes(slots_a, slots_b, ids=(CLIMATE, COVER, LIGHT)):
    prog = _prog(slots_a, ids)
    prog["profiles"].append({"id": "alt", "name": "Alt", "days": [list(slots_b) for _ in range(7)]})
    return prog


def test_remove_device_removes_it_from_every_mode_and_keeps_order():
    prog = _two_modes([_with(slot("a", "07:00", "09:00"), [CLIMATE, COVER])], [_with(slot("b", "07:00", "09:00"), [LIGHT, COVER])])
    out = remove_device_from_slots(prog, COVER)
    assert out["profiles"][0]["days"][0][0]["entities"] == [CLIMATE]
    assert out["profiles"][1]["days"][0][0]["entities"] == [LIGHT]
    assert prog["profiles"][0]["days"][0][0]["entities"] == [CLIMATE, COVER]  # input untouched


def test_remove_device_deletes_slots_it_alone_had():
    prog = _two_modes([_with(slot("a", "07:00", "09:00"), [COVER]), slot("keep", "10:00", "11:00")],
                      [_with(slot("b", "07:00", "09:00"), [COVER])])
    out = remove_device_from_slots(prog, COVER)
    assert [s["id"] for s in out["profiles"][0]["days"][0]] == ["keep"]
    assert out["profiles"][1]["days"][0] == []


def test_remove_device_all_remaining_becomes_absent():
    prog = _prog([_with(slot("a", "07:00", "09:00"), [CLIMATE, COVER])], ids=(CLIMATE, COVER, LIGHT))
    # list is [climate, cover]; removing light leaves exactly those two -> absent
    out = remove_device_from_slots(prog, LIGHT)
    assert "entities" not in out["profiles"][0]["days"][0][0]


def test_remove_device_down_to_a_single_device_leaves_no_list():
    prog = _prog([_with(slot("a", "07:00", "09:00"), [CLIMATE, COVER]), _with(slot("b", "10:00", "11:00"), [COVER])])
    out = remove_device_from_slots(prog, COVER)
    day = out["profiles"][0]["days"][0]
    assert [s["id"] for s in day] == ["a"] and "entities" not in day[0]


def test_remove_device_leaves_unlisted_slots_alone():
    prog = _prog([slot("a", "07:00", "09:00")])
    assert remove_device_from_slots(prog, COVER)["profiles"] == prog["profiles"]


def test_normalise_all_devices_becomes_absent_and_dedupes():
    prog = _prog([_with(slot("a", "07:00", "09:00"), [COVER, CLIMATE]),
                  _with(slot("b", "10:00", "11:00"), [CLIMATE, CLIMATE]),
                  _with(slot("c", "12:00", "13:00"), [CLIMATE])], ids=(CLIMATE, COVER, LIGHT))
    day = normalise_slot_entities(prog)["profiles"][0]["days"][0]
    assert [s.get("entities") for s in day] == [[COVER, CLIMATE], [CLIMATE], [CLIMATE]]
    full = normalise_slot_entities(_prog([_with(slot("a", "07:00", "09:00"), [COVER, CLIMATE])]))
    assert "entities" not in full["profiles"][0]["days"][0][0]


def test_normalise_single_device_program_has_no_list():
    out = normalise_slot_entities(_prog([_with(slot("a", "07:00", "09:00"), [CLIMATE])], ids=(CLIMATE,)))
    assert "entities" not in out["profiles"][0]["days"][0][0]


def test_normalise_leaves_empty_and_unknown_for_the_validator():
    prog = _prog([_with(slot("a", "07:00", "09:00"), []), _with(slot("b", "10:00", "11:00"), [CLIMATE, COVER, LIGHT])])
    day = normalise_slot_entities(prog)["profiles"][0]["days"][0]
    assert [s["entities"] for s in day] == [[], [CLIMATE, COVER, LIGHT]]
