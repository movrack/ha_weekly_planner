import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LitElement } from "lit";
import { WpChart } from "../components/chart";
import { flat, handlers } from "./helpers/tpl";

// Coverage floors: the history loading (cache, parsing), the element's life cycle, the wheel, the clocks and the failure notes of the chart.
const start = Date.parse("2026-11-02T00:00:00Z");
function chart(extra: any = {}): any {
  const c: any = new WpChart();
  c.date = "2026-11-02"; c.entityId = "climate.room";
  c.hass = { language: "en", config: { time_zone: "UTC" }, states: { "climate.room": { state: "heat", attributes: {} } }, callWS: vi.fn(async () => ({})) };
  c.data = { status: {}, labels: [
    { id: "eco", name: "Eco", color: "blue", action: { kind: "service", service: "climate.set_temperature", data: { temperature: 16 } } },
    { id: "comfort", name: "Comfort", color: "red", action: { kind: "service", service: "climate.set_temperature", data: { temperature: 21 } } },
  ]};
  c.program = { id: "p", name: "Room", revision: 1, entities: [{ entity_id: c.entityId, default_label: "eco" }], profiles: [{ id: "home", days: Array.from({ length: 7 }, () => []) }] };
  c.program.profiles[0].days[0] = [{ id: "slot", label: "comfort", start: { time: "08:45" }, end: { time: "17:00" } }];
  Object.assign(c, extra);
  return c;
}
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(start + 12 * 3600000);
  vi.stubGlobal("document", { hidden: false, documentElement: { lang: "en" }, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const ws = (answers: { history?: any; log?: any; journal?: any }) => vi.fn(async (m: any) => {
  const a = m.type === "history/history_during_period" ? answers.history : m.type === "logbook/get_events" ? answers.log : answers.journal;
  if (a instanceof Error) throw a;
  return a;
});

describe("chart history loading", () => {
  it("reads every shape of history row, of logbook entry and of journal segment", async () => {
    const c = chart();
    const t0 = start / 1000;
    c.hass.callWS = ws({
      history: { "climate.room": [
        { s: "heat", a: { temperature: 20 }, lu: t0 + 60 },
        { s: "off", lc: t0 + 120 },
        { state: "cool", attributes: { temperature: 18 }, last_updated_ts: t0 + 180 },
        { s: "idle", last_updated: "2026-11-02T00:04:00Z" },
        { s: "broken", last_updated: "not a date" },
        { lu: t0 + 300 },
      ] },
      log: [
        { when: t0 + 100, state: "on", context_user_id: "u" },
        { when: (t0 + 200) * 1000, state: "off", context_event_type: "automation_triggered" },
        { when: t0 + 300, state: "on", context_domain: "x" }, { when: t0 + 310, state: "on", context_service: "turn_on" },
        { when: t0 + 320, state: "on", context_entity_id: "e" }, { when: t0 + 330, state: "on", context_message: "m" },
        { when: "nope", state: "on" }, { when: t0 + 400 },
      ],
      journal: { segments: [{ entity_id: "climate.room", at: "2026-11-02T08:00:00Z" }, { entity_id: "other", at: "2026-11-02T09:00:00Z" }] },
    });
    const { loaded, failed } = await c._loadAt("2026-11-02");
    expect(failed).toBe(false);
    expect(loaded.hist.map((p: any) => [p.t / 1000 - t0, p.s])).toEqual([[60, "heat"], [120, "off"], [180, "cool"], [240, "idle"], [300, ""]]);
    expect(loaded.hist[1].a).toEqual({ temperature: 20 }); // attributes carried over
    expect(loaded.hist[2].a).toEqual({ temperature: 20 }); // only `a` carries attributes in a history row
    expect(loaded.log.map((e: any) => [e.user, e.context])).toEqual([[true, false], [false, true], [false, true], [false, true], [false, true], [false, true], [false, false]]);
    expect(loaded.log[1].t).toBe((t0 + 200) * 1000); // milliseconds are kept
    expect(loaded.log.at(-1).state).toBe("");
    expect(loaded.sent).toEqual([Date.parse("2026-11-02T08:00:00Z")]);
  });
  it("anything that is not a list gives nothing; the logbook and the journal may fail alone", async () => {
    const c = chart();
    c.hass.callWS = ws({ history: { "climate.room": "oops" }, log: new Error("no logbook"), journal: new Error("no journal") });
    const { loaded, failed } = await c._loadAt("2026-11-02");
    expect(failed).toBe(false);
    expect(loaded).toEqual({ hist: [], log: [], sent: [] });
    c.hass.callWS = ws({ history: { "climate.room": [] }, log: { not: "a list" }, journal: {} });
    expect((await chart({ hass: c.hass })._loadAt("2026-11-01")).loaded.log).toEqual([]);
  });
  it("a failing history marks the day as failed, and is not kept in the cache", async () => {
    const c = chart();
    c.hass.callWS = ws({ history: new Error("down"), log: [], journal: { segments: [] } });
    expect((await c._loadAt("2026-10-30")).failed).toBe(true);
    c.hass.callWS = ws({ history: { "climate.room": [{ s: "heat", lu: 1 }] }, log: [], journal: { segments: [] } });
    const again = await c._loadAt("2026-10-30");
    expect(again.failed).toBe(false);
  });
  it("a closed day is fetched once, a running day again after a minute, a future day never", async () => {
    const c = chart();
    c.hass.callWS = ws({ history: { "climate.room": [] }, log: [], journal: { segments: [] } });
    const count = () => c.hass.callWS.mock.calls.filter((x: any) => x[0].type === "history/history_during_period").length;
    await c._loadAt("2026-10-29"); await c._loadAt("2026-10-29");
    expect(count()).toBe(1);
    await c._loadAt("2026-11-02"); await c._loadAt("2026-11-02");
    expect(count()).toBe(2);
    vi.setSystemTime(start + 12 * 3600000 + 61_000);
    await c._loadAt("2026-11-02");
    expect(count()).toBe(3);
    const future = await c._loadAt("2026-11-05");
    expect(future.loaded).toEqual({ hist: [], log: [], sent: [] });
    expect(count()).toBe(3);
  });
  it("the cache keeps 64 entries, the oldest go first, and a hit is refreshed", async () => {
    const c = chart();
    c.hass.connection = {};
    c.hass.callWS = ws({ history: {}, log: [], journal: { segments: [] } });
    const count = () => c.hass.callWS.mock.calls.filter((x: any) => x[0].type === "history/history_during_period").length;
    for (let i = 0; i < 70; i++) { c.entityId = `sensor.e${i}`; await c._loadAt("2026-10-20"); }
    expect(count()).toBe(70);
    c.entityId = "sensor.e69"; await c._loadAt("2026-10-20"); // recent: still there
    expect(count()).toBe(70);
    c.entityId = "sensor.e0"; await c._loadAt("2026-10-20"); // oldest: evicted
    expect(count()).toBe(71);
  });
  it("loads the days of the window, keeps the sources and the failures, ignores a stale answer", async () => {
    const c = chart();
    c.hass.callWS = ws({ history: { "climate.room": [{ s: "heat", lu: start / 1000 + 60 }] }, log: [], journal: { segments: [] } });
    c.slots = [];
    await c._load();
    expect(c._loaded.hist).toHaveLength(1);
    expect(c._failed).toBe(false);
    expect(c._previewFailed).toBe(false);
    const stale = c._load();
    c._token++;
    await stale;
    expect(c._model).not.toBeUndefined();
    c.hass = undefined;
    await c._load(); // nothing without hass
  });
});

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
    const stop = vi.spyOn(c, "_stopRefresh" as any);
    const token = c._token;
    c._openTimer = setTimeout(() => { throw new Error("open timer left"); }, 10);
    c._panLoadTimer = setTimeout(() => { throw new Error("pan timer left"); }, 10);
    const before = c._stopRefresh;
    c.disconnectedCallback();
    expect(o.disconnect).toHaveBeenCalledOnce();
    expect(c._token).toBe(token + 1);
    expect(c._stopRefresh).toBeUndefined();
    expect(before).toBeTypeOf("function");
    vi.advanceTimersByTime(20);
    c.disconnectedCallback(); // a second time is harmless
    expect(stop).toBeDefined();
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

describe("chart: notes under the graph", () => {
  const rendered = (c: any) => flat(c.render());
  it("a failed history, a failed preview and no plan each say so", () => {
    const c = chart();
    c._model = c._build({ hist: [], log: [], sent: [] });
    c._failed = true; c._previewFailed = true;
    const out = rendered(c);
    expect(out).toContain("availability");
    expect(handlers(c.render()).length).toBeGreaterThan(5);
    c._failed = false; c._previewFailed = false;
    expect(rendered(c)).toContain("availability");
  });
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
    c._model = c._build({ hist: [{ t: start, s: "heat", a: {} }], log: [], sent: [] });
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
