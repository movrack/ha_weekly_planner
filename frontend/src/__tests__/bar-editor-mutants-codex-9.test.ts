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
describe("control names and data bindings", () => {
  it("the strip names its actions, day group and time group without losing the selected label", () => {
    const el = editor(); el._selected = { kind: "slot", id: "a" };
    const tpl = el._strip();
    expect(attributes(tpl, "aria-label")).toEqual(["In time", "Split in two. Split this schedule in two parts, one after the other in time", "On other days", "Copy to other days Copy this schedule to other days"]);
    expect(attributes(tpl, "title")).toEqual(["Split this schedule in two parts, one after the other in time", "Copy this schedule to other days"]);
    expect(attributes(tpl, ".entityIds")).toEqual([["cover.a"]]);
    expect(attributes(tpl, ".value")).toEqual(["l"]);
    const markup = flat(tpl);
    expect(markup).toContain('>Erase</button>');
    expect(markup).toContain('>Split in two</button>');
    expect(markup).toContain('>Copy to other days</button>');
    el._copyOpen = true;
    expect(attributes(el._strip(), "aria-expanded")).toEqual([true]);
    expect(attributes(el._strip(), "aria-label").slice(-1)[0]).toBe("Copy");
    expect(attributes(el._strip(), "title").slice(-1)[0]).toBe("Copy");
    expect(flat(el._strip())).toContain('Choose at least one day.');
    el._selected = { kind: "gap", start: 720, end: 1440 };
    expect(attributes(el._strip(), ".value")).toEqual([null]);
    expect(flat(el._strip())).not.toContain('class="copy"');
  });
  it("the conflict dialog names before, after and each radio choice and carries transformed spans", () => {
    const el = editor(); el.program.profiles[0].days[1] = [slot("busy", "10:00", "14:00")];
    el._conflict = { id: "a", to: [1], days: [1], skip: [] };
    const tpl = el._conflictDialog();
    expect(attributes(tpl, "heading")).toEqual(["Already scheduled"]);
    expect(attributes(tpl, "aria-label")).toEqual(["Tuesday"]);
    expect(attributes(tpl, ".now")).toEqual([null, null]);
    const spans = attributes(tpl, ".spans");
    expect(spans[0].map((s: any) => [s.start, s.end])).toEqual([[600, 840]]);
    expect(spans[1].map((s: any) => [s.start, s.end])).toEqual([[360, 840]]);
    const markup = flat(tpl);
    for (const text of [">Before</span>", ">After</span>", ">Replace</button>", ">Do not copy this day</button>", ">Cancel</button>", ">Copy</button>"]) expect(markup).toContain(text);
    expect(attributes(tpl, "class")).toEqual(["on", ""]);
    el._conflict.skip = [1];
    expect(attributes(el._conflictDialog(), "class")).toEqual(["", "on"]);
    expect(attributes(el._conflictDialog(), "aria-checked")).toEqual([false, true]);
  });
  it("the radial handles expose their minute and formatted time for assistive technology", () => {
    const el = editor(); el.view = "radial";
    const tpl = el._radialOverlay();
    expect(attributes(tpl, "aria-valuenow")).toEqual([360, 720]);
    expect(attributes(tpl, "aria-valuetext")).toEqual(["6 am", "12 pm"]);
    expect(attributes(tpl, "aria-label").slice(1)).toEqual(["Boundary 6 am", "Boundary 12 pm"]);
    expect(flat(tpl)).toContain('style="left:85%;top:50%"');
    expect(flat(tpl)).toContain('style="left:50%;top:85%"');
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
