"""Synthetic large install shared by the performance tests and ``scripts/bench.py``."""

from __future__ import annotations

from typing import Any

PROGRAMS = 50
ENTITIES_PER_PROGRAM = 4
MODES = ("base", "away", "vacation")
LABEL_IDS = ("t21", "t19", "t25", "boost")

# 6 slots a day: fixed, random start, sun start, fixed, two random edges, sun start with delay.
_DAY_PATTERN: list[tuple[dict, dict]] = [
    ({"time": "00:30"}, {"time": "02:00"}),
    ({"time": "03:00", "random_minutes": 10}, {"time": "04:00"}),
    ({"sun": "sunrise", "offset": 15}, {"time": "10:00"}),
    ({"time": "11:00"}, {"time": "12:00"}),
    ({"time": "14:00", "random_minutes": 5}, {"time": "15:00", "random_minutes": 5}),
    ({"sun": "sunset", "random_minutes": 10}, {"time": "23:00"}),
]


def entity_ids(index: int) -> list[str]:
    return [f"climate.p{index}_e{k}" for k in range(ENTITIES_PER_PROGRAM)]


def _targets(eids: list[str], n: int, weekday: int) -> dict[str, Any]:
    """Per-device list of slot ``n`` (``per_device``): every other slot targets a rotating half of the
    devices, the others stay shared (no list). Slots of a day never overlap, so any list is valid."""
    if n % 2 == 0:
        return {}
    half = len(eids) // 2 or 1
    first = (n + weekday) % len(eids)
    return {"entities": sorted({eids[(first + k) % len(eids)] for k in range(half)})}


def big_program(index: int, *, condition: str | None = None, per_device: bool = False) -> dict[str, Any]:
    """One program: 4 entities, 3 modes, 7 days x 6 slots each (``per_device``: half of them with lists)."""
    eids = entity_ids(index)

    def day(mode: int, weekday: int) -> list[dict]:
        return [
            {"id": f"{MODES[mode]}{weekday}s{n}", "start": dict(start), "end": dict(end),
             "label": LABEL_IDS[(n + weekday + mode) % len(LABEL_IDS)],
             "conditions": [{"entity_id": condition, "op": "eq", "value": "on"}] if condition and n == 0 else [],
             **(_targets(eids, n, weekday) if per_device else {})}
            for n, (start, end) in enumerate(_DAY_PATTERN)
        ]
    return {
        "id": f"p{index}", "name": f"Program {index}", "priority": 10 + index % 5, "enabled": True,
        "reapply": True, "created_at": f"2026-01-{1 + index % 28:02d}T00:00:00+00:00", "revision": 1,
        "conditions": [],
        "entities": [{"entity_id": eid, "default_label": "t15", "label_overrides": {}} for eid in entity_ids(index)],
        "profiles": [{"id": m, "name": m.title(), "days": [day(i, w) for w in range(7)]}
                     for i, m in enumerate(MODES)],
    }


def big_programs(count: int = PROGRAMS, *, conditioned: int = 0, per_device: bool = False) -> list[dict]:
    """``count`` programs; the first ``conditioned`` have a slot condition on ``binary_sensor.late<i>``."""
    return [big_program(i, condition=f"binary_sensor.late{i}" if i < conditioned else None, per_device=per_device)
            for i in range(count)]


WIDE_DEVICES = 100
# 7 time-disjoint slots a day plus one shared slot and one shared one-shot: slot j targets the devices
# whose (index + 1) has bit j set, so the 100 devices have 100 different sets of slots (all-different lists).
_WIDE_BITS = 7
_WIDE_TIMES = [("00:30", "02:00"), ("03:00", "04:00"), ("05:00", "07:00"), ("08:00", "10:00"),
               ("11:00", "12:00"), ("14:00", "15:00"), ("17:00", "19:00")]


def wide_entity_ids(devices: int = WIDE_DEVICES) -> list[str]:
    return [f"climate.w{k}" for k in range(devices)]


def wide_program(devices: int = WIDE_DEVICES) -> dict[str, Any]:
    """One program x ``devices`` devices with all-different per-device lists (issue #34)."""
    eids = wide_entity_ids(devices)

    def day(mode: int, weekday: int) -> list[dict]:
        slots = []
        for bit, (start, end) in enumerate(_WIDE_TIMES[:_WIDE_BITS]):
            slots.append({
                "id": f"{MODES[mode]}{weekday}b{bit}", "start": {"time": start, **({"random_minutes": 10} if bit % 3 == 1 else {})},
                "end": {"time": end}, "label": LABEL_IDS[(bit + weekday + mode) % len(LABEL_IDS)], "conditions": [],
                "entities": [eid for i, eid in enumerate(eids) if (i + 1) >> bit & 1],
            })
        slots.append({"id": f"{MODES[mode]}{weekday}all", "start": {"sun": "sunset", "random_minutes": 10},
                      "end": {"time": "23:00"}, "label": "t19", "conditions": []})
        slots.append({"id": f"{MODES[mode]}{weekday}shot", "start": {"time": "21:00"}, "end": None,
                      "label": "boost", "conditions": [], "entities": eids[::2]})
        return slots

    return {
        "id": "wide", "name": "Wide", "priority": 10, "enabled": True, "reapply": True,
        "created_at": "2026-01-01T00:00:00+00:00", "revision": 1, "conditions": [],
        "entities": [{"entity_id": eid, "default_label": "t15", "label_overrides": {}} for eid in eids],
        "profiles": [{"id": m, "name": m.title(), "days": [day(i, w) for w in range(7)]}
                     for i, m in enumerate(MODES)],
    }
