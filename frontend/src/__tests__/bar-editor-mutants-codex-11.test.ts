import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpBarEditor } from "../components/bar-editor";
import { flat, handlers } from "./helpers/tpl";

const slot = (id = "a", start = "06:00", end = "12:00"): any => ({ id, label: "l", start: { time: start }, end: { time: end } });
let serial = 0;
function editor(slots = [slot()]): any {
  const el: any = new WpBarEditor();
  el.hass = { states: {}, services: { cover: { open_cover: {} } }, config: { time_zone: "UTC" } };
  el.program = { id: `codex-bar-${++serial}`, revision: 1, entities: [{ entity_id: "cover.a", default_label: "l", label_overrides: {} }], profiles: [{ id: "h", name: "Home", days: [slots, [], [], [], [], [], []] }] };
  el.data = { programs: [el.program], labels: [{ id: "l", name: "Open", color: "#00ff00", action: { kind: "service", service: "cover.open_cover" } }], status: {} };
  el.entityId = "cover.a";
  el.editing = true;
  const overlay = { getBoundingClientRect: () => ({ left: 100, top: 50, width: 320, height: 20 }), setPointerCapture: vi.fn() };
  Object.defineProperty(el, "renderRoot", { value: { querySelector: () => overlay }, configurable: true });
  return el;
}
const pointer = (x: number, y: number, id = 7): any => ({ button: 0, pointerId: id, clientX: x, clientY: y, currentTarget: { setPointerCapture: vi.fn() }, preventDefault: vi.fn() });
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("window", { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout });
  vi.stubGlobal("navigator", { vibrate: vi.fn() });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function attributes(v: any, name: string, out: any[] = []): any[] {
  if (Array.isArray(v)) { v.forEach(x => attributes(x, name, out)); return out; }
  if (v?.strings) v.strings.forEach((s: string, i: number) => {
    if (s.endsWith(name + "=")) out.push(v.values[i]);
    else attributes(v.values[i], name, out);
  });
  return out;
}
describe("feedback and save boundaries", () => {
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
  it("an overlapping save never merges slots of an untargeted day", async () => {
    const el = editor();
    const adjacent = [slot("left", "00:00", "06:00"), slot("right", "06:00", "12:00")];
    el.hass.callWS = vi.fn(async () => ({}));
    expect(await el._commit((days: any[][]) => days.map((day, i) => i === 0 ? [] : i === 1 ? adjacent : day), [0], true)).toBe(true);
    expect(el.hass.callWS.mock.calls[0][0].program.profiles[0].days[1]).toEqual(adjacent);
  });
  it("a second successful edit resets the draft-expiry timer", async () => {
    const el = editor(); let revision = 1;
    el.hass.callWS = vi.fn(async ({ program }: any) => ({ program: { ...program, revision: ++revision } }));
    const setEnd = (time: string) => (days: any[][]) => days.map((day, i) => i === 0 ? day.map(s => ({ ...s, end: { time } })) : day);
    await el._commit(setEnd("13:00"), [0], true);
    vi.advanceTimersByTime(1000);
    await el._commit(setEnd("14:00"), [0], true);
    vi.advanceTimersByTime(1500);
    expect(el._draft[0].end).toEqual({ time: "14:00" });
    expect(el._awaitRev).toBe(3);
    vi.advanceTimersByTime(999);
    expect(el._draft).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(el._draft).toBeNull();
  });
});
