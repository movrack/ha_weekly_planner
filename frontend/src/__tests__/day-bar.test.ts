import { beforeEach, describe, expect, it, vi } from "vitest";
import { LitElement } from "lit";
import { t } from "../i18n";
import { WpDayBar, nowTip, scheduleBoundaries, sunDir, sunTip } from "../components/day-bar";
import { WpRadialDay } from "../components/radial-day";
import { flat } from "./helpers/tpl";
import { attrOf } from "./helpers/planner-card";

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
    expect([attrOf(tall, /\?passive=$/), attrOf(tall, /\?no-tab=$/)]).toEqual([[true], [true]]);
    const plain = bar([icon]).render();
    expect([attrOf(plain, /\?passive=$/), attrOf(plain, /\?no-tab=$/)]).toEqual([[false], [false]]);
  });
  it("a one-shot has a wide tip unless it follows the sun or the bar is thin", () => {
    const shot = { start: 720, end: 730, color: "#0f0", label: "Shot", marker: true };
    const tpl = bar([shot, { ...base }, { ...shot, startSun: "up", startSpec: { sun: "sunrise" } }], { tall: true, noTab: true }).render();
    const html = flat(tpl).replace(/\s+/g, " ");
    expect(attrOf(tpl, /\?passive=$/).slice(0, 1)).toEqual([true]);
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
    const at = (w: number, label = "abc") => Object.assign(bar([]), { _width: w })._labelBox({ ...s, label });
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
    expect(html).toContain("aria-label=Open · 8 am – 10 am, Tiny · 11:40 am – 11:41 am"); // the times are in the name, not only the labels (Before / After of the copy dialog)
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

describe("day bar and radial dial: defaults and details", () => {
  beforeEach(() => vi.stubGlobal("ResizeObserver", undefined));
  const bar = (spans: any[], props: any = {}) => { const el = new WpDayBar() as any; Object.assign(el, { lang: "en", spans, ...props }); el._width = 1440; return el; };
  it("defaults of the bar and of the dial", () => {
    const b = new WpDayBar() as any, r = new WpRadialDay() as any;
    expect([b.lang, b.deviceName, b.spans]).toEqual(["en", "", []]);
    expect([r.lang, r.deviceName, r.spans, r.now, r.double, r.passive, r.rest, r.selectedTime]).toEqual(["en", "", [], null, false, false, "", ""]);
    expect(String((WpDayBar.styles as any).cssText)).toContain(".nowline");
    expect(String((WpRadialDay.styles as any).cssText)).toContain(".dial");
  });
  it("the sun icons pair side and image; the visible text lists the names that fit in order; the event is named", () => {
    const html = flat(bar([{ start: 360, end: 480, color: "#0", label: "A", startSun: "up", startSpec: { sun: "sunrise" }, endSun: "down", endSpec: { sun: "sunset" } }]).render()).replace(/\s+/g, " ");
    expect(html).toContain('data-sun=up> <span class="sunc"><ha-icon icon=mdi:weather-sunset-up>');
    expect(html).toContain('data-sun=down> <span class="sunc"><ha-icon icon=mdi:weather-sunset-down>');
    expect(html).toContain('<span class="name" style="left:0%;width:100%">A</span>');
    const el = bar([{ start: 0, end: 300, color: "#0", label: "A" }, { start: 400, end: 700, color: "#0", label: "B" }]);
    expect(el.visibleText()).toBe("A B");
    const seen: any[] = [];
    el.dispatchEvent = (e: any) => { seen.push([e.type, e.detail]); return true; };
    el.updated();
    expect(seen).toEqual([["visible-text", "A B"]]);
  });
  it("label room: 7 px a character plus 14, more than the 40 px minimum; a missing 'now' never crosses a span", () => {
    const el = bar([]);
    el._width = 1300;
    expect(el._labelBox({ start: 0, end: 144, label: "x".repeat(20) })).toBeNull(); // 130 px < 154
    el._width = 1540;
    expect(el._labelBox({ start: 0, end: 144, label: "x".repeat(20) })).not.toBeNull();
    el._width = 1440;
    expect(el._labelBox({ start: 0, end: 100, label: "A" })).toEqual({ left: 0, width: 100, text: "A" }); // now is null: whole span
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

describe("wp-day-bar: spans, sun icons and labels that fit", () => {
  beforeEach(() => vi.stubGlobal("ResizeObserver", undefined));
  const sampleBar = (props: Record<string, unknown> = {}) => {
    const el = new WpDayBar() as any;
    Object.assign(el, { lang: "en", spans: [
      { start: 0, end: 480, color: "#00f", label: "Night" },
      { start: 480, end: 600, color: "#f00", label: "Morning peak with a long name", startSun: "up", startSpec: { sun: "sunrise", offset: -15 } },
      { start: 700, end: 700, color: "#0f0", label: "Shot", marker: true },
      { start: 720, end: 1000, color: "#ff0", label: "Day", ignored: "x", endSun: "down", endSpec: { sun: "sunset" } },
    ], ...props });
    return el;
  };
  it("the sun and now helpers describe the sun and the time", () => {
    expect(sunDir(null)).toBeNull(); expect(sunDir({ time: "08:00" })).toBeNull();
    expect(sunDir({ sun: "dawn" })).toBe("up"); expect(sunDir({ sun: "dusk" })).toBe("down");
    expect(sunTip("en", null, 0)).toBe(""); expect(sunTip("en", { sun: "sunrise", offset: 30 }, 480)).toContain("+ 30 min");
    expect(sunTip("en", { sun: "sunset", offset: -5 }, 1000)).toContain("- 5 min");
    expect(nowTip("en", 600)).toContain("·");
  });
  it("renders spans, notches, hours, sun icons, markers and the now line", () => {
    const el = sampleBar({ notches: true, showHours: true, now: 500 });
    el._width = 1000;
    const html = flat(el.render());
    expect(html).toContain("tick"); expect(html).toContain("nowline"); expect(html).toContain("mdi:weather-sunset-up");
    expect(html).toContain("mdi:weather-sunset-down"); expect(html).toContain("mktip"); expect(html).toContain("class=\"hours\"");
    expect(html).toContain("ignored");
    expect(html).toContain(">24 h<"); // the right end reads 24 h, never a second midnight
  });
  it("only draws labels that fit, avoiding the now line, and none when thin", () => {
    const el = sampleBar({ now: 590 }); el._width = 1440;
    const span = { start: 480, end: 600, label: "Morning" } as any;
    const box = el._labelBox(span);
    expect(box).not.toBeNull(); expect(box.width).toBeLessThan(100);
    el.now = 500; expect(el._labelBox(span)?.left).toBeGreaterThan(0);
    el.now = null; el._width = 100; expect(el._labelBox(span)).toBeNull();
    el._width = 0; expect(el._labelBox(span)).toBeNull();
    el._width = 1440; el.thin = true; expect(el._labelBox(span)).toBeNull();
  });
});

describe("day bar for assistive technology", () => {
  it("the hour axis follows the language", () => {
    const el = new WpDayBar() as any;
    el.showHours = true; el.lang = "fr";
    expect(flat(el.render())).toContain("6 h");
  });
  it("the now marker leaves the tab order and carries the device; the hour axis is hidden from screen readers", () => {
    const el = new WpDayBar() as any; el.now = 885; el.lang = "en"; el.deviceName = "Office"; el.showHours = true;
    const html = flat(el.render());
    expect(html).toContain("no-tab");
    expect(html).toMatch(/label=Now · [^\n]*, Office/);
    expect(html).toContain('class="hours" aria-hidden="true"');
  });
  it("the markers of a zone's day bar stay out of the tab order", () => {
    const el = new WpDayBar() as any; el.lang = "en"; el.noTab = true;
    el.spans = [{ start: 600, end: 610, color: "#e91e63", label: "Start", slotId: "a", marker: true }];
    expect(flat(el.render())).toContain("?no-tab");
  });
});

describe("boundaries between visible schedules", () => {
  const span = (start: number, end: number, slotId: string, extra = {}) => ({ start, end, slotId, color: "#ffbf00", label: "19°", ...extra });
  it.each([
    ["two evening schedules with the same setting", [span(0, 420, "night", { spill: true }), span(1140, 1290, "evening"), span(1290, 1440, "night")], [1290]],
    ["a gap between schedules", [span(1140, 1200, "evening"), span(1290, 1440, "night")], []],
    ["one continuous schedule", [span(600, 900, "one")], []],
    ["two pieces of one schedule", [span(600, 720, "one"), span(720, 900, "one")], []],
    ["an ignored neighbour", [span(600, 720, "one"), span(720, 900, "two", { ignored: "overlap" })], []],
    ["a one-shot neighbour", [span(600, 720, "one"), span(720, 730, "two", { marker: true })], []],
    ["a covering schedule hides an earlier boundary", [span(600, 720, "one"), span(720, 900, "two"), span(500, 1000, "cover")], []],
    ["paint order wins when schedules overlap", [span(600, 900, "under"), span(700, 800, "over")], [700, 800]],
    ["unsorted schedules", [span(720, 900, "two"), span(600, 720, "one")], [720]],
    ["invalid schedules", [span(NaN, 720, "one"), span(720, Infinity, "two"), span(900, 800, "three"), span(100, NaN, "four"), span(-100, -1, "before"), span(1440, 1500, "after")], []],
    ["clipped overnight pieces", [span(-100, 720, "one"), span(720, 1600, "two")], [720]],
    ["empty day", [], []],
    ["fallback spans without ids", [span(600, 720, "one", { slotId: undefined }), span(720, 900, "two", { slotId: undefined })], [720]],
  ])("%s", (_name, spans, expected) => {
    expect(scheduleBoundaries(spans).map((b) => b.minute)).toEqual(expected);
  });
  it("draws the 21:30 separator without another interactive or spoken target", () => {
    const bar = new WpDayBar();
    bar.spans = [span(1140, 1290, "evening"), span(1290, 1440, "night")];
    const line = flat(bar.render()).match(/<i[^>]*class="schedule-boundary"[^>]*>/g);
    expect(line).toHaveLength(1);
    expect(line![0]).toContain('aria-hidden="true"');
    expect(Number(/left:([^%;]+)/.exec(line![0])![1])).toBeCloseTo(89.5833);
    expect(line![0]).not.toMatch(/tabindex|role=/);
  });
});
