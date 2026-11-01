"""Which devices of a program a slot applies to (per-device schedules, issue #34).

A slot may carry ``entities``: the entity ids it targets. Absent means every device of the
program, including devices added later. Pure functions, no Home Assistant state.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping


def applies(slot: Mapping, entity_id: str) -> bool:
    """True when the slot targets this device: no ``entities`` list, or the list contains it."""
    targets = slot.get("entities")
    return targets is None or entity_id in targets


def applicable_ids(slot: Mapping, entity_ids: Iterable[str]) -> tuple[str, ...]:
    """Devices of the program (in program order) the slot applies to."""
    return tuple(eid for eid in entity_ids if applies(slot, eid))


def subsets(day_slots: Iterable[Mapping], entity_ids: Iterable[str]) -> list[tuple[str, ...]]:
    """Distinct non-empty groups of devices sharing the same slots on a day.

    Devices are grouped by the exact set of slots that apply to them, so one trimmed timeline
    per group serves every device in it. Without any list, there is one group: all devices.
    Groups follow program order (first device of each group), devices inside follow program order.
    """
    ids = list(dict.fromkeys(entity_ids))
    slots = list(day_slots)
    groups: dict[tuple[int, ...], list[str]] = {}
    for eid in ids:
        key = tuple(i for i, slot in enumerate(slots) if applies(slot, eid))
        groups.setdefault(key, []).append(eid)
    return [tuple(group) for group in groups.values()]
