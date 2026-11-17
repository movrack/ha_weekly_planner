import { beforeEach, describe, expect, it, vi } from "vitest";
import { LitElement } from "lit";
import { t } from "../i18n";
import { WeeklyPlannerCard, commonWordPrefix } from "../weekly-planner-card";
import { WpDayBar, sunDir, sunTip } from "../components/day-bar";
import { flat, handlers } from "./helpers/tpl";

// Mutation survivors of the compare view, the compact list, the day-off row, the spans and the sun tip.
const slot = (id: string, start: any = { time: "08:00" }, end: any = { time: "09:00" }) => ({ id, label: "l", start, ...(end ? { end } : {}) });
const label = { id: "l", name: "Open", color: "#0f0", action: { kind: "service", service: "cover.open_cover" } };
const hass: any = { language: "en", config: { time_zone: "UTC" }, states: {}, services: { cover: { open_cover: { fields: {} } } } };
const program = (id: string, name: string, ids: string[], daysOf?: any[], holiday?: any, extra: any = {}) => ({
  id, name, revision: 1, priority: 1, enabled: true, reapply: true, conditions: [],
  entities: ids.map((e) => ({ entity_id: e, default_label: null, label_overrides: {} })),
  profiles: [{ id: "pr", name: "A", days: daysOf ?? Array.from({ length: 7 }, () => [slot("d")]), ...(holiday ? { holiday } : {}) }], ...extra });
/** Values bound to an attribute whose name ends the preceding markup (booleans do not show in the flattened text). */
const bound = (tpl: any, attr: RegExp): any[] => {
  const found: any[] = [];
  const walk = (v: any): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v?.strings) v.values.forEach((x: any, i: number) => { if (attr.test(v.strings[i])) found.push(x); else walk(x); });
  };
  walk(tpl);
  return found;
};
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
  c._data = { labels: [label], programs, status: {}, can_edit: true, read_only: false, ...data };
  c._open = vi.fn();
  return c;
};

describe("commonWordPrefix edge cases", () => {
  it("splits on any run of spaces and rebuilds names with single spaces", () => {
    const cut = commonWordPrefix(["Volet bureau", "Volet  cuisine"]);
    expect(cut("Volet bureau")).toBe("bureau");
    expect(cut("Volet  cuisine")).toBe("cuisine");
  });
  it("compares words ignoring case, and one name alone stays whole", () => {
    const cut = commonWordPrefix(["volet bureau", "VOLET cuisine"]);
    expect([cut("volet bureau"), cut("VOLET cuisine")]).toEqual(["bureau", "cuisine"]);
    expect(commonWordPrefix(["Volet bureau"])("Volet bureau")).toBe("Volet bureau");
  });
  it("without a shared word the names are returned untouched, spaces included", () => {
    expect(commonWordPrefix(["Alpha  one", "Beta two"])("Alpha  one")).toBe("Alpha  one");
  });
  it("two names that would become the same stay whole", () => {
    const cut = commonWordPrefix(["A b", "A  b"]);
    expect(cut("A b")).toBe("A b");
    expect(cut("A  b")).toBe("A  b");
  });
  it("the shared words stop at the first different one", () => {
    const cut = commonWordPrefix(["Volet salon est", "Volet salon ouest"]);
    expect(cut("Volet salon est")).toBe("est");
  });
});

describe("compare rows", () => {
  const two = () => [program("p1", "Zeta", ["cover.z"]), program("p2", "Beta", ["cover.a", "cover.b"]), program("p3", "Gamma", ["cover.c"])];
  it("only the first device of the first program of a later group carries the gap, only when grouped", () => {
    const c = card([]);
    const [a, b, g] = two();
    const day = flat(c._compare([[a], [b, g]], true)); // one day only
    expect(day.match(/class=crow gap>/g)).toHaveLength(1);
    expect(day.match(/class=crow>/g)).toHaveLength(3);
    expect(flat(c._compare([[a], [b, g]], false))).not.toContain("gap");
    expect(flat(c._compare([[a, g]], true))).not.toContain("gap");
  });
  it("a switched off program has the class 'crow off' with no stray spaces; a gap one 'crow gap off'", () => {
    const c = card([]);
    const [a, b] = two();
    b.enabled = false;
    const html = flat(c._compare([[a], [b]], true));
    expect(html).toContain("class=crow gap off>");
    expect(html).toContain("class=crow>");
    expect(html).not.toMatch(/class=crow {2}/);
    expect(flat(c._compare([[a, b]], false))).toContain("class=crow off>");
  });
  it("today is Wednesday: one is-today group and one is-today title, the others stay plain", () => {
    const c = card([]);
    const html = flat(weekOf(c, [[two()[0]]], false));
    expect(html.match(/class="cday is-today"/g)).toHaveLength(1);
    expect(html.match(/class="cday "/g)).toHaveLength(6);
    expect(html).toMatch(/class="cday is-today" role="tabpanel" aria-label=Wednesday/);
    expect(flat(c._compare([[two()[0]]], false)).match(/class="cdchip is-today"/g)).toHaveLength(1); // the chip of today is in bold
  });
  it("the hour axis has five labels at 0, 25, 50, 75 and 100 %, 24 h reading as the day end", () => {
    const c = card([]);
    const html = flat(c._compare([[two()[0]]], false));
    const axis = html.slice(html.indexOf('class="caxis"'));
    expect([...axis.matchAll(/class="h(\d+)" style="left:([\d.]+)%">([^<]*)</g)].map((m) => [m[1], m[2], m[3]])).toEqual([
      ["0", "0", "12 am"], ["6", "25", "6 am"], ["12", "50", "12 pm"], ["18", "75", "6 pm"], ["24", "100", "24 h"]]);
  });
  it("the edit button carries the translated name and opens the chooser (several) or the program (one)", () => {
    const c = card([]);
    const [a, b] = two();
    const html = flat(c._compare([[a, b]], false));
    expect(html).toContain(`aria-label=${t("en", "compare_edit")} title=${t("en", "compare_edit")}`);
    const tpl = c._compare([[a, b]], false);
    handlers(tpl).find((h: any) => h.event === "click")!.fn();
    expect(c._dialog).toEqual({ kind: "pick", programs: [a, b] });
    handlers(c._compare([[a]], false)).find((h: any) => h.event === "click")!.fn();
    expect(c._dialog).toEqual({ kind: "schedule", scope: { kind: "program", programId: "p1" } });
  });
  it("the scope of a device is its program, plus the device when the program has several", () => {
    const c = card([]);
    const [a, b] = two();
    expect(c._scopeOf(a, "cover.z")).toEqual({ kind: "program", programId: "p1" });
    expect(c._scopeOf(b, "cover.b")).toEqual({ kind: "program", programId: "p2", entityId: "cover.b" });
  });
  it("greyed names are read with the paused word, running ones without", () => {
    const c = card([]);
    const [a, b] = two();
    b.enabled = false;
    const html = flat(c._compare([[a], [b]], false));
    expect(html).toContain("aria-label=Zeta, Wednesday");
    expect(html).toContain(`aria-label=Beta, cover.a ${t("en", "compare_paused")}, Wednesday`);
  });
  it("a program is not running when off, or when everything is paused", () => {
    const c = card([program("p1", "A", ["cover.a"])]);
    expect(c._notRunning(c._data.programs[0])).toBe(false);
    c._data.vacation = true;
    expect(c._notRunning(c._data.programs[0])).toBe(true);
    c._data.vacation = false;
    c._data.programs[0].enabled = false;
    expect(c._notRunning(c._data.programs[0])).toBe(true);
    c._data = undefined;
    expect(c._notRunning({ enabled: true })).toBe(false);
  });
});

describe("compare day-off group", () => {
  const own = (c: any) => c._data.programs[0].profiles[0];
  const setup = (holiday: any, ids = ["cover.a"]) => {
    const p = program("p1", "Volet", ids, undefined, holiday);
    return card([p], {}, { holiday_entity: "binary_sensor.h" });
  };
  it("a copied day: one row with the bar, 'like <day>' and the full sentence in the accessible name", () => {
    const c = setup({ copy: 6 });
    c._data.programs[0].profiles[0].days[6] = [slot("s", { time: "10:00" }, { time: "11:00" })];
    const html = flat(weekOf(c, [c._data.programs], false));
    const off = html.slice(html.indexOf("cday-off"));
    expect(off).toContain(`aria-label=${t("en", "holiday_title")}`);
    expect(off).toContain('class="crow note"');
    expect(off).toContain(`aria-label=Volet, ${t("en", "holiday_title")}, ${t("en", "holiday_what_copy", { day: "Sunday" })}`);
    expect(off).toContain('class="ccopy"');
    expect(off).not.toContain("cnone");
  });
  it("a program without a day off: not-set text and the accessible sentence", () => {
    const c = setup({ copy: 6 });
    c._data.programs.push(program("p2", "Autre", ["cover.b"], undefined, undefined));
    const html = flat(weekOf(c, [c._data.programs], false));
    const off = html.slice(html.indexOf("cday-off"));
    expect(off).toContain(`aria-label=Autre, ${t("en", "holiday_title")}, ${t("en", "compare_not_set")}`);
    expect(off).toContain('class="cnone"');
    expect(off.match(/class="crow "/g)).toHaveLength(1);
  });
  it("the day-off group needs the day-off entity", () => {
    const c = setup({ copy: 6 });
    c._data.holiday_entity = undefined;
    expect(flat(weekOf(c, [c._data.programs], false))).not.toContain("cday-off");
    expect(c._holidaySpans("cover.a", c._data.programs[0])).toBeNull();
    expect(flat(c._holidayRow("cover.a", c._data.programs[0]))).toBe("");
    c._data = undefined;
    expect(flat(c._holidayRow("cover.a", program("p", "n", ["cover.a"])))).toBe("");
  });
  it("the row under Sunday: own day = the bar alone, copied day = bar and note, none = not set", () => {
    const c = setup({ copy: 2 });
    const p = c._data.programs[0];
    const html = flat(c._holidayRow("cover.a", p));
    expect(html).toContain('class="wday wday-off note"');
    expect(html).toContain(`aria-label=${t("en", "holiday_title")}`);
    expect(html).toContain(`class="wname">${t("en", "holiday_row")}<`);
    expect(html).toContain(`class="ccopy">${t("en", "holiday_what_copy", { day: "Wednesday" })}<`);
    expect(html).not.toContain("cnone");
    expect(c._holidayCopy(p)).toBe(2);
    p.profiles[0].holiday = { slots: [slot("o", { time: "07:00" }, { time: "08:00" })] };
    const ownHtml = flat(c._holidayRow("cover.a", p));
    expect(ownHtml).toContain('class="wday wday-off "');
    expect(ownHtml).not.toContain("ccopy");
    expect(c._holidayCopy(p)).toBeNull();
    p.profiles[0].holiday = undefined;
    const none = flat(c._holidayRow("cover.a", p));
    expect(none).toBe(""); // no day-off setting for this device: no row

  });
  it("spans of a day off: a one-shot lasts 10 minutes, never past 24:00, and a copied day that is missing is empty", () => {
    const c = setup({ copy: 0 });
    const p = c._data.programs[0];
    p.profiles[0].days[0] = [slot("m", { time: "10:00" }, null), slot("e", { time: "23:58" }, null), slot("x", { time: "22:00" }, { time: "02:00" })];
    const spans = c._holidaySpans("cover.a", p);
    expect(spans.map((s: any) => [s.start, s.end, s.marker, s.endSun])).toEqual([[600, 610, true, null], [1438, 1440, true, null], [1320, 1440, false, null]]);
    p.profiles[0].days[0] = undefined;
    expect(c._holidaySpans("cover.a", p)).toEqual([]);
  });
  it("spans of a day off carry the sun side, specs and labels; a slot with an unknown setting is dropped", () => {
    const c = setup({ copy: 0 });
    const p = c._data.programs[0];
    p.profiles[0].days[0] = [slot("s", { sun: "sunrise" }, { sun: "sunset" }), { ...slot("z"), label: "ghost" }];
    const [s, ...rest] = c._holidaySpans("cover.a", p);
    expect(rest).toEqual([]);
    expect([s.startSun, s.endSun, s.startSpec, s.endSpec, s.labelId, s.slotId, s.color, s.marker]).toEqual(
      ["up", "down", { sun: "sunrise" }, { sun: "sunset" }, "l", "s", "#0f0", false]);
  });
  it("no copy for a program whose day off is off", () => {
    const c = setup({ copy: 3 });
    expect(c._holidayCopy(c._data.programs[0])).toBe(3);
    c._data.programs[0].profiles[0].holiday = undefined;
    expect(c._holidayCopy(c._data.programs[0])).toBeNull();
  });
});


describe("spans of a day", () => {
  const D = (iso: string) => iso; // instants are written in UTC, the card runs in UTC
  const resolvedCard = (slots: any[], rows: any[], previous: any[] | undefined = []) => {
    const c = card([program("p1", "A", ["cover.a"], Array.from({ length: 7 }, () => slots))]);
    c._deviceDays = () => ({ today: rows, previous });
    return c;
  };
  const run = (c: any) => c._computeSpans("cover.a", [c._data.programs[0]], 0);
  const row = (slot_id: string, start: string, end: string | null, extra: any = {}) => ({ slot_id, start: D(start), end: end && D(end), ignored: null, ...extra });
  it("the cache never mixes two devices, two days or two program lists", () => {
    const week = Array.from({ length: 7 }, (_, i) => [slot("d" + i, { time: `0${i + 1}:00` }, { time: `0${i + 1}:30` })]);
    const a = program("pa", "A", ["cover.a"], week);
    const b = program("pb", "B", ["cover.a", "cover.b"], Array.from({ length: 7 }, () => [slot("b", { time: "12:00" }, { time: "13:00" })]));
    const c = card([a, b]);
    const starts = (ent: string, ps: any[], o: number) => c._spans(ent, ps, o).map((s: any) => s.start);
    expect(starts("cover.a", [a], 0)).toEqual([180]); // Wednesday: day 2 -> 03:00
    expect(starts("cover.a", [a], 1)).toEqual([240]);
    expect(starts("cover.a", [b], 0)).toEqual([720]);
    expect(starts("cover.b", [b], 0)).toEqual([720]);
    expect(starts("cover.a", [a, b], 0).sort((x: number, y: number) => x - y)).toEqual([180, 720]);
    expect(starts("cover.a", [a], 0)).toEqual([180]);
    expect(c._spans("cover.a", [a], 0)).toBe(c._spans("cover.a", [a], 0)); // memoized
    c._data = { ...c._data };
    expect(starts("cover.a", [a], 1)).toEqual([240]);
  });
  it("spans of several programs: the lowest priority first (the last one is drawn over)", () => {
    const a = program("pa", "A", ["cover.a"], Array.from({ length: 7 }, () => [slot("a", { time: "01:00" }, { time: "02:00" })]));
    const b = program("pb", "B", ["cover.a"], Array.from({ length: 7 }, () => [slot("b", { time: "05:00" }, { time: "06:00" })]));
    const c = card([a, b]);
    expect(c._computeSpans("cover.a", [a, b], 0).map((s: any) => s.slotId)).toEqual(["b", "a"]);
    b.enabled = false;
    expect(c._computeSpans("cover.a", [a, b], 0).map((s: any) => s.slotId)).toEqual(["a"]);
  });
  it("resolved rows: the day limits are exact (start at the end excluded, end at the start excluded, marker at midnight kept)", () => {
    const slots = ["a", "b", "c", "d", "e", "f"].map((id) => slot(id, { time: "08:00" }, { time: "09:00" }));
    const c = resolvedCard(slots, [
      row("a", "2026-11-05T00:00:00Z", "2026-11-05T01:00:00Z"), // starts when the day ends
      row("b", "2026-11-03T23:00:00Z", "2026-11-04T00:00:00Z"), // ends when the day starts
      row("c", "2026-11-04T00:00:00Z", "2026-11-04T01:00:00Z"), // starts at midnight: not a spill
      row("d", "2026-11-03T22:00:00Z", "2026-11-04T01:00:00Z"), // spill
      row("e", "2026-11-04T23:00:00Z", "2026-11-05T00:00:00Z"), // ends when the day ends
      row("f", "2026-11-04T23:00:00Z", "2026-11-05T03:00:00Z"), // goes on after the day
    ]);
    const spans = run(c);
    expect(spans.map((s: any) => [s.slotId, s.start, s.end, s.spill])).toEqual([
      ["c", 0, 60, false], ["d", 0, 60, true], ["e", 1380, 1440, false], ["f", 1380, 1440, false]]);
    const marker = resolvedCard([slot("m", { time: "08:00" }, null), slot("n", { time: "08:00" }, null)], [
      row("m", "2026-11-04T00:00:00Z", null), row("n", "2026-11-03T23:59:00Z", null)]);
    expect(run(marker).map((s: any) => [s.slotId, s.start, s.end, s.marker])).toEqual([["m", 0, 10, true]]);
  });
  it("a one-shot near the end of the day is cut at 24:00; rows of a kind the device cannot take or of unknown slots are skipped", () => {
    const c = resolvedCard([slot("m", { time: "08:00" }, null), { ...slot("g"), label: "ghost" }], [
      row("m", "2026-11-04T23:55:00Z", null), row("g", "2026-11-04T10:00:00Z", "2026-11-04T11:00:00Z"), row("zz", "2026-11-04T10:00:00Z", null)]);
    expect(run(c).map((s: any) => [s.slotId, s.start, s.end])).toEqual([["m", 1435, 1440]]);
  });
  it("the same occurrence listed twice (today and the day before) is drawn once; a different start is another span", () => {
    const c = resolvedCard([slot("a")], [row("a", "2026-11-04T08:00:00Z", "2026-11-04T09:00:00Z"), row("a", "2026-11-04T08:00:00Z", "2026-11-04T09:00:00Z"),
      row("a", "2026-11-04T10:00:00Z", "2026-11-04T11:00:00Z")], [row("a", "2026-11-04T08:00:00Z", "2026-11-04T09:00:00Z")]);
    expect(run(c).map((s: any) => s.start)).toEqual([480, 600]);
    const two = resolvedCard([slot("a"), slot("b")], [row("a", "2026-11-04T08:00:00Z", "2026-11-04T09:00:00Z"), row("b", "2026-11-04T08:00:00Z", "2026-11-04T09:00:00Z")]);
    expect(run(two).map((s: any) => s.slotId)).toEqual(["a", "b"]);
  });
  it("sun sides, ignored, and the base times of the delay come from the row", () => {
    const sunStart = slot("s", { sun: "sunrise", random_minutes: 10 }, { time: "09:00" });
    const sunEnd = slot("e", { time: "08:00" }, { sun: "sunset", random_minutes: 10 });
    const fixed = slot("f");
    const c = resolvedCard([sunStart, sunEnd, fixed, slot("w", { time: "20:00" }, { time: "21:00" })], [
      row("s", "2026-11-04T06:30:00Z", "2026-11-04T09:00:00Z", { start_base: "2026-11-04T06:25:00Z", ignored: "holiday" }),
      row("e", "2026-11-04T08:00:00Z", "2026-11-04T17:05:00Z", { end_base: "2026-11-04T17:00:00Z" }),
      row("f", "2026-11-04T08:00:00Z", "2026-11-04T09:00:00Z"),
      row("w", "2026-11-04T20:00:00Z", "2026-11-05T00:00:00Z", { end_base: "2026-11-04T23:55:00Z" }),
    ]);
    const [s, e, f, w] = run(c);
    expect([s.startSun, s.endSun, s.startBase, s.ignored, s.sun]).toEqual(["up", null, 385, "holiday", true]);
    expect([e.startSun, e.endSun, e.endBase, e.ignored, e.sun]).toEqual([null, "down", 1020, null, true]);
    expect([f.startSun, f.endSun, f.sun, f.startBase, f.endBase, f.ignored]).toEqual([null, null, false, null, null, null]);
    expect(w.endBase).toBeNull(); // the end is the end of the day: no base to name
    expect(s.startMs).toBe(Date.parse("2026-11-04T06:30:00Z"));
    expect(s.endMs).toBe(Date.parse("2026-11-04T09:00:00Z"));
    const spillRow = resolvedCard([sunStart], [row("s", "2026-11-03T23:00:00Z", "2026-11-04T01:00:00Z")]);
    expect(run(spillRow)[0].startSun).toBeNull();
  });
  it("a sun end of a slot with a one-shot start keeps its sun side and spec", () => {
    const c = resolvedCard([slot("e", { time: "08:00" }, { sun: "sunset" })], [row("e", "2026-11-04T08:00:00Z", "2026-11-04T17:00:00Z")]);
    const [s] = run(c);
    expect([s.endSun, s.endSpec, s.startSpec, s.marker, s.slotId, s.labelId, s.color, s.label]).toEqual(["down", { sun: "sunset" }, { time: "08:00" }, false, "e", "l", "#0f0", "Open"]);
  });
  it("without a preview: the part of yesterday that crosses midnight and today's fixed times; random delays and sun times are left out", () => {
    const days = Array.from({ length: 7 }, () => [
      slot("n", { time: "22:00" }, { time: "02:00" }), slot("r", { time: "22:00" }, { time: "03:00" }),
      slot("one", { time: "10:00" }, null), slot("eq", { time: "08:00" }, { time: "08:00" }),
      slot("rnd", { time: "11:00", random_minutes: 5 }, { time: "12:00" }), slot("rnd2", { time: "11:00" }, { time: "12:00", random_minutes: 5 }),
      slot("sunny", { sun: "sunrise" }, { time: "12:00" }), { ...slot("g"), label: "ghost" },
    ]);
    const c = card([program("p1", "A", ["cover.a"], days)]);
    c._deviceDays = () => ({ today: undefined, previous: undefined });
    const spans = run(c);
    const spill = spans.filter((s: any) => s.spill);
    expect(spill.map((s: any) => [s.slotId, s.start, s.end, s.startSun])).toEqual([["n", 0, 120, null], ["r", 0, 180, null], ["eq", 0, 480, null]]);
    expect(spans.filter((s: any) => !s.spill).map((s: any) => [s.slotId, s.start, s.end])).toEqual([
      ["n", 1320, 1440], ["r", 1320, 1440], ["one", 600, 610], ["eq", 480, 1440]]);
    c._deviceDays = () => ({ today: undefined, previous: [] }); // a preview of the day before exists: no fallback spill
    expect(run(c).filter((s: any) => s.spill)).toEqual([]);
    c._deviceDays = () => ({ today: [], previous: [] }); // resolved today: no fixed fallback either
    expect(run(c)).toEqual([]);
  });
});

describe("compact list", () => {
  const l2 = { id: "l2", name: "Close", color: "#f00", action: { kind: "service", service: "cover.close_cover" } };
  const setup = (extra: any = {}, view = "list") => {
    const p = program("p1", "Volet bureau", ["cover.a", "cover.b"], undefined, undefined, extra);
    const q = program("p2", "Volet cuisine", ["cover.c"]);
    const c = card([p, q], { schedule_view: view }, { labels: [label, l2], status: { p1: { next_actions: {
      "cover.a": { at: "2026-11-04T18:00:00Z", label: "l", action: {} }, "cover.b": { at: "2026-11-04T12:00:00Z", label: "l2", action: {} } } } } });
    c._bar = vi.fn(() => "BAR"); c._extras = vi.fn(() => "EXTRAS"); c._deviceTabs = vi.fn(() => "TABS"); c._createButton = vi.fn(() => "CREATE");
    c._todayBlock = vi.fn(() => "TODAY");
    return c;
  };
  it("a row: short name, full name in title, default icon, next change of the soonest device", () => {
    const c = setup();
    const html = flat(c._compactList(c._data.programs));
    expect(html).toContain('class="sname">bureau<');
    expect(html).toContain('class="sname">cuisine<');
    expect(html).toContain("title=Volet bureau");
    expect(html).toContain("icon=mdi:calendar-clock");
    expect(html).toContain('class="sl">Close');
    expect(html).toContain("title=Close at 12 pm");
    expect(bound(c._compactList(c._data.programs), /aria-expanded=$/)).toEqual([false, false]);
    expect(html).toContain("aria-controls=compact-p1");
    // the accessible name keeps the full name and the next change
    expect(html).toContain(`aria-label=Volet bureau, Close at 12 pm`);
    expect(html).toContain("aria-label=Volet cuisine");
    expect(html).toContain("icon=mdi:chevron-down");
    expect(html).not.toContain("compact-details");
  });
  it("without a next change: the hours text when running, nothing when switched off; own icon kept", () => {
    const c = setup({ icon: "mdi:blinds" });
    const html = flat(c._compactList(c._data.programs));
    expect(html).toContain("icon=mdi:blinds");
    expect(html).toContain(`class="sinfo">${t("en", "hours")}<`); // second program has no next
    c._data.programs[1].enabled = false;
    c._data.programs[0].enabled = false;
    const off = flat(c._compactList(c._data.programs));
    expect(off).not.toContain(`class="sinfo">${t("en", "hours")}<`);
    expect(off).not.toContain('class="sl"');
  });
  it("the next change is the earliest even when listed last; a setting that no longer exists is named by its action", () => {
    const c = setup();
    c._data.status.p1.next_actions["cover.b"].label = "gone";
    c._data.status.p1.next_actions["cover.b"].action = { kind: "service", service: "cover.close_cover" };
    expect(flat(c._compactList([c._data.programs[0]]))).not.toContain('class="sl">Open');
    c._data.status.p1.next_actions["cover.b"].at = "2026-11-04T19:00:00Z";
    c._data.status.p1.next_actions["cover.b"].label = "l2";
    expect(flat(c._compactList([c._data.programs[0]]))).toContain('class="sl">Open');
  });
  it("the row opens and closes its details, and leaves any edit", () => {
    const c = setup();
    const click = () => handlers(c._compactList([c._data.programs[0]])).find((h: any) => h.before.slice(-200).includes('aria-controls') )!;
    c._edit = { x: 1 };
    handlers(c._compactList([c._data.programs[0]])).find((h: any) => h.event === "click")!.fn();
    expect(c._expandedProgram).toBe("p1");
    expect(c._edit).toBeNull();
    const html = flat(c._compactList([c._data.programs[0]]));
    expect(bound(c._compactList([c._data.programs[0]]), /aria-expanded=$/)).toEqual([true]);
    expect(html).toContain("icon=mdi:chevron-up");
    expect(html).toContain('id=compact-p1 class="compact-details" role="region" aria-label=Volet bureau');
    handlers(c._compactList([c._data.programs[0]])).find((h: any) => h.event === "click")!.fn();
    expect(c._expandedProgram).toBeNull();
    void click;
  });
  it("the hours button names the program and opens its schedules", () => {
    const c = setup();
    const tpl = c._compactList([c._data.programs[0]]);
    expect(flat(tpl)).toContain(`aria-label=${t("en", "hours_of", { name: "Volet bureau" })} title=${t("en", "hours")}`);
    const clicks = handlers(tpl).filter((h: any) => h.event === "click");
    clicks[clicks.length - 1].fn();
    expect(c._open).toHaveBeenCalledWith({ kind: "program", programId: "p1" });
  });
  it("expanded: a program with several devices shows only the shown one, with the device in its scope", () => {
    const c = setup();
    c._expandedProgram = "p1";
    c._shownDevice = () => "cover.b";
    const html = flat(c._compactList([c._data.programs[0]]));
    expect(html).toContain("TABS");
    expect(html.match(/class="today"/g)).toHaveLength(1);
    expect(c._bar).toHaveBeenCalledTimes(1);
    expect(c._bar.mock.calls[0].slice(0, 1)).toEqual(["cover.b"]);
    expect(c._extras.mock.calls[0][0]).toEqual({ kind: "program", programId: "p1", entityId: "cover.b" });
    expect(html).toContain("EXTRAS");
    expect(html).toContain(`title=${t("en", "today")}>${t("en", "today_short")}<`);
  });
  it("expanded: a one-device program uses its program scope; times view uses the today block; a missing schedule offers to create one", () => {
    const c = setup({}, "times");
    c._expandedProgram = "p2";
    flat(c._compactList([c._data.programs[1]]));
    expect(c._extras.mock.calls[0][0]).toEqual({ kind: "program", programId: "p2" });
    expect(c._todayBlock).toHaveBeenCalledTimes(1);
    expect(c._bar).not.toHaveBeenCalled();
    const create = setup();
    create._expandedProgram = "p2";
    create._needsCreate = () => true;
    const html = flat(create._compactList([create._data.programs[1]]));
    expect(html).toContain("CREATE");
    expect(create._createButton).toHaveBeenCalledWith({ kind: "program", programId: "p2" });
    expect(html).not.toContain("EXTRAS");
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

describe("sun tip and day bar", () => {
  beforeEach(() => vi.stubGlobal("ResizeObserver", undefined));
  it("sun side of each event", () => {
    expect(["sunrise", "dawn", "sunset", "dusk"].map((sun) => sunDir({ sun }))).toEqual(["up", "up", "down", "down"]);
  });
  it("tip: offset sign, random with and without a base, bounds", () => {
    expect(sunTip("en", { sun: "sunset" }, 1020)).toBe("Sunset · 5 pm");
    expect(sunTip("en", { sun: "sunset", offset: 0 }, 1020)).toBe("Sunset · 5 pm");
    expect(sunTip("en", { sun: "sunset", offset: 30 }, 1050)).toBe("Sunset + 30 min · 5:30 pm");
    expect(sunTip("en", { sun: "sunset", offset: -30 }, 990)).toBe("Sunset - 30 min · 4:30 pm");
    expect(sunTip("en", { sun: "sunset", random_minutes: 20 }, 1022, 1014)).toBe("Sunset · 4:54 pm\n+ up to 20 min at random");
    expect(sunTip("en", { sun: "sunset", random_minutes: 20 }, 1014, 1014)).toBe("Sunset · 4:54 pm\n+ up to 20 min at random");
    expect(sunTip("en", { sun: "sunset", random_minutes: 20 }, 1000, 1014)).toBe("Sunset · 4:54 pm\n+ up to 20 min at random"); // never negative
    expect(sunTip("en", { sun: "sunset", random_minutes: 20 }, 1022)).toBe(`Sunset, ${t("en", "sun_random_word")} · 5:02 pm`);
    expect(sunTip("en", { sun: "sunset", random_minutes: 20 }, 1022, null)).toBe(`Sunset, ${t("en", "sun_random_word")} · 5:02 pm`);
    expect(sunTip("en", { sun: "sunset", earliest: "17:15" }, 1035)).toBe(`Sunset, ${t("en", "sun_bound_earliest", { time: "5:15 pm" })} · 5:15 pm`);
    expect(sunTip("en", { sun: "sunset", latest: "17:15" }, 1035)).toBe(`Sunset, ${t("en", "sun_bound_latest", { time: "5:15 pm" })} · 5:15 pm`);
    expect(sunTip("en", { sun: "sunset", earliest: "17:15" }, 1040)).toBe("Sunset · 5:20 pm");
    expect(sunTip("en", { sun: "sunset", earliest: "17:15", latest: "17:30" }, 1050)).toContain(t("en", "sun_bound_latest", { time: "5:30 pm" }));
    expect(sunTip("en", { time: "08:00" } as any, 480)).toBe("");
  });
  const bar = (spans: any[], props: any = {}) => {
    const el = new WpDayBar() as any;
    Object.assign(el, { lang: "en", spans, ...props });
    el._width = 1440;
    return el;
  };
  const base = { start: 480, end: 600, color: "#00f", label: "Open" };
  it("sun icons: start and end sides, positions, tip text with the base and the label of a one-shot", () => {
    const el = bar([{ ...base, startSun: "up", startSpec: { sun: "sunrise", random_minutes: 10 }, startBase: 470, endSun: "down", endSpec: { sun: "sunset" } },
      { start: 720, end: 730, color: "#0f0", label: "Shot", marker: true, startSun: "down", startSpec: { sun: "sunset" } }]);
    const html = flat(el.render()).replace(/\s+/g, " ");
    expect(html).toContain("text=Sunrise · 7:50 am + up to 10 min at random");
    expect(html).toContain("text=Sunset · 10 am");
    expect(html).toContain("text=Shot Sunset · 12 pm");
    expect(html).toContain('style="left:clamp(16px, 33.33333333333333%, calc(100% - 16px))" data-sun=up');
    expect(html).toContain("left:clamp(16px, 41.66666666666667%, calc(100% - 16px))");
    expect(html).toContain('icon=mdi:weather-sunset-up');
    expect(html).toContain('icon=mdi:weather-sunset-down');
    expect(html.match(/class="sunic"/g)).toHaveLength(3);
  });
  it("an end at 24:00 has no sun icon; passive and no-tab follow the bar", () => {
    const html = flat(bar([{ ...base, end: 1440, endSun: "down", endSpec: { sun: "sunset" } }], { tall: true, noTab: true }).render());
    expect(html).not.toContain("data-sun");
    const icon = { ...base, startSun: "up", startSpec: { sun: "sunrise" } };
    const tall = bar([icon], { tall: true, noTab: true }).render();
    expect([bound(tall, /\?passive=$/), bound(tall, /\?no-tab=$/)]).toEqual([[true], [true]]);
    const plain = bar([icon]).render();
    expect([bound(plain, /\?passive=$/), bound(plain, /\?no-tab=$/)]).toEqual([[false], [false]]);
  });
  it("a one-shot has a wide tip unless it follows the sun or the bar is thin", () => {
    const shot = { start: 720, end: 730, color: "#0f0", label: "Shot", marker: true };
    const tpl = bar([shot, { ...base }, { ...shot, startSun: "up", startSpec: { sun: "sunrise" } }], { tall: true, noTab: true }).render();
    const html = flat(tpl).replace(/\s+/g, " ");
    expect(bound(tpl, /\?passive=$/).slice(0, 1)).toEqual([true]);
    expect(html.match(/class="mktip"/g)).toHaveLength(1);
    expect(html).toContain("text=Shot · 12 pm");
    expect(html).toContain('style="left:clamp(12px, 50%, calc(100% - 12px))"');
    expect(flat(bar([shot], { thin: true }).render())).not.toContain("mktip");
    expect(flat(bar([{ ...shot, startSun: undefined, marker: false }]).render())).not.toContain("mktip");
  });
  it("label box: kept clear of the now line, centred side chosen, widths in % of the span", () => {
    const el = bar([], { now: 540 });
    const s = { ...base, label: "Op" } as any;
    expect(el._labelBox(s)).toEqual({ left: 0, width: (40 / 120) * 100, text: "Op" }); // equal sides: the start side, 20 minutes clear of the line
    expect(bar([], { now: 500 })._labelBox(s)).toEqual({ left: (40 / 120) * 100, width: (80 / 120) * 100, text: "Op" });
    expect(bar([], { now: 580 })._labelBox(s)).toEqual({ left: 0, width: (80 / 120) * 100, text: "Op" });
    expect(bar([], { now: 461 })._labelBox(s)).toEqual({ left: (1 / 120) * 100, width: (119 / 120) * 100, text: "Op" });
    expect(bar([], { now: 619 })._labelBox(s)).toEqual({ left: 0, width: (119 / 120) * 100, text: "Op" });
    expect(bar([], { now: 460 })._labelBox(s)).toEqual({ left: 0, width: 100, text: "Op" }); // 20 minutes away: not crossed
    expect(bar([], { now: 620 })._labelBox(s)).toEqual({ left: 0, width: 100, text: "Op" });
    expect(bar([], { now: 621 })._labelBox(s)).toEqual({ left: 0, width: 100, text: "Op" });
    expect(bar([], { now: 459 })._labelBox(s)).toEqual({ left: 0, width: 100, text: "Op" });
    expect(bar([], { now: null })._labelBox(s)).toEqual({ left: 0, width: 100, text: "Op" });
  });
  it("label box: needs room (7 px a character + 14, 40 at least), none when thin or unmeasured", () => {
    const s = { start: 0, end: 144, label: "abc" } as any; // a tenth of the day
    const at = (w: number, label = "abc") => bar([], { }) && Object.assign(bar([]), { _width: w })._labelBox({ ...s, label });
    expect(at(400)).not.toBeNull(); // 40 px, need max(40, 35) = 40
    expect(at(399)).toBeNull();
    expect(at(1000, "x".repeat(20))).toBeNull(); // need 154 > 100
    expect(at(1540, "x".repeat(20))).not.toBeNull();
    expect(Object.assign(bar([]), { _width: 0 })._labelBox(s)).toBeNull();
    expect(Object.assign(bar([], { thin: true }), { _width: 1000 })._labelBox(s)).toBeNull();
    expect(Object.assign(bar([]), { _width: 1000 })._labelBox({ start: 5, end: 5, label: "a" })).toBeNull(); // an empty span never divides by zero
    expect(Object.assign(bar([]), { _width: 1000 })._labelBox({ start: 0, end: 1440, label: "a" })).toEqual({ left: 0, width: 100, text: "a" });
  });
  it("render: classes, tick positions, span geometry, minimal width, ignored, now line with or without clock", () => {
    const el = bar([{ ...base, ignored: "x" }, { start: 700, end: 701, color: "#0f0", label: "Tiny" }], { notches: true, now: 360, thin: true, tall: true, deviceName: "Dev" });
    const html = flat(el.render());
    expect(html).toContain('class="bar thin tall"');
    expect(html).toContain('class="bar thin tall" role="img"');
    expect(html).toContain("aria-label=Open, Tiny");
    expect(html.match(/class="tick" style="left:(\d+(\.\d+)?)%"/g)?.map((x) => x.match(/left:([\d.]+)%/)![1])).toEqual(["25", "50", "75"]);
    expect(html).toContain("left:33.33333333333333%;width:8.333333333333332%");
    expect(html).toContain("width:0.3472222222222222%".replace("0.3472222222222222", String(500 / 1440 * 0 + 5 / 1440 * 100)));
    expect(html).toContain("class=\"span ignored\"");
    expect(html).toContain("class=\"span \"");
    expect(html).toContain('class="nowline" style="left:25%"');
    expect(html).toContain(`label=${t("en", "now")} · 6 am, Dev`);
    expect(flat(bar([], { now: 360, noClock: true }).render())).not.toContain("nowic");
    expect(flat(bar([]).render())).not.toContain("nowline");
    expect(flat(bar([], { now: 360 }).render())).toContain(`label=${t("en", "now")} · 6 am>`.replace(">", ""));
    expect(flat(bar([]).render())).not.toContain('class="tick"');
    expect(flat(bar([]).render())).toContain('class="bar  "');
  });
  it("hours row only when asked: five times, 24 h at the right end", () => {
    const html = flat(bar([], { showHours: true }).render());
    expect([...html.matchAll(/<span style="left:([\d.]+)%">([^<]*)</g)].map((m) => [m[1], m[2]])).toEqual([["0", "12 am"], ["25", "6 am"], ["50", "12 pm"], ["75", "6 pm"], ["100", "24 h"]]);
    expect(flat(bar([]).render())).not.toContain('class="hours"');
  });
  it("visible text lists the names that fit, announced once per change", () => {
    const el = bar([{ ...base, label: "Open" }, { start: 700, end: 705, color: "#000", label: "Tiny" }]);
    expect(el.visibleText()).toBe("Open");
    const seen: string[] = [];
    el.dispatchEvent = (e: any) => { seen.push(e.detail); return true; };
    el.updated();
    el.updated();
    expect(seen).toEqual(["Open"]);
    el.spans = [{ ...base, label: "Close" }];
    el.updated();
    expect(seen).toEqual(["Open", "Close"]);
  });
  it("properties default to off", () => {
    const el = new WpDayBar() as any;
    expect([el.showHours, el.noTab, el.notches]).toEqual([false, false, false]);
  });
  it("a resize observer sets the width once per change and is released when the bar leaves", () => {
    const seen: any[] = [];
    let cb: any;
    const disconnect = vi.fn(), observe = vi.fn();
    vi.stubGlobal("ResizeObserver", class { constructor(f: any) { cb = f; } observe = observe; disconnect = disconnect; });
    const up = vi.spyOn(LitElement.prototype, "connectedCallback").mockImplementation(() => {});
    const down = vi.spyOn(LitElement.prototype, "disconnectedCallback").mockImplementation(() => {});
    const el = new WpDayBar() as any;
    el.connectedCallback();
    expect(up).toHaveBeenCalled();
    expect(observe).toHaveBeenCalledWith(el);
    cb([{ contentRect: { width: 100.4 } }]);
    expect(el._width).toBe(100);
    cb([]);
    expect(el._width).toBe(0);
    void seen;
    el.disconnectedCallback();
    expect(disconnect).toHaveBeenCalled();
    expect(down).toHaveBeenCalled();
    vi.stubGlobal("ResizeObserver", undefined);
    expect(() => new WpDayBar().connectedCallback()).not.toThrow();
    expect(() => new WpDayBar().disconnectedCallback()).not.toThrow();
    up.mockRestore();
    down.mockRestore();
  });
});

describe("radial day: sun icons, now icon, open", () => {
  const mk = async () => (await import("../components/radial-day")).WpRadialDay;
  const span = (over: any = {}) => ({ start: 360, end: 720, color: "#00f", label: "Open", ...over });
  const tips = (tpl: any): string[] => [...flat(tpl).replace(/\s+/g, " ").matchAll(/<wp-tip text=([^>]*?) label=/g)].map((m) => m[1]);
  it("start and end sun icons carry the side, the position and the tip with the time before the delay", async () => {
    const WpRadialDay = await mk();
    const el = new WpRadialDay() as any;
    el.lang = "en";
    el.spans = [span({ startSun: "up", startSpec: { sun: "sunrise", random_minutes: 10 }, startBase: 350, endSun: "down", endSpec: { sun: "sunset" } })];
    const html = flat(el.render()).replace(/\s+/g, " ");
    expect(html).toContain("text=Sunrise · 5:50 am + up to 10 min at random");
    expect(html).toContain("text=Sunset · 12 pm");
    expect(html).toContain("icon=mdi:weather-sunset-up");
    expect(html).toContain("icon=mdi:weather-sunset-down");
    expect(html.match(/class="icon"/g)).toHaveLength(2);
    expect(html).toContain("left:85%;top:50%");
    expect(html).toContain("left:50%;top:85%");
    el.spans = [span({ startSun: "down", startSpec: { sun: "sunset" }, endSun: "up", endSpec: { sun: "sunrise" } })];
    const swapped = flat(el.render());
    expect(swapped.indexOf("mdi:weather-sunset-down")).toBeLessThan(swapped.indexOf("mdi:weather-sunset-up"));
  });
  it("no end icon at 24:00 or for a one-shot; no start icon without a sun start", async () => {
    const WpRadialDay = await mk();
    const el = new WpRadialDay() as any;
    el.spans = [span({ end: 1440, endSun: "down", endSpec: { sun: "sunset" } })];
    expect(flat(el.render())).not.toContain("weather-sunset");
    el.spans = [span({ end: 360, marker: true, endSun: "down", endSpec: { sun: "sunset" } })];
    expect(flat(el.render())).not.toContain("weather-sunset");
  });
  it("the now icon names the device; passive dials do not open", async () => {
    const WpRadialDay = await mk();
    const el = new WpRadialDay() as any;
    el.lang = "en"; el.now = 360; el.deviceName = "Shutter";
    expect(flat(el.render()).replace(/\s+/g, " ")).toContain(`label=${t("en", "now")} · 6 am, Shutter ?no-tab=`);
    expect(bound(el.render(), /\?no-tab=$/)).toEqual([true]);
    el.deviceName = "";
    expect(flat(el.render()).replace(/\s+/g, " ")).toContain(`label=${t("en", "now")} · 6 am ?no-tab=`);
    const seen: any[] = [];
    el.dispatchEvent = (e: any) => { seen.push(e); return true; };
    el._open();
    expect(seen).toHaveLength(1);
    expect([seen[0].type, seen[0].bubbles, seen[0].composed]).toEqual(["open-day", true, true]);
    el.passive = true;
    el._open();
    expect(seen).toHaveLength(1);
    void tips;
  });
});

describe("comparison bars tell what they show", () => {
  it("each bar's label lists its stretches with their times, after the device and the day", () => {
    const p = program("p1", "Volet bureau", ["cover.a"]);
    const c = card([p]);
    c._spans = vi.fn(() => [{ start: 480, end: 540, label: "Open", color: "#0f0", labelId: "l", slotId: "d", ignored: null }]);
    const labels = bound(weekOf(c, [[p]], false), /aria-label=$/).filter((x) => typeof x === "string" && x.includes("Open"));
    expect(labels.length).toBe(7);
    expect(labels[0]).toMatch(/^Volet bureau, .+: Open 8 am–9 am$/);
  });
});

describe("radial day: hit test", () => {
  const at = async (turn: number, r: number, rect = { left: 0, top: 0, width: 320 }) => {
    const { radialHoverTarget } = await import("../components/radial-day");
    const a = turn * Math.PI * 2 - Math.PI / 2;
    const s = rect.width / 320;
    return { hit: (spans: any[], now: number | null, double = false) => radialHoverTarget(spans, now, double, rect.left + (r * Math.cos(a)) * s + 160 * s, rect.top + (r * Math.sin(a)) * s + 160 * s, rect) };
  };
  const span = (start: number, end: number, over: any = {}) => ({ start, end, color: "#0", label: "x", ...over });
  it("single dial: only the ring is a target, with 4 px around the track", async () => {
    for (const [r, expected] of [[90.1, 0], [89.9, null], [133.9, 0], [134.1, null], [112, 0], [0, null], [160, null]] as const) {
      expect((await at(0.375, r)).hit([span(0, 1440)], null)).toBe(expected);
    }
  });
  it("single dial: a span from its start to just before its end, the last drawn wins, ignored ones are skipped", async () => {
    const spans = [span(360, 720), span(500, 600), span(500, 600, { ignored: "x" })];
    const h = async (min: number) => (await at(min / 1440, 112)).hit(spans, null);
    expect(await h(359)).toBeNull();
    expect(await h(361)).toBe(0);
    expect(await h(550)).toBe(1);
    expect(await h(719)).toBe(0);
    expect(await h(721)).toBeNull();
    expect((await at(0.99, 112)).hit([span(0, 1440, { ignored: "x" })], null)).toBeNull();
  });
  it("the now mark wins within 8 px of the line, also across midnight; scaled and moved rectangles give the same answers", async () => {
    const spans = [span(0, 1440)];
    const rect = { left: 100, top: 40, width: 640 };
    for (const r of [{ left: 0, top: 0, width: 320 }, rect]) {
      const h = async (min: number, now: number) => (await at(min / 1440, 112, r)).hit(spans, now);
      expect(await h(535, 540)).toBe("now"); // 5 minutes: 2.4 px on the 320 dial, 4.9 px at twice the size
      expect(await h(570, 540)).toBe(0); // 30 minutes: 14.7 px
    }
    expect(await (await at(1438 / 1440, 112)).hit(spans, 5)).toBe("now");
    expect(await (await at(25 / 1440, 112)).hit(spans, 5)).toBe(0);
    // 10 minutes = 4.9 px on the dial, 9.8 px at twice the size
    expect(await (await at(550 / 1440, 112, rect)).hit(spans, 540)).toBe(0);
    expect(await (await at(550 / 1440, 112)).hit(spans, 540)).toBe("now");
    expect(await (await at(550 / 1440, 112)).hit(spans, null)).toBe(0);
  });
  it("a one-shot is a target within 8 px, not inside the stretch rule", async () => {
    const shot = [span(540, 540, { marker: true })];
    expect(await (await at(550 / 1440, 112)).hit(shot, null)).toBe(0);
    expect(await (await at(530 / 1440, 112)).hit(shot, null)).toBe(0);
    expect(await (await at(570 / 1440, 112)).hit(shot, null)).toBeNull(); // 14.7 px
    expect(await (await at(540 / 1440, 112)).hit([span(540, 1440, { marker: true })], null)).toBe(0);
    expect(await (await at(900 / 1440, 112)).hit([span(540, 1440, { marker: true })], null)).toBeNull(); // not a stretch
  });
  it("double dial: the inner ring is the morning, the outer the afternoon; the now mark only on its own ring", async () => {
    const spans = [span(100, 200), span(850, 950)];
    const inner = await at(180 / 720, 78);
    const outer = await at(180 / 720, 112);
    expect(inner.hit(spans, null, true)).toBe(0);
    expect(outer.hit(spans, null, true)).toBe(1);
    expect(inner.hit([span(0, 1440)], 180, true)).toBe("now");
    expect(outer.hit([span(0, 1440)], 180, true)).toBe(0);
    expect(inner.hit([span(0, 1440)], 900, true)).toBe(0);
    expect(outer.hit([span(0, 1440)], 900, true)).toBe("now");
    expect(outer.hit([span(0, 1440)], 719, true)).toBe(0);
    expect(outer.hit([span(0, 1440)], 720 + 180, true)).toBe("now");
    for (const [r, expected] of [[62.1, 0], [61.9, null], [93.9, 0], [96.1, 1], [127.9, 1], [128.1, null]] as const) {
      expect((await at(0.3, r)).hit([span(0, 720), span(720, 1440)], null, true)).toBe(expected);
    }
    expect(outer.hit([span(0, 1440)], 179, true)).toBe(0); // 1 minute from 180 on the other half
  });
});

describe("radial day: drawing", () => {
  const mk = async (props: any = {}) => {
    const { WpRadialDay } = await import("../components/radial-day");
    const el = new WpRadialDay() as any;
    Object.assign(el, { lang: "en", ...props });
    return el;
  };
  const norm = (el: any) => flat(el.render()).replace(/\s+/g, " ");
  it("single dial: one track, a stretch as a dashed arc, ticks every hour, four hours written", async () => {
    const el = await mk({ spans: [{ start: 360, end: 720, color: "#00f", label: "Open" }] });
    const html = norm(el);
    expect(html.match(/class="track"/g)).toHaveLength(1);
    expect(html).toContain('class="track" cx="160" cy="160" r=112 fill="none" stroke=var(--divider-color, rgba(127, 127, 127, 0.2)) stroke-width=36');
    expect(html).toContain('stroke=#00f stroke-width=36 pathLength="100" stroke-dasharray="25 75" stroke-dashoffset=-25 transform="rotate(-90 160 160)"');
    expect(html.match(/class="tick"/g)).toHaveLength(24);
    const ticks = [...html.matchAll(/class="tick" x1=([\d.]+) y1=([\d.]+) x2=([\d.]+) y2=([\d.]+)/g)].map((m) => Math.hypot(+m[1] - +m[3], +m[2] - +m[4]));
    expect(ticks.map((l) => Math.round(l))).toEqual(Array.from({ length: 24 }, (_, h) => (h % 6 === 0 ? 36 : 6)));
    expect([...html.matchAll(/class="hour" x=([\d.]+) y=([\d.]+) text-anchor="middle">(\d+)</g)].map((m) => [Math.round(+m[1]), Math.round(+m[2]), m[3]])).toEqual([
      [160, 20, "00"], [305, 165, "06"], [160, 310, "12"], [15, 165, "18"]]);
    expect(html).not.toContain('class="rings"');
    expect(html).toContain('<text x="160" y="156" text-anchor="middle">24 h</text>');
    expect(html).toContain(`<text x="160" y="180" text-anchor="middle">${t("en", "hours")}</text>`);
    expect(html).toContain(`<span><i style=background:#00f></i>${t("en", "range_from_to", { from: "6 am", to: "12 pm" })} · Open</span>`);
    expect(html).not.toContain(t("en", "rest_of_time"));
    expect(html).not.toContain("<line x1");
  });
  it("a one-shot is a dot of radius 7 on the ring and a time in the legend", async () => {
    const html = norm(await mk({ spans: [{ start: 540, end: 540, color: "#0f0", label: "Shot", marker: true }] }));
    const m = /<circle cx=([\d.]+) cy=([\d.]+) r="7" fill=#0f0 stroke="var\(--primary-text-color\)" stroke-width="2"/.exec(html)!;
    expect([Math.round(+m[1]), Math.round(+m[2])]).toEqual([239, 239]);
    expect(html).toContain("<i style=background:#0f0></i>9 am · Shot</span>");
    expect(html).not.toContain("pathLength");
  });
  it("double dial: two tracks (78 and 112, width 24), 12 ticks a ring, the hours of each half, the rings text", async () => {
    const html = norm(await mk({ double: true, spans: [{ start: 360, end: 1080, color: "#00f", label: "Open" }] }));
    expect([...html.matchAll(/class="track" cx="160" cy="160" r=(\d+) fill="none" stroke=var\(--divider-color, rgba\([^)]*\)\) stroke-width=(\d+)/g)].map((m) => [m[1], m[2]])).toEqual([["78", "24"], ["112", "24"]]);
    expect(html.match(/class="tick"/g)).toHaveLength(24);
    const hours = [...html.matchAll(/class="hour" x=([\d.]+) y=([\d.]+) text-anchor="middle">(\d+)</g)].map((m) => [Math.round(+m[1]), Math.round(+m[2]), m[3]]);
    expect(hours).toEqual([[160, 112, "12"], [213, 165, "3"], [160, 218, "6"], [107, 165, "9"], [160, 20, "24"], [305, 165, "15"], [160, 310, "18"], [15, 165, "21"]]);
    expect(html).toContain(`<div class="rings">${t("en", "radial_rings")}</div>`);
    expect(html.match(/pathLength="100"/g)).toHaveLength(2);
    expect(html).toContain('r=78 fill="none" stroke=#00f stroke-width=24 pathLength="100" stroke-dasharray="50 50" stroke-dashoffset=-50');
    expect(html).toContain('r=112 fill="none" stroke=#00f stroke-width=24 pathLength="100" stroke-dasharray="50 50" stroke-dashoffset=0');
    const ticks = [...html.matchAll(/class="tick" x1=([\d.]+) y1=([\d.]+) x2=([\d.]+) y2=([\d.]+)/g)].map((m) => Math.round(Math.hypot(+m[1] - +m[3], +m[2] - +m[4])));
    expect(ticks).toEqual([...Array(2)].flatMap(() => Array.from({ length: 12 }, (_, h) => (h % 3 === 0 ? 24 : 6))));
  });
  it("the now line and its icon follow the ring of the time; the clock text shows the time; out of range or missing means none", async () => {
    const single = norm(await mk({ now: 360 }));
    const line = /<line x1=([\d.]+) y1=([\d.]+) x2=([\d.]+) y2=([\d.]+) stroke="var\(--primary-text-color\)" stroke-width="3"/.exec(single)!;
    expect([line[1], line[2], line[3], line[4]].map((v) => Math.round(+v))).toEqual([270, 160, 310, 160].map((v, i) => [(160 + 90), 160, 160 + 134, 160][i] === v ? v : [250, 160, 294, 160][i]));
    expect(single).toContain('<text x="160" y="156" text-anchor="middle">6 am</text>');
    expect(single).toContain("mdi:clock-outline");
    const double = norm(await mk({ now: 800, double: true }));
    const dl = /<line x1=([\d.]+) y1=([\d.]+) x2=([\d.]+) y2=([\d.]+) stroke="var\(--primary-text-color\)" stroke-width="3"/.exec(double)!;
    expect(Math.round(Math.hypot(+dl[1] - 160, +dl[2] - 160))).toBe(96); // outer ring: 112 - 12 - 4
    expect(Math.round(Math.hypot(+dl[3] - 160, +dl[4] - 160))).toBe(128);
    const morning = norm(await mk({ now: 100, double: true }));
    const ml = /<line x1=([\d.]+) y1=([\d.]+) x2=([\d.]+) y2=([\d.]+) stroke="var\(--primary-text-color\)" stroke-width="3"/.exec(morning)!;
    expect(Math.round(Math.hypot(+ml[1] - 160, +ml[2] - 160))).toBe(62); // inner ring: 78 - 12 - 4
    expect(norm(await mk({ now: 720, double: true }))).toMatch(/<line x1=[\d.]+ y1=[\d.]+ x2=[\d.]+ y2=[\d.]+ stroke="var\(--primary-text-color\)" stroke-width="3"/);
    for (const bad of [null, -1, 1440, 2000, NaN]) {
      const html = norm(await mk({ now: bad }));
      expect(html).not.toContain('stroke-width="3"');
      expect(html).not.toContain("mdi:clock-outline");
      expect(html).toContain("24 h</text>");
    }
    expect(norm(await mk({ now: 0 }))).toContain('stroke-width="3"');
    expect(norm(await mk({ now: 1439 }))).toContain('stroke-width="3"');
  });
  it("the selected time replaces the idle clock; it goes inside the single dial unless long, outside the double one", async () => {
    const short = norm(await mk({ selectedTime: "8 h – 9 h" }));
    expect(short).not.toContain('y="156"');
    expect(short.indexOf("class=selected-time")).toBeLessThan(short.indexOf("</svg>") + 400);
    const longText = "x".repeat(46);
    expect(norm(await mk({ selectedTime: longText }))).toContain("class=selected-time outside");
    expect(norm(await mk({ selectedTime: "x".repeat(45) }))).not.toContain("outside");
    expect(norm(await mk({ selectedTime: "a", double: true }))).toContain("class=selected-time outside");
  });
  it("the legend names the rest of the time and each stretch once; the dial opens the day unless passive", async () => {
    const s = { start: 0, end: 60, color: "#0", label: "A" };
    const el = await mk({ spans: [s, { ...s, start: 60, end: 120, label: "B" }], rest: "3 h" });
    const html = norm(el);
    expect(html).toContain(`<i style=background:var(--divider-color, rgba(127, 127, 127, 0.2))></i>${t("en", "rest_of_time")}: 3 h`);
    expect(html.match(/<span><i style=background:#0>/g)).toHaveLength(2);
    expect(norm(await mk({ double: true, spans: [{ ...s, end: 1440 }] })).match(/<span><i style=background:#0>/g)).toHaveLength(1); // one entry for two rings
    expect(bound(el.render(), /tabindex=$/)).toEqual([0]);
    el.passive = true;
    expect(bound(el.render(), /tabindex=$/)).toEqual([-1]);
    expect(html).toContain(`aria-label=${t("en", "hours")}`);
  });
});

describe("radial day: icons and the now mark in detail", () => {
  const mk = async (props: any = {}) => {
    const { WpRadialDay } = await import("../components/radial-day");
    const el = new WpRadialDay() as any;
    Object.assign(el, { lang: "en", ...props });
    return el;
  };
  const norm = (el: any) => flat(el.render()).replace(/\s+/g, " ");
  const icons = (html: string) => [...html.matchAll(/<wp-tip text=(.*?) label=.*? style=left:([\d.]+)%;top:([\d.]+)%> <span class="icon"><ha-icon icon=(\S+?)><\/ha-icon>/g)]
    .map((m) => [m[1], Math.round(+m[2] * 10) / 10, Math.round(+m[3] * 10) / 10, m[4]]);
  it("the start icon follows the side of the sun and only exists for a sun start", async () => {
    const down = icons(norm(await mk({ spans: [{ start: 360, end: 720, color: "#0", label: "A", startSun: "down", startSpec: { sun: "sunset" } }] })));
    expect(down).toEqual([["Sunset · 6 am", 85, 50, "mdi:weather-sunset-down"]]);
    const up = icons(norm(await mk({ spans: [{ start: 360, end: 720, color: "#0", label: "A", startSun: "up", startSpec: { sun: "sunrise" } }] })));
    expect(up[0][3]).toBe("mdi:weather-sunset-up");
    expect(icons(norm(await mk({ spans: [{ start: 360, end: 720, color: "#0", label: "A" }] })))).toEqual([]);
    expect(icons(norm(await mk({ spans: [{ start: 360, end: 720, color: "#0", label: "A", endSpec: { sun: "sunset" } }] })))).toEqual([]);
  });
  it("the end icon follows the side too, sits on the end of the arc and not on a ring split", async () => {
    const up = icons(norm(await mk({ spans: [{ start: 360, end: 720, color: "#0", label: "A", endSun: "up", endSpec: { sun: "sunrise" } }] })));
    expect(up).toEqual([["Sunrise · 12 pm", 50, 85, "mdi:weather-sunset-up"]]);
    const split = icons(norm(await mk({ double: true, spans: [{ start: 600, end: 900, color: "#0", label: "A", startSun: "up", startSpec: { sun: "sunrise" }, endSun: "down", endSpec: { sun: "sunset" } }] })));
    expect(split.map((i) => [i[0], i[3]])).toEqual([["Sunrise · 10 am", "mdi:weather-sunset-up"], ["Sunset · 3 pm", "mdi:weather-sunset-down"]]);
    const cut = icons(norm(await mk({ double: true, spans: [{ start: 600, end: 900, color: "#0", label: "A", endSun: "down", endSpec: { sun: "sunset" } }, { start: 100, end: 800, color: "#0", label: "B", startSun: "up", startSpec: { sun: "sunrise" } }] })));
    expect(cut.length).toBe(2);
  });
  it("the clock icon sits inside the ring, on the ring of the time", async () => {
    expect(icons(norm(await mk({ now: 360 })))).toEqual([["Now · 6 am", 75.6, 50, "mdi:clock-outline"]]);
    const afternoon = icons(norm(await mk({ now: 900, double: true })))[0]; // 3 pm: 180/720 of the outer ring, radius 112 - 12 - 12
    expect([afternoon[1], afternoon[2]]).toEqual([Math.round((160 + 88 * Math.cos(0.25 * 2 * Math.PI - Math.PI / 2)) / 3.2 * 10) / 10, Math.round((160 + 88 * Math.sin(0.25 * 2 * Math.PI - Math.PI / 2)) / 3.2 * 10) / 10]);
    const morning = icons(norm(await mk({ now: 180, double: true })))[0]; // 3 am: inner ring, radius 78 - 12 - 12
    expect([morning[1], morning[2]]).toEqual([Math.round((160 + 54 * Math.cos(0.25 * 2 * Math.PI - Math.PI / 2)) / 3.2 * 10) / 10, Math.round((160 + 54 * Math.sin(0.25 * 2 * Math.PI - Math.PI / 2)) / 3.2 * 10) / 10]);
    const noon = icons(norm(await mk({ now: 720, double: true })))[0]; // 12 pm: first minute of the outer ring, top
    expect([noon[1], noon[2]]).toEqual([50, Math.round((160 - 88) / 3.2 * 10) / 10]);
    const edge = icons(norm(await mk({ now: 719, double: true })))[0];
    expect(Number(edge[2])).toBeGreaterThanOrEqual(Math.round((160 - 54) / 3.2 * 10) / 10); // inner ring (radius 54), just before the top
    expect(Number(edge[2])).toBeLessThan(Math.round((160 - 88) / 3.2 * 10) / 10 + 40);
  });
});

describe("a sun icon tells only the action and the times", () => {
  const shot = (label: string) => {
    const el = new WpDayBar() as any;
    Object.assign(el, { lang: "en", deviceName: "Dining room", spans: [{ start: 720, end: 730, color: "#0f0", label, marker: true, startSun: "down", startSpec: { sun: "sunset" } }] });
    el._width = 1440;
    return flat(el.render()).replace(/\s+/g, " ");
  };
  it("drops the room written in brackets after the action, whatever it is", () => {
    expect(shot("Close (Dining room)")).toContain("text=Close Sunset · 12 pm");
    expect(shot("Favourite shutter (salle à manger)")).toContain("text=Favourite shutter Sunset · 12 pm");
    expect(shot("(Dining room)")).toContain("text=Sunset · 12 pm");
  });
  it("keeps a bracket that holds a figure, and a label without brackets", () => {
    expect(shot("Open (50 %)")).toContain("text=Open (50 %) Sunset · 12 pm");
    expect(shot("Close")).toContain("text=Close Sunset · 12 pm");
  });
  it("is stacked above the now line", () => {
    expect(String((WpDayBar as any).styles.cssText ?? [(WpDayBar as any).styles].flat().map((x: any) => x.cssText).join(""))).toMatch(/\.icons \{[^}]*z-index: 6/);
  });
});
