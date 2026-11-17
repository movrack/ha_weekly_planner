import { afterEach, describe, expect, it, vi } from "vitest";
const subscription = vi.hoisted(() => ({ subscribe: vi.fn() }));
vi.mock("../planner", async (original) => ({ ...await original<typeof import("../planner")>(), subscribePlanner: subscription.subscribe }));
import { WeeklyPlannerCardEditor } from "../card-editor";

afterEach(() => vi.restoreAllMocks());
describe("card editor snapshot subscription", () => {
  it("subscribes once, forwards pushed data, releases the listener and reconnects", () => {
    const el: any = new WeeklyPlannerCardEditor();
    el.hass = { language: "en" };
    el._loadDomainNames = vi.fn();
    Object.defineProperty(el, "isConnected", { value: true, configurable: true });
    Object.defineProperty(el, "renderRoot", { value: { querySelectorAll: () => [] }, configurable: true });
    const unsub = vi.fn();
    subscription.subscribe.mockReset().mockReturnValue(unsub);
    el.updated();
    expect(subscription.subscribe).toHaveBeenCalledTimes(1);
    expect(subscription.subscribe.mock.calls[0][0]).toBe(el.hass);
    const snapshot = { programs: [{ id: "a", name: "Alpha" }] };
    subscription.subscribe.mock.calls[0][1](snapshot);
    expect(el._data).toBe(snapshot);
    expect(el._programs).toEqual([{ id: "a", name: "Alpha" }]);
    el.updated();
    expect(subscription.subscribe).toHaveBeenCalledTimes(1);
    expect(el._loadDomainNames).toHaveBeenCalledTimes(2);
    el.disconnectedCallback();
    expect(unsub).toHaveBeenCalledOnce();
    expect(el._unsub).toBeUndefined();
    el.updated();
    expect(subscription.subscribe).toHaveBeenCalledTimes(2);
  });
  it.each(["disconnected", "missing hass"])("does not subscribe when %s", (reason) => {
    const el: any = new WeeklyPlannerCardEditor();
    el._loadDomainNames = vi.fn();
    if (reason === "disconnected") el.hass = { language: "en" };
    Object.defineProperty(el, "isConnected", { value: reason !== "disconnected" });
    Object.defineProperty(el, "renderRoot", { value: { querySelectorAll: () => [] } });
    subscription.subscribe.mockReset();
    el.updated();
    expect(subscription.subscribe).not.toHaveBeenCalled();
    expect(() => el.disconnectedCallback()).not.toThrow();
  });
});
