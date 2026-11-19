import { describe, expect, it } from "vitest";
import { domainIcon, programDomains } from "../domains";
import type { ProgramEntity } from "../types";

const program = (...ids: string[]) => ({ entities: ids.map((entity_id): ProgramEntity => ({ entity_id, default_label: null, label_overrides: {} })) });

describe("generic card type filters", () => {
  it("discovers aspirators and previously unknown domains from every program device", () => {
    expect(programDomains([program("climate.office", "vacuum.rocky"), program("humidifier.room", "future_domain.device")]))
      .toEqual(["climate", "future_domain", "humidifier", "vacuum"]);
  });
  it("does not depend on devices having an available HA state, and removes duplicates", () => {
    expect(programDomains([program("vacuum.one", "vacuum.two"), program("vacuum.three")])).toEqual(["vacuum"]);
  });
  it("keeps selected domains after their last program disappears so they can be unchecked", () => {
    expect(programDomains([program("climate.office")], ["vacuum", "vacuum", "retired_domain"]))
      .toEqual(["climate", "retired_domain", "vacuum"]);
  });
  it("has no default catalogue on an empty installation", () => {
    expect(programDomains([])).toEqual([]);
    expect(programDomains([], ["vacuum"])).toEqual(["vacuum"]);
  });
});

describe("domain icons", () => {
  it("come from Home Assistant, with a fallback, and are fetched once", async () => {
    let calls = 0;
    const hass = { callWS: async (m: any) => { calls++; if (m.integration === "none") throw new Error("x"); return { resources: { [m.integration]: { _: { default: "mdi:foo" } } } }; } } as any;
    expect(await domainIcon(hass, "icontest")).toBe("mdi:foo");
    expect(await domainIcon(hass, "icontest")).toBe("mdi:foo");
    expect(calls).toBe(1);
    expect(await domainIcon(hass, "none", "mdi:bar")).toBe("mdi:bar");
  });
});
