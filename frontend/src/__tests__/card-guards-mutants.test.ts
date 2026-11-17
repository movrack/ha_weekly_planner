import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { t } from "../i18n";
import { WeeklyPlannerCard, commonWordPrefix } from "../weekly-planner-card";
import { WpDayBar } from "../components/day-bar";
import { WpRadialDay, radialHoverTarget } from "../components/radial-day";
import { flat, handlers } from "./helpers/tpl";

const chart = vi.hoisted(() => ({ open: vi.fn() }));
vi.mock("../chart-state", async (orig) => ({ ...(await orig<any>()), openHistory: chart.open }));

// Third pass: guards for missing data, stale answers, exact boundaries and defaults of the card, the day bar and the radial dial.
const slot = (id: string, start: any = { time: "08:00" }, end: any = { time: "09:00" }, extra: any = {}) => ({ id, label: "l", start, ...(end ? { end } : {}), ...extra });
const label = { id: "l", name: "Open", color: "#0f0", action: { kind: "service", service: "cover.open_cover" } };
const label2 = { id: "l2", name: "Close", color: "#f00", action: { kind: "service", service: "cover.close_cover" } };
const mkHass = (over: any = {}): any => ({ language: "en", config: { time_zone: "UTC" }, states: {}, services: { cover: { open_cover: { fields: {} }, close_cover: { fields: {} } } }, callWS: vi.fn(async () => ({ slots: [] })), ...over });
const program = (id: string, name: string, ids: string[], extra: any = {}, days?: any[], holiday?: any) => ({
  id, name, revision: 1, priority: 1, enabled: true, reapply: true, conditions: [],
  entities: ids.map((e) => ({ entity_id: e, default_label: null, label_overrides: {} })),
  profiles: [{ id: "pr", name: "A", days: days ?? Array.from({ length: 7 }, () => [slot("d")]), ...(holiday ? { holiday } : {}) }], ...extra });
const card = (programs: any[], config: any = {}, data: any = {}, hass: any = mkHass()) => {
  const c = new WeeklyPlannerCard() as any;
  c.hass = hass;
  c._config = { type: "x", ...config };
  c._now = new Date("2026-11-04T09:00:00Z"); // a Wednesday
  c._data = { labels: [label, label2], programs, status: {}, can_edit: true, read_only: false, ...data };
  return c;
};

beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal("window", { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout }); vi.stubGlobal("localStorage", { getItem: () => null, setItem: vi.fn() }); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

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
  it("common words: runs of spaces count as one separator", () => {
    expect(commonWordPrefix(["Volet  a b", "Volet  a c"])("Volet  a b")).toBe("b");
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
  it("the key names the first day, the day off and the programs; nothing is reloaded for the same key; the payload carries no profile", async () => {
    const c = card([program("pk1", "A", ["cover.a"])]);
    await c._loadPreviews();
    expect(c._previewKey).toBe("2026-11-03||pk1:1:pr");
    const first = c._preview;
    expect(c.hass.callWS.mock.calls[0][0]).not.toHaveProperty("profile_id");
    await c._loadPreviews();
    expect(c._preview).toBe(first);
    c._data.holiday_today = true;
    await c._loadPreviews();
    expect(c._previewKey).toBe("2026-11-03|off|pk1:1:pr");
    expect(c._preview).not.toBe(first);
  });
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
  it("a retry asks for a repaint at once", () => {
    const c = card([program("pk3", "A", ["cover.a"])]);
    c.requestUpdate = vi.fn(); c._loadPreviews = vi.fn(async () => {});
    c._retryPreviews();
    expect(c.requestUpdate).toHaveBeenCalledTimes(1);
    expect(c._loadPreviews).toHaveBeenCalledTimes(1);
  });
  it("opening a schedule never asks to create unless told", () => {
    const c = card([]);
    c._open({ kind: "program", programId: "p" });
    expect(c._dialog).toEqual({ kind: "schedule", scope: { kind: "program", programId: "p" }, day: undefined, create: false });
  });
  it("the version check tolerates missing data on update", () => {
    const c = card([]);
    c._data = undefined; c._loadDomainNames = vi.fn();
    Object.defineProperty(c, "isConnected", { value: false });
    expect(() => c.updated()).not.toThrow();
  });
});

describe("missing data never breaks the small helpers", () => {
  it("no data: not editable, no create button, no mode line, no day-off line, no notes", () => {
    const c = card([]);
    const p = program("p", "P", ["cover.a"]);
    c._data = undefined;
    expect(c._needsCreate(p, "cover.a")).toBe(false);
    expect(c._barEditable(p, 1)).toBe(false);
    expect(flat(c._modeLine())).toBe("");
    expect(flat(c._noSchedule(p))).toBe("");
    expect(flat(c._holidayLine([p]))).toBe("");
    expect(flat(c._holidayRow("cover.a", p))).toBe("");
    expect(c._holidaySpans("cover.a", p)).toBeNull();
    expect(flat(c._programToggle(p))).toContain('role="switch"');
    expect(c._lockedText(p)).toBe("");
  });
  it("a program missing from the status: no note, no skip line, no holiday line, no next change", () => {
    const c = card([], {}, { status: {}, holiday_today: true });
    const p = program("p", "P", ["cover.a"]);
    expect(flat(c._noSchedule(p))).toBe("");
    expect(flat(c._holidayLine([p]))).toBe("");
    expect(flat(c._skipped("cover.a", [p]))).toBe("");
    expect(c._next("cover.a", [p])).toBeUndefined();
    c._data.status = { p: { skip_next: "2026-11-05T08:00:00Z" } };
    expect(flat(c._skipped("cover.a", [p]))).toBe(""); // no target list
    c._data.status = { p: { skip_next_targets: [{ entity_id: "cover.a", label: "l" }] } };
    expect(flat(c._skipped("cover.a", [p]))).toBe(""); // nothing skipped
  });
  it("the next change comes from the first enabled program that has one", () => {
    const a = program("pa", "A", ["cover.a"]), b = program("pb", "B", ["cover.a"]), off = program("pc", "C", ["cover.a"], { enabled: false });
    const c = card([a, b, off], {}, { status: { pb: { next_actions: { "cover.a": { at: "x", label: "l" } } }, pc: { next_actions: { "cover.a": { at: "off", label: "l" } } } } });
    expect(c._next("cover.a", [a, b])).toEqual({ at: "x", label: "l" });
    expect(c._next("cover.a", [off])).toBeUndefined();
  });
  it("the skipped line names the setting, else the action, else the rest", () => {
    const p = program("p", "P", ["cover.a"]);
    const target = (extra: any) => ({ p: { skip_next: "2026-11-05T08:00:00Z", skip_next_targets: [{ entity_id: "cover.a", ...extra }] } });
    const c = card([p], {}, { status: target({ label: "l" }) });
    expect(flat(c._skipped("cover.a", [p])).replace(/\u00a0/g, " ")).toContain(t("en", "skip_named", { what: "Open", when: "tomorrow 8 am" }));
    c._data.status = target({ label: "gone", action: { kind: "service", service: "cover.close_cover" } });
    expect(flat(c._skipped("cover.a", [p]))).not.toContain("Open");
    expect(flat(c._skipped("cover.a", [p]))).toContain("mdi:skip-next");
    c._data.status = target({ label: "gone" });
    expect(flat(c._skipped("cover.a", [p])).replace(/\u00a0/g, " ")).toContain(t("en", "skip_named", { what: t("en", "rest_none_short"), when: "tomorrow 8 am" }));
  });
  it("the day-off line says the same text once, different texts with the names; a copy of the real day says nothing", () => {
    const a = program("pa", "A", ["cover.a"]), b = program("pb", "B", ["cover.b"]), n = program("pn", "N", ["cover.c"]);
    const c = card([a, b, n], {}, { holiday_today: true, status: { pa: { holiday: { copy: 6 } }, pb: { holiday: { copy: 6 } }, pn: { holiday: { copy: 2 } } } });
    const same = flat(c._holidayLine([a, b, n]));
    expect(same.match(/<p>/g)).toHaveLength(1);
    expect(same).not.toContain("A ·");
    c._data.status.pb.holiday = { copy: 5 };
    const diff = flat(c._holidayLine([a, b, n]));
    expect(diff.match(/<p>/g)).toHaveLength(2);
    expect(diff).toContain("A · ");
    expect(diff).toContain("B · ");
    expect(diff).not.toContain("N · ");
    c._data.holiday_today = false;
    expect(flat(c._holidayLine([a]))).toBe("");
    c._data.holiday_today = true;
    expect(flat(c._holidayLine([n]))).toBe(""); // a copy of today's real weekday: nothing to tell
  });
  it("the focus goes back to the switch of the program, looked up by its selector", () => {
    const c = card([]);
    const q = vi.fn(() => [{ dataset: { program: "zz" }, focus: vi.fn() }]);
    Object.defineProperty(c, "renderRoot", { value: { querySelectorAll: q }, configurable: true });
    expect(() => c._focusSwitch("p1")).not.toThrow();
    expect(q).toHaveBeenCalledWith("button.hours[role=switch]");
    const tabs = vi.fn(() => [{ dataset: { tab: "p1" }, focus: vi.fn() }]);
    Object.defineProperty(c, "renderRoot", { value: { querySelectorAll: tabs }, configurable: true });
    Object.defineProperty(c, "updateComplete", { value: Promise.resolve(true), configurable: true });
    const p = program("p1", "Duo", ["cover.a", "cover.b"]);
    handlers(c._deviceTabs(p)).find((h) => h.event === "keydown")!.fn({ key: "End", preventDefault: () => {} });
    return Promise.resolve().then(() => Promise.resolve()).then(() => expect(tabs).toHaveBeenCalledWith('.devtab[aria-selected="true"]'));
  });
});

describe("render frame without data", () => {
  it("a title and the pause chip without data, no empty-state texts", () => {
    const c = card([], { title: "T" });
    c._data = undefined;
    c._list = vi.fn(() => "LIST");
    expect(flat(c.render())).toContain("<h1>T</h1>");
  });
  it("the notices carry no bold title; the empty state says why: nothing filtered or nothing at all", () => {
    const c = card([program("p", "P", ["cover.a"])], { schedule_view: "list", filter: { types: ["light"] } }, { read_only: true });
    c._info = "ok"; c._error = "bad"; c._list = vi.fn(() => "LIST"); c._modeLine = () => ""; c._holidayLine = () => "";
    let html = flat(c.render());
    expect(html).not.toContain("<b>");
    expect(html).toContain(`<div class="empty" role="status">${t("en", "no_matching_program")}</div>`);
    c._config.program = "zzz";
    html = flat(c.render());
    expect(html).toContain(`<div class="empty" role="status">${t("en", "no_program")}</div>`);
    expect(html).not.toContain(t("en", "no_matching_program"));
    const none = card([], { schedule_view: "list" });
    none._list = vi.fn(() => "LIST"); none._modeLine = () => ""; none._holidayLine = () => "";
    expect(flat(none.render())).toContain(t("en", "no_program"));
    const shown = card([program("p", "P", ["cover.a"])], { schedule_view: "list" });
    shown._list = vi.fn(() => "LIST"); shown._modeLine = () => ""; shown._holidayLine = () => "";
    expect(flat(shown.render())).not.toContain('class="empty"');
  });
});

describe("spans: remaining guards", () => {
  const run = (c: any, ent = "cover.a") => c._computeSpans(ent, [c._data.programs[0]], 0);
  it("the cache key separates program lists even when the ids run together", () => {
    const mk = (id: string, start: string) => program(id, id, ["cover.a"], {}, Array.from({ length: 7 }, () => [slot(id, { time: start }, { time: "23:00" })]));
    const a = mk("a", "01:00"), bc = mk("bc", "02:00"), ab = mk("ab", "03:00"), cc = mk("c", "04:00");
    const c = card([a, bc, ab, cc]);
    const starts = (ps: any[]) => c._spans("cover.a", ps, 0).map((s: any) => s.start).sort((x: number, y: number) => x - y);
    expect(starts([a, bc])).toEqual([60, 120]);
    expect(starts([ab, cc])).toEqual([180, 240]);
  });
  it("a one-shot has no end base, even when the row carries one", () => {
    const c = card([program("p1", "A", ["cover.a"], {}, Array.from({ length: 7 }, () => [slot("m", { time: "10:00" }, null)]))]);
    c._deviceDays = () => ({ today: [{ slot_id: "m", start: "2026-11-04T10:00:00Z", end: null, ignored: null, end_base: "2026-11-04T09:50:00Z" }], previous: [] });
    expect(run(c)[0].endBase).toBeNull();
  });
  it("without a preview, a slot that crosses midnight with a random start or end is left out", () => {
    const days = Array.from({ length: 7 }, () => [
      slot("rs", { time: "22:00", random_minutes: 5 }, { time: "02:00" }), slot("re", { time: "22:00" }, { time: "02:00", random_minutes: 5 }), slot("ok", { time: "22:00" }, { time: "02:00" })]);
    const c = card([program("p1", "A", ["cover.a"], {}, days)]);
    c._deviceDays = () => ({ today: undefined, previous: undefined });
    expect(run(c).filter((s: any) => s.spill).map((s: any) => s.slotId)).toEqual(["ok"]);
  });
  it("the bar of a device uses its own default setting for the rest of the time; the spans are the program's", () => {
    const p = program("p1", "Duo", ["cover.a", "cover.b"]);
    p.entities[0].default_label = "l"; p.entities[1].default_label = "l2";
    const c = card([p]);
    c._lockedText = () => "";
    c._deviceDays = () => ({ today: [], previous: [] });
    const attr = (e: string) => { const out: Record<string, any> = {}; const walk = (v: any): void => { if (Array.isArray(v)) v.forEach(walk); else if (v?.strings) v.values.forEach((x: any, i: number) => { const m = /([.?@]?[\w-]+)=$/.exec(v.strings[i]); if (m && !(m[1] in out)) out[m[1]] = x; if (!m || typeof x === "object") walk(x); }); }; walk(c._bar(e, p, 0, "today")); return out; };
    expect(attr("cover.a")[".rest"]).toBe("Open");
    expect(attr("cover.b")[".rest"]).toBe("Close");
    const q = program("q", "Q", ["cover.a"]);
    c._data.programs.push(q);
    c._deviceDays = () => ({ today: [{ slot_id: "d", start: "2026-11-04T08:00:00Z", end: "2026-11-04T09:00:00Z", ignored: null }], previous: [] });
    c._spanCache.clear();
    const spans = (() => { const out: any[] = []; const walk = (v: any): void => { if (Array.isArray(v)) v.forEach(walk); else if (v?.strings) v.values.forEach((x: any, i: number) => { if (/\.spans=$/.test(v.strings[i])) out.push(x); else walk(x); }); }; walk(c._bar("cover.a", p, 0, "today")); return out[0]; })();
    expect(spans.map((s: any) => s.slotId)).toEqual(["d"]);
  });
  it("a day off copied from a missing day is empty; a slot the device does not take is left out", () => {
    const p = program("p1", "A", ["cover.a"], {}, undefined, { copy: 0 });
    p.profiles[0].days[0] = [slot("x", { time: "08:00" }, { time: "09:00" }, { entities: ["cover.other"] }), slot("y")];
    const c = card([p], {}, { holiday_entity: "binary_sensor.h" });
    expect(c._holidaySpans("cover.a", p).map((s: any) => s.slotId)).toEqual(["y"]);
    const q = program("q1", "B", ["cover.a"], {}, undefined, { off: true, copy: 3 });
    expect(c._holidayCopy(q)).toBeNull();
    expect(c._holidaySpans("cover.a", q)).toBeNull();
    expect(c._holidayCopy(program("q2", "C", ["cover.a"], {}, undefined, { copy: 3 }))).toBe(3);
    expect(c._holidayCopy(program("q3", "D", ["cover.a"]))).toBeNull();
  });
  it("the comparison asks for each weekday its next occurrence", () => {
    const c = card([], { schedule_view: "compare" });
    const p = program("p", "P", ["cover.a"]);
    c._spans = vi.fn(() => []); c._holidaySpans = vi.fn(() => null);
    for (let d = 0; d < 7; d++) { c._cmpDay = d; flat(c._compare([[p]], false)); } // each chip shows its own day
    expect(c._spans.mock.calls.map((x: any[]) => x[2])).toEqual([5, 6, 0, 1, 2, 3, 4]);
  });
  it("the radial and the 12 h views keep the 'today' kind of their bar", () => {
    const p = program("p1", "A", ["cover.a"]);
    for (const view of ["radial", "radial_12h"]) {
      const c = card([p], { schedule_view: view });
      c._bar = vi.fn(() => ""); c._extras = vi.fn(() => ""); c._lockedNote = () => ""; c._skipped = () => "";
      flat(c._line("cover.a", [p], { name: null, button: null, open: { kind: "program", programId: "p1" } }));
      expect(c._bar).toHaveBeenCalledWith("cover.a", p, 0, "today");
    }
  });
});

describe("toggles and sections", () => {
  it("the labels of the week and chart buttons are words, the chart is remembered, a history click opens it", () => {
    const p = program("p1", "A", ["cover.a"]);
    const c = card([p], { chart_collapsed: false }); c._bar = vi.fn(() => ""); c._holidayRow = () => "";
    const scope = { kind: "program", programId: "p1" };
    const tpl = c._extras(scope, "cover.a", [p]);
    const html = flat(tpl);
    expect(html).toContain(`mdi:calendar-week"></ha-icon>${t("en", "week")}<ha-icon class="after"`);
    expect(html).toContain(`mdi:chart-line"></ha-icon>${t("en", "chart_day")}<ha-icon class="after"`);
    handlers(tpl).filter((h) => h.event === "click")[1].fn();
    expect((globalThis as any).localStorage.setItem).toHaveBeenCalledTimes(1);
    handlers(tpl).find((h) => h.event === "open-history")!.fn({ detail: "/history?x" });
    expect(chart.open).toHaveBeenCalledWith("/history?x");
  });
  it("grouped programs without an argument show h2; the badge follows the state of the program", () => {
    const duo = program("p2", "Duo", ["cover.b", "cover.c"], { enabled: false });
    const c = card([duo]);
    c._deviceTabs = () => ""; c._line = () => ""; c._noSchedule = () => ""; c._disabledBadge = vi.fn(() => "");
    flat(c._bySchedule([duo])[0]);
    expect(c._disabledBadge).toHaveBeenLastCalledWith(true, [duo]);
    expect(flat(c._bySchedule([duo])[0])).toContain("<h2>");
    flat(c._bySchedule([duo], true)[0]);
    expect(c._disabledBadge).toHaveBeenLastCalledWith(true, [duo]);
    duo.enabled = true;
    flat(c._bySchedule([duo], true)[0]);
    expect(c._disabledBadge).toHaveBeenLastCalledWith(false, [duo]);
  });
  it("the badge without programs says only that the program is off", () => {
    const c = card([]);
    expect(flat(c._disabledBadge(true))).toContain(t("en", "program_disabled"));
    expect(flat(c._disabledBadge(false))).toBe("");
    const paused = program("p", "P", ["cover.a"], { enabled: false, paused_until: "2026-11-05T08:00:00Z" });
    expect(flat(c._disabledBadge(true, [paused]))).toContain("until");
  });
  it("today's reading rows come from the spans of the day with the card's time", () => {
    const p = program("p1", "A", ["cover.a"]);
    const c = card([p], { schedule_view: "times" });
    c._deviceDays = () => ({ today: [{ slot_id: "d", start: "2026-11-04T08:00:00Z", end: "2026-11-04T10:00:00Z", ignored: null }], previous: [] });
    const out: Record<string, any> = {};
    const walk = (v: any): void => { if (Array.isArray(v)) v.forEach(walk); else if (v?.strings) v.values.forEach((x: any, i: number) => { const m = /([.?@]?[\w-]+)=$/.exec(v.strings[i]); if (m) out[m[1]] = x; else walk(x); }); };
    walk(c._todayBlock("cover.a", p, () => {}));
    expect(out[".rows"]).toHaveLength(1);
    expect(out[".rows"][0].now).toBe(true); // 09:00 is inside 08:00-10:00
  });
});

describe("day bar and radial dial: defaults and details", () => {
  beforeEach(() => vi.stubGlobal("ResizeObserver", undefined));
  const bar = (spans: any[], props: any = {}) => { const el = new WpDayBar() as any; Object.assign(el, { lang: "en", spans, ...props }); el._width = 1440; return el; };
  it("defaults of the bar and of the dial", () => {
    const b = new WpDayBar() as any, r = new WpRadialDay() as any;
    expect([b.lang, b.deviceName, b.spans]).toEqual(["en", "", []]);
    expect([r.lang, r.deviceName, r.spans, r.now, r.double, r.passive, r.rest, r.selectedTime]).toEqual(["en", "", [], null, false, false, "", ""]);
    expect(String((WpDayBar.styles as any).cssText)).toContain(".nowline");
    expect(String((WpRadialDay.styles as any).cssText)).toContain(".dial");
  });
  it("the sun icons pair side and image; the visible text lists the names that fit in order; the event is named", () => {
    const html = flat(bar([{ start: 360, end: 480, color: "#0", label: "A", startSun: "up", startSpec: { sun: "sunrise" }, endSun: "down", endSpec: { sun: "sunset" } }]).render()).replace(/\s+/g, " ");
    expect(html).toContain('data-sun=up> <span class="sunc"><ha-icon icon=mdi:weather-sunset-up>');
    expect(html).toContain('data-sun=down> <span class="sunc"><ha-icon icon=mdi:weather-sunset-down>');
    expect(html).toContain('<span class="name" style="left:0%;width:100%">A</span>');
    const el = bar([{ start: 0, end: 300, color: "#0", label: "A" }, { start: 400, end: 700, color: "#0", label: "B" }]);
    expect(el.visibleText()).toBe("A B");
    const seen: any[] = [];
    el.dispatchEvent = (e: any) => { seen.push([e.type, e.detail]); return true; };
    el.updated();
    expect(seen).toEqual([["visible-text", "A B"]]);
  });
  it("label room: 7 px a character plus 14, more than the 40 px minimum; a missing 'now' never crosses a span", () => {
    const el = bar([]);
    el._width = 1300;
    expect(el._labelBox({ start: 0, end: 144, label: "x".repeat(20) })).toBeNull(); // 130 px < 154
    el._width = 1540;
    expect(el._labelBox({ start: 0, end: 144, label: "x".repeat(20) })).not.toBeNull();
    el._width = 1440;
    expect(el._labelBox({ start: 0, end: 100, label: "A" })).toEqual({ left: 0, width: 100, text: "A" }); // now is null: whole span
  });
});

describe("radial dial: exact boundaries and the now mark", () => {
  const hit = (x: number, y: number, spans: any[], now: number | null, double = false) => radialHoverTarget(spans, now, double, x, y, { left: 0, top: 0, width: 320 });
  const polar = (turn: number, r: number) => { const a = turn * Math.PI * 2 - Math.PI / 2; return [160 + r * Math.cos(a), 160 + r * Math.sin(a)] as const; };
  const sp = (start: number, end: number, extra: any = {}) => ({ start, end, color: "#0", label: "x", ...extra });
  it("the ring is a target up to 4 px past the track edge, inclusive", () => {
    expect(hit(294, 160, [sp(0, 1440)], null)).toBe(0); // 134 px from the centre, exactly the edge
    expect(hit(26, 160, [sp(0, 1440)], null)).toBe(0);
  });
  it("a stretch includes its start minute and excludes its end minute", () => {
    expect(hit(272, 160, [sp(360, 720)], null)).toBe(0); // 3 o'clock: minute 360 exactly
    expect(hit(272, 160, [sp(0, 360)], null)).toBeNull();
  });
  it("the first minute of the afternoon belongs to the outer ring and its now mark", () => {
    const [x, y] = polar(0, 112);
    expect(hit(x, y, [sp(0, 1440)], 720, true)).toBe("now");
    const [mx, my] = polar(100 / 720, 112);
    expect(hit(mx, my, [sp(0, 1440)], 900, true)).toBe(0); // 100 is far from the 180 of the mark
    expect(hit(mx, my, [sp(0, 1440)], 100 + 720, true)).toBe("now");
  });
  it("a dial with a marker or a stretch is drawn without stray text, and the clock follows the ring of the time", () => {
    const el = new WpRadialDay() as any;
    el.spans = [{ start: 0, end: 60, color: "#0", label: "A" }];
    const html = flat(el.render()).replace(/\s+/g, " ");
    expect(html).toMatch(/<\/svg><\/button> <\/div> <div class="legend">/);
    el.now = 900;
    const line = (h: string) => { const m = /<line x1=([\d.]+) y1=([\d.]+) x2=([\d.]+) y2=([\d.]+) stroke="var\(--primary-text-color\)" stroke-width="3"/.exec(h)!; return [+m[1], +m[2], +m[3], +m[4]]; };
    const [x1, y1] = line(flat(el.render()).replace(/\s+/g, " "));
    const [ex, ey] = polar(900 / 1440, 112 - 18 - 4);
    expect([x1, y1].map(Math.round)).toEqual([ex, ey].map(Math.round));
    el.double = true;
    const [dx, dy] = line(flat(el.render()).replace(/\s+/g, " "));
    const [fx, fy] = polar(180 / 720, 112 - 12 - 4);
    expect([dx, dy].map(Math.round)).toEqual([fx, fy].map(Math.round));
  });
  it("sun icons keep the device name out of their label and stay in the tab order", () => {
    const el = new WpRadialDay() as any;
    el.deviceName = "Shutter";
    el.spans = [{ start: 360, end: 720, color: "#0", label: "A", startSun: "up", startSpec: { sun: "sunrise" } }];
    const html = flat(el.render()).replace(/\s+/g, " ");
    expect(html).toContain("label=Sunrise · 6 am ?no-tab=");
    expect(html).not.toContain("Sunrise · 6 am, Shutter");
  });
});

describe("last guards of the card", () => {
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
  it("today's block rests on the default setting of its own device", () => {
    const p = program("p1", "Duo", ["cover.a", "cover.b"]);
    p.entities[0].default_label = "l"; p.entities[1].default_label = "l2";
    const c = card([p], { schedule_view: "times" });
    c._deviceDays = () => ({ today: [], previous: [] });
    const rest = (e: string) => { let out: any; const walk = (v: any): void => { if (Array.isArray(v)) v.forEach(walk); else if (v?.strings) v.values.forEach((x: any, i: number) => { if (/\.rest=$/.test(v.strings[i])) out = x; else walk(x); }); }; walk(c._todayBlock(e, p, () => {})); return out; };
    expect(rest("cover.a")).toBe("Open");
    expect(rest("cover.b")).toBe("Close");
  });
  it("the chart button shows its own chevron and the compare button its word", () => {
    const p = program("p1", "A", ["cover.a"]);
    const c = card([p], { chart_collapsed: false }); c._bar = vi.fn(() => ""); c._holidayRow = () => "";
    const scope = { kind: "program", programId: "p1" };
    const open = flat(c._extras(scope, "cover.a", [p]));
    expect(open).toMatch(/chart-line"><\/ha-icon>[^<]*<ha-icon class="after" icon=mdi:chevron-up>/);
    const collapsed = card([p], { chart_collapsed: true }); collapsed._bar = vi.fn(() => ""); collapsed._holidayRow = () => "";
    expect(flat(collapsed._extras(scope, "cover.a", [p]))).toMatch(/chart-line"><\/ha-icon>[^<]*<ha-icon class="after" icon=mdi:chevron-down>/);
    expect(flat(c._compare([[p]], false))).toContain(`<span class="hl">${t("en", "compare_edit")}</span>`);
  });
  it("a hold on nothing shown starts no timer", () => {
    const c = card([]);
    c._holdInfo(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("the now mark of a double dial lies exactly on its ring angle", () => {
    const el = new WpRadialDay() as any;
    el.double = true; el.now = 900;
    const m = /<line x1=([\d.]+) y1=([\d.]+) x2=/.exec(flat(el.render()).replace(/\s+/g, " "))!;
    const a = (180 / 720) * Math.PI * 2 - Math.PI / 2;
    expect(+m[1]).toBeCloseTo(160 + 96 * Math.cos(a), 6);
    expect(+m[2]).toBeCloseTo(160 + 96 * Math.sin(a), 6);
  });
});
