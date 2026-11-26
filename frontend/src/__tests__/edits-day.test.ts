// One day of a bar: segments and handles, moving and cutting boundaries, labels, merging, moving a slot.
// Equivalent mutants of edits.ts, ignored: `holds` with `id !== null` forced true (includes(null) is false anyway);
// `keptRest` called with a one-element array instead of `[]`; `edge <=`/`lo >= hi` when lo == hi (the boundary is
// already there); `ref.edge === "end" && own.wrap` (a wrap slot has no end boundary: null anyway); `else if (h)` for a
// wrap end (it only meets m at 24:00, where hi is already 24:00); the probe id in splitBusyDays; `o.end === null` in
// moveSlotBy (a one-shot never passes the next test); `hi - lo < span` in moveSlotBy (an own slot always fits its
// neighbours); the `o.start >= end` branch with overlapping slots.
import { describe, expect, it } from "vitest";
import {
  boundaries, eff, handleMinute, mergeAdjacent, middle, moveBoundary, moveSlotBy, moveToDay, removeSlot, segments, setLabel,
  splitAt,
} from "../edits";
import { clockToMinutes } from "../time";
import type { Slot, TimeSpec } from "../types";
import { at, brief, ctx, days7, sl, show } from "./helpers/edits";

const mm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const shift = (s: TimeSpec, d: number): TimeSpec => ("time" in s ? { time: mm(clockToMinutes(s.time) + d), random_minutes: 1 } : s);
const span = (slots: ReturnType<typeof segments>) => slots.map((s) => `${s.kind}:${s.start}-${s.end}`);

describe("effective times of a slot", () => {
  it.each([
    ["a one-shot has no end and does not wrap", sl("a", "08:00", null), { start: 480, end: null, wrap: false }],
    ["an end after the start does not wrap", sl("a", "08:00", "09:00"), { start: 480, end: 540, wrap: false }],
    ["an end before the start goes on to the end of the day", sl("a", "22:00", "02:00"), { start: 1320, end: 1440, wrap: true }],
    ["an end equal to the start goes on to the end of the day", sl("a", "10:00", "10:00"), { start: 600, end: 1440, wrap: true }],
  ])("%s", (_name, slot, expected) => {
    expect(eff(slot, at)).toEqual(expected);
  });
});

describe("segments of a day", () => {
  it("cuts the day into gaps and slots in time order, with no empty gap between neighbours", () => {
    const slots = [sl("b", "12:00", "24:00"), sl("a", "08:00", "12:00")];
    expect(span(segments(slots, ctx()))).toEqual(["gap:0-480", "slot:480-720", "slot:720-1440"]);
  });
  it("has no gap when a slot starts at the beginning and ends at the end of the day", () => {
    expect(segments([sl("a", "00:00", "24:00")], ctx()).map((s) => s.kind)).toEqual(["slot"]);
  });
  it("starts after the part taken by the day before, which crosses midnight", () => {
    expect(span(segments([sl("a", "03:00", "04:00")], ctx({ lead: 120 })))).toEqual(["gap:120-180", "slot:180-240", "gap:240-1440"]);
    expect(segments([], ctx({ lead: 120 }))).toEqual([{ kind: "gap", start: 120, end: 1440 }]);
  });
  it("a one-shot is not a segment, and a slot inside another does not pull the cursor back", () => {
    const out = segments([sl("o", "09:00", null), sl("a", "08:00", "12:00"), sl("b", "09:00", "10:00")], ctx());
    expect(span(out)).toEqual(["gap:0-480", "slot:480-720", "slot:540-600", "gap:720-1440"]);
  });
});

describe("boundaries of a day", () => {
  it("sorted by minute, a one-shot is a single handle", () => {
    const out = boundaries([sl("b", "12:00", "13:00"), sl("o", "07:00", null), sl("a", "08:00", "09:00")], ctx());
    expect(out).toEqual([
      { m: 420, refs: [{ id: "o", edge: "start" }], oneShot: true },
      { m: 480, refs: [{ id: "a", edge: "start" }], oneShot: false },
      { m: 540, refs: [{ id: "a", edge: "end" }], oneShot: false },
      { m: 720, refs: [{ id: "b", edge: "start" }], oneShot: false },
      { m: 780, refs: [{ id: "b", edge: "end" }], oneShot: false },
    ]);
  });

  it("an end and a start at the same minute are one boundary", () => {
    const out = boundaries([sl("a", "08:00", "09:00"), sl("b", "09:00", "10:00")], ctx());
    expect(out.map((b) => [b.m, b.refs.length])).toEqual([[480, 1], [540, 2], [600, 1]]);
  });

  it("has no end handle for a slot crossing midnight", () => {
    expect(boundaries([sl("1", "22:00", "06:00")], ctx()).map((x) => x.m)).toEqual([1320]);
  });

  it("a slot sharing a device with two separate boundaries of that minute links them into one", () => {
    const slots = [
      sl("a", "08:00", "10:00", { entities: ["d1"] }), sl("b", "08:00", "10:00", { entities: ["d2"] }),
      sl("c", "10:00", "11:00", { entities: ["d1", "d2"] }),
    ];
    const out = boundaries(slots, ctx());
    const at10 = out.filter((b) => b.m === 600);
    expect(at10).toHaveLength(1);
    expect(at10[0].refs.map((r) => `${r.id}:${r.edge}`).sort()).toEqual(["a:end", "b:end", "c:start"]);
    expect(out).toHaveLength(4);
  });

  it("a slot after the link joins the one merged boundary, once", () => {
    const slots = [
      sl("a", "08:00", "10:00", { entities: ["d1"] }), sl("b", "08:00", "10:00", { entities: ["d2"] }),
      sl("c", "10:00", "11:00", { entities: ["d1", "d2"] }), sl("d", "10:00", "11:00", { entities: ["d2"] }),
    ];
    const at10 = boundaries(slots, ctx()).filter((b) => b.m === 600);
    expect(at10).toHaveLength(1);
    expect(at10[0].refs.map((r) => `${r.id}:${r.edge}`).sort()).toEqual(["a:end", "b:end", "c:start", "d:start"]);
  });

  it("joins a slot to a boundary when it shares a device with any slot of it", () => {
    const slots = [sl("a", "08:00", "10:00", { entities: ["d1"] }), sl("b", "08:00", "10:00", { entities: ["d1", "d2"] }), sl("c", "10:00", "11:00", { entities: ["d2"] })];
    const at10 = boundaries(slots, ctx()).filter((b) => b.m === 600);
    expect(at10).toHaveLength(1);
    expect(at10[0].refs).toHaveLength(3);
  });

  it("two devices that only meet at a minute keep separate boundaries", () => {
    const slots = [sl("a", "08:00", "10:00", { entities: ["d1"] }), sl("c", "10:00", "11:00", { entities: ["d2"] })];
    expect(boundaries(slots, ctx()).filter((b) => b.m === 600)).toHaveLength(2);
  });
});

describe("minute of a handle", () => {
  const slots = [sl("a", "08:00", "09:00"), sl("b", "10:00", "11:00"), sl("o", "12:00", null)];
  it("start, end, of the right slot", () => {
    expect(handleMinute(slots, { id: "b", edge: "start" }, ctx())).toBe(600);
    expect(handleMinute(slots, { id: "b", edge: "end" }, ctx())).toBe(660);
    expect(handleMinute(slots, { id: "a", edge: "end" }, ctx())).toBe(540);
  });
  it("null for a missing slot or the end of a one-shot", () => {
    expect(handleMinute(slots, { id: "zz", edge: "start" }, ctx())).toBeNull();
    expect(handleMinute(slots, { id: "o", edge: "end" }, ctx())).toBeNull();
  });
});

describe("moving a boundary", () => {
  it("snaps to 15 minutes and moves a shared boundary of both slots, leaving the input alone", () => {
    const day = [sl("1", "08:00", "12:00"), sl("2", "12:00", "14:00", { label: "b" })];
    const r = moveBoundary(day, { id: "1", edge: "end" }, 12 * 60 + 40, ctx())!;
    expect(r.m).toBe(765);
    expect(show(r.slots)).toEqual(["08:00-12:45:t18", "12:45-14:00:b"]);
    expect(day[0].end).toEqual({ time: "12:00" });
  });

  it("moves a shared boundary for every slot of it, writing fixed times", () => {
    const slots = [sl("a", "08:00", "09:00"), sl("b", "09:00", "10:00")];
    const out = moveBoundary(slots, { id: "a", edge: "end" }, 570, ctx())!;
    expect(brief(out.slots)).toEqual(["a:08:00-09:30:t18", "b:09:30-10:00:t18"]);
  });

  it("reaches 00:00 and 24:00", () => {
    const d = [sl("1", "08:00", "12:00")];
    expect(show(moveBoundary(d, { id: "1", edge: "start" }, -50, ctx())!.slots)).toEqual(["00:00-12:00:t18"]);
    expect(show(moveBoundary(d, { id: "1", edge: "end" }, 2000, ctx())!.slots)).toEqual(["08:00-24:00:t18"]);
  });

  it("is stopped by the next and the previous slot, which it may touch", () => {
    const slots = [sl("a", "08:00", "09:00"), sl("b", "10:00", "11:00")];
    expect(moveBoundary(slots, { id: "a", edge: "end" }, 700, ctx())!.m).toBe(600);
    expect(moveBoundary(slots, { id: "b", edge: "start" }, 0, ctx())!.m).toBe(540);
    expect(moveBoundary(slots, { id: "a", edge: "end" }, 0, ctx())!.m).toBe(495); // 15 min after its own start
    expect(moveBoundary(slots, { id: "b", edge: "start" }, 5000, ctx())!.m).toBe(645); // 15 min before its own end
  });

  it("a boundary shared by two slots stays 15 minutes inside both neighbours", () => {
    const day = [sl("1", "08:00", "12:00"), sl("2", "12:00", "14:00", { label: "b" })];
    expect(moveBoundary(day, { id: "2", edge: "start" }, 5 * 60, ctx())!.m).toBe(480 + 15);
    expect(moveBoundary(day, { id: "2", edge: "start" }, 20 * 60, ctx())!.m).toBe(840 - 15);
  });

  it("a boundary squeezed between its own edges stays where it is and nothing changes", () => {
    const slots = [sl("a", "10:00", "10:10"), sl("b", "10:10", "10:20")];
    const out = moveBoundary(slots, { id: "a", edge: "end" }, 615, ctx())!;
    expect(out.m).toBe(610);
    expect(out.slots).toBe(slots);
  });

  it("a one-shot moves by its start only: freely, rounded to 15 minutes, before the end of the day", () => {
    const d = [sl("1", "08:00", "12:00"), sl("2", "10:00", null, { label: "b" })];
    const r = moveBoundary(d, { id: "2", edge: "start" }, 20 * 60 + 7, ctx())!;
    expect(r.m).toBe(1200);
    expect(show(r.slots)).toEqual(["08:00-12:00:t18", "20:00-_:b"]);
    expect(moveBoundary(d, { id: "2", edge: "start" }, 5000, ctx())!.m).toBe(1425);
    expect(moveBoundary(d, { id: "2", edge: "end" }, 100, ctx())).toBeNull();
  });

  it("a one-shot is no obstacle", () => {
    const slots = [sl("a", "08:00", "10:00"), sl("o", "11:00", null)];
    expect(moveBoundary(slots, { id: "a", edge: "end" }, 720, ctx())!.m).toBe(720);
  });

  it("another device's slot is no obstacle", () => {
    const slots = [sl("a", "08:00", "10:00", { entities: ["d1"] }), sl("b", "11:00", "12:00", { entities: ["d2"] })];
    expect(moveBoundary(slots, { id: "a", edge: "end" }, 810, ctx())!.m).toBe(810);
  });

  it("a slot that crosses the end of the day beside the boundary does not break it", () => {
    const slots = [sl("x", "20:00", "24:00"), sl("y", "22:00", "02:00")];
    expect(moveBoundary(slots, { id: "x", edge: "end" }, 1380, ctx())!.m).toBe(1380);
  });

  it("a sun boundary becomes a fixed time once dragged", () => {
    const r = moveBoundary([sl("1", "08:00", { sun: "sunset" })], { id: "1", edge: "end" }, 1140 + 30, ctx())!;
    expect(show(r.slots)).toEqual(["08:00-19:30:t18"]);
    const one = moveBoundary([sl("2", { sun: "sunset", offset: 10 }, null)], { id: "2", edge: "start" }, 1100, ctx())!;
    expect(one.slots[0].start).toEqual({ time: "18:15" });
  });

  it("does not move the end of a slot that goes on after midnight, but moves its start", () => {
    const slots = [sl("w", "22:00", "02:00")];
    expect(moveBoundary(slots, { id: "w", edge: "end" }, 1380, ctx())).toBeNull();
    expect(moveBoundary(slots, { id: "w", edge: "start" }, 1260, ctx())!.m).toBe(1260);
  });

  it("a handle that is not on screen (other device) or unknown cannot be moved", () => {
    const slots = [sl("a", "08:00", "09:00", { entities: ["d1"] })];
    expect(moveBoundary(slots, { id: "a", edge: "end" }, 600, ctx({ entity: "d2" }))).toBeNull();
    expect(moveBoundary(slots, { id: "zz", edge: "end" }, 600, ctx())).toBeNull();
    expect(moveBoundary(slots, { id: "a", edge: "end" }, 600, ctx({ entity: "d1" }))!.m).toBe(600);
  });

  it("the part of the day taken by the day before is a limit, also when the boundary sits right on it", () => {
    const slots = [sl("a", "01:00", "03:00")];
    expect(moveBoundary(slots, { id: "a", edge: "start" }, 0, ctx({ lead: 60 }))!.m).toBe(60);
    const slots2 = [sl("a", "02:00", "03:00")];
    expect(moveBoundary(slots2, { id: "a", edge: "start" }, 0, ctx({ lead: 60 }))!.m).toBe(60);
    const early = [sl("a", "00:30", "03:00")]; // starts inside the part of the day before: nothing holds it back
    expect(moveBoundary(early, { id: "a", edge: "start" }, 0, ctx({ lead: 60 }))!.m).toBe(0);
  });
});

describe("cutting in two", () => {
  it("finds the middle on the 15 minute step, with room on both sides", () => {
    expect(middle(600, 660)).toBe(630);
    expect(middle(600, 629)).toBeNull();
    expect(middle(600, 630)).toBe(615);
    expect(middle(601, 631)).toBe(616);
    expect(middle(599, 629)).toBe(614);
  });

  it("cuts the targeted slot, not the first one, and returns the handle of the new boundary", () => {
    const slots = [sl("a", "08:00", "09:00"), sl("b", "10:00", "12:00")];
    const out = splitAt(slots, { kind: "slot", id: "b" }, ctx())!;
    expect(brief(out.slots)).toEqual(["a:08:00-09:00:t18", "b:10:00-11:00:t18"]);
    expect(out.handle).toEqual({ id: "b", edge: "end" });
  });

  it("leaves no slot on the right part, so the rest of the time applies there", () => {
    const r = splitAt([sl("1", "08:00", "12:00"), sl("2", "14:00", "16:00")], { kind: "slot", id: "1" }, ctx())!;
    expect(show(r.slots)).toEqual(["08:00-10:00:t18", "14:00-16:00:t18"]);
    expect(segments(r.slots, ctx()).filter((x) => x.kind === "gap").map((x) => [x.start, x.end])).toContainEqual([600, 840]);
  });

  it("rounds to 15 minutes and keeps the original end spec (sun)", () => {
    const r = splitAt([sl("1", "08:00", { sun: "sunset" })], { kind: "slot", id: "1" }, ctx())!;
    expect(show(r.slots)).toEqual(["08:00-13:30:t18"]);
  });

  it("splits a 30-minute slot at 15 and the whole empty day at noon", () => {
    expect(show(splitAt([sl("1", "08:00", "08:30")], { kind: "slot", id: "1" }, ctx())!.slots)).toEqual(["08:00-08:15:t18"]);
    expect(show(splitAt([], { kind: "gap", start: 0, end: 1440 }, ctx({ defaultLabel: "rest" }))!.slots)).toEqual(["12:00-24:00:rest"]);
  });

  it("a gap gets a new slot on its second half, with the default label, its devices and a handle on its start", () => {
    const out = splitAt([sl("a", "08:00", "09:00")], { kind: "gap", start: 600, end: 720 }, ctx({ defaultLabel: "t15", newId: () => "new", newEntities: ["d1"] }))!;
    expect(out.handle).toEqual({ id: "new", edge: "start" });
    expect(out.slots[1]).toEqual({ id: "new", start: { time: "11:00" }, end: { time: "12:00" }, conditions: [], label: "t15", entities: ["d1"] });
    expect(out.slots.map((s) => s.id)).toEqual(["a", "new"]);
  });

  it("a gap is not cut without a default label or when too short", () => {
    expect(splitAt([], { kind: "gap", start: 600, end: 720 }, ctx())).toBeNull();
    expect(splitAt([], { kind: "gap", start: 600, end: 620 }, ctx({ defaultLabel: "t15" }))).toBeNull();
  });

  it("makes its own ids when none is given", () => {
    const out = splitAt([], { kind: "gap", start: 600, end: 720 }, ctx({ defaultLabel: "t15" }))!;
    expect(typeof out.slots[0].id).toBe("string");
    expect(out.slots[0].id.length).toBeGreaterThan(0);
    expect(out.handle.id).toBe(out.slots[0].id);
  });

  it("does not cut a one-shot, a missing slot or a slot too short", () => {
    expect(splitAt([sl("o", "08:00", null)], { kind: "slot", id: "o" }, ctx())).toBeNull();
    expect(splitAt([sl("a", "08:00", "09:00")], { kind: "slot", id: "zz" }, ctx())).toBeNull();
    expect(splitAt([sl("a", "08:00", "08:15")], { kind: "slot", id: "a" }, ctx())).toBeNull();
    expect(splitAt([sl("a", "08:00", "08:20")], { kind: "slot", id: "a" }, ctx())).toBeNull();
  });
});

describe("labelling a gap and removing a slot", () => {
  it("changes the label of a slot and fills a gap", () => {
    const d = [sl("1", "08:00", "12:00")];
    expect(show(setLabel(d, { kind: "slot", id: "1" }, "b", ctx()))).toEqual(["08:00-12:00:b"]);
    expect(show(setLabel(d, { kind: "gap", start: 0, end: 480 }, "c", ctx()))).toEqual(["00:00-08:00:c", "08:00-12:00:t18"]);
    expect(show(setLabel(d, { kind: "gap", start: 720, end: 1440 }, "c", ctx()))).toEqual(["08:00-12:00:t18", "12:00-24:00:c"]);
  });
  it("a gap becomes a slot with the label, the given id and devices", () => {
    const out = setLabel([sl("a", "08:00", "09:00")], { kind: "gap", start: 600, end: 720 }, "t15", ctx({ newId: () => "new", newEntities: ["d1"] }));
    expect(out[1]).toEqual({ id: "new", start: { time: "10:00" }, end: { time: "12:00" }, conditions: [], label: "t15", entities: ["d1"] });
  });
  it("makes its own id when none is given", () => {
    const out = setLabel([], { kind: "gap", start: 600, end: 720 }, "t15", ctx());
    expect(typeof out[0].id).toBe("string");
    expect(out[0].id.length).toBeGreaterThan(0);
  });
  it("removes a slot (its time falls back to the rest of the time)", () => {
    expect(removeSlot([sl("1", "08:00", "12:00"), sl("2", "13:00", null)], "1").map((s) => s.id)).toEqual(["2"]);
    expect(removeSlot([sl("1", "08:00", "12:00")], "zz")).toHaveLength(1);
  });
});

describe("merging neighbours", () => {
  it("merges neighbours with the same label only when end == start", () => {
    const out = mergeAdjacent([sl("1", "08:00", "10:00"), sl("2", "10:00", "12:00"), sl("3", "12:15", "14:00"), sl("4", "14:00", "15:00", { label: "b" })], ctx());
    expect(show(out)).toEqual(["08:00-12:00:t18", "12:15-14:00:t18", "14:00-15:00:b"]);
    expect(out[0].id).toBe("1");
  });

  it("merges neighbours with the same label, an absent list equal to an empty one", () => {
    const a = { id: "a", start: { time: "08:00" }, end: { time: "09:00" }, label: "x" } as Slot;
    const b = sl("b", "09:00", "10:00", { label: "x" });
    expect(brief(mergeAdjacent([a, b], ctx()))).toEqual(["a:08:00-10:00:x"]);
    expect(brief(mergeAdjacent([b, a], ctx()))).toEqual(["a:08:00-10:00:x"]);
    expect(brief(mergeAdjacent([sl("c", "07:00", "08:00", { label: "x" }), a], ctx()))).toEqual(["c:07:00-09:00:x"]);
  });

  it("never merges a start / stop slot: joining two would drop a stop and a start (issue #93)", () => {
    const stop = sl("a", "08:00", "09:00", { label: "x", end_label: "y" });
    expect(brief(mergeAdjacent([stop, sl("b", "09:00", "10:00", { label: "x" })], ctx()))).toHaveLength(2);
    expect(brief(mergeAdjacent([stop, sl("b", "09:00", "10:00", { label: "x", end_label: "y" })], ctx()))).toHaveLength(2);
  });

  it("merges a chain, ignores one-shots and a slot crossing midnight", () => {
    expect(show(mergeAdjacent([sl("1", "08:00", "09:00"), sl("2", "09:00", "10:00"), sl("3", "10:00", "11:00")], ctx()))).toEqual(["08:00-11:00:t18"]);
    expect(mergeAdjacent([sl("1", "10:00", null), sl("2", "10:00", "11:00")], ctx())).toHaveLength(2);
    expect(mergeAdjacent([sl("1", "22:00", "06:00"), sl("2", "00:00", "03:00")], ctx())).toHaveLength(2);
  });

  it("merges up to 24:00 and from a sun end to the same sun start", () => {
    expect(show(mergeAdjacent([sl("1", "20:00", "22:00"), sl("2", "22:00", "24:00")], ctx()))).toEqual(["20:00-24:00:t18"]);
    expect(show(mergeAdjacent([sl("1", "08:00", { sun: "sunset" }), sl("2", { sun: "sunset" }, "22:00")], ctx()))).toEqual(["08:00-22:00:t18"]);
  });

  it("never merges the slots listed in `keep` (the two pieces of a cut)", () => {
    const d = [sl("1", "08:00", "10:00"), sl("2", "10:00", "12:00"), sl("3", "12:00", "14:00")];
    expect(show(mergeAdjacent(d, ctx(), new Set(["2"])))).toEqual(["08:00-10:00:t18", "10:00-12:00:t18", "12:00-14:00:t18"]);
    expect(show(mergeAdjacent(d, ctx(), new Set(["3"])))).toEqual(["08:00-12:00:t18", "12:00-14:00:t18"]);
  });

  it.each([
    ["label", { label: "y" }, 2],
    ["devices", { entities: ["d1"] }, 2],
    ["conditions", { conditions: [{ entity_id: "sensor.x", state: "on" } as never] }, 2],
    ["colour", { color: "red" }, 2],
    ["nothing", {}, 1],
  ])("neighbours that differ by %s: %i slot(s) left", (_what, extra, count) => {
    expect(mergeAdjacent([sl("a", "08:00", "09:00"), sl("b", "09:00", "10:00", extra)], ctx())).toHaveLength(count);
  });

  it("slots with an empty device list share nothing and are never merged", () => {
    const out = mergeAdjacent([sl("a", "08:00", "09:00", { entities: [] }), sl("b", "09:00", "10:00", { entities: [] })], ctx());
    expect(out).toHaveLength(2);
  });

  it("does not merge slots of other devices, even when the first slot of the day is not for the same device", () => {
    const out = mergeAdjacent([sl("a", "08:00", "09:00", { entities: ["d1"] }), sl("b", "09:00", "10:00", { entities: ["d2"] })], ctx());
    expect(out).toHaveLength(2);
    const across = mergeAdjacent([sl("a", "08:00", "09:00", { entities: ["d1"] }), sl("b", "08:30", "09:30", { entities: ["d2"] }), sl("c", "09:00", "10:00", { entities: ["d1"] })], ctx());
    expect(brief(across)).toEqual(["a:08:00-10:00:t18", "b:08:30-09:30:t18"]);
  });
});

describe("moving a slot inside its day", () => {
  it("is stopped by neighbours it may touch, and fits exactly between them", () => {
    const slots = [sl("a", "08:00", "09:00"), sl("m", "09:00", "10:00"), sl("b", "10:00", "11:00")];
    expect(moveSlotBy(slots, "m", -60, ctx(), shift)).toMatchObject({ start: 540, end: 600, delta: 0 });
    expect(moveSlotBy(slots, "m", 60, ctx(), shift)).toMatchObject({ start: 540, delta: 0 });
    expect(moveSlotBy(slots, "m", 60, ctx(), shift)!.slots).toEqual(slots);
  });

  it("goes as far as the neighbour, no further, and ignores other devices and one-shots", () => {
    const slots = [sl("a", "08:00", "09:00"), sl("m", "10:00", "11:00"), sl("b", "13:00", "14:00"), sl("o", "11:30", null)];
    expect(moveSlotBy(slots, "m", -300, ctx(), shift)).toMatchObject({ start: 540, delta: -60 });
    expect(moveSlotBy(slots, "m", 300, ctx(), shift)).toMatchObject({ start: 720, end: 780, delta: 120 });
    const other = [sl("a", "08:00", "09:00", { entities: ["d2"] }), sl("m", "10:00", "11:00", { entities: ["d1"] })];
    expect(moveSlotBy(other, "m", -600, ctx(), shift)).toMatchObject({ start: 0 });
  });

  it("moves by 5 minute steps and shifts the times with the given function", () => {
    const out = moveSlotBy([sl("m", "10:00", "11:00")], "m", 17, ctx(), shift)!;
    expect(out).toMatchObject({ start: 615, end: 675, delta: 15 });
    expect(out.slots[0].start).toEqual({ time: "10:15", random_minutes: 1 });
    expect(out.slots[0].end).toEqual({ time: "11:15", random_minutes: 1 });
  });

  it("a move of 0 leaves the slot object as it was", () => {
    const slots = [sl("m", "10:00", "11:00")];
    expect(moveSlotBy(slots, "m", 0, ctx(), shift)!.slots[0]).toBe(slots[0]);
  });

  it("refuses a missing slot, a one-shot or a slot crossing midnight", () => {
    expect(moveSlotBy([sl("m", "10:00", "11:00")], "zz", 15, ctx(), shift)).toBeNull();
    expect(moveSlotBy([sl("o", "10:00", null)], "o", 15, ctx(), shift)).toBeNull();
    expect(moveSlotBy([sl("w", "22:00", "02:00")], "w", 15, ctx(), shift)).toBeNull();
  });

  it("the part of the day taken by the day before is a limit (also right at its end)", () => {
    expect(moveSlotBy([sl("m", "02:00", "03:00")], "m", -120, ctx({ lead: 60 }), shift)).toMatchObject({ start: 60 });
    expect(moveSlotBy([sl("m", "01:00", "02:00")], "m", -60, ctx({ lead: 60 }), shift)).toMatchObject({ start: 60, delta: 0 });
    expect(moveSlotBy([sl("m", "00:30", "01:30")], "m", -30, ctx({ lead: 60 }), shift)).toMatchObject({ start: 0, delta: -30 });
  });
});

describe("moving a slot to another day", () => {
  const src = { day: 0, id: "s" };
  const run = (d: Slot[][], to = 1, delta = 0) => moveToDay(d, src, to, delta, ctx({ newId: () => "moved" }), shift);

  it("takes the slot off its day, adds it to the new one in time order, and leaves the other days", () => {
    const keep = sl("k", "08:00", "09:00");
    const later = sl("l", "15:00", "16:00");
    const other = sl("o", "08:00", "09:00");
    const stay = sl("t", "14:00", "15:00");
    const out = run(days7({ 0: [sl("s", "10:00", "11:00"), stay], 1: [later, keep], 2: [other] }), 1, 30) as { days: Slot[][]; start: number };
    expect(out.start).toBe(630);
    expect(out.days[0]).toEqual([stay]);
    expect(out.days[1].map((s) => s.id)).toEqual(["k", "moved", "l"]);
    expect(out.days[1][1].start).toEqual({ time: "10:30", random_minutes: 1 });
    expect(out.days[2]).toEqual([other]);
  });

  it("the moved slot keeps its content when it does not move in time", () => {
    const s = sl("s", "10:00", "11:00");
    const out = run(days7({ 0: [s] })) as { days: Slot[][] };
    expect(out.days[1][0]).toEqual({ ...s, id: "moved" });
  });

  it("stays inside the day", () => {
    const out = run(days7({ 0: [sl("s", "10:00", "11:00")] }), 1, 5000) as { start: number };
    expect(out.start).toBe(1380);
    const early = run(days7({ 0: [sl("s", "10:00", "11:00")] }), 1, -5000) as { start: number };
    expect(early.start).toBe(0);
  });

  const d = days7({ 0: [sl("s", "10:00", "11:00")] });
  it.each([
    ["an unknown slot", d, { day: 0, id: "zz" }, 1, "gone"],
    ["an unknown source day", d, { day: 9, id: "s" }, 1, "gone"],
    ["the same day", d, src, 0, "gone"],
    ["an unknown target day", d, src, 9, "gone"],
    ["a one-shot", days7({ 0: [sl("s", "10:00", null)] }), src, 1, "oneshot"],
    ["a slot crossing midnight", days7({ 0: [sl("s", "22:00", "02:00")] }), src, 1, "wrap"],
  ])("refuses %s", (_what, days, from, to, error) => {
    expect(moveToDay(days, from, to, 0, ctx(), shift)).toEqual({ error });
  });

  it.each([
    ["overlaps on a shared device", sl("x", "10:30", "11:30", { entities: ["d1"] }), { error: "overlap" } as { error?: string; start?: number }],
    ["overlaps from before", sl("x", "09:30", "10:30", { entities: ["d1"] }), { error: "overlap" }],
    ["overlaps a slot of every device", sl("x", "09:00", "12:00"), { error: "overlap" }],
    ["touches the end", sl("x", "11:00", "12:00", { entities: ["d1"] }), { start: 600 }],
    ["touches the start", sl("x", "09:00", "10:00", { entities: ["d1"] }), { start: 600 }],
    ["lands on a one-shot", sl("x", "10:30", null, { entities: ["d1"] }), { start: 600 }],
    ["lands on another device", sl("x", "10:30", "11:30", { entities: ["d2"] }), { start: 600 }],
  ])("a slot that %s: the move result", (_what, other, expected) => {
    const s = sl("s", "10:00", "11:00", { entities: ["d1"] });
    const out = run(days7({ 0: [s], 1: [other] }));
    if ("error" in expected) expect(out).toEqual(expected);
    else expect(out).toMatchObject(expected);
  });

  it("makes its own id when none is given", () => {
    const out = moveToDay(days7({ 0: [sl("s", "10:00", "11:00")] }), src, 1, 0, ctx(), shift) as { days: Slot[][] };
    expect(typeof out.days[1][0].id).toBe("string");
    expect(out.days[1][0].id).toBeTruthy();
  });
});
