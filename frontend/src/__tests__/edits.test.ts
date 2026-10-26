import { describe, expect, it } from "vitest";
import { groupSlots } from "../actions";
import { applyEdit, dayView, freshGroup, groupId, nextTimes, overlapDay, splitBusyDays } from "../edits";
import { findOverlap } from "../slots";
import { clockToMinutes } from "../time";
import type { Profile, Slot, TimeSpec } from "../types";

const SUN = { sunrise: 420, sunset: 1140, dawn: 360, dusk: 1200 };
const minutes = (s: TimeSpec): number => ("time" in s ? clockToMinutes(s.time) : SUN[s.sun] + (s.offset ?? 0));
const all = () => true;

let n = 0;
const slot = (start: string, end: string | null, label = "t18", id = `s${++n}`): Slot => ({
  id, start: { time: start }, end: end ? { time: end } : null, conditions: [], label,
});
const prof = (days: Record<number, Slot[]>): Profile => ({
  id: "p", name: "P", days: [0, 1, 2, 3, 4, 5, 6].map((d) => days[d] ?? []),
});
const view = (p: Profile) => p.days.map((d) => d.map((s) => `${"time" in s.start ? s.start.time : "sun"}-${s.end && "time" in s.end ? s.end.time : "_"}:${s.label}`));
const idsOf = (p: Profile) => p.days.flatMap((d) => d.map((s) => s.id)).sort();
const groups = (p: Profile) => groupSlots(p, all, minutes);

/** Opens the group holding `id` (whole), optionally for one day only. */
function open(p: Profile, id: string, weekday?: number) {
  const g = groups(p).find((x) => Object.values(x.ids).includes(id))!;
  if (weekday === undefined) return { openId: groupId(g)!, rest: null, draft: structuredClone(g) };
  const { draft, rest } = dayView(g, weekday);
  return { openId: groupId(g)!, rest, draft };
}
const save = (p: Profile, edit: ReturnType<typeof open>) => applyEdit(p, all, minutes, edit);
const add = (p: Profile, g = freshGroup("t15", [1], { start: "17:00", end: "19:00" })) =>
  applyEdit(p, all, minutes, { openId: null, rest: null, draft: g });

describe("a second slot on the same day", () => {
  it("keeps the first slot when a non-overlapping one is added", () => {
    const p = prof({ 1: [slot("10:00", "17:00", "t18", "a")] });
    const out = add(p);
    expect(view(out)[1]).toEqual(["10:00-17:00:t18", "17:00-19:00:t15"]);
    expect(out.days[1].find((s) => s.label === "t18")!.id).toBe("a");
  });

  it("keeps three slots of one day, whatever the order they were added in", () => {
    for (const order of [[0, 1, 2], [2, 1, 0], [1, 2, 0], [1, 0, 2]]) {
      const parts = [["06:00", "08:00", "a"], ["10:00", "12:00", "b"], ["18:00", "22:00", "c"]];
      let p = prof({});
      for (const i of order) {
        const [s, e, l] = parts[i];
        p = add(p, freshGroup(l, [2], { start: s, end: e }));
      }
      expect(view(p)[2]).toEqual(["06:00-08:00:a", "10:00-12:00:b", "18:00-22:00:c"]);
      expect(p.days[2]).toHaveLength(3);
    }
  });
});

describe("one day of a group", () => {
  const group = () => prof({ 0: [slot("08:45", "17:00", "t18", "m")], 1: [slot("08:45", "17:00", "t18", "t")], 4: [slot("08:45", "17:00", "t18", "f")] });

  it("edits Tuesday alone: Monday and Friday unchanged", () => {
    const p = group();
    const edit = open(p, "t", 1);
    edit.draft.slot.start = { time: "10:00" };
    const out = save(p, edit);
    expect(view(out)[0]).toEqual(["08:45-17:00:t18"]);
    expect(view(out)[1]).toEqual(["10:00-17:00:t18"]);
    expect(view(out)[4]).toEqual(["08:45-17:00:t18"]);
    expect(idsOf(out)).toEqual(["f", "m", "t"]);
  });

  it("edits Monday (first day of the group) alone", () => {
    const p = group();
    const edit = open(p, "m", 0);
    edit.draft.slot.label = "t15";
    const out = save(p, edit);
    expect(view(out)[0]).toEqual(["08:45-17:00:t15"]);
    expect(view(out)[1]).toEqual(["08:45-17:00:t18"]);
    expect(view(out)[4]).toEqual(["08:45-17:00:t18"]);
  });

  it("then a second Tuesday slot: both Tuesday slots kept", () => {
    let p = group();
    const edit = open(p, "t", 1);
    edit.draft.slot.start = { time: "10:00" };
    p = save(p, edit);
    p = add(p);
    expect(view(p)[1]).toEqual(["10:00-17:00:t18", "17:00-19:00:t15"]);
    expect(view(p)[0]).toEqual(["08:45-17:00:t18"]);
    expect(view(p)[4]).toEqual(["08:45-17:00:t18"]);
  });

  it("edits one of two slots of the day without touching the other", () => {
    let p = group();
    p = add(p);
    const edit = open(p, p.days[1].find((s) => s.label === "t15")!.id, 1);
    edit.draft.slot.end = { time: "20:00" };
    const out = save(p, edit);
    expect(view(out)[1]).toEqual(["08:45-17:00:t18", "17:00-20:00:t15"]);
    expect(view(out)[0]).toEqual(["08:45-17:00:t18"]);
  });

  it("applies a day-only edit to days that already have the same slot", () => {
    const p = group();
    const edit = open(p, "t", 1);
    edit.draft.slot.start = { time: "10:00" };
    edit.draft.days = [1, 4];
    const out = save(p, edit);
    expect(view(out)[0]).toEqual(["08:45-17:00:t18"]);
    expect(view(out)[1]).toEqual(["10:00-17:00:t18"]);
    expect(view(out)[4]).toEqual(["10:00-17:00:t18"]);
    expect(out.days.flat()).toHaveLength(3);
  });

  it("applies a day-only edit to a day holding a different, non-overlapping slot: both kept", () => {
    const p = prof({ 1: [slot("08:45", "12:00", "t18", "t")], 3: [slot("14:00", "18:00", "t20", "j")] });
    const edit = open(p, "t", 1);
    edit.draft.days = [1, 3];
    edit.draft.slot.end = { time: "13:00" };
    const out = save(p, edit);
    expect(view(out)[3]).toEqual(["08:45-13:00:t18", "14:00-18:00:t20"]);
    expect(out.days[3].find((s) => s.label === "t20")!.id).toBe("j");
    expect(overlapDay(out)).toBeNull();
  });

  it("a day-only edit onto a day with an overlapping slot is detected, the input is untouched", () => {
    const p = prof({ 1: [slot("08:45", "12:00", "t18", "t")], 3: [slot("10:00", "18:00", "t20", "j")] });
    const before = JSON.stringify(p);
    const edit = open(p, "t", 1);
    edit.draft.days = [1, 3];
    const out = save(p, edit);
    expect(overlapDay(out)).toBe(3);
    expect(JSON.stringify(p)).toBe(before);
    expect(out.days[3]).toHaveLength(2);
  });
});

describe("deleting", () => {
  it("deletes one slot of a day that has two: the other one is kept", () => {
    let p = prof({ 1: [slot("10:00", "17:00", "t18", "a")] });
    p = add(p);
    const edit = open(p, "a");
    const out = save(p, { ...edit, draft: null as never });
    expect(view(out)[1]).toEqual(["17:00-19:00:t15"]);
  });

  it("deletes in day-only mode: only that day loses the slot", () => {
    const p = prof({ 0: [slot("08:45", "17:00", "t18", "m")], 1: [slot("08:45", "17:00", "t18", "t")], 4: [slot("08:45", "17:00", "t18", "f")] });
    const edit = open(p, "t", 1);
    const out = save(p, { ...edit, draft: null as never });
    expect(view(out)[0]).toEqual(["08:45-17:00:t18"]);
    expect(out.days[1]).toEqual([]);
    expect(idsOf(out)).toEqual(["f", "m"]);
  });

  it("deleting a whole group removes it from every day", () => {
    const p = prof({ 0: [slot("08:45", "17:00", "t18", "m")], 1: [slot("08:45", "17:00", "t18", "t"), slot("18:00", "19:00", "t15", "u")] });
    const out = save(p, { ...open(p, "m"), draft: null as never });
    expect(idsOf(out)).toEqual(["u"]);
  });
});

describe("duplicate", () => {
  it("saves the edited original and its copy: both kept", () => {
    const p = prof({ 1: [slot("10:00", "12:00", "t18", "a")] });
    const edit = open(p, "a", 1);
    edit.draft.slot.end = { time: "13:00" };
    const length = 180;
    const copy = freshGroup("t18", [1], { start: "13:00", end: `${13 + length / 60}:00`.padStart(5, "0") });
    // original edit first, then the copy
    const step1 = save(p, edit);
    const out = add(step1, copy);
    expect(view(out)[1]).toEqual(["10:00-13:00:t18", "13:00-16:00:t18"]);
    expect(out.days[1].find((s) => s.id === "a")).toBeTruthy();
  });

  it("two identical slots on one day stay two slots (no merge, no loss)", () => {
    const p = prof({ 1: [slot("10:00", "12:00", "t18", "a"), slot("10:00", "12:00", "t18", "b")] });
    const out = applyEdit(p, all, minutes, { openId: "zzz", rest: null, draft: null });
    expect(idsOf(out)).toEqual(["a", "b"]);
  });
});

describe("overlaps", () => {
  it("are found and reported without altering anything", () => {
    const p = prof({ 1: [slot("10:00", "17:00", "t18", "a")] });
    const out = add(p, freshGroup("t15", [1], { start: "16:00", end: "19:00" }));
    expect(overlapDay(out)).toBe(1);
    expect(p.days[1]).toHaveLength(1);
  });

  it("see a long slot that swallows two short ones", () => {
    const list = [slot("08:00", "20:00"), slot("09:00", "10:00"), slot("11:00", "12:00")];
    expect(findOverlap(list)).not.toBeNull();
    expect(findOverlap([slot("08:00", "10:00"), slot("10:00", "12:00")])).toBeNull();
  });

  it("allow 24:00 next to 00:00 of the next day", () => {
    const p = prof({ 1: [slot("22:00", "24:00", "t15", "a")], 2: [slot("00:00", "06:00", "t18", "b")] });
    expect(overlapDay(p)).toBeNull();
    const out = add(p, freshGroup("t20", [2], { start: "06:00", end: "08:00" }));
    expect(view(out)[1]).toEqual(["22:00-24:00:t15"]);
    expect(view(out)[2]).toEqual(["00:00-06:00:t18", "06:00-08:00:t20"]);
  });
});

describe("sun, one-shot and mixed slots", () => {
  const sunSlot = (id: string): Slot => ({ id, start: { sun: "sunset", offset: 30 }, end: null, conditions: [], label: "on" });

  it("groups sun slots with time slots without mixing them", () => {
    const p = prof({ 0: [sunSlot("a"), slot("08:00", "10:00", "t18", "b")], 1: [sunSlot("c")] });
    const g = groups(p);
    expect(g).toHaveLength(2);
    expect(g.find((x) => "sun" in x.slot.start)!.days).toEqual([0, 1]);
    const out = save(p, { ...open(p, "b", 0), draft: null as never });
    expect(idsOf(out)).toEqual(["a", "c"]);
  });

  it("keeps sun slots when a time slot is added next to them", () => {
    const p = prof({ 0: [sunSlot("a")] });
    const out = add(p, freshGroup("t18", [0], { start: "18:00", end: "20:00" }));
    expect(out.days[0].map((s) => s.id)).toContain("a");
    expect(out.days[0]).toHaveLength(2);
  });

  it("keeps a one-shot and a ranged slot on the same day", () => {
    const p = prof({ 1: [slot("12:00", null, "on", "o"), slot("10:00", "17:00", "t18", "a")] });
    expect(findOverlap(p.days[1])).toBeNull();
    const out = add(p);
    expect(out.days[1].map((s) => s.id).sort()).toContain("o");
    expect(out.days[1]).toHaveLength(3);
    const del = save(out, { ...open(out, "o", 1), draft: null as never });
    expect(del.days[1]).toHaveLength(2);
  });
});

describe("new slot on all days", () => {
  it("drops busy days and keeps the free ones", () => {
    const p = prof({ 1: [slot("08:30", "10:00", "t18", "a")], 4: [slot("07:00", "08:30", "t18", "b")] });
    const fresh = freshGroup("t15", [], { start: "08:00", end: "09:00" });
    const { free, busy } = splitBusyDays(p, all, minutes, fresh.slot);
    expect(busy).toEqual([1, 4]);
    expect(free).toEqual([0, 2, 3, 5, 6]);
    const out = add(p, { ...fresh, days: free });
    expect(out.days[1]).toHaveLength(1);
    expect(out.days[4]).toHaveLength(1);
    expect(out.days[0]).toHaveLength(1);
    expect(overlapDay(out)).toBeNull();
  });
});

describe("start of a new slot", () => {
  it("starts after the last slot of the day", () => {
    expect(nextTimes([slot("10:00", "17:00")], minutes)).toEqual({ start: "17:00", end: "18:00" });
    expect(nextTimes([], minutes)).toEqual({ start: "08:00", end: "09:00" });
    expect(nextTimes([slot("06:00", "08:00"), slot("10:00", "17:00")], minutes).start).toBe("17:00");
    expect(nextTimes([slot("22:00", "24:00")], minutes)).toEqual({ start: "23:00", end: "24:00" });
  });
});
