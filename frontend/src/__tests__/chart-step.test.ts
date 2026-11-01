// Set values (cover, light, setpoint) are staircases; measured probe values stay a line through the points: horizontal at the old value, vertical at the change time, last value held to now.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpChart } from "../components/chart";

const DAY = "2026-01-01";
const T0 = Date.parse(`${DAY}T00:00:00Z`);
const at = (min: number) => T0 + min * 60_000;
const NOW_MIN = 720;

const flat = (v: any): string => {
  if (v === null || v === undefined || typeof v === "symbol" || typeof v === "boolean") return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map(flat).join("");
  if (v.strings) return v.strings.map((s: string, i: number) => s + (i < v.values.length ? flat(v.values[i]) : "")).join("");
  return "";
};
// width 320, left 38, right 10, top 22, bottom 22, height 150
const xOf = (m: number) => 38 + (m / 1440) * (320 - 38 - 10);
// climate axis: values 18..20 give an axis 17..21
const yOf2 = (v: number) => (22 + (1 - (v - 17) / 4) * 106).toFixed(1);
const yOf = (pct: number) => 22 + (1 - pct / 100) * (150 - 22 - 22);

function draw(entityId: string, hist: { min: number; s: string; a?: Record<string, unknown> }[]) {
  const c = new WpChart() as any;
  c.entityId = entityId;
  c.date = DAY;
  c.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, callWS: vi.fn() };
  c.data = { labels: [], status: {} };
  c.program = { id: "p", name: "P", entities: [{ entity_id: entityId, default_label: null }],
    profiles: [{ id: "home", days: Array.from({ length: 7 }, () => []) }] };
  c._model = c._build({ hist: hist.map((p) => ({ t: at(p.min), s: p.s, a: p.a ?? {} })), log: [], sent: [] });
  const svgText = flat(c._renderChart(c._model));
  const path = (cls: string) => svgText.match(new RegExp(`<path class="line ${cls}" d=([^>]*)>`))?.[1] ?? "";
  return { svgText, path };
}

describe("chart curves are staircases", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(at(NOW_MIN)); });
  afterEach(() => vi.useRealTimers());

  it("cover closed then open at 9:30: horizontal, one vertical jump, held to now, no oblique segment", () => {
    const { path } = draw("cover.shutter", [
      { min: -60, s: "closed", a: { current_position: 0 } }, // before 0h: clamped to 0h
      { min: 570, s: "open", a: { current_position: 100 } },
    ]);
    const d = path("main");
    expect(d).toBe(`M${xOf(0).toFixed(1)},${yOf(0).toFixed(1)}H${xOf(570).toFixed(1)}V${yOf(100).toFixed(1)}H${xOf(NOW_MIN).toFixed(1)}`);
    expect(d).not.toMatch(/L/);
  });

  it("several changes: every move is a vertical, every plateau a horizontal", () => {
    const { path } = draw("light.lamp", [
      { min: 0, s: "off" },
      { min: 300, s: "on", a: { brightness: 255 } },
      { min: 400, s: "on", a: { brightness: 128 } },
      { min: 500, s: "off" },
    ]);
    const d = path("main");
    expect(d).not.toMatch(/L/);
    expect(d.match(/V/g)).toHaveLength(3);
    expect(d.match(/H/g)).toHaveLength(4);
    expect(d.startsWith(`M${xOf(0).toFixed(1)},${yOf(0).toFixed(1)}H${xOf(300).toFixed(1)}V${yOf(100).toFixed(1)}`)).toBe(true);
    expect(d.endsWith(`H${xOf(NOW_MIN).toFixed(1)}`)).toBe(true);
  });

  it("requested temperature of a climate steps", () => {
    const { path } = draw("climate.room", [
      { min: 0, s: "heat", a: { current_temperature: 18, temperature: 20 } },
      { min: 600, s: "heat", a: { current_temperature: 20, temperature: 22 } },
    ]);
    expect(path("set")).not.toMatch(/L/);
    expect(path("set")).toMatch(/V/);
  });

  it("measured temperature of a climate stays a line through the recorded points", () => {
    const { path } = draw("climate.room", [
      { min: 0, s: "heat", a: { current_temperature: 18, temperature: 20 } },
      { min: 600, s: "heat", a: { current_temperature: 20, temperature: 20 } },
    ]);
    const d = path("measured");
    expect(d).not.toMatch(/V/);
    expect(d).toBe(`M${xOf(0).toFixed(1)},${yOf2(18)}L${xOf(600).toFixed(1)},${yOf2(20)}L${xOf(NOW_MIN).toFixed(1)},${yOf2(20)}`);
  });

  it("a numeric sensor is a measured series: oblique", () => {
    const { path, svgText } = draw("sensor.temp", [{ min: 0, s: "10" }, { min: 600, s: "20" }]);
    expect(path("measured")).toMatch(/L/);
    expect(path("measured")).not.toMatch(/V/);
    expect(svgText).not.toContain('class="line main"');
  });

  it("the active band is unchanged", () => {
    const { svgText } = draw("cover.shutter", [
      { min: 0, s: "closed", a: { current_position: 0 } }, { min: 570, s: "open", a: { current_position: 100 } }]);
    const m = svgText.match(/<rect class="shade" x=([\d.]+) y=[\d.]+ width=([\d.]+)/);
    expect(Number(m?.[1])).toBeCloseTo(xOf(570), 1);
    expect(Number(m?.[2])).toBeCloseTo(xOf(NOW_MIN) - xOf(570), 1);
  });
});
