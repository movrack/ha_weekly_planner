import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpSchedule, scopeKey } from "../components/schedule-dialog";
import { chooseAction, confirmAction, pauseChoice } from "../components/confirm";
import { fetchPreviewResponse } from "../preview-cache";
import { t } from "../i18n";
import { flat, handlers, find, valuesAfter } from "./helpers/tpl";
import type { Program } from "../types";

vi.mock("../components/confirm", () => ({ confirmAction: vi.fn(async () => true), pauseChoice: vi.fn(async () => "none"), chooseAction: vi.fn(async () => "source") }));
vi.mock("../preview-cache", async (orig) => ({ ...(await orig<typeof import("../preview-cache")>()),
  fetchPreviewResponse: vi.fn(async () => ({ slots: [{ slot_id: "m", start: "2026-01-01T08:00:00", end: "2026-01-01T09:00:00", ignored: null, sun: false }] })) }));

const slot = (id: string, s = "08:00", e: string | null = "10:00") => ({ id, start: { time: s }, end: e ? { time: e } : null, label: "comfort" });
const emptyDays = () => Array.from({ length: 7 }, () => [] as any[]);
const mkProgram = (over: Partial<Program> = {}): Program => {
  const home = emptyDays(); home[0] = [slot("m")]; home[1] = [slot("t")];
  return { id: "p", name: "Office", revision: 1, priority: 10, enabled: true, reapply: true, conditions: [],
    entities: [{ entity_id: "switch.demo", default_label: "comfort", label_overrides: {} }, { entity_id: "switch.two", default_label: null, label_overrides: {} }],
    profiles: [{ id: "home", name: "Home", days: home }, { id: "away", name: "Away", days: emptyDays() }], ...over } as any;
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
  vi.mocked(pauseChoice).mockReset(); vi.mocked(pauseChoice).mockResolvedValue("none");
  vi.mocked(chooseAction).mockReset(); vi.mocked(chooseAction).mockResolvedValue("source" as any);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

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
    expect(flat(view.render())).not.toContain("wp-label-picker");
    expect(view.render().values.length).toBeGreaterThan(0);
  });
  it("lists the rows, the rests, the week, the chart and the delete button", () => {
    const { view } = make();
    view.data.programs[0].entities.push({ entity_id: "light.third", default_label: null, label_overrides: {} });
    const html = flat(view.render());
    expect(view._rows().map((row: any) => [row.key, row.group.days, row.group.slot.id])).toEqual([
      ["p|m", [0, 1], "m"],
    ]);
    expect(html).toContain("Comfort"); expect(html).toContain("wp-day-bar"); expect(html).toContain("wp-chart");
    expect(html).toContain("–");
    expect(html).toContain("·");
    expect(html).toContain("Mon"); expect(html).toContain("Tue");
    expect(html).toContain('class="l2"');
    expect(html).toContain("#f00");
    expect(html).toContain(t("en", "also_short", { names: "switch.two, light.third" }));
    expect(html.match(/Office/g)).toHaveLength(1);
    expect(html).toContain("rest");
    expect(html).not.toContain("wp-slot-form");
    expect(html).toContain("mdi:delete-outline");
    expect(html).not.toContain("tablist");
    view.day = { weekday: 0, offset: 0 };
    view.firstUpdated();
    expect(flat(view.render())).not.toContain('class="l2"');
  });
  it("renders an unlabeled one-device row as time only", () => {
    const program = mkProgram({ entities: [{ entity_id: "switch.demo", default_label: null, label_overrides: {} }] } as any);
    program.profiles[0].days = [[{ ...slot("unlabeled"), label: "missing" }], ...emptyDays().slice(1)];
    const { view } = make(undefined, program, { labels: [] });
    const html = flat(view.render());
    expect(html).toContain("–");
    expect(html).not.toContain("·");
    expect(html).toContain("var(--disabled-text-color)");
    expect(html).toContain("The rest of the time");
    expect(html).not.toContain("Also");
    expect(html).not.toContain("Stryker");
  });
  it("shows the selected device's own label for the rest of the time", () => {
    const { view } = make();
    view._pick = "switch.two";
    expect(flat(view.render())).toContain(t("en", "rest_untouched"));
  });
  it("shows program names when a device belongs to several programs", () => {
    const office = mkProgram({ name: "Office" });
    const bedroom = mkProgram({ id: "q", name: "Bedroom" });
    const { view } = make({ kind: "device", entityId: "switch.demo" }, office, { programs: [office, bedroom] });
    const html = flat(view.render());
    expect(html).toContain("Office");
    expect(html).toContain("Bedroom");
  });
  it("keeps the other schedule rows collapsed while one row is open", () => {
    const program = mkProgram();
    program.profiles[0].days[2] = [slot("late", "13:00", "14:00")];
    const { view } = make(undefined, program);
    const [opened, other] = view._rows();
    view._openRow(opened.key, opened.program, opened.group);
    const html = flat(view.render());
    expect(html.match(/<wp-slot-form/g)).toHaveLength(1);
    expect(html).toContain(`data-key=${other.key}`);
  });
  it("shows the read-only and removed-mode warnings and the single-device view", () => {
    const { view } = make({ kind: "device", entityId: "switch.demo" }, mkProgram(), { read_only: true });
    expect(flat(view.render())).toContain("role=\"alert\"");
    expect(view._title).toBe("Demo");
  });
  it("hides the chart and delete in a mode that is not active and says so", () => {
    const { view } = make(undefined, undefined, { mode: { selector: "input_select.m", default: "Home", active: "Home", options: ["Home", "Away"], available: true } });
    view._viewMode = "Away";
    const html = flat(view.render());
    expect(html).toContain("This mode is not active");
    expect(html).not.toContain("wp-chart");
    // Delete stays, greyed, and points to the reason
    expect(html).toContain("delete-outline\"></ha-icon>Delete");
    expect(html).toContain('id="why-mode"');
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
    find(r, "click", "Next day").fn();
    expect(view._offset).toBe(1);
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
  it.each([
    [undefined, { slots: [] }], [{ slots: [] }, undefined],
  ])("uses an empty chart list when one preview day is missing", (previous, today) => {
    const { view } = make();
    view._resp = [previous, today];
    expect(view._slots).toEqual([]);
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
    view.data.programs[0].entities.push({ entity_id: "light.third", default_label: null, label_overrides: {} }, { entity_id: "light.fourth", default_label: null, label_overrides: {} });
    for (const day of [0, 1]) view.data.programs[0].profiles[0].days[day][0].entities = ["switch.demo", "switch.two", "light.third"];
    const rows = view._rows();
    view._error = "stale error"; view._note = "stale note";
    find(view.render(), "click", "class=\"row\"").fn();
    expect(chooseAction).not.toHaveBeenCalled();
    expect(view._open).toBe(rows[0].key);
    expect(view._error).toBe(""); expect(view._note).toBe("");
    expect(view._group.days).toEqual([0, 1]);
    expect(view._shared).toBe(true);
    const html = flat(view.render());
    expect(html).toContain("wp-slot-form"); expect(html).toContain("mdi:content-copy");
    expect(html).toContain(t("en", "who_title"));
    expect(html).toContain(t("en", "who_one", { name: "Demo" }));
    expect(html).toContain(t("en", "who_some", { me: "Demo", names: "switch.two, light.third" }));
    const g = { ...view._group, days: [0, 1] };
    const stopGroup = vi.fn(); view._error = "old group error";
    find(view.render(), "group-change", "wp-slot-form").fn({ stopPropagation: stopGroup, detail: g });
    expect(stopGroup).toHaveBeenCalledOnce(); expect(view._error).toBe("");
    expect(view._group.days).toEqual([0, 1]);
    const whoChoices = handlers(view.render()).filter((handler) => handler.event === "click" && handler.before.includes('class="who"') && handler.before.includes('role="radio"'));
    whoChoices[0].fn();
    expect(view._who).toBe("one"); // This template helper cannot mount Lit to inspect the rendered radio state.
    handlers(view.render()).filter((handler) => handler.event === "click" && handler.before.includes('class="who"') && handler.before.includes('role="radio"'))[1].fn();
    expect(view._who).toBe("all"); // This template helper cannot mount Lit to inspect the rendered radio state.
    view._error = "row error";
    expect(flat(view.render())).toContain('role="alert"');
    expect(flat(view.render())).toContain("row error");
    expect(flat(view.render())).toContain(t("en", "cancel"));
    expect(flat(view.render())).toContain(t("en", "save"));
    expect(flat(view.render())).toContain(t("en", "duplicate"));
    view._duplicate = vi.fn();
    find(view.render(), "click", "class=" + '"btn dup"').fn();
    expect(view._duplicate).toHaveBeenCalledOnce();
    view._deleteRow = vi.fn();
    find(view.render(), "click", "class=" + '"btn danger-line alone"').fn();
    expect(view._deleteRow).toHaveBeenCalledOnce();
    view._saveRow = vi.fn();
    find(view.render(), "click", "class=" + '"btn primary"').fn();
    expect(view._saveRow).toHaveBeenCalledOnce();
    find(view.render(), "click", 'class="btn" @click=').fn();
    expect(view._open).toBeNull();
    view._dropBusy = true; view._shared = true; view._error = "draft error"; view._note = "draft note";
    view._cancel();
    expect(view._open).toBeNull(); expect(view._group).toBeNull();
    expect(view._dropBusy).toBe(false); expect(view._shared).toBe(false);
    expect(view._error).toBe("");
  });
  it("adds a slot for the whole week, dropping busy days when saved", async () => {
    const { view, events } = make();
    view._add();
    expect(chooseAction).not.toHaveBeenCalled();
    expect(view._open).toBe("new"); expect(view._dropBusy).toBe(true);
    expect(view._shared).toBe(false);
    expect(view._group.days).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(view._group.slot).toMatchObject({ label: "comfort", entities: ["switch.demo"] });
    expect(view._group.slot.end).toBeUndefined();
    // a new schedule cannot be duplicated yet: the button stays, greyed, with its reason
    expect(flat(view.render())).toContain(t("en", "dup_save_first"));
    view._group = { ...view._group, slot: { ...view._group.slot, start: { time: "09:00" }, end: { time: "11:00" } } };
    await view._saveRow();
    expect(view.hass.callWS).toHaveBeenCalled();
    const saved = view.hass.callWS.mock.calls.find((call: any) => call[0].type === "weekly_planner/program/save")?.[0].program;
    expect(saved.profiles[0].days.map((day: any[]) => day.length)).toEqual([1, 1, 1, 1, 1, 1, 1]);
    expect(saved.profiles[0].days[2][0].start.time).toBe("09:00");
    expect(view._note).toBe(t("en", "w_dropped", { days: "Mon Tue" }));
    const savedEvent = events.find((e) => e.type === "schedule-program-saved");
    expect(savedEvent?.detail).toMatchObject({ id: "p", revision: 2 });
    expect(savedEvent?.bubbles).toBe(true); expect(savedEvent?.composed).toBe(true);
    expect(view._open).toBeNull();
  });
  it("clears dropped-day details when fresh retry data has no busy days", async () => {
    const { view } = make();
    view._add();
    view._group = { ...view._group, slot: { ...view._group.slot, start: { time: "09:00" }, end: { time: "11:00" } } };
    const fresh = mkProgram();
    fresh.profiles[0].days = emptyDays();
    view.hass.callWS.mockImplementationOnce(async () => {
      view._dropBusy = false;
      throw { code: "conflict" };
    });
    view.hass.callWS.mockResolvedValueOnce({ programs: [fresh] });
    await view._saveRow();
    expect(view.hass.callWS.mock.calls.filter((call: any) => call[0].type === "weekly_planner/program/save")).toHaveLength(2);
    expect(view._note).toBe("");
  });
  it("adds a focused slot after the last one for that day", () => {
    const { view } = make();
    view.day = { weekday: 0, offset: 0 };
    view.firstUpdated();
    view._add();
    expect(view._group.days).toEqual([0]);
    expect(view._group.slot).toMatchObject({ start: { time: "10:00" }, label: "comfort", entities: ["switch.demo"] });
    expect(view._group.slot.end).toBeUndefined();
    expect(view._dropBusy).toBe(false);
    const pending = [view.render()];
    const dayOnlyBindings: unknown[] = [];
    while (pending.length) {
      const result = pending.pop() as any;
      if (result?._$litDirective$ && Array.isArray(result.values)) {
        pending.push(...result.values);
        continue;
      }
      if (!result?.strings || !Array.isArray(result.values)) continue;
      result.strings.forEach((text: string, index: number) => {
        if (text.endsWith(".dayOnly=")) dayOnlyBindings.push(result.values[index]);
        if (index < result.values.length) pending.push(result.values[index]);
      });
    }
    expect(dayOnlyBindings).toEqual([0]);
  });
  it("adds a slot without a default label for a one-device program", () => {
    const program = mkProgram({ entities: [{ entity_id: "switch.demo", default_label: null, label_overrides: {} }] } as any);
    const { view } = make(undefined, program, { labels: [] });
    view._add([0]);
    expect(view._group.slot.label).toBe("");
    expect(Object.prototype.hasOwnProperty.call(view._group.slot, "entities")).toBe(false);
  });
  it("asks before adding to a mode that follows another schedule", async () => {
    const program = mkProgram();
    program.profiles[1].follows = "Home";
    const { view } = make(undefined, program, { mode: { selector: "input_select.mode", active: "Home", options: ["Home", "Away"] } });
    view._viewMode = "Away";
    view._add([0]);
    expect(view._open).toBeNull();
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(chooseAction).toHaveBeenCalled();
    expect(view._open).toBe("new");
  });
  it("saves a changed slot and refuses invalid drafts", async () => {
    const { view } = make();
    view.data.programs[0].entities[0].label_overrides = { existing: { kind: "scene", scene: "scene.keep" } };
    view.data.programs[0].entities.push({ entity_id: "switch.three", default_label: null, label_overrides: null });
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._group = { ...view._group, days: [] };
    await view._saveRow(); expect(view._error).toBe(t("en", "err_days"));
    view._group = { ...view._group, days: [0], slot: { ...view._group.slot, label: "ghost" } };
    await view._saveRow(); expect(view._error).toBe(t("en", "err_action"));
    view._group = { ...view._group, days: [0, 1] };
    view._group = { ...view._group, slot: { ...view._group.slot, label: "comfort", end: { time: "08:00" } } };
    await view._saveRow(); expect(view._error).toBe(t("en", "w_err_same"));
    view._group = { ...view._group, slot: { ...view._group.slot, end: { sun: "sunset", earliest: "20:00", latest: "10:00" } } };
    await view._saveRow(); expect(view._error).toBe(t("en", "err_sun_bounds"));
    view._group = { ...view._group, slot: { ...view._group.slot, end: { time: "11:00" } } };
    expect(view._problem(view.data.programs[0])).toBe(t("en", "who_pick"));
    await view._saveRow();
    expect(view._error).toBe(t("en", "who_pick")); // shared by both devices: D1 asks first
    view._pickWho("all");
    expect(view._error).toBe("");
    await view._saveRow();
    expect(view._open).toBeNull();
    expect(view._note).toBe("");
    const sent = view.hass.callWS.mock.calls.slice(-1)[0][0].program;
    expect(sent.profiles[0].days[0][0].end).toEqual({ time: "11:00" });
    expect(sent.entities.map((e: any) => e.label_overrides)).toEqual([{ existing: { kind: "scene", scene: "scene.keep" } }, {}, null]);
  });
  it("refuses a row edit that overlaps another slot", async () => {
    const program = mkProgram();
    program.profiles[0].days[0].push(slot("later", "11:00", "13:00"));
    const { view } = make(undefined, program);
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._pickWho("all");
    view._group = { ...view._group, days: [0], slot: { ...view._group.slot, end: { time: "12:00" } } };
    await view._saveRow();
    expect(view._error).toContain("overlaps");
    expect(view._open).toBe(row.key);
    expect(view.hass.callWS.mock.calls.some((call: any) => call[0].type === "weekly_planner/program/save")).toBe(false);
  });
  it("refuses a new slot when every requested day is busy", async () => {
    const program = mkProgram();
    program.profiles[0].days = Array.from({ length: 7 }, (_, day) => [slot(`day-${day}`, "08:00", "10:00")]);
    const { view } = make(undefined, program);
    view._add();
    view._group = { ...view._group, slot: { ...view._group.slot, start: { time: "09:00" }, end: { time: "11:00" } } };
    await view._saveRow();
    expect(view._error).toContain("overlaps");
    expect(view._open).toBe("new");
    expect(view.hass.callWS.mock.calls.some((call: any) => call[0].type === "weekly_planner/program/save")).toBe(false);
  });
  it("refuses an overlap introduced by fresh data during a conflict retry", async () => {
    const { view } = make();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._pickWho("all");
    view._group = { ...view._group, days: [0], slot: { ...view._group.slot, end: { time: "12:00" } } };
    const fresh = mkProgram();
    fresh.profiles[0].days[0].push(slot("later", "11:00", "13:00"));
    view.hass.callWS.mockRejectedValueOnce({ code: "conflict" });
    view.hass.callWS.mockResolvedValueOnce({ programs: [fresh] });
    await view._saveRow();
    expect(view._error).toContain("overlaps");
    expect(view._open).toBe(row.key);
    expect(view.hass.callWS.mock.calls.filter((call: any) => call[0].type === "weekly_planner/program/save")).toHaveLength(1);
  });
  it("refuses a shared one-device edit that overlaps fresh data", async () => {
    const program = mkProgram();
    program.profiles[0].days[0][0].entities = ["switch.demo", "switch.two"];
    program.profiles[0].days[1][0].entities = ["switch.demo", "switch.two"];
    const { view } = make(undefined, program);
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._pickWho("one");
    view._group = { ...view._group, days: [0], slot: { ...view._group.slot, end: { time: "12:00" } } };
    const fresh = mkProgram();
    fresh.profiles[0].days[0][0].entities = ["switch.demo", "switch.two"];
    fresh.profiles[0].days[1][0].entities = ["switch.demo", "switch.two"];
    fresh.profiles[0].days[0].push(slot("later", "11:00", "13:00"));
    view.hass.callWS.mockRejectedValueOnce({ code: "conflict" });
    view.hass.callWS.mockResolvedValueOnce({ programs: [fresh] });
    await view._saveRow();
    expect(view._error).toContain("overlaps");
    expect(view._open).toBe(row.key);
    expect(view.hass.callWS.mock.calls.filter((call: any) => call[0].type === "weekly_planner/program/save")).toHaveLength(1);
  });
  it("saves an unchanged focused day without asking who the edit is for", async () => {
    const { view } = make();
    view._focus = 0;
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    expect(view._group.days).toEqual([0]);
    await view._saveRow();
    expect(view._error).toBe("");
    expect(view._open).toBeNull();
    expect(view.hass.callWS.mock.calls.map((call: any) => call[0].type)).toEqual(["weekly_planner/program/save"]);
  });
  it("keeps a row open when its profile disappears during a conflict retry", async () => {
    const { view } = make();
    view._add([2]);
    view.hass.callWS.mockRejectedValueOnce({ code: "conflict" });
    view.hass.callWS.mockResolvedValueOnce({ programs: [mkProgram({ profiles: [] })] });
    await view._saveRow();
    expect(view._error).toBe(t("en", "ss_changed"));
    expect(view._open).toBe("new");
    expect(view.hass.callWS.mock.calls.filter((call: any) => call[0].type === "weekly_planner/program/save")).toHaveLength(1);
  });
  it("keeps a shared row open when its profile disappears during a conflict retry", async () => {
    const { view } = make();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._pickWho("one");
    view._group = { ...view._group, slot: { ...view._group.slot, end: { time: "11:00" } } };
    view.hass.callWS.mockRejectedValueOnce({ code: "conflict" });
    view.hass.callWS.mockResolvedValueOnce({ programs: [mkProgram({ profiles: [] })] });
    await view._saveRow();
    expect(view._error).toBe(t("en", "ss_changed"));
    expect(view._open).toBe(row.key);
    expect(view.hass.callWS.mock.calls.filter((call: any) => call[0].type === "weekly_planner/program/save")).toHaveLength(1);
  });
  it("reports a changed shared target when that device disappears during a conflict retry", async () => {
    const program = mkProgram();
    program.profiles[0].days[0][0].entities = ["switch.demo", "switch.two"];
    program.profiles[0].days[1][0].entities = ["switch.demo", "switch.two"];
    const { view } = make(undefined, program);
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._pickWho("one");
    view._group = { ...view._group, slot: { ...view._group.slot, end: { time: "11:00" } } };
    const fresh = mkProgram({ entities: [{ entity_id: "switch.two", default_label: null, label_overrides: {} }] });
    view.hass.callWS.mockRejectedValueOnce({ code: "conflict" });
    view.hass.callWS.mockResolvedValueOnce({ programs: [fresh] });
    await view._saveRow();
    expect(view._error).toBe(t("en", "ss_changed"));
    expect(view._open).toBe(row.key);
    expect(view.hass.callWS.mock.calls.filter((call: any) => call[0].type === "weekly_planner/program/save")).toHaveLength(1);
  });
  it("asks who a removed day should apply to on a shared slot", async () => {
    const { view } = make();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._group = { ...view._group, days: [0] };
    await view._saveRow();
    expect(view._error).toBe(t("en", "who_pick"));
    expect(view.hass.callWS).not.toHaveBeenCalled();
  });
  it("limits a focused shared edit to this device and day", async () => {
    const { view } = make();
    view.data.programs[0].profiles[0].days[0][0].entities = ["switch.demo", "switch.two"];
    view.data.programs[0].profiles[0].days[1][0].entities = ["switch.demo", "switch.two"];
    view.day = { weekday: 0, offset: 0 };
    view.firstUpdated();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._group = { ...view._group, slot: { ...view._group.slot, end: { time: "11:00" } } };
    await view._saveRow();
    expect(view._error).toBe(t("en", "who_pick"));
    view._pickWho("one");
    await view._saveRow();
    const sent = view.hass.callWS.mock.calls.slice(-1)[0][0].program;
    const monday = sent.profiles[0].days[0];
    expect(monday).toHaveLength(2);
    expect(monday.find((s: any) => s.entities?.includes("switch.two"))).toMatchObject({ ...slot("m"), entities: ["switch.two"] });
    const edited = monday.find((s: any) => s.entities?.includes("switch.demo"));
    expect(edited).toMatchObject({
      start: { time: "08:00" }, end: { time: "11:00" }, label: "comfort", entities: ["switch.demo"], seed: "m",
    });
    expect(Object.prototype.hasOwnProperty.call(edited, "conditions")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(edited, "color")).toBe(false);
    expect(sent.profiles[0].days[1]).toEqual([{ ...slot("t"), entities: ["switch.demo", "switch.two"] }]);
  });
  it("adds a newly selected day for one device and keeps optional slot fields", async () => {
    const { view } = make();
    view.data.programs[0].profiles[0].days[0][0].entities = ["switch.demo", "switch.two"];
    view.data.programs[0].profiles[0].days[1][0].entities = ["switch.demo", "switch.two"];
    view.data.programs[0].profiles[0].days[2] = [{ ...slot("late", "12:00", "13:00"), entities: ["switch.two"] }];
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._group = {
      ...view._group,
      days: [0, 1, 2],
      slot: {
        ...view._group.slot,
        end: { time: "11:00" },
        entities: ["switch.demo"],
        conditions: [{ entity_id: "binary_sensor.ready", state: "on" }],
        color: "#123456",
      },
    };
    await view._saveRow();
    expect(view._error).toBe(t("en", "who_pick"));
    view._pickWho("one");
    expect(view._group.slot.entities).toEqual(["switch.demo", "switch.two"]);
    await view._saveRow();
    const saved = view.hass.callWS.mock.calls.slice(-1)[0][0].program;
    expect(saved.profiles[0].days[0]).toHaveLength(2);
    expect(saved.profiles[0].days[1]).toHaveLength(2);
    expect(saved.profiles[0].days[0].find((s: any) => s.entities?.includes("switch.demo"))).toMatchObject({ conditions: [{ entity_id: "binary_sensor.ready", state: "on" }], color: "#123456" });
    expect(saved.profiles[0].days[1].find((s: any) => s.entities?.includes("switch.demo"))).toMatchObject({ conditions: [{ entity_id: "binary_sensor.ready", state: "on" }], color: "#123456" });
    expect(saved.profiles[0].days[2]).toHaveLength(2);
    expect(saved.profiles[0].days[2].map((s: any) => s.start.time)).toEqual(["08:00", "12:00"]);
    expect(saved.profiles[0].days[2][0]).toMatchObject({
      start: { time: "08:00" }, end: { time: "11:00" }, label: "comfort",
      entities: ["switch.demo"], conditions: [{ entity_id: "binary_sensor.ready", state: "on" }], color: "#123456",
    });
  });
  it("treats a reordered day list as the same shared slot", async () => {
    const { view } = make();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._group = { ...view._group, days: [1, 0] };
    await view._saveRow();
    expect(view._error).toBe("");
    expect(view._open).toBeNull();
  });
  it("keeps the current device selection when choosing all devices", () => {
    const { view } = make();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._group = { ...view._group, slot: { ...view._group.slot, entities: ["switch.demo"] } };
    view._pickWho("all");
    expect(view._who).toBe("all");
    expect(view._group.slot.entities).toEqual(["switch.demo"]);
  });
  it("removes a shared day for one device while keeping it for the other", async () => {
    const { view } = make();
    view.data.programs[0].profiles[0].days[0][0].entities = ["switch.demo", "switch.two"];
    view.data.programs[0].profiles[0].days[1][0].entities = ["switch.demo", "switch.two"];
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._group = { ...view._group, days: [0] };
    await view._saveRow();
    expect(view._error).toBe(t("en", "who_pick"));
    view._pickWho("one");
    await view._saveRow();
    const saved = view.hass.callWS.mock.calls.slice(-1)[0][0].program;
    expect(saved.profiles[0].days[0]).toHaveLength(1);
    expect(saved.profiles[0].days[0][0]).toMatchObject(slot("m"));
    expect(saved.profiles[0].days[1]).toEqual([{ ...slot("t"), entities: ["switch.two"] }]);
  });
  it("reports an overlap with both slots named", async () => {
    const { view } = make();
    view._add([0]);
    view._group = { ...view._group, slot: { ...view._group.slot, start: { time: "09:00" }, end: { time: "11:00" } } };
    await view._saveRow();
    expect(view._error).toContain("Comfort");
    expect(view._overlapText({ id: "x", name: "x", days: emptyDays() } as any)).not.toBe("");
    const unknownLabels = { id: "x", name: "x", days: emptyDays() } as any;
    unknownLabels.days[0] = [
      { ...slot("a", "08:00", "10:00"), label: "missing-a" },
      { ...slot("b", "09:00", "11:00"), label: "missing-b" },
    ];
    expect(view._overlapText(unknownLabels)).toContain(t("en", "w_err_overlap_slot"));
    const oneTimeProfile = { id: "x", name: "x", days: emptyDays() } as any;
    oneTimeProfile.days[0] = [
      { ...slot("a", "08:00", null), label: "missing-a" },
      { ...slot("b", "08:00", "09:00"), label: "missing-b" },
    ];
    expect(view._overlapText(oneTimeProfile)).toBe(t("en", "w_err_overlap"));
  });
  it("saves the rest of the time with its own Save", async () => {
    const { view } = make();
    find(view.render(), "click", "row rest").fn();
    expect(view._open).toBe("rest:switch.demo");
    expect(view._restLabel).toBe("comfort");
    expect(flat(view.render())).toContain(".entityIds=switch.demo");
    const stopChange = vi.fn();
    find(view.render(), "label-change", "readonly-settings allow-none").fn({ stopPropagation: stopChange, detail: "away" });
    expect(stopChange).toHaveBeenCalledOnce();
    expect(view._restLabel).toBe("away");
    find(view.render(), "click", 'class="btn primary"').fn();
    await vi.waitFor(() => expect(view._open).toBeNull());
    const saved = view.hass.callWS.mock.calls.at(-1)[0].program;
    expect(saved.entities[0].default_label).toBe("away");
    expect(saved.entities[1].default_label).toBeNull();
  });
  describe("the settings box between Mode and Schedules", () => {
    const toggle = (view: any) => find(view.render(), "click", 'class="box setbox"');
    const attr = (view: any, name: string) => valuesAfter(view.render(), name);
    it("is closed by default and only lists the settings that exist", () => {
      const { view } = make();
      const html = flat(view.render());
      expect(html).toContain(t("en", "settings_legend"));
      expect(html).toContain("<li><i");
      expect(html).toContain(">Comfort</li>");
      expect(html).not.toContain(t("en", "settings_none"));
      expect(attr(view, 'class="row opts" aria-expanded=')).toEqual([false]);
    });
    it("opens the controls with its fold, and closes them again", () => {
      const { view } = make();
      toggle(view).fn();
      expect(attr(view, 'class="row opts" aria-expanded=')).toEqual([true]);
      expect(flat(view.render())).not.toContain("<li><i");
      toggle(view).fn();
      expect(attr(view, 'class="row opts" aria-expanded=')).toEqual([false]);
    });
    it("stays open while there is no setting to create a slot with", () => {
      const { view } = make(undefined, undefined, { labels: [] });
      expect(attr(view, 'class="row opts" aria-expanded=')).toEqual([true]);
      toggle(view).fn();
      expect(attr(view, 'class="row opts" aria-expanded=')).toEqual([true]);
    });
    it("stays shown, folded, while a slot form is open", () => {
      const { view } = make();
      view._add([0]);
      const html = flat(view.render());
      expect(html).not.toContain('class="box setbox" ?hidden=');
      expect(html).toContain(t("en", "settings_legend"));
      expect(html).toContain("<li><i");
      expect(attr(view, 'class="row opts" aria-expanded=')).toEqual([false]);
    });
    it("lets the fold open while a slot form is open and the schedule form keeps its changes", () => {
      const { view } = make();
      view._add([0]);
      view._group = { ...view._group, slot: { ...view._group.slot, start: { time: "05:00" } } };
      toggle(view).fn();
      expect(attr(view, 'class="row opts" aria-expanded=')).toEqual([true]);
      expect(view._group.slot.start).toEqual({ time: "05:00" });
      expect(view._open).toBe("new");
    });
    it("opening a schedule greys and disables the settings controls, with the reason, without hiding the box", () => {
      const { view } = make();
      expect(flat(view.render())).not.toContain(t("en", "finish_schedule_first"));
      view._add([0]);
      const html = flat(view.render());
      expect(html).toContain(t("en", "settings_legend"));
      expect(html).toContain(t("en", "finish_schedule_first"));
      expect(view._open).toBe("new");
    });
    it("opening a setting form makes the schedules, week, chart and Delete inert with one reason, and keeps what was typed", () => {
      const { view } = make();
      view._add([0]);
      view._group = { ...view._group, slot: { ...view._group.slot, start: { time: "05:00" } } };
      const stop = vi.fn();
      find(view.render(), "label-form-change", "wp-label-picker .hass").fn({ stopPropagation: stop, detail: true });
      expect(stop).toHaveBeenCalledOnce();
      expect(view._settingForm).toBe(true);
      const html = flat(view.render());
      expect(html).toContain(t("en", "finish_setting_first"));
      expect(html).toContain("aria-disabled=");
      expect(view._group.slot.start).toEqual({ time: "05:00" });
      expect(view._open).toBe("new");
      // the fold cannot hide the open setting form
      expect(valuesAfter(view.render(), 'class="row opts" aria-expanded=')).toEqual([true]);
      find(view.render(), "label-form-change", "wp-label-picker .hass").fn({ stopPropagation: stop, detail: false });
      expect(view._settingForm).toBe(false);
      expect(flat(view.render())).not.toContain(t("en", "finish_setting_first"));
      expect(view._group.slot.start).toEqual({ time: "05:00" });
    });
    it("ignores Escape on the open schedule while the setting form is open", async () => {
      const { view } = make();
      view._add([0]);
      view._settingForm = true;
      const preventDefault = vi.fn();
      view._onEscape({ preventDefault } as any);
      expect(preventDefault).toHaveBeenCalled();
      await Promise.resolve();
      expect(view._open).toBe("new");
    });
    it("asks before closing when the schedule form or the setting form holds changes", async () => {
      const { view } = make();
      expect(await view._guardClose()).toBe(true);
      view._add([0]);
      view._group = { ...view._group, slot: { ...view._group.slot, start: { time: "05:00" } } };
      view._settingForm = true;
      vi.mocked(confirmAction).mockResolvedValue(false);
      expect(await view._guardClose()).toBe(false);
    });
    it("stays shown, with its controls greyed and the reason, when the screen only edits an inactive mode", () => {
      const { view } = make();
      view._viewMode = "Away";
      view.data.mode = { selector: "input_select.mode", active: "Home", options: ["Home", "Away"] };
      expect(view._modeOnly).toBe(true);
      const html = flat(view.render());
      expect(html).toContain(t("en", "settings_legend"));
      expect(html).toContain('id="why-mode"');
    });
    it("follows the setting chosen in its picker, and lets every device give its own value", () => {
      const { view } = make();
      const stop = vi.fn();
      find(view.render(), "label-change", "wp-label-picker .hass").fn({ stopPropagation: stop, detail: "comfort" });
      expect(stop).toHaveBeenCalledOnce();
      expect(attr(view, ".value=")).toContain("comfort");
      expect(attr(view, ".entityIds=")).toEqual([["switch.demo", "switch.two"]]);
    });
  });
  it("keeps the rest editor open when saving fails", async () => {
    const { view } = make();
    find(view.render(), "click", "row rest").fn();
    view.hass.callWS.mockRejectedValueOnce({ message: "failed" });
    await view._saveRest("switch.demo");
    expect(view._open).toBe("rest:switch.demo");
    expect(view._error).toBe(t("en", "ss_err_save"));
    expect(flat(view.render())).toContain("role=\"alert\"");
    expect(flat(view.render())).toContain(t("en", "ss_err_save"));
  });
  it("saves the rest label against the first program when its selected id is stale", async () => {
    const { view } = make();
    view._programId = "missing";
    view._restLabel = "comfort";
    await view._saveRest("switch.demo");
    const saved = view.hass.callWS.mock.calls[0][0].program;
    expect(saved.id).toBe("p");
    expect(saved.entities[0].default_label).toBe("comfort");
  });
  it("does not save a rest label when no program is available", async () => {
    const { view } = make();
    view.data.programs = [];
    view._programId = "missing";
    await view._saveRest("switch.demo");
    expect(view.hass.callWS).not.toHaveBeenCalled();
  });
  it("duplicates the open slot right after it, and refuses when invalid", () => {
    const { view } = make();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    const originalDays = [0, 1];
    view._duplicate();
    expect(view._open).toBe("new");
    expect(view._group.slot).toMatchObject({ start: { time: "10:00" }, end: { time: "12:00" }, label: "comfort" });
    expect(view._group.days).toEqual([0, 1]);
    expect(view._base).toMatchObject({ rest: null, draft: { days: originalDays, slot: slot("m") } });
    const stale = make(); const staleRow = stale.view._rows()[0];
    stale.view._openRow(staleRow.key, staleRow.program, staleRow.group);
    stale.view._programId = "missing";
    stale.view._duplicate();
    expect(stale.view._open).toBe(staleRow.key);
    expect(stale.view._group.slot).toMatchObject({ start: { time: "08:00" }, end: { time: "10:00" } });
    const late = make(); const lr = late.view._rows()[0];
    late.view._openRow(lr.key, lr.program, lr.group);
    late.view._group.slot.start = { time: "23:30" }; late.view._group.slot.end = { time: "24:00" }; late.view._who = "all";
    late.view._duplicate();
    expect(late.view._group.slot.start).toEqual({ time: "23:30" });
    expect(late.view._group.slot.end).toEqual({ time: "24:00" });
    const bad = make(); const br = bad.view._rows()[0];
    bad.view._openRow(br.key, br.program, br.group); bad.view._group.days = [];
    bad.view._duplicate(); expect(bad.view._error).not.toBe("");
    const shot = make(); const sr = shot.view._rows()[0];
    shot.view._openRow(sr.key, sr.program, sr.group); shot.view._group.slot.end = null;
    shot.view._duplicate(); expect(shot.view._group.slot.end).toBeNull();
    make().view._duplicate();
  });
  it("keeps a duplicated focused slot limited to its day", () => {
    const { view } = make();
    view.day = { weekday: 0, offset: 0 };
    view.firstUpdated();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._duplicate();
    expect(view._group.days).toEqual([0]);
    const pending = [view.render()];
    const dayOnlyBindings: unknown[] = [];
    while (pending.length) {
      const result = pending.pop() as any;
      if (result?._$litDirective$ && Array.isArray(result.values)) {
        pending.push(...result.values);
        continue;
      }
      if (!result?.strings || !Array.isArray(result.values)) continue;
      result.strings.forEach((text: string, index: number) => {
        if (text.endsWith(".dayOnly=")) dayOnlyBindings.push(result.values[index]);
        if (index < result.values.length) pending.push(result.values[index]);
      });
    }
    expect(dayOnlyBindings).toEqual([0]);
  });
  it("detects a slot changed meanwhile: shows the new version or closes", async () => {
    const { view } = make();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    const live = view.data.programs[0];
    live.profiles[0].days[0][0].end = { time: "12:00" };
    live.profiles[0].days[0][0].label = "comfort";
    await view._saveRow();
    expect(view._error).toBe(t("en", "ss_changed"));
    expect(view._open).toBe(row.key);
    expect(view.hass.callWS.mock.calls.some((call: any) => call[0].type === "weekly_planner/program/save")).toBe(false);
    expect(view._note).toBe("");
    expect(view._group.slot.end).toEqual({ time: "12:00" });
    live.profiles[0].days[0] = [];
    const g = make(); const gr = g.view._rows()[0];
    g.view._openRow(gr.key, gr.program, gr.group);
    g.view.data.programs[0].profiles[0].days[0] = [];
    await g.view._saveRow();
    expect(g.view._open).toBeNull(); expect(g.view._error).toBe(""); expect(g.view._note).toBe(t("en", "ss_changed"));
    expect(flat(g.view.render())).toContain("note");
  });
  it("keeps a focused edit when fresh data adds another day", async () => {
    const { view } = make();
    view.data.programs[0].profiles[0].days[0][0].entities = ["switch.demo", "switch.two"];
    view.data.programs[0].profiles[0].days[1][0].entities = ["switch.demo", "switch.two"];
    view._focus = 0;
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._group = { ...view._group, slot: { ...view._group.slot, end: { time: "11:00" } } };
    view.data.programs[0].profiles[0].days[2] = [{ ...slot("m"), entities: ["switch.demo", "switch.two"] }];
    await view._saveRow();
    expect(view._error).toBe(t("en", "who_pick"));
    view._pickWho("one");
    await view._saveRow();
    const saved = view.hass.callWS.mock.calls.slice(-1)[0][0].program;
    expect(view._error).toBe("");
    expect(saved.profiles[0].days[0].find((s: any) => s.entities?.includes("switch.demo"))).toMatchObject({ end: { time: "11:00" } });
    expect(saved.profiles[0].days[1]).toEqual([{ ...slot("t"), entities: ["switch.demo", "switch.two"] }]);
    expect(saved.profiles[0].days[2]).toEqual([{ ...slot("m"), entities: ["switch.demo", "switch.two"] }]);
  });
  it("shows a concurrent change on the focused day instead of saving over it", async () => {
    const { view } = make();
    view.data.programs[0].profiles[0].days[0][0].entities = ["switch.demo", "switch.two"];
    view.day = { weekday: 0, offset: 0 };
    view.firstUpdated();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._group = { ...view._group, slot: { ...view._group.slot, end: { time: "11:00" } } };
    await view._saveRow();
    expect(view._error).toBe(t("en", "who_pick"));
    view._pickWho("one");
    view.data.programs[0].profiles[0].days[0][0].end = { time: "12:00" };
    await view._saveRow();
    expect(view._error).toBe(t("en", "ss_changed"));
    expect(view._group.slot.end).toEqual({ time: "12:00" });
    expect(view._open).toBe(row.key);
    expect(view.hass.callWS.mock.calls.some((call: any) => call[0].type === "weekly_planner/program/save")).toBe(false);
  });
  it("does not keep a focused edit after that day was removed", async () => {
    const { view } = make();
    view.data.programs[0].profiles[0].days[0][0].entities = ["switch.demo", "switch.two"];
    view.data.programs[0].profiles[0].days[1][0].entities = ["switch.demo", "switch.two"];
    view.day = { weekday: 0, offset: 0 };
    view.firstUpdated();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._group = { ...view._group, slot: { ...view._group.slot, end: { time: "11:00" } } };
    await view._saveRow();
    expect(view._error).toBe(t("en", "who_pick"));
    view._pickWho("one");
    view.data.programs[0].profiles[0].days[0] = [];
    await view._saveRow();
    expect(view._open).toBeNull();
    expect(view._note).toBe(t("en", "ss_changed"));
    expect(view.hass.callWS.mock.calls.some((call: any) => call[0].type === "weekly_planner/program/save")).toBe(false);
  });
  it("keeps a stale row open when its delete is cancelled by a newer version", async () => {
    const { view } = make();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._pickWho("all");
    view.data.programs[0].profiles[0].days[0][0].end = { time: "12:00" };
    await view._deleteRow();
    expect(view._open).toBe(row.key);
    expect(view._error).toBe(t("en", "ss_changed"));
    expect(view.hass.callWS).not.toHaveBeenCalled();
  });
  it("does not ask for confirmation after the open slot disappears", async () => {
    const { view } = make();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._pickWho("all");
    view._openId = null;
    await view._deleteRow();
    expect(confirmAction).not.toHaveBeenCalled();
    expect(view.hass.callWS).not.toHaveBeenCalled();
  });
  it("uses the short delete prompt when row details are unavailable", async () => {
    const { view } = make();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._pickWho("all");
    view._group = null;
    await view._deleteRow();
    expect(confirmAction).toHaveBeenCalledWith(view, t("en", "w_confirm_slot"), t("en", "slot_delete_yes"), t("en", "slot_delete_no"));
    expect(view._open).toBeNull();
  });
  it("keeps a row open when its profile disappears during delete retry", async () => {
    const { view } = make();
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    view._pickWho("all");
    view.hass.callWS.mockRejectedValueOnce({ code: "conflict" });
    view.hass.callWS.mockResolvedValueOnce({ programs: [mkProgram({ profiles: [] })] });
    await view._deleteRow();
    expect(view._error).toBe(t("en", "ss_changed"));
    expect(view._open).toBe(row.key);
    expect(view.hass.callWS.mock.calls.filter((call: any) => call[0].type === "weekly_planner/program/save")).toHaveLength(1);
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
    view._add([3]); n = 0;
    view.hass.callWS.mockImplementation(async (m: any) => {
      if (m.type === "weekly_planner/program/save") { n++; throw { code: "conflict" }; }
      return { programs: [view.data.programs[0]] };
    });
    await view._saveRow(); expect(n).toBe(2); expect(view._error).toBe(t("en", "ss_err_save"));
    view._add([4]); n = 0;
    view.hass.callWS.mockImplementation(async (m: any) => {
      if (m.type === "weekly_planner/program/save") { n++; throw { code: "conflict" }; }
      throw new Error("down");
    });
    await view._saveRow(); expect(n).toBe(1); expect(view._error).toBe(t("en", "ss_err_save"));
    view._add([5]); n = 0;
    view.hass.callWS.mockImplementation(async (m: any) => {
      if (m.type === "weekly_planner/program/save") { n++; throw { code: "conflict" }; }
      return { programs: [] };
    });
    await view._saveRow(); expect(n).toBe(1); expect(view._open).toBe("new");
  });
  it("does not retry a conflict against a different program", async () => {
    const { view } = make();
    view._add([2]);
    view.hass.callWS.mockRejectedValueOnce({ code: "conflict" });
    view.hass.callWS.mockResolvedValueOnce({ programs: [mkProgram({ id: "other" })] });
    await view._saveRow();
    const saves = view.hass.callWS.mock.calls.filter((call: any) => call[0].type === "weekly_planner/program/save");
    expect(saves).toHaveLength(1);
    expect(saves[0][0].program.id).toBe("p");
    expect(view._open).toBe("new");
    expect(view._error).toBe("");
  });
  it("keeps a cached program when fresh data omits it", async () => {
    const { view } = make();
    view._add([2]);
    const cached = { ...view.data.programs[0], revision: 4 };
    view._saved.p = cached;
    view.hass.callWS.mockRejectedValueOnce({ code: "conflict" });
    view.hass.callWS.mockResolvedValueOnce({ programs: [] });
    await view._saveRow();
    expect(view._live("p")).toBe(cached);
  });
  it("caches the fresh program after a retried save also conflicts", async () => {
    const { view } = make();
    view._add([2]);
    const fresh = { ...view.data.programs[0], revision: 9 };
    view.hass.callWS.mockRejectedValueOnce({ code: "conflict" });
    view.hass.callWS.mockResolvedValueOnce({ programs: [fresh] });
    view.hass.callWS.mockRejectedValueOnce({ code: "conflict" });
    await view._saveRow();
    expect(view._live("p")).toBe(fresh);
    const saves = view.hass.callWS.mock.calls.filter((call: any) => call[0].type === "weekly_planner/program/save");
    expect(saves[1][0].program.revision).toBe(9);
  });
  it.each([
    [null, "ss_err_save"], [{ code: "unauthorized" }, "err_unauthorized"], [{ message: "unknown_label" }, "err_label"],
    [{ message: "earliest_after_latest" }, "err_sun_bounds"], [{ message: "random_window_too_short" }, "random_too_short"],
    [{ message: "overlapping_slots" }, "w_err_overlap"], [{ message: "offset out of range" }, "err_time_range"],
    [{ message: "boom" }, "ss_err_save"],
  ])("maps the save error %j to a message", async (err, key) => {
    const { view } = make();
    view._add([2]);
    view.hass.callWS.mockRejectedValue(err);
    await view._saveRow();
    expect(view._error).toBe(t("en", key as any)); expect(view._saving).toBe(false);
  });
  it("deletes a slot, a whole schedule, or one device of a shared schedule", async () => {
    const a = make();
    const row = a.view._rows()[0]; a.view._openRow(row.key, row.program, row.group);
    await a.view._deleteRow();
    expect(a.view._error).toBe("Choose which devices this change is for.");
    a.view._pickWho("all");
    await a.view._deleteRow();
    expect(confirmAction).toHaveBeenLastCalledWith(a.view, expect.stringContaining("Comfort"), t("en", "slot_delete_yes"), t("en", "slot_delete_no"));
    expect(a.view.hass.callWS.mock.calls.slice(-1)[0][0].program.profiles[0].days[0]).toEqual([]);
    const deviceProgram = make();
    deviceProgram.view._pick = "switch.demo";
    const deviceDialogClosed = vi.fn();
    deviceProgram.view.renderRoot = { querySelector: vi.fn(() => ({ close: deviceDialogClosed })) };
    await deviceProgram.view._deleteAll();
    expect(confirmAction).toHaveBeenLastCalledWith(deviceProgram.view, t("en", "confirm_delete_device", { name: "Demo" }), t("en", "slot_delete_yes"), t("en", "slot_delete_no"));
    const deviceSave = deviceProgram.view.hass.callWS.mock.calls[0][0].program;
    expect(deviceSave.entities.map((e: any) => e.entity_id)).toEqual(["switch.demo", "switch.two"]);
    expect(deviceSave.profiles[0].days.flat().some((slot: any) => slot.entities?.includes("switch.demo"))).toBe(false);
    expect(deviceDialogClosed).toHaveBeenCalledOnce();
    vi.mocked(confirmAction).mockResolvedValueOnce(false);
    const rejectedDevice = make(); rejectedDevice.view._pick = "switch.demo";
    await rejectedDevice.view._deleteAll();
    expect(rejectedDevice.view.hass.callWS).not.toHaveBeenCalled();
    const b = make({ kind: "device", entityId: "switch.demo" });
    b.view.renderRoot = { querySelector: () => ({ close: vi.fn() }) };
    await b.view._deleteAll();
    expect(b.view.hass.callWS.mock.calls[0][0].type).toBe("weekly_planner/program/save");
    expect(b.view.hass.callWS.mock.calls[0][0].program.entities.map((e: any) => e.entity_id)).toEqual(["switch.two"]);
    const c = make(undefined, mkProgram({ entities: [{ entity_id: "switch.demo", default_label: null, label_overrides: {} }] } as any));
    const closed = vi.fn(); c.view.renderRoot = { querySelector: vi.fn(() => ({ close: closed })) };
    await c.view._deleteAll();
    expect(c.view.hass.callWS.mock.calls[0][0].type).toBe("weekly_planner/program/delete");
    expect(confirmAction).toHaveBeenLastCalledWith(c.view, t("en", "confirm_delete_schedule", { name: "Office" }), t("en", "slot_delete_yes"), t("en", "slot_delete_no"));
    expect(closed).toHaveBeenCalledOnce();
    c.view.hass.callWS.mockRejectedValueOnce(new Error("x")); await c.view._deleteAll();
    expect(c.view._error).toContain("x");
    vi.mocked(confirmAction).mockResolvedValue(false);
    const n = c.view.hass.callWS.mock.calls.length; await c.view._deleteAll();
    expect(c.view.hass.callWS.mock.calls.length).toBe(n);
    const singleDevice = make({ kind: "device", entityId: "switch.demo" }, mkProgram({ entities: [{ entity_id: "switch.demo", default_label: null, label_overrides: {} }] } as any));
    vi.mocked(confirmAction).mockResolvedValueOnce(true);
    await singleDevice.view._deleteAll();
    expect(singleDevice.view.hass.callWS.mock.calls[0][0]).toEqual({ type: "weekly_planner/program/delete", program_id: "p" });
  });
  it("pauses and resumes the schedule, asking before a pause", async () => {
    const { view } = make();
    const input: any = { checked: false };
    await view._setEnabled(false, input);
    expect(view.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/program/set_enabled", program_id: "p", enabled: false });
    expect(input.checked).toBe(true);
    vi.mocked(pauseChoice).mockResolvedValueOnce(null);
    input.checked = false;
    const calls = view.hass.callWS.mock.calls.length;
    await view._setEnabled(false, input); expect(view.hass.callWS.mock.calls.length).toBe(calls); expect(input.checked).toBe(true);
    await view._setEnabled(true, input); expect(view.hass.callWS.mock.calls.length).toBe(calls + 1);
    view._toggling = true; input.checked = false;
    const toggledCalls = view.hass.callWS.mock.calls.length;
    await view._setEnabled(true, input); expect(input.checked).toBe(true); expect(view.hass.callWS.mock.calls.length).toBe(toggledCalls);
    view._toggling = false; view.hass.callWS.mockRejectedValueOnce(new Error("no")); await view._setEnabled(true, input);
    expect(view._error).toContain("no");
    view.hass.callWS.mockRejectedValueOnce("str"); await view._setEnabled(true, input);
    const sw = handlers(view.render()).find((h) => h.event === "change" && h.before.includes("checkbox"))!;
    await sw.fn({ target: input });
  });
  it("ignores a second pause toggle while the first request is pending", async () => {
    const { view } = make();
    const pending: { resolve?: (value: unknown) => void } = {};
    view.hass.callWS.mockImplementationOnce(() => new Promise((resolve: (value: unknown) => void) => { pending.resolve = resolve; }));
    const first = view._setEnabled(true, { checked: true });
    const secondInput = { checked: false };
    await view._setEnabled(false, secondInput);
    expect(secondInput.checked).toBe(true);
    expect(view.hass.callWS).toHaveBeenCalledTimes(1);
    pending.resolve?.({});
    await first;
  });
  it("restores the enabled checkbox when a pause choice is cancelled", async () => {
    const { view } = make();
    const input = { checked: false };
    vi.mocked(pauseChoice).mockResolvedValueOnce(null);
    await view._setEnabled(false, input);
    expect(pauseChoice).toHaveBeenCalledOnce();
    expect(input.checked).toBe(true);
    expect(view.hass.callWS).not.toHaveBeenCalled();
  });
  it("returns focus to the enabled switch after it settles", async () => {
    const { view } = make();
    const focus = vi.fn();
    Object.defineProperty(view, "updateComplete", { value: Promise.resolve() }); // make() stubs requestUpdate, so the Lit completion promise would otherwise stay pending.
    await view._setEnabled(true, { checked: true, isConnected: true, focus });
    await Promise.resolve();
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    const detachedFocus = vi.fn();
    await view._setEnabled(true, { checked: true, isConnected: false, focus: detachedFocus });
    await Promise.resolve();
    expect(detachedFocus).not.toHaveBeenCalled();
  });
  it("pauses for the chosen number of hours, shows the end and resumes without asking", async () => {
    const { view } = make();
    const input: any = { checked: false };
    vi.mocked(pauseChoice).mockResolvedValueOnce(7);
    await view._setEnabled(false, input);
    expect(view.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/program/pause", program_id: "p", hours: 7 });
    const paused = mkProgram({ enabled: false, paused_until: "2026-11-09T21:30:00+00:00" });
    expect(view._stateText()).toBe(t("en", "running"));
    view.scope = { kind: "device", entityId: "switch.demo" };
    view.data = { ...view.data, programs: [mkProgram(), mkProgram({ id: "q", enabled: false })] };
    expect(view._stateText()).toBe(t("en", "running"));
    view.data = { ...view.data, programs: [paused] };
    expect(view._stateText()).toBe("Paused until Mon, Nov 9, 9:30 pm");
    expect(flat(view.render())).toContain("Paused until");
    view.data = { ...view.data, programs: [mkProgram({ enabled: false })] };
    expect(view._stateText()).toBe("Paused");
    view.data = { ...view.data, programs: [paused] };
    vi.mocked(pauseChoice).mockClear(); view.hass.callWS.mockClear();
    await view._setEnabled(true, input);
    expect(pauseChoice).not.toHaveBeenCalled();
    expect(view.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/program/set_enabled", program_id: "p", enabled: true });
  });
  it("opens the history and closes the dialog", () => {
    const { view } = make();
    const close = vi.fn(), query = vi.fn(() => ({ close })); view.renderRoot = { querySelector: query };
    const push = vi.fn(), dispatch = vi.fn();
    vi.stubGlobal("window", { history: { pushState: push }, dispatchEvent: dispatch });
    find(view.render(), "open-history", "wp-chart").fn({ detail: "/history?x" });
    expect(query).toHaveBeenCalledWith("wp-dialog");
    expect(push).toHaveBeenCalledWith(null, "", "/history?x"); expect(close).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledOnce();
    expect(dispatch.mock.calls[0][0]).toMatchObject({ type: "location-changed", detail: { replace: false } });
    const noDialog = make().view;
    const noDialogPush = vi.fn(), noDialogDispatch = vi.fn();
    vi.stubGlobal("window", { history: { pushState: noDialogPush }, dispatchEvent: noDialogDispatch });
    noDialog.renderRoot = { querySelector: () => null };
    find(noDialog.render(), "open-history", "wp-chart").fn({ detail: "/history?y" });
    expect(noDialogPush).toHaveBeenCalledWith(null, "", "/history?y");
    expect(noDialogDispatch.mock.calls[0][0]).toMatchObject({ type: "location-changed", detail: { replace: false } });
  });
  it("reveals the editor in view (phone and two columns)", () => {
    const { view } = make();
    const editor: any = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ top: 500 }) };
    const content: any = { scrollTop: 0, getBoundingClientRect: () => ({ top: 100, bottom: 400 }) };
    let width = 700;
    const panel = { getBoundingClientRect: () => ({ width }) };
    const dialog = { shadowRoot: { querySelector: (x: string) => x === ".panel" ? panel : x === ".content" ? content : null } };
    view.renderRoot = { querySelector: (s: string) => s === ".editor" ? editor : s === "wp-dialog" ? dialog : null };
    view._revealEditor(); expect(editor.scrollIntoView).toHaveBeenCalled();
    width = 736;
    view._revealEditor(); expect(content.scrollTop).toBe(400);
    editor.getBoundingClientRect = () => ({ top: 200 }); content.scrollTop = 0; view._revealEditor(); expect(content.scrollTop).toBe(0);
    editor.getBoundingClientRect = () => ({ top: 400 }); content.scrollTop = 0; view._revealEditor(); expect(content.scrollTop).toBe(300);
    view.renderRoot = { querySelector: () => null }; view._revealEditor();
  });
  it("filters rows to the selected device while keeping unknown labels visible", () => {
    const program = sharedProgram();
    program.profiles[0].days[0] = [
      slot("for-a"), { ...slot("for-b"), label: "missing", entities: ["switch.b"] }, { ...slot("unknown"), label: "missing" },
    ];
    const view = makeView([program], { kind: "device", entityId: "switch.a" });
    view.data.labels = [{ id: "comfort", name: "Comfort", action: { kind: "service", service: "switch.turn_on" } }];
    view.hass.services = { switch: { turn_on: { name: "On", target: { entity: { domain: "switch" } } } } };
    expect(view._include(program.profiles[0].days[0][1])).toBe(false);
    expect(view._rows().map((row: any) => row.key)).toEqual(["p|for-a", "p|unknown"]);
    const html = flat(view.render());
    expect(html).toContain("var(--disabled-text-color)");
    expect(html).not.toContain("Stryker");
  });
  it("creates and previews a mode before that mode has a saved profile", async () => {
    vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(new Date("2026-11-18T12:00:00Z")); // the previewed days follow the clock
    const program = sharedProgram();
    program.profiles = [];
    const view = makeView([program]);
    view.data.mode = { selector: "input_select.mode", options: ["Away"], active: "Away" };
    view.chart = true; view._offset = 0;
    view.willUpdate(new Map());
    await Promise.resolve(); await Promise.resolve();
    expect(vi.mocked(fetchPreviewResponse).mock.calls.map(call => call.slice(1))).toEqual([
      ["p", 2, "2026-11-17", undefined], ["p", 2, "2026-11-18", undefined],
    ]);
    view._add([0]);
    expect(view._open).toBe("new");
    expect(view._group.days).toEqual([0]);
  });
  it("edits the chosen program profile and shows the selected mode in other programs", () => {
    const first = sharedProgram("p", 1, "Alpha");
    first.profiles[0].days[0] = [slot("home")];
    first.profiles.push({ id: "away", name: "Away", days: emptyDays() });
    first.profiles[1].days[2] = [slot("away-slot")];
    const second = sharedProgram("second", 2, "Beta");
    second.profiles = [{ id: "second-away", name: "Away", days: emptyDays() }];
    second.profiles[0].days[4] = [slot("second-slot")];
    const view = makeView([first, second], { kind: "device", entityId: "switch.a" });
    view.data.mode = { selector: "input_select.mode", options: ["Home", "Away"], active: "Home" };
    view._viewMode = "Away";
    view._open = "editing"; view._programId = "p"; view._editProfileId = "home"; view._editMode = "Home";
    expect(view._rows().map((row: any) => [row.program.id, row.key])).toEqual([
      ["p", "p|home"], ["second", "second|second-slot"],
    ]);
  });
  it("opens only the focused day of a group", () => {
    const { view } = make(); view._focus = 0;
    const row = view._rows()[0];
    view._openRow(row.key, row.program, row.group);
    expect(view._dayOnly).toBe(0);
    expect(view._group.days).toEqual([0]);
    expect(flat(view.render())).toContain("mdi:content-copy");
  });
  it("moves focus into the editor and back to its row or the add button", async () => {
    const { view } = make();
    const editorFocus = vi.fn();
    const rowFocus = vi.fn();
    const otherRowFocus = vi.fn();
    const addFocus = vi.fn();
    const row = { dataset: { key: "p|m" }, focus: rowFocus };
    const otherRow = { dataset: { key: "p|z" }, focus: otherRowFocus };
    const editor = { children: [], focus: editorFocus, scrollIntoView: vi.fn() };
    view.renderRoot = {
      querySelector: (selector: string) => selector === ".editor" ? editor : selector === "button.row.add" ? { focus: addFocus } : null,
      querySelectorAll: (selector: string) => selector === "button.row[data-key]" ? [otherRow, row] : [],
    };
    Object.defineProperty(view, "updateComplete", { value: Promise.resolve(true) });
    const first = view._rows()[0];
    view._openRow(first.key, first.program, first.group);
    await Promise.resolve(); await Promise.resolve();
    expect(editorFocus).toHaveBeenCalledWith({ preventScroll: true });
    expect(editor.scrollIntoView).toHaveBeenCalledWith({ block: "start" });
    view._cancel();
    await Promise.resolve(); await Promise.resolve();
    expect(rowFocus).toHaveBeenCalledWith({ preventScroll: true });
    expect(otherRowFocus).not.toHaveBeenCalled();
    expect(addFocus).not.toHaveBeenCalled();

    view._add();
    await Promise.resolve(); await Promise.resolve();
    view._cancel();
    await Promise.resolve(); await Promise.resolve();
    expect(addFocus).toHaveBeenCalledWith({ preventScroll: true });
  });
});

// Fixtures of the shared-device cases below (several programs on the same devices).
const sharedProgram = (id = "p", priority = 1, name = "Office", ids = ["switch.a", "switch.b"]): any => ({
  id, priority, name, revision: 2, enabled: true, reapply: true, conditions: [],
  entities: ids.map(entity_id => ({ entity_id, default_label: null, label_overrides: {} })),
  profiles: [{ id: "home", name: "Home", days: Array.from({ length: 7 }, () => []) }],
});
function makeView(programs = [sharedProgram()], scope: any = { kind: "program", programId: "p" }): any {
  const view: any = new WpSchedule();
  view.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, services: {}, callWS: vi.fn() };
  view.data = { programs, labels: [], status: {}, can_edit: true, read_only: false };
  view.scope = scope;
  view.requestUpdate = vi.fn();
  return view;
}

describe("schedule dialog state, previews and save errors", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-16T12:00:00Z")); vi.mocked(fetchPreviewResponse).mockReset(); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it("filters both scopes and sorts shared programs by priority then name without changing pushed order", () => {
    const programs = [sharedProgram("z", 5, "Zeta"), sharedProgram("b", 1, "Beta"), sharedProgram("a", 1, "Alpha"), sharedProgram("other", 0, "Other", ["switch.other"])];
    const view = makeView(programs, { kind: "device", entityId: "switch.a" });
    expect(view._programs.map((p: any) => p.id)).toEqual(["a", "b", "z"]);
    expect(programs.map(p => p.id)).toEqual(["z", "b", "a", "other"]);
    view.scope = { kind: "program", programId: "b" };
    expect(view._programs.map((p: any) => p.id)).toEqual(["b"]);
    expect(view._title).toBe("Beta");
    view.scope.programId = "missing";
    expect(view._entities).toEqual([]); expect(view._eid).toBe(""); expect(view._title).toBe("");
    expect(view._devices()).toEqual([]);
  });
  it("uses the selected valid device, then the opening device, then the first device", () => {
    const view = makeView();
    view.scope.entityId = "switch.b";
    expect(view._eid).toBe("switch.b");
    view._pick = "switch.a"; expect(view._eid).toBe("switch.a");
    view._pick = "missing"; expect(view._eid).toBe("switch.b");
    view.scope.entityId = "missing"; expect(view._eid).toBe("switch.a");
    view.scope = { kind: "device", entityId: "switch.b" };
    expect(view._entities).toEqual(["switch.b"]);
  });
  it("resolves default device lists from the edited program rather than the first owner", () => {
    const view = makeView([sharedProgram(), sharedProgram("second", 2, "Second", ["switch.a", "switch.c"])], { kind: "device", entityId: "switch.a" });
    view._programId = "second";
    expect(view._devices()).toEqual(["switch.a", "switch.c"]);
    view._programId = "missing"; expect(view._devices()).toEqual(["switch.a", "switch.b"]);
  });
  it("prefers a cached chart owner only when its id matches and revision is strictly newer", () => {
    const view = makeView(); const pushed = view.data.programs[0];
    for (const [id, revision, expected] of [["p", 1, false], ["p", 2, false], ["p", 3, true], ["other", 9, false]] as const) {
      view._chartProgram = { ...pushed, id, revision };
      expect(view._chartOwner()).toBe(expected ? view._chartProgram : pushed);
    }
    view.data.programs = []; expect(view._chartOwner()).toBeUndefined();
  });
  it("uses pushed programs on equal revisions and cached programs when the push is absent", () => {
    const view = makeView(); const pushed = view.data.programs[0];
    view._saved.p = { ...pushed, revision: 2, name: "Cached" };
    expect(view._live("p")).toBe(pushed);
    view._saved.p.revision = 3; expect(view._live("p")).toBe(view._saved.p);
    expect(view._live("missing")).toBeUndefined();
    view.data.programs = []; expect(view._live("p")).toBe(view._saved.p);
    expect(view._live("missing")).toBeUndefined();
  });
  it("ignores a deleted mode choice and has no modes without a selector", () => {
    const view = makeView(); expect(view._modes()).toEqual([]); expect(view._modeOnly).toBe(false);
    view.data.mode = { selector: "input_select.mode", options: ["Home", "Away"], active: "Home", default: "Away" };
    view._viewMode = "Deleted"; expect(view._openMode).toBe("Home");
    view._viewMode = "Away"; expect(view._openMode).toBe("Away"); expect(view._modeOnly).toBe(true);
    view._viewMode = null; view.data.mode.active = null; expect(view._openMode).toBe("Away");
    view.data.mode.default = null; expect(view._openMode).toBe("Home");
    view.data.mode.options = []; view.data.programs[0].profiles = []; expect(view._openMode).toBeNull(); expect(view._modeOnly).toBe(false);
  });
  it("finds a concurrently created edit profile by name and does not invent one outside an edit", () => {
    const view = makeView(); const p = view.data.programs[0];
    expect(view._editProfile(p)).toBeUndefined();
    view._editProfileId = "new"; view._editMode = "Home";
    expect(view._editProfile(p)).toBe(p.profiles[0]);
    view._editMode = "Away";
    expect(view._editProfile(p)).toEqual({ id: "new", name: "Away", days: [[], [], [], [], [], [], []] });
  });
  it.each([-14, 7])("accepts the chart boundary %i and clears old preview", offset => {
    const view = makeView(); view._resp = [{}, {}]; view._go(offset);
    expect(view._offset).toBe(offset); expect(view._resp).toBeNull();
    view._resp = [{ kept: true }, {}]; view._go(offset < 0 ? -1 : 1);
    expect(view._offset).toBe(offset); expect(view._resp).toEqual([{ kept: true }, {}]);
  });
  it.each([-14, 7, -15, 8])("opens a focused day at permitted offsets only (%i)", offset => {
    const view = makeView(); view._loadNames = vi.fn(); view._add = vi.fn();
    view.day = { weekday: 0, offset }; view.firstUpdated();
    expect(view._offset).toBe(offset >= -14 && offset <= 7 ? offset : 0);
    expect(view._focus).toBe(0); expect(view._add).toHaveBeenCalledWith([0]); expect(view._loadNames).toHaveBeenCalledOnce();
  });
  it("does not auto-create by default and honors a focused day even when create is requested", () => {
    const view = makeView(); view._loadNames = vi.fn(); view._add = vi.fn();
    view.firstUpdated(); expect(view._add).not.toHaveBeenCalled();
    view.create = true; view.day = { weekday: 4, offset: 1 }; view.firstUpdated();
    expect(view._add).toHaveBeenCalledWith([4]);
  });
  it("clears the device choice only when an existing scope changes", () => {
    const view = makeView(); view.chart = false; view._pick = "switch.b";
    view.willUpdate(new Map()); expect(view._pick).toBe("switch.b");
    view.willUpdate(new Map([["scope", undefined]])); expect(view._pick).toBe("switch.b");
    view.willUpdate(new Map([["scope", {}]])); expect(view._pick).toBe("");
  });
  it("requests yesterday and today with the selected mode and discards an answer for an obsolete key", async () => {
    const view = makeView(); view._loaded = "current";
    vi.mocked(fetchPreviewResponse).mockResolvedValue({ slots: [] } as any);
    await view._loadPreview("p", 2, "2026-11-16", "obsolete", "home");
    expect(view._resp).toBeNull();
    expect(vi.mocked(fetchPreviewResponse).mock.calls.map(c => c.slice(1))).toEqual([
      ["p", 2, "2026-11-15", "home"], ["p", 2, "2026-11-16", "home"],
    ]);
    await view._loadPreview("p", 2, "2026-11-16", "current", "home");
    expect(view._resp).toEqual([{ slots: [] }, { slots: [] }]);
  });
  it("keeps newer preview answers when an older request resolves or fails later", async () => {
    const view = makeView(); view._loaded = "key";
    let resolve!: (value: any) => void; let reject!: (error: unknown) => void;
    vi.mocked(fetchPreviewResponse).mockReturnValueOnce(new Promise(r => { resolve = r; })).mockResolvedValueOnce({ slots: [] } as any);
    const old = view._loadPreview("p", 1, "2026-11-16", "key");
    vi.mocked(fetchPreviewResponse).mockResolvedValue({ slots: [{ slot_id: "new" }] } as any);
    await view._loadPreview("p", 2, "2026-11-16", "key"); const newest = view._resp;
    resolve({ slots: [{ slot_id: "old" }] }); await old; expect(view._resp).toBe(newest);
    vi.mocked(fetchPreviewResponse).mockReturnValueOnce(new Promise((_r, r) => { reject = r; }));
    const failing = view._loadPreview("p", 3, "2026-11-16", "key");
    await view._loadPreview("p", 4, "2026-11-16", "key"); const latest = view._resp;
    reject(new Error("late failure")); await failing; expect(view._resp).toBe(latest);
  });
  it.each([
    ["unknown_label", "err_label"], ["earliest_after_latest", "err_sun_bounds"], ["random_window_too_short", "random_too_short"],
    ["overlapping_slots", "w_err_overlap"], ["offset", "err_time_range"], ["invalid_random_minutes", "err_time_range"],
    ["at most", "err_time_range"], ["at least", "err_time_range"], ["out of range", "err_time_range"],
    ["INVALID_TIME", "err_time_range"], ["invalid_clock", "err_time_range"], ["unexpected", "ss_err_save"],
  ])("translates save error %s", async (message, key) => {
    const view = makeView(); view.hass.callWS.mockRejectedValue({ message });
    expect(await view._saveProgram(view.data.programs[0])).toBe("error");
    expect(view._error).toBe(t("en", key as any)); expect(view._saving).toBe(false);
  });
  it("maps a save failure without a message to the generic error", async () => {
    const view = makeView(); view.hass.callWS.mockRejectedValue({});
    expect(await view._saveProgram(view.data.programs[0])).toBe("error");
    expect(view._error).toBe(t("en", "ss_err_save"));
  });
  it("returns a conflict result for a revision conflict", async () => {
    const view = makeView(); view.hass.callWS.mockRejectedValue({ code: "conflict" });
    expect(await view._saveProgram(view.data.programs[0])).toBe("conflict");
    expect(view._error).toBe("");
  });
  it("keeps a program save pending until the server responds", async () => {
    const view = makeView();
    const pending: { resolve?: (value: unknown) => void } = {};
    view.hass.callWS.mockImplementation(() => new Promise(resolve => { pending.resolve = resolve; }));
    const save = view._saveProgram(view.data.programs[0]);
    expect(view._saving).toBe(true);
    pending.resolve!({ program: { ...view.data.programs[0], revision: 3 } });
    expect(await save).toBe("ok");
    expect(view._saving).toBe(false);
  });
  it("accepts a successful empty save response without reporting a saved program", async () => {
    const view = makeView();
    view.dispatchEvent = vi.fn();
    expect(await view._saveProgram(view.data.programs[0])).toBe("ok");
    expect(view.dispatchEvent).not.toHaveBeenCalled();
    expect(view._saved.p).toBeUndefined();
  });
  it("leaves Escape to the dialog unless a row editor is open", async () => {
    const view = makeView(); const event = { preventDefault: vi.fn() }; view._cancel = vi.fn();
    view._onEscape(event); expect(event.preventDefault).not.toHaveBeenCalled(); expect(view._cancel).not.toHaveBeenCalled();
    view.renderRoot = { querySelector: () => null };
    view._initialGroup = "null"; view._open = "new"; view._onEscape(event); expect(event.preventDefault).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(0);
    expect(view._cancel).toHaveBeenCalledOnce();
    expect(confirmAction).not.toHaveBeenCalled();
  });
  describe("close guard with a modified schedule form", () => {
    const view0 = () => { const v = makeView(); v.renderRoot = { querySelector: () => null }; return v; };
    const dirtyView = () => { const v = view0(); v._open = "new"; v._group = { a: 1 }; v._initialGroup = "{}"; return v; };
    it("asks with the schedule question, 'No' keeps the form, 'Yes' lets it go", async () => {
      const v = dirtyView();
      vi.mocked(confirmAction).mockResolvedValueOnce(false);
      expect(await v._guardClose()).toBe(false);
      expect(confirmAction).toHaveBeenCalledWith(v, t("en", "edit_discard"), t("en", "edit_discard_yes"), t("en", "edit_discard_no"));
      expect(await v._guardClose()).toBe(true);
    });
    it("Escape on the modified form asks and keeps the editor on 'No'", async () => {
      const v = dirtyView(); v._cancel = vi.fn();
      vi.mocked(confirmAction).mockResolvedValueOnce(false);
      v._onEscape({ preventDefault: vi.fn() });
      await vi.advanceTimersByTimeAsync(0);
      expect(confirmAction).toHaveBeenCalledOnce();
      expect(v._cancel).not.toHaveBeenCalled();
    });
    it("an unmodified form, or none, closes silently (read-only users never open one)", async () => {
      const v = view0(); v._open = "new"; v._group = { a: 1 }; v._initialGroup = JSON.stringify({ a: 1 });
      expect(await v._guardClose()).toBe(true);
      const ro = view0(); ro.data.read_only = true; expect(await ro._guardClose()).toBe(true);
      expect(confirmAction).not.toHaveBeenCalled();
    });
    it("schedule and setting forms both modified: one question only", async () => {
      const v = dirtyView(); v.renderRoot = { querySelector: () => ({ dirty: true }) };
      await v._guardClose();
      expect(confirmAction).toHaveBeenCalledOnce();
    });
  });
  it("renders no initial error or note and starts with closed mode options", () => {
    const view = makeView(); expect(view._optsOpen).toBe(false); expect(view._shared).toBe(false); expect(view._dropBusy).toBe(false);
    expect(flat(view.render())).not.toContain("Stryker was here");
  });
  it("loads the chart only when enabled and reloads it when the preview key changes", async () => {
    const view = makeView();
    view.chart = false;
    view.willUpdate(new Map());
    expect(fetchPreviewResponse).not.toHaveBeenCalled();
    view.chart = true;
    view.willUpdate(new Map());
    await Promise.resolve(); await Promise.resolve();
    expect(vi.mocked(fetchPreviewResponse).mock.calls.map(call => call.slice(1))).toEqual([
      ["p", 2, "2026-11-15", "home"], ["p", 2, "2026-11-16", "home"],
    ]);
    view.willUpdate(new Map());
    expect(fetchPreviewResponse).toHaveBeenCalledTimes(2);
    view.data.holiday_today = true;
    view.willUpdate(new Map());
    await Promise.resolve(); await Promise.resolve();
    expect(fetchPreviewResponse).toHaveBeenCalledTimes(4);
    view.data.mode = { selector: "input_select.mode", options: ["Home", "Away"], active: "Home" };
    view._viewMode = "Away";
    view.willUpdate(new Map());
    expect(fetchPreviewResponse).toHaveBeenCalledTimes(4);
  });
});
