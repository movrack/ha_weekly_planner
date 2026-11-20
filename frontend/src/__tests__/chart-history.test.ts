import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { entityHistories, parseSourceHistory } from "../chart-history";

const chartHass = (): any => ({ language: "en", config: { time_zone: "UTC" }, states: {} });
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-01T12:00:00Z")); });
afterEach(() => vi.useRealTimers());

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

describe("entityHistories", () => {
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
  it("isolates a failed history, reports it and asks again rather than caching the failure", async () => {
    const hass: any = { connection: {}, callWS: vi.fn().mockRejectedValueOnce(new Error("down")).mockResolvedValue({ "sensor.c": [{ s: "1", lu: 1 }] }) };
    const failed = vi.fn();
    expect(await entityHistories(hass, ["sensor.c"], 0, 10_000, failed)).toEqual({ "sensor.c": [] });
    expect(failed).toHaveBeenCalledWith("sensor.c");
    expect(await entityHistories(hass, ["sensor.c"], 0, 10_000)).toEqual({ "sensor.c": [{ t: 1000, s: "1", a: {} }] }); // the failure was not kept
    expect(hass.callWS).toHaveBeenCalledTimes(2);
  });
  it("a duplicated id is asked once", async () => {
    const hass: any = { connection: {}, callWS: vi.fn(async () => ({ "sensor.d": [] })) };
    expect(await entityHistories(hass, ["sensor.d", "sensor.d"], 0, 10_000)).toEqual({ "sensor.d": [] });
    expect(hass.callWS.mock.calls[0][0].entity_ids).toEqual(["sensor.d"]);
  });
  it("batches sources, shares in-flight requests and keeps gaps instead of future history", async () => {
    const h=chartHass(); h.callWS=vi.fn(async (m:any)=>Object.fromEntries(m.entity_ids.map((id:string)=>[id,[{lu:1,s:"12",a:{}}]])));
    const a=entityHistories(h,["sensor.temp","sensor.humidity"],0,10000), b=entityHistories(h,["sensor.temp"],0,10000);
    expect((await a)["sensor.temp"]).toHaveLength(1);await b;expect(h.callWS).toHaveBeenCalledOnce();
    expect(await entityHistories(h,["sensor.temp"],Date.now()+1,Date.now()+1000)).toEqual({"sensor.temp":[]});
    expect(h.callWS).toHaveBeenCalledOnce();
  });
  it("returns every entity of a call even if the shared cache evicts early entries", async () => {
    const h=chartHass();h.callWS=vi.fn(async(m:any)=>Object.fromEntries(m.entity_ids.map((id:string)=>[id,[{lu:1,s:"1"}]])));
    const result=await entityHistories(h,Array.from({length:130},(_,i)=>`sensor.x${i}`),0,10000);
    expect(Object.values(result).every(points=>points.length===1)).toBe(true);expect(Object.keys(result)).toHaveLength(130);
  });
});
