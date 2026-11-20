import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { clearPreviewCache } from "../preview-cache";
import { localDateIso, formatWhen } from "../time";
import { listCard as card, mkHass, simpleProgram as program, stubBrowser, unstubBrowser } from "./helpers/planner-card";

beforeEach(stubBrowser);
afterEach(unstubBrowser);

describe("names and languages", () => {
  it("the language: the locale first, then the language of HA, then English, also without hass", () => {
    const c = card([]);
    c.hass = { locale: { language: "de" }, language: "fr" };
    expect(c._lang).toBe("de");
    c.hass = { language: "fr" };
    expect(c._lang).toBe("fr");
    c.hass = {};
    expect(c._lang).toBe("en");
    c.hass = { locale: {} };
    expect(c._lang).toBe("en");
    c.hass = undefined;
    expect(c._lang).toBe("en");
  });
  it("type labels: HA's own, then the loaded ones, then the domain itself; no hass, no localize function", () => {
    const c = card([]);
    c.hass = undefined;
    expect(c._typeLabel("cover")).toBe("cover");
    c.hass = {};
    expect(c._typeLabel("cover")).toBe("cover");
    c._domainLocalize = (k: string) => (k === "component.cover.title" ? "Covers" : "");
    expect(c._typeLabel("cover")).toBe("Covers");
    c.hass = { localize: () => "Own" };
    expect(c._typeLabel("cover")).toBe("Own");
  });
  it("domain names: sorted, without empty ones, no call without hass, a late failure leaves a newer key alone", async () => {
    const p1 = program("pd1", "A", ["light.b"]), p2 = program("pd2", "B", ["cover.a"]), p0 = program("pd0", "C", []);
    const load = vi.fn(async () => () => "");
    const c = card([p1, p2, p0], {}, {}, mkHass({ loadBackendTranslation: load }));
    c._loadDomainNames();
    expect(load).toHaveBeenCalledWith("title", ["cover", "light"]);
    c.hass = undefined;
    c._domainKey = "";
    expect(() => c._loadDomainNames()).not.toThrow();
    let fail: (e: Error) => void = () => {};
    const late = card([p2], {}, {}, mkHass({ loadBackendTranslation: vi.fn(() => new Promise((_, rej) => { fail = rej; })) }));
    late._loadDomainNames();
    late._domainKey = "newer";
    fail(new Error("x"));
    await vi.advanceTimersByTimeAsync(0);
    expect(late._domainKey).toBe("newer");
  });
  it("loading the service names refreshes the view only when they changed", async () => {
    const run = card([], {}, { labels: [{ id: "z", name: "Z", color: "#0", action: { kind: "service", service: "zzdom.run" } }] }, mkHass({ loadBackendTranslation: vi.fn(async () => () => "x") }));
    run.requestUpdate = vi.fn();
    await run._loadNames(run._data);
    expect(run.requestUpdate).toHaveBeenCalledTimes(1);
    await run._loadNames(run._data);
    expect(run.requestUpdate).toHaveBeenCalledTimes(1);
  });
  it("the middle of a day is noon", () => {
    expect(card([])._dateAt(0).toISOString()).toBe("2026-11-04T12:00:00.000Z");
    expect(card([])._dateAt(2).toISOString()).toBe("2026-11-06T12:00:00.000Z");
  });
});

describe("previews", () => {
  it("answers that arrive after a newer load started are dropped", async () => {
    const c = card([program("pk2", "A", ["cover.a"])]);
    const releases: ((v: any) => void)[] = [];
    c.hass.callWS = vi.fn(() => new Promise((r) => { releases.push(r); }));
    const loading = c._loadPreviews();
    c._previewKey = "newer";
    releases.forEach((r) => r({ slots: [] }));
    await vi.advanceTimersByTimeAsync(0);
    await loading;
    expect(c._preview).toEqual({});
    expect(c._previewKey).toBe("newer");
  });
});

describe("loading the previews and the domain names", () => {
  it("loads 8 days of every program once, then only when the key changes", async () => {
    const p = program("pl1", "Volet", ["cover.a"]);
    const c = card([p]);
    await c._loadPreviews();
    expect(c._previewKey).toBe("2026-11-03||pl1:1:pr"); // first day, no day off, program:revision:profile
    expect(c.hass.callWS.mock.calls[0][0]).not.toHaveProperty("profile_id");
    expect(c.hass.callWS).toHaveBeenCalledTimes(8);
    const dates = c.hass.callWS.mock.calls.map((x: any[]) => x[0].date).sort();
    expect(dates).toEqual(["2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09", "2026-11-10"]);
    expect(Object.keys(c._preview)).toHaveLength(8);
    expect(c._preview["2026-11-04"].pl1).toEqual({ slots: [] });
    expect(c._failedPreviewKey).toBe("");
    const first = c._preview;
    await c._loadPreviews();
    expect(c.hass.callWS).toHaveBeenCalledTimes(8);
    expect(c._preview).toBe(first);
    c._data.holiday_today = true; // another key
    await c._loadPreviews();
    expect(c.hass.callWS).toHaveBeenCalledTimes(8); // answers come from the cache of the same program and revision
    expect(c._previewKey).toBe("2026-11-03|off|pl1:1:pr");
    expect(c._preview).not.toBe(first);
    c._data = undefined;
    await expect(c._loadPreviews()).resolves.toBeUndefined();
  });
  it("a failure keeps what arrived, waits 5 s before the next try and a retry lifts the wait", async () => {
    const p = program("pl2", "Volet", ["cover.a"]);
    const c = card([p]);
    c.hass.callWS = vi.fn(async () => { throw new Error("down"); });
    c.requestUpdate = vi.fn();
    await c._loadPreviews();
    expect(c._previewKey).toBe("");
    expect(c._failedPreviewKey).not.toBe("");
    expect(c._previewRetryAt).toBe(Date.now() + 5000);
    const calls = c.hass.callWS.mock.calls.length;
    await c._loadPreviews();
    expect(c.hass.callWS.mock.calls.length).toBe(calls);
    vi.advanceTimersByTime(5000);
    await c._loadPreviews();
    expect(c.hass.callWS.mock.calls.length).toBeGreaterThan(calls);
    c.hass.callWS = vi.fn(async () => ({ slots: [] }));
    c.requestUpdate.mockClear();
    c._retryPreviews();
    expect(c._previewRetryAt).toBe(0);
    expect(c._failedPreviewKey).toBe("");
    expect(c.requestUpdate).toHaveBeenCalledTimes(1); // the repaint comes at once
    await vi.advanceTimersByTimeAsync(0);
    expect(c.hass.callWS).toHaveBeenCalled();
  });
  it("loads the domain names once per language and set of domains, ignores stale answers, retries after a failure", async () => {
    const p1 = program("pd1", "A", ["cover.a"]), p2 = program("pd2", "B", ["light.b"]), p3 = program("pd3", "C", ["cover.c"]);
    const localize = vi.fn((k: string) => (k === "component.cover.title" ? "Covers" : ""));
    const load = vi.fn(async () => localize);
    const c = card([p1, p2, p3], {}, {}, mkHass({ loadBackendTranslation: load }));
    c.requestUpdate = vi.fn();
    c._loadDomainNames();
    expect(load).toHaveBeenCalledWith("title", ["cover", "light"]);
    expect(c._domainKey).toBe("en|cover,light");
    await Promise.resolve(); await Promise.resolve();
    expect(c._typeLabel("cover")).toBe("Covers");
    expect(c._typeLabel("fan")).toBe("fan");
    expect(c.requestUpdate).toHaveBeenCalledTimes(1);
    c._loadDomainNames();
    expect(load).toHaveBeenCalledTimes(1);
    c.hass.language = "fr";
    c._loadDomainNames();
    expect(load).toHaveBeenCalledTimes(2);
    expect(c._domainKey).toBe("fr|cover,light");
    c.hass.localize = (k: string) => (k === "component.light.title" ? "Lights" : "");
    expect(c._typeLabel("light")).toBe("Lights");
    const none = card([program("pn", "N", [])], {}, {}, mkHass({ loadBackendTranslation: load }));
    none._loadDomainNames();
    expect(load).toHaveBeenCalledTimes(2);
    const noApi = card([p1], {}, {}, mkHass());
    noApi._loadDomainNames();
    expect(noApi._domainKey).toBe("");
    const noData = card([p1], {}, {}, mkHass({ loadBackendTranslation: load })); noData._data = undefined;
    noData._loadDomainNames();
    expect(load).toHaveBeenCalledTimes(2);
    const failing = card([p1], {}, {}, mkHass({ loadBackendTranslation: vi.fn(async () => { throw new Error("x"); }) }));
    failing._loadDomainNames();
    await Promise.resolve(); await Promise.resolve();
    expect(failing._domainKey).toBe("");
    const stale = card([p1], {}, {}, mkHass({ loadBackendTranslation: vi.fn(() => new Promise((r) => setTimeout(() => r(localize), 10))) }));
    stale.requestUpdate = vi.fn();
    stale._loadDomainNames();
    stale._domainKey = "other";
    await vi.advanceTimersByTimeAsync(20);
    expect(stale._domainLocalize).toBeUndefined();
    expect(stale.requestUpdate).not.toHaveBeenCalled();
  });
});

describe("the preview key and the wait after a failure", () => {
  it("the preview key joins program ids with commas and a new key loads at once, even inside the wait of an older failure", async () => {
    const a = program("pj1", "A", ["cover.a"]), b = program("pj2", "B", ["cover.b"]);
    const c = card([a, b]);
    await c._loadPreviews();
    expect(c._previewKey).toBe("2026-11-03||pj1:1:pr,pj2:1:pr");
    const d = card([program("pj3", "A", ["cover.a"])]);
    d.hass.callWS = vi.fn(async () => { throw new Error("down"); });
    await d._loadPreviews();
    expect(d._previewRetryAt).toBeGreaterThan(Date.now());
    const calls = d.hass.callWS.mock.calls.length;
    d._data.programs = [program("pj4", "B", ["cover.b"])];
    await d._loadPreviews();
    expect(d.hass.callWS.mock.calls.length).toBeGreaterThan(calls);
  });
});

const modeProgram = () => ({ id: "qa-program", revision: 1, name: "QA", priority: 10, enabled: true,
  entities: [], profiles: ["a", "b"].map((id) => ({ id, name: id,
    days: [[{ id, start: { time: id === "a" ? "08:00" : "18:00" }, end: { time: "23:00" }, label: "l" }], [], [], [], [], [], []] })) });

describe("previews of a program with modes", () => {
  it("a runtime mode change reloads the previews, and after a failure only the failed day is asked again once the wait is over", async () => {
    const wc = new WeeklyPlannerCard() as any;
    const pr = modeProgram();
    wc.hass = { config: { time_zone: "UTC" }, callWS: vi.fn().mockResolvedValue({ slots: [] }) };
    wc._config = { program: pr.id };
    wc._data = { programs: [pr], labels: [], status: {}, mode: { selector: "input_select.m", default: "a", active: "a", options: ["a", "b"], available: true } };
    wc._now = new Date("2026-01-02T12:00:00Z");
    await wc._loadPreviews();
    expect(wc.hass.callWS.mock.calls.map(([message]: any[]) => message.date)).toEqual([
      "2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08",
    ]);
    await wc._loadPreviews();
    expect(wc.hass.callWS).toHaveBeenCalledTimes(8);
    wc._data.mode.active = "b";
    await wc._loadPreviews();
    expect(wc.hass.callWS).toHaveBeenCalledTimes(16);
    wc._previewKey = "";
    clearPreviewCache(); // the shared cache would otherwise answer from the mode already loaded
    wc.hass.callWS.mockRejectedValueOnce(new Error("offline"));
    await wc._loadPreviews();
    await wc._loadPreviews();
    expect(wc.hass.callWS).toHaveBeenCalledTimes(24);
    vi.advanceTimersByTime(6000); // the 5 s wait after a failure is over
    await wc._loadPreviews();
    expect(wc.hass.callWS).toHaveBeenCalledTimes(25); // only the failed day is asked again: the 7 others are cached
  });
  it("the week of the card has seven distinct civil dates during a 25-hour day (2026-10-25, end of summer time)", () => {
    const wc = new WeeklyPlannerCard() as any;
    wc.hass = { config: { time_zone: "Europe/Brussels" } };
    wc._now = new Date("2026-10-24T22:30:00Z");
    const dates = Array.from({ length: 7 }, (_, i) => localDateIso(wc._dateAt(i), "Europe/Brussels"));
    expect(dates).toEqual(["2026-10-25", "2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31"]);
    expect(formatWhen("2026-10-26T08:00:00Z", "Europe/Brussels", "en", wc._now)).toContain("tomorrow");
  });
});
