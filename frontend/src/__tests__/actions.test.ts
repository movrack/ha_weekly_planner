// Equivalent mutants, ignored: `minutes > 0` vs `>= 0` in offsetWord (an offset of 0 is never written), and the
// `next >= DAY` test in shiftSpec (24:00 is also what the fallback formula writes for 1440).
import { describe, expect, it } from "vitest";
import { ALL_DAYS, daysText, groupSlots, nb, shiftSpec, slotKey, specText, stable, writeGroups } from "../actions";
import type { Profile, Slot } from "../types";

const slot = (id: string, label: string, start = "08:00", extra: Partial<Slot> = {}): Slot => ({
  id, start: { time: start }, end: { time: "17:00" }, conditions: [], label, ...extra,
});
const profile = (days: Record<number, Slot[]>): Profile => ({ id: "p", name: "P", days: [0, 1, 2, 3, 4, 5, 6].map((d) => days[d] ?? []) });
const minutes = (s: { time?: string }) => Number((s.time ?? "0:0").split(":")[0]) * 60;
const all = () => true;
const plain = (s: string) => s.replace(/[  ]/g, " ");
const short = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

describe("time of a slot", () => {
  it.each([
    [{ time: "24:00" }, "24 h"], [{ time: "23:45" }, "23 h 45"], [{ time: "00:00" }, "0 h"], [{ time: "08:45" }, "8 h 45"],
  ])("writes %j as %s, with non-breaking spaces", (spec, text) => {
    expect(specText("fr", spec)).toBe(nb(text));
    expect(specText("fr", spec)).not.toContain(" ");
  });

  it("adds the random window after the time, also after 24 h", () => {
    expect(specText("fr", { time: "08:00", random_minutes: 10 })).toBe(nb("8 h · Dans les 10 prochaines minutes"));
    expect(specText("fr", { time: "24:00", random_minutes: 10 })).toBe(nb("24 h · Dans les 10 prochaines minutes"));
  });

  it.each([
    [undefined, "Coucher", "sunset"], [30, "Coucher +30 min", "sunset"], [-45, "Coucher −45 min", "sunset"],
    [90, "Lever +1 h 30", "sunrise"], [-120, "Lever −2 h", "sunrise"], [65, "Lever +1 h 05", "sunrise"],
  ])("writes a sun time with an offset of %s as %s", (offset, text, sun) => {
    expect(specText("fr", { sun: sun as "sunset" | "sunrise", ...(offset === undefined ? {} : { offset }) })).toBe(nb(text));
  });

  it.each([[30, /\+30 min$/], [-45, /−45 min$/], [60, /\+1 h$/], [90, /\+1 h 30$/], [-125, /−2 h 05$/]])(
    "writes a sun offset of %i in English with its sign, as minutes, whole hours or hours and minutes", (offset, ending) => {
      expect(plain(specText("en", { sun: "sunset", offset }))).toMatch(ending);
    });

  it.each([
    [{ time: "23:45", random_minutes: 5 }, 15, { time: "24:00", random_minutes: 5 }], // keeps the rest of the spec
    [{ time: "23:45" }, 60, { time: "24:00" }],
    [{ time: "23:55" }, 15, { time: "24:00" }],
    [{ time: "09:00" }, -15, { time: "08:45" }],
    [{ time: "08:45" }, 15, { time: "09:00" }],
    [{ time: "08:00" }, 15, { time: "08:15" }],
    [{ time: "00:07" }, 0, { time: "00:05" }], // the 5 minute step
    [{ time: "00:00" }, -15, { time: "00:00" }],
    [{ time: "00:05" }, -15, { time: "00:00" }],
    [{ sun: "sunset", offset: 0 }, 15, { sun: "sunset", offset: 15 }],
    [{ sun: "sunrise" }, 15, { sun: "sunrise", offset: 15 }],
    [{ sun: "sunset", offset: 240 }, 15, { sun: "sunset", offset: 240 }], // 4 hours either way
    [{ sun: "sunset", offset: -240 }, -15, { sun: "sunset", offset: -240 }],
    [{ sun: "sunset", offset: 235 }, 15, { sun: "sunset", offset: 240 }],
    [{ sun: "sunrise", offset: -235 }, -15, { sun: "sunrise", offset: -240 }],
  ] as [any, number, any][])("moves %j by %i minutes to %j", (spec, delta, expected) => {
    expect(shiftSpec(spec, delta)).toEqual(expected);
  });
});

describe("days", () => {
  it.each([
    [[0, 1, 2, 3, 4], "Lun–Ven"], [[4, 3, 2, 1, 0], "Lun–Ven"], [[5, 6], "Week-end"], [[6, 5], "Week-end"],
    [[0, 1, 4], nb("Lun Mar Ven")], [[4, 0, 2], nb("Lun Mer Ven")], [[0, 1, 2, 3, 4, 5], nb("Lun Mar Mer Jeu Ven Sam")],
  ])("writes the days %j as %s, sorted whatever the order given", (days, text) => {
    expect(daysText("fr", short, days)).toBe(text);
  });

  it("says every day for the seven days, in any order, and does not change its input", () => {
    const days = [6, 5, 4, 3, 2, 1, 0];
    expect(daysText("fr", short, days)).toBe("Tous les jours");
    expect(daysText("en", short, ALL_DAYS)).toBe("Every day");
    expect(days).toEqual([6, 5, 4, 3, 2, 1, 0]);
  });
});

describe("stable JSON", () => {
  it("sorts the keys at every level and keeps the order of lists", () => {
    expect(stable({ b: 1, a: { d: [2, 1], c: null } })).toBe('{"a":{"c":null,"d":[2,1]},"b":1}');
    expect(stable([3, "x", { z: 1, y: 2 }])).toBe('[3,"x",{"y":2,"z":1}]');
  });

  it("writes plain values like JSON", () => {
    expect(stable(5)).toBe("5");
    expect(stable("a")).toBe('"a"');
    expect(stable(null)).toBe("null");
    expect(stable(true)).toBe("true");
    expect(stable([])).toBe("[]");
    expect(stable({})).toBe("{}");
  });
});

describe("content key of a slot", () => {
  it("an absent condition list, end and colour read as an empty list, no end and no colour", () => {
    const bare = { id: "a", start: { time: "08:00" }, label: "x" } as Slot;
    const explicit = { id: "b", start: { time: "08:00" }, label: "x", conditions: [], end: null, color: null } as unknown as Slot;
    expect(slotKey(bare)).toBe(slotKey(explicit));
  });

  it("differs by conditions, end and colour, not by id or by the order of devices", () => {
    const base = slot("a", "x", "08:00", { entities: ["b", "a"] });
    expect(slotKey(base)).toBe(slotKey({ ...base, id: "z", entities: ["a", "b"] }));
    expect(slotKey(base)).not.toBe(slotKey({ ...base, conditions: [{ entity_id: "sensor.x", state: "on" } as never] }));
    expect(slotKey(base)).not.toBe(slotKey({ ...base, end: { time: "18:00" } }));
    expect(slotKey(base)).not.toBe(slotKey({ ...base, color: "red" }));
    expect(slotKey(base)).not.toBe(slotKey({ ...base, end: null }));
  });
});

describe("grouping order and duplicates", () => {
  it("sorts the groups by start, then by first day", () => {
    const p = profile({ 1: [slot("y", "y", "10:00")], 2: [slot("e", "e", "08:00")], 4: [slot("x", "x", "10:00")], 3: [slot("w", "w", "10:00")] });
    const labels = groupSlots(p, all, minutes as never).map((g) => `${g.slot.label}${g.days}`);
    expect(labels).toEqual(["e2", "y1", "w3", "x4"]);
  });

  it("sorts by start even when a later day starts earlier", () => {
    const p = profile({ 0: [slot("a", "a", "12:00")], 1: [slot("b", "b", "06:00")] });
    expect(groupSlots(p, all, minutes as never).map((g) => g.slot.label)).toEqual(["b", "a"]);
  });

  it("identical slots of the same day stay separate rows, each with its own id", () => {
    const p = profile({ 0: [slot("a", "x"), slot("b", "x"), slot("c", "x")], 1: [slot("d", "x")] });
    const groups = groupSlots(p, all, minutes as never);
    expect(groups).toHaveLength(3);
    expect(groups.map((g) => g.days)).toEqual([[0, 1], [0], [0]]);
    expect(groups.map((g) => g.ids)).toEqual([{ 0: "a", 1: "d" }, { 0: "b" }, { 0: "c" }]);
  });
});

describe("grouping the same slot across days", () => {
  it("merges identical slots and keeps their ids", () => {
    const g = groupSlots(profile([[slot("a", "t18")], [slot("b", "t18")], [slot("c", "t19")]]), all, minutes as never);
    expect(g).toHaveLength(2);
    expect(g[0].days).toEqual([0, 1]);
    expect(g[0].ids).toEqual({ 0: "a", 1: "b" });
  });

  it("does not merge slots that only differ by their label", () => {
    const g = groupSlots(profile([[slot("a", "t18")], [slot("b", "t19")]]), all, minutes as never);
    expect(g).toHaveLength(2);
  });

  it("splits back to one slot per day, new days get new ids", () => {
    const p = profile([[slot("a", "t18")], [slot("b", "t18")]]);
    const [g] = groupSlots(p, all, minutes as never);
    g.days = [0, 2, 4];
    const out = writeGroups(p, [g], all, minutes as never);
    expect(out.days[0][0].id).toBe("a");
    expect(out.days[1]).toEqual([]);
    expect(out.days[2][0].id).not.toBe("a");
    expect(out.days[4]).toHaveLength(1);
  });

  it("leaves slots rejected by the filter alone", () => {
    const p = profile([[slot("a", "t18"), slot("z", "other", "10:00")]]);
    const only = (s: Slot) => s.label === "t18";
    const groups = groupSlots(p, only, minutes as never);
    const out = writeGroups(p, groups, only, minutes as never);
    expect(out.days[0].map((s) => s.id).sort()).toEqual(["a", "z"]);
  });
});
