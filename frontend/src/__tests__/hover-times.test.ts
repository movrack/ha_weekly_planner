import { describe, expect, it } from "vitest";
import { WpBarEditor } from "../components/bar-editor";
import { radialHoverTarget } from "../components/radial-day";
import { radialPosition } from "../radial";
import { flat, find } from "./helpers/tpl";

const editor = (): any => {
  const el: any = new WpBarEditor();
  el.lang = "fr"; el.tz = "UTC"; el.editing = false;
  el.hass = { states: {}, services: {}, config: { time_zone: "UTC" } };
  const slot = { id: "slot", label: "comfort", start: { time: "08:45" }, end: { time: "17:00" } };
  el.program = { id: "hover", revision: 1, entities: [], active_profile: "home", profiles: [{ id: "home", days: [[slot], [], [], [], [], [], []] }] };
  el.data = { programs: [el.program], labels: [], status: {} };
  el.spans = [{ start: 525, end: 1020, label: "Comfort", color: "#e80", slotId: "slot" }];
  return el;
};
const rect = { left: 10, top: 20, width: 320, bottom: 48 };
const pointer = (x: number, y = 34, rest = {}) => ({ pointerType: "mouse", clientX: x, clientY: y, buttons: 0, ...rest });
const barRoot = (el: any) => Object.defineProperty(el, "renderRoot", { configurable: true,
  value: { querySelector: () => ({ shadowRoot: { querySelector: () => ({ getBoundingClientRect: () => rect }) } }) } });

describe("schedule hover and focus tooltips", () => {
  it.each([false, true])("shows name and full times on hover, selected=%s", selected => {
    const el = editor(); el.editing = selected; if (selected) el._selected = { kind: "slot", id: "slot" };
    barRoot(el); el._tipMove(pointer(10 + 700 / 1440 * 320));
    expect(el._tipText).toBe("Comfort · 8 h 45 – 17 h");
    const markup = flat(el.render());
    expect(markup).toContain('role="tooltip"');
    expect(markup).toContain(`title=${el._tipText}`);
    expect(markup).toContain(`aria-label=${el._tipText}`);
    find(el.render(), "pointerleave", "zone").fn();
    expect(el._tipText).toBe("");
  });
  it("shows the same text at keyboard focus and closes on blur or Escape", () => {
    const el = editor();
    find(el._tipTargets(), "focus", "Comfort").fn();
    expect(el._tipText).toBe("Comfort · 8 h 45 – 17 h");
    find(el._tipTargets(), "blur", "@blur").fn();
    expect(el._tipText).toBe("");
    el._focusSlotTip("slot");
    expect(el._tipText).toContain("Comfort");
    el._zoneKey({ key: "Escape" }); expect(el._tipText).toBe("");
    expect(flat(el._tipTargets())).toContain('tabindex="0" role="img"');
    expect(WpBarEditor.styles.map((s: any) => s.cssText).join("")).toContain("pointer-events: none");
  });
  it("preserves solar resolution, one-shot, overnight, and previous-day endpoints", () => {
    const el = editor(); const slot = el.program.profiles[0].days[0][0];
    slot.start = { sun: "sunset" }; slot.end = { time: "06:00" };
    el.preview = [{ slot_id: "slot", start: "2026-11-03T17:17:00Z", end: "2026-11-04T06:00:00Z" }];
    expect(el._spanTip(el.spans[0])).toBe("Comfort · 17 h 17 (Coucher du soleil) – 6 h (lendemain)");
    delete slot.end; el.preview[0].end = null;
    expect(el._spanTip(el.spans[0])).toBe("Comfort · dès 17 h 17 (Coucher du soleil)");
    slot.start = { time: "22:00" }; slot.end = { time: "06:00" }; el.preview = undefined;
    el.program.profiles[0].days[6] = [slot];
    expect(el._spanTip({ ...el.spans[0], spill: true, start: 0, end: 360 })).toBe("Comfort · 22 h – 6 h (lendemain)");
    el.lang = "en";
    expect(el._spanTip(el.spans[0])).toBe("Comfort · 10 pm – 6 am (next day)");
  });
  it("retains explicit 24 h while using the resolved previous-day solar boundary", () => {
    const el = editor(); const slot = el.program.profiles[0].days[0][0];
    slot.start = { sun: "sunset" }; slot.end = { time: "24:00" };
    el.preview = [{ slot_id: "slot", start: "2026-11-03T17:17:00Z", end: "2026-11-04T00:00:00Z" }];
    expect(el._spanTip(el.spans[0])).toBe("Comfort · 17 h 17 (Coucher du soleil) – 24 h");
    slot.end = { sun: "sunrise" };
    el.program.profiles[0].days[6] = [slot];
    el.preview[0].end = "2026-11-04T06:23:00Z";
    expect(el._spanTip({ ...el.spans[0], spill: true, start: 0, end: 383 })).toBe("Comfort · 17 h 17 (Coucher du soleil) – 6 h 23 (Lever du soleil) (lendemain)");
  });
  it("observes a 16px now corridor and refreshes an already open tooltip on a minute tick", () => {
    const el = editor(); el.now = 892; barRoot(el);
    el._tipMove(pointer(10 + 892 / 1440 * 320 + 7));
    expect(el._tipText).toBe("Maintenant : 14 h 52");
    el.now = 893;
    expect(flat(el.render())).toContain("Maintenant : 14 h 53");
    el.lang = "en"; expect(el._tipText).toBe("Now: 2:53 pm");
    el.now = null; expect(el._tipText).toBe("");
  });
  it("does not show hover text for touch, pressed pointers, gestures, ignored spans, or outside the bar", () => {
    const el = editor(); barRoot(el);
    for (const p of [pointer(180, 34, { pointerType: "touch" }), pointer(180, 34, { buttons: 1 }), pointer(180, 80)]) {
      el._tipMove(p); expect(el._tip).toBe(null);
    }
    el._drag = {}; el._tipMove(pointer(180)); expect(el._tip).toBe(null); el._drag = undefined;
    el.spans[0].ignored = "condition"; el._tipMove(pointer(180)); expect(el._tip).toBe(null);
  });
  it.each(["radial", "radial_12h"])("observes arcs and clock through the %s editing surface", view => {
    const el = editor(); el.view = view; el.editing = true; el.now = 900;
    const r = { left: 0, top: 0, width: 320 };
    Object.defineProperty(el, "renderRoot", { value: { querySelector: () => ({ getBoundingClientRect: () => r }) } });
    const p = radialPosition(600, view === "radial_12h");
    el._tipMove(pointer(p.x, p.y)); expect(el._tipText).toBe("Comfort · 8 h 45 – 17 h");
    const q = radialPosition(900, view === "radial_12h");
    el._tipMove(pointer(q.x, q.y)); expect(el._tipText).toBe("Maintenant : 15 h");
    el.now = 901; expect(flat(el.render())).toContain("Maintenant : 15 h 01");
    expect(radialHoverTarget(el.spans, el.now, view === "radial_12h", 160, 160, r)).toBe(null);
    expect(radialHoverTarget([{ ...el.spans[0], ignored: "condition" }], null, view === "radial_12h", p.x, p.y, r)).toBe(null);
  });
});
