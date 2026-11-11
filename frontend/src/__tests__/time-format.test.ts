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

  it("the end of the day is 12 am in 12 h, 24 h otherwise", () => {
    expect(plain(fmtDayEnd("en", "12"))).toBe("12 am");
    expect(fmtDayEnd("en", "24")).toBe("24 h");
    expect(fmtDayEnd("fr", "language")).toBe("24 h");
  });

  it("chart ticks in 12 h: compact labels and fewer sub-hour ticks", () => {
    expect(fmtTick12(7, 0)).toBe("7 am");
    expect(fmtTick12(0, 0)).toBe("12 am");
    expect(fmtTick12(12, 0)).toBe("12 pm");
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
