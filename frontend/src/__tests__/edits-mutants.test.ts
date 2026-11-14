// Properties of edits.ts that the first tests left open (mutation testing): exact boundaries, exact values.
// Equivalent mutants, ignored: `holds` with `id !== null` forced true (includes(null) is false anyway); `keptRest`
// called with a one-element array instead of `[]` (no day equals it); `edge <=`/`lo >= hi` when lo == hi (the
// boundary is already there); `ref.edge === "end" && own.wrap` (a wrap slot has no end boundary: null anyway);
// `else if (h)` for a wrap end (it only meets m at 24:00, where hi is already 24:00); the probe id in
// splitBusyDays; `o.end === null` in moveSlotBy (a one-shot never passes the next test); `hi - lo < span` in
// moveSlotBy (an own slot always fits its neighbours); the `o.start >= end` branch with overlapping slots.
import { describe, expect, it } from "vitest";
import type { SlotGroup } from "../actions";
import {
  boundaries, compareOrigin, copyConflicts, copyToDays, eff, freshGroup, handleMinute, keptRest, mergeAdjacent, middle,
  moveBoundary, moveSlotBy, moveToDay, segments, setLabel, splitAt, splitBusyDays,
} from "../edits";
import type { DayCtx } from "../edits";
import { clockToMinutes } from "../time";
import type { Profile, Slot, TimeSpec } from "../types";

const SUN = { sunrise: 420, sunset: 1140, dawn: 360, dusk: 1200 };
const at = (s: TimeSpec): number => ("time" in s ? clockToMinutes(s.time) : SUN[s.sun] + (s.offset ?? 0));
const minutes = at;
const ctx = (extra: Partial<DayCtx> = {}): DayCtx => ({ at, ...extra });
const mm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const shift = (s: TimeSpec, d: number): TimeSpec => ("time" in s ? { time: mm(clockToMinutes(s.time) + d), random_minutes: 1 } : s);
const sl = (id: string, start: string, end: string | null, extra: Partial<Slot> = {}): Slot => ({
  id, start: { time: start }, end: end === null ? null : { time: end }, conditions: [], label: "t18", ...extra,
});
const brief = (slots: Slot[]) => slots.map((s) => `${s.id}:${"time" in s.start ? s.start.time : "sun"}-${s.end && "time" in s.end ? s.end.time : "_"}:${s.label}`);
const ids = (_n = 0) => { let i = 0; return () => `n${++i}`; };
const grp = (days: number[], idMap: Record<number, string>, extra: Partial<Slot> = {}): SlotGroup => ({ slot: sl("g", "08:00", "09:00", extra), days, ids: idMap });
const emptyProfile = (days: Record<number, Slot[]>): Profile => ({ id: "p", name: "P", days: [0, 1, 2, 3, 4, 5, 6].map((d) => days[d] ?? []) });

describe("is the opened group still what it was", () => {
  it("same, other days, changed, gone", () => {
    const origin = grp([0, 1], { 0: "a", 1: "b" });
    expect(compareOrigin(null, origin)).toBe("gone");
    expect(compareOrigin(grp([0, 1], { 0: "a", 1: "b" }), origin)).toBe("same");
    expect(compareOrigin(grp([0, 1, 2], { 0: "a", 1: "b", 2: "c" }), origin)).toBe("days");
    expect(compareOrigin(grp([0, 2], { 0: "a", 2: "b" }), origin)).toBe("days");
    expect(compareOrigin(grp([0, 1], { 0: "a", 1: "z" }), origin)).toBe("days"); // same days, a slot replaced
    expect(compareOrigin(grp([0, 1, 2], { 0: "a", 1: "b" }), origin)).toBe("days"); // a new day, no id yet
    expect(compareOrigin(grp([0, 1], { 0: "a", 1: "b" }, { label: "other" }), origin)).toBe("changed");
  });
});

describe("rest of a group", () => {
  it("keeps only the ids of the days left, without empty entries", () => {
    const rest: SlotGroup = { slot: sl("g", "08:00", "09:00"), days: [1, 2, 3], ids: { 1: "a", 3: "c" } };
    const [kept] = keptRest(rest, [3]);
    expect(kept.days).toEqual([1, 2]);
    expect(Object.keys(kept.ids)).toEqual(["1"]);
    expect(keptRest(rest, [1, 2, 3])).toEqual([]);
    expect(keptRest(null, [1])).toEqual([]);
  });
});

describe("busy days of a new slot", () => {
  it("only the slots the screen shows can make a day busy", () => {
    const p = emptyProfile({ 0: [sl("a", "08:00", "10:00", { label: "hidden" })], 1: [sl("b", "08:00", "10:00")] });
    const shown = (s: Slot) => s.label !== "hidden";
    expect(splitBusyDays(p, shown, minutes, sl("n", "09:00", "11:00"), [0, 1])).toEqual({ free: [0], busy: [1] });
  });
});

describe("a fresh group", () => {
  it("is one hour from 8:00 by default, with no condition, flagged fresh, with no id yet per day", () => {
    const g = freshGroup("t15", [2, 3]);
    expect(g.slot.start).toEqual({ time: "08:00" });
    expect(g.slot.end).toEqual({ time: "09:00" });
    expect(g.slot.conditions).toEqual([]);
    expect(g.fresh).toBe(true);
    expect(g.days).toEqual([2, 3]);
    expect(g.ids).toEqual({});
  });
});

describe("effective times of a slot", () => {
  it("a one-shot has no end and does not wrap", () => {
    expect(eff(sl("a", "08:00", null), at)).toEqual({ start: 480, end: null, wrap: false });
  });
  it("an end after the start does not wrap; an end at or before it goes on to the end of the day", () => {
    expect(eff(sl("a", "08:00", "09:00"), at)).toEqual({ start: 480, end: 540, wrap: false });
    expect(eff(sl("a", "22:00", "02:00"), at)).toEqual({ start: 1320, end: 1440, wrap: true });
    expect(eff(sl("a", "10:00", "10:00"), at)).toEqual({ start: 600, end: 1440, wrap: true });
  });
});

describe("segments of a day", () => {
  it("cuts the day into gaps and slots in time order, with no empty gap between neighbours", () => {
    const slots = [sl("b", "12:00", "24:00"), sl("a", "08:00", "12:00")];
    expect(segments(slots, ctx()).map((s) => `${s.kind}:${s.start}-${s.end}`)).toEqual(["gap:0-480", "slot:480-720", "slot:720-1440"]);
  });
  it("no gap when a slot starts at the beginning, or ends at the end of the day", () => {
    expect(segments([sl("a", "00:00", "24:00")], ctx()).map((s) => s.kind)).toEqual(["slot"]);
  });
  it("starts after the part taken by the day before", () => {
    expect(segments([sl("a", "03:00", "04:00")], ctx({ lead: 120 })).map((s) => `${s.kind}:${s.start}-${s.end}`))
      .toEqual(["gap:120-180", "slot:180-240", "gap:240-1440"]);
    expect(segments([], ctx({ lead: 120 }))).toEqual([{ kind: "gap", start: 120, end: 1440 }]);
  });
  it("a one-shot is not a segment, and a slot inside another does not pull the cursor back", () => {
    const out = segments([sl("o", "09:00", null), sl("a", "08:00", "12:00"), sl("b", "09:00", "10:00")], ctx());
    expect(out.map((s) => `${s.kind}:${s.start}-${s.end}`)).toEqual(["gap:0-480", "slot:480-720", "slot:540-600", "gap:720-1440"]);
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
  it("does not move the end of a slot that goes on after midnight, but moves its start", () => {
    const slots = [sl("w", "22:00", "02:00")];
    expect(moveBoundary(slots, { id: "w", edge: "end" }, 1380, ctx())).toBeNull();
    expect(moveBoundary(slots, { id: "w", edge: "start" }, 1260, ctx())!.m).toBe(1260);
  });

  it("a handle that is not on screen (other device) cannot be moved", () => {
    const slots = [sl("a", "08:00", "09:00", { entities: ["d1"] })];
    expect(moveBoundary(slots, { id: "a", edge: "end" }, 600, ctx({ entity: "d2" }))).toBeNull();
    expect(moveBoundary(slots, { id: "zz", edge: "end" }, 600, ctx())).toBeNull();
    expect(moveBoundary(slots, { id: "a", edge: "end" }, 600, ctx({ entity: "d1" }))!.m).toBe(600);
  });

  it("a one-shot moves by its start only, and stays before the end of the day", () => {
    const slots = [sl("o", "08:00", null)];
    expect(moveBoundary(slots, { id: "o", edge: "end" }, 600, ctx())).toBeNull();
    expect(moveBoundary(slots, { id: "o", edge: "start" }, 2000, ctx())!.m).toBe(1425);
  });

  it("is stopped by the next and the previous slot, which it may touch", () => {
    const slots = [sl("a", "08:00", "09:00"), sl("b", "10:00", "11:00")];
    expect(moveBoundary(slots, { id: "a", edge: "end" }, 700, ctx())!.m).toBe(600);
    expect(moveBoundary(slots, { id: "b", edge: "start" }, 0, ctx())!.m).toBe(540);
    expect(moveBoundary(slots, { id: "a", edge: "end" }, 0, ctx())!.m).toBe(495); // 15 min after its own start
    expect(moveBoundary(slots, { id: "b", edge: "start" }, 5000, ctx())!.m).toBe(645); // 15 min before its own end
  });

  it("a one-shot is no obstacle", () => {
    const slots = [sl("a", "08:00", "10:00"), sl("o", "11:00", null)];
    expect(moveBoundary(slots, { id: "a", edge: "end" }, 720, ctx())!.m).toBe(720);
  });

  it("another device's slot is no obstacle", () => {
    const slots = [sl("a", "08:00", "10:00", { entities: ["d1"] }), sl("b", "11:00", "12:00", { entities: ["d2"] })];
    expect(moveBoundary(slots, { id: "a", edge: "end" }, 810, ctx())!.m).toBe(810);
  });

  it("the part of the day taken by the day before is a limit, also when the boundary sits right on it", () => {
    const slots = [sl("a", "01:00", "03:00")];
    expect(moveBoundary(slots, { id: "a", edge: "start" }, 0, ctx({ lead: 60 }))!.m).toBe(60);
    const slots2 = [sl("a", "02:00", "03:00")];
    expect(moveBoundary(slots2, { id: "a", edge: "start" }, 0, ctx({ lead: 60 }))!.m).toBe(60);
    const early = [sl("a", "00:30", "03:00")]; // starts inside the part of the day before: nothing holds it back
    expect(moveBoundary(early, { id: "a", edge: "start" }, 0, ctx({ lead: 60 }))!.m).toBe(0);
  });

  it("a slot that crosses the end of the day beside the boundary does not break it", () => {
    const slots = [sl("x", "20:00", "24:00"), sl("y", "22:00", "02:00")];
    expect(moveBoundary(slots, { id: "x", edge: "end" }, 1380, ctx())!.m).toBe(1380);
  });

  it("a boundary squeezed between its own edges stays where it is and nothing changes", () => {
    const slots = [sl("a", "10:00", "10:10"), sl("b", "10:10", "10:20")];
    const out = moveBoundary(slots, { id: "a", edge: "end" }, 615, ctx())!;
    expect(out.m).toBe(610);
    expect(out.slots).toBe(slots);
  });

  it("moves a shared boundary for every slot of it, writing fixed times", () => {
    const slots = [sl("a", "08:00", "09:00"), sl("b", "09:00", "10:00")];
    const out = moveBoundary(slots, { id: "a", edge: "end" }, 570, ctx())!;
    expect(brief(out.slots)).toEqual(["a:08:00-09:30:t18", "b:09:30-10:00:t18"]);
  });
});

describe("cutting in two", () => {
  it("finds the middle on the 5-free 15 minute step, with room on both sides", () => {
    expect(middle(600, 660)).toBe(630);
    expect(middle(600, 629)).toBeNull();
    expect(middle(600, 630)).toBe(615);
    expect(middle(601, 631)).toBe(616);
    expect(middle(599, 629)).toBe(614);
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

  it("cuts the targeted slot, not the first one, and returns the handle of the new boundary", () => {
    const slots = [sl("a", "08:00", "09:00"), sl("b", "10:00", "12:00")];
    const out = splitAt(slots, { kind: "slot", id: "b" }, ctx())!;
    expect(brief(out.slots)).toEqual(["a:08:00-09:00:t18", "b:10:00-11:00:t18"]);
    expect(out.handle).toEqual({ id: "b", edge: "end" });
  });

  it("does not cut a one-shot, a missing slot or a slot too short", () => {
    expect(splitAt([sl("o", "08:00", null)], { kind: "slot", id: "o" }, ctx())).toBeNull();
    expect(splitAt([sl("a", "08:00", "09:00")], { kind: "slot", id: "zz" }, ctx())).toBeNull();
    expect(splitAt([sl("a", "08:00", "08:15")], { kind: "slot", id: "a" }, ctx())).toBeNull();
  });
});

describe("labelling a gap", () => {
  it("a gap becomes a slot with the label, the given id and devices", () => {
    const out = setLabel([sl("a", "08:00", "09:00")], { kind: "gap", start: 600, end: 720 }, "t15", ctx({ newId: () => "new", newEntities: ["d1"] }));
    expect(out[1]).toEqual({ id: "new", start: { time: "10:00" }, end: { time: "12:00" }, conditions: [], label: "t15", entities: ["d1"] });
  });
  it("makes its own id when none is given", () => {
    const out = setLabel([], { kind: "gap", start: 600, end: 720 }, "t15", ctx());
    expect(typeof out[0].id).toBe("string");
    expect(out[0].id.length).toBeGreaterThan(0);
  });
});

describe("merging neighbours", () => {
  it("merges neighbours with the same label, an absent list equal to an empty one", () => {
    const a = { id: "a", start: { time: "08:00" }, end: { time: "09:00" }, label: "x" } as Slot;
    const b = sl("b", "09:00", "10:00", { label: "x" });
    expect(brief(mergeAdjacent([a, b], ctx()))).toEqual(["a:08:00-10:00:x"]);
    expect(brief(mergeAdjacent([b, a], ctx()))).toEqual(["a:08:00-10:00:x"]);
    expect(brief(mergeAdjacent([sl("c", "07:00", "08:00", { label: "x" }), a], ctx()))).toEqual(["c:07:00-09:00:x"]);
  });

  it("does not merge different labels, devices, conditions or colours", () => {
    const cond = [{ entity_id: "sensor.x", state: "on" } as never];
    const other = (extra: Partial<Slot>) => mergeAdjacent([sl("a", "08:00", "09:00"), sl("b", "09:00", "10:00", extra)], ctx());
    expect(other({ label: "y" })).toHaveLength(2);
    expect(other({ entities: ["d1"] })).toHaveLength(2);
    expect(other({ conditions: cond })).toHaveLength(2);
    expect(other({ color: "red" })).toHaveLength(2);
    expect(other({})).toHaveLength(1);
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

describe("copying a slot to other days", () => {
  const day = (...slots: Slot[]) => slots;
  const days = (d: Record<number, Slot[]>): Slot[][] => [0, 1, 2, 3, 4, 5, 6].map((i) => d[i] ?? []);
  const src = { day: 0, id: "s" };

  it("conflicts: only overlapping slots of a shared device, never the source day, touching is not overlapping", () => {
    const d = days({
      0: day(sl("s", "10:00", "11:00")),
      1: day(sl("x", "11:00", "12:00")), 2: day(sl("x", "09:00", "10:00")), 3: day(sl("x", "10:30", "11:30")),
      4: day(sl("x", "09:00", "12:00")), 5: day(sl("x", "10:30", null)), 6: day(sl("x", "10:30", "11:30", { entities: ["d9"] })),
    });
    const slots0 = d[0];
    slots0[0] = sl("s", "10:00", "11:00", { entities: ["d1"] });
    expect(copyConflicts(d, src, [0, 1, 2, 3, 4, 5, 6], ctx())).toEqual([3, 4]);
    d[6] = day(sl("x", "10:30", "11:30", { entities: ["d1"] }));
    expect(copyConflicts(d, src, [6], ctx())).toEqual([6]);
  });

  it("no conflict for a missing source, a source day out of range or a one-shot", () => {
    const d = days({ 0: day(sl("s", "10:00", null)), 1: day(sl("x", "09:00", "12:00")) });
    expect(copyConflicts(d, src, [1], ctx())).toEqual([]);
    expect(copyConflicts(d, { day: 0, id: "zz" }, [1], ctx())).toEqual([]);
    expect(copyConflicts(d, { day: 9, id: "s" }, [1], ctx())).toEqual([]);
  });

  it("copy: a missing source changes nothing", () => {
    const d = days({ 0: day(sl("s", "10:00", "11:00")) });
    expect(copyToDays(d, { day: 0, id: "zz" }, [1], ctx())).toBe(d);
    expect(copyToDays(d, { day: 9, id: "s" }, [1], ctx())).toBe(d);
  });

  it("copy: only the chosen days change, not the source day or a skipped day", () => {
    const d = days({ 0: day(sl("s", "10:00", "11:00")) });
    const out = copyToDays(d, src, [0, 1, 2, 3], ctx({ newId: ids(2) }), [2]);
    expect(out.map((x) => x.length)).toEqual([1, 1, 0, 1, 0, 0, 0]);
    expect(out[0]).toBe(d[0]);
    expect(out[1][0].id).toBe("n1");
    expect(out[3][0].id).toBe("n2");
  });

  it("copy: makes its own ids when none is given, different for each day", () => {
    const out = copyToDays(days({ 0: day(sl("s", "10:00", "11:00")) }), src, [1, 2], ctx());
    expect(out[1][0].id).toBeTruthy();
    expect(typeof out[1][0].id).toBe("string");
    expect(out[1][0].id).not.toBe(out[2][0].id);
  });

  it("copy: existing slots are cut around the copied range; touching slots are left untouched (sun times kept)", () => {
    const before: Slot = { ...sl("e1", "08:00", "10:00"), end: { sun: "sunrise", offset: 180 } }; // 10:00
    const after: Slot = { ...sl("e2", "11:00", "13:00"), start: { sun: "sunrise", offset: 240 } }; // 11:00
    const out = copyToDays(days({ 0: day(sl("s", "10:00", "11:00", { label: "x" })), 1: day(before, after) }), src, [1], ctx({ newId: ids(2) }));
    expect(out[1][0]).toBe(before);
    expect(out[1][2]).toBe(after);
    expect(out[1][1].id).toBe("n1");
  });

  it("copy: a slot that starts or ends exactly on the range is not split into an empty piece", () => {
    const run = (existing: Slot) => copyToDays(days({ 0: day(sl("s", "10:00", "11:00", { label: "x" })), 1: day(existing) }), src, [1], ctx({ newId: ids(3) }))[1];
    expect(brief(run(sl("e", "10:00", "12:00")))).toEqual(["n1:10:00-11:00:x", "e:11:00-12:00:t18"]);
    expect(brief(run(sl("e", "09:00", "11:00")))).toEqual(["e:09:00-10:00:t18", "n1:10:00-11:00:x"]);
    expect(brief(run(sl("e", "09:00", "12:00")))).toEqual(["e:09:00-10:00:t18", "n1:10:00-11:00:x", "n2:11:00-12:00:t18"]);
  });

  it("copy: over slots without a device list, nothing is left of the covered part (no stray piece)", () => {
    const out = copyToDays(days({ 0: day(sl("s", "10:00", "11:00", { label: "x" })), 1: day(sl("e", "10:00", "11:00", { entities: ["d1", "d2"] })) }), src, [1], ctx({ devices: ["d1", "d2", "d3"], newId: ids(2) }));
    expect(brief(out[1])).toEqual(["n1:10:00-11:00:x"]);
  });

  it("copy: a slot for other devices keeps the range for them, limited to those devices", () => {
    const d = days({ 0: day(sl("s", "10:00", "11:00", { entities: ["d1"], label: "x" })), 1: day(sl("e", "09:00", "12:00", { entities: ["d1", "d2"] })) });
    const out = copyToDays(d, src, [1], ctx({ devices: ["d1", "d2", "d3"], newId: ids(9) }))[1];
    const row = (s: Slot) => [s.id, s.label, "time" in s.start ? s.start.time : "", s.end && "time" in s.end ? s.end.time : "", s.entities, s.seed];
    expect(out.map(row)).toEqual([
      ["e", "t18", "09:00", "10:00", ["d1", "d2"], undefined],
      ["n2", "t18", "10:00", "11:00", ["d2"], "e"],
      ["n1", "x", "10:00", "11:00", ["d1"], undefined],
      ["n3", "t18", "11:00", "12:00", ["d1", "d2"], undefined],
    ]);
  });

  it("copy: a cut limited to some devices over a slot without list and without program devices leaves nothing of it", () => {
    const d = days({ 0: day(sl("s", "10:00", "11:00", { entities: ["d1"], label: "x" })), 1: day(sl("e", "10:00", "11:00")) });
    expect(brief(copyToDays(d, src, [1], ctx({ newId: ids(2) }))[1])).toEqual(["n1:10:00-11:00:x"]);
  });

  it("copy: the piece left for the other devices has no list field when it is for every device", () => {
    const d = days({ 0: day(sl("s", "10:00", "11:00", { entities: ["d3"], label: "x" })), 1: day(sl("e", "10:00", "11:00")) });
    const out = copyToDays(d, src, [1], ctx({ devices: ["d1", "d2", "d3"], newId: ids(2) }))[1];
    const rest = out.find((s) => s.label === "t18")!;
    expect("entities" in rest).toBe(true);
    expect(rest.entities).toEqual(["d1", "d2"]);
    const all = copyToDays(
      days({ 0: day(sl("s", "10:00", "11:00", { entities: ["d9"], label: "x" })), 1: day(sl("e", "10:00", "11:00")) }), src, [1],
      ctx({ devices: ["d1", "d2"], newId: ids(2) }),
    )[1];
    expect("entities" in all.find((s) => s.label === "t18")!).toBe(false);
  });

  it("copy of a one-shot: added unless the same one is there", () => {
    const one = sl("s", "10:00", null, { label: "x", entities: ["d1"] });
    const run = (existing: Slot) => copyToDays(days({ 0: day(one), 1: day(existing) }), src, [1], ctx({ newId: ids(1) }))[1];
    expect(run(sl("e", "10:00", null, { label: "x", entities: ["d1"] }))).toHaveLength(1);
    expect(run(sl("e", "10:15", null, { label: "x", entities: ["d1"] }))).toHaveLength(2);
    expect(run(sl("e", "10:00", null, { label: "y", entities: ["d1"] }))).toHaveLength(2);
    expect(run(sl("e", "10:00", null, { label: "x", entities: ["d2"] }))).toHaveLength(2);
    expect(run(sl("e", "10:00", "11:00", { label: "x", entities: ["d1"] }))).toHaveLength(2);
    expect(run(sl("e", "10:00", null, { label: "x" }))).toHaveLength(2);
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
  const days = (d: Record<number, Slot[]>): Slot[][] => [0, 1, 2, 3, 4, 5, 6].map((i) => d[i] ?? []);
  const src = { day: 0, id: "s" };
  const run = (d: Slot[][], to = 1, delta = 0) => moveToDay(d, src, to, delta, ctx({ newId: () => "moved" }), shift);

  it("takes the slot off its day, adds it to the new one in time order, and leaves the other days", () => {
    const keep = sl("k", "08:00", "09:00");
    const later = sl("l", "15:00", "16:00");
    const other = sl("o", "08:00", "09:00");
    const stay = sl("t", "14:00", "15:00");
    const out = run(days({ 0: [sl("s", "10:00", "11:00"), stay], 1: [later, keep], 2: [other] }), 1, 30) as { days: Slot[][]; start: number };
    expect(out.start).toBe(630);
    expect(out.days[0]).toEqual([stay]);
    expect(out.days[1].map((s) => s.id)).toEqual(["k", "moved", "l"]);
    expect(out.days[1][1].start).toEqual({ time: "10:30", random_minutes: 1 });
    expect(out.days[2]).toEqual([other]);
  });

  it("the moved slot keeps its content when it does not move in time", () => {
    const s = sl("s", "10:00", "11:00");
    const out = run(days({ 0: [s] })) as { days: Slot[][] };
    expect(out.days[1][0]).toEqual({ ...s, id: "moved" });
  });

  it("stays inside the day", () => {
    const out = run(days({ 0: [sl("s", "10:00", "11:00")] }), 1, 5000) as { start: number };
    expect(out.start).toBe(1380);
    const early = run(days({ 0: [sl("s", "10:00", "11:00")] }), 1, -5000) as { start: number };
    expect(early.start).toBe(0);
  });

  it("refuses an unknown slot, the same day, an unknown day, and the unmovable ones", () => {
    const d = days({ 0: [sl("s", "10:00", "11:00")] });
    expect(moveToDay(d, { day: 0, id: "zz" }, 1, 0, ctx(), shift)).toEqual({ error: "gone" });
    expect(moveToDay(d, { day: 9, id: "s" }, 1, 0, ctx(), shift)).toEqual({ error: "gone" });
    expect(moveToDay(d, src, 0, 0, ctx(), shift)).toEqual({ error: "gone" });
    expect(moveToDay(d, src, 9, 0, ctx(), shift)).toEqual({ error: "gone" });
    expect(moveToDay(days({ 0: [sl("s", "10:00", null)] }), src, 1, 0, ctx(), shift)).toEqual({ error: "oneshot" });
    expect(moveToDay(days({ 0: [sl("s", "22:00", "02:00")] }), src, 1, 0, ctx(), shift)).toEqual({ error: "wrap" });
  });

  it("refuses to land on a slot of a shared device, but not on a touching one, a one-shot or another device", () => {
    const s = sl("s", "10:00", "11:00", { entities: ["d1"] });
    const land = (other: Slot) => run(days({ 0: [s], 1: [other] }));
    expect(land(sl("x", "10:30", "11:30", { entities: ["d1"] }))).toEqual({ error: "overlap" });
    expect(land(sl("x", "09:30", "10:30", { entities: ["d1"] }))).toEqual({ error: "overlap" });
    expect(land(sl("x", "09:00", "12:00"))).toEqual({ error: "overlap" });
    expect(land(sl("x", "11:00", "12:00", { entities: ["d1"] }))).toHaveProperty("start", 600);
    expect(land(sl("x", "09:00", "10:00", { entities: ["d1"] }))).toHaveProperty("start", 600);
    expect(land(sl("x", "10:30", null, { entities: ["d1"] }))).toHaveProperty("start", 600);
    expect(land(sl("x", "10:30", "11:30", { entities: ["d2"] }))).toHaveProperty("start", 600);
  });

  it("makes its own id when none is given", () => {
    const out = moveToDay(days({ 0: [sl("s", "10:00", "11:00")] }), src, 1, 0, ctx(), shift) as { days: Slot[][] };
    expect(typeof out.days[1][0].id).toBe("string");
    expect(out.days[1][0].id).toBeTruthy();
  });
});
