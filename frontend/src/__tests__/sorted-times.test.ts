import { expect, it } from "vitest";
import { hasNearby, upperBound } from "../sorted-times";
it("finds the first strict successor and preserves inclusive proximity boundaries", () => {
  const times = [10, 20, 20, 30];
  expect(upperBound(times, 20)).toBe(3);
  expect(upperBound([], 0)).toBe(0);
  expect(hasNearby(times, 25, 5)).toBe(true);
  expect(hasNearby(times, 25, 4)).toBe(false);
  expect(hasNearby([], 0, 1)).toBe(false);
});
