"""Program and slot conditions with last-known value and debounce (spec § 5.6)."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

UNKNOWN = ("unavailable", "unknown")


def condition_key(cond: dict) -> str:
    return f"{cond['entity_id']}|{cond.get('attribute') or ''}|{cond.get('op', 'eq')}|{cond.get('value')}"


def _compare(raw: Any, op: str, expected: Any) -> bool:
    if op in ("lt", "gt"):
        try:
            left, right = float(raw), float(expected)
        except (TypeError, ValueError):
            return False
        return left < right if op == "lt" else left > right
    equal = str(raw) == str(expected)
    return equal if op == "eq" else not equal


class ConditionTracker:
    """Effective truth of each condition: last known value, changes held for ``debounce``."""

    def __init__(self, debounce: timedelta) -> None:
        self.debounce = debounce
        # key -> {"effective": bool | None, "pending": bool | None, "since": datetime | None}
        self._state: dict[str, dict[str, Any]] = {}

    def restore(self, data: dict[str, bool]) -> None:
        """Last persisted effective values: used as-is at startup, without debounce."""
        for key, value in data.items():
            self._state[key] = {"effective": value, "pending": None, "since": None}

    def dump(self) -> dict[str, bool]:
        return {k: v["effective"] for k, v in self._state.items() if v["effective"] is not None}

    def observe(self, cond: dict, state: Any, now: datetime) -> bool:
        """Feed the current state of a condition's entity; True if the effective value changed."""
        key = condition_key(cond)
        entry = self._state.setdefault(key, {"effective": None, "pending": None, "since": None})
        if state is None or state.state in UNKNOWN:
            entry["pending"] = None  # keep the last known value
            return False
        raw = state.attributes.get(cond["attribute"]) if cond.get("attribute") else state.state
        value = _compare(raw, cond.get("op", "eq"), cond.get("value"))
        if entry["effective"] is None:  # first known value: no debounce
            entry.update(effective=value, pending=None, since=None)
            return True
        if value == entry["effective"]:
            entry.update(pending=None, since=None)
            return False
        if entry["pending"] != value:
            entry.update(pending=value, since=now)
        if now - entry["since"] >= self.debounce:
            entry.update(effective=value, pending=None, since=None)
            return True
        return False

    def next_settle(self) -> datetime | None:
        """When the earliest pending change becomes effective."""
        times = [e["since"] + self.debounce for e in self._state.values() if e["pending"] is not None]
        return min(times) if times else None

    def settle(self, now: datetime) -> bool:
        """Apply pending changes whose debounce elapsed; True if anything changed."""
        changed = False
        for entry in self._state.values():
            if entry["pending"] is not None and now - entry["since"] >= self.debounce:
                entry.update(effective=entry["pending"], pending=None, since=None)
                changed = True
        return changed

    def known(self, conditions: list[dict]) -> bool:
        return all(self._state.get(condition_key(c), {}).get("effective") is not None for c in conditions)

    def check(self, conditions: list[dict]) -> bool:
        """All conditions true (unknown counts as false)."""
        return all(self._state.get(condition_key(c), {}).get("effective") is True for c in conditions)
