import { afterEach, describe, expect, it, vi } from "vitest";
import { cardIdentity, chartKey, isChartOpen, loadChartChoices, saveChartChoices } from "../chart-state";
import { scopeKey } from "../components/schedule-dialog";

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
  async function card(config: Record<string, unknown> = {}) {
    const { WeeklyPlannerCard } = await import("../weekly-planner-card");
    const c = new WeeklyPlannerCard() as any;
    c.hass = { language: "en", config: { time_zone: "UTC" } };
    c._config = config;
    c._data = { labels: [], status: {}, programs: [] };
    return c;
  }
  const program = { id: "p", entities: [], profiles: [] } as any;
  const scope = { kind: "program", programId: "p" } as any;
  const keyOf = (c: any) => chartKey(cardIdentity(c._config), scopeKey(scope), "switch.x");
  it("shows a collapsed 'Today's chart' button with the chart icon and no chart by default", async () => {
    const out = flat((await card())._extras(scope, "switch.x", [program]));
    expect(out).toContain("Today’s chart");
    expect(out).toContain("mdi:chart-line");
    expect(out).toContain("mdi:chevron-down");
    expect(out).not.toContain("wp-chart");
  });
  it("keeps the week and chart buttons on one row", async () => {
    const out = flat((await card())._extras(scope, "switch.x", [program]));
    expect(out).toMatch(/class="toggles"[\s\S]*Week[\s\S]*Today’s chart/);
  });
  it("renders the chart only when expanded", async () => {
    const c = await card();
    c._charts = new Map([[keyOf(c), true]]);
    const out = flat(c._extras(scope, "switch.x", [program]));
    expect(out).toContain("<wp-chart");
  });
  it("starts expanded when chart_collapsed is false, until the user closes it", async () => {
    const c = await card({ chart_collapsed: false });
    c._charts = new Map();
    expect(flat(c._extras(scope, "switch.x", [program]))).toContain("<wp-chart");
    c._charts = new Map([[keyOf(c), false]]);
    expect(flat(c._extras(scope, "switch.x", [program]))).not.toContain("<wp-chart");
  });
  it("hides button and chart when the card hides charts", async () => {
    const out = flat((await card({ show_chart: false }))._extras(scope, "switch.x", [program]));
    expect(out).not.toContain("chart-line");
    expect(out).not.toContain("wp-chart");
  });
  it("remembers the choice per card: another card keeps its own", async () => {
    const a = await card({ title: "A", filter: {} });
    const b = await card({ title: "B", filter: {} });
    a._charts = new Map([[keyOf(a), true]]);
    expect(flat(a._extras(scope, "switch.x", [program]))).toContain("<wp-chart");
    b._charts = a._charts;
    expect(flat(b._extras(scope, "switch.x", [program]))).not.toContain("<wp-chart");
  });
});

describe("card identity", () => {
  it("differs with title and content, not with unrelated options", () => {
    expect(cardIdentity({ title: "A", filter: {} })).not.toBe(cardIdentity({ title: "B", filter: {} }));
    expect(cardIdentity({ filter: { area: "x" } })).not.toBe(cardIdentity({ filter: {} }));
    expect(cardIdentity({ program: "p1" })).not.toBe(cardIdentity({ program: "p2" }));
    expect(cardIdentity({ title: "A", program: "p1", filter: { area: "x" } })).toBe(cardIdentity({ title: "A", program: "p1" }));
  });
});
