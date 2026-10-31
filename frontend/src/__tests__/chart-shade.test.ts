// End to end: history of a device -> model -> SVG of wp-chart. The shaded "on or open" bands must be drawn where
// the device was active, wide enough to see, under the curve, and the legend must name them only when drawn.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SHADE_EDGE, SHADE_MIN, WpChart } from "../components/chart";

const DAY = "2026-01-01";
const T0 = Date.parse(`${DAY}T00:00:00Z`);
const at = (min: number) => T0 + min * 60_000;
const NOW_MIN = 720; // 12:00, server zone UTC

const flat = (v: any): string => {
  if (v === null || v === undefined || typeof v === "symbol" || typeof v === "boolean") return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map(flat).join("");
  if (v.strings) return v.strings.map((s: string, i: number) => s + (i < v.values.length ? flat(v.values[i]) : "")).join("");
  return "";
};
const css = [(WpChart as any).styles].flat(Infinity).map((s: any) => s?.cssText ?? "").join("\n");

/** Chart of one device whose only setting all day is "Off" (an action without a number: the owner's case). */
function chart(entityId: string, defaultAction: Record<string, unknown> | null = { kind: "service", service: "light.turn_off" }) {
  const c = new WpChart() as any;
  c.entityId = entityId;
  c.date = DAY;
  c.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, callWS: vi.fn() };
  c.data = { labels: defaultAction ? [{ id: "off", name: "Off", color: "#607d8b", action: defaultAction }] : [], status: {} };
  c.program = {
    id: "p", name: "P", entities: [{ entity_id: entityId, default_label: defaultAction ? "off" : null }],
    profiles: [{ id: "home", days: Array.from({ length: 7 }, () => []) }],
  };
  return c;
}

function draw(c: any, hist: { min: number; s: string; a?: Record<string, unknown> }[]) {
  c._model = c._build({ hist: hist.map((p) => ({ t: at(p.min), s: p.s, a: p.a ?? {} })), log: [], sent: [] });
  const svgText = flat(c._renderChart(c._model));
  const legend = flat(c._legend(c._model));
  const shades = [...svgText.matchAll(/<rect class="shade" x=([\d.]+) y=([\d.]+) width=([\d.]+) height=([\d.]+)>/g)]
    .map((m) => ({ x: Number(m[1]), y: Number(m[2]), w: Number(m[3]), h: Number(m[4]) }));
  const edges = [...svgText.matchAll(/<rect class="shade-edge" x=([\d.]+) y=([\d.]+) width=([\d.]+) height=([\d.]+)>/g)]
    .map((m) => ({ x: Number(m[1]), w: Number(m[3]), h: Number(m[4]) }));
  return { svgText, legend, shades, edges };
}

// curve chart: width 320, padding left 38 right 10, top 22 bottom 22, height 150
const xOf = (m: number, left = 38) => left + (m / 1440) * (320 - left - 10);

describe("chart shading of the active periods", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(at(NOW_MIN)); });
  afterEach(() => vi.useRealTimers());

  it("light on 10:00-11:00 under an 'Off' setting without a number: a visible band at the right place", () => {
    const { shades, edges, legend, svgText } = draw(chart("light.lamp"),
      [{ min: 0, s: "off" }, { min: 600, s: "on", a: { brightness: 255 } }, { min: 660, s: "off" }]);
    expect(shades).toHaveLength(1);
    expect(shades[0].x).toBeCloseTo(xOf(600), 1);
    expect(shades[0].w).toBeCloseTo(xOf(660) - xOf(600), 1);
    // full plot height, not a sliver under a planned value
    expect(shades[0].y).toBe(22);
    expect(shades[0].h).toBe(150 - 22 - 22);
    expect(edges).toEqual([{ x: shades[0].x, w: shades[0].w, h: SHADE_EDGE }]);
    expect(legend).toContain("On or open");
    // drawn under the curve, so the curve stays on top
    expect(svgText.indexOf('class="shade"')).toBeLessThan(svgText.indexOf('class="line main"'));
  });

  it("climate heating all morning with no planned setting at all is shaded up to now", () => {
    const { shades, legend } = draw(chart("climate.room", null),
      [{ min: 0, s: "heat", a: { hvac_action: "heating", temperature: 20, current_temperature: 18 } }]);
    expect(shades).toHaveLength(1);
    expect(shades[0].x).toBeCloseTo(xOf(0), 1);
    expect(shades[0].x + shades[0].w).toBeCloseTo(xOf(NOW_MIN), 1);
    expect(legend).toContain("On or open");
  });

  it("cover: open from 8:00 to 10:00 is shaded; a move of a few seconds is still at least SHADE_MIN px wide", () => {
    const open = draw(chart("cover.bath", { kind: "service", service: "cover.close_cover" }), [
      { min: 0, s: "closed", a: { current_position: 0 } }, { min: 480, s: "opening" },
      { min: 480.5, s: "open", a: { current_position: 100 } }, { min: 600, s: "closing" }, { min: 600.4, s: "closed", a: { current_position: 0 } },
    ]);
    expect(open.shades).toHaveLength(1);
    expect(open.shades[0].x).toBeCloseTo(xOf(480), 1);
    expect(open.shades[0].x + open.shades[0].w).toBeCloseTo(xOf(600.4), 1);
    const blip = draw(chart("cover.bath", { kind: "service", service: "cover.close_cover" }),
      [{ min: 0, s: "closed" }, { min: 300, s: "opening" }, { min: 300.2, s: "closed" }]);
    expect(blip.shades).toHaveLength(1);
    expect(blip.shades[0].w).toBe(SHADE_MIN);
  });

  it("band devices (switch, vacuum) get the same full-height band, drawn over the state bands", () => {
    const sw = draw(chart("switch.plug", { kind: "service", service: "switch.turn_off" }),
      [{ min: 0, s: "off" }, { min: 120, s: "on" }, { min: 180, s: "off" }]);
    // band chart: left padding 8, height 84
    expect(sw.shades).toHaveLength(1);
    expect(sw.shades[0].x).toBeCloseTo(xOf(120, 8), 1);
    expect(sw.shades[0].h).toBe(84 - 22 - 22);
    expect(sw.svgText.indexOf('class="band')).toBeLessThan(sw.svgText.indexOf('class="shade"'));
    const vac = draw(chart("vacuum.rocky", null),
      [{ min: 0, s: "docked" }, { min: 540, s: "cleaning" }, { min: 600, s: "returning" }, { min: 615, s: "docked" }]);
    expect(vac.shades).toHaveLength(1);
    expect(vac.shades[0].w).toBeCloseTo(xOf(615, 8) - xOf(540, 8), 1);
  });

  it("nothing active, or only unavailable/unknown: no band and no legend entry", () => {
    for (const hist of [[{ min: 0, s: "off" }], [{ min: 0, s: "unavailable" }, { min: 300, s: "unknown" }], []]) {
      const r = draw(chart("light.lamp"), hist);
      expect(r.shades).toHaveLength(0);
      expect(r.legend).not.toContain("On or open");
    }
  });

  it("every legend entry 'On or open' matches at least one drawn band", () => {
    const r = draw(chart("switch.plug", { kind: "service", service: "switch.turn_off" }), [{ min: 0, s: "on" }]);
    expect(r.legend.includes("On or open")).toBe(r.shades.length > 0);
    expect(r.shades.every((s) => s.w >= SHADE_MIN && s.h > 0)).toBe(true);
  });
});

describe("shade and legend swatch look", () => {
  const rule = (sel: string) => css.match(new RegExp(`${sel.replace(/[.]/g, "\\.")} \\{([^}]*)\\}`))?.[1] ?? "";
  it("band is a real colour, translucent but clearly visible", () => {
    const shade = rule(".shade");
    expect(shade).toMatch(/fill: var\(--wp-active-color, var\(--primary-color\)\)/);
    const opacity = Number(shade.match(/opacity: ([\d.]+)/)?.[1]);
    expect(opacity).toBeGreaterThanOrEqual(0.2);
    expect(opacity).toBeLessThanOrEqual(0.4); // the curve must stay readable through it
    expect(rule(".shade-edge")).toMatch(/fill: var\(--wp-active-color, var\(--primary-color\)\)/);
    expect(rule(".shade-edge")).not.toContain("opacity");
  });
  it("legend swatch is the band in small: same colour, same opacity, same solid strip at its foot", () => {
    const box = rule(".key i.active");
    expect(box).toMatch(/border-bottom: 3px solid var\(--wp-active-color, var\(--primary-color\)\)/);
    const fill = rule(".key i.active::before");
    expect(fill).toMatch(/background: var\(--wp-active-color, var\(--primary-color\)\)/);
    expect(fill.match(/opacity: ([\d.]+)/)?.[1]).toBe(rule(".shade").match(/opacity: ([\d.]+)/)?.[1]);
    expect(SHADE_EDGE).toBe(3);
  });
});
