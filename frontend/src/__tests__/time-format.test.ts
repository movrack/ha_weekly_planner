import { afterEach, describe, expect, it } from "vitest";
import { WpTimesDay } from "../components/times-day";
import { fmtClock, fmtDayEnd, fmtTick12, formatPauseEnd, formatWhen, setTimeFormat, timeFormat } from "../time";
import { tickStep } from "../chart-zoom";
import { flat } from "./helpers/tpl";

const plain = (s: string) => s.replace(/[  ]/g, " ");
const hass = (time_format?: string) => ({ locale: { time_format } });
afterEach(() => setTimeFormat(null));

describe("time format (hass.locale.time_format)", () => {
  it("reads 12, 24, and falls back to language when absent or unknown", () => {
    expect(timeFormat(hass("12"))).toBe("12");
    expect(timeFormat(hass("24"))).toBe("24");
    expect(timeFormat(hass("language"))).toBe("language");
    expect(timeFormat(hass("system"))).toBe("language");
    expect(timeFormat({})).toBe("language");
    expect(timeFormat(undefined)).toBe("language");
  });

  it.each([
    ["language", "en", "10 pm", "6:05 am"],
    ["language", "fr", "22 h", "6 h 05"],
    ["24", "en", "22:00", "06:05"],
    ["24", "fr", "22 h", "6 h 05"],
    ["12", "en", "10 pm", "6:05 am"],
    ["12", "fr", "10 pm", "6:05 am"],
  ] as const)("fmtClock %s / %s", (format, lang, evening, morning) => {
    expect(plain(fmtClock(lang, 22 * 60, format))).toBe(evening);
    expect(plain(fmtClock(lang, 6 * 60 + 5, format))).toBe(morning);
  });

  it("24 h in English gives 19:00, not 7 pm", () => {
    expect(fmtClock("en", 19 * 60, "24")).toBe("19:00");
    expect(plain(fmtClock("en", 19 * 60, "12"))).toBe("7 pm");
  });

  it("uses the format set from hass when none is passed", () => {
    setTimeFormat(hass("24"));
    expect(fmtClock("en", 19 * 60)).toBe("19:00");
    setTimeFormat(hass("12"));
    expect(plain(fmtClock("en", 19 * 60))).toBe("7 pm");
    setTimeFormat(hass());
    expect(plain(fmtClock("en", 19 * 60))).toBe("7 pm");
  });

  it("12 h says midnight and noon in words, 24 h is unchanged", () => {
    setTimeFormat(hass("12"));
    expect(fmtClock("en", 0)).toBe("midnight");
    expect(fmtClock("en", 720)).toBe("noon");
    expect(fmtClock("fr", 0)).toBe("minuit");
    expect(fmtClock("fr", 720)).toBe("midi");
    expect(plain(fmtClock("en", 30))).toBe("12:30 am");
    setTimeFormat(hass("24"));
    expect(fmtClock("en", 0)).toBe("00:00");
    expect(fmtClock("en", 720)).toBe("12:00");
  });

  it("formatWhen and formatPauseEnd follow it", () => {
    const now = new Date("2026-11-02T08:00:00Z");
    setTimeFormat(hass("24"));
    expect(formatWhen("2026-11-02T19:00:00Z", "UTC", "en", now)).toBe("19:00");
    expect(formatWhen("2026-11-03T19:00:00Z", "UTC", "en", now)).toBe("tomorrow 19:00");
    expect(formatPauseEnd("2026-11-09T19:00:00Z", "UTC", "en")).toMatch(/, 19:00$/);
    setTimeFormat(hass("12"));
    expect(plain(formatWhen("2026-11-02T19:00:00Z", "UTC", "en", now))).toBe("7 pm");
    expect(plain(formatWhen("2026-11-02T19:00:00Z", "UTC", "fr", now))).toBe("7 pm");
    setTimeFormat(hass("language"));
    expect(formatWhen("2026-11-02T19:00:00Z", "Europe/Paris", "fr", now)).toBe("20 h");
  });

  it("the end of the day is midnight in 12 h, 24 h otherwise", () => {
    expect(plain(fmtDayEnd("en", "12"))).toBe("midnight");
    expect(plain(fmtDayEnd("fr", "12"))).toBe("minuit");
    expect(fmtDayEnd("en", "24")).toBe("24 h");
    expect(fmtDayEnd("fr", "language")).toBe("24 h");
  });

  it("chart ticks in 12 h: compact labels and fewer sub-hour ticks", () => {
    expect(fmtTick12(7, 0)).toBe("7 am");
    expect(fmtTick12(0, 0)).toBe("midnight");
    expect(fmtTick12(12, 0, false, "fr")).toBe("midi");
    expect(fmtTick12(0, 30, true)).toBe("12:30 am");
    expect(fmtTick12(12, 0)).toBe("noon");
    expect(fmtTick12(19, 30, true)).toBe("7:30 pm");
    expect(tickStep(240)).toBe(30);
    expect(tickStep(240, 6)).toBe(60);
  });

  it("the daily times list shows the chosen format", () => {
    const row = { key: "a|1140", startMin: 19 * 60, color: "#0a0", label: "Heat", slotId: "a", carry: null, until: { day: "today", min: 21 * 60 }, oneShot: false, sun: null, rule: null, random: false, now: false, done: false };
    const render = (lang: string) => { const c = new WpTimesDay() as any; Object.assign(c, { lang, rows: [row] }); return plain(flat(c.render())); };
    setTimeFormat(hass("24"));
    expect(render("en")).toContain("19:00");
    expect(render("fr")).toContain("19 h");
    setTimeFormat(hass("12"));
    expect(render("en")).toContain("7 pm");
    expect(render("fr")).toContain("7 pm");
    setTimeFormat(hass("language"));
    expect(render("en")).toContain("7 pm");
  });
});

describe("12 h helpers on the card and in the slot editor", () => {
  it("the hint under a time field shows the HA format and follows typing", async () => {
    const { WpSlotForm } = await import("../components/slot-form");
    const { flat } = await import("./helpers/tpl");
    const f = new WpSlotForm() as any;
    f.hass = { language: "en", states: {} };
    setTimeFormat(hass("12"));
    expect(flat(f._hint("start", "22:30"))).toContain("= 10:30 pm");
    f._typed = { start: "00:00" };
    expect(flat(f._hint("start", "22:30"))).toContain("= midnight");
    expect(flat(f._hint("start", "22:30"))).toContain("id=hint12-start");
    expect(f._hintId("start", "22:30")).toBe("hint12-start");
    expect(f._hintId("end-earliest", "07:00")).toBe("hint12-end-earliest");
    setTimeFormat(hass("24"));
    expect(flat(f._hint("start", "22:30"))).toBe("");
    expect(typeof f._hintId("start", "22:30")).not.toBe("string");
  });
  it("'at' only before a time of today, in 12 h", async () => {
    const { WeeklyPlannerCard } = await import("../weekly-planner-card");
    const c = new WeeklyPlannerCard() as any;
    c.hass = { language: "en", config: { time_zone: "UTC" } };
    c._now = new Date("2026-11-02T08:00:00Z");
    setTimeFormat(hass("12"));
    expect(plain(c._whenText("2026-11-02T19:00:00Z"))).toBe("at 7 pm");
    expect(plain(c._whenText("2026-11-03T19:00:00Z"))).toBe("tomorrow 7 pm");
    setTimeFormat(hass("24"));
    expect(c._whenText("2026-11-02T19:00:00Z")).toBe("19:00");
  });
});
