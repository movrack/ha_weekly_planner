import { describe, expect, it } from "vitest";
import { servicesFor } from "../services";
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
    expect(servicesFor(hass, "climate.t", []).map((s) => s.id)).toHaveLength(3);
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
