// Per-device schedules (#34): pure edits of `slot.entities` and `slot.seed`.
// D1 copy-on-write, D5 normalisation ("what you see = what is stored"), D7 seed kept on a split.
// Generic: devices are entity ids of the program, never tested by type or domain.

import { slotKey } from "./actions";
import { newId as defaultNewId } from "./planner";
import { applicable, applies, findOverlap, normaliseEntities, sharesDevice } from "./slots";
import type { Program, Slot } from "./types";

/** What an edit changes in a slot (never its id, devices or seed). */
export type SlotPatch = Partial<Pick<Slot, "start" | "end" | "label" | "conditions" | "color">>;
/** A patch, or null: the slot stops running (for the device, or for every device). */
export type SlotChange = SlotPatch | null;

/** Device ids of a program, in program order. */
export const devicesOf = (program: Pick<Program, "entities">): string[] => program.entities.map((e) => e.entity_id);

/** True when the slot runs for more than one device (editing it from one row asks "This device" / "All (N)", D1). */
export const isShared = (slot: Pick<Slot, "entities">, devices: readonly string[]): boolean =>
  applicable(slot, devices).length > 1;

function setEntities(slot: Slot, list: string[] | undefined): Slot {
  const { entities: _drop, ...rest } = slot;
  return list ? { ...rest, entities: [...list] } : rest;
}

function patched(slot: Slot, change: SlotPatch): Slot {
  const clean = Object.fromEntries(Object.entries(change).filter(([, v]) => v !== undefined));
  return { ...slot, ...structuredClone(clean) };
}

/** The slot for every device of the program (field removed). */
export function applyToAll(slot: Slot): Slot {
  return setEntities(slot, undefined);
}

/** The slot for exactly these devices, normalised (D5). Null: no device left, the slot must be deleted. */
export function forDevices(slot: Slot, eids: readonly string[], program: Pick<Program, "entities">): Slot | null {
  const list = normaliseEntities(eids, devicesOf(program));
  if (list && !list.length) return null;
  return setEntities(slot, list);
}

/** "Also for: …": the slot also runs for these devices, normalised (D5). Null only for a program without devices. */
export function alsoFor(slot: Slot, eids: readonly string[], program: Pick<Program, "entities">): Slot | null {
  return forDevices(slot, [...applicable(slot, devicesOf(program)), ...eids], program);
}

/**
 * Removes a device from every slot list of every mode (D5): a list left empty deletes its slot, a list that now
 * holds every remaining device becomes absent. Slots without list are kept (they follow the program devices).
 * `program.entities` itself is not changed.
 */
export function removeDeviceFromSlots(program: Program, entityId: string): Program {
  const rest = devicesOf(program).filter((d) => d !== entityId);
  const clean = (slot: Slot): Slot[] => {
    if (slot.entities === undefined) return [slot];
    const list = normaliseEntities(slot.entities.filter((e) => e !== entityId), rest);
    return list && !list.length ? [] : [setEntities(slot, list)];
  };
  return {
    ...program,
    profiles: program.profiles.map((p) => ({ ...p, days: p.days.map((day) => day.flatMap(clean)) })),
  };
}

/* ------------------------------------------------------------------ re-merging copies */

const kindKey = (slot: Slot): string => {
  const { entities: _e, seed: _s, ...rest } = slot;
  return slotKey(rest);
};
const effSeed = (slot: Slot): string => slot.seed ?? slot.id;
const random = (slot: Slot): boolean => Boolean(slot.start.random_minutes || slot.end?.random_minutes);

/**
 * Slots of a day identical except for their devices (disjoint lists) become one slot (D1: copies that became
 * identical again are merged, so a day does not run into the 50-slot limit). With a random delay, only slots that
 * draw the same delay (same seed) are merged. The survivor is the original (the slot whose id the other uses as
 * seed), else the first. `absorbed` maps each merged id to the survivor id.
 */
export function remergeIdentical(day: Slot[], devices: readonly string[]): { day: Slot[]; absorbed: Map<string, string> } {
  const out: Slot[] = [];
  const absorbed = new Map<string, string>();
  for (const slot of day) {
    const key = kindKey(slot);
    const at = out.findIndex((o) => !sharesDevice(o, slot) && kindKey(o) === key
      && (effSeed(o) === effSeed(slot) || (!random(o) && !random(slot))));
    if (at < 0) {
      out.push(slot);
      continue;
    }
    const other = out[at];
    const [keep, lost] = other.seed === slot.id ? [slot, other] : [other, slot];
    const list = normaliseEntities([...applicable(other, devices), ...applicable(slot, devices)], devices);
    out[at] = setEntities(keep, list);
    absorbed.set(lost.id, keep.id);
    for (const [k, v] of absorbed) if (v === lost.id) absorbed.set(k, keep.id);
  }
  return { day: out, absorbed };
}

/* ------------------------------------------------------------------ copy-on-write (D1, D7) */

export interface DeviceEditOptions {
  /** Devices of the program, in program order. */
  devices: string[];
  newId?: () => string;
}

/**
 * Applies `change` to the slot `slotId` for ONE device ("This device", D1). A slot of that device only is changed
 * in place. A shared slot is split: the kept part keeps the id and the other devices; the changed copy gets a new
 * id, the same `seed` (D7) and this device only. Copies that became identical are re-merged. `change` null: the
 * slot stops running for this device. Returns the new days and the id of the device's slot (null: none left);
 * null when the slot is gone or does not run for the device. Overlaps are not checked here.
 */
export function editForDevice(
  days: Slot[][], slotId: string, entityId: string, change: SlotChange, opts: DeviceEditOptions,
): { days: Slot[][]; id: string | null } | null {
  const d = days.findIndex((day) => day.some((s) => s.id === slotId));
  if (d < 0) return null;
  const slot = days[d].find((s) => s.id === slotId)!;
  if (!applies(slot, entityId)) return null;
  const targets = slot.entities ?? opts.devices;
  let parts: Slot[];
  let id: string | null = null;
  if (targets.length <= 1) {
    parts = change ? [patched(slot, change)] : [];
    if (change) id = slot.id;
  } else {
    parts = [setEntities(slot, normaliseEntities(targets.filter((e) => e !== entityId), opts.devices))];
    if (change) {
      const copy: Slot = { ...patched(structuredClone(slot), change), id: (opts.newId ?? defaultNewId)(), seed: effSeed(slot), entities: [entityId] };
      parts.push(copy);
      id = copy.id;
    }
  }
  const day = days[d].flatMap((s) => (s.id === slotId ? parts : [s]));
  const merged = remergeIdentical(day, opts.devices);
  if (id && merged.absorbed.has(id)) id = merged.absorbed.get(id)!;
  return { days: days.map((x, i) => (i === d ? merged.day : x)), id };
}

/* ------------------------------------------------------------------ conflict retry by intent */

/**
 * What the user asked, kept to be replayed on fresh data after a revision conflict (never a precomputed list of
 * slots, which would overwrite a concurrent change made on another device). `eid` null: every device of the slot.
 */
export interface EditIntent {
  profileId: string;
  slotId: string;
  eid: string | null;
  change: SlotChange;
}

export type IntentResult =
  | { program: Program; id: string | null }
  | { error: "gone" | "device" | "overlap" };

/**
 * Replays an intent on the fresh program: "gone" when the mode or slot no longer exists, "device" when the slot
 * no longer runs for the device (someone else split it), "overlap" when the result collides with a fresh slot.
 */
export function applyIntent(fresh: Program, intent: EditIntent, newId?: () => string): IntentResult {
  const profile = fresh.profiles.find((p) => p.id === intent.profileId);
  if (!profile || !profile.days.some((day) => day.some((s) => s.id === intent.slotId))) return { error: "gone" };
  let days: Slot[][];
  let id: string | null;
  if (intent.eid === null) {
    const change = intent.change;
    days = profile.days.map((day) => (change
      ? day.map((s) => (s.id === intent.slotId ? patched(s, change) : s))
      : day.filter((s) => s.id !== intent.slotId)));
    id = change ? intent.slotId : null;
  } else {
    const res = editForDevice(profile.days, intent.slotId, intent.eid, intent.change, { devices: devicesOf(fresh), newId });
    if (!res) return { error: "device" };
    ({ days, id } = res);
  }
  if (days.some((day) => findOverlap(day))) return { error: "overlap" };
  const next = { ...profile, days };
  return { program: { ...fresh, profiles: fresh.profiles.map((p) => (p.id === profile.id ? next : p)) }, id };
}
