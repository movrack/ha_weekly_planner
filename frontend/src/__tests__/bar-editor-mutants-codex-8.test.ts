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

describe("gesture thresholds and interruptions", () => {
  it("starts whole-slot motion exactly at eight pixels and boundary motion at three", () => {
    const el = editor(); el.getRootNode = () => ({});
    el._mvBegin(pointer(220, 60), "a");
    el._mvMove(pointer(228, 60));
    expect(el._mv.moved).toBe(true);
    expect(el._moving).toBe(true);
    el._mvCancel();
    el._ovDown(pointer(180, 60));
    el._ovMove(pointer(183, 60));
    expect(el._drag.moved).toBe(true);
    el._ovCancel();
    expect(el._drag).toBeUndefined();
    expect(el._draft).toBeNull();
  });
  it("updates hover only when neither a tap nor a drag is pending", () => {
    const el = editor();
    el._ovMove(pointer(180, 60)); expect(el._hover).toBe(true);
    el._ovMove(pointer(140, 60)); expect(el._hover).toBe(false);
    el._tap = { id: 7 }; el._ovMove(pointer(180, 60)); expect(el._hover).toBe(false);
    el._tap = undefined; el._ovDown(pointer(180, 60)); el._hover = true;
    el._ovMove(pointer(140, 60, 8)); expect(el._hover).toBe(true);
    el._ovCancel();
    el.view = "radial";
    el._ovMove(pointer(372, 210)); expect(el._hover).toBe(true);
    el._ovMove(pointer(260, 210)); expect(el._hover).toBe(false);
  });
  it("ignores non-primary presses and commits pending keyboard nudges before a pointer edit", () => {
    const el = editor(); el._edit = vi.fn();
    el._key({ key: "ArrowRight", preventDefault: vi.fn() }, { id: "a", edge: "start" });
    el._ovDown({ ...pointer(200, 60), button: 2 });
    expect(el._edit).not.toHaveBeenCalled();
    expect(el._nudge).toBeDefined();
    el._ovDown(pointer(200, 60));
    expect(el._edit).toHaveBeenCalledOnce();
    expect(el._nudge).toBeUndefined();
    el._ovCancel();
    vi.advanceTimersByTime(700);
    expect(el._edit).toHaveBeenCalledOnce();
  });
  it("long-press conversion rejects a different pointer, a changed gap or a missing drag", () => {
    for (const interruption of ["pointer", "gap", "missing"]) {
      const el = editor(); el._ovDown(pointer(180, 60));
      if (interruption === "pointer") el._drag.id = 8;
      if (interruption === "gap") el.program.profiles[0].days[0] = [];
      if (interruption === "missing") el._drag = undefined;
      vi.advanceTimersByTime(450);
      expect(el._mv).toBeUndefined();
      expect(navigator.vibrate).not.toHaveBeenCalled();
    }
  });
  it("a slot tap more than eight pixels away does not select it on release", () => {
    const el = editor();
    el._ovDown(pointer(220, 60));
    el._ovUp(pointer(229, 60));
    expect(el._selected).toBeNull();
    el._ovDown(pointer(220, 60));
    el._ovUp(pointer(228, 60));
    expect(el._selected).toEqual({ kind: "slot", id: "a" });
  });
  it("cancelling an unmoved boundary keeps an existing draft but cancels the long-press timer", () => {
    const el = editor();
    el._draft = [slot()];
    el._ovDown(pointer(180, 60));
    el._ovCancel();
    expect(el._draft).toEqual([slot()]);
    vi.advanceTimersByTime(450);
    expect(el._mv).toBeUndefined();
    expect(navigator.vibrate).not.toHaveBeenCalled();
  });
  it("a cross-day release with a vanished source reports failure without saving", () => {
    const el = editor(); const dest = editor(); dest.weekday = 1;
    el._edit = vi.fn(); el._mvBegin(pointer(220, 60), "a");
    el._mv.to = dest; el._mv.moved = true;
    el.program.profiles[0].days[0] = [];
    expect(el._mvUp(pointer(220, 60))).toBe(true);
    expect(el._edit).not.toHaveBeenCalled();
    expect(el._error).not.toBe("");
  });
});
