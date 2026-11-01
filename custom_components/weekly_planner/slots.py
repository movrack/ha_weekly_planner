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


def _rewrite_slots(program: Mapping, rewrite) -> dict:
    """Copy of ``program`` where ``rewrite(slot)`` returns the new slot, or None to delete it."""
    profiles = []
    for profile in program["profiles"]:
        days = []
        for day in profile["days"]:
            kept = []
            for slot in day:
                new = rewrite(slot) if slot.get("entities") is not None else slot
                if new is not None:
                    kept.append(new)
            days.append(kept)
        profiles.append({**profile, "days": days})
    return {**program, "profiles": profiles}


def _without_list(slot: Mapping) -> dict:
    return {key: value for key, value in slot.items() if key != "entities"}


def normalise_slot_entities(program: Mapping) -> dict:
    """D5 on a save: drop duplicates in each list, and a list naming every device of the program becomes absent.

    A single-device program therefore never keeps a list. Empty lists and unknown ids are left for
    ``check_program`` to refuse (``empty_slot_entities``, ``unknown_slot_entity``). Returns a copy; the input is
    untouched. The websocket layer is meant to call it before ``check_program`` (wired in lot 3); the validator
    itself does not rewrite what it is given.
    """
    every = {entity["entity_id"] for entity in program["entities"]}

    def rewrite(slot: Mapping) -> dict:
        targets = list(dict.fromkeys(slot["entities"]))
        if targets and set(targets) == every:
            return _without_list(slot)
        return {**slot, "entities": targets}

    return _rewrite_slots(program, rewrite)


def remove_device_from_slots(program: Mapping, entity_id: str) -> dict:
    """D5 when a device leaves a program: take it out of every list in EVERY mode (profile).

    A slot whose list becomes empty is deleted; a list equal to all remaining devices becomes absent. Slots without a
    list are untouched (they simply stop covering the device). ``program["entities"]`` is not modified: the caller
    removes the device itself; the remaining devices are the program's entities without ``entity_id``. Returns a copy.
    """
    remaining = {e["entity_id"] for e in program["entities"]} - {entity_id}

    def rewrite(slot: Mapping) -> dict | None:
        targets = [eid for eid in dict.fromkeys(slot["entities"]) if eid != entity_id]
        if not targets:
            return None
        if set(targets) == remaining:
            return _without_list(slot)
        return {**slot, "entities": targets}

    return _rewrite_slots(program, rewrite)
