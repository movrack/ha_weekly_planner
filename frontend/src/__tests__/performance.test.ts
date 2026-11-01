// Performance budgets for the pure hot paths of the card. Two kinds of assertion, so a regression fails
// without flaking on a slow CI runner: operation counts (deterministic) and wall-clock ceilings for the BEST
// of several runs, each set to 5-10x the median measured on a laptop (noted next to each budget).
import { beforeEach, describe, expect, it, vi } from "vitest";
import { groupSlots, writeGroups } from "../actions";
import { boundaries, moveBoundary, overlapDay, segments, splitBusyDays, type DayCtx } from "../edits";
import { clearPreviewCache, fetchPreview, syncPreviewCache } from "../preview-cache";
import { findOverlap, fixedInterval } from "../slots";
import { clockToMinutes, dateFormat, fmtClock, formatWhen, localDateIso, localMinutes } from "../time";
import type { HomeAssistant, Profile, Program, Slot, TimeSpec } from "../types";
import { WeeklyPlannerCard } from "../weekly-planner-card";

/** Milliseconds, BEST of `runs` calls. */
function best(fn: () => void, runs = 7): number {
  let min = Infinity;
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    fn();
    min = Math.min(min, performance.now() - start);
  }
  return min;
}

// Budgets in ms (best of N). "measured" = median on the reference machine.
const BUDGET = {
  spans_build: 100,    // 280 entity-days of spans (10 programs x 4 entities x 7 days); measured 10.6 ms
  fmt_clock: 250,      // 10 000 fmtClock / localMinutes (+ 1 000 formatWhen) calls; measured 34 ms
  preview_cache: 20,   // three syncs of 50 programs over 400 cached previews; measured 0.06 ms
  edits: 80,           // 50 slots a day, 7 days: overlap, segments, boundaries, move, grouping; measured 7.9 ms
  render: 30,          // one card render() of 10 programs x 4 entities, spans rebuilt; measured 2.3 ms
};

const label = { id: "l", name: "On", color: "#fa0", action: { kind: "service", service: "switch.turn_on" } };

/** `count` fixed slots from 00:00 on, each `length` minutes with a 2-minute gap. */
function slotsOf(prefix: string, count: number, length = 20): Slot[] {
  return Array.from({ length: count }, (_, i) => {
    const start = i * (length + 2);
    const clock = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    return { id: `${prefix}${i}`, label: "l", start: { time: clock(start) }, end: { time: clock(start + length) } } as Slot;
  });
}

function bigProgram(index: number): Program {
  const days = Array.from({ length: 7 }, (_, d) => slotsOf(`p${index}d${d}s`, 6, 60));
  return { id: `p${index}`, name: `P${index}`, priority: 10, enabled: true, revision: 1, active_profile: "base",
    entities: [0, 1, 2, 3].map((k) => ({ entity_id: `switch.p${index}e${k}`, label_overrides: {} })),
    profiles: [{ id: "base", name: "Base", days }] } as unknown as Program;
}

function cardWith(programs: Program[]) {
  const card = new WeeklyPlannerCard() as any;
  card.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, user: { is_admin: false } };
  card._config = {};
  card._now = new Date("2026-01-02T12:00:00Z");
  card._data = { labels: [label], status: {}, programs, can_edit: false, read_only: false, vacation: false };
  return card;
}

describe("spans memoization and build cost", () => {
  it("computes each entity-day once, reuses it until an input is replaced", () => {
    const programs = Array.from({ length: 10 }, (_, i) => bigProgram(i));
    const card = cardWith(programs);
    const compute = vi.spyOn(card, "_computeSpans");
    const pass = () => { for (const p of programs) for (const e of p.entities) for (let o = 0; o < 7; o++) card._spans(e.entity_id, [p], o); };
    pass();
    expect(compute).toHaveBeenCalledTimes(10 * 4 * 7);
    pass();
    pass();
    expect(compute).toHaveBeenCalledTimes(10 * 4 * 7); // memoized: no rebuild
    card._preview = {}; // a preview update replaces one input: rebuild once
    pass();
    expect(compute).toHaveBeenCalledTimes(2 * 10 * 4 * 7);
    card._now = new Date("2026-01-02T12:01:00Z");
    pass();
    expect(compute).toHaveBeenCalledTimes(3 * 10 * 4 * 7);
  });

  it("builds the spans of 280 entity-days under budget", () => {
    const programs = Array.from({ length: 10 }, (_, i) => bigProgram(i));
    const card = cardWith(programs);
    const ms = best(() => {
      card._preview = {}; // invalidate
      for (const p of programs) for (const e of p.entities) for (let o = 0; o < 7; o++) card._spans(e.entity_id, [p], o);
    });
    console.log(`[perf] spans 280 entity-days: ${ms.toFixed(1)} ms (budget ${BUDGET.spans_build})`);
    expect(ms).toBeLessThanOrEqual(BUDGET.spans_build);
  });
});

describe("card render", () => {
  it("a data update rebuilds the spans once per bar, an identical render rebuilds none", () => {
    const programs = Array.from({ length: 10 }, (_, i) => bigProgram(i));
    const card = cardWith(programs);
    const compute = vi.spyOn(card, "_computeSpans");
    card.render();
    const bars = compute.mock.calls.length;
    expect(bars).toBe(10 * 4); // one today bar per entity (week rows are collapsed)
    card.render();
    card.render();
    expect(compute).toHaveBeenCalledTimes(bars); // same inputs: memoized
    card._data = { ...card._data }; // a pushed snapshot replaces the data
    card.render();
    expect(compute).toHaveBeenCalledTimes(2 * bars); // rebuilt exactly once per bar, not once per render
    card.render();
    expect(compute).toHaveBeenCalledTimes(2 * bars);
  });

  it("renders 40 bars under budget", () => {
    const card = cardWith(Array.from({ length: 10 }, (_, i) => bigProgram(i)));
    const ms = best(() => { card._preview = {}; card.render(); });
    console.log(`[perf] card render, 40 bars: ${ms.toFixed(1)} ms (budget ${BUDGET.render})`);
    expect(ms).toBeLessThanOrEqual(BUDGET.render);
  });
});

describe("time formatting", () => {
  it("builds one Intl formatter per locale and options, whatever the number of calls", () => {
    const Original = Intl.DateTimeFormat;
    let built = 0;
    const spy = vi.spyOn(Intl, "DateTimeFormat").mockImplementation(function (this: unknown, ...args: ConstructorParameters<typeof Intl.DateTimeFormat>) {
      built++;
      return new Original(...args);
    } as any);
    try {
      for (let i = 0; i < 2000; i++) {
        fmtClock("en-perf", i % 1440);
        formatWhen("2026-01-05T08:00:00Z", "UTC", "en-perf", new Date("2026-01-02T12:00:00Z"));
        localDateIso(new Date(i * 60_000), "UTC");
      }
    } finally { spy.mockRestore(); }
    expect(built).toBeLessThanOrEqual(8); // a handful of distinct option sets, not one per call
    expect(dateFormat("en-perf", { timeZone: "UTC" })).toBe(dateFormat("en-perf", { timeZone: "UTC" }));
  });

  it("formats 10 000 times under budget", () => {
    const now = new Date("2026-01-02T12:00:00Z");
    const ms = best(() => {
      for (let i = 0; i < 10_000; i++) {
        fmtClock("en", i % 1440);
        localMinutes("2026-01-05T08:00:00Z", "Europe/Brussels");
        if (i % 10 === 0) formatWhen("2026-01-05T08:00:00Z", "Europe/Brussels", "fr", now);
      }
    });
    console.log(`[perf] time formatting x10000: ${ms.toFixed(1)} ms (budget ${BUDGET.fmt_clock})`);
    expect(ms).toBeLessThanOrEqual(BUDGET.fmt_clock);
  });
});

describe("preview cache with 400 entries", () => {
  beforeEach(() => clearPreviewCache());
  const hassWith = () => ({ callWS: vi.fn(async () => ({ slots: [] })) }) as unknown as HomeAssistant & { callWS: ReturnType<typeof vi.fn> };
  const keys = Array.from({ length: 50 }, (_, p) => Array.from({ length: 8 }, (_, d) => [`prog${p}`, `2026-01-${String(d + 1).padStart(2, "0")}`] as const)).flat();

  it("asks the server once per (program, date), then answers from the cache", async () => {
    const hass = hassWith();
    await Promise.all(keys.map(([p, d]) => fetchPreview(hass, p, 1, d)));
    expect(hass.callWS).toHaveBeenCalledTimes(400);
    await Promise.all(keys.map(([p, d]) => fetchPreview(hass, p, 1, d)));
    await Promise.all(keys.map(([p, d]) => fetchPreview(hass, p, 1, d)));
    expect(hass.callWS).toHaveBeenCalledTimes(400);
  });

  it("stays bounded at 400 entries and syncs 50 programs under budget", async () => {
    const hass = hassWith();
    await Promise.all(keys.map(([p, d]) => fetchPreview(hass, p, 1, d)));
    await fetchPreview(hass, "extra", 1, "2026-02-01"); // 401st: evicts the oldest
    expect(hass.callWS).toHaveBeenCalledTimes(401);
    await fetchPreview(hass, "extra", 1, "2026-02-01");
    expect(hass.callWS).toHaveBeenCalledTimes(401);
    const programs = Array.from({ length: 50 }, (_, i) => ({ id: `prog${i}`, revision: 1 }));
    const ms = best(() => {
      syncPreviewCache({ card_version: "v", programs });
      syncPreviewCache({ card_version: "v", programs: programs.map((p) => ({ ...p, revision: 2 })) }); // drops every program
      syncPreviewCache({ card_version: "v", programs });
    });
    console.log(`[perf] preview cache sync x3, 50 programs: ${ms.toFixed(2)} ms (budget ${BUDGET.preview_cache})`);
    expect(ms).toBeLessThanOrEqual(BUDGET.preview_cache);
  });
});

describe("edits on 50 slots a day", () => {
  const slots = slotsOf("s", 50);
  const profile: Profile = { id: "base", name: "Base", days: Array.from({ length: 7 }, (_, d) => slotsOf(`d${d}s`, 50)) };
  const at = (spec: TimeSpec) => ("time" in spec ? clockToMinutes(spec.time) : 0);
  const ctx: DayCtx = { at };
  const all = () => true;

  it("keeps the 50 slots without overlap and finds a real one", () => {
    expect(findOverlap(slots)).toBeNull();
    expect(fixedInterval(slots[0])).toEqual([0, 20]);
    const crowded = [...slots, { ...slots[10], id: "dup" }];
    expect(findOverlap(crowded)).not.toBeNull();
  });

  it("snaps and overlap-checks the whole week under budget", () => {
    const ms = best(() => {
      expect(overlapDay(profile)).toBeNull();
      segments(slots, ctx);
      for (const b of boundaries(slots, ctx)) if (b.refs[0]) moveBoundary(slots, b.refs[0], b.m + 1, ctx);
      splitBusyDays(profile, all, at, slotsOf("n", 1, 2)[0]);
      writeGroups(profile, groupSlots(profile, all, at), all, at);
    }, 5);
    console.log(`[perf] edits, 50 slots x 7 days: ${ms.toFixed(1)} ms (budget ${BUDGET.edits})`);
    expect(ms).toBeLessThanOrEqual(BUDGET.edits);
  });

  it("checks overlap in one sort, not pairwise (operation count)", () => {
    const sort = vi.spyOn(Array.prototype, "sort");
    try {
      findOverlap(slots);
      expect(sort).toHaveBeenCalledTimes(1);
    } finally { sort.mockRestore(); }
  });
});
