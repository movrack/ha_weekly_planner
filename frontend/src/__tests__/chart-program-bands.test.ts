import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpChart } from "../components/chart";
import { buildPlanned } from "../planned";
import { flat, handlers } from "./helpers/tpl";

const day = "2026-11-02", start = Date.parse(`${day}T00:00:00Z`);
function chart(): any {
  const c: any = new WpChart();
  c.date = day; c.entityId = "custom.room"; c._width = 336;
  c.hass = { language: "fr", config: { time_zone: "UTC" }, states: {} };
  c.data = { status: {}, labels: [
    { id: "eco", name: "Eco", color: "#0088ff", action: { kind: "service", service: "custom.choose", data: { preset: "eco" } } },
    { id: "comfort", name: "Comfort", color: "#ff8800", action: { kind: "service", service: "custom.choose", data: { preset: "comfort" } } },
  ] };
  c.program = { id: "p", name: "Room", entities: [{ entity_id: c.entityId, default_label: "eco" }], profiles: [
    { id: "home", days: Array.from({length: 7}, () => []) },
  ] };
  c.program.profiles[0].days[0] = [{ id: "s", label: "comfort", start: { type: "fixed", time: "08:00" }, end: { type: "fixed", time: "17:00" } }];
  c._loaded = { hist: [], log: [], sent: [] };
  c._model = c._build(c._loaded);
  return c;
}
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(start + 720 * 60000); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

describe("named program bands", () => {
  it("keeps names, colors and clipped boundaries including active nonnumeric defaults", () => {
    const p = buildPlanned([{ start: -120, end: 1800, name: "Comfort", color: "orange", value: null }], null, 1440);
    expect(p.zones).toEqual([{ from: 0, to: 1440, name: "Comfort", color: "orange", value: null }]);
    expect(p.steps).toEqual([]);
    const c = chart();
    expect(c._model.planned.zones.map((z: any) => [z.name, z.from, z.to])).toEqual([["Eco", 0, 480], ["Comfort", 480, 1020], ["Eco", 1020, 1440]]);
    const out = flat(c._renderSourceRows(c._model, { from: 0, to: 1440 }, { l: 38, r: 10 }));
    expect(out.match(/class="program-row|class="source-row program-row/g)).toHaveLength(1);
    expect(out.match(/class="program-band"/g)).toHaveLength(3);
    expect(out).toContain('<title>Comfort</title>');
    expect(out).toContain('fill=#ff8800');
    expect(out).toContain('x=134 y="2" width=108');
    expect(out).not.toContain('>Programme</div>');
    expect(flat(c._legend(c._model))).toContain("Programme · bandes nommées");
  });
  it("retains numeric staircases without bands and handles mixed zones", () => {
    const c = chart();
    c.entityId = "climate.room"; c.program.entities[0].entity_id = c.entityId;
    c.data.labels.forEach((label: any) => { label.action.service = "climate.set_temperature"; });
    c.data.labels[1].action.data = { temperature: 20 };
    c._model = c._build(c._loaded);
    // Use the existing generic action's numeric data, without device/service catalogues.
    expect(c._model.planned.steps).toHaveLength(1);
    expect(c._model.planned.steps[0]).toMatchObject({ from: 480, to: 1020, value: 20 });
    const out = flat(c._renderChart(c._model));
    expect(out.match(/class="program-band"/g)).toHaveLength(2);
    expect(out.match(/class="plan"/g)).toHaveLength(1);
    expect(flat(c._legend(c._model))).toContain("Programme · paliers et bandes nommées");
    c.data.labels[0].action.data = { temperature: 10 };
    c._model = c._build(c._loaded);
    expect(flat(c._renderChart(c._model))).not.toContain('class="program-band"');
    expect(c._model.planned.steps).toHaveLength(3);
    expect(flat(c._renderChart(c._model)).match(/class="plan"/g)).toHaveLength(3);
  });
  it("clips to a zoom window, excludes offscreen bands and truncates only visible text", () => {
    const c = chart();
    c._model.planned.zones[1].name = "Comfort very long setting";
    const out = flat(c._renderSourceRows(c._model, { from: 450, to: 1050 }, { l: 38, r: 10 }));
    expect(out).toContain('x=38 y="2" width=14.');
    expect(out).toContain('<title>Comfort very long setting</title>');
    expect(out).toContain('Comfort very long setting</text>');
    expect(out).not.toContain('>Eco</text>');
    const narrow = flat(c._renderSourceRows(c._model, { from: 0, to: 3000 }, { l: 38, r: 10 }));
    expect(narrow).toContain('Comfor…</text>');
    expect(flat(c._renderSourceRows(c._model, { from: 1500, to: 1800 }, { l: 38, r: 10 }))).not.toContain('class="program-band"');
  });
  it("positions previous and next day zones on the same timeline", () => {
    const c = chart(); c._zoom = { from: -120, to: 1560 };
    for (const date of ["2026-11-01", day, "2026-11-03"]) c._dayData.set(date, { loaded: c._loaded, slots: [] });
    const model = c._buildVisible();
    expect(model.planned.zones[0]).toMatchObject({ name: "Eco", from: -1440, to: 0 });
    expect(model.planned.zones.at(-1)).toMatchObject({ name: "Eco", from: 1440, to: 2880 });
    const out = flat(c._renderSourceRows(model, c._zoom, { l: 38, r: 10 }));
    expect(out.match(/class="program-band"/g)).toHaveLength(3);
    expect(out).toContain('x=38 y="2" width=20.');
  });
  it("keeps a resolved zone spanning both neighboring days named across midnight", () => {
    const c = chart(); c._zoom = { from: -120, to: 1560 };
    const slots = [{ slot_id: "s", start: "2026-11-01T22:00:00Z", end: "2026-11-03T02:00:00Z" }];
    for (const date of ["2026-11-01", day, "2026-11-03"]) c._dayData.set(date, { loaded: c._loaded, slots });
    const model = c._buildVisible();
    expect(model.planned.zones.filter((z: any) => z.name === "Comfort").map((z: any) => [z.from, z.to]))
      .toEqual([[-120, 0], [0, 1440], [1440, 1560]]);
    const out = flat(c._renderSourceRows(model, c._zoom, { l: 38, r: 10 }));
    expect(out.match(/<title>Comfort<\/title>/g)).toHaveLength(3);
    expect(out).not.toContain("<title>Eco</title>");
  });
  it("wires pan, wheel and keyboard zoom to the existing chart handlers", () => {
    const c = chart(); c._down = vi.fn(); c._move = vi.fn(); c._up = vi.fn(); c._wheel = vi.fn(); c._zoomKey = vi.fn();
    const tree = c._renderSourceRows(c._model, { from: 0, to: 1440 }, { l: 38, r: 10 });
    const expected: Record<string, string> = { pointerdown: "_down", pointermove: "_move", pointerup: "_up", pointercancel: "_up", wheel: "_wheel", keydown: "_zoomKey" };
    for (const h of handlers(tree)) { const e = { type: h.event }; h.fn(e); expect(c[expected[h.event]]).toHaveBeenCalledWith(e); }
    expect(handlers(tree)).toHaveLength(6);
  });
  it("does not invent bands for no action, one-shots or inactive defaults", () => {
    expect(buildPlanned([], { name: "Eco", color: "blue", value: null, active: false }, 1440).zones).toEqual([]);
    expect(buildPlanned([{ start: 10, end: null, name: "Go", color: "red", value: null }], null, 1440).zones).toEqual([]);
    const c = chart(); c.program.entities[0].default_label = null; c.program.profiles[0].days[0] = [];
    c._model = c._build(c._loaded);
    expect(flat(c._renderChart(c._model))).not.toContain('class="program-band"');
  });
});
