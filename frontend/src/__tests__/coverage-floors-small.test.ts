import { afterEach, describe, expect, it, vi } from "vitest";
import { entityHistories, parseSourceHistory } from "../chart-history";
import { syncSelectValues } from "../select-value";

// Coverage floors, file by file: the branches the main tests of these small modules leave out.

describe("parseSourceHistory: every shape of a history row", () => {
  it("reads minimal rows (a, lu, s), full rows (attributes, last_updated_ts, state) and ISO dates", () => {
    const rows = parseSourceHistory([
      { s: "1", a: { unit: "W" }, lu: 10 },
      { state: "2", lc: 20 }, // attributes carried over from the previous row
      { state: "3", attributes: { unit: "kW" }, last_updated_ts: 30 },
      { s: "4", last_updated: "1970-01-01T00:01:00Z" },
    ]);
    expect(rows.map((r) => [r.t, r.s, r.a])).toEqual([[10000, "1", { unit: "W" }], [20000, "2", { unit: "W" }], [30000, "3", { unit: "kW" }], [60000, "4", { unit: "kW" }]]);
  });
  it("drops a row without a usable date and turns a missing state into an empty text", () => {
    expect(parseSourceHistory([{ s: "1" }, { last_updated: "nope" }, { lu: 5 }])).toEqual([{ t: 5000, s: "", a: {} }]);
    expect(parseSourceHistory("not a list")).toEqual([]);
    expect(parseSourceHistory(undefined)).toEqual([]);
  });
});

describe("entityHistories: cache scope and expiry", () => {
  afterEach(() => vi.useRealTimers());
  it("falls back to the hass object as cache scope when there is no connection, and shares it", async () => {
    const callWS = vi.fn(async () => ({ "sensor.a": [{ s: "1", lu: 1 }] }));
    const hass: any = { callWS };
    await entityHistories(hass, ["sensor.a"], 0, 10_000);
    await entityHistories(hass, ["sensor.a"], 0, 10_000);
    expect(callWS).toHaveBeenCalledTimes(1);
    const other: any = { callWS, connection: {} };
    await entityHistories(other, ["sensor.a"], 0, 10_000);
    expect(callWS).toHaveBeenCalledTimes(2); // another connection, another cache
  });
  it("asks again once a still-open window's entry is a minute old, and keeps a closed window for good", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T10:00:00Z"));
    const now = Date.now();
    const callWS = vi.fn(async () => ({ "sensor.b": [{ s: "1", lu: 1 }] }));
    const hass: any = { callWS, connection: {} };
    await entityHistories(hass, ["sensor.b"], now - 3_600_000, now + 3_600_000); // end in the future: 60 s
    vi.setSystemTime(now + 30_000);
    await entityHistories(hass, ["sensor.b"], now - 3_600_000, now + 3_600_000);
    expect(callWS).toHaveBeenCalledTimes(1);
    vi.setSystemTime(now + 61_000);
    await entityHistories(hass, ["sensor.b"], now - 3_600_000, now + 3_600_000);
    expect(callWS).toHaveBeenCalledTimes(2);
    await entityHistories(hass, ["sensor.b"], 0, 10_000);
    vi.setSystemTime(now + 10 * 3_600_000);
    await entityHistories(hass, ["sensor.b"], 0, 10_000);
    expect(callWS).toHaveBeenCalledTimes(3); // the closed window was fetched once, then kept
  });
  it("forgets a failed request, but keeps a newer entry stored under the same key", async () => {
    const hass: any = { connection: {}, callWS: vi.fn().mockRejectedValueOnce(new Error("down")).mockResolvedValue({ "sensor.c": [{ s: "1", lu: 1 }] }) };
    const failed = vi.fn();
    expect(await entityHistories(hass, ["sensor.c"], 0, 10_000, failed)).toEqual({ "sensor.c": [] });
    expect(failed).toHaveBeenCalledWith("sensor.c");
    await entityHistories(hass, ["sensor.c"], 0, 10_000); // asks again: the failure was not kept
    expect(hass.callWS).toHaveBeenCalledTimes(2);
  });
  it("a duplicated id is asked once", async () => {
    const hass: any = { connection: {}, callWS: vi.fn(async () => ({ "sensor.d": [] })) };
    expect(await entityHistories(hass, ["sensor.d", "sensor.d"], 0, 10_000)).toEqual({ "sensor.d": [] });
    expect(hass.callWS.mock.calls[0][0].entity_ids).toEqual(["sensor.d"]);
  });
});

describe("syncSelectValues: a select without a value stays untouched", () => {
  it("a select already on its value is left alone, an empty data-value empties it", () => {
    const same: any = { dataset: { value: "a" }, value: "a" };
    const empty: any = { dataset: { value: "" }, value: "x" };
    syncSelectValues({ querySelectorAll: () => [same, empty] } as any);
    expect(same.value).toBe("a");
    expect(empty.value).toBe("");
  });
});

describe("reloadIfOutdated: the page reloads itself once per served version", () => {
  const load = async () => {
    const m = await import("../update");
    return { ...m, reloadIfOutdated: (served: string | null | undefined, idle: boolean) => m.reloadIfOutdated(served, idle, "old1") };
  };
  const setup = (stored: string | null, broken = false) => {
    const store = new Map<string, string>(stored ? [["weekly_planner_reloaded_for", stored]] : []);
    const reload = vi.fn();
    vi.stubGlobal("sessionStorage", broken ? { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } }
      : { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) });
    vi.stubGlobal("location", { reload });
    return { store, reload };
  };
  afterEach(() => vi.unstubAllGlobals());
  it("a bundle loaded without ?v= never reloads by itself", async () => {
    const { reload } = setup(null);
    const m = await import("../update");
    expect(m.runningVersion()).toBeNull();
    expect(m.reloadIfOutdated("new2", true)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
  it("does nothing while the page is busy", async () => {
    const { reload } = setup(null);
    expect((await load()).reloadIfOutdated("new2", false)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
  it("reloads when idle and outdated, and remembers the version it reloaded for", async () => {
    const { store, reload } = setup(null);
    expect((await load()).reloadIfOutdated("new2", true)).toBe(true);
    expect(reload).toHaveBeenCalledOnce();
    expect(store.get("weekly_planner_reloaded_for")).toBe("new2");
  });
  it("does not reload again for a version it already reloaded for, nor when the versions match", async () => {
    const { reload } = setup("new2");
    expect((await load()).reloadIfOutdated("new2", true)).toBe(false);
    expect((await load()).reloadIfOutdated("old1", true)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
  it("still reloads when the storage is blocked", async () => {
    const { reload } = setup(null, true);
    expect((await load()).reloadIfOutdated("new2", true)).toBe(true);
    expect(reload).toHaveBeenCalledOnce();
  });
});
