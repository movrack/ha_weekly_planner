import { afterEach, describe, expect, it, vi } from "vitest";
import { nothing } from "lit";
import { bindings, flat, handlers } from "./helpers/tpl";

const unsub = vi.fn();
let push: ((d: unknown) => void) | undefined;
let ids = 0;
vi.mock("../planner", () => ({ subscribePlanner: (_h: unknown, fn: (d: unknown) => void) => { push = fn; return unsub; }, newId: () => `id${++ids}` }));
vi.mock("../time", () => ({ setTimeFormat: vi.fn() }));

import { WpProgramsPanel } from "../programs-panel";

const program = (id: string, extra: Record<string, unknown> = {}) => ({ id, name: `Prog ${id}`, enabled: true, icon: null, entities: [{ entity_id: "a.b" }], profiles: [], ...extra });
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
    expect(out).toContain('<h2 class="pane-title">Summary</h2>');   // nothing is open: the pane is the overview
  });

  it("says there is no program yet but still offers to create one", () => {
    const out = flat(make({ data: data([]) }).render());
    expect(out).toContain("No program yet.");
    expect(out).toContain("New program");
  });

  it("opens a program and the form of a new one", () => {
    const p = make({ data: data([program("1")]) });
    const click = (mark: string) => handlers(p._list(p._data.programs)).find((h) => h.event === "click" && h.before.slice(-300).includes(mark))!;
    click("aria-current").fn();
    expect(p._selected).toBe("1");
    expect(flat(p.render())).toContain("wp-program-editor");
    click('class="row act new').fn();
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

  it("offers a Priority order button in the actions that opens its own screen with a back button", () => {
    const p = make({ data: data([program("1")]) });
    expect(flat(p._list(p._data.programs))).toContain("mdi:swap-vertical");
    handlers(p._list(p._data.programs)).find((h) => h.event === "click" && h.before.slice(-200).includes("prio-open"))!.fn();
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

describe("programs panel: list sections", () => {
  it("puts the actions (new program, duplicate, priority order) under an Actions label and the programs under a Program list label", () => {
    const out = flat(make({ data: data([program("1")]) })._list([program("1")] as never));
    const order = ["Actions", "New program", "Duplicate a program", "Priority order", "Program list", "Prog 1"].map((text) => out.indexOf(text));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(out).toContain('<h2 class="grp" id="panel-actions">Actions</h2>');
    expect(out).toContain('<h2 class="grp" id="panel-programs">Program list</h2>');
  });

  it("offers no duplicate while there is no program, but still the other actions", () => {
    const out = flat(make({ data: data([]) })._list([]));
    expect(out).toContain("Priority order");
    expect(out).toContain("New program");
    expect(out).not.toContain("Duplicate a program");
  });
});

describe("programs panel: duplicate a program", () => {
  const two = () => data([program("1"), program("2", { name: "Salon", revision: 3, created_at: "x", profiles: [{ id: "h", name: "Home", days: [[{ id: "s", label: "comfort" }], [], [], [], [], [], []] }] })]);
  const open = (p: any) => { p._openDuplicate(); return p; };

  it("opens its own screen with every program to choose from, nothing chosen and Duplicate disabled", () => {
    const p = open(make({ data: two() }));
    const out = flat(p.render());
    expect(p._screen).toBe("duplicate");
    expect(out).toContain("Choose the program to copy. The copy is added at the end of the list.");
    expect(out).toContain('role="radiogroup"');
    expect(out).toContain("Prog 1"); expect(out).toContain("Salon");
    expect(out).toContain('aria-checked=false'); expect(out).not.toContain('aria-checked=true');
    expect(bindings(p._duplicateScreen(p._data), "?disabled")).toEqual([true]);
    expect(out).not.toContain("Actions");   // the list screen is replaced
  });

  it("choosing a program selects it and enables Duplicate; the back arrow and Cancel return to the list", () => {
    const p = open(make({ data: two() }));
    handlers(p._duplicateScreen(p._data)).filter((h) => h.event === "click")[1].fn();
    expect(p._dupId).toBe("2");
    expect(flat(p._duplicateScreen(p._data))).toContain("aria-checked=true");
    expect(bindings(p._duplicateScreen(p._data), "?disabled")).toEqual([false]);
    p._leaveDuplicate();
    expect(p._screen).toBe("programs"); expect(p._dupId).toBe("");
    expect(flat(p.render())).toContain("Program list");
  });

  it("saves the copy as a new program named 'Copy of <name>', with its own ids, and shows it at the end of the list", async () => {
    const p = open(make({ data: two() }));
    const saved = { ...program("9", { name: "Copy of Salon" }) };
    p.hass.callWS = vi.fn(async () => ({ program: saved }));
    p._dupId = "2";
    await p._duplicate();
    const sent = p.hass.callWS.mock.calls[0][0];
    expect(sent.type).toBe("weekly_planner/program/save");
    expect(sent.program).toMatchObject({ name: "Copy of Salon", revision: 0, entities: [{ entity_id: "a.b" }] });
    expect(sent.program).not.toHaveProperty("id");
    expect(sent.program).not.toHaveProperty("created_at");
    expect(sent.program.profiles[0].id).not.toBe("h");
    expect(sent.program.profiles[0].days[0][0].id).not.toBe("s");
    expect(p._data.programs.map((x: any) => x.id)).toEqual(["1", "2", "9"]);
    expect(p._screen).toBe("programs"); expect(p._dupBusy).toBe(false);
    expect(p._notice).toBe("“Copy of Salon” was added at the end of the list.");
    expect(flat(p.render())).toContain("Copy of Salon");
  });

  it("numbers the copy when the name is already taken", async () => {
    const p = open(make({ data: data([program("1", { name: "Salon" }), program("2", { name: "Copy of Salon" })]) }));
    p.hass.callWS = vi.fn(async (m: any) => ({ program: { ...m.program, id: "9" } }));
    p._dupId = "1";
    await p._duplicate();
    expect(p.hass.callWS.mock.calls[0][0].program.name).toBe("Copy of Salon 2");
  });

  it("stays on the screen with the error when the save fails, and does nothing without a choice or while busy", async () => {
    const p = open(make({ data: two() }));
    p.hass.callWS = vi.fn(async () => { throw new Error("Name already used"); });
    await p._duplicate();
    expect(p.hass.callWS).not.toHaveBeenCalled();
    p._dupId = "1";
    await p._duplicate();
    expect(p._screen).toBe("duplicate");
    expect(p._dupError).toBe("Error: Name already used");
    expect(flat(p.render())).toContain("Error: Name already used");
    expect(p._data.programs).toHaveLength(2);
    expect(p._dupBusy).toBe(false);
    p._dupBusy = true; p.hass.callWS.mockClear();
    await p._duplicate();
    expect(p.hass.callWS).not.toHaveBeenCalled();
  });
});

describe("programs panel: sort and filter", () => {
  const set = () => data([
    program("1", { name: "Volet salon", priority: 2, area: "salon", entities: [{ entity_id: "cover.salon" }] }),
    program("2", { name: "Chauffage bureau", priority: 1, area: "bureau", entities: [{ entity_id: "climate.bureau" }] }),
    program("3", { name: "Volet bureau", priority: 1, area: "bureau", entities: [{ entity_id: "cover.bureau" }] }),
  ]);
  const names = (p: any) => {
    const out = flat(p._list(p._data.programs));
    return ["Volet salon", "Chauffage bureau", "Volet bureau"].filter((n) => out.includes(n)).sort((a, b) => out.indexOf(a) - out.indexOf(b));
  };
  const pickSort = (p: any, index: number) =>
    handlers(p._sortDialog()).filter((h) => h.event === "change" && h.before.slice(-260).includes('name="sort"'))[index].fn();
  const pickFilter = (p: any, index: number) =>
    handlers(p._filterDialog(p._data)).filter((h) => h.event === "change" && h.before.slice(-260).includes('type="checkbox"'))[index].fn();

  it("has a Sort button and a Filter button next to the Program list label, only when there are programs", () => {
    const p = make({ data: set() });
    const out = flat(p._list(p._data.programs));
    expect(out).toContain('class="link sort-open"'); expect(out).toContain('class="link filter-open"');
    expect(out).toContain("mdi:sort"); expect(out).toContain("mdi:filter-variant");
    expect(out).not.toContain("Filter and sort");
    const none = flat(make({ data: data([]) })._list([]));
    expect(none).not.toContain("sort-open"); expect(none).not.toContain("filter-open");
  });

  it("opens the sort and the filters in two separate windows", () => {
    const p = make({ data: set() });
    expect(flat(p.render())).not.toContain("wp-dialog");
    p._openSort();
    let out = flat(p.render());
    expect(out).toContain("wp-dialog");
    for (const text of ["Sort by", "Creation order", "Name", "Priority (1 first)"]) expect(out).toContain(text);
    for (const text of ["Type", "Room", "Device", "programs shown"]) expect(out).not.toContain(text);
    p._openFilter();
    out = flat(p.render());
    for (const text of ["Type", "Room", "Device", "3 of 3 programs shown", "cover", "climate"]) expect(out).toContain(text);
    for (const text of ["Creation order", "Priority (1 first)"]) expect(out).not.toContain(text);
  });

  it("does not offer a filter that has a single choice", () => {
    const one = data([program("1")]);
    expect(flat(make({ data: one })._filterDialog(one))).not.toContain("acc-types");
  });

  it("sorts by name or by priority, and creation order is the default", () => {
    const p = make({ data: set() });
    expect(names(p)).toEqual(["Volet salon", "Chauffage bureau", "Volet bureau"]);
    pickSort(p, 1);
    expect(p._view.sort).toBe("name");
    expect(names(p)).toEqual(["Chauffage bureau", "Volet bureau", "Volet salon"]);
    expect(flat(p._list(p._data.programs))).toContain("Sort · Name");
    pickSort(p, 2);
    expect(names(p)).toEqual(["Chauffage bureau", "Volet bureau", "Volet salon"]);
    pickSort(p, 0);
    expect(names(p)).toEqual(["Volet salon", "Chauffage bureau", "Volet bureau"]);
    expect(flat(p._list(p._data.programs))).not.toContain("Sort ·");
  });

  it("filters the list by type, room and device, says how many are shown, and counts the filters on the button", () => {
    const p = make({ data: set() });
    p._toggleFilter("types", "cover");
    expect(names(p)).toEqual(["Volet salon", "Volet bureau"]);
    expect(flat(p._list(p._data.programs))).toContain("2 of 3 programs shown");
    expect(flat(p._list(p._data.programs))).toContain("Filter · 1");
    p._toggleFilter("rooms", "bureau");
    expect(names(p)).toEqual(["Volet bureau"]);
    p._toggleFilter("devices", "cover.bureau");
    expect(flat(p._list(p._data.programs))).toContain("Filter · 3");
    p._toggleFilter("types", "cover");
    expect(p._view.types).toEqual([]);
  });

  it("offers the choices of each filter with their program counts, as checkboxes that toggle", () => {
    const p = make({ data: set() });
    expect(flat(p._filterDialog(p._data))).toContain(">Room<");
    pickFilter(p, 0);          // first Type choice, sorted by label: climate
    expect(p._view.types).toEqual(["climate"]);
    expect(flat(p._filterDialog(p._data))).toContain("1 of 3 programs shown");
    pickFilter(p, 0);
    expect(p._view.types).toEqual([]);
  });

  it("shows each filter as a section of an accordion: opening one closes the others", () => {
    const p = make({ data: set() });
    const head = (kind: string) => handlers(p._filterDialog(p._data)).find((h) => h.event === "click" && h.before.includes(`aria-controls=acc-${kind}`) || h.event === "click" && h.before.includes(`aria-controls="acc-${kind}"`))!;
    const expanded = () => bindings(p._filterDialog(p._data), "aria-expanded");
    p._openFilter();
    expect(expanded()).toEqual([false, false, false]);         // Type, Room, Device: all closed at first
    expect(flat(p._filterDialog(p._data))).toContain("<h3 class=\"acc-h\">");
    head("types").fn();
    expect(p._facet).toBe("types");
    expect(expanded()).toEqual([true, false, false]);
    head("rooms").fn();                                        // opening Room closes Type
    expect(expanded()).toEqual([false, true, false]);
    head("rooms").fn();                                        // the open one closes again
    expect(expanded()).toEqual([false, false, false]);
    head("devices").fn(); p._openFilter();                     // reopening the window starts closed
    expect(p._facet).toBe("");
  });

  it("tells on each section header how many filters of it are on", () => {
    const p = make({ data: set() });
    const out = () => flat(p._filterDialog(p._data));
    expect(out()).toContain("<span>Type</span>");
    p._toggleFilter("types", "cover"); p._toggleFilter("rooms", "bureau"); p._toggleFilter("rooms", "salon");
    expect(out()).toContain("<span>Type · 1</span>");
    expect(out()).toContain("<span>Room · 2</span>");
    expect(out()).toContain("<span>Device</span>");
  });

  it("says when nothing matches", () => {
    const p = make({ data: set() });
    p._toggleFilter("types", "climate"); p._toggleFilter("rooms", "salon");
    expect(flat(p._list(p._data.programs))).toContain("No program matches the filter.");
  });

  it("Reset clears the filters and keeps the sort that was chosen", () => {
    const p = make({ data: set() });
    p._setSort("priority");
    p._toggleFilter("types", "cover"); p._toggleFilter("rooms", "bureau"); p._toggleFilter("devices", "cover.bureau");
    handlers(p._list(p._data.programs)).find((h) => h.event === "click" && h.before.includes("programs shown"))!.fn();
    expect(p._view).toEqual({ sort: "priority", types: [], rooms: [], devices: [] });
    expect(names(p)).toEqual(["Chauffage bureau", "Volet bureau", "Volet salon"]);
    p._toggleFilter("types", "cover");
    expect(bindings(p._filterDialog(p._data), "?disabled")).toEqual([false]);
    p._resetFilters();
    expect(p._view.sort).toBe("priority");
    expect(bindings(p._filterDialog(p._data), "?disabled")).toEqual([true]);
  });

  it("closes a window through the dialog itself, or at once when it is not there", () => {
    const p = make({ data: set() });
    const close = vi.fn();
    p.renderRoot = { querySelector: () => ({ close }) };
    p._closeDialog();
    expect(close).toHaveBeenCalledOnce();
    p.renderRoot = { querySelector: () => null };
    p._openSort(); p._closeDialog();
    expect(p._dialog).toBe("");
  });

  it("uses the chosen sort on the duplicate screen too", () => {
    const p = make({ data: set() });
    p._setSort("name");
    p._openDuplicate();
    const out = flat(p._duplicateScreen(p._data));
    expect(out.indexOf("Chauffage bureau")).toBeLessThan(out.indexOf("Volet salon"));
  });
});

describe("programs panel: overview (Aperçu)", () => {
  const set = () => data([
    program("1", { name: "Volet salon", priority: 2, entities: [{ entity_id: "cover.salon" }] }),
    program("2", { name: "Chauffage bureau", priority: 1, entities: [{ entity_id: "climate.bureau" }] }),
    program("3", { name: "Volet bureau", priority: 1, entities: [{ entity_id: "cover.bureau" }] }),
  ]);
  const props = (p: any) => ({ programs: bindings(p._overview(p._data.programs), ".programs")[0], order: bindings(p._overview(p._data.programs), ".order")[0] });
  const radios = (p: any) => handlers(p._list(p._data.programs)).filter((h) => h.event === "click" && h.before.slice(-260).includes('role="radio"'));

  it("on a narrow screen, a List / Overview toggle sits next to the Program list label, List first", () => {
    const p = make({ narrow: true, data: set() });
    const out = flat(p._list(p._data.programs));
    expect(out).toContain('role="radiogroup"');
    expect(out.indexOf(">List<")).toBeLessThan(out.indexOf(">Summary<"));
    expect(bindings(p._list(p._data.programs), "aria-checked")).toEqual([true, false]);
    const fr = make({ narrow: true, data: set() }); fr.hass.language = "fr";
    expect(flat(fr._list(fr._data.programs))).toContain(">Aperçu<");
  });

  it("has no toggle on a wide screen (the overview already fills the right column), nor without programs", () => {
    const wide = make({ data: set() });
    expect(flat(wide._list(wide._data.programs))).not.toContain("radiogroup");
    expect(flat(make({ narrow: true, data: data([]) })._list([]))).not.toContain("radiogroup");
  });

  it("switching to Overview replaces the program rows by the card and keeps the actions, the sort and the filter", () => {
    const p = make({ narrow: true, data: set() });
    expect(flat(p._list(p._data.programs))).toContain("Volet salon");
    radios(p)[1].fn();
    expect(p._listMode).toBe("overview");
    const out = flat(p._list(p._data.programs));
    expect(out).toContain("wp-overview");
    expect(out).not.toContain("Volet salon");
    for (const text of ["Actions", "New program", "Duplicate a program", "Priority order", "Program list", "sort-open", "filter-open"]) expect(out).toContain(text);
    expect(bindings(p._list(p._data.programs), "aria-checked")).toEqual([false, true]);
    radios(p)[0].fn();
    expect(flat(p._list(p._data.programs))).toContain("Volet salon");
    expect(flat(p._list(p._data.programs))).not.toContain("wp-overview");
  });

  it("the whole screen stays the list screen: no separate overview screen, no Summary action", () => {
    const p = make({ narrow: true, data: set() });
    expect(flat(p._list(p._data.programs))).not.toContain("overview-open");
    radios(p)[1].fn();
    const out = flat(p.render());
    expect(p._screen).toBe("programs");
    expect(out).toContain("Programs"); expect(out).not.toContain("Back to the programs");
  });

  it("shows every program when no filter is on, in the order of the list", () => {
    const p = make({ data: set() });
    expect(props(p)).toEqual({ programs: undefined, order: ["1", "2", "3"] });
    p._setSort("priority");
    expect(props(p)).toEqual({ programs: undefined, order: ["2", "3", "1"] });
  });

  it("follows the filter of the list, with the same order", () => {
    const p = make({ data: set() });
    p._setSort("name"); p._toggleFilter("types", "cover");
    expect(props(p)).toEqual({ programs: ["3", "1"], order: ["3", "1"] });
    p._toggleFilter("rooms", "nowhere");
    expect(props(p)).toEqual({ programs: [], order: [] });
  });

  it("fills the right column on a wide screen when no program is selected, titled Summary; not once one is selected", () => {
    const p = make({ data: set() });
    const out = flat(p._editor(p._data));
    expect(out).toContain('<h2 class="pane-title">Summary</h2>'); expect(out).toContain("wp-overview");
    expect(out).not.toContain("Choose a program");
    p._selected = "1";
    expect(flat(p._editor(p._data))).not.toContain("wp-overview");
    expect(flat(make({ data: data([]) })._editor(data([])))).not.toContain("wp-overview");
  });

  it("titles the pane Settings above the editor of a program or of a new one, and says Aperçu / Réglages in French", () => {
    const p = make({ data: set() });
    p._selected = "1";
    let out = flat(p._editor(p._data));
    expect(out).toContain('<h2 class="pane-title">Settings</h2>'); expect(out).toContain("wp-program-editor");
    expect(out.indexOf("pane-title")).toBeLessThan(out.indexOf("wp-program-editor"));
    p._selected = "new";
    expect(flat(p._editor(p._data))).toContain("Settings");
    const fr = make({ data: set() }); fr.hass.language = "fr";
    expect(flat(fr._editor(fr._data))).toContain('<h2 class="pane-title">Aperçu</h2>');
    fr._selected = "1";
    expect(flat(fr._editor(fr._data))).toContain('<h2 class="pane-title">Réglages</h2>');
  });

  it("keeps the old invitation when there is no program to show an overview of", () => {
    expect(flat(make({ data: data([]) })._editor(data([])))).toContain("Choose a program");
  });
});
