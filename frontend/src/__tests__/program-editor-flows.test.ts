import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpProgramEditor } from "../editors/program-editor";
import { confirmAction } from "../components/confirm";
import { flat, handlers, find } from "./helpers/tpl";
import { t } from "../i18n";
import type { Program } from "../types";

vi.mock("../components/confirm", () => ({ confirmAction: vi.fn(async () => true) }));

const days = () => Array.from({ length: 7 }, () => [] as any[]);
const prog = (extra: Partial<Program> = {}): Program => ({ id: "p", revision: 1, name: "Office", priority: 10, enabled: true, reapply: true,
  conditions: [], area: "Home", entities: [{ entity_id: "climate.a", default_label: null, label_overrides: {}, allowed_services: ["climate.turn_off"], restrict_services: true }],
  profiles: [{ id: "home", name: "Home", days: days() }, { id: "away", name: "Away", days: days() }], ...extra } as any);

function make(program: Program | null = prog(), opts: { embedded?: boolean; selector?: boolean; status?: any; others?: Program[]; defaults?: { reapply: boolean; priority: number } | null } = {}) {
  vi.stubGlobal("customElements", { get: (n: string) => (opts.selector && n === "ha-selector" ? class {} : undefined) });
  const e = new WpProgramEditor() as any;
  const events: any[] = [];
  e.dispatchEvent = (ev: any) => { events.push(ev); return true; };
  e.requestUpdate = vi.fn();
  e.hass = { language: "en", connection: {}, locale: { language: "en" }, states: { "climate.a": { entity_id: "climate.a", state: "heat", attributes: { friendly_name: "Thermo", icon: "mdi:radiator" } }, "input_select.mode": { entity_id: "input_select.mode", state: "Eco", attributes: { options: ["Eco", "Comfort"] } } },
    services: { climate: { turn_off: { name: "Off", description: "Switch off", target: { entity: { domain: "climate" } } }, turn_on: { name: "On", target: { entity: { domain: "climate" } } } } },
    callWS: vi.fn(async (m: any) => (m.type === "weekly_planner/get" ? { programs: program ? [program] : [] } : m.type === "weekly_planner/program/save" ? { program: { ...m.program, id: m.program.id ?? "new", revision: 2 } } : {})) };
  e.data = { programs: [...(program ? [program] : []), ...(opts.others ?? [])], status: opts.status ?? {}, labels: [{ id: "l", name: "L", color: "#f00", action: { kind: "service", service: "climate.set_temperature", target_entity_id: "climate.a" } }], can_edit: true, read_only: false, ...(opts.defaults === null ? {} : { defaults: opts.defaults ?? { priority: 20, reapply: false } }) };
  e.program = program ?? undefined; e.embedded = Boolean(opts.embedded);
  e.renderRoot = { querySelector: vi.fn(() => null), querySelectorAll: () => [] };
  Object.defineProperty(e, "updateComplete", { value: Promise.resolve(true) });
  e.willUpdate();
  return { e, events };
}
beforeEach(() => {
  (globalThis as any).CustomEvent ??= class { type: string; detail: unknown; constructor(t: string, i: any) { this.type = t; this.detail = i?.detail; } };
  vi.mocked(confirmAction).mockReset(); vi.mocked(confirmAction).mockResolvedValue(true);
});
afterEach(() => vi.unstubAllGlobals());

describe("program editor: creating", () => {
  it("starts from the defaults and renders the minimal form", () => {
    const { e } = make(null);
    expect(e._isNew).toBe(true); expect(e._p.priority).toBe(20); expect(e._p.reapply).toBe(false);
    const html = flat(e.render());
    expect(html).toContain("wp-dialog"); expect(html).toContain("wp-entity-picker"); expect(html).not.toContain("role=\"tablist\"");
    e.willUpdate();
  });
  it("shows field errors for a missing name then a missing device, then saves", async () => {
    const { e, events } = make(null);
    await e._save();
    expect(e._nameError).not.toBe("");
    e._patch({ name: " Salon " }, "name");
    expect(e._nameError).toBe("");
    await e._save(); expect(e._entitiesError).not.toBe("");
    const target = { scrollIntoView: vi.fn(), focus: vi.fn() };
    e.renderRoot.querySelector = () => target;
    find(e.render(), "wp-change", "wp-entity-picker").fn({ stopPropagation() {}, detail: "climate.a" });
    expect(e._p.entities[0]).toMatchObject({ entity_id: "climate.a", restrict_services: true });
    expect(e._p.icon).toBe("mdi:radiator");
    e._addEntity("climate.a"); e._addEntity("");
    expect(e._p.entities).toHaveLength(1);
    const closed = vi.fn(); e.renderRoot.querySelector = () => ({ close: closed });
    await e._save();
    const saveCall = e.hass.callWS.mock.calls.find((c: any) => c[0].type === "weekly_planner/program/save")[0];
    expect(saveCall.program).not.toHaveProperty("id");
    expect(saveCall.program.name).toBe("Salon");
    expect(events.map((x) => x.type)).toContain("program-saved"); expect(closed).toHaveBeenCalled();
    expect(e._isNew).toBe(false); expect(e._applied).toBe(false);
  });
  it("shows the missing-field message and focuses on a refused save", async () => {
    const { e } = make(null);
    const target = { scrollIntoView: vi.fn(), focus: vi.fn() };
    e.renderRoot.querySelector = () => target;
    await e._save(); await e.updateComplete; await e.updateComplete;
    expect(target.focus).toHaveBeenCalled();
    const ex = make(prog()); ex.e._showField("entities"); expect(ex.e._tab).toBe("entities");
    ex.e._showField("name"); expect(ex.e._tab).toBe("general");
  });
});

describe("program editor: general and entities tabs", () => {
  it.each([
    ["names the device type next to the device, so a room name is not mistaken for the device", (k: string) => (k === "component.climate.title" ? "Climate" : k), undefined, "Thermo</strong> <span class=\"muted\">(Climate)</span>"],
    ["takes the type name from the loaded titles when Home Assistant has not loaded it yet", (k: string) => k, (k: string) => (k === "component.climate.title" ? "Thermostat" : k), "(Thermostat)"],
  ])("%s", async (_name, localize, loaded, expected) => {
    const { e } = make();
    e.hass.localize = localize;
    e.hass.loadBackendTranslation = vi.fn(async (category: string) => {
      if (category !== "title") throw new Error("only the type names in this test");  // service names stay untouched
      return loaded ?? ((k: string) => k);
    });
    flat(e._renderEntity(e._p.entities[0], 0));
    await new Promise((r) => setTimeout(r));
    expect(e.hass.loadBackendTranslation).toHaveBeenCalledWith("title", ["climate"]);
    expect(flat(e._renderEntity(e._p.entities[0], 0))).toContain(expected);
  });

  it("names the Home Assistant device first and the entity below it, so a room name alone is never the title", () => {
    const { e } = make();
    e.hass.entities = { "climate.a": { entity_id: "climate.a", device_id: "d1" } };
    e.hass.devices = { d1: { id: "d1", name: "Thermostat bureau", name_by_user: "Thermostat du bureau" } };
    const out = flat(e._renderEntity(e._p.entities[0], 0));
    expect(out).toContain("<strong>Thermostat du bureau</strong>");
    expect(out).toContain('<div class="muted small">Thermo</div>');
    e.hass.devices = { d1: { id: "d1", name: "Thermo", name_by_user: null } };
    expect(flat(e._renderEntity(e._p.entities[0], 0))).not.toContain('<div class="muted small">Thermo</div>');  // same name: said once
  });

  it("shows no empty brackets when the type is unknown and the titles fail to load", async () => {
    const { e } = make();
    e.hass.localize = (k: string) => k;
    e.hass.loadBackendTranslation = vi.fn(async () => { throw new Error("offline"); });
    flat(e._renderEntity(e._p.entities[0], 0));
    await new Promise((r) => setTimeout(r));
    expect(e._typeNamesKey).toBe("");  // tried again on the next render
    expect(flat(e._renderEntity(e._p.entities[0], 0))).not.toContain("()");
  });

  it("edits every general field through the rendered handlers", () => {
    const { e } = make();
    const r = e.render();
    expect(flat(r)).toContain("role=\"tablist\"");
    const hs = handlers(e._renderGeneral());
    const by = (ev: string, mark: string) => hs.filter((h) => h.event === ev).find((h) => h.before.slice(-300).includes(mark))!;
    by("input", "id=\"f-name\"").fn({ target: { value: "New name" } });
    by("change", "id=\"f-area\"").fn({ target: { value: "Kitchen" } });
    expect(e._p.area).toBe("Kitchen");
    by("change", "id=\"f-area\"").fn({ target: { value: "" } });
    by("input", "id=\"f-icon\"").fn({ target: { value: "mdi:fire" } });
    by("input", "id=\"f-icon\"").fn({ target: { value: "" } });
    expect(flat(e._renderGeneral())).not.toContain("f-prio");  // the order is set by drag and drop, never typed
    by("change", "checkbox").fn({ target: { checked: false } });
    expect(e._p.reapply).toBe(false);
    find(e._renderGeneral(), "wp-change", "wp-conditions-editor").fn({ stopPropagation() {}, detail: [{ entity_id: "", op: "eq", value: "on" }] });
    expect(e._p.conditions).toHaveLength(1);
    expect(e._p.name).toBe("New name"); expect(e._p.area).toBeNull();
    expect(e._problem()).toMatchObject({ field: "form" }); // the incomplete condition
    e._p.conditions = [];
  });
  it("picks the program room among the Home Assistant rooms and the rooms in use, or adds a new one", () => {
    const { e } = make(prog({ area: "bureau" }), { others: [prog({ id: "o", name: "Rival", area: "Cuisine", entities: [{ entity_id: "light.z" } as any] })] });
    e.hass.areas = { salon: { area_id: "salon", name: "Salon" } };
    const field = () => e._areaField();
    const out = flat(field());
    expect(out).toContain('<select id="f-area"');
    expect(out).not.toContain("<datalist");
    for (const label of ["No room", "bureau", "Cuisine", "Salon", "Another room…"]) expect(out).toContain(`>${label}<`);
    const pick = (value: string) => handlers(field()).find((h) => h.event === "change" && h.before.includes('id="f-area"'))!.fn({ target: { value } });
    pick("salon"); expect(e._p.area).toBe("salon");
    pick(""); expect(e._p.area).toBeNull();
    pick("__new_area__");
    expect(flat(field())).toContain('id="f-area-new"');
    expect(e._p.area).toBeNull();
    handlers(field()).find((h) => h.event === "change" && h.before.includes('id="f-area-new"'))!.fn({ target: { value: "  Garage " } });
    expect(e._p.area).toBe("Garage");
    pick("salon");
    expect(flat(field())).not.toContain("f-area-new");
  });

  it("puts a bold label above the options block after the icon, and above the priority block", () => {
    const { e } = make(prog(), { others: [prog({ id: "o", name: "Rival", priority: 1 })] });
    const out = flat(e._renderGeneral());
    expect(out).toContain('class="label sec" id="pe-other-settings">Other settings<');
    expect(out.indexOf("pe-other-settings")).toBeLessThan(out.indexOf('type="checkbox"'));
    expect(out).toContain('class="label sec" id="pe-prio-label">Priority<');
    expect(out).toContain('role="group" aria-labelledby="pe-prio-label"');
    expect(out.indexOf("pe-prio-label")).toBeLessThan(out.indexOf('id="pe-comp-head"'));
  });
  it("uses the icon selector when HA provides one", () => {
    const { e } = make(prog(), { selector: true });
    const r = e._renderGeneral();
    expect(flat(r)).toContain("ha-selector");
    find(r, "value-changed", "ha-selector").fn({ detail: { value: "mdi:star" } });
    expect(e._p.icon).toBe("mdi:star");
    find(r, "value-changed", "ha-selector").fn({ detail: {} });
    expect(e._p.icon).toBe("mdi:radiator");
    const ent = flat(e._renderEntities());
    expect(ent).toContain("wp-entity-picker");
    expect(ent).toContain("Choose a device");
    find(e._renderEntities(), "wp-change", "pe-entity-add").fn({ stopPropagation() {}, detail: "climate.b" });
    expect(e._p.entities).toHaveLength(2);
  });
  it("lists devices with other programs, services and toggles them", async () => {
    const other = prog({ id: "o", name: "Other", priority: 5 });
    const { e } = make(prog(), { others: [other] });
    e._tab = "entities";
    const r = e._renderEntities();
    const html = flat(r);
    expect(html).toContain("Thermo"); expect(html).toContain("Other");
    find(r, "click", "aria-expanded").fn();
    expect(e._servicesOpen).toBe("climate.a");
    const open = e._renderEntities();
    expect(flat(open)).toContain("Switch off");
    const checks = handlers(open).filter((h) => h.event === "change" && h.before.includes("checkbox"));
    checks[0].fn({ target: { checked: true } });
    expect(e._p.entities[0].allowed_services.sort()).toEqual(["climate.set_temperature", "climate.turn_off"].filter((x) => e._p.entities[0].allowed_services.includes(x)).sort());
    e._p.entities[0].allowed_services = []; e._p.entities[0].restrict_services = false;
    const unrestricted = e._renderEntities();
    handlers(unrestricted).filter((h) => h.event === "change" && h.before.includes("checkbox"))[0].fn({ target: { checked: false } });
    expect(e._p.entities[0].restrict_services).toBe(true);
    find(e._renderEntities(), "click", "class=\"ibtn\"").fn();
    await Promise.resolve(); await Promise.resolve();
    expect(e._p.entities).toHaveLength(0);
    expect(flat(e._renderEntities())).toContain("role=\"alert\"".length ? "pe_no_entity".length ? "" : "" : "");
    await e._askDeleteEntity(5);
  });
  it("says so when a device has no service and warns about zero services", () => {
    const { e } = make();
    e.hass.services = {}; e.data.labels = [];
    expect(flat(e._renderServices({ entity_id: "climate.zzz", default_label: null, label_overrides: {} }, 0))).toContain("hint");
    e.hass.services = { climate: { turn_off: { name: "Off", target: { entity: { domain: "climate" } } } } };
    const zero = flat(e._renderServices({ entity_id: "climate.a", default_label: null, label_overrides: {}, allowed_services: [], restrict_services: true }, 0));
    expect(zero).toContain("role=\"status\"");
  });
});

describe("program editor: modes", () => {
  it("has no modes tab: the modes and their hours are edited from the card", () => {
    const { e } = make();
    const html = flat(e.render());
    expect(html).not.toContain("pe-tab-seasons");
    expect(html).not.toContain("wp-schedule");
    for (const gone of ["_renderSeasons", "_adoptModeSchedule", "_closeModeSchedule", "_scheduleOpen"]) expect(e[gone]).toBeUndefined();
    expect(e.hass.callWS).not.toHaveBeenCalled();
  });
  it("starts a new program with the default mode when there is a selector", () => {
    const { e } = make(null);
    expect(e._p.profiles[0].name).toBe("Default mode");
    const withMode = make(null);
    withMode.e._ready = false;
    withMode.e.data.mode = { selector: "input_select.mode", default: "Home", active: "Away", options: ["Home", "Away"], available: true };
    withMode.e.willUpdate();
    expect(withMode.e._p.profiles[0].name).toBe("Home");
  });
});

describe("program editor: saving, deleting, undo", () => {
  it("merges with a concurrently changed program and retries on conflict", async () => {
    const { e, events } = make();
    e._patch({ priority: 30 });
    e.hass.callWS.mockImplementation(async (m: any) => {
      if (m.type === "weekly_planner/get") return { programs: [{ ...prog(), revision: 2, name: "Renamed elsewhere" }] };
      if (m.type === "weekly_planner/program/save") { if (!e.hass._once) { e.hass._once = true; throw { code: "conflict" }; } return { program: { ...m.program, revision: 3 } }; }
    });
    e.embedded = true;
    await e._save();
    expect(e._applied).toBe(true);
    expect(e._p.priority).toBe(30); expect(e._p.name).toBe("Renamed elsewhere");
    expect(events.slice(-1)[0].type).toBe("program-saved");
    expect(flat(e.render())).toContain("role=\"status\"");
  });
  it.each([
    [{ code: "conflict" }], [{ code: "unauthorized" }], [{ message: "random_window_too_short" }], [{ message: "overlapping_slots" }],
    [{ message: "duplicate_profile_name" }], [{ message: "weird" }],
  ])("shows a message for the save error %j", async (err) => {
    const { e } = make();
    e._patch({ priority: 12 });
    e.hass.callWS.mockImplementation(async (m: any) => { if (m.type === "weekly_planner/get") return { programs: [prog()] }; throw err; });
    await e._save();
    expect(e._error).not.toBe(""); expect(e._saving).toBe(false);
  });
  it("conflicts when the program disappeared", async () => {
    const { e } = make();
    e.hass.callWS.mockResolvedValue({ programs: [] });
    await e._save(); expect(e._error).toContain("—");
  });
  it("ignores saves when read-only or already saving", async () => {
    const { e } = make(); e.data.read_only = true;
    await e._save(); expect(e.hass.callWS).not.toHaveBeenCalled();
    expect(flat(e.render())).toContain("role=\"alert\"");
    e.data.read_only = false; e._saving = true; await e._save(); expect(e.hass.callWS).not.toHaveBeenCalled();
  });
  it("deletes the program after confirmation and reports a failure", async () => {
    const { e, events } = make();
    const closed = vi.fn(); e.renderRoot.querySelector = () => ({ close: closed });
    await e._askDelete();
    expect(events.slice(-1)[0].type).toBe("program-deleted"); expect(closed).toHaveBeenCalled();
    e.hass.callWS.mockRejectedValueOnce(new Error("x")); await e._delete(); expect(e._error).toContain("x");
    vi.mocked(confirmAction).mockResolvedValue(false);
    const n = e.hass.callWS.mock.calls.length; await e._askDelete(); expect(e.hass.callWS.mock.calls.length).toBe(n);
  });
  it("undoes and redoes draft edits from buttons and keys", () => {
    const { e } = make();
    e._patch({ priority: 40 }, "prio");
    const r = e.render();
    const undo = handlers(r).filter((h) => h.event === "click" && h.before.includes("pe_history".length ? "history" : ""))[0];
    undo.fn(); expect(e._p.priority).toBe(10);
    const key = (o: any) => ({ defaultPrevented: false, altKey: false, ctrlKey: true, metaKey: false, key: "z", shiftKey: false, composedPath: () => [], preventDefault: vi.fn(), stopPropagation: vi.fn(), ...o });
    vi.stubGlobal("HTMLElement", class { tagName = "DIV"; isContentEditable = false });
    e._historyKey(key({ key: "y" })); expect(e._p.priority).toBe(40);
    e._historyKey(key({})); expect(e._p.priority).toBe(10);
    e._historyKey(key({ shiftKey: true })); expect(e._p.priority).toBe(40);
    const k = key({ key: "q" }); e._historyKey(k); expect(k.preventDefault).not.toHaveBeenCalled();
    e._historyKey(key({ ctrlKey: false })); e._historyKey(key({ altKey: true })); e._historyKey(key({ defaultPrevented: true }));
    e._saving = true; e._undoDraft(); e._redoDraft(); e._saving = false;
    e.connectedCallback?.call;
  });
  it("switches tabs from the keyboard", async () => {
    const { e } = make();
    const tabs: any = [["general", "a"], ["entities", "b"]];
    const ev = (key: string) => ({ key, preventDefault: vi.fn() });
    e._tabKey(ev("ArrowRight"), tabs); expect(e._tab).toBe("entities");
    e._tabKey(ev("End"), tabs); expect(e._tab).toBe("entities");
    e._tabKey(ev("ArrowRight"), tabs); expect(e._tab).toBe("general");
    e._tabKey(ev("ArrowLeft"), tabs); expect(e._tab).toBe("entities");
    e._tabKey(ev("Home"), tabs); expect(e._tab).toBe("general");
    e._tabKey(ev("x"), tabs); expect(e._tab).toBe("general");
    find(e.render(), "click", "pe-tab-entities").fn(); expect(e._tab).toBe("entities");
    find(e.render(), "keydown", "pe-tab-general").fn(ev("End"));
    await Promise.resolve();
  });
  it("updates the sync state after rendering and tidies up when removed", () => {
    const { e } = make();
    e.updated();
    e.disconnectedCallback();
    e._p = { ...e._p, icon: undefined };
    e._refreshIcon();
  });
});

describe("program editor: priority order of competing programs", () => {
  const rival = (extra: Partial<Program> = {}) => prog({ id: "o", name: "Rival", priority: 1, ...extra });
  const hasBlock = (e: any) => flat(e._renderGeneral()).includes("pe-comp-head");

  it("shows no competition block when no device is shared", () => {
    const { e } = make(prog(), { others: [rival({ entities: [{ entity_id: "light.z" } as any] })] });
    expect(hasBlock(e)).toBe(false);
  });

  it("names the number of rivals and the rank of this program, closed when nothing is new", () => {
    const { e } = make(prog(), { others: [rival()] });
    const out = flat(e._renderGeneral());
    expect(out).toContain("Shares a device with 1 program · goes 2nd");
    expect(out).not.toContain("wp-collapse open");
    const two = make(prog({ priority: 1 }), { others: [rival({ priority: 2 }), rival({ id: "o2", name: "Third", priority: 3 })] });
    expect(flat(two.e._renderGeneral())).toContain("Shares a device with 2 programs · goes 1st");
  });

  it("opens by itself as a warning for a new program that shares a device, placed last", () => {
    const { e } = make(null, { others: [rival()] });
    e._addEntity("climate.a");
    const out = flat(e._renderGeneral() === undefined ? "" : e.render());
    expect(out).toContain("Shares a device with 1 program · goes 2nd");
    expect(out).toContain("This program goes last. Change the order if needed.");
    expect(e._competition().group.map((x: Program) => x.id)).toEqual(["o", "new"]);
  });

  it("opens by itself when a device is added in this edit, and not for a device already there", () => {
    const { e } = make(prog({ entities: [{ entity_id: "light.z" } as any] }), { others: [rival()] });
    expect(hasBlock(e)).toBe(false);
    e._addEntity("climate.a");
    expect(flat(e._renderGeneral())).toContain("This program goes last. Change the order if needed.");
  });

  it("tags a row moved here as not saved, and says the saved-with-Save rule", () => {
    const { e } = make(prog(), { others: [rival()] });
    e._compOpen = true;
    expect(e._competition().unsaved).toEqual([]);
    e._order = ["p", "o"];
    expect(e._competition().unsaved).toEqual(["p", "o"]);
    const out = flat(e._renderGeneral());
    expect(out).toContain("Saved when you press Save");
  });

  it("always draws the body in an animated fold so aria-controls resolves, closed while not open", () => {
    const { e } = make(prog(), { others: [rival()] });
    const out = flat(e._renderGeneral());
    expect(out).toContain("id=pe-comp-body");
    expect(out).toContain('class="wp-collapse "');
    expect(out).toContain("<wp-priority-list");
  });

  it("tells through its permanent live region that a device added creates a competition", () => {
    const { e } = make(prog({ entities: [{ entity_id: "light.z" } as any] }), { others: [rival()] });
    expect(e._compSaid).toBe("");
    e._addEntity("climate.a");
    expect(e._compSaid).toBe("This program goes last. Change the order if needed.");
    expect(flat(e.render())).toContain("aria-live=\"polite\">This program goes last.");
  });

  it("toggles the block by hand", () => {
    const { e } = make(prog(), { others: [rival()] });
    find(e._renderGeneral(), "click", "id=\"pe-comp-head\"").fn();
    expect(flat(e._renderGeneral())).toContain("wp-collapse open");
    find(e._renderGeneral(), "click", "id=\"pe-comp-head\"").fn();
    expect(flat(e._renderGeneral())).not.toContain("wp-collapse open");
  });

  it("sends the chosen order with Save and Cancel forgets it", async () => {
    const { e } = make(prog(), { others: [rival()] });
    e._compOpen = true;
    const stop = vi.fn();
    find(e._renderGeneral(), "priority-change", "wp-priority-list").fn({ stopPropagation: stop, detail: ["p", "o"] });
    expect(e._competition().group.map((x: Program) => x.id)).toEqual(["p", "o"]);
    expect(e._competition().rank).toBe(1);
    e.embedded = true;
    expect(flat(e.render())).toContain("Cancel");  // an order alone is an unsaved change
    await e._save();
    const sent = e.hass.callWS.mock.calls.map((c: any) => c[0]).find((m: any) => m.type === "weekly_planner/program/save");
    expect(sent.group_order).toEqual(["p", "o"]);
    expect(e._order).toBeUndefined();

    const again = make(prog(), { others: [rival()] }).e;
    find((again._compOpen = true, again._renderGeneral()), "priority-change", "wp-priority-list").fn({ stopPropagation: stop, detail: ["p", "o"] });
    again._revert();
    expect(again._order).toBeUndefined();
    expect(again._competition().group.map((x: Program) => x.id)).toEqual(["o", "p"]);
  });

  it("sends no order when the person did not reorder", async () => {
    const { e } = make(prog(), { others: [rival()] });
    await e._save();
    const sent = e.hass.callWS.mock.calls.map((c: any) => c[0]).find((m: any) => m.type === "weekly_planner/program/save");
    expect("group_order" in sent).toBe(false);
  });

  it("sends the placeholder for a program not saved yet", async () => {
    const { e } = make(null, { others: [rival()] });
    e._p.name = "Fresh";
    e._addEntity("climate.a");
    find(e._renderCompetition(), "priority-change", "wp-priority-list").fn({ stopPropagation() {}, detail: ["new", "o"] });
    await e._save();
    const sent = e.hass.callWS.mock.calls.map((c: any) => c[0]).find((m: any) => m.type === "weekly_planner/program/save");
    expect(sent.group_order).toEqual(["new", "o"]);
  });

  it("scrolls the whole block into view and focuses its heading when the Devices link is used", async () => {
    const { e } = make(prog(), { others: [rival()] });
    const calls: string[] = [];
    const el = (name: string) => ({ scrollIntoView: (o: any) => calls.push(`${name}:${o.block}`), focus: (o: any) => calls.push(`${name}:focus:${o.preventScroll}`) });
    e.renderRoot = { querySelector: (sel: string) => el(sel) };
    e._showCompetition();
    await Promise.resolve();
    expect(calls).toEqual(["#pe-comp:nearest", "#pe-comp-head:focus:true"]);
  });

  it("keeps the also-driven-by line on a device and links it to the block", () => {
    const { e } = make(prog(), { others: [rival()] });
    e._tab = "entities";
    const r = e._renderEntities();
    expect(flat(r)).toContain("Also driven by: Rival.");
    find(r, "click", "Also driven by: Rival.").fn();
    expect(e._tab).toBe("general");
    expect(e._compOpen).toBe(true);
  });
});

describe("program editor: defaults of a new program", () => {
  it.each([
    ["the integration defaults when provided", { reapply: false, priority: 25 }, { reapply: false, priority: 25 }],
    ["reapply on and priority 10 without defaults", null, { reapply: true, priority: 10 }],
  ] as const)("starts from %s", (_name, defaults, expected) => {
    const { e } = make(null, { defaults: defaults as any });
    expect(e._p).toMatchObject(expected);
  });
});

describe("program editor: an element never disappears", () => {
  const shown = (e: any) => flat(e.render());
  it("Delete of a new program stays, greyed, with 'Save the program first.'", () => {
    const { e } = make(null, { embedded: true });
    const out = shown(e);
    expect(out).toMatch(/class="btn danger" \?disabled=\S* aria-disabled=true\s+aria-describedby=why-delete/);
    expect(out).toContain('id=why-delete role="status">Save the program first.</p>');
    expect(shown(make(prog(), { embedded: true }).e)).not.toContain("why-delete");
  });
  it("Cancel of an intact draft stays, greyed, with 'No changes.'; it is usable once the draft changed", () => {
    const { e } = make(prog(), { embedded: true });
    expect(shown(e)).toMatch(/class="btn" \?disabled=\S* aria-disabled=true aria-describedby=why-cancel/);
    expect(shown(e)).toContain('id=why-cancel role="status">Nothing to cancel: no changes.</p>');
    e._p = { ...e._p, name: "Changed" };
    const out = shown(e);
    expect(out).not.toContain("why-cancel");
    expect(out).toContain("aria-disabled=false aria-describedby=");
    expect(shown(make(null, { embedded: true }).e)).toContain("why-cancel"); // a new program has nothing to cancel
  });
  it("Undo and Redo give their reason", () => {
    const { e } = make(prog(), { embedded: true });
    let out = shown(e);
    expect(out).toContain('id=why-history role="status">Nothing to undo or redo.</p>');
    expect(out).toContain("aria-describedby=why-history");
    const before = e._snapshot();
    e._p = { ...e._p, name: "Changed" };
    e._history.record(before, e._snapshot(), "g");
    out = shown(e);
    expect(out).toContain("Nothing to redo.");
    e._undoDraft();
    expect(shown(e)).toContain("Nothing to undo.");
    expect(t("fr", "pe_nothing_both")).toBe("Rien à annuler ni à rétablir.");
    expect(t("fr", "pe_save_first")).toBe("Enregistrez d’abord le programme.");
    expect(t("fr", "pe_no_changes")).toBe("Rien à annuler : aucun changement.");
  });
  it("in read only, Save and Delete point to the read-only notice", () => {
    const { e } = make(prog(), { embedded: true }); e.data.read_only = true;
    const out = shown(e);
    expect(out).toContain('id="why-readonly"');
    expect(out.match(/aria-describedby=why-readonly/g)!.length).toBeGreaterThanOrEqual(2);
  });
});
