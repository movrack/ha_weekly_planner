import { describe, expect, it, vi } from "vitest";
import { WpHoliday } from "../components/holiday-section";
import { confirmAction } from "../components/confirm";
import { flat, handlers } from "./helpers/tpl";

vi.mock("../components/confirm", async (orig) => ({ ...(await orig<typeof import("../components/confirm")>()), confirmAction: vi.fn(async () => true) }));

// Coverage floors: the handlers of the day-off section (head, switch, radios, day select, own-day rows and form).
const slot = (id: string, start = "08:00", end: string | null = "09:00") => ({ id, label: "l", start: { time: start }, ...(end ? { end: { time: end } } : {}) });
const label = { id: "l", name: "Open", color: "#0f0", action: { kind: "service", service: "cover.open_cover" } };
const hass: any = { language: "en", config: { time_zone: "UTC" }, states: {}, services: { cover: { open_cover: { fields: {} } } } };
const profile = (holiday?: any) => ({ id: "pr", name: "A", days: Array.from({ length: 7 }, () => []), ...(holiday !== undefined ? { holiday } : {}) });
const program = () => ({ id: "p", name: "P", revision: 3, priority: 1, enabled: true, entities: [{ entity_id: "cover.a", default_label: null, label_overrides: {} }], profiles: [] });
const make = (holiday?: any, extra: any = {}) => {
  const el = new WpHoliday() as any;
  el.hass = { ...hass, callWS: vi.fn(async () => ({ program: { id: "p" } })) };
  el.data = { labels: [label], programs: [], status: {} };
  el.program = program();
  el.profile = profile(holiday);
  el.canEdit = true;
  Object.defineProperty(el, "updateComplete", { value: Promise.resolve(true) });
  el.renderRoot = { querySelectorAll: () => [], querySelector: () => null };
  Object.assign(el, extra);
  return el;
};
const on = (tpl: any, event: string) => handlers(tpl).filter((h) => h.event === event);

describe("day-off section: handlers", () => {
  it("the head opens and closes the section", () => {
    const el = make();
    on(el.render(), "click")[0].fn();
    expect(el._open).toBe(true);
    on(el.render(), "click")[0].fn();
    expect(el._open).toBe(false);
  });
  it("the switch writes through the change event", async () => {
    const el = make();
    await on(el.render(), "change")[0].fn({ target: { checked: true } });
    expect(el.hass.callWS).toHaveBeenCalledWith(expect.objectContaining({ holiday: { copy: 6 } }));
  });
  it("the radios and the day select write through their change events", async () => {
    const el = make({ copy: 6, day: [slot("h")] });
    let ch = on(el.render(), "change"); // switch, copy radio, day select, own radio
    await ch[2].fn({ target: { value: "2" } });
    expect(el.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { copy: 2, day: [slot("h")] } }));
    await ch[3].fn();
    expect(el.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { day: [slot("h")] } }));
    el.profile = profile({ day: [slot("h")] });
    ch = on(el.render(), "change");
    await ch[1].fn(); // copy radio
    expect(el.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { copy: 6, day: [slot("h")] } }));
  });
  it("picking a day does nothing without a setting or while busy", async () => {
    const el = make();
    await el._pickDay(3);
    expect(el.hass.callWS).not.toHaveBeenCalled();
    const busy = make({ copy: 6 }, { _busy: true });
    await busy._pickDay(3);
    expect(busy.hass.callWS).not.toHaveBeenCalled();
  });
  it("a write is refused while another is running, and a result without a program still counts", async () => {
    const busy = make({ copy: 6 }, { _busy: true });
    expect(await busy._write({ copy: 1 })).toBe(false);
    const el = make({ copy: 6 });
    el.hass.callWS = vi.fn(async () => ({}));
    const seen = vi.fn(); el.dispatchEvent = seen;
    expect(await el._write({ copy: 1 })).toBe(true);
    expect(seen).not.toHaveBeenCalled();
    el.hass.callWS = vi.fn(async () => null);
    expect(await el._write({ copy: 1 })).toBe(true);
  });
  it("a toggle that changes nothing, or in read-only, does nothing", async () => {
    const el = make();
    await el._toggle(false); // already off
    await make({ copy: 6 }, { canEdit: false })._toggle(false);
    await make({ copy: 6 })._choose("copy"); // already that choice
    expect(el.hass.callWS).not.toHaveBeenCalled();
  });
});

describe("day-off section: own day", () => {
  const open = (holiday: any = { day: [slot("h", "08:00", "09:00"), slot("g", "10:00", null)] }) => make(holiday, { _open: true });
  it("lists the own slots with a button to edit and one to delete each", () => {
    const el = open();
    const tpl = el.render();
    const text = flat(tpl);
    expect(text).toContain('class="hrow"');
    expect(text).toContain("Open");
    expect(text).toContain('class="del"');
    expect(on(tpl, "click").length).toBeGreaterThan(5);
  });
  it("edit opens the form on a copy of the slot, Cancel closes it and the Add button comes back", () => {
    const el = open();
    on(el.render(), "click").find((h) => h.before.endsWith("data-slot=h ?disabled=") === false && /class="open"/.test(h.before.slice(-200)))!.fn();
    expect(el._editing).toBe("h");
    expect(el._group.slot).toEqual(slot("h", "08:00", "09:00"));
    expect(el._group.slot).not.toBe(el.profile.holiday.day[0]);
    const form = el.render();
    expect(flat(form)).toContain("wp-slot-form");
    expect(flat(form)).not.toContain("class=\"btn add\"");
    const cancel = on(form, "click").slice(-1)[0];
    cancel.fn();
    expect(el._editing).toBeNull();
    expect(el._group).toBeNull();
    expect(flat(el.render())).toContain('class="btn add"');
  });
  it("Cancel on a new slot returns to the Add button", () => {
    const el = open();
    el._add();
    expect(el._editing).toBe("new");
    expect(el._group.slot.label).toBe("l");
    const cancel = on(el.render(), "click").slice(-1)[0];
    cancel.fn();
    expect(el._editing).toBeNull();
  });
  it("the Add button opens the form, with no label when the data has none", () => {
    const el = open({ day: [] });
    on(el.render(), "click").slice(-1)[0].fn(); // Add
    expect(el._editing).toBe("new");
    const none = open({ day: [] });
    none.data = { labels: [], programs: [], status: {} };
    none._add();
    expect(none._group.slot.label).toBe("");
  });
  it("the form's changes replace the draft and clear the error; Save writes a new or a changed slot", async () => {
    const el = open();
    el._edit(slot("h", "08:00", "09:00"));
    el._error = "old";
    const changed = { ...el._group, slot: slot("h", "08:30", "09:30") };
    const stop = vi.fn();
    handlers(el.render()).find((h) => h.event === "group-change")!.fn({ stopPropagation: stop, detail: changed });
    expect(stop).toHaveBeenCalled();
    expect(el._group).toBe(changed);
    expect(el._error).toBe("");
    await el._save();
    expect(el.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { day: [slot("h", "08:30", "09:30"), slot("g", "10:00", null)] } }));
    expect(el._editing).toBeNull();
    el._add();
    el._group = { ...el._group, slot: { ...el._group.slot, id: "n" } };
    await el._save();
    expect(el.hass.callWS.mock.calls.at(-1)[0].holiday.day.map((s: any) => s.id)).toEqual(["h", "g", "n"]);
  });
  it("Save does nothing without a draft, and a failed save keeps the draft", async () => {
    const el = open();
    await el._save();
    expect(el.hass.callWS).not.toHaveBeenCalled();
    el._add();
    el.hass.callWS = vi.fn(async () => { throw new Error("nope"); });
    await el._save();
    expect(el._group).not.toBeNull();
    expect(el._error).not.toBe("");
  });
  it("delete asks, and a No leaves everything as it was", async () => {
    const el = open();
    (confirmAction as any).mockResolvedValueOnce(false);
    await el._delete(slot("g", "10:00", null));
    expect(el.hass.callWS).not.toHaveBeenCalled();
    expect((confirmAction as any).mock.lastCall[1]).toMatch(/10\s*am/);
    await el._delete(slot("g", "10:00", null));
    expect(el.hass.callWS).toHaveBeenLastCalledWith(expect.objectContaining({ holiday: { day: [slot("h", "08:00", "09:00")] } }));
    expect(el._status).toBe("Deleted");
  });
  it("a slot whose label no longer exists shows its id, and a read-only section disables the buttons", () => {
    const el = open({ day: [{ ...slot("h"), label: "gone" }] });
    expect(flat(el.render())).toContain("gone");
    el.canEdit = false;
    expect(flat(el.render())).not.toContain("class=\"btn add\"");
    expect(el._readOnly).toBe(true);
  });
  it("the status message clears itself after 3 seconds", () => {
    vi.useFakeTimers();
    const el = open();
    el._say("holiday_saved");
    expect(el._status).toBe("Saved");
    el._say("holiday_deleted"); // restarts the timer
    vi.advanceTimersByTime(2999);
    expect(el._status).toBe("Deleted");
    vi.advanceTimersByTime(1);
    expect(el._status).toBe("");
    vi.useRealTimers();
  });
  it("the focus goes to the wanted control, else to the head, and nowhere without a root", async () => {
    const el = open();
    const focus = vi.fn(), head = vi.fn();
    el.renderRoot = { querySelector: (s: string) => (s === ".add" ? { focus } : s === ".head" ? { focus: head } : null) };
    await el._focus(".add");
    expect(focus).toHaveBeenCalledOnce();
    await el._focus(".missing");
    expect(head).toHaveBeenCalledOnce();
    el.renderRoot = undefined;
    await expect(el._focus(".add")).resolves.toBeUndefined();
  });
  it("syncing the controls tolerates a missing root and a day select without a copy", () => {
    const el = open({ day: [] });
    el.renderRoot = undefined;
    expect(() => el._syncControls()).not.toThrow();
    const day = { value: "x" };
    el.renderRoot = { querySelectorAll: () => [], querySelector: (s: string) => (s === ".day" ? day : null) };
    el._syncControls();
    expect(day.value).toBe("x"); // an own day has no copy to restore
  });
});
