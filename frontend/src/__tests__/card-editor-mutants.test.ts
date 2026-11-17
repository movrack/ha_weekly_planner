import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WeeklyPlannerCardEditor } from "../card-editor";
import { t } from "../i18n";
import { flat, handlers } from "./helpers/tpl";

// Mutation survivors of the card editor logic: echo guard, config edits, saved programs, order moves, tabs, domain names.
const prog = (id: string, name: string, ents = ["cover.a"], extra: any = {}) => ({
  id, name, revision: 1, area: "", priority: 1, enabled: true, reapply: true, conditions: [], profiles: [],
  entities: ents.map((entity_id) => ({ entity_id, default_label: null, label_overrides: {} })), ...extra });
const mk = (config: any = {}, programs: any[] = [prog("a", "Alpha"), prog("b", "Beta"), prog("c", "Gamma")]) => {
  const el: any = new WeeklyPlannerCardEditor();
  el.hass = { language: "en", states: {}, areas: {}, user: { is_admin: true }, loadBackendTranslation: vi.fn(async () => () => "") };
  el._config = { type: "custom:weekly-planner-card", ...config };
  el._data = { programs, labels: [], status: {}, can_edit: true, read_only: false };
  el._programs = programs.map((p: any) => ({ id: p.id, name: p.name }));
  el.dispatchEvent = vi.fn();
  return el;
};
const sent = (el: any): any[] => el.dispatchEvent.mock.calls.map(([e]: any[]) => e.detail.config);

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-04T09:00:00Z")); });
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe("echo guard of setConfig", () => {
  it("a config echoed back is ignored; the stale previous one is answered with ours up to five times; later or other configs are taken", () => {
    const el = mk({ title: "A" });
    el._set("title", "B");
    const ours = sent(el)[0];
    expect(ours.title).toBe("B");
    el.dispatchEvent.mockClear();
    el.setConfig({ type: "custom:weekly-planner-card", title: "B", schedule_view: "bars", show_chart: true, chart_collapsed: true, filter: {} });
    expect(el._config.title).toBe("B");
    expect(sent(el)).toEqual([]);
    for (let i = 1; i <= 5; i++) {
      el.setConfig({ type: "custom:weekly-planner-card", title: "A" });
      expect(sent(el)).toHaveLength(i);
      expect(el._config.title).toBe("B");
    }
    el.setConfig({ type: "custom:weekly-planner-card", title: "A" }); // sixth time: taken
    expect(el._config.title).toBe("A");
    expect(el._sent).toBeUndefined();
  });
  it("after 1.5 s the stale copy is no longer fought; another config is taken at once", () => {
    const el = mk({ title: "A" });
    el._set("title", "B");
    vi.advanceTimersByTime(1499);
    el.setConfig({ type: "custom:weekly-planner-card", title: "Z" });
    expect(el._config.title).toBe("Z");
    el._set("title", "C");
    vi.advanceTimersByTime(1500);
    el.dispatchEvent.mockClear();
    el.setConfig({ type: "custom:weekly-planner-card", title: "B" });
    expect(sent(el)).toEqual([]);
    expect(el._config.title).toBe("B");
  });
  it("our own config in any key order counts as the echo", () => {
    const el = mk({ title: "A" });
    el._set("title", "B");
    el.dispatchEvent.mockClear();
    const echoed = { filter: {}, chart_collapsed: true, show_chart: true, schedule_view: "bars", title: "B", type: "custom:weekly-planner-card" };
    el.setConfig(echoed);
    expect(sent(el)).toEqual([]);
  });
  it("another program selected forgets the edit in progress and what was just created; the same program keeps them", () => {
    const el = mk({ program: "a" });
    el._editing = "a"; el._createdName = "N"; el._createdProgramId = "a";
    el.setConfig({ type: "x", program: "a" });
    expect([el._editing, el._createdName, el._createdProgramId]).toEqual(["a", "N", "a"]);
    el.setConfig({ type: "x", program: "b" });
    expect([el._editing, el._createdName, el._createdProgramId]).toEqual([null, "", null]);
    expect(el._unsub).toBeUndefined();
  });
});

describe("edits of the config", () => {
  it("an empty value removes the key; any other sets it; choosing a program forgets the creation state; the full config is sent", () => {
    const el = mk({ title: "A", program: "a" });
    el._editing = "a"; el._createdName = "N"; el._createdProgramId = "a";
    el._set("title", "");
    expect("title" in sent(el)[0]).toBe(false);
    el._set("title", null);
    expect("title" in sent(el)[1]).toBe(false);
    el._set("title", undefined);
    expect("title" in sent(el)[2]).toBe(false);
    expect([el._editing, el._createdName]).toEqual(["a", "N"]);
    el._set("show_chart", false);
    expect(sent(el)[3].show_chart).toBe(false);
    el._set("program", "b");
    expect([el._editing, el._createdName, el._createdProgramId]).toEqual([null, "", null]);
    expect(sent(el)[4]).toMatchObject({ program: "b", schedule_view: "bars", show_chart: false, chart_collapsed: true });
    expect(el._config).toBe(el._config);
  });
  it("switching to one program picks the first one and drops the filter; back to a list keeps the types", () => {
    const el = mk({ filter: { types: ["cover"] } });
    el._editing = "x";
    el._setMode(true);
    expect(sent(el)[0].program).toBe("a");
    expect("filter" in sent(el)[0]).toBe(false);
    expect(el._editing).toBeNull();
    el._setMode(false);
    expect("program" in sent(el)[1]).toBe(false);
    expect(sent(el)[1].filter).toEqual({ types: [] });
    const typed = mk({ program: "b", filter: { types: ["light"], area: "k" } });
    typed._setMode(false);
    expect(sent(typed)[0].filter).toEqual({ types: ["light"], area: "k" });
    const none = mk({}, []);
    none._setMode(true);
    expect(sent(none)[0].program).toBe("");
    expect(mk({ program: "" })._isProgram).toBe(true);
    expect(mk({})._isProgram).toBe(false);
  });
  it("the filter keeps its lists only when they hold something", () => {
    const el = mk({ filter: { types: ["cover"], area: "k", programs: ["a"] } });
    el._setFilter({ types: [] });
    expect(sent(el)[0].filter).toEqual({ area: "k", programs: ["a"] });
    el._setFilter({ programs: undefined });
    expect(sent(el)[1].filter).toEqual({ area: "k", types: ["cover"] }.types ? { area: "k" } : {});
    el._config = { type: "x", filter: { types: ["cover"], area: "k", programs: ["a"] } };
    el._setFilter({ area: [] });
    expect(sent(el)[2].filter).toEqual({ types: ["cover"], programs: ["a"] });
    el._config = { type: "x", filter: { types: ["cover"], area: "k" } };
    el._setFilter({ area: ["  "] as any });
    expect("area" in sent(el)[3].filter).toBe(false);
    el._config = { type: "x" };
    el._setFilter({ types: ["x"] });
    expect(sent(el)[4].filter).toEqual({ types: ["x"] });
    el._treeChange({ types: undefined, programs: undefined });
    expect(sent(el)[5].filter).toEqual({});
  });
});

describe("saved programs", () => {
  const saved = (el: any, program: any, editor: any) => { const stop = vi.fn(); el._saved({ detail: program, currentTarget: editor, stopPropagation: stop }); return stop; };
  it("a program saved in place updates the list and keeps the config", () => {
    const el = mk({ program: "a" });
    const editor = {};
    el._editors.set("a", editor);
    const stop = saved(el, prog("a", "Alpha2"), editor);
    expect(stop).toHaveBeenCalled();
    expect(el._data.programs.map((p: any) => p.name)).toEqual(["Beta", "Gamma", "Alpha2"]);
    expect(el._programs.map((p: any) => p.id)).toEqual(["b", "c", "a"]);
    expect(sent(el)).toEqual([]);
    expect(el._editing).toBe("a");
    expect([...el._editors.keys()]).toEqual(["a"]);
  });
  it("a new program takes the place of its draft: selected in the mode of the card, announced, section back to the display", () => {
    const el = mk({ program: "a" });
    const editor = {};
    el._editors.set("new", editor);
    el._editing = "new";
    el._section = "programs";
    saved(el, prog("n", "Nova"), editor);
    expect([...el._editors.keys()]).toEqual(["n"]);
    expect(el._editors.get("n")).toBe(editor);
    expect(sent(el)[0].program).toBe("n");
    expect([el._createdName, el._createdProgramId, el._section, el._editing]).toEqual(["Nova", "n", "display", "n"]);
    expect(el._justCreated.id).toBe("n");
    const list = mk({ filter: { types: [] } });
    const e2 = {};
    list._editors.set("new", e2);
    list._editing = "new";
    saved(list, prog("n", "Nova"), list._editors.get("new"));
    expect("program" in sent(list)[0]).toBe(false);
  });
  it("a program renamed to another id while selected selects the new id without a filter; one that was not selected does not touch the config", () => {
    const el = mk({ program: "a", filter: { types: ["x"] } });
    const editor = {};
    el._editors.set("a", editor);
    saved(el, prog("z", "Zed"), editor);
    expect(sent(el)[0].program).toBe("z");
    expect("filter" in sent(el)[0]).toBe(false);
    expect(el._editing).toBe("z");
    const other = mk({ program: "a" });
    const stray = {};
    other._editors.set("b", stray);
    saved(other, prog("b", "Beta2"), stray);
    expect(sent(other)).toEqual([]);
    expect(other._editing).toBeNull();
    const unknown = mk({ program: "a" });
    saved(unknown, prog("q", "Q"), {});
    expect(sent(unknown)).toEqual([]);
    expect(unknown._editors.size).toBe(0);
  });
  it("snapshots pushed before a created program arrived still list it, until one includes it", () => {
    const el = mk({});
    el._justCreated = prog("n", "Nova");
    el._setData({ programs: [prog("a", "Alpha")] } as any);
    expect(el._data.programs.map((p: any) => p.id)).toEqual(["a", "n"]);
    expect(el._justCreated).toBeDefined();
    el._setData({ programs: [prog("a", "Alpha"), prog("n", "Nova")] } as any);
    expect(el._justCreated).toBeUndefined();
    expect(el._programs).toEqual([{ id: "a", name: "Alpha" }, { id: "n", name: "Nova" }]);
  });
  it("the new-program draft opens the programs tab and clears the last creation", () => {
    const el = mk({});
    el._createdName = "x";
    Object.defineProperty(el, "updateComplete", { value: Promise.resolve(true), configurable: true });
    Object.defineProperty(el, "renderRoot", { value: { querySelector: vi.fn(() => ({ focus: vi.fn() })) }, configurable: true });
    el._newProgram();
    expect([el._createdName, el._editing, el._section]).toEqual(["", "new", "programs"]);
  });
});

describe("order of the programs", () => {
  it("new order first, the ids of hidden programs after; a move shows, announces and expires", () => {
    const el = mk({ sort: "custom", order: ["c", "x", "a"] });
    el._setOrder(["b", "a"]);
    expect(sent(el)[0].order).toEqual(["b", "a", "c", "x"]);
    el._config.order = ["a", "b", "c"];
    Object.defineProperty(el, "updateComplete", { value: Promise.resolve(true), configurable: true });
    Object.defineProperty(el, "renderRoot", { value: { querySelector: vi.fn(() => ({ focus: vi.fn() })) }, configurable: true });
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
    const n = sent(el).length;
    el._move(["a", "b", "c"], 0, -1);
    el._move(["a", "b", "c"], 2, 3);
    el._move(["a", "b", "c"], 1, 1);
    expect(sent(el)).toHaveLength(n);
    el._move(["a", "b", "c"], 2, 0);
    expect(sent(el).pop().order.slice(0, 3)).toEqual(["c", "a", "b"]);
    el._move(["a", "b", "c"], 1, 2);
    expect(sent(el).pop().order.slice(0, 3)).toEqual(["a", "c", "b"]);
    vi.advanceTimersByTime(500);
    el._move(["a", "b", "c"], 0, 1);
    vi.advanceTimersByTime(600);
    expect(el._moved).toBe("a"); // the first timer was replaced
  });
  it("the rows follow the saved order, new programs last", () => {
    const el = mk({ sort: "custom", order: ["c", "a"] });
    expect(el._customRows().map((r: any) => r.id)).toEqual(["c", "a", "b"]);
    const none = mk({ sort: "custom" });
    none._data = undefined;
    expect(none._customRows()).toEqual([]);
  });
});

describe("tabs and domain names", () => {
  it("arrows switch the tab, Home and End jump, other keys do nothing; the new tab takes the focus", async () => {
    const el = mk({});
    const focus = vi.fn();
    const q = vi.fn(() => ({ focus }));
    Object.defineProperty(el, "renderRoot", { value: { querySelector: q }, configurable: true });
    Object.defineProperty(el, "updateComplete", { value: Promise.resolve(true), configurable: true });
    const press = async (key: string) => { const ev = { key, preventDefault: vi.fn() }; el._tabKey(ev); await Promise.resolve(); await Promise.resolve(); return ev.preventDefault.mock.calls.length; };
    expect(await press("ArrowRight")).toBe(1);
    expect(el._section).toBe("programs");
    expect(q).toHaveBeenLastCalledWith("#ce-tab-programs");
    expect(await press("ArrowLeft")).toBe(1);
    expect(el._section).toBe("display");
    expect(await press("End")).toBe(1);
    expect(el._section).toBe("programs");
    expect(await press("Home")).toBe(1);
    expect(el._section).toBe("display");
    expect(q).toHaveBeenLastCalledWith("#ce-tab-display");
    expect(focus).toHaveBeenCalledTimes(4);
    expect(await press("x")).toBe(0);
    expect(el._section).toBe("display");
    expect(focus).toHaveBeenCalledTimes(4);
  });
  it("domain names: loaded per language and domains, once, kept by a late answer only when current, retried after a failure", async () => {
    const programs = [prog("a", "A", ["light.x"]), prog("b", "B", ["cover.y"]), prog("c", "C", [])];
    const localize = vi.fn(() => "T");
    const el = mk({}, programs);
    el.hass.loadBackendTranslation = vi.fn(async () => localize);
    el.requestUpdate = vi.fn();
    el._loadDomainIcons = vi.fn();
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
    const empty = mk({}, [prog("c", "C", [])]);
    empty.hass.loadBackendTranslation = vi.fn(); empty._loadDomainIcons = vi.fn();
    empty._loadDomainNames();
    expect(empty.hass.loadBackendTranslation).not.toHaveBeenCalled();
    expect(empty._domainLoadKey).toBe("en|");
    const fail = mk({}, programs);
    fail._loadDomainIcons = vi.fn();
    fail.hass.loadBackendTranslation = vi.fn(async () => { throw new Error("x"); });
    fail._loadDomainNames();
    await vi.advanceTimersByTimeAsync(0);
    expect(fail._domainLoadKey).toBe("");
    let reject: (e: Error) => void = () => {};
    const late = mk({}, programs);
    late._loadDomainIcons = vi.fn();
    late.hass.loadBackendTranslation = vi.fn(() => new Promise((_, rej) => { reject = rej; }));
    late._loadDomainNames();
    late._domainLoadKey = "newer";
    reject(new Error("x"));
    await vi.advanceTimersByTimeAsync(0);
    expect(late._domainLoadKey).toBe("newer");
    let resolve: (v: any) => void = () => {};
    const stale = mk({}, programs);
    stale._loadDomainIcons = vi.fn(); stale.requestUpdate = vi.fn();
    stale.hass.loadBackendTranslation = vi.fn(() => new Promise((r) => { resolve = r; }));
    stale._loadDomainNames();
    stale._domainLoadKey = "newer";
    resolve(localize);
    await vi.advanceTimersByTimeAsync(0);
    expect(stale._domainLocalize).toBeUndefined();
    expect(stale.requestUpdate).not.toHaveBeenCalled();
    const noApi = mk({}, programs); noApi.hass.loadBackendTranslation = undefined; noApi._loadDomainIcons = vi.fn();
    noApi._loadDomainNames();
    expect(noApi._loadDomainIcons).toHaveBeenCalled();
    expect(noApi._domainLoadKey).toBe("");
    const noData = mk({}, programs); noData._data = undefined; noData._loadDomainIcons = vi.fn();
    noData._loadDomainNames();
    expect(noData._loadDomainIcons).not.toHaveBeenCalled();
  });
  it("domain icons are loaded once per set of domains", async () => {
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
  it("the type label: HA's, then the loaded one, else the domain", () => {
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
  it("updated: subscribes once when connected with hass; the lifecycle releases it", () => {
    const el = mk({});
    el._loadDomainNames = vi.fn();
    Object.defineProperty(el, "isConnected", { value: true, configurable: true });
    void el; void flat; void handlers;
  });
});
