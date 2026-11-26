import { describe, expect, it } from "vitest";
import { sunRuleText, timesRows } from "../times-list";
import type { BarSpan } from "../components/day-bar";

const ctx = { tz: "UTC", nowMin: null };
const span = (start: number, end: number, extra: Partial<BarSpan> = {}): BarSpan => ({
  start, end, color: "#f00", label: `L${start}`, slotId: `s${start}`, ...extra,
});
const iso = (h: number, m = 0, day = 10) => Date.UTC(2026, 10, day, h, m);
const ids = (rows: { slotId?: string }[]) => rows.map((r) => r.slotId);

describe("daily times rows", () => {
  it("sorts by start in minutes, whatever the input order", () => {
    expect(ids(timesRows([span(600, 700), span(60, 120), span(300, 360)], ctx))).toEqual(["s60", "s300", "s600"]);
  });

  it("keeps the two 02:30 of a 25-hour day apart, in real order", () => {
    const a = span(150, 160, { slotId: "a", startMs: iso(1, 30), endMs: iso(1, 40) });
    const b = span(150, 170, { slotId: "b", startMs: iso(2, 30), endMs: iso(2, 50) });
    const rows = timesRows([b, a], ctx);
    expect(ids(rows)).toEqual(["a", "b"]);
    expect(new Set(rows.map((r) => r.key)).size).toBe(2);
    expect(ids(timesRows([a, b], ctx))).toEqual(["a", "b"]);
  });

  it("on a 23-hour day lists only what is resolved: the skipped time is absent", () => {
    const rows = timesRows([span(60, 120, { slotId: "a" }), span(150, 200, { slotId: "skipped", ignored: "nonexistent_time" }), span(300, 360, { slotId: "c" })], ctx);
    expect(ids(rows)).toEqual(["a", "c"]);
  });

  it("puts a span carried over from yesterday first, with yesterday's start", () => {
    const rows = timesRows([span(0, 360, { slotId: "late", spill: true, startMs: iso(22, 0, 9), endMs: iso(6) }), span(0, 90, { slotId: "mid" })], ctx);
    expect(ids(rows)).toEqual(["late", "mid"]);
    expect(rows[0].carry).toBe("from_yesterday");
    expect(rows[0].startMin).toBe(22 * 60);
    expect(rows[0].until).toEqual({ day: "today", min: 360 });
    expect(rows[1].carry).toBeNull();
  });

  it("reads the start of a carried-over fixed time without a preview (fallback)", () => {
    const rows = timesRows([span(0, 360, { spill: true, startSpec: { time: "22:30" } })], ctx);
    expect(rows[0].startMin).toBe(22 * 60 + 30);
  });

  it("says 'until tomorrow' with the real end for a span that crosses midnight", () => {
    const rows = timesRows([span(1320, 1440, { startMs: iso(22), endMs: iso(6, 0, 11) })], ctx);
    expect(rows[0].until).toEqual({ day: "tomorrow", min: 360 });
  });

  it("an end exactly at midnight is today's 24 h, not tomorrow", () => {
    const rows = timesRows([span(1320, 1440, { startMs: iso(22), endMs: iso(0, 0, 11) })], ctx);
    expect(rows[0].until).toEqual({ day: "today", min: 1440 });
  });

  it("a one-shot has no end and is never 'now'", () => {
    const rows = timesRows([span(600, 610, { marker: true, startMs: iso(10), endMs: null })], { tz: "UTC", nowMin: 605, nowMs: iso(10, 5) });
    expect(rows[0]).toMatchObject({ oneShot: true, until: null, now: false });
  });

  it("leaves out skipped times", () => {
    expect(timesRows([span(60, 120, { ignored: "overlap" })], ctx)).toEqual([]);
  });

  it("gives the resolved time and the rule of a sun time, never a range", () => {
    const rows = timesRows([span(405, 480, { startSun: "up", startSpec: { sun: "sunrise", offset: -15 }, sun: true })], ctx);
    expect(rows[0]).toMatchObject({ startMin: 405, sun: "up", rule: { sun: "sunrise", offset: -15 }, random: false });
    expect(sunRuleText("en", rows[0].rule!)).toBe("15 min before sunrise");
    expect(sunRuleText("en", { sun: "sunset", offset: 30 })).toBe("30 min after sunset");
    expect(sunRuleText("fr", { sun: "sunset", offset: -30 })).toBe("30 min avant le coucher du soleil");
    expect(sunRuleText("fr", { sun: "sunrise", offset: 15 })).toBe("15 min après le lever du soleil");
    expect(sunRuleText("fr", { sun: "sunset" })).toBe("au coucher du soleil");
    expect(sunRuleText("en", { sun: "sunset" })).toBe("at sunset");
    expect(sunRuleText("en", { time: "07:00" })).toBe("");
  });

  it("flags a random start from startSpec.random_minutes only", () => {
    const rows = timesRows([span(420, 480, { startSpec: { time: "07:00", random_minutes: 10 } }), span(600, 660, { startSpec: { time: "10:00" } })], ctx);
    expect(rows.map((r) => r.random)).toEqual([true, false]);
    expect(rows[0].rule).toBeNull();
  });

  it("removes a duplicate (same slot, same start)", () => {
    expect(timesRows([span(60, 120, { slotId: "x" }), span(60, 120, { slotId: "x" })], ctx)).toHaveLength(1);
  });

  it("marks one row 'now', only today, and only the one that runs", () => {
    const spans = [span(60, 120), span(120, 240), span(300, 360)];
    const today = timesRows(spans, { tz: "UTC", nowMin: 130 });
    expect(today.map((r) => r.now)).toEqual([false, true, false]);
    expect(timesRows(spans, { tz: "UTC", nowMin: 250 }).some((r) => r.now)).toBe(false);
    expect(timesRows(spans, { tz: "UTC", nowMin: null }).some((r) => r.now)).toBe(false);
  });

  it("on a 25-hour day marks the right 02:30 by instant", () => {
    const a = span(150, 200, { slotId: "a", startMs: iso(1, 30), endMs: iso(1, 55) });
    const b = span(150, 200, { slotId: "b", startMs: iso(2, 30), endMs: iso(2, 55) });
    const rows = timesRows([a, b], { tz: "UTC", nowMin: 160, nowMs: iso(2, 40) });
    expect(rows.map((r) => r.now)).toEqual([false, true]);
  });

  it("only one row is 'now' even if two spans contain the minute (the winner)", () => {
    const rows = timesRows([span(60, 300, { slotId: "low" }), span(120, 200, { slotId: "high" })], { tz: "UTC", nowMin: 150 });
    expect(rows.filter((r) => r.now).map((r) => r.slotId)).toEqual(["high"]);
  });

  it("an empty day gives no rows", () => {
    expect(timesRows([], ctx)).toEqual([]);
  });

  it("does not change its input", () => {
    const spans = [span(600, 700), span(60, 120, { ignored: "x" }), span(300, 360)];
    const copy = JSON.parse(JSON.stringify(spans));
    timesRows(spans, { tz: "UTC", nowMin: 320 });
    expect(spans).toEqual(copy);
  });

  it("hides a lower-priority span entirely under a winner, keeps a partly covered one", () => {
    const low = span(60, 120, { slotId: "low" });
    const partly = span(100, 300, { slotId: "partly" });
    const win = span(50, 150, { slotId: "win" }); // painted later: wins
    expect(ids(timesRows([low, partly, win], ctx))).toEqual(["win", "partly"]);
    // the winner painted first does not hide what is painted over it
    expect(ids(timesRows([win, low], ctx))).toEqual(["win", "low"]);
  });

  it("uses real instants to tell a covered span (same minutes, another day part)", () => {
    const low = span(60, 120, { slotId: "low", startMs: iso(1), endMs: iso(2) });
    const other = span(60, 120, { slotId: "win", startMs: iso(1, 30), endMs: iso(2, 30) });
    expect(ids(timesRows([low, other], { tz: "UTC", nowMin: null }))).toEqual(["low", "win"]);
  });

  it("a one-shot under a winner is hidden too", () => {
    const shot = span(100, 110, { slotId: "shot", marker: true });
    expect(ids(timesRows([shot, span(60, 200, { slotId: "win" })], ctx))).toEqual(["win"]);
  });
});

describe("daily times: neighbours of the same setting", () => {
  const sp = (start: number, end: number, labelId: string, extra: Partial<BarSpan> = {}) => span(start, end, { labelId, label: "Turn on", ...extra });

  it("merges 17:00-22:30 then 22:30-24:00 of the same setting into one row", () => {
    const rows = timesRows([sp(1020, 1350, "on", { startMs: iso(17), endMs: iso(22, 30) }), sp(1350, 1440, "on", { startMs: iso(22, 30), endMs: iso(24) })], ctx);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ startMin: 1020, until: { day: "today", min: 1440 } });
  });

  it("merges a chain of three and keeps 'now' from any part", () => {
    const rows = timesRows([sp(60, 120, "on"), sp(120, 180, "on"), sp(180, 240, "on")], { tz: "UTC", nowMin: 150 });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ startMin: 60, until: { day: "today", min: 240 }, now: true });
  });

  it("does not merge another setting, even with the same name", () => {
    expect(timesRows([sp(60, 120, "a"), sp(120, 180, "b")], ctx)).toHaveLength(2);
  });

  it("never merges a start / stop row with its neighbour of the same start setting (issue #93)", () => {
    expect(timesRows([sp(60, 120, "a", { endLabelId: "b" }), sp(120, 180, "a")], ctx)).toHaveLength(2);
    expect(timesRows([sp(60, 120, "a"), sp(120, 180, "a", { endLabelId: "b" })], ctx)).toHaveLength(2);
  });

  it("does not merge when there is a gap, or when the id is unknown", () => {
    expect(timesRows([sp(60, 120, "a"), sp(121, 180, "a")], ctx)).toHaveLength(2);
    expect(timesRows([span(60, 120), span(120, 180)], ctx)).toHaveLength(2);
  });

  it("does not merge a one-shot, and uses real instants when known", () => {
    expect(timesRows([sp(60, 70, "a", { marker: true }), sp(70, 120, "a")], ctx)).toHaveLength(2);
    // a carried-over row keeps "since yesterday" when the same setting goes on
    const carried = timesRows([sp(0, 120, "a", { spill: true, startMs: iso(0, 0, 10) - 3_600_000, endMs: iso(2) }), sp(120, 180, "a", { startMs: iso(2), endMs: iso(3) })], ctx);
    expect(carried).toHaveLength(1);
    expect(carried[0]).toMatchObject({ carry: "from_yesterday", until: { day: "today", min: 180 } });
    // same minutes but the instants differ (25-hour day): not one stretch
    expect(timesRows([sp(150, 200, "a", { startMs: iso(1, 30), endMs: iso(3, 20) }), sp(200, 260, "a", { startMs: iso(4), endMs: iso(5) })], ctx)).toHaveLength(2);
  });
});

describe("daily times: done rows", () => {
  const now = (h: number, m = 0) => ({ tz: "UTC", nowMin: h * 60 + m, nowMs: iso(h, m) });
  it("marks past rows of today as done, not the running or the coming one", () => {
    const rows = timesRows([span(60, 120, { startMs: iso(1), endMs: iso(2) }), span(480, 600, { startMs: iso(8), endMs: iso(10) }),
      span(900, 960, { startMs: iso(15), endMs: iso(16) })], now(9));
    expect(rows.map((r) => r.done)).toEqual([true, false, false]);
  });
  it("marks a carried-over row that ended this morning, not one that runs until tomorrow", () => {
    const rows = timesRows([span(0, 60, { spill: true, startMs: iso(22, 0, 9), endMs: iso(1) }),
      span(1320, 1440, { startMs: iso(22), endMs: iso(1, 0, 11) })], now(23, 48));
    expect(rows.map((r) => [r.carry, r.done])).toEqual([["from_yesterday", true], [null, false]]);
  });
  it("is never done on another day (no 'now' instant)", () => {
    expect(timesRows([span(60, 120)], ctx).every((r) => !r.done)).toBe(true);
  });
  it("falls back to minutes without instants, and an end exactly now is done", () => {
    expect(timesRows([span(60, 120)], { tz: "UTC", nowMin: 120 })[0].done).toBe(true);
    expect(timesRows([span(60, 120)], { tz: "UTC", nowMin: 119 })[0].done).toBe(false);
  });
  it("a one-shot has no end, so is never done", () => {
    expect(timesRows([span(60, 60, { marker: true })], now(9))[0].done).toBe(false);
  });
});

describe("daily times: which spans are hidden by a winner", () => {
  it("a one-shot marker never hides a span, whatever its minutes", () => {
    const rows = timesRows([span(100, 200, { slotId: "a" }), span(0, 1440, { slotId: "m", marker: true })], ctx);
    expect(ids(rows)).toEqual(["m", "a"]);
  });
  it("the same interval twice: the later one wins, by minutes and by instants", () => {
    expect(ids(timesRows([span(100, 200, { slotId: "a" }), span(100, 200, { slotId: "b" })], ctx))).toEqual(["b"]);
    const a = span(100, 200, { slotId: "a", startMs: iso(1, 40), endMs: iso(3, 20) });
    const b = span(100, 200, { slotId: "b", startMs: iso(1, 40), endMs: iso(3, 20) });
    expect(ids(timesRows([a, b], ctx))).toEqual(["b"]);
  });
  it("uses the instants only when both spans have both a start and an end instant", () => {
    const bothMs = { startMs: iso(5), endMs: iso(6) };
    // the minutes say the winner covers; the instants of the one that has them say it does not
    expect(ids(timesRows([span(100, 200, { slotId: "a", ...bothMs }), span(0, 1440, { slotId: "w", endMs: iso(2) })], ctx))).toEqual(["w"]);
    expect(ids(timesRows([span(100, 200, { slotId: "a", endMs: iso(1) }), span(0, 1440, { slotId: "w", startMs: iso(7), endMs: iso(8) })], ctx))).toEqual(["w"]);
    expect(ids(timesRows([span(100, 200, { slotId: "a", ...bothMs }), span(0, 1440, { slotId: "w", startMs: iso(7) })], ctx))).toEqual(["w"]);
  });
  it("by instants: a winner that starts one millisecond later hides nothing", () => {
    const a = span(100, 200, { slotId: "a", startMs: iso(1, 40), endMs: iso(3, 20) });
    const b = span(100, 200, { slotId: "b", startMs: iso(1, 40) + 1, endMs: iso(3, 20) });
    expect(ids(timesRows([a, b], ctx))).toEqual(["a", "b"]);
    const c = span(100, 200, { slotId: "c", startMs: iso(1, 40), endMs: iso(3, 20) - 1 });
    expect(ids(timesRows([a, c], ctx))).toEqual(["a", "c"]);
  });
  it("by instants: a winner ending exactly at a one-shot hides it", () => {
    const m = span(100, 100, { slotId: "m", marker: true, startMs: iso(3, 20) });
    const w = span(60, 200, { slotId: "w", startMs: iso(1), endMs: iso(3, 20) });
    expect(ids(timesRows([m, w], ctx))).toEqual(["w"]);
  });
  it("falls back to the minutes when the winner has no end instant, or the loser has no start or end instant", () => {
    const wide = { start: 0, end: 1440 };
    const noEnd = span(0, 1440, { slotId: "w", startMs: iso(5), endMs: null });
    expect(ids(timesRows([span(100, 200, { slotId: "a", startMs: iso(1), endMs: iso(2) }), noEnd], ctx))).toEqual(["w"]);
    const later = span(wide.start, wide.end, { slotId: "w", startMs: iso(5), endMs: iso(6) });
    expect(ids(timesRows([span(100, 200, { slotId: "a", startMs: iso(1), endMs: null }), later], ctx))).toEqual(["w"]);
    expect(ids(timesRows([span(100, 200, { slotId: "a" }), span(0, 1440, { slotId: "w", startMs: iso(0), endMs: iso(23) })], ctx))).toEqual(["w"]);
  });
});

describe("daily times: keys", () => {
  it("is `slot|start`, with an empty slot id when there is ctx", () => {
    expect(timesRows([span(60, 120, { slotId: undefined })], ctx)[0].key).toBe("|60");
    expect(timesRows([span(60, 120, { slotId: "x", startMs: iso(1) })], ctx)[0].key).toBe(`x|${iso(1)}`);
  });
  it("two slots starting at the same minute are two rows; the same slot at two instants too", () => {
    expect(ids(timesRows([span(60, 200, { slotId: "a" }), span(60, 100, { slotId: "b" })], ctx)).sort()).toEqual(["a", "b"]);
    const x = span(150, 160, { slotId: "x", startMs: iso(1, 30), endMs: iso(1, 40) });
    const y = span(150, 160, { slotId: "x", startMs: iso(2, 30), endMs: iso(2, 40) });
    expect(timesRows([x, y], ctx)).toHaveLength(2);
  });
});

describe("daily times: the end of a span running past midnight", () => {
  it("reads the nominal end when there is no end instant", () => {
    const [r] = timesRows([span(1300, 1440, { endSpec: { time: "02:00" } })], ctx);
    expect(r.until).toEqual({ day: "tomorrow", min: 120 });
  });
});

describe("daily times: sun rule", () => {
  const sun = { sun: "sunset" as const, offset: -30 };
  it("is given for a sun start of today only", () => {
    expect(timesRows([span(60, 120, { startSun: "down", startSpec: sun })], ctx)[0].rule).toEqual(sun);
  });
  it("is null for a fixed start, a start without sun icon, no spec, or a carried-over row", () => {
    expect(timesRows([span(60, 120, { startSun: "down", startSpec: { time: "01:00" } })], ctx)[0].rule).toBeNull();
    expect(timesRows([span(60, 120, { startSun: null, startSpec: sun })], ctx)[0].rule).toBeNull();
    expect(timesRows([span(60, 120, { startSun: "down", startSpec: null })], ctx)[0].rule).toBeNull();
    expect(timesRows([span(0, 120, { spill: true, startSun: "down", startSpec: sun, startMs: iso(22, 0, 9) })], ctx)[0].rule).toBeNull();
  });
  it("an unknown sun event reads as sunset", () => {
    expect(sunRuleText("en", { sun: "bogus" } as any)).toBe(sunRuleText("en", { sun: "sunset" }));
  });
});

describe("daily times: order", () => {
  it("by minutes when an instant is missing on either side", () => {
    const a = span(60, 70, { slotId: "a", startMs: iso(23) });
    const b = span(300, 310, { slotId: "b" });
    expect(ids(timesRows([b, a], ctx))).toEqual(["a", "b"]);
    expect(ids(timesRows([a, b], ctx))).toEqual(["a", "b"]);
    const c = span(60, 70, { slotId: "c" });
    const d = span(300, 310, { slotId: "d", startMs: iso(1) });
    expect(ids(timesRows([d, c], ctx))).toEqual(["c", "d"]);
  });
  it("by minutes when two instants are equal", () => {
    const a = span(100, 110, { slotId: "a", startMs: iso(5) });
    const b = span(50, 60, { slotId: "b", startMs: iso(5) });
    expect(ids(timesRows([a, b], ctx))).toEqual(["b", "a"]);
  });
});

describe("daily times: the current row, exact edges", () => {
  const at = (nowMin: number | null, nowMs?: number | null) => ({ tz: "UTC", nowMin, nowMs });
  it("ctx without a minute now, even for a span starting at midnight", () => {
    expect(timesRows([span(0, 100)], ctx)[0].now).toBe(false);
  });
  it("by instants: from the start (included) to the end (excluded), whatever the minutes say", () => {
    const s = span(150, 160, { startMs: iso(2, 30), endMs: iso(2, 40) });
    expect(timesRows([s], at(0, iso(2, 30)))[0].now).toBe(true);
    expect(timesRows([s], at(155, iso(2, 40)))[0].now).toBe(false);
    expect(timesRows([s], at(155, iso(1, 30)))[0].now).toBe(false);
    expect(timesRows([s], at(155, iso(3, 30)))[0].now).toBe(false);
  });
  it("by minutes when the instant now, or the span's start or end instant, is missing", () => {
    expect(timesRows([span(150, 160, { startMs: iso(5), endMs: iso(6) })], at(155))[0].now).toBe(true);
    expect(timesRows([span(150, 160, { startMs: iso(5), endMs: null })], at(155, iso(9)))[0].now).toBe(true);
    expect(timesRows([span(150, 160, { endMs: iso(6) })], at(155, iso(9)))[0].now).toBe(true);
  });
  it("by minutes: the start is included, the end excluded", () => {
    expect(timesRows([span(150, 160)], at(150))[0].now).toBe(true);
    expect(timesRows([span(150, 160)], at(160))[0].now).toBe(false);
  });
});

describe("daily times: done, exact edges", () => {
  const at = (nowMin: number | null, nowMs?: number | null) => ({ tz: "UTC", nowMin, nowMs });
  it("never without a minute now, even with an instant", () => {
    expect(timesRows([span(60, 120, { startMs: iso(1), endMs: iso(2) })], at(null, iso(5)))[0].done).toBe(false);
  });
  it("never for a one-shot, a span ending tomorrow, or an end not known", () => {
    expect(timesRows([span(60, 60, { marker: true })], at(1000))[0].done).toBe(false);
    expect(timesRows([span(1300, 1440, { endSpec: { time: "02:00" } })], at(1400))[0].done).toBe(false);
    expect(timesRows([span(1300, 1440, { endSpec: { sun: "sunrise" } })], at(1400))[0].done).toBe(false);
  });
  it("by instants: done when the end is not after now, whatever the minutes say", () => {
    const s = span(150, 160, { startMs: iso(2, 30), endMs: iso(2, 40) });
    expect(timesRows([s], at(100, iso(2, 40)))[0].done).toBe(true);
    expect(timesRows([s], at(500, iso(2, 35)))[0].done).toBe(false);
  });
  it("by minutes when there is no instant now, or no end instant", () => {
    expect(timesRows([span(60, 120, { startMs: iso(1), endMs: iso(2) })], at(500))[0].done).toBe(true);
    expect(timesRows([span(60, 120, { startMs: iso(1), endMs: null })], at(500, iso(9)))[0].done).toBe(true);
    expect(timesRows([span(60, 120)], at(100))[0].done).toBe(false);
    expect(timesRows([span(60, 120)], at(50))[0].done).toBe(false);
    expect(timesRows([span(60, 120, { startMs: iso(1), endMs: null })], at(50, iso(9)))[0].done).toBe(false);
  });
});

describe("daily times: neighbours, exact edges", () => {
  const lab = (start: number, end: number, extra: Partial<BarSpan> = {}) => span(start, end, { labelId: "x", ...extra });
  it("merge when the minutes touch, and 'now' is only kept when one part is now", () => {
    const rows = timesRows([lab(100, 200), lab(200, 300)], { tz: "UTC", nowMin: 50 });
    expect(rows).toHaveLength(1);
    expect(rows[0].now).toBe(false);
    expect(timesRows([lab(100, 200), lab(200, 300)], ctx)[0].now).toBe(false);
  });
  it("do not merge a one-shot, or a span ending tomorrow", () => {
    expect(timesRows([lab(100, 200), lab(200, 200, { marker: true })], ctx)).toHaveLength(2);
    expect(timesRows([lab(1300, 1440, { endSpec: { time: "02:00" } }), lab(120, 300)], ctx)).toHaveLength(2);
  });
  it("do not merge a span carried over from yesterday", () => {
    const a = lab(0, 1380, { spill: true, startSpec: { time: "01:00" } });
    const b = lab(1380, 1400, { spill: true, startSpec: { time: "23:00" } });
    expect(timesRows([a, b], ctx)).toHaveLength(2);
  });
  it("compare the instants when both are known, the minutes otherwise", () => {
    expect(timesRows([lab(100, 200, { endMs: iso(3, 20) }), lab(200, 300, { startMs: iso(3, 21) })], ctx)).toHaveLength(2);
    expect(timesRows([lab(100, 200, { endMs: iso(3, 20) }), lab(160, 300, { startMs: iso(3, 20) })], ctx)).toHaveLength(1);
    expect(timesRows([lab(100, 200, { endMs: iso(3, 20) }), lab(200, 300)], ctx)).toHaveLength(1);
    expect(timesRows([lab(100, 200), lab(200, 300, { startMs: iso(9) })], ctx)).toHaveLength(1);
    expect(timesRows([lab(100, 200, { endMs: null }), lab(200, 300, { startMs: iso(9) })], ctx)).toHaveLength(1);
  });
});
