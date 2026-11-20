import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpBarEditor } from "../components/bar-editor";
import { HOLD_HINT_MS } from "../hold-hint";
import { t } from "../i18n";
import { find, flat } from "./helpers/tpl";

// The zone of the bar editor: press, tap hint, keyboard, click without a pointer, markup of the zone.
const bar = (editable = true) => {
  const el = new WpBarEditor() as any;
  el.editable = editable; el.lang = "en"; el.tz = "UTC";
  el.hass = { states: {}, services: {}, config: { time_zone: "UTC" } };
  el.program = { id: "p", revision: 1, entities: [], profiles: [{ id: "h", days: [[], [], [], [], [], [], []] }] };
  el.data = { programs: [el.program], labels: [], status: {} };
  el.dispatchEvent = vi.fn();
  return el;
};
const events = (el: any) => el.dispatchEvent.mock.calls.map(([e]: any[]) => e.type);
const ptr = (x = 0, y = 0, id = 1, extra: any = {}) => ({ pointerId: id, clientX: x, clientY: y, button: 0, pointerType: "touch", ...extra }) as any;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("window", { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout });
  vi.stubGlobal("navigator", {});
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("zone: press and tap", () => {
  it("a tap before the long press time cancels the long press and shows the hint for 6 s, restarted by a second tap", () => {
    const el = bar();
    el._zoneDown(ptr()); el._zoneUp(ptr());
    expect(el._hint).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(events(el)).toEqual([]); // the long press timer was cleared
    vi.advanceTimersByTime(HOLD_HINT_MS - 1001);
    expect(el._hint).toBe(true);
    vi.advanceTimersByTime(2);
    expect(el._hint).toBe(false);
    expect(el._hintTimer).toBeUndefined();
    el._tapHint();
    vi.advanceTimersByTime(HOLD_HINT_MS - 1000);
    el._tapHint(); // restarted: the first timer must not end the second hint
    vi.advanceTimersByTime(1500);
    expect(el._hint).toBe(true);
    vi.advanceTimersByTime(HOLD_HINT_MS);
    expect(el._hint).toBe(false);
  });
  it("a mouse click or a tap never edits or opens the day, only hints", () => {
    const el = bar();
    el._zoneDown(ptr(0, 0, 1, { pointerType: "mouse" })); el._zoneUp(ptr(0, 0, 1, { pointerType: "mouse" }));
    expect(events(el)).toEqual([]);
    expect(el._hint).toBe(true);
  });
  it("a read-only bar: no hint, no long press; with a lock reason a tap asks to explain it", () => {
    const el = bar(false);
    el._zoneDown(ptr()); el._zoneUp(ptr());
    vi.advanceTimersByTime(2000);
    expect(el._hint).toBe(false);
    expect(events(el)).toEqual([]);
    const locked = bar(false); locked.lockedReason = "why";
    locked._zoneDown(ptr()); locked._zoneUp(ptr());
    expect(events(locked)).toEqual(["locked-request"]);
    expect(locked._hint).toBe(false);
    const both = bar(true); both.lockedReason = "why";
    both._zoneDown(ptr()); both._zoneUp(ptr());
    expect(events(both)).toEqual([]);
  });
  it("another pointer does not end the press; the press is forgotten once released", () => {
    const el = bar();
    el._zoneDown(ptr(0, 0, 1));
    el._zoneUp(ptr(0, 0, 2));
    expect(el._press).toBeDefined();
    expect(el._hint).toBe(false);
    el._zoneUp(ptr(0, 0, 1));
    expect(el._press).toBeUndefined();
    el._zoneUp(ptr(0, 0, 1)); // nothing pressed: ignored
    el._zoneDown(ptr(0, 0, 1, { button: 2 }));
    expect(el._press).toBeUndefined();
    el.editing = true;
    el._zoneDown(ptr());
    expect(el._press).toBeUndefined();
  });
  it("the long press edits once and then a release does not hint", () => {
    const el = bar();
    el._mvUp = vi.fn();
    el._zoneDown(ptr());
    vi.advanceTimersByTime(449);
    expect(events(el)).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(events(el)).toEqual(["edit-request"]);
    el._zoneUp(ptr());
    expect(el._mvUp).toHaveBeenCalledTimes(1);
    expect(el._hint).toBe(false);
    expect(el._press).toBeUndefined();
  });
  it("moving more than 8 px is a scroll, 8 px or less is still a press, another pointer is ignored", () => {
    const el = bar();
    el._zoneDown(ptr(10, 10));
    el._zoneMove(ptr(10 + 8, 10));
    expect(el._press).toBeDefined();
    el._zoneMove(ptr(10 + 9, 10, 2));
    expect(el._press).toBeDefined();
    el._zoneMove(ptr(10, 10 + 9));
    expect(el._press).toBeUndefined();
    vi.advanceTimersByTime(1000);
    expect(events(el)).toEqual([]); // the timer was cleared
    const diag = bar();
    diag._zoneDown(ptr(0, 0));
    diag._zoneMove(ptr(6, 6)); // 8.48 px
    expect(diag._press).toBeUndefined();
    const back = bar();
    back._zoneDown(ptr(20, 20));
    back._zoneMove(ptr(12, 20)); // 8 px to the left
    expect(back._press).toBeDefined();
    back._zoneMove(ptr(20 - 9, 20));
    expect(back._press).toBeUndefined();
  });
  it("after the long press, moving over a slot begins moving it, and every move goes on", () => {
    const el = bar();
    el._zoneDown(ptr(40, 7));
    vi.advanceTimersByTime(450);
    el.editing = true;
    el._minuteAt = vi.fn(() => ({ m: 100 }));
    el._segAt = vi.fn(() => ({ kind: "slot", id: "s1" }));
    el._mvBegin = vi.fn(); el._mvMove = vi.fn();
    const move = ptr(45, 9);
    el._zoneMove(move);
    expect(el._pointerY).toBe(7);
    expect(el._minuteAt).toHaveBeenCalledWith(40);
    expect(el._segAt).toHaveBeenCalledWith(100);
    expect(el._mvBegin).toHaveBeenCalledWith(move, "s1", el._press);
    expect(el._mvMove).toHaveBeenCalledWith(move);
    el._mv = {};
    el._zoneMove(move);
    expect(el._mvBegin).toHaveBeenCalledTimes(1);
    expect(el._mvMove).toHaveBeenCalledTimes(2);
    el._mv = undefined;
    el._segAt = vi.fn(() => ({ kind: "gap" }));
    el._zoneMove(move);
    expect(el._mvBegin).toHaveBeenCalledTimes(1);
    el._segAt = vi.fn(() => ({ kind: "slot", id: "s" }));
    el.editing = false;
    el._zoneMove(move);
    expect(el._mvBegin).toHaveBeenCalledTimes(1);
  });
  it("clearing the hint stops its timer", () => {
    const el = bar();
    el._tapHint();
    el._clearHint();
    expect(el._hint).toBe(false);
    expect(el._hintTimer).toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
    el._hint = true;
    el._clearHint();
    expect(el._hint).toBe(false);
  });
});

describe("zone: keyboard and click without a pointer", () => {
  const key = (el: any, k: string, extra: any = {}) => {
    const target = {};
    const ev = { key: k, target, currentTarget: target, preventDefault: vi.fn(), ...extra };
    el._zoneKey(ev);
    return ev;
  };
  it("Enter and Space edit, take the keyboard mode, clear the hint and stop the hint counter", () => {
    for (const k of ["Enter", " "]) {
      const el = bar();
      el._tapHint();
      const ev = key(el, k);
      expect(ev.preventDefault).toHaveBeenCalled();
      expect(events(el)).toEqual(["edit-request"]);
      expect(el._kbd).toBe(true);
      expect(el._hint).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    }
  });
  it("other keys, an edit in progress or a key from a child do nothing; Escape closes the tip", () => {
    const el = bar();
    el._tip = { text: "x" };
    const esc = key(el, "Escape");
    expect(el._tip).toBeNull();
    expect(esc.preventDefault).not.toHaveBeenCalled();
    el._tip = { text: "x" };
    key(el, "a");
    expect(el._tip).toEqual({ text: "x" });
    expect(events(el)).toEqual([]);
    key(el, "Enter", { currentTarget: {} });
    expect(events(el)).toEqual([]);
    el.editing = true;
    expect(key(el, "Enter").preventDefault).not.toHaveBeenCalled();
    expect(events(el)).toEqual([]);
    const spaceOnly = bar();
    key(spaceOnly, "Tab");
    expect(events(spaceOnly)).toEqual([]);
  });
  it("a locked day answers Enter with the lock request; an editable locked one still edits", () => {
    const el = bar(false); el.lockedReason = "why";
    const ev = key(el, "Enter");
    expect(ev.preventDefault).toHaveBeenCalled();
    expect(events(el)).toEqual(["locked-request"]);
    const plain = bar(false);
    key(plain, "Enter");
    expect(events(plain)).toEqual([]);
    const both = bar(true); both.lockedReason = "why";
    key(both, "Enter");
    expect(events(both)).toEqual(["edit-request"]);
  });
  const click = (el: any, over: any = {}) => {
    const target = {};
    el._zoneClick({ detail: 0, target, currentTarget: target, ...over });
  };
  it("a click without a pointer edits like Enter: keyboard mode, hint cleared, counter stopped", () => {
    const el = bar();
    el._tapHint();
    click(el);
    expect(events(el)).toEqual(["edit-request"]);
    expect(el._kbd).toBe(true);
    expect(el._hint).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("a click with a pointer, while editing, or on a child does nothing; locked asks for the explanation", () => {
    const el = bar();
    click(el, { detail: 1 });
    click(el, { currentTarget: {} });
    el.editing = true; click(el);
    expect(events(el)).toEqual([]);
    expect(el._kbd).toBeFalsy();
    const locked = bar(false); locked.lockedReason = "why";
    click(locked);
    expect(events(locked)).toEqual(["locked-request"]);
    const plain = bar(false);
    click(plain);
    expect(events(plain)).toEqual([]);
    const both = bar(true); both.lockedReason = "why";
    click(both);
    expect(events(both)).toEqual(["edit-request"]);
  });
});

describe("zone: markup", () => {
  it("the zone says how to edit (aria-description) unless editing or read only; lock attributes only when locked", () => {
    const hint = t("en", "hold_hint");
    expect(flat(bar().render())).toContain(`aria-description=${hint}`);
    const ro = flat(bar(false).render());
    expect(ro).not.toContain("aria-description=Keep");
    const editing = bar(); editing.editing = true;
    expect(flat(editing.render())).not.toContain("aria-description=Keep");
    expect(flat(bar().render())).not.toContain("aria-disabled=true");
    const locked = bar(false); locked.lockedReason = "Because";
    const html = flat(locked.render());
    expect(html).toContain("aria-disabled=true aria-describedby=locked-reason");
    expect(html).toContain('<span id="locked-reason" class="sr-only">Because</span>');
    expect(flat(bar().render())).not.toContain("locked-reason");
    expect(flat(bar().render())).toContain('class="hold-hint" role="status"></div>');
    const shown = bar(); shown._hint = true;
    expect(flat(shown.render())).toContain(`role="status">${hint}</div>`);
  });
  it("the zone is not rendered without data; the editing zone has the editing class, no tab stop and no button role", () => {
    for (const drop of ["hass", "data", "program"]) {
      const el = bar(); el[drop] = undefined;
      expect(flat(el.render())).toBe("");
    }
    expect(flat(bar().render())).toContain('class="zone " title=');
    expect(flat(bar().render())).toContain("role=button");
    const editing = bar(); editing.editing = true;
    const html = flat(editing.render());
    expect(html).toContain('class="zone editing"');
    expect(html).not.toContain("role=button");
  });
  it("pointer handlers: down hides the tip and starts the press, move does both, context menu is blocked only for a touch press", () => {
    const el = bar();
    el._zoneDown = vi.fn(); el._zoneMove = vi.fn(); el._tipMove = vi.fn();
    const ev = ptr();
    el._tip = { text: "x" };
    find(el.render(), "pointerdown", "zone").fn(ev);
    expect(el._zoneDown).toHaveBeenCalledWith(ev);
    expect(el._tip).toBeNull();
    find(el.render(), "pointermove", "zone").fn(ev);
    expect(el._zoneMove).toHaveBeenCalledWith(ev);
    expect(el._tipMove).toHaveBeenCalledWith(ev);
    const menu = () => { const e = { preventDefault: vi.fn() }; find(el.render(), "contextmenu", "zone").fn(e); return e.preventDefault.mock.calls.length; };
    el._press = undefined;
    expect(menu()).toBe(0);
    el._press = { mouse: true };
    expect(menu()).toBe(0);
    el._press = { mouse: false };
    expect(menu()).toBe(1);
  });
});

describe("zone: selected time row and title", () => {
  const editor = (slot: any) => {
    const el = bar();
    el.editing = true; el.lang = "en";
    el.program = { id: "p", revision: 1, entities: [], profiles: [{ id: "h", days: [[slot], [], [], [], [], [], []] }] };
    el.data = { programs: [el.program], labels: [], status: {} };
    el.spans = [{ start: 525, end: 1020, label: "Comfort", color: "#e80", slotId: slot.id }];
    el._selected = { kind: "slot", id: slot.id };
    return el;
  };
  it("the selected time sits at the middle of the selection, the rest split in fr units, and is the title while editing", () => {
    const el = editor({ id: "s", label: "comfort", start: { time: "08:45" }, end: { time: "17:00" } });
    const html = flat(el.render()).replace(/\s+/g, " ");
    expect(html).toContain('class="selected-time-row" style=grid-template-columns:minmax(0, 772.5fr) auto minmax(0, 667.5fr)');
    expect(html).toContain(`class="selected-time" title=${el._selectedTime} aria-label=${el._selectedTime} role="status">${el._selectedTime}</div>`);
    expect(html).toContain(`title=${el._selectedTime} tabindex`.replace(" tabindex", ""));
    expect(html).toContain('class="zone editing" title=');
  });
  it("a one-shot sits at its own time; a selection near the edges stays inside the day", () => {
    const shot = editor({ id: "s", label: "comfort", start: { time: "10:00" } });
    expect(flat(shot.render())).toContain("minmax(0, 600fr) auto minmax(0, 840fr)");
    const late = editor({ id: "s", label: "comfort", start: { time: "23:00" }, end: { time: "23:59" } });
    expect(flat(late.render())).toContain("minmax(0, 1410fr) auto minmax(0, 30fr)".replace("1410", "1409.5").replace("30fr", "30.5fr"));
  });
  it("no row without a selection, in the radial view or outside the edit mode", () => {
    const el = editor({ id: "s", label: "comfort", start: { time: "08:45" }, end: { time: "17:00" } });
    el._selected = undefined;
    expect(flat(el.render())).not.toContain("selected-time-row");
    const radial = editor({ id: "s", label: "comfort", start: { time: "08:45" }, end: { time: "17:00" } });
    radial.view = "radial";
    expect(flat(radial.render())).not.toContain("selected-time-row");
    const idle = editor({ id: "s", label: "comfort", start: { time: "08:45" }, end: { time: "17:00" } });
    idle.editing = false;
    expect(flat(idle.render())).not.toContain("selected-time-row");
    expect(flat(idle.render())).toContain('class="zone " title= ');
  });
  it("the title is the hover text first, then the selected time while editing, else empty", () => {
    const el = editor({ id: "s", label: "comfort", start: { time: "08:45" }, end: { time: "17:00" } });
    el._tip = 0;
    const tip = el._tipText;
    expect(tip).toContain("Comfort");
    expect(flat(el.render())).toContain(`class="zone editing" title=${tip}`);
    el.editing = false;
    expect(flat(el.render())).toContain(`class="zone " title=${tip}`);
  });
  it("cancelling a press by moving or releasing leaves no timer behind", () => {
    const el = bar();
    el._zoneDown(ptr(0, 0));
    expect(vi.getTimerCount()).toBe(1);
    el._zoneMove(ptr(30, 0));
    expect(vi.getTimerCount()).toBe(0);
    const up = bar();
    up._zoneDown(ptr(0, 0));
    up.editable = true;
    up._zoneUp(ptr(0, 0));
    expect(vi.getTimerCount()).toBe(1); // only the hint timer
    expect(up._hint).toBe(true);
  });
});
