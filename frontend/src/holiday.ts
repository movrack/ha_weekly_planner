// Day off ("Jour férié", #54): pure helpers. The server decides what runs today (`status[pid].holiday`, preview);
// the card only words it and, as a fallback while a preview is loading, picks the day the server named.
import { strings, t } from "./i18n";
import type { PlannerData, Profile, Slot } from "./types";

export type HolidayChoice = "none" | "copy" | "own";

export const holidayChoice = (profile?: Pick<Profile, "holiday"> | null): HolidayChoice =>
  !profile?.holiday ? "none" : "copy" in profile.holiday ? "copy" : "own";

/** Slots of the profile's own day-off day (none for a copy or no setting). */
export const holidayOwnSlots = (profile?: Pick<Profile, "holiday"> | null): Slot[] =>
  profile?.holiday && "day" in profile.holiday ? profile.holiday.day : [];

/** Every slot a profile holds, the day-off day included (to find a slot by its id). */
export const allSlots = (profile: Pick<Profile, "days" | "holiday">): Slot[] => [...profile.days.flat(), ...holidayOwnSlots(profile)];

/** The day that runs today when the server says today is a day off for this program (fallback before a preview arrives). */
export function holidayDayToday(profile: Pick<Profile, "days" | "holiday">, data: Pick<PlannerData, "holiday_today">, applies: boolean): Slot[] | null {
  if (!data.holiday_today || !applies || !profile.holiday) return null;
  return "copy" in profile.holiday ? profile.days[profile.holiday.copy] ?? null : profile.holiday.day;
}

/** Today runs a day-off schedule instead of the normal day: today's bar is not edited in place. */
export const holidayApplies = (data: PlannerData | undefined, programId: string): boolean => Boolean(data?.status[programId]?.holiday);

/** "Day off: like Sunday, not Monday" / "… own schedule, not Monday's"; null when the copied day is the real one. */
export function holidayLine(lang: string, holiday: { copy: number } | { own: true }, realWeekday: number): string | null {
  const days = strings(lang).days.map((d) => d.toLocaleLowerCase(lang));
  if ("copy" in holiday) {
    return holiday.copy === realWeekday ? null : t(lang, "holiday_line_copy", { copied: days[holiday.copy], actual: days[realWeekday] });
  }
  return t(lang, "holiday_line_own", { actual: days[realWeekday] });
}
