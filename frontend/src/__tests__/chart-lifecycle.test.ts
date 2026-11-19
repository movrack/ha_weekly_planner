import { describe, expect, it, vi } from "vitest";
import { LitElement } from "lit";
import { chart, useChartDay } from "./helpers/chart-component";

useChartDay();

describe("chart life cycle", () => {
  const lit = () => {
    vi.spyOn(LitElement.prototype, "connectedCallback").mockImplementation(() => {});
    vi.spyOn(LitElement.prototype, "disconnectedCallback").mockImplementation(() => {});
  };
  const observer = () => {
    const calls: any = { observe: vi.fn(), disconnect: vi.fn(), cb: null };
    vi.stubGlobal("ResizeObserver", class { constructor(cb: any) { calls.cb = cb; } observe = calls.observe; disconnect = calls.disconnect; });
    return calls;
  };
  it("watches its width: a real change is taken, a tiny or equal one is not", () => {
    lit();
    const o = observer();
    const c = chart();
    c.connectedCallback();
    c._width = 300;
    o.cb([{ contentRect: { width: 100 } }]);
    expect(c._width).toBe(300);
    o.cb([{ contentRect: { width: 300 } }]);
    expect(c._width).toBe(300);
    o.cb([{ contentRect: { width: 420 } }]);
    expect(c._width).toBe(420);
    c.renderRoot = { querySelector: () => ({}) };
    c.firstUpdated();
    expect(o.observe).toHaveBeenCalledOnce();
    c.renderRoot = { querySelector: () => null };
    c.firstUpdated();
    expect(o.observe).toHaveBeenCalledOnce();
  });
  it("lets go of everything when it leaves the page", () => {
    lit();
    const o = observer();
    const c = chart();
    c.connectedCallback();
    const stopRefresh = vi.fn();
    c._stopRefresh = stopRefresh;
    const token = c._token;
    c._openTimer = setTimeout(() => { throw new Error("open timer left"); }, 10);
    c._panLoadTimer = setTimeout(() => { throw new Error("pan timer left"); }, 10);
    c.disconnectedCallback();
    expect(o.disconnect).toHaveBeenCalledOnce();
    expect(stopRefresh).toHaveBeenCalledOnce();
    expect(c._token).toBe(token + 1);
    expect(c._stopRefresh).toBeUndefined();
    vi.advanceTimersByTime(20); // both timers were cleared: neither throws
    c.disconnectedCallback(); // a second time is harmless
    expect(stopRefresh).toHaveBeenCalledOnce();
  });
  it("the page refresh reloads only a running window of a visible page", () => {
    const c = chart();
    const load = vi.spyOn(c, "_load").mockResolvedValue(undefined);
    c._refresh();
    expect(load).toHaveBeenCalledOnce(); // today, the window is the whole day, now is inside
    (document as any).hidden = true;
    c._refresh();
    expect(load).toHaveBeenCalledOnce();
    (document as any).hidden = false;
    c.date = "2026-10-01";
    c._refresh();
    expect(load).toHaveBeenCalledOnce();
    c.hass = undefined; c.date = "2026-11-02";
    c._refresh();
    expect(load).toHaveBeenCalledOnce();
  });
});

