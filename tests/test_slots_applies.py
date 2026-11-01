"""Per-device slot targeting helpers (issue #34)."""

from custom_components.weekly_planner.slots import applicable_ids, applies, subsets

C, V, L = "climate.office", "cover.office", "light.office"


def slot(sid: str, entities: list[str] | None = None) -> dict:
    base = {"id": sid, "start": {"time": "07:00"}, "end": {"time": "22:00"}, "label": "x"}
    return base if entities is None else {**base, "entities": entities}


def test_applies_without_list_targets_every_device():
    assert applies(slot("a"), C)
    assert applies(slot("a"), "anything.new")


def test_applies_with_list_targets_listed_devices_only():
    s = slot("a", [C])
    assert applies(s, C)
    assert not applies(s, V)


def test_applies_empty_list_targets_nobody():
    # forbidden by validation; the helper stays total
    assert not applies(slot("a", []), C)


def test_applicable_ids_keeps_program_order():
    assert applicable_ids(slot("a", [L, C]), [C, V, L]) == (C, L)
    assert applicable_ids(slot("a"), [C, V]) == (C, V)
    assert applicable_ids(slot("a", ["gone.device"]), [C, V]) == ()


def test_subsets_without_lists_is_one_group():
    assert subsets([slot("a"), slot("b")], [C, V, L]) == [(C, V, L)]


def test_subsets_no_slots_is_one_group():
    assert subsets([], [C, V]) == [(C, V)]


def test_subsets_groups_devices_by_their_slots():
    day = [slot("heat", [C]), slot("close", [V]), slot("all")]
    assert subsets(day, [C, V, L]) == [(C,), (V,), (L,)]


def test_subsets_merges_devices_with_identical_slots():
    day = [slot("heat", [C, L]), slot("close", [V])]
    assert subsets(day, [C, V, L]) == [(C, L), (V,)]


def test_subsets_ignores_duplicate_and_unknown_ids():
    day = [slot("heat", [C, "gone.device"])]
    assert subsets(day, [C, V, C]) == [(C,), (V,)]


def test_subsets_no_devices():
    assert subsets([slot("a")], []) == []
