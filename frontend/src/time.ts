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

/** Home Assistant's `locale.time_format`: "12", "24" or "language" (the card language decides, as before). */
export type TimeFormat = "12" | "24" | "language";

let currentFormat: TimeFormat = "language";

/** Normalise what Home Assistant gives (absent or unknown means "language"). */
export function timeFormat(hass?: { locale?: { time_format?: string } } | null): TimeFormat {
  const value = hass?.locale?.time_format;
  return value === "12" || value === "24" ? value : "language";
}

/** The single entry point: the card, the chart and the editor call it with `hass`; every display helper reads it. */
export function setTimeFormat(hass?: { locale?: { time_format?: string } } | null): void {
  currentFormat = timeFormat(hass);
}

export function currentTimeFormat(): TimeFormat {
  return currentFormat;
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

/** "HH:MM" of any whole minute (no step), clamped to 00:00…24:00. */
export function exactClock(minutes: number): string {
  const m = Math.max(0, Math.min(DAY, Math.round(minutes)));
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

/**
 * Clock text following the Home Assistant time format (`format`, default: the one set by `setTimeFormat`).
 * "language": "22 h" / "22 h 30" in French, "10 pm" / "10:30 pm" elsewhere (Intl), as before.
 * "24": French keeps "22 h" / "22 h 30", other languages read "22:00" / "06:05".
 * "12": am/pm in every language ("10 pm", "10:30 pm"), French included.
 */
export function fmtClock(language: string, minutes: number, format: TimeFormat = currentFormat): string {
  const m = ((Math.round(minutes) % DAY) + DAY) % DAY;
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (language.toLowerCase().startsWith("fr") && format !== "12") return min ? `${h} h ${String(min).padStart(2, "0")}` : `${h} h`;
  const date = new Date(Date.UTC(2000, 0, 1, h, min));
  if (format === "24") return dateFormat(language, { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
  const opts: Intl.DateTimeFormatOptions = { timeZone: "UTC", hour: "numeric" };
  if (format === "12") opts.hour12 = true;
  if (min) opts.minute = "2-digit";
  return dateFormat(language, opts).format(date).replace(/\s?(AM|PM)/, (_, x: string) => ` ${x.toLowerCase()}`);
}

/** Compact 12 h tick: "7 am", "12 pm", "7:30 am" (minutes only on sub-hour ticks). */
export function fmtTick12(h: number, min: number, minutes = false): string {
  return `${h % 12 || 12}${minutes ? `:${String(min).padStart(2, "0")}` : ""} ${h % 24 < 12 ? "am" : "pm"}`;
}

/** End of the day: "24 h" (midnight as "12 am" in 12 h), never a second "0 h". */
export function fmtDayEnd(language: string, format: TimeFormat = currentFormat): string {
  return format === "12" ? fmtClock(language, 0, format) : "24 h";
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

/** End of a timed pause: "lun. 9 nov., 22 h" (server zone). */
export function formatPauseEnd(iso: string, timeZone: string, language: string): string {
  const date = new Date(iso);
  const day = dateFormat(language, { timeZone, weekday: "short", day: "numeric", month: "short" }).format(date);
  return `${day}, ${fmtClock(language, localMinutes(date, timeZone))}`;
}

/** Earliest end among the paused programs, or null when none has a timed pause. */
export function pauseEnd(programs: { enabled: boolean; paused_until?: string }[]): string | null {
  const ends = programs.filter((p) => !p.enabled && p.paused_until).map((p) => p.paused_until as string).sort();
  return ends[0] ?? null;
}
