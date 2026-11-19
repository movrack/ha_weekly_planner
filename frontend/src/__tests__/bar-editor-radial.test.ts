import { describe, expect, it, vi } from "vitest";
import { flat, handlers } from "./helpers/tpl";
import { attributes, editor, pointer, slot, useBarEditorGlobals } from "./helpers/bar-editor";

useBarEditorGlobals();

describe("radial editor geometry", () => {
  it("uses a square dial at its actual offset and scales minutes in both views", () => {
    const el = editor();
    el.view = "radial";
    expect(el._dialRect()).toEqual({ left: 100, top: 50, width: 320, height: 320 });
    el._pointerY = 210;
    expect(el._minuteAt(372).m).toBeCloseTo(360);
    expect(el._minuteAt(372).ppm).toBeCloseTo(2 * Math.PI * 112 / 1440);
    el.view = "radial_12h";
    expect(el._minuteAt(372).m).toBeCloseTo(900);
    expect(el._minuteAt(338).m).toBeCloseTo(180);
    expect(el._minuteAt(372).ppm).toBeCloseTo(2 * Math.PI * 112 / 720);
  });
  it("separates noon's end on the inner ring from its start on the outer ring", () => {
    const el = editor([slot(), slot("b", "12:00", "18:00")]);
    el.view = "radial_12h";
    const noon = el._radialBoundaries().filter((b: any) => b.m === 720);
    expect(noon.map((b: any) => b.refs)).toEqual([[{ id: "a", edge: "end" }], [{ id: "b", edge: "start" }]]);
    expect(el._radialNearest(260, 132)?.refs).toEqual([{ id: "a", edge: "end" }]);
    expect(el._radialNearest(260, 98)?.refs).toEqual([{ id: "b", edge: "start" }]);
    expect(el._radialNearest(260, 210)).toBeUndefined();
    el.view = "radial";
    expect(el._radialBoundaries().filter((b: any) => b.m === 720)).toHaveLength(1);
  });
  it("accumulates successive quarter turns instead of losing full turns", () => {
    const el = editor();
    el.view = "radial";
    expect(el._radialMovement(372, 210, 260, 98)).toBeCloseTo(360);
    expect(el._radialMovement(260, 322, 260, 98)).toBeCloseTo(720);
    expect(el._radialMovement(148, 210, 260, 98)).toBeCloseTo(1080);
    expect(el._radialMovement(260, 98, 260, 98)).toBeCloseTo(1440);
    el._polarProgress = undefined;
    el.view = "radial_12h";
    expect(el._radialMovement(372, 210, 260, 98)).toBeCloseTo(180);
  });
  it("renders noon handles on their rings and wires focus, blur and keyboard", () => {
    const el = editor([slot(), slot("b", "12:00", "18:00")]);
    el.view = "radial_12h";
    const template = el._radialOverlay();
    const markup = flat(template);
    expect(markup).toContain('top:25.625%');
    expect(markup).toContain('top:15%');
    expect(markup).toContain('data-h=a:end');
    expect(markup).toContain('aria-valuemax="1440"');
    handlers(template).filter(h => h.event === "focus")[1].fn();
    expect(el._hsel).toEqual({ id: "a", edge: "end" });
    expect(el._selected).toEqual({ kind: "slot", id: "a" });
    el._tip = 1;
    handlers(template).find(h => h.event === "blur")!.fn();
    expect(el._tip).toBeNull();
    handlers(template).filter(h => h.event === "keydown")[1].fn({ key: "ArrowLeft", preventDefault: vi.fn() });
    expect(el._draft[0].end).toEqual({ time: "11:45" });
    expect(el._draft[1].start).toEqual({ time: "11:45" });
  });
});

describe("radial selection and feedback", () => {
  it("draws an arc on each ring for a selection spanning noon", () => {
    const el = editor([slot("a", "09:00", "15:00")]);
    el.view = "radial_12h";
    el._selected = { kind: "slot", id: "a" };
    const markup = flat(el._radialOverlay());
    expect(markup).toContain('r=78');
    expect(markup).toContain('r=112');
    expect(markup.match(/stroke-width=28/g)).toHaveLength(2);
    expect(markup).toContain('stroke-dasharray="25 75"');
    expect(markup).toContain('stroke-dashoffset=-75');
    expect(markup).toContain('stroke-dashoffset=0');
    expect(markup).not.toContain('polar-time');
    el.view = "radial";
    const single = flat(el._radialOverlay());
    expect(single.match(/stroke-width=40/g)).toHaveLength(1);
    expect(single).toContain('stroke-dashoffset=-37.5');
    expect(single).toContain('stroke-dasharray="25 75"');
  });
  it("draws a one-shot at its start, without a duration arc", () => {
    const el = editor([{ id: "a", label: "l", start: { time: "06:00" } }]);
    el.view = "radial"; el._selected = { kind: "slot", id: "a" };
    const markup = flat(el._radialOverlay());
    expect(markup).toContain('cx=272');
    expect(markup).toContain('cy=160');
    expect(markup).toContain('r="12"');
    expect(markup).not.toContain('stroke-dasharray');
    el.view = "radial_12h";
    expect(flat(el._radialOverlay())).toContain('cx=160');
    expect(flat(el._radialOverlay())).toContain('cy=238');
  });
  it("shows a drag bubble only without a selected time and preserves custom text", () => {
    const el = editor(); el.view = "radial";
    expect(flat(el._radialOverlay())).not.toContain('polar-time');
    el._bubble = { m: 360 };
    expect(flat(el._radialOverlay())).toContain('class="polar-time">6 am</div>');
    el._bubble = { m: 360, text: "Wednesday 6 am" };
    expect(flat(el._radialOverlay())).toContain('class="polar-time">Wednesday 6 am</div>');
    el._selected = { kind: "slot", id: "a" };
    expect(flat(el._radialOverlay())).not.toContain('polar-time');
  });
  it("hit-tests the closest radial handle, including the exact 22px boundary", () => {
    const el = editor([slot("a", "00:00", "01:00")]); el.view = "radial";
    expect(el._radialNearest(260, 76)?.m).toBe(0);
    expect(el._radialNearest(260, 75.99)).toBeUndefined();
    expect(el._radialNearest(280, 100)?.m).toBe(60);
    expect(el._radialNearest(262, 98)?.m).toBe(0);
  });
  it("drags a radial boundary using both pointer coordinates and keeps subthreshold moves still", () => {
    const el = editor([slot("a", "00:00", "12:00")]); el.view = "radial"; el._edit = vi.fn();
    el._ovDown(pointer(260, 98));
    expect(el._polarDrag).toEqual({ x: 260, y: 98, minute: 0 });
    el._ovMove(pointer(261, 99));
    expect(el._draft).toBeNull();
    el._ovMove(pointer(372, 210));
    expect(el._draft[0].start).toEqual({ time: "06:00" });
    expect(el._bubble).toEqual({ m: 360 });
    el._ovUp(pointer(372, 210));
    const op = el._edit.mock.calls[0][0];
    expect(op(el.program.profiles[0].days, (x: string) => x)[0][0].start).toEqual({ time: "06:00" });
  });
  it("uses the radial face before the editing overlay exists", () => {
    const el = editor(); el.view = "radial";
    const face = { getBoundingClientRect: () => ({ left: 20, top: 40, width: 640, height: 100 }) };
    Object.defineProperty(el, "renderRoot", { value: { querySelector: (s: string) => s === ".radial-face" ? face : null }, configurable: true });
    expect(el._dialRect()).toEqual({ left: 20, top: 40, width: 640, height: 640 });
  });
});

describe("radial handles for assistive technology", () => {
  it("the radial handles expose their minute and formatted time for assistive technology", () => {
    const el = editor(); el.view = "radial";
    const tpl = el._radialOverlay();
    expect(attributes(tpl, "aria-valuenow")).toEqual([360, 720]);
    expect(attributes(tpl, "aria-valuetext")).toEqual(["6 am", "12 pm"]);
    expect(attributes(tpl, "aria-label").slice(1)).toEqual(["Boundary 6 am", "Boundary 12 pm"]);
    expect(flat(tpl)).toContain('style="left:85%;top:50%"');
    expect(flat(tpl)).toContain('style="left:50%;top:85%"');
  });
});
