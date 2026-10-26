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
export interface Planned {
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
  const base = dflt?.active && dflt.value !== null ? dflt : null;
  const steps: Step[] = [];
  const returns: number[] = [];
  const gap = (from: number, to: number) => {
    if (base && to - from > EPS) steps.push({ from, to, value: base.value as number, color: base.color });
  };
  let cursor = 0;
  timed.forEach((r, i) => {
    gap(cursor, r.start);
    if (r.value !== null) steps.push({ from: r.start, to: r.end, value: r.value, color: r.color });
    const next = timed[i + 1];
    const back = r.end < span - EPS && (!next || next.start - r.end > EPS);
    if (back && dflt?.active) returns.push(r.end);
    cursor = r.end;
  });
  gap(cursor, span);
  const risers: Riser[] = [];
  for (let i = 1; i < steps.length; i++) {
    const a = steps[i - 1];
    const b = steps[i];
    if (Math.abs(a.to - b.from) <= EPS && Math.abs(a.value - b.value) > 1e-9) {
      risers.push({ m: b.from, from: a.value, to: b.value, color: b.color });
    }
  }
  return { steps, risers, returns };
}
