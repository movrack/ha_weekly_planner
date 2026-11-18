import { afterEach, describe, expect, it, vi } from "vitest";
import { nothing } from "lit";
import { flat, handlers } from "./helpers/tpl";

const unsub = vi.fn();
let push: ((d: unknown) => void) | undefined;
vi.mock("../planner", () => ({ subscribePlanner: (_h: unknown, fn: (d: unknown) => void) => { push = fn; return unsub; } }));
vi.mock("../time", () => ({ setTimeFormat: vi.fn() }));

import { WpProgramsPanel } from "../programs-panel";

const program = (id: string, extra: Record<string, unknown> = {}) => ({ id, name: `Prog ${id}`, enabled: true, icon: null, entities: [{ entity_id: "a.b" }], ...extra });
const data = (programs: unknown[], extra: Record<string, unknown> = {}) => ({ programs, can_edit: true, read_only: false, ...extra }) as never;
const make = (opts: { admin?: boolean; narrow?: boolean; data?: unknown } = {}) => {
  const p = new WpProgramsPanel() as any;
  p.hass = { language: "en", states: {}, user: { is_admin: opts.admin ?? true } };
  p.narrow = opts.narrow ?? false;
  p._data = opts.data;
  return p;
};

describe("programs panel", () => {
  it("tells a non-administrator that only administrators manage programs", () => {
    const out = flat(make({ admin: false, data: data([program("1")]) }).render());
    expect(out).toContain("Only administrators");
    expect(out).not.toContain("Prog 1");
  });

  it("waits for the data, and says read only when it cannot edit", () => {
    expect(flat(make().render())).toContain("…");
    expect(flat(make({ data: data([], { read_only: true }) }).render())).toContain("Read only");
    expect(flat(make({ data: data([], { can_edit: false }) }).render())).toContain("Read only");
  });

  it("lists the programs with their device count, a paused one marked, and a way to create one", () => {
    const out = flat(make({ data: data([program("1"), program("2", { enabled: false, entities: [{}, {}] })]) }).render());
    expect(out).toContain("Prog 1");
    expect(out).toContain("1 device");
    expect(out).not.toContain("1 devices");
    expect(out).toContain("2 devices · Paused");
    expect(out).toContain("New program");
    expect(out).toContain("Choose a program");
  });

  it("says there is no program yet but still offers to create one", () => {
    const out = flat(make({ data: data([]) }).render());
    expect(out).toContain("No program yet.");
    expect(out).toContain("New program");
  });

  it("opens a program and the form of a new one", () => {
    const p = make({ data: data([program("1")]) });
    const rows = handlers(p._list(p._data.programs)).filter((h) => h.event === "click");
    rows[1].fn();  // rows[0] is the "Priority order" button
    expect(p._selected).toBe("1");
    expect(flat(p.render())).toContain("wp-program-editor");
    rows[2].fn();
    expect(p._selected).toBe("new");
  });

  it("falls back to the hint when the selected program no longer exists", () => {
    const p = make({ data: data([program("1")]) });
    p._selected = "gone";
    expect(flat(p._editor(p._data))).toContain("Choose a program");
  });

  it("goes back to the list after a save and says so, a new program included", () => {
    const p = make({ data: data([program("1")]) });
    p._selected = "new";
    const stop = vi.fn();
    p._saved({ detail: program("2"), stopPropagation: stop });
    expect(stop).toHaveBeenCalled();
    expect(p._selected).toBeNull();
    expect(p._data.programs.map((x: any) => x.id)).toEqual(["1", "2"]);
    expect(flat(p.render())).toContain("“Prog 2” saved.");
    p._saved({ detail: program("2", { name: "Renamed" }), stopPropagation: stop });
    expect(p._data.programs.filter((x: any) => x.id === "2")).toHaveLength(1);
    p._open("1");
    expect(p._notice).toBe("");
  });

  it("saving before any data arrived only goes back", () => {
    const p = make();
    p._selected = "new";
    p._saved({ detail: program("2"), stopPropagation: vi.fn() });
    expect(p._selected).toBeNull();
    expect(p._data).toBeUndefined();
  });

  it("goes back to the list after a delete and names the program", () => {
    const p = make({ data: data([program("1"), program("2")]) });
    p._selected = "1";
    p._deleted({ detail: "1", stopPropagation: vi.fn() });
    expect(p._selected).toBeNull();
    expect(p._data.programs.map((x: any) => x.id)).toEqual(["2"]);
    expect(p._notice).toBe("“Prog 1” deleted.");
    const none = make();
    none._deleted({ detail: "1", stopPropagation: vi.fn() });
    expect(none._selected).toBeNull();
    expect(none._notice).toBe("");
  });

  it("on a narrow screen shows the list, then the editor with a way back", () => {
    const p = make({ narrow: true, data: data([program("1")]) });
    let out = flat(p.render());
    expect(out).toContain("ha-menu-button");
    expect(out).toContain("Prog 1");
    expect(out).not.toContain("Back to the programs");
    p._open("1");
    out = flat(p.render());
    expect(out).toContain("Back to the programs");
    expect(out).toContain("wp-program-editor");
    expect(out).not.toContain("class=\"list\"");
    p._notice = "x";
    handlers(p.render()).find((h) => h.before.includes("class=\"back\""))!.fn();
    expect(p._selected).toBeNull();
    expect(p._notice).toBe("");
  });

  it("subscribes once when connected and unsubscribes when removed", () => {
    const p = make();
    Object.defineProperty(p, "isConnected", { value: true });
    p.updated();
    p.updated();
    push?.(data([program("1")]));
    expect(p._data.programs).toHaveLength(1);
    p.disconnectedCallback();
    expect(unsub).toHaveBeenCalledTimes(1);
    expect(p._unsub).toBeUndefined();
  });

  it("renders nothing without hass", () => {
    const p = new WpProgramsPanel() as any;
    expect(p.render()).toBe(nothing);
  });
});

describe("programs panel: priority order", () => {
  afterEach(() => vi.useRealTimers());
  const shared = (id: string, priority: number, extra: Record<string, unknown> = {}) => program(id, { priority, revision: 1, entities: [{ entity_id: "light.a" }], ...extra });
  const open = (programs: unknown[], callWS: unknown = vi.fn(async () => ({ programs: [] }))) => {
    const p = make({ data: data(programs) });
    p.hass.callWS = callWS;
    p._data.programs = programs;
    p._openPriorities();
    return p;
  };
  const order = (p: any, ids: string[]) => handlers(p._priorities(p._data)).find((h) => h.event === "priority-change")!.fn({ stopPropagation() {}, detail: ids });

  it("offers a Priority order button at the top of the list that opens its own screen with a back button", () => {
    const p = make({ data: data([program("1")]) });
    expect(flat(p._list(p._data.programs))).toContain("mdi:swap-vertical");
    handlers(p._list(p._data.programs)).filter((h) => h.event === "click")[0].fn();
    expect(p._screen).toBe("priorities");
    const out = flat(p.render());
    expect(out).toContain("Priority order");
    expect(out).toContain("Back to the programs");
    expect(out).not.toContain("class=\"list\"");
    handlers(p.render()).find((h) => h.before.includes("class=\"back\""))!.fn();
    expect(p._screen).toBe("programs");
  });

  it("shows one block per competing group, then the programs without competition", () => {
    const p = open([shared("1", 1), shared("2", 2), program("3", { entities: [{ entity_id: "light.z" }] })]);
    const out = flat(p._priorities(p._data));
    expect(out.match(/<wp-priority-list/g)).toHaveLength(1);
    expect(out).toContain("Alone on their devices");
    expect(out).toContain("Prog 3");
    expect(out).toContain("the top one wins.");
  });

  it("says so when no program shares a device", () => {
    const out = flat(open([program("1")])._priorities(data([program("1")])));
    expect(out).toContain("No program shares a device.");
    expect(out).not.toContain("<wp-priority-list");
  });

  it("saves the whole group at once on drop, shows it at once and offers to undo", async () => {
    vi.useFakeTimers();
    const callWS = vi.fn(async () => ({ programs: [{ id: "2", revision: 2, priority: 1 }, { id: "1", revision: 2, priority: 2 }] }));
    const p = open([shared("1", 1), shared("2", 2)], callWS);
    order(p, ["2", "1"]);
    expect(p._data.programs.map((x: any) => [x.id, x.priority])).toEqual([["1", 2], ["2", 1]]);
    await vi.advanceTimersByTimeAsync(0);
    expect(callWS).toHaveBeenCalledWith({ type: "weekly_planner/program/priorities", order: [{ id: "2", revision: 1 }, { id: "1", revision: 1 }] });
    expect(p._data.programs.map((x: any) => x.revision)).toEqual([2, 2]);
    const out = flat(p._priorities(p._data));
    expect(out).toContain("Order saved");
    expect(out).toContain("Put it back");
    expect(out).not.toContain("role=\"status\"");  // the banner is silent: the permanent region speaks
    await vi.advanceTimersByTimeAsync(60000);
    expect(p._undo).toEqual(["1", "2"]);  // no timer: it stays until the next move, leaving or its button
  });

  it("says a move in one permanent live region and highlights the moved card for 1.5 seconds", async () => {
    vi.useFakeTimers();
    const p = open([shared("1", 1), shared("2", 2)]);
    expect(flat(p.render())).toContain("role=\"status\" aria-live=\"polite\"></span>");
    const stop = vi.fn();
    handlers(p._priorities(p._data)).find((h) => h.event === "priority-moved")!.fn({ stopPropagation: stop, detail: { id: "2", text: "Prog 2: rank 1 of 2" } });
    expect(stop).toHaveBeenCalled();
    expect(flat(p.render())).toContain("aria-live=\"polite\">Prog 2: rank 1 of 2</span>");
    expect(p._flash).toBe("2");
    await vi.advanceTimersByTimeAsync(1500);
    expect(p._flash).toBe("");
  });

  it("says the order is restored after Undo and puts the focus on the heading of the group", async () => {
    const p = open([shared("1", 1), shared("2", 2)]);
    const focus = vi.fn();
    p.renderRoot = { querySelector: vi.fn(() => ({ focus })) };
    Object.defineProperty(p, "updateComplete", { value: Promise.resolve(true) });  // not connected: no render cycle to wait for
    order(p, ["2", "1"]);
    await Promise.resolve(); await Promise.resolve();
    await p._undoOrder();
    await Promise.resolve();
    expect(p._said).toBe("Order restored");
    expect(p.renderRoot.querySelector).toHaveBeenCalledWith(".prio h3[data-members~=\"1\"]");
    expect(focus).toHaveBeenCalled();
  });

  it("moves the focus to the screen title when opened and to the entry button on Back", async () => {
    const p = make({ data: data([program("1")]) });
    const asked: string[] = [];
    p.renderRoot = { querySelector: (s: string) => { asked.push(s); return { focus() {} }; } };
    Object.defineProperty(p, "updateComplete", { value: Promise.resolve(true) });
    p._openPriorities();
    await Promise.resolve();
    p._leavePriorities();
    await Promise.resolve();
    expect(asked).toEqual([".prio h2", ".prio-open"]);
  });

  it("closes the priority screen with Done, at the end of the screen, and keeps its title only for screen readers", () => {
    const p = make({ data: data([program("1")]) });
    p._openPriorities();
    const out = flat(p._priorities(p._data));
    expect(out).toContain('<h2 class="sr"');
    expect(out).toContain(">Done</button>");
    handlers(p._priorities(p._data)).find((h) => h.event === "click" && h.before.includes('class="done"'))!.fn();
    expect(p._screen).toBe("programs");
  });

  it("names the priority screen in the header and describes the entry button", () => {
    const p = make({ data: data([program("1")]) });
    expect(flat(p._list(p._data.programs))).toContain("Who wins when two programs drive the same device");
    p._screen = "priorities";
    expect(flat(p.render())).toContain("<h1>Priority order</h1>");
  });

  it("undoes through the same command with the order before the change", async () => {
    const callWS = vi.fn(async (_m: unknown) => ({ programs: [] }));
    const p = open([shared("1", 1), shared("2", 2)], callWS);
    order(p, ["2", "1"]);
    await Promise.resolve(); await Promise.resolve();
    expect(p._undo).toEqual(["1", "2"]);
    handlers(p._priorities(p._data)).find((h) => h.before.includes("class=\"link\""))!.fn();
    await Promise.resolve(); await Promise.resolve();
    expect((callWS.mock.calls[callWS.mock.calls.length - 1][0] as any).order.map((o: any) => o.id)).toEqual(["1", "2"]);
    expect(p._undo).toBeUndefined();
    p._undoOrder();  // nothing to undo any more
    expect(callWS).toHaveBeenCalledTimes(2);
  });

  it.each([
    [{ code: "conflict" }, "Modified elsewhere. Order restored."],
    [new Error("boom"), "Order not saved. Previous order restored."],
  ])("restores the order and says why when the server refuses (%j)", async (error, message) => {
    const p = open([shared("1", 1), shared("2", 2)], vi.fn(async () => { throw error; }));
    p._undo = ["x"];
    p._said = "moved";
    order(p, ["2", "1"]);
    await Promise.resolve(); await Promise.resolve();
    expect(p._data.programs.map((x: any) => [x.id, x.priority])).toEqual([["1", 1], ["2", 2]]);
    expect(p._orderError).toBe(message);
    expect(p._undo).toBeUndefined();
    expect(p._said).toBe("");
    expect(flat(p._priorities(p._data))).toContain(message);
  });

  it("does nothing without data, and leaving the screen drops the banner and the message", () => {
    const p = make();
    p.hass.callWS = vi.fn();
    void p._saveOrder(["1"]);
    expect(p.hass.callWS).not.toHaveBeenCalled();
    p._undo = ["1"]; p._orderError = "x"; p._screen = "priorities";
    p._leavePriorities();
    expect([p._undo, p._orderError, p._screen]).toEqual([undefined, "", "programs"]);
  });
});
