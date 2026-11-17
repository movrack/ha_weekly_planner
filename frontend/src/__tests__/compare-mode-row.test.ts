import { describe, expect, it } from "vitest";
import { WeeklyPlannerCard } from "../weekly-planner-card";

// Comparison view: the "Mode : …" line and the Edit button share one row (no empty band between them).
describe("comparison view header row", () => {
  const raw = (WeeklyPlannerCard as unknown as { styles: unknown }).styles;
  const css = (Array.isArray(raw) ? raw : [raw]).map((s) => (s as { cssText?: string }).cssText ?? "").join("");

  it("lifts the edit button onto the mode line", () => {
    expect(css).toContain(".mode-line + .compare .cedit { margin-top: -26px; }");
  });

  it("keeps the mode text clear of the button", () => {
    expect(css).toContain(".mode-line:has(+ .compare) { padding-bottom: 0; padding-right: 76px; }");
  });
});
