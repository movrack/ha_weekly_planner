import { describe, expect, it } from "vitest";
import { normalizeConfig, withDefaults } from "../config";

describe("card config normalization and defaults", () => {
  it("a key left undefined in the YAML survives the round trip, a wrong type is dropped", () => {
    const out = normalizeConfig({ type: "x", title: undefined, program: undefined, show_chart: undefined, chart_collapsed: undefined, schedule_view: undefined, sort: undefined, order: undefined, filter: undefined });
    expect(Object.keys(out).sort()).toEqual(["chart_collapsed", "filter", "order", "program", "schedule_view", "show_chart", "sort", "title", "type"]);
    const f = normalizeConfig({ type: "x", filter: { types: undefined, programs: undefined, area: undefined } }).filter as any;
    expect(Object.keys(f).sort()).toEqual(["area", "programs", "types"]);
  });
  it("wrong types: chart_collapsed, order, types, programs and area are removed", () => {
    const out = normalizeConfig({ type: "x", chart_collapsed: "yes", show_chart: 1, order: 7, filter: { types: 7, programs: {}, area: 7 } }) as any;
    expect("chart_collapsed" in out).toBe(false);
    expect("show_chart" in out).toBe(false);
    expect("order" in out).toBe(false);
    expect(out.filter).toEqual({});
    expect(normalizeConfig({ type: "x", chart_collapsed: false }).chart_collapsed).toBe(false);
  });
  it("defaults add an empty filter only when neither a program nor a filter is set", () => {
    expect(withDefaults({ type: "x" } as any).filter).toEqual({});
    expect("filter" in withDefaults({ type: "x", program: "p" } as any)).toBe(false);
    expect(withDefaults({ type: "x", filter: { types: ["light"] } } as any).filter).toEqual({ types: ["light"] });
    expect(withDefaults({ type: "x", program: "" } as any).filter).toBeUndefined();
  });
});
