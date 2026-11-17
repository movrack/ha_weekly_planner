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

describe("remaining error and lifecycle paths", () => {
  it("leaving editing flushes a pending keyboard save and tolerates absent focus targets", () => {
    const el = editor();
    vi.stubGlobal("document", { addEventListener: vi.fn(), removeEventListener: vi.fn() });
    Object.defineProperty(el, "renderRoot", { value: { querySelector: () => null }, configurable: true });
    el._edit = vi.fn();
    el._key({ key: "ArrowRight", preventDefault: vi.fn() }, { id: "a", edge: "start" });
    el.editing = false; el._kbd = true;
    el.updated(new Map([["editing", true]]));
    expect(el._edit).toHaveBeenCalledOnce();
    expect(el._nudge).toBeUndefined();
    expect(el._kbd).toBe(false);
    vi.advanceTimersByTime(700); expect(el._edit).toHaveBeenCalledOnce();
    el.editing = true; el._kbd = true;
    expect(() => el.updated(new Map([["editing", false]]))).not.toThrow();
  });
  it("a save error identifies the conflicting device by friendly name or raw id", async () => {
    for (const known of [true, false]) {
      const el = editor();
      el.hass.states = known ? { "cover.a": { attributes: { friendly_name: "Kitchen" } } } : {};
      el.hass.callWS = vi.fn().mockRejectedValue({ message: "overlapping_slots:cover.a" });
      expect(await el._commit((days: any[][]) => days.map((day, i) => i === 0 ? [] : day), [0])).toBe(false);
      expect(el._error).toContain(known ? "Kitchen" : "cover.a");
    }
  });
  it("an outside press containing a snackbar anywhere in its path never closes the editor", () => {
    const el = editor();
    vi.stubGlobal("HTMLElement", class {});
    const snack = Object.assign(new HTMLElement(), { classList: { contains: (c: string) => c === "snack" } });
    el.dispatchEvent = vi.fn();
    el._outside({ composedPath: () => [{}, snack, {}] });
    expect(el.dispatchEvent).not.toHaveBeenCalled();
    const noClass = new HTMLElement();
    el._outside({ composedPath: () => [noClass] });
    expect(el.dispatchEvent.mock.calls[0][0]).toMatchObject({ type: "edit-exit", bubbles: true, composed: true });
  });
  it("mouse and touch opening presses retain their identity and vibrate only when still held", () => {
    const el = editor(); el.editing = false; el.editable = true; el.dispatchEvent = vi.fn();
    vi.stubGlobal("window", { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout, localStorage: { getItem: () => null, setItem: vi.fn() } });
    el._zoneDown({ ...pointer(110, 50), pointerType: "mouse" });
    expect(el._press.mouse).toBe(true);
    el._zoneCancel();
    vi.advanceTimersByTime(450);
    expect(el.dispatchEvent).not.toHaveBeenCalled();
    el._zoneDown({ ...pointer(110, 50), pointerType: "touch" });
    expect(el._press.mouse).toBe(false);
    el._hint = true;
    vi.advanceTimersByTime(450);
    expect(el._press.fired).toBe(true); expect(el._hint).toBe(false);
    expect(navigator.vibrate).toHaveBeenCalledWith(12);
    expect(el.dispatchEvent.mock.calls[0][0]).toMatchObject({ type: "edit-request", bubbles: true, composed: true });
  });
  it("missing day-bar shadow roots leave a mouse tooltip unchanged and bounds clear it", () => {
    const el = editor(); el._tip = 0;
    Object.defineProperty(el, "renderRoot", { value: { querySelector: () => ({ shadowRoot: null }) }, configurable: true });
    const move = { pointerType: "mouse", buttons: 0, clientX: 150, clientY: 60 };
    el._tipMove(move); expect(el._tip).toBe(0);
    const bar = { getBoundingClientRect: () => ({ left: 100, top: 50, right: 420, bottom: 70, width: 320 }) };
    Object.defineProperty(el, "renderRoot", { value: { querySelector: () => ({ shadowRoot: { querySelector: () => bar } }) }, configurable: true });
    el.now = 1440;
    el._tipMove({ ...move, clientX: 420 }); expect(el._tip).toBe("now");
    el._tipMove({ ...move, clientX: 421 }); expect(el._tip).toBeNull();
    el._tipMove({ ...move, clientY: 45 }); expect(el._tip).toBeNull();
    el._tipMove({ ...move, clientY: 75 }); expect(el._tip).toBeNull();
  });
});
