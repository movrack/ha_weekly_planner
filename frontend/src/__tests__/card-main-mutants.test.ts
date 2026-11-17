import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { t } from "../i18n";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { flat, handlers } from "./helpers/tpl";

vi.mock("../components/confirm", async (orig) => ({ ...(await orig<any>()), pauseChoice: vi.fn() }));
import { pauseChoice } from "../components/confirm";

// Mutation survivors of the main list of the card: bars, device tabs, switches, the week and chart toggles, previews and housekeeping.
const slot = (id: string, start: any = { time: "08:00" }, end: any = { time: "09:00" }) => ({ id, label: "l", start, ...(end ? { end } : {}) });
const label = { id: "l", name: "Open", color: "#0f0", action: { kind: "service", service: "cover.open_cover" } };
const mkHass = (over: any = {}): any => ({ language: "en", config: { time_zone: "UTC" }, states: {}, services: { cover: { open_cover: { fields: {} } } }, callWS: vi.fn(async () => ({ slots: [] })), ...over });
const program = (id: string, name: string, ids: string[], extra: any = {}) => ({
  id, name, revision: 1, priority: 1, enabled: true, reapply: true, conditions: [],
  entities: ids.map((e) => ({ entity_id: e, default_label: null, label_overrides: {} })),
  profiles: [{ id: "pr", name: "A", days: Array.from({ length: 7 }, () => [slot("d")]) }], ...extra });
const card = (programs: any[], config: any = {}, data: any = {}, hass = mkHass()) => {
  const c = new WeeklyPlannerCard() as any;
  c.hass = hass;
  c._config = { type: "x", ...config };
  c._now = new Date("2026-11-04T09:00:00Z"); // a Wednesday
  c._data = { labels: [label], programs, status: {}, can_edit: true, read_only: false, ...data };
  c._open = vi.fn();
  return c;
};
/** Value bound to each attribute name of a template tree (first one wins), directives included. */
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

beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal("window", { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout, localStorage: { getItem: () => null, setItem: () => {} } }); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("messages and undo", () => {
  it("a message disappears after 8 s; the pointer or the focus holds it; leaving restarts the 8 s", () => {
    const c = card([]);
    c._say("Saved");
    expect(c._info).toBe("Saved");
    vi.advanceTimersByTime(7999);
    expect(c._info).toBe("Saved");
    vi.advanceTimersByTime(1);
    expect(c._info).toBeUndefined();
    c._say("Again");
    vi.advanceTimersByTime(5000);
    c._say("Newer"); // restarts
    vi.advanceTimersByTime(5000);
    expect(c._info).toBe("Newer");
    c._holdInfo(true);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(60000);
    expect(c._info).toBe("Newer");
    c._holdInfo(false);
    vi.advanceTimersByTime(7999);
    expect(c._info).toBe("Newer");
    vi.advanceTimersByTime(1);
    expect(c._info).toBeUndefined();
    c._holdInfo(false); // nothing shown: no timer
    c._holdInfo(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("the undo bar lasts 6 s, restarts with a newer edit, and undo calls it once and closes the bar", async () => {
    const c = card([]);
    const undo = vi.fn(async () => true);
    c._showSnack(undo);
    expect(c._snack).toEqual({ undo });
    vi.advanceTimersByTime(5999);
    expect(c._snack).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(c._snack).toBeNull();
    c._showSnack(undo);
    vi.advanceTimersByTime(4000);
    c._showSnack(undo);
    vi.advanceTimersByTime(4000);
    expect(c._snack).not.toBeNull();
    await c._undo();
    expect(undo).toHaveBeenCalledTimes(1);
    expect(c._snack).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    await expect(c._undo()).resolves.toBeUndefined(); // nothing to undo
    expect(undo).toHaveBeenCalledTimes(1);
  });
});

describe("a bar of the list", () => {
  const setup = (extra: any = {}, config: any = {}) => {
    const p = program("p1", "Volet", ["cover.a"], extra);
    const c = card([p], config);
    c._lockedText = (pr: any) => (pr ? "locked!" : "");
    return { c, p };
  };
  it("passes the device, the day, the time and the display options to the editor", () => {
    const { c, p } = setup();
    const a = attrs(c._bar("cover.a", p, 0, "today"));
    expect([a["entity-id"], a.weekday, a["lang"], a["tz"], a["device-name"], a["view"], a["?hours"], a["?editing"], a["?editable"], a[".now"], a["locked-reason"]])
      .toEqual(["cover.a", 2, "en", "UTC", "Volet", "bar", true, false, false, 540, "locked!"]); // today is locked, so not editable
    c._lockedText = () => "";
    expect(attrs(c._bar("cover.a", p, 0, "today"))["?editable"]).toBe(true);
    c._lockedText = (pr: any) => (pr ? "locked!" : "");
    expect(a[".program"]).toBe(p);
    expect(a[".rest"]).toBe(t("en", "rest_none"));
    const w = attrs(c._bar("cover.a", p, 3, "week")); // Saturday
    expect([w.weekday, w["?hours"], w[".now"], w["locked-reason"], w["view"]]).toEqual([5, false, null, "", "bar"]);
    c._config.schedule_view = "radial";
    expect(attrs(c._bar("cover.a", p, 0, "today")).view).toBe("radial");
    expect(attrs(c._bar("cover.a", p, 1, "week")).view).toBe("bar");
    p.entities[0].default_label = "l";
    expect(attrs(c._bar("cover.a", p, 0, "today"))[".rest"]).toBe("Open");
    const two = program("p2", "Duo", ["cover.a", "cover.b"]);
    expect(attrs(c._bar("cover.b", two, 0, "today"))["device-name"]).toBe("Duo, cover.b");
  });
  it("editing is true only for the bar being edited; the editor events set, clear and report", () => {
    const { c, p } = setup();
    const tpl = () => c._bar("cover.a", p, 0, "today");
    c._edit = "p1|cover.a|today|2";
    expect(attrs(tpl())["?editing"]).toBe(true);
    c._edit = "p1|cover.a|week|2";
    expect(attrs(tpl())["?editing"]).toBe(false);
    c._edit = null;
    const hs = handlers(tpl());
    hs.find((h) => h.event === "edit-request")!.fn();
    expect(c._edit).toBe("p1|cover.a|today|2");
    c._edit = "other";
    hs.find((h) => h.event === "edit-exit")!.fn();
    expect(c._edit).toBe("other");
    c._edit = "p1|cover.a|today|2";
    hs.find((h) => h.event === "edit-exit")!.fn();
    expect(c._edit).toBeNull();
    c._say = vi.fn();
    hs.find((h) => h.event === "locked-request")!.fn();
    expect(c._say).toHaveBeenCalledWith("locked!");
    const undo = vi.fn();
    hs.find((h) => h.event === "edited")!.fn({ detail: { undo } });
    expect(c._snack).toEqual({ undo });
  });
  it("a bar is not editable when read only, when the mode is followed, or when today is locked", () => {
    const { c, p } = setup();
    expect(c._barEditable(p, 0)).toBe(false); // today is locked
    expect(c._barEditable(p, 1)).toBe(true);
    c._lockedText = () => "";
    expect(c._barEditable(p, 0)).toBe(true);
    c._data.read_only = true;
    expect(c._barEditable(p, 1)).toBe(false);
    c._data.read_only = false; c._data.can_edit = false;
    expect(c._barEditable(p, 1)).toBe(false);
    c._data.can_edit = true;
    expect(c._needsCreate(p, "cover.a")).toBe(false);
  });
  it("create button: only for a device without any slot when editing is allowed", () => {
    const { c, p } = setup();
    p.profiles[0].days = Array.from({ length: 7 }, () => []);
    expect(c._needsCreate(p, "cover.a")).toBe(true);
    c._data.can_edit = false;
    expect(c._needsCreate(p, "cover.a")).toBe(false);
    c._data.can_edit = true; c._data.read_only = true;
    expect(c._needsCreate(p, "cover.a")).toBe(false);
    c._data.read_only = false;
    const tpl = c._createButton({ kind: "program", programId: "p1" });
    expect(flat(tpl)).toContain("mdi:plus");
    expect(flat(tpl)).toContain(t("en", "create_setting"));
    handlers(tpl)[0].fn();
    expect(c._open).toHaveBeenCalledWith({ kind: "program", programId: "p1" }, undefined, true);
  });
});

describe("device tabs and the switch", () => {
  const two = () => program("p1", "Duo", ["cover.a", "cover.b", "cover.c"]);
  it("one tab per device, the shown one selected with a check, the others out of the tab order; a single device has none", () => {
    const c = card([two()]);
    const p = c._data.programs[0];
    expect(flat(c._deviceTabs(program("s", "S", ["cover.a"])))).toBe("");
    c._deviceOf = new Map([["p1", "cover.b"]]);
    const tpl = c._deviceTabs(p);
    const html = flat(tpl);
    expect(html).toContain(`aria-label=${t("en", "devices_of", { name: "Duo" })}`);
    expect(html.match(/role="tab"/g)).toHaveLength(3);
    expect(html.match(/mdi:check/g)).toHaveLength(1);
    const sel: any[] = [], tab: any[] = [];
    const walk = (v: any): void => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v?.strings) v.values.forEach((x: any, i: number) => { if (/aria-selected=$/.test(v.strings[i])) sel.push(x); else if (/tabindex=$/.test(v.strings[i])) tab.push(x); else walk(x); });
    };
    walk(tpl);
    expect(sel).toEqual([false, true, false]);
    expect(tab).toEqual([-1, 0, -1]);
    const clicks = handlers(tpl).filter((h) => h.event === "click");
    clicks[2].fn();
    expect(c._shownDevice(p)).toBe("cover.c");
    expect(c._shownDevice(program("q", "Q", ["cover.a", "cover.b"]))).toBe("cover.a");
    c._deviceOf = new Map([["p1", "cover.gone"]]);
    expect(c._shownDevice(p)).toBe("cover.a");
  });
  it("arrows, Home and End move the choice (wrapping) and take the focus; other keys do nothing", async () => {
    const c = card([two()]);
    const p = c._data.programs[0];
    const focus = vi.fn();
    Object.defineProperty(c, "updateComplete", { value: Promise.resolve(true), configurable: true });
    Object.defineProperty(c, "renderRoot", { value: { querySelectorAll: vi.fn(() => [{ dataset: { tab: "x" }, focus: vi.fn() }, { dataset: { tab: "p1" }, focus }]) } });
    const press = async (key: string, from: string) => {
      c._deviceOf = new Map([["p1", from]]);
      const ev = { key, preventDefault: vi.fn() };
      handlers(c._deviceTabs(p)).find((h) => h.event === "keydown")!.fn(ev);
      await Promise.resolve(); await Promise.resolve();
      return { shown: c._shownDevice(p), prevented: ev.preventDefault.mock.calls.length };
    };
    expect(await press("ArrowRight", "cover.a")).toEqual({ shown: "cover.b", prevented: 1 });
    expect(await press("ArrowDown", "cover.c")).toEqual({ shown: "cover.a", prevented: 1 });
    expect(await press("ArrowLeft", "cover.a")).toEqual({ shown: "cover.c", prevented: 1 });
    expect(await press("ArrowUp", "cover.b")).toEqual({ shown: "cover.a", prevented: 1 });
    expect(await press("Home", "cover.c")).toEqual({ shown: "cover.a", prevented: 1 });
    expect(await press("End", "cover.a")).toEqual({ shown: "cover.c", prevented: 1 });
    expect(focus).toHaveBeenCalledTimes(6);
    focus.mockClear();
    expect(await press("a", "cover.b")).toEqual({ shown: "cover.b", prevented: 0 });
    expect(focus).not.toHaveBeenCalled();
  });
  it("the switch tells its state, is disabled while read only or busy, and toggles on click", () => {
    const p = program("p1", "Volet", ["cover.a"]);
    const c = card([p]);
    c._toggleProgram = vi.fn();
    const a = attrs(c._programToggle(p));
    expect([a["aria-checked"], a["data-program"], a["aria-label"], a["?disabled"]]).toEqual([true, "p1", "Volet", false]);
    expect(flat(c._programToggle(p))).toContain("icon=mdi:toggle-switch>");
    p.enabled = false;
    expect(flat(c._programToggle(p))).toContain("mdi:toggle-switch-off-outline");
    expect(attrs(c._programToggle(p))["aria-checked"]).toBe(false);
    c._data.read_only = true;
    expect(attrs(c._programToggle(p))["?disabled"]).toBe(true);
    c._data.read_only = false;
    c._toggling = new Set(["p1"]);
    expect(attrs(c._programToggle(p))["?disabled"]).toBe(true);
    c._toggling = new Set(["other"]);
    expect(attrs(c._programToggle(p))["?disabled"]).toBeFalsy();
    handlers(c._programToggle(p))[0].fn();
    expect(c._toggleProgram).toHaveBeenCalledWith(p);
  });
  it("switching on calls the server and says so; switching off asks how long; cancel does nothing", async () => {
    const p = program("p1", "Volet", ["cover.a"], { enabled: false });
    const c = card([p]);
    c._say = vi.fn();
    Object.defineProperty(c, "updateComplete", { value: Promise.resolve(true), configurable: true });
    c._focusSwitch = vi.fn();
    await c._toggleProgram(p);
    expect(c.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/program/set_enabled", program_id: "p1", enabled: true });
    expect(c._say).toHaveBeenCalledWith(t("en", "program_resumed", { name: "Volet" }));
    expect(pauseChoice).not.toHaveBeenCalled();
    expect(c._toggling.size).toBe(0);
    await Promise.resolve();
    expect(c._focusSwitch).toHaveBeenCalledWith("p1");
    p.enabled = true;
    c.hass.callWS.mockClear();
    (pauseChoice as any).mockResolvedValueOnce(null);
    await c._toggleProgram(p);
    expect(pauseChoice).toHaveBeenCalledWith(c, "Volet");
    expect(c.hass.callWS).not.toHaveBeenCalled();
    expect(c._toggling.size).toBe(0);
    (pauseChoice as any).mockResolvedValueOnce("none");
    await c._toggleProgram(p);
    expect(c.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/program/set_enabled", program_id: "p1", enabled: false });
    (pauseChoice as any).mockResolvedValueOnce(24);
    await c._toggleProgram(p);
    expect(c.hass.callWS).toHaveBeenLastCalledWith({ type: "weekly_planner/program/pause", program_id: "p1", hours: 24 });
    expect(c._say).toHaveBeenCalledTimes(1);
  });
  it("a second tap while busy is ignored; a failure shows the error and frees the switch", async () => {
    const p = program("p1", "Volet", ["cover.a"], { enabled: false });
    const c = card([p]);
    Object.defineProperty(c, "updateComplete", { value: Promise.resolve(true), configurable: true }); c._focusSwitch = vi.fn();
    c._toggling = new Set(["p1"]);
    await c._toggleProgram(p);
    expect(c.hass.callWS).not.toHaveBeenCalled();
    c._toggling = new Set(["p1", "keep"]);
    c._toggling.delete("p1");
    c.hass.callWS.mockRejectedValueOnce(new Error("boom"));
    await c._toggleProgram(p);
    expect(c._error).toBeTruthy();
    expect([...c._toggling]).toEqual(["keep"]);
    const dom = card([p]);
    Object.defineProperty(dom, "updateComplete", { value: Promise.resolve(true), configurable: true });
    const el = { dataset: { program: "p1" }, focus: vi.fn() };
    Object.defineProperty(dom, "renderRoot", { value: { querySelectorAll: () => [{ dataset: { program: "zz" }, focus: vi.fn() }, el] } });
    dom._focusSwitch("p1");
    expect(el.focus).toHaveBeenCalledWith({ preventScroll: true });
  });
});

describe("the week and chart toggles under a bar", () => {
  const setup = (config: any = {}) => {
    const p = program("p1", "Volet", ["cover.a"]);
    const c = card([p], config);
    c._bar = vi.fn(() => "BAR"); c._holidayRow = vi.fn(() => "HOLIDAY");
    const scope = { kind: "program", programId: "p1" };
    return { c, p, scope };
  };
  it("the week button opens and closes seven days Monday to Sunday, each opening its day", () => {
    const { c, p, scope } = setup({ show_chart: false });
    const closed = c._extras(scope, "cover.a", [p]);
    const html = flat(closed);
    expect(html).toContain(`aria-label=${t("en", "week_of", { name: "Volet" })}`);
    expect(attrs(closed)["aria-expanded"]).toBe(false);
    expect(html).toContain("mdi:chevron-down");
    expect(html).not.toContain('class="week"');
    expect(html).not.toContain("chartbtn");
    handlers(closed).find((h) => h.event === "click")!.fn();
    expect([...c._week]).toEqual(["p:p1|cover.a"]);
    const open = c._extras(scope, "cover.a", [p]);
    const oh = flat(open);
    expect(oh).toContain('class="week"');
    expect(oh).toContain("mdi:chevron-up");
    expect(oh).toContain("HOLIDAY");
    expect(oh.match(/class="wday"/g)).toHaveLength(7);
    expect([...oh.matchAll(/class="wnamebtn" aria-label=(\w+)/g)].map((m) => m[1])).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    expect([...oh.matchAll(/class="wname (today)?"/g)].map((m) => m[1] ?? "")).toEqual(["", "", "today", "", "", "", ""]);
    expect(c._bar.mock.calls.map((x: any[]) => [x[2], x[3]])).toEqual([[5, "week"], [6, "week"], [0, "week"], [1, "week"], [2, "week"], [3, "week"], [4, "week"]]);
    const clicks = handlers(open).filter((h) => h.event === "click");
    clicks[1 + 0].fn(); // Monday
    expect(c._open).toHaveBeenCalledWith(scope, { weekday: 0, offset: 5 });
    clicks[3].fn(); // Wednesday = today
    expect(c._open).toHaveBeenLastCalledWith(scope, { weekday: 2, offset: 0 });
    clicks[0].fn();
    expect(c._week.size).toBe(0);
  });
  it("the chart button follows the default, flips on click and is remembered; no chart without data or when switched off", () => {
    const { c, p, scope } = setup();
    c._config.chart_collapsed = false;
    const first = c._extras(scope, "cover.a", [p]);
    const hs = handlers(first).filter((h) => h.event === "click");
    const html = flat(first);
    expect(html).toContain(`aria-label=${t("en", "chart_day_of", { name: "Volet" })}`);
    expect(html).toContain("chartbtn");
    expect(html).toContain("<wp-chart");
    expect(html).toContain("mdi:calendar-week");
    expect(html).toContain("mdi:chart-line");
    hs[1].fn(); // close
    expect(c._charts.size).toBe(1);
    expect([...c._charts.values()]).toEqual([false]);
    const closed = flat(c._extras(scope, "cover.a", [p]));
    expect(closed).not.toContain("<wp-chart");
    const again = handlers(c._extras(scope, "cover.a", [p])).filter((h) => h.event === "click");
    again[1].fn();
    expect([...c._charts.values()]).toEqual([true]);
    const collapsed = setup();
    expect(flat(collapsed.c._extras(collapsed.scope, "cover.a", [collapsed.p]))).not.toContain("<wp-chart");
    const noData = setup(); noData.c._data = undefined;
    noData.c._deviceDays = () => ({ today: undefined, previous: undefined });
    expect(flat(noData.c._extras(noData.scope, "cover.a", [noData.p]))).not.toContain("chartbtn");
  });
  it("the chart gets today's slots, with those of the day before in front", () => {
    const { c, p, scope } = setup({ chart_collapsed: false });
    c._deviceDays = () => ({ today: [{ slot_id: "b" }], previous: [{ slot_id: "a" }] });
    const a = attrs(c._extras(scope, "cover.a", [p]));
    expect(a[".slots"]).toEqual([{ slot_id: "a" }, { slot_id: "b" }]);
    expect(a["date"]).toBe("2026-11-04");
    expect(a["entity-id"]).toBe("cover.a");
    c._deviceDays = () => ({ today: [{ slot_id: "b" }], previous: undefined });
    expect(attrs(c._extras(scope, "cover.a", [p]))[".slots"]).toEqual([{ slot_id: "b" }]);
    c._deviceDays = () => ({ today: undefined, previous: [{ slot_id: "a" }] });
    expect(attrs(c._extras(scope, "cover.a", [p]))[".slots"]).toBeNull();
  });
});

describe("loading of the previews and of the domain names", () => {
  it("loads 8 days of every program once, then only when the key changes", async () => {
    const p = program("pl1", "Volet", ["cover.a"]);
    const c = card([p]);
    await c._loadPreviews();
    expect(c.hass.callWS).toHaveBeenCalledTimes(8);
    const dates = c.hass.callWS.mock.calls.map((x: any[]) => x[0].date).sort();
    expect(dates).toEqual(["2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09", "2026-11-10"]);
    expect(Object.keys(c._preview)).toHaveLength(8);
    expect(c._preview["2026-11-04"].pl1).toEqual({ slots: [] });
    expect(c._failedPreviewKey).toBe("");
    await c._loadPreviews();
    expect(c.hass.callWS).toHaveBeenCalledTimes(8);
    c._data.holiday_today = true; // another key
    await c._loadPreviews();
    expect(c.hass.callWS).toHaveBeenCalledTimes(8); // answers come from the cache of the same program and revision
    expect(c._previewKey).toContain("|off|");
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
    c._retryPreviews();
    expect(c._previewRetryAt).toBe(0);
    expect(c._failedPreviewKey).toBe("");
    expect(c.requestUpdate).toHaveBeenCalled();
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
