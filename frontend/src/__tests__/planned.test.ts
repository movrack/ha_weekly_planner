import { describe, expect, it } from "vitest";
import { buildPlanned } from "../planned";

const Y = "yellow", O = "orange", R = "red", B = "blue";
const dflt = { color: B, value: 15, active: true };

describe("planned staircase", () => {
  it("contiguous slots then back to the default (the owner's example)", () => {
    const p = buildPlanned([
      { start: 525, end: 720, color: Y, value: 18 },
      { start: 720, end: 840, color: O, value: 19 },
      { start: 840, end: 1020, color: R, value: 20 },
    ], dflt, 1440);
    expect(p.steps).toEqual([
      { from: 0, to: 525, value: 15, color: B },
      { from: 525, to: 720, value: 18, color: Y },
      { from: 720, to: 840, value: 19, color: O },
      { from: 840, to: 1020, value: 20, color: R },
      { from: 1020, to: 1440, value: 15, color: B },
    ]);
    expect(p.risers.map((r) => [r.m, r.from, r.to, r.color])).toEqual([
      [525, 15, 18, Y], [720, 18, 19, O], [840, 19, 20, R], [1020, 20, 15, B],
    ]);
    expect(p.returns).toEqual([1020]);
  });

  it("a gap between two slots goes back to the default and returns there", () => {
    const p = buildPlanned([
      { start: 480, end: 600, color: Y, value: 18 },
      { start: 720, end: 780, color: Y, value: 18 },
    ], dflt, 1440);
    expect(p.returns).toEqual([600, 780]);
    expect(p.steps.filter((s) => s.color === B).map((s) => [s.from, s.to])).toEqual([[0, 480], [600, 720], [780, 1440]]);
  });

  it("a one-shot is a point: no step, no return", () => {
    const p = buildPlanned([{ start: 600, end: null, color: Y, value: 18 }], dflt, 1440);
    expect(p.steps).toEqual([{ from: 0, to: 1440, value: 15, color: B }]);
    expect(p.risers).toEqual([]);
    expect(p.returns).toEqual([]);
  });

  it("without a default there is no baseline, no riser across a gap and no return", () => {
    const p = buildPlanned([
      { start: 480, end: 600, color: Y, value: 18 },
      { start: 720, end: 780, color: O, value: 19 },
    ], null, 1440);
    expect(p.steps).toEqual([
      { from: 480, to: 600, value: 18, color: Y },
      { from: 720, to: 780, value: 19, color: O },
    ]);
    expect(p.risers).toEqual([]);
    expect(p.returns).toEqual([]);
  });

  it("a default that is not numeric still marks the return but draws no baseline", () => {
    const p = buildPlanned([{ start: 480, end: 600, color: Y, value: 18 }], { color: B, value: null, active: true }, 1440);
    expect(p.steps).toEqual([{ from: 480, to: 600, value: 18, color: Y }]);
    expect(p.returns).toEqual([600]);
  });

  it("a slot ending at 24:00 has no return; same value in a row has no riser", () => {
    const p = buildPlanned([
      { start: 1200, end: 1320, color: Y, value: 18 },
      { start: 1320, end: 1440, color: Y, value: 18 },
    ], dflt, 1440);
    expect(p.returns).toEqual([]);
    expect(p.risers.map((r) => r.m)).toEqual([1200]);
  });

  it("a slot with a non-numeric action leaves a hole", () => {
    const p = buildPlanned([{ start: 480, end: 600, color: Y, value: null }], dflt, 1440);
    expect(p.steps.map((s) => [s.from, s.to])).toEqual([[0, 480], [600, 1440]]);
  });
});

import { activePeriods, buildPlanned as bp, isActive, shadeActive } from "../planned";

describe("is the device active", () => {
  it("climate: hvac_action first", () => {
    expect(isActive("climate", "heat", { hvac_action: "heating" })).toBe(true);
    expect(isActive("climate", "heat", { hvac_action: "idle", temperature: 20, current_temperature: 15 })).toBe(false);
    expect(isActive("climate", "heat", { hvac_action: "cooling" })).toBe(true);
    expect(isActive("climate", "off", { hvac_action: "off" })).toBe(false);
  });
  it("climate without hvac_action: set minus measured above 0.3", () => {
    expect(isActive("climate", "heat", { temperature: 18, current_temperature: 17.5 })).toBe(true);
    expect(isActive("climate", "heat", { temperature: 18, current_temperature: 17.8 })).toBe(false);
    expect(isActive("climate", "heat", { temperature: 18, current_temperature: 19 })).toBe(false);
    expect(isActive("climate", "cool", { temperature: 22, current_temperature: 23 })).toBe(true);
    expect(isActive("climate", "cool", { temperature: 22, current_temperature: 21 })).toBe(false);
    expect(isActive("climate", "off", { temperature: 18, current_temperature: 10 })).toBe(false);
    expect(isActive("climate", "heat", {})).toBe(false);
  });
  it("on/off devices, covers, vacuums, players, others", () => {
    expect(isActive("switch", "on", {})).toBe(true);
    expect(isActive("light", "off", {})).toBe(false);
    expect(isActive("cover", "closing", {})).toBe(true);
    expect(isActive("cover", "open", {})).toBe(false);
    expect(isActive("vacuum", "cleaning", {})).toBe(true);
    expect(isActive("vacuum", "returning", {})).toBe(true);
    expect(isActive("vacuum", "docked", {})).toBe(false);
    expect(isActive("media_player", "playing", {})).toBe(true);
    expect(isActive("media_player", "paused", {})).toBe(false);
    expect(isActive("water_heater", "performance", {})).toBe(true);
    for (const s of ["off", "idle", "unavailable", "unknown", "docked"]) expect(isActive("water_heater", s, {})).toBe(false);
  });
});

describe("shading under the planned line", () => {
  const plan = bp([{ start: 720, end: 1080, color: Y, value: 18 }], dflt, 1440);
  const h = (m: number, temperature: number, current: number) => ({ m, state: "heat", attrs: { temperature, current_temperature: current } });

  it("owner's example: active only 13:00-13:30, yellow, up to now (14:00)", () => {
    const hist = [h(0, 15, 15), h(780, 18, 17), h(810, 18, 19)];
    const periods = activePeriods(hist, "climate", 840);
    expect(periods).toEqual([[780, 810]]);
    expect(shadeActive(periods, plan.zones, 840)).toEqual([{ from: 780, to: 810, color: Y, value: 18 }]);
  });
  it("never goes past now", () => {
    const periods = activePeriods([{ m: 0, state: "on", attrs: {} }], "switch", 600);
    expect(periods).toEqual([[0, 600]]);
    expect(shadeActive(periods, plan.zones, 600).slice(-1)[0].to).toBe(600);
  });
  it("cuts a period along the label in force", () => {
    const shade = shadeActive([[660, 780]], plan.zones, 900);
    expect(shade).toEqual([
      { from: 660, to: 720, color: B, value: 15 },
      { from: 720, to: 780, color: Y, value: 18 },
    ]);
  });
  it("vacuum: cleaning then returning is one period", () => {
    const hist = [
      { m: 0, state: "docked", attrs: {} }, { m: 540, state: "cleaning", attrs: {} },
      { m: 600, state: "returning", attrs: {} }, { m: 615, state: "docked", attrs: {} },
    ];
    expect(activePeriods(hist, "vacuum", 700)).toEqual([[540, 615]]);
  });
  it("no history, nothing active", () => {
    expect(activePeriods([], "climate", 600)).toEqual([]);
    expect(shadeActive([], plan.zones, 600)).toEqual([]);
  });
});
