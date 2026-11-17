import { afterEach, describe, expect, it, vi } from "vitest";
import { WeeklyPlannerCardEditor } from "../card-editor";

const make = () => {
  const el: any = new WeeklyPlannerCardEditor();
  el.hass = { language: "en", states: {} };
  el._data = { programs: [], labels: [], status: {} };
  el._config = { type: "custom:weekly-planner-card" };
  return el;
};
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("card editor pointer ordering", () => {
  function drag(from = 0) {
    const el = make();
    const save = vi.spyOn(el, "_setOrder").mockImplementation(() => {});
    const listeners = new Map<string, (e?: any) => void>();
    const rows = [0, 1, 2].map((i) => ({
      getBoundingClientRect: () => ({ top: i * 20, bottom: i * 20 + 19 }),
      classList: { toggle: vi.fn(), remove: vi.fn() },
    }));
    const list = { querySelectorAll: vi.fn(() => rows) };
    const handle = {
      closest: vi.fn(() => list), setPointerCapture: vi.fn(),
      addEventListener: vi.fn((name, fn) => listeners.set(name, fn)),
      removeEventListener: vi.fn((name, fn) => { if (listeners.get(name) === fn) listeners.delete(name); }),
    };
    const preventDefault = vi.fn();
    el._drag({ currentTarget: handle, pointerId: 7, preventDefault }, ["a", "b", "c"], from);
    return { save, listeners, rows, handle, preventDefault };
  }
  it("captures the handle and moves to the row at either inclusive edge", () => {
    for (const clientY of [40, 59]) {
      const d = drag();
      expect(d.preventDefault).toHaveBeenCalledOnce();
      expect(d.handle.closest).toHaveBeenCalledWith(".order-list");
      expect(d.handle.setPointerCapture).toHaveBeenCalledWith(7);
      d.listeners.get("pointermove")!({ clientY });
      expect(d.rows[2].classList.toggle).toHaveBeenLastCalledWith("target", true);
      expect(d.rows[0].classList.toggle).toHaveBeenLastCalledWith("target", false);
      d.listeners.get("pointerup")!();
      expect(d.save).toHaveBeenCalledExactlyOnceWith(["b", "c", "a"]);
      expect(d.listeners.size).toBe(0);
      for (const row of d.rows) expect(row.classList.remove).toHaveBeenCalledWith("target");
    }
  });
  it("ignores coordinates outside rows and does not save an unchanged order", () => {
    const d = drag(1);
    d.listeners.get("pointermove")!({ clientY: -1 });
    d.listeners.get("pointermove")!({ clientY: 60 });
    d.listeners.get("pointermove")!({ clientY: 20 });
    expect(d.rows[1].classList.toggle).toHaveBeenLastCalledWith("target", false);
    d.listeners.get("pointerup")!();
    expect(d.save).not.toHaveBeenCalled();
    expect(d.listeners.size).toBe(0);
  });
  it("cancels a pending move and removes all pointer listeners", () => {
    const d = drag();
    d.listeners.get("pointermove")!({ clientY: 25 });
    d.listeners.get("pointercancel")!();
    expect(d.save).not.toHaveBeenCalled();
    expect(d.listeners.size).toBe(0);
    for (const row of d.rows) expect(row.classList.remove).toHaveBeenCalledWith("target");
  });
});

describe("card editor embedded editor ownership", () => {
  it("retains a draft while refreshing its inputs and relays saves", () => {
    const el = make();
    const listeners = new Map<string, (e: any) => void>();
    const editor: any = { addEventListener: vi.fn((name, fn) => listeners.set(name, fn)) };
    const createElement = vi.fn(() => editor);
    vi.stubGlobal("document", { createElement });
    const saved = vi.spyOn(el, "_saved").mockImplementation(() => {});
    const program = { id: "a" };
    expect(el._programEditor("a", program)).toBe(editor);
    expect(createElement).toHaveBeenCalledExactlyOnceWith("wp-program-editor");
    expect(editor.embedded).toBe(true);
    expect(editor.hass).toBe(el.hass);
    expect(editor.data).toBe(el._data);
    expect(editor.program).toBe(program);
    const event = { detail: program };
    listeners.get("program-saved")!(event);
    expect(saved).toHaveBeenCalledExactlyOnceWith(event);
    const next = { id: "a", name: "Updated" };
    el.hass = { language: "fr" }; el._data = { programs: [next] };
    expect(el._programEditor("a", next)).toBe(editor);
    expect(createElement).toHaveBeenCalledTimes(1);
    expect(editor.program).toBe(next);
    expect(editor.hass).toBe(el.hass);
    expect(editor.data).toBe(el._data);
  });
  it.each([true, false])("deletes only the matching draft and leaves single mode only for its selected id (%s)", (selected) => {
    const el = make();
    let deleted: (e: any) => void = () => {};
    vi.stubGlobal("document", { createElement: () => ({ addEventListener: (name: string, fn: any) => { if (name === "program-deleted") deleted = fn; } }) });
    el._config.program = selected ? "a" : "b";
    el._justCreated = { id: selected ? "a" : "other" };
    const retained = el._justCreated;
    el._programEditor("a");
    el._editors.set("other", {});
    const mode = vi.spyOn(el, "_setMode").mockImplementation(() => {});
    const stopPropagation = vi.fn();
    deleted({ detail: "a", stopPropagation });
    expect(stopPropagation).toHaveBeenCalledOnce();
    expect(el._editors.has("a")).toBe(false);
    expect(el._editors.has("other")).toBe(true);
    expect(el._editing).toBe("");
    expect(el._justCreated).toBe(selected ? undefined : retained);
    if (selected) expect(mode).toHaveBeenCalledExactlyOnceWith(false);
    else expect(mode).not.toHaveBeenCalled();
  });
});
