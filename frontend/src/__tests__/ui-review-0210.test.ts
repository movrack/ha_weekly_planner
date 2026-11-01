import { describe, expect, it } from "vitest";
import { labelName } from "../labels";
import { domainIcon } from "../domains";
import { strings } from "../i18n";
// @ts-ignore raw source import (vite)
import src from "../card-editor.ts?raw";

describe("setting names shown to people", () => {
  const hass = (translations: Record<string, string> = {}, services: any = {}) =>
    ({ localize: (k: string) => translations[k] ?? "", services }) as any;
  it("keeps a real name", () => expect(labelName(hass(), { name: "Comfort" })).toBe("Comfort"));
  it("translates a raw service id with Home Assistant's service name", () => {
    expect(labelName(hass({ "component.vacuum.services.start.name": "Démarrer" }), { name: "vacuum.start" })).toBe("Démarrer");
    expect(labelName(hass({}, { vacuum: { start: { name: "Start cleaning" } } }), { name: "vacuum.start" })).toBe("Start cleaning");
  });
  it("falls back to a readable service part", () => {
    expect(labelName(hass(), { name: "vacuum.return_to_base" })).toBe("Return to base");
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

describe("vocabulary", () => {
  it("uses the plain words of the review", () => {
    const fr = strings("fr"), en = strings("en");
    expect(fr.ce_filtered).toBe("Plusieurs programmes");
    expect(fr.ce_one_program).toBe("Un seul programme");
    expect(fr.ce_area).toBe("Pièce (facultatif)");
    expect(fr.ce_schedule_view).toBe("Présentation de la journée");
    expect(fr.ce_area_hint).toContain("Réglages des programmes > Général");
    expect(fr.chart_day).toBe("Graphique du jour");
    expect(fr.planned).toBe("Programme");
    expect(fr.measured).toBe("Valeur mesurée");
    expect(fr.ch_set).toBe("Demandé à l’appareil");
    expect(fr.ce_type_count).toBe("{on} sur {total}");
    expect(fr.ce_left_all).toBe("Les nouveaux programmes ne s’afficheront plus automatiquement sur cette carte.");
    expect(en.ce_show_chart).toBe("Chart button under each device");
  });
});

describe("card editor layout guards (360 px)", () => {
  it("notice button wraps inside its box", () => {
    expect(src).toMatch(/\.notice \.btn \{[^}]*max-width: 100%[^}]*white-space: normal/);
  });
  it("program name never breaks mid-word; type chips wrap and are 44 px tall", () => {
    expect(src).toMatch(/\.type-title \{[^}]*overflow-wrap: normal/);
    expect(src).toMatch(/\.chips \{[^}]*flex-wrap: wrap/);
    expect(src).toMatch(/\.chip \{[^}]*min-height: 44px/);
  });
});
