import { describe, expect, it, vi } from "vitest";
import { WpBarEditor } from "../components/bar-editor";
import { moveRefusal, moveSlotBy, moveToDay } from "../edits";
import type { DayCtx } from "../edits";
import { t } from "../i18n";
import { shiftTimeSpec } from "../slots";
import { clockToMinutes } from "../time";
import type { HomeAssistant, Slot, TimeSpec } from "../types";

const SUN = { sunrise: 420, sunset: 1140, dawn: 360, dusk: 1200 };
const at = (s: TimeSpec): number => ("time" in s ? clockToMinutes(s.time) : SUN[s.sun] + (s.offset ?? 0));
let n = 0;
const ctx = (extra: Partial<DayCtx> = {}): DayCtx => ({ at, newId: () => `n${++n}`, ...extra });
const hass = { states: {}, config: { time_zone: "UTC" } } as unknown as HomeAssistant;
const shift = (s: TimeSpec, d: number) => shiftTimeSpec(hass, s, d);
const slot = (id: string, start: string | TimeSpec, end: string | TimeSpec | null, label = "a"): Slot => ({
  id, start: typeof start === "string" ? { time: start } : start,
  end: end === null ? null : typeof end === "string" ? { time: end } : end, conditions: [], label,
});
const show = (slots: Slot[]) => slots.map((s) => `${"time" in s.start ? s.start.time : "sun"}-${s.end ? ("time" in s.end ? s.end.time : "sun") : "_"}:${s.label}`);

describe("moveSlotBy", () => {
  const day = [slot("1", "08:00", "10:00"), slot("2", "12:00", "14:00", "b")];
  it("keeps the duration and snaps to 15 minutes", () => {
    const r = moveSlotBy(day, "1", 38, ctx(), shift)!;
    expect(show(r.slots)).toEqual(["08:45-10:45:a", "12:00-14:00:b"]);
    expect([r.start, r.end, r.delta]).toEqual([525, 645, 45]);
    expect(day[0].start).toEqual({ time: "08:00" }); // input untouched
  });
  it("clamps to the start and the end of the day", () => {
    expect(show(moveSlotBy(day, "1", -900, ctx(), shift)!.slots)[0]).toBe("00:00-02:00:a");
    expect(show(moveSlotBy(day, "2", 900, ctx(), shift)!.slots)[1]).toBe("22:00-24:00:b");
  });
  it("can touch a neighbour but never cross it", () => {
    expect(show(moveSlotBy(day, "1", 600, ctx(), shift)!.slots)[0]).toBe("10:00-12:00:a");
    expect(show(moveSlotBy(day, "2", -600, ctx(), shift)!.slots)[1]).toBe("10:00-12:00:b");
  });
  it("stays after a slot of the previous day that crosses midnight", () => {
    expect(show(moveSlotBy(day, "1", -900, ctx({ lead: 360 }), shift)!.slots)[0]).toBe("06:00-08:00:a");
  });
  it("does not change anything when it cannot move", () => {
    expect(moveSlotBy(day, "1", 5, ctx(), shift)!.delta).toBe(0);
  });
  it("shifts a sun time by its offset instead of making it a fixed time", () => {
    const d = [slot("1", { sun: "sunset" }, "23:00")];
    const r = moveSlotBy(d, "1", 30, ctx(), shift)!;
    expect(r.slots[0].start).toEqual({ sun: "sunset", offset: 30 });
    expect(r.slots[0].end).toEqual({ time: "23:30" });
  });
  it("refuses a one-shot, a slot crossing midnight and a sun time with limits", () => {
    expect(moveRefusal(slot("1", "08:00", null), ctx())).toBe("oneshot");
    expect(moveRefusal(slot("1", "22:00", "06:00"), ctx())).toBe("wrap");
    expect(moveRefusal(slot("1", { sun: "sunset", earliest: "18:00" }, "23:00"), ctx())).toBe("sunbound");
    expect(moveRefusal(day[0], ctx())).toBeNull();
    expect(moveSlotBy([slot("1", "22:00", "06:00")], "1", 60, ctx(), shift)).toBeNull();
    expect(moveSlotBy(day, "zz", 60, ctx(), shift)).toBeNull();
  });
});

describe("moveToDay", () => {
  const days: Slot[][] = [[slot("1", "08:00", "10:00")], [slot("2", "12:00", "14:00", "b")], []];
  it("removes the slot from its own day only and adds a copy with a new id", () => {
    const r = moveToDay(days, { day: 0, id: "1" }, 2, 0, ctx(), shift);
    if (!("days" in r)) throw new Error("refused");
    expect(r.days[0]).toEqual([]);
    expect(show(r.days[2])).toEqual(["08:00-10:00:a"]);
    expect(r.days[2][0].id).not.toBe("1");
    expect(r.days[1]).toBe(days[1]);
    expect(days[0]).toHaveLength(1);
  });
  it("shifts in time at the same time, clamped to the day", () => {
    const r = moveToDay(days, { day: 0, id: "1" }, 2, -2000, ctx(), shift);
    expect("days" in r && show(r.days[2])).toEqual(["00:00-02:00:a"]);
  });
  it("refuses to land on a slot of the new day", () => {
    expect(moveToDay(days, { day: 0, id: "1" }, 1, 240, ctx(), shift)).toEqual({ error: "overlap" });
    expect("days" in moveToDay(days, { day: 0, id: "1" }, 1, 0, ctx(), shift)).toBe(true);
  });
  it("refuses unknown slots, the same day and unmovable slots", () => {
    expect(moveToDay(days, { day: 0, id: "zz" }, 1, 0, ctx(), shift)).toEqual({ error: "gone" });
    expect(moveToDay(days, { day: 0, id: "1" }, 0, 0, ctx(), shift)).toEqual({ error: "gone" });
    expect(moveToDay([[slot("1", "22:00", "06:00")], []], { day: 0, id: "1" }, 1, 0, ctx(), shift)).toEqual({ error: "wrap" });
  });
});

describe("slot action bar wording", () => {
  it("names the split and the copy clearly, in both languages", () => {
    expect(t("fr", "cut")).toBe("Couper en deux");
    expect(t("en", "cut")).toBe("Split in two");
    expect(t("fr", "copy_to")).toBe("Copier vers…");
    expect(t("fr", "cut_hint")).not.toBe(t("fr", "copy_hint"));
    for (const lang of ["fr", "en"]) for (const k of ["grp_time", "grp_days", "move_err_wrap", "move_err_oneshot", "move_err_sunbound"] as const) expect(t(lang, k)).not.toBe(k);
  });
});

describe("bar gesture", () => {
  const program: any = { id: "p", revision: 1, entities: [{ entity_id: "climate.a" }], active_profile: "m", profiles: [{ id: "m", name: "M", days: [[slot("1", "08:00", "10:00")], [], [], [], [], [], []] }] };
  const make = () => {
    const el = new WpBarEditor() as any;
    Object.assign(el, { hass, data: { profiles: [], programs: [program], labels: [], status: {}, can_edit: true }, program, entityId: "climate.a", weekday: 0, editing: true });
    el._minuteAt = () => ({ m: 0, ppm: 1 });
    el._commit = vi.fn(async () => true);
    el._fail = vi.fn();
    return el;
  };
  const ev = (x: number, y = 0) => ({ pointerId: 1, clientX: x, clientY: y }) as PointerEvent;
  it("a small movement stays a tap; a drag commits one move on release", () => {
    const el = make();
    el._mvBegin(ev(100), "1");
    el._mvMove(ev(103));
    el._mvUp(ev(103));
    expect(el._commit).not.toHaveBeenCalled();
    el._mvBegin(ev(100), "1");
    el._mvMove(ev(160));
    expect(el._bubble.m).toBe(540);
    el._mvUp(ev(160));
    expect(el._commit).toHaveBeenCalledTimes(1);
    const op = el._commit.mock.calls[0][0];
    expect(show(op(program.profiles[0].days)[0])).toEqual(["09:00-11:00:a"]);
  });
  it("tells why an unmovable slot does not move and saves nothing", () => {
    const el = make();
    program.profiles[0].days[0] = [slot("1", "22:00", "06:00")];
    el._mvBegin(ev(0), "1");
    el._mvMove(ev(60));
    el._mvUp(ev(60));
    expect(el._fail).toHaveBeenCalledWith(t("en", "move_err_wrap"));
    expect(el._commit).not.toHaveBeenCalled();
  });
});
