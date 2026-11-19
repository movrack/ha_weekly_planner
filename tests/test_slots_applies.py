"""Per-device slot targeting helpers (issue #34)."""

from custom_components.weekly_planner.slots import applicable_ids, applies

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
