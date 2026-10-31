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

import { activePeriods, isActive, shadeActive } from "../planned";

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
    expect(isActive("cover", "opening", {})).toBe(true);
    expect(isActive("cover", "open", { current_position: 40 })).toBe(true);
    expect(isActive("cover", "closed", { current_position: 0 })).toBe(false);
    for (const s of ["unavailable", "unknown"]) for (const d of ["cover", "light", "switch", "climate", "vacuum"]) {
      expect(isActive(d, s, { hvac_action: "heating" })).toBe(false);
    }
    expect(isActive("vacuum", "cleaning", {})).toBe(true);
    expect(isActive("vacuum", "returning", {})).toBe(true);
    expect(isActive("vacuum", "docked", {})).toBe(false);
    expect(isActive("media_player", "playing", {})).toBe(true);
    expect(isActive("media_player", "paused", {})).toBe(false);
    expect(isActive("water_heater", "performance", {})).toBe(true);
    for (const s of ["off", "idle", "unavailable", "unknown", "docked"]) expect(isActive("water_heater", s, {})).toBe(false);
  });
});

describe("active periods and their shading", () => {
  const h = (m: number, temperature: number, current: number) => ({ m, state: "heat", attrs: { temperature, current_temperature: current } });
  const st = (m: number, state: string, attrs: Record<string, unknown> = {}) => ({ m, state, attrs });

  it("owner's example: climate active only 13:00-13:30, up to now (14:00)", () => {
    const periods = activePeriods([h(0, 15, 15), h(780, 18, 17), h(810, 18, 19)], "climate", 840);
    expect(periods).toEqual([[780, 810]]);
    expect(shadeActive(periods, 840)).toEqual([{ from: 780, to: 810 }]);
  });
  it("climate with hvac_action heating all day is shaded even without any planned setting", () => {
    const periods = activePeriods([st(0, "heat", { hvac_action: "heating" })], "climate", 600);
    expect(shadeActive(periods, 600)).toEqual([{ from: 0, to: 600 }]);
  });
  it("still active now: the period stops at now, never later", () => {
    const periods = activePeriods([st(0, "off"), st(500, "on")], "switch", 600);
    expect(periods).toEqual([[500, 600]]);
    expect(shadeActive([[500, 900]], 600)).toEqual([{ from: 500, to: 600 }]);
  });
  it("a period started the day before (history point before midnight) starts at 0", () => {
    const periods = activePeriods([st(-90, "on"), st(60, "off")], "light", 600);
    expect(periods).toEqual([[0, 60]]);
    expect(shadeActive([[-30, 60]], 600)).toEqual([{ from: 0, to: 60 }]);
  });
  it("cover: open and moving count, closed does not", () => {
    const hist = [st(0, "closed"), st(480, "opening"), st(481, "open", { current_position: 100 }),
      st(1200, "closing"), st(1201, "closed", { current_position: 0 })];
    expect(activePeriods(hist, "cover", 1300)).toEqual([[480, 1201]]);
  });
  it("cover moving for seconds only is still one (short) period", () => {
    const hist = [st(0, "open"), st(600, "closing"), st(600.3, "closed")];
    expect(activePeriods(hist, "cover", 700)).toEqual([[0, 600.3]]);
    expect(activePeriods([st(0, "closed"), st(600, "opening"), st(600.3, "closed")], "cover", 700)).toEqual([[600, 600.3]]);
  });
  it("unavailable or unknown in the middle cuts the period", () => {
    const hist = [st(0, "on"), st(100, "unavailable"), st(130, "on"), st(200, "unknown"), st(260, "off")];
    expect(activePeriods(hist, "switch", 600)).toEqual([[0, 100], [130, 200]]);
  });
  it("light: on periods merged across attribute-only changes", () => {
    const hist = [st(0, "off"), st(300, "on", { brightness: 50 }), st(320, "on", { brightness: 200 }), st(400, "off")];
    expect(activePeriods(hist, "light", 600)).toEqual([[300, 400]]);
  });
  it("vacuum: cleaning then returning is one period", () => {
    const hist = [st(0, "docked"), st(540, "cleaning"), st(600, "returning"), st(615, "docked")];
    expect(activePeriods(hist, "vacuum", 700)).toEqual([[540, 615]]);
  });
  it("unsorted history is sorted first", () => {
    expect(activePeriods([st(200, "off"), st(100, "on")], "switch", 600)).toEqual([[100, 200]]);
  });
  it("future day or no history: nothing active", () => {
    expect(activePeriods([st(0, "on")], "switch", 0)).toEqual([]);
    expect(activePeriods([], "climate", 600)).toEqual([]);
    expect(shadeActive([], 600)).toEqual([]);
  });
});
