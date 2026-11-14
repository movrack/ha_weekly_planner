// "Daily times": the pure part. One row per span of today (the spans the bars already draw), sorted by instant.
// No Lit here, so it is tested on its own. The text of the clock is `fmtClock` (its format is not decided here).

import type { BarSpan } from "./components/day-bar";
import { DAY, localMinutes, nominal } from "./time";
import { t } from "./i18n";
import type { TimeSpec } from "./types";

export interface TimesContext {
  /** Server time zone (to read the clock of an instant). */
  tz: string;
  /** Minutes since midnight now, or null when the day is not today (no "now" marker). */
  nowMin: number | null;
  /** The instant now (ms), to tell the two 02:30 of a 25-hour day apart. */
  nowMs?: number | null;
}

export interface TimesRow {
  /** `slotId|start`: stable between renders. */
  key: string;
  /** Minutes of the start (of the previous day for a carried-over row). */
  startMin: number;
  startMs?: number;
  /** Real instant of the end (ms), when known: used to tell that two spans touch. */
  endMs?: number | null;
  /** The setting (label id) the span applies; two neighbours merge only when it is the same one. */
  labelId?: string;
  color: string;
  label: string;
  slotId?: string;
  /** The row continues a span that began yesterday. */
  carry: "from_yesterday" | null;
  /** Where the span ends; null for a one-shot. `min` is null when the end is not known. */
  until: { day: "today" | "tomorrow"; min: number | null } | null;
  oneShot: boolean;
  /** Sun icon side of the start ("up" sunrise side, "down" sunset side), null for a fixed time. */
  sun: "up" | "down" | null;
  /** The sun rule of the start (the resolved time is `startMin`); never a range. */
  rule: TimeSpec | null;
  /** The start has a random delay: only said, the base time is not known to the card. */
  random: boolean;
  now: boolean;
  /** Today only: the span already ended (its end is not after the instant now). Said in words, never by colour alone. */
  done: boolean;
}

const endOf = (s: BarSpan): number => (s.marker ? s.start : s.end);

/** Whether `outer` hides `inner` entirely (a higher-priority span drawn over it). */
function covers(outer: BarSpan, inner: BarSpan): boolean {
  if (outer.marker) return false;
  if (outer.startMs !== undefined && inner.startMs !== undefined && outer.endMs != null && (inner.marker || inner.endMs != null)) {
    return outer.startMs <= inner.startMs && outer.endMs >= (inner.marker ? inner.startMs : inner.endMs!);
  }
  return outer.start <= inner.start && outer.end >= endOf(inner);
}

/** Whether the instant now falls inside the span (by instant when known, else by minutes). */
function isNow(s: BarSpan, ctx: TimesContext): boolean {
  if (s.marker || ctx.nowMin === null) return false;
  if (ctx.nowMs != null && s.startMs !== undefined && s.endMs != null) return s.startMs <= ctx.nowMs && ctx.nowMs < s.endMs;
  return s.start <= ctx.nowMin && ctx.nowMin < s.end;
}

/**
 * The "daily times" rows of the spans of one device. `spans` are in paint order: a later span wins over an earlier one.
 * Skipped times and spans entirely under a winner are left out; the input is never changed.
 */
export function timesRows(spans: readonly BarSpan[], ctx: TimesContext): TimesRow[] {
  const live = spans.filter((s) => !s.ignored);
  const keyOf = (s: BarSpan) => `${s.slotId ?? ""}|${s.startMs ?? s.start}`;
  const seen = new Set<string>();
  const items: { row: TimesRow; span: BarSpan }[] = [];
  live.forEach((s, i) => {
    const key = keyOf(s);
    if (seen.has(key)) return;
    seen.add(key);
    // (a later copy of the same occurrence is not a winner: it is the same row)
    if (live.slice(i + 1).some((w) => keyOf(w) !== key && covers(w, s))) return;
    const carry = s.spill ? "from_yesterday" : null;
    let startMin = s.start;
    if (carry) startMin = s.startMs !== undefined ? localMinutes(new Date(s.startMs), ctx.tz) : nominal(s.startSpec) ?? 0;
    let until: TimesRow["until"] = null;
    if (!s.marker) {
      if (s.end >= DAY) {
        const m = s.endMs != null ? localMinutes(new Date(s.endMs), ctx.tz) : nominal(s.endSpec);
        until = m === 0 ? { day: "today", min: DAY } : { day: "tomorrow", min: m };
      } else until = { day: "today", min: s.end };
    }
    const spec = s.startSpec;
    items.push({
      span: s,
      row: {
        key, startMin, startMs: s.startMs, endMs: s.endMs, labelId: s.labelId, color: s.color, label: s.label, slotId: s.slotId, carry, until,
        oneShot: Boolean(s.marker), sun: carry ? null : s.startSun ?? null,
        rule: !carry && s.startSun && spec && "sun" in spec ? spec : null,
        random: Boolean(spec?.random_minutes), now: false, done: false,
      },
    });
  });
  // by instant (the real one when known: a 25-hour day has two 02:30), else by minutes; a carried-over row first on a tie
  const dayMin = (r: TimesRow) => (r.carry ? -1 : r.startMin);
  items.sort((a, b) => (a.row.startMs !== undefined && b.row.startMs !== undefined && a.row.startMs !== b.row.startMs
    ? a.row.startMs - b.row.startMs : dayMin(a.row) - dayMin(b.row)));
  const current = items.filter((x) => isNow(x.span, ctx)).pop();
  if (current) current.row.now = true;
  return mergeNeighbours(items.map((x) => x.row)).map((r) => ({ ...r, done: isDone(r, ctx) }));
}

/** Whether a row of today already ended (never on another day, never a one-shot, never the current row). */
function isDone(r: TimesRow, ctx: TimesContext): boolean {
  if (ctx.nowMin === null || r.now || !r.until || r.until.day !== "today" || r.until.min === null) return false;
  if (ctx.nowMs != null && r.endMs != null) return r.endMs <= ctx.nowMs;
  return r.until.min <= ctx.nowMin;
}

/** Whether `b` is the same setting as `a`, starting exactly where `a` ends (same day): one stretch for the reader. */
function continues(a: TimesRow, b: TimesRow): boolean {
  if (b.carry || a.oneShot || b.oneShot || !a.until || a.until.day !== "today" || a.until.min === null) return false;
  if (a.labelId === undefined || a.labelId !== b.labelId) return false;
  if (a.endMs != null && b.startMs !== undefined) return a.endMs === b.startMs;
  return a.until.min === b.startMin;
}

/** Consecutive rows of the same setting that touch become one row (start of the first, end of the last). */
function mergeNeighbours(rows: TimesRow[]): TimesRow[] {
  const out: TimesRow[] = [];
  for (const r of rows) {
    const last = out[out.length - 1];
    if (last && continues(last, r)) out[out.length - 1] = { ...last, until: r.until, endMs: r.endMs, now: last.now || r.now };
    else out.push(r);
  }
  return out;
}

/** The rule of a sun-based start in words: "30 min before sunset", "15 min after sunrise", "at sunset". */
export function sunRuleText(lang: string, spec: TimeSpec): string {
  if (!("sun" in spec)) return "";
  const offset = spec.offset ?? 0;
  const ev = (["dawn", "sunrise", "sunset", "dusk"] as const).includes(spec.sun) ? spec.sun : "sunset";
  if (!offset) return t(lang, `sun_at_${ev}` as "sun_at_sunset");
  const sun = t(lang, `sun_np_${ev}` as "sun_np_sunset");
  return t(lang, offset < 0 ? "sun_rule_before" : "sun_rule_after", { min: String(Math.abs(offset)), sun });
}
