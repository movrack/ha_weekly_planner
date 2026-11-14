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

