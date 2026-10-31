import { afterEach, describe, expect, it, vi } from "vitest";
import { isChartOpen, loadChartChoices, saveChartChoices } from "../chart-state";

describe("card chart state", () => {
  afterEach(() => vi.unstubAllGlobals());
  const store = (init: Record<string, string> = {}) => {
    const m = new Map<string, string>(Object.entries(init));
    vi.stubGlobal("localStorage", { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) });
  };
  it("is collapsed by default, expanded when chart_collapsed is false", () => {
    store();
    expect(loadChartChoices().size).toBe(0);
    expect(isChartOpen(loadChartChoices(), "k", true)).toBe(false);
    expect(isChartOpen(loadChartChoices(), "k", false)).toBe(true);
  });
  it("a saved choice wins over the option, open or closed", () => {
    store();
    saveChartChoices(new Map([["a", true], ["b", false]]));
    const c = loadChartChoices();
    expect(isChartOpen(c, "a", true)).toBe(true);
    expect(isChartOpen(c, "b", false)).toBe(false);
    expect(isChartOpen(c, "other", false)).toBe(true);
  });
  it("reads the legacy list of open charts", () => {
    store({ "weekly-planner:open-charts": '["a|switch.x"]' });
    expect(isChartOpen(loadChartChoices(), "a|switch.x", true)).toBe(true);
  });
  it("survives garbage and blocked storage", () => {
    vi.stubGlobal("localStorage", { getItem: () => "{oops", setItem: () => { throw new Error("blocked"); } });
    expect(loadChartChoices().size).toBe(0);
    expect(() => saveChartChoices(new Map([["x", true]]))).not.toThrow();
    vi.stubGlobal("localStorage", { getItem: () => '{"a":1}', setItem: () => {} });
    expect(loadChartChoices().size).toBe(0);
  });
});

describe("chart under the week on the card", () => {
  const flat = (v: any): string => {
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v.map(flat).join("");
    if (v && v.strings) return v.strings.map((s: string, i: number) => s + (i < v.values.length ? flat(v.values[i]) : "")).join("");
    return "";
  };
  async function card(show_chart?: boolean) {
    const { WeeklyPlannerCard } = await import("../weekly-planner-card");
    const c = new WeeklyPlannerCard() as any;
    c.hass = { language: "en", config: { time_zone: "UTC" } };
    c._config = { show_chart };
    c._data = { labels: [], status: {}, programs: [] };
    return c;
  }
  const program = { id: "p", entities: [], profiles: [] } as any;
  it("shows a collapsed toggle and no chart by default", async () => {
    const out = flat((await card())._chartRow("k", "switch.x", program));
    expect(out).toContain('aria-expanded=');
    expect(out).toContain("mdi:chevron-down");
    expect(out).not.toContain("wp-chart");
  });
  it("renders the chart only when expanded", async () => {
    const c = await card();
    c._charts = new Map([["k", true]]);
    const out = flat(c._chartRow("k", "switch.x", program));
    expect(out).toContain("<wp-chart");
    expect(out).toContain("mdi:chevron-up");
  });
  it("starts expanded when chart_collapsed is false, until the user closes it", async () => {
    const c = await card();
    c._config = { chart_collapsed: false };
    c._charts = new Map();
    expect(flat(c._chartRow("k", "switch.x", program))).toContain("<wp-chart");
    c._charts = new Map([["k", false]]);
    expect(flat(c._chartRow("k", "switch.x", program))).not.toContain("<wp-chart");
  });
  it("renders nothing when the card hides charts", async () => {
    expect(flat((await card(false))._chartRow("k", "switch.x", program))).toBe("");
  });
});
