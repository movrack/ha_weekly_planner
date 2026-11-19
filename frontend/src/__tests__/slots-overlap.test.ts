import { describe, expect, it } from "vitest";
import { findOverlap } from "../slots";
import { sl } from "./helpers/edits";

describe("overlaps", () => {
  it("see a long slot that swallows two short ones", () => {
    const list = [sl("a", "08:00", "20:00"), sl("b", "09:00", "10:00"), sl("c", "11:00", "12:00")];
    expect(findOverlap(list)).not.toBeNull();
    expect(findOverlap([sl("a", "08:00", "10:00"), sl("b", "10:00", "12:00")])).toBeNull();
  });
});

describe("overlaps: which pair is reported", () => {
  const f = (id: string, a: string, b: string, entities?: string[]) => sl(id, a, b, { entities });
  it("sorts the slots by start first", () => {
    const c = f("c", "14:00", "15:00"), a = f("a", "09:00", "11:00"), b = f("b", "10:00", "12:00");
    expect(findOverlap([c, b, a])).toEqual([a, b]);
  });
  it("per device: the earlier slot reaching furthest is the one reported", () => {
    const a = f("a", "09:00", "10:00", ["x"]), b = f("b", "09:15", "12:00", ["y"]), c = f("c", "09:30", "11:00", ["x", "y"]);
    expect(findOverlap([a, b, c])).toEqual([b, c]);
    const a2 = f("a2", "09:00", "12:00", ["x"]), b2 = f("b2", "09:15", "12:00", ["y"]), c2 = f("c2", "10:00", "11:00", ["x", "y"]);
    expect(findOverlap([a2, b2, c2])).toEqual([a2, c2]);
    const a3 = f("a3", "09:00", "12:00", ["x"]), b3 = f("b3", "09:15", "10:00", ["y"]), c3 = f("c3", "09:30", "11:00", ["x", "y"]);
    expect(findOverlap([a3, b3, c3])).toEqual([a3, c3]);
  });
  it("per device: no collision without a common device", () => {
    expect(findOverlap([f("a", "09:00", "11:00", ["x"]), f("b", "10:00", "12:00", ["y"])])).toBeNull();
  });
});
