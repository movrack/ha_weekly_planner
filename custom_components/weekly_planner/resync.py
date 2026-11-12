"""Resynchronise the devices after an outage (issue #52, docs/SPEC.md § 5.8, "Resynchronisation").

Pure logic (no Home Assistant objects): what each device should be doing now, from the resolved
occurrences, the time, the programs and the active mode. The history of a device is read through a
small injectable interface (:class:`ManualChanges`), so the rules are tested without a recorder.

Expected state of a device (decision of 2026-11-11):
- a schedule with an end: the one running now (same winner as the automatic run);
- a one-shot (no end): the last one that started less than 24 h ago, unless a person changed the device
  since it started (checked by the caller through :class:`ManualChanges`); no older schedule is replayed;
- between the two, the most recent start wins; simultaneous starts are told apart by the engine priority
  (lowest number first, then the oldest program);
- paused or switched-off programs are ignored; with no schedule running, the default of the owner applies.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, tzinfo
from typing import Protocol

from .const import DEFAULT_PRIORITY
from .resolver import (
    NO_HOLIDAY,
    ConditionCheck,
    Holiday,
    OccurrenceCache,
    Resolve,
    active_profile,
    occurrences_around,
    resolve_entity,
)
from .slots import applies
from .timeline import SunProvider

ONE_SHOT_WINDOW = timedelta(hours=24)

# Why a device is not sent (translated in messages.py, "resync_reason_<reason>").
SKIP_REASONS = (
    "vacation", "paused", "off", "no_action", "too_old", "manual_change", "unavailable", "duplicate",
    "other_program",
)


class ManualChanges(Protocol):
    """Reads the history of Home Assistant (injectable, a fake in tests)."""

    async def async_changed_by_person(self, entity_id: str, since: datetime, until: datetime) -> bool:
        """True when a person changed ``entity_id`` between ``since`` and ``until``.

        A person is a context with a ``user_id`` (Weekly Planner and automations have none); passages
        through ``unavailable`` / ``unknown`` never count.
        """


@dataclass(frozen=True, slots=True)
class Expected:
    """The state a device should be in now."""

    kind: str  # "slot" (schedule with an end) | "one_shot" | "default"
    program_id: str
    slot_id: str | None
    label: str | None
    action: dict
    start: datetime | None  # None: a default with no known start


@dataclass(frozen=True, slots=True)
class Decision:
    """``expected`` when the device must be sent, else ``reason`` (one of ``SKIP_REASONS``)."""

    expected: Expected | None = None
    reason: str | None = None


def _rank(program: dict) -> tuple[int, str]:
    return program.get("priority", DEFAULT_PRIORITY), program.get("created_at", "")


def expected_state(
    entity_id: str,
    programs: list[dict],
    resolve: Resolve,
    now: datetime,
    tz: tzinfo,
    sun: SunProvider,
    conditions_ok: ConditionCheck,
    *,
    vacation: bool = False,
    active_profiles: dict[str, str] | None = None,
    cache: OccurrenceCache | None = None,
    holiday: Holiday = NO_HOLIDAY,
) -> Decision:
    """What ``entity_id`` should be doing at ``now`` (UTC), before any history check."""
    active_profiles = active_profiles or {}
    cache = cache if cache is not None else OccurrenceCache()
    owners = [p for p in programs if any(e["entity_id"] == entity_id for e in p["entities"])]
    if vacation:
        return Decision(reason="vacation")
    enabled = sorted((p for p in owners if p.get("enabled", True)), key=_rank)
    if not enabled:
        return Decision(reason="paused" if any(p.get("paused_until") for p in owners) else "off")

    seg = resolve_entity(entity_id, programs, resolve, now, tz, sun, conditions_ok,
                         active_profiles=active_profiles, cache=cache, holiday=holiday)
    by_id = {p["id"]: p for p in enabled}
    running = seg.program_id if seg.in_slot else None
    running_rank = _rank(by_id[running])[0] if running in by_id else None

    # (start, rank, order, Expected) of every candidate; the best one wins.
    pool: list[tuple[datetime, tuple[int, str], int, Expected]] = []
    old_one_shot = False
    last_end: datetime | None = None  # latest end of a schedule on this device: where its default starts
    order = 0
    if seg.in_slot and seg.action is not None and seg.start is not None:
        pool.append((seg.start, _rank(by_id[seg.program_id]), -1,
                     Expected("slot", seg.program_id, seg.slot_id, seg.label, seg.action, seg.start)))
    for program in enabled:
        if not conditions_ok(program.get("conditions", [])):
            continue
        profile = active_profile(program, active_profiles)
        for occ, slot in occurrences_around(profile, now, tz, sun, days=(-2, -1, 0), program_id=program["id"],
                                            cache=cache, entity_id=entity_id, holiday=holiday):
            if not occ.runs or not applies(slot, entity_id):
                continue
            if occ.end is not None:
                if occ.end <= now and (last_end is None or occ.end > last_end):
                    last_end = occ.end
                continue
            if occ.start > now:
                continue
            if now - occ.start >= ONE_SHOT_WINDOW:
                old_one_shot = True
                continue
            if not conditions_ok(slot.get("conditions", [])):
                continue
            action = resolve(program, entity_id, slot.get("label"))
            if action is None:
                continue
            if running_rank is not None and running != program["id"] and running_rank < _rank(program)[0]:
                continue  # skipped under a higher priority schedule, as the automatic run does
            order += 1
            pool.append((occ.start, _rank(program), order,
                         Expected("one_shot", program["id"], slot["id"], slot.get("label"), action, occ.start)))
    if not seg.in_slot:  # the default only competes with what started after the last schedule ended
        pool = [item for item in pool if last_end is None or item[0] > last_end]
    if pool:
        # most recent start, then the engine priority (lowest number, oldest program), then the last fired
        best = min(pool, key=lambda item: (-item[0].timestamp(), item[1], -item[2]))
        return Decision(expected=best[3])
    if seg.action is not None and seg.program_id is not None:
        return Decision(expected=Expected("default", seg.program_id, None, seg.label, seg.action, last_end))
    return Decision(reason="too_old" if old_one_shot else "no_action")


async def settle_manual_change(
    decision: Decision, entity_id: str, now: datetime, history: ManualChanges | None,
) -> Decision:
    """A one-shot is not replayed over a manual change seen in the history since it started."""
    expected = decision.expected
    if expected is None or expected.kind != "one_shot" or history is None or expected.start is None:
        return decision
    target = expected.action.get("target_entity_id", entity_id)
    if await history.async_changed_by_person(target, expected.start, now):
        return Decision(reason="manual_change")
    return decision


# ---------------------------------------------------------------------------- history (recorder)


class RecorderManualChanges:
    """:class:`ManualChanges` over the Home Assistant recorder (database read in the recorder executor).

    Without a recorder the answer is "no visible intervention", which the rules treat as "apply".
    """

    def __init__(self, hass) -> None:  # noqa: ANN001 - HomeAssistant, kept untyped to stay importable in pure tests
        self._hass = hass

    @property
    def available(self) -> bool:
        return "recorder" in self._hass.config.components

    async def async_changed_by_person(self, entity_id: str, since: datetime, until: datetime) -> bool:
        if not self.available:
            return False
        from homeassistant.helpers.recorder import get_instance

        return bool(await get_instance(self._hass).async_add_executor_job(
            self._query, entity_id, since.timestamp(), until.timestamp()))

    def _query(self, entity_id: str, since_ts: float, until_ts: float) -> bool:
        from homeassistant.components.recorder.db_schema import States, StatesMeta
        from homeassistant.helpers.recorder import session_scope
        from sqlalchemy import select

        with session_scope(hass=self._hass, read_only=True) as session:
            rows = session.execute(
                select(States.state, States.context_user_id_bin)
                .join(StatesMeta, States.metadata_id == StatesMeta.metadata_id)
                .where(StatesMeta.entity_id == entity_id)
                .where(States.last_updated_ts > since_ts)
                .where(States.last_updated_ts <= until_ts)
                .order_by(States.last_updated_ts)
            ).all()
        return any(user is not None and state not in ("unavailable", "unknown") for state, user in rows)
