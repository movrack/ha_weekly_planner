import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const subscription = vi.hoisted(() => ({ subscribe: vi.fn() }));
vi.mock("../planner", async (original) => ({ ...await original<typeof import("../planner")>(), subscribePlanner: subscription.subscribe }));
import { WeeklyPlannerCardEditor } from "../card-editor";
import { t } from "../i18n";
import { flat, handlers } from "./helpers/tpl";

// The card editor: echo guard of the config, config edits, form fields, saved programs, order of the programs,
// tabs, domain names, embedded program editors, snapshot subscription. Driven through its methods and the
// handlers of its template.
const prog = (id: string, name: string, ents = ["cover.a"], extra: any = {}) => ({
  id, name, revision: 1, area: "", priority: 1, enabled: true, reapply: true, conditions: [], profiles: [],
  entities: ents.map((entity_id) => ({ entity_id, default_label: null, label_overrides: {} })), ...extra });
const mk = (config: any = {}, programs: any[] = [prog("a", "Alpha"), prog("b", "Beta"), prog("c", "Gamma")]) => {
  const el: any = new WeeklyPlannerCardEditor();
  el.hass = { language: "en", states: {}, areas: {}, user: { is_admin: true }, loadBackendTranslation: vi.fn(async () => () => "") };
  el._config = { type: "custom:weekly-planner-card", ...config };
  el._data = { programs, labels: [], status: {}, can_edit: true, read_only: false };
  el.dispatchEvent = vi.fn();
  return el;
};
const sent = (el: any): any[] => el.dispatchEvent.mock.calls.map(([e]: any[]) => e.detail.config);
/** The handler of `event` whose markup, just before it, mentions `marker`. */
const eventNear = (tpl: any, event: string, marker: string) => handlers(tpl).find((h) => h.event === event && h.before.slice(-250).includes(marker))!.fn;
/** What a method needs to move the focus once the render is done. */
const withFocus = (el: any, focus = vi.fn()) => {
  const querySelector = vi.fn(() => ({ focus }));
  Object.defineProperty(el, "updateComplete", { value: Promise.resolve(true), configurable: true });
  Object.defineProperty(el, "renderRoot", { value: { querySelector }, configurable: true });
  return { focus, querySelector };
};
const CARD = "custom:weekly-planner-card";

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-04T09:00:00Z")); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("echo guard of setConfig", () => {
  it("a config echoed back is ignored", () => {
    const el = mk({ title: "A" });
    el._set("title", "B");
    expect(sent(el)[0].title).toBe("B");
    el.dispatchEvent.mockClear();
    el.setConfig({ type: CARD, title: "B", schedule_view: "bars", show_chart: true, chart_collapsed: true, filter: {} });
    expect(el._config.title).toBe("B");
    expect(sent(el)).toEqual([]);
  });
  it("the stale previous config is answered with ours up to five times, the sixth is taken", () => {
    const el = mk({ title: "A" });
    el._set("title", "B");
    el.dispatchEvent.mockClear();
    for (let i = 1; i <= 5; i++) {
      el.setConfig({ type: CARD, title: "A" });
      expect(sent(el)).toHaveLength(i);
      expect(el._config.title).toBe("B");
    }
    el.setConfig({ type: CARD, title: "A" });
    expect(el._config.title).toBe("A");
    expect(sent(el)).toHaveLength(5);
    expect(el._sent).toBeUndefined();
  });
  it("another config is taken at once, even inside the guard window", () => {
    const el = mk({ title: "A" });
    el._set("title", "B");
    vi.advanceTimersByTime(1499);
    el.setConfig({ type: CARD, title: "Z" });
    expect(el._config.title).toBe("Z");
  });
  it("the stale copy is no longer fought once the guard has expired, at exactly 1.5 s", () => {
    const el = mk({ title: "Before" });
    el._set("title", "After");
    el.dispatchEvent.mockClear();
    vi.advanceTimersByTime(1499);
    el.setConfig({ type: CARD, title: "Before" });
    expect(el._config.title).toBe("After");
    expect(sent(el)).toHaveLength(1);
    vi.advanceTimersByTime(1);
    el.dispatchEvent.mockClear();
    el.setConfig({ type: CARD, title: "Before" });
    expect(el._config.title).toBe("Before");
    expect(el._sent).toBeUndefined();
    expect(sent(el)).toEqual([]);
  });
  it("our own config is recognised in any key order, nested keys included, and the guard stays", () => {
    const el = mk({ filter: { area: ["z", "a"], programs: ["b", "a"] } });
    el._set("title", "After");
    el.dispatchEvent.mockClear();
    const config = el._config;
    const guard = el._sent;
    el.setConfig({ chart_collapsed: true, show_chart: true, schedule_view: "bars", title: "After", filter: { programs: ["b", "a"], area: ["z", "a"] }, type: CARD });
    expect(el._config).toBe(config);
    expect(el._sent).toBe(guard);
    expect(sent(el)).toEqual([]);
  });
});

describe("edits of the config", () => {
  it.each([["an empty text", ""], ["null", null], ["undefined", undefined]])("%s removes the key", (_name, value) => {
    const el = mk({ title: "A", program: "a" });
    el._set("title", value);
    expect("title" in sent(el)[0]).toBe(false);
  });
  it("any other value sets the key and the full effective config is sent", () => {
    const el = mk({ title: "A", program: "a" });
    el._set("show_chart", false);
    expect(sent(el)[0]).toEqual({ type: CARD, title: "A", program: "a", schedule_view: "bars", show_chart: false, chart_collapsed: true });
    expect(el._config).toEqual(sent(el)[0]);
  });
  it("config events bubble through the dashboard shadow root", () => {
    const el = mk();
    el._set("title", "Kitchen");
    const event = el.dispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe("config-changed");
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.detail.config.title).toBe("Kitchen");
  });
  it("a saved single program is shown as the selection of that program and nothing is rewritten before a change", () => {
    const el = mk({ program: "b" });
    expect(el._filter).toEqual({ programs: ["b"] });
    expect(sent(el)).toEqual([]);
    expect(mk({ program: "" })._filter).toEqual({}); // the card shows every program for an empty `program`
    expect(mk({})._filter).toEqual({});
    expect(mk({ filter: { types: ["light"] } })._filter).toEqual({ types: ["light"] });
  });
  it("a change that is not a selection leaves a saved single program as it is", () => {
    const el = mk({ title: "A", program: "b" });
    el._set("title", "B");
    expect(sent(el)[0]).toMatchObject({ title: "B", program: "b" });
    expect("filter" in sent(el)[0]).toBe(false);
  });
  it("the first change of the selection moves a saved single program to the filter, leaving any old filter aside", () => {
    const el = mk({ program: "b", filter: { types: ["light"] } });
    el._setFilter({ area: "k" });
    expect(sent(el)[0].filter).toEqual({ programs: ["b"], area: "k" });
    expect("program" in sent(el)[0]).toBe(false);
    const empty = mk({ program: "" });
    empty._setFilter({ area: "k" });
    expect(sent(empty)[0].filter).toEqual({ area: "k" });
  });
  it("a saved single program, once migrated, still shows exactly the programs the card showed", async () => {
    const { filterPrograms } = await import("../planner");
    const data: any = { programs: [prog("a", "Alpha"), prog("b", "Beta")] };
    for (const ref of ["b", "beta", "Béta", "nobody"]) {
      const el = mk({ program: ref });
      el._setFilter({});
      expect(filterPrograms(data, sent(el)[0]).map((p) => p.id)).toEqual(filterPrograms(data, { program: ref }).map((p) => p.id));
    }
  });
  it("a program chosen in the tree of a saved single program replaces it in the filter", () => {
    const el = mk({ program: "a" });
    el._treeChange({ programs: ["a", "c"] });
    expect(sent(el)[0].filter).toEqual({ programs: ["a", "c"] });
    expect("program" in sent(el)[0]).toBe(false);
  });
  it.each([
    ["no types", { types: ["cover"], area: "k", programs: ["a"] }, { types: [] }, { area: "k", programs: ["a"] }],
    ["no programs", { types: ["cover"], area: "k", programs: ["a"] }, { programs: undefined }, { types: ["cover"], area: "k" }],
    ["no area", { types: ["cover"], area: "k", programs: ["a"] }, { area: [] }, { types: ["cover"], programs: ["a"] }],
    ["only a blank area", { types: ["cover"], area: "k" }, { area: ["  "] }, { types: ["cover"] }],
    ["a type on a config without filter", undefined, { types: ["x"] }, { types: ["x"] }],
  ])("the filter keeps its lists only when they hold something: %s", (_name, filter, patch, expected) => {
    const el = mk({});
    el._config = { type: "x", ...(filter ? { filter } : {}) };
    el._setFilter(patch);
    expect(sent(el)[0].filter).toEqual(expected);
  });
  it("clearing the types and the programs of the tree leaves an empty filter", () => {
    const el = mk({ filter: { types: ["cover"], programs: ["a"] } });
    el._treeChange({ types: undefined, programs: undefined });
    expect(sent(el)[0].filter).toEqual({});
  });
});

describe("form fields of the display tab", () => {
  it.each([
    ["ce-title", "input", "Living room", "title"],
    ["ce-view", "change", "compare", "schedule_view"],
  ])("the field %s sets %s of the config", (id, event, value, key) => {
    const el = mk({ filter: { programs: ["a"] } });
    el._set = vi.fn();
    eventNear(el.render(), event, `id="${id}"`)({ target: { value } });
    expect(el._set).toHaveBeenCalledExactlyOnceWith(key, value);
  });
});

describe("order of the programs", () => {
  it("the new order comes first, the ids of the hidden programs after it", () => {
    const el = mk({ sort: "custom", order: ["c", "x", "a"] });
    el._setOrder(["b", "a"]);
    expect(sent(el)[0].order).toEqual(["b", "a", "c", "x"]);
  });
  it("a move is sent, shown for 1 s and announced for 3 s", () => {
    const el = mk({ sort: "custom", order: ["a", "b", "c"] });
    withFocus(el);
    el._move(["a", "b", "c"], 0, 1);
    expect(sent(el).pop().order).toEqual(["b", "a", "c"]);
    expect(el._moved).toBe("a");
    expect(el._announce).toBe(t("en", "ce_moved", { name: "Alpha", n: "2", total: "3" }));
    vi.advanceTimersByTime(999);
    expect(el._moved).toBe("a");
    vi.advanceTimersByTime(1);
    expect(el._moved).toBe("");
    vi.advanceTimersByTime(1999);
    expect(el._announce).not.toBe("");
    vi.advanceTimersByTime(1);
    expect(el._announce).toBe("");
  });
  it("a second move restarts the display timer", () => {
    const el = mk({ sort: "custom", order: ["a", "b", "c"] });
    withFocus(el);
    el._move(["a", "b", "c"], 0, 1);
    vi.advanceTimersByTime(500);
    el._move(["a", "b", "c"], 0, 1);
    vi.advanceTimersByTime(600);
    expect(el._moved).toBe("a");
  });
  it.each([
    ["to the end", 0, -1], ["past the end", 2, 3], ["onto itself", 1, 1],
  ])("a move %s changes nothing", (_name, from, to) => {
    const el = mk({ sort: "custom", order: ["a", "b", "c"] });
    withFocus(el);
    el._move(["a", "b", "c"], from, to);
    expect(sent(el)).toEqual([]);
  });
  it.each([[2, 0, ["c", "a", "b"]], [1, 2, ["a", "c", "b"]]])("moving row %i to %i gives %j", (from, to, expected) => {
    const el = mk({ sort: "custom", order: ["a", "b", "c"] });
    withFocus(el);
    el._move(["a", "b", "c"], from, to);
    expect(sent(el).pop().order.slice(0, 3)).toEqual(expected);
  });
  it("the rows follow the saved order, new programs last", () => {
    const el = mk({ sort: "custom", order: ["c", "a"] });
    expect(el._customRows().map((r: any) => r.id)).toEqual(["c", "a", "b"]);
  });
  it("there are no rows before the data arrives", () => {
    const none = mk({ sort: "custom" });
    none._data = undefined;
    expect(none._customRows()).toEqual([]);
  });
});

describe("order of the programs by pointer", () => {
  function drag(from = 0) {
    const el = mk();
    const save = vi.spyOn(el, "_setOrder").mockImplementation(() => {});
    const listeners = new Map<string, (e?: any) => void>();
    const rows = [0, 1, 2].map((i) => ({
      getBoundingClientRect: () => ({ top: i * 20, bottom: i * 20 + 19 }),
      classList: { toggle: vi.fn(), remove: vi.fn() },
    }));
    const list = { querySelectorAll: vi.fn(() => rows) };
    const handle = {
      closest: vi.fn(() => list), setPointerCapture: vi.fn(),
      addEventListener: vi.fn((name, fn) => listeners.set(name, fn)),
      removeEventListener: vi.fn((name, fn) => { if (listeners.get(name) === fn) listeners.delete(name); }),
    };
    const preventDefault = vi.fn();
    el._drag({ currentTarget: handle, pointerId: 7, preventDefault }, ["a", "b", "c"], from);
    return { save, listeners, rows, handle, preventDefault };
  }
  it.each([40, 59])("captures the handle and moves to the row at either inclusive edge (y = %i)", (clientY) => {
    const d = drag();
    expect(d.preventDefault).toHaveBeenCalledOnce();
    expect(d.handle.closest).toHaveBeenCalledWith(".order-list");
    expect(d.handle.setPointerCapture).toHaveBeenCalledWith(7);
    d.listeners.get("pointermove")!({ clientY });
    expect(d.rows[2].classList.toggle).toHaveBeenLastCalledWith("target", true);
    expect(d.rows[0].classList.toggle).toHaveBeenLastCalledWith("target", false);
    d.listeners.get("pointerup")!();
    expect(d.save).toHaveBeenCalledExactlyOnceWith(["b", "c", "a"]);
    expect(d.listeners.size).toBe(0);
    for (const row of d.rows) expect(row.classList.remove).toHaveBeenCalledWith("target");
  });
  it("ignores coordinates outside the rows and does not save an unchanged order", () => {
    const d = drag(1);
    d.listeners.get("pointermove")!({ clientY: -1 });
    d.listeners.get("pointermove")!({ clientY: 60 });
    d.listeners.get("pointermove")!({ clientY: 20 });
    expect(d.rows[1].classList.toggle).toHaveBeenLastCalledWith("target", false);
    d.listeners.get("pointerup")!();
    expect(d.save).not.toHaveBeenCalled();
    expect(d.listeners.size).toBe(0);
  });
  it("a cancelled drag saves nothing and removes all pointer listeners", () => {
    const d = drag();
    d.listeners.get("pointermove")!({ clientY: 25 });
    d.listeners.get("pointercancel")!();
    expect(d.save).not.toHaveBeenCalled();
    expect(d.listeners.size).toBe(0);
    for (const row of d.rows) expect(row.classList.remove).toHaveBeenCalledWith("target");
  });
});

describe("domain names and icons", () => {
  const programs = [prog("a", "A", ["light.x"]), prog("b", "B", ["cover.y"]), prog("c", "C", [])];
  const loader = (el: any, load: any) => { el.hass.loadBackendTranslation = load; el._loadDomainIcons = vi.fn(); el.requestUpdate = vi.fn(); return el; };
  it("names are loaded for the domains of the programs, once per language and set of domains", async () => {
    const localize = vi.fn(() => "T");
    const el = loader(mk({}, programs), vi.fn(async () => localize));
    el._loadDomainNames();
    expect(el.hass.loadBackendTranslation).toHaveBeenCalledWith("title", ["cover", "light"]);
    expect(el._domainLoadKey).toBe("en|cover,light");
    expect(el._loadDomainIcons).toHaveBeenCalledWith(["cover", "light"]);
    await vi.advanceTimersByTimeAsync(0);
    expect(el._domainLocalize).toBe(localize);
    expect(el.requestUpdate).toHaveBeenCalledTimes(1);
    el._loadDomainNames();
    expect(el.hass.loadBackendTranslation).toHaveBeenCalledTimes(1);
    el.hass.language = "fr";
    el._loadDomainNames();
    expect(el._domainLocalize).toBeUndefined();
    expect(el.hass.loadBackendTranslation).toHaveBeenCalledTimes(2);
  });
  it("nothing is requested when no program has a domain", () => {
    const el = loader(mk({}, [prog("c", "C", [])]), vi.fn());
    el._loadDomainNames();
    expect(el.hass.loadBackendTranslation).not.toHaveBeenCalled();
    expect(el._domainLoadKey).toBe("en|");
  });
  it("a failed load is retried at the next call", async () => {
    const el = loader(mk({}, programs), vi.fn(async () => { throw new Error("x"); }));
    el._loadDomainNames();
    await vi.advanceTimersByTimeAsync(0);
    expect(el._domainLoadKey).toBe("");
  });
  it("a late failure does not reset a newer load", async () => {
    let reject: (e: Error) => void = () => {};
    const el = loader(mk({}, programs), vi.fn(() => new Promise((_, rej) => { reject = rej; })));
    el._loadDomainNames();
    el._domainLoadKey = "newer";
    reject(new Error("x"));
    await vi.advanceTimersByTimeAsync(0);
    expect(el._domainLoadKey).toBe("newer");
  });
  it("a late answer is dropped when a newer load has started", async () => {
    let resolve: (v: any) => void = () => {};
    const el = loader(mk({}, programs), vi.fn(() => new Promise((r) => { resolve = r; })));
    el._loadDomainNames();
    el._domainLoadKey = "newer";
    resolve(() => "T");
    await vi.advanceTimersByTimeAsync(0);
    expect(el._domainLocalize).toBeUndefined();
    expect(el.requestUpdate).not.toHaveBeenCalled();
  });
  it("without the translation API the icons are still loaded and the load stays open", () => {
    const el = loader(mk({}, programs), undefined);
    el._loadDomainNames();
    expect(el._loadDomainIcons).toHaveBeenCalled();
    expect(el._domainLoadKey).toBe("");
  });
  it("without data nothing is loaded", () => {
    const el = loader(mk({}, programs), vi.fn());
    el._data = undefined;
    el._loadDomainNames();
    expect(el._loadDomainIcons).not.toHaveBeenCalled();
  });
  it("icons are loaded once per set of domains", async () => {
    const el = mk({});
    el._typeIcons = new Map();
    el._loadDomainIcons([]);
    expect(el._iconKey).toBe("");
    el._loadDomainIcons(["cover"]);
    expect(el._iconKey).toBe("cover");
    await vi.advanceTimersByTimeAsync(0);
    expect(el._typeIcons.has("cover")).toBe(true);
    const keep = el._typeIcons;
    el._loadDomainIcons(["cover"]);
    await vi.advanceTimersByTimeAsync(0);
    expect(el._typeIcons).toBe(keep);
  });
  it("icons are refreshed when a different set of domains has the same concatenated spelling", async () => {
    const el = mk({});
    el._loadDomainIcons(["ab", "c"]);
    await vi.advanceTimersByTimeAsync(0);
    expect(el._iconKey).toBe("ab,c");
    el._loadDomainIcons(["a", "bc"]);
    await vi.advanceTimersByTimeAsync(0);
    expect(el._iconKey).toBe("a,bc");
    expect([...el._typeIcons.keys()]).toEqual(["a", "bc"]);
  });
  it("the type label is the one of Home Assistant, then the loaded one, else the domain", () => {
    const el = mk({});
    expect(el._typeLabel("cover")).toBe("cover");
    el._domainLocalize = (k: string) => (k === "component.cover.title" ? "Covers" : "");
    expect(el._typeLabel("cover")).toBe("Covers");
    el.hass.localize = (k: string) => (k === "component.cover.title" ? "Own" : "");
    expect(el._typeLabel("cover")).toBe("Own");
    el.hass = undefined;
    expect(el._typeLabel("cover")).toBe("Covers");
    el._domainLocalize = undefined;
    expect(el._typeLabel("cover")).toBe("cover");
  });
});

describe("snapshot subscription", () => {
  const connected = (hass: unknown, isConnected = true) => {
    const el: any = new WeeklyPlannerCardEditor();
    el.hass = hass;
    el._loadDomainNames = vi.fn();
    Object.defineProperty(el, "isConnected", { value: isConnected, configurable: true });
    Object.defineProperty(el, "renderRoot", { value: { querySelectorAll: () => [] }, configurable: true });
    subscription.subscribe.mockReset();
    return el;
  };
  it("subscribes once when connected with hass, forwards pushed data, releases the listener and reconnects", () => {
    const el = connected({ language: "en" });
    const unsub = vi.fn();
    subscription.subscribe.mockReturnValue(unsub);
    el.updated();
    expect(subscription.subscribe).toHaveBeenCalledTimes(1);
    expect(subscription.subscribe.mock.calls[0][0]).toBe(el.hass);
    const snapshot = { programs: [{ id: "a", name: "Alpha" }] };
    subscription.subscribe.mock.calls[0][1](snapshot);
    expect(el._data).toBe(snapshot);
    el.updated();
    expect(subscription.subscribe).toHaveBeenCalledTimes(1);
    expect(el._loadDomainNames).toHaveBeenCalledTimes(2);
    el.disconnectedCallback();
    expect(unsub).toHaveBeenCalledOnce();
    expect(el._unsub).toBeUndefined();
    el.updated();
    expect(subscription.subscribe).toHaveBeenCalledTimes(2);
  });
  it.each([["disconnected", { language: "en" }, false], ["without hass", undefined, true]])("does not subscribe when %s", (_name, hass, isConnected) => {
    const el = connected(hass, isConnected);
    el.updated();
    expect(subscription.subscribe).not.toHaveBeenCalled();
    expect(() => el.disconnectedCallback()).not.toThrow();
  });
});

describe("manage programs entry", () => {
  const shown = (mutate: (el: any) => void) => { const el = mk(); mutate(el); return flat(el.render()); };
  it("is a link for everyone who can edit, administrator or not", () => {
    for (const html of [shown(() => {}), shown((e) => { e.hass.user.is_admin = false; })]) {
      expect(html).toContain('<a class="btn manage-programs" href="/weekly-planner">');
      expect(html).not.toContain("why-manage");
    }
  });
  it("stays on screen, disabled with its reason, when editing is impossible (an element never disappears)", () => {
    for (const html of [shown((e) => { e._data.can_edit = false; })]) {
      expect(html).not.toContain("<a class=\"btn manage-programs\"");
      expect(html).toContain('disabled aria-disabled="true" aria-describedby="why-manage"');
      expect(html).toContain(`id=why-manage role="status">${t("en", "read_only")}</p>`);
    }
    expect(shown((e) => { e._data.read_only = true; })).toContain(`id=why-manage role="status">${t("en", "read_only")}</p>`);
  });
  it("shows nothing while the data is loading", () => {
    expect(shown((e) => { e._data = undefined; })).not.toContain("manage-programs");
  });
});

describe("Show the schedules switch follows the display view", () => {
  it.each([
    ["bars", false], [undefined, false], ["radial", false], ["radial_12h", false],
    ["times", true], ["list", true], ["compare", true],
  ])("view %s: the switch is greyed = %s, with its reason", (view, greyed) => {
    const out = flat(mk({ ...(view ? { schedule_view: view } : {}) }).render());
    expect(out.includes(t("en", "ce_show_schedule_list_why"))).toBe(greyed);
    expect(out.includes("aria-describedby=why-schedule-list")).toBe(greyed);
    expect(out.includes("aria-disabled=true")).toBe(greyed);
    expect(out.includes(t("en", "ce_show_schedule_list"))).toBe(true); // never removed
  });
});

describe("List order needs at least two programs", () => {
  it.each([
    ["all programs", {}, false],
    ["two selected", { filter: { programs: ["a", "b"] } }, false],
    ["one selected", { filter: { programs: ["a"] } }, true],
    ["none selected", { filter: { programs: [] } }, true],
    ["a saved single program", { program: "a" }, true],
  ])("%s: the list order is greyed = %s, with its reason", (_name, config, greyed) => {
    const out = flat(mk(config).render());
    expect(out.includes(t("en", "ce_sort_why"))).toBe(greyed);
    expect(out.includes("aria-describedby=why-sort")).toBe(greyed);
    expect(out.includes(t("en", "ce_sort"))).toBe(true); // never removed
  });
  it("before the data arrives nothing is greyed", () => {
    const el = mk({ filter: { programs: ["a"] } });
    el._data = undefined;
    expect(flat(el.render()).includes(t("en", "ce_sort_why"))).toBe(false);
  });
});

describe("card editor: touch targets", () => {
  // Layout at 360 px (UI review 2026-02-10): touch targets, wrapping, no word cut in a program name.
  it("fits a 360 px screen: 44 px type chips that wrap, program names not cut mid-word, notice button inside its box", () => {
    const css = [WeeklyPlannerCardEditor.styles].flat(Infinity).map((s: any) => s?.cssText ?? "").join("\n");
    expect(css).toMatch(/\.chip \{[^}]*min-height: 44px/);
    expect(css).toMatch(/\.chips \{[^}]*flex-wrap: wrap/);
    expect(css).toMatch(/\.type-title \{[^}]*overflow-wrap: normal/);
    expect(css).toMatch(/\.callout \.btn \{[^}]*max-width: 100%[^}]*white-space: normal/);
  });
});
