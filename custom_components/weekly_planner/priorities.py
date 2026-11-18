"""Competition between programs and their rank (issue #60).

Programs that share at least one device compete; competition is transitive (A-B share a device, B-C another one:
one group A, B, C). Schedules and modes are ignored. The priority of a program is its rank in its group
(1 wins; ties go to the oldest program). The frontend module ``priority-groups.ts`` mirrors this logic.
"""

from __future__ import annotations

from .const import DEFAULT_PRIORITY

NEW_PLACEHOLDER = "new"  # stands for the program being created in a ``group_order`` sent with its save


def devices(program: dict) -> set[str]:
    return {e["entity_id"] for e in program.get("entities", [])}


def rank_key(program: dict) -> tuple[int, str]:
    """Order inside a group: smallest priority first, then the oldest program."""
    return program.get("priority", DEFAULT_PRIORITY), program.get("created_at", "")


def components(programs: list[dict]) -> list[list[dict]]:
    """Groups of programs linked through shared devices (union-find); singletons included, each group in rank order."""
    parent = list(range(len(programs)))

    def find(i: int) -> int:
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    owner: dict[str, int] = {}
    for i, program in enumerate(programs):
        for device in devices(program):
            parent[find(i)] = find(owner.setdefault(device, i))
    groups: dict[int, list[dict]] = {}
    for i, program in enumerate(programs):
        groups.setdefault(find(i), []).append(program)
    return [sorted(group, key=rank_key) for group in groups.values()]


def competing_groups(programs: list[dict]) -> list[list[dict]]:
    return [group for group in components(programs) if len(group) > 1]


def renumber_all(programs: list[dict]) -> None:
    """Storage migration: every group gets the ranks 1..n in its current order (in place)."""
    for group in components(programs):
        for rank, program in enumerate(group, 1):
            program["priority"] = rank


def _interleave(groups: list[list[dict]]) -> list[dict]:
    """Merged groups: all firsts, then all seconds...; same rank: the oldest program first."""
    ranked = [(position, program.get("created_at", ""), program) for group in groups
              for position, program in enumerate(group)]
    ranked.sort(key=lambda item: (item[0], item[1]))
    return [program for _, _, program in ranked]


def settle_saved(programs: list[dict], saved: dict, before_devices: set[str]) -> tuple[list[dict], bool]:
    """Order of the group of ``saved`` after its save (``programs`` already holds it) and whether ranks must be rewritten.

    A program that newly competes with a group goes last of it; when it joins several groups they are
    interleaved by rank, the saved program last. Without new competition the stored ranks stay.
    Returns ``([], False)`` when the program competes with nobody.
    """
    others = [p for p in programs if p["id"] != saved["id"]]
    joined = [g for g in components(others) if any(devices(saved) & devices(m) for m in g)]
    if not joined:
        return [], False
    newly = any(not any(before_devices & devices(m) for m in g) for g in joined)
    if not newly:
        return sorted([saved, *(m for g in joined for m in g)], key=rank_key), False
    return [*_interleave(joined), saved], True


def apply_order(group: list[dict], order: list[str], saved_id: str) -> list[dict]:
    """``group`` reordered as ``order`` says (ids; the placeholder is the saved program); unknown ids are ignored
    and members not listed keep their place after the listed ones."""
    by_id = {p["id"]: p for p in group}
    ids = [saved_id if i == NEW_PLACEHOLDER else i for i in order]
    listed = list(dict.fromkeys(i for i in ids if i in by_id))
    return [by_id[i] for i in listed] + [p for p in group if p["id"] not in listed]


def write_ranks(programs: list[dict], ordered: list[dict], same_revision: str = "") -> list[dict]:
    """Ranks 1..n for ``ordered`` inside ``programs``; a changed program gets a new revision (except ``same_revision``,
    the program being saved, whose revision is already new). Returns the changed programs."""
    changed = []
    for rank, member in enumerate(ordered, 1):
        index = next(i for i, p in enumerate(programs) if p["id"] == member["id"])
        current = programs[index]
        if current.get("priority") != rank:
            bump = 0 if current["id"] == same_revision else 1
            programs[index] = current = {**current, "priority": rank, "revision": current.get("revision", 0) + bump}
            changed.append(current)
    return changed

