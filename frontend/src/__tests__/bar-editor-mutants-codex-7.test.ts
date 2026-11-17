import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpBarEditor } from "../components/bar-editor";
import { flat, handlers } from "./helpers/tpl";

const slot = (id = "a", start = "06:00", end = "12:00"): any => ({ id, label: "l", start: { time: start }, end: { time: end } });
let serial = 0;
function editor(slots = [slot()]): any {
  const el: any = new WpBarEditor();
  el.hass = { states: {}, services: { cover: { open_cover: {} } }, config: { time_zone: "UTC" } };
  el.program = { id: `codex-bar-${++serial}`, revision: 1, entities: [{ entity_id: "cover.a", default_label: "l", label_overrides: {} }], profiles: [{ id: "h", name: "Home", days: [slots, [], [], [], [], [], []] }] };
  el.data = { programs: [el.program], labels: [{ id: "l", name: "Open", color: "#00ff00", action: { kind: "service", service: "cover.open_cover" } }], status: {} };
  el.entityId = "cover.a";
  el.editing = true;
  const overlay = { getBoundingClientRect: () => ({ left: 100, top: 50, width: 320, height: 20 }), setPointerCapture: vi.fn() };
  Object.defineProperty(el, "renderRoot", { value: { querySelector: () => overlay }, configurable: true });
  return el;
}
const pointer = (x: number, y: number, id = 7): any => ({ button: 0, pointerId: id, clientX: x, clientY: y, currentTarget: { setPointerCapture: vi.fn() }, preventDefault: vi.fn() });
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("window", { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout });
  vi.stubGlobal("navigator", { vibrate: vi.fn() });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function attributes(v: any, name: string, out: any[] = []): any[] {
  if (Array.isArray(v)) { v.forEach(x => attributes(x, name, out)); return out; }
  if (v?.strings) v.strings.forEach((s: string, i: number) => {
    if (s.endsWith(name + "=")) out.push(v.values[i]);
    else attributes(v.values[i], name, out);
  });
  return out;
}
describe("accessible controls and feedback", () => {
  it("shared-device choices name the affected devices and invoke their own action", () => {
    const el = editor();
    el.program.entities.push({ entity_id: "cover.b" }, { entity_id: "cover.c" });
    el.hass.states = { "cover.a": { attributes: { friendly_name: "Kitchen" } }, "cover.b": { attributes: { friendly_name: "Hall" } } };
    el._ask = { count: 2, others: ["cover.b"] }; el._answer = vi.fn(); el._askCancel = vi.fn();
    expect(flat(el._askBox())).toContain('Kitchen');
    expect(flat(el._askBox())).toContain('Hall');
    const clicks = handlers(el._askBox()).filter(h => h.event === "click");
    clicks[0].fn(); clicks[1].fn(); clicks[2].fn();
    expect(el._answer.mock.calls).toEqual([["one"], ["all"]]);
    expect(el._askCancel).toHaveBeenCalledOnce();
    el._ask = { count: 3, others: ["cover.b", "cover.c"] };
    expect(flat(el._askBox())).toContain('All devices (3)');
    el.hass.states = {}; el._ask = { count: 2, others: ["cover.b", "cover.c"] };
    expect(flat(el._askBox())).toContain('cover.a');
    expect(flat(el._askBox())).toContain('cover.b, cover.c');
    el._ask = null; expect(flat(el._askBox())).toBe("");
  });
  it("positions radial tooltip targets in the centre of arcs and at markers", () => {
    const el = editor(); el.view = "radial";
    el.spans = [{ start: 0, end: 720, label: "Open", color: "#0" }, { start: 0, end: 10, label: "Marker", color: "#0", marker: true }];
    el.now = 720;
    const styles = attributes(el._tipTargets(), "style");
    expect(styles).toEqual([
      'left:85%;top:50%;width:24px;height:24px;transform:translate(-50%,-50%)',
      'left:50%;top:15%;width:24px;height:24px;transform:translate(-50%,-50%)',
      'left:50%;top:85%;width:24px;height:24px;transform:translate(-50%,-50%)',
    ]);
    el.view = "radial_12h"; el.spans = [{ start: 0, end: 360, label: "Open", color: "#0" }]; el.now = null;
    expect(attributes(el._tipTargets(), "style")).toEqual(['left:74.375%;top:50%;width:24px;height:24px;transform:translate(-50%,-50%)']);
  });
  it("marks both refs at a shared boundary selected only for the matching edge", () => {
    const el = editor([slot(), slot("b", "12:00", "18:00")]);
    el._hsel = { id: "b", edge: "start" };
    const markup = flat(el._overlay_()).replace(/\s+/g, " ");
    expect(markup).toContain('data-h=a:end b:start');
    expect(markup.match(/class="hd on"/g)).toHaveLength(1);
    el._hsel = { id: "b", edge: "end" };
    expect(flat(el._overlay_()).replace(/\s+/g, " ").match(/class="hd on"/g)).toHaveLength(1);
    el._hsel = { id: "a", edge: "bogus" };
    expect(flat(el._overlay_()).replace(/\s+/g, " ")).not.toContain('class="hd on"');
    el._hover = true;
    handlers(el._overlay_()).find(h => h.event === "pointerleave")!.fn();
    expect(el._hover).toBe(false);
  });
  it("linear handles route focus, blur and keyboard to the selected boundary", () => {
    const el = editor();
    el.spans = [{ slotId: "a", start: 360, end: 720, label: "Open", color: "#0" }];
    const overlay = el._overlay_();
    const repeat = overlay.values.find((v: any) => v?._$litDirective$ && v.values?.length === 3);
    const tpl = repeat.values[2](repeat.values[0][0], 0);
    handlers(tpl).find(h => h.event === "focus")!.fn();
    expect(el._hsel).toEqual({ id: "a", edge: "start" });
    expect(el._selected).toEqual({ kind: "slot", id: "a" });
    expect(el._tip).toBe(0);
    handlers(tpl).find(h => h.event === "blur")!.fn(); expect(el._tip).toBeNull();
    handlers(tpl).find(h => h.event === "keydown")!.fn({ key: "ArrowRight", preventDefault: vi.fn() });
    expect(el._draft[0].start).toEqual({ time: "06:15" });
  });
  it("renders radial day properties and shows an hours axis only below a linear bar", () => {
    const el = editor(); el.view = "radial_12h"; el.hours = true; el.deviceName = "Kitchen"; el.rest = "Closed";
    el._selected = { kind: "slot", id: "a" };
    let tpl = el.render();
    expect(flat(tpl)).toContain('wp-radial-day passive device-name=Kitchen');
    expect(attributes(tpl, ".double")).toEqual([true]);
    expect(attributes(tpl, ".selectedTime")).toEqual(['6 am – 12 pm']);
    expect(flat(tpl)).toContain('rest=Closed');
    expect(flat(tpl)).not.toContain('class="hours"');
    el.editing = false;
    expect(attributes(el.render(), ".selectedTime")).toEqual([""]);
    expect(flat(el.render())).not.toContain('ov polar');
    el.view = "radial";
    expect(attributes(el.render(), ".double")).toEqual([false]);
    el.view = "bar";
    expect(flat(el.render())).toContain('class="hours"');
    el.hours = false;
    expect(flat(el.render())).not.toContain('class="hours"');
  });
});
