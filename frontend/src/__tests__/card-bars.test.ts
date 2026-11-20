import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { t } from "../i18n";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { flat, handlers } from "./helpers/tpl";
import { attrOf, attrs, listCard as card, simpleProgram as program, stubBrowser, unstubBrowser, storage } from "./helpers/planner-card";

const chart = vi.hoisted(() => ({ open: vi.fn() }));
vi.mock("../chart-state", async (orig) => ({ ...(await orig<any>()), openHistory: chart.open }));
vi.mock("../components/confirm", async (orig) => ({ ...(await orig<any>()), pauseChoice: vi.fn() }));
import { pauseChoice } from "../components/confirm";

beforeEach(stubBrowser);
afterEach(unstubBrowser);

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
    expect(attrOf(tpl, /aria-selected=$/)).toEqual([false, true, false]);
    expect(attrOf(tpl, /tabindex=$/)).toEqual([-1, 0, -1]);
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
    expect(oh).toContain('class="week wp-appear"');
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
    expect(html).toContain(`mdi:calendar-week"></ha-icon>${t("en", "week")}<ha-icon class="after"`);
    expect(html).toMatch(new RegExp(`mdi:chart-line"></ha-icon>${t("en", "chart_day")}<ha-icon class="after" icon=mdi:chevron-up>`));
    hs[1].fn(); // close
    expect(c._charts.size).toBe(1);
    expect([...c._charts.values()]).toEqual([false]);
    expect(storage().setItem).toHaveBeenCalledTimes(1); // remembered
    const closed = flat(c._extras(scope, "cover.a", [p]));
    expect(closed).not.toContain("<wp-chart");
    expect(closed).toMatch(/chart-line"><\/ha-icon>[^<]*<ha-icon class="after" icon=mdi:chevron-down>/);
    handlers(first).find((h) => h.event === "open-history")!.fn({ detail: "/history?x" });
    expect(chart.open).toHaveBeenCalledWith("/history?x");
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

describe("week list touch targets", () => {
  it("the day name buttons of the week list are 44 px wide", () => {
    const css = [WeeklyPlannerCard.styles].flat(Infinity).map((s: any) => s?.cssText ?? "").join("\n");
    expect(css).toMatch(/\.wnamebtn \{[^}]*width: 44px/);
  });
});
