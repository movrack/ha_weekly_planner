import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SwipeTracker, LongPress, displayName, trackScrollHints } from "../components/gestures";
import { WpTip } from "../components/tip";
import { WpRadialDay } from "../components/radial-day";
import { WpEntityPicker, WpConditionsEditor, langOf } from "../editors/shared";
import { syncSelectValues } from "../select-value";
import { flat, handlers, find, target } from "./helpers/tpl";

class FakeEl { tagName: string; constructor(t = "DIV") { this.tagName = t; } }
beforeEach(() => { vi.stubGlobal("HTMLElement", FakeEl); });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
const ev = (o: Record<string, unknown>) => ({ pointerType: "touch", isPrimary: true, pointerId: 1, clientX: 0, clientY: 0, button: 0, composedPath: () => [], ...o }) as any;

describe("displayName", () => {
  const hass = { states: { "light.a": { attributes: { friendly_name: "Lamp" } } } } as any;
  it("uses the friendly name, then a readable id, then the raw id", () => {
    expect(displayName(hass, "light.a")).toBe("Lamp");
    expect(displayName(hass, "light.living_room")).toBe("Living room");
    expect(displayName(hass, "weird")).toBe("weird");
  });
});

describe("SwipeTracker", () => {
  it("detects a horizontal swipe in both directions", () => {
    const s = new SwipeTracker(60);
    s.down(ev({ clientX: 200, clientY: 100 }));
    expect(s.up(ev({ clientX: 100, clientY: 105 }))).toBe(1);
    s.down(ev({ clientX: 100, clientY: 100 }));
    expect(s.up(ev({ clientX: 200, clientY: 100 }))).toBe(-1);
  });
  it("ignores short, steep, mouse, foreign-pointer and interactive-start gestures", () => {
    const s = new SwipeTracker(60);
    s.down(ev({ clientX: 100 })); expect(s.up(ev({ clientX: 130 }))).toBe(0);
    s.down(ev({ clientX: 100 })); expect(s.up(ev({ clientX: 200, clientY: 120 }))).toBe(0);
    s.down(ev({ pointerType: "mouse" })); expect(s.up(ev({ clientX: 300 }))).toBe(0);
    s.down(ev({ composedPath: () => [new FakeEl("INPUT")] })); expect(s.up(ev({ clientX: 300 }))).toBe(0);
    s.down(ev({})); expect(s.up(ev({ pointerId: 2, clientX: 300 }))).toBe(0);
    s.down(ev({})); s.cancel(); expect(s.up(ev({ clientX: 300 }))).toBe(0);
  });
});

describe("LongPress", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal("window", { setTimeout, clearTimeout }); vi.stubGlobal("navigator", { vibrate: vi.fn() }); });
  it("fires after the delay and is cancelled by a large move", () => {
    const fire = vi.fn();
    const lp = new LongPress(fire, 500);
    lp.down(ev({})); vi.advanceTimersByTime(499); expect(fire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1); expect(fire).toHaveBeenCalledTimes(1); expect(lp.fired).toBe(true);
    lp.down(ev({})); lp.move(ev({ clientX: 5 })); vi.advanceTimersByTime(600); expect(fire).toHaveBeenCalledTimes(2);
    lp.down(ev({})); lp.move(ev({ clientX: 30 })); vi.advanceTimersByTime(600); expect(fire).toHaveBeenCalledTimes(2);
  });
  it("does not start on buttons, interactive targets or a secondary mouse button", () => {
    const fire = vi.fn();
    const lp = new LongPress(fire);
    lp.down(ev({ composedPath: () => [new FakeEl("BUTTON")] }));
    lp.down(ev({ composedPath: () => [new FakeEl("SELECT")] }));
    lp.down(ev({ pointerType: "mouse", button: 2 }));
    vi.advanceTimersByTime(1000);
    expect(fire).not.toHaveBeenCalled();
  });
});

describe("trackScrollHints", () => {
  it("toggles the fade classes from the scroll position, once per element", () => {
    const classes = new Set<string>();
    const listeners: Record<string, () => void> = {};
    const el: any = { scrollLeft: 0, clientWidth: 100, scrollWidth: 300,
      classList: { toggle: (c: string, on: boolean) => (on ? classes.add(c) : classes.delete(c)) },
      addEventListener: (n: string, f: () => void) => { listeners[n] = f; } };
    trackScrollHints(null);
    trackScrollHints(el); trackScrollHints(el);
    expect([...classes]).toEqual(["more-right"]);
    el.scrollLeft = 100; listeners.scroll();
    expect([...classes].sort()).toEqual(["more-left", "more-right"]);
    el.scrollLeft = 200; listeners.scroll();
    expect([...classes]).toEqual(["more-left"]);
  });
});

describe("syncSelectValues", () => {
  it("sets a select to its data-value without emitting", () => {
    const a: any = { value: "x", dataset: { value: "y" } }, b: any = { value: "z", dataset: {} };
    syncSelectValues({ querySelectorAll: () => [a, b] } as any);
    expect(a.value).toBe("y"); expect(b.value).toBe("");
  });
});

describe("wp-tip", () => {
  const tip = (props: Record<string, unknown> = {}) => { const el = new WpTip() as any; Object.assign(el, { text: "Hi" }, props); return el; };
  it("shows on hover and focus, hides on leave, blur and Escape", () => {
    const el = tip();
    expect(flat(el.render())).not.toContain("bubble\"");
    const view = () => flat(el.render()).includes("role=\"tooltip\"");
    find(el.render(), "pointerenter", "hit").fn({ pointerType: "mouse" }); expect(view()).toBe(true);
    find(el.render(), "pointerleave", "hit").fn({ pointerType: "mouse" }); expect(view()).toBe(false);
    find(el.render(), "pointerenter", "hit").fn({ pointerType: "touch" }); expect(view()).toBe(false);
    find(el.render(), "focus", "hit").fn(); expect(view()).toBe(true);
    find(el.render(), "blur", "hit").fn(); expect(view()).toBe(false);
    find(el.render(), "focus", "hit").fn();
    find(el.render(), "keydown", "hit").fn({ key: "Escape" }); expect(view()).toBe(false);
  });
  it("a touch tap shows the text for 2 s; a mouse press only stops propagation", () => {
    vi.useFakeTimers();
    const el = tip();
    const stop = vi.fn();
    find(el.render(), "pointerdown", "hit").fn({ pointerType: "touch", stopPropagation: stop });
    expect(el._show).toBe(true); expect(stop).toHaveBeenCalled();
    vi.advanceTimersByTime(2000); expect(el._show).toBe(false);
    find(el.render(), "pointerdown", "hit").fn({ pointerType: "mouse", stopPropagation: stop });
    expect(el._show).toBe(false);
  });
  it("lets a mouse press go through when `through` is set", () => {
    const el = tip({ through: true });
    const stop = vi.fn();
    find(el.render(), "pointerdown", "hit").fn({ pointerType: "mouse", stopPropagation: stop });
    expect(stop).not.toHaveBeenCalled();
    find(el.render(), "pointerup", "hit").fn({ stopPropagation: stop });
    find(el.render(), "click", "hit").fn({ stopPropagation: stop });
    expect(stop).not.toHaveBeenCalled();
    const plain = tip();
    find(plain.render(), "click", "hit").fn({ stopPropagation: stop });
    find(plain.render(), "pointerup", "hit").fn({ stopPropagation: stop });
    find(plain.render(), "contextmenu", "hit").fn({ preventDefault: stop });
    expect(stop).toHaveBeenCalledTimes(3);
  });
  it("keeps the bubble inside the window", () => {
    vi.stubGlobal("window", { innerWidth: 400 });
    const el = tip(); el._show = true;
    let rect = { left: -20, right: 60 };
    el.renderRoot = { querySelector: () => ({ getBoundingClientRect: () => rect }) };
    el.updated(); expect(el._shift).toBe(24);
    rect = { left: 350, right: 430 }; el._shift = 0; el.updated(); expect(el._shift).toBe(-34);
    el.renderRoot = { querySelector: () => null }; el.updated();
    el._show = false; el.updated(); expect(el._shift).toBe(0);
    el.disconnectedCallback();
  });
});

describe("wp-radial-day", () => {
  const spans = [
    { start: 360, end: 540, color: "#f00", label: "Morning", startSun: "up", startSpec: { sun: "sunrise", offset: 30 } },
    { start: 900, end: 1000, color: "#0f0", label: "Pm", endSun: "down", endSpec: { sun: "sunset" } },
    { start: 800, end: 800, color: "#00f", label: "Shot", marker: true },
  ] as any;
  const radial = (props: Record<string, unknown> = {}) => { const el = new WpRadialDay() as any; Object.assign(el, { spans, lang: "en" }, props); return el; };
  it("draws one ring with legend, sun icons and the now marker", () => {
    const html = flat(radial({ now: 600, rest: "Eco" }).render());
    expect(html).toContain("Morning"); expect(html).toContain("Eco");
    expect(html).toContain("mdi:weather-sunset-up"); expect(html).toContain("mdi:weather-sunset-down");
    expect(html).toContain("mdi:clock-outline");
    expect(html).not.toContain("class=\"rings\"");
  });
  it("draws two rings in double mode and ignores an invalid now", () => {
    const html = flat(radial({ double: true, now: 800 }).render());
    expect(html).toContain("class=\"rings\"");
    expect(html).toContain("mdi:clock-outline");
    expect(flat(radial({ now: 5000 }).render())).not.toContain("mdi:clock-outline");
    expect(flat(radial({ now: null }).render())).toContain("24 h");
  });
  it("opens the day from the dial", () => {
    const el = radial(); const seen: string[] = [];
    el.dispatchEvent = (e: any) => { seen.push(e.type); return true; };
    (globalThis as any).CustomEvent ??= class { type: string; constructor(t: string) { this.type = t; } };
    find(el.render(), "click", "button").fn.call(el);
    expect(seen).toEqual(["open-day"]);
  });
});

describe("shared editors", () => {
  const hass: any = { language: "fr", states: { "light.a": { entity_id: "light.a", attributes: { friendly_name: "A" } }, "switch.b": { entity_id: "switch.b", attributes: {} } } };
  beforeEach(() => { (globalThis as any).CustomEvent ??= class { type: string; detail: unknown; constructor(t: string, i: any) { this.type = t; this.detail = i?.detail; } }; vi.stubGlobal("customElements", { get: () => undefined }); });
  it("langOf prefers the locale", () => {
    expect(langOf(undefined)).toBe("en"); expect(langOf(hass)).toBe("fr");
    expect(langOf({ language: "fr", locale: { language: "de" } } as any)).toBe("de");
  });
  const picker = (props: Record<string, unknown> = {}) => {
    const el = new WpEntityPicker() as any; Object.assign(el, { hass, label: "Dev" }, props);
    const seen: unknown[] = []; el.dispatchEvent = (e: any) => { seen.push(e.detail); return true; };
    return { el, seen };
  };
  it("lists, filters and excludes entities", () => {
    expect(flat(picker().el.render())).toContain("switch.b");
    const only = flat(picker({ domains: ["light"] }).el.render());
    expect(only).toContain("light.a"); expect(only).not.toContain("switch.b");
    expect(flat(picker({ exclude: ["light.a"] }).el.render())).not.toContain("value=light.a");
    expect(flat(picker({ filter: (id: string) => id === "switch.b" }).el.render())).not.toContain("light.a");
  });
  it("emits only for known entities or an empty value", () => {
    const { el, seen } = picker();
    const r = el.render();
    find(r, "change", "input").fn({ target: { value: " light.a " } });
    find(r, "change", "input").fn({ target: { value: "" } });
    find(r, "change", "input").fn({ target: { value: "nope" } });
    find(r, "input", "input").fn({ target: { value: "switch.b" } });
    find(r, "input", "input").fn({ target: { value: "nope" } });
    expect(seen).toEqual(["light.a", "", "switch.b"]);
    const same = picker({ value: "light.a" });
    find(same.el.render(), "input", "input").fn({ target: { value: "light.a" } });
    expect(same.seen).toEqual([]);
  });
  it("uses ha-entity-picker when it exists and forwards its value", () => {
    vi.stubGlobal("customElements", { get: () => class {} });
    const { el, seen } = picker({ filter: (id: string) => id === "light.a" });
    const r = el.render();
    expect(flat(r)).toContain("ha-entity-picker");
    const stop = vi.fn();
    find(r, "value-changed", "ha-entity-picker").fn({ stopPropagation: stop, detail: { value: "light.a" } });
    find(r, "value-changed", "ha-entity-picker").fn({ stopPropagation: stop, detail: {} });
    expect(seen).toEqual(["light.a", ""]);
    const filterFn = (r.values.find((v: any) => typeof v === "function" && v.length === 1 && String(v).includes("entity_id")) as any);
    expect(filterFn({ entity_id: "light.a" })).toBe(true);
  });
  it("edits conditions: add, patch, parse values, delete", () => {
    const el = new WpConditionsEditor() as any;
    Object.assign(el, { hass, conditions: [{ entity_id: "light.a", op: "eq", value: "on", attribute: "mode" }] });
    const seen: any[] = []; el.dispatchEvent = (e: any) => { seen.push(e.detail); return true; };
    const r = el.render();
    expect(flat(r)).toContain("light.a");
    const hs = handlers(r);
    const by = (evn: string) => hs.filter((h) => h.event === evn);
    by("wp-change")[0].fn({ stopPropagation() {}, detail: "switch.b" });
    by("change")[0].fn({ target: { value: " " } });
    by("change")[1].fn({ target: { value: "gt" } });
    by("change")[2].fn({ target: { value: "12" } });
    by("change")[2].fn({ target: { value: "true" } });
    by("change")[2].fn({ target: { value: "txt" } });
    by("click")[0].fn(); by("click")[1].fn();
    expect(seen[0][0].entity_id).toBe("switch.b");
    expect(seen[1][0].attribute).toBeNull();
    expect(seen[2][0].op).toBe("gt");
    expect(seen.slice(3, 6).map((s) => s[0].value)).toEqual([12, true, "txt"]);
    expect(seen[6]).toEqual([]);
    expect(seen[7]).toHaveLength(2);
    const noAttr = new WpConditionsEditor() as any;
    Object.assign(noAttr, { hass, conditions: [{ entity_id: "light.a", value: "on" }] });
    noAttr.dispatchEvent = (e: any) => seen.push(e.detail);
    handlers(noAttr.render()).filter((h) => h.event === "change")[2].fn({ target: { value: "true" } });
    expect(seen.slice(-1)[0][0].value).toBe("true");
  });
});
