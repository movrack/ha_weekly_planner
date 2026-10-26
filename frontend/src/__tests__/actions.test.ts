import { describe, expect, it } from "vitest";
import { daysText, groupSlots, nb, shiftSpec, specText, writeGroups } from "../actions";
import type { Profile, Slot } from "../types";

const slot = (id: string, label: string, start = "08:45"): Slot => ({
  id, start: { time: start }, end: { time: "17:00" }, conditions: [], label,
});

const profile = (days: Slot[][]): Profile => ({ id: "p", name: "P", days: [...days, ...Array(7 - days.length).fill([])] });
const minutes = (s: { time?: string }) => Number((s.time ?? "0:0").split(":")[0]) * 60;
const all = () => true;

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

describe("texts", () => {
  it("shifts a time by 15 minutes or a sun offset", () => {
    expect(shiftSpec({ time: "08:45" }, 15)).toEqual({ time: "09:00" });
    expect(shiftSpec({ time: "00:00" }, -15)).toEqual({ time: "00:00" });
    expect(shiftSpec({ sun: "sunset", offset: 0 }, 15)).toEqual({ sun: "sunset", offset: 15 });
  });

  it("uses non-breaking spaces in times", () => {
    expect(specText("fr", { time: "08:45" })).toBe(nb("8 h 45"));
    expect(specText("fr", { time: "08:45" })).not.toContain(" ");
  });

  it("writes the days short", () => {
    const short = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    expect(daysText("fr", short, [0, 1, 2, 3, 4])).toBe("Lun–Ven");
    expect(daysText("fr", short, [5, 6])).toBe("Week-end");
    expect(daysText("fr", short, [0, 1, 4])).toBe(nb("Lun Mar Ven"));
  });
});
