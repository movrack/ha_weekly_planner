import { describe, expect, it } from "vitest";
import { defaultViewFor, usesScheduleList, viewAllowed, viewsFor } from "../view-choice";

describe("views offered for the number of shown programs", () => {
  it.each([
    [undefined, ["bars", "radial", "radial_12h", "list", "times", "compare"]],
    [0, ["bars", "radial", "radial_12h", "list", "times", "compare"]],
    [1, ["bars", "radial", "radial_12h", "times"]],
    [2, ["list", "compare"]],
    [9, ["list", "compare"]],
  ])("%s programs: %j", (count, views) => {
    expect(viewsFor(count)).toEqual(views);
  });
  it.each([[1, "bars"], [2, "list"], [0, "bars"], [undefined, "bars"]])("%s programs: the fallback is %s", (count, view) => {
    expect(defaultViewFor(count)).toBe(view);
  });
  it("a missing view counts as bars, the card's own default", () => {
    expect(viewAllowed(undefined, 1)).toBe(true);
    expect(viewAllowed(undefined, 3)).toBe(false);
    expect(viewAllowed("compare", 1)).toBe(false);
    expect(viewAllowed("list", 3)).toBe(true);
  });
  it.each([["bars", true], [undefined, true], ["radial", true], ["radial_12h", true], ["times", false], ["list", false], ["compare", false]])(
    "the Schedules list is used by view %s = %s", (view, used) => {
      expect(usesScheduleList(view as any)).toBe(used);
    });
});
