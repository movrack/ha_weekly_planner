import { describe, expect, it } from "vitest";
import { radialSegments } from "../radial";
import type { BarSpan } from "../components/day-bar";

const span = (start: number, end: number, extra: Partial<BarSpan> = {}): BarSpan => ({
  start, end, color: "#ff8000", label: "Comfort", ...extra,
});

const geometry = (spans: BarSpan[], double = false) => radialSegments(spans, double)
  .map(({ source: _source, ...piece }) => piece);

describe("daily spans projected onto radial rings", () => {
  it("keeps 24-hour positions and gaps rather than stretching slots to fill a circle", () => {
    expect(geometry([span(360, 720), span(1080, 1440)])).toEqual([
      { start: 360, end: 720, offset: .25, fraction: .25, ring: 0 },
      { start: 1080, end: 1440, offset: .75, fraction: .25, ring: 0 },
    ]);
  });

  it("splits a noon crossing into an inner morning piece and outer afternoon piece", () => {
    expect(geometry([span(540, 900)], true)).toEqual([
      { start: 540, end: 720, offset: .75, fraction: .25, ring: 0 },
      { start: 720, end: 900, offset: 0, fraction: .25, ring: 1 },
    ]);
  });

  it("places noon boundaries on only their intended ring", () => {
    expect(geometry([span(0, 720), span(720, 1440)], true)).toEqual([
      { start: 0, end: 720, offset: 0, fraction: 1, ring: 0 },
      { start: 720, end: 1440, offset: 0, fraction: 1, ring: 1 },
    ]);
  });

  it("clips day edges, including resolved overnight tails, without wrapping into another day", () => {
    expect(geometry([span(-120, 180), span(1260, 1560)], true)).toEqual([
      { start: 0, end: 180, offset: 0, fraction: .25, ring: 0 },
      { start: 1260, end: 1440, offset: .75, fraction: .25, ring: 1 },
    ]);
  });

  it("renders a full day as one full circle or two full rings", () => {
    expect(geometry([span(-1, 1500)])).toEqual([
      { start: 0, end: 1440, offset: 0, fraction: 1, ring: 0 },
    ]);
    expect(geometry([span(0, 1440)], true)).toEqual([
      { start: 0, end: 720, offset: 0, fraction: 1, ring: 0 },
      { start: 720, end: 1440, offset: 0, fraction: 1, ring: 1 },
    ]);
  });

  it("omits empty, reversed, ignored, nonfinite and wholly out-of-day spans", () => {
    const invalid = [span(0, 0), span(900, 100), span(1, 10, { ignored: "no_event" }),
      span(-100, -1), span(1440, 1500), span(NaN, 100), span(1, Infinity),
      span(-Infinity, 100), span(1, NaN)];
    expect(radialSegments(invalid)).toEqual([]);
    expect(radialSegments(invalid, true)).toEqual([]);
    expect(radialSegments([], true)).toEqual([]);
  });

  it("assigns each one-shot marker once, including exactly noon, excluding the next midnight", () => {
    const markers = [span(0, 10, { marker: true }), span(720, 730, { marker: true }),
      span(1080, 1090, { marker: true }), span(1440, 1450, { marker: true }),
      span(-1, 9, { marker: true }), span(NaN, 10, { marker: true })];
    expect(geometry(markers, true)).toEqual([
      { start: 0, end: 0, offset: 0, fraction: 0, ring: 0 },
      { start: 720, end: 720, offset: 0, fraction: 0, ring: 1 },
      { start: 1080, end: 1080, offset: .5, fraction: 0, ring: 1 },
    ]);
    expect(geometry([markers[1]])).toEqual([
      { start: 720, end: 720, offset: .5, fraction: 0, ring: 0 },
    ]);
  });

  it("keeps arbitrary typed minutes without rounding them to a drag step", () => {
    const [piece] = radialSegments([span(397, 449)]);
    expect(piece.start).toBe(397);
    expect(piece.end).toBe(449);
    expect(piece.offset).toBeCloseTo(397 / 1440);
    expect(piece.fraction).toBeCloseTo(52 / 1440);
  });

  it("does not split markers whose display-only end crosses noon or midnight", () => {
    const pieces = radialSegments([span(719, 729, { marker: true }),
      span(1439, 1449, { marker: true })], true);
    expect(pieces).toHaveLength(2);
    expect(pieces[0]).toMatchObject({ start: 719, end: 719, ring: 0, fraction: 0 });
    expect(pieces[1]).toMatchObject({ start: 1439, end: 1439, ring: 1, fraction: 0 });
    expect(pieces[0].offset).toBeCloseTo(719 / 720);
    expect(pieces[1].offset).toBeCloseTo(719 / 720);
  });

  it("preserves source identity, colour, label and solar endpoint references without mutating inputs", () => {
    const startSpec = { sun: "sunrise", offset: -30 } as const;
    const endSpec = { sun: "sunset", offset: 15 } as const;
    const source = span(600, 900, { color: "#123456", label: "Solar", startSpec, endSpec,
      startSun: "up", endSun: "down", slotId: "slot-a" });
    const before = structuredClone(source);
    const pieces = radialSegments([source], true);
    expect(pieces).toHaveLength(2);
    for (const piece of pieces) {
      expect(piece.source).toBe(source);
      expect(piece.source.color).toBe("#123456");
      expect(piece.source.label).toBe("Solar");
      expect(piece.source.startSpec).toBe(startSpec);
      expect(piece.source.endSpec).toBe(endSpec);
    }
    expect(source).toEqual(before);
  });
});
