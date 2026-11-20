import { beforeEach, describe, expect, it, vi } from "vitest";
import { flat, handlers } from "./helpers/tpl";
import { WpPriorityList } from "../components/priority-list";

const program = (id: string, extra: Record<string, unknown> = {}) =>
  ({ id, name: `Prog ${id}`, enabled: true, entities: [{ entity_id: "light.a" }, { entity_id: `light.kitchen_${id}` }], ...extra }) as any;

function make(programs = [program("1"), program("2"), program("3")], extra: Record<string, unknown> = {}) {
  const list = new WpPriorityList() as any;
  const events: any[] = [];
  const moved: any[] = [];
  list.dispatchEvent = (ev: any) => { (ev.type === "priority-moved" ? moved : events).push(ev); return true; };
  list.hass = { language: "en", states: { "light.a": { attributes: { friendly_name: "Lamp" } } } };
  list.programs = programs;
  Object.assign(list, extra);
  const capture = vi.fn();
  const rows = (middles: Record<string, number>) => Object.entries(middles).map(([id, mid]) => ({ dataset: { id }, getBoundingClientRect: () => ({ top: mid - 10, height: 20 }), querySelector: () => null }));
  list.renderRoot = { querySelector: () => ({ setPointerCapture: capture }), querySelectorAll: () => [] };
  return { list, events, moved, capture, rows };
}
beforeEach(() => { (globalThis as any).CustomEvent ??= class { type: string; detail: unknown; constructor(t: string, i: any) { this.type = t; this.detail = i?.detail; } }; });

describe("priority list", () => {
  it("shows the rank, the name and only the other devices of the program, the shared one being in the group heading", () => {
    const out = flat(make().list.render());
    expect(out).toContain("Prog 1");
    expect(out).toContain(">1</span>");
    expect(out).toContain("also: Kitchen 1");
    expect(out).not.toContain("Lamp");
  });

  it("gives a screen reader the rank before the name", () => {
    expect(flat(make().list.render())).toContain("Rank 2:");
  });

  it("tags the rows whose order is not saved and highlights the card just moved", () => {
    const out = flat(make(undefined, { unsaved: ["2"], flashId: "3" }).list.render());
    expect(out.match(/not saved/g)).toHaveLength(1);
    expect(out).toMatch(/flash" data-id=3/);
  });

  it("greys a paused program, still movable, and marks the program being edited", () => {
    const { list } = make([program("1", { enabled: false }), program("2")], { currentId: "2" });
    const out = flat(list.render());
    expect(out).toContain("prow off");
    expect(out).toContain("Paused");
    expect(out).toContain("This program");
    expect(handlers(list.render()).filter((h) => h.event === "click")).toHaveLength(4);
  });

  it("moves a program with the buttons and says where it went, with the total", () => {
    const { list, events, moved } = make();
    const clicks = handlers(list.render()).filter((h) => h.event === "click");
    clicks[3].fn();  // second row, up is [2], down is [3]
    expect(events[events.length - 1].detail).toEqual(["1", "3", "2"]);
    clicks[2].fn();
    expect(events[events.length - 1].detail).toEqual(["2", "1", "3"]);
    expect(flat(list.render())).toContain("Prog 2: rank 1 of 3");
    expect(moved[moved.length - 1].detail).toEqual({ id: "2", text: "Prog 2: rank 1 of 3" });
  });

  it("forgets its announcement when the programs are replaced from outside, and keeps it for its own move", () => {
    const { list } = make();
    list._said = "old";
    list.willUpdate(new Map([["programs", []]]));
    expect(list._said).toBe("");
    list._said = "new"; list._own = true;
    list.willUpdate(new Map([["programs", []]]));
    expect(list._said).toBe("new");
  });

  it("writes no region of its own when the parent has one", () => {
    expect(flat(make().list.render())).toContain("role=\"status\"");
    expect(flat(make(undefined, { quiet: true }).list.render())).not.toContain("role=\"status\"");
  });

  it("offers neither up on the first nor down on the last, and nothing when disabled", () => {
    const { list, events } = make(undefined, { disabled: true });
    handlers(list.render()).filter((h) => h.event === "click").forEach((h) => h.fn());
    expect(events).toHaveLength(0);
    const normal = make().list;
    normal._step("1", -1);
    normal._step("3", 1);
    expect(flat(normal.render()).match(/disabled/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("drags by the handle: the row follows the pointer and the order is told on release", () => {
    const { list, events, capture, rows } = make();
    const down = handlers(list.render()).find((h) => h.event === "pointerdown")!;
    const prevent = vi.fn();
    down.fn({ preventDefault: prevent, pointerId: 7, button: 0 });
    expect(prevent).toHaveBeenCalled();
    expect(capture).toHaveBeenCalledWith(7);
    list.renderRoot.querySelectorAll = () => rows({ "1": 10, "2": 40, "3": 70 });
    const move = handlers(list.render()).find((h) => h.event === "pointermove")!;
    move.fn({ clientY: 55 });  // between the second and third rows
    expect(list._drag.order).toEqual(["2", "1", "3"]);
    move.fn({ clientY: 100 });
    expect(list._drag.order).toEqual(["2", "3", "1"]);
    expect(flat(list.render())).toContain("dragging");
    handlers(list.render()).find((h) => h.event === "pointerup")!.fn();
    expect(events[events.length - 1].detail).toEqual(["2", "3", "1"]);
    expect(list._drag).toBeUndefined();
  });

  it("tells nothing when the row is dropped where it was, or the drag is cancelled", () => {
    const { list, events, rows } = make();
    handlers(list.render()).find((h) => h.event === "pointerdown")!.fn({ preventDefault() {}, pointerId: 1 });
    list.renderRoot.querySelectorAll = () => rows({ "2": 40, "3": 70 });
    const hs = handlers(list.render());
    hs.find((h) => h.event === "pointermove")!.fn({ clientY: 0 });
    hs.find((h) => h.event === "pointerup")!.fn();
    expect(events).toHaveLength(0);
    handlers(list.render()).find((h) => h.event === "pointerdown")!.fn({ preventDefault() {}, pointerId: 1 });
    hs.find((h) => h.event === "pointercancel")!.fn();
    expect(list._drag).toBeUndefined();
    hs.find((h) => h.event === "pointermove")!.fn({ clientY: 0 });  // no drag in progress
    expect(list._drag).toBeUndefined();
  });

  it("ignores a drag started on a disabled list or with a secondary button", () => {
    const { list } = make(undefined, { disabled: true });
    handlers(list.render()).find((h) => h.event === "pointerdown")!.fn({ preventDefault() {}, pointerId: 1 });
    expect(list._drag).toBeUndefined();
    const other = make().list;
    handlers(other.render()).find((h) => h.event === "pointerdown")!.fn({ preventDefault() {}, pointerId: 1, button: 2 });
    expect(other._drag).toBeUndefined();
  });

  it("keeps the focus on the button just used, or its twin at the end of the list", () => {
    const { list } = make();
    const focus = (name: string) => vi.fn(() => name);
    const buttons: Record<string, any> = { up: { disabled: false, focus: focus("up") }, down: { disabled: true, focus: focus("down") } };
    const row = { dataset: { id: "3" }, querySelector: (sel: string) => buttons[sel.slice(1)] };
    list.renderRoot.querySelectorAll = () => [row];
    list._focus = { id: "3", button: "down" };
    list.updated();
    expect(buttons.up.focus).toHaveBeenCalled();
    expect(list._focus).toBeUndefined();
    list._focus = { id: "3", button: "up" };
    list.updated();
    expect(buttons.up.focus).toHaveBeenCalledTimes(2);
    list.updated();
    expect(buttons.up.focus).toHaveBeenCalledTimes(2);
  });
});
