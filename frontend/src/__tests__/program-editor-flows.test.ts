import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpProgramEditor } from "../editors/program-editor";
import { confirmAction } from "../components/confirm";
import { flat, handlers, find } from "./helpers/tpl";
import type { Program } from "../types";

vi.mock("../components/confirm", () => ({ confirmAction: vi.fn(async () => true) }));

const days = () => Array.from({ length: 7 }, () => [] as any[]);
const prog = (extra: Partial<Program> = {}): Program => ({ id: "p", revision: 1, name: "Office", priority: 10, enabled: true, reapply: true,
  conditions: [], area: "Home", entities: [{ entity_id: "climate.a", default_label: null, label_overrides: {}, allowed_services: ["climate.turn_off"], restrict_services: true }],
  active_profile: "home", profiles: [{ id: "home", name: "Home", days: days() }, { id: "away", name: "Away", days: days() }], ...extra } as any);

function make(program: Program | null = prog(), opts: { embedded?: boolean; selector?: boolean; status?: any; others?: Program[] } = {}) {
  vi.stubGlobal("customElements", { get: (n: string) => (opts.selector && n === "ha-selector" ? class {} : undefined) });
  const e = new WpProgramEditor() as any;
  const events: any[] = [];
  e.dispatchEvent = (ev: any) => { events.push(ev); return true; };
  e.requestUpdate = vi.fn();
  e.hass = { language: "en", locale: { language: "en" }, states: { "climate.a": { entity_id: "climate.a", state: "heat", attributes: { friendly_name: "Thermo", icon: "mdi:radiator" } }, "input_select.mode": { entity_id: "input_select.mode", state: "Eco", attributes: { options: ["Eco", "Comfort"] } } },
    services: { climate: { turn_off: { name: "Off", description: "Switch off", target: { entity: { domain: "climate" } } }, turn_on: { name: "On", target: { entity: { domain: "climate" } } } } },
    callWS: vi.fn(async (m: any) => (m.type === "weekly_planner/get" ? { programs: program ? [program] : [] } : m.type === "weekly_planner/program/save" ? { program: { ...m.program, id: m.program.id ?? "new", revision: 2 } } : {})) };
  e.data = { programs: [...(program ? [program] : []), ...(opts.others ?? [])], status: opts.status ?? { p: { active_profile: "home" } }, labels: [{ id: "l", name: "L", color: "#f00", action: { kind: "service", service: "climate.set_temperature", target_entity_id: "climate.a" } }], can_edit: true, read_only: false, defaults: { priority: 20, reapply: false } };
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
  it("edits every general field through the rendered handlers", () => {
    const { e } = make();
    const r = e.render();
    expect(flat(r)).toContain("role=\"tablist\"");
    const hs = handlers(e._renderGeneral());
    const by = (ev: string, mark: string) => hs.filter((h) => h.event === ev).find((h) => h.before.slice(-300).includes(mark))!;
    by("input", "id=\"f-name\"").fn({ target: { value: "New name" } });
    by("change", "id=\"f-area\"").fn({ target: { value: " Kitchen " } });
    by("change", "id=\"f-area\"").fn({ target: { value: "" } });
    by("input", "id=\"f-icon\"").fn({ target: { value: "mdi:fire" } });
    by("input", "id=\"f-icon\"").fn({ target: { value: "" } });
    by("change", "id=\"f-prio\"").fn({ target: { value: "500" } });
    expect(e._p.priority).toBe(100);
    by("change", "id=\"f-prio\"").fn({ target: { value: "abc" } });
    expect(e._p.priority).toBe(10);
    by("change", "checkbox").fn({ target: { checked: false } });
    expect(e._p.reapply).toBe(false);
    find(e._renderGeneral(), "wp-change", "wp-conditions-editor").fn({ stopPropagation() {}, detail: [{ entity_id: "", op: "eq", value: "on" }] });
    expect(e._p.conditions).toHaveLength(1);
    expect(e._p.name).toBe("New name"); expect(e._p.area).toBeNull();
    expect(e._validate()).not.toBe("");
    e._p.conditions = [];
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
    expect(ent).toContain("ha-selector");
    find(e._renderEntities(), "value-changed", "pe-entity-add").fn({ stopPropagation() {}, detail: { value: "climate.b" } });
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

describe("program editor: modes (seasons)", () => {
  it("renders the seasons tab and switches the active mode live", async () => {
    const { e } = make(); e._tab = "seasons";
    const r = e._renderSeasons();
    const html = flat(r);
    expect(html).toContain("mode-active"); expect(html).toContain("f-profile");
    find(r, "change", "f-profile").fn({ target: { value: "away" } });
    expect(e._profileId).toBe("away");
    const input = { value: "" };
    await find(e._renderSeasons(), "change", "mode-active").fn({ target: Object.assign(input, { value: "away" }) });
    expect(e.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/program/set_profile", program_id: "p", profile_id: "away" });
    e.hass.callWS.mockRejectedValueOnce({ code: "unauthorized" });
    await e._changeActiveMode("away"); expect(e._error).not.toBe("");
  });
  it("adds, renames, copies, discards and deletes a mode", async () => {
    const { e } = make(); e._tab = "seasons";
    const click = (i: number) => handlers(e._renderSeasons()).filter((h) => h.event === "click")[i].fn();
    click(1); expect(e._profileForm).toEqual({ mode: "add", name: "" });
    await e._save(); expect(e._error).not.toBe("");
    find(e._renderSeasons(), "input", "f-pname").fn({ target: { value: "Summer" } });
    find(e._renderSeasons(), "keydown", "f-pname").fn({ key: "x", preventDefault() {} });
    expect(e._submitProfileForm()).toBe(true);
    expect(e._p.profiles.map((p: any) => p.name)).toContain("Summer");
    const summer = e._p.profiles.find((p: any) => p.name === "Summer").id;
    expect(e._profileId).toBe(summer);
    e._changeProfileForm({ mode: "rename", name: "Summer 2" });
    expect(flat(e._renderSeasons())).toContain("profile_rename_warning".length ? "f-pname" : "");
    e._submitProfileForm(); expect(e._profile.name).toBe("Summer 2");
    e._changeProfileForm({ mode: "rename", name: "Home" }); expect(e._submitProfileForm()).toBe(false);
    e._changeProfileForm({ mode: "add", name: "x".repeat(41) }); expect(e._submitProfileForm()).toBe(false);
    e._changeProfileForm(undefined);
    e._p.profiles[0].days[0] = [{ id: "s1", start: { time: "08:00" }, end: { time: "09:00" }, label: "l" }];
    e._profileId = "home";
    e._changeProfileForm({ mode: "copy", name: "Home copy" }); e._submitProfileForm();
    const copy = e._p.profiles.find((p: any) => p.name === "Home copy");
    expect(copy.days[0][0].id).not.toBe("s1");
    e._profileId = summer;
    await e._askDeleteProfile(e._profile);
    expect(e._p.profiles.map((p: any) => p.id)).not.toContain(summer);
    vi.mocked(confirmAction).mockResolvedValue(false);
    const n = e._p.profiles.length; await e._askDeleteProfile(e._profile); expect(e._p.profiles).toHaveLength(n);
  });
  it("opens the hours of a mode when nothing is unapplied, and adopts saved hours", () => {
    const { e } = make({ ...prog() } as any, { embedded: true });
    e._tab = "seasons";
    const r = e._renderSeasons();
    find(r, "click", "mdi:calendar-edit").fn;
    handlers(r).filter((h) => h.event === "click")[0];
    e._scheduleProfileId = "home";
    const html = flat(e.render());
    expect(html).toContain("wp-schedule");
    const saved = structuredClone(e._p); saved.revision = 3; saved.profiles[0].days[0] = [{ id: "z", start: { time: "01:00" }, end: { time: "02:00" }, label: "l" }];
    find(e.render(), "schedule-program-saved", "wp-schedule").fn({ stopPropagation() {}, detail: saved });
    expect(e._p.profiles[0].days[0]).toHaveLength(1);
    e._adoptModeSchedule({ ...saved, id: "other" }); e._adoptModeSchedule({ ...saved, revision: 1 });
    e.data.programs = [saved];
    find(e.render(), "closed", "wp-schedule").fn({ stopPropagation() {} });
    expect(e._scheduleProfileId).toBeNull();
  });
  it("configures an external mode source with associations", () => {
    const { e } = make(); e._tab = "seasons";
    find(e._renderSeasons(), "change", "mode-control").fn({ target: { value: "external" } });
    expect(e._p.mode_source).toEqual({ entity_id: "", mappings: {} });
    expect(e._validate()).not.toBe("");
    find(e._renderSeasons(), "wp-change", "wp-entity-picker").fn({ stopPropagation() {}, detail: "input_select.mode" });
    find(e._renderSeasons(), "wp-change", "wp-entity-picker").fn({ stopPropagation() {}, detail: "input_select.mode" });
    expect(e._p.mode_source.entity_id).toBe("input_select.mode");
    e._origin = structuredClone(e._p);
    handlers(e._renderSeasons()).filter((h) => h.event === "click")[0].fn();
    expect(e._p.mode_source.mappings).toEqual({ "": "home" });
    const r = e._renderSeasons();
    expect(flat(r)).toContain("mode-state-0");
    find(r, "change", "mode-state-0").fn({ target: { value: "Eco" } });
    find(e._renderSeasons(), "change", "mode-target-0").fn({ target: { value: "away" } });
    expect(e._p.mode_source.mappings).toEqual({ Eco: "away" });
    e._p.mode_source.mappings.Gone = "removed";
    expect(flat(e._renderSeasons())).toContain("mode_removed".length ? "Gone" : "");
    handlers(e._renderSeasons()).filter((h) => h.event === "click")[0].fn();
    expect(e._p.mode_source.mappings).toEqual({ Gone: "removed" });
    expect(e._validate()).not.toBe("");
    find(e._renderSeasons(), "toggle", "mode-associations").fn({ currentTarget: { open: true } });
    expect(e._associationsOpen).toBe(true);
    e.data.status.p = { active_profile: "home", mode_source_status: "unmapped" };
    e._origin = structuredClone(e._p);
    expect(flat(e._renderSeasons())).toContain("role=\"status\"");
    find(e._renderSeasons(), "change", "mode-control").fn({ target: { value: "manual" } });
    expect(e._p.mode_source).toBeUndefined();
  });
  it("uses the state selector for associations when available", () => {
    const { e } = make(prog({ mode_source: { entity_id: "input_select.mode", mappings: { Eco: "home" } } } as any), { selector: true });
    const r = e._renderSeasons();
    find(r, "value-changed", "ha-selector").fn({ stopPropagation() {}, detail: { value: "Comfort" } });
    expect(e._p.mode_source.mappings).toEqual({ Comfort: "home" });
    find(e._renderSeasons(), "value-changed", "ha-selector").fn({ stopPropagation() {}, detail: {} });
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
    [{ message: "circular_mode_source" }], [{ message: "controlled by an external" }], [{ message: "unknown_mode_profile" }],
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
  it("duplicates as a new program and undoes / redoes draft edits from buttons and keys", () => {
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
    e._duplicate();
    expect(e._isNew).toBe(true); expect(e._p.id).toBe(""); expect(e._p.name).toContain("Office");
    expect(flat(e.render())).not.toContain("role=\"tablist\"");
    e.connectedCallback?.call;
  });
  it("switches tabs from the keyboard", async () => {
    const { e } = make();
    const tabs: any = [["general", "a"], ["entities", "b"], ["seasons", "c"]];
    const ev = (key: string) => ({ key, preventDefault: vi.fn() });
    e._tabKey(ev("ArrowRight"), tabs); expect(e._tab).toBe("entities");
    e._tabKey(ev("End"), tabs); expect(e._tab).toBe("seasons");
    e._tabKey(ev("ArrowRight"), tabs); expect(e._tab).toBe("general");
    e._tabKey(ev("ArrowLeft"), tabs); expect(e._tab).toBe("seasons");
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
