import { describe, expect, it, vi } from "vitest";
import type { HomeAssistant, PlannerData } from "../types";

const snapshot = (enabled: boolean) => ({ programs: [{ id: "p", enabled }] }) as PlannerData;

describe("shared planner subscription", () => {
  it("broadcasts program enable changes to every view and restores a returning view from live data", async () => {
    vi.resetModules();
    const { subscribePlanner } = await import("../planner");
    let push!: (data: PlannerData) => void;
    const stop = vi.fn();
    const subscribeMessage = vi.fn((cb: typeof push) => { push = cb; return Promise.resolve(stop); });
    const hass = { connection: { subscribeMessage } } as unknown as HomeAssistant;
    const bar = vi.fn(), radial = vi.fn(), list = vi.fn();
    const offBar = subscribePlanner(hass, bar);
    let offRadial = subscribePlanner(hass, radial);
    const offList = subscribePlanner(hass, list);
    push(snapshot(true));
    offRadial();
    push(snapshot(false));
    expect(bar.mock.lastCall?.[0].programs[0].enabled).toBe(false);
    expect(list.mock.lastCall?.[0].programs[0].enabled).toBe(false);
    offRadial = subscribePlanner(hass, radial);
    expect(radial.mock.lastCall?.[0].programs[0].enabled).toBe(false);
    push(snapshot(true));
    for (const view of [bar, radial, list]) expect(view.mock.lastCall?.[0].programs[0].enabled).toBe(true);
    expect(subscribeMessage).toHaveBeenCalledTimes(1);
    offBar(); offRadial(); offList();
    await Promise.resolve();
    expect(stop).toHaveBeenCalledOnce();
  });

  it("starts a fresh subscription after all views leave without replaying an old toggle state", async () => {
    vi.resetModules();
    const { subscribePlanner } = await import("../planner");
    let push!: (data: PlannerData) => void;
    const subscribeMessage = vi.fn((cb: typeof push) => { push = cb; return Promise.resolve(vi.fn()); });
    const hass = { connection: { subscribeMessage } } as unknown as HomeAssistant;
    const off = subscribePlanner(hass, vi.fn());
    push(snapshot(true));
    off();
    const returned = vi.fn();
    const offReturned = subscribePlanner(hass, returned);
    expect(returned).not.toHaveBeenCalled();
    push(snapshot(false));
    expect(returned.mock.lastCall?.[0].programs[0].enabled).toBe(false);
    expect(subscribeMessage).toHaveBeenCalledTimes(2);
    offReturned();
  });
});
