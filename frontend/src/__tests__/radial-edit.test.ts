import { describe, expect, it } from "vitest";
import { radialDelta, radialPointerMinute, radialPosition } from "../radial";
const rect = { left: 10, top: 20, width: 320, height: 320 };
const at = (m: number, double = false, end = false) => { const p = radialPosition(m, double, end); return { x: p.x + 10, y: p.y + 20 }; };
describe("radial editing coordinates", () => {
  it.each([false, true])("maps track positions back to exact minutes (double=%s)", double => {
    for (const m of [17, 360, 719, 720, 737, 1080, 1439]) {
      const p = at(m, double);
      expect(radialPointerMinute(p.x, p.y, rect, double)).toBeCloseTo(m);
    }
  });
  it("places noon end on morning and noon start on afternoon", () => {
    expect(radialPosition(720, true, true).y).toBeCloseTo(82);
    expect(radialPosition(720, true).y).toBeCloseTo(48);
    expect(radialPosition(1440, true, true).y).toBeCloseTo(48);
  });
  it.each([false, true])("unwraps clockwise/counterclockwise movement at the top (%s)", double => {
    const period = double ? 720 : 1440;
    const a = at(period - 15, double), b = at(15, double);
    expect(radialDelta(a.x, a.y, b.x, b.y, rect, double)).toBeCloseTo(30);
    expect(radialDelta(b.x, b.y, a.x, a.y, rect, double)).toBeCloseTo(-30);
  });
  it("ignores a ring change during a drag", () => {
    const a = at(720, true, true), b = at(735, true);
    expect(radialDelta(a.x, a.y, b.x, b.y, rect, true)).toBeCloseTo(15);
  });
});

import { WpBarEditor } from "../components/bar-editor";
import { flat } from "./helpers/tpl";

const editor = (view: string): any => {
  const el: any = new WpBarEditor();
  el.view = view;
  el.entityId = "switch.test";
  el.hass = { states: {}, services: {}, config: { time_zone: "UTC" } };
  el.program = { id: "radial-test", revision: 1, entities: [{ entity_id: "switch.test" }], active_profile: "home", profiles: [{ id: "home", days: [[{ id: "a", label: "x", start: { time: "08:00" }, end: { time: "12:00" } }, { id: "b", label: "y", start: { time: "12:00" }, end: { time: "18:00" } }]] }] };
  el.data = { programs: [el.program], labels: [], status: {} };
  return el;
};
describe("circular editor shares the day editor", () => {
  it.each(["bar", "bars", "list"])("keeps %s as a linear bar", view => {
    const el = editor(view);
    expect(el._radial).toBe(false);
    expect(flat(el.render())).toContain("wp-day-bar");
  });
  it.each(["radial", "radial_12h"])("renders %s through the shared editable component", view => {
    const el = editor(view); el.editing = true;
    const markup = flat(el.render());
    expect(markup).toContain("wp-radial-day passive");
    expect(markup).toContain('class="ov polar"');
    el.editing = false;
    expect(flat(el.render())).not.toContain('class="ov polar"');
  });
  it("places both noon handles on their respective rings while retaining the shared refs", () => {
    const el = editor("radial_12h");
    const noon = el._radialBoundaries().filter((b: any) => b.m === 720);
    expect(noon.map((b: any) => b.refs)).toEqual([[{ id: "a", edge: "end" }], [{ id: "b", edge: "start" }]]);
  });
  it("uses a square dial before edit mode even when the legend increases the face height", () => {
    const el = editor("radial");
    el.renderRoot = { querySelector: (q: string) => q === ".ov" ? null : { getBoundingClientRect: () => ({ left: 10, top: 20, width: 320, height: 500 }) } };
    el._pointerY = 180;
    expect(el._minuteAt(330).m).toBeCloseTo(360);
  });
  it("accumulates beyond half a turn without reversing the gesture", () => {
    const el = editor("radial_12h");
    el._dialRect = () => rect;
    let last = 0;
    for (const minute of [120, 240, 360, 480, 600, 720, 840]) {
      const start = at(0, true), end = at(minute % 720, true);
      last = el._radialMovement(end.x, end.y, start.x, start.y);
    }
    expect(last).toBeCloseTo(840);
  });
});
