import { describe, expect, it, vi } from "vitest";
import { allSlots, holidayApplies, holidayChoice, holidayDayToday, holidayLine } from "../holiday";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { WpHoliday, passesMidnight } from "../components/holiday-section";
import { WpSchedule } from "../components/schedule-dialog";
import { WpTimesDay } from "../components/times-day";
import { syncPreviewCache, fetchPreviewResponse, clearPreviewCache } from "../preview-cache";
import { flat } from "./helpers/tpl";

const slot = (id: string, start = "08:00", end: string | null = "09:00", label = "l") => ({ id, label, start: { time: start }, ...(end ? { end: { time: end } } : {}) });
const days = () => Array.from({ length: 7 }, (_, i) => (i === 6 ? [slot("sun")] : []));
const profile = (holiday?: any) => ({ id: "pr", name: "A", days: days(), ...(holiday !== undefined ? { holiday } : {}) });

describe("day-off wording", () => {
  it("copy and own lines, EN and FR, hidden when the copied day is the real one", () => {
    expect(holidayLine("en", { copy: 6 }, 0)).toBe("Day off: like sunday, not monday");
    expect(holidayLine("en", { own: true }, 0)).toBe("Day off: own schedule, not monday’s");
    expect(holidayLine("fr", { copy: 6 }, 0)).toBe("Férié : comme dimanche, pas lundi");
    expect(holidayLine("fr", { own: true }, 0)).toBe("Férié : horaires propres, pas lundi");
    expect(holidayLine("en", { copy: 0 }, 0)).toBeNull();
  });
  it("choice, slots and the day that runs", () => {
    expect(holidayChoice(profile())).toBe("none");
    expect(holidayChoice(profile(null))).toBe("none");
    expect(holidayChoice(profile({ copy: 2 }))).toBe("copy");
    expect(holidayChoice(profile({ day: [] }))).toBe("own");
    expect(allSlots(profile({ day: [slot("h")] })).map((s) => s.id)).toEqual(["sun", "h"]);
    expect(holidayDayToday(profile({ copy: 6 }), { holiday_today: true }, true)!.map((s) => s.id)).toEqual(["sun"]);
    expect(holidayDayToday(profile({ day: [slot("h")] }), { holiday_today: true }, true)!.map((s) => s.id)).toEqual(["h"]);
    expect(holidayDayToday(profile({ copy: 6 }), { holiday_today: false }, true)).toBeNull();
    expect(holidayDayToday(profile({ copy: 6 }), { holiday_today: true }, false)).toBeNull();
    expect(holidayApplies({ status: { p: { holiday: { own: true } }, q: {} } } as any, "p")).toBe(true);
    expect(holidayApplies({ status: { q: {} } } as any, "q")).toBe(false);
  });
});

const hass: any = { language: "en", config: { time_zone: "UTC" }, states: { "cover.b": { entity_id: "cover.b", state: "open", attributes: {} } }, services: { cover: { open_cover: { fields: {} } } } };
const label = { id: "l", name: "Open", color: "#0f0", action: { kind: "service", service: "cover.open_cover" } };
const program = (id = "p", prof: any = profile()) => ({ id, name: id.toUpperCase(), revision: 3, priority: 1, enabled: true, reapply: true, conditions: [],
  entities: [{ entity_id: "cover.b", default_label: null, label_overrides: {} }], profiles: [prof] });
const card = (data: any, config: any = {}) => {
  const c = new WeeklyPlannerCard() as any;
  c.hass = hass; c._config = config; c._now = new Date("2026-11-02T09:00:00Z"); // a Monday
  c._data = { labels: [label], programs: [], status: {}, can_edit: true, read_only: false, ...data };
  return c;
};

describe("card on a day off", () => {
  it("shows the line only when today is a day off that changes the program", () => {
    const p = program();
    const on = card({ programs: [p], holiday_today: true, status: { p: { holiday: { copy: 6 } } } });
    expect(flat(on._holidayLine([p]))).toContain("Day off: like sunday, not monday");
    expect(flat(card({ programs: [p], holiday_today: false, status: { p: { holiday: { copy: 6 } } } })._holidayLine([p]))).toBe("");
    expect(flat(card({ programs: [p], holiday_today: true, status: { p: {} } })._holidayLine([p]))).toBe("");
    expect(flat(card({ programs: [p], holiday_today: true, status: { p: { holiday: { copy: 0 } } } })._holidayLine([p]))).toBe("");
  });
  it("names the programs when their lines differ", () => {
    const a = program("a"), b = program("b");
    const c = card({ programs: [a, b], holiday_today: true, status: { a: { holiday: { copy: 6 } }, b: { holiday: { own: true } } } });
    const t = flat(c._holidayLine([a, b]));
    expect(t).toContain("A : Day off: like sunday");
    expect(t).toContain("B : Day off: own schedule");
  });
  it("today's bar and today's week row are read-only on a day off, other days are not", () => {
    const p = program();
    const c = card({ programs: [p], holiday_today: true, status: { p: { holiday: { own: true } } } });
    expect(c._barEditable(p, 0)).toBe(false);
    expect(c._barEditable(p, 1)).toBe(true);
    expect(card({ programs: [p], status: { p: {} } })._barEditable(p, 0)).toBe(true);
  });
  it("draws what runs today from the setting while no preview has arrived", () => {
    const p = program("p", profile({ day: [slot("h", "10:00", "11:00")] }));
    const c = card({ programs: [p], holiday_today: true, status: { p: { holiday: { own: true } } } });
    c._preview = {};
    expect(c._spans("cover.b", [p], 0).map((s: any) => [s.slotId, s.start, s.end])).toEqual([["h", 600, 660]]);
    const normal = card({ programs: [p], holiday_today: false, status: { p: {} } });
    normal._preview = {};
    expect(normal._spans("cover.b", [p], 0)).toEqual([]);
  });
  it("draws a preview slot that belongs to the day off", () => {
    const p = program("p", profile({ day: [slot("h", "10:00", "11:00")] }));
    const c = card({ programs: [p], holiday_today: true, status: { p: { holiday: { own: true } } } });
    c._preview = { "2026-11-02": { p: { slots: [{ slot_id: "h", start: "2026-11-02T10:00:00+00:00", end: "2026-11-02T11:00:00+00:00", ignored: null, sun: false }], holiday: true } }, "2026-11-01": { p: { slots: [] } } };
    expect(c._spans("cover.b", [p], 0).map((s: any) => s.slotId)).toEqual(["h"]);
  });
  it("the times view keeps its Edit button but its rows are not buttons on a day off", () => {
    const el = new WpTimesDay() as any;
    el.lang = "en"; el.editable = true; el.state = "ready";
    el.rows = [{ startMin: 600, label: "Open", color: "#0f0", until: null, now: false, done: false }];
    expect(flat(el.render())).toContain('<button class="row"');
    el.locked = true;
    const t = flat(el.render());
    expect(t).not.toContain('<button class="row"');
    expect(t).toContain('class="action"');
  });
});

describe("day-off section", () => {
  const make = (extra: any = {}) => {
    const el = new WpHoliday() as any;
    el.hass = { ...hass, callWS: vi.fn(async () => ({ program: { id: "p" } })) };
    el.data = { labels: [label], programs: [], status: {} };
    el.program = program();
    el.profile = profile();
    el.canEdit = true;
    Object.assign(el, extra);
    return el;
  };
  it("is closed by default, with aria-expanded and the three choices", () => {
    const el = make();
    const tpl = el.render();
    const t = flat(tpl);
    expect(el._open).toBe(false);
    expect(t).toContain("aria-expanded=");
    expect(t).toContain("aria-controls=");
    // the only booleans bound are aria-expanded (closed) and the hidden body
    expect(tpl.values.filter((v: unknown) => v === false || v === true)).toEqual([false, true]);
    el._open = true;
    expect(el.render().values.filter((v: unknown) => v === false || v === true)).toEqual([true, false]);
    for (const w of ["No special setting", "Same schedules as:", "Own schedule"]) expect(t).toContain(w);
  });
  it("writes a copy and an own day with the revision", async () => {
    const el = make();
    await el._choose("copy");
    expect(el.hass.callWS).toHaveBeenLastCalledWith({ type: "weekly_planner/program/holiday", program_id: "p", profile_id: "pr", holiday: { copy: 0 }, revision: 3 });
    await el._choose("own");
    expect(el.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { day: [] } }));
  });
  it("saves a new own slot and removes one", async () => {
    const el = make({ profile: profile({ day: [slot("h")] }) });
    el._add();
    el._group = { ...el._group, slot: { ...el._group.slot, id: "n" } };
    await el._save();
    expect(el.hass.callWS.mock.calls[0][0].holiday.day.map((s: any) => s.id)).toEqual(["h", "n"]);
    await el._delete(slot("h"));
    expect(el.hass.callWS.mock.calls[1][0].holiday.day).toEqual([]);
  });
  it("is read-only for a mode that follows another and shows the copied day off", async () => {
    const el = make({ source: { ...profile({ copy: 6 }), name: "Src" } });
    expect(flat(el.render())).toContain("Day off of Src: like sunday");
    await el._choose("own");
    expect(el.hass.callWS).not.toHaveBeenCalled();
  });
  it("warns on a slot that passes midnight", () => {
    expect(passesMidnight(hass, slot("x", "22:00", "02:00") as any)).toBe(true);
    expect(passesMidnight(hass, slot("x", "08:00", "09:00") as any)).toBe(false);
    expect(passesMidnight(hass, slot("x", "08:00", null) as any)).toBe(false);
  });
  it("shows an error from the server", async () => {
    const el = make();
    el.hass.callWS = vi.fn(async () => { throw { code: "conflict", message: "conflict" }; });
    await el._choose("copy");
    expect(el._error).not.toBe("");
  });
  it("the schedules window shows it only with a day-off entity, one per program", () => {
    const w = new WpSchedule() as any;
    w.hass = hass;
    w.scope = { kind: "program", programId: "p" };
    w.data = { labels: [label], programs: [program()], status: {}, can_edit: true, holiday_entity: null };
    expect(w._renderHoliday()).toBeDefined();
    expect(flat(w._renderHoliday())).toBe("");
    w.data = { ...w.data, holiday_entity: "binary_sensor.off" };
    expect(w._renderHoliday()).toHaveLength(1);
  });
});

describe("preview cache and a day off", () => {
  it("a day off starting drops the cached previews and keeps the flag", async () => {
    clearPreviewCache();
    const ws = vi.fn(async () => ({ slots: [], holiday: true }));
    const h: any = { callWS: ws };
    syncPreviewCache({ card_version: "v", holiday_today: false, programs: [{ id: "p", revision: 1 }] });
    expect((await fetchPreviewResponse(h, "p", 1, "2026-11-02")).holiday).toBe(true);
    await fetchPreviewResponse(h, "p", 1, "2026-11-02");
    expect(ws).toHaveBeenCalledTimes(1);
    syncPreviewCache({ card_version: "v", holiday_today: true, programs: [{ id: "p", revision: 1 }] });
    await fetchPreviewResponse(h, "p", 1, "2026-11-02");
    expect(ws).toHaveBeenCalledTimes(2);
  });
});
