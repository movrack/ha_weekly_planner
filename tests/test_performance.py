"""Performance budgets on a synthetic large install (50 programs x 4 entities x 3 modes x 7 days x 6 slots).

Two kinds of assertion, so a regression fails without flaking on a slow CI runner:
* operation counts (deterministic): how many occurrences are computed, how many snapshots are built;
* wall-clock budgets: best of N runs (``time.perf_counter``, no freezegun while timing), set to 5-10x the
  median measured on a laptop (Apple silicon, Python 3.14). A budget is a ceiling for the BEST run, so
  scheduler noise cannot fail it; a real algorithmic regression multiplies the cost and does.
Run ``scripts/bench.py`` for the medians. Home Assistant's loop must never be held by one callback
for more than ``BUDGET_CALLBACK_S``: a recompute shares one occurrence cache per pass and yields
between entities (SPEC section 21).
"""

from __future__ import annotations

import asyncio
import statistics
import sys
import time
from datetime import date, timedelta
from zoneinfo import ZoneInfo

import pytest
from homeassistant.core import callback
from freezegun import freeze_time

from custom_components.weekly_planner import engine as engine_module
from custom_components.weekly_planner import timeline, validation, websocket
from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.resolver import occurrences_around
from custom_components.weekly_planner.validation import check_program

from .helpers import Recorder, labels, setup
from .perf_data import ENTITIES_PER_PROGRAM, PROGRAMS, big_program, big_programs, entity_ids

pytestmark = pytest.mark.performance

CONDITIONED = 20  # programs of ``big`` with a slot condition on an unknown sensor

# Wall-clock ceilings in seconds for the BEST of N runs. "measured" = median on the reference machine
# (0.19.0 value before the per-pass cache and yielding, in brackets).
BUDGETS = {
    "day_occurrences_all": 0.025,   # 50 programs x 1 day x 6 slots; measured median 1.4 ms
    "resolve_all_entities": 0.30,   # standalone segment() for 200 entities at one instant; measured 34 ms [36]
    "program_status_all": 0.25,     # program_status for 50 programs (200 next_action); measured 34 ms [126]
    "snapshot_build": 0.25,         # websocket snapshot of the whole install; measured 31 ms [132]
    "check_program_big": 0.025,     # one 3-mode x 7-day x 6-slot program, week overlap included; measured 1.0 ms
    "engine_startup": 0.45,         # _async_startup (descriptions + recompute of 200 entities); measured 56 ms [221]
    "recompute": 0.25,              # async_recompute after a state change, 200 entities, with its yields; measured 30 ms [169]
}
# Operation counts are deterministic: the bound is the measured value (plus a small margin).
OPS = {
    "program_status_occurrences": 60,      # occurrence() calls for one 4-entity program_status = 9 days x 6 slots; measured 54 [222]
    "check_program_day_calls": 100,        # day_occurrences() calls to validate one big program (3 modes x 8 days x 4 fixed slots = 96)
    "recompute_resolve_per_entity": 3,     # resolve_entity() per managed entity in a recompute (day time); measured 3.0
    # next_action resolves once more at every upcoming edge that changes nothing (start and end of a slot
    # whose condition is false): between 23:00 and 00:30 the 20 conditioned programs (80 entities) cross
    # both edges of their 00:30-02:00 slot first; measured 760 = 600 + 80 x 2.
    "recompute_resolve_extra_per_silent_edge": 1,
    "recompute_occurrences": 3000,         # occurrence() calls for a whole recompute (+ timer + publication) = 50 x 9 days x 6; measured 2700 [~16 800]
}
BUDGET_CALLBACK_S = 0.05  # no single loop callback of ours may hold Home Assistant longer than this
RUNS = 5

TZ = ZoneInfo("Europe/Brussels")


def best_of(fn, runs: int = RUNS) -> tuple[float, float]:
    """(best, median) seconds of ``runs`` calls."""
    times = []
    for _ in range(runs):
        start = time.perf_counter()
        fn()
        times.append(time.perf_counter() - start)
    return min(times), statistics.median(times)


async def best_of_async(fn, runs: int = RUNS) -> tuple[float, float]:
    times = []
    for _ in range(runs):
        start = time.perf_counter()
        await fn()
        times.append(time.perf_counter() - start)
    return min(times), statistics.median(times)


def within(name: str, timing: tuple[float, float]) -> None:
    best, median = timing
    print(f"[perf] {name}: best {best * 1000:.1f} ms, median {median * 1000:.1f} ms, budget {BUDGETS[name] * 1000:.0f} ms")
    assert best <= BUDGETS[name], f"{name}: best {best * 1000:.1f} ms over the {BUDGETS[name] * 1000:.0f} ms budget"


class Counter:
    """Counts the calls of a module function while letting them run."""

    def __init__(self, monkeypatch, module, name: str) -> None:
        self.count = 0
        original = getattr(module, name)

        def wrapper(*args, **kwargs):
            self.count += 1
            return original(*args, **kwargs)

        monkeypatch.setattr(module, name, wrapper)


@pytest.fixture
async def big(hass, hass_storage):
    """The large install, started; simulated time is released so timed sections run on the real clock."""
    Recorder(hass)
    for index in range(PROGRAMS):
        for eid in entity_ids(index):
            hass.states.async_set(eid, "heat", {"temperature": 10})
    await hass.config.async_update(latitude=50.85, longitude=4.35)
    frozen = freeze_time(engine_start())
    factory = frozen.start()
    try:
        eng = await setup(hass, hass_storage, factory, big_programs(conditioned=CONDITIONED), None)
    finally:
        frozen.stop()
    # The engine's timer was armed on the simulated clock; once released it could fire in the middle of a
    # measured section (it does when the monotonic clock is past it) and add a whole recompute to the
    # counts. Each test triggers its own work.
    if eng._timer:  # noqa: SLF001
        eng._timer()  # noqa: SLF001
        eng._timer = None  # noqa: SLF001
    return eng


def engine_start():
    from .helpers import local

    return local(26, 9, 0)


# Operation counts depend on the time of day (which slot edges come next), so they are taken at fixed
# simulated moments, never on the real clock (a recompute at 23:05 counted 760 instead of 600 on CI).
DAY = (26, 9, 1)
NIGHT = (26, 23, 30)


def frozen_at(moment: tuple[int, int, int]):
    from .helpers import local

    return freeze_time(local(*moment))


# ------------------------------------------------------------------ (a) timeline / resolver

def test_day_occurrences_all_programs():
    programs = big_programs()
    day = date(2026, 10, 26)
    sun = lambda event, d: None  # noqa: E731 - solar slots resolve to "event missing", cheapest path

    def run():
        for program in programs:
            timeline.day_occurrences(program["profiles"][0]["days"][0], day, TZ, sun, identity=(program["id"], "base"))

    within("day_occurrences_all", best_of(run))


async def test_resolve_all_entities_at_one_instant(big):
    now = engine_module.dt_util.utcnow()
    eids = sorted(big.managed_entities())
    assert len(eids) == PROGRAMS * ENTITIES_PER_PROGRAM
    within("resolve_all_entities", best_of(lambda: [big.segment(eid, now) for eid in eids]))


async def test_occurrences_cost_scales_linearly(monkeypatch):
    """Occurrences per lookup: 3 days x 6 slots per program, whatever the number of programs."""
    counter = Counter(monkeypatch, timeline, "occurrence")
    programs = big_programs(10)
    now = timeline.local_datetime(date(2026, 10, 26), 9, 0, TZ)[0]
    for program in programs:
        occurrences_around(program["profiles"][0], now, TZ, lambda e, d: None, program_id=program["id"])
    assert counter.count == 10 * 3 * 6


# ------------------------------------------------------------------ (b) status / next action

async def test_program_status_all(big):
    within("program_status_all", best_of(lambda: [big.program_status(p["id"]) for p in big.store.programs]))


async def test_status_occurrence_work_is_bounded(big, monkeypatch):
    """One program_status = one next_action sweep per entity; occurrences are shared per program."""
    counter = Counter(monkeypatch, timeline, "occurrence")
    with frozen_at(DAY):
        big.program_status("p0")
    # 9 days x 6 slots, each placed once per status (see OPS); 0.19.0 placed 222.
    print("[ops] program_status occurrences", counter.count)
    assert counter.count <= OPS["program_status_occurrences"], counter.count


# ------------------------------------------------------------------ (c) websocket snapshot

async def test_snapshot_build(big):
    within("snapshot_build", best_of(lambda: websocket._build_snapshot(big)))  # noqa: SLF001


async def test_snapshot_built_once_per_notification(big, monkeypatch):
    """Many open cards (connections) share one derived snapshot during a notification."""
    builds = Counter(monkeypatch, websocket, "_build_snapshot")
    seen = []
    unsubs = [big.add_listener(lambda: seen.append(websocket._snapshot(big))) for _ in range(5)]  # noqa: SLF001
    big._notify_listeners()  # noqa: SLF001
    for unsub in unsubs:
        unsub()
    assert builds.count == 1 and len(seen) == 5


async def test_websocket_get_round_trip(big, hass_ws_client):
    ws = await hass_ws_client(big.hass)
    start = time.perf_counter()
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    result = (await ws.receive_json())["result"]
    elapsed = time.perf_counter() - start
    print(f"[perf] ws get: {elapsed * 1000:.1f} ms")
    assert len(result["programs"]) == PROGRAMS
    assert elapsed <= BUDGETS["snapshot_build"] * 4


# ------------------------------------------------------------------ (d) validation

def test_check_program_big():
    lab = {label["id"]: label for label in labels()}
    program = big_program(0)
    checked = check_program(program, lab)  # also proves the synthetic program is valid
    assert len(checked["profiles"]) == 3
    within("check_program_big", best_of(lambda: check_program(program, lab)))


def test_overlap_check_work_is_bounded(monkeypatch):
    """The week overlap check places each fixed slot once per day it can touch (7 days + Sunday spill), no more."""
    counter = Counter(monkeypatch, validation, "day_occurrences")
    lab = {label["id"]: label for label in labels()}
    check_program(big_program(0), lab)
    print("[ops] check_program day_occurrences", counter.count)
    assert counter.count <= OPS["check_program_day_calls"], counter.count


# ------------------------------------------------------------------ (e) engine start and recompute

async def test_engine_startup(big):
    within("engine_startup", await best_of_async(big._async_startup, runs=3))  # noqa: SLF001


async def test_recompute_after_state_change(big):
    big.hass.states.async_set("climate.p0_e0", "heat", {"temperature": 22})
    within("recompute", await best_of_async(lambda: big.async_recompute("tick"), runs=3))


async def test_recompute_occurrence_work_is_bounded(big, monkeypatch):
    """A recompute places each day of each program once (one cache per pass), whatever the lookups."""
    counter = Counter(monkeypatch, timeline, "occurrence")
    with frozen_at(DAY):
        await big.async_recompute("tick")
    print("[ops] recompute occurrences", counter.count)
    assert counter.count <= OPS["recompute_occurrences"], counter.count


@pytest.mark.parametrize(("moment", "silent_edges"), [(DAY, 0), (NIGHT, CONDITIONED * ENTITIES_PER_PROGRAM * 2)],
                         ids=["day", "night"])
async def test_recompute_resolutions_per_entity_are_bounded(big, monkeypatch, moment, silent_edges):
    """A recompute resolves each managed entity a bounded number of times: segment, then next_action's
    current segment and first changing edge, plus one per upcoming edge that changes nothing.

    At night the next edges of the conditioned programs are the start and end of a slot whose condition
    is false (``binary_sensor.late<i>`` is unknown): two silent edges for each of their entities.
    """
    counter = Counter(monkeypatch, engine_module, "resolve_entity")
    with frozen_at(moment):
        await big.async_recompute("tick")
    print("[ops] recompute resolve_entity", moment, counter.count)
    bound = (OPS["recompute_resolve_per_entity"] * PROGRAMS * ENTITIES_PER_PROGRAM
             + OPS["recompute_resolve_extra_per_silent_edge"] * silent_edges)
    assert counter.count <= bound, counter.count


# ------------------------------------------------------------------ (f) event loop stays responsive

# Under ``coverage`` every line costs more, so the same code holds the loop longer. The margin is only
# applied then; a plain run keeps the strict budget.
def coverage_margin() -> float:
    try:
        import coverage
    except ImportError:  # pragma: no cover
        return 1.0
    return 3.0 if coverage.Coverage.current() is not None or sys.gettrace() is not None else 1.0


BURST_ATTEMPTS = 3  # a slice is a ceiling for the BEST attempt: machine load adds time, never removes it


async def _burst(big, attempt: int, *, late: bool) -> tuple[float, float]:
    """Fire one burst of state changes; return (longest ``_on_state``, longest gap between loop turns).

    The gap is measured explicitly by a probe task that yields to the loop in a tight cycle: the time
    between two of its turns is the longest synchronous slice any callback (ours or not) held the loop.
    This replaces asyncio's debug "slow callback" log, whose threshold reacted to scheduler noise.
    """
    hass = big.hass
    longest = 0.0
    original = big._on_state  # noqa: SLF001

    @callback
    def timed(event):
        nonlocal longest
        start = time.perf_counter()
        original(event)
        longest = max(longest, time.perf_counter() - start)

    gap = 0.0
    running = True

    async def probe():
        nonlocal gap
        last = time.perf_counter()
        while running:
            await asyncio.sleep(0)
            now = time.perf_counter()
            gap = max(gap, now - last)
            last = now

    big._on_state = timed  # noqa: SLF001
    big._subscribe()  # noqa: SLF001 - rebind the state listener to the timed wrapper
    task = asyncio.get_running_loop().create_task(probe())
    try:
        for index in range(PROGRAMS):
            for eid in entity_ids(index):  # a different value each attempt, so every call is a real change
                hass.states.async_set(eid, "heat", {"temperature": 11 + (index + attempt) % 3 + attempt * 3})
        if late:  # a condition entity seen for the first time starts a full recompute
            for index in range(20):
                hass.states.async_set(f"binary_sensor.late{attempt}_{index}", "on")
        await hass.async_block_till_done()
    finally:
        running = False
        await task
        big._on_state = original  # noqa: SLF001
    return longest, gap


async def _best_burst(big, *, late: bool) -> tuple[float, float]:
    """Best (smallest) longest-slice over a few bursts, so one noisy attempt cannot fail the test."""
    results = [await _burst(big, attempt, late=late) for attempt in range(BURST_ATTEMPTS)]
    return min(r[0] for r in results), min(r[1] for r in results)


async def test_state_change_burst_does_not_block_loop(big):
    """200 ordinary state changes of managed entities: every callback stays far under the budget."""
    longest, gap = await _best_burst(big, late=False)
    margin = coverage_margin()
    print(f"[perf] burst of {PROGRAMS * ENTITIES_PER_PROGRAM} changes, longest _on_state {longest * 1000:.2f} ms, "
          f"loop gap {gap * 1000:.2f} ms, margin x{margin:g}")
    assert longest <= BUDGET_CALLBACK_S * margin
    assert gap <= BUDGET_CALLBACK_S * margin


async def test_condition_burst_recompute_does_not_block_loop(big):
    """A condition change starts a recompute of every entity: it must not hold the loop over the budget."""
    longest, gap = await _best_burst(big, late=True)
    margin = coverage_margin()
    print(f"[perf] condition burst, longest _on_state {longest * 1000:.2f} ms, loop gap {gap * 1000:.2f} ms, "
          f"margin x{margin:g}")
    assert longest <= BUDGET_CALLBACK_S * margin
    assert gap <= BUDGET_CALLBACK_S * margin
