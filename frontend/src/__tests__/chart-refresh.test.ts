import { expect, it, vi } from "vitest";
it("shares one chart cadence, pauses hidden refresh and cleans up the final consumer", async () => {
  vi.resetModules(); vi.useFakeTimers();
  const callbacks = new Map<string, () => void>();
  const document = { hidden: false, addEventListener: vi.fn((name, callback) => callbacks.set(name, callback)), removeEventListener: vi.fn((name) => callbacks.delete(name)) };
  vi.stubGlobal("document", document);
  try {
    const { subscribeChartRefresh } = await import("../chart-refresh");
    const a = vi.fn(), b = vi.fn();
    const offA = subscribeChartRefresh(a), offB = subscribeChartRefresh(b);
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(a).toHaveBeenCalledOnce(); expect(b).toHaveBeenCalledOnce();
    document.hidden = true;
    await vi.advanceTimersByTimeAsync(60_000);
    expect(a).toHaveBeenCalledOnce();
    document.hidden = false;
    callbacks.get("visibilitychange")!();
    expect(a).toHaveBeenCalledTimes(2);
    offA(); offB();
    expect(vi.getTimerCount()).toBe(0);
    expect(callbacks.size).toBe(0);
  } finally { vi.useRealTimers(); vi.unstubAllGlobals(); }
});
