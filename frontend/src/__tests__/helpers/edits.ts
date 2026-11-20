// Shared fixtures for the edits tests (profile edits, one day of a bar, copies between days).
import type { DayCtx } from "../../edits";
import { clockToMinutes } from "../../time";
import type { Slot, TimeSpec } from "../../types";

const SUN = { sunrise: 420, sunset: 1140, dawn: 360, dusk: 1200 };
/** Minute of a time spec; the sun is fixed (sunrise 7:00, sunset 19:00) so the tests do not depend on a date. */
export const at = (s: TimeSpec): number => ("time" in s ? clockToMinutes(s.time) : SUN[s.sun] + (s.offset ?? 0));
export const days7 = (d: Record<number, Slot[]> = {}): Slot[][] => [0, 1, 2, 3, 4, 5, 6].map((i) => d[i] ?? []);

/** A day context with no id maker and no default label: add `newId`, `defaultLabel`, `lead`, `entity`... per test. */
export const ctx = (extra: Partial<DayCtx> = {}): DayCtx => ({ at, ...extra });
/** An id maker giving n1, n2, n3... */
export const ids = () => { let i = 0; return () => `n${++i}`; };

const spec = (s: TimeSpec | null | undefined, none: string) => (s ? ("time" in s ? s.time : "sun") : none);
/** A slot with a time (or a sun spec), label t18 by default; `end` null makes a one-shot. */
export const sl = (id: string, start: string | TimeSpec, end: string | TimeSpec | null, extra: Partial<Slot> = {}): Slot => ({
  id, start: typeof start === "string" ? { time: start } : start,
  end: end === null ? null : typeof end === "string" ? { time: end } : end, conditions: [], label: "t18", ...extra,
});
/** "08:00-09:00:label" per slot (`_` for a one-shot, `sun` for a sun spec). */
export const show = (slots: Slot[]) => slots.map((s) => `${spec(s.start, "_")}-${spec(s.end, "_")}:${s.label}`);
/** Same as `show`, with the id first: "a:08:00-09:00:label". */
export const brief = (slots: Slot[]) => slots.map((s) => `${s.id}:${show([s])[0]}`);
