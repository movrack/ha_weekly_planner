import { describe, expect, it, vi } from "vitest";
import { allSlots, dayInText, holidayApplies, holidayChoice, holidayDayToday, holidayKind, holidayLine, holidayOwnSlots, holidayReplaces } from "../holiday";
import { t } from "../i18n";
import { specText } from "../actions";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { WpHoliday, passesMidnight } from "../components/holiday-section";
import { WpSchedule } from "../components/schedule-dialog";
import { WpTimesDay } from "../components/times-day";
import { syncPreviewCache, fetchPreviewResponse, clearPreviewCache } from "../preview-cache";
import { WpBarEditor } from "../components/bar-editor";
import { confirmAction } from "../components/confirm";
import { flat, handlers } from "./helpers/tpl";

vi.mock("../components/confirm", async (orig) => ({ ...(await orig<typeof import("../components/confirm")>()), confirmAction: vi.fn(async () => true) }));

const slot = (id: string, start = "08:00", end: string | null = "09:00", label = "l") => ({ id, label, start: { time: start }, ...(end ? { end: { time: end } } : {}) });
const days = () => Array.from({ length: 7 }, (_, i) => (i === 6 ? [slot("sun")] : []));
const profile = (holiday?: any) => ({ id: "pr", name: "A", days: days(), ...(holiday !== undefined ? { holiday } : {}) });

describe("day-off wording", () => {
  it("copy and own lines, EN and FR, hidden when the copied day is the real one", () => {
    expect(holidayLine("en", { copy: 6 }, 0)).toBe("Day off today: Sunday’s schedule");
    expect(holidayLine("en", { own: true }, 0)).toBe("Day off today: own schedule");
    expect(holidayLine("fr", { copy: 6 }, 0)).toBe("Aujourd’hui férié : horaires du dimanche");
    expect(holidayLine("fr", { own: true }, 0)).toBe("Aujourd’hui férié : horaires propres");
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

describe("holidayReplaces", () => {
  const data = (h?: any) => ({ status: { p: h ? { holiday: h } : {} } }) as any;
  it("a copy of the real weekday replaces nothing; another copy, an own day replace; no status does not", () => {
    expect(holidayReplaces(data({ copy: 0 }), "p", 0)).toBe(false);
    expect(holidayReplaces(data({ copy: 6 }), "p", 0)).toBe(true);
    expect(holidayReplaces(data({ own: true }), "p", 0)).toBe(true);
    expect(holidayReplaces(data(), "p", 0)).toBe(false);
    expect(holidayReplaces(data({ copy: 6 }), "other", 0)).toBe(false);
    expect(holidayReplaces(undefined, "p", 0)).toBe(false);
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
    expect(flat(on._holidayLine([p]))).toContain("Day off today: Sunday’s schedule");
    expect(flat(card({ programs: [p], holiday_today: false, status: { p: { holiday: { copy: 6 } } } })._holidayLine([p]))).toBe("");
    expect(flat(card({ programs: [p], holiday_today: true, status: { p: {} } })._holidayLine([p]))).toBe("");
    expect(flat(card({ programs: [p], holiday_today: true, status: { p: { holiday: { copy: 0 } } } })._holidayLine([p]))).toBe("");
  });
  it("names the programs when their lines differ", () => {
    const a = program("a"), b = program("b");
    const c = card({ programs: [a, b], holiday_today: true, status: { a: { holiday: { copy: 6 } }, b: { holiday: { own: true } } } });
    const t = flat(c._holidayLine([a, b]));
    expect(t).toContain("A · Day off today: Sunday’s schedule");
    expect(t).toContain("B · Day off today: own schedule");
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
  it("the times view rows are not buttons on a day off (the header icon opens the editor)", () => {
    const el = new WpTimesDay() as any;
    el.lang = "en"; el.editable = true; el.state = "ready";
    el.rows = [{ startMin: 600, label: "Open", color: "#0f0", until: null, now: false, done: false }];
    expect(flat(el.render())).toContain('<button class="row"');
    el.locked = true;
    const t = flat(el.render());
    expect(t).not.toContain('<button class="row"');
    expect(t).not.toContain('class="action"');
  });
  it("a locked empty day shows no Add a schedule button, an unlocked one does", () => {
    const el = new WpTimesDay() as any;
    el.lang = "en"; el.editable = true; el.state = "ready"; el.rows = [];
    expect(flat(el.render())).toContain('class="action"');
    el.locked = true;
    expect(flat(el.render())).not.toContain('class="action"');
  });
});

/** A stand-in for the shadow root of a rendered section: the controls, and which one holds the focus. */
const fakeRoot = (el: any) => {
  const h = el.profile.holiday;
  const kind = !h || h.off ? "none" : "copy" in h ? "copy" : "own";
  const root: any = { activeElement: null };
  Object.defineProperty(el, "updateComplete", { value: Promise.resolve(true) }); // an element that is not connected never finishes its first update
  const ctl = (extra: object) => ({ focus() { root.activeElement = this; }, ...extra });
  root.sw = ctl({ checked: kind !== "none" });
  root.radios = ["copy", "own"].map((v) => ctl({ dataset: { v }, checked: v === kind }));
  root.day = ctl({ value: String(h && "copy" in h ? h.copy : 6) });
  root.head = ctl({});
  root.querySelectorAll = () => root.radios;
  root.querySelector = (sel: string) => sel === 'input[role="switch"]' ? root.sw : sel === ".day" ? root.day : sel === ".head" ? root.head
    : root.radios.find((r: any) => sel === `input[data-v="${r.dataset.v}"]`) ?? null;
  return root;
};

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
  it("is closed by default, with aria-expanded and the day-off switch", () => {
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
    expect(t).toContain('role="switch"');
    expect(t).toContain("Different schedule on days off");
    expect(t).not.toContain('type="radio"'); // off: no radios
    const on = flat(make({ profile: profile({ copy: 6 }) }).render());
    for (const w of ["Same as:", "My own schedule"]) expect(on).toContain(w);
  });
  it("switch on with no setting writes Sunday (copy 6)", async () => {
    const el = make();
    await el._toggle(true);
    expect(el.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { copy: 6 } }));
  });
  it("switch off keeps the setting with off: true and asks nothing; on gives the same choice back", async () => {
    (confirmAction as any).mockClear();
    const own = make({ profile: profile({ day: [slot("h")] }) });
    await own._toggle(false);
    expect(own.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { day: [slot("h")], off: true } }));
    const copy = make({ profile: profile({ copy: 3, day: [slot("h")] }) });
    await copy._toggle(false);
    expect(copy.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { copy: 3, day: [slot("h")], off: true } }));
    expect(confirmAction).not.toHaveBeenCalled();
    const back = make({ profile: profile({ copy: 3, day: [slot("h")], off: true }) });
    await back._toggle(true);
    expect(back.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { copy: 3, day: [slot("h")] } }));
    const backOwn = make({ profile: profile({ day: [slot("h")], off: true }) });
    await backOwn._toggle(true);
    expect(backOwn.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { day: [slot("h")] } }));
  });
  it("own -> copy keeps the own slots beside the copy, copy -> own gives them back, nothing is asked", async () => {
    (confirmAction as any).mockClear();
    const own = make({ profile: profile({ day: [slot("h")] }) });
    await own._choose("copy");
    expect(own.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { copy: 6, day: [slot("h")] } }));
    const empty = make({ profile: profile({ day: [] }) });
    await empty._choose("copy");
    expect(empty.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { copy: 6 } }));
    const kept = make({ profile: profile({ copy: 2, day: [slot("h")] }) });
    await kept._choose("own");
    expect(kept.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { day: [slot("h")] } }));
    const plain = make({ profile: profile({ copy: 2 }) });
    await plain._choose("own");
    expect(plain.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { day: [] } }));
    expect(confirmAction).not.toHaveBeenCalled();
  });
  it("changing the weekday keeps the kept own slots", async () => {
    const el = make({ profile: profile({ copy: 2, day: [slot("h")] }) });
    await el._pickDay(4);
    expect(el.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { copy: 4, day: [slot("h")] } }));
  });
  it("kind and choice: a setting that is off is no choice but keeps its kind", () => {
    expect(holidayChoice(profile({ copy: 2, off: true }))).toBe("none");
    expect(holidayKind(profile({ copy: 2, off: true }))).toBe("copy");
    expect(holidayKind(profile({ day: [], off: true }))).toBe("own");
    expect(holidayDayToday(profile({ copy: 6, off: true }), { holiday_today: true }, true)).toBeNull();
    expect(holidayOwnSlots(profile({ copy: 6, day: [slot("h")], off: true })).map((x) => x.id)).toEqual(["h"]);
    expect(holidayOwnSlots(profile({ copy: 6 }))).toEqual([]);
  });
  it("the head says normal day when the setting is off", () => {
    expect(flat(make({ profile: profile({ copy: 2, off: true }) }).render())).toContain(t("en", "holiday_what_none"));
    expect(flat(make({ profile: profile({ copy: 2 }) }).render())).toContain(t("en", "holiday_what_copy", { day: dayInText("en", 2) }));
  });
  it("a failed write puts the switch, the radios and the select back on the saved state and keeps the draft", async () => {
    const el = make({ profile: profile({ copy: 2, day: [slot("h")] }) });
    const root = fakeRoot(el);
    el.renderRoot = root;
    el.hass.callWS = vi.fn(async () => { throw { code: "conflict", message: "conflict" }; });
    el._add();
    root.sw.checked = false; // the user has just turned it off
    await el._toggle(false);
    expect(root.sw.checked).toBe(true);
    expect(root.radios.map((r: any) => r.checked)).toEqual([true, false]);
    expect(el._editing).toBe("new");
    expect(el._group).not.toBeNull();
    root.radios[0].checked = false; root.radios[1].checked = true;
    await el._choose("own");
    expect(root.radios.map((r: any) => [r.dataset.v, r.checked])).toEqual([["copy", true], ["own", false]]);
    root.day.value = "5";
    await el._pickDay(5);
    expect(root.day.value).toBe("2");
    expect(el._group).not.toBeNull();
  });
  it("a successful write clears the draft", async () => {
    const el = make({ profile: profile({ day: [slot("h")] }) });
    el.renderRoot = fakeRoot(el);
    el._add();
    await el._choose("copy");
    expect(el._editing).toBeNull();
    expect(el._group).toBeNull();
  });
  it("the focus stays on the control used: the switch after the switch, that radio after a radio, the select after the select", async () => {
    const el = make({ profile: profile({ copy: 2 }) });
    const root = fakeRoot(el);
    el.renderRoot = root;
    const settle = () => new Promise((r) => setTimeout(r, 0));
    await el._toggle(false);
    await settle();
    expect(root.activeElement).toBe(root.sw);
    await el._choose("own");
    await settle();
    expect(root.activeElement).toBe(root.radios[1]);
    await el._pickDay(3);
    await settle();
    expect(root.activeElement).toBe(root.day);
  });
  it("writes a copy and an own day with the revision", async () => {
    const el = make();
    await el._choose("copy");
    expect(el.hass.callWS).toHaveBeenLastCalledWith({ type: "weekly_planner/program/holiday", program_id: "p", profile_id: "pr", holiday: { copy: 6 }, revision: 3 });
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
    expect(flat(el.render())).toContain("This mode has the same schedules as Src, day off included. To change them, choose the mode Src.");
    await el._choose("own");
    expect(el.hass.callWS).not.toHaveBeenCalled();
  });
  it("a follower shows the note, no switch and no radios", () => {
    const t = flat(make({ source: { ...profile({ copy: 6 }), name: "Src" } }).render());
    expect(t).not.toContain('type="radio"');
    expect(t).not.toContain('role="switch"');
  });
  it("deleting an own-day slot asks first; No writes nothing, Yes writes", async () => {
    const el = make({ profile: profile({ day: [slot("h", "08:00", "09:00")] }) });
    (confirmAction as any).mockClear();
    (confirmAction as any).mockResolvedValueOnce(false);
    await el._delete(slot("h", "08:00", "09:00"));
    expect(confirmAction).toHaveBeenCalledWith(el, `${t("en", "w_confirm_slot")} ${specText("en", { time: "08:00" })}–${specText("en", { time: "09:00" })}`, t("en", "slot_delete_yes"), t("en", "slot_delete_no"));
    expect(el.hass.callWS).not.toHaveBeenCalled();
    await el._delete(slot("h", "08:00", "09:00"));
    expect(el.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { day: [] } }));
  });
  it("C: the own-day form has the title and hides the Days section", () => {
    const el = make({ profile: profile({ day: [slot("h")] }) });
    expect(flat(el.render())).not.toContain("Day-off schedule");
    el._add();
    const open = flat(el.render());
    expect(open).toContain("Day-off schedule");
    expect(open).toContain(".noDays=");
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

describe("a locked day", () => {
  it("shows the reason under today's bar only when a day off replaces the day", () => {
    const p = program();
    const on = card({ programs: [p], holiday_today: true, status: { p: { holiday: { own: true } } } });
    expect(flat(on._lockedNote(p))).toContain("Day off: to change this schedule, open Schedule (calendar icon), then “Day off”.");
    expect(flat(card({ programs: [p], status: { p: {} } })._lockedNote(p))).toBe("");
  });
  it("the note names the copied day for a copy and keeps the generic text for an own day, in both languages", () => {
    const p = program();
    const copy = card({ programs: [p], holiday_today: true, status: { p: { holiday: { copy: 6 } } } }); // today is a Monday
    expect(flat(copy._lockedNote(p))).toContain(t("en", "holiday_locked_copy", { day: dayInText("en", 6) }));
    expect(copy._lockedText(p)).toBe("Day off: today uses Sunday’s schedule. To change it, change Sunday.");
    copy._config = {};
    copy.hass = { ...hass, language: "fr" };
    expect(copy._lockedText(p)).toBe("Jour férié : aujourd’hui suit les horaires du dimanche. Pour les changer, modifiez le dimanche.");
    const own = card({ programs: [p], holiday_today: true, status: { p: { holiday: { own: true } } } });
    expect(own._lockedText(p)).toBe(t("en", "holiday_locked"));
  });
  it("a copy of the real weekday locks nothing: bar editable, no note, no reason, no times lock", () => {
    const p = program();
    const c = card({ programs: [p], holiday_today: true, status: { p: { holiday: { copy: 0 } } } }); // today is a Monday (0)
    expect(c._barEditable(p, 0)).toBe(true);
    expect(flat(c._lockedNote(p))).toBe("");
    const bar = c._bar("cover.b", p, 0, "today", () => {});
    expect(bar.values).toContain("");
    expect(bar.values).not.toContain(t("en", "holiday_locked_copy", { day: "Monday" }));
    const other = card({ programs: [p], holiday_today: true, status: { p: { holiday: { copy: 1 } } } });
    expect(other._barEditable(p, 0)).toBe(false);
    expect(other._bar("cover.b", p, 0, "today", () => {}).values).toContain(t("en", "holiday_locked_copy", { day: "Tuesday" }));
  });
  it("the week schematic of the window shows the day that runs today, not the normal day", () => {
    const p: any = program("p", profile({ day: [slot("h", "10:00", "11:00")] }));
    const w = new WpSchedule() as any;
    w.hass = hass;
    w.scope = { kind: "device", entityId: "cover.b" };
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-12T10:00:00Z")); // a Thursday
    w.data = { labels: [label], programs: [p], status: { p: { holiday: { own: true } } }, can_edit: true, holiday_today: true };
    const found: any[] = [];
    const walk = (v: any): void => {
      if (Array.isArray(v)) { if (v.length && v.every((x) => x && typeof x === "object" && "startSpec" in x)) found.push(v); else v.forEach(walk); }
      else if (v?.values) v.values.forEach(walk);
    };
    walk(w._renderWeek());
    // Thursday carries the day off's slot (10:00-11:00) instead of its own (none); Sunday keeps its normal slot (08:00-09:00)
    const withSpans = found.map((spans) => spans.map((x: any) => [x.start, x.end]));
    expect(withSpans).toEqual([[[600, 660]], [[480, 540]]]);
    vi.useRealTimers();
  });
});

describe("week note on a day off", () => {
  const win = (data: any) => {
    const w = new WpSchedule() as any;
    w.hass = hass;
    w.scope = { kind: "device", entityId: "cover.b" };
    w.data = { labels: [label], programs: [program("p", profile({ day: [slot("h")] }))], status: {}, can_edit: true, ...data };
    return w;
  };
  it("D: names today only when a day off replaces today's row, in the week view", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-12T10:00:00Z")); // a Thursday
    const on = win({ holiday_today: true, status: { p: { holiday: { own: true } } } });
    expect(flat(on._renderWeekNote())).toContain("Today (Thursday) is a day off: its row shows the day-off schedule.");
    on._open = "new";
    expect(flat(on._renderWeekNote())).toBe("");
    expect(flat(win({ holiday_today: false, status: { p: { holiday: { own: true } } } })._renderWeekNote())).toBe("");
    expect(flat(win({ holiday_today: true, status: { p: {} } })._renderWeekNote())).toBe("");
    vi.useRealTimers();
  });
  it("shows nothing when the copied day is the real day, and nothing for a mode that is not the active one", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-12T10:00:00Z")); // a Thursday (3)
    const copyReal = win({ holiday_today: true, status: { p: { holiday: { copy: 3 } } } });
    copyReal.data = { ...copyReal.data, programs: [program("p", profile({ copy: 3 }))] };
    expect(flat(copyReal._renderWeekNote())).toBe("");
    const copyOther = win({ holiday_today: true, status: { p: { holiday: { copy: 6 } } } });
    copyOther.data = { ...copyOther.data, programs: [program("p", profile({ copy: 6 }))] };
    expect(flat(copyOther._renderWeekNote())).toContain("is a day off");
    // the opened mode is not the active one: the server status is about the active mode
    const modeOnly = win({ holiday_today: true, status: { p: { holiday: { own: true } } }, mode: { selector: "input_select.m", active: "Other" } });
    modeOnly.data.mode.options = ["A", "Other"];
    modeOnly._viewMode = "A";
    expect(modeOnly._modeOnly).toBe(true);
    expect(flat(modeOnly._renderWeekNote())).toBe("");
    vi.useRealTimers();
  });
});

describe("the Day off block for another mode", () => {
  it("is shown for a mode that is not the active one and writes to that mode's profile", async () => {
    const other = { id: "pr2", name: "B", days: days(), holiday: { copy: 3 } };
    const p: any = { ...program("p"), profiles: [profile(), other] };
    const w = new WpSchedule() as any;
    w.hass = { ...hass, callWS: vi.fn(async () => ({ program: p })) };
    w.scope = { kind: "device", entityId: "cover.b" };
    w.data = { labels: [label], programs: [p], status: {}, can_edit: true, holiday_entity: "binary_sensor.off", mode: { selector: "input_select.m", active: "A", options: ["A", "B"] } };
    w._viewMode = "B";
    expect(w._modeOnly).toBe(true);
    const flatTree = flat(w.render());
    expect(flatTree).toContain("<wp-holiday");
    const blocks = w._renderHoliday();
    expect(blocks).toHaveLength(1);
    const section = blocks[0].values.find((v: any) => v && v.id === "pr2");
    expect(section.name).toBe("B");
    const el = new WpHoliday() as any;
    el.hass = w.hass; el.data = w.data; el.program = p; el.profile = section; el.canEdit = true;
    await el._toggle(false);
    expect(w.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ profile_id: "pr2", holiday: { copy: 3, off: true } }));
  });
});

describe("keyboard and screen reader", () => {
  const make = (profileValue: any) => {
    const el = new WpHoliday() as any;
    el.hass = { ...hass, callWS: vi.fn(async () => ({ program: { id: "p" } })) };
    el.data = { labels: [label], programs: [], status: {} };
    el.program = program();
    el.profile = profile(profileValue);
    el.canEdit = true;
    el.renderRoot = { querySelectorAll: () => [], querySelector: () => null };
    return el;
  };
  it("leaving an own day that has slots asks nothing and keeps them", async () => {
    const el = make({ day: [slot("h")] });
    (confirmAction as any).mockClear();
    await el._choose("copy");
    expect(confirmAction).not.toHaveBeenCalled();
    expect(el.hass.callWS).toHaveBeenCalledWith(expect.objectContaining({ holiday: { copy: 6, day: [slot("h")] } }));
  });
  it("announces Saved and Deleted in an always-present status region", async () => {
    const el = make({ day: [slot("h")] });
    expect(flat(el.render())).toContain('role="status"');
    await el._choose("copy");
    expect(el._status).toBe("Saved");
    el.profile = profile({ day: [slot("h")] });
    await el._delete(slot("h"));
    expect(el._status).toBe("Deleted");
  });
  it("the radios sit in a fieldset with a legend", () => {
    const t = flat(make({ copy: 6 }).render());
    expect(t).toContain("<fieldset");
    expect(t).toContain("<legend");
  });
  it("a locked bar says why on Enter instead of opening the day, and is aria-disabled", () => {
    const bar = new WpBarEditor() as any;
    const seen: string[] = [];
    bar.dispatchEvent = (e: Event) => { seen.push(e.type); return true; };
    bar.lockedReason = "why";
    bar.editable = false;
    const zone = {};
    bar._zoneKey({ key: "Enter", target: zone, currentTarget: zone, preventDefault() {} });
    expect(seen).toEqual(["locked-request"]);
    bar.lockedReason = "";
    bar._zoneKey({ key: "Enter", target: zone, currentTarget: zone, preventDefault() {} });
    expect(seen).toEqual(["locked-request", "open-day"]);
  });
  it("the card passes the reason to today's bar only", () => {
    const p = program();
    const c = card({ programs: [p], holiday_today: true, status: { p: { holiday: { own: true } } } });
    c._preview = {};
    const reason = (offset: number) => c._bar("cover.b", p, offset, "today", () => {}).values.find((v: unknown) => v === "Day off: to change this schedule, open Schedule (calendar icon), then “Day off”." || v === "");
    expect(reason(0)).toBe("Day off: to change this schedule, open Schedule (calendar icon), then “Day off”.");
    expect(reason(1)).toBe("");
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

describe("day-off row under Sunday in the week schematics", () => {
  /** Every `.spans=${...}` array of a template tree, in document order (empty rows included). */
  const spansOf = (tpl: any): any[][] => {
    const found: any[][] = [];
    const walk = (v: any): void => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v?.strings) v.values.forEach((x: any, i: number) => { if (/\.spans=$/.test(v.strings[i])) found.push(x); else walk(x); });
    };
    walk(tpl);
    return found;
  };
  /** The values of every `?show-hours=${...}` (the hour axis of the weekday rows). */
  const hoursAt = (tpl: any): boolean[] => {
    const out: boolean[] = [];
    const walk = (v: any): void => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v?.strings) v.values.forEach((x: any, i: number) => { if (/\?show-hours=$/.test(v.strings[i])) out.push(x); else walk(x); });
    };
    walk(tpl);
    return out;
  };
  const win = (prof: any, data: any = {}, extra: any[] = []) => {
    const p: any = { ...program("p", prof), profiles: [prof, ...extra] };
    const w = new WpSchedule() as any;
    w.hass = hass;
    w.scope = { kind: "device", entityId: "cover.b" };
    w.data = { labels: [label], programs: [p], status: {}, can_edit: true, holiday_entity: "binary_sensor.off", ...data };
    return w;
  };
  const rowOf = (w: any) => { const h = flat(w._renderWeek()); return { html: h, off: h.includes("schema-off") }; };
  const prof = (holiday?: any, dayList = days()) => ({ id: "pr", name: "A", days: dayList, ...(holiday !== undefined ? { holiday } : {}) });
  const dayList = () => { const d = days(); d[2] = [slot("wed", "06:00", "07:00")]; return d; };

  it("window: a copy shows the copied weekday's slots after Sunday, labelled with holiday_row", () => {
    const w = win(prof({ copy: 2 }, dayList()));
    const out = spansOf(w._renderWeek());
    expect(out).toHaveLength(8);
    expect(out[6].map((s) => [s.start, s.end])).toEqual([[480, 540]]); // Sunday
    expect(out[7].map((s) => [s.start, s.end])).toEqual([[360, 420]]); // the copied Wednesday
    const { html, off } = rowOf(w);
    expect(off).toBe(true);
    expect(html).toContain(t("en", "holiday_row"));
    expect(html.indexOf("schema-off")).toBeGreaterThan(html.indexOf("Sun"));
    expect(t("en", "holiday_row")).toBe("Off");
    expect(t("fr", "holiday_row")).toBe("Férié");
    w.hass = { ...hass, language: "fr" };
    expect(flat(w._renderWeek())).toContain("Férié");
  });
  it("window: an own day shows holiday.day; the hour axis moves to the row", () => {
    const w = win(prof({ day: [slot("h", "10:00", "11:00")] }));
    const out = spansOf(w._renderWeek());
    expect(out[7].map((s) => [s.start, s.end])).toEqual([[600, 660]]);
    expect(hoursAt(w._renderWeek())).toEqual([false, false, false, false, false, false, false]);
    expect(flat(w._renderWeek()).slice(flat(w._renderWeek()).indexOf("schema-off"))).toContain("notches show-hours");
  });
  it("window: absent with no setting, with off, and without the day-off entity", () => {
    expect(rowOf(win(prof())).off).toBe(false);
    expect(spansOf(win(prof())._renderWeek())).toHaveLength(7);
    expect(rowOf(win(prof({ copy: 2, off: true }))).off).toBe(false);
    expect(rowOf(win(prof({ day: [slot("h")], off: true }))).off).toBe(false);
    expect(rowOf(win(prof({ copy: 2 }), { holiday_entity: null })).off).toBe(false);
    expect(hoursAt(win(prof())._renderWeek())).toEqual([false, false, false, false, false, false, true]);
  });
  it("window: a mode that follows another shows its source's day off", () => {
    const src = { id: "pa", name: "A", days: days(), holiday: { day: [slot("h", "12:00", "13:00")] } };
    const follower = { id: "pb", name: "B", days: days(), follows: "A" };
    const w = win(src, { mode: { selector: "input_select.m", active: "A", options: ["A", "B"] } }, [follower]);
    w._viewMode = "B";
    const out = spansOf(w._renderWeek());
    expect(out).toHaveLength(8);
    expect(out[7].map((s) => [s.start, s.end])).toEqual([[720, 780]]);
  });
  it("window: a slot passing midnight is cut at 24:00 and nothing is carried over from the day before", () => {
    const d = days(); d[6] = [slot("sun", "22:00", "02:00")];
    const w = win(prof({ copy: 6 }, d));
    const out = spansOf(w._renderWeek());
    expect(out[7].map((s) => [s.start, s.end])).toEqual([[1320, 1440]]);
    const own = spansOf(win(prof({ day: [slot("h", "23:00", "01:00")] }, d))._renderWeek());
    expect(own[7].map((s) => [s.start, s.end])).toEqual([[1380, 1440]]);
    // Sunday's own row keeps its carry-over rules: Monday shows the tail of Sunday's 22:00-02:00 slot
    expect(own[0].map((s) => [s.start, s.end])).toEqual([[0, 120]]);
    expect(out[7]).toHaveLength(1); // no 0-120 piece from the previous day
  });
  it("window: the row is display only (no handler, no button, not focusable)", () => {
    const w = win(prof({ copy: 2 }, dayList()));
    const h = flat(w._renderWeek());
    const row = h.slice(h.indexOf("schema-off"));
    expect(row).not.toContain("<button");
    expect(row).not.toContain("tabindex");
    expect(handlers(w._renderWeek())).toHaveLength(0);
  });

  const cardWeek = (prof2: any, data: any = {}, p0?: any) => {
    const p: any = p0 ?? program("p", prof2);
    const c = card({ programs: [p], holiday_entity: "binary_sensor.off", ...data });
    return { c, p };
  };
  it("card: the week shows the row after Sunday for a copy and an own day, display only", () => {
    const a = cardWeek(profile({ copy: 6 }));
    const tpl = a.c._holidayRow("cover.b", a.p);
    expect(spansOf(tpl)[0].map((s) => [s.start, s.end])).toEqual([[480, 540]]);
    const h = flat(tpl);
    expect(h).toContain(t("en", "holiday_row"));
    expect(h).toContain(t("en", "holiday_title"));
    expect(h).not.toContain("<button");
    expect(handlers(tpl)).toHaveLength(0);
    const b = cardWeek(profile({ day: [slot("h", "10:00", "11:00")] }));
    expect(spansOf(b.c._holidayRow("cover.b", b.p))[0].map((s) => [s.start, s.end])).toEqual([[600, 660]]);
    // in the week, right after the seven day rows
    b.c._week = new Set(["p:p|cover.b"]);
    const open = flat(b.c._extras({ kind: "program", programId: "p" }, "cover.b", [b.p]));
    expect(open).toContain("wday-off");
    expect(open.indexOf("wday-off")).toBeGreaterThan(open.lastIndexOf('class="wday"'));
  });
  it("card: absent with no setting, off, no entity; follows the source; cut at 24:00", () => {
    for (const [h, data] of [[undefined, {}], [{ copy: 6, off: true }, {}], [{ copy: 6 }, { holiday_entity: null }]] as any[]) {
      const x = cardWeek(profile(h), data);
      expect(flat(x.c._holidayRow("cover.b", x.p))).toBe("");
    }
    const src = { id: "pa", name: "A", days: days(), holiday: { day: [slot("h", "12:00", "13:00")] } };
    const p: any = { ...program("p"), profiles: [src, { id: "pb", name: "B", days: days(), follows: "A" }] };
    const f = cardWeek(null, { mode: { selector: "input_select.m", active: "B", options: ["A", "B"] } }, p);
    expect(spansOf(f.c._holidayRow("cover.b", p))[0].map((s) => [s.start, s.end])).toEqual([[720, 780]]);
    const d = days(); d[6] = [slot("sun", "22:00", "02:00")];
    const m = cardWeek(null);
    const q: any = program("p", { id: "pr", name: "A", days: d, holiday: { copy: 6 } });
    expect(spansOf(m.c._holidayRow("cover.b", q))[0].map((s) => [s.start, s.end])).toEqual([[1320, 1440]]);
  });
});
