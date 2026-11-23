import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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


it("recovers a rejected subscription and cancels retry after the last consumer leaves", async () => {
  vi.resetModules(); vi.useFakeTimers();
  try {
    const { subscribePlanner } = await import("../planner");
    const subscribeMessage = vi.fn().mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(vi.fn());
    const off = subscribePlanner({ connection: { subscribeMessage } } as unknown as HomeAssistant, vi.fn());
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(1000);
    expect(subscribeMessage).toHaveBeenCalledTimes(2);
    off();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(subscribeMessage).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  } finally { vi.useRealTimers(); }
});

describe("planner: subscription, names and helpers", () => {
  const sync = vi.fn();
  beforeEach(() => { vi.useFakeTimers(); vi.resetModules(); sync.mockClear(); vi.doMock("../preview-cache", async (orig) => ({ ...(await orig<any>()), syncPreviewCache: sync })); });
  afterEach(() => { vi.useRealTimers(); vi.doUnmock("../preview-cache"); vi.unstubAllGlobals(); });
  const hassWith = (subscribe: any): any => ({ connection: { subscribeMessage: subscribe }, states: {} });

  it("subscribes once with the planner message; each answer is stored, synced and sent to every listener; a late listener gets the last data", async () => {
    const { subscribePlanner } = await import("../planner");
    const unsub = vi.fn();
    const subscribe = vi.fn(async () => unsub);
    const hass = hassWith(subscribe);
    const a = vi.fn(), b = vi.fn();
    const off = subscribePlanner(hass, a);
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect((subscribe.mock.calls as any[][])[0][1]).toEqual({ type: "weekly_planner/subscribe" });
    const data = { programs: [] } as any;
    (subscribe.mock.calls[0] as any[])[0](data);
    expect(a).toHaveBeenCalledWith(data);
    expect(sync).toHaveBeenCalledWith(data);
    subscribePlanner(hass, b);
    expect(b).toHaveBeenCalledWith(data); // from the stored data
    expect(subscribe).toHaveBeenCalledTimes(1);
    off();
    expect(unsub).not.toHaveBeenCalled(); // one listener left
  });
  it("the last listener leaving releases the subscription, forgets the data and ignores answers still on the way", async () => {
    const { subscribePlanner } = await import("../planner");
    const unsub = vi.fn();
    const subscribe = vi.fn(async () => unsub);
    const hass = hassWith(subscribe);
    const a = vi.fn();
    const off = subscribePlanner(hass, a);
    const staleCallback = (subscribe.mock.calls as any[][])[0][0] as any;
    staleCallback({ n: 1 });
    off();
    await vi.advanceTimersByTimeAsync(0);
    expect(unsub).toHaveBeenCalledTimes(1);
    a.mockClear(); sync.mockClear();
    staleCallback({ n: 2 });
    expect(a).not.toHaveBeenCalled();
    expect(sync).not.toHaveBeenCalled();
    const b = vi.fn();
    subscribePlanner(hass, b);
    expect(b).not.toHaveBeenCalled(); // the old data is gone
    expect(subscribe).toHaveBeenCalledTimes(2);
  });
  it("a failed subscription retries after 1 s, then 2 s, 4 s… never more than 30 s, and an answer resets the wait", async () => {
    const { subscribePlanner } = await import("../planner");
    const subscribe = vi.fn(() => Promise.reject(new Error("down")));
    subscribePlanner(hassWith(subscribe), vi.fn());
    const callsAfter = async (ms: number) => { await vi.advanceTimersByTimeAsync(ms); return subscribe.mock.calls.length; };
    expect(await callsAfter(999)).toBe(1);
    expect(await callsAfter(1)).toBe(2);
    expect(await callsAfter(1999)).toBe(2);
    expect(await callsAfter(1)).toBe(3);
    expect(await callsAfter(3999)).toBe(3);
    expect(await callsAfter(1)).toBe(4);
    let n = 4;
    for (const wait of [8000, 16000, 30000, 30000]) { expect(await callsAfter(wait - 1)).toBe(n); expect(await callsAfter(1)).toBe(++n); }
  });
  it("a failure after the listeners left, or after a newer subscription, does not retry", async () => {
    const { subscribePlanner } = await import("../planner");
    let fail: (e: Error) => void = () => {};
    const subscribe = vi.fn(() => new Promise((_, rej) => { fail = rej; }));
    const off = subscribePlanner(hassWith(subscribe), vi.fn());
    off();
    fail(new Error("x"));
    await vi.advanceTimersByTimeAsync(60_000);
    expect(subscribe).toHaveBeenCalledTimes(1);
  });
  it("a failure with no listener left in the same generation does not schedule a retry", async () => {
    const { subscribePlanner } = await import("../planner");
    let fail: (e: Error) => void = () => {};
    const subscribe = vi.fn(() => new Promise((_, rej) => { fail = rej; }));
    const listener = vi.fn();
    subscribePlanner(hassWith(subscribe), listener);
    fail(new Error("x"));
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(1); // the retry
    const off = subscribePlanner(hassWith(subscribe), vi.fn()); // retry pending: no immediate connection
    expect(subscribe).toHaveBeenCalledTimes(1);
    off();
  });
  it("leaving while a retry waits cancels it", async () => {
    const { subscribePlanner } = await import("../planner");
    const subscribe = vi.fn(() => Promise.reject(new Error("x")));
    const off = subscribePlanner(hassWith(subscribe), vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(1);
    off();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(subscribe).toHaveBeenCalledTimes(1);
  });
  it("a listener that leaves while another stays keeps the generation: answers still arrive", async () => {
    const { subscribePlanner } = await import("../planner");
    const subscribe = vi.fn(async () => vi.fn());
    const a = vi.fn(), b = vi.fn();
    const offA = subscribePlanner(hassWith(subscribe), a);
    subscribePlanner(hassWith(subscribe), b);
    offA();
    (subscribe.mock.calls[0] as any[])[0]({ n: 1 });
    expect(b).toHaveBeenCalledWith({ n: 1 });
    expect(a).not.toHaveBeenCalled();
  });
  it("program names and ids: accents, case and spaces are ignored; a blank reference matches nothing", async () => {
    const { normalizeName, selectedProgramIds, filterPrograms } = await import("../planner");
    expect(normalizeName("  Salón ÉTÉ ")).toBe("salon ete");
    const programs = [{ id: "a", name: "Salon" }, { id: "b", name: "" }, { id: "c", name: "salón" }];
    expect([...selectedProgramIds(programs, ["  SALÓN "])].sort()).toEqual(["a", "c"]);
    expect([...selectedProgramIds(programs, ["   "])]).toEqual([]);
    expect([...selectedProgramIds(programs, ["b", "zzz"])]).toEqual(["b"]);
    const data: any = { programs: [{ id: "m", name: "M", priority: 1, entities: [{ entity_id: "cover.a" }, { entity_id: "light.b" }] }, { id: "n", name: "N", priority: 1, entities: [{ entity_id: "fan.a" }] }] };
    expect(filterPrograms(data, { filter: { types: ["cover"] } }).map((p) => p.id)).toEqual(["m"]);
  });
  it("numbers keep one decimal; new ids are 12 hex characters, padded", async () => {
    const { fmtNum, newId } = await import("../planner");
    expect(fmtNum("en", 1.26)).toBe("1.3");
    expect(fmtNum("en", 1000.04)).toBe("1,000");
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(newId()).toBe("800000000000");
    vi.restoreAllMocks();
  });
  it("the HA selector is loaded through the card helpers, then waited for at most 3 s", async () => {
    const { ensureHaSelector } = await import("../planner");
    let defined = false;
    const whenDefined = vi.fn(() => new Promise(() => {}));
    vi.stubGlobal("customElements", { get: vi.fn(() => (defined ? {} : undefined)), whenDefined });
    expect(await (async () => { defined = true; return ensureHaSelector(); })()).toBe(true);
    defined = false;
    const getConfigElement = vi.fn(async () => {});
    const createCardElement = vi.fn(async () => ({ constructor: { getConfigElement } }));
    const card = { constructor: { getConfigElement } };
    const loadCardHelpers = vi.fn(async () => ({ createCardElement: vi.fn(async () => card) }));
    vi.stubGlobal("window", { loadCardHelpers });
    const result = ensureHaSelector();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(2999);
    let settled = false; void result.then(() => { settled = true; });
    await vi.advanceTimersByTimeAsync(0);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await result).toBe(false);
    expect(loadCardHelpers).toHaveBeenCalled();
    expect(getConfigElement).toHaveBeenCalled();
    expect(whenDefined).toHaveBeenCalledWith("ha-selector");
    void createCardElement;
    const helpers = { createCardElement: vi.fn(async () => card) };
    vi.stubGlobal("window", { loadCardHelpers: async () => helpers });
    const second = ensureHaSelector();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(3000);
    await second;
    expect(helpers.createCardElement).toHaveBeenCalledWith({ type: "button", entity: "sun.sun" });
    vi.stubGlobal("window", {});
    const bare = ensureHaSelector();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(3000);
    await expect(bare).resolves.toBe(false);
    vi.stubGlobal("window", { loadCardHelpers: async () => { throw new Error("x"); } });
    await expect(ensureHaSelector()).resolves.toBe(false);
  });
});
