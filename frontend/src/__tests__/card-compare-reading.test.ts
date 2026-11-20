import { describe, expect, it } from "vitest";
import { t } from "../i18n";
import { flat, handlers } from "./helpers/tpl";
import { slot, uniformProgram as program, wednesdayCard as card, weekOf } from "./helpers/planner-card";

// What a screen reader hears from the comparison bars, and the dialog its edit button opens.
const labelsOf = (html: string): string[] => [...html.matchAll(/class="cbar(?: press)?" role="(?:img|button)"(?: tabindex="0")? aria-label=([^\n]*?)(?= aria-description=|>)/g)].map((m) => m[1]);

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
    const compared = flat(c._compare([[a, b]], false));
    expect(compared).toContain(`class="hours" aria-label=${t("en", "compare_edit")} title=${t("en", "compare_edit")}`);
    expect(compared).toContain(`<span class="hl">${t("en", "compare_edit")}</span>`);
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
