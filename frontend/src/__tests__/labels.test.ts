import { describe, expect, it } from "vitest";
import {
  PALETTE, actionText, actionValue, compatible, entityAction, hasOverride, labelUsers, labelsFor, nextColor,
} from "../labels";
import type { Action, HomeAssistant, Label, PlannerData, Program } from "../types";

const temp = (n: number): Action => ({ kind: "service", service: "climate.set_temperature", data: { temperature: n } });
const label = (id: string, action: Action, color = "#111111"): Label => ({ id, name: id, color, action });

const hass = {
  states: {
    "climate.a": { entity_id: "climate.a", state: "heat", attributes: {} },
    "light.a": { entity_id: "light.a", state: "on", attributes: {} },
    "scene.soir": { entity_id: "scene.soir", state: "x", attributes: { friendly_name: "Soir", entity_id: ["climate.a"] } },
  },
  services: {
    climate: { set_temperature: { target: { entity: { domain: "climate" } } } },
    light: { turn_on: { target: { entity: { domain: "light" } } } },
    homeassistant: { turn_off: { target: { entity: {} } } },
  },
} as unknown as HomeAssistant;

const program = (overrides: Record<string, Action> = {}): Program => ({
  id: "p", revision: 1, name: "Bureau", priority: 10, enabled: true, reapply: true, conditions: [], profiles: [{
    id: "base", name: "Base", days: [[{ id: "s", start: { time: "08:00" }, end: { time: "10:00" }, label: "t21" }], [], [], [], [], [], []],
  }],
  entities: [{ entity_id: "climate.a", default_label: "t15", label_overrides: overrides }],
});

describe("labels offered for a device", () => {
  it("keeps the labels whose action suits the device", () => {
    const data = { labels: [label("t21", temp(21)), label("on", { kind: "service", service: "light.turn_on" })] } as PlannerData;
    expect(labelsFor(hass, data, ["climate.a"]).map((l) => l.id)).toEqual(["t21"]);
    expect(labelsFor(hass, data, ["light.a"]).map((l) => l.id)).toEqual(["on"]);
  });

  it("accepts a scene only when it contains the device", () => {
    expect(compatible(hass, "climate.a", { kind: "scene", scene: "scene.soir" })).toBe(true);
    expect(compatible(hass, "light.a", { kind: "scene", scene: "scene.soir" })).toBe(false);
  });
});

describe("what a label does to a device", () => {
  it("uses the value of the device when it has one", () => {
    const l = label("t21", temp(21));
    expect(entityAction(program(), "climate.a", l)).toEqual(temp(21));
    expect(entityAction(program({ t21: temp(24) }), "climate.a", l)).toEqual(temp(24));
    expect(hasOverride(program({ t21: temp(24) }), "climate.a", "t21")).toBe(true);
    expect(entityAction(program(), "climate.a", undefined)).toBeUndefined();
  });
});

describe("texts and values", () => {
  it("reads the number of an action", () => {
    expect(actionValue(temp(19.5))).toBe(19.5);
    expect(actionValue({ kind: "service", service: "cover.set_cover_position", data: { position: 30 } })).toBe(30);
    expect(actionValue({ kind: "service", service: "light.turn_on", data: { brightness_pct: 60 } })).toBe(60);
    expect(actionValue({ kind: "service", service: "cover.close_cover" })).toBeNull();
    expect(actionValue({ kind: "scene", scene: "scene.soir" })).toBeNull();
  });

  it("writes a short text", () => {
    expect(actionText(hass, "fr", temp(18))).toBe("18 °C");
    expect(actionText(hass, "fr", { kind: "scene", scene: "scene.soir" })).toBe("Soir");
  });
});

describe("colours and use", () => {
  it("proposes the first palette colour not used yet", () => {
    expect(PALETTE).toHaveLength(12);
    expect(new Set(PALETTE).size).toBe(12);
    expect(nextColor([])).toBe(PALETTE[0]);
    expect(nextColor([label("a", temp(1), PALETTE[0]), label("b", temp(1), PALETTE[1])])).toBe(PALETTE[2]);
  });

  it("lists the programs using a label", () => {
    const data = { programs: [program(), { ...program(), id: "q", name: "Autre", entities: [], profiles: [] }] } as unknown as PlannerData;
    expect(labelUsers(data, "t21")).toEqual(["Bureau"]);
    expect(labelUsers(data, "t15")).toEqual(["Bureau"]);
    expect(labelUsers(data, "unused")).toEqual([]);
  });
});
