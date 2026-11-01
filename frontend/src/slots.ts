// Pure helpers on the times of slots: sun times, overlaps, ordering.

import { DAY, clockToMinutes, exactClock, localMinutes, nominal } from "./time";
import type { HomeAssistant, Slot, TimeSpec } from "./types";

const SUN_ATTR = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" } as const;
const SUN_DEFAULT = { dawn: 360, sunrise: 420, sunset: 1140, dusk: 1200 } as const;

/** Approximate minutes of a time spec (sun times come from the sun entity). */
export function specMinutes(hass: HomeAssistant, spec: TimeSpec): number {
  if ("time" in spec) return clockToMinutes(spec.time);
  const iso = hass.states["sun.sun"]?.attributes[SUN_ATTR[spec.sun]] as string | undefined;
  let m: number = iso ? localMinutes(iso, hass.config.time_zone) : SUN_DEFAULT[spec.sun];
  m += spec.offset ?? 0;
  if (spec.earliest) m = Math.max(m, clockToMinutes(spec.earliest));
  if (spec.latest) m = Math.min(m, clockToMinutes(spec.latest));
  return Math.max(0, Math.min(DAY, m));
}

/** Largest sun offset the server accepts (minutes, either side). */
export const SUN_OFFSET_MAX = 240;

/**
 * Moves a time spec by `delta` minutes and always returns a spec the server accepts: a solar time keeps
 * its event while the offset stays within the limit, otherwise it becomes the fixed time it resolves to.
 */
export function shiftTimeSpec(hass: HomeAssistant, spec: TimeSpec, delta: number): TimeSpec {
  const random = spec.random_minutes ? { random_minutes: spec.random_minutes } : {};
  // exact minutes: a typed 15:32 or a sunset at 17:17 is never rounded to a 5-minute step
  if ("time" in spec) return { ...spec, time: exactClock(clockToMinutes(spec.time) + delta) };
  const offset = (spec.offset ?? 0) + delta;
  if (Math.abs(offset) <= SUN_OFFSET_MAX) return { ...spec, offset };
  return { time: exactClock(specMinutes(hass, spec) + delta), ...random };
}

/** True when a solar time asks to be no earlier than its own latest limit (the server rejects it too). */
export function sunBoundsInvalid(spec: TimeSpec | null | undefined): boolean {
  return Boolean(spec && "sun" in spec && spec.earliest && spec.latest && clockToMinutes(spec.earliest) > clockToMinutes(spec.latest));
}

/** Interval occupied by a slot made of fixed times only (null otherwise). */
export function fixedInterval(slot: Slot): [number, number] | null {
  const s = nominal(slot.start);
  if (s === null || !slot.end) return null;
  const e = nominal(slot.end);
  if (e === null) return null;
  return e > s ? [s, e] : [s, DAY];
}

/**
 * First pair of overlapping fixed-time slots, as the server checks them: two slots collide only when they
 * overlap in time AND target at least one common device (`sharesDevice`).
 */
export function findOverlap(slots: Slot[]): [Slot, Slot] | null {
  const timed = slots
    .map((slot) => ({ slot, iv: fixedInterval(slot) }))
    .filter((x): x is { slot: Slot; iv: [number, number] } => x.iv !== null)
    .sort((a, b) => a.iv[0] - b.iv[0]);
  if (timed.some((x) => x.slot.entities !== undefined)) {
    // per-device lists: compare pairs (at most 50 slots a day); keep the earlier slot that reaches furthest
    for (let j = 1; j < timed.length; j++) {
      let owner: { slot: Slot; iv: [number, number] } | null = null;
      for (let i = 0; i < j; i++) {
        const c = timed[i];
        if (c.iv[1] > timed[j].iv[0] && sharesDevice(c.slot, timed[j].slot) && (!owner || c.iv[1] > owner.iv[1])) owner = c;
      }
      if (owner) return [owner.slot, timed[j].slot];
    }
    return null;
  }
  // compare with the slot that ends last so far (a long slot may swallow several short ones)
  let reach = timed[0]?.iv[1] ?? 0;
  let owner = timed[0]?.slot;
  for (let i = 1; i < timed.length; i++) {
    if (timed[i].iv[0] < reach) return [owner, timed[i].slot];
    if (timed[i].iv[1] > reach) {
      reach = timed[i].iv[1];
      owner = timed[i].slot;
    }
  }
  return null;
}


/** True when the slot targets this device: no `entities` list (every device), or the list contains it. */
export function applies(slot: Pick<Slot, "entities">, entityId: string): boolean {
  return slot.entities === undefined || slot.entities.includes(entityId);
}

/** True when two slots target at least one common device (a slot without list targets every device). */
export function sharesDevice(a: Pick<Slot, "entities">, b: Pick<Slot, "entities">): boolean {
  if (a.entities === undefined || b.entities === undefined) return true;
  return a.entities.some((e) => b.entities!.includes(e));
}

/** Devices a slot targets, given the program devices in program order. */
export function applicable(slot: Pick<Slot, "entities">, devices: readonly string[]): string[] {
  return slot.entities === undefined ? [...devices] : devices.filter((d) => slot.entities!.includes(d));
}

/**
 * D5 "what you see = what is stored": a device list in program order, without duplicates or unknown devices.
 * Every device of the program (so always for a single-device program) gives `undefined` (field absent); an
 * empty selection gives `[]`, which the caller must treat as "delete the slot".
 */
export function normaliseEntities(eids: readonly string[], devices: readonly string[]): string[] | undefined {
  const list = devices.filter((d) => eids.includes(d));
  if (devices.length > 0 && list.length === devices.length) return undefined;
  return list;
}

/** Same device list (order ignored; absent only equals absent). */
export function sameEntities(a: Pick<Slot, "entities">, b: Pick<Slot, "entities">): boolean {
  if (a.entities === undefined || b.entities === undefined) return a.entities === b.entities;
  const x = [...a.entities].sort();
  const y = [...b.entities].sort();
  return x.length === y.length && x.every((e, i) => e === y[i]);
}

/** The slots of a day that run for this device. */
export function daySlotsFor(day: readonly Slot[], entityId: string): Slot[] {
  return day.filter((s) => applies(s, entityId));
}
