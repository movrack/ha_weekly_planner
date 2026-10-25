import { describe, expect, it } from "vitest";
import { stepTemperature, presetLabel, filterPrograms } from "../planner";
import { clockToMinutes, minutesToClock, localMinutes, localWeekday, localDateIso, spillover } from "../time";
import type { PlannerData, Program, Slot } from "../types";

const TZ = "Europe/Brussels";

describe("warmer / colder", () => {
  it("moves by half a degree and rounds to 0.5", () => {
    expect(stepTemperature(19, 1)).toBe(19.5);
    expect(stepTemperature(19.3, -1)).toBe(19);
  });
  it("stays within the thermostat limits", () => {
    expect(stepTemperature(30, 1, 7, 30)).toBe(30);
    expect(stepTemperature(7, -1, 7, 30)).toBe(7);
  });
});

describe("server time zone", () => {
  it("uses the house zone, not the browser's", () => {
    expect(localMinutes("2026-10-26T07:00:00Z", TZ)).toBe(8 * 60);
    expect(localWeekday(new Date("2026-10-26T07:00:00Z"), TZ)).toBe(0); // Monday
    expect(localDateIso(new Date("2026-10-25T23:30:00Z"), TZ)).toBe("2026-10-26");
  });
  it("converts clock strings in 5-minute steps", () => {
    expect(clockToMinutes("07:30")).toBe(450);
    expect(minutesToClock(452)).toBe("07:30");
    expect(minutesToClock(1440)).toBe("24:00");
  });
});

describe("slots crossing midnight", () => {
  it("spill onto the next morning", () => {
    const night: Slot = { id: "n", start: { time: "22:00" }, end: { time: "06:00" }, actions: { by_type: {}, by_entity: {} } };
    expect(spillover([night])).toEqual([{ slot: night, end: 360 }]);
  });
});

describe("labels and filters", () => {
  it("translates presets", () => {
    expect(presetLabel("fr", "comfort")).toBe("Confort");
    expect(presetLabel("en", "eco")).toMatch(/eco/i);
  });
  it("filters programs by entity type", () => {
    const p = (id: string, e: string, priority = 10): Program => ({
      id, revision: 1, name: id, priority, enabled: true, reapply: true, conditions: [],
      entities: [{ entity_id: e, default: { kind: "none" } }], profiles: [],
    });
    const data = { programs: [p("b", "cover.x", 2), p("a", "climate.y", 1)] } as unknown as PlannerData;
    expect(filterPrograms(data, { filter: { types: ["climate"] } }).map((x) => x.id)).toEqual(["a"]);
    expect(filterPrograms(data, {}).map((x) => x.id)).toEqual(["a", "b"]);
  });
});

describe("spoken clock", () => {
  it("writes 22 h / 22 h 30 in French", async () => {
    const { fmtClock } = await import("../time");
    expect(fmtClock("fr", 22 * 60)).toBe("22 h");
    expect(fmtClock("fr", 8 * 60 + 30)).toBe("8 h 30");
    expect(fmtClock("en", 22 * 60)).toMatch(/^10\s?pm$/);
  });
});
