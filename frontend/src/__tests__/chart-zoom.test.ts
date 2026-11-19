import { describe, expect, it } from "vitest";
import { minuteAt, tickStep, ticksIn, zoomTimeline } from "../chart-zoom";

const SPAN = 1440;

describe("zoomTimeline / minuteAt", () => {
  it("a scale of zero or less leaves the length alone", () => {
    for (const scale of [0, -2]) {
      expect(zoomTimeline({ from: 100, to: 400 }, scale, 250, 0.5, 5000)).toEqual({ from: 100, to: 400 });
    }
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
    expect(tickStep(40, 8)).toBe(5); // a count of labels equal to the maximum is accepted
  });
  it("lists the multiples of the step inside the window", () => {
    expect(ticksIn({ from: 0, to: SPAN }, 180)).toEqual([0, 180, 360, 540, 720, 900, 1080, 1260, 1440]);
    expect(ticksIn({ from: 500, to: 620 }, 30)).toEqual([510, 540, 570, 600]);
    expect(ticksIn({ from: 510, to: 570 }, 30)).toEqual([510, 540, 570]);
  });
});
