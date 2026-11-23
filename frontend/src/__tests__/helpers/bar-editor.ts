// Shared fixtures for the bar-editor tests ("Lit without DOM": the component is built with `new` and its handlers are called directly).
import { afterEach, beforeEach, vi } from "vitest";
import { WpBarEditor } from "../../components/bar-editor";

export const label = { id: "l", name: "Open", color: "#0f0", action: { kind: "service", service: "cover.open_cover" } };
export const label2 = { id: "l2", name: "Close", color: "#f00", action: { kind: "service", service: "cover.close_cover" } };

/** One slot of the default test day. */
export const slot = (id = "a", start = "06:00", end = "12:00"): any => ({ id, label: "l", start: { time: start }, end: { time: end } });
/** A one-hour morning slot, for the tests that only need "some slot". */
export const A = { id: "a", label: "l", start: { time: "08:00" }, end: { time: "09:00" } };

/** A bar editor on Monday of mode "h", showing `slots`; `devices` are the program's devices, `props` override any property. */
export const mk = (slots: any[] = [A], props: any = {}, devices = ["cover.a"]): any => {
  const el: any = new WpBarEditor();
  el.lang = "en"; el.tz = "UTC"; el.editing = false; el.weekday = 0; el.entityId = devices[0]; el.deviceName = "Shutter";
  el.hass = { language: "en", states: {}, services: { cover: { open_cover: { fields: {} }, close_cover: { fields: {} } } }, config: { time_zone: "UTC" } };
  el.program = { id: "p", revision: 3, entities: devices.map((e) => ({ entity_id: e, default_label: null, label_overrides: {} })), profiles: [{ id: "h", name: "A", days: [slots, [], [], [], [], [], []] }] };
  el.data = { programs: [el.program], labels: [label, label2], status: {} };
  el.spans = [];
  el.dispatchEvent = vi.fn();
  Object.assign(el, props);
  return el;
};

let serial = 0;
/** An editing bar of cover.a with a 320 px wide overlay at (100, 50): pointer gestures and the radial dial. */
export function editor(slots: any[] = [slot()]): any {
  const el: any = new WpBarEditor();
  el.hass = { states: {}, services: { cover: { open_cover: {} } }, config: { time_zone: "UTC" } };
  el.program = { id: `bar-${++serial}`, revision: 1, entities: [{ entity_id: "cover.a", default_label: "l", label_overrides: {} }], profiles: [{ id: "h", name: "Home", days: [slots, [], [], [], [], [], []] }] };
  el.data = { programs: [el.program], labels: [{ id: "l", name: "Open", color: "#00ff00", action: { kind: "service", service: "cover.open_cover" } }], status: {} };
  el.entityId = "cover.a";
  el.editing = true;
  const overlay = { getBoundingClientRect: () => ({ left: 100, top: 50, width: 320, height: 20 }), setPointerCapture: vi.fn() };
  Object.defineProperty(el, "renderRoot", { value: { querySelector: () => overlay }, configurable: true });
  return el;
}

export const pointer = (x: number, y: number, id = 7): any => ({ button: 0, pointerId: id, clientX: x, clientY: y, currentTarget: { setPointerCapture: vi.fn() }, preventDefault: vi.fn() });

/** The values bound to attribute (or property) `name=` anywhere in a template tree, in document order. */
export function attributes(v: any, name: string, out: any[] = []): any[] {
  if (Array.isArray(v)) { v.forEach((x) => attributes(x, name, out)); return out; }
  if (v?.strings) v.strings.forEach((s: string, i: number) => {
    if (s.endsWith(name + "=")) out.push(v.values[i]);
    else attributes(v.values[i], name, out);
  });
  return out;
}

/** The stubbed `document` of the current test (its listeners are spies). */
export let doc: any;

/** Fake timers and the browser globals the bar editor touches; call once at the top of a test file. */
export function useBarEditorGlobals(): void {
  beforeEach(() => {
    vi.useFakeTimers();
    doc = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
    vi.stubGlobal("document", doc);
    vi.stubGlobal("window", { setTimeout: globalThis.setTimeout, clearTimeout: vi.fn(globalThis.clearTimeout), localStorage: { getItem: () => null, setItem: () => {} } });
    vi.stubGlobal("navigator", { vibrate: vi.fn() });
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
}
