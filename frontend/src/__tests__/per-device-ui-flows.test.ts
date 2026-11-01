// Per-device schedules in the card UI (#34, LOT 5): wiring of the card, the schedule screen, the bar editor,
// the slot form, the chart and the program editor on the owner's case (thermostat 15 °C for the climate only,
// "Close" at 07:00 for the cover only), plus D1 (this device / all), D4, D5, undo and conflict retries.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { WpSchedule } from "../components/schedule-dialog";
import { WpBarEditor } from "../components/bar-editor";
import { WpSlotForm } from "../components/slot-form";
import { WpChart } from "../components/chart";
import { WpProgramEditor } from "../editors/program-editor";
import { confirmAction } from "../components/confirm";
import { slotDeviceError } from "../i18n";
import { isolateForDevice, undoSlots, dropDeviceSlots, ownSlotCount, commonSlotCount } from "../device-edits";
import { deviceDays } from "../preview-cache";
import { flat, find } from "./helpers/tpl";
import type { Program, Slot } from "../types";

vi.mock("../components/confirm", () => ({ confirmAction: vi.fn(async () => true) }));

const CLIMATE = "climate.salon";
const COVER = "cover.salon";
const t15: Slot = { id: "s1", start: { time: "07:00" }, end: { time: "22:00" }, label: "t15", entities: [CLIMATE] };
const close: Slot = { id: "s2", start: { time: "07:00" }, end: null, label: "close", entities: [COVER] };
const both: Slot = { id: "s3", start: { time: "10:00" }, end: { time: "12:00" }, label: "t15" }; // no list: both devices

const hass = (over: any = {}): any => ({
  language: "en", config: { time_zone: "UTC" },
  states: {
    [CLIMATE]: { entity_id: CLIMATE, state: "heat", attributes: { friendly_name: "Thermostat" } },
    [COVER]: { entity_id: COVER, state: "open", attributes: { friendly_name: "Volet" } },
  },
  services: {
    climate: { set_temperature: { name: "Set temperature", target: { entity: { domain: "climate" } }, fields: {} } },
    cover: { close_cover: { name: "Close", target: { entity: { domain: "cover" } }, fields: {} } },
  },
  ...over,
});
const labels = [
  { id: "t15", name: "15 °C", color: "#f80", action: { kind: "service", service: "climate.set_temperature", data: { temperature: 15 } } },
  { id: "close", name: "Fermer", color: "#06c", action: { kind: "service", service: "cover.close_cover" } },
];
const days = (): Slot[][] => Array.from({ length: 7 }, () => []);
let seq = 0;
function program(over: Partial<Program> = {}): Program {
  const d = days();
  d[0] = [structuredClone(t15), structuredClone(close)];
  d[1] = [structuredClone(both)];
  return {
    id: `p${++seq}`, name: "Salon", revision: 1, priority: 10, enabled: true, reapply: true, conditions: [],
    entities: [{ entity_id: CLIMATE, default_label: null, label_overrides: {} }, { entity_id: COVER, default_label: null, label_overrides: {} }],
    active_profile: "home", profiles: [{ id: "home", name: "Home", days: d }, { id: "away", name: "Away", days: days() }], ...over,
  } as Program;
}
const data = (programs: Program[], over: any = {}): any => ({ programs, labels, status: {}, can_edit: true, read_only: false, ...over });

/** Every object of a template tree that looks like a bar span or a chip (has a `label` and a `color`). */
function spansIn(v: any, out: any[] = []): any[] {
  if (Array.isArray(v)) { v.forEach((x) => spansIn(x, out)); return out; }
  if (v && typeof v === "object") {
    if (typeof v.label === "string" && typeof v.color === "string" && "start" in v) out.push(v);
    if (v.values) spansIn(v.values, out);
    else if (!v.strings) for (const k of Object.keys(v)) if (typeof v[k] === "object") spansIn(v[k], out);
  }
  return out;
}
/** Every array of strings passed as a property in a template tree. */
function stringArrays(v: any, out: string[][] = []): string[][] {
  if (Array.isArray(v)) {
    if (v.length && v.every((x) => typeof x === "string")) out.push(v as string[]);
    else v.forEach((x) => stringArrays(x, out));
    return out;
  }
  if (v && typeof v === "object" && v.values) stringArrays(v.values, out);
  return out;
}

beforeEach(() => {
  (globalThis as any).CustomEvent ??= class { type: string; detail: unknown; constructor(t: string, i: any) { this.type = t; this.detail = i?.detail; } };
  vi.stubGlobal("requestAnimationFrame", (f: () => void) => f());
  vi.mocked(confirmAction).mockReset(); vi.mocked(confirmAction).mockResolvedValue(true);
});
afterEach(() => vi.unstubAllGlobals());

/* ------------------------------------------------------------------ the card */

function card(programs: Program[], over: any = {}) {
  const c = new WeeklyPlannerCard() as any;
  c.hass = hass();
  c._config = { schedule_view: "schedule" };
  c._data = data(programs, over);
  c._now = new Date("2026-01-05T12:00:00Z"); // a Monday
  return c;
}

describe("card: per-device bars (owner case)", () => {
  it("the cover row never shows 15 °C and the climate row never Fermer, without preview", () => {
    const p = program();
    const c = card([p]);
    expect(c._spans(COVER, [p]).map((s: any) => s.label)).toEqual(["Fermer"]);
    expect(c._spans(CLIMATE, [p]).map((s: any) => s.label)).toEqual(["15 °C"]);
  });
  it("draws each device from its own by_entity list (no duplicated previous-day spill)", () => {
    const p = program();
    const c = card([p]);
    const occ = (id: string, start: string, end: string | null) => ({ slot_id: id, start, end, ignored: null, sun: false });
    const day = { slots: [occ("s1", "2026-01-05T07:00:00Z", "2026-01-05T22:00:00Z"), occ("s2", "2026-01-05T07:00:00Z", null)],
      by_entity: { [CLIMATE]: [occ("s1", "2026-01-05T07:00:00Z", "2026-01-05T22:00:00Z")], [COVER]: [occ("s2", "2026-01-05T07:00:00Z", null)] } };
    c._preview = { "2026-01-05": { [p.id]: day }, "2026-01-04": { [p.id]: day } };
    expect(c._spans(COVER, [p]).map((s: any) => [s.label, s.start])).toEqual([["Fermer", 420]]);
    expect(c._spans(CLIMATE, [p]).map((s: any) => [s.label, s.start, s.end])).toEqual([["15 °C", 420, 1320]]);
    expect(deviceDays(day as any, day as any, COVER).previous).toEqual([]);
  });
  it("shows one Create a setting button per device without slot (D4), never when read-only", () => {
    const p = program();
    p.profiles[0].days = days();
    p.profiles[0].days[0] = [structuredClone(t15)];
    const c = card([p]);
    const html = flat(c._bySchedule([p]));
    expect(html.match(/class="create"/g)).toHaveLength(1);
    find(c._bySchedule([p]), "click", 'class="create"').fn();
    expect(c._dialog.scope).toEqual({ kind: "program", programId: p.id, entityId: COVER });
    expect(c._dialog.create).toBe(true);
    const ro = card([p], { read_only: true });
    const roHtml = flat(ro._bySchedule([p]));
    expect(roHtml).not.toContain('class="create"');
  });
  it("names the device and the action of a skipped next change", () => {
    const p = program();
    const c = card([p], { status: { [p.id]: { skip_next: "2026-01-06T07:00:00Z", skip_next_targets: [{ entity_id: COVER, action: null, label: "close" }] } } });
    expect(flat(c._skipped(COVER, [p]))).toContain("Skipped: Fermer");
    expect(flat(c._skipped(CLIMATE, [p]))).toBe("");
  });
});

/* ------------------------------------------------------------------ the chart */

describe("chart: per-device markers", () => {
  it("plans only the device's own slots", () => {
    const p = program();
    for (const [eid, want] of [[COVER, ["close"]], [CLIMATE, ["t15"]]] as const) {
      const chart = new WpChart() as any;
      chart.entityId = eid; chart.date = "2026-01-05"; chart.hass = hass(); chart.data = data([p]); chart.program = p; chart.slots = null;
      const model = chart._build({ hist: [], log: [], sent: [] });
      expect([...new Set(model.markers.filter((m: any) => !m.end).map((m: any) => m.label.id))]).toEqual(want);
    }
  });
});

/* ------------------------------------------------------------------ the schedule screen */

function dialog(p: Program, entityId?: string, over: any = {}) {
  const v = new WpSchedule() as any;
  v.hass = hass({ callWS: vi.fn(async (m: any) => (m.type === "weekly_planner/program/save" ? { program: { ...m.program, revision: m.program.revision + 1 } } : m.type === "weekly_planner/get" ? { programs: [p] } : {})) });
  v.scope = { kind: "program", programId: p.id, ...(entityId ? { entityId } : {}) };
  v.data = data([p], over);
  v.renderRoot = { querySelector: () => null };
  v.requestUpdate = vi.fn();
  return v;
}
const sent = (v: any): Program => v.hass.callWS.mock.calls.filter((c: any) => c[0].type === "weekly_planner/program/save").slice(-1)[0][0].program;

describe("schedule screen: per device", () => {
  it("lists only the shown device's slots, week bars and label choices (owner case)", () => {
    const p = program();
    const cover = dialog(p, COVER);
    expect(cover._rows().map((r: any) => r.group.slot.label)).toEqual(["close"]); // s3 (15 °C for both) is hidden: not applicable to the cover
    expect(spansIn(cover._renderWeek()).map((s) => s.label)).not.toContain("15 °C");
    const clim = dialog(p, CLIMATE);
    expect(clim._rows().map((r: any) => r.group.slot.id).sort()).toEqual(["s1", "s3"]);
    expect(spansIn(clim._renderWeek()).map((s) => s.label)).not.toContain("Fermer");
    // the editor's label picker only gets this device
    const row = cover._rows()[0];
    cover._openRow(row.key, row.program, row.group);
    expect(stringArrays(cover._renderEditor(p, row.key))).toContainEqual([COVER]);
    expect(flat(cover.render())).toContain("Thermostat"); // device chips, names from Home Assistant
  });
  it("D1: a shared slot always shows This device / All (N); an own slot does not", () => {
    const p = program();
    const v = dialog(p, CLIMATE);
    const shared = v._rows().find((r: any) => r.group.slot.id === "s3");
    v._openRow(shared.key, shared.program, shared.group);
    expect(v._shared).toBe(true);
    const html = flat(v._renderEditor(p, shared.key));
    expect(html).toContain("This device"); expect(html).toContain("All (2)");
    expect(html.match(/btn primary/g)).toHaveLength(1); // one Save / Cancel pair
    const own = v._rows().find((r: any) => r.group.slot.id === "s1");
    v._openRow(own.key, own.program, own.group);
    expect(v._shared).toBe(false);
    expect(flat(v._renderEditor(p, own.key))).not.toContain("This device");
  });
  it("D1 This device: splits the shared slot (kept part keeps its id, copy gets the seed)", async () => {
    const p = program();
    const v = dialog(p, CLIMATE);
    const shared = v._rows().find((r: any) => r.group.slot.id === "s3");
    v._openRow(shared.key, shared.program, shared.group);
    v._group = { ...v._group, slot: { ...v._group.slot, end: { time: "13:00" } } };
    await v._saveRow();
    expect(v._error).toBe("Choose: this device or all.");
    v._pickWho("one");
    await v._saveRow();
    expect(v._open).toBeNull();
    const day1 = sent(v).profiles[0].days[1];
    expect(day1.find((s: Slot) => s.id === "s3")).toMatchObject({ entities: [COVER], end: { time: "12:00" } });
    expect(day1.find((s: Slot) => s.id !== "s3")).toMatchObject({ entities: [CLIMATE], seed: "s3", end: { time: "13:00" } });
  });
  it("D1 All (N): the shared slot changes for every device; deleting asks too", async () => {
    const p = program();
    const v = dialog(p, CLIMATE);
    const shared = v._rows().find((r: any) => r.group.slot.id === "s3");
    v._openRow(shared.key, shared.program, shared.group);
    v._group = { ...v._group, slot: { ...v._group.slot, end: { time: "13:00" } } };
    v._pickWho("all");
    await v._saveRow();
    expect(sent(v).profiles[0].days[1]).toEqual([{ ...both, end: { time: "13:00" }, conditions: undefined }].map(({ conditions: _c, ...s }) => expect.objectContaining(s)));
    const w = dialog(program(), CLIMATE);
    const r = w._rows().find((x: any) => x.group.slot.id === "s3");
    w._openRow(r.key, r.program, r.group);
    w._pickWho("one");
    await w._deleteRow();
    expect(sent(w).profiles[0].days[1]).toEqual([expect.objectContaining({ id: "s3", entities: [COVER] })]);
  });
  it("a new slot belongs to the device it is created from (D4)", () => {
    const p = program();
    const v = dialog(p, COVER);
    v._add([2]);
    expect(v._group.slot.entities).toEqual([COVER]);
    expect(v._group.slot.label).toBe("close"); // first setting valid for the cover
  });
  it("Delete removes only this device's slots, the program stays", async () => {
    const p = program();
    const v = dialog(p, COVER);
    v.renderRoot = { querySelector: () => ({ close: vi.fn() }) };
    await v._deleteAll();
    const saved = sent(v);
    expect(saved.entities).toHaveLength(2);
    expect(saved.profiles[0].days[0].map((s: Slot) => s.id)).toEqual(["s1"]);
    expect(saved.profiles[0].days[1]).toEqual([expect.objectContaining({ id: "s3", entities: [CLIMATE] })]);
    expect(v.hass.callWS.mock.calls.some((c: any) => c[0].type === "weekly_planner/program/delete")).toBe(false);
  });
  it("a concurrent change of the other device survives the conflict retry", async () => {
    const p = program();
    const v = dialog(p, CLIMATE);
    const fresh = structuredClone(p);
    fresh.revision = 2;
    fresh.profiles[0].days[0][1] = { ...close, start: { time: "07:30" } }; // another tab moved the cover's slot
    let saves = 0;
    v.hass.callWS = vi.fn(async (m: any) => {
      if (m.type === "weekly_planner/get") return { programs: [fresh] };
      if (++saves === 1) throw { code: "conflict" };
      return { program: { ...m.program, revision: 3 } };
    });
    const row = v._rows().find((r: any) => r.group.slot.id === "s1");
    v._openRow(row.key, row.program, row.group);
    v._group = { ...v._group, slot: { ...v._group.slot, end: { time: "21:00" } } };
    await v._saveRow();
    expect(saves).toBe(2);
    const day0 = sent(v).profiles[0].days[0];
    expect(day0.find((s: Slot) => s.id === "s1")!.end).toEqual({ time: "21:00" });
    expect(day0.find((s: Slot) => s.id === "s2")!.start).toEqual({ time: "07:30" });
  });
  it("read-only: Save, the D1 choice and Add are disabled", () => {
    const p = program();
    const v = dialog(p, CLIMATE, { read_only: true });
    const shared = v._rows().find((r: any) => r.group.slot.id === "s3");
    v._openRow(shared.key, shared.program, shared.group);
    const html = flat(v._renderEditor(p, shared.key));
    expect(html).not.toMatch(/role="radio" aria-checked="false" class="" >/);
    expect(v._canEdit).toBe(false);
  });
  it("names the device of a refused overlap and the new slot device codes", () => {
    const name = (e: string) => (e === COVER ? "Volet" : e);
    expect(slotDeviceError("fr", "overlapping_slots:cover.salon", name)).toBe("Deux horaires se chevauchent pour Volet.");
    expect(slotDeviceError("en", "empty_slot_entities:s1", name)).toContain("no device");
    expect(slotDeviceError("en", "duplicate_slot_entity:s1:cover.salon", name)).toContain("twice");
    expect(slotDeviceError("en", "unknown_slot_entity:s1:x.y", name)).toContain("not in this program");
    expect(slotDeviceError("en", "overlapping_slots", name)).toBeNull(); // generic text kept by the callers
  });
});

/* ------------------------------------------------------------------ the slot form */

describe("slot form: Also for", () => {
  function form(p: Program, slot: Slot, device: string) {
    const f = new WpSlotForm() as any;
    f.hass = hass(); f.data = data([p]); f.program = p; f.device = device; f.also = true;
    f.group = { slot, days: [0], ids: { 0: slot.id } };
    const events: any[] = [];
    f.dispatchEvent = (e: any) => { events.push(e); return true; };
    return { f, events };
  }
  it("adds and removes the other devices, normalised (all ticked = no list)", () => {
    const p = program();
    const { f, events } = form(p, structuredClone(t15), CLIMATE);
    expect(flat(f.render())).toContain("Also for:");
    expect(flat(f.render())).toContain("Volet");
    f._toggleDevice(COVER);
    expect(events[0].detail.slot.entities).toBeUndefined();
    f.group = events[0].detail;
    f._toggleDevice(COVER);
    expect(events[1].detail.slot.entities).toEqual([CLIMATE]);
  });
  it("is hidden while editing for this device only, and for a single device", () => {
    const p = program();
    const { f } = form(p, structuredClone(t15), CLIMATE);
    f.also = false;
    expect(flat(f.render())).not.toContain("Also for:");
    const one = program({ entities: [{ entity_id: CLIMATE, default_label: null, label_overrides: {} }] } as any);
    expect(flat(form(one, structuredClone(t15), CLIMATE).f.render())).not.toContain("Also for:");
  });
});

/* ------------------------------------------------------------------ the bar editor */

function bar(p: Program, entityId: string, weekday: number) {
  vi.stubGlobal("window", { clearTimeout: vi.fn(), setTimeout: vi.fn(() => 0) });
  const b = new WpBarEditor() as any;
  let live = p;
  b.program = p;
  b.data = data([p], { status: { [p.id]: { active_profile: "home" } } });
  b.entityId = entityId; b.weekday = weekday;
  const emitted: any[] = [];
  b._emit = (name: string, detail: any) => emitted.push({ name, detail });
  b.hass = hass({ callWS: vi.fn(async (m: any) => {
    if (m.type === "weekly_planner/get") return { programs: [live] };
    live = { ...structuredClone(m.program), revision: m.program.revision + 1 };
    b.program = live;
    return { program: live };
  }) });
  return { b, emitted, live: () => live, set: (x: Program) => { live = x; b.program = x; } };
}
const flush = () => new Promise((r) => setTimeout(r, 0));

describe("bar editor: per device", () => {
  it("passes the device, the devices and the new slot devices to the pure edits", () => {
    const { b } = bar(program(), COVER, 0);
    const ctx = b._ctx();
    expect(ctx.entity).toBe(COVER);
    expect(ctx.devices).toEqual([CLIMATE, COVER]);
    expect(ctx.newEntities).toEqual([COVER]);
    expect(b._spansOf(b._baseDay).map((s: any) => s.label)).toEqual(["Fermer"]);
  });
  it("saves an own slot directly, asks This device / All (N) for a shared one", async () => {
    const own = bar(program(), CLIMATE, 0);
    own.b._selected = { kind: "slot", id: "s1" };
    own.b._pickLabel("t15");
    await flush();
    expect(own.b._ask).toBeNull();
    const sh = bar(program(), CLIMATE, 1);
    sh.b._selected = { kind: "slot", id: "s3" };
    sh.b._pickLabel("close");
    expect(sh.b._ask).not.toBeNull();
    expect(sh.b.hass.callWS).not.toHaveBeenCalled(); // never a silent split
    expect(flat(sh.b._askBox())).toContain("All (2)");
    sh.b._answer("one");
    await flush();
    const day1 = sh.live().profiles[0].days[1];
    expect(day1.find((s: Slot) => s.id === "s3")).toMatchObject({ entities: [COVER], label: "t15" });
    expect(day1.find((s: Slot) => s.id !== "s3")).toMatchObject({ entities: [CLIMATE], label: "close", seed: "s3" });
  });
  it("All (N) changes the shared slot; leaving the edit drops the pending change", async () => {
    const a = bar(program(), CLIMATE, 1);
    a.b._selected = { kind: "slot", id: "s3" };
    a.b._pickLabel("close");
    a.b._answer("all");
    await flush();
    expect(a.live().profiles[0].days[1]).toEqual([expect.objectContaining({ id: "s3", label: "close" })]);
    const c = bar(program(), CLIMATE, 1);
    c.b._selected = { kind: "slot", id: "s3" };
    c.b._pickLabel("close");
    c.b._askCancel();
    expect(c.b._ask).toBeNull(); expect(c.b._draft).toBeNull();
    expect(c.b.hass.callWS).not.toHaveBeenCalled();
  });
  it("a concurrent change of the other device survives the conflict retry", async () => {
    const p = program();
    const { b, live, set } = bar(p, CLIMATE, 0);
    let first = true;
    const save = b.hass.callWS;
    b.hass.callWS = vi.fn(async (m: any) => {
      if (m.type === "weekly_planner/program/save" && first) {
        first = false;
        const fresh = structuredClone(p); fresh.revision = 2;
        fresh.profiles[0].days[0][1] = { ...close, start: { time: "07:30" } };
        set(fresh);
        throw { code: "conflict" };
      }
      return save(m);
    });
    await b._commit((all: Slot[][]) => all.map((d, i) => (i ? d : d.map((s) => (s.id === "s1" ? { ...s, end: { time: "21:00" } } : s)))), [0]);
    const day0 = live().profiles[0].days[0];
    expect(day0.find((s: Slot) => s.id === "s1")!.end).toEqual({ time: "21:00" });
    expect(day0.find((s: Slot) => s.id === "s2")!.start).toEqual({ time: "07:30" });
  });
  it("undo restores only the slots the edit wrote, keeps another device's change, and says when it cannot", async () => {
    const p = program();
    const { b, emitted, live, set } = bar(p, CLIMATE, 0);
    await b._commit((all: Slot[][]) => all.map((d, i) => (i ? d : d.map((s) => (s.id === "s1" ? { ...s, end: { time: "21:00" } } : s)))), [0]);
    const undo = emitted.find((e) => e.name === "edited").detail.undo;
    const other = structuredClone(live());
    other.profiles[0].days[0] = other.profiles[0].days[0].map((s: Slot) => (s.id === "s2" ? { ...s, start: { time: "07:30" } } : s));
    set(other);
    expect(await undo()).toBe(true);
    const day0 = live().profiles[0].days[0];
    expect(day0.find((s: Slot) => s.id === "s1")!.end).toEqual({ time: "22:00" });
    expect(day0.find((s: Slot) => s.id === "s2")!.start).toEqual({ time: "07:30" });
    // our slot changed since: refused with a message
    await b._commit((all: Slot[][]) => all.map((d, i) => (i ? d : d.map((s) => (s.id === "s1" ? { ...s, end: { time: "20:00" } } : s)))), [0]);
    const undo2 = emitted.filter((e) => e.name === "edited").slice(-1)[0].detail.undo;
    const moved = structuredClone(live());
    moved.profiles[0].days[0] = moved.profiles[0].days[0].map((s: Slot) => (s.id === "s1" ? { ...s, end: { time: "19:00" } } : s));
    set(moved);
    expect(await undo2()).toBe(false);
    expect(b._error).toContain("Cannot undo");
  });
});

/* ------------------------------------------------------------------ pure helpers of the screens */

describe("device helpers", () => {
  it("isolateForDevice splits shared slots only, keeping the id on the kept part", () => {
    let n = 0;
    const r = isolateForDevice([both, t15], CLIMATE, [CLIMATE, COVER], ["s3", "s1"], () => `n${++n}`);
    expect(r.day.map((s) => [s.id, s.entities, s.seed])).toEqual([["s3", [COVER], undefined], ["n1", [CLIMATE], "s3"], ["s1", [CLIMATE], undefined]]);
    expect(r.map.get("s3")).toBe("n1"); expect(r.map.has("s1")).toBe(false);
  });
  it("undoSlots refuses a result that overlaps", () => {
    const a: Slot = { id: "a", start: { time: "08:00" }, end: { time: "10:00" }, label: "t15" };
    const b: Slot = { id: "b", start: { time: "09:00" }, end: { time: "11:00" }, label: "t15" };
    expect(undoSlots([b], [a], [])).toBeNull();
  });
  it("counts own and common slots, drops a device's slots in every mode", () => {
    const p = program();
    p.profiles[1].days[3] = [{ ...close, id: "x" }];
    expect(ownSlotCount(p, COVER)).toBe(2);
    expect(commonSlotCount(p)).toBe(1);
    const d = dropDeviceSlots(p, COVER);
    expect(d.profiles[1].days[3]).toEqual([]);
    expect(d.profiles[0].days[1][0].entities).toEqual([CLIMATE]);
  });
});

/* ------------------------------------------------------------------ the program editor */

function editor(p: Program) {
  vi.stubGlobal("customElements", { get: () => undefined });
  const e = new WpProgramEditor() as any;
  e.dispatchEvent = () => true;
  e.requestUpdate = vi.fn();
  e.hass = hass({ connection: {}, callWS: vi.fn(async (m: any) => (m.type === "weekly_planner/get" ? { programs: [p] } : m.type === "weekly_planner/program/save" ? { program: { ...m.program, revision: 2 } } : {})) });
  e.data = data([p], { status: { [p.id]: { active_profile: "home" } } });
  e.program = p;
  e.renderRoot = { querySelector: vi.fn(() => null), querySelectorAll: () => [] };
  Object.defineProperty(e, "updateComplete", { value: Promise.resolve(true) });
  e.willUpdate();
  return e;
}

describe("program editor: device confirmations", () => {
  it("removing a device says how many own slots go, removes them in every mode, and undo/redo restores", async () => {
    const p = program();
    p.profiles[1].days[2] = [{ ...close, id: "y" }];
    const e = editor(p);
    await e._askDeleteEntity(1);
    expect(vi.mocked(confirmAction).mock.calls[0][1]).toContain("2 own schedules");
    expect(e._p.entities.map((x: any) => x.entity_id)).toEqual([CLIMATE]);
    expect(e._p.profiles[0].days[0].map((s: Slot) => s.id)).toEqual(["s1"]);
    expect(e._p.profiles[0].days[0][0].entities).toBeUndefined(); // single device: never a list (D5)
    expect(e._p.profiles[1].days[2]).toEqual([]);
    e._undoDraft();
    expect(e._p.entities).toHaveLength(2);
    expect(e._p.profiles[0].days[0].map((s: Slot) => s.id)).toEqual(["s1", "s2"]);
    e._redoDraft();
    expect(e._p.entities).toHaveLength(1);
    await e._save();
    const payload = e.hass.callWS.mock.calls.find((c: any) => c[0].type === "weekly_planner/program/save")[0].program;
    expect(payload.profiles[0].days[0].map((s: Slot) => s.id)).toEqual(["s1"]);
  });
  it("an added device gets a short note: it follows the shared slots", () => {
    const p = program();
    const e = editor(p);
    e._addEntity("light.lamp");
    const html = flat(e._renderEntity(e._p.entities[2], 2));
    expect(html).toContain("Follows the 1 schedules shared by all devices.");
    expect(flat(e._renderEntity(e._p.entities[0], 0))).not.toContain("Follows the");
  });
  it("a command taken off a device offers to take its now incompatible slots off it", () => {
    const p = program();
    const e = editor(p);
    e._setEntity(0, { allowed_services: [], restrict_services: true });
    const html = flat(e._renderEntity(e._p.entities[0], 0));
    expect(html).toContain("2 schedules of this device use a command");
    find(e._renderEntity(e._p.entities[0], 0), "click", 'class="notice"').fn();
    expect(e._p.profiles[0].days[0].map((s: Slot) => s.id)).toEqual(["s2"]);
    expect(e._p.profiles[0].days[1]).toEqual([expect.objectContaining({ id: "s3", entities: [COVER] })]);
  });
  it("a mode copy keeps the device lists", () => {
    const p = program();
    const e = editor(p);
    e._profileForm = { mode: "copy", name: "Copy" };
    e._submitProfileForm();
    const copy = e._p.profiles.find((x: any) => x.name === "Copy");
    expect(copy.days[0].map((s: Slot) => s.entities)).toEqual([[CLIMATE], [COVER]]);
    expect(copy.days[0][0].id).not.toBe("s1");
  });
});
