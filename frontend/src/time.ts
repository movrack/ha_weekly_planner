// Time helpers. Everything displayed uses the Home Assistant server time zone, not the
// browser's (someone abroad must still see the house's schedule).

import type { Slot, TimeSpec } from "./types";

const formatters = new Map<string, Intl.DateTimeFormat>();

/** Cached `Intl.DateTimeFormat`: building one is costly and the render paths call these helpers many times. */
export function dateFormat(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let format = formatters.get(key);
  if (!format) formatters.set(key, (format = new Intl.DateTimeFormat(locale, options)));
  return format;
}

export function addDaysIso(dateIso: string, days: number): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export const STEP = 5; // minutes
export const DAY = 1440;

export function clockToMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToClock(minutes: number): string {
  const m = Math.max(0, Math.min(DAY, Math.round(minutes / STEP) * STEP));
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Minutes since local midnight (server zone) for an ISO date. */
export function localMinutes(iso: string | Date, timeZone: string): number {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const parts = dateFormat("en-GB", {
    timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

/** Day of week in the server zone, 0 = Monday. */
export function localWeekday(date: Date, timeZone: string): number {
  const name = dateFormat("en-GB", { timeZone, weekday: "short" }).format(date);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(name);
}

export function localDateIso(date: Date, timeZone: string): string {
  return dateFormat("en-CA", { timeZone }).format(date); // YYYY-MM-DD
}

/** Nominal minutes of a fixed time spec, null for a sun-based time. */
export function nominal(spec: TimeSpec | null | undefined): number | null {
  if (!spec || !("time" in spec)) return null;
  return clockToMinutes(spec.time);
}

/** Part of the previous day's slots that spill over midnight onto this day. */
export function spillover(previousDay: Slot[]): { slot: Slot; end: number }[] {
  const result: { slot: Slot; end: number }[] = [];
  for (const slot of previousDay) {
    const start = nominal(slot.start);
    const end = nominal(slot.end ?? null);
    if (start !== null && end !== null && end <= start && end < 720) result.push({ slot, end });
  }
  return result;
}

/** Spoken-style clock: "22 h" / "22 h 30" in French, "10 pm" / "10:30 pm" elsewhere (Intl). */
export function fmtClock(language: string, minutes: number): string {
  const m = ((Math.round(minutes) % DAY) + DAY) % DAY;
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (language.toLowerCase().startsWith("fr")) return min ? `${h} h ${String(min).padStart(2, "0")}` : `${h} h`;
  const date = new Date(Date.UTC(2000, 0, 1, h, min));
  const opts: Intl.DateTimeFormatOptions = { timeZone: "UTC", hour: "numeric" };
  if (min) opts.minute = "2-digit";
  return dateFormat(language, opts).format(date).replace(/\s?(AM|PM)/, (_, x: string) => ` ${x.toLowerCase()}`);
}

/** "22 h" today, "lun. 22 h" another day (server zone). */
export function formatWhen(iso: string, timeZone: string, language: string, now = new Date()): string {
  const date = new Date(iso);
  const sameDay = localDateIso(date, timeZone) === localDateIso(now, timeZone);
  const clock = fmtClock(language, localMinutes(date, timeZone));
  if (sameDay) return clock;
  const tomorrow = addDaysIso(localDateIso(now, timeZone), 1) === localDateIso(date, timeZone);
  if (tomorrow) return `${new Intl.RelativeTimeFormat(language, { numeric: "auto" }).format(1, "day")} ${clock}`;
  // a week or more ahead: the weekday alone would be read as this week ("lun. 2 nov.")
  const far = date.getTime() - now.getTime() > 6 * 86_400_000;
  const opts: Intl.DateTimeFormatOptions = far ? { timeZone, weekday: "short", day: "numeric", month: "short" } : { timeZone, weekday: "short" };
  return `${dateFormat(language, opts).format(date)} ${clock}`;
}
