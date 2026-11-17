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
  it("selects a one-shot with a handle tap, and ignores missing handles", () => {
    const el = editor([{ id: "a", label: "l", start: { time: "06:00" } }]);
    el._ovDown(pointer(180, 60));
    el._selected = null; // handle release selects its one-shot marker
    el._ovUp(pointer(180, 60));
    expect(el._selected).toEqual({ kind: "slot", id: "a" });
    el._selected = null;
    el._ovDown(pointer(180, 60)); el.program.profiles[0].days[0] = []; el._selected = null;
    el._ovUp(pointer(180, 60));
    expect(el._selected).toBeNull();
  });
  it("a drag whose original mode disappears cancels without leaving a draft", () => {
    const el = editor();
    el._ovDown(pointer(180, 60)); el._drag.profileId = "gone";
    el._ovMove(pointer(200, 60));
    expect([el._drag, el._draft, el._bubble]).toEqual([undefined, null, null]);
    el._mvBegin(pointer(220, 60), "a"); el._mv.profileId = "gone";
    expect(el._mvMove(pointer(240, 60))).toBe(true);
    expect([el._mv, el._draft, el._moving]).toEqual([undefined, null, false]);
  });
  it("keeps a one-shot in place and explains refusal when its body is dragged", () => {
    const el = editor([{ id: "a", label: "l", start: { time: "06:00" } }]);
    el._edit = vi.fn(); el._mvBegin(pointer(180, 60), "a");
    expect(el._mv.refused).toBe(true);
    el._mvMove(pointer(190, 60));
    expect(el._error).not.toBe(""); expect(el._draft).toBeNull();
    el._mvUp(pointer(190, 60));
    expect(el._edit).not.toHaveBeenCalled();
  });
});
