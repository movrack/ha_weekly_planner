import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LitElement } from "lit";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { currentTimeFormat } from "../time";
import { listCard, mkHass, simpleProgram as program } from "./helpers/planner-card";

const mocks = vi.hoisted(() => ({ reload: vi.fn(), subscribe: vi.fn(), onNames: vi.fn() }));
vi.mock("../update", async (orig) => ({ ...(await orig<any>()), reloadIfOutdated: mocks.reload }));
vi.mock("../planner", async (orig) => ({ ...(await orig<any>()), subscribePlanner: mocks.subscribe }));
vi.mock("../services", async (orig) => ({ ...(await orig<any>()), onServiceNames: mocks.onNames }));

const card = (programs: any[], config: any = {}, data: any = {}, hass: any = {}) =>
  listCard(programs, config, data, mkHass({ callWS: vi.fn(async () => ({ card_version: "9" })), ...hass }));

let intervals: { fn: () => void; ms: number }[];
let doc: any;
beforeEach(() => {
  vi.useFakeTimers();
  intervals = [];
  doc = { addEventListener: vi.fn(), removeEventListener: vi.fn(), hidden: false, createElement: vi.fn((n: string) => ({ tag: n })) };
  vi.stubGlobal("document", doc);
  vi.stubGlobal("window", { setTimeout: globalThis.setTimeout, clearTimeout: vi.fn(), setInterval: vi.fn((fn: () => void, ms: number) => { intervals.push({ fn, ms }); return 77; }), clearInterval: vi.fn(),
    localStorage: { getItem: () => null, setItem: () => {} } });
  mocks.onNames.mockReturnValue(vi.fn());
  mocks.subscribe.mockReturnValue(vi.fn());
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.clearAllMocks(); });


describe("life cycle", () => {
  it("connecting subscribes to the names, ticks every minute, and listens to the page visibility; disconnecting undoes all", () => {
    const up = vi.spyOn(LitElement.prototype, "connectedCallback").mockImplementation(() => {});
    const down = vi.spyOn(LitElement.prototype, "disconnectedCallback").mockImplementation(() => {});
    const off = vi.fn(), unsub = vi.fn();
    mocks.onNames.mockReturnValue(off);
    const c = card([program("p", "P", ["cover.a"])]);
    c.requestUpdate = vi.fn(); c._loadPreviews = vi.fn(); c._checkVersion = vi.fn(); c._pollVersion = vi.fn();
    c.connectedCallback();
    expect(up).toHaveBeenCalled();
    expect(mocks.onNames).toHaveBeenCalledTimes(1);
    mocks.onNames.mock.calls[0][0]();
    expect(c.requestUpdate).toHaveBeenCalledTimes(2); // the names and the reattached view
    expect(intervals.map((i) => i.ms)).toEqual([60_000]);
    expect(doc.addEventListener).toHaveBeenCalledWith("visibilitychange", c._visible);
    const before = c._now;
    vi.setSystemTime(new Date("2026-11-04T10:30:00Z"));
    for (let i = 1; i <= 10; i++) {
      intervals[0].fn();
      expect(c._pollVersion).toHaveBeenCalledTimes(Math.floor(i / 5));
    }
    expect(c._now).not.toBe(before);
    expect(c._now.toISOString()).toBe("2026-11-04T10:30:00.000Z");
    expect(c._loadPreviews).toHaveBeenCalledTimes(10);
    expect(c._checkVersion).toHaveBeenCalledTimes(10);
    c._unsub = unsub;
    c.disconnectedCallback();
    expect(down).toHaveBeenCalled();
    expect(off).toHaveBeenCalled();
    expect(unsub).toHaveBeenCalled();
    expect(c._unsub).toBeUndefined();
    expect((globalThis as any).window.clearInterval).toHaveBeenCalledWith(77);
    expect((globalThis as any).window.clearTimeout).toHaveBeenCalled();
    expect(doc.removeEventListener).toHaveBeenCalledWith("visibilitychange", c._visible);
    const bare = card([]);
    expect(() => bare.disconnectedCallback()).not.toThrow(); // never connected
  });
  it("the page coming back polls the version, hiding it does not", () => {
    const c = card([]);
    c._pollVersion = vi.fn();
    doc.hidden = true; c._visible();
    expect(c._pollVersion).not.toHaveBeenCalled();
    doc.hidden = false; c._visible();
    expect(c._pollVersion).toHaveBeenCalledTimes(1);
  });
  it("the version is checked with the page at rest only; the poll asks the server and ignores a failure", async () => {
    const c = card([]);
    expect(c._idle).toBe(true);
    for (const busy of [{ _dialog: { kind: "pick" } }, { _edit: "k" }, { _snack: { undo: vi.fn() } }]) {
      const d = card([]); Object.assign(d, busy);
      expect(d._idle).toBe(false);
    }
    c._data.card_version = "7";
    c._checkVersion();
    expect(mocks.reload).toHaveBeenCalledWith("7", true);
    c._edit = "k";
    c._checkVersion();
    expect(mocks.reload).toHaveBeenLastCalledWith("7", false);
    c._data = undefined;
    c._checkVersion();
    expect(mocks.reload).toHaveBeenLastCalledWith(undefined, false);
    c._edit = null;
    await c._pollVersion();
    expect(c.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/get" });
    expect(mocks.reload).toHaveBeenLastCalledWith("9", true);
    c.hass.callWS = vi.fn(async () => { throw new Error("offline"); });
    mocks.reload.mockClear();
    await expect(c._pollVersion()).resolves.toBeUndefined();
    expect(mocks.reload).not.toHaveBeenCalled();
  });
  it("after each render: names loaded, version checked when idle with a version, data subscribed once when connected", () => {
    const c = card([program("p", "P", ["cover.a"])]);
    c._loadDomainNames = vi.fn(); c._loadNames = vi.fn(); c._loadPreviews = vi.fn(); c._checkVersion = vi.fn();
    Object.defineProperty(c, "isConnected", { value: true });
    c._data.card_version = "7";
    c.updated();
    expect(c._loadDomainNames).toHaveBeenCalled();
    expect(c._checkVersion).toHaveBeenCalledTimes(1);
    expect(mocks.subscribe).toHaveBeenCalledTimes(1);
    const cb = mocks.subscribe.mock.calls[0][1];
    c._error = "old";
    const data = { programs: [], labels: [] };
    cb(data);
    expect(c._data).toBe(data);
    expect(c._error).toBeUndefined();
    expect(c._loadNames).toHaveBeenCalledWith(data);
    expect(c._loadPreviews).toHaveBeenCalled();
    c.updated();
    expect(mocks.subscribe).toHaveBeenCalledTimes(1); // already subscribed
    c._edit = "k";
    c._checkVersion.mockClear();
    c.updated();
    expect(c._checkVersion).not.toHaveBeenCalled();
    const noVersion = card([]); noVersion._loadDomainNames = vi.fn(); noVersion._checkVersion = vi.fn();
    noVersion.updated();
    expect(noVersion._checkVersion).not.toHaveBeenCalled();
    const detached = card([]); detached._loadDomainNames = vi.fn();
    Object.defineProperty(detached, "isConnected", { value: false });
    mocks.subscribe.mockClear();
    detached.updated();
    const noHass = card([]); noHass._loadDomainNames = vi.fn(); noHass.hass = undefined;
    Object.defineProperty(noHass, "isConnected", { value: true });
    noHass.updated();
    expect(mocks.subscribe).not.toHaveBeenCalled();
  });
  it("small answers: card size grows 2 rows a program, grid options, the editor element, the stub config, the time format", () => {
    expect(card([]).getCardSize()).toBe(2);
    expect(card([program("a", "A", ["cover.a"]), program("b", "B", ["cover.b"])]).getCardSize()).toBe(6);
    const nodata = card([]); nodata._data = undefined;
    expect(nodata.getCardSize()).toBe(4);
    expect(card([]).getGridOptions()).toEqual({ columns: 12, min_columns: 6, rows: "auto" });
    expect(WeeklyPlannerCard.getConfigElement()).toEqual({ tag: "weekly-planner-card-editor" });
    const c = card([]);
    c.hass.locale = { time_format: "24" };
    c.willUpdate();
    expect(currentTimeFormat()).toBe("24");
    c.hass.locale = { time_format: "12" };
    c.willUpdate();
    expect(currentTimeFormat()).toBe("12");
    const withData = card([]);
    withData._loadPreviews = vi.fn();
    withData.setConfig({ type: "x" });
    expect(withData._loadPreviews).toHaveBeenCalled();
    const fresh = new WeeklyPlannerCard() as any;
    fresh._loadPreviews = vi.fn();
    fresh.setConfig({ type: "x" });
    expect(fresh._loadPreviews).not.toHaveBeenCalled();
    expect(fresh._config.show_chart).toBe(true);
  });
  it("the version check tolerates missing data on update", () => {
    const c = card([]);
    c._data = undefined; c._loadDomainNames = vi.fn();
    Object.defineProperty(c, "isConnected", { value: false });
    expect(() => c.updated()).not.toThrow();
  });
});
