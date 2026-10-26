import { describe, expect, it } from "vitest";
import {
  boundaries, copyConflicts, copyToDays, mergeAdjacent, moveBoundary, removeSlot, segments, setLabel, splitAt,
} from "../edits";
import type { DayCtx } from "../edits";
import { clockToMinutes } from "../time";
import type { Slot, TimeSpec } from "../types";

const SUN = { sunrise: 420, sunset: 1140, dawn: 360, dusk: 1200 };
const at = (s: TimeSpec): number => ("time" in s ? clockToMinutes(s.time) : SUN[s.sun] + (s.offset ?? 0));
let n = 0;
const ctx = (extra: Partial<DayCtx> = {}): DayCtx => ({ at, newId: () => `n${++n}`, defaultLabel: "rest", ...extra });
const slot = (id: string, start: string | TimeSpec, end: string | TimeSpec | null, label = "a"): Slot => ({
  id, start: typeof start === "string" ? { time: start } : start,
  end: end === null ? null : typeof end === "string" ? { time: end } : end, conditions: [], label,
});
const show = (slots: Slot[]) => slots.map((s) => `${"time" in s.start ? s.start.time : "sun"}-${s.end ? ("time" in s.end ? s.end.time : "sun") : "_"}:${s.label}`);

describe("segments and boundaries", () => {
  it("cuts the day into slots and gaps", () => {
    const segs = segments([slot("1", "08:00", "12:00")], ctx());
    expect(segs.map((s) => [s.kind, s.start, s.end])).toEqual([["gap", 0, 480], ["slot", 480, 720], ["gap", 720, 1440]]);
  });
  it("leaves room for a slot of the previous day that crosses midnight", () => {
    expect(segments([], ctx({ lead: 360 })).map((s) => [s.start, s.end])).toEqual([[360, 1440]]);
  });
  it("merges the edges at one minute and lists a one-shot alone", () => {
    const b = boundaries([slot("1", "08:00", "12:00"), slot("2", "12:00", "14:00"), slot("3", "17:00", null)], ctx());
    expect(b.map((x) => [x.m, x.refs.length, x.oneShot])).toEqual([[480, 1, false], [720, 2, false], [840, 1, false], [1020, 1, true]]);
  });
  it("has no end handle for a slot crossing midnight", () => {
    const b = boundaries([slot("1", "22:00", "06:00")], ctx());
    expect(b.map((x) => x.m)).toEqual([1320]);
  });
});

describe("moveBoundary", () => {
  const day = [slot("1", "08:00", "12:00"), slot("2", "12:00", "14:00", "b")];
  it("snaps to 15 minutes and moves a shared boundary of both slots", () => {
    const r = moveBoundary(day, { id: "1", edge: "end" }, 12 * 60 + 40, ctx())!;
    expect(r.m).toBe(765);
    expect(show(r.slots)).toEqual(["08:00-12:45:a", "12:45-14:00:b"]);
    expect(day[0].end).toEqual({ time: "12:00" }); // input untouched
  });
  it("clamps to the neighbours (never crosses)", () => {
    expect(moveBoundary(day, { id: "2", edge: "start" }, 5 * 60, ctx())!.m).toBe(480 + 15);
    expect(moveBoundary(day, { id: "2", edge: "start" }, 20 * 60, ctx())!.m).toBe(840 - 15);
  });
  it("clamps to a slot that is not part of the boundary", () => {
    const d = [slot("1", "08:00", "10:00"), slot("2", "12:00", "14:00", "b")];
    expect(moveBoundary(d, { id: "1", edge: "end" }, 13 * 60, ctx())!.m).toBe(720);
    expect(moveBoundary(d, { id: "2", edge: "start" }, 9 * 60, ctx())!.m).toBe(600);
  });
  it("reaches 00:00 and 24:00", () => {
    const d = [slot("1", "08:00", "12:00")];
    expect(show(moveBoundary(d, { id: "1", edge: "start" }, -50, ctx())!.slots)).toEqual(["00:00-12:00:a"]);
    expect(show(moveBoundary(d, { id: "1", edge: "end" }, 2000, ctx())!.slots)).toEqual(["08:00-24:00:a"]);
  });
  it("keeps 15 minutes in the moved slot", () => {
    const d = [slot("1", "08:00", "09:00")];
    expect(moveBoundary(d, { id: "1", edge: "end" }, 0, ctx())!.m).toBe(495);
  });
  it("a one-shot is a single handle that moves freely", () => {
    const d = [slot("1", "08:00", "12:00"), slot("2", "10:00", null, "b")];
    const r = moveBoundary(d, { id: "2", edge: "start" }, 20 * 60 + 7, ctx())!;
    expect(r.m).toBe(1200);
    expect(show(r.slots)).toEqual(["08:00-12:00:a", "20:00-_:b"]);
    expect(moveBoundary(d, { id: "2", edge: "start" }, 5000, ctx())!.m).toBe(1425);
    expect(moveBoundary(d, { id: "2", edge: "end" }, 100, ctx())).toBeNull();
  });
  it("a sun boundary becomes a fixed time once dragged", () => {
    const d = [slot("1", "08:00", { sun: "sunset" })];
    const r = moveBoundary(d, { id: "1", edge: "end" }, 1140 + 30, ctx())!;
    expect(show(r.slots)).toEqual(["08:00-19:30:a"]);
    const one = moveBoundary([slot("2", { sun: "sunset", offset: 10 }, null)], { id: "2", edge: "start" }, 1100, ctx())!;
    expect(one.slots[0].start).toEqual({ time: "18:15" });
  });
  it("refuses the end of a slot that crosses midnight, and an unknown handle", () => {
    expect(moveBoundary([slot("1", "22:00", "06:00")], { id: "1", edge: "end" }, 300, ctx())).toBeNull();
    expect(moveBoundary(day, { id: "zz", edge: "end" }, 300, ctx())).toBeNull();
  });
  it("does not enter the lead of the previous day", () => {
    const d = [slot("1", "08:00", "12:00")];
    expect(moveBoundary(d, { id: "1", edge: "start" }, 0, ctx({ lead: 360 }))!.m).toBe(360);
  });
});

describe("splitAt", () => {
  it("cuts a slot in the middle; the new boundary is returned", () => {
    const r = splitAt([slot("1", "08:00", "12:00")], { kind: "slot", id: "1" }, ctx())!;
    expect(show(r.slots)).toEqual(["08:00-10:00:a", "10:00-12:00:a"]);
    expect(r.slots.find((s) => s.id === r.handle.id)!.start).toEqual({ time: "10:00" });
  });
  it("rounds to 15 minutes and keeps the original end spec (sun)", () => {
    const r = splitAt([slot("1", "08:00", { sun: "sunset" })], { kind: "slot", id: "1" }, ctx())!;
    expect(show(r.slots)).toEqual(["08:00-13:30:a", "13:30-sun:a"]);
  });
  it("cuts a gap: a new slot with the default label on its second half", () => {
    const r = splitAt([slot("1", "08:00", "12:00")], { kind: "gap", start: 720, end: 1440 }, ctx())!;
    expect(show(r.slots)).toEqual(["08:00-12:00:a", "18:00-24:00:rest"]);
  });
  it("refuses what is too short, a one-shot, or a gap without a label", () => {
    expect(splitAt([slot("1", "08:00", "08:20")], { kind: "slot", id: "1" }, ctx())).toBeNull();
    expect(splitAt([slot("1", "08:00", null)], { kind: "slot", id: "1" }, ctx())).toBeNull();
    expect(splitAt([], { kind: "gap", start: 0, end: 1440 }, ctx({ defaultLabel: undefined }))).toBeNull();
  });
  it("splits a 30-minute slot at 15 and the whole empty day at noon", () => {
    expect(show(splitAt([slot("1", "08:00", "08:30")], { kind: "slot", id: "1" }, ctx())!.slots)).toEqual(["08:00-08:15:a", "08:15-08:30:a"]);
    expect(show(splitAt([], { kind: "gap", start: 0, end: 1440 }, ctx())!.slots)).toEqual(["12:00-24:00:rest"]);
  });
});

describe("setLabel and removeSlot", () => {
  it("changes the label of a slot and fills a gap", () => {
    const d = [slot("1", "08:00", "12:00")];
    expect(show(setLabel(d, { kind: "slot", id: "1" }, "b", ctx()))).toEqual(["08:00-12:00:b"]);
    expect(show(setLabel(d, { kind: "gap", start: 0, end: 480 }, "c", ctx()))).toEqual(["00:00-08:00:c", "08:00-12:00:a"]);
    expect(show(setLabel(d, { kind: "gap", start: 720, end: 1440 }, "c", ctx()))).toEqual(["08:00-12:00:a", "12:00-24:00:c"]);
  });
  it("removes a slot (its time falls back to the rest of the time)", () => {
    expect(removeSlot([slot("1", "08:00", "12:00"), slot("2", "13:00", null)], "1").map((s) => s.id)).toEqual(["2"]);
    expect(removeSlot([slot("1", "08:00", "12:00")], "zz")).toHaveLength(1);
  });
});

describe("mergeAdjacent", () => {
  it("merges neighbours with the same label only when end == start", () => {
    const out = mergeAdjacent([slot("1", "08:00", "10:00"), slot("2", "10:00", "12:00"), slot("3", "12:15", "14:00"), slot("4", "14:00", "15:00", "b")], ctx());
    expect(show(out)).toEqual(["08:00-12:00:a", "12:15-14:00:a", "14:00-15:00:b"]);
    expect(out[0].id).toBe("1");
  });
  it("merges a chain, ignores one-shots and a slot crossing midnight", () => {
    expect(show(mergeAdjacent([slot("1", "08:00", "09:00"), slot("2", "09:00", "10:00"), slot("3", "10:00", "11:00")], ctx()))).toEqual(["08:00-11:00:a"]);
    expect(show(mergeAdjacent([slot("1", "10:00", null), slot("2", "10:00", "11:00")], ctx()))).toHaveLength(2);
    expect(show(mergeAdjacent([slot("1", "22:00", "06:00"), slot("2", "00:00", "03:00")], ctx()))).toHaveLength(2);
  });
  it("merges up to 24:00 and from a sun end to the same sun start", () => {
    expect(show(mergeAdjacent([slot("1", "20:00", "22:00"), slot("2", "22:00", "24:00")], ctx()))).toEqual(["20:00-24:00:a"]);
    expect(show(mergeAdjacent([slot("1", "08:00", { sun: "sunset" }), slot("2", { sun: "sunset" }, "22:00")], ctx()))).toEqual(["08:00-22:00:a"]);
  });
  it("keeps neighbours that differ by their conditions", () => {
    const b = { ...slot("2", "10:00", "12:00"), conditions: [{ entity_id: "x.y", value: "on" }] };
    expect(mergeAdjacent([slot("1", "08:00", "10:00"), b], ctx())).toHaveLength(2);
  });
});

describe("copyToDays", () => {
  const wed = [slot("w", "08:45", "17:00", "t18"), slot("c", "12:00", "14:00", "t19")];
  const week = (extra: Record<number, Slot[]> = {}): Slot[][] => [0, 1, 2, 3, 4, 5, 6].map((d) => extra[d] ?? []);
  it("copies directly to free days (new ids)", () => {
    const days = week({ 2: [slot("c", "12:00", "14:00", "t19")] });
    expect(copyConflicts(days, { day: 2, id: "c" }, [3, 4], ctx())).toEqual([]);
    const out = copyToDays(days, { day: 2, id: "c" }, [3, 4], ctx());
    expect(show(out[3])).toEqual(["12:00-14:00:t19"]);
    expect(out[3][0].id).not.toBe("c");
    expect(out[0]).toBe(days[0]);
    expect(out[2]).toBe(days[2]);
  });
  it("replaces around the copied range: nothing outside it is lost (owner's example)", () => {
    const days = week({ 2: [slot("c", "12:00", "14:00", "t19")], 3: [slot("w", "08:45", "17:00", "t18")] });
    expect(copyConflicts(days, { day: 2, id: "c" }, [3, 4], ctx())).toEqual([3]);
    const out = copyToDays(days, { day: 2, id: "c" }, [3], ctx());
    expect(show(out[3])).toEqual(["08:45-12:00:t18", "12:00-14:00:t19", "14:00-17:00:t18"]);
  });
  it("trims one side, swallows a smaller slot, and keeps the days to skip", () => {
    const days = week({
      2: [slot("c", "12:00", "14:00", "t19")],
      3: [slot("a", "10:00", "13:00", "x"), slot("b", "13:30", "13:45", "y"), slot("d", "13:45", "16:00", "z")],
      4: [slot("e", "11:00", "15:00", "x")],
    });
    const out = copyToDays(days, { day: 2, id: "c" }, [3, 4], ctx(), [4]);
    expect(show(out[3])).toEqual(["10:00-12:00:x", "12:00-14:00:t19", "14:00-16:00:z"]);
    expect(out[4]).toBe(days[4]);
  });
  it("merges the copy with a neighbour of the same label", () => {
    const days = week({ 2: [slot("c", "12:00", "14:00", "t19")], 3: [slot("a", "10:00", "12:00", "t19")] });
    expect(show(copyToDays(days, { day: 2, id: "c" }, [3], ctx())[3])).toEqual(["10:00-14:00:t19"]);
  });
  it("handles 00:00 / 24:00 ranges and a one-shot (no duplicate)", () => {
    const days = week({ 2: [slot("c", "00:00", "24:00", "t19"), slot("o", "17:00", null, "off")], 3: [slot("a", "08:00", "12:00", "x"), slot("o2", "17:00", null, "off")] });
    expect(show(copyToDays(days, { day: 2, id: "c" }, [3], ctx())[3]).sort()).toEqual(["00:00-24:00:t19", "17:00-_:off"].sort());
    expect(copyConflicts(days, { day: 2, id: "o" }, [3], ctx())).toEqual([]);
    expect(show(copyToDays(days, { day: 2, id: "o" }, [3], ctx())[3])).toEqual(["08:00-12:00:x", "17:00-_:off"]);
    expect(show(copyToDays(days, { day: 2, id: "o" }, [4], ctx())[4])).toEqual(["17:00-_:off"]);
  });
  it("splits a long slot that crosses midnight and keeps its tail", () => {
    const days = week({ 2: [slot("c", "23:00", "23:30", "k")], 3: [slot("a", "22:00", "06:00", "x")] });
    const out = copyToDays(days, { day: 2, id: "c" }, [3], ctx());
    expect(show(out[3])).toEqual(["22:00-23:00:x", "23:00-23:30:k", "23:30-06:00:x"]);
  });
  it("copies a sun slot as a sun slot", () => {
    const days = week({ 2: [slot("c", { sun: "sunset" }, null, "close")] });
    expect(copyToDays(days, { day: 2, id: "c" }, [5], ctx())[5][0].start).toEqual({ sun: "sunset" });
  });
});
