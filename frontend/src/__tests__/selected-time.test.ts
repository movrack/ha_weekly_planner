import { describe, expect, it } from "vitest";
import { selectedTimeText } from "../selected-time";
import { WpBarEditor } from "../components/bar-editor";
import { WpRadialDay } from "../components/radial-day";
import { flat } from "./helpers/tpl";

const editor = (): any => {
  const el: any = new WpBarEditor();
  el.lang = "fr";
  el.editing = true;
  el.hass = { states: {}, services: {}, config: { time_zone: "UTC" } };
  el.program = { id: "selected-times", revision: 1, entities: [], active_profile: "home", profiles: [{ id: "home", days: [[
    { id: "a", label: "x", start: { time: "08:45" }, end: { time: "17:00" } },
  ]] }] };
  el.data = { programs: [el.program], labels: [], status: {} };
  return el;
};

describe("selected occurrence text", () => {
  it("formats exact fixed minutes with the existing user clock", () => {
    expect(selectedTimeText("fr", 525, 1020)).toBe("8 h 45 – 17 h");
    expect(selectedTimeText("en", 525, 1020)).toBe("8:45 am – 5 pm");
  });
  it("annotates resolved solar minutes, event and offset", () => {
    expect(selectedTimeText("fr", 1037, 1200, { sun: "sunset" })).toBe("17 h 17 (Coucher du soleil) – 20 h");
    expect(selectedTimeText("en", 375, null, { sun: "sunrise", offset: -15 })).toBe("from 6:15 am (Sunrise − 15 min)");
  });
  it("distinguishes no end, overnight and explicit end of day", () => {
    expect(selectedTimeText("fr", 525, null)).toBe("dès 8 h 45");
    expect(selectedTimeText("fr", 1320, 360)).toBe("22 h – 6 h (lendemain)");
    expect(selectedTimeText("en", 1320, 360)).toBe("10 pm – 6 am (next day)");
    expect(selectedTimeText("fr", 1320, 1440)).toBe("22 h – 24 h");
  });
});

describe("selected occurrence displays", () => {
  it("keeps the persistent bar label exclusive to selection and edit mode", () => {
    const el = editor();
    expect(flat(el.render())).not.toContain('class="selected-time"');
    el._selected = { kind: "slot", id: "a" };
    const text = "8 h 45 – 17 h";
    expect(flat(el.render())).toContain(`title=${text}`);
    expect(flat(el.render())).toContain(`aria-label=${text}`);
    el.editing = false;
    expect(flat(el.render())).not.toContain('class="selected-time"');
  });
  it("updates both boundaries from the live drag draft, including narrow slots", () => {
    const el = editor();
    el._selected = { kind: "slot", id: "a" };
    el._draft = [{ ...el.program.profiles[0].days[0][0], start: { time: "09:00" }, end: { time: "09:05" } }];
    el._bubble = { m: 540 };
    expect(flat(el.render())).toContain("9 h – 9 h 05");
    expect(flat(el._overlay_())).not.toContain('class="bubble"');
    el._draft = [{ ...el._draft[0], start: { time: "09:15" }, end: { time: "09:20" } }];
    expect(flat(el.render())).toContain("9 h 15 – 9 h 20");
  });
  it("refreshes the pair during real pointer boundary and whole-slot handlers", () => {
    const el = editor();
    el._selected = { kind: "slot", id: "a" };
    el._minuteAt = () => ({ m: 0, ppm: 1 });
    el._drag = { ref: { id: "a", edge: "start" }, m0: 525, x0: 0, id: 1,
      moved: false, last: 525, profileId: "home", weekday: 0, ctx: el._ctx() };
    el._ovMove({ pointerId: 1, clientX: 15, clientY: 0 });
    expect(el._selectedTime).toBe("9 h – 17 h");
    expect(flat(el.render())).toContain("9 h – 17 h");
    el._drag = undefined;
    el._draft = null;
    el._barAt = () => null;
    el._mv = { id: 2, x0: 0, y0: 0, slotId: "a", moved: false, delta: 0,
      to: null, profileId: "home", weekday: 0, ctx: el._ctx(), refused: false };
    el._ovMove({ pointerId: 2, clientX: 15, clientY: 0 });
    expect(el._selectedTime).toBe("9 h – 17 h 15");
  });
  it("uses the unclipped overnight end and resolved solar preview", () => {
    const el = editor();
    const slot = el.program.profiles[0].days[0][0];
    slot.start = { sun: "sunset" };
    slot.end = { time: "06:00" };
    el.preview = [{ slot_id: "a", start: "2026-11-03T17:17:00Z", end: "2026-11-04T06:00:00Z" }];
    el.willUpdate(new Map([["preview", undefined]]));
    el._selected = { kind: "slot", id: "a" };
    expect(el._selectedTime).toBe("17 h 17 (Coucher du soleil) – 6 h (lendemain)");
  });
  it.each(["radial", "radial_12h"])("passes the full live selected text to %s", view => {
    const el = editor(); el.view = view; el._selected = { kind: "slot", id: "a" };
    expect(flat(el.render())).toContain("8 h 45 – 17 h");
    expect(flat(el._radialOverlay())).not.toContain('class="polar-time"');
  });
  it("places long solar descriptions below the single dial without covering hour numbers", () => {
    const el = new WpRadialDay();
    el.selectedTime = selectedTimeText("fr", 1037, 360, { sun: "sunset", offset: 30 }, { sun: "sunrise", offset: -15 });
    const markup = flat(el.render());
    expect(markup).toContain("class=selected-time outside");
    expect(markup.indexOf("class=selected-time outside")).toBeGreaterThan(markup.indexOf("</svg></button>"));
    expect(markup.indexOf("class=selected-time outside")).toBeLessThan(markup.indexOf('class="legend"'));
  });
  it.each([false, true])("renders accessible selected times replacing the idle clock (%s)", double => {
    const el = new WpRadialDay(); el.double = double;
    expect(flat(el.render())).not.toContain('class="selected-time"');
    el.selectedTime = "22 h – 6 h (lendemain)";
    const markup = flat(el.render());
    expect(markup).toContain(double ? 'class=selected-time outside' : 'class=selected-time');
    expect(markup).toContain(`title=${el.selectedTime}`);
    expect(markup).toContain(`aria-label=${el.selectedTime}`);
    expect(markup).not.toContain('y="156"');
    if (double) expect(markup.indexOf("class=selected-time outside")).toBeGreaterThan(markup.indexOf("</svg></button>"));
  });
});
