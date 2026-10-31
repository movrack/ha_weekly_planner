"""The faster, yielding engine decides exactly like the 0.19.0 engine (``tests/legacy_engine.py``).

The same varied install and the same sequence of times, state changes and commands run through the
reference engine and through the current one (also forced to yield between every entity); the
service calls (with their targets, in order), logbook events, journal, runtime state, segments,
program statuses and next actions must be identical at every step.
"""

from __future__ import annotations

from contextlib import contextmanager
from copy import deepcopy
from datetime import timedelta
from typing import Any

import pytest
from homeassistant.core import Event, HomeAssistant, ServiceCall, callback
from homeassistant.util import dt as dt_util

import custom_components.weekly_planner as integration
from custom_components.weekly_planner import engine as engine_module
from custom_components.weekly_planner.const import DOMAIN

from . import legacy_engine
from .helpers import SERVICES, go_to, local, setup, slot
from .perf_data import big_programs, entity_ids


class LegacyEngine(legacy_engine.PlannerEngine):
    """The 0.19.0 engine; ``shared_pass`` only lets the current websocket module call it."""

    @contextmanager
    def shared_pass(self, occurrences=None):
        yield None


class CallLog:
    """Records every service call with its target, in order; ``vacuum.start`` fails twice per run."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.calls: list[tuple] = []
        self.failures = 0
        for domain, services in SERVICES.items():
            for service in services:
                hass.services.async_register(domain, service, self._handle)

    async def _handle(self, call: ServiceCall) -> None:
        target = call.data.get("entity_id")
        data = {k: v for k, v in call.data.items() if k != "entity_id"}
        self.calls.append((f"{call.domain}.{call.service}", str(target), repr(sorted(data.items()))))
        if call.service == "start" and self.failures < 2:
            self.failures += 1
            raise RuntimeError("vacuum busy")


def _prog(pid: str, entities: list[tuple[str, str | None]], base: list[dict], *, away: list[dict] | None = None,
          priority: int = 10, reapply: bool = True, conditions: list | None = None, enabled: bool = True,
          tuesday: list[dict] | None = None, mode_source: dict | None = None) -> dict:
    days = [list(tuesday if (tuesday is not None and weekday == 1) else base) for weekday in range(7)]
    profiles = [{"id": "base", "name": "Base", "days": days}]
    if away is not None:
        profiles.append({"id": "away", "name": "Away", "days": [list(away) for _ in range(7)]})
    program = {
        "id": pid, "name": pid, "priority": priority, "enabled": enabled, "reapply": reapply,
        "created_at": f"2026-01-0{len(pid) % 9 + 1}T00:00:00+00:00", "revision": 1,
        "conditions": conditions or [],
        "entities": [{"entity_id": eid, "default_label": default, "label_overrides": {}} for eid, default in entities],
        "profiles": profiles,
    }
    if mode_source:
        program["mode_source"] = mode_source
    return program


PRESENCE = {"entity_id": "binary_sensor.presence", "op": "eq", "value": "on"}
WINDOW_CLOSED = {"entity_id": "binary_sensor.window", "op": "eq", "value": "off"}
ENTITIES = ("climate.office", "climate.bedroom", "cover.office", "cover.kitchen", "light.a", "light.b", "vacuum.robot")


def varied_programs() -> list[dict]:
    random_slot = {"id": "s4", "start": {"time": "14:00", "random_minutes": 10},
                   "end": {"time": "15:00", "random_minutes": 5}, "label": "t25", "conditions": []}
    sunset = {"id": "b3", "start": {"sun": "sunset"}, "end": {"time": "23:30"}, "label": "t19", "conditions": []}
    sunrise = {"id": "c3", "start": {"sun": "sunrise", "offset": 15}, "end": {"time": "09:30"},
               "label": "open", "conditions": []}
    heat = [slot("s1", "06:00", "08:00", "t21"), slot("s2", "12:00", "13:00", "t19", [WINDOW_CLOSED]),
            slot("s3", "18:00", "22:00", "t21"), random_slot]
    return [
        _prog("heat", [("climate.office", "t15"), ("climate.bedroom", "t19")], heat,
              away=[slot("a1", "10:00", "11:00", "t25")],
              tuesday=[*heat[:2], slot("s5", "16:00", "16:40", "boost")]),
        _prog("boost", [("climate.office", None)], [slot("b1", "07:00", "07:30", "boost"),
              slot("b2", "19:00", None, "t25"), sunset], priority=5, reapply=False, conditions=[PRESENCE]),
        _prog("cover", [("cover.office", "close"), ("cover.kitchen", None)],
              [slot("c1", "08:00", None, "open"), slot("c2", "20:00", None, "close"), sunrise],
              away=[slot("c4", "09:00", "17:00", "close")],
              mode_source={"entity_id": "input_select.house", "mappings": {"home": "base", "away": "away"}}),
        _prog("lights", [("light.a", None), ("light.b", None)],
              [slot("l1", "17:00", "23:00", "light50"), slot("l2", "23:30", "00:30", "light50")], priority=20),
        _prog("vacuum", [("vacuum.robot", None)], [slot("v1", "10:00", None, "start")], reapply=False),
        _prog("off", [("light.a", "light50")], [slot("o1", "00:00", "24:00", "light50")], priority=1, enabled=False),
        _prog("scene", [("climate.bedroom", None)], [slot("w1", "09:00", "09:45", "work")], priority=15),
    ]


def _states(hass: HomeAssistant) -> None:
    for eid in ENTITIES:
        hass.states.async_set(eid, "on", {"temperature": 10})
    hass.states.async_set("binary_sensor.presence", "on")
    hass.states.async_set("binary_sensor.window", "off")
    hass.states.async_set("input_select.house", "home")


def _edit_heat(engine) -> None:
    """Like a websocket save: a new program object replaces the old one."""
    old = engine.store.program("heat")
    new = deepcopy(old)
    new["revision"] += 1
    for day in new["profiles"][0]["days"]:
        for item in day:
            if item["id"] == "s3":
                item["start"] = {"time": "17:30"}
    engine.store.programs[engine.store.programs.index(old)] = new
    engine.store.save_config()


def _edit_inactive_mode(engine) -> None:
    old = engine.store.program("heat")
    new = deepcopy(old)
    new["revision"] += 1
    new["profiles"][1]["days"][2] = [slot("a2", "11:00", "12:00", "t21")]
    engine.store.programs[engine.store.programs.index(old)] = new
    engine.store.save_config()


async def _burst(hass: HomeAssistant, engine) -> None:
    """Several changes in one go: conditions, a mode source and an entity going unavailable."""
    hass.states.async_set("binary_sensor.presence", "off")
    hass.states.async_set("binary_sensor.window", "on")
    hass.states.async_set("input_select.house", "away")
    hass.states.async_set("cover.kitchen", "unavailable")
    hass.states.async_set("binary_sensor.presence", "on")


async def _ordered_burst(hass: HomeAssistant, engine) -> None:
    """Three changes in one go whose effects must stay in arrival order: a condition that changes
    nothing, a mode source (covers), then a slot condition (climate.*, sorted before cover)."""
    hass.states.async_set("binary_sensor.presence", "off")
    hass.states.async_set("input_select.house", "away")
    hass.states.async_set("binary_sensor.window", "on")


def _set(eid: str, state: str):
    async def run(hass, engine):
        hass.states.async_set(eid, state)
    return run


def _call(name: str, *args: Any, **kwargs: Any):
    async def run(hass, engine):
        result = getattr(engine, name)(*args, **kwargs)
        if hasattr(result, "__await__"):
            await result
    return run


async def _config_changed(hass, engine) -> None:
    _edit_heat(engine)
    await engine.async_config_changed()


async def _inactive_edit(hass, engine) -> None:
    _edit_inactive_mode(engine)
    await engine.async_config_changed(reapply=False)


EVENTS = {  # (day, hour, minute) -> what happens then, before the step is recorded
    (26, 6, 30): [_set("binary_sensor.presence", "off")],
    (26, 7, 0): [_set("binary_sensor.presence", "on")],
    (26, 9, 0): [_set("binary_sensor.window", "on")],
    (26, 9, 10): [_call("async_set_profile", "heat", "away")],
    (26, 11, 0): [_set("cover.kitchen", "unavailable")],
    (26, 11, 30): [_set("binary_sensor.window", "off"), _call("async_set_profile", "heat", "base")],
    (26, 12, 30): [_set("cover.kitchen", "open")],
    (26, 13, 30): [_call("skip_next", "heat")],
    (26, 15, 0): [_call("async_set_enabled", "lights", False)],
    (26, 16, 0): [_call("async_set_enabled", "lights", True), _call("async_apply_now", "cover")],
    (26, 16, 30): [_config_changed],
    (26, 17, 10): [_inactive_edit],
    (26, 21, 0): [_call("async_set_vacation", True)],
    (26, 22, 30): [_call("async_set_vacation", False)],
    (27, 7, 10): [_burst],
    (27, 7, 40): [_set("input_select.house", "home"), _set("cover.kitchen", "closed"),
                  _set("binary_sensor.window", "off")],
    (27, 10, 20): [_call("async_set_enabled", "off", True)],
    (27, 11, 50): [_call("async_set_enabled", "off", False)],
    (27, 12, 10): [_ordered_burst],
    (27, 12, 40): [_set("binary_sensor.presence", "on"), _set("binary_sensor.window", "off"),
                   _set("input_select.house", "home")],
}


def _record(engine, log: CallLog, events: list) -> dict:
    return {
        "calls": list(log.calls),
        "events": list(events),
        "status": {p["id"]: engine.program_status(p["id"]) for p in engine.store.programs},
        "next": {eid: engine.next_action(eid) for eid in ENTITIES},
        "segments": {eid: engine.segment(eid) for eid in ENTITIES},
        "runtime": deepcopy(engine.store.runtime),
        "journal": deepcopy(engine.store.journal),
    }


async def _scenario(hass, hass_storage, freezer, monkeypatch, log: CallLog, engine_cls, slice_s: float) -> list[dict]:
    monkeypatch.setattr(integration, "PlannerEngine", engine_cls)
    monkeypatch.setattr(engine_module, "YIELD_SLICE_S", slice_s)
    log.calls.clear()
    log.failures = 0
    _states(hass)
    events: list[tuple] = []

    # A @callback runs on the event loop, in firing order. A plain function (or lambda) would be an
    # executor job: the worker threads append in any order, and the trace flakes ("step N, events").
    @callback
    def record(event: Event) -> None:
        events.append(repr(sorted(event.data.items())))

    unlisten = hass.bus.async_listen(f"{DOMAIN}_event", record)
    # No debounce: every condition change takes effect at once and starts its own recompute.
    engine = await setup(hass, hass_storage, freezer, varied_programs(), local(26, 5, 50), debounce_min=0)
    assert type(engine) is engine_cls
    trace = [_record(engine, log, events)]
    moment = local(26, 6, 0)
    while moment <= local(27, 13, 0):
        await go_to(hass, freezer, moment)
        for event in EVENTS.get((moment.day, moment.hour, moment.minute), []):
            await event(hass, engine)
            await hass.async_block_till_done()
        trace.append(_record(engine, log, events))
        moment += timedelta(minutes=10)
    unlisten()
    entry_id = engine.entry_id
    assert await hass.config_entries.async_remove(entry_id)
    await hass.async_block_till_done()
    hass_storage.clear()
    return trace


def _first_difference(reference: list[dict], current: list[dict]) -> str:
    for step, (old, new) in enumerate(zip(reference, current, strict=True)):
        for key in old:
            if old[key] != new[key]:
                return f"step {step}, {key}"
    return ""


async def test_engine_matches_reference_on_a_varied_install(hass, hass_storage, freezer, monkeypatch):
    await hass.config.async_update(latitude=50.85, longitude=4.35)
    log = CallLog(hass)
    reference = await _scenario(hass, hass_storage, freezer, monkeypatch, log, LegacyEngine, engine_module.YIELD_SLICE_S)
    # Simulated time does not move perf_counter: the default slice never yields, 0 yields after every entity.
    for slice_s in (engine_module.YIELD_SLICE_S, 0.0):
        current = await _scenario(hass, hass_storage, freezer, monkeypatch, log, engine_module.PlannerEngine, slice_s)
        assert len(current) == len(reference)
        assert current == reference, _first_difference(reference, current)
    calls = reference[-1]["calls"]
    services = {name for name, _, _ in calls}
    # The scenario really exercises the varied paths it claims to.
    assert {"climate.set_temperature", "climate.set_preset_mode", "cover.open_cover", "cover.close_cover",
            "light.turn_on", "vacuum.start", "scene.turn_on"} <= services
    assert sum(name == "vacuum.start" for name, _, _ in calls) >= 3  # two failures, then the retry succeeds
    assert any("waiting_unavailable" in event for event in reference[-1]["events"])
    burst = reference[EVENT_STEP]["calls"][len(reference[EVENT_STEP - 1]["calls"]):]
    assert [target for _, target, _ in burst] == ["cover.kitchen", "cover.office", "climate.bedroom"], burst


EVENT_STEP = 1 + (24 + 12 - 6) * 6 + 1  # index of the step recorded at 27 Oct 12:10


# ------------------------------------------------------------------ large install, pure lookups

async def test_lookups_match_reference_on_the_large_install(hass, hass_storage, freezer):
    """Statuses, next actions and segments of the 50-program install equal the reference ones."""
    from .helpers import Recorder

    Recorder(hass)
    programs = big_programs(conditioned=20)
    for index in range(len(programs)):
        for eid in entity_ids(index):
            hass.states.async_set(eid, "heat", {"temperature": 10})
    for index in range(0, 20, 2):
        hass.states.async_set(f"binary_sensor.late{index}", "on")
    await hass.config.async_update(latitude=50.85, longitude=4.35)
    engine = await setup(hass, hass_storage, freezer, programs, local(26, 9, 0))
    engine.store.runtime["programs"].setdefault("p3", {})["active_profile"] = "away"
    engine.store.runtime["programs"].setdefault("p4", {})["active_profile"] = "vacation"
    reference = LegacyEngine(hass, engine.store, engine.options, engine.entry_id)
    reference.descriptions = engine.descriptions
    reference.conditions = engine.conditions
    eids = sorted(engine.managed_entities())
    for moment in (local(26, 23, 50), local(27, 0, 45), local(31, 18, 0)):
        freezer.move_to(moment)
        now = dt_util.utcnow()
        assert [engine.segment(e, now) for e in eids] == [reference.segment(e, now) for e in eids]
        assert [engine.next_action(e, now) for e in eids] == [reference.next_action(e, now) for e in eids]
        statuses = [engine.program_status(p["id"]) for p in engine.store.programs]
        assert statuses == [reference.program_status(p["id"]) for p in engine.store.programs]
        assert any(status["next_actions"] for status in statuses)


COUNT, CONDITIONED = 20, 12


@pytest.mark.parametrize("slice_s", [0.0, 1.0])
async def test_recompute_of_the_large_install_matches_reference(hass, hass_storage, freezer, monkeypatch, slice_s):
    """A full recompute after condition changes sends the same calls, in the same order, as the reference."""
    log = CallLog(hass)
    monkeypatch.setattr(engine_module, "YIELD_SLICE_S", slice_s)
    await hass.config.async_update(latitude=50.85, longitude=4.35)

    async def run(engine_cls) -> tuple:
        monkeypatch.setattr(integration, "PlannerEngine", engine_cls)
        log.calls.clear()
        for index in range(COUNT):
            for eid in entity_ids(index):
                hass.states.async_set(eid, "heat", {"temperature": 10})
        for index in range(CONDITIONED):  # unknown until the burst: each first value applies at once
            hass.states.async_remove(f"binary_sensor.late{index}")
        engine = await setup(hass, hass_storage, freezer, big_programs(COUNT, conditioned=CONDITIONED), local(27, 0, 40))
        log.calls.clear()  # keep what follows the start-up
        for index in range(CONDITIONED):  # a burst of condition changes: one recompute each, in this order
            hass.states.async_set(f"binary_sensor.late{index}", "on")
        await hass.async_block_till_done()
        await go_to(hass, freezer, local(27, 2, 5))
        result = (list(log.calls), deepcopy(engine.store.runtime["entities"]),
                  [engine.program_status(p["id"]) for p in engine.store.programs])
        assert await hass.config_entries.async_remove(engine.entry_id)
        await hass.async_block_till_done()
        hass_storage.clear()
        return result

    reference = await run(LegacyEngine)
    current = await run(engine_module.PlannerEngine)
    # one recompute per condition, in arrival order: program 0, 1, 2 ... 11 (not the sorted p0, p1, p10 ...)
    firsts = [target for _, target, _ in reference[0] if target.endswith("_e0")][:CONDITIONED]
    assert firsts == [f"climate.p{index}_e0" for index in range(CONDITIONED)], firsts
    assert current[0] == reference[0]
    assert current[1] == reference[1]
    assert current[2] == reference[2]
