// Edits of a whole profile: opening a group of days, saving, deleting, adding, copies of one slot and conflicts.
import { describe, expect, it } from "vitest";
import type { SlotGroup } from "../actions";
import { groupSlots } from "../actions";
import {
  applyEdit, compareOrigin, dayView, findGroup, freshGroup, groupId, keptRest, nextTimes, overlapPair, splitBusyDays,
} from "../edits";
import { findOverlap } from "../slots";
import type { Profile, Slot } from "../types";
import { at as minutes, show, sl } from "./helpers/edits";

const all = () => true;

let n = 0;
const slot = (start: string, end: string | null, label = "t18", id = `s${++n}`): Slot => sl(id, start, end, { label });
const prof = (days: Record<number, Slot[]>): Profile => ({
  id: "p", name: "P", days: [0, 1, 2, 3, 4, 5, 6].map((d) => days[d] ?? []),
});
const view = (p: Profile) => p.days.map(show);
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
const remove = (p: Profile, edit: ReturnType<typeof open>) => save(p, { ...edit, draft: null as never });
const add = (p: Profile, g = freshGroup("t15", [1], { start: "17:00", end: "19:00" })) =>
  applyEdit(p, all, minutes, { openId: null, rest: null, draft: g });
/** Monday, Tuesday and Friday share the 08:45-17:00 slot (ids m, t, f). */
const threeDays = () => prof({ 0: [slot("08:45", "17:00", "t18", "m")], 1: [slot("08:45", "17:00", "t18", "t")], 4: [slot("08:45", "17:00", "t18", "f")] });

describe("a second slot on the same day", () => {
  it("keeps the first slot when a non-overlapping one is added", () => {
    const p = prof({ 1: [slot("10:00", "17:00", "t18", "a")] });
    const out = add(p);
    expect(view(out)[1]).toEqual(["10:00-17:00:t18", "17:00-19:00:t15"]);
    expect(out.days[1].find((s) => s.label === "t18")!.id).toBe("a");
  });

  it.each([[0, 1, 2], [2, 1, 0], [1, 2, 0], [1, 0, 2]])("keeps three slots of one day added in the order of case %#", (...order) => {
    const parts = [["06:00", "08:00", "a"], ["10:00", "12:00", "b"], ["18:00", "22:00", "c"]];
    let p = prof({});
    for (const i of order) {
      const [s, e, l] = parts[i];
      p = add(p, freshGroup(l, [2], { start: s, end: e }));
    }
    expect(view(p)[2]).toEqual(["06:00-08:00:a", "10:00-12:00:b", "18:00-22:00:c"]);
    expect(p.days[2]).toHaveLength(3);
  });
});

describe("one day of a group", () => {
  it("edits Tuesday alone: Monday and Friday unchanged", () => {
    const p = threeDays();
    const edit = open(p, "t", 1);
    edit.draft.slot.start = { time: "10:00" };
    const out = save(p, edit);
    expect(view(out)[0]).toEqual(["08:45-17:00:t18"]);
    expect(view(out)[1]).toEqual(["10:00-17:00:t18"]);
    expect(view(out)[4]).toEqual(["08:45-17:00:t18"]);
    expect(idsOf(out)).toEqual(["f", "m", "t"]);
  });

  it("edits Monday (first day of the group) alone", () => {
    const p = threeDays();
    const edit = open(p, "m", 0);
    edit.draft.slot.label = "t15";
    const out = save(p, edit);
    expect(view(out)[0]).toEqual(["08:45-17:00:t15"]);
    expect(view(out)[1]).toEqual(["08:45-17:00:t18"]);
    expect(view(out)[4]).toEqual(["08:45-17:00:t18"]);
  });

  it("then a second Tuesday slot: both Tuesday slots kept", () => {
    let p = threeDays();
    const edit = open(p, "t", 1);
    edit.draft.slot.start = { time: "10:00" };
    p = save(p, edit);
    p = add(p);
    expect(view(p)[1]).toEqual(["10:00-17:00:t18", "17:00-19:00:t15"]);
    expect(view(p)[0]).toEqual(["08:45-17:00:t18"]);
    expect(view(p)[4]).toEqual(["08:45-17:00:t18"]);
  });

  it("edits one of two slots of the day without touching the other", () => {
    const p = add(threeDays());
    const edit = open(p, p.days[1].find((s) => s.label === "t15")!.id, 1);
    edit.draft.slot.end = { time: "20:00" };
    const out = save(p, edit);
    expect(view(out)[1]).toEqual(["08:45-17:00:t18", "17:00-20:00:t15"]);
    expect(view(out)[0]).toEqual(["08:45-17:00:t18"]);
  });

  it("applies a day-only edit to days that already have the same slot", () => {
    const p = threeDays();
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
    expect(overlapPair(out)).toBeNull();
  });

  it("a day-only edit onto a day with an overlapping slot is detected, the input is untouched", () => {
    const p = prof({ 1: [slot("08:45", "12:00", "t18", "t")], 3: [slot("10:00", "18:00", "t20", "j")] });
    const before = JSON.stringify(p);
    const edit = open(p, "t", 1);
    edit.draft.days = [1, 3];
    const out = save(p, edit);
    expect(overlapPair(out)?.day).toBe(3);
    expect(JSON.stringify(p)).toBe(before);
    expect(out.days[3]).toHaveLength(2);
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

describe("deleting", () => {
  it("deletes one slot of a day that has two: the other one is kept", () => {
    const p = add(prof({ 1: [slot("10:00", "17:00", "t18", "a")] }));
    expect(view(remove(p, open(p, "a")))[1]).toEqual(["17:00-19:00:t15"]);
  });

  it("deletes in day-only mode: only that day loses the slot", () => {
    const p = threeDays();
    const out = remove(p, open(p, "t", 1));
    expect(view(out)[0]).toEqual(["08:45-17:00:t18"]);
    expect(out.days[1]).toEqual([]);
    expect(idsOf(out)).toEqual(["f", "m"]);
  });

  it("deleting a whole group removes it from every day", () => {
    const p = prof({ 0: [slot("08:45", "17:00", "t18", "m")], 1: [slot("08:45", "17:00", "t18", "t"), slot("18:00", "19:00", "t15", "u")] });
    expect(idsOf(remove(p, open(p, "m")))).toEqual(["u"]);
  });

  it("an edit of a group that no longer exists changes nothing, even with two identical slots on a day", () => {
    const p = prof({ 1: [slot("10:00", "12:00", "t18", "a"), slot("10:00", "12:00", "t18", "b")] });
    const out = applyEdit(p, all, minutes, { openId: "zzz", rest: null, draft: null });
    expect(idsOf(out)).toEqual(["a", "b"]);
  });
});

describe("duplicate", () => {
  it("saves the edited original and its copy: both kept", () => {
    const p = prof({ 1: [slot("10:00", "12:00", "t18", "a")] });
    const edit = open(p, "a", 1);
    edit.draft.slot.end = { time: "13:00" };
    const copy = freshGroup("t18", [1], { start: "13:00", end: "16:00" });
    // original edit first, then the copy
    const out = add(save(p, edit), copy);
    expect(view(out)[1]).toEqual(["10:00-13:00:t18", "13:00-16:00:t18"]);
    expect(out.days[1].find((s) => s.id === "a")).toBeTruthy();
  });
});

describe("overlaps", () => {
  it("are found and reported without altering anything", () => {
    const p = prof({ 1: [slot("10:00", "17:00", "t18", "a")] });
    const out = add(p, freshGroup("t15", [1], { start: "16:00", end: "19:00" }));
    expect(overlapPair(out)?.day).toBe(1);
    expect(p.days[1]).toHaveLength(1);
  });

  it("allow 24:00 next to 00:00 of the next day", () => {
    const p = prof({ 1: [slot("22:00", "24:00", "t15", "a")], 2: [slot("00:00", "06:00", "t18", "b")] });
    expect(overlapPair(p)).toBeNull();
    const out = add(p, freshGroup("t20", [2], { start: "06:00", end: "08:00" }));
    expect(view(out)[1]).toEqual(["22:00-24:00:t15"]);
    expect(view(out)[2]).toEqual(["00:00-06:00:t18", "06:00-08:00:t20"]);
  });
});

describe("sun, one-shot and mixed slots", () => {
  const sunSlot = (id: string): Slot => sl(id, { sun: "sunset", offset: 30 }, null, { label: "on" });

  it("groups sun slots with time slots without mixing them", () => {
    const p = prof({ 0: [sunSlot("a"), slot("08:00", "10:00", "t18", "b")], 1: [sunSlot("c")] });
    const g = groups(p);
    expect(g).toHaveLength(2);
    expect(g.find((x) => "sun" in x.slot.start)!.days).toEqual([0, 1]);
    expect(idsOf(remove(p, open(p, "b", 0)))).toEqual(["a", "c"]);
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
    expect(remove(out, open(out, "o", 1)).days[1]).toHaveLength(2);
  });
});

describe("new slot on all days", () => {
  it("drops busy days and keeps the free ones", () => {
    const p = prof({ 1: [slot("08:30", "10:00", "t18", "a")], 4: [slot("07:00", "08:30", "t18", "b")] });
    const fresh = freshGroup("t15", [], { start: "08:00", end: "09:00" });
    const { free, busy } = splitBusyDays(p, all, fresh.slot);
    expect(busy).toEqual([1, 4]);
    expect(free).toEqual([0, 2, 3, 5, 6]);
    const out = add(p, { ...fresh, days: free });
    expect(out.days[1]).toHaveLength(1);
    expect(out.days[4]).toHaveLength(1);
    expect(out.days[0]).toHaveLength(1);
    expect(overlapPair(out)).toBeNull();
  });

  it("only the slots the screen shows can make a day busy", () => {
    const p = prof({ 0: [sl("a", "08:00", "10:00", { label: "hidden" })], 1: [sl("b", "08:00", "10:00")] });
    const shown = (s: Slot) => s.label !== "hidden";
    expect(splitBusyDays(p, shown, sl("n", "09:00", "11:00"), [0, 1])).toEqual({ free: [0], busy: [1] });
  });
});

describe("a fresh group", () => {
  it("starts at 8:00 with no end by default, with no condition, flagged fresh, with no id yet per day", () => {
    const g = freshGroup("t15", [2, 3]);
    expect(g.slot.start).toEqual({ time: "08:00" });
    expect(g.slot.end).toBeUndefined();
    expect("end" in g.slot).toBe(false);
    expect(freshGroup("t", [0], { start: "10:00", end: "11:30" }).slot.end).toEqual({ time: "11:30" });
    expect(freshGroup("t", [0], { start: "10:00" }).slot.end).toBeUndefined();
    expect(g.slot.conditions).toEqual([]);
    expect(g.fresh).toBe(true);
    expect(g.days).toEqual([2, 3]);
    expect(g.ids).toEqual({});
  });
});

describe("start of a new slot", () => {
  it.each([
    [[slot("10:00", "17:00")], { start: "17:00", end: "18:00" }],
    [[], { start: "08:00", end: "09:00" }],
    [[slot("06:00", "08:00"), slot("10:00", "17:00")], { start: "17:00", end: "18:00" }],
    [[slot("22:00", "24:00")], { start: "23:00", end: "24:00" }],
  ])("starts after the last slot of the day (%#)", (day, expected) => {
    expect(nextTimes(day, minutes)).toEqual(expected);
  });
});

describe("a change made elsewhere while editing", () => {
  it("keeps both: the edit is applied on top of the fresh profile", () => {
    const old = prof({ 1: [slot("10:00", "17:00", "t18", "a")], 2: [slot("08:00", "09:00", "t18", "b")] });
    const edit = open(old, "a", 1);
    edit.draft.slot.end = { time: "18:00" };
    // meanwhile, someone changed Wednesday and added a slot on Friday
    const fresh = prof({ 1: [slot("10:00", "17:00", "t18", "a")], 2: [slot("08:00", "11:00", "t20", "b")], 4: [slot("06:00", "07:00", "t18", "z")] });
    const out = save(fresh, edit);
    expect(view(out)[1]).toEqual(["10:00-18:00:t18"]);
    expect(view(out)[2]).toEqual(["08:00-11:00:t20"]);
    expect(view(out)[4]).toEqual(["06:00-07:00:t18"]);
  });

  it("tells a real conflict from an unrelated change, on real profiles", () => {
    const old = prof({ 1: [slot("10:00", "17:00", "t18", "a")], 2: [slot("10:00", "17:00", "t18", "b")] });
    const origin = findGroup(old, all, minutes, "a")!;
    expect(compareOrigin(findGroup(old, all, minutes, "a"), origin)).toBe("same");
    const other = prof({ 1: [slot("10:00", "17:00", "t18", "a")], 2: [slot("11:00", "17:00", "t18", "b")] });
    expect(compareOrigin(findGroup(other, all, minutes, "a"), origin)).toBe("days");
    const edited = prof({ 1: [slot("09:00", "17:00", "t18", "a")] });
    expect(compareOrigin(findGroup(edited, all, minutes, "a"), origin)).toBe("changed");
    expect(compareOrigin(findGroup(prof({}), all, minutes, "a"), origin)).toBe("gone");
  });

  const grp = (days: number[], ids: Record<number, string>, extra: Partial<Slot> = {}): SlotGroup => ({ slot: sl("g", "08:00", "09:00", extra), days, ids });
  const origin = grp([0, 1], { 0: "a", 1: "b" });
  it.each([
    ["gone", null],
    ["same", grp([0, 1], { 0: "a", 1: "b" })],
    ["days", grp([0, 1, 2], { 0: "a", 1: "b", 2: "c" })],
    ["days", grp([0, 2], { 0: "a", 2: "b" })],
    ["days", grp([0, 1], { 0: "a", 1: "z" })], // same days, a slot replaced
    ["days", grp([0, 1, 2], { 0: "a", 1: "b" })], // a new day, no id yet
    ["changed", grp([0, 1], { 0: "a", 1: "b" }, { label: "other" })],
  ])("the opened group is %s when it now looks like case %#", (expected, now) => {
    expect(compareOrigin(now, origin)).toBe(expected);
  });
});
