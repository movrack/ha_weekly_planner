import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LitElement } from "lit";
import { t } from "../i18n";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { currentTimeFormat } from "../time";
import { flat, handlers } from "./helpers/tpl";

const mocks = vi.hoisted(() => ({ reload: vi.fn(), subscribe: vi.fn(), onNames: vi.fn() }));
vi.mock("../update", async (orig) => ({ ...(await orig<any>()), reloadIfOutdated: mocks.reload }));
vi.mock("../planner", async (orig) => ({ ...(await orig<any>()), subscribePlanner: mocks.subscribe }));
vi.mock("../services", async (orig) => ({ ...(await orig<any>()), onServiceNames: mocks.onNames }));

// Mutation survivors of the card: life cycle, the line of a device, the grouped programs and today's reading block.
const slot = (id: string) => ({ id, label: "l", start: { time: "08:00" }, end: { time: "09:00" } });
const label = { id: "l", name: "Open", color: "#0f0", action: { kind: "service", service: "cover.open_cover" } };
const program = (id: string, name: string, ids: string[], extra: any = {}) => ({
  id, name, revision: 1, priority: 1, enabled: true, reapply: true, conditions: [],
  entities: ids.map((e) => ({ entity_id: e, default_label: null, label_overrides: {} })),
  profiles: [{ id: "pr", name: "A", days: Array.from({ length: 7 }, () => [slot("d")]) }], ...extra });
const card = (programs: any[], config: any = {}, data: any = {}, hass: any = {}) => {
  const c = new WeeklyPlannerCard() as any;
  c.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, services: { cover: { open_cover: { fields: {} } } }, callWS: vi.fn(async () => ({ card_version: "9" })), ...hass };
  c._config = { type: "x", ...config };
  c._now = new Date("2026-11-04T09:00:00Z");
  c._data = { labels: [label], programs, status: {}, can_edit: true, read_only: false, ...data };
  c._open = vi.fn();
  return c;
};
const attrs = (tpl: any): Record<string, any> => {
  const found: Record<string, any> = {};
  const walk = (v: any): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v?.strings) v.values.forEach((x: any, i: number) => { const m = /([.?@]?[\w-]+)=$/.exec(v.strings[i]); if (m && !(m[1] in found)) found[m[1]] = x; if (!m || typeof x === "object") walk(x); });
    else if (v?._$litDirective$ && Array.isArray(v.values)) walk(v.values);
  };
  walk(tpl);
  return found;
};

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
});

describe("the line of a device", () => {
  const stubs = (c: any) => { c._bar = vi.fn(() => "BAR"); c._extras = vi.fn(() => "EXTRAS"); c._todayBlock = vi.fn(() => "TODAY"); c._lockedNote = vi.fn(() => "NOTE"); c._skipped = vi.fn(() => "SKIPPED"); return c; };
  const open = { kind: "program", programId: "p1" };
  it("the icon: given, then the device's own, then the state icon component, then a calendar", () => {
    const p = program("p1", "Volet", ["cover.a"]);
    const c = stubs(card([p]));
    const line = (opts: any = {}) => flat(c._line("cover.a", [p], { name: "Volet", button: open, open, ...opts }));
    expect(line()).toContain('<ha-icon class="dev" icon=mdi:calendar-clock></ha-icon>');
    expect(line({ icon: "mdi:blinds" })).toContain('<ha-icon class="dev" icon=mdi:blinds></ha-icon>');
    c.hass.states["cover.a"] = { entity_id: "cover.a", state: "open", attributes: {} };
    expect(line()).toContain('<ha-state-icon class="dev"');
    expect(line({ icon: "mdi:blinds" })).toContain('<ha-icon class="dev" icon=mdi:blinds></ha-icon>');
    c.hass.states["cover.a"].attributes.icon = "mdi:window-shutter";
    expect(line()).toContain('<ha-icon class="dev" icon=mdi:window-shutter></ha-icon>');
    expect(line({ icon: "mdi:blinds" })).toContain("icon=mdi:blinds>");
  });
  it("state text: the translated state, else the raw one, else a dash; name only when given", () => {
    const p = program("p1", "Volet", ["cover.a"]);
    const c = stubs(card([p]));
    const line = (opts: any = {}) => flat(c._line("cover.a", [p], { name: null, button: null, open, ...opts }));
    expect(line()).toContain('<span class="state">—</span>');
    expect(line()).not.toContain('class="name"');
    c.hass.states["cover.a"] = { entity_id: "cover.a", state: "open", attributes: {} };
    expect(line()).toContain('<span class="state">open</span>');
    c.hass.formatEntityState = () => "Ouvert";
    expect(line()).toContain('<span class="state">Ouvert</span>');
    expect(line({ name: "Volet" })).toContain('<span class="name">Volet</span>');
    c.hass.formatEntityState = () => undefined;
    expect(line()).toContain('<span class="state">open</span>');
  });
  it("the next change with its setting name and time, else its action; none when nothing is planned", () => {
    const p = program("p1", "Volet", ["cover.a"]);
    const c = stubs(card([p], {}, { status: { p1: { next_actions: { "cover.a": { at: "2026-11-04T16:55:00Z", label: "l", action: { kind: "service", service: "cover.open_cover" } } } } } }));
    const line = () => flat(c._line("cover.a", [p], { name: null, button: null, open })).replace(/\s+/g, " ");
    expect(line()).toContain(`<span class="arrow">${t("en", "next_then")}</span> <span class="lbl">Open</span> <span class="when nw">`);
    expect(line()).toContain("4:55 pm");
    c._data.status.p1.next_actions["cover.a"].label = "gone";
    expect(line()).not.toContain('class="lbl">Open<');
    expect(line()).toContain('class="lbl">');
    c._data.status = {};
    expect(line()).not.toContain('class="next"');
    expect(line()).toContain("SKIPPED");
  });
  it("the header with the switch and the edit button only when a button scope is given; badge for a paused program", () => {
    const p = program("p1", "Volet", ["cover.a"]);
    const c = stubs(card([p]));
    c._noSchedule = vi.fn(() => "NOSCHED"); c._disabledBadge = vi.fn(() => "BADGE"); c._programToggle = vi.fn(() => "TOGGLE");
    const tpl = c._line("cover.a", [p], { name: "Volet", button: open, open });
    const html = flat(tpl);
    expect(html).toContain("NOSCHED");
    expect(html).toContain("BADGE");
    expect(c._disabledBadge).toHaveBeenCalledWith(false, [p]);
    expect(html).toContain("TOGGLE");
    expect(html).toContain(`aria-label=${t("en", "hours_of", { name: "Volet" })} title=${t("en", "hours")}`);
    expect(html).toContain(`<span class="hl">${t("en", "edit_word")}</span>`);
    handlers(tpl).find((h) => h.event === "click")!.fn();
    expect(c._open).toHaveBeenCalledWith(open);
    p.enabled = false;
    c._line("cover.a", [p], { name: "Volet", button: open, open });
    expect(c._disabledBadge).toHaveBeenLastCalledWith(true, [p]);
    const unnamed = flat(c._line("cover.a", [p], { name: null, button: open, open }));
    expect(unnamed).toContain(`aria-label=${t("en", "hours_of", { name: "cover.a" })}`);
    const bare = flat(c._line("cover.a", [p], { name: null, button: null, open }));
    expect(bare).not.toContain("header-actions");
    expect(bare).not.toContain("BADGE");
    expect(bare).not.toContain("NOSCHED");
    const two = program("p2", "Duo", ["cover.a", "cover.b"]);
    const many = flat(c._line("cover.a", [two, p], { name: "x", button: open, open }));
    expect(many).not.toContain("TOGGLE");
    expect(many).not.toContain("NOSCHED");
    expect(c._disabledBadge).toHaveBeenLastCalledWith(false, [two, p]);
    expect(flat(c._line("cover.a", [two], { name: "x", button: open, open }))).toContain("TOGGLE");
  });
  it("today under the line: the bar with its short label, the times block, the radial dial, or the create button; notes and extras after", () => {
    const p = program("p1", "Volet", ["cover.a"]);
    const c = stubs(card([p]));
    const line = () => flat(c._line("cover.a", [p], { name: null, button: null, open }));
    let html = line();
    expect(html).toContain(`<span class="wname" title=${t("en", "today")}>${t("en", "today_short")}</span>`);
    expect(c._bar).toHaveBeenCalledWith("cover.a", p, 0, "today");
    expect(html).toContain("NOTE");
    expect(html).toContain("EXTRAS");
    expect(c._extras).toHaveBeenCalledWith(open, "cover.a", [p]);
    c._config.schedule_view = "times";
    html = line();
    expect(html).toContain("TODAY");
    expect(html).not.toContain('class="today"');
    c._config.schedule_view = "radial";
    c._bar.mockClear();
    html = line();
    expect(html).not.toContain('class="wname"');
    expect(c._bar).toHaveBeenCalledTimes(1);
    c._config.schedule_view = "radial_12h";
    html = line();
    expect(html).not.toContain('class="wname"');
    c._config.schedule_view = undefined;
    c._createButton = vi.fn(() => "CREATE");
    c._needsCreate = () => true;
    html = line();
    expect(html).toContain("CREATE");
    expect(html).not.toContain("NOTE");
    expect(html).not.toContain("EXTRAS");
    expect(html).not.toContain("BAR");
    expect(c._createButton).toHaveBeenCalledWith(open);
    c._config.schedule_view = "times";
    expect(line()).not.toContain("TODAY");
    c._todayBlock.mock.calls.length = 0;
    c._needsCreate = () => false;
    flat(c._line("cover.a", [p], { name: null, button: null, open }));
    c._todayBlock.mock.calls[0][2]();
    expect(c._open).toHaveBeenCalledWith(open);
  });
});

describe("grouped programs and today's reading block", () => {
  it("a one-device program is one named line; a several-device one a section with its tabs and the shown device", () => {
    const one = program("p1", "Volet", ["cover.a"], { icon: "mdi:blinds" });
    const duo = program("p2", "Duo", ["cover.b", "cover.c"], { enabled: false });
    const c = card([one, duo]);
    c._line = vi.fn(() => "LINE"); c._deviceTabs = vi.fn(() => "TABS"); c._noSchedule = vi.fn(() => "NOSCHED"); c._programToggle = vi.fn(() => "TOGGLE");
    c._shownDevice = () => "cover.c";
    const out = c._bySchedule([one, duo], false);
    expect(c._line).toHaveBeenNthCalledWith(1, "cover.a", [one], { name: "Volet", icon: "mdi:blinds", button: { kind: "program", programId: "p1" }, open: { kind: "program", programId: "p1" } });
    expect(c._line).toHaveBeenNthCalledWith(2, "cover.c", [duo], { name: null, button: null, open: { kind: "program", programId: "p2", entityId: "cover.c" } });
    expect(out[0]).toBe("LINE");
    const html = flat(out[1]);
    expect(html).toContain('<section class="prog">');
    expect(html).toContain("icon=mdi:calendar-clock");
    expect(html).toContain("<h2>Duo");
    expect(html).toContain("NOSCHED");
    expect(html).toContain("TABS");
    expect(html).toContain("TOGGLE");
    expect(html).toContain(t("en", "paused_until", { when: "" }).slice(0, 3) && t("en", "program_disabled"));
    expect(html).toContain(`aria-label=${t("en", "hours_of", { name: "Duo" })} title=${t("en", "hours")}`);
    expect(html).toContain(`<span class="hl">${t("en", "edit_word")}</span>`);
    handlers(out[1]).filter((h) => h.event === "click").pop()!.fn();
    expect(c._open).toHaveBeenCalledWith({ kind: "program", programId: "p2" });
    const grouped = flat(c._bySchedule([duo], true)[0]);
    expect(grouped).toContain("<h3>Duo");
    expect(grouped).not.toContain("<h2>");
    duo.enabled = true;
    duo.icon = "mdi:fan";
    const enabled = flat(c._bySchedule([duo], false)[0]);
    expect(enabled).not.toContain(t("en", "program_disabled"));
    expect(enabled).toContain("icon=mdi:fan");
    one.icon = undefined;
    c._line.mockClear();
    c._bySchedule([one], false);
    expect(c._line.mock.calls[0][2].icon).toBeUndefined();
  });
  it("today's reading block passes its rows, state, rest text, rights and name to the component", () => {
    const p = program("p1", "Volet", ["cover.a"]);
    const c = card([p], { schedule_view: "times" });
    c._lockedText = () => "";
    const open = vi.fn();
    c._deviceDays = () => ({ today: [], previous: [] });
    let a = attrs(c._todayBlock("cover.a", p, open));
    expect([a[".rows"], a["state"], a[".rest"], a["?editable"], a["?locked"], a["lang"], a["device-name"]]).toEqual([[], "ready", t("en", "rest_none"), true, false, "en", "Volet"]);
    expect(a["@open-day"]).toBe(open);
    p.entities[0].default_label = "l";
    expect(attrs(c._todayBlock("cover.a", p, open))[".rest"]).toBe("Open");
    c._lockedText = () => "locked";
    expect(attrs(c._todayBlock("cover.a", p, open))["?locked"]).toBe(true);
    c._data.read_only = true;
    expect(attrs(c._todayBlock("cover.a", p, open))["?editable"]).toBe(false);
    c._data.read_only = false; c._data.can_edit = false;
    expect(attrs(c._todayBlock("cover.a", p, open))["?editable"]).toBe(false);
    c._deviceDays = () => ({ today: undefined, previous: undefined });
    a = attrs(c._todayBlock("cover.a", p, open));
    expect([a[".rows"], a.state]).toEqual([[], "loading"]);
    c._failedPreviewKey = "k";
    expect(attrs(c._todayBlock("cover.a", p, open)).state).toBe("failed");
    const retry = vi.spyOn(c, "_retryPreviews").mockImplementation(() => {});
    handlers(c._todayBlock("cover.a", p, open)).find((h) => h.event === "retry")!.fn();
    expect(retry).toHaveBeenCalled();
  });
});

describe("schedule dialog identity", () => {
  it("a new dialog is made for another device or scope of the same program, not for the same one", () => {
    const c = card([program("p1", "Volet", ["cover.a", "cover.b"])]);
    const keyOf = (scope: any) => { c._dialog = { kind: "schedule", scope }; return (c._renderDialog() as any).values[0]; };
    const a = keyOf({ kind: "program", programId: "p1", entityId: "cover.a" });
    const b = keyOf({ kind: "program", programId: "p1", entityId: "cover.b" });
    const plain = keyOf({ kind: "program", programId: "p1" });
    const label = keyOf({ kind: "label", labelId: "l" });
    expect(new Set([a, b, plain, label]).size).toBe(4);
    expect(a.endsWith("|cover.a")).toBe(true);
    expect(plain.endsWith("|")).toBe(true);
    expect(label.endsWith("|")).toBe(true);
    expect(keyOf({ kind: "program", programId: "p1", entityId: "cover.a" })).toBe(a);
  });
});
