// Properties of the pure logic of actions.ts that the first tests left open (mutation testing).
// Equivalent mutants, ignored: `minutes > 0` vs `>= 0` in offsetWord (an offset of 0 is never written), and the
// `next >= DAY` test in shiftSpec (24:00 is also what the fallback formula writes for 1440).
import { describe, expect, it } from "vitest";
import { ALL_DAYS, daysText, groupSlots, nb, shiftSpec, slotKey, specText, stable } from "../actions";
import type { Profile, Slot } from "../types";

const slot = (id: string, label: string, start = "08:00", extra: Partial<Slot> = {}): Slot => ({
  id, start: { time: start }, end: { time: "17:00" }, conditions: [], label, ...extra,
});
const profile = (days: Record<number, Slot[]>): Profile => ({ id: "p", name: "P", days: [0, 1, 2, 3, 4, 5, 6].map((d) => days[d] ?? []) });
const minutes = (s: { time?: string }) => Number((s.time ?? "0:0").split(":")[0]) * 60;
const all = () => true;

describe("time of a slot", () => {
  it("writes the end of the day as 24 h, and 23:45 as a clock time", () => {
    expect(specText("fr", { time: "24:00" })).toBe(nb("24 h"));
    expect(specText("fr", { time: "23:45" })).toBe(nb("23 h 45"));
    expect(specText("fr", { time: "00:00" })).toBe(nb("0 h"));
  });

  it("adds the random window after the time, also after 24 h", () => {
    expect(specText("fr", { time: "08:00", random_minutes: 10 })).toBe(nb("8 h · Dans les 10 prochaines minutes"));
    expect(specText("fr", { time: "24:00", random_minutes: 10 })).toBe(nb("24 h · Dans les 10 prochaines minutes"));
  });

  it("writes a sun time with its offset, sign and unit", () => {
    expect(specText("fr", { sun: "sunset" })).toBe(nb("Coucher"));
    expect(specText("fr", { sun: "sunset", offset: 30 })).toBe(nb("Coucher +30 min"));
    expect(specText("fr", { sun: "sunset", offset: -45 })).toBe(nb("Coucher −45 min"));
    expect(specText("fr", { sun: "sunrise", offset: 90 })).toBe(nb("Lever +1 h 30"));
    expect(specText("fr", { sun: "sunrise", offset: -120 })).toBe(nb("Lever −2 h"));
    expect(specText("fr", { sun: "sunrise", offset: 65 })).toBe(nb("Lever +1 h 05"));
  });

  it("moves a time on the 5 minute step, keeping the rest of the spec", () => {
    expect(shiftSpec({ time: "23:45", random_minutes: 5 }, 15)).toEqual({ time: "24:00", random_minutes: 5 });
    expect(shiftSpec({ time: "23:45" }, 60)).toEqual({ time: "24:00" });
    expect(shiftSpec({ time: "09:00" }, -15)).toEqual({ time: "08:45" });
    expect(shiftSpec({ time: "00:07" }, 0)).toEqual({ time: "00:05" });
  });

  it("limits a sun offset to 4 hours either way", () => {
    expect(shiftSpec({ sun: "sunset", offset: 240 }, 15)).toEqual({ sun: "sunset", offset: 240 });
    expect(shiftSpec({ sun: "sunset", offset: -240 }, -15)).toEqual({ sun: "sunset", offset: -240 });
  });
});

describe("days", () => {
  const short = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  it("sorts the days before writing them, whatever the order given", () => {
    expect(daysText("fr", short, [4, 3, 2, 1, 0])).toBe("Lun–Ven");
    expect(daysText("fr", short, [6, 5])).toBe("Week-end");
    expect(daysText("fr", short, [4, 0, 2])).toBe(nb("Lun Mer Ven"));
  });

  it("says every day for the seven days, in any order, and does not change its input", () => {
    const days = [6, 5, 4, 3, 2, 1, 0];
    expect(daysText("fr", short, days)).toBe("Tous les jours");
    expect(daysText("en", short, ALL_DAYS)).toBe("Every day");
    expect(days).toEqual([6, 5, 4, 3, 2, 1, 0]);
    expect(daysText("fr", short, [0, 1, 2, 3, 4, 5])).toBe(nb("Lun Mar Mer Jeu Ven Sam"));
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
