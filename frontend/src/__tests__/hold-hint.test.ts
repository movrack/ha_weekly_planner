import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpBarEditor } from "../components/bar-editor";
import { dismissHoldHint, HOLD_HINT_MS } from "../hold-hint";
import { t } from "../i18n";

const store = new Map<string, string>();
const KEY = "weekly_planner.hold_hint";
const writes: string[] = [];
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
  store.clear(); writes.length = 0;
  vi.stubGlobal("window", {
    setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout,
    localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { writes.push(k); store.set(k, v); } },
  });
  vi.stubGlobal("navigator", {});
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("hold hint", () => {
  it("shows for 2 s on a plain tap or click and never opens anything", () => {
    for (const type of ["touch", "mouse"]) {
      const el = bar();
      tap(el, type);
      expect(el._hint).toBe(true);
      expect(events(el)).toEqual([]);
      vi.advanceTimersByTime(HOLD_HINT_MS - 1);
      expect(el._hint).toBe(true);
      vi.advanceTimersByTime(1);
      expect(el._hint).toBe(false);
      expect(events(el)).toEqual([]);
    }
  });

  it("a second tap during the hint keeps the hint and still opens nothing", () => {
    const el = bar();
    tap(el); tap(el);
    expect(events(el)).toEqual([]);
    expect(el._hint).toBe(true);
  });

  it("shows every time, not only the first 3", () => {
    for (let i = 0; i < 5; i++) { const el = bar(); tap(el); expect(el._hint).toBe(true); vi.advanceTimersByTime(HOLD_HINT_MS); }
  });

  it("a mouse press and hold enters the edit mode; a read-only bar does nothing on a click", () => {
    const mouse = bar();
    const ev = { pointerId: 1, clientX: 0, clientY: 0, button: 0, pointerType: "mouse" } as PointerEvent;
    mouse._zoneDown(ev);
    vi.advanceTimersByTime(500);
    expect(events(mouse)).toEqual(["edit-request"]);
    const ro = bar(false); tap(ro);
    expect(events(ro)).toEqual([]);
  });

  it("a long press clears the hint for good", () => {
    const el = bar();
    const ev = { pointerId: 1, clientX: 0, clientY: 0, button: 0, pointerType: "touch" } as PointerEvent;
    el._zoneDown(ev);
    vi.advanceTimersByTime(500);
    expect(events(el)).toEqual(["edit-request"]);
    expect(store.get(KEY)).toBe("5");
  });

  it("a touch long press enters the quick edit on a bar and on both dials, and a short tap does not", () => {
    for (const view of ["bar", "radial", "radial_12h"]) {
      const el = bar(); el.view = view;
      const ev = { pointerId: 1, clientX: 0, clientY: 0, button: 0, pointerType: "touch" } as PointerEvent;
      el._zoneDown(ev);
      vi.advanceTimersByTime(449);
      expect(events(el)).toEqual([]);
      vi.advanceTimersByTime(1);
      expect(events(el)).toEqual(["edit-request"]);
      el._zoneUp(ev);
      expect(events(el)).toEqual(["edit-request"]);
    }
  });

  it("works without storage", () => {
    vi.stubGlobal("window", { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout,
      get localStorage(): never { throw new Error("denied"); } });
    expect(() => dismissHoldHint()).not.toThrow();
  });

  it("has a live status region and EN + FR texts", () => {
    expect(t("en", "hold_hint")).toBe("Keep your finger down to edit");
    expect(t("fr", "hold_hint")).toBe("Gardez le doigt appuyé pour modifier");
  });

  it("a click without a pointer (screen reader, switch, voice) opens the edit mode; a mouse click does not", () => {
    const el = bar();
    const target = {};
    el._zoneClick({ detail: 0, target, currentTarget: target });
    expect(events(el)).toEqual(["edit-request"]);
    const mouse = bar();
    mouse._zoneClick({ detail: 1, target, currentTarget: target });
    expect(events(mouse)).toEqual([]);
    const locked = bar(false); locked.lockedReason = "x";
    locked._zoneClick({ detail: 0, target, currentTarget: target });
    expect(events(locked)).toEqual(["locked-request"]);
  });
});

describe("hold hint counter", () => {
  it("the hint stays 6 s on screen", () => {
    expect(HOLD_HINT_MS).toBe(6000);
  });

  it.each([["2", "5", 1], ["1", "5", 1], ["5", "5", 0], ["7", "7", 0]])(
    "dismissing a count of %s leaves %s and writes %i time(s): it never lowers a count at or above the maximum", (before, after, written) => {
      store.set(KEY, before);
      dismissHoldHint();
      expect(store.get(KEY)).toBe(after);
      expect(writes).toHaveLength(written);
    });
});

describe("hold hint stacking", () => {
  it("the hint bubble is stacked above the now line (z-index above 5)", () => {
    const css = [WpBarEditor.styles].flat(Infinity).map((s: any) => s?.cssText ?? "").join("\n");
    const hint = css.match(/\.hold-hint \{[^}]*z-index: (\d+)/);
    expect(Number(hint?.[1])).toBeGreaterThan(5);
  });
});
