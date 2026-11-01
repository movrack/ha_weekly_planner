import { describe, expect, it } from "vitest";
import { domainChoices, programDomains } from "../domains";
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
  it("uses HA domain titles and sorts by the translated names", () => {
    const titles: Record<string, string> = { "component.vacuum.title": "Aspirateur", "component.climate.title": "Climatisation" };
    expect(domainChoices(["climate", "vacuum"], "fr", (key) => titles[key])).toEqual([
      { id: "vacuum", label: "Aspirateur" }, { id: "climate", label: "Climatisation" },
    ]);
  });
  it("keeps an unfamiliar domain selectable when HA has no translation", () => {
    expect(domainChoices(["future_domain"], "fr", () => "")).toEqual([{ id: "future_domain", label: "future_domain" }]);
    expect(domainChoices(["vacuum"], "en")).toEqual([{ id: "vacuum", label: "vacuum" }]);
  });
});
