import { describe, expect, it } from "vitest";
import {
  PALETTE, actionText, allowedOf, actionValue, compatible, entityAction, hasOverride, labelUsers, labelsFor, nextColor,
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

  it("keeps only the labels whose service is allowed for the device (scenes stay)", () => {
    const data = { labels: [label("t21", temp(21)), label("mode", { kind: "service", service: "climate.set_hvac_mode" }),
      label("soir", { kind: "scene", scene: "scene.soir" })] } as PlannerData;
    const p = program();
    expect(labelsFor(hass, data, ["climate.a"], p).map((l) => l.id)).toEqual(["t21", "mode", "soir"]);
    p.entities[0].allowed_services = ["climate.set_temperature"];
    expect(labelsFor(hass, data, ["climate.a"], p).map((l) => l.id)).toEqual(["t21", "soir"]);
    expect(allowedOf(p, "climate.a")).toEqual(["climate.set_temperature"]);
    expect(allowedOf(p, "light.a")).toBeUndefined();
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

import { actionSummary } from "../labels";

describe("action summary", () => {
  it("gives the service and its main values", () => {
    expect(actionSummary(hass, "fr", temp(19))).toBe("climate.set_temperature · 19 °C");
    expect(actionSummary(hass, "fr", { kind: "service", service: "climate.set_hvac_mode", data: { hvac_mode: "heat" } })).toBe("climate.set_hvac_mode · heat");
    expect(actionSummary(hass, "fr", { kind: "scene", scene: "scene.soir" })).toBe("Soir");
  });
});

import { nowTip, sunTip } from "../components/day-bar";

describe("tooltips of the bar icons", () => {
  it("names the sun event, its offset and the resolved time", () => {
    expect(sunTip("fr", { sun: "sunset", offset: 0 }, 17 * 60 + 25)).toBe("Coucher du soleil · 17 h 25");
    expect(sunTip("fr", { sun: "sunset", offset: 30 }, 17 * 60 + 55)).toBe("Coucher du soleil + 30 min · 17 h 55");
    expect(sunTip("fr", { sun: "sunrise", offset: -15 }, 7 * 60 + 43)).toBe("Lever du soleil - 15 min · 7 h 43");
    expect(sunTip("en", { sun: "sunset" }, 17 * 60 + 25)).toBe("Sunset · 5:25 pm");
    expect(sunTip("fr", { time: "08:00" }, 480)).toBe("");
  });
  it("says now with the time", () => {
    expect(nowTip("fr", 14 * 60 + 5)).toBe("Maintenant · 14 h 05");
    expect(nowTip("en", 14 * 60 + 5)).toBe("Now · 2:05 pm");
  });
});


describe("entity-backed action values", () => {
  const sourced: Action = { kind: "service", service: "cover.set_cover_position", data: { position: 30 },
    data_sources: { position: { entity_id: "number.favorite", type: "number" } } };
  it("does not plot the stale fixed value as a future or historical target", () => {
    expect(actionValue(sourced)).toBeNull();
  });
  it("identifies the source and follows its current state in text", () => {
    const h = { ...hass, states: { ...hass.states, "number.favorite": { entity_id: "number.favorite", state: "51", last_changed: "", attributes: { friendly_name: "Favorite position" } } } } as HomeAssistant;
    expect(actionText(h, "en", sourced)).toBe("Favorite position (51)");
    h.states["number.favorite"].state = "62";
    expect(actionText(h, "en", sourced)).toBe("Favorite position (62)");
    h.states["number.favorite"].state = "unavailable";
    expect(actionText(h, "en", sourced)).toBe("Favorite position");
    expect(actionText(hass, "en", sourced)).toBe("number.favorite");
  });
  it("reads an attribute without changing the stored action", () => {
    const action: Action = { kind: "service", service: "climate.set_temperature", data_sources: {
      temperature: { entity_id: "climate.a", attribute: "temperature", type: "number" } } };
    const h = { ...hass, states: { ...hass.states, "climate.a": { ...hass.states["climate.a"], attributes: { friendly_name: "Reference", temperature: 21 } } } };
    expect(actionText(h, "en", action)).toBe("Reference · temperature (21)");
    expect(action.data).toBeUndefined();
  });
});

describe("explicit action target", () => {
  const action: Action = { kind: "service", service: "button.press", target_entity_id: "button.favorite" };
  it("allows a program device to call a different entity while preserving allowed service restrictions", () => {
    expect(compatible(hass, "cover.office", action)).toBe(true);
    expect(compatible(hass, "cover.office", action, ["cover.open_cover"])).toBe(false);
    expect(compatible(hass, "cover.office", action, ["button.press"])).toBe(true);
    expect(compatible(hass, "cover.office", { ...action, target_entity_id: "" })).toBe(false);
    expect(compatible(hass, "cover.office", { kind: "service", service: "button.press" })).toBe(false);
  });
  it("identifies the actual controlled entity and retains its name when unavailable", () => {
    const h = { ...hass, states: { ...hass.states, "button.favorite": { entity_id: "button.favorite", state: "unknown", last_changed: "", attributes: { friendly_name: "Favorite position" } } } };
    expect(actionText(h, "en", action)).toContain("Favorite position");
    expect(actionText(hass, "en", action)).toContain("button.favorite");
  });
  it("does not plot another entity's numeric command as the program device's target", () => {
    expect(actionValue({ kind: "service", service: "cover.set_cover_position", target_entity_id: "cover.other", data: { position: 51 } })).toBeNull();
  });
});


it("distinguishes new explicit empty action selection from legacy unrestricted devices", () => {
  const p = program();
  p.entities[0].allowed_services = [];
  expect(allowedOf(p, "climate.a")).toBeUndefined();
  p.entities[0].restrict_services = true;
  expect(allowedOf(p, "climate.a")).toEqual([]);
  expect(compatible(hass, "climate.a", temp(20), allowedOf(p, "climate.a"))).toBe(false);
  p.entities[0].allowed_services = ["climate.set_temperature"];
  expect(compatible(hass, "climate.a", temp(20), allowedOf(p, "climate.a"))).toBe(true);
  expect(compatible(hass, "climate.a", { kind: "service", service: "climate.set_hvac_mode" }, allowedOf(p, "climate.a"))).toBe(false);
});
