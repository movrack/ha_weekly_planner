import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpChart, dayBounds } from "../components/chart";
import { slideTimeline, zoomTimeline } from "../chart-zoom";
import { clearPreviewCache } from "../preview-cache";
import { flat } from "./helpers/tpl";
const empty = () => ({ hist: [], log: [], sent: [] });
const chart = (date = "2026-01-03", tz = "UTC"): any => {
  const c: any = new WpChart();
  c.date = date; c.entityId = "sensor.test";
  c.program = { id: "pan", revision: 1, name: "Test", entities: [{ entity_id: c.entityId }], active_profile: "home", profiles: [{ id: "home", days: Array.from({ length: 7 }, () => []) }] };
  c.data = { programs: [c.program], labels: [], status: {} };
  c.hass = { config: { time_zone: tz }, language: "en", states: {}, callWS: vi.fn(async (m: any) => m.type === "weekly_planner/preview" ? { slots: [] } : m.type === "weekly_planner/journal" ? { segments: [] } : {}) };
  c._loaded = empty(); c._model = c._build(c._loaded); c.requestUpdate = () => {};
  return c;
};
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-01-03T12:00:00Z")); clearPreviewCache(); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });
describe("continuous timeline", () => {
  it("slides freely while zoom retains its duration and anchor", () => {
    expect(slideTimeline({ from: 0, to: 1440 }, -720)).toEqual({ from: -720, to: 720 });
    expect(zoomTimeline({ from: 1440, to: 1680 }, 2, 1560, .5, 1440)).toEqual({ from: 1500, to: 1620 });
  });
  it("loads only the two visible dates and their own previews", async () => {
    const c = chart(); c._zoom = { from: -360, to: 1080 };
    await c._load();
    expect([...c._dayData.keys()]).toEqual(["2026-01-02", "2026-01-03"]);
    const calls = c.hass.callWS.mock.calls.map(([m]: any) => m);
    expect(calls.filter((m: any) => m.type === "weekly_planner/preview").map((m: any) => m.date)).toEqual(expect.arrayContaining(["2026-01-01", "2026-01-02", "2026-01-03"]));
    expect(calls.filter((m: any) => m.type.startsWith("history/")).every((m: any) => Date.parse(m.end_time) <= Date.now())).toBe(true);
  });
  it("future windows request previews but never history or logbook", async () => {
    const c = chart(); c._zoom = { from: 1440, to: 2880 }; await c._load();
    expect(c.hass.callWS.mock.calls.every(([m]: any) => m.type === "weekly_planner/preview")).toBe(true);
    expect(c._model.lines).toEqual([]); expect(c._model.bands).toEqual([]);
    expect(flat(c.render())).toContain("History will appear");
    expect(flat(c.render())).not.toContain('class="nowtip"');
  });
  it("computes consecutive local dates from real minutes on both DST transitions", () => {
    const spring = chart("2026-03-29", "Europe/Brussels");
    expect(spring._span).toBe(1380);
    spring._zoom = { from: 1320, to: 1560 };
    expect(spring._visibleDates()).toEqual(["2026-03-29", "2026-03-30"]);
    const autumn = chart("2026-10-25", "Europe/Brussels");
    expect(autumn._span).toBe(1500);
    autumn._zoom = { from: 1440, to: 1680 };
    expect(autumn._visibleDates()).toEqual(["2026-10-25", "2026-10-26"]);
  });
  it("offsets midnight by actual day duration and stops past curves before the future", () => {
    const c = chart("2026-03-29", "Europe/Brussels");
    vi.setSystemTime(new Date("2026-03-30T12:00:00Z"));
    c._zoom = { from: 1320, to: 1560 };
    const start = dayBounds("2026-03-29", "Europe/Brussels").startMs;
    c._dayData.set("2026-03-29", { loaded: { ...empty(), hist: [{ t: start, s: "10", a: {} }] }, slots: [] });
    c._dayData.set("2026-03-30", { loaded: empty(), slots: [] });
    const m = c._buildVisible();
    expect(m.lines[0].pts).toContainEqual({ m: 1380, v: 10 });
    expect(m.lines[0].pts.at(-1)).toEqual({ m: 1380, v: null });
  });
  it("ignores an old response as soon as a new pan is requested", async () => {
    const c = chart(); let resolve!: (v: any) => void;
    c._loadAt = () => new Promise(r => { resolve = r; });
    const loading = c._load(); c._setZoom({ from: 1440, to: 2880 });
    resolve({ loaded: empty(), failed: false }); await loading;
    expect(c._dayData.size).toBe(0);
  });
  it("invalidates per-day previews when revision or active mode changes", () => {
    const c = chart(); c._load = vi.fn();
    c.willUpdate(new Map([["program", null]]));
    c._dayData.set(c.date, { loaded: empty(), slots: [] });
    c.program = { ...c.program, revision: 2 };
    c.willUpdate(new Map([["program", null]]));
    expect(c._dayData.size).toBe(0); expect(c._load).toHaveBeenCalledTimes(2);
  });
  it("keeps supplied complete previews without fetching or duplicating their tails", async () => {
    const c = chart();
    c.slots = [{ slot_id: "tail", start: "2026-01-02T22:00:00Z", end: "2026-01-03T03:00:00Z" }];
    expect(await c._previewAt(c.date, "home")).toBe(c.slots);
    expect(c.hass.callWS).not.toHaveBeenCalled();
  });
  it("adds only previous-day tails when the fetched answer has no per-device timeline", async () => {
    const c = chart();
    c.hass.callWS = vi.fn(async (msg: any) => ({ slots: msg.date === "2026-01-01" ? [
      { slot_id: "tail", start: "2026-01-01T22:00:00Z", end: "2026-01-02T03:00:00Z" },
      { slot_id: "done", start: "2026-01-01T10:00:00Z", end: "2026-01-01T11:00:00Z" },
    ] : [{ slot_id: "own", start: "2026-01-02T08:00:00Z", end: null }] }));
    expect((await c._previewAt("2026-01-02", "home")).map((s: any) => s.slot_id)).toEqual(["tail", "own"]);
  });
  it("rejects a vertical touch gesture before changing its time window", () => {
    const c = chart();
    c.renderRoot = { querySelector: () => null };
    c._down({ pointerId: 1, pointerType: "touch", button: 0, clientX: 100, clientY: 10 });
    c._move({ pointerId: 1, pointerType: "touch", clientX: 108, clientY: 80 });
    expect(c._zoom).toBeNull(); expect(c._gesture).toBeNull();
  });

});
