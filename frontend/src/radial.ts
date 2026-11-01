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
