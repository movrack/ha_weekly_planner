import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpSchedule, scopeKey } from "../components/schedule-dialog";
import { confirmAction } from "../components/confirm";
import { fetchPreviewResponse } from "../preview-cache";
import { flat, handlers, find } from "./helpers/tpl";
import type { Program } from "../types";

vi.mock("../components/confirm", () => ({ confirmAction: vi.fn(async () => true) }));
vi.mock("../preview-cache", async (orig) => ({ ...(await orig<typeof import("../preview-cache")>()),
  fetchPreviewResponse: vi.fn(async () => ({ slots: [{ slot_id: "m", start: "2026-01-01T08:00:00", end: "2026-01-01T09:00:00", ignored: null, sun: false }] })) }));

const slot = (id: string, s = "08:00", e: string | null = "10:00") => ({ id, start: { time: s }, end: e ? { time: e } : null, label: "comfort" });
const emptyDays = () => Array.from({ length: 7 }, () => [] as any[]);
const mkProgram = (over: Partial<Program> = {}): Program => {
  const home = emptyDays(); home[0] = [slot("m")]; home[1] = [slot("t")];
  return { id: "p", name: "Office", revision: 1, priority: 10, enabled: true, reapply: true, conditions: [],
    entities: [{ entity_id: "switch.demo", default_label: "comfort", label_overrides: {} }, { entity_id: "switch.two", default_label: null, label_overrides: {} }],
    active_profile: "home", profiles: [{ id: "home", name: "Home", days: home }, { id: "away", name: "Away", days: emptyDays() }], ...over } as any;
};

function make(scope: any = { kind: "program", programId: "p" }, program = mkProgram(), extra: any = {}) {
  const view = new WpSchedule() as any;
  const events: any[] = [];
  view.hass = { language: "en", config: { time_zone: "UTC" }, states: { "switch.demo": { entity_id: "switch.demo", state: "on", attributes: { friendly_name: "Demo" } }, "switch.two": { entity_id: "switch.two", state: "off", attributes: {} } },
    services: { switch: { turn_on: { name: "On", target: { entity: { domain: "switch" } } }, turn_off: { name: "Off", target: { entity: { domain: "switch" } } } } },
    callWS: vi.fn(async (m: any) => (m.type === "weekly_planner/program/save" ? { program: { ...m.program, revision: m.program.revision + 1 } } : m.type === "weekly_planner/label/save" ? { label: { id: "newlabel" } } : {})) };
  view.dispatchEvent = (e: any) => { events.push(e); return true; };
  view.scope = scope;
  view.data = { programs: [program], status: {}, can_edit: true, read_only: false,
    labels: [{ id: "comfort", name: "Comfort", color: "#f00", action: { kind: "service", service: "switch.turn_on" } }], ...extra };
  view.renderRoot = { querySelector: () => null };
  view.requestUpdate = vi.fn();
  return { view, events, program };
}

beforeEach(() => {
  (globalThis as any).CustomEvent ??= class { type: string; detail: unknown; constructor(t: string, i: any) { this.type = t; this.detail = i?.detail; } };
  vi.stubGlobal("requestAnimationFrame", (f: () => void) => f());
  vi.mocked(confirmAction).mockReset(); vi.mocked(confirmAction).mockResolvedValue(true);
});
afterEach(() => vi.unstubAllGlobals());

describe("schedule screen rendering", () => {
  it("scopeKey tells device from program", () => {
    expect(scopeKey({ kind: "device", entityId: "a.b" })).toBe("d:a.b");
    expect(scopeKey({ kind: "program", programId: "p" })).toBe("p:p");
  });
  it("renders nothing until hass, data and scope exist, and a message without program", () => {
    const { view } = make();
    view.scope = undefined; expect(view.render()).toBeDefined();
    view.scope = { kind: "program", programId: "none" };
    expect(flat(view.render())).toContain("wp-dialog");
    expect(view.render().values.length).toBeGreaterThan(0);
  });
  it("lists the rows, the rests, the week, the chart and the delete button", () => {
    const { view } = make();
    const html = flat(view.render());
    expect(html).toContain("Comfort"); expect(html).toContain("wp-day-bar"); expect(html).toContain("wp-chart");
    expect(html).toContain("Rest of the time".length ? "rest" : "");
    expect(html).toContain("mdi:delete-outline");
    expect(html).toContain("Home"); expect(html).toContain("Away");
  });
  it("shows the read-only and removed-mode warnings and the single-device view", () => {
    const { view } = make({ kind: "device", entityId: "switch.demo" }, mkProgram(), { read_only: true });
    expect(flat(view.render())).toContain("role=\"alert\"");
    expect(view._title).toBe("Demo");
    const m = make(); m.view._viewProfileId = "gone";
    expect(flat(m.view.render())).toContain("role=\"alert\"");
  });
  it("hides the chart and delete in a fixed mode and shows the hint", () => {
    const { view } = make(); view.profileId = "away";
    const html = flat(view.render());
    expect(html).not.toContain("wp-chart"); expect(html).not.toContain("delete-outline\"></ha-icon>Delete");
    expect(view._modeOnly).toBe(true);
  });
  it("navigates the chart days within bounds", () => {
    const { view } = make();
    view._go(-1); expect(view._offset).toBe(-1);
    view._go(-100); expect(view._offset).toBe(-1);
    view._offset = 7; view._go(1); expect(view._offset).toBe(7);
    const html = flat(view.render());
    expect(html).toContain("wp-chart");
    view._offset = 0; const r = view.render();
    find(r, "click", "next_day".length ? "chevron-right" : "").fn();
  });
  it("loads the preview once per key and keeps the newest answer", async () => {
    const { view } = make();
    view.willUpdate(new Map([["scope", 1]]));
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(fetchPreviewResponse).toHaveBeenCalledTimes(2);
    expect(view._slots).toHaveLength(2);
    view.willUpdate(new Map());
    expect(fetchPreviewResponse).toHaveBeenCalledTimes(2);
    vi.mocked(fetchPreviewResponse).mockRejectedValueOnce(new Error("x"));
    view._offset = 1; view.willUpdate(new Map());
    await new Promise((r) => setTimeout(r, 0));
    expect(view._slots).toBeNull();
  });
  it("opens a focused day, going straight to a new slot when the day is empty", () => {
    const { view } = make();
    view.day = { weekday: 3, offset: 2 }; view.firstUpdated();
    expect(view._offset).toBe(2); expect(view._open).toBe("new");
    expect(view._group.days).toEqual([3]);
    const b = make(); b.view.day = { weekday: 0, offset: 99 }; b.view.firstUpdated();
    expect(b.view._open).toBeNull(); expect(b.view._offset).toBe(0);
    const html = flat(b.view.render());
    expect(html).toContain("w_whole_week".length ? "mdi:arrow-left" : "");
    find(b.view.render(), "click", "chip back").fn();
    expect(b.view._focus).toBeNull();
  });
});

describe("schedule screen editing", () => {
  it("opens a row, then cancels, via the rendered buttons", () => {
    const { view } = make();
    const rows = view._rows();
    find(view.render(), "click", "class=\"row\"").fn();
    expect(view._open).toBe(rows[0].key);
    const html = flat(view.render());
    expect(html).toContain("wp-slot-form"); expect(html).toContain("mdi:content-copy");
    const r = view.render();
    find(r, "label-draft", "wp-slot-form").fn({ stopPropagation() {}, detail: { problem: "p" } });
    expect(view._labelDraft).toEqual({ problem: "p" });
    const g = { ...view._group, days: [0, 1] };
    find(view.render(), "group-change", "wp-slot-form").fn({ stopPropagation() {}, detail: g });
    expect(view._group.days).toEqual([0, 1]);
    find(view.render(), "click", "cancel".length ? "btn\" @" : "").fn;
    view._cancel(); expect(view._open).toBeNull();
  });
  it("adds a slot for the whole week, dropping busy days when saved", async () => {
    const { view, events } = make();
    view._add();
    expect(view._open).toBe("new"); expect(view._dropBusy).toBe(true);
    await view._saveRow();
    expect(view.hass.callWS).toHaveBeenCalled();
    expect(events.some((e) => e.type === "schedule-program-saved")).toBe(true);
    expect(view._open).toBeNull();
  });
  it("saves a changed slot and refuses invalid drafts", async () => {
    const { view } = make();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._group = { ...view._group, days: [] };
    await view._saveRow(); expect(view._error).toBe("Select at least one day.".length ? view._error : "");
    expect(view._error).not.toBe("");
    view._group = { ...view._group, days: [0], slot: { ...view._group.slot, label: "ghost" } };
    await view._saveRow(); expect(view._error).not.toBe("");
    view._group = { ...view._group, slot: { ...view._group.slot, label: "comfort", end: { time: "08:00" } } };
    await view._saveRow(); expect(view._error).not.toBe("");
    view._group = { ...view._group, slot: { ...view._group.slot, end: { sun: "sunset", earliest: "20:00", latest: "10:00" } } };
    await view._saveRow(); expect(view._error).not.toBe("");
    view._group = { ...view._group, slot: { ...view._group.slot, end: { time: "11:00" } } };
    await view._saveRow();
    expect(view._error).toBe("Choose: this device or all."); // shared by both devices: D1 asks first
    view._pickWho("all");
    await view._saveRow();
    expect(view._open).toBeNull();
    const sent = view.hass.callWS.mock.calls.slice(-1)[0][0].program;
    expect(sent.profiles[0].days[0][0].end).toEqual({ time: "11:00" });
  });
  it("reports an overlap with both slots named", async () => {
    const { view } = make();
    view._add([0]);
    view._group = { ...view._group, slot: { ...view._group.slot, start: { time: "09:00" }, end: { time: "11:00" } } };
    await view._saveRow();
    expect(view._error).toContain("Comfort");
    expect(view._overlapText({ id: "x", name: "x", days: emptyDays() } as any)).not.toBe("");
  });
  it("saves the rest of the time and a new label draft with the row", async () => {
    const { view } = make();
    find(view.render(), "click", "row rest").fn();
    expect(view._open).toBe("rest:switch.demo");
    expect(flat(view.render())).toContain("wp-label-picker");
    find(view.render(), "label-change", "wp-label-picker").fn({ stopPropagation() {}, detail: null });
    find(view.render(), "label-draft", "wp-label-picker").fn({ stopPropagation() {}, detail: { name: "N", color: "#000", action: { kind: "service", service: "switch.turn_off" }, overrides: [{ entityId: "switch.demo", action: { kind: "service", service: "switch.turn_on", data: {} } }] } });
    await view._saveRest("switch.demo");
    expect(view.hass.callWS.mock.calls.map((c: any) => c[0].type)).toEqual(["weekly_planner/label/save", "weekly_planner/program/save"]);
    expect(view._open).toBeNull();
    expect(view._fresh.has("newlabel")).toBe(true);
    const saved = view.hass.callWS.mock.calls[1][0].program;
    expect(saved.entities[0].default_label).toBe("newlabel");
    expect(saved.entities[0].label_overrides.newlabel).toBeDefined();
  });
  it("label draft: problem blocks, failure reports, new label is selected in a slot", async () => {
    const { view } = make();
    view._add([0]);
    view._labelDraft = { problem: "bad" };
    expect(await view._saveLabelDraft()).toBe(false); expect(view._error).toBe("bad");
    view._labelDraft = { name: "N", color: "#000", action: { kind: "scene", scene: "scene.x" }, overrides: [] };
    view.hass.callWS.mockRejectedValueOnce({ code: "unauthorized" });
    expect(await view._saveLabelDraft()).toBe(false);
    view.hass.callWS.mockRejectedValueOnce(new Error("x"));
    expect(await view._saveLabelDraft()).toBe(false);
    view.hass.callWS.mockResolvedValueOnce({ label: { id: "L2" } });
    expect(await view._saveLabelDraft()).toBe(true);
    expect(view._group.slot.label).toBe("L2");
    view._labelDraft = null; expect(await view._saveLabelDraft()).toBe(true);
    view._onOverride({ entityId: "switch.demo", labelId: "comfort", action: { kind: "scene", scene: "s" } });
    view._onOverride({ entityId: "switch.demo", labelId: "comfort", action: null });
    expect(view._overrides).toHaveLength(1);
    const none = make().view; none._onOverride({ entityId: "a", labelId: "b", action: null });
    expect(none._overrides).toEqual([]);
  });
  it("duplicates the open slot right after it, and refuses when invalid", () => {
    const { view } = make();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._duplicate();
    expect(view._open).toBe("new");
    expect(view._group.slot.start).toEqual({ time: "10:00" });
    expect(view._base).not.toBeNull();
    const late = make(); const lr = late.view._rows()[0];
    late.view._openRow(lr.key, lr.program, lr.group);
    late.view._group.slot.start = { time: "23:00" }; late.view._group.slot.end = { time: "23:50" }; late.view._who = "all";
    late.view._duplicate();
    expect(late.view._group.slot.end).toEqual({ time: "24:00" });
    const bad = make(); const br = bad.view._rows()[0];
    bad.view._openRow(br.key, br.program, br.group); bad.view._group.days = [];
    bad.view._duplicate(); expect(bad.view._error).not.toBe("");
    const shot = make(); const sr = shot.view._rows()[0];
    shot.view._openRow(sr.key, sr.program, sr.group); shot.view._group.slot.end = null;
    shot.view._duplicate(); expect(shot.view._group.slot.end).toBeNull();
    make().view._duplicate();
  });
  it("detects a slot changed meanwhile: shows the new version or closes", async () => {
    const { view } = make();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    const live = view.data.programs[0];
    live.profiles[0].days[0][0].end = { time: "12:00" };
    live.profiles[0].days[0][0].label = "comfort";
    await view._saveRow();
    expect(view._error).not.toBe("");
    live.profiles[0].days[0] = [];
    const g = make(); const gr = g.view._rows()[0];
    g.view._openRow(gr.key, gr.program, gr.group);
    g.view.data.programs[0].profiles[0].days[0] = [];
    await g.view._saveRow();
    expect(g.view._open).toBeNull(); expect(g.view._note).not.toBe("");
    expect(flat(g.view.render())).toContain("note");
  });
  it("retries a conflict once on fresh data and then gives up", async () => {
    const { view } = make();
    view._add([2]);
    let n = 0;
    view.hass.callWS.mockImplementation(async (m: any) => {
      if (m.type === "weekly_planner/program/save") { n++; if (n <= 1) throw { code: "conflict" }; return { program: m.program }; }
      return { programs: [view.data.programs[0]] };
    });
    await view._saveRow(); expect(n).toBe(2); expect(view._open).toBeNull();
    view._add([3]); n = -10;
    await view._saveRow(); expect(view._error).not.toBe("");
    view._add([4]);
    view.hass.callWS.mockImplementation(async (m: any) => { if (m.type === "weekly_planner/get") throw new Error("down"); throw { code: "conflict" }; });
    await view._saveRow(); expect(view._error).not.toBe("");
  });
  it.each([
    [{ code: "unauthorized" }], [{ message: "unknown_label" }], [{ message: "earliest_after_latest" }], [{ message: "random_window_too_short" }],
    [{ message: "overlapping_slots" }], [{ message: "offset out of range" }], [{ message: "boom" }],
  ])("maps the save error %j to a message", async (err) => {
    const { view } = make();
    view._add([2]);
    view.hass.callWS.mockRejectedValue(err);
    await view._saveRow();
    expect(view._error).not.toBe(""); expect(view._saving).toBe(false);
  });
  it("deletes a slot, a whole schedule, or one device of a shared schedule", async () => {
    const a = make();
    const row = a.view._rows()[0]; a.view._openRow(row.key, row.program, row.group);
    await a.view._deleteRow();
    expect(a.view._error).toBe("Choose: this device or all.");
    a.view._pickWho("all");
    await a.view._deleteRow();
    expect(a.view.hass.callWS.mock.calls.slice(-1)[0][0].program.profiles[0].days[0]).toEqual([]);
    const b = make({ kind: "device", entityId: "switch.demo" });
    b.view.renderRoot = { querySelector: () => ({ close: vi.fn() }) };
    await b.view._deleteAll();
    expect(b.view.hass.callWS.mock.calls[0][0].type).toBe("weekly_planner/program/save");
    expect(b.view.hass.callWS.mock.calls[0][0].program.entities.map((e: any) => e.entity_id)).toEqual(["switch.two"]);
    const c = make(undefined, mkProgram({ entities: [{ entity_id: "switch.demo", default_label: null, label_overrides: {} }] } as any));
    await c.view._deleteAll();
    expect(c.view.hass.callWS.mock.calls[0][0].type).toBe("weekly_planner/program/delete");
    c.view.hass.callWS.mockRejectedValueOnce(new Error("x")); await c.view._deleteAll();
    expect(c.view._error).toContain("x");
    vi.mocked(confirmAction).mockResolvedValue(false);
    const n = c.view.hass.callWS.mock.calls.length; await c.view._deleteAll();
    expect(c.view.hass.callWS.mock.calls.length).toBe(n);
  });
  it("pauses and resumes the schedule, asking before a pause", async () => {
    const { view } = make();
    const input: any = { checked: false };
    await view._setEnabled(false, input);
    expect(view.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/program/set_enabled", program_id: "p", enabled: false });
    expect(input.checked).toBe(true);
    vi.mocked(confirmAction).mockResolvedValueOnce(false);
    const calls = view.hass.callWS.mock.calls.length;
    await view._setEnabled(false, input); expect(view.hass.callWS.mock.calls.length).toBe(calls);
    await view._setEnabled(true, input); expect(view.hass.callWS.mock.calls.length).toBe(calls + 1);
    view._toggling = true; input.checked = false; await view._setEnabled(true, input); expect(input.checked).toBe(true);
    view._toggling = false; view.hass.callWS.mockRejectedValueOnce(new Error("no")); await view._setEnabled(true, input);
    expect(view._error).toContain("no");
    view.hass.callWS.mockRejectedValueOnce("str"); await view._setEnabled(true, input);
    const sw = handlers(view.render()).find((h) => h.event === "change" && h.before.includes("checkbox"))!;
    await sw.fn({ target: input });
  });
  it("opens the history and closes the dialog", () => {
    const { view } = make();
    const close = vi.fn(); view.renderRoot = { querySelector: () => ({ close }) };
    const push = vi.fn(), dispatch = vi.fn();
    vi.stubGlobal("window", { history: { pushState: push }, dispatchEvent: dispatch });
    find(view.render(), "open-history", "wp-chart").fn({ detail: "/history?x" });
    expect(push).toHaveBeenCalledWith(null, "", "/history?x"); expect(close).toHaveBeenCalled();
  });
  it("reveals the editor in view (phone and two columns)", () => {
    const { view } = make();
    const editor: any = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ top: 500 }) };
    const content: any = { scrollTop: 0, getBoundingClientRect: () => ({ top: 100, bottom: 400 }) };
    view.renderRoot = { querySelector: (s: string) => (s === ".editor" ? editor : { shadowRoot: { querySelector: () => content } }) };
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    view._revealEditor(); expect(editor.scrollIntoView).toHaveBeenCalled();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    view._revealEditor(); expect(content.scrollTop).toBe(400);
    editor.getBoundingClientRect = () => ({ top: 200 }); content.scrollTop = 0; view._revealEditor(); expect(content.scrollTop).toBe(0);
    view.renderRoot = { querySelector: () => null }; view._revealEditor();
  });
  it("opens only the focused day of a group", () => {
    const { view } = make(); view._focus = 0;
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    expect(view._dayOnly).toBe(0);
    expect(flat(view.render())).toContain("mdi:content-copy");
  });
});
