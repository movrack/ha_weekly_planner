import { describe, expect, it } from "vitest";
import { card, hass, program, slot, uniformProgram, wednesdayCard } from "./helpers/planner-card";

describe("spans of a day", () => {
  const D = (iso: string) => iso; // instants are written in UTC, the card runs in UTC
  const resolvedCard = (slots: any[], rows: any[], previous: any[] | undefined = []) => {
    const c = wednesdayCard([uniformProgram("p1", "A", ["cover.a"], Array.from({ length: 7 }, () => slots))]);
    c._deviceDays = () => ({ today: rows, previous });
    return c;
  };
  const run = (c: any) => c._computeSpans("cover.a", [c._data.programs[0]], 0);
  const row = (slot_id: string, start: string, end: string | null, extra: any = {}) => ({ slot_id, start: D(start), end: end && D(end), ignored: null, ...extra });
  it("the cache never mixes two devices, two days or two program lists", () => {
    const week = Array.from({ length: 7 }, (_, i) => [slot("d" + i, { time: `0${i + 1}:00` }, { time: `0${i + 1}:30` })]);
    const a = uniformProgram("pa", "A", ["cover.a"], week);
    const b = uniformProgram("pb", "B", ["cover.a", "cover.b"], Array.from({ length: 7 }, () => [slot("b", { time: "12:00" }, { time: "13:00" })]));
    const c = wednesdayCard([a, b]);
    const starts = (ent: string, ps: any[], o: number) => c._spans(ent, ps, o).map((s: any) => s.start);
    expect(starts("cover.a", [a], 0)).toEqual([180]); // Wednesday: day 2 -> 03:00
    expect(starts("cover.a", [a], 1)).toEqual([240]);
    expect(starts("cover.a", [b], 0)).toEqual([720]);
    expect(starts("cover.b", [b], 0)).toEqual([720]);
    expect(starts("cover.a", [a, b], 0).sort((x: number, y: number) => x - y)).toEqual([180, 720]);
    expect(starts("cover.a", [a], 0)).toEqual([180]);
    expect(c._spans("cover.a", [a], 0)).toBe(c._spans("cover.a", [a], 0)); // memoized
    c._data = { ...c._data };
    expect(starts("cover.a", [a], 1)).toEqual([240]);
  });
  it("spans of several programs: the lowest priority first (the last one is drawn over)", () => {
    const a = uniformProgram("pa", "A", ["cover.a"], Array.from({ length: 7 }, () => [slot("a", { time: "01:00" }, { time: "02:00" })]));
    const b = uniformProgram("pb", "B", ["cover.a"], Array.from({ length: 7 }, () => [slot("b", { time: "05:00" }, { time: "06:00" })]));
    const c = wednesdayCard([a, b]);
    expect(c._computeSpans("cover.a", [a, b], 0).map((s: any) => s.slotId)).toEqual(["b", "a"]);
    b.enabled = false;
    // a paused program is still drawn (hatched): same spans, flagged `paused`
    const spans = c._computeSpans("cover.a", [a, b], 0) as any[];
    expect(spans.map((s) => s.slotId)).toEqual(["b", "a"]);
    expect(spans.map((s) => Boolean(s.paused))).toEqual([true, false]);
  });
  it("resolved rows: the day limits are exact (start at the end excluded, end at the start excluded, marker at midnight kept)", () => {
    const slots = ["a", "b", "c", "d", "e", "f"].map((id) => slot(id, { time: "08:00" }, { time: "09:00" }));
    const c = resolvedCard(slots, [
      row("a", "2026-11-05T00:00:00Z", "2026-11-05T01:00:00Z"), // starts when the day ends
      row("b", "2026-11-03T23:00:00Z", "2026-11-04T00:00:00Z"), // ends when the day starts
      row("c", "2026-11-04T00:00:00Z", "2026-11-04T01:00:00Z"), // starts at midnight: not a spill
      row("d", "2026-11-03T22:00:00Z", "2026-11-04T01:00:00Z"), // spill
      row("e", "2026-11-04T23:00:00Z", "2026-11-05T00:00:00Z"), // ends when the day ends
      row("f", "2026-11-04T23:00:00Z", "2026-11-05T03:00:00Z"), // goes on after the day
    ]);
    const spans = run(c);
    expect(spans.map((s: any) => [s.slotId, s.start, s.end, s.spill])).toEqual([
      ["c", 0, 60, false], ["d", 0, 60, true], ["e", 1380, 1440, false], ["f", 1380, 1440, false]]);
    const marker = resolvedCard([slot("m", { time: "08:00" }, null), slot("n", { time: "08:00" }, null)], [
      row("m", "2026-11-04T00:00:00Z", null), row("n", "2026-11-03T23:59:00Z", null)]);
    expect(run(marker).map((s: any) => [s.slotId, s.start, s.end, s.marker])).toEqual([["m", 0, 10, true]]);
  });
  it("a one-shot near the end of the day is cut at 24:00; rows of a kind the device cannot take or of unknown slots are skipped", () => {
    const c = resolvedCard([slot("m", { time: "08:00" }, null), { ...slot("g"), label: "ghost" }], [
      row("m", "2026-11-04T23:55:00Z", null), row("g", "2026-11-04T10:00:00Z", "2026-11-04T11:00:00Z"), row("zz", "2026-11-04T10:00:00Z", null)]);
    expect(run(c).map((s: any) => [s.slotId, s.start, s.end])).toEqual([["m", 1435, 1440]]);
  });
  it("the same occurrence listed twice (today and the day before) is drawn once; a different start is another span", () => {
    const c = resolvedCard([slot("a")], [row("a", "2026-11-04T08:00:00Z", "2026-11-04T09:00:00Z"), row("a", "2026-11-04T08:00:00Z", "2026-11-04T09:00:00Z"),
      row("a", "2026-11-04T10:00:00Z", "2026-11-04T11:00:00Z")], [row("a", "2026-11-04T08:00:00Z", "2026-11-04T09:00:00Z")]);
    expect(run(c).map((s: any) => s.start)).toEqual([480, 600]);
    const two = resolvedCard([slot("a"), slot("b")], [row("a", "2026-11-04T08:00:00Z", "2026-11-04T09:00:00Z"), row("b", "2026-11-04T08:00:00Z", "2026-11-04T09:00:00Z")]);
    expect(run(two).map((s: any) => s.slotId)).toEqual(["a", "b"]);
  });
  it("sun sides, ignored, and the base times of the delay come from the row", () => {
    const sunStart = slot("s", { sun: "sunrise", random_minutes: 10 }, { time: "09:00" });
    const sunEnd = slot("e", { time: "08:00" }, { sun: "sunset", random_minutes: 10 });
    const fixed = slot("f");
    const c = resolvedCard([sunStart, sunEnd, fixed, slot("w", { time: "20:00" }, { time: "21:00" })], [
      row("s", "2026-11-04T06:30:00Z", "2026-11-04T09:00:00Z", { start_base: "2026-11-04T06:25:00Z", ignored: "holiday" }),
      row("e", "2026-11-04T08:00:00Z", "2026-11-04T17:05:00Z", { end_base: "2026-11-04T17:00:00Z" }),
      row("f", "2026-11-04T08:00:00Z", "2026-11-04T09:00:00Z"),
      row("w", "2026-11-04T20:00:00Z", "2026-11-05T00:00:00Z", { end_base: "2026-11-04T23:55:00Z" }),
    ]);
    const [s, e, f, w] = run(c);
    expect([s.startSun, s.endSun, s.startBase, s.ignored, s.sun]).toEqual(["up", null, 385, "holiday", true]);
    expect([e.startSun, e.endSun, e.endBase, e.ignored, e.sun]).toEqual([null, "down", 1020, null, true]);
    expect([f.startSun, f.endSun, f.sun, f.startBase, f.endBase, f.ignored]).toEqual([null, null, false, null, null, null]);
    expect([e.endSpec, e.startSpec, e.marker, e.slotId, e.labelId, e.color, e.label]).toEqual([{ sun: "sunset", random_minutes: 10 }, { time: "08:00" }, false, "e", "l", "#0f0", "Open"]);
    expect(w.endBase).toBeNull(); // the end is the end of the day: no base to name
    expect(s.startMs).toBe(Date.parse("2026-11-04T06:30:00Z"));
    expect(s.endMs).toBe(Date.parse("2026-11-04T09:00:00Z"));
    const spillRow = resolvedCard([sunStart], [row("s", "2026-11-03T23:00:00Z", "2026-11-04T01:00:00Z")]);
    expect(run(spillRow)[0].startSun).toBeNull();
  });
  it("without a preview: the part of yesterday that crosses midnight and today's fixed times; random delays and sun times are left out", () => {
    const days = Array.from({ length: 7 }, () => [
      slot("n", { time: "22:00" }, { time: "02:00" }), slot("r", { time: "22:00" }, { time: "03:00" }),
      slot("one", { time: "10:00" }, null), slot("eq", { time: "08:00" }, { time: "08:00" }),
      slot("rnd", { time: "11:00", random_minutes: 5 }, { time: "12:00" }), slot("rnd2", { time: "11:00" }, { time: "12:00", random_minutes: 5 }),
      slot("sunny", { sun: "sunrise" }, { time: "12:00" }), { ...slot("g"), label: "ghost" },
    ]);
    const c = wednesdayCard([uniformProgram("p1", "A", ["cover.a"], days)]);
    c._deviceDays = () => ({ today: undefined, previous: undefined });
    const spans = run(c);
    const spill = spans.filter((s: any) => s.spill);
    expect(spill.map((s: any) => [s.slotId, s.start, s.end, s.startSun])).toEqual([["n", 0, 120, null], ["r", 0, 180, null], ["eq", 0, 480, null]]);
    expect(spans.filter((s: any) => !s.spill).map((s: any) => [s.slotId, s.start, s.end])).toEqual([
      ["n", 1320, 1440], ["r", 1320, 1440], ["one", 600, 610], ["eq", 480, 1440]]);
    c._deviceDays = () => ({ today: undefined, previous: [] }); // a preview of the day before exists: no fallback spill
    expect(run(c).filter((s: any) => s.spill)).toEqual([]);
    c._deviceDays = () => ({ today: [], previous: [] }); // resolved today: no fixed fallback either
    expect(run(c)).toEqual([]);
  });
  it("a sun time with a random delay takes its base from the server's preview, not from its own estimate", () => {
    const sunSlot = { id: "sx", label: "l", start: { sun: "sunset", random_minutes: 20 } };
    const c = card([program("p1", "Volet", ["cover.a"])]);
    c.hass = { ...hass, states: { "sun.sun": { attributes: { next_setting: "2026-11-02T16:55:30Z" } } } }; // an estimate of 16:55
    c._data.programs[0].profiles[0].days[0] = [sunSlot];
    c._deviceDays = () => ({ today: [{ slot_id: "sx", start: "2026-11-02T17:02:00Z", end: null, ignored: null, sun: true, start_base: "2026-11-02T16:54:00Z" }], previous: [] });
    const spans = c._computeSpans("cover.a", [c._data.programs[0]], 0);
    expect(spans[0].startBase).toBe(16 * 60 + 54);
    c._deviceDays = () => ({ today: [{ slot_id: "sx", start: "2026-11-02T17:02:00Z", end: null, ignored: null, sun: true }], previous: [] });
    expect(c._computeSpans("cover.a", [c._data.programs[0]], 0)[0].startBase).toBe(16 * 60 + 55); // older server: the estimate
  });
});
