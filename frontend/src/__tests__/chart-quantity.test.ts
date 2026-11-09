import { describe, expect, it } from "vitest";
import { chartLegend, chartQuantity } from "../chart-sources";

const hass = (language = "en"): any => ({ language, states: {
  "custom.probe": { attributes: { device_class: "novel_quantity" } },
}, localize: (key: string) => key });
describe("quantity legend #41", () => {
  it.each(["en", "fr"])("names arbitrary HA classes and the unit actually plotted (%s)", language => {
    const h = hass(language);
    h.localize = (key: string) => key === "component.custom.entity_component.novel_quantity.name" ? "Flux" : key;
    expect(chartQuantity(h, "custom.probe", "quanta")).toBe("Flux (quanta)");
    for (const role of ["planned", "measured", "set"] as const)
      expect(chartLegend(h, "custom.probe", "quanta", role)).toContain("Flux (quanta)");
    expect(chartQuantity(h, "custom.probe", "")).toBe("Flux");
  });
  it("uses the plotted attribute instead of a device class describing another quantity", () => {
    const h = hass(); h.localize = (key: string) => ({
      "component.custom.entity_component._.state_attributes.current_position.name": "Position",
      "component.custom.entity_component.novel_quantity.name": "Wrong quantity",
    }[key] ?? key);
    expect(chartQuantity(h, "custom.probe", "%", "current_position")).toBe("Position (%)");
    expect(chartQuantity(h, "custom.probe", "%", "missing_field")).toBe("");
  });
  it("falls back without guessing from an unknown unit, missing metadata or missing translations", () => {
    const h = hass();
    expect(chartLegend(h, "custom.probe", "°C", "measured")).toBe("Measured value");
    expect(chartLegend(h, "gone.entity", "", "set")).toBe("Requested value");
    h.localize = undefined; h.language = "fr";
    expect(chartLegend(h, "custom.probe", "%", "set")).toBe("Valeur demandée");
    expect(chartLegend(h, "custom.probe", "", "measured")).toBe("Valeur mesurée");
    expect(chartLegend(h, "custom.probe", "", "planned")).toBe("Prévu");
  });
});

import { WpChart } from "../components/chart";
import { flat } from "./helpers/tpl";
it("connects plotted attributes to the rendered planned/measured/requested legend", () => {
  const c: any = new WpChart();
  c.entityId = "climate.room";
  c.hass = { ...hass("fr"), localize: (key: string) => key.endsWith(".state_attributes.temperature.name") ? "Température cible" : key.endsWith(".state_attributes.current_temperature.name") ? "Température actuelle" : key };
  c.program = { id: "test", revision: 1, entities: [] };
  const out = flat(c._legend({ unit: "°F", quantityField: "temperature", measuredField: c._live({ s: "heat", a: {}, t: 0 }).measuredField, lines: [{key:"measured"},{key:"set"}],
    markers: [{}], planned: {steps:[], zones:[]}, shade:[], manual:[] }));
  expect(out).toContain("Prévu · Température cible (°F)");
  expect(out).toContain("Mesuré · Température actuelle (°F)");
  expect(out).toContain("Demandé · Température cible (°F)");
  expect(out).not.toContain("°C");
});
