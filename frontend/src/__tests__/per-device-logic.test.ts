// LOT 4 (#34): the card's pure logic is device-aware (`slot.entities`, absent = every device).
import { describe, expect, it } from "vitest";
import { groupSlots, slotKey } from "../actions";
import {
  alsoFor, applyIntent, applyToAll, devicesOf, editForDevice, forDevices, isShared, remergeIdentical,
  removeDeviceFromSlots,
} from "../device-edits";
import {
  boundaries, compareOrigin, copyConflicts, copyToDays, findGroup, mergeAdjacent, moveBoundary, moveSlotBy, moveToDay,
  nextTimes, overlapDay, overlapPair, segments, setLabel, splitAt, splitBusyDays,
} from "../edits";
import type { DayCtx, Shift } from "../edits";
import { appliedAction } from "../labels";
import { deviceSpans, fetchPreview, fetchPreviewResponse, clearPreviewCache } from "../preview-cache";
import { applicable, daySlotsFor, findOverlap, normaliseEntities, sameEntities, sharesDevice } from "../slots";
import { clockToMinutes } from "../time";
import type { Profile, Program, Slot, TimeSpec } from "../types";

const A = "climate.living";
const B = "cover.living";
const C = "light.desk";
const DEVICES = [A, B, C];

const at = (s: TimeSpec): number => ("time" in s ? clockToMinutes(s.time) : 0);
let n = 0;
const ctx = (extra: Partial<DayCtx> = {}): DayCtx => ({ at, newId: () => `n${++n}`, defaultLabel: "rest", ...extra });
const shift: Shift = (spec, d) => ("time" in spec ? { time: `${String(Math.floor((at(spec) + d) / 60)).padStart(2, "0")}:${String((at(spec) + d) % 60).padStart(2, "0")}` } : spec);
const slot = (id: string, start: string, end: string | null, label = "a", entities?: string[], extra: Partial<Slot> = {}): Slot => ({
  id, start: { time: start }, end: end === null ? null : { time: end }, conditions: [], label,
  ...(entities ? { entities } : {}), ...extra,
});
const show = (slots: Slot[]) => slots.map((s) => `${"time" in s.start ? s.start.time : "sun"}-${s.end && "time" in s.end ? s.end.time : "_"}:${s.label}${s.entities ? `[${s.entities.join(",")}]` : ""}`);
const ent = (entity_id: string) => ({ entity_id, default_label: null, label_overrides: {} });
const week = (day: Slot[]): Slot[][] => Array.from({ length: 7 }, (_, i) => (i === 0 ? day : []));
const program = (days: Slot[][], devices = DEVICES, extraProfiles: Profile[] = []): Program => ({
  id: "p", name: "P", revision: 1, priority: 10, enabled: true, reapply: true, conditions: [], active_profile: "m",
  entities: devices.map(ent), profiles: [{ id: "m", name: "M", days }, ...extraProfiles],
});

describe("slots.ts helpers", () => {
  it("sharesDevice: absent targets every device, lists must intersect", () => {
    expect(sharesDevice({}, { entities: [A] })).toBe(true);
    expect(sharesDevice({ entities: [A] }, { entities: [B] })).toBe(false);
    expect(sharesDevice({ entities: [A, B] }, { entities: [B] })).toBe(true);
  });
  it("applicable, normaliseEntities (D5), sameEntities, daySlotsFor", () => {
    expect(applicable({}, DEVICES)).toEqual(DEVICES);
    expect(applicable({ entities: [C, A] }, DEVICES)).toEqual([A, C]);
    expect(normaliseEntities([C, A, A, "x.unknown"], DEVICES)).toEqual([A, C]);
    expect(normaliseEntities([C, B, A], DEVICES)).toBeUndefined();
    expect(normaliseEntities([A], [A])).toBeUndefined(); // single-device program never has lists
    expect(normaliseEntities([], DEVICES)).toEqual([]);
    expect(sameEntities({ entities: [A, B] }, { entities: [B, A] })).toBe(true);
    expect(sameEntities({}, { entities: [A] })).toBe(false);
    expect(sameEntities({}, {})).toBe(true);
    expect(sameEntities({ entities: [A] }, { entities: [A, B] })).toBe(false);
    const day = [slot("1", "07:00", "09:00", "t", [A]), slot("2", "07:00", null, "c", [B]), slot("3", "20:00", "22:00")];
    expect(daySlotsFor(day, B).map((s) => s.id)).toEqual(["2", "3"]);
  });
  it("findOverlap: owner case (thermostat 07-22 vs cover 07-09) is not an overlap", () => {
    expect(findOverlap([slot("t", "07:00", "22:00", "15", [A]), slot("c", "07:00", "09:00", "close", [B])])).toBeNull();
    const pair = findOverlap([slot("t", "07:00", "22:00", "15", [A]), slot("x", "06:00", "08:00", "x", [B]), slot("all", "08:00", "09:00")]);
    expect(pair?.map((s) => s.id)).toEqual(["t", "all"]);
  });
  it("findOverlap: picks the earlier slot reaching furthest among those sharing a device", () => {
    const pair = findOverlap([slot("1", "06:00", "10:00", "a", [A]), slot("2", "06:30", "12:00", "a", [B]), slot("3", "09:00", "09:30", "a", [B])]);
    expect(pair?.map((s) => s.id)).toEqual(["2", "3"]);
  });
});

describe("slotKey, groupSlots, compareOrigin", () => {
  it("sorted devices are part of the key", () => {
    expect(slotKey(slot("1", "07:00", "08:00", "a", [A, B]))).toBe(slotKey(slot("2", "07:00", "08:00", "a", [B, A])));
    expect(slotKey(slot("1", "07:00", "08:00", "a", [A]))).not.toBe(slotKey(slot("2", "07:00", "08:00", "a")));
  });
  it("same times for different devices never form one group", () => {
    const profile: Profile = { id: "m", name: "M", days: [[slot("1", "07:00", "08:00", "a", [A])], [slot("2", "07:00", "08:00", "a", [B])], [], [], [], [], []] };
    expect(groupSlots(profile, () => true, at).map((g) => g.days)).toEqual([[0], [1]]);
  });
  it("compareOrigin sees a change of devices", () => {
    const origin = { slot: slot("1", "07:00", "08:00"), days: [0], ids: { 0: "1" } };
    const profile: Profile = { id: "m", name: "M", days: week([slot("1", "07:00", "08:00", "a", [A])]) };
    expect(compareOrigin(findGroup(profile, () => true, at, "1"), origin)).toBe("changed");
  });
});

describe("schedule-screen checks", () => {
  it("overlapPair / overlapDay follow devices", () => {
    const ok: Profile = { id: "m", name: "M", days: week([slot("t", "07:00", "22:00", "15", [A]), slot("c", "07:00", "09:00", "close", [B])]) };
    expect(overlapPair(ok)).toBeNull();
    expect(overlapDay(ok)).toBeNull();
    const bad: Profile = { id: "m", name: "M", days: week([slot("t", "07:00", "22:00", "15", [A]), slot("c", "07:00", "09:00", "close")]) };
    expect(overlapPair(bad)?.day).toBe(0);
    expect(overlapDay(bad)).toBe(0);
  });
  it("splitBusyDays: a slot of another device does not make a day busy", () => {
    const profile: Profile = { id: "m", name: "M", days: week([slot("t", "07:00", "22:00", "15", [A])]) };
    expect(splitBusyDays(profile, () => true, at, slot("new", "08:00", "09:00", "c", [B]), [0]).busy).toEqual([]);
    expect(splitBusyDays(profile, () => true, at, slot("new", "08:00", "09:00", "c"), [0]).busy).toEqual([0]);
  });
  it("nextTimes counts only the device's slots", () => {
    const day = [slot("t", "07:00", "22:00", "15", [A]), slot("c", "07:00", "09:00", "close", [B])];
    expect(nextTimes(day, at, B)).toEqual({ start: "09:00", end: "10:00" });
    expect(nextTimes(day, at)).toEqual({ start: "22:00", end: "23:00" });
  });
});

describe("day bar edits", () => {
  it("segments and boundaries of a device row ignore other devices", () => {
    const day = [slot("t", "07:00", "22:00", "15", [A]), slot("c", "08:00", "09:00", "close", [B])];
    expect(segments(day, ctx({ entity: B })).filter((s) => s.kind === "slot").map((s) => s.start)).toEqual([480]);
    expect(boundaries(day, ctx({ entity: A })).map((b) => b.m)).toEqual([420, 1320]);
  });
  it("boundaries: edges at one minute stay separate for devices that share nothing, joined by a shared slot", () => {
    const apart = [slot("1", "07:00", "08:00", "a", [A]), slot("2", "08:00", "09:00", "b", [B])];
    expect(boundaries(apart, ctx()).filter((b) => b.m === 480).length).toBe(2);
    const linked = [...apart, slot("3", "06:00", "08:00", "c", [C]), slot("4", "08:00", "10:00", "d", [C])];
    linked[3] = slot("4", "08:00", "10:00", "d"); // every device: joins the three edges at 08:00 (overlap ignored here)
    const at8 = boundaries(linked, ctx()).filter((b) => b.m === 480);
    expect(at8.length).toBe(1);
    expect(at8[0].refs.length).toBe(4);
  });
  it("moveBoundary: another device's slot does not block, a shared slot's other device does", () => {
    const day = [slot("t", "07:00", "09:00", "15", [A]), slot("c", "09:30", "10:00", "close", [B])];
    expect(moveBoundary(day, { id: "t", edge: "end" }, 600, ctx({ entity: A }))!.m).toBe(600);
    const shared = [slot("x", "07:00", "08:00", "a", [A]), slot("y", "08:00", "09:00", "b"), slot("z", "07:00", "08:00", "c", [B])];
    // from A's row, the boundary x|y cannot go earlier: y runs for B too and z ends at 08:00
    expect(moveBoundary(shared, { id: "y", edge: "start" }, 450, ctx({ entity: A }))!.m).toBe(480);
    expect(moveBoundary(shared, { id: "y", edge: "start" }, 510, ctx({ entity: A }))!.m).toBe(510);
    const later = [slot("y", "08:00", "09:00", "b"), slot("w", "09:00", "10:00", "c", [B])];
    expect(moveBoundary(later, { id: "y", edge: "end" }, 570, ctx({ entity: A }))!.m).toBe(540);
  });
  it("moveSlotBy: clamped only by slots sharing a device", () => {
    const day = [slot("c", "08:00", "09:00", "close", [B]), slot("t", "09:00", "10:00", "15", [A]), slot("all", "11:00", "12:00", "x")];
    const r = moveSlotBy(day, "c", 120, ctx({ entity: B }), shift)!;
    expect(r.start).toBe(600); // passes A's slot, stops at the shared one
  });
  it("moveToDay: occupancy is checked per device", () => {
    const days = [[slot("c", "08:00", "09:00", "close", [B])], [slot("t", "07:00", "22:00", "15", [A])], [slot("u", "07:00", "22:00", "15")], [], [], [], []];
    const ok = moveToDay(days, { day: 0, id: "c" }, 1, 0, ctx(), shift);
    expect("days" in ok && show(ok.days[1])).toEqual(["07:00-22:00:15[climate.living]", "08:00-09:00:close[cover.living]"]);
    expect(moveToDay(days, { day: 0, id: "c" }, 2, 0, ctx(), shift)).toEqual({ error: "overlap" });
  });
  it("mergeAdjacent trap: Allumer 18-20 [A] + Allumer 20-22 (all) must NOT merge", () => {
    const day = [slot("1", "18:00", "20:00", "on", [A]), slot("2", "20:00", "22:00", "on")];
    expect(mergeAdjacent(day, ctx()).length).toBe(2);
  });
  it("mergeAdjacent merges same devices across another device's slot", () => {
    const day = [slot("1", "07:00", "08:00", "on", [A]), slot("x", "07:30", "08:00", "close", [B]), slot("2", "08:00", "09:00", "on", [A])];
    expect(show(mergeAdjacent(day, ctx()))).toEqual(["07:00-09:00:on[climate.living]", "07:30-08:00:close[cover.living]"]);
  });
  it("splitAt / setLabel on a gap of a device row take ctx.newEntities", () => {
    const g = { kind: "gap" as const, start: 600, end: 720 };
    expect(setLabel([], g, "x", ctx({ newEntities: [B] }))[0].entities).toEqual([B]);
    expect(splitAt([], g, ctx({ newEntities: [B] }))!.slots[0].entities).toEqual([B]);
    expect(setLabel([], g, "x", ctx())[0].entities).toBeUndefined();
  });
});

describe("copies to other days", () => {
  it("copyConflicts ignores other devices", () => {
    const days = [[slot("c", "08:00", "09:00", "close", [B])], [slot("t", "07:00", "22:00", "15", [A])], [slot("u", "08:30", "10:00")], [], [], [], []];
    expect(copyConflicts(days, { day: 0, id: "c" }, [1, 2], ctx())).toEqual([2]);
  });
  it("copyToDays of a device-only slot keeps other devices' slots and splits a shared one", () => {
    const days = [[slot("c", "08:00", "09:00", "close", [B])], [slot("t", "07:00", "22:00", "15", [A])], [slot("u", "07:00", "10:00", "x", undefined, { start: { time: "07:00", random_minutes: 10 } })], [], [], [], []];
    const out = copyToDays(days, { day: 0, id: "c" }, [1, 2], ctx({ devices: DEVICES }));
    expect(show(out[1])).toEqual(["07:00-22:00:15[climate.living]", "08:00-09:00:close[cover.living]"]);
    expect(show(out[2])).toEqual([
      "07:00-08:00:x", "08:00-09:00:x[climate.living,light.desk]", "08:00-09:00:close[cover.living]", "09:00-10:00:x",
    ]);
    const kept = out[2].find((s) => s.entities?.includes(C))!;
    expect(kept.id).not.toBe("u");
    expect(kept.seed).toBe("u"); // D7: the split piece draws the same delay
    expect(out[2][0].id).toBe("u");
  });
  it("copyToDays: a shared slot fully covered keeps its id for the other devices", () => {
    const days = [[slot("c", "07:00", "10:00", "close", [B])], [slot("u", "08:00", "09:00", "x")], [], [], [], [], []];
    const out = copyToDays(days, { day: 0, id: "c" }, [1], ctx({ devices: DEVICES }));
    const rest = out[1].find((s) => s.label === "x")!;
    expect(rest.id).toBe("u");
    expect(rest.entities).toEqual([A, C]);
    expect(rest.seed).toBeUndefined();
  });
  it("copyToDays: one-shot duplicate check includes devices", () => {
    const days = [[slot("o", "07:00", null, "close", [B])], [slot("p", "07:00", null, "close", [A])], [slot("q", "07:00", null, "close", [B])], [], [], [], []];
    const out = copyToDays(days, { day: 0, id: "o" }, [1, 2], ctx());
    expect(out[1].length).toBe(2);
    expect(out[2].length).toBe(1);
  });
});

describe("device-edits: normalisation and removal (D5)", () => {
  const p = program(week([]));
  it("applyToAll, forDevices, alsoFor", () => {
    expect(applyToAll(slot("1", "07:00", "08:00", "a", [A])).entities).toBeUndefined();
    expect(forDevices(slot("1", "07:00", "08:00"), [C, A], p)!.entities).toEqual([A, C]);
    expect(forDevices(slot("1", "07:00", "08:00", "a", [A]), DEVICES, p)!.entities).toBeUndefined();
    expect("entities" in forDevices(slot("1", "07:00", "08:00", "a", [A]), DEVICES, p)!).toBe(false);
    expect(forDevices(slot("1", "07:00", "08:00"), [], p)).toBeNull();
    expect(alsoFor(slot("1", "07:00", "08:00", "a", [B]), [A], p)!.entities).toEqual([A, B]);
    expect(alsoFor(slot("1", "07:00", "08:00", "a", [B]), [A, C], p)!.entities).toBeUndefined();
    const single = program(week([]), [A]);
    expect(forDevices(slot("1", "07:00", "08:00"), [A], single)!.entities).toBeUndefined();
    expect(isShared(slot("1", "07:00", "08:00"), DEVICES)).toBe(true);
    expect(isShared(slot("1", "07:00", "08:00", "a", [A]), DEVICES)).toBe(false);
    expect(devicesOf(p)).toEqual(DEVICES);
  });
  it("removeDeviceFromSlots: every mode, empty list deletes, all remaining becomes absent", () => {
    const other: Profile = { id: "away", name: "Away", days: week([slot("k", "06:00", "07:00", "a", [B])]) };
    const prog = program(week([
      slot("1", "07:00", "08:00", "a", [B]), slot("2", "08:00", "09:00", "a", [A, B]), slot("3", "09:00", "10:00", "a", [A, C]),
      slot("4", "10:00", "11:00", "a"),
    ]), DEVICES, [other]);
    const out = removeDeviceFromSlots(prog, B);
    expect(show(out.profiles[0].days[0])).toEqual(["08:00-09:00:a[climate.living]", "09:00-10:00:a", "10:00-11:00:a"]);
    expect(out.profiles[1].days[0]).toEqual([]);
    expect(out.entities.length).toBe(3); // the program's device list is the caller's job
  });
});

describe("device-edits: copy-on-write (D1, D7)", () => {
  const opts = () => ({ devices: DEVICES, newId: () => `w${++n}` });
  it("editing a shared slot for one device: kept part keeps id, copy gets new id and seed", () => {
    const days = week([slot("s", "07:00", "09:00", "on")]);
    const r = editForDevice(days, "s", B, { label: "off" }, opts())!;
    const [kept, copy] = r.days[0];
    expect(kept).toMatchObject({ id: "s", label: "on", entities: [A, C] });
    expect(copy).toMatchObject({ label: "off", entities: [B], seed: "s" });
    expect(copy.id).not.toBe("s");
    expect(r.id).toBe(copy.id);
  });
  it("a copy edited back to the original is re-merged into it", () => {
    const days = week([slot("s", "07:00", "09:00", "on")]);
    const r1 = editForDevice(days, "s", B, { label: "off" }, opts())!;
    const r2 = editForDevice(r1.days, r1.id!, B, { label: "on" }, opts())!;
    expect(r2.days[0]).toEqual([{ id: "s", start: { time: "07:00" }, end: { time: "09:00" }, conditions: [], label: "on" }]);
    expect(r2.id).toBe("s");
  });
  it("a slot of the device only is changed in place; null removes it for the device", () => {
    const days = week([slot("s", "07:00", "09:00", "on", [B])]);
    expect(editForDevice(days, "s", B, { end: { time: "10:00" }, label: undefined }, opts())!.days[0][0]).toMatchObject({ id: "s", label: "on", end: { time: "10:00" } });
    expect(editForDevice(days, "s", B, null, opts())).toEqual({ days: week([]), id: null });
    const shared = editForDevice(week([slot("s", "07:00", "09:00", "on")]), "s", B, null, opts())!;
    expect(shared.days[0][0].entities).toEqual([A, C]);
    expect(shared.id).toBeNull();
  });
  it("refuses a gone slot or a device it does not run for", () => {
    expect(editForDevice(week([slot("s", "07:00", "09:00", "on", [A])]), "s", B, { label: "x" }, opts())).toBeNull();
    expect(editForDevice(week([]), "s", B, { label: "x" }, opts())).toBeNull();
  });
  it("remergeIdentical keeps slots apart when random delays differ, or when they share a device", () => {
    const r = { time: "07:00", random_minutes: 10 };
    const a = slot("1", "07:00", "08:00", "on", [A], { start: r });
    const b = slot("2", "07:00", "08:00", "on", [B], { start: r });
    expect(remergeIdentical([a, b], DEVICES).day.length).toBe(2);
    expect(remergeIdentical([a, { ...b, seed: "1" }], DEVICES).day).toEqual([{ ...a, entities: [A, B] }]);
    expect(remergeIdentical([slot("1", "07:00", "08:00", "on", [A]), slot("2", "07:00", "08:00", "on", [A, B])], DEVICES).day.length).toBe(2);
    const three = remergeIdentical([slot("1", "07:00", "08:00", "on", [A]), slot("2", "07:00", "08:00", "on", [B]), slot("3", "07:00", "08:00", "on", [C])], DEVICES);
    expect(three.day).toEqual([slot("1", "07:00", "08:00", "on")]);
    expect([...three.absorbed]).toEqual([["2", "1"], ["3", "1"]]);
  });
});

describe("conflict retry by intent", () => {
  it("re-evaluated on fresh data keeps a concurrent change made on another device", () => {
    // tab 1 wanted: slot s, device B, label "close". Meanwhile tab 2 changed s for device A.
    const base = program(week([slot("s", "07:00", "09:00", "on")]));
    const tab2 = editForDevice(base.profiles[0].days, "s", A, { label: "15" }, { devices: DEVICES, newId: () => "a1" })!;
    const fresh = { ...base, revision: 2, profiles: [{ ...base.profiles[0], days: tab2.days }] };
    const r = applyIntent(fresh, { profileId: "m", slotId: "s", eid: B, change: { label: "close" } }, () => "b1");
    expect("program" in r).toBe(true);
    if (!("program" in r)) return;
    expect(show(r.program.profiles[0].days[0]).sort()).toEqual([
      "07:00-09:00:15[climate.living]", "07:00-09:00:close[cover.living]", "07:00-09:00:on[light.desk]",
    ]);
    expect(r.id).toBe("b1");
  });
  it("errors: gone, device, overlap; eid null edits every device", () => {
    const base = program(week([slot("s", "07:00", "09:00", "on", [A]), slot("t", "09:00", "10:00", "x")]));
    expect(applyIntent(base, { profileId: "zz", slotId: "s", eid: A, change: null })).toEqual({ error: "gone" });
    expect(applyIntent(base, { profileId: "m", slotId: "nope", eid: A, change: null })).toEqual({ error: "gone" });
    expect(applyIntent(base, { profileId: "m", slotId: "s", eid: B, change: { label: "y" } })).toEqual({ error: "device" });
    expect(applyIntent(base, { profileId: "m", slotId: "s", eid: A, change: { end: { time: "09:30" } } })).toEqual({ error: "overlap" });
    const all = applyIntent(base, { profileId: "m", slotId: "t", eid: null, change: { label: "z" } });
    expect("program" in all && all.program.profiles[0].days[0][1].label).toBe("z");
    const del = applyIntent(base, { profileId: "m", slotId: "t", eid: null, change: null });
    expect("program" in del && del.program.profiles[0].days[0].length).toBe(1);
    expect("program" in del && del.id).toBeNull();
  });
});

describe("appliedAction follows applies", () => {
  const hass: any = { language: "en", config: { time_zone: "UTC" }, states: {}, services: { climate: { set_temperature: {} }, cover: { close_cover: {} } } };
  const temp: any = { id: "t", name: "15", color: "#00f", action: { kind: "service", service: "climate.set_temperature", data: { temperature: 15 } } };
  const p = program(week([]), [A, B]);
  it("a slot for another device gives nothing; without slot (default label) unchanged", () => {
    expect(appliedAction(hass, p, A, temp, { entities: [A] })).toBeDefined();
    expect(appliedAction(hass, p, A, temp, { entities: [B] })).toBeUndefined();
    expect(appliedAction(hass, p, A, temp)).toBeDefined();
    expect(appliedAction(hass, p, B, temp, {})).toBeUndefined(); // incompatible, as before
  });
});

describe("preview by device", () => {
  const span = (slot_id: string, entities?: string[]) => ({ slot_id, start: "07:00", end: "08:00", ignored: null, sun: false, ...(entities ? { entities } : {}) });
  it("deviceSpans reads by_entity, else the main list", () => {
    expect(deviceSpans({ slots: [span("1")], by_entity: { [B]: [span("2", [B])] } }, B).map((s) => s.slot_id)).toEqual(["2"]);
    expect(deviceSpans({ slots: [span("1")], by_entity: {} }, A)).toEqual([]);
    expect(deviceSpans({ slots: [span("1"), span("2", [B])] }, A).map((s) => s.slot_id)).toEqual(["1"]);
  });
  it("fetchPreviewResponse keeps by_entity and shares the cache with fetchPreview", async () => {
    clearPreviewCache();
    let calls = 0;
    const hass: any = { callWS: async () => { calls++; return { slots: [span("1")], by_entity: { [A]: [span("1")] } }; } };
    const res = await fetchPreviewResponse(hass, "p", 1, "2026-11-01", "m");
    expect(res.by_entity?.[A].length).toBe(1);
    expect((await fetchPreview(hass, "p", 1, "2026-11-01", "m")).length).toBe(1);
    expect(calls).toBe(1);
    const bare: any = { callWS: async () => ({ slots: [span("9")] }) };
    expect(await fetchPreviewResponse(bare, "q", 1, "2026-11-01")).toEqual({ slots: [span("9")] });
  });
});
