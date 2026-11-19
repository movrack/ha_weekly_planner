import { describe, expect, it, vi } from "vitest";
import { dayBounds } from "../components/chart";
import { chart, dayStart, useChartDay } from "./helpers/chart-component";
import { flat, handlers } from "./helpers/tpl";

useChartDay();

describe("chart: history link, wheel and clocks", () => {
  it("the history link covers the shown window of the device and opens through an event", () => {
    const c = chart();
    const seen: any[] = [];
    c.dispatchEvent = (e: any) => { seen.push(e); return true; };
    const path: string = c._historyPath;
    expect(path.startsWith("/history?")).toBe(true);
    expect(path).toContain("entity_id=climate.room");
    expect(path).toContain("start_date=2026-11-02T00%3A00%3A00.000Z");
    c._open();
    expect(seen[0].detail).toBe(path);
  });
  it("a sideways wheel slides the window; a mostly vertical one does nothing; no model, no effect", () => {
    const c = chart({ _width: 400 });
    const e = (dx: number, dy: number, ctrl = false) => ({ deltaX: dx, deltaY: dy, ctrlKey: ctrl, preventDefault: vi.fn(), clientX: 100 });
    const none = e(40, 0);
    c._wheel(none);
    expect(none.preventDefault).not.toHaveBeenCalled(); // no model yet
    c._model = c._build({ hist: [], log: [], sent: [] });
    c._zoom = { from: 120, to: 600 };
    const side = e(40, 5);
    c._wheel(side);
    expect(side.preventDefault).toHaveBeenCalledOnce();
    expect(c._zoom.from).toBeGreaterThan(120);
    const vertical = e(5, 40);
    c._wheel(vertical);
    expect(vertical.preventDefault).not.toHaveBeenCalled();
  });
  it("the clocks of a zoom beyond the day carry the date, in the 24 h and in the language format", () => {
    const c = chart();
    c._model = c._build({ hist: [], log: [], sent: [] });
    c._zoom = { from: -120, to: 1500 };
    c.hass = { ...c.hass, locale: { time_format: "24" } };
    expect(c._clock(60, 1440)).toMatch(/^\d{1,2}\/\d{1,2}.*\d/);
    c.hass = { ...c.hass, locale: { time_format: "language" } };
    c._model = c._build({ hist: [], log: [], sent: [] });
    expect(c._clock(60, 1440)).toMatch(/^\d{1,2}\/\d{1,2}.*\d/);
    c._zoom = null;
    expect(c._clock(1440, 1440)).toMatch(/24|midnight/i);
    expect(c._clock(525, 1440)).toMatch(/8/);
  });
  it("the date of the window is one date for one day, two for a window across days", () => {
    const c = chart();
    c._zoom = null;
    expect(c._windowDate()).not.toContain("–");
    c._zoom = { from: 1200, to: 1700 };
    expect(c._windowDate()).toContain("–");
  });
});

describe("chart: zoom bar and keyboard on the graph", () => {
  it("the zoom bar offers the previous and next window, and a way back when zoomed", () => {
    const c = chart();
    c._model = c._build({ hist: [], log: [], sent: [] });
    c._zoom = { from: 100, to: 700 };
    const tpl = c.render();
    expect(flat(tpl)).toContain("return-day");
    const clicks = handlers(tpl).filter((h) => h.event === "click");
    const [previous, next, back] = clicks.slice(-3);
    previous.fn();
    expect(c._zoom.from).toBeLessThan(100);
    next.fn();
    back.fn(); // back to the day
    expect(c._zoom).toBeNull();
  });
  it("the graph opens the history on Enter or Space and sends other keys to the zoom keys; double click resets", () => {
    const c = chart();
    c._model = c._build({ hist: [{ t: dayStart, s: "heat", a: {} }], log: [], sent: [] });
    const open = vi.spyOn(c, "_open").mockImplementation(() => {});
    const zoomKey = vi.spyOn(c, "_zoomKey").mockImplementation(() => {});
    const tpl = c.render();
    const key = handlers(tpl).find((h) => h.event === "keydown")!;
    const enter = { key: "Enter", preventDefault: vi.fn() };
    key.fn(enter);
    key.fn({ key: " ", preventDefault: vi.fn() });
    expect(open).toHaveBeenCalledTimes(2);
    expect(enter.preventDefault).toHaveBeenCalled();
    key.fn({ key: "+", preventDefault: vi.fn() });
    expect(zoomKey).toHaveBeenCalledOnce();
    c._zoom = { from: 100, to: 700 };
    handlers(tpl).find((h) => h.event === "dblclick")!.fn();
    expect(c._zoom).toBeNull();
    const click = vi.spyOn(c, "_click").mockImplementation(() => {});
    handlers(tpl).find((h) => h.event === "click")!.fn();
    expect(click).toHaveBeenCalled();
    for (const ev of ["pointerdown", "pointermove", "pointerup", "pointercancel", "wheel"]) {
      const spy = vi.spyOn(c, ({ pointerdown: "_down", pointermove: "_move", pointerup: "_up", pointercancel: "_up", wheel: "_wheel" } as any)[ev]).mockImplementation(() => {});
      handlers(c.render()).filter((h) => h.event === ev).forEach((h) => h.fn({}));
      expect(spy).toHaveBeenCalled();
    }
  });
});


describe("the day of the chart", () => {
  it("has the real length of a time-change day", () => {
    const hours = (d: string) => { const b = dayBounds(d, "Europe/Brussels"); return (b.endMs - b.startMs) / 3_600_000; };
    expect(hours("2026-10-26")).toBe(24);
    expect(hours("2026-10-25")).toBe(25); // end of summer time
    expect(hours("2026-03-29")).toBe(23);
  });
});
