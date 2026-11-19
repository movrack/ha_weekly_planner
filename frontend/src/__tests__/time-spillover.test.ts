import { describe, expect, it } from "vitest";
import { spillover } from "../time";
import type { Slot } from "../types";

const sl = (start: string, end?: string): Slot => ({ id: start, start: { time: start }, end: end ? { time: end } : undefined } as any);

describe("spillover", () => {
  it("takes a fixed end not after a fixed start, before noon", () => {
    expect(spillover([sl("22:00", "06:00")]).map((x) => x.end)).toEqual([360]);
    expect(spillover([sl("08:00", "08:00")]).map((x) => x.end)).toEqual([480]);
  });
  it("leaves out an end at noon or later, an end after the start, a sun time and a missing end", () => {
    expect(spillover([sl("20:00", "12:00")])).toEqual([]);
    expect(spillover([sl("06:00", "08:00")])).toEqual([]);
    expect(spillover([{ id: "s", start: { sun: "sunset" }, end: { time: "00:00" } } as any])).toEqual([]);
    expect(spillover([{ id: "s", start: { time: "22:00" }, end: { sun: "sunrise" } } as any])).toEqual([]);
    expect(spillover([sl("22:00")])).toEqual([]);
  });
});
