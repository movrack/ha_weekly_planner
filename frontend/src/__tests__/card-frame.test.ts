import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { t } from "../i18n";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { flat, handlers } from "./helpers/tpl";
import { attrs, listCard as card, simpleProgram as program, stubBrowser, unstubBrowser } from "./helpers/planner-card";

beforeEach(stubBrowser);
afterEach(unstubBrowser);

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

describe("card header", () => {
  const rendered = (config: any, data: any = {}) => {
    const c = card([], { schedule_view: "list", ...config }, data);
    c._list = () => "";
    c._modeLine = () => ""; c._holidayLine = () => "";
    return flat(c.render());
  };
  it("a title shows its heading; empty or missing shows no header at all", () => {
    expect(rendered({ title: "Home" })).toContain("<h1>Home</h1>");
    expect(rendered({ title: "" })).not.toContain('class="head"');
    expect(rendered({})).not.toContain('class="head"');
  });
  it("the pause chip appears with vacation, with or without a title", () => {
    const withBoth = rendered({ title: "Home" }, { vacation: true });
    expect(withBoth).toContain("<h1>Home</h1>");
    expect(withBoth).toContain(`pause-circle-outline"></ha-icon> ${t("en", "vacation")}`);
    const only = rendered({}, { vacation: true });
    expect(only).toContain('class="head"');
    expect(only).toContain("<h1></h1>");
    expect(rendered({ title: "Home" })).not.toContain("chip");
  });
  it("nothing without a config or without hass", () => {
    const c = card([], {});
    c._config = undefined;
    expect(flat(c.render())).toBe("");
    const d = card([], {});
    d.hass = undefined;
    expect(flat(d.render())).toBe("");
  });
});

describe("render frame without data", () => {
  it("a title shows even before the data arrives", () => {
    const c = card([], { title: "T" });
    c._data = undefined;
    c._list = vi.fn(() => "LIST");
    expect(flat(c.render())).toContain("<h1>T</h1>");
  });
});

describe("card frame", () => {
  const frame = (config: any, data: any = {}, set: (c: any) => void = () => {}) => {
    const c = card([], { schedule_view: "list", ...config }, data);
    c._list = vi.fn(() => "LIST"); c._modeLine = () => ""; c._holidayLine = () => "";
    set(c);
    return c;
  };
  it("notices: success with its holding handlers, error, read only; none by default", () => {
    const base = flat(frame({}).render());
    expect(base).not.toContain("callout");
    expect(base).not.toContain('class="snack"');
    const c = frame({}, { read_only: true }, (x) => { x._info = "Saved"; x._error = "Broken"; });
    const html = flat(c.render());
    expect(html).not.toContain("<b>"); // no bold title in a notice
    expect(html).toContain('class="callout tone-success" role="status"');
    expect(html).toContain("<p>Saved</p>");
    expect(html).toContain('class="callout tone-error" role="alert"');
    expect(html).toContain("<p>Broken</p>");
    expect(html).toContain(`<p>${t("en", "read_only")}</p>`);
    expect(html.match(/tone-error/g)).toHaveLength(2);
    c._holdInfo = vi.fn();
    const hs = handlers(c.render());
    for (const [ev, v] of [["pointerenter", true], ["pointerleave", false], ["focusin", true], ["focusout", false]] as const) {
      c._holdInfo.mockClear();
      hs.find((h) => h.event === ev)!.fn();
      expect(c._holdInfo).toHaveBeenCalledWith(v);
    }
    expect(html).toContain('class="info"');
  });
  it("empty states: loading, no program, no program matching the filter; the list only with data", () => {
    const loading = frame({});
    loading._data = undefined;
    const l = flat(loading.render());
    expect(l).toContain('class="empty">…</div>');
    expect(l).not.toContain("LIST");
    expect(l).not.toContain(t("en", "no_program"));
    const none = flat(frame({}).render());
    expect(none).toContain(`<div class="empty" role="status">${t("en", "no_program")}</div>`);
    expect(none).toContain("LIST");
    expect(none).not.toContain('class="empty">…');
    const some = frame({ filter: { programs: ["nope"] } }, {}, (c) => { c._data.programs = [program("p1", "A", ["cover.a"])]; });
    const s = flat(some.render());
    expect(s).toContain(`<div class="empty" role="status">${t("en", "no_matching_program")}</div>`);
    expect(s).not.toContain(t("en", "no_program"));
    const named = frame({ program: "zzz" }, {}, (c) => { c._data.programs = [program("p1", "A", ["cover.a"])]; });
    const n = flat(named.render()); // a program that does not exist is not a filter that matches nothing
    expect(n).toContain(`<div class="empty" role="status">${t("en", "no_program")}</div>`);
    expect(n).not.toContain(t("en", "no_matching_program"));
    const matching = frame({ title: "" }, {}, (c) => { c._data.programs = [program("p1", "A", ["cover.a"])]; c._config.filter = { types: ["light"] }; });
    const m = flat(matching.render());
    expect(m).toContain(t("en", "no_matching_program"));
    expect(m).not.toContain(t("en", "no_program"));
    const filled = frame({}, {}, (c) => { c._data.programs = [program("p1", "A", ["cover.a"])]; });
    expect(flat(filled.render())).not.toContain('class="empty"');
  });
  it("an empty card links to the programs panel only for an administrator who can edit, outside read only mode", () => {
    const link = `<a class="manage-programs" href="/weekly-planner">`;
    const shown = (admin: boolean | undefined, data: any = {}, programs: any[] = []) => flat(frame({}, data, (c) => {
      c.hass = { ...c.hass, user: admin === undefined ? undefined : { is_admin: admin } };
      c._data.programs = programs;
    }).render());
    const html = shown(true);
    expect(html).toContain(link);
    expect(html).toContain(t("en", "ce_manage_programs"));
    expect(shown(false)).not.toContain("manage-programs");
    expect(shown(undefined)).not.toContain("manage-programs");
    expect(shown(true, { can_edit: false })).not.toContain("manage-programs");
    expect(shown(true, { read_only: true })).not.toContain("manage-programs");
    expect(shown(true, {}, [program("p1", "A", ["cover.a"])])).not.toContain("manage-programs");
    const loading = frame({}, {}, (c) => { c.hass = { ...c.hass, user: { is_admin: true } }; c._data = undefined; });
    expect(flat(loading.render())).not.toContain("manage-programs");
  });
  it("the undo snackbar", () => {
    const c = frame({}, {}, (x) => { x._snack = true; x._undo = vi.fn(); });
    const html = flat(c.render());
    expect(html).toContain(`<span>${t("en", "edited")} ·</span>`);
    expect(html).toContain(`>${t("en", "undo")}</button>`);
    handlers(c.render()).filter((h) => h.event === "click")[0].fn();
    expect(c._undo).toHaveBeenCalled();
  });
  it("the schedule dialog: scope, day, create flag, chart flag and close", () => {
    const c = frame({}, {}, (x) => { x._dialog = { kind: "schedule", scope: { kind: "program", programId: "p1", entityId: "cover.a" }, day: { weekday: 2, offset: 0 }, create: true }; });
    const tpl = c._renderDialog();
    const found = attrs(tpl);
    expect(found[".scope"]).toEqual({ kind: "program", programId: "p1", entityId: "cover.a" });
    expect(found[".day"]).toEqual({ weekday: 2, offset: 0 });
    expect(found["?create"]).toBe(true);
    expect(found[".chart"]).toBe(true);
    found["@closed"]();
    expect(c._dialog).toBeNull();
    c._config.show_chart = false;
    c._dialog = { kind: "schedule", scope: { kind: "program", programId: "p1" } };
    const second = attrs(c._renderDialog());
    expect(second[".chart"]).toBe(false);
    expect(second[".day"]).toBeNull();
    expect(second["?create"]).toBe(false);
    expect(flat(frame({}).render())).not.toContain("wp-schedule");
    const none = frame({}); none._dialog = { kind: "schedule", scope: { kind: "program", programId: "p1" } }; none._data = undefined;
    expect(flat(none._renderDialog())).toBe("");
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

describe("pointer rest on a notice", () => {
  it("a hold on nothing shown starts no timer", () => {
    const c = card([]);
    c._holdInfo(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("names read aloud on the card", () => {
  const program = (n: number) => ({ id: "p", name: "Salon", revision: 1, priority: 10, enabled: true, reapply: true, conditions: [],
    entities: Array.from({ length: n }, (_, i) => ({ entity_id: `switch.d${i}`, default_label: null, label_overrides: {} })),
    profiles: [{ id: "a", name: "A", days: [[], [], [], [], [], [], []] }] });
  function namedCard(p: any) {
    const c = new WeeklyPlannerCard() as any;
    c.hass = { language: "en", config: { time_zone: "UTC" }, states: { "switch.d0": { entity_id: "switch.d0", state: "on", attributes: { friendly_name: "Lamp" } }, "switch.d1": { entity_id: "switch.d1", state: "on", attributes: { friendly_name: "Fan" } } }, services: {}, callWS: vi.fn() };
    c._config = {}; c._data = { programs: [p], labels: [], status: {}, can_edit: true, read_only: false };
    return c;
  }
  it("puts the program (and device) name in Week and Chart buttons", () => {
    const p = program(2);
    const html = flat(namedCard(p)._extras({ kind: "program", programId: "p" }, "switch.d1", [p]));
    expect(html).toContain("Week, Salon, Fan");
    expect(html).toContain("Chart of the day, Salon, Fan");
  });
  it("names the schedules button and the program switch without the state", () => {
    const p = program(1);
    const c = namedCard(p);
    const html = flat(c._line("switch.d0", [p], { name: "Salon", button: { kind: "program", programId: "p" }, open: { kind: "program", programId: "p" } }));
    expect(html).toContain("Edit schedules, Salon");
    expect(html).toContain("aria-label=Salon");
    expect(html).not.toContain("Salon: ");
    expect(c._deviceLabel(p, "switch.d0")).toBe("Salon");
    expect(c._deviceLabel(program(2), "switch.d1")).toBe("Salon, Fan");
  });
});

// Layout at 360 px (a11y review): the status line reflows, the time stays readable in one piece.
describe("status line at 360 px", () => {
  it("lets the status line wrap but keeps the time in one piece", () => {
    const css = (WeeklyPlannerCard.styles as any[]).map((s) => s.cssText).join("");
    expect(css).toMatch(/\.now \{[^}]*flex-wrap: wrap/);
    expect(css).toMatch(/\.next \{[^}]*flex-wrap: wrap/);
    expect(css).toMatch(/\.next \.lbl \{[^}]*overflow-wrap: anywhere/);
    expect(css).toMatch(/\.nw \{ white-space: nowrap/);
  });
});
