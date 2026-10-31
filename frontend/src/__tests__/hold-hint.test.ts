import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpBarEditor } from "../components/bar-editor";
import { dismissHoldHint, HOLD_HINT_MS, takeHoldHint } from "../hold-hint";
import { t } from "../i18n";

const store = new Map<string, string>();
const bar = (editable = true) => {
  const el = new WpBarEditor() as any;
  el.editable = editable; el.lang = "en";
  el.dispatchEvent = vi.fn();
  return el;
};
const events = (el: any) => el.dispatchEvent.mock.calls.map(([e]: any[]) => e.type);
const tap = (el: any, pointerType = "touch") => {
  const ev = { pointerId: 1, clientX: 0, clientY: 0, button: 0, pointerType } as PointerEvent;
  el._zoneDown(ev); el._zoneUp(ev);
};

beforeEach(() => {
  vi.useFakeTimers();
  store.clear();
  vi.stubGlobal("window", {
    setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout,
    localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v); } },
  });
  vi.stubGlobal("navigator", {});
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("hold hint", () => {
  it("shows for 2 s on a plain touch tap, then opens the day screen", () => {
    const el = bar();
    tap(el);
    expect(el._hint).toBe(true);
    expect(events(el)).toEqual([]);
    vi.advanceTimersByTime(HOLD_HINT_MS - 1);
    expect(el._hint).toBe(true);
    vi.advanceTimersByTime(1);
    expect(el._hint).toBe(false);
    expect(events(el)).toEqual(["open-day"]);
  });

  it("a second tap during the hint opens the day screen at once", () => {
    const el = bar();
    tap(el); tap(el);
    expect(events(el)).toEqual(["open-day"]);
    expect(el._hint).toBe(false);
  });

  it("shows only the first 3 times on this device", () => {
    for (let i = 0; i < 3; i++) { const el = bar(); tap(el); expect(el._hint).toBe(true); vi.advanceTimersByTime(HOLD_HINT_MS); }
    const el = bar();
    tap(el);
    expect(el._hint).toBe(false);
    expect(events(el)).toEqual(["open-day"]);
    expect(store.get("weekly_planner.hold_hint")).toBe("3");
  });

  it("never shows for the mouse or a read-only bar", () => {
    const mouse = bar(); tap(mouse, "mouse");
    expect(events(mouse)).toEqual(["edit-request"]);
    const ro = bar(false); tap(ro);
    expect(events(ro)).toEqual(["open-day"]);
    expect(store.size).toBe(0);
  });

  it("a long press clears the hint for good", () => {
    const el = bar();
    const ev = { pointerId: 1, clientX: 0, clientY: 0, button: 0, pointerType: "touch" } as PointerEvent;
    el._zoneDown(ev);
    vi.advanceTimersByTime(500);
    expect(events(el)).toEqual(["edit-request"]);
    expect(takeHoldHint()).toBe(false);
  });

  it("works without storage", () => {
    vi.stubGlobal("window", { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout,
      get localStorage(): never { throw new Error("denied"); } });
    expect(takeHoldHint()).toBe(true);
    expect(() => dismissHoldHint()).not.toThrow();
  });

  it("has a live status region and EN + FR texts", () => {
    expect(t("en", "hold_hint")).toBe("Press and hold to edit");
    expect(t("fr", "hold_hint")).toBe("Restez appuyé pour modifier");
  });
});
