import { describe, expect, it } from "vitest";
import { runningVersion, shouldReload } from "../update";

describe("card update", () => {
  it("reads its version from its own URL", () => {
    expect(runningVersion("http://ha/weekly_planner_static/weekly-planner-card.js?v=abc123def456")).toBe("abc123def456");
    expect(runningVersion("http://ha/weekly-planner-card.js")).toBeNull();
    expect(runningVersion("not a url")).toBeNull();
  });
  it("reloads only when both are known and differ", () => {
    expect(shouldReload("a", "b", null)).toBe(true);
    expect(shouldReload("a", "a", null)).toBe(false);
    expect(shouldReload(null, "b", null)).toBe(false);
    expect(shouldReload("a", null, null)).toBe(false);
    expect(shouldReload("a", undefined, null)).toBe(false);
  });
  it("never reloads twice for the same served version", () => {
    expect(shouldReload("a", "b", "b")).toBe(false);
    expect(shouldReload("a", "c", "b")).toBe(true);
  });
});
