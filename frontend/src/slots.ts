// Pure helpers on the times of slots: sun times, overlaps, ordering.

import { DAY, clockToMinutes, localMinutes, nominal } from "./time";
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

/** Interval occupied by a slot made of fixed times only (null otherwise). */
export function fixedInterval(slot: Slot): [number, number] | null {
  const s = nominal(slot.start);
  if (s === null || !slot.end) return null;
  const e = nominal(slot.end);
  if (e === null) return null;
  return e > s ? [s, e] : [s, DAY];
}

/** First pair of overlapping fixed-time slots, as the server checks them. */
export function findOverlap(slots: Slot[]): [Slot, Slot] | null {
  const timed = slots
    .map((slot) => ({ slot, iv: fixedInterval(slot) }))
    .filter((x): x is { slot: Slot; iv: [number, number] } => x.iv !== null)
    .sort((a, b) => a.iv[0] - b.iv[0]);
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

export function sortSlots(hass: HomeAssistant, slots: Slot[]): Slot[] {
  return [...slots].sort((a, b) => specMinutes(hass, a.start) - specMinutes(hass, b.start));
}
