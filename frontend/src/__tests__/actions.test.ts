import { describe, expect, it } from "vitest";
import {
  actionChoices, daysText, groupSlots, nb, readAct, readDefault, scenesOf, selectedChoice, shiftSpec, specText,
  writeAct, writeDefault, writeGroups,
} from "../actions";
import type { HomeAssistant, Mode, Profile, Program, Slot } from "../types";

const modes: Mode[] = [
  { id: "climate_night", type: "climate", name: "Nuit", color: "#777", value: { kind: "temperature", temperature: 16 }, exceptions: {} },
  { id: "cover_closed", type: "cover", name: "Fermé", color: "#444", value: { kind: "close" }, exceptions: {} },
];

const slot = (id: string, temp: number, start = "08:45"): Slot => ({
  id, start: { time: start }, end: { time: "17:00" }, conditions: [],
  actions: { by_type: {}, by_entity: { "climate.x": { kind: "temperature", temperature: temp } } },
});

const profile = (days: Slot[][]): Profile => ({ id: "p", name: "P", days: [...days, ...Array(7 - days.length).fill([])] });
const minutes = (s: { time?: string }) => Number((s.time ?? "0:0").split(":")[0]) * 60;
const all = () => true;

describe("grouping the same slot across days", () => {
  it("merges identical slots and keeps their ids", () => {
    const g = groupSlots(profile([[slot("a", 18)], [slot("b", 18)], [slot("c", 19)]]), all, minutes as never);
    expect(g).toHaveLength(2);
    expect(g[0].days).toEqual([0, 1]);
    expect(g[0].ids).toEqual({ 0: "a", 1: "b" });
  });

  it("splits back to one slot per day, new days get new ids", () => {
    const p = profile([[slot("a", 18)], [slot("b", 18)]]);
    const [g] = groupSlots(p, all, minutes as never);
    g.days = [0, 2, 4];
    const out = writeGroups(p, [g], all, minutes as never);
    expect(out.days[0][0].id).toBe("a");
    expect(out.days[1]).toEqual([]);
    expect(out.days[2][0].id).not.toBe("a");
    expect(out.days[4]).toHaveLength(1);
  });

  it("leaves other slots alone", () => {
    const other: Slot = { ...slot("z", 20), actions: { by_type: {}, by_entity: { "climate.y": { kind: "temperature", temperature: 20 } } } };
    const p = profile([[slot("a", 18), other]]);
    const only = (s: Slot) => "climate.x" in s.actions.by_entity;
    const groups = groupSlots(p, only, minutes as never);
    const out = writeGroups(p, groups, only, minutes as never);
    expect(out.days[0].map((s) => s.id).sort()).toEqual(["a", "z"]);
  });
});

describe("actions of a slot", () => {
  const program = { entities: [{ entity_id: "cover.v" }] } as unknown as Program;
  it("keeps a common mode as a mode when the device is alone of its type", () => {
    const s: Slot = { id: "s", start: { time: "04:00" }, conditions: [], actions: { by_type: {}, by_entity: {} } };
    const w = writeAct(s, program, "cover.v", { sp: { kind: "close" }, modeId: "cover_closed" });
    expect(w.actions.by_type.cover).toBe("cover_closed");
    expect(readAct(w, "cover.v", modes)?.modeId).toBe("cover_closed");
  });

  it("writes a direct setpoint when several devices share the type", () => {
    const two = { entities: [{ entity_id: "cover.v" }, { entity_id: "cover.w" }] } as unknown as Program;
    const s: Slot = { id: "s", start: { time: "04:00" }, conditions: [], actions: { by_type: {}, by_entity: {} } };
    const w = writeAct(s, two, "cover.v", { sp: { kind: "close" }, modeId: "cover_closed" });
    expect(w.actions.by_type).toEqual({});
    expect(w.actions.by_entity["cover.v"]).toEqual({ kind: "close" });
  });

  it("reads and writes the default", () => {
    const e = { entity_id: "climate.x", default: { kind: "setpoint" as const, value: { kind: "temperature", temperature: 15 } } };
    expect(readDefault(e, modes).sp).toEqual({ kind: "temperature", temperature: 15 });
    expect(writeDefault({ sp: { kind: "off" }, special: "previous" })).toEqual({ kind: "previous" });
    expect(writeDefault({ sp: { kind: "close" }, modeId: "cover_closed" })).toEqual({ kind: "mode", value: "cover_closed" });
  });
});

describe("choices per device", () => {
  const hass = {
    states: {
      "climate.x": { entity_id: "climate.x", state: "heat", attributes: { preset_modes: ["none", "eco", "comfort"], hvac_modes: ["heat", "off"], temperature: 19, preset_temperatures: { eco: 17 } } },
      "scene.soir": { entity_id: "scene.soir", state: "x", attributes: { friendly_name: "Soir", entity_id: ["climate.x", "light.a"] } },
      "scene.autre": { entity_id: "scene.autre", state: "x", attributes: { entity_id: ["light.b"] } },
    },
  } as unknown as HomeAssistant;

  it("lists own modes, then scenes, then common modes", () => {
    const groups = actionChoices(hass, "fr", modes, "climate.x").map((c) => c.group);
    expect(groups.indexOf("own")).toBeLessThan(groups.indexOf("scene"));
    expect(groups.indexOf("scene")).toBeLessThan(groups.indexOf("common"));
    expect(groups.filter((g) => g === "scene")).toHaveLength(1);
  });

  it("finds the scenes containing an entity only", () => {
    expect(scenesOf(hass, "climate.x").map((s) => s.id)).toEqual(["scene.soir"]);
    expect(scenesOf(hass, "light.b").map((s) => s.id)).toEqual(["scene.autre"]);
  });

  it("selects a temperature choice for any temperature", () => {
    const choices = actionChoices(hass, "fr", modes, "climate.x");
    expect(selectedChoice(choices, { sp: { kind: "temperature", temperature: 21 } })?.id).toBe("temperature");
    expect(selectedChoice(choices, { sp: { kind: "temperature", temperature: 16 }, modeId: "climate_night" })?.id).toBe("mode:climate_night");
  });

  it("offers switch on and off", () => {
    const sw = { states: { "switch.s": { entity_id: "switch.s", state: "on", attributes: {} } } } as unknown as HomeAssistant;
    expect(actionChoices(sw, "fr", [], "switch.s").map((c) => c.id)).toEqual(["on", "off"]);
  });
});

describe("texts", () => {
  it("shifts a time by 15 minutes or a sun offset", () => {
    expect(shiftSpec({ time: "08:45" }, 15)).toEqual({ time: "09:00" });
    expect(shiftSpec({ time: "00:00" }, -15)).toEqual({ time: "00:00" });
    expect(shiftSpec({ sun: "sunset", offset: 0 }, 15)).toEqual({ sun: "sunset", offset: 15 });
  });

  it("uses non-breaking spaces in times", () => {
    expect(specText("fr", { time: "08:45" })).toBe(nb("8 h 45"));
    expect(specText("fr", { time: "08:45" })).not.toContain(" ");
  });

  it("writes the days short", () => {
    const short = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    expect(daysText("fr", short, [0, 1, 2, 3, 4])).toBe("Lun–Ven");
    expect(daysText("fr", short, [5, 6])).toBe("W-E");
    expect(daysText("fr", short, [0, 1, 4])).toBe("Lun Mar Ven");
  });
});
