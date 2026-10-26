// Pure builder of the planned value of a day as a staircase: one horizontal step per slot in the colour of its
// label, the default value in between, risers where the value changes, and the points where the value
// really goes back to the default.

/** A slot of the day with what it sets. `end` null: a one-shot (a point, never a step). */
export interface PlannedRange {
  start: number;
  end: number | null;
  color: string;
  /** Number set by the action (null: not numeric). */
  value: number | null;
}

export interface PlannedDefault {
  color: string;
  value: number | null;
  /** Does the default label do something to the device at all? */
  active: boolean;
}

export interface Step { from: number; to: number; value: number; color: string }
export interface Riser { m: number; from: number; to: number; color: string }
/** Who is in force for a stretch of the day: the colour of its label and its number (null: not numeric). */
export interface Zone { from: number; to: number; value: number | null; color: string }
export interface Planned {
  zones: Zone[];
  steps: Step[];
  risers: Riser[];
  /** Minutes where the value returns to the default (end of a run of contiguous slots). */
  returns: number[];
}

const EPS = 0.5;

export function buildPlanned(ranges: PlannedRange[], dflt: PlannedDefault | null, span: number): Planned {
  const timed = ranges
    .filter((r) => r.end !== null)
    .map((r) => ({ ...r, end: Math.min(r.end as number, span), start: Math.max(0, r.start) }))
    .filter((r) => r.end > r.start)
    .sort((a, b) => a.start - b.start);
  // a slot never reaches into the next one
  timed.forEach((r, i) => {
    const next = timed[i + 1];
    if (next && r.end > next.start) r.end = next.start;
  });
  const zones: Zone[] = [];
  const returns: number[] = [];
  const gap = (from: number, to: number) => {
    if (dflt?.active && to - from > EPS) zones.push({ from, to, value: dflt.value, color: dflt.color });
  };
  let cursor = 0;
  timed.forEach((r, i) => {
    gap(cursor, r.start);
    zones.push({ from: r.start, to: r.end, value: r.value, color: r.color });
    const next = timed[i + 1];
    const back = r.end < span - EPS && (!next || next.start - r.end > EPS);
    if (back && dflt?.active) returns.push(r.end);
    cursor = r.end;
  });
  gap(cursor, span);
  const steps: Step[] = zones.flatMap((z) => (z.value === null ? [] : [{ from: z.from, to: z.to, value: z.value, color: z.color }]));
  const risers: Riser[] = [];
  for (let i = 1; i < steps.length; i++) {
    const a = steps[i - 1];
    const b = steps[i];
    if (Math.abs(a.to - b.from) <= EPS && Math.abs(a.value - b.value) > 1e-9) {
      risers.push({ m: b.from, from: a.value, to: b.value, color: b.color });
    }
  }
  return { zones, steps, risers, returns };
}

/* ------------------------------------------------------------------ real activity of the device */

export interface HistState { m: number; state: string; attrs: Record<string, unknown> }

const IDLE = new Set(["off", "idle", "unavailable", "unknown", "docked", ""]);
const numOf = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** Is the device really doing something in this state? */
export function isActive(domain: string, state: string, attrs: Record<string, unknown>): boolean {
  if (state === "unavailable" || state === "unknown") return false;
  switch (domain) {
    case "climate": {
      const action = attrs.hvac_action;
      if (typeof action === "string" && action !== "") return action !== "idle" && action !== "off";
      if (state === "off") return false;
      const set = numOf(attrs.temperature);
      const cur = numOf(attrs.current_temperature);
      if (set === null || cur === null) return false;
      return state === "cool" ? cur - set > 0.3 : set - cur > 0.3;
    }
    case "light": case "switch": case "fan": case "input_boolean": return state === "on";
    case "cover": return state === "opening" || state === "closing";
    case "vacuum": return state === "cleaning" || state === "returning";
    case "media_player": return state === "playing";
    default: return !IDLE.has(state);
  }
}

/** Periods [from, to] (minutes) where the device was active, from the history, up to `until` (now). */
export function activePeriods(hist: HistState[], domain: string, until: number): [number, number][] {
  const sorted = [...hist].sort((a, b) => a.m - b.m);
  const out: [number, number][] = [];
  sorted.forEach((p, i) => {
    const from = Math.max(0, p.m);
    const to = Math.min(until, i + 1 < sorted.length ? sorted[i + 1].m : until);
    if (to - from <= 0 || !isActive(domain, p.state, p.attrs)) return;
    const last = out[out.length - 1];
    if (last && Math.abs(last[1] - from) < 0.01) last[1] = to;
    else out.push([from, to]);
  });
  return out;
}

export interface Shade { from: number; to: number; color: string; value: number | null }

/** The active periods cut along the label in force: what to shade, in which colour, under which value. */
export function shadeActive(periods: [number, number][], zones: Zone[], until: number): Shade[] {
  const out: Shade[] = [];
  for (const [a, b] of periods) {
    for (const z of zones) {
      const from = Math.max(a, z.from);
      const to = Math.min(b, z.to, until);
      if (to - from > 0.01) out.push({ from, to, color: z.color, value: z.value });
    }
  }
  return out.sort((x, y) => x.from - y.from);
}
