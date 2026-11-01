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


def big_program(index: int, *, condition: str | None = None) -> dict[str, Any]:
    """One program: 4 entities, 3 modes, 7 days x 6 slots each."""
    def day(mode: int, weekday: int) -> list[dict]:
        return [
            {"id": f"{MODES[mode]}{weekday}s{n}", "start": dict(start), "end": dict(end),
             "label": LABEL_IDS[(n + weekday + mode) % len(LABEL_IDS)],
             "conditions": [{"entity_id": condition, "op": "eq", "value": "on"}] if condition and n == 0 else []}
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


def big_programs(count: int = PROGRAMS, *, conditioned: int = 0) -> list[dict]:
    """``count`` programs; the first ``conditioned`` have a slot condition on ``binary_sensor.late<i>``."""
    return [big_program(i, condition=f"binary_sensor.late{i}" if i < conditioned else None)
            for i in range(count)]
