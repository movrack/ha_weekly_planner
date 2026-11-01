"""A recompute yields between entities without changing what it decides (docs/SPEC.md § 21)."""

from __future__ import annotations

import asyncio
from copy import deepcopy
from datetime import date
from zoneinfo import ZoneInfo

from homeassistant.util import dt as dt_util

from custom_components.weekly_planner import engine as engine_module
from custom_components.weekly_planner import timeline
from custom_components.weekly_planner.resolver import OccurrenceCache, occurrences_around

from .helpers import CLIMATE, Recorder, local, program, setup, slot

TZ = ZoneInfo("Europe/Brussels")


def _entities(count: int, hass=None) -> list[dict]:
    for i in range(count):
        if hass is not None:
            hass.states.async_set(f"climate.e{i}", "heat", {"temperature": 10})
    return [{"entity_id": f"climate.e{i}", "default_label": "t15", "label_overrides": {}} for i in range(count)]


async def _paused_recompute(hass, engine, monkeypatch, reason: str = "tick") -> asyncio.Task:
    """Start a recompute that hands the loop back after every entity; it is now paused."""
    monkeypatch.setattr(engine_module, "YIELD_SLICE_S", 0.0)
    task = hass.async_create_task(engine.async_recompute(reason))
    assert not task.done()
    return task


async def test_recompute_yields_between_entities(hass, hass_storage, freezer, monkeypatch):
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program(entities=_entities(3, hass))], local(26, 7, 0))
    rec.calls.clear()
    freezer.move_to(local(26, 8, 0))  # the slot starts for the three entities
    task = await _paused_recompute(hass, engine, monkeypatch, "timer")
    others = 0
    while not task.done():  # other work runs between the entities
        others += 1
        await asyncio.sleep(0)
    assert others >= 3
    assert [service for service, _ in rec.calls] == ["climate.set_temperature"] * 3


async def test_state_change_during_a_pass_waits_for_it(hass, hass_storage, freezer, monkeypatch):
    """A condition that changes while a pass decides is handled after it, by its own recompute."""
    rec = Recorder(hass)
    hass.states.async_set("binary_sensor.window", "off")
    closed = {"entity_id": "binary_sensor.window", "op": "eq", "value": "off"}
    prog = program(entities=_entities(3, hass), slots=[slot("s1", "08:00", "12:00", "t21", [closed])])
    engine = await setup(hass, hass_storage, freezer, [prog], local(26, 9, 0), debounce_min=0)
    rec.calls.clear()
    task = await _paused_recompute(hass, engine, monkeypatch, "startup")
    hass.states.async_set("binary_sensor.window", "on")  # arrives in the middle of the pass
    assert engine._deferred_states  # noqa: SLF001
    assert engine.conditions.check([closed])  # not observed yet: the pass keeps its view
    await task
    await hass.async_block_till_done()
    assert not engine.conditions.check([closed])
    # startup re-sends the slot (reapply), then the condition ends it: in this order, per entity
    assert [data["temperature"] for _, data in rec.calls] == [21, 21, 21, 15, 15, 15]


async def test_stop_during_a_pass_sends_nothing_more(hass, hass_storage, freezer, monkeypatch):
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program(entities=_entities(4, hass))], local(26, 7, 0))
    rec.calls.clear()
    freezer.move_to(local(26, 8, 0))
    task = await _paused_recompute(hass, engine, monkeypatch, "timer")
    await engine.async_stop()
    await task
    await hass.async_block_till_done()
    assert len(rec.calls) < 4
    assert engine._timer is None  # noqa: SLF001 - no timer armed after the stop


async def test_commands_wait_for_the_pass(hass, hass_storage, freezer, monkeypatch):
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program(entities=_entities(3, hass))], local(26, 9, 0))
    rec.calls.clear()
    task = await _paused_recompute(hass, engine, monkeypatch, "startup")
    vacation = hass.async_create_task(engine.async_set_vacation(True))
    assert not engine.store.config.get("vacation")  # not applied in the middle of the pass
    await task
    await vacation
    assert engine.store.config["vacation"] is True
    assert [data["temperature"] for _, data in rec.calls] == [21, 21, 21, 15, 15, 15]


async def test_published_statuses_follow_a_change_during_the_publication(hass, hass_storage, freezer, monkeypatch):
    """Statuses prepared before the notification are dropped when something changed meanwhile."""
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program(), program("other", entities=[])], local(26, 9, 0))
    published = []
    engine.add_listener(lambda: published.append(engine.program_status("office")))
    original = engine._program_status  # noqa: SLF001
    calls = 0

    def program_status(ctx, program_id):
        nonlocal calls
        calls += 1
        status = original(ctx, program_id)
        if calls == 1:  # once the recompute prepared this status, someone skips the next change
            engine.skip_next("office")
        return status

    monkeypatch.setattr(engine, "_program_status", program_status)
    await engine.async_recompute("tick")
    assert published[-1]["skip_next"] is not None
    assert published[-1] == engine.program_status("office")


async def test_published_statuses_follow_a_replaced_program(hass, hass_storage, freezer, monkeypatch):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program(), program("other", entities=[])], local(26, 9, 0))
    published = []
    engine.add_listener(lambda: published.append(engine.program_status("office")))
    original = engine._program_status  # noqa: SLF001
    calls = 0

    def program_status(ctx, program_id):
        nonlocal calls
        calls += 1
        if calls == 1:  # an editor saves a new version of the program meanwhile (no notification yet)
            old = engine.store.programs[0]
            new = deepcopy(old)
            new["profiles"][0]["days"] = [[slot("s1", "08:00", "11:00", "t21")] for _ in range(7)]
            engine.store.programs[0] = new
        return original(ctx, program_id)

    monkeypatch.setattr(engine, "_program_status", program_status)
    await engine.async_recompute("tick")
    assert dt_util.parse_datetime(published[-1]["next_change"]) == local(26, 11, 0)
    assert dt_util.parse_datetime(published[-1]["next_actions"][CLIMATE]["at"]) == local(26, 11, 0)


async def test_statuses_prepared_by_the_recompute_are_published(hass, hass_storage, freezer, monkeypatch):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 9, 0))
    published = []
    engine.add_listener(lambda: published.append(engine.program_status("office")))
    counter = []
    original = engine._program_status  # noqa: SLF001
    monkeypatch.setattr(engine, "_program_status", lambda ctx, pid: counter.append(pid) or original(ctx, pid))
    await engine.async_recompute("tick")
    assert counter == ["office"] and len(published) == 1  # computed once, before the notification


def test_occurrence_cache_shares_days_and_ignores_replaced_profiles(monkeypatch):
    calls = []
    original = timeline.occurrence
    monkeypatch.setattr(timeline, "occurrence", lambda *a, **k: calls.append(1) or original(*a, **k))
    profile = program()["profiles"][0]
    cache = OccurrenceCache()
    now = local(26, 9, 0)
    sun = lambda event, day: None  # noqa: E731
    plain = occurrences_around(profile, now, TZ, sun, program_id="office")
    count = len(calls)
    assert occurrences_around(profile, now, TZ, sun, program_id="office", cache=cache) == plain
    assert occurrences_around(profile, local(26, 23, 0), TZ, sun, program_id="office", cache=cache) == plain
    assert len(calls) == 2 * count  # once uncached, once for the cache, then shared
    edited = deepcopy(profile)
    edited["days"][date(2026, 10, 26).weekday()] = [slot("s1", "09:00", "10:00", "t21")]
    changed = occurrences_around(edited, now, TZ, sun, program_id="office", cache=cache)
    assert changed != plain and changed == occurrences_around(edited, now, TZ, sun, program_id="office")
