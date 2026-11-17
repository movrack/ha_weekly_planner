import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpBarEditor } from "../components/bar-editor";
import { confirmAction } from "../components/confirm";
vi.mock("../components/confirm", () => ({ confirmAction: vi.fn(async () => true) }));

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

describe("strip edit operations", () => {
  it("erasing asks which schedule, then deletes only its remapped slot on the chosen day", async () => {
    const el = editor(); el._selected = { kind: "slot", id: "a" }; el._edit = vi.fn();
    vi.mocked(confirmAction).mockResolvedValueOnce(false);
    await el._nothing();
    expect(el._selected).toEqual({ kind: "slot", id: "a" });
    expect(el._edit).not.toHaveBeenCalled();
    vi.mocked(confirmAction).mockResolvedValueOnce(true);
    await el._nothing();
    expect(vi.mocked(confirmAction).mock.calls.slice(-1)[0]?.slice(1)).toEqual(["Delete this schedule? Open · 6 am – 12 pm", "Yes, delete it", "No, keep it"]);
    expect(el._selected).toBeNull();
    const [op, touched, ids] = el._edit.mock.calls[0];
    expect([touched, ids]).toEqual([[0], ["a"]]);
    const days = [[slot(), slot("copy"), slot("keep", "16:00", "17:00")], [slot("other")], [], [], [], [], []];
    expect(op(days, () => "copy").map((d: any[]) => d.map(s => s.id))).toEqual([["a", "keep"], ["other"], [], [], [], [], []]);
    vi.mocked(confirmAction).mockClear();
    await el._nothing();
    expect(confirmAction).not.toHaveBeenCalled();
    el._selected = { kind: "gap", start: 720, end: 1440 }; await el._nothing();
    expect(confirmAction).not.toHaveBeenCalled();
  });
  it("cutting a slot keeps its first half and focuses the resulting handle", async () => {
    const el = editor(); el._selected = { kind: "slot", id: "a" }; el._edit = vi.fn();
    const focus = vi.fn(); const querySelector = vi.fn(() => ({ focus }));
    Object.defineProperty(el, "renderRoot", { value: { querySelector }, configurable: true });
    Object.defineProperty(el, "updateComplete", { value: { then: (callback: () => void) => { callback(); return Promise.resolve(); } } });
    el._cut(); await Promise.resolve();
    expect(el._hsel).toEqual({ id: "a", edge: "end" });
    expect(el._keep.size).toBe(0);
    expect(querySelector).toHaveBeenCalledWith('[data-h="a:end"]');
    expect(focus).toHaveBeenCalledOnce();
    const [op, touched, ids] = el._edit.mock.calls[0];
    expect([touched, ids]).toEqual([[0], ["a"]]);
    const days = [[slot("copy")], [], [], [], [], [], []];
    expect(op(days, () => "copy")[0][0].end).toEqual({ time: "09:00" });
    expect(op(days, () => "gone")).toBeNull();
    expect(el._selected).toEqual({ kind: "slot", id: "a" });
  });
  it("cutting a gap selects a stable new slot and protects it against merging", async () => {
    const el = editor([]); el._selected = { kind: "gap", start: 0, end: 1440 }; el._edit = vi.fn();
    Object.defineProperty(el, "updateComplete", { value: { then: (callback: () => void) => { callback(); return Promise.resolve(); } } });
    Object.defineProperty(el, "renderRoot", { value: { querySelector: () => null }, configurable: true });
    el._cut(); await Promise.resolve();
    const id = el._selected.id;
    expect(id).toEqual(expect.any(String));
    expect(el._keep.has(id)).toBe(true);
    expect(el._hsel).toEqual({ id, edge: "start" });
    const [op, touched, ids] = el._edit.mock.calls[0];
    expect([touched, ids]).toEqual([[0], []]);
    const out = op(el.program.profiles[0].days, (s: string) => s);
    expect(out[0]).toEqual([{ id, start: { time: "12:00" }, end: { time: "24:00" }, conditions: [], label: "l" }]);
    expect(op(el.program.profiles[0].days, (s: string) => s)[0][0].id).toBe(id);
  });
  it("does not cut a missing selection, a one-shot or an unlabelled gap", () => {
    const el = editor(); el._edit = vi.fn();
    el._cut(); expect(el._edit).not.toHaveBeenCalled();
    el._selected = { kind: "slot", id: "a" }; el.program.profiles[0].days[0][0].end = undefined;
    el._cut(); expect(el._edit).not.toHaveBeenCalled();
    el.program.profiles[0].days[0] = []; el.data.labels = []; el.program.entities[0].default_label = null;
    el._selected = { kind: "gap", start: 0, end: 1440 };
    el._cut(); expect(el._edit).not.toHaveBeenCalled();
  });
  it("picking a label on a gap creates and selects the same stable slot on every rebuild", () => {
    const el = editor([]); el._edit = vi.fn();
    el._pickLabel("l"); expect(el._edit).not.toHaveBeenCalled();
    el._selected = { kind: "gap", start: 0, end: 1440 };
    el._pickLabel(null); expect(el._edit).not.toHaveBeenCalled();
    el._pickLabel("l");
    const [op, touched, ids] = el._edit.mock.calls[0];
    const id = el._selected.id;
    expect([touched, ids]).toEqual([[0], []]);
    const out = op(el.program.profiles[0].days, (x: string) => x);
    expect(out[0][0]).toMatchObject({ id, label: "l", start: { time: "00:00" }, end: { time: "24:00" } });
    expect(op(el.program.profiles[0].days, (x: string) => x)[0][0].id).toBe(id);
  });
  it("copying requires a slot and destination, sorts a copied list and opens only actual conflicts", () => {
    const el = editor(); el._doCopy = vi.fn();
    el._copyDays = [2, 1];
    el._copyGo(); expect(el._doCopy).not.toHaveBeenCalled();
    el._selected = { kind: "slot", id: "a" }; el._copyDays = [];
    el._copyGo(); expect(el._doCopy).not.toHaveBeenCalled();
    el._copyDays = [2, 1]; el._copyGo();
    expect(el._doCopy).toHaveBeenCalledWith("a", [1, 2], []);
    expect(el._copyDays).toEqual([2, 1]);
    el.program.profiles[0].days[2] = [slot("busy")];
    el._copyGo();
    expect(el._conflict).toEqual({ id: "a", to: [1, 2], days: [2], skip: [] });
    expect(el._doCopy).toHaveBeenCalledOnce();
    el._toggleDay(2); expect(el._copyDays).toEqual([1]);
    el._toggleDay(3); expect(el._copyDays).toEqual([1, 3]);
  });
});
