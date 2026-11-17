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

describe("pointer edits and day transfers", () => {
  it("a held handle becomes a whole-slot move only after 450 ms", () => {
    const el = editor();
    const down = pointer(180, 60); // 06:00 at 320 pixels per day
    el._ovDown(down);
    expect(down.currentTarget.setPointerCapture).toHaveBeenCalledWith(7);
    expect(down.preventDefault).toHaveBeenCalledOnce();
    expect(el._drag).toMatchObject({ ref: { id: "a", edge: "start" }, moved: false });
    vi.advanceTimersByTime(449);
    expect(el._mv).toBeUndefined();
    vi.advanceTimersByTime(1);
    expect(el._drag).toBeUndefined();
    expect(el._hsel).toBeNull();
    expect(el._mv).toMatchObject({ id: 7, slotId: "a", x0: 180, y0: 60, moved: false, profileId: "h", weekday: 0 });
    expect(navigator.vibrate).toHaveBeenCalledWith(12);
    el._zoneCancel();
    el._ovCancel();
    expect(el._mv).toBeUndefined();
  });
  it("a released handle cannot start a delayed whole-slot move", () => {
    const el = editor();
    el._ovDown(pointer(180, 60));
    el._ovUp(pointer(180, 60));
    vi.advanceTimersByTime(450);
    expect(el._drag).toBeUndefined();
    expect(el._mv).toBeUndefined();
    expect(navigator.vibrate).not.toHaveBeenCalled();
  });
  it("a moved handle stays a boundary drag and saves its original day and handle", () => {
    const el = editor();
    el._edit = vi.fn();
    el._ovDown(pointer(180, 60));
    el._ovMove(pointer(182, 60));
    expect(el._draft).toBeNull();
    el._ovMove(pointer(190, 60));
    expect(el._draft[0].start).toEqual({ time: "06:45" });
    vi.advanceTimersByTime(450);
    expect(el._mv).toBeUndefined();
    el._ovUp(pointer(190, 60, 8));
    expect(el._edit).not.toHaveBeenCalled();
    el._ovUp(pointer(190, 60));
    expect(el._drag).toBeUndefined();
    expect(el._bubble).toBeNull();
    const [op, touched, ids, profile] = el._edit.mock.calls[0];
    expect([touched, ids, profile]).toEqual([[0], ["a"], "h"]);
    const days = el.program.profiles[0].days;
    expect(op(days, (id: string) => id)[0][0].start).toEqual({ time: "06:45" });
    expect(op(days, () => "gone")).toBeNull();
  });
  it("tap selection respects pointer identity and the eight-pixel movement limit", () => {
    const el = editor();
    el._ovDown(pointer(140, 60)); // gap, away from handles
    expect(el._tap.target).toEqual({ kind: "gap", start: 0, end: 360 });
    el._ovUp(pointer(140, 60, 9));
    expect(el._selected).toBeNull();
    expect(el._tap).toBeDefined();
    el._ovUp(pointer(148, 60));
    expect(el._selected).toEqual({ kind: "gap", start: 0, end: 360 });
    el._selected = null;
    el._ovDown(pointer(140, 60));
    el._ovUp(pointer(148.01, 60));
    expect(el._selected).toBeNull();
    el._ovDown(pointer(220, 60)); // body of the slot
    expect(el._mv.slotId).toBe("a");
    el._ovUp(pointer(220, 60));
    expect(el._selected).toEqual({ kind: "slot", id: "a" });
    expect(el._mv).toBeUndefined();
  });
  it("only another day of the same program and device accepts a drop", () => {
    const el = editor();
    const other = editor();
    other.program = el.program;
    other.weekday = 1;
    el.getRootNode = () => ({ elementsFromPoint: vi.fn(() => [other]) });
    expect(el._barAt(12, 34)).toBe(other);
    other.entityId = "cover.b";
    expect(el._barAt(12, 34)).toBeNull();
    other.entityId = el.entityId;
    other.program = { ...el.program, id: "different" };
    expect(el._barAt(12, 34)).toBeNull();
    other.program = el.program;
    other.weekday = 0;
    expect(el._barAt(12, 34)).toBeNull();
    el.getRootNode = () => ({ elementsFromPoint: () => [el] });
    expect(el._barAt(12, 34)).toBeNull();
    el.getRootNode = () => ({});
    expect(el._barAt(12, 34)).toBeNull();
  });
  it("cross-day drag previews the destination then writes both days on release", () => {
    const el = editor();
    const dest = editor(); dest.program = el.program; dest.weekday = 2;
    el.getRootNode = () => ({ elementsFromPoint: () => [dest] });
    el._edit = vi.fn();
    el._mvBegin(pointer(220, 60), "a");
    expect(el._mvMove(pointer(224, 63))).toBe(true);
    expect(el._moving).toBe(false);
    expect(el._mvMove(pointer(230, 60, 8))).toBe(false);
    el._mvMove(pointer(230, 60));
    expect(el._moving).toBe(true);
    expect(dest.drop).toBe(true);
    expect(el._mv.delta).toBe(45);
    expect(el._draft).toBeNull();
    expect(el._bubble.text).toContain("Wed");
    expect(el._bubble.m).toBe(405);
    expect(el._mvUp(pointer(230, 60))).toBe(true);
    expect(dest.drop).toBe(false);
    expect(el._moving).toBe(false);
    expect(el._bubble).toBeNull();
    const [op, touched, ids, profile] = el._edit.mock.calls[0];
    expect([touched, ids, profile]).toEqual([[0, 2], ["a"], "h"]);
    const out = op(el.program.profiles[0].days, (id: string) => id);
    expect(out[0]).toEqual([]);
    expect(out[2][0]).toMatchObject({ start: { time: "06:45" }, end: { time: "12:45" }, label: "l" });
    expect(op(el.program.profiles[0].days, () => "missing")).toBeNull();
  });
  it("switching drop targets removes the old highlight and cancellation restores the source", () => {
    const el = editor(); const first = editor(); const second = editor();
    el._mvBegin(pointer(220, 60), "a");
    el._setDrop(first);
    expect(first.drop).toBe(true);
    el._setDrop(second);
    expect([first.drop, second.drop]).toEqual([false, true]);
    el._setDrop(second);
    expect(second.drop).toBe(true);
    el._mv.moved = true; el._draft = [slot("draft")]; el._moving = true; el._bubble = { m: 99 };
    el._mvCancel();
    expect([second.drop, el._draft, el._moving, el._bubble, el._mv]).toEqual([false, null, false, null, undefined]);
    el._draft = [slot("untouched")];
    el._mvCancel();
    expect(el._draft[0].id).toBe("untouched");
  });
  it("overlapping destination refuses a transfer and shows an error", () => {
    const el = editor(); const dest = editor(); dest.weekday = 1;
    el.program.profiles[0].days[1] = [slot("busy")];
    el._edit = vi.fn();
    el._mvBegin(pointer(220, 60), "a");
    Object.assign(el._mv, { moved: true, to: dest }); dest.drop = true;
    expect(el._mvUp(pointer(220, 60))).toBe(true);
    expect(el._edit).not.toHaveBeenCalled();
    expect(el._error).toMatch(/overlap/i);
    expect(dest.drop).toBe(false);
  });
  it("a same-day whole-slot drag saves a reusable edit and ignores other pointers", () => {
    const el = editor();
    el.getRootNode = () => ({});
    el._edit = vi.fn();
    el._mvBegin(pointer(220, 60), "a");
    el._mvMove(pointer(230, 60));
    expect(el._draft[0]).toMatchObject({ start: { time: "06:45" }, end: { time: "12:45" } });
    expect(el._mvUp(pointer(230, 60, 8))).toBe(false);
    expect(el._edit).not.toHaveBeenCalled();
    el._mvUp(pointer(230, 60));
    const [op, touched, ids, profile] = el._edit.mock.calls[0];
    expect([touched, ids, profile]).toEqual([[0], ["a"], "h"]);
    expect(op(el.program.profiles[0].days, (id: string) => id)[0][0].start).toEqual({ time: "06:45" });
    expect(op(el.program.profiles[0].days, () => "missing")).toBeNull();
  });
});
