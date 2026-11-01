// Pure logic of the schedule screens: times of a slot, days, grouping the same slot across days.

import { t } from "./i18n";
import { newId } from "./planner";
import { DAY, STEP, fmtClock } from "./time";
import type { Profile, Slot, TimeSpec } from "./types";

export const NBSP = " ";
export const nb = (text: string): string => text.replace(/ /g, NBSP);

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

/* ------------------------------------------------------------------ time of a slot */

export type SunName = "sunrise" | "sunset";

const offsetWord = (lang: string, minutes: number): string => {
  const abs = Math.abs(minutes);
  const d = abs < 60 ? `${abs} min` : abs % 60 ? `${Math.floor(abs / 60)} h ${String(abs % 60).padStart(2, "0")}` : `${abs / 60} h`;
  return `${minutes > 0 ? "+" : "−"}${d}`;
};

/** "8 h 45", "Coucher", "Coucher +30 min". Non-breaking spaces. */
export function specText(lang: string, spec: TimeSpec, minutes?: number): string {
  const random = spec.random_minutes ? ` · ${t(lang, "random_window", { n: String(spec.random_minutes) })}` : "";
  if ("time" in spec) {
    const [h, m] = spec.time.split(":").map(Number);
    return nb((h * 60 + m >= DAY ? "24 h" : fmtClock(lang, h * 60 + m)) + random);
  }
  const name = t(lang, (spec.sun === "sunrise" || spec.sun === "sunset" ? `sun_${spec.sun}_short` : `sun_${spec.sun}`) as never);
  const off = spec.offset ? ` ${offsetWord(lang, spec.offset)}` : "";
  void minutes;
  return nb(`${name}${off}${random}`);
}

/** Moves a time by the step (15 min), or the offset of a sun time. */
export function shiftSpec(spec: TimeSpec, delta: number): TimeSpec {
  if ("time" in spec) {
    const [h, m] = spec.time.split(":").map(Number);
    const next = Math.max(0, Math.min(DAY, Math.round((h * 60 + m + delta) / STEP) * STEP));
    return { ...spec, time: next >= DAY ? "24:00" : `${String(Math.floor(next / 60)).padStart(2, "0")}:${String(next % 60).padStart(2, "0")}` };
  }
  return { ...spec, offset: Math.max(-240, Math.min(240, (spec.offset ?? 0) + delta)) };
}

/* ------------------------------------------------------------------ days */

export const WEEKDAYS = [0, 1, 2, 3, 4];
export const WEEKEND = [5, 6];
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export function daysText(lang: string, short: string[], days: number[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  if (same(sorted, ALL_DAYS)) return t(lang, "all_days_text");
  if (same(sorted, WEEKDAYS)) return `${short[0]}–${short[4]}`;
  if (same(sorted, WEEKEND)) return t(lang, "weekend");
  return sorted.map((d) => short[d]).join(NBSP);
}

/* ------------------------------------------------------------------ grouping slots across days */

export interface SlotGroup {
  /** Template slot (id of the first day). */
  slot: Slot;
  days: number[];
  /** Existing slot id of each day, kept when the group is written back. */
  ids: Record<number, string>;
  fresh?: boolean;
}

/** Stable JSON (sorted keys) used to compare slots. */
export function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${stable(o[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** Content of a slot without its id; the device list is sorted (order never makes two slots different). */
export function slotKey(slot: Slot): string {
  const { id: _id, ...rest } = slot;
  if (rest.entities !== undefined) rest.entities = [...rest.entities].sort();
  else delete rest.entities;
  return stable({ ...rest, conditions: slot.conditions ?? [], end: slot.end ?? null, color: slot.color ?? null });
}

/** Identical slots of the profile days become one group carrying its days. */
export function groupSlots(
  profile: Profile, include: (slot: Slot) => boolean, minutes: (spec: TimeSpec) => number,
): SlotGroup[] {
  const groups = new Map<string, SlotGroup>();
  profile.days.forEach((slots, day) => {
    for (const slot of slots) {
      if (!include(slot)) continue;
      // the seed only matters with a random delay: copies split for a device on each day (each with its own seed)
      // still read as one row
      const random = Boolean(slot.start.random_minutes || slot.end?.random_minutes);
      const { seed: _seed, ...unseeded } = slot;
      const key = slotKey(random ? slot : unseeded);
      let g = groups.get(key);
      if (g && g.days.includes(day)) {
        g = undefined;
        groups.set(`${key}#${slot.id}`, { slot, days: [day], ids: { [day]: slot.id } });
        continue;
      }
      if (!g) {
        g = { slot, days: [], ids: {} };
        groups.set(key, g);
      }
      g.days.push(day);
      g.ids[day] = slot.id;
    }
  });
  return [...groups.values()].sort(
    (a, b) => minutes(a.slot.start) - minutes(b.slot.start) || a.days[0] - b.days[0],
  );
}

/** Writes the groups back as one slot per day; slots rejected by `include` are left alone. */
export function writeGroups(
  profile: Profile, groups: SlotGroup[], include: (slot: Slot) => boolean, minutes: (spec: TimeSpec) => number,
): Profile {
  const days: Slot[][] = profile.days.map((d) => d.filter((s) => !include(s)));
  for (const g of groups) {
    for (const day of g.days) {
      days[day].push({ ...structuredClone(g.slot), id: g.ids[day] ?? newId() });
    }
  }
  return { ...profile, days: days.map((d) => d.sort((a, b) => minutes(a.start) - minutes(b.start))) };
}

/* ------------------------------------------------------------------ entities of a scope */

/** Device name for headers and cards. */
