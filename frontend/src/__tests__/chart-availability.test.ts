import { describe, expect, it, vi } from "vitest";
import { WpChart } from "../components/chart";

const setup = () => {
  const chart = new WpChart() as any;
  chart.entityId = "switch.chart_availability";
  chart.date = "2026-01-01";
  chart.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, callWS: vi.fn() };
  chart.data = { labels: [], status: {} };
  chart.program = { id: "p", entities: [], profiles: [{ id: "home", days: Array.from({ length: 7 }, () => []) }] };
  chart._renderChart = () => "graph";
  chart._legend = () => "legend";
  return chart;
};

// Inspect user-facing template values; no browser layout or shadow DOM is simulated.
const text = (value: any): string => typeof value === "string" ? value
  : Array.isArray(value) ? value.map(text).join(" ") : value?.values ? text(value.values) : "";

describe("chart availability guidance", () => {
  it("distinguishes missing recorded history from missing planned actions", () => {
    const chart = setup();
    chart._model = chart._build({ hist: [], log: [], sent: [] });
    expect(text(chart.render())).toContain("No history recorded");
    expect(text(chart.render())).toContain("No action planned");
    chart._model.planned.zones.push({ from: 0, to: 1440, value: null, color: "#abc" });
    expect(text(chart.render())).not.toContain("No action planned");
  });

  it("does not call a future day's empty history missing recorded data", () => {
    const chart = setup();
    chart.date = "2099-01-01";
    chart._model = chart._build({ hist: [], log: [], sent: [] });
    expect(text(chart.render())).toContain("History will appear");
    expect(text(chart.render())).not.toContain("No history recorded");
  });

  it("retains a renderable planned model when loading history fails", async () => {
    const chart = setup();
    chart.hass.callWS.mockRejectedValue(new Error("history unavailable"));
    await chart._load();
    expect(chart._failed).toBe(true);
    expect(chart._loaded).toEqual({ hist: [], log: [], sent: [] });
    chart._model = chart._build(chart._loaded);
    expect(text(chart.render())).toContain("History could not be loaded");
    expect(text(chart.render())).not.toContain("No history recorded");
    expect(text(chart.render())).toContain("graph");
  });
});


it("bounds retained past-history keys instead of keeping every visited day", async () => {
  const chart = setup();
  chart.hass.callWS.mockImplementation(async (request: any) => request.type === "weekly_planner/journal" ? { segments: [] } : {});
  for (let i = 0; i < 35; i++) {
    chart.entityId = `sensor.cache_${i}`;
    await chart._load();
  }
  const before = chart.hass.callWS.mock.calls.length;
  chart.entityId = "sensor.cache_0";
  await chart._load();
  expect(chart.hass.callWS.mock.calls.length).toBeGreaterThan(before);
});

it("handles large numeric history without spreading it into function arguments", () => {
  const chart = setup();
  chart.entityId = "sensor.large_history";
  const hist = Array.from({ length: 150_000 }, (_, i) => ({ t: Date.parse("2026-01-01T00:00:00Z") + i, s: "1", a: {} }));
  expect(() => chart._build({ hist, log: [], sent: [] })).not.toThrow();
});
