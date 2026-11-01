// Project the day bar's resolved spans onto one 24-hour or two concentric 12-hour rings.
import type { BarSpan } from "./components/day-bar";

export interface RadialSegment {
  /** Original span, retaining its label, colour and true endpoint metadata. */
  source: BarSpan;
  /** Absolute minutes of the visible piece; markers have equal start/end. */
  start: number;
  end: number;
  /** Fraction of a clockwise turn from the top of this ring. */
  offset: number;
  /** Fraction of a turn occupied by this piece; zero for a one-shot marker. */
  fraction: number;
  /** In double mode, 0 is 00:00–12:00 (inner), 1 is 12:00–24:00 (outer). */
  ring: 0 | 1;
}

const DAY = 1440;
const HALF_DAY = DAY / 2;

export function radialSegments(spans: readonly BarSpan[], double = false): RadialSegment[] {
  const period = double ? HALF_DAY : DAY;
  const out: RadialSegment[] = [];
  for (const source of spans) {
    if (source.ignored || !Number.isFinite(source.start) || !Number.isFinite(source.end)) continue;
    if (source.marker) {
      if (source.start < 0 || source.start >= DAY) continue;
      const ring = double && source.start >= HALF_DAY ? 1 : 0;
      out.push({ source, start: source.start, end: source.start,
        offset: (source.start - ring * period) / period, fraction: 0, ring });
      continue;
    }
    const start = Math.max(0, source.start);
    const end = Math.min(DAY, source.end);
    if (end <= start) continue;
    const rings: (0 | 1)[] = double ? [0, 1] : [0];
    for (const ring of rings) {
      const ringStart = ring * period;
      const pieceStart = Math.max(start, ringStart);
      const pieceEnd = Math.min(end, ringStart + period);
      if (pieceEnd <= pieceStart) continue;
      out.push({ source, start: pieceStart, end: pieceEnd,
        offset: (pieceStart - ringStart) / period,
        fraction: (pieceEnd - pieceStart) / period, ring });
    }
  }
  return out;
}

/** Real endpoints: noon ends on the inner ring and starts on the outer ring. */
export function radialPosition(minute: number, double = false, end = false): { x: number; y: number } {
  const period = double ? HALF_DAY : DAY;
  const ring = double && (minute > HALF_DAY || (minute === HALF_DAY && !end)) ? 1 : 0;
  const radius = double && ring === 0 ? 78 : 112;
  const angle = (minute - ring * period) / period * 2 * Math.PI - Math.PI / 2;
  return { x: 160 + radius * Math.cos(angle), y: 160 + radius * Math.sin(angle) };
}

type DialRect = { left: number; top: number; width: number; height: number };
const turnAt = (x: number, y: number, r: DialRect): number =>
  ((Math.atan2(y - r.top - r.height / 2, x - r.left - r.width / 2) + Math.PI / 2) / (2 * Math.PI) + 1) % 1;

export function radialPointerMinute(x: number, y: number, r: DialRect, double = false): number {
  const distance = Math.hypot((x - r.left - r.width / 2) * 320 / r.width, (y - r.top - r.height / 2) * 320 / r.height);
  return turnAt(x, y, r) * (double ? HALF_DAY : DAY) + (double && distance >= 95 ? HALF_DAY : 0);
}

/** Signed displacement across midnight; changing rings never jumps twelve hours. */
export function radialDelta(x0: number, y0: number, x: number, y: number, r: DialRect, double = false): number {
  const turns = turnAt(x, y, r) - turnAt(x0, y0, r);
  return (turns > .5 ? turns - 1 : turns < -.5 ? turns + 1 : turns) * (double ? HALF_DAY : DAY);
}
