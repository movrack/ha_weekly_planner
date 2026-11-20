import { describe, expect, it } from "vitest";
import { missingFields, serviceFields, startData } from "../services";

// A light's "turn on" is how a schedule changes its colour or its brightness: those fields must be offered plainly.
const light = (modes: string[], features: number) => ({
  language: "en", localize: () => "", resources: {},
  states: { "light.a": { state: "on", attributes: { supported_color_modes: modes, supported_features: features } } },
  services: { light: { turn_on: { target: { entity: { domain: "light" } }, fields: {
    transition: { selector: { number: {} }, filter: { supported_features: [32] } },
    rgb_color: { selector: { color_rgb: null }, filter: { attribute: { supported_color_modes: ["hs", "xy", "rgb", "rgbw", "rgbww"] } } },
    color_temp_kelvin: { selector: { color_temp: {} }, filter: { attribute: { supported_color_modes: ["color_temp", "hs", "xy", "rgb"] } } },
    brightness_pct: { selector: { number: { min: 0, max: 100 } }, filter: { attribute: { supported_color_modes: ["brightness", "color_temp", "hs", "xy", "rgb"] } } },
    brightness_step_pct: { selector: { number: {} }, filter: { attribute: { supported_color_modes: ["brightness", "rgb"] } } },
    additional_fields: { collapsed: true, fields: {
      color_name: { selector: { select: {} }, filter: { attribute: { supported_color_modes: ["rgb"] } } },
      hs_color: { selector: { object: {} }, filter: { attribute: { supported_color_modes: ["rgb"] } } },
      brightness: { selector: { number: {} }, filter: { attribute: { supported_color_modes: ["rgb"] } } } } } } } } },
}) as never;

describe("light: change the colour or the brightness", () => {
  it("offers the colour, the colour temperature and the brightness of a colour light, once each", () => {
    const keys = serviceFields(light(["rgb"], 36), "light.turn_on", "light.a").map((f) => f.key);
    expect(keys).toEqual(["transition", "rgb_color", "color_temp_kelvin", "brightness_pct"]);
  });

  it("offers only the brightness of a dimmable light, and nothing for an on/off one", () => {
    expect(serviceFields(light(["brightness"], 0), "light.turn_on", "light.a").map((f) => f.key)).toEqual(["brightness_pct"]);
    expect(serviceFields(light(["onoff"], 0), "light.turn_on", "light.a")).toEqual([]);
  });

  it("does not force the transition: a colour alone, a brightness alone or both are valid", () => {
    const h = light(["rgb"], 36);
    expect(serviceFields(h, "light.turn_on", "light.a").some((f) => f.required)).toBe(false);
    expect(startData(h, "light.turn_on", "light.a")).toEqual({});
    expect(missingFields(h, "light.turn_on", { rgb_color: [255, 0, 0] }, "light.a")).toEqual([]);
    expect(missingFields(h, "light.turn_on", { brightness_pct: 40 }, "light.a")).toEqual([]);
    expect(missingFields(h, "light.turn_on", { brightness_pct: 40, rgb_color: [0, 0, 255] }, "light.a")).toEqual([]);
  });

  it("asks for at least one of colour, temperature or brightness, a transition alone is not enough", () => {
    const h = light(["rgb"], 36);
    expect(missingFields(h, "light.turn_on", {}, "light.a")).toHaveLength(3);
    expect(missingFields(h, "light.turn_on", { transition: 2 }, "light.a")).toHaveLength(3);
  });

  it("accepts a value read from another entity", () => {
    const h = light(["brightness"], 0);
    expect(missingFields(h, "light.turn_on", {}, "light.a", { brightness_pct: { entity_id: "input_number.x" } })).toEqual([]);
    expect(missingFields(h, "light.turn_on", {}, "light.a", { brightness_pct: { entity_id: "" } })).toHaveLength(1);
  });

  it("only transition on a light that has no other field: transition counts", () => {
    const h = light(["onoff"], 32);
    expect(serviceFields(h, "light.turn_on", "light.a").map((f) => f.key)).toEqual(["transition"]);
    expect(missingFields(h, "light.turn_on", {}, "light.a")).toHaveLength(1);
    expect(missingFields(h, "light.turn_on", { transition: 2 }, "light.a")).toEqual([]);
  });
});
