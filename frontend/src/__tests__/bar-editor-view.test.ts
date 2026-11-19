import { describe, expect, it, vi } from "vitest";
import { t } from "../i18n";
import { flat, handlers } from "./helpers/tpl";
import { attributes, editor, mk, slot, useBarEditorGlobals } from "./helpers/bar-editor";

useBarEditorGlobals();
const A = { id: "a", label: "l", start: { time: "08:45" }, end: { time: "17:00" } };

const rect = (left: number, width: number, top = 100, height = 20) => ({ left, top, width, height, right: left + width, bottom: top + height });
const root = (el: any, overlay?: any, bar?: any, face?: any) => Object.defineProperty(el, "renderRoot", { configurable: true, value: {
  querySelector: (sel: string) => sel === ".ov" ? overlay ?? null : sel === "wp-day-bar" ? (bar ? { shadowRoot: { querySelector: () => bar } } : null) : sel === ".radial-face" ? face ?? null : null } });
const box = (r: any) => ({ getBoundingClientRect: () => r });

describe("positions on the bar", () => {
  it("a pointer position gives the minute and the pixels a minute covers; without a rectangle the width is 1", () => {
    const el = mk([A]);
    root(el, box(rect(100, 720)));
    expect(el._minuteAt(460)).toEqual({ m: 720, ppm: 0.5 });
    expect(el._minuteAt(100).m).toBe(0);
    root(el);
    expect(el._minuteAt(0.5)).toEqual({ m: 720, ppm: 1 / 1440 });
    root(el, box({ left: 10, width: 0 }));
    expect(el._minuteAt(10).ppm).toBe(1 / 1440);
  });
  it("the segment under a minute: a slot from its start up to its end, else the gap around it", () => {
    const el = mk([A]);
    expect(el._segAt(525)).toEqual({ kind: "slot", id: "a" });
    expect(el._segAt(1019)).toEqual({ kind: "slot", id: "a" });
    expect(el._segAt(1020)).toEqual({ kind: "gap", start: 1020, end: 1440 });
    expect(el._segAt(524)).toEqual({ kind: "gap", start: 0, end: 525 });
    expect(el._segAt(1440)).toBeNull();
    expect(el._segAt(-1)).toBeNull();
  });
  it("the nearest handle is within 22 px, the closest of two", () => {
    const el = mk([A]);
    const near = (m: number, ppm: number) => el._nearest(m, ppm)?.m;
    expect(near(525 + 44, 0.5)).toBe(525); // exactly 22 px
    expect(near(525 + 45, 0.5)).toBeUndefined();
    expect(near(525 - 44, 0.5)).toBe(525);
    expect(near(1020 - 10, 0.5)).toBe(1020);
    const close = mk([{ ...A, end: { time: "09:00" } }]); // handles 15 minutes apart
    expect(close._nearest(532, 1)?.m).toBe(525);
    expect(close._nearest(538, 1)?.m).toBe(540);
    expect(close._nearest(100, 1)).toBeUndefined();
  });
});

describe("spans of the draft and tips", () => {
  const sun = { id: "s", label: "l2", start: { sun: "sunrise" }, end: { sun: "sunset" } };
  const shot = { id: "m", label: "l", start: { time: "07:00" } };
  it("spans of a day keep the setting's colour, name, kind and sun sides; unknown settings are dropped; a one-shot lasts 10 minutes", () => {
    const el = mk([A, shot, sun, { id: "g", label: "ghost", start: { time: "01:00" }, end: { time: "02:00" } }]);
    el._sun = new Map([[JSON.stringify({ sun: "sunrise" }), 400], [JSON.stringify({ sun: "sunset" }), 1100]]);
    const spans = el._spansOf(el._day);
    expect(spans.map((s: any) => [s.slotId, s.start, s.end, s.color, s.label, s.marker, s.startSun, s.endSun])).toEqual([
      ["a", 525, 1020, "#0f0", "Open", false, null, null],
      ["m", 420, 430, "#0f0", "Open", true, null, null],
      ["s", 400, 1100, "#f00", "Close", false, "up", "down"]]);
    expect(spans[2].startSpec).toEqual({ sun: "sunrise" });
    expect(spans[2].endSpec).toEqual({ sun: "sunset" });
    expect(spans[1].endSpec).toBeNull();
  });
  it("while a draft exists, the day's spill is kept in front of the draft's spans", () => {
    const el = mk([A]);
    el.spans = [{ start: 0, end: 60, color: "#0", label: "Spill", spill: true }, { start: 100, end: 200, color: "#0", label: "Own" }];
    expect(el._spansNow()).toBe(el.spans);
    el._draft = [A];
    expect(el._spansNow().map((s: any) => s.label)).toEqual(["Spill", "Open"]);
  });
  it("the tip of a stretch: the name and its times; a one-shot with its time only; a spill from the day before; the resolved end", () => {
    const el = mk([A, shot]);
    const a = { start: 525, end: 1020, label: "Open", slotId: "a", color: "#0" };
    expect(el._spanTip(a)).toBe("Open · 8:45 am – 5 pm");
    expect(el._spanTip({ start: 420, end: 430, label: "Open", slotId: "m", marker: true, color: "#0" })).toBe("Open · from 7 am");
    const orphan = { start: 60, end: 120, label: "Gone", slotId: "zz", color: "#0" };
    expect(el._spanTip(orphan)).toBe("Gone · 1 am – 2 am");
    const spill = mk([], {});
    spill.weekday = 1;
    spill.program.profiles[0].days[0] = [{ id: "n", label: "l", start: { time: "22:00" }, end: { time: "02:00" } }];
    expect(spill._spanTip({ start: 0, end: 120, label: "Open", slotId: "n", spill: true, color: "#0" })).toContain("10 pm");
    const resolved = mk([{ id: "r", label: "l", start: { sun: "sunset" }, end: { sun: "sunrise" } }]);
    resolved.preview = [{ slot_id: "r", start: "2026-11-04T17:10:00Z", end: "2026-11-05T06:30:00Z" }];
    const tip = resolved._spanTip({ start: 1030, end: 1440, label: "Open", slotId: "r", color: "#0", startSpec: { sun: "sunset" }, endSpec: { sun: "sunrise" } });
    expect(tip).toContain("5:10 pm");
    expect(tip).toContain("6:30 am");
    resolved._draft = [{ id: "r", label: "l", start: { sun: "sunset" }, end: { sun: "sunrise" } }];
    expect(resolved._spanTip({ start: 1030, end: 1440, label: "Open", slotId: "r", color: "#0", startSpec: { sun: "sunset" }, endSpec: { sun: "sunrise" } })).not.toContain("6:30 am");
  });
  it("the tip text: the clock for 'now', the span for a number, nothing otherwise", () => {
    const el = mk([A], { now: 600 });
    el.spans = [{ start: 525, end: 1020, label: "Open", slotId: "a", color: "#0" }];
    expect(el._tipText).toBe("");
    el._tip = "now";
    expect(el._tipText).toBe(t("en", "now_time", { time: "10 am" }));
    el.now = null;
    expect(el._tipText).toBe("");
    el._tip = 0;
    expect(el._tipText).toBe("Open · 8:45 am – 5 pm");
    el._tip = 5;
    expect(el._tipText).toBe("");
  });
  it("focusing a handle shows the tip of its own stretch, not of a spill", () => {
    const el = mk([A]);
    el.spans = [{ start: 0, end: 60, color: "#0", label: "S", slotId: "a", spill: true }, { start: 525, end: 1020, color: "#0", label: "O", slotId: "a" }];
    el._focusSlotTip("a");
    expect(el._tip).toBe(1);
    el._focusSlotTip("zz");
    expect(el._tip).toBeNull();
  });
  it("clock text: the day end reads 24 h", () => {
    const el = mk([A]);
    expect(el._clock(1440)).toBe("24 h");
    expect(el._clock(1439)).toBe("11:59 pm");
    expect(el._clock(0)).toBe("12 am");
    expect(el._clock(1500)).toBe(el._clock(1440));
  });
  it("a sun handle is titled with its event, from the draft", () => {
    const el = mk([sun]);
    el._draft = [{ ...sun, start: { sun: "sunrise", offset: 30 } }];
    expect(el._sunTitle({ id: "s", edge: "start" }, 450)).toBe("Sunrise + 30 min · 7:30 am");
    expect(el._sunTitle({ id: "s", edge: "end" }, 1100)).toBe("Sunset · 6:20 pm");
    expect(el._sunTitle({ id: "zz", edge: "end" }, 1100)).toBe("");
    el._draft = undefined;
    expect(el._sunTitle({ id: "s", edge: "start" }, 450)).toBe("");
  });
});

describe("names of the zone and its hover targets", () => {
  const spans = [{ start: 525, end: 1020, label: "Open", slotId: "a", color: "#0" }, { start: 0, end: 60, label: "Hidden", slotId: "x", color: "#0", ignored: "y" }];
  it("the zone name: device and day, the stretches, the clock, the drawn text first", () => {
    const el = mk([A], { now: 600, lockedReason: "" });
    el.spans = spans;
    expect(el._zoneLabel()).toBe(`${t("en", "edit_bar_of", { name: "Shutter", day: "Monday" })} : Open · 8:45 am – 5 pm ; ${t("en", "now_time", { time: "10 am" })}`);
    el._barText = "Open";
    expect(el._zoneLabel().startsWith("Open, ")).toBe(true);
    el.view = "radial";
    expect(el._zoneLabel().startsWith("Open, ")).toBe(false);
    el.view = undefined; el._barText = "";
    el.deviceName = "";
    expect(el._zoneLabel().startsWith(`${t("en", "edit_bar")} : `)).toBe(true);
    el.lockedReason = "why"; el.deviceName = "Shutter";
    expect(el._zoneLabel().startsWith("Shutter, Monday : ")).toBe(true);
    el.deviceName = "";
    expect(el._zoneLabel().startsWith("Monday : ")).toBe(true);
    el.spans = []; el.now = null; el.lockedReason = "";
    expect(el._zoneLabel()).toBe(t("en", "edit_bar"));
    el.weekday = 9;
    el.deviceName = "X";
    expect(el._zoneLabel()).toBe(t("en", "edit_bar_of", { name: "X", day: "" }));
  });
  it("targets: a stretch has its own box (at least 5 minutes wide), a one-shot its line, now a 16 px strip", () => {
    const el = mk([A], { now: 720 });
    el.spans = [{ start: 525, end: 1020, label: "Open", slotId: "a", color: "#0" }, { start: 100, end: 101, label: "S", slotId: "a", color: "#0" }];
    const html = flat(el._tipTargets()).replace(/\s+/g, " ");
    expect(html).toContain('class="tip-targets "');
    expect(html).toContain(`left:${525 / 1440 * 100}%;width:${495 / 1440 * 100}%;top:0;bottom:0`);
    expect(html).toContain(`left:${100 / 1440 * 100}%;width:${5 / 1440 * 100}%;top:0;bottom:0`);
    expect(html).toContain("left:50%;top:-4px;bottom:-4px;width:16px;transform:translateX(-50%)");
    expect(html.match(/class="tip-target"/g)).toHaveLength(3);
    el.now = null;
    expect(flat(el._tipTargets()).match(/class="tip-target"/g)).toHaveLength(2);
    el.view = "radial";
    const round = flat(el._tipTargets()).replace(/\s+/g, " ");
    expect(round).toContain('class="tip-targets round"');
    expect(round).toContain("width:24px;height:24px;transform:translate(-50%,-50%)");
  });
});

describe("hover over the bar", () => {
  const mouse = (x: number, y: number, extra: any = {}) => ({ pointerType: "mouse", clientX: x, clientY: y, buttons: 0, ...extra });
  const setup = (now: number | null = 720) => {
    const el = mk([A], { now });
    el.spans = [{ start: 0, end: 300, label: "A", slotId: "a", color: "#0" }, { start: 200, end: 400, label: "B", slotId: "a", color: "#0" },
      { start: 1000, end: 1000, label: "Shot", slotId: "m", color: "#0", marker: true }, { start: 500, end: 600, label: "I", slotId: "i", color: "#0", ignored: "x" }];
    root(el, undefined, box(rect(0, 1440, 100, 20)));
    return el;
  };
  it("only a free mouse reads the bar; a touch, a pressed button, a drag or a move clears the tip", () => {
    const el = setup();
    for (const extra of [{ pointerType: "touch" }, { buttons: 1 }]) { el._tip = 3; el._tipMove(mouse(50, 110, extra)); expect(el._tip).toBeNull(); }
    el._tip = 3; el._drag = {}; el._tipMove(mouse(50, 110)); expect(el._tip).toBeNull();
    el._drag = undefined; el._tip = 3; el._mv = {}; el._tipMove(mouse(50, 110)); expect(el._tip).toBeNull();
  });
  it("the band is the bar plus 4 px above and below, and its width; the last drawn stretch wins; ignored ones are skipped", () => {
    const el = setup();
    el._mv = undefined;
    const at = (x: number, y = 110) => { el._tip = "x"; el._tipMove(mouse(x, y)); return el._tip; };
    expect(at(250)).toBe(1);
    expect(at(100)).toBe(0);
    expect(at(0)).toBe(0);
    expect(at(1440)).toBeNull(); // right edge, nothing there
    expect(at(550)).toBeNull(); // ignored stretch
    expect(at(50, 96)).toBe(0);
    expect(at(50, 95)).toBeNull();
    expect(at(50, 124)).toBe(0);
    expect(at(50, 125)).toBeNull();
    expect(at(-1)).toBeNull();
    expect(at(1441)).toBeNull();
    expect(at(1000)).toBe(2);
    expect(at(1008)).toBe(2);
    expect(at(1009)).toBeNull();
    expect(at(992)).toBe(2);
    expect(at(991)).toBeNull();
    expect(at(399)).toBe(1);
    expect(at(400)).toBeNull();
  });
  it("the clock mark is within 8 px of the line, and wins over the stretches", () => {
    const el = setup(250);
    const at = (x: number) => { el._tip = null; el._tipMove(mouse(x, 110)); return el._tip; };
    expect(at(250)).toBe("now");
    expect(at(258)).toBe("now");
    expect(at(242)).toBe("now");
    expect(at(259)).toBe(1);
    expect(at(241)).toBe(1);
    const none = setup(null);
    none._tipMove(mouse(250, 110));
    expect(none._tip).toBe(1);
  });
  it("a bar that is not drawn yet changes nothing; the radial dial asks its own hit test", () => {
    const el = mk([A]);
    root(el);
    el._tip = 2;
    el._tipMove(mouse(10, 10));
    expect(el._tip).toBe(2);
    const dial = mk([A], { now: null, view: "radial" });
    dial.spans = [{ start: 360, end: 720, label: "A", slotId: "a", color: "#0" }];
    root(dial, undefined, undefined, box({ left: 0, top: 0, width: 320, height: 320 }));
    dial._tipMove(mouse(272, 160));
    expect(dial._tip).toBe(0);
    dial._tipMove(mouse(10, 10));
    expect(dial._tip).toBeNull();
    const noFace = mk([A], { view: "radial" });
    root(noFace);
    noFace._tip = 4;
    noFace._tipMove(mouse(10, 10));
    expect(noFace._tip).toBe(4);
  });
});

describe("overlay markup while editing", () => {
  it("a selected slot is boxed, a one-shot has a point, handles are sliders at their minute with their clock text", () => {
    const el = mk([A, { id: "m", label: "l", start: { time: "20:00" } }]);
    el.editing = true;
    el._selected = { kind: "slot", id: "a" };
    const html = flat(el._overlay_()).replace(/\s+/g, " ");
    expect(html).toContain('<div class="ov "');
    expect(html).toContain(`<div class="selbox " style="left:${525 / 1440 * 100}%;width:${495 / 1440 * 100}%">`);
    expect(html).not.toContain("selpoint");
    expect(html).toContain(`style="left:clamp(0px, ${525 / 1440 * 100}%, 100%)"`);
    expect(html).toContain('role="slider" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="1440" aria-valuenow=525');
    expect(html).toContain("aria-valuetext=8:45 am");
    expect(html).toContain(`aria-label=${t("en", "handle", { time: "8:45 am" })}`);
    expect(html).toContain("data-h=a:start");
    expect(html).toContain("class=\"hd dot \"");
    expect(html).toContain('class="hd "');
    el._selected = { kind: "slot", id: "m" };
    const point = flat(el._overlay_()).replace(/\s+/g, " ");
    expect(point).toContain(`<div class="selpoint" style="left:${1200 / 1440 * 100}%">`);
    expect(point).not.toContain("selbox");
    el._selected = { kind: "gap", start: 0, end: 525 };
    const gap = flat(el._overlay_()).replace(/\s+/g, " ");
    expect(gap).toContain('<div class="selbox gap"');
    el._hover = true; el._hsel = { id: "a", edge: "start" };
    const on = flat(el._overlay_()).replace(/\s+/g, " ");
    expect(on).toContain('<div class="ov grab"');
    expect(on).toContain('class="hd on"');
    el._hsel = { id: "a", edge: "end" };
    expect(flat(el._overlay_()).replace(/\s+/g, " ").match(/class="hd on"/g)).toHaveLength(1);
    el._bubble = { m: 600, text: "7 min" }; el._selected = undefined;
    const bubble = flat(el._overlay_()).replace(/\s+/g, " ");
    expect(bubble).toContain(`<div class="bubble" style="left:clamp(44px, ${600 / 1440 * 100}%, calc(100% - 44px))">7 min</div>`);
    el._bubble = { m: 600 };
    expect(flat(el._overlay_())).toContain(">10 am</div>");
  });
});

describe("tooltip targets, handles and day properties", () => {
  it("positions radial tooltip targets in the centre of arcs and at markers", () => {
    const el = editor(); el.view = "radial";
    el.spans = [{ start: 0, end: 720, label: "Open", color: "#0" }, { start: 0, end: 10, label: "Marker", color: "#0", marker: true }];
    el.now = 720;
    const styles = attributes(el._tipTargets(), "style");
    expect(styles).toEqual([
      'left:85%;top:50%;width:24px;height:24px;transform:translate(-50%,-50%)',
      'left:50%;top:15%;width:24px;height:24px;transform:translate(-50%,-50%)',
      'left:50%;top:85%;width:24px;height:24px;transform:translate(-50%,-50%)',
    ]);
    el.view = "radial_12h"; el.spans = [{ start: 0, end: 360, label: "Open", color: "#0" }]; el.now = null;
    expect(attributes(el._tipTargets(), "style")).toEqual(['left:74.375%;top:50%;width:24px;height:24px;transform:translate(-50%,-50%)']);
  });
  it("marks both refs at a shared boundary selected only for the matching edge", () => {
    const el = editor([slot(), slot("b", "12:00", "18:00")]);
    el._hsel = { id: "b", edge: "start" };
    const markup = flat(el._overlay_()).replace(/\s+/g, " ");
    expect(markup).toContain('data-h=a:end b:start');
    expect(markup.match(/class="hd on"/g)).toHaveLength(1);
    el._hsel = { id: "b", edge: "end" };
    expect(flat(el._overlay_()).replace(/\s+/g, " ").match(/class="hd on"/g)).toHaveLength(1);
    el._hsel = { id: "a", edge: "bogus" };
    expect(flat(el._overlay_()).replace(/\s+/g, " ")).not.toContain('class="hd on"');
    el._hover = true;
    handlers(el._overlay_()).find(h => h.event === "pointerleave")!.fn();
    expect(el._hover).toBe(false);
  });
  it("linear handles route focus, blur and keyboard to the selected boundary", () => {
    const el = editor();
    el.spans = [{ slotId: "a", start: 360, end: 720, label: "Open", color: "#0" }];
    const overlay = el._overlay_();
    const repeat = overlay.values.find((v: any) => v?._$litDirective$ && v.values?.length === 3);
    const tpl = repeat.values[2](repeat.values[0][0], 0);
    handlers(tpl).find(h => h.event === "focus")!.fn();
    expect(el._hsel).toEqual({ id: "a", edge: "start" });
    expect(el._selected).toEqual({ kind: "slot", id: "a" });
    expect(el._tip).toBe(0);
    handlers(tpl).find(h => h.event === "blur")!.fn(); expect(el._tip).toBeNull();
    handlers(tpl).find(h => h.event === "keydown")!.fn({ key: "ArrowRight", preventDefault: vi.fn() });
    expect(el._draft[0].start).toEqual({ time: "06:15" });
  });
  it("renders radial day properties and shows an hours axis only below a linear bar", () => {
    const el = editor(); el.view = "radial_12h"; el.hours = true; el.deviceName = "Kitchen"; el.rest = "Closed";
    el._selected = { kind: "slot", id: "a" };
    let tpl = el.render();
    expect(flat(tpl)).toContain('wp-radial-day passive device-name=Kitchen');
    expect(attributes(tpl, ".double")).toEqual([true]);
    expect(attributes(tpl, ".selectedTime")).toEqual(['6 am – 12 pm']);
    expect(flat(tpl)).toContain('rest=Closed');
    expect(flat(tpl)).not.toContain('class="hours"');
    el.editing = false;
    expect(attributes(el.render(), ".selectedTime")).toEqual([""]);
    expect(flat(el.render())).not.toContain('ov polar');
    el.view = "radial";
    expect(attributes(el.render(), ".double")).toEqual([false]);
    el.view = "bar";
    expect(flat(el.render())).toContain('class="hours"');
    el.hours = false;
    expect(flat(el.render())).not.toContain('class="hours"');
  });
  it("the displayed bar receives language, device name, spans, current time and editable height", () => {
    const el = editor(); el.deviceName = "Kitchen"; el.now = 100;
    const tpl = el.render();
    expect(attributes(tpl, "device-name")).toEqual(["Kitchen"]);
    expect(attributes(tpl, "?no-tab")).toEqual([false]);
    expect(attributes(tpl, "?tall")).toEqual([true]);
    expect(attributes(tpl, ".now")).toEqual([100]);
    expect(attributes(tpl, "lang")).toEqual(["en"]);
    const event = { detail: "Open" };
    handlers(tpl).find(h => h.event === "visible-text")!.fn(event);
    expect(el._barText).toBe("Open");
    el.editing = false;
    expect(attributes(el.render(), "?no-tab")).toEqual([true]);
    expect(attributes(el.render(), "?tall")).toEqual([false]);
  });
});

describe("hours axis, alerts and titles", () => {
  it("shows five evenly spaced hour ticks with the day-end label", () => {
    const el = editor();
    const markup = flat(el._hoursAxis());
    for (const position of [0, 25, 50, 75, 100]) expect(markup).toContain(`left:${position}%`);
    for (const time of ["12 am", "6 am", "12 pm", "6 pm", "24 h"]) expect(markup).toContain(`>${time}</span>`);
    expect(markup.match(/<span /g)).toHaveLength(5);
  });
  it("a pending save error is visible as an alert with its actual message", () => {
    const el = editor();
    expect(flat(el.render())).not.toContain('role=alert');
    el._fail("Cannot move this schedule");
    expect(flat(el.render())).toContain('Cannot move this schedule');
    expect(flat(el.render())).toContain('role="alert"');
    vi.advanceTimersByTime(5000);
    expect(flat(el.render())).not.toContain('Cannot move this schedule');
  });
  it("overlay titles prefer the hovered schedule and otherwise show the selected time", () => {
    const el = editor(); el._selected = { kind: "slot", id: "a" };
    expect(attributes(el._overlay_(), "title")[0]).toBe("6 am – 12 pm");
    el.spans = [{ start: 600, end: 660, label: "Other", color: "#0" }]; el._tip = 0;
    expect(attributes(el._overlay_(), "title")[0]).toBe("Other · 10 am – 11 am");
    el.view = "radial";
    expect(attributes(el._radialOverlay(), "title")[0]).toBe("Other · 10 am – 11 am");
    el._tip = null;
    expect(attributes(el._radialOverlay(), "title")[0]).toBe("6 am – 12 pm");
  });
});

describe("tooltip while the day bar is not drawn", () => {
  it("missing day-bar shadow roots leave a mouse tooltip unchanged and bounds clear it", () => {
    const el = editor(); el._tip = 0;
    Object.defineProperty(el, "renderRoot", { value: { querySelector: () => ({ shadowRoot: null }) }, configurable: true });
    const move = { pointerType: "mouse", buttons: 0, clientX: 150, clientY: 60 };
    el._tipMove(move); expect(el._tip).toBe(0);
    const bar = { getBoundingClientRect: () => ({ left: 100, top: 50, right: 420, bottom: 70, width: 320 }) };
    Object.defineProperty(el, "renderRoot", { value: { querySelector: () => ({ shadowRoot: { querySelector: () => bar } }) }, configurable: true });
    el.now = 1440;
    el._tipMove({ ...move, clientX: 420 }); expect(el._tip).toBe("now");
    el._tipMove({ ...move, clientX: 421 }); expect(el._tip).toBeNull();
    el._tipMove({ ...move, clientY: 45 }); expect(el._tip).toBeNull();
    el._tipMove({ ...move, clientY: 75 }); expect(el._tip).toBeNull();
  });
});
