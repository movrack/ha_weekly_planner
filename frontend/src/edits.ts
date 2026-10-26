// Pure logic of the schedule screen: opening a slot for one day, writing an edit back without
// touching any other slot, dropping busy days from a new slot, choosing the start of a new slot.

import { ALL_DAYS, groupSlots, slotKey, writeGroups } from "./actions";
import type { SlotGroup } from "./actions";
import { newId } from "./planner";
import { findOverlap } from "./slots";
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

/** Start and end of a new slot on a day: just after its last slot (8:00 on an empty day), one hour long. */
export function nextTimes(daySlots: Slot[], minutes: Minutes): { start: string; end: string } {
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
