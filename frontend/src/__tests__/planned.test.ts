import { describe, expect, it } from "vitest";
import { buildPlanned } from "../planned";

const Y = "yellow", O = "orange", R = "red", B = "blue";
const dflt = { color: B, value: 15, active: true };

describe("planned staircase", () => {
  it("contiguous slots then back to the default (the owner's example)", () => {
    const p = buildPlanned([
      { start: 525, end: 720, color: Y, value: 18 },
      { start: 720, end: 840, color: O, value: 19 },
      { start: 840, end: 1020, color: R, value: 20 },
    ], dflt, 1440);
    expect(p.steps).toEqual([
      { from: 0, to: 525, value: 15, color: B },
      { from: 525, to: 720, value: 18, color: Y },
      { from: 720, to: 840, value: 19, color: O },
      { from: 840, to: 1020, value: 20, color: R },
      { from: 1020, to: 1440, value: 15, color: B },
    ]);
    expect(p.risers.map((r) => [r.m, r.from, r.to, r.color])).toEqual([
      [525, 15, 18, Y], [720, 18, 19, O], [840, 19, 20, R], [1020, 20, 15, B],
    ]);
    expect(p.returns).toEqual([1020]);
  });

  it("a gap between two slots goes back to the default and returns there", () => {
    const p = buildPlanned([
      { start: 480, end: 600, color: Y, value: 18 },
      { start: 720, end: 780, color: Y, value: 18 },
    ], dflt, 1440);
    expect(p.returns).toEqual([600, 780]);
    expect(p.steps.filter((s) => s.color === B).map((s) => [s.from, s.to])).toEqual([[0, 480], [600, 720], [780, 1440]]);
  });

  it("a one-shot is a point: no step, no return", () => {
    const p = buildPlanned([{ start: 600, end: null, color: Y, value: 18 }], dflt, 1440);
    expect(p.steps).toEqual([{ from: 0, to: 1440, value: 15, color: B }]);
    expect(p.risers).toEqual([]);
    expect(p.returns).toEqual([]);
  });

  it("without a default there is no baseline, no riser across a gap and no return", () => {
    const p = buildPlanned([
      { start: 480, end: 600, color: Y, value: 18 },
      { start: 720, end: 780, color: O, value: 19 },
    ], null, 1440);
    expect(p.steps).toEqual([
      { from: 480, to: 600, value: 18, color: Y },
      { from: 720, to: 780, value: 19, color: O },
    ]);
    expect(p.risers).toEqual([]);
    expect(p.returns).toEqual([]);
  });

  it("a default that is not numeric still marks the return but draws no baseline", () => {
    const p = buildPlanned([{ start: 480, end: 600, color: Y, value: 18 }], { color: B, value: null, active: true }, 1440);
    expect(p.steps).toEqual([{ from: 480, to: 600, value: 18, color: Y }]);
    expect(p.returns).toEqual([600]);
  });

  it("a slot ending at 24:00 has no return; same value in a row has no riser", () => {
    const p = buildPlanned([
      { start: 1200, end: 1320, color: Y, value: 18 },
      { start: 1320, end: 1440, color: Y, value: 18 },
    ], dflt, 1440);
    expect(p.returns).toEqual([]);
    expect(p.risers.map((r) => r.m)).toEqual([1200]);
  });

  it("a slot with a non-numeric action leaves a hole", () => {
    const p = buildPlanned([{ start: 480, end: 600, color: Y, value: null }], dflt, 1440);
    expect(p.steps.map((s) => [s.from, s.to])).toEqual([[0, 480], [600, 1440]]);
  });
});
