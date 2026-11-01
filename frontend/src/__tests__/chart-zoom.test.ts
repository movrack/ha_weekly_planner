import { describe, expect, it } from "vitest";
import {
  MIN_WINDOW, clampWindow, isFullDay, minuteAt, normalise, panWindow, pinchWindow, rangeToWindow, tickStep, ticksIn, zoomAround,
} from "../chart-zoom";

const SPAN = 1440;

describe("clampWindow", () => {
  it("keeps a good window", () => expect(clampWindow({ from: 100, to: 400 }, SPAN)).toEqual({ from: 100, to: 400 }));
  it("shifts, never squeezes, a window past the edges", () => {
    expect(clampWindow({ from: -50, to: 250 }, SPAN)).toEqual({ from: 0, to: 300 });
    expect(clampWindow({ from: 1300, to: 1600 }, SPAN)).toEqual({ from: 1140, to: 1440 });
  });
  it("enforces the minimum window and the day length", () => {
    expect(clampWindow({ from: 600, to: 610 }, SPAN)).toEqual({ from: 600, to: 600 + MIN_WINDOW });
    expect(clampWindow({ from: 1430, to: 1435 }, SPAN)).toEqual({ from: 1410, to: 1440 });
    expect(clampWindow({ from: -100, to: 2000 }, SPAN)).toEqual({ from: 0, to: SPAN });
  });
  it("works on a 23 h day", () => expect(clampWindow({ from: 1300, to: 1500 }, 1380)).toEqual({ from: 1180, to: 1380 }));
});

describe("normalise / isFullDay", () => {
  it("returns null for the whole day", () => {
    expect(isFullDay({ from: 0, to: SPAN }, SPAN)).toBe(true);
    expect(normalise({ from: -5, to: 2000 }, SPAN)).toBeNull();
    expect(normalise({ from: 60, to: 120 }, SPAN)).toEqual({ from: 60, to: 120 });
  });
});

describe("zoomAround / pinchWindow", () => {
  it("keeps the anchor under the same fraction", () => {
    const w = zoomAround({ from: 0, to: SPAN }, 2, 720, 0.5, SPAN);
    expect(w).toEqual({ from: 360, to: 1080 });
    const w2 = zoomAround({ from: 360, to: 1080 }, 2, minuteAt({ from: 360, to: 1080 }, 0.25), 0.25, SPAN);
    expect(minuteAt(w2, 0.25)).toBeCloseTo(minuteAt({ from: 360, to: 1080 }, 0.25));
    expect(w2.to - w2.from).toBeCloseTo(360);
  });
  it("zooming out past the day gives the day; zooming in stops at the minimum", () => {
    expect(zoomAround({ from: 100, to: 200 }, 0.01, 150, 0.5, SPAN)).toEqual({ from: 0, to: SPAN });
    const w = zoomAround({ from: 600, to: 700 }, 100, 650, 0.5, SPAN);
    expect(w.to - w.from).toBe(MIN_WINDOW);
  });
  it("pinch follows the ratio of finger distances and a moving centre pans", () => {
    const start = { from: 0, to: SPAN };
    expect(pinchWindow(start, 100, 200, 720, 0.5, SPAN)).toEqual({ from: 360, to: 1080 });
    // fingers apart by the same distance, centre moved from 0.5 to 0.25: the window slides right
    const slid = pinchWindow({ from: 360, to: 1080 }, 100, 100, 720, 0.25, SPAN);
    expect(slid).toEqual({ from: 540, to: 1260 });
  });
  it("ignores a degenerate distance", () => {
    expect(pinchWindow({ from: 10, to: 100 }, 0, 50, 50, 0.5, SPAN)).toEqual({ from: 10, to: 100 });
    expect(pinchWindow({ from: 10, to: 100 }, 50, 0, 50, 0.5, SPAN)).toEqual({ from: 10, to: 100 });
  });
});

describe("panWindow / rangeToWindow / minuteAt", () => {
  it("pans and stops at the edges", () => {
    expect(panWindow({ from: 100, to: 200 }, 50, SPAN)).toEqual({ from: 150, to: 250 });
    expect(panWindow({ from: 100, to: 200 }, -500, SPAN)).toEqual({ from: 0, to: 100 });
    expect(panWindow({ from: 1300, to: 1400 }, 500, SPAN)).toEqual({ from: 1340, to: 1440 });
  });
  it("turns two minutes in any order into a window, at least 30 min wide", () => {
    expect(rangeToWindow(600, 300, SPAN)).toEqual({ from: 300, to: 600 });
    expect(rangeToWindow(600, 605, SPAN)).toEqual({ from: 587.5, to: 617.5 });
    expect(rangeToWindow(2, 3, SPAN)).toEqual({ from: 0, to: 30 });
    expect(rangeToWindow(-100, 5000, SPAN)).toEqual({ from: 0, to: SPAN });
  });
  it("maps a fraction to a minute, clamped", () => {
    expect(minuteAt({ from: 100, to: 300 }, 0.5)).toBe(200);
    expect(minuteAt({ from: 100, to: 300 }, -1)).toBe(100);
    expect(minuteAt({ from: 100, to: 300 }, 2)).toBe(300);
  });
});

describe("ticks", () => {
  it("steps follow the window length: 3 h for a day, down to 5 min", () => {
    expect(tickStep(1440)).toBe(180);
    expect(tickStep(1380)).toBe(180);
    expect(tickStep(600)).toBe(120);
    expect(tickStep(240)).toBe(30);
    expect(tickStep(120)).toBe(15);
    expect(tickStep(30)).toBe(5);
    expect(tickStep(99999)).toBe(360);
  });
  it("lists the multiples of the step inside the window", () => {
    expect(ticksIn({ from: 0, to: SPAN }, 180)).toEqual([0, 180, 360, 540, 720, 900, 1080, 1260, 1440]);
    expect(ticksIn({ from: 500, to: 620 }, 30)).toEqual([510, 540, 570, 600]);
    expect(ticksIn({ from: 510, to: 570 }, 30)).toEqual([510, 540, 570]);
  });
});
