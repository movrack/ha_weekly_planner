import { describe, expect, it } from "vitest";
import { t } from "../i18n";
import { flat } from "./helpers/tpl";
import { card, hass, names, program, slot, spansOf, uniformProgram, wednesdayCard, week, weekOf } from "./helpers/planner-card";

const A = () => program("pa", "Zeta", ["light.z"]);

describe("compare: day-off group", () => {
  const dayOff = { holiday_entity: "binary_sensor.off" };
  const group = (h: string) => h.slice(h.indexOf("cday cday-off"));
  it("absent without the day-off entity or when no program has a day off", () => {
    expect(flat(week(card([A()], {}, {})))).not.toContain("cday-off");
    expect(flat(week(card([program("p", "P", ["cover.a"], {}, { copy: 6 })], {}, {})))).not.toContain("cday-off");
    expect(flat(week(card([A()], {}, dayOff)))).not.toContain("cday-off");
    expect(flat(week(card([program("p", "P", ["cover.a"], {}, { copy: 6, off: true })], {}, dayOff)))).not.toContain("cday-off");
  });
  it("lists every device; the ones without a day off get an empty bar with the text", () => {
    const withOff = program("pb", "Alpha", ["cover.a"], {}, { copy: 6 });
    const c = card([withOff, A()], {}, dayOff);
    const tpl = week(c);
    const h = flat(tpl);
    expect(h.indexOf("cday-off")).toBeGreaterThan(h.lastIndexOf("role=\"tabpanel\" aria-label=Sunday"));
    expect(h).toContain(`>${t("en", "holiday_title")}</button>`); // the chip of the day off, after Sunday's
    const g = group(h);
    expect(names(g)).toEqual(["Alpha", "Zeta"]);
    expect(g.match(/class="cnone"/g)).toHaveLength(1);
    expect(g).toContain(`<span class="cnone">${t("en", "compare_not_set")}</span>`);
    expect(g).toContain(`aria-label=Alpha, ${t("en", "holiday_title")}, ${t("en", "holiday_what_copy", { day: "Sunday" })}`);
    expect(g).toContain(`aria-label=Zeta, ${t("en", "holiday_title")}, ${t("en", "compare_not_set")}`);
    const spans = spansOf(tpl);
    expect(spans).toHaveLength(16);
    expect(spans[14].map((s: any) => [s.start, s.end])).toEqual([[600, 660]]); // copy of Sunday
    expect(spans[15]).toEqual([]);
    expect(g.indexOf("caxis")).toBeGreaterThan(0);
  });
  it("French text; own day and the midnight cut", () => {
    const own = program("pb", "Alpha", ["cover.a"], {}, { day: [slot("h", "23:00", "01:00")] });
    const c = card([own], {}, dayOff);
    c.hass = { ...hass, language: "fr" };
    const tpl = week(c);
    expect(flat(tpl)).toContain(t("fr", "holiday_title"));
    expect(spansOf(tpl)[7].map((s: any) => [s.start, s.end])).toEqual([[1380, 1440]]);
    const none = card([own, A()], {}, dayOff);
    none.hass = { ...hass, language: "fr" };
    expect(flat(week(none))).toContain(">comme un jour normal<");
  });
  it("a copied day shows its bar and \"like <day>\"; an own day shows the bar alone", () => {
    const copy = program("pc", "Alpha", ["cover.a"], {}, { copy: 6 });
    const own = program("po", "Beta", ["cover.b"], {}, { day: [slot("h", "08:00", "09:00")] });
    const h = group(flat(week(card([copy, own], {}, dayOff))));
    expect(h).toContain(`aria-label=${t("en", "holiday_title")}`); // the group itself
    expect(h).toContain(`aria-label=Alpha, ${t("en", "holiday_title")}, ${t("en", "holiday_what_copy", { day: "Sunday" })}`); // the full sentence of the copied row
    expect(h.match(/class="crow note"/g)).toHaveLength(1);
    expect(h.match(/class="ccopy"/g)).toHaveLength(1);
    expect(h).toContain(`<span class="ccopy">${t("en", "holiday_what_copy", { day: "Sunday" })}</span>`);
    expect(h.match(/class="cnone"/g)).toBeNull();
    const rows = h.split('<div class="crow').slice(1);
    expect(rows[0]).toContain("ccopy");
    expect(rows[1]).not.toContain("ccopy");
    expect(rows[1]).not.toContain("cnone");
    const c = card([copy], {}, dayOff);
    c.hass = { ...hass, language: "fr" };
    expect(group(flat(week(c)))).toContain(">comme dimanche<");
  });
  it("today on a day off shows what really runs in today's group", () => {
    const p = program("pb", "Alpha", ["cover.a"], {}, { day: [slot("h", "12:00", "13:00")] });
    const c = card([p], {}, { ...dayOff, holiday_today: true, status: { pb: { holiday: { own: true } } } });
    const spans = spansOf(week(c));
    expect(spans[0].map((s: any) => [s.start, s.end])).toEqual([[720, 780]]); // Monday = today
    expect(spans[1].map((s: any) => [s.start, s.end])).toEqual([[480, 540]]); // Tuesday unchanged
  });
});

describe("compare day-off group", () => {
  const own = (c: any) => c._data.programs[0].profiles[0];
  const setup = (holiday: any, ids = ["cover.a"]) => {
    const p = uniformProgram("p1", "Volet", ids, undefined, holiday);
    return wednesdayCard([p], {}, { holiday_entity: "binary_sensor.h" });
  };
  it("a program without a day off: not-set text and the accessible sentence", () => {
    const c = setup({ copy: 6 });
    c._data.programs.push(uniformProgram("p2", "Autre", ["cover.b"], undefined, undefined));
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
    expect(flat(c._holidayRow("cover.a", uniformProgram("p", "n", ["cover.a"])))).toBe("");
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
