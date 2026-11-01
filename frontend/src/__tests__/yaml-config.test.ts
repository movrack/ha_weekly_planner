import { describe, expect, it } from "vitest";
import { normalizeConfig } from "../config";
import { WeeklyPlannerCardEditor } from "../card-editor";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { filterPrograms } from "../planner";

describe("YAML-only card configuration", () => {
  it("accepts every documented key unchanged", () => {
    const cfg = { type: "custom:weekly-planner-card", title: "T", schedule_view: "radial_12h", show_chart: false, chart_collapsed: true,
      filter: { types: ["climate"], area: "Salon", programs: ["p1"] }, show_week: true, show_advanced: false };
    expect(normalizeConfig(cfg)).toEqual(cfg);
  });
  it("accepts a single program card and unknown keys (lossless)", () => {
    const cfg = { type: "x", program: "abc", future_option: { a: 1 } };
    expect(normalizeConfig(cfg)).toEqual(cfg);
  });
  it("falls back safely on wrong types instead of crashing", () => {
    const c = normalizeConfig({ type: "x", schedule_view: "spiral", show_chart: "yes", title: [1], program: 12,
      filter: { types: "cover", programs: [1, "a", ""], area: 3 } });
    expect(c).toEqual({ type: "x", program: "12", filter: { types: ["cover"], programs: ["a"] } });
    expect(normalizeConfig({ type: "x", filter: "bad" })).toEqual({ type: "x" });
    expect(normalizeConfig({ type: "x", filter: ["a"] })).toEqual({ type: "x" });
  });
  it("rejects a non-mapping config with a clear error (HA shows an error card)", () => {
    for (const bad of [null, undefined, "x", 3, []]) expect(() => normalizeConfig(bad)).toThrow(/YAML mapping/);
  });
  it("does not mutate the input", () => {
    const cfg = { type: "x", filter: { types: "cover" } };
    normalizeConfig(cfg);
    expect(cfg.filter.types).toBe("cover");
  });
  it("YAML string filters still select programs", () => {
    const c = normalizeConfig({ type: "x", filter: { types: "cover" } });
    const data: any = { programs: [{ id: "a", priority: 0, name: "a", area: "", entities: [{ entity_id: "cover.x" }] }, { id: "b", priority: 0, name: "b", area: "", entities: [{ entity_id: "vacuum.x" }] }] };
    expect(filterPrograms(data, c).map((p) => p.id)).toEqual(["a"]);
  });
  it("card setConfig applies defaults and throws on garbage", () => {
    const card = new WeeklyPlannerCard() as any;
    card.setConfig({ type: "x", schedule_view: "nope" });
    expect(card._config.show_chart).toBe(true);
    expect(card._config.schedule_view).toBeUndefined();
    expect(() => card.setConfig("x" as any)).toThrow();
  });
  it("visual editor round trip keeps YAML-only and unknown keys", () => {
    const ed = new WeeklyPlannerCardEditor() as any;
    const out: any[] = [];
    ed.addEventListener("config-changed", (e: any) => out.push(e.detail.config));
    ed.setConfig({ type: "x", chart_collapsed: true, future_option: 1, filter: { types: ["cover"], programs: ["a"], area: "Salon" } });
    ed._set("title", "Hello");
    ed._setFilter({ programs: ["a", "b"] });
    expect(out[out.length - 1]).toEqual({ type: "x", chart_collapsed: true, schedule_view: "bars", show_chart: true, future_option: 1, title: "Hello", filter: { types: ["cover"], programs: ["a", "b"], area: "Salon" } });
  });
  it("stub config lists every setting the visual editor shows, equal to the effective defaults", () => {
    const stub = WeeklyPlannerCard.getStubConfig();
    expect(stub).toEqual({ filter: {}, schedule_view: "bars", show_chart: true, chart_collapsed: true });
    const card = new WeeklyPlannerCard() as any;
    card.setConfig({ type: "x", ...stub });
    expect(card._config).toEqual({ type: "x", ...stub });
    const bare = new WeeklyPlannerCard() as any;
    bare.setConfig({ type: "x" });
    expect(bare._config.show_chart).toBe(stub.show_chart);
  });
  it("first editor change writes the full effective config; opening alone writes nothing", () => {
    const ed = new WeeklyPlannerCardEditor() as any;
    const out: any[] = [];
    ed.addEventListener("config-changed", (e: any) => out.push(e.detail.config));
    ed.setConfig({ type: "x", filter: {} });
    expect(out).toEqual([]);
    ed._set("show_chart", false);
    expect(out[0]).toEqual({ type: "x", filter: {}, schedule_view: "bars", show_chart: false, chart_collapsed: true });
  });
  it("program mode gets no filter; roundtrip through the card is stable", () => {
    const ed = new WeeklyPlannerCardEditor() as any;
    const out: any[] = [];
    ed.addEventListener("config-changed", (e: any) => out.push(e.detail.config));
    ed.setConfig({ type: "x", program: "p1", future: 1 });
    ed._set("title", "T");
    expect(out[0]).toEqual({ type: "x", program: "p1", future: 1, title: "T", schedule_view: "bars", show_chart: true, chart_collapsed: true });
    const card = new WeeklyPlannerCard() as any;
    card.setConfig(out[0]);
    expect(card._config).toEqual(out[0]);
  });
});
