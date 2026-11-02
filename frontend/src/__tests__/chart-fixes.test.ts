import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpChart } from "../components/chart";
import { binarySource, numericAxes, sourceKind, sourceNumber } from "../chart-sources";
import { flat } from "./helpers/tpl";

const start = Date.parse("2026-11-02T00:00:00Z");
function chart(): any {
  const c: any = new WpChart();
  c.date = "2026-11-02"; c.entityId = "climate.room";
  c.hass = { language: "en", config: { time_zone: "UTC" }, states: {
    "climate.room": { state: "heat", attributes: {} },
    "custom.window": { state: "off", attributes: { unit_of_measurement: "%", friendly_name: "Window" } },
    "custom.power": { state: "85", attributes: { unit_of_measurement: "%", friendly_name: "Power" } },
  }};
  c.data = { status: {}, labels: [
    { id: "eco", name: "Eco", color: "blue", action: { kind: "service", service: "climate.set_temperature", data: { temperature: 16 } } },
    { id: "comfort", name: "Comfort", color: "red", action: { kind: "service", service: "climate.set_temperature", data: { temperature: 21 } } },
  ]};
  c.program = { id: "p", name: "Room", entities: [{ entity_id: c.entityId, default_label: "eco", chart_sources: [
    { entity_id: "custom.window", kind: "numeric" }, { entity_id: "custom.power", kind: "numeric" },
  ] }], profiles: [{ id: "home", days: Array.from({length: 7}, () => []) }] };
  c.program.profiles[0].days[0] = [{ id: "slot", label: "comfort", start: {type: "fixed", time: "08:45"}, end: {type: "fixed", time: "17:00"} }];
  c._sourceHistory = { "custom.window": [{ t: start, s: "off", a: {} }, { t: start + 3600000, s: "on", a: {} }],
    "custom.power": [{ t: start, s: "85", a: {} }] };
  c._model = c._build({ hist: [{ t: start, s: "heat", a: { temperature: 16, current_temperature: 18 } }], log: [], sent: [] });
  return c;
}
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(start + 12 * 3600000); });
afterEach(() => vi.useRealTimers());
describe("chart corrections #40", () => {
  it("places every legend below navigation with device entries before extra curves", () => {
    const c = chart(), out = flat(c.render());
    expect(out.match(/class="legend"/g)).toHaveLength(1);
    expect(out).not.toContain('class="source-legend"');
    const legend = out.indexOf('class="legend"');
    expect(legend).toBeGreaterThan(out.indexOf('class="zoombar"'));
    const entries = flat(c._legend(c._model));
    expect(entries.indexOf("Schedule")).toBeLessThan(entries.indexOf("Measured"));
    expect(entries).toContain("Requested from device");
    expect(entries.indexOf("Measured")).toBeLessThan(entries.indexOf("Requested from device"));
    expect(entries.indexOf("Requested from device")).toBeLessThan(entries.indexOf("Window"));
    expect(entries.indexOf("Window")).toBeLessThan(entries.indexOf("Power"));
  });
  it("fixes any percent axis to 0–100 while preserving automatic bounds for other units", () => {
    const c = chart();
    const axes = numericAxes(c.hass, c.program.entities[0].chart_sources, c._sourceHistory, {unit:"%", lo:70, hi:90}).axes;
    expect(axes[0]).toMatchObject({lo:0,hi:100});
    expect(c._plotConfig(c._model).axes[1]).toMatchObject({unit:"%",lo:0,hi:100});
    expect(c._plotConfig(c._model).axes[0].lo).toBeLessThan(16);
  });
  it.each(["en", "fr"])("describes the actual numeric on/off mapping only on its own curve (%s)", language => {
    const c = chart(); c.hass.language = language;
    expect(sourceNumber("on")).toBe(100); expect(sourceNumber("off")).toBe(0);
    expect(binarySource(c.hass, "custom.window", c._sourceHistory["custom.window"])).toBe(true);
    expect(binarySource(c.hass, "custom.power", c._sourceHistory["custom.power"])).toBe(false);
    expect(flat(c._legend(c._model)).match(/on = 100, off = 0/g)).toHaveLength(1);
    expect(flat(c._renderChart(c._model))).toContain('class="source-line"');
    c.program.entities[0].chart_sources[0].kind = "states";
    expect(flat(c._legend(c._model))).not.toContain("on = 100, off = 0");
    delete c.hass.states["custom.window"].attributes.unit_of_measurement;
    expect(sourceKind(c.hass,"custom.window")).toBe("states");
  });
  it("preserves configured source order when a state band precedes a curve", () => {
    const c = chart(); c.program.entities[0].chart_sources[0].kind = "states";
    const legend = flat(c._legend(c._model));
    expect(legend.indexOf("Window")).toBeLessThan(legend.indexOf("Power"));
  });
  it("describes conversions in mixed history and draws on/off as steps", () => {
    const c = chart(); c._sourceHistory["custom.window"].push({t:start+7200000,s:"50",a:{}});
    expect(flat(c._legend(c._model))).toContain("on = 100, off = 0");
    const path = flat(c._renderChart(c._model)).match(/<path class="source-line" d=([^>]*)>/)?.[1] ?? "";
    expect(path).toContain("V"); expect(path).not.toContain("L");
  });
  it("keeps a midnight one-shot as a single start marker", () => {
    const c = chart(), slot = c.program.profiles[0].days[0][0];
    slot.start.time="00:00"; delete slot.end;
    const model = c._build({hist:[],log:[],sent:[]});
    expect(model.markers.filter((m:any)=>m.m===0).map((m:any)=>m.label.id)).toEqual(["comfort"]);
  });
  it("marks the initial Eco plateau, Comfort at 08:45 and the real return at 17:00", () => {
    const c = chart();
    expect(c._model.markers.map((m:any) => [m.m,m.label.id,m.end])).toEqual([[0,"eco",false],[525,"comfort",false],[1020,"eco",true]]);
    const out = flat(c._renderChart(c._model));
    expect(out.match(/class="drop"/g)).toHaveLength(3);
    expect(out).toContain('class="mk end');
  });
  it("marks a midnight slot once and carries the previous day's setting to the left edge", () => {
    const c = chart(), slot = c.program.profiles[0].days[0][0];
    slot.start.time = "00:00";
    let model = c._build({hist:[],log:[],sent:[]});
    expect(model.markers.filter((m:any)=>m.m===0).map((m:any)=>m.label.id)).toEqual(["comfort"]);
    c.program.profiles[0].days[0] = [];
    c.program.profiles[0].days[6] = [{...slot,start:{type:"fixed",time:"22:00"},end:{type:"fixed",time:"06:00"}}];
    model = c._build({hist:[],log:[],sent:[]});
    expect(model.markers.filter((m:any)=>m.m===0).map((m:any)=>m.label.id)).toEqual(["comfort"]);
    expect(model.markers.find((m:any)=>m.end)?.m).toBe(360);
  });
});
