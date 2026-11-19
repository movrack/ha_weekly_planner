import { describe, expect, it } from "vitest";
import { fixedInterval, normaliseEntities, sameEntities } from "../slots";
import { sl } from "./helpers/edits";

describe("fixedInterval", () => {
  it("is null for a sun start or end, or no end", () => {
    expect(fixedInterval(sl("a", { sun: "sunset" }, "10:00"))).toBeNull();
    expect(fixedInterval(sl("a", "10:00", { sun: "sunset" }))).toBeNull();
    expect(fixedInterval({ id: "a", start: { time: "10:00" } } as any)).toBeNull();
  });
  it("runs to midnight for an end not after the start", () => {
    expect(fixedInterval(sl("a", "22:00", "06:00"))).toEqual([1320, 1440]);
    expect(fixedInterval(sl("a", "10:00", "10:00"))).toEqual([600, 1440]);
    expect(fixedInterval(sl("a", "10:00", "12:00"))).toEqual([600, 720]);
  });
});

describe("device lists of a slot", () => {
  it("sameEntities ignores the order but not the content", () => {
    expect(sameEntities({ entities: ["b", "a"] }, { entities: ["a", "b"] })).toBe(true);
    expect(sameEntities({ entities: ["a", "b"] }, { entities: ["a", "c"] })).toBe(false);
  });
  it("normaliseEntities: an empty selection of an empty program is an empty list", () => {
    expect(normaliseEntities([], [])).toEqual([]);
  });
});
