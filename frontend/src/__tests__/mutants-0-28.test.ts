// Tests written to kill the mutants (StrykerJS) that survived in the code added up to 0.28:
// times-list, list-order, hold-hint, slots, time, chart-zoom. One test per behaviour.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BarSpan } from "../components/day-bar";
import { timesRows, sunRuleText } from "../times-list";
import { groupItems, moveId, sortItems } from "../list-order";
import { dismissHoldHint, takeHoldHint } from "../hold-hint";
import { fixedInterval, findOverlap, normaliseEntities, sameEntities, shiftTimeSpec } from "../slots";
import { fmtClock, fmtTick12, formatWhen, setTimeFormat, spillover } from "../time";
import { isFullDay, normalise, rangeToWindow, tickStep, zoomAround, zoomTimeline } from "../chart-zoom";
import type { Slot } from "../types";
import { WpTimesDay } from "../components/times-day";
import type { TimesRow } from "../times-list";
import { WpSlotForm, solarMeaningText } from "../components/slot-form";
import { find, flat, handlers } from "./helpers/tpl";

const T = (h: number, m = 0, day = 10) => Date.UTC(2026, 10, day, h, m);
const span = (start: number, end: number, extra: Partial<BarSpan> = {}): BarSpan => ({
  start, end, color: "#f00", label: `L${start}`, slotId: `s${start}`, ...extra,
});
const ids = (rows: { slotId?: string }[]) => rows.map((r) => r.slotId);
const none = { tz: "UTC", nowMin: null };

describe("times rows: which spans are hidden by a winner", () => {
  it("a one-shot marker never hides a span, whatever its minutes", () => {
    const rows = timesRows([span(100, 200, { slotId: "a" }), span(0, 1440, { slotId: "m", marker: true })], none);
    expect(ids(rows)).toEqual(["m", "a"]);
  });
  it("the same interval twice: the later one wins, by minutes and by instants", () => {
    expect(ids(timesRows([span(100, 200, { slotId: "a" }), span(100, 200, { slotId: "b" })], none))).toEqual(["b"]);
    const a = span(100, 200, { slotId: "a", startMs: T(1, 40), endMs: T(3, 20) });
    const b = span(100, 200, { slotId: "b", startMs: T(1, 40), endMs: T(3, 20) });
    expect(ids(timesRows([a, b], none))).toEqual(["b"]);
  });
  it("uses the instants only when both spans have both a start and an end instant", () => {
    const bothMs = { startMs: T(5), endMs: T(6) };
    // the minutes say the winner covers; the instants of the one that has them say it does not
    expect(ids(timesRows([span(100, 200, { slotId: "a", ...bothMs }), span(0, 1440, { slotId: "w", endMs: T(2) })], none))).toEqual(["w"]);
    expect(ids(timesRows([span(100, 200, { slotId: "a", endMs: T(1) }), span(0, 1440, { slotId: "w", startMs: T(7), endMs: T(8) })], none))).toEqual(["w"]);
    expect(ids(timesRows([span(100, 200, { slotId: "a", ...bothMs }), span(0, 1440, { slotId: "w", startMs: T(7) })], none))).toEqual(["w"]);
  });
  it("by instants: a winner that starts one millisecond later hides nothing", () => {
    const a = span(100, 200, { slotId: "a", startMs: T(1, 40), endMs: T(3, 20) });
    const b = span(100, 200, { slotId: "b", startMs: T(1, 40) + 1, endMs: T(3, 20) });
    expect(ids(timesRows([a, b], none))).toEqual(["a", "b"]);
    const c = span(100, 200, { slotId: "c", startMs: T(1, 40), endMs: T(3, 20) - 1 });
    expect(ids(timesRows([a, c], none))).toEqual(["a", "c"]);
  });
  it("by instants: a winner ending exactly at a one-shot hides it", () => {
    const m = span(100, 100, { slotId: "m", marker: true, startMs: T(3, 20) });
    const w = span(60, 200, { slotId: "w", startMs: T(1), endMs: T(3, 20) });
    expect(ids(timesRows([m, w], none))).toEqual(["w"]);
  });
  it("the instants win over the minutes when both are known (a 25-hour day)", () => {
    const a = span(150, 160, { slotId: "a", startMs: T(1, 30), endMs: T(1, 40) });
    const b = span(150, 170, { slotId: "b", startMs: T(2, 30), endMs: T(2, 50) });
    expect(ids(timesRows([a, b], none))).toEqual(["a", "b"]);
  });
  it("falls back to the minutes when the winner has no end instant, or the loser has no start or end instant", () => {
    const wide = { start: 0, end: 1440 };
    const noEnd = span(0, 1440, { slotId: "w", startMs: T(5), endMs: null });
    expect(ids(timesRows([span(100, 200, { slotId: "a", startMs: T(1), endMs: T(2) }), noEnd], none))).toEqual(["w"]);
    const later = span(wide.start, wide.end, { slotId: "w", startMs: T(5), endMs: T(6) });
    expect(ids(timesRows([span(100, 200, { slotId: "a", startMs: T(1), endMs: null }), later], none))).toEqual(["w"]);
    expect(ids(timesRows([span(100, 200, { slotId: "a" }), span(0, 1440, { slotId: "w", startMs: T(0), endMs: T(23) })], none))).toEqual(["w"]);
  });
});

describe("times rows: keys", () => {
  it("is `slot|start`, with an empty slot id when there is none", () => {
    expect(timesRows([span(60, 120, { slotId: undefined })], none)[0].key).toBe("|60");
    expect(timesRows([span(60, 120, { slotId: "x", startMs: T(1) })], none)[0].key).toBe(`x|${T(1)}`);
  });
  it("two slots starting at the same minute are two rows; the same slot at two instants too", () => {
    expect(ids(timesRows([span(60, 200, { slotId: "a" }), span(60, 100, { slotId: "b" })], none)).sort()).toEqual(["a", "b"]);
    const x = span(150, 160, { slotId: "x", startMs: T(1, 30), endMs: T(1, 40) });
    const y = span(150, 160, { slotId: "x", startMs: T(2, 30), endMs: T(2, 40) });
    expect(timesRows([x, y], none)).toHaveLength(2);
  });
});

describe("times rows: the end of a span running past midnight", () => {
  it("reads the nominal end when there is no end instant", () => {
    const [r] = timesRows([span(1300, 1440, { endSpec: { time: "02:00" } })], none);
    expect(r.until).toEqual({ day: "tomorrow", min: 120 });
  });
});

describe("times rows: sun rule", () => {
  const sun = { sun: "sunset" as const, offset: -30 };
  it("is given for a sun start of today only", () => {
    expect(timesRows([span(60, 120, { startSun: "down", startSpec: sun })], none)[0].rule).toEqual(sun);
  });
  it("is null for a fixed start, a start without sun icon, no spec, or a carried-over row", () => {
    expect(timesRows([span(60, 120, { startSun: "down", startSpec: { time: "01:00" } })], none)[0].rule).toBeNull();
    expect(timesRows([span(60, 120, { startSun: null, startSpec: sun })], none)[0].rule).toBeNull();
    expect(timesRows([span(60, 120, { startSun: "down", startSpec: null })], none)[0].rule).toBeNull();
    expect(timesRows([span(0, 120, { spill: true, startSun: "down", startSpec: sun, startMs: T(22, 0, 9) })], none)[0].rule).toBeNull();
  });
  it("an unknown sun event reads as sunset", () => {
    expect(sunRuleText("en", { sun: "bogus" } as any)).toBe(sunRuleText("en", { sun: "sunset" }));
  });
});

describe("times rows: order", () => {
  it("by minutes when an instant is missing on either side", () => {
    const a = span(60, 70, { slotId: "a", startMs: T(23) });
    const b = span(300, 310, { slotId: "b" });
    expect(ids(timesRows([b, a], none))).toEqual(["a", "b"]);
    expect(ids(timesRows([a, b], none))).toEqual(["a", "b"]);
    const c = span(60, 70, { slotId: "c" });
    const d = span(300, 310, { slotId: "d", startMs: T(1) });
    expect(ids(timesRows([d, c], none))).toEqual(["c", "d"]);
  });
  it("by minutes when two instants are equal", () => {
    const a = span(100, 110, { slotId: "a", startMs: T(5) });
    const b = span(50, 60, { slotId: "b", startMs: T(5) });
    expect(ids(timesRows([a, b], none))).toEqual(["b", "a"]);
  });
});

describe("times rows: the current row", () => {
  const at = (nowMin: number | null, nowMs?: number | null) => ({ tz: "UTC", nowMin, nowMs });
  it("none without a minute now, even for a span starting at midnight", () => {
    expect(timesRows([span(0, 100)], none)[0].now).toBe(false);
  });
  it("by instants: from the start (included) to the end (excluded), whatever the minutes say", () => {
    const s = span(150, 160, { startMs: T(2, 30), endMs: T(2, 40) });
    expect(timesRows([s], at(0, T(2, 30)))[0].now).toBe(true);
    expect(timesRows([s], at(155, T(2, 40)))[0].now).toBe(false);
    expect(timesRows([s], at(155, T(1, 30)))[0].now).toBe(false);
    expect(timesRows([s], at(155, T(3, 30)))[0].now).toBe(false);
  });
  it("by minutes when the instant now, or the span's start or end instant, is missing", () => {
    expect(timesRows([span(150, 160, { startMs: T(5), endMs: T(6) })], at(155))[0].now).toBe(true);
    expect(timesRows([span(150, 160, { startMs: T(5), endMs: null })], at(155, T(9)))[0].now).toBe(true);
    expect(timesRows([span(150, 160, { endMs: T(6) })], at(155, T(9)))[0].now).toBe(true);
  });
  it("by minutes: the start is included, the end excluded", () => {
    expect(timesRows([span(150, 160)], at(150))[0].now).toBe(true);
    expect(timesRows([span(150, 160)], at(160))[0].now).toBe(false);
  });
});

describe("times rows: done", () => {
  const at = (nowMin: number | null, nowMs?: number | null) => ({ tz: "UTC", nowMin, nowMs });
  it("never without a minute now, even with an instant", () => {
    expect(timesRows([span(60, 120, { startMs: T(1), endMs: T(2) })], at(null, T(5)))[0].done).toBe(false);
  });
  it("never for a one-shot, a span ending tomorrow, or an end not known", () => {
    expect(timesRows([span(60, 60, { marker: true })], at(1000))[0].done).toBe(false);
    expect(timesRows([span(1300, 1440, { endSpec: { time: "02:00" } })], at(1400))[0].done).toBe(false);
    expect(timesRows([span(1300, 1440, { endSpec: { sun: "sunrise" } })], at(1400))[0].done).toBe(false);
  });
  it("by instants: done when the end is not after now, whatever the minutes say", () => {
    const s = span(150, 160, { startMs: T(2, 30), endMs: T(2, 40) });
    expect(timesRows([s], at(100, T(2, 40)))[0].done).toBe(true);
    expect(timesRows([s], at(500, T(2, 35)))[0].done).toBe(false);
  });
  it("by minutes when there is no instant now, or no end instant", () => {
    expect(timesRows([span(60, 120, { startMs: T(1), endMs: T(2) })], at(500))[0].done).toBe(true);
    expect(timesRows([span(60, 120, { startMs: T(1), endMs: null })], at(500, T(9)))[0].done).toBe(true);
    expect(timesRows([span(60, 120)], at(100))[0].done).toBe(false);
    expect(timesRows([span(60, 120)], at(50))[0].done).toBe(false);
    expect(timesRows([span(60, 120, { startMs: T(1), endMs: null })], at(50, T(9)))[0].done).toBe(false);
    expect(timesRows([span(60, 120)], at(120))[0].done).toBe(true);
  });
});

describe("times rows: neighbours of the same setting", () => {
  const lab = (start: number, end: number, extra: Partial<BarSpan> = {}) => span(start, end, { labelId: "x", ...extra });
  it("merge when the minutes touch, and 'now' is only kept when one part is now", () => {
    const rows = timesRows([lab(100, 200), lab(200, 300)], { tz: "UTC", nowMin: 50 });
    expect(rows).toHaveLength(1);
    expect(rows[0].now).toBe(false);
    expect(timesRows([lab(100, 200), lab(200, 300)], none)[0].now).toBe(false);
  });
  it("do not merge without a setting id, or with two different ones", () => {
    expect(timesRows([span(100, 200), span(200, 300)], none)).toHaveLength(2);
    expect(timesRows([lab(100, 200), lab(200, 300, { labelId: "y" })], none)).toHaveLength(2);
  });
  it("do not merge a one-shot, or a span ending tomorrow", () => {
    expect(timesRows([lab(100, 200), lab(200, 200, { marker: true })], none)).toHaveLength(2);
    expect(timesRows([lab(1300, 1440, { endSpec: { time: "02:00" } }), lab(120, 300)], none)).toHaveLength(2);
  });
  it("do not merge a span carried over from yesterday", () => {
    const a = lab(0, 1380, { spill: true, startSpec: { time: "01:00" } });
    const b = lab(1380, 1400, { spill: true, startSpec: { time: "23:00" } });
    expect(timesRows([a, b], none)).toHaveLength(2);
  });
  it("compare the instants when both are known, the minutes otherwise", () => {
    expect(timesRows([lab(100, 200, { endMs: T(3, 20) }), lab(200, 300, { startMs: T(3, 21) })], none)).toHaveLength(2);
    expect(timesRows([lab(100, 200, { endMs: T(3, 20) }), lab(160, 300, { startMs: T(3, 20) })], none)).toHaveLength(1);
    expect(timesRows([lab(100, 200, { endMs: T(3, 20) }), lab(200, 300)], none)).toHaveLength(1);
    expect(timesRows([lab(100, 200), lab(200, 300, { startMs: T(9) })], none)).toHaveLength(1);
    expect(timesRows([lab(100, 200, { endMs: null }), lab(200, 300, { startMs: T(9) })], none)).toHaveLength(1);
  });
});

describe("list order mutants", () => {
  const a = (id: string, area?: string, type = "t") => ({ id, name: id, type, area });
  it("types without a label function sort by their domain", () => {
    expect(sortItems([a("1", "", "zz"), a("2", "", "aa")], "type").map((i) => i.id)).toEqual(["2", "1"]);
  });
  it("an empty room is last, whichever side of the comparison it is on", () => {
    expect(sortItems([a("1", ""), a("2", "Bureau")], "area").map((i) => i.id)).toEqual(["2", "1"]);
    expect(sortItems([a("2", "Bureau"), a("1", "")], "area").map((i) => i.id)).toEqual(["2", "1"]);
    expect(sortItems([a("2", "Bureau"), a("1", ""), a("3", "Cave")], "area").map((i) => i.id)).toEqual(["2", "3", "1"]);
  });
  it("name and custom lists are one group with an empty key and no heading", () => {
    expect(groupItems([a("1")], "name")).toEqual([{ key: "", header: false, items: [a("1")] }]);
    expect(groupItems([a("1")], "custom")[0].key).toBe("");
  });
  it("moveId leaves the list alone for a start outside it", () => {
    const ids = ["a", "b"];
    expect(moveId(ids, 2, 0)).toEqual(["a", "b"]);
    expect(moveId(ids, -1, 0)).toEqual(["a", "b"]);
    expect(moveId(ids, 1, 0)).toEqual(["b", "a"]);
  });
});

describe("hold hint mutants", () => {
  const store = new Map<string, string>();
  let failRead = false;
  beforeEach(() => {
    store.clear(); failRead = false;
    vi.stubGlobal("window", { localStorage: {
      getItem: (k: string) => { if (failRead) throw new Error("denied"); return store.get(k) ?? null; },
      setItem: (k: string, v: string) => { store.set(k, v); },
    } });
  });
  afterEach(() => vi.unstubAllGlobals());
  it("counts the first showing even when the storage cannot be read", () => {
    failRead = true;
    expect(takeHoldHint()).toBe(true);
    expect([...store.values()]).toEqual(["1"]);
  });
  it("dismissing never lowers a count already at or above the maximum", () => {
    store.set("weekly_planner.hold_hint", "5");
    dismissHoldHint();
    expect(store.get("weekly_planner.hold_hint")).toBe("5");
    store.set("weekly_planner.hold_hint", "1");
    dismissHoldHint();
    expect(store.get("weekly_planner.hold_hint")).toBe("3");
  });
});

describe("slots mutants", () => {
  const hass: any = { config: { time_zone: "UTC" }, states: {} };
  const slot = (start: any, end?: any, entities?: string[]): Slot => ({ id: `${JSON.stringify(start)}${entities}`, start, end, entities } as any);
  const f = (a: string, b: string, e?: string[]) => slot({ time: a }, { time: b }, e);
  it("a sun offset of exactly 240 stays a sun time", () => {
    expect(shiftTimeSpec(hass, { sun: "sunset", offset: 200 }, 40)).toEqual({ sun: "sunset", offset: 240 });
  });
  it("fixedInterval: null for a sun start or end, to midnight for an end not after the start", () => {
    expect(fixedInterval(slot({ sun: "sunset" }, { time: "10:00" }))).toBeNull();
    expect(fixedInterval(slot({ time: "10:00" }, { sun: "sunset" }))).toBeNull();
    expect(fixedInterval(slot({ time: "10:00" }))).toBeNull();
    expect(fixedInterval(f("22:00", "06:00"))).toEqual([1320, 1440]);
    expect(fixedInterval(f("10:00", "10:00"))).toEqual([600, 1440]);
    expect(fixedInterval(f("10:00", "12:00"))).toEqual([600, 720]);
  });
  it("findOverlap sorts the slots by start first", () => {
    const c = f("14:00", "15:00"), a = f("09:00", "11:00"), b = f("10:00", "12:00");
    expect(findOverlap([c, b, a])).toEqual([a, b]);
  });
  it("findOverlap per device: the earlier slot reaching furthest is the one reported", () => {
    const a = f("09:00", "10:00", ["x"]), b = f("09:15", "12:00", ["y"]), c = f("09:30", "11:00", ["x", "y"]);
    expect(findOverlap([a, b, c])).toEqual([b, c]);
    const a2 = f("09:00", "12:00", ["x"]), b2 = f("09:15", "12:00", ["y"]), c2 = f("10:00", "11:00", ["x", "y"]);
    expect(findOverlap([a2, b2, c2])).toEqual([a2, c2]);
    const a3 = f("09:00", "12:00", ["x"]), b3 = f("09:15", "10:00", ["y"]), c3 = f("09:30", "11:00", ["x", "y"]);
    expect(findOverlap([a3, b3, c3])).toEqual([a3, c3]);
  });
  it("findOverlap per device: no collision without a common device", () => {
    expect(findOverlap([f("09:00", "11:00", ["x"]), f("10:00", "12:00", ["y"])])).toBeNull();
  });
  it("sameEntities ignores the order but not the content", () => {
    expect(sameEntities({ entities: ["b", "a"] }, { entities: ["a", "b"] })).toBe(true);
    expect(sameEntities({ entities: ["a", "b"] }, { entities: ["a", "c"] })).toBe(false);
    expect(sameEntities({ entities: ["a"] }, { entities: ["a", "b"] })).toBe(false);
  });
  it("normaliseEntities: an empty selection of an empty program is an empty list", () => {
    expect(normaliseEntities([], [])).toEqual([]);
    expect(normaliseEntities(["a", "b"], ["a", "b"])).toBeUndefined();
  });
});

describe("time mutants", () => {
  afterEach(() => setTimeFormat(null));
  const sl = (start: string, end?: string): Slot => ({ id: start, start: { time: start }, end: end ? { time: end } : undefined } as any);
  it("spillover: only a fixed end not after a fixed start, before noon", () => {
    expect(spillover([sl("22:00", "06:00")]).map((x) => x.end)).toEqual([360]);
    expect(spillover([sl("08:00", "08:00")]).map((x) => x.end)).toEqual([480]);
    expect(spillover([sl("20:00", "12:00")])).toEqual([]);
    expect(spillover([sl("06:00", "08:00")])).toEqual([]);
    expect(spillover([{ id: "s", start: { sun: "sunset" }, end: { time: "00:00" } } as any])).toEqual([]);
    expect(spillover([{ id: "s", start: { time: "22:00" }, end: { sun: "sunrise" } } as any])).toEqual([]);
    expect(spillover([sl("22:00")])).toEqual([]);
  });
  it("fmtClock: a French variant keeps the French style only when French leads", () => {
    expect(fmtClock("fr-CA", 1320, "24")).toBe("22 h");
  });
  it("fmtClock: 'language' lets a 24-hour locale stay 24-hour", () => {
    expect(fmtClock("en-GB", 1320, "language")).toBe("22");
  });
  it("fmtTick12: noon, midnight, hours and half hours", () => {
    expect(fmtTick12(12, 0)).toBe("noon");
    expect(fmtTick12(0, 0)).toBe("midnight");
    expect(fmtTick12(24, 0)).toBe("midnight");
    expect(fmtTick12(7, 0)).toBe("7 am");
    expect(fmtTick12(19, 0)).toBe("7 pm");
    expect(fmtTick12(12, 30, true)).toBe("12:30 pm");
    expect(fmtTick12(0, 30, true)).toBe("12:30 am");
    expect(fmtTick12(7, 30)).toBe("7 am");
    expect(fmtTick12(7, 30, true)).toBe("7:30 am");
    expect(fmtTick12(7, 5, true)).toBe("7:05 am");
  });
  it("formatWhen: exactly six days ahead is still given by its weekday alone", () => {
    const now = new Date(Date.UTC(2026, 10, 2, 12, 0));
    const at = (ms: number) => formatWhen(new Date(ms).toISOString(), "UTC", "en", now);
    const six = now.getTime() + 6 * 86_400_000;
    expect(at(six)).not.toMatch(/Nov/);
    expect(at(six + 60_000)).toMatch(/Nov/);
  });
});

describe("chart zoom mutants", () => {
  it("isFullDay: both ends count, with the tolerance included", () => {
    expect(isFullDay({ from: 0, to: 1440 }, 1440)).toBe(true);
    expect(isFullDay({ from: 1e-6, to: 1440 - 1e-6 }, 1440)).toBe(true);
    expect(isFullDay({ from: 100, to: 1440 }, 1440)).toBe(false);
    expect(isFullDay({ from: 0, to: 1000 }, 1440)).toBe(false);
    expect(normalise({ from: 0, to: 1440 }, 1440)).toBeNull();
  });
  it("zoomAround and zoomTimeline: a scale of zero or less leaves the length alone", () => {
    for (const scale of [0, -2]) {
      expect(zoomAround({ from: 100, to: 400 }, scale, 250, 0.5, 1440)).toEqual({ from: 100, to: 400 });
      expect(zoomTimeline({ from: 100, to: 400 }, scale, 250, 0.5, 5000)).toEqual({ from: 100, to: 400 });
    }
  });
  it("rangeToWindow: a short range is widened around its middle", () => {
    expect(rangeToWindow(100, 110, 1440)).toEqual({ from: 90, to: 120 });
  });
  it("tickStep: a count of labels equal to the maximum is accepted", () => {
    expect(tickStep(40, 8)).toBe(5);
  });
});

describe("wp-times-day mutants", () => {
  const row = (extra: Partial<TimesRow> = {}): TimesRow => ({
    key: "a|480", startMin: 480, color: "#0a0", label: "Heat", slotId: "a", carry: null, until: { day: "today", min: 540 },
    oneShot: false, sun: null, rule: null, random: false, now: false, done: false, ...extra,
  });
  const comp = (props: Partial<WpTimesDay>): any => Object.assign(new WpTimesDay() as any, { lang: "en", ...props });
  const ev = (c: any, action: (c: any) => void) => {
    const on = vi.fn();
    c.dispatchEvent = on;
    action(c);
    return on.mock.calls.map(([e]: any[]) => e as CustomEvent);
  };
  it("has the defaults of a ready, read-only English list", () => {
    const c = new WpTimesDay() as any;
    expect([c.rows, c.state, c.rest, c.editable, c.lang, c.deviceName]).toEqual([[], "ready", "", false, "en", ""]);
  });
  it("open-day and retry cross the shadow root and bubble", () => {
    const [open] = ev(comp({ editable: true }), (c) => c._open());
    expect([open.type, open.bubbles, open.composed]).toEqual(["open-day", true, true]);
    const [retry] = ev(comp({ state: "failed" }), (c) => c._retry());
    expect([retry.type, retry.bubbles, retry.composed]).toEqual(["retry", true, true]);
  });
  it("a retry puts the focus on the status region, and does not fail when there is none", () => {
    const focus = vi.fn();
    const c = comp({ state: "failed" });
    c.dispatchEvent = vi.fn();
    c.renderRoot = { querySelector: (sel: string) => (sel === ".status" ? { focus } : null) };
    c._retry();
    expect(focus).toHaveBeenCalledTimes(1);
    c.renderRoot = { querySelector: () => null };
    expect(() => c._retry()).not.toThrow();
  });
  it("a row of an editable list opens the day, and says which device it is for", () => {
    const c = comp({ rows: [row()], editable: true, deviceName: "Boiler" });
    const html = flat(c.render());
    expect(html).toContain("Edit the day, Boiler, Heat");
    expect(flat(comp({ rows: [row()], editable: true }).render())).toContain("Edit the day, Heat");
    const [open] = ev(c, (x) => find(x.render(), "click", 'class="row"').fn());
    expect(open.type).toBe("open-day");
  });
  it("says until when, 'until tomorrow' for the next day, nothing when the end is unknown", () => {
    expect(flat(comp({ rows: [row({ until: { day: "today", min: 540 } })] }).render())).toContain("until 9 am");
    const tom = flat(comp({ rows: [row({ until: { day: "tomorrow", min: 120 } })] }).render());
    expect(tom).toContain("until tomorrow 2 am");
    const unknown = flat(comp({ rows: [row({ until: { day: "tomorrow", min: null } })] }).render());
    expect(unknown).toMatch(/until tomorrow\s*</);
    expect(unknown).not.toContain("undefined");
    expect(unknown).not.toContain("Stryker");
    const one = flat(comp({ rows: [row({ until: null, oneShot: true })] }).render());
    expect(one).not.toContain("until");
    expect(one).not.toContain('class="more"');
  });
  it("the sun rule needs both the rule and the side; the icon follows the side", () => {
    const rule = { sun: "sunset" as const, offset: 10 };
    const up = flat(comp({ rows: [row({ sun: "up", rule })] }).render());
    expect(up).toContain("mdi:weather-sunset-up");
    expect(up).toContain("10 min after sunset");
    const down = flat(comp({ rows: [row({ sun: "down", rule })] }).render());
    expect(down).toContain("mdi:weather-sunset-down");
    expect(flat(comp({ rows: [row({ sun: "up", rule: null })] }).render())).not.toContain('class="sun"');
    expect(flat(comp({ rows: [row({ sun: null, rule })] }).render())).not.toContain('class="sun"');
  });
  it("the random mention only appears for a random start", () => {
    expect(flat(comp({ rows: [row()] }).render())).not.toContain("varies");
    expect(flat(comp({ rows: [row({ random: true })] }).render())).toContain("varies");
  });
  it("marks the current row and the done row, by class and aria-current", () => {
    const now = flat(comp({ rows: [row({ now: true })] }).render());
    expect(now).toContain("<li class=current");
    expect(now).toContain("aria-current=time");
    const done = flat(comp({ rows: [row({ done: true })] }).render());
    expect(done).toContain("<li class=done");
    expect(done).toContain("done");
    expect(done).not.toContain("aria-current=time");
    const plain = flat(comp({ rows: [row()] }).render());
    expect(plain).toMatch(/<li class= /);
    expect(plain).not.toContain("aria-current=time");
  });
  it("the list has its role and its name; the empty day has none", () => {
    const html = flat(comp({ rows: [row()] }).render());
    expect(html).toContain('role="list"');
    expect(html).toContain("Today’s times");
    expect(flat(comp({ rows: [] }).render())).not.toContain("<ul");
    expect(flat(comp({ rows: [row()], state: "loading" }).render())).not.toContain("<ul");
  });
  it("the status region is live and focusable only by script", () => {
    const html = flat(comp({ rows: [row()] }).render());
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('tabindex="-1"');
  });
  it("the edit, retry and add buttons each carry their icon and open or retry", () => {
    const edit = comp({ rows: [row()], editable: true });
    expect(flat(edit.render())).toContain("mdi:calendar-edit");
    expect(ev(edit, (x) => find(x.render(), "click", 'class="action"').fn())[0].type).toBe("open-day");
    const retry = comp({ state: "failed" });
    expect(flat(retry.render())).toContain("mdi:refresh");
    expect(ev(retry, (x) => find(x.render(), "click", 'class="action"').fn())[0].type).toBe("retry");
    const add = comp({ rows: [], editable: true });
    expect(flat(add.render())).toContain("mdi:plus");
    expect(ev(add, (x) => find(x.render(), "click", 'class="action"').fn())[0].type).toBe("open-day");
  });
});

describe("slot form mutants: time field and its 12 h hint", () => {
  const mk = (slot: any = {}) => {
    const el = new WpSlotForm() as any;
    const seen: any[] = [];
    el.dispatchEvent = (e: any) => { seen.push(e.detail); return true; };
    Object.assign(el, { hass: { language: "en", config: {}, states: {} }, data: { labels: [], programs: [] }, program: { id: "p", entities: [], profiles: [] },
      entityIds: [], dayOnly: null, group: { slot: { id: "s", label: "l", start: { time: "08:00" }, end: { time: "09:00" }, ...slot }, days: [0], ids: {} } });
    return { el, seen };
  };
  beforeEach(() => {
    (globalThis as any).CustomEvent ??= class { type: string; detail: unknown; constructor(t: string, i: any) { this.type = t; this.detail = i?.detail; } };
  });
  afterEach(() => setTimeFormat(null));
  const change = (el: any, which: string, value: string) => el._fromInput(which, value);

  it("the hint is given for H:MM and HH:MM only, in 12 h", () => {
    const { el } = mk();
    setTimeFormat({ locale: { time_format: "12" } });
    expect(el._hintText("start", "7:30")).toBe("7:30 am");
    expect(el._hintText("start", "07:30")).toBe("7:30 am");
    expect(el._hintText("start", "07:30:15")).toBeNull();
    expect(el._hintText("start", "x07:30")).toBeNull();
    expect(el._hintText("start", "")).toBeNull();
    expect(el._hintText("start", undefined)).toBeNull();
    setTimeFormat({ locale: { time_format: "language" } });
    expect(el._hintText("start", "07:30")).toBeNull();
  });
  it("what is typed wins over the stored value, and typing then leaving clears it", () => {
    const { el } = mk();
    setTimeFormat({ locale: { time_format: "12" } });
    el._type("start", { target: { value: "21:15" } });
    expect(el._hintText("start", "08:00")).toBe("9:15 pm");
    el._typedDone("start");
    expect(el._hintText("start", "08:00")).toBe("8 am");
  });
  it("a time field shows 24:00 as 00:00, with its hint, and wires input and change", () => {
    setTimeFormat({ locale: { time_format: "12" } });
    const { el } = mk({ end: { time: "24:00" } });
    const out = flat(el.render());
    expect(out).toContain("= midnight");
    expect(out).toContain("hint12-end");
    expect(out).toContain("hint12-start");
    expect(out).toContain("= 8 am");
    const typeHandler = handlers(el.render()).filter((h) => h.event === "input")[0];
    typeHandler.fn({ target: { value: "10:00" } });
    expect(el._typed.start).toBe("10:00");
    const changeHandler = handlers(el.render()).filter((h) => h.event === "change")[0];
    el._typed = { start: "10:00" };
    changeHandler.fn({ target: { value: "10:00" } });
    expect(el._typed.start).toBeUndefined();
  });
  it("no hint and no describedby outside 12 h or for a sun time", () => {
    const { el } = mk({ start: { sun: "sunset", offset: 0 } });
    const out = flat(el.render());
    expect(out).not.toContain("hint12-start");
  });
  it("a typed time is taken only as HH:MM; a bad text changes nothing", () => {
    const { el, seen } = mk();
    change(el, "start", "10:30:00");
    change(el, "start", "x10:30");
    change(el, "start", "10:3");
    expect(seen).toEqual([]);
    change(el, "start", "10:30");
    expect(seen[0].slot.start).toEqual({ time: "10:30", random_minutes: undefined });
  });
  it("midnight is 24:00 for an end and 00:00 for a start; the random delay is kept", () => {
    const a = mk({ end: { time: "09:00", random_minutes: 5 } });
    change(a.el, "end", "00:00");
    expect(a.seen[0].slot.end).toEqual({ time: "24:00", random_minutes: 5 });
    const b = mk({ start: { time: "08:00", random_minutes: 7 } });
    change(b.el, "start", "00:00");
    expect(b.seen[0].slot.start).toEqual({ time: "00:00", random_minutes: 7 });
    const c = mk();
    change(c.el, "end", "10:00");
    expect(c.seen[0].slot.end.time).toBe("10:00");
  });
  it("a sun limit is set only as HH:MM, and the delay only as a whole number from 0 to 240", () => {
    const { el, seen } = mk({ start: { sun: "sunset", offset: 0 } });
    el._limit("start", "earliest", "18:00:00");
    el._limit("start", "earliest", "x18:00");
    expect(seen).toEqual([]);
    el._limit("start", "earliest", "18:00");
    expect(seen[0].slot.start).toEqual({ sun: "sunset", offset: 0, earliest: "18:00" });
    el._random("start", 240);
    expect(seen[1].slot.start.random_minutes).toBe(240);
    el._random("start", 241);
    el._random("start", 1.5);
    el._random("start", -1);
    expect(seen).toHaveLength(2);
    el._random("end", 5);
    el._random("start", 0);
    expect(seen[2].slot.start.random_minutes).toBeUndefined();
  });
  it("the sun choice marks the chosen event as pressed", () => {
    const { el } = mk({ start: { sun: "sunset", offset: 0 } });
    el._advTouched = true; el._advOpen = true;
    const out = flat(el.render());
    expect(out).toMatch(/class="chip on"[^>]*><ha-icon icon=mdi:weather-sunset-down/);
    expect(out).not.toMatch(/class="chip on"[^>]*><ha-icon icon=mdi:weather-sunset-up/);
  });
});

describe("slot form mutants: sun wording, fold, delay input, label change", () => {
  const mk = (slot: any = {}, props: any = {}) => {
    const el = new WpSlotForm() as any;
    const seen: any[] = [];
    el.dispatchEvent = (e: any) => { seen.push(e.detail); return true; };
    Object.assign(el, { hass: { language: "en", config: {}, states: {} }, data: { labels: [], programs: [] }, program: { id: "p", entities: [], profiles: [] },
      entityIds: [], dayOnly: null, group: { slot: { id: "s", label: "l", start: { time: "08:00" }, end: { time: "09:00" }, ...slot }, days: [0], ids: {} }, ...props });
    return { el, seen };
  };
  beforeEach(() => {
    (globalThis as any).CustomEvent ??= class { type: string; detail: unknown; constructor(t: string, i: any) { this.type = t; this.detail = i?.detail; } };
  });
  it("an offset is written with its sign and in minutes, or hours and minutes from 60", () => {
    const text = (offset: number) => solarMeaningText("en", { sun: "sunset", offset });
    expect(text(-90)).toContain("sunset − 1 h 30");
    expect(text(45)).toContain("sunset + 45 min");
    expect(text(60)).toContain("sunset + 1 h");
    expect(text(60)).not.toContain("1 h 00");
    expect(text(59)).toContain("59 min");
    expect(text(120)).toContain("+ 2 h");
  });
  it("a random sun time says its offset sign too", () => {
    const { el } = mk({ start: { sun: "sunset", offset: -30, random_minutes: 10 } });
    expect(flat(el.render())).toContain("sunset − 30 min");
    const plus = mk({ start: { sun: "sunset", offset: 20, random_minutes: 10 } });
    expect(flat(plus.el.render())).toContain("sunset + 20 min");
  });
  it("the advanced fold opens for a slot that needs it, and closes again for another slot", () => {
    const { el } = mk({ id: "a", start: { sun: "sunset", offset: 0 } });
    el.willUpdate();
    expect(el._advOpen).toBe(true);
    el._advTouched = true; el._advOpen = false;
    el.willUpdate();
    expect(el._advOpen).toBe(false);
    el.group = { ...el.group, slot: { ...el.group.slot, id: "b", start: { time: "08:00" } } };
    el._advOpen = true; el._advTouched = true;
    el.willUpdate();
    expect([el._advOpen, el._advTouched, el._advSlot]).toEqual([false, false, "b"]);
    const plain = mk({ id: "c" });
    plain.el.willUpdate();
    expect(plain.el._advOpen).toBe(false);
    const delayed = mk({ id: "d", end: { time: "09:00", random_minutes: 5 } });
    delayed.el.willUpdate();
    expect(delayed.el._advOpen).toBe(true);
    const noGroup = new WpSlotForm() as any;
    expect(() => noGroup.willUpdate()).not.toThrow();
  });
  it("the delay input applies a valid value only", () => {
    const { el, seen } = mk({ start: { time: "08:00", random_minutes: 15 } });
    el._advTouched = true; el._advOpen = true;
    const h = handlers(el.render()).filter((x) => x.event === "change" && x.before.includes('type="number"'))[0];
    h.fn({ target: { validity: { valid: false }, value: "30" } });
    expect(seen).toEqual([]);
    h.fn({ target: { validity: { valid: true }, value: "30" } });
    expect(seen[0].slot.start.random_minutes).toBe(30);
  });
  it("a new label rewrites the device list only when there is a label change, a list and a device", () => {
    const entities = ["switch.a", "switch.b"];
    const base = { entities } as any;
    const a = mk(base, { device: "switch.a" });
    a.el._set({ start: { time: "07:00" } });
    expect(a.seen[0].slot.entities).toEqual(entities);
    const b = mk({}, { device: "switch.a" });
    b.el._set({ label: "x" });
    expect(b.seen[0].slot.entities).toBeUndefined();
    const c = mk(base, { device: "" });
    c.el._set({ label: "x" });
    expect(c.seen[0].slot.entities).toEqual(entities);
  });
});
