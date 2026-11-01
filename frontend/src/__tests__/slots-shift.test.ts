import { describe, expect, it } from "vitest";
import { shiftTimeSpec } from "../slots";

const hass: any = { config: { time_zone: "UTC" }, states: {} };

describe("shiftTimeSpec", () => {
  it("shifts fixed times", () => expect(shiftTimeSpec(hass, { time: "08:00" }, 60)).toEqual({ time: "09:00" }));
  it("keeps sun in range", () => expect(shiftTimeSpec(hass, { sun: "sunset", offset: 10 }, 100)).toEqual({ sun: "sunset", offset: 110 }));
  it("converts to a fixed time beyond 240", () => {
    expect(shiftTimeSpec(hass, { sun: "sunset", offset: 0, random_minutes: 5 }, 340)).toEqual({ time: "24:00", random_minutes: 5 });
    expect(shiftTimeSpec(hass, { sun: "sunrise", offset: 0 }, 300)).toEqual({ time: "12:00" });
  });
  it("keeps the exact minute of a solar or typed time (no 5-minute step)", () => {
    const sun: any = { config: { time_zone: "UTC" }, states: { "sun.sun": { attributes: { next_setting: "2026-11-02T16:17:12+00:00" } } } };
    expect(shiftTimeSpec(sun, { sun: "sunset", offset: 230 }, 15)).toEqual({ time: "20:22" });
    expect(shiftTimeSpec(hass, { time: "15:32" }, 15)).toEqual({ time: "15:47" });
    expect(shiftTimeSpec(hass, { time: "23:52" }, 15)).toEqual({ time: "24:00" });
  });
});
