// Wiring of the zoom in the day chart: synthetic pointer events on the handlers of the rendered svg.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpChart } from "../components/chart";
import { find, flat } from "./helpers/tpl";

const DAY = "2026-01-01";
const T0 = Date.parse(`${DAY}T00:00:00Z`);
// width 320, band chart (left pad 8, right pad 10): plot 302 px for 1440 min
const PLOT = 302;
const px = (m: number) => 8 + (m / 1440) * PLOT;

function chart(entityId = "switch.lamp") {
  const c = new WpChart() as any;
  c.entityId = entityId;
  c.date = DAY;
  c.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, callWS: vi.fn(async () => ({})) };
  c.data = { labels: [], status: {} };
  c.program = { id: "p", name: "P", entities: [{ entity_id: entityId, default_label: null }],
    profiles: [{ id: "home", days: Array.from({ length: 7 }, () => []) }] };
  c._loaded = { hist: [{ t: T0, s: "off", a: {} }, { t: T0 + 600 * 60_000, s: "on", a: {} }], log: [], sent: [] };
  c._model = c._build(c._loaded);
  c.renderRoot = { querySelector: () => ({ getBoundingClientRect: () => ({ left: 0, width: 320 }) }) };
  c.requestUpdate = () => {};
  return c;
}
const ev = (id: number, x: number, type = "touch", y = 50) =>
  ({ pointerId: id, pointerType: type, button: 0, clientX: x, clientY: y, type: "pointermove", currentTarget: null, preventDefault: vi.fn() });
const up = (id: number, x: number, type = "touch") => ({ ...ev(id, x, type), type: "pointerup" });
const tpl = (c: any) => c._renderChart(c._model);
const win = (c: any) => c._zoom;

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("pinch (two fingers)", () => {
  it("zooms in around the pinch centre and back out", () => {
    const c = chart();
    c._down(ev(1, px(500) - 20)); c._down(ev(2, px(500) + 20));
    expect(c._gesture.kind).toBe("pinch");
    c._move(ev(1, px(500) - 60)); c._move(ev(2, px(500) + 60));
    const w = win(c);
    expect(w.to - w.from).toBeCloseTo(1440 / 3, 0);
    expect(500).toBeGreaterThan(w.from); expect(500).toBeLessThan(w.to);
    // the minute under the centre of the fingers stays under it
    expect(w.from + ((px(500) - 8) / PLOT) * (w.to - w.from)).toBeCloseTo(500, 0);
    c._move(ev(1, px(500) - 5)); c._move(ev(2, px(500) + 5));
    expect(win(c)).toBeNull(); // pinched out past the day = no zoom
  });

  it("never goes under 30 minutes nor outside 0-24 h", () => {
    const c = chart();
    c._down(ev(1, px(1430) - 2)); c._down(ev(2, px(1430) + 2));
    c._move(ev(1, px(1430) - 150)); c._move(ev(2, px(1430) + 150));
    expect(win(c).to).toBeLessThanOrEqual(1440);
    expect(win(c).from).toBeGreaterThanOrEqual(0);
    expect(win(c).to - win(c).from).toBeGreaterThanOrEqual(30);
  });

  it("lifting one finger goes on as a pan, without a jump", () => {
    const c = chart();
    c._down(ev(1, px(500) - 20)); c._down(ev(2, px(500) + 20));
    c._move(ev(1, px(500) - 60)); c._move(ev(2, px(500) + 60));
    const before = { ...win(c) };
    c._up(up(2, px(500) + 60));
    expect(win(c)).toEqual(before);
    expect(c._gesture.kind).toBe("pan");
    c._move(ev(1, px(500) - 60 + 30));
    expect(win(c).from).toBeLessThan(before.from);
  });

  it("does not open the history right after", () => {
    const c = chart();
    const open = vi.fn(); c._open = open;
    c._down(ev(1, 100)); c._down(ev(2, 140)); c._move(ev(2, 200));
    c._up(up(2, 200)); c._up(up(1, 100));
    c._click();
    expect(open).not.toHaveBeenCalled();
  });
});

describe("one finger", () => {
  it("pans a whole day, suppresses the gesture click, then allows a later tap", () => {
    const c = chart();
    const open = vi.fn(); c._open = open;
    c._down(ev(1, 100)); c._move(ev(1, 160));
    expect(win(c).from).toBeLessThan(0);
    expect(win(c).to - win(c).from).toBeCloseTo(1440);
    c._up(up(1, 160));
    vi.advanceTimersByTime(1000);
    c._click();
    vi.advanceTimersByTime(300);
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("pans when zoomed across day boundaries, keeping its duration", () => {
    const c = chart();
    c._zoom = { from: 600, to: 840 };
    c._down(ev(1, 150)); c._move(ev(1, 150 - 20));
    expect(win(c).from).toBeGreaterThan(600);
    expect(win(c).to - win(c).from).toBeCloseTo(240);
    c._move(ev(1, 150 - 5000));
    expect(win(c).from).toBeGreaterThan(1440);
    expect(win(c).to - win(c).from).toBeCloseTo(240);
    c._up(up(1, 0));
  });

  it("the svg leaves vertical scrolling to the browser", () => {
    expect(flat(WpChart.styles.cssText)).toContain("touch-action: pan-y");
  });
});

describe("mouse", () => {
  it("drag selects a range and zooms to it", () => {
    const c = chart();
    c._down({ ...ev(1, px(480), "mouse"), shiftKey: true }); c._move(ev(1, px(720), "mouse"));
    expect(c._band).not.toBeNull();
    expect(flat(tpl(c))).toContain('class="rubber"');
    c._up(up(1, px(720), "mouse"));
    expect(c._band).toBeNull();
    expect(win(c).from).toBeCloseTo(480, 0);
    expect(win(c).to).toBeCloseTo(720, 0);
  });

  it("selects right to left too, and a tiny selection gives the 30 min minimum", () => {
    const c = chart();
    c._down({ ...ev(1, px(720), "mouse"), shiftKey: true }); c._move(ev(1, px(480), "mouse")); c._up(up(1, px(480), "mouse"));
    expect(win(c).from).toBeCloseTo(480, 0);
    const d = chart();
    d._down({ ...ev(1, px(700), "mouse"), shiftKey: true }); d._move(ev(1, px(700) + 7, "mouse")); d._up(up(1, px(700) + 7, "mouse"));
    expect(win(d).to - win(d).from).toBeGreaterThanOrEqual(30);
    expect(win(d).to - win(d).from).toBeLessThan(40);
  });

  it("a click without drag opens the history; the click after a drag does not", () => {
    const c = chart();
    const open = vi.fn(); c._open = open;
    c._down(ev(1, 100, "mouse")); c._up(up(1, 100, "mouse")); c._click();
    expect(open).toHaveBeenCalledTimes(1);
    c._down(ev(1, px(100), "mouse")); c._move(ev(1, px(400), "mouse")); c._up(up(1, px(400), "mouse")); c._click();
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("ignores other buttons", () => {
    const c = chart();
    c._down({ ...ev(1, 100, "mouse"), button: 2 });
    expect(c._ptrs.size).toBe(0);
  });

  it("ctrl + wheel zooms around the cursor; plain wheel does nothing", () => {
    const c = chart();
    const prevent = vi.fn();
    c._wheel({ ctrlKey: false, deltaX: 0, deltaY: -100, clientX: px(720), preventDefault: prevent });
    expect(win(c)).toBeNull();
    c._wheel({ ctrlKey: true, deltaX: 0, deltaY: -100, clientX: px(720), preventDefault: prevent });
    expect(prevent).toHaveBeenCalled();
    expect(win(c).to - win(c).from).toBeLessThan(1440);
    expect((win(c).from + win(c).to) / 2).toBeCloseTo(720, 0);
  });

  it("double click resets, and a single click waits for it when zoomed", () => {
    const c = chart();
    const open = vi.fn(); c._open = open;
    c._zoom = { from: 100, to: 400 };
    c._click();
    expect(open).not.toHaveBeenCalled();
    c._reset();
    vi.advanceTimersByTime(1000);
    expect(open).not.toHaveBeenCalled();
    expect(win(c)).toBeNull();
    c._zoom = { from: 100, to: 400 };
    c._click(); vi.advanceTimersByTime(400);
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("keys: + - 0 and arrows", () => {
    const c = chart();
    const key = (k: string) => c._zoomKey({ key: k, preventDefault() {} });
    key("+"); // 1440 / 1.5
    expect(win(c).to - win(c).from).toBeCloseTo(960);
    const w0 = { ...win(c) };
    key("ArrowRight");
    expect(win(c).from).toBeGreaterThan(w0.from);
    key("0");
    expect(win(c)).toBeNull();
    expect(key("x")).toBe(false);
    expect(key("ArrowLeft")).toBe(true);
    expect(win(c).from).toBeLessThan(0);
  });
});

describe("rendering when zoomed", () => {
  it("axis labels adapt to the window and data is clipped", () => {
    const c = chart();
    expect(flat(tpl(c))).not.toContain("clip-path=url");
    c._zoom = { from: 480, to: 600 };
    const html = flat(tpl(c));
    expect(html).toContain("08:00");
    expect(html).toContain("08:15");
    expect(html).toContain('clipPath id="plot"');
    expect(html).toContain("url(#plot)");
    const full = flat(tpl(chart()));
    expect(full).toContain(">0h<");
    expect(full).toContain(">3h<");
    expect(full).toContain(">24h<"); // the end of the day is never a second "0h"
    expect(full.match(/>0h</g)).toHaveLength(1);
  });

  it("the reset button shows only when zoomed, with a window hint", () => {
    const c = chart();
    expect(flat(c.render())).not.toContain("mdi:magnify-minus-outline");
    c._zoom = { from: 480, to: 600 };
    const html = flat(c.render());
    expect(html).toContain("mdi:magnify-minus-outline");
    expect(html).toContain("Return to selected day");
    expect(html).toContain("08:00 – 10:00");
    find(c.render(), "click", "return-day").fn();
    expect(win(c)).toBeNull();
  });

  it("hides the now cursor and markers outside the window", () => {
    vi.setSystemTime(T0 + 900 * 60_000);
    const c = chart();
    c._loaded = null;
    c._model = c._build({ hist: [], log: [], sent: [] });
    expect(flat(tpl(c))).toContain('class="nowtip"');
    c._zoom = { from: 60, to: 200 };
    expect(flat(tpl(c))).not.toContain('class="nowtip"');
    c._zoom = { from: 800, to: 1000 };
    expect(flat(tpl(c))).toContain('class="nowtip"');
  });

  it("is reset when the day or the device changes", () => {
    const c = chart();
    c._zoom = { from: 100, to: 400 };
    c._load = vi.fn();
    c.willUpdate(new Map([["date", "2025-12-31"]]));
    expect(win(c)).toBeNull();
    c._zoom = { from: 100, to: 400 };
    c.willUpdate(new Map([["entityId", "x"]]));
    expect(win(c)).toBeNull();
    c._zoom = { from: 100, to: 400 };
    c.willUpdate(new Map([["slots", null]]));
    expect(win(c)).not.toBeNull();
  });
});
