import { describe, expect, it, vi } from "vitest";
import { loadServiceNames, missingFields, onServiceNames, serviceDescription, serviceFields, serviceLabel, servicesFor, startData } from "../services";
import type { HomeAssistant } from "../types";

const hass = {
  states: { "climate.t": { entity_id: "climate.t", state: "heat", attributes: {} } },
  services: {
    climate: {
      set_temperature: { name: "Set temperature", target: { entity: { domain: "climate" } } },
      set_hvac_mode: { name: "Set HVAC mode", target: { entity: { domain: "climate" } } },
      turn_off: { name: "Turn off", target: { entity: { domain: "climate" } } },
    },
  },
} as unknown as HomeAssistant;

describe("services offered for a device", () => {
  it("offers all of them by default", () => {
    expect(servicesFor(hass, "climate.t").map((s) => s.id)).toHaveLength(3);
    expect(servicesFor(hass, "climate.t", []).map((s) => s.id)).toHaveLength(0);
    expect(servicesFor(hass, "climate.t").map((s) => s.id)).toHaveLength(3);
  });
  it("restricts to the allowed services", () => {
    expect(servicesFor(hass, "climate.t", ["climate.set_hvac_mode", "climate.set_temperature"]).map((s) => s.id).sort())
      .toEqual(["climate.set_hvac_mode", "climate.set_temperature"]);
  });
});

import { deviceOptions } from "../services";

describe("options of a device's modes", () => {
  const field = (key: string, selector: Record<string, unknown>) => ({ key, selector, required: true, label: key });
  const h = {
    states: { "climate.t": { entity_id: "climate.t", state: "heat", attributes: { hvac_modes: ["off", "heat"], preset_modes: ["eco"] } } },
    formatEntityState: (_s: unknown, v: string) => (v === "heat" ? "Chauffage" : ""),
  } as unknown as HomeAssistant;
  it("builds the hvac_mode list from hvac_modes with translated labels", () => {
    expect(deviceOptions(h, "climate.t", field("hvac_mode", { state: { attribute: "hvac_modes" } })))
      .toEqual([{ value: "off", label: "off" }, { value: "heat", label: "Chauffage" }]);
  });
  it("finds the attribute from the field name, and ignores other fields", () => {
    expect(deviceOptions(h, "climate.t", field("preset_mode", { select: { options: [] } }))?.[0].value).toBe("eco");
    expect(deviceOptions(h, "climate.t", field("temperature", { number: {} }))).toBeUndefined();
  });
});


describe("required mode", () => {
  it("asks for the mode of climate.set_hvac_mode even when the description does not", () => {
    const h = { states: {}, services: { climate: { set_hvac_mode: { fields: { hvac_mode: { selector: { state: {} } } } } } } } as unknown as HomeAssistant;
    expect(missingFields(h, "climate.set_hvac_mode", {})).toHaveLength(1);
    expect(missingFields(h, "climate.set_hvac_mode", { hvac_mode: "heat" })).toHaveLength(0);
  });
});


describe("fields shown for a device", () => {
  const h = {
    states: { "climate.t": { entity_id: "climate.t", state: "heat", attributes: { supported_features: 1 } } },
    services: { climate: {
      set_hvac_mode: { fields: { hvac_mode: { selector: { state: {} } } } },
      set_temperature: { fields: {
        temperature: { selector: { number: {} }, filter: { supported_features: [1] } },
        target_temp_high: { selector: { number: {} }, filter: { supported_features: [2] } },
        target_temp_low: { selector: { number: {} }, filter: { supported_features: [2] } },
        hvac_mode: { selector: { state: {} } },
      } },
    } },
  } as unknown as HomeAssistant;

  it("leaves out the fields the device does not support and the mode another service sets", () => {
    expect(serviceFields(h, "climate.set_temperature", "climate.t").map((f) => f.key)).toEqual(["temperature"]);
  });

  it("asks for the temperature when every field of the service is optional", () => {
    expect(missingFields(h, "climate.set_temperature", {}, "climate.t")).toHaveLength(1);
    expect(missingFields(h, "climate.set_temperature", { temperature: 18 }, "climate.t")).toHaveLength(0);
  });
});


describe("generic native actions", () => {
  it("discovers automation enable/disable and a favorite button without a device catalogue", () => {
    const h = { states: {}, services: {
      automation: { turn_on: { target: { entity: { domain: "automation" } } }, turn_off: { target: { entity: { domain: "automation" } } } },
      button: { press: { target: { entity: { domain: "button" } } } },
      custom_device: { favorite: { target: { entity: { domain: "custom_device" } } } },
    } } as unknown as HomeAssistant;
    expect(servicesFor(h, "automation.presence").map((s) => s.id).sort()).toEqual(["automation.turn_off", "automation.turn_on"]);
    expect(servicesFor(h, "button.favorite").map((s) => s.id)).toEqual(["button.press"]);
    expect(servicesFor(h, "custom_device.test").map((s) => s.id)).toEqual(["custom_device.favorite"]);
  });
  it("preserves arbitrary presets advertised by the entity", () => {
    const h = { states: { "climate.t": { attributes: { preset_modes: ["eco", "boost", "frost", "comfort", "custom"] } } } } as unknown as HomeAssistant;
    expect(deviceOptions(h, "climate.t", { key: "preset_mode", required: true, label: "Preset", selector: { select: {} } })?.map((v) => v.value))
      .toEqual(["eco", "boost", "frost", "comfort", "custom"]);
  });
});


it("accepts an entity source for a required field and refuses an empty source even with a stale fixed value", () => {
  const h = { services: { climate: { set_temperature: { fields: { temperature: { required: true, selector: { number: { min: 5, max: 30 } } } } } } }, states: {} } as unknown as HomeAssistant;
  expect(missingFields(h, "climate.set_temperature", {}, undefined, { temperature: { entity_id: "input_number.target" } })).toEqual([]);
  expect(missingFields(h, "climate.set_temperature", { temperature: 19 }, undefined, { temperature: { entity_id: "" } })).toHaveLength(1);
});

describe("loading the service names", () => {
  it("loads each domain once, keeps the last translator, and retries after a failure", async () => {
    const load = vi.fn(async (_k: string, _d: string) => (() => "") as any);
    const hass: any = { loadBackendTranslation: load };
    expect(await loadServiceNames(hass, ["svcdom1", "svcdom1", "svcdom2"])).toBe(true);
    expect(load).toHaveBeenCalledTimes(2);
    expect(await loadServiceNames(hass, ["svcdom1"])).toBe(false);
    expect(await loadServiceNames({} as any, ["svcdom3"])).toBe(false);
    const failing: any = { loadBackendTranslation: vi.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValue(undefined) };
    expect(await loadServiceNames(failing, ["svcdom4"])).toBe(false);
    expect(await loadServiceNames(failing, ["svcdom4"])).toBe(true);
  });
  it("tells every listener when translations arrive, not only the component that asked", async () => {
    const heard = vi.fn();
    const off = onServiceNames(heard);
    const hass: any = { loadBackendTranslation: vi.fn(async () => () => "") };
    await loadServiceNames(hass, ["vacuum_recheck"]);
    expect(heard).toHaveBeenCalledTimes(1);
    off();
    await loadServiceNames(hass, ["other_recheck"]);
    expect(heard).toHaveBeenCalledTimes(1);
  });
});

describe("fields, start values and labels of a device's services", () => {
  const hass: any = {
    states: { "climate.t": { entity_id: "climate.t", state: "heat", attributes: { supported_features: 1, temperature: 21.5, hvac_modes: ["off", "heat"] } },
      "cover.c": { entity_id: "cover.c", state: "open", attributes: { supported_features: 4, modes: ["a"] } } },
    services: {
      climate: {
        set_temperature: { name: "Set temperature", description: "d", target: { entity: { domain: "climate" } }, fields: {
          temperature: { required: true, selector: { number: { min: 5 } } },
          hvac_mode: { selector: { state: {} } },
          advanced_thing: { advanced: true, selector: { text: {} } },
          entity_id: { selector: { entity: {} } },
          target_temp_high: { selector: { number: {} }, filter: { supported_features: [2] } },
          grouped: { fields: { inner: { selector: { boolean: {} }, default: true, name: "Inner" } } },
        } },
        set_hvac_mode: { target: { entity: { domain: "climate" } }, fields: { hvac_mode: { selector: { state: {} } } } },
        raw: { target: { entity: { domain: "climate" } }, fields: { cmd: { required: true, selector: { text: {} } } } },
        optional: { target: { entity: { domain: "climate" } }, fields: { a: { selector: { number: {} } }, b: { selector: { number: {} } } } },
      },
      cover: { set_position: { target: { entity: [{ domain: "cover", supported_features: [4] }] }, fields: { position: { required: true, selector: { number: { min: 0, max: 100 } } },
        tilt: { selector: { number: {} }, filter: { attribute: { modes: ["zz"] } } } } },
        stop: { target: {} } },
      homeassistant: { turn_on: { target: {} } },
      light: { notarget: {} },
    },
  };
  it("hides advanced, target, unsupported and set-elsewhere fields; required first", () => {
    const fields = serviceFields(hass, "climate.set_temperature", "climate.t");
    expect(fields.map((f) => f.key)).toEqual(["temperature", "inner"]);
    expect(fields[1].default).toBe(true); expect(fields[1].label).toBe("Inner");
    expect(serviceFields(hass, "climate.set_hvac_mode", "climate.t")[0]).toMatchObject({ key: "hvac_mode", required: true });
    const opt = serviceFields(hass, "climate.optional", "climate.t");
    expect(opt.every((f) => !f.required)).toBe(true); // all optional: one of them is needed, see missingFields
    expect(missingFields(hass, "climate.optional", {}, "climate.t").length).toBeGreaterThan(0);
    expect(missingFields(hass, "climate.optional", { [opt[0].key]: 1 }, "climate.t")).toEqual([]);
    expect(serviceFields(hass, "cover.set_position", "cover.c").map((f) => f.key)).toEqual(["position"]);
    expect(serviceFields(hass, "nothing.here")).toEqual([]);
  });
  it("starts from usable values and lists what is missing", () => {
    expect(startData(hass, "climate.set_temperature", "climate.t")).toEqual({ temperature: 21.5 });
    expect(startData(hass, "cover.set_position", "cover.c")).toEqual({ position: 50 });
    hass.states["climate.t"].attributes.temperature = "x";
    expect(startData(hass, "climate.set_temperature", "climate.t")).toEqual({ temperature: 19 });
    expect(missingFields(hass, "climate.set_temperature", { temperature: "" }, "climate.t")).toHaveLength(1);
  });
  it("offers services by target filters, skipping technical, homeassistant and target-less ones", () => {
    const ids = servicesFor(hass, "climate.t").map((s) => s.id);
    expect(ids).toContain("climate.set_temperature"); expect(ids).not.toContain("climate.raw"); expect(ids).not.toContain("homeassistant.turn_on");
    expect(servicesFor(hass, "cover.c").map((s) => s.id)).toEqual(expect.arrayContaining(["cover.set_position", "cover.stop"]));
    hass.states["cover.c"].attributes.supported_features = 1;
    expect(servicesFor(hass, "cover.c").map((s) => s.id)).not.toContain("cover.set_position");
  });
  it("labels and describes services, falling back to readable names", () => {
    expect(serviceLabel(hass, "climate.set_temperature")).toBeTruthy();
    expect(serviceLabel(hass, "foo.bar_baz")).toBeTruthy();
    expect(serviceDescription(hass, "climate.set_temperature")).toBe("d");
    expect(serviceDescription(hass, "foo.bar")).toBe("");
  });
});
