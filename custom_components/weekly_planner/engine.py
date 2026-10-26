"""The planner engine: turns segments into actions.

Rules: docs/SPEC.md § 5. The engine acts only on segment transitions (start or end of a slot,
condition, program or vacation change) and does not watch what a device becomes afterwards.
"""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from datetime import date, datetime, timedelta
import logging
from typing import Any

from homeassistant.components import persistent_notification
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, State, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_track_point_in_utc_time, async_track_state_change_event
from homeassistant.helpers.sun import get_astral_event_date
from homeassistant.util import dt as dt_util

from .actions import call_for, resolve_action
from homeassistant.helpers.service import async_get_all_descriptions
from .conditions import ConditionTracker
from .const import DOMAIN
from .resolver import Segment, active_profile, default_label, next_transition, occurrences_around, resolve_entity
from .store import PlannerStore

_LOGGER = logging.getLogger(__name__)

STABILIZATION = timedelta(seconds=30)
RETRY_STEPS = (1, 2, 5, 10, 15)  # minutes after a failed service call, then give up
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
        self._unsubs: list[CALLBACK_TYPE] = []  # state listeners, rebuilt on config changes
        self._static_unsubs: list[CALLBACK_TYPE] = []  # lifecycle listeners
        self._timer: CALLBACK_TYPE | None = None
        self._tasks: dict[str, asyncio.Task] = {}
        self._ready = False
        self._listeners: list[Callable[[], None]] = []
        self.descriptions: dict | None = None  # service descriptions, to know which entity a service suits

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
        await self.async_load_descriptions()
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

    @property
    def labels(self) -> dict[str, dict]:
        return {label["id"]: label for label in self.store.config.get("labels", [])}

    def accepts(self, entity_id: str, action: dict) -> bool:
        """Does the action suit the entity? Scenes always do; a service must target its domain."""
        if action.get("kind") != "service":
            return True
        from .validation import service_accepts

        return service_accepts(self.descriptions, action.get("service", ""), entity_id)

    def resolve(self, program: dict, entity_id: str, label_id: str | None) -> dict | None:
        """Action of a label for an entity of a program (docs/SPEC.md § 6)."""
        return resolve_action(program, entity_id, label_id, self.labels, self.accepts)

    async def async_load_descriptions(self) -> None:
        try:
            self.descriptions = await async_get_all_descriptions(self.hass)
        except Exception:  # noqa: BLE001 - without descriptions every service is accepted
            self.descriptions = None

    def managed_entities(self) -> set[str]:
        return {e["entity_id"] for p in self.store.programs for e in p["entities"]}

    def _profiles(self) -> dict[str, str]:
        return {pid: r["active_profile"] for pid, r in self.store.runtime["programs"].items()
                if r.get("active_profile")}

    def segment(self, entity_id: str, at: datetime | None = None) -> Segment:
        return resolve_entity(
            entity_id, self.store.programs, self.resolve, at or dt_util.utcnow(), self.tz,
            self.sun, self.conditions.check, vacation=self.store.config.get("vacation", False),
            active_profiles=self._profiles(),
        )

    def rt(self, entity_id: str) -> dict[str, Any]:
        return self.store.entity_runtime(entity_id)

    def _persist(self) -> None:
        self.store.runtime["conditions"] = self.conditions.dump()
        self.store.save_runtime()

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
        for entity in program["entities"]:
            eid = entity["entity_id"]
            seg = self.rt(eid).get("segment") or []
            if seg and seg[0] == "slot" and seg[1] == program_id:
                current[eid] = seg[2]
        nxt = next_transition([program], now, self.tz, self.sun, active_profiles=self._profiles())
        prt = self.store.runtime["programs"].get(program_id, {})
        return {
            "program_id": program_id,
            "active_profile": self.active_profile_id(program_id),
            "current_slots": current,
            "next_change": nxt.isoformat() if nxt else None,
            "skip_next": prt.get("skip_at"),
            "next_actions": {
                e["entity_id"]: action for e in program["entities"]
                if (action := self.next_action(e["entity_id"]))
            },
        }

    def next_action(self, entity_id: str) -> dict[str, Any] | None:
        """Next thing the plan does to an entity: ``{"at": iso, "action": {...}, "label": id}``.

        Looks at the next days of the enabled programs: a slot gives its action at its start and,
        when it has an end, the default action at its end.
        """
        now = dt_util.utcnow()
        if self.store.config.get("vacation"):
            return None
        previous_key = self.segment(entity_id, now).key
        edges: dict[datetime, dict] = {}
        for program in self.store.programs:
            if not program.get("enabled", True) or not any(
                e["entity_id"] == entity_id for e in program["entities"]
            ):
                continue
            profile = active_profile(program, self._profiles())
            for occ, slot in occurrences_around(profile, now, self.tz, self.sun, days=range(0, 8)):
                if not occ.runs:
                    continue
                action = self.resolve(program, entity_id, slot.get("label"))
                if action is None:
                    continue
                if occ.start > now:
                    edges[occ.start] = {"oneshot": occ.end is None, "action": action, "label": slot.get("label")}
                if occ.end is not None and occ.end > now:
                    edges.setdefault(occ.end, {"oneshot": False, "action": None, "label": None})
        for moment in sorted(edges):
            seg = self.segment(entity_id, moment)
            edge = edges[moment]
            action = edge["action"] if edge["oneshot"] else seg.action
            changed = seg.key != previous_key
            previous_key = seg.key
            if action is not None and (edge["oneshot"] or changed):
                return {"at": moment.isoformat(), "action": action,
                        "label": edge["label"] if edge["oneshot"] else seg.label}
        return None

    # ------------------------------------------------------------------ subscriptions

    def _subscribe(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        watched = set(self.managed_entities())
        watched |= {c["entity_id"] for c in self._all_conditions()}
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
        cond_changed = False
        for cond in self._all_conditions():
            if cond["entity_id"] == entity_id:
                cond_changed |= self.conditions.observe(cond, new, now)
        if cond_changed:
            self.hass.async_create_task(self.async_recompute("condition"))
        else:
            self._arm_timer()
        # back online: send what was waiting for the entity (spec § 5.8)
        if (
            entity_id in self.managed_entities()
            and new is not None and new.state not in UNAVAILABLE
            and (old is None or old.state in UNAVAILABLE)
            and self.rt(entity_id).get("pending")
        ):
            self.hass.async_create_task(self.async_apply(entity_id, "back_online"))

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
        if not changed and reason not in REAPPLY_REASONS:
            return

        program = self.store.program(seg.program_id) if seg.program_id else None
        reapply = program.get("reapply", True) if program else True
        skip = self._consume_skip(seg.program_id, now) if changed else False
        missed_end = self._missed_end(rt, seg)
        self._enter_segment(entity_id, seg, key, now)
        if skip:
            rt["suppressed"] = True
            return
        if reason in REAPPLY_REASONS and not reapply and not missed_end:
            rt["suppressed"] = True
            return
        if reason == "condition" and seg.in_slot and not reapply:
            rt["suppressed"] = True
            return
        await self.async_apply(entity_id, reason)

    def _missed_end(self, rt: dict, seg: Segment) -> bool:
        """A slot ended while Home Assistant was down: its end always runs (spec § 5.5)."""
        previous = rt.get("segment")
        return bool(previous and previous[0] == "slot" and not seg.in_slot and previous != list(seg.key))

    def _enter_segment(self, entity_id: str, seg: Segment, key: list, now: datetime) -> None:
        rt = self.rt(entity_id)
        previous_key = rt.get("segment")
        if previous_key != key or rt.get("target") != seg.action:
            # also journal a new target in the same segment (default or slot edited)
            self.store.record_segment({
                "at": now.isoformat(), "entity_id": entity_id, "segment": key,
                "program_id": seg.program_id, "slot_id": seg.slot_id, "action": seg.action,
            })
        rt["segment"] = key
        rt["target"] = seg.action
        rt.pop("suppressed", None)

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
        """Run the slots without an end whose time came since the last tick (spec § 5.2)."""
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
                    action = self.resolve(program, eid, slot.get("label"))
                    if action is None:
                        continue
                    seg = self.segment(eid, now)
                    higher = seg.in_slot and seg.program_id != program["id"] and self._priority(seg.program_id) < program.get("priority", 100)
                    if higher:
                        continue  # skipped under a higher priority slot (Q-L)
                    await self._async_send(eid, action, "one_shot", oneshot=True)
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
                await self._async_retry(entity_id)
            notify_at = self.store.parse(rt.get("notify_at"))
            if notify_at and now >= notify_at:
                rt.pop("notify_at", None)
                if rt.get("pending"):
                    self._notify_unavailable(entity_id)
        await self.async_recompute("timer")

    # ------------------------------------------------------------------ actions

    async def async_apply(self, entity_id: str, reason: str) -> None:
        """Send the action of the entity's current segment (single task in flight per entity)."""
        action = self.rt(entity_id).get("target")
        if action is None:
            return
        await self._async_send(entity_id, action, reason)

    def _cancel_task(self, entity_id: str) -> None:
        if task := self._tasks.pop(entity_id, None):
            task.cancel()

    async def _async_send(self, entity_id: str, action: dict, reason: str, oneshot: bool = False) -> None:
        rt = self.rt(entity_id)
        state = self.hass.states.get(entity_id)
        if state is None or state.state in UNAVAILABLE:
            if not oneshot:
                rt["pending"] = True
                self._schedule_notify(entity_id)
            self._log(entity_id, "waiting_unavailable", {"reason": reason})
            return
        self._cancel_task(entity_id)
        segment = rt.get("segment")
        self._tasks[entity_id] = self.hass.async_create_task(
            self._async_send_call(entity_id, action, reason, segment, oneshot)
        )

    async def _async_send_call(
        self, entity_id: str, action: dict, reason: str, segment: Any, oneshot: bool
    ) -> None:
        rt = self.rt(entity_id)
        try:
            if not oneshot and rt.get("segment") != segment:
                return  # segment changed meanwhile: this action is stale (spec § 5.1)
            call = call_for(entity_id, action)
            await self.hass.services.async_call(
                call.domain, call.service, call.service_data(), blocking=True,
                target={"entity_id": entity_id} if call.as_target else None,
            )
        except asyncio.CancelledError:
            raise
        except ServiceValidationError as err:
            # The device refuses this action: retrying cannot help.
            _LOGGER.warning("Action %s refused by %s: %s", action, entity_id, err)
            rt.pop("service_retry", None)
            rt.pop("retry_at", None)
            self._notify_failure(entity_id, action, str(err))
            self._persist()
            return
        except Exception as err:  # noqa: BLE001 - other failures are retried with a backoff
            _LOGGER.warning("Applying %s to %s failed: %s", action, entity_id, err)
            self._schedule_retry(entity_id, action, reason, segment, oneshot)
            return
        finally:
            if self._tasks.get(entity_id) is asyncio.current_task():
                self._tasks.pop(entity_id, None)
        rt.pop("pending", None)
        rt.pop("notify_at", None)
        rt.pop("service_retry", None)
        persistent_notification.async_dismiss(self.hass, f"{DOMAIN}_{entity_id}_failed")
        if reason != "retry":  # one logbook entry per decision, not per attempt
            self._log(entity_id, "applied", {"action": action, "reason": reason})
        self.store.record_segment({
            "at": dt_util.utcnow().isoformat(), "entity_id": entity_id, "sent": True,
            "action": action, "reason": reason,
        })
        self._persist()

    def _schedule_retry(self, entity_id: str, action: dict, reason: str, segment: Any, oneshot: bool) -> None:
        """A service call failed: try again after 1, 2, 5, 10, 15 min, then give up."""
        rt = self.rt(entity_id)
        attempt = rt.get("service_retry", {}).get("attempt", 0) if reason == "retry" else 0
        if attempt >= len(RETRY_STEPS):
            rt.pop("service_retry", None)
            rt.pop("retry_at", None)
            self._notify_failure(entity_id, action)
        else:
            rt["service_retry"] = {"action": action, "attempt": attempt + 1, "segment": segment, "oneshot": oneshot}
            rt["retry_at"] = (dt_util.utcnow() + timedelta(minutes=RETRY_STEPS[attempt])).isoformat()
        self._persist()
        self._arm_timer()

    async def _async_retry(self, entity_id: str) -> None:
        rt = self.rt(entity_id)
        retry = rt.get("service_retry")
        if not retry:
            return
        if not retry.get("oneshot") and rt.get("segment") != retry.get("segment"):
            rt.pop("service_retry", None)  # the segment changed: this action is stale
            return
        await self._async_send(entity_id, retry["action"], "retry", oneshot=bool(retry.get("oneshot")))

    def _schedule_notify(self, entity_id: str) -> None:
        rt = self.rt(entity_id)
        if not rt.get("notify_at"):
            delay = timedelta(minutes=self.options.get("notify_delay_min", 30))
            rt["notify_at"] = (dt_util.utcnow() + delay).isoformat()

    def _notify_unavailable(self, entity_id: str) -> None:
        persistent_notification.async_create(
            self.hass, f"{entity_id} is unavailable: its scheduled action is still waiting.",
            title="Weekly Planner", notification_id=f"{DOMAIN}_{entity_id}_failed")
        self._log(entity_id, "failed", {"action": self.rt(entity_id).get("target")})

    def _notify_failure(self, entity_id: str, action: dict, reason: str | None = None) -> None:
        persistent_notification.async_create(
            self.hass,
            f"{entity_id}: {action.get('service') or action.get('scene')} could not be run."
            + (f" {reason}" if reason else ""),
            title="Weekly Planner",
            notification_id=f"{DOMAIN}_{entity_id}_failed",
        )
        self._log(entity_id, "failed", {"action": action})

    # ------------------------------------------------------------------ commands

    async def async_apply_now(self, program_id: str) -> None:
        program = self.store.program(program_id)
        if not program:
            return
        for entity in program["entities"]:
            eid = entity["entity_id"]
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
        defaults = {eid: self.resolve(program, eid, default_label(program, eid)) for eid in entities}
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
                self._enter_segment(eid, seg, list(seg.key), now)
                if defaults[eid]:
                    self.rt(eid)["target"] = defaults[eid]
                    await self.async_apply(eid, "disable")
                    self.rt(eid)["target"] = None
        await self.async_recompute("disable")

    async def async_set_vacation(self, on: bool) -> None:
        if bool(self.store.config.get("vacation")) == on:
            return
        if on:
            now = dt_util.utcnow()
            plan = {}
            for eid in sorted(self.managed_entities()):
                owners = sorted((p for p in self.store.programs if p.get("enabled", True)
                                 and any(e["entity_id"] == eid for e in p["entities"])),
                                key=lambda p: p.get("priority", 100))
                if owners:
                    plan[eid] = self.resolve(owners[0], eid, default_label(owners[0], eid))
            self.store.config["vacation"] = True
            self.store.save_config()
            for eid, action in plan.items():
                seg = self.segment(eid, now)
                self._enter_segment(eid, seg, list(seg.key), now)
                if action:
                    self.rt(eid)["target"] = action
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
        await self.async_recompute("profile", program_id)

    async def async_config_changed(self) -> None:
        """Programs edited: re-subscribe and re-evaluate (spec § 5.5)."""
        self._release_removed()
        await self.async_load_descriptions()
        self._subscribe()
        self._observe_all_conditions()
        await self.async_recompute("modification")

    def _release_removed(self) -> None:
        """Forget the runtime state of entities that are no longer in any program."""
        managed = self.managed_entities()
        for entity_id in [e for e in self.store.runtime["entities"] if e not in managed]:
            self.store.runtime["entities"].pop(entity_id)
            self._cancel_task(entity_id)

    async def async_remove_program_entities(self, program: dict) -> None:
        """Remove the switch and select of a deleted program from the registry."""
        registry = er.async_get(self.hass)
        for suffix in (f"program_{program['id']}", f"profile_{program['id']}"):
            for domain in ("switch", "select"):
                entity_id = registry.async_get_entity_id(domain, DOMAIN, f"{self.entry_id}_{suffix}")
                if entity_id:
                    registry.async_remove(entity_id)

    # ------------------------------------------------------------------ logbook

    def _log(self, entity_id: str, what: str, data: dict) -> None:
        self.hass.bus.async_fire(f"{DOMAIN}_event", {"entity_id": entity_id, "event": what, **data})
