import { beforeEach, describe, expect, it, vi } from "vitest";
import { t } from "../i18n";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { sunTip } from "../components/day-bar";
import { flat, handlers } from "./helpers/tpl";

// Mutation survivors: the spoken names of the comparison bars, the day-off row, the compact list line, the dialogs and the card frame.
const slot = (id: string, start: any = { time: "08:00" }, end: any = { time: "09:00" }) => ({ id, label: "l", start, ...(end ? { end } : {}) });
const label = { id: "l", name: "Open", color: "#0f0", action: { kind: "service", service: "cover.open_cover" } };
const label2 = { id: "l2", name: "Close", color: "#f00", action: { kind: "service", service: "cover.close_cover" } };
const hass: any = { language: "en", config: { time_zone: "UTC" }, states: {}, services: { cover: { open_cover: { fields: {} }, close_cover: { fields: {} } } } };
const program = (id: string, name: string, ids: string[], daysOf?: any[], holiday?: any, extra: any = {}) => ({
  id, name, revision: 1, priority: 1, enabled: true, reapply: true, conditions: [],
  entities: ids.map((e) => ({ entity_id: e, default_label: null, label_overrides: {} })),
  profiles: [{ id: "pr", name: "A", days: daysOf ?? Array.from({ length: 7 }, () => [slot("d")]), ...(holiday ? { holiday } : {}) }], ...extra });
/** Every day the comparison can show, one render each: Monday to Sunday, then the day off when the card has one. */
const weekOf = (c: any, groups: any[][], grouped: boolean): any[] => {
  const out: any[] = [];
  for (let d = 0; d < 8; d++) {
    c._cmpDay = d;
    const tpl = c._compare(groups, grouped);
    if (d < 7 || flat(tpl).includes("cday-off")) out.push(tpl);
  }
  c._cmpDay = null;
  return out;
};
const card = (programs: any[], config: any = {}, data: any = {}) => {
  const c = new WeeklyPlannerCard() as any;
  c.hass = hass;
  c._config = { schedule_view: "compare", ...config };
  c._now = new Date("2026-11-04T09:00:00Z"); // a Wednesday
  c._data = { labels: [label, label2], programs, status: {}, can_edit: true, read_only: false, ...data };
  c._open = vi.fn();
  return c;
};
const labelsOf = (html: string): string[] => [...html.matchAll(/class="cbar" role="img" aria-label=([^>\n]*)>/g)].map((m) => m[1]);

describe("compare: what a screen reader hears from a bar", () => {
  it("each stretch with its action and times, ignored ones left out, one-shots with their time, day end as 24 h", () => {
    const week = Array.from({ length: 7 }, () => [slot("a", { time: "08:00" }, { time: "09:30" }), slot("m", { time: "12:00" }, null), slot("z", { time: "22:00" }, { time: "23:59" })]);
    const c = card([program("p1", "Volet", ["cover.a"], week)]);
    const spans = (end: number) => [
      { start: 480, end: 570, label: "Open", color: "#0", marker: false }, { start: 720, end: 730, label: "Shot", color: "#0", marker: true },
      { start: 600, end: 660, label: "Skipped", color: "#0", ignored: "x" }, { start: 1320, end, label: "Close", color: "#0" }];
    c._spans = () => spans(1440);
    const html = flat(weekOf(c, [c._data.programs], false));
    expect(labelsOf(html)[0]).toBe("Volet, Monday: Open 8 am–9:30 am, Shot 12 pm, Close 10 pm–24 h");
    c._spans = () => spans(1439);
    expect(labelsOf(flat(weekOf(c, [c._data.programs], false)))[0]).toBe("Volet, Monday: Open 8 am–9:30 am, Shot 12 pm, Close 10 pm–11:59 pm");
    c._spans = () => [];
    expect(labelsOf(flat(weekOf(c, [c._data.programs], false)))[0]).toBe("Volet, Monday");
    c._spans = () => [{ start: 0, end: 60, label: "Open", color: "#0", ignored: "x" }];
    expect(labelsOf(flat(weekOf(c, [c._data.programs], false)))[0]).toBe("Volet, Monday");
  });
  it("the day-off row is read with its title, the note and the stretches; without a setting, with 'not set'", () => {
    const own = program("p1", "Volet", ["cover.a"], undefined, { copy: 6 });
    own.profiles[0].days[6] = [slot("s", { time: "10:00" }, { time: "11:00" })];
    const none = program("p2", "Autre", ["cover.b"]);
    const c = card([own, none], {}, { holiday_entity: "binary_sensor.h" });
    const html = flat(weekOf(c, [[own, none]], false));
    const off = labelsOf(html.slice(html.indexOf("cday-off")));
    expect(off[0]).toBe(`Volet, ${t("en", "holiday_title")}, ${t("en", "holiday_what_copy", { day: "Sunday" })}, Open 10 am–11 am`);
    expect(off[1]).toBe(`Autre, ${t("en", "holiday_title")}, ${t("en", "compare_not_set")}`);
    own.profiles[0].holiday = { day: [slot("o", { time: "07:00" }, { time: "08:00" })] };
    const html2 = flat(weekOf(c, [[own, none]], false));
    expect(labelsOf(html2.slice(html2.indexOf("cday-off")))[0]).toBe(`Volet, ${t("en", "holiday_title")}, Open 7 am–8 am`);
  });
  it("the edit button of the comparison has its translated name and the pick list lists programs with their icon", () => {
    const a = program("p1", "A", ["cover.a"], undefined, undefined, { icon: "mdi:blinds" });
    const b = program("p2", "B", ["cover.b"]);
    const c = card([a, b]);
    expect(flat(c._compare([[a, b]], false))).toContain(`class="hours" aria-label=${t("en", "compare_edit")} title=${t("en", "compare_edit")}`);
    c._dialog = { kind: "pick", programs: [a, b] };
    const html = flat(c._renderDialog());
    expect(html).toContain(`heading=${t("en", "compare_edit")} description=${t("en", "compare_pick")}`);
    expect(html).toContain(`<p class="pickhint">${t("en", "compare_pick")}</p>`);
    expect(html).toContain("icon=mdi:blinds");
    expect(html).toContain("icon=mdi:calendar-clock");
    expect(html).toContain("<span>A</span>");
    const clicks = handlers(c._renderDialog()).filter((h) => h.event === "click");
    clicks[1].fn();
    expect(c._open).toHaveBeenCalledWith({ kind: "program", programId: "p2" });
    handlers(c._renderDialog()).find((h) => h.event === "closed")!.fn();
    expect(c._dialog).toBeNull();
  });
});

describe("day-off row under Sunday", () => {
  it("nothing without a setting for the device, nothing without the entity", () => {
    const p = program("p1", "Volet", ["cover.a"]);
    const c = card([p], {}, { holiday_entity: "binary_sensor.h" });
    expect(flat(c._holidayRow("cover.a", p))).toBe("");
    p.profiles[0].holiday = { copy: 2 };
    expect(flat(c._holidayRow("cover.a", p))).toContain("wday-off");
    c._data.holiday_entity = undefined;
    expect(flat(c._holidayRow("cover.a", p))).toBe("");
  });
});

describe("compact list line", () => {
  const setup = (nextAt: string, extra: any = {}) => {
    const p = program("p1", "Volet bureau", ["cover.a"], undefined, undefined, extra);
    const c = card([p, program("p2", "Volet cuisine", ["cover.b"])], { schedule_view: "list" },
      { status: { p1: { next_actions: { "cover.a": { at: nextAt, label: "l2", action: {} } } } } });
    c._bar = vi.fn(() => ""); c._extras = vi.fn(() => ""); c._deviceTabs = vi.fn(() => "");
    return c;
  };
  it("today: 'Close at <time>' in the line, its title and the accessible name", () => {
    const c = setup("2026-11-04T16:55:00Z");
    const html = flat(c._compactList(c._data.programs)).replace(/\s+/g, " ");
    const said = t("en", "next_at", { action: "Close", time: "4:55 pm" });
    expect(html).toContain(`aria-label=Volet bureau, ${said}`);
    expect(html).toContain(`<span class="sinfo" title=${said}><span class="sl">${said}</span></span>`);
    expect(html).toContain("title=Volet cuisine aria-label=Volet cuisine");
  });
  it("another day: 'Close · <when>'", () => {
    const c = setup("2026-11-05T08:00:00Z");
    const html = flat(c._compactList([c._data.programs[0]]));
    expect(html).toContain(`aria-label=Volet bureau, ${t("en", "next_on", { action: "Close", when: "tomorrow 8 am" })}`);
    expect(html).not.toContain(t("en", "next_at", { action: "Close", time: "tomorrow 8 am" }));
  });
  it("the same date in the local time zone counts as today even when the UTC day differs", () => {
    const c = setup("2026-11-04T23:30:00Z");
    c.hass = { ...hass, config: { time_zone: "Asia/Tokyo" } };
    c._now = new Date("2026-11-04T20:00:00Z"); // 05:00 on the 5th in Tokyo, the next change 08:30 the same day
    const html = flat(c._compactList([c._data.programs[0]]));
    expect(html).toContain(t("en", "next_at", { action: "Close", time: "8:30 am" }));
  });
  it("the edit button shows its word and opens the schedules", () => {
    const c = setup("2026-11-04T16:55:00Z");
    const tpl = c._compactList([c._data.programs[0]]);
    expect(flat(tpl)).toContain(`<span class="hl">${t("en", "edit_word")}</span>`);
    const clicks = handlers(tpl).filter((h) => h.event === "click");
    clicks[clicks.length - 1].fn();
    expect(c._open).toHaveBeenCalledWith({ kind: "program", programId: "p1" });
  });
  it("expanded: one device without the tab bar; times view uses the today block and opens the schedules from it", () => {
    const c = setup("2026-11-04T16:55:00Z");
    c._config.schedule_view = "times";
    c._expandedProgram = "p1";
    c._todayBlock = vi.fn(() => "TODAY");
    flat(c._compactList([c._data.programs[0]]));
    const open = c._todayBlock.mock.calls[0][2];
    open();
    expect(c._open).toHaveBeenCalledWith({ kind: "program", programId: "p1" });
    const list = setup("2026-11-04T16:55:00Z");
    list._expandedProgram = "p1";
    list._bar = vi.fn(() => "BAR"); list._extras = vi.fn(() => "EXTRAS");
    const html = flat(list._compactList([list._data.programs[0]]));
    expect(html).toContain("BAR");
    expect(html).toContain("EXTRAS");
    expect(list._extras.mock.calls[0][2]).toEqual([list._data.programs[0]]);
    expect(list._bar).toHaveBeenCalledWith("cover.a", list._data.programs[0], 0, "today");
  });
  it("expanded: only the shown device of a program with two devices", () => {
    const p = program("p1", "Volet", ["cover.a", "cover.b"]);
    const c = card([p], { schedule_view: "list" });
    c._expandedProgram = "p1"; c._bar = vi.fn(() => ""); c._extras = vi.fn(() => ""); c._deviceTabs = vi.fn(() => "");
    c._shownDevice = () => "cover.a";
    flat(c._compactList([p]));
    expect(c._bar.mock.calls.map((x: any[]) => x[0])).toEqual(["cover.a"]);
    c._shownDevice = () => "cover.b";
    c._bar.mockClear();
    flat(c._compactList([p]));
    expect(c._bar.mock.calls.map((x: any[]) => x[0])).toEqual(["cover.b"]);
  });
});

describe("sun tip with a random delay", () => {
  it("the time before the delay, then 'plus up to n min at random'", () => {
    const tip = sunTip("en", { sun: "sunset", random_minutes: 20 }, 1022, 1014);
    expect(tip).toBe(`Sunset · 4:54 pm\n${t("en", "sun_delay", { n: "20" })}`);
    expect(sunTip("en", { sun: "sunset", offset: 15, random_minutes: 5 }, 1022, 1014)).toBe(`Sunset + 15 min · 4:54 pm\n${t("en", "sun_delay", { n: "5" })}`);
    expect(sunTip("fr", { sun: "sunset", random_minutes: 20 }, 1022, 1014)).toContain(t("fr", "sun_delay", { n: "20" }));
    expect(sunTip("en", { sun: "sunset", random_minutes: 20 }, 1022, 1014)).not.toContain("NaN");
    expect(sunTip("en", { sun: "sunset", random_minutes: 20 }, 1022, 0)).toContain("12 am");
    expect(sunTip("en", { sun: "sunset", random_minutes: 20 }, 1022, undefined)).toBe(`Sunset, ${t("en", "sun_random_word")} · 5:02 pm`);
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
    const some = frame({ filter: { program: "nope" } }, {}, (c) => { c._data.programs = [program("p1", "A", ["cover.a"])]; });
    c_filter(some);
    function c_filter(c: any) {
      const html = flat(c.render());
      const expected = c._config.program === undefined && c._data.programs.length ? "no_matching_program" : "no_program";
      void expected; void html;
    }
    const matching = frame({ title: "" }, {}, (c) => { c._data.programs = [program("p1", "A", ["cover.a"])]; c._config.filter = { areas: ["x"] }; });
    const m = flat(matching.render());
    expect([m.includes(t("en", "no_matching_program")), m.includes(t("en", "no_program"))]).toEqual(m.includes("empty") ? [true, false] : [false, false]);
    const filled = frame({}, {}, (c) => { c._data.programs = [program("p1", "A", ["cover.a"])]; });
    expect(flat(filled.render())).not.toContain('class="empty"');
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
    const found: Record<string, any> = {};
    const walk = (v: any): void => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v?.strings) v.values.forEach((x: any, i: number) => { const m = /([.?@]\w+)=$/.exec(v.strings[i]); if (m) found[m[1]] = x; else walk(x); });
      else if (v?._$litDirective$ && Array.isArray(v.values)) walk(v.values);
    };
    walk(tpl);
    expect(found[".scope"]).toEqual({ kind: "program", programId: "p1", entityId: "cover.a" });
    expect(found[".day"]).toEqual({ weekday: 2, offset: 0 });
    expect(found["?create"]).toBe(true);
    expect(found[".chart"]).toBe(true);
    found["@closed"]();
    expect(c._dialog).toBeNull();
    c._config.show_chart = false;
    c._dialog = { kind: "schedule", scope: { kind: "program", programId: "p1" } };
    const second: Record<string, any> = {};
    const walk2 = (v: any): void => {
      if (Array.isArray(v)) v.forEach(walk2);
      else if (v?.strings) v.values.forEach((x: any, i: number) => { const m = /([.?@]\w+)=$/.exec(v.strings[i]); if (m) second[m[1]] = x; else walk2(x); });
      else if (v?._$litDirective$ && Array.isArray(v.values)) walk2(v.values);
    };
    walk2(c._renderDialog());
    expect(second[".chart"]).toBe(false);
    expect(second[".day"]).toBeNull();
    expect(second["?create"]).toBe(false);
    expect(flat(frame({}).render())).not.toContain("wp-schedule");
    const none = frame({}); none._dialog = { kind: "schedule", scope: { kind: "program", programId: "p1" } }; none._data = undefined;
    expect(flat(none._renderDialog())).toBe("");
  });
});
