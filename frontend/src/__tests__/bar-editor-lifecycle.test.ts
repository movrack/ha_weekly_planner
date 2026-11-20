import { describe, expect, it, vi } from "vitest";
import { LitElement } from "lit";
import { WpBarEditor } from "../components/bar-editor";
import { flat } from "./helpers/tpl";
import { A, doc, editor, mk, pointer, slot, useBarEditorGlobals } from "./helpers/bar-editor";

const events = (el: any) => el.dispatchEvent.mock.calls.map(([e]: any[]) => e.type);

useBarEditorGlobals();

describe("life cycle", () => {
  it("the sun times of the day are read from the preview; the draft goes once the saved revision arrived", () => {
    const sun = { id: "s", label: "l", start: { sun: "sunrise" }, end: { sun: "sunset" } };
    const el = mk([sun, { id: "f", label: "l", start: { time: "01:00" }, end: { time: "02:00" } }]);
    el.preview = [{ slot_id: "s", start: "2026-11-04T06:15:00Z", end: "2026-11-04T16:45:00Z" }, { slot_id: "f", start: "2026-11-04T01:00:00Z", end: "2026-11-04T02:00:00Z" }, { slot_id: "zz", start: "x", end: "y" }];
    el.willUpdate(new Map([["preview", 1]]));
    expect([...el._sun]).toEqual([[JSON.stringify({ sun: "sunrise" }), 375], [JSON.stringify({ sun: "sunset" }), 1005]]);
    expect(el._at({ sun: "sunrise" })).toBe(375);
    expect(el._at({ time: "10:30" })).toBe(630);
    el.preview = [{ slot_id: "s", start: "2026-11-04T06:15:00Z", end: null }];
    el.willUpdate(new Map([["data", 1]]));
    expect([...el._sun].length).toBe(1);
    el.preview = undefined;
    el._sun = new Map([["x", 1]]);
    el.willUpdate(new Map([["program", 1]]));
    expect(el._sun.size).toBe(0);
    el._sun = new Map([["x", 1]]);
    el.willUpdate(new Map([["other", 1]]));
    expect(el._sun.size).toBe(1);
    el._draft = [A]; el._awaitRev = 5;
    el.willUpdate(new Map([["program", 1]]));
    expect(el._draft).not.toBeNull(); // revision 3 < 5
    el.program = { ...el.program, revision: 5 };
    el.willUpdate(new Map([["program", 1]]));
    expect([el._draft, el._awaitRev]).toEqual([null, null]);
    el._draft = [A]; el._awaitRev = null;
    el.willUpdate(new Map([["program", 1]]));
    expect(el._draft).not.toBeNull();
  });
  it("entering the edit mode listens to the page and clears the hint; leaving resets everything", () => {
    const el = mk();
    el._hint = true;
    el.editing = true;
    el.updated(new Map([["editing", false]]));
    expect(el._hint).toBe(false);
    expect(doc.addEventListener).toHaveBeenCalledWith("pointerdown", el._outside, true);
    expect(doc.addEventListener).toHaveBeenCalledWith("keydown", el._escape);
    const focus = vi.fn();
    Object.defineProperty(el, "renderRoot", { value: { querySelector: vi.fn(() => ({ focus })) }, configurable: true });
    el.updated(new Map([["editing", false]]));
    expect(focus).not.toHaveBeenCalled();
    el._kbd = true; el._listening = false;
    el.updated(new Map([["editing", false]]));
    expect(el.renderRoot.querySelector).toHaveBeenLastCalledWith(".hd");
    expect(focus).toHaveBeenCalledTimes(1);
    el.updated(new Map());
    expect(focus).toHaveBeenCalledTimes(1);
    el._selected = { kind: "slot", id: "a" }; el._hsel = { id: "a", edge: "start" }; el._copyOpen = true; el._conflict = {}; el._keep.add("x"); el._bubble = { m: 1 };
    el._ask = { op: () => null }; el._draft = [A]; el.editing = false;
    el.updated(new Map([["editing", true]]));
    expect([el._kbd, el._selected, el._hsel, el._copyOpen, el._conflict, el._keep.size, el._bubble, el._ask, el._draft]).toEqual([false, null, null, false, null, 0, null, null, null]);
    expect(focus).toHaveBeenCalledTimes(2);
    expect(el.renderRoot.querySelector).toHaveBeenLastCalledWith(".zone");
    expect(doc.removeEventListener).toHaveBeenCalledWith("pointerdown", el._outside, true);
    expect(doc.removeEventListener).toHaveBeenCalledWith("keydown", el._escape);
    el._draft = [A]; el._ask = null;
    el.updated(new Map([["editing", true]]));
    expect(el._draft).toEqual([A]); // no question pending: the draft stays
  });
  it("listeners are added and removed once; connecting follows the names; disconnecting stops every timer", () => {
    const up = vi.spyOn(LitElement.prototype, "connectedCallback").mockImplementation(() => {});
    const down = vi.spyOn(LitElement.prototype, "disconnectedCallback").mockImplementation(() => {});
    const el = mk();
    el._listen(true); el._listen(true);
    expect(doc.addEventListener).toHaveBeenCalledTimes(2);
    el._listen(false); el._listen(false);
    expect(doc.removeEventListener).toHaveBeenCalledTimes(2);
    const off = vi.fn();
    const services = vi.fn();
    el.requestUpdate = services;
    el.connectedCallback();
    expect(up).toHaveBeenCalled();
    el._offNames = off;
    el._press = { timer: 5 }; el._listening = true;
    el.disconnectedCallback();
    expect(down).toHaveBeenCalled();
    expect(off).toHaveBeenCalled();
    expect(doc.removeEventListener).toHaveBeenCalledTimes(4);
    expect((globalThis as any).window.clearTimeout).toHaveBeenCalledWith(5);
    expect((globalThis as any).window.clearTimeout.mock.calls.length).toBeGreaterThanOrEqual(5);
    const bare = mk();
    expect(() => bare.disconnectedCallback()).not.toThrow();
  });
  it("a touch outside leaves the edit mode, one inside or on the snack bar does not; Escape leaves unless a question is open", () => {
    vi.stubGlobal("HTMLElement", class {});
    const el = mk();
    el._outside({ composedPath: () => [el, {}] });
    expect(events(el)).toEqual([]);
    el._outside({ composedPath: () => [{}] });
    expect(events(el)).toEqual(["edit-exit"]);
    expect(el.dispatchEvent.mock.calls[0][0]).toMatchObject({ bubbles: true, composed: true });
    const snack = Object.assign(new (globalThis as any).HTMLElement(), { classList: { contains: (c: string) => c === "snack" } });
    el.dispatchEvent.mockClear();
    el._outside({ composedPath: () => [snack] });
    expect(events(el)).toEqual([]);
    el._outside({ composedPath: () => [{}, snack, {}] }); // a snack bar anywhere in the path
    expect(events(el)).toEqual([]);
    el._outside({ composedPath: () => [new (globalThis as any).HTMLElement()] }); // an element without a class list
    expect(events(el)).toEqual(["edit-exit"]);
    el.dispatchEvent.mockClear();
    const other = Object.assign(new (globalThis as any).HTMLElement(), { classList: { contains: () => false } });
    el._outside({ composedPath: () => [other] });
    expect(events(el)).toEqual(["edit-exit"]);
    el.dispatchEvent.mockClear();
    el._escape({ key: "Enter" });
    expect(events(el)).toEqual([]);
    el._escape({ key: "Escape" });
    expect(events(el)).toEqual(["edit-exit"]);
    el.dispatchEvent.mockClear();
    el._conflict = {};
    el._escape({ key: "Escape" });
    expect(events(el)).toEqual([]);
  });
  it("selecting the same thing twice unselects; any selection closes the copy box", () => {
    const el = mk();
    el._copyOpen = true; el._copyDays = [1];
    el._select({ kind: "slot", id: "a" });
    expect([el._selected, el._copyOpen, el._copyDays]).toEqual([{ kind: "slot", id: "a" }, false, []]);
    el._select({ kind: "slot", id: "a" });
    expect(el._selected).toBeNull();
    el._select({ kind: "gap", start: 0, end: 5 });
    el._select({ kind: "gap", start: 0, end: 6 });
    expect(el._selected).toEqual({ kind: "gap", start: 0, end: 6 });
  });
  it("the draft is dropped with its timer; an error shows for 5 s", () => {
    const el = mk();
    el._draft = [A]; el._awaitRev = 4;
    el._dropDraft();
    expect([el._draft, el._awaitRev]).toEqual([null, null]);
    expect((globalThis as any).window.clearTimeout).toHaveBeenCalled();
    el._fail("Boom");
    expect(el._error).toBe("Boom");
    vi.advanceTimersByTime(4999);
    expect(el._error).toBe("Boom");
    vi.advanceTimersByTime(1);
    expect(el._error).toBe("");
    expect(el._with([[1], [2], [3]], 1, [9])).toEqual([[1], [9], [3]]);
  });
});

describe("editor context and guards", () => {
  it("starts with neutral public properties and no pending edits", () => {
    const el: any = new WpBarEditor();
    expect([el.entityId, el.weekday, el.spans, el.preview, el.now, el.editing, el.editable, el.lockedReason, el.hours, el.deviceName, el.lang, el.tz, el.view, el.rest, el.drop]).toEqual(["", 0, [], undefined, null, false, false, "", false, "", "en", "UTC", "bar", "", false]);
    expect([el._draft, el._selected, el._hsel, el._bubble, el._copyOpen, el._copyDays, el._conflict, el._ask, el._error, el._hover, el._moving, el._hint]).toEqual([null, null, null, null, false, [], null, null, "", false, false, false]);
    expect(flat(el.render())).toBe("");
  });
  it("derives spill limits and the selected device's own default label", () => {
    const el = editor();
    el.program.entities.unshift({ entity_id: "cover.other", default_label: "other", label_overrides: {} });
    el.spans = [{ spill: true, end: 60 }, { spill: false, end: 1200 }, { spill: true, end: 90 }];
    expect(el._lead).toBe(90);
    const ctx = el._ctx(() => "new-slot");
    expect(ctx.defaultLabel).toBe("l");
    expect(ctx.lead).toBe(90);
    expect(ctx.newId()).toBe("new-slot");
    expect(ctx.entity).toBe("cover.a");
    expect(ctx.devices).toEqual(["cover.other", "cover.a"]);
    expect(ctx.newEntities).toEqual(["cover.a"]);
    expect(ctx.at({ time: "10:45" })).toBe(645);
    el._sun.set(JSON.stringify({ sun: "sunrise" }), 0);
    const solar = el._ctx();
    expect(solar.at({ sun: "sunrise" })).toBe(0);
    el._sun.set(JSON.stringify({ sun: "sunrise" }), 400);
    expect(solar.at({ sun: "sunrise" })).toBe(0); // context freezes the gesture's solar values
    el.entityId = "cover.missing";
    expect(el._ctx().defaultLabel).toBe("l");
    el.entityId = "";
    expect(el._ctx().entity).toBeUndefined();
    expect(el._ctx().newEntities).toBeUndefined();
    el.spans = [];
    expect(el._lead).toBe(0);
  });
  it("does not reset resolved solar times on unrelated updates", () => {
    const el = editor([{ id: "s", label: "l", start: { sun: "sunrise" }, end: { sun: "sunset" } }]);
    el.tz = "UTC";
    el.preview = [{ slot_id: "s", start: "2026-11-04T06:00:00Z", end: "2026-11-04T16:00:00Z" }];
    el.willUpdate(new Map([["preview", undefined]]));
    expect(el._ctx().at({ sun: "sunset" })).toBe(960);
    el.preview = [{ slot_id: "s", start: "2026-11-04T07:00:00Z", end: "2026-11-04T17:00:00Z" }];
    el.willUpdate(new Map([["hours", false]]));
    expect(el._at({ sun: "sunrise" })).toBe(360);
  });
  it("cancelling the opening long press also cancels its ongoing move", () => {
    const el = editor();
    el._mvBegin(pointer(200, 60), "a"); el._mv.moved = true; el._draft = [slot("draft")];
    el._press = { fired: true, timer: setTimeout(() => { throw new Error("uncancelled"); }, 450) };
    el._zoneCancel();
    expect([el._press, el._mv, el._draft]).toEqual([undefined, undefined, null]);
    vi.advanceTimersByTime(450);
    el._draft = [slot("keep")]; el._press = { fired: false };
    el._zoneCancel(); expect(el._draft[0].id).toBe("keep");
    expect(() => el._zoneCancel()).not.toThrow();
  });
});

describe("opening and leaving the edit mode", () => {
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
});
