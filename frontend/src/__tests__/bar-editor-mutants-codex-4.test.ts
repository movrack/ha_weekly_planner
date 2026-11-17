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
describe("copy conflict choices", () => {
  it("shows before and after schedules, toggles one day's choice, and submits all choices", () => {
    const el = editor();
    el.program.profiles[0].days[1] = [slot("busy", "10:00", "14:00")];
    el._conflict = { id: "a", to: [1, 2], days: [1], skip: [] };
    let tpl = el._conflictDialog();
    expect(flat(tpl)).toContain('Tuesday');
    expect(flat(tpl)).toContain('role="radiogroup"');
    expect(attributes(tpl, "aria-checked")).toEqual([true, false]);
    expect(attributes(tpl, "?disabled")).toEqual([false]);
    const radios = handlers(tpl).filter(h => h.event === "click");
    radios[1].fn();
    expect(el._conflict.skip).toEqual([1]);
    tpl = el._conflictDialog();
    const values: any[] = [];
    function spans(v: any): void {
      if (Array.isArray(v)) { v.forEach(spans); return; }
      if (!v?.strings) return;
      v.strings.forEach((s: string, i: number) => {
        if (s.endsWith('.spans=')) values.push(v.values[i]);
        else spans(v.values[i]);
      });
    }
    spans(tpl);
    expect(values[0]).toEqual(values[1]); // skip retains the destination's schedule
    expect(values[0][0]).toMatchObject({ start: 600, end: 840 });
    handlers(tpl).filter(h => h.event === "click")[1].fn();
    expect(el._conflict.skip).toEqual([1]); // no duplicate
    handlers(el._conflictDialog()).filter(h => h.event === "click")[0].fn();
    expect(el._conflict.skip).toEqual([]);
    el._doCopy = vi.fn();
    handlers(el._conflictDialog()).filter(h => h.event === "click").slice(-1)[0]!.fn();
    expect(el._doCopy).toHaveBeenCalledWith("a", [1, 2], []);
    const stopPropagation = vi.fn();
    handlers(el._conflictDialog()).find(h => h.event === "closed")!.fn({ stopPropagation });
    expect(stopPropagation).toHaveBeenCalledOnce();
    expect(el._conflict).toBeNull();
  });
  it("disables submission only when every destination is skipped and cancels without saving", () => {
    const el = editor(); el._conflict = { id: "a", to: [1, 2], days: [1, 2], skip: [1, 2] };
    expect(attributes(el._conflictDialog(), "?disabled")).toEqual([true]);
    el._conflict.skip = [1];
    expect(attributes(el._conflictDialog(), "?disabled")).toEqual([false]);
    handlers(el._conflictDialog()).filter(h => h.event === "click").slice(-2)[0]!.fn();
    expect(el._conflict).toBeNull();
    expect(flat(el._conflictDialog())).toBe("");
  });
  it("copies only non-skipped days and returns null for a source removed since the dialog opened", async () => {
    const el = editor(); el._edit = vi.fn(); el._copyOpen = true; el._copyDays = [1, 2]; el._conflict = {};
    await el._doCopy("a", [1, 2], [2]);
    expect([el._copyOpen, el._copyDays, el._conflict]).toEqual([false, [], null]);
    const [op, touched, ids] = el._edit.mock.calls[0];
    expect([touched, ids]).toEqual([[1], ["a"]]);
    const days = el.program.profiles[0].days;
    expect(op(days, (id: string) => id)[1][0].start).toEqual({ time: "06:00" });
    expect(op(days, (id: string) => id)[2]).toEqual([]);
    expect(op(days, () => "gone")).toBeNull();
    await el._doCopy("a", [1], [1]);
    expect(el._edit).toHaveBeenCalledOnce();
  });
});

describe("strip controls", () => {
  it("only enables a cut for a splittable duration or a gap with a default label", () => {
    const el = editor(); el._selected = { kind: "slot", id: "a" };
    expect(attributes(el._strip(), "?disabled")[0]).toBe(false);
    el.program.profiles[0].days[0][0].end = undefined;
    expect(attributes(el._strip(), "?disabled")[0]).toBe(true);
    el.program.profiles[0].days[0] = [slot("a", "06:00", "06:05")];
    expect(attributes(el._strip(), "?disabled")[0]).toBe(true);
    el.program.profiles[0].days[0] = [];
    el._selected = { kind: "gap", start: 0, end: 1440 };
    expect(attributes(el._strip(), "?disabled")[0]).toBe(false);
    el.data.labels = []; el.program.entities[0].default_label = null;
    expect(attributes(el._strip(), "?disabled")[0]).toBe(true);
    expect(flat(el._strip())).not.toContain('content-copy');
    el._selected = null;
    expect(flat(el._strip())).toBe("");
  });
  it("opens a day picker, clears its previous choices and routes its buttons", () => {
    const el = editor(); el._selected = { kind: "slot", id: "a" };
    el._nothing = vi.fn(); el._cut = vi.fn(); el._copyGo = vi.fn();
    let clicks = handlers(el._strip()).filter(h => h.event === "click");
    clicks[0].fn(); expect(el._nothing).toHaveBeenCalledOnce();
    clicks[1].fn(); expect(el._cut).toHaveBeenCalledOnce();
    el._copyDays = [4]; clicks[2].fn();
    expect([el._copyOpen, el._copyDays]).toEqual([true, []]);
    expect(flat(el._strip())).toContain('copy-hint');
    expect(flat(el._strip()).match(/role="checkbox"/g)).toHaveLength(6);
    clicks = handlers(el._strip()).filter(h => h.event === "click");
    clicks[3].fn(); expect(el._copyDays).toEqual([1]);
    expect(attributes(el._strip(), "aria-checked")).toEqual([true, false, false, false, false, false]);
    expect(flat(el._strip())).not.toContain('copy-hint');
    clicks.slice(-1)[0]!.fn(); expect(el._copyGo).toHaveBeenCalledOnce();
    el._pickLabel = vi.fn(); const stopPropagation = vi.fn();
    handlers(el._strip()).find(h => h.event === "label-change")!.fn({ detail: "l", stopPropagation });
    expect(stopPropagation).toHaveBeenCalledOnce(); expect(el._pickLabel).toHaveBeenCalledWith("l");
  });
  it("suppresses the strip while moving or asking about shared devices", () => {
    const el = editor(); el._selected = { kind: "slot", id: "a" };
    expect(flat(el.render())).toContain('class="strip"');
    el._moving = true; expect(flat(el.render())).not.toContain('class="strip"');
    el._moving = false; el._ask = { count: 1, others: [] };
    expect(flat(el.render())).not.toContain('class="strip"');
    el._ask = null; el.editing = false;
    expect(flat(el.render())).not.toContain('class="strip"');
  });
});
