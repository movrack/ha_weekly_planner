// Pure logic of the schedule screen: opening a slot for one day, writing an edit back without
// touching any other slot, dropping busy days from a new slot, choosing the start of a new slot.

import { ALL_DAYS, groupSlots, slotKey, writeGroups } from "./actions";
import type { SlotGroup } from "./actions";
import { newId } from "./planner";
import { applies, findOverlap, normaliseEntities, sameEntities, sharesDevice } from "./slots";
import { DAY, minutesToClock } from "./time";
import type { Profile, Slot, TimeSpec } from "./types";

type Include = (slot: Slot) => boolean;
type Minutes = (spec: TimeSpec) => number;

/** Id identifying a group: the id of its first day. */
export const groupId = (group: SlotGroup): string | undefined => group.ids[group.days[0]];

const holds = (group: SlotGroup, id: string | null): boolean => id !== null && Object.values(group.ids).includes(id);

/** The group holding the slot `id` (null: it is gone). */
export function findGroup(profile: Profile, include: Include, minutes: Minutes, id: string | null): SlotGroup | null {
  return groupSlots(profile, include, minutes).find((g) => holds(g, id)) ?? null;
}

/** Is the group being edited still what it was when opened? "days": same slot, other days. */
export function compareOrigin(fresh: SlotGroup | null, origin: SlotGroup): "same" | "days" | "changed" | "gone" {
  if (!fresh) return "gone";
  if (slotKey(fresh.slot) !== slotKey(origin.slot)) return "changed";
  const same = JSON.stringify(fresh.days) === JSON.stringify(origin.days)
    && JSON.stringify(fresh.ids) === JSON.stringify(origin.ids);
  return same ? "same" : "days";
}

/** What a screen is editing: the group it opened, the days of it left as they are, the new content. */
export interface RowEdit {
  /** Id of the opened group (null for a new slot). */
  openId: string | null;
  /** Rest of a group opened from one day: its other days, kept unless the edit covers them. */
  rest: SlotGroup | null;
  /** New content (null: the group is deleted). */
  draft: SlotGroup | null;
}

/** One day of a group, and the rest of the group (its other days). */
export function dayView(group: SlotGroup, weekday: number): { draft: SlotGroup; rest: SlotGroup } {
  const { [weekday]: own, ...others } = group.ids;
  return {
    draft: { slot: structuredClone(group.slot), days: [weekday], ids: own ? { [weekday]: own } : {} },
    rest: { slot: structuredClone(group.slot), days: group.days.filter((d) => d !== weekday), ids: others },
  };
}

/** The rest of a group, minus the days an edit now covers. */
export function keptRest(rest: SlotGroup | null, covered: number[]): SlotGroup[] {
  if (!rest) return [];
  const left = rest.days.filter((d) => !covered.includes(d));
  const ids = Object.fromEntries(left.filter((d) => rest.ids[d]).map((d) => [d, rest.ids[d]]));
  return left.length ? [{ ...rest, days: left, ids }] : [];
}

/** The profile with one edit applied. Every slot outside the edit is written back unchanged. */
export function applyEdit(profile: Profile, include: Include, minutes: Minutes, edit: RowEdit): Profile {
  const groups = groupSlots(profile, include, minutes).filter((g) => !holds(g, edit.openId));
  groups.push(...keptRest(edit.rest, edit.draft?.days ?? []));
  if (edit.draft) groups.push(edit.draft);
  return writeGroups(profile, groups, include, minutes);
}

/** First day whose slots overlap (null: none). */
export function overlapDay(profile: Profile): number | null {
  const day = profile.days.findIndex((slots) => findOverlap(slots));
  return day < 0 ? null : day;
}

/** The first overlap of a profile: the day and the two slots that collide (null: none). */
export function overlapPair(profile: Profile): { day: number; a: Slot; b: Slot } | null {
  for (let day = 0; day < profile.days.length; day++) {
    const pair = findOverlap(profile.days[day]);
    if (pair) return { day, a: pair[0], b: pair[1] };
  }
  return null;
}

/** Days where a slot would overlap nothing: `days` split into the free ones and the busy ones. */
export function splitBusyDays(
  profile: Profile, include: Include, minutes: Minutes, slot: Slot, days: number[] = ALL_DAYS,
): { free: number[]; busy: number[] } {
  const free: number[] = [];
  const busy: number[] = [];
  for (const day of days) {
    const probe: Slot = { ...slot, id: "__new__" };
    (findOverlap([...profile.days[day].filter(include), probe]) ? busy : free).push(day);
  }
  return { free, busy };
}

const STEP_UP = 5;

/**
 * Start and end of a new slot on a day: just after its last slot (8:00 on an empty day), one hour long.
 * With `entityId`, only the slots of that device count.
 */
export function nextTimes(daySlots: Slot[], minutes: Minutes, entityId?: string): { start: string; end: string } {
  if (entityId !== undefined) daySlots = daySlots.filter((s) => applies(s, entityId));
  let from = 8 * 60;
  if (daySlots.length) {
    from = Math.max(...daySlots.map((s) => minutes(s.end ?? s.start)));
    from = Math.ceil(from / STEP_UP) * STEP_UP;
  }
  const start = Math.min(from, DAY - 60);
  return { start: minutesToClock(start), end: minutesToClock(Math.min(DAY, start + 60)) };
}

/** A new empty-handed slot (one hour) for the given days. */
export function freshGroup(label: string, days: number[], times = { start: "08:00", end: "09:00" }): SlotGroup {
  const slot: Slot = { id: newId(), start: { time: times.start }, end: { time: times.end }, conditions: [], label };
  return { slot, days: [...days], ids: {}, fresh: true };
}

/* ------------------------------------------------------------------ direct edits on a day bar (0.7.0) */
// Pure functions on the slots of ONE day. `at` gives the minutes of a time spec on that day (sun times
// resolved). Nothing here mutates its input.

/** Minutes of a time spec on the edited day. */
export type At = (spec: TimeSpec) => number;

export interface DayCtx {
  at: At;
  /** Minutes at the start of the day taken by a slot of the previous day that crosses midnight. */
  lead?: number;
  newId?: () => string;
  /** Label given to a slot created over a gap (the rest-of-the-time label, else the first compatible one). */
  defaultLabel?: string;
  /** Device row being edited: segments, boundaries and merges only see the slots that run for it. */
  entity?: string;
  /** Devices of the program in program order (needed to split a slot without list between devices). */
  devices?: string[];
  /** Devices given to a slot created over a gap (already normalised; absent: every device). */
  newEntities?: string[];
}

/** The slots a day bar shows: every slot, or those of the edited device. */
const view = (slots: Slot[], ctx: DayCtx): Slot[] => {
  const entity = ctx.entity;
  return entity === undefined ? slots : slots.filter((s) => applies(s, entity));
};

const withEntities = (slot: Slot, ctx: DayCtx): Slot => (ctx.newEntities ? { ...slot, entities: [...ctx.newEntities] } : slot);

export const SNAP = 15;
const snap = (m: number): number => Math.round(m / SNAP) * SNAP;
const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

/** A fixed time spec for minutes 0–1440 ("24:00" for the end of the day). */
export function fixedTime(m: number): TimeSpec {
  const v = clamp(Math.round(m), 0, DAY);
  return { time: `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}` };
}

export interface Eff {
  start: number;
  /** End on this day (1440 when it crosses midnight); null for a one-shot. */
  end: number | null;
  /** The slot goes on after midnight (or is ignored today): its end cannot be moved from this day. */
  wrap: boolean;
}

export function eff(slot: Slot, at: At): Eff {
  const start = at(slot.start);
  if (!slot.end) return { start, end: null, wrap: false };
  const end = at(slot.end);
  return end > start ? { start, end, wrap: false } : { start, end: DAY, wrap: true };
}

export type Target = { kind: "slot"; id: string } | { kind: "gap"; start: number; end: number };
export type Seg =
  | { kind: "slot"; id: string; slot: Slot; start: number; end: number; wrap: boolean }
  | { kind: "gap"; start: number; end: number };

/** The day cut into slots and gaps (one-shots are not segments). */
export function segments(slots: Slot[], ctx: DayCtx): Seg[] {
  const timed = view(slots, ctx)
    .map((slot) => ({ slot, e: eff(slot, ctx.at) }))
    .filter((x) => x.e.end !== null)
    .sort((a, b) => a.e.start - b.e.start);
  const out: Seg[] = [];
  let cursor = ctx.lead ?? 0;
  for (const { slot, e } of timed) {
    if (e.start > cursor) out.push({ kind: "gap", start: cursor, end: e.start });
    out.push({ kind: "slot", id: slot.id, slot, start: e.start, end: e.end as number, wrap: e.wrap });
    cursor = Math.max(cursor, e.end as number);
  }
  if (cursor < DAY) out.push({ kind: "gap", start: cursor, end: DAY });
  return out;
}

export interface Handle { id: string; edge: "start" | "end" }
export interface Boundary { m: number; refs: Handle[]; oneShot: boolean }

/**
 * Every movable boundary of the day: edges at the same minute are one boundary when their slots share a device
 * (two devices that only meet at a minute keep separate boundaries); a one-shot is a single handle.
 */
export function boundaries(slots: Slot[], ctx: DayCtx): Boundary[] {
  const out: Boundary[] = [];
  const byMinute = new Map<number, { b: Boundary; slots: Slot[] }[]>();
  const dead = new Set<Boundary>();
  for (const slot of view(slots, ctx)) {
    const e = eff(slot, ctx.at);
    if (e.end === null) {
      out.push({ m: e.start, refs: [{ id: slot.id, edge: "start" }], oneShot: true });
      continue;
    }
    const edges: [number, Handle][] = [[e.start, { id: slot.id, edge: "start" }]];
    if (!e.wrap) edges.push([e.end, { id: slot.id, edge: "end" }]);
    for (const [m, ref] of edges) {
      const list = byMinute.get(m) ?? [];
      byMinute.set(m, list);
      const hits = list.filter((x) => x.slots.some((s) => sharesDevice(s, slot)));
      let hit = hits[0];
      if (!hit) {
        hit = { b: { m, refs: [], oneShot: false }, slots: [] };
        list.push(hit);
        out.push(hit.b);
      }
      for (const other of hits.slice(1)) { // the slot links two groups: they become one boundary
        hit.b.refs.push(...other.b.refs);
        hit.slots.push(...other.slots);
        list.splice(list.indexOf(other), 1);
        dead.add(other.b);
      }
      hit.b.refs.push(ref);
      hit.slots.push(slot);
    }
  }
  return out.filter((b) => !dead.has(b)).sort((a, b) => a.m - b.m);
}

const sameRef = (a: Handle, b: Handle): boolean => a.id === b.id && a.edge === b.edge;

/** The minute of a handle (null: it does not exist). */
export function handleMinute(slots: Slot[], ref: Handle, ctx: DayCtx): number | null {
  const slot = slots.find((s) => s.id === ref.id);
  if (!slot) return null;
  const e = eff(slot, ctx.at);
  return ref.edge === "start" ? e.start : e.end;
}

/**
 * Moves a boundary to `to` (snapped to 15 min), clamped to its neighbours: it can touch them, never cross them.
 * A sun-based edge becomes a fixed time. Slots sharing the boundary (end == start) move together.
 * Returns the new slots and the minute reached; null when the handle cannot be moved.
 */
export function moveBoundary(slots: Slot[], ref: Handle, to: number, ctx: DayCtx): { slots: Slot[]; m: number } | null {
  const slot = slots.find((s) => s.id === ref.id);
  if (!slot) return null;
  const own = eff(slot, ctx.at);
  let group: Handle[];
  let lo = 0;
  let hi = DAY;
  if (own.end === null) {
    if (ref.edge !== "start") return null;
    group = [ref];
    hi = DAY - SNAP; // a one-shot starts before the end of the day
  } else {
    if (ref.edge === "end" && own.wrap) return null;
    const b = boundaries(slots, ctx).find((x) => !x.oneShot && x.refs.some((r) => sameRef(r, ref)));
    if (!b) return null;
    group = b.refs;
    const m = b.m;
    if (m >= (ctx.lead ?? 0)) lo = ctx.lead ?? 0;
    const members = group.map((g) => slots.find((x) => x.id === g.id)!);
    for (const s of slots) {
      // only slots sharing a device with a moved slot can be crossed (other devices' slots are free to overlap)
      if (!members.some((g) => sharesDevice(g, s))) continue;
      const e = eff(s, ctx.at);
      if (e.end === null) continue;
      const edges: [number, Handle | null][] = [[e.start, { id: s.id, edge: "start" }], [e.end, e.wrap ? null : { id: s.id, edge: "end" }]];
      for (const [v, h] of edges) {
        if (h && group.some((g) => sameRef(g, h))) continue;
        if (v < m) lo = Math.max(lo, v);
        else if (v > m) hi = Math.min(hi, v);
        // an edge at the same minute outside the boundary (slot hidden from this device row): a stop
        else if (h?.edge === "end") lo = Math.max(lo, m);
        else if (h) hi = Math.min(hi, m);
      }
    }
    for (const g of group) {
      const s = slots.find((x) => x.id === g.id)!;
      const e = eff(s, ctx.at);
      if (g.edge === "end") lo = Math.max(lo, e.start + SNAP);
      else hi = Math.min(hi, (e.end as number) - SNAP);
    }
  }
  if (lo > hi) return { slots, m: handleMinute(slots, ref, ctx) ?? 0 };
  const m = clamp(snap(to), lo, hi);
  const spec = fixedTime(m);
  const next = slots.map((s) => {
    const g = group.find((x) => x.id === s.id);
    if (!g) return s;
    return g.edge === "start" ? { ...s, start: spec } : { ...s, end: spec };
  });
  return { slots: next, m };
}

/** Middle of [start, end] on the 15-min step, strictly inside with room for 15 min on each side (null: too short). */
export function middle(start: number, end: number): number | null {
  if (end - start < 2 * SNAP) return null;
  const mid = clamp(snap((start + end) / 2), start + SNAP, end - SNAP);
  return mid;
}

/**
 * Cuts a slot (or a gap) in two at its middle. A slot keeps its setting on the first half; the second half becomes
 * "None" (no slot there: the rest of the time applies). `handle` is the new boundary (the end of the first half).
 * A gap gets a new slot on its second half, with the default label.
 */
export function splitAt(slots: Slot[], target: Target, ctx: DayCtx & { defaultLabel?: string }): { slots: Slot[]; handle: Handle } | null {
  const newId = ctx.newId ?? defaultNewId;
  if (target.kind === "gap") {
    const mid = middle(target.start, target.end);
    if (mid === null || !ctx.defaultLabel) return null;
    const piece = withEntities({ id: newId(), start: fixedTime(mid), end: fixedTime(target.end), conditions: [], label: ctx.defaultLabel }, ctx);
    return { slots: sortByStart([...slots, piece], ctx), handle: { id: piece.id, edge: "start" } };
  }
  const slot = slots.find((s) => s.id === target.id);
  if (!slot || !slot.end) return null;
  const e = eff(slot, ctx.at);
  const mid = middle(e.start, e.end as number);
  if (mid === null) return null;
  const first: Slot = { ...slot, end: fixedTime(mid) };
  const next = slots.map((s) => (s.id === slot.id ? first : s));
  return { slots: sortByStart(next, ctx), handle: { id: slot.id, edge: "end" } };
}

/** Sets the label of a slot; a gap becomes a slot with that label over the whole gap. */
export function setLabel(slots: Slot[], target: Target, label: string, ctx: DayCtx): Slot[] {
  if (target.kind === "slot") return slots.map((s) => (s.id === target.id ? { ...s, label } : s));
  const piece = withEntities({ id: (ctx.newId ?? defaultNewId)(), start: fixedTime(target.start), end: fixedTime(target.end), conditions: [], label }, ctx);
  return sortByStart([...slots, piece], ctx);
}

/** Removes a slot: its time becomes "the rest of the time". */
export function removeSlot(slots: Slot[], id: string): Slot[] {
  return slots.filter((s) => s.id !== id);
}

const defaultNewId = (): string => newId();

function sortByStart(slots: Slot[], ctx: DayCtx): Slot[] {
  return [...slots].sort((a, b) => ctx.at(a.start) - ctx.at(b.start));
}

const sameKind = (a: Slot, b: Slot): boolean =>
  a.label === b.label && sameEntities(a, b) && stableJson(a.conditions ?? []) === stableJson(b.conditions ?? []) && (a.color ?? null) === (b.color ?? null);
const stableJson = (v: unknown): string => JSON.stringify(v);

/**
 * Merges neighbours with the same label and the same devices where the end of the first is the start of the second.
 * The neighbour is the previous slot sharing a device (slots of other devices in between are not in the way).
 * Slots whose id is in `keep` are never merged (the two pieces of a slot just cut, until the user chose their labels).
 */
export function mergeAdjacent(slots: Slot[], ctx: DayCtx, keep: ReadonlySet<string> = new Set()): Slot[] {
  const out: Slot[] = [];
  for (const slot of sortByStart(slots, ctx)) {
    let at = out.length - 1;
    while (at >= 0 && !sharesDevice(out[at], slot)) at--;
    const prev = out[at];
    if (prev && prev.end && slot.end) {
      const a = eff(prev, ctx.at);
      const b = eff(slot, ctx.at);
      if (!a.wrap && a.end === b.start && !prev.end.random_minutes && !slot.start.random_minutes && sameKind(prev, slot) && !keep.has(prev.id) && !keep.has(slot.id)) {
        out[at] = { ...prev, end: slot.end };
        continue;
      }
    }
    out.push(slot);
  }
  return out;
}

/**
 * The slots without [a, b) for the devices of `cut`: slots are cut around it, nothing outside the range is lost.
 * A slot that shares no device with `cut` is untouched; one that also runs for other devices keeps the range
 * for them (a copy limited to those devices, new id, same `seed`: D7).
 */
function trim(slots: Slot[], a: number, b: number, ctx: DayCtx, cut: Pick<Slot, "entities"> = {}): Slot[] {
  const newId = ctx.newId ?? defaultNewId;
  const out: Slot[] = [];
  for (const slot of slots) {
    const e = eff(slot, ctx.at);
    if (e.end === null || e.end <= a || e.start >= b || !sharesDevice(slot, cut)) {
      out.push(slot);
      continue;
    }
    const before = e.start < a;
    const after = e.end > b;
    const cutList = cut.entities;
    const rest = cutList === undefined ? [] : (slot.entities ?? ctx.devices ?? []).filter((d) => !cutList.includes(d));
    const pieces: Slot[] = [];
    if (before) pieces.push({ ...slot, end: fixedTime(a) });
    if (rest.length) {
      const entities = ctx.devices ? normaliseEntities(rest, ctx.devices) : rest;
      const keptSlot: Slot = { ...structuredClone(slot), start: before ? fixedTime(a) : slot.start, end: after ? fixedTime(b) : slot.end };
      if (entities) keptSlot.entities = entities;
      if (pieces.length) keptSlot.seed = slot.seed ?? slot.id;
      pieces.push(keptSlot);
    }
    // the part after the range keeps the original end (also when it crosses midnight)
    if (after) pieces.push({ ...structuredClone(slot), start: fixedTime(b) });
    pieces.forEach((p, i) => out.push({ ...p, id: i === 0 ? slot.id : newId() }));
  }
  return out;
}

/** Days (among `to`) where the copy of a slot would overlap existing slots. */
export function copyConflicts(days: Slot[][], src: { day: number; id: string }, to: number[], ctx: DayCtx): number[] {
  const slot = days[src.day]?.find((s) => s.id === src.id);
  if (!slot) return [];
  const e = eff(slot, ctx.at);
  if (e.end === null) return [];
  return to.filter((d) => d !== src.day && days[d].some((s) => {
    if (!sharesDevice(s, slot)) return false;
    const x = eff(s, ctx.at);
    return x.end !== null && x.start < (e.end as number) && x.end > e.start;
  }));
}

/**
 * Copies a slot to other days. On a day in `skip` nothing is copied; on the others the existing slots are cut
 * around the copied range ("replace"). A one-shot is added unless the same one is already there.
 */
export function copyToDays(
  days: Slot[][], src: { day: number; id: string }, to: number[], ctx: DayCtx, skip: number[] = [],
): Slot[][] {
  const slot = days[src.day]?.find((s) => s.id === src.id);
  if (!slot) return days;
  const newId = ctx.newId ?? defaultNewId;
  const e = eff(slot, ctx.at);
  return days.map((day, d) => {
    if (!to.includes(d) || d === src.day || skip.includes(d)) return day;
    const copy: Slot = { ...structuredClone(slot), id: newId() };
    if (e.end === null) {
      const dup = day.some((s) => !s.end && stableJson(s.start) === stableJson(slot.start) && s.label === slot.label && sameEntities(s, slot));
      return dup ? day : sortByStart([...day, copy], ctx);
    }
    return mergeAdjacent([...trim(day, e.start, e.end, ctx, slot), copy], ctx);
  });
}

/* ------------------------------------------------------------------ moving a whole slot (long press, then drag) */

/** Moves a time spec by `delta` minutes (a sun time keeps its event and changes its offset). */
export type Shift = (spec: TimeSpec, delta: number) => TimeSpec;
export type MoveRefusal = "oneshot" | "wrap" | "sunbound";

/** Why a slot cannot be dragged as a whole (null: it can). */
export function moveRefusal(slot: Slot, ctx: DayCtx): MoveRefusal | null {
  if (!slot.end) return "oneshot"; // a one-shot has its own handle
  if (eff(slot, ctx.at).wrap) return "wrap"; // crosses midnight: the other day owns its end
  const bounded = (s: TimeSpec) => "sun" in s && Boolean(s.earliest || s.latest);
  return bounded(slot.start) || bounded(slot.end) ? "sunbound" : null; // limits would silently undo the shift
}

const shifted = (slot: Slot, d: number, shift: Shift): Slot =>
  d === 0 ? slot : { ...slot, start: shift(slot.start, d), end: slot.end ? shift(slot.end, d) : slot.end };

/**
 * Moves a slot by `delta` minutes inside its day: same duration, 15-minute steps, clamped to the day and to its
 * neighbours (it can touch them, never cross them). `delta` is the minutes actually applied.
 */
export function moveSlotBy(slots: Slot[], id: string, delta: number, ctx: DayCtx, shift: Shift): { slots: Slot[]; start: number; end: number; delta: number } | null {
  const slot = slots.find((s) => s.id === id);
  if (!slot || moveRefusal(slot, ctx)) return null;
  const e = eff(slot, ctx.at);
  const end = e.end as number;
  const span = end - e.start;
  let lo = e.start >= (ctx.lead ?? 0) ? ctx.lead ?? 0 : 0;
  let hi = DAY;
  for (const s of slots) {
    if (s.id === id || !sharesDevice(s, slot)) continue;
    const o = eff(s, ctx.at);
    if (o.end === null) continue;
    if (o.end <= e.start) lo = Math.max(lo, o.end);
    else if (o.start >= end) hi = Math.min(hi, o.start);
  }
  if (hi - lo < span) return null;
  const start = clamp(snap(e.start + delta), lo, hi - span);
  const d = start - e.start;
  return { slots: slots.map((s) => (s.id === id ? shifted(s, d, shift) : s)), start, end: start + span, delta: d };
}

/**
 * Moves a slot to another day (same duration, shifted by `delta` minutes on the 15-minute step, clamped to the
 * day): it leaves its own day only and refuses to land on a slot of the new day (no silent replacement).
 */
export function moveToDay(
  days: Slot[][], src: { day: number; id: string }, to: number, delta: number, ctx: DayCtx, shift: Shift,
): { days: Slot[][]; start: number } | { error: "gone" | "overlap" | MoveRefusal } {
  const slot = days[src.day]?.find((s) => s.id === src.id);
  if (!slot || to === src.day || !days[to]) return { error: "gone" };
  const refusal = moveRefusal(slot, ctx);
  if (refusal) return { error: refusal };
  const e = eff(slot, ctx.at);
  const span = (e.end as number) - e.start;
  const start = clamp(snap(e.start + delta), 0, DAY - span);
  const busy = days[to].some((s) => {
    if (!sharesDevice(s, slot)) return false;
    const o = eff(s, ctx.at);
    return o.end !== null && o.start < start + span && o.end > start;
  });
  if (busy) return { error: "overlap" };
  const copy: Slot = { ...shifted(structuredClone(slot), start - e.start, shift), id: (ctx.newId ?? defaultNewId)() };
  return {
    start,
    days: days.map((day, d) => (d === src.day ? day.filter((s) => s.id !== src.id) : d === to ? sortByStart([...day, copy], ctx) : day)),
  };
}
