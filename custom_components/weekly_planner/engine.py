"""The planner engine: turns segments into actions and watches what devices do.

Rules: docs/SPEC.md § 5. The engine acts only on segment transitions, never re-sends a
setpoint to an entity that someone changed by hand, and remembers why it did what it did.
"""

from __future__ import annotations

import asyncio
from collections import deque
from collections.abc import Callable
from datetime import date, datetime, timedelta
import logging
from typing import Any

from homeassistant.components import persistent_notification
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import CALLBACK_TYPE, Context, Event, HomeAssistant, State, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_track_point_in_utc_time, async_track_state_change_event
from homeassistant.helpers.sun import get_astral_event_date
from homeassistant.util import dt as dt_util
from homeassistant.util.ulid import ulid_now

from .conditions import ConditionTracker
from .const import DOMAIN
from .resolver import Segment, default_of, entity_type, resolve_entity, next_transition, occurrences_around, active_profile, slot_setpoint
from .setpoints import calls_for, is_one_shot, matches, snapshot
from .store import PlannerStore

_LOGGER = logging.getLogger(__name__)

STABILIZATION = timedelta(seconds=30)
DEFAULT_GRACE = timedelta(seconds=60)
CLOUD_GRACE = timedelta(minutes=6)
CLOUD_PLATFORMS = frozenset({"evohome"})
RETRY_STEPS = (1, 2, 5, 10, 15)  # minutes, then every 15
CONTEXT_MEMORY = timedelta(minutes=10)
UNAVAILABLE = ("unavailable", "unknown")

# Reasons that only re-apply when the program asks for it (spec § 5.5)
REAPPLY_REASONS = frozenset({"startup", "enable", "modification", "profile", "vacation_off"})

SIGNAL_UPDATED = f"{DOMAIN}_updated"


class PlannerEngine:
    """Owns timers, listeners and per-entity runtime state."""

    def __init__(
        self, hass: HomeAssistant, store: PlannerStore, options: dict[str, Any], entry_id: str = ""
    ) -> None:
        self.hass = hass
        self.entry_id = entry_id
        self.store = store
        self.options = options
        self.conditions = ConditionTracker(timedelta(minutes=options.get("debounce_min", 2)))
        self._contexts: deque[tuple[datetime, str]] = deque()
        self._unsubs: list[CALLBACK_TYPE] = []  # state listeners, rebuilt on config changes
        self._static_unsubs: list[CALLBACK_TYPE] = []  # lifecycle listeners
        self._timer: CALLBACK_TYPE | None = None
        self._tasks: dict[str, asyncio.Task] = {}
        self._ready = False
        self._listeners: list[Callable[[], None]] = []

    # ------------------------------------------------------------------ lifecycle

    async def async_start(self) -> None:
        from .registry import async_track_registry

        self.conditions.restore(self.store.runtime.get("conditions", {}))
        self._subscribe()
        self._static_unsubs.append(async_track_registry(self.hass, self))
        if self.hass.is_running:
            self._schedule_startup()
        else:
            self._static_unsubs.append(
                self.hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, lambda _e: self._schedule_startup())
            )

    @callback
    def _schedule_startup(self) -> None:
        self._static_unsubs.append(
            async_track_point_in_utc_time(self.hass, self._async_startup, dt_util.utcnow() + STABILIZATION)
        )

    async def _async_startup(self, _now: datetime | None = None) -> None:
        from .registry import async_check_missing

        self._ready = True
        async_check_missing(self.hass, self)
        self._observe_all_conditions(initial=True)
        await self.async_recompute("startup")

    async def async_stop(self) -> None:
        for unsub in self._unsubs + self._static_unsubs:
            unsub()
        self._unsubs.clear()
        self._static_unsubs.clear()
        if self._timer:
            self._timer()
            self._timer = None
        for task in self._tasks.values():
            task.cancel()
        self._tasks.clear()
        self._persist()

    def add_listener(self, listener: Callable[[], None]) -> Callable[[], None]:
        self._listeners.append(listener)
        return lambda: self._listeners.remove(listener)

    def _notify_listeners(self) -> None:
        for listener in list(self._listeners):
            listener()

    # ------------------------------------------------------------------ helpers

    @property
    def tz(self):
        return dt_util.get_default_time_zone()

    def sun(self, event: str, day: date) -> datetime | None:
        return get_astral_event_date(self.hass, event, day)

    def managed_entities(self) -> set[str]:
        return {e["entity_id"] for p in self.store.programs for e in p["entities"]}

    def _profiles(self) -> dict[str, str]:
        return {pid: r["active_profile"] for pid, r in self.store.runtime["programs"].items()
                if r.get("active_profile")}

    def segment(self, entity_id: str, at: datetime | None = None) -> Segment:
        return resolve_entity(
            entity_id, self.store.programs, self.store.modes, at or dt_util.utcnow(), self.tz,
            self.sun, self.conditions.check, vacation=self.store.config.get("vacation", False),
            active_profiles=self._profiles(),
        )

    def rt(self, entity_id: str) -> dict[str, Any]:
        return self.store.entity_runtime(entity_id)

    def _persist(self) -> None:
        self.store.runtime["conditions"] = self.conditions.dump()
        self.store.save_runtime()

    def new_context(self, parent: Context | None = None) -> Context:
        now = dt_util.utcnow()
        context = Context(id=ulid_now(), parent_id=parent.id if parent else None)
        self._contexts.append((now, context.id))
        while self._contexts and now - self._contexts[0][0] > CONTEXT_MEMORY:
            self._contexts.popleft()
        return context

    def is_ours(self, context: Context | None) -> bool:
        if context is None:
            return False
        ids = {cid for _, cid in self._contexts}
        return context.id in ids or (context.parent_id is not None and context.parent_id in ids)

    def grace_for(self, entity_id: str) -> timedelta:
        program_entity = self._program_entity(entity_id)
        if program_entity and program_entity.get("grace_s"):
            return timedelta(seconds=program_entity["grace_s"])
        entry = er.async_get(self.hass).async_get(entity_id)
        return CLOUD_GRACE if entry and entry.platform in CLOUD_PLATFORMS else DEFAULT_GRACE

    def _program_entity(self, entity_id: str) -> dict | None:
        for program in sorted(self.store.programs, key=lambda p: p.get("priority", 100)):
            for entity in program["entities"]:
                if entity["entity_id"] == entity_id:
                    return entity
        return None

    def effective_target(self, entity_id: str) -> dict | None:
        """Target used for checks: voluntary override, else planning (spec § 5.1)."""
        rt = self.rt(entity_id)
        if (override := rt.get("override")) and override.get("origin") == "voluntary":
            return override.get("setpoint")
        if override or rt.get("suppressed"):
            return None
        return rt.get("target")

    def active_profile_id(self, program_id: str) -> str | None:
        program = self.store.program(program_id)
        if not program:
            return None
        return active_profile(program, self._profiles())["id"]

    def program_status(self, program_id: str) -> dict[str, Any]:
        """What a program does now (switch attributes, card summary)."""
        program = self.store.program(program_id)
        if not program:
            return {}
        now = dt_util.utcnow()
        current: dict[str, Any] = {}
        overrides: list[str] = []
        for entity in program["entities"]:
            eid = entity["entity_id"]
            rt = self.rt(eid)
            seg = rt.get("segment") or []
            if seg and seg[0] == "slot" and seg[1] == program_id:
                current[eid] = seg[2]
            if rt.get("override"):
                overrides.append(eid)
        nxt = next_transition([program], now, self.tz, self.sun, active_profiles=self._profiles())
        prt = self.store.runtime["programs"].get(program_id, {})
        return {
            "program_id": program_id,
            "active_profile": self.active_profile_id(program_id),
            "current_slots": current,
            "next_change": nxt.isoformat() if nxt else None,
            "entities_overridden": overrides,
            "skip_next": prt.get("skip_at"),
        }

    # ------------------------------------------------------------------ subscriptions

    def _subscribe(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        watched = set(self.managed_entities())
        watched |= {c["entity_id"] for c in self._all_conditions()}
        watched |= set(self._adaptive_switches())
        if watched:
            self._unsubs.append(async_track_state_change_event(self.hass, sorted(watched), self._on_state))

    def _all_conditions(self) -> list[dict]:
        conds: list[dict] = []
        for program in self.store.programs:
            conds += program.get("conditions", [])
            for profile in program["profiles"]:
                for day in profile["days"]:
                    for slot in day:
                        conds += slot.get("conditions", [])
        return conds

    def _adaptive_switches(self) -> list[str]:
        return [s.entity_id for s in self.hass.states.async_all("switch")
                if s.entity_id.startswith("switch.adaptive_lighting_")
                and isinstance(s.attributes.get("configuration"), dict)]

    def _observe_all_conditions(self, initial: bool = False) -> bool:
        now = dt_util.utcnow()
        changed = False
        for cond in self._all_conditions():
            changed |= self.conditions.observe(cond, self.hass.states.get(cond["entity_id"]), now)
        return changed

    @callback
    def _on_state(self, event: Event) -> None:
        entity_id = event.data["entity_id"]
        new: State | None = event.data.get("new_state")
        old: State | None = event.data.get("old_state")
        if not self._ready:
            return
        now = dt_util.utcnow()
        # conditions
        cond_changed = False
        for cond in self._all_conditions():
            if cond["entity_id"] == entity_id:
                cond_changed |= self.conditions.observe(cond, new, now)
        if cond_changed:
            self.hass.async_create_task(self.async_recompute("condition"))
        else:
            self._arm_timer()
        if entity_id.startswith("switch.adaptive_lighting_"):
            self.hass.async_create_task(self._async_reaffirm_adaptive())
        if entity_id in self.managed_entities():
            self._check_entity_change(entity_id, old, new, event.context)

    @callback
    def _check_entity_change(self, entity_id: str, old: State | None, new: State | None, context: Context) -> None:
        rt = self.rt(entity_id)
        if new is None:
            return
        if new.state in UNAVAILABLE:
            return
        if old is None or old.state in UNAVAILABLE:
            # back online: apply what should be there if something is pending (spec D17)
            if rt.get("pending"):
                self.hass.async_create_task(self.async_apply(entity_id, "back_online"))
            return
        if entity_id.startswith("light.") and old.state == "off" and new.state == "on":
            self.hass.async_create_task(self._async_reaffirm_adaptive(entity_id))
        if self.is_ours(context):
            return
        now = dt_util.utcnow()
        grace_until = self.store.parse(rt.get("grace_until"))
        if grace_until and now < grace_until:
            return
        target = self.effective_target(entity_id)
        if target is None:
            return
        if ":al:" in (context.id or "") and (target.get("kind") == "auto" or rt.get("adaptive_manual")):
            return
        result = matches(new, target)
        if result is not False:
            return
        # someone changed it: manual override until the next transition (spec § 5.3)
        rt["override"] = {"origin": "external", "since": now.isoformat(), "segment": rt.get("segment")}
        rt.pop("pending", None)
        self._cancel_task(entity_id)
        self._persist()
        self._log(entity_id, "override_detected", {})
        self._notify_listeners()

    # ------------------------------------------------------------------ recompute

    async def async_recompute(self, reason: str, program_id: str | None = None) -> None:
        """Re-evaluate every managed entity and act on segment changes."""
        if not self._ready:
            return
        now = dt_util.utcnow()
        self.conditions.settle(now)
        await self._fire_one_shots(now)
        for entity_id in sorted(self.managed_entities()):
            await self._process_entity(entity_id, reason, now, program_id)
        self.store.runtime["last_tick"] = now.isoformat()
        self._persist()
        self._arm_timer()
        self._notify_listeners()

    async def _process_entity(self, entity_id: str, reason: str, now: datetime, program_id: str | None) -> None:
        rt = self.rt(entity_id)
        seg = self.segment(entity_id, now)
        key = list(seg.key)
        changed = rt.get("segment") != key
        override = rt.get("override")

        # voluntary override deadline
        if override and override.get("origin") == "voluntary":
            until = self.store.parse(override.get("until"))
            ended = (until and now >= until) or (override.get("until") is None and changed)
            if ended:
                rt.pop("override", None)
                override = None
                changed = True  # apply the planning target now, even with reapply off
                reason = "override_end"
            elif changed:
                self._enter_segment(entity_id, seg, key, now)
                return  # transitions during a voluntary override are not applied

        if not changed and reason not in REAPPLY_REASONS and reason != "override_end":
            return

        program = self.store.program(seg.program_id) if seg.program_id else None
        reapply = program.get("reapply", True) if program else True
        if changed and override and override.get("origin") == "external":
            rt.pop("override", None)
            override = None
        if not changed and override:
            return  # persisted override wins over reapply (spec § 5.3)

        skip = self._consume_skip(seg.program_id, now) if changed else False
        self._enter_segment(entity_id, seg, key, now)
        if skip:
            rt["suppressed"] = True
            return
        if reason in REAPPLY_REASONS and not reapply and not self._missed_end(rt, seg):
            rt["suppressed"] = True
            return
        if reason == "condition" and seg.in_slot and not reapply:
            rt["suppressed"] = True
            return
        if rt.get("oneshot") and not changed:
            return
        await self.async_apply(entity_id, reason)

    def _missed_end(self, rt: dict, seg: Segment) -> bool:
        """A slot ended while Home Assistant was down: its end always runs (spec § 5.5)."""
        previous = rt.get("previous_segment")
        return bool(previous and previous[0] == "slot" and not seg.in_slot)

    def _enter_segment(self, entity_id: str, seg: Segment, key: list, now: datetime) -> None:
        rt = self.rt(entity_id)
        previous_key = rt.get("segment")
        if previous_key != key:
            rt["previous_segment"] = previous_key
            if seg.in_slot and (not previous_key or previous_key[0] != "slot"):
                # remember the out-of-slot state (planning target if a voluntary override runs)
                override = rt.get("override")
                if override and override.get("origin") == "voluntary":
                    rt["outside"] = rt.get("target")
                else:
                    rt["outside"] = snapshot(self.hass.states.get(entity_id))
            rt.pop("oneshot", None)
            self.store.record_segment({
                "at": now.isoformat(), "entity_id": entity_id, "segment": key,
                "program_id": seg.program_id, "slot_id": seg.slot_id, "setpoint": self._target_of(entity_id, seg),
            })
        rt["segment"] = key
        rt["target"] = self._target_of(entity_id, seg)
        rt.pop("suppressed", None)

    def _target_of(self, entity_id: str, seg: Segment) -> dict | None:
        if seg.default_kind == "previous":
            return self.rt(entity_id).get("outside")
        return seg.setpoint

    def _consume_skip(self, program_id: str | None, now: datetime) -> bool:
        if not program_id:
            return False
        prt = self.store.runtime["programs"].get(program_id, {})
        skip_at = self.store.parse(prt.get("skip_at"))
        if skip_at and now >= skip_at:
            prt["skip_consumed"] = True
            return True
        return False

    async def _fire_one_shots(self, now: datetime) -> None:
        """Run one-shot slots whose time came since the last tick (spec § 5.2)."""
        last = self.store.parse(self.store.runtime.get("last_tick"))
        if last is None or self.store.config.get("vacation"):
            return
        for program in self.store.programs:
            if not program.get("enabled", True) or not self.conditions.check(program.get("conditions", [])):
                continue
            profile = active_profile(program, self._profiles())
            for occ, slot in occurrences_around(profile, now, self.tz, self.sun):
                if occ.end is not None or not occ.runs or not (last < occ.start <= now):
                    continue
                if not self.conditions.check(slot.get("conditions", [])):
                    continue
                for entity in program["entities"]:
                    eid = entity["entity_id"]
                    setpoint = slot_setpoint(slot, eid, self.store.modes)
                    if setpoint is None:
                        continue
                    seg = self.segment(eid, now)
                    higher = seg.in_slot and seg.program_id != program["id"] and self._priority(seg.program_id) < program.get("priority", 100)
                    if higher or self.rt(eid).get("override"):
                        continue  # skipped under a higher priority slot or an override (Q-L)
                    if not is_one_shot(setpoint):
                        self.rt(eid)["oneshot"] = True
                        self.rt(eid)["target"] = setpoint
                    await self._async_send(eid, setpoint, "one_shot")
        for prt in self.store.runtime["programs"].values():
            if prt.pop("skip_consumed", False):
                prt.pop("skip_at", None)

    def _priority(self, program_id: str | None) -> int:
        program = self.store.program(program_id) if program_id else None
        return program.get("priority", 100) if program else 100

    # ------------------------------------------------------------------ timer

    @callback
    def _arm_timer(self) -> None:
        if self._timer:
            self._timer()
            self._timer = None
        now = dt_util.utcnow()
        candidates = [
            next_transition(self.store.programs, now, self.tz, self.sun, active_profiles=self._profiles()),
            self.conditions.next_settle(),
            self._next_local_midnight(now),
        ]
        for rt in self.store.runtime["entities"].values():
            override = rt.get("override") or {}
            candidates.append(self.store.parse(override.get("until")))
            candidates.append(self.store.parse(rt.get("retry_at")))
            candidates.append(self.store.parse(rt.get("notify_at")))
        moments = [c for c in candidates if c is not None]
        if not moments:
            return
        wake = max(min(moments), now + timedelta(seconds=1))
        self._timer = async_track_point_in_utc_time(self.hass, self._async_on_timer, wake)

    def _next_local_midnight(self, now: datetime) -> datetime:
        local = now.astimezone(self.tz)
        tomorrow = (local + timedelta(days=1)).date()
        return datetime(tomorrow.year, tomorrow.month, tomorrow.day, tzinfo=self.tz).astimezone(dt_util.UTC)

    async def _async_on_timer(self, _now: datetime) -> None:
        self._timer = None
        now = dt_util.utcnow()
        for entity_id, rt in list(self.store.runtime["entities"].items()):
            retry_at = self.store.parse(rt.get("retry_at"))
            if retry_at and now >= retry_at:
                rt.pop("retry_at", None)
                await self._async_verify(entity_id)
            notify_at = self.store.parse(rt.get("notify_at"))
            if notify_at and now >= notify_at:
                rt.pop("notify_at", None)
                self._notify_failure(entity_id)
        await self.async_recompute("timer")

    # ------------------------------------------------------------------ actions

    async def async_apply(self, entity_id: str, reason: str) -> None:
        """Send the effective target of an entity (single task in flight per entity)."""
        target = self.effective_target(entity_id)
        if target is None:
            return
        await self._async_send(entity_id, target, reason)

    def _cancel_task(self, entity_id: str) -> None:
        if task := self._tasks.pop(entity_id, None):
            task.cancel()

    async def _async_send(self, entity_id: str, setpoint: dict, reason: str) -> None:
        rt = self.rt(entity_id)
        state = self.hass.states.get(entity_id)
        if state is None or state.state in UNAVAILABLE:
            if not is_one_shot(setpoint):
                rt["pending"] = True
                self._schedule_notify(entity_id)
            self._log(entity_id, "waiting_unavailable", {"reason": reason})
            return
        if self._vt_blocks_automations(state):
            self._log(entity_id, "locked", {})
            persistent_notification.async_create(
                self.hass, f"{entity_id} is locked: Weekly Planner cannot change it.",
                title="Weekly Planner", notification_id=f"{DOMAIN}_{entity_id}_locked")
            return
        self._cancel_task(entity_id)
        segment = rt.get("segment")
        self._tasks[entity_id] = self.hass.async_create_task(
            self._async_send_calls(entity_id, setpoint, reason, segment)
        )

    async def _async_send_calls(self, entity_id: str, setpoint: dict, reason: str, segment: Any) -> None:
        rt = self.rt(entity_id)
        context = self.new_context()
        try:
            await self._prepare(entity_id, setpoint, context)
            for call in calls_for(entity_id, setpoint):
                if rt.get("segment") != segment:
                    return  # segment changed meanwhile: this action is stale (spec § 5.1)
                await self.hass.services.async_call(
                    call.domain, call.service, call.service_data(entity_id), blocking=True,
                    context=self.new_context(context),
                )
        except asyncio.CancelledError:
            raise
        except Exception as err:  # noqa: BLE001 - any service failure is retried
            _LOGGER.warning("Applying %s to %s failed: %s", setpoint, entity_id, err)
        finally:
            self._tasks.pop(entity_id, None)
        rt.pop("pending", None)
        if is_one_shot(setpoint):
            self._log(entity_id, "applied", {"setpoint": setpoint, "reason": reason})
            return
        now = dt_util.utcnow()
        rt["grace_until"] = (now + self.grace_for(entity_id)).isoformat()
        rt["retry_at"] = rt["grace_until"]
        rt["attempt"] = 0
        self._schedule_notify(entity_id)
        if reason != "retry":  # one logbook entry per decision, not per attempt
            self._log(entity_id, "applied", {"setpoint": setpoint, "reason": reason})
        self._persist()
        self._arm_timer()

    async def _prepare(self, entity_id: str, setpoint: dict, context: Context) -> None:
        """Device-specific steps before the setpoint (Evohome permanent, Adaptive Lighting)."""
        entity = self._program_entity(entity_id) or {}
        state = self.hass.states.get(entity_id)
        if (
            entity.get("force_permanent")
            and state is not None
            and "permanent" in (state.attributes.get("preset_modes") or [])
            and state.attributes.get("preset_mode") != "permanent"
        ):
            await self.hass.services.async_call(
                "climate", "set_preset_mode", {"entity_id": entity_id, "preset_mode": "permanent"},
                blocking=True, context=self.new_context(context))
            self.rt(entity_id)["permanent_set"] = True
        if entity_id.startswith("light."):
            await self._async_adaptive_for(entity_id, setpoint, context)

    async def _async_verify(self, entity_id: str) -> None:
        rt = self.rt(entity_id)
        target = self.effective_target(entity_id)
        if target is None:
            return
        state = self.hass.states.get(entity_id)
        result = matches(state, target)
        if result is None and state is not None and state.state not in UNAVAILABLE:
            rt["retry_at"] = (dt_util.utcnow() + timedelta(minutes=1)).isoformat()  # still moving
            return
        if result:
            rt.pop("attempt", None)
            rt.pop("notify_at", None)
            persistent_notification.async_dismiss(self.hass, f"{DOMAIN}_{entity_id}_failed")
            return
        attempt = rt.get("attempt", 0)
        rt["attempt"] = attempt + 1
        delay = RETRY_STEPS[attempt] if attempt < len(RETRY_STEPS) else RETRY_STEPS[-1]
        rt["retry_at"] = (dt_util.utcnow() + timedelta(minutes=delay)).isoformat()
        await self.async_apply(entity_id, "retry")

    def _schedule_notify(self, entity_id: str) -> None:
        rt = self.rt(entity_id)
        if not rt.get("notify_at"):
            delay = timedelta(minutes=self.options.get("notify_delay_min", 30))
            rt["notify_at"] = (dt_util.utcnow() + delay).isoformat()

    def _notify_failure(self, entity_id: str) -> None:
        target = self.effective_target(entity_id)
        if target is None or matches(self.hass.states.get(entity_id), target):
            return
        persistent_notification.async_create(
            self.hass,
            f"{entity_id} has not reached its scheduled setpoint ({target}).",
            title="Weekly Planner",
            notification_id=f"{DOMAIN}_{entity_id}_failed",
        )
        self._log(entity_id, "failed", {"setpoint": target})

    @staticmethod
    def _vt_blocks_automations(state: State) -> bool:
        lock = state.attributes.get("lock_manager")
        if not isinstance(lock, dict):
            return False
        return bool(lock.get("is_locked")) and bool(lock.get("lock_automations", True))

    # ------------------------------------------------------------------ Adaptive Lighting

    def _adaptive_switch_for(self, light: str) -> str | None:
        for switch in self._adaptive_switches():
            state = self.hass.states.get(switch)
            lights = (state.attributes.get("configuration") or {}).get("lights") or []
            if light in lights:
                return switch
        return None

    async def _async_adaptive_for(self, entity_id: str, setpoint: dict, context: Context) -> None:
        """Fixed setpoint → manual control on; "auto" → manual control off (spec § 6.1)."""
        switch = self._adaptive_switch_for(entity_id)
        if switch is None or not self.hass.services.has_service("adaptive_lighting", "set_manual_control"):
            return
        manual = setpoint.get("kind") not in ("auto", "off")
        rt = self.rt(entity_id)
        if manual == bool(rt.get("adaptive_manual")) and not manual:
            return
        await self.hass.services.async_call(
            "adaptive_lighting", "set_manual_control",
            {"entity_id": switch, "lights": [entity_id], "manual_control": manual},
            blocking=True, context=self.new_context(context))
        rt["adaptive_manual"] = manual

    async def _async_reaffirm_adaptive(self, light: str | None = None) -> None:
        """Adaptive Lighting forgets manual control: say it again (S41)."""
        for entity_id, rt in self.store.runtime["entities"].items():
            if not rt.get("adaptive_manual") or (light and entity_id != light):
                continue
            switch = self._adaptive_switch_for(entity_id)
            if switch is None:
                continue
            await self.hass.services.async_call(
                "adaptive_lighting", "set_manual_control",
                {"entity_id": switch, "lights": [entity_id], "manual_control": True},
                blocking=True, context=self.new_context())
            rt["grace_until"] = (dt_util.utcnow() + DEFAULT_GRACE).isoformat()

    # ------------------------------------------------------------------ commands

    async def async_resume(self, entity_ids: list[str]) -> None:
        for entity_id in entity_ids:
            rt = self.rt(entity_id)
            rt.pop("override", None)
            rt.pop("suppressed", None)
            seg = self.segment(entity_id)
            self._enter_segment(entity_id, seg, list(seg.key), dt_util.utcnow())
            self._log(entity_id, "resumed", {})
            await self.async_apply(entity_id, "resume")
        self._persist()
        self._arm_timer()
        self._notify_listeners()

    async def async_override(self, entity_id: str, setpoint: dict, until: datetime | None) -> None:
        """Voluntary override (spec § 5.9); ``until`` None = until the next transition."""
        rt = self.rt(entity_id)
        rt["override"] = {"origin": "voluntary", "setpoint": setpoint,
                          "until": until.isoformat() if until else None,
                          "since": dt_util.utcnow().isoformat()}
        self._log(entity_id, "override_set", {"setpoint": setpoint, "until": rt["override"]["until"]})
        await self._async_send(entity_id, setpoint, "override")
        self._persist()
        self._arm_timer()
        self._notify_listeners()

    async def async_cancel_voluntary(self, entity_ids: list[str]) -> None:
        """Vacation, deactivation and profile change cancel voluntary overrides (Q-I)."""
        for entity_id in entity_ids:
            override = self.rt(entity_id).get("override")
            if override and override.get("origin") == "voluntary":
                self.rt(entity_id).pop("override", None)

    async def async_apply_now(self, program_id: str) -> None:
        program = self.store.program(program_id)
        if not program:
            return
        for entity in program["entities"]:
            eid = entity["entity_id"]
            rt = self.rt(eid)
            if rt.get("override"):
                continue
            seg = self.segment(eid)
            if seg.program_id == program_id:
                self._enter_segment(eid, seg, list(seg.key), dt_util.utcnow())
                await self.async_apply(eid, "apply_now")

    def skip_next(self, program_id: str, cancel: bool = False) -> None:
        prt = self.store.runtime["programs"].setdefault(program_id, {})
        if cancel:
            prt.pop("skip_at", None)
        else:
            program = self.store.program(program_id)
            nxt = next_transition([program], dt_util.utcnow(), self.tz, self.sun,
                                  active_profiles=self._profiles()) if program else None
            if nxt:
                prt["skip_at"] = nxt.isoformat()
        self._persist()
        self._notify_listeners()

    async def async_set_enabled(self, program_id: str, enabled: bool) -> None:
        program = self.store.program(program_id)
        if not program or program.get("enabled", True) == enabled:
            return
        entities = [e["entity_id"] for e in program["entities"]]
        await self.async_cancel_voluntary(entities)
        defaults = {eid: default_of(program, eid, self.store.modes) for eid in entities}
        program["enabled"] = enabled
        self.store.save_config()
        if enabled:
            await self.async_recompute("enable")
            return
        # deactivation: the program's own default applies once to entities it frees (Q-J)
        now = dt_util.utcnow()
        for eid in entities:
            seg = self.segment(eid, now)
            if seg.key[0] == "free":
                kind, setpoint = defaults[eid]
                if kind == "previous":
                    setpoint = self.rt(eid).get("outside")
                self._enter_segment(eid, seg, list(seg.key), now)
                if setpoint and not is_one_shot(setpoint):
                    self.rt(eid)["target"] = setpoint
                    await self.async_apply(eid, "disable")
                    self.rt(eid)["target"] = None
        await self.async_recompute("disable")

    async def async_set_vacation(self, on: bool) -> None:
        if bool(self.store.config.get("vacation")) == on:
            return
        entities = sorted(self.managed_entities())
        await self.async_cancel_voluntary(entities)
        if on:
            now = dt_util.utcnow()
            plan = {}
            for eid in entities:
                owners = sorted((p for p in self.store.programs if p.get("enabled", True)
                                 and any(e["entity_id"] == eid for e in p["entities"])),
                                key=lambda p: p.get("priority", 100))
                if owners:
                    plan[eid] = default_of(owners[0], eid, self.store.modes)
            self.store.config["vacation"] = True
            self.store.save_config()
            for eid, (kind, setpoint) in plan.items():
                if kind == "previous":
                    setpoint = self.rt(eid).get("outside")
                seg = self.segment(eid, now)
                self._enter_segment(eid, seg, list(seg.key), now)
                self.rt(eid).pop("override", None)
                if setpoint and not is_one_shot(setpoint):
                    self.rt(eid)["target"] = setpoint
                    await self.async_apply(eid, "vacation")
            await self.async_recompute("vacation_on")
        else:
            self.store.config["vacation"] = False
            self.store.save_config()
            await self.async_recompute("vacation_off")

    async def async_set_profile(self, program_id: str, profile_id: str) -> None:
        prt = self.store.runtime["programs"].setdefault(program_id, {})
        if prt.get("active_profile") == profile_id:
            return
        prt["active_profile"] = profile_id
        program = self.store.program(program_id)
        if program:
            await self.async_cancel_voluntary([e["entity_id"] for e in program["entities"]])
        await self.async_recompute("profile", program_id)

    async def async_config_changed(self) -> None:
        """Programs or modes edited: re-subscribe and re-evaluate (spec § 5.5)."""
        await self._async_release_removed()
        self._subscribe()
        self._observe_all_conditions()
        await self.async_recompute("modification")

    async def _async_release_removed(self) -> None:
        """Entities no longer in any program: hand Evohome back its schedule (S43), forget them."""
        managed = self.managed_entities()
        for entity_id in [e for e in self.store.runtime["entities"] if e not in managed]:
            rt = self.store.runtime["entities"].pop(entity_id)
            self._cancel_task(entity_id)
            if rt.get("permanent_set") and self.hass.states.get(entity_id) is not None:
                await self.hass.services.async_call(
                    "climate", "set_preset_mode", {"entity_id": entity_id, "preset_mode": "none"},
                    blocking=False, context=self.new_context())
            if rt.get("adaptive_manual"):
                switch = self._adaptive_switch_for(entity_id)
                if switch:
                    await self.hass.services.async_call(
                        "adaptive_lighting", "set_manual_control",
                        {"entity_id": switch, "lights": [entity_id], "manual_control": False},
                        blocking=False, context=self.new_context())

    async def async_remove_program_entities(self, program: dict) -> None:
        """Remove the switch and select of a deleted program from the registry."""
        registry = er.async_get(self.hass)
        for suffix in (f"program_{program['id']}", f"profile_{program['id']}"):
            for domain in ("switch", "select"):
                entity_id = registry.async_get_entity_id(domain, DOMAIN, f"{self.entry_id}_{suffix}")
                if entity_id:
                    registry.async_remove(entity_id)

    def mode_users(self, mode_id: str) -> list[str]:
        """Programs using a mode (any profile, defaults included)."""
        users = []
        for program in self.store.programs:
            used = any(e.get("default", {}).get("kind") == "mode" and e["default"].get("value") == mode_id
                       for e in program["entities"])
            for profile in program["profiles"]:
                for day in profile["days"]:
                    used |= any(mode_id in s["actions"].get("by_type", {}).values() for s in day)
            if used:
                users.append(program["name"])
        return users

    # ------------------------------------------------------------------ logbook

    def _log(self, entity_id: str, what: str, data: dict) -> None:
        self.hass.bus.async_fire(f"{DOMAIN}_event", {"entity_id": entity_id, "event": what, **data})
