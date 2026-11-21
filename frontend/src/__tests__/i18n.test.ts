import { describe, expect, it, vi } from "vitest";
import { errorText, ordinal, strings } from "../i18n";

describe("ordinal", () => {
  it.each([[1, "1st"], [2, "2nd"], [3, "3rd"], [4, "4th"], [11, "11th"], [12, "12th"], [21, "21st"], [112, "112th"]])(
    "writes rank %i as %s in English", (n, text) => { expect(ordinal("en", n)).toBe(text); });

  it.each([[1, "1er"], [2, "2e"], [3, "3e"], [11, "11e"]])(
    "writes rank %i as %s in French", (n, text) => { expect(ordinal("fr", n)).toBe(text); });
});

describe("error texts", () => {
  it("shows a plain sentence for a technical failure and keeps the detail out of sight", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(errorText("fr", new Error("Service weekly_planner.x not found"))).toBe("Un problème est survenu de notre côté. Réessayez dans un instant.");
    expect(errorText("en", { message: "unknown_command" })).not.toContain("unknown_command");
    expect(errorText("en", new Error("Name already used"))).toBe("Error: Name already used");
    expect(warn).toHaveBeenCalled();
  });
});

describe("plain vocabulary", () => {
  it("the card editor and chart use plain words (reviewed by a novice, 2026-02-10)", () => {
    const fr = strings("fr"), en = strings("en");
    expect(fr.ce_area).toBe("Pièce");
    expect(fr.ce_schedule_view).toBe("Affichage");
    expect(fr.ce_area_hint).toBe("Montre seulement les programmes rangés dans les pièces choisies. Pour ranger un programme dans une pièce : Réglages des programmes → Général → Pièce du programme.");
    expect(fr.chart_day).toBe("Graphique du jour");
    expect(fr.planned).toBe("Prévu");
    expect(fr.measured).toBe("Valeur mesurée");
    expect(fr.ce_type_count).toBe("{on} sur {total}");
    expect(fr.ce_all_programs_hint_off).toBe("Seuls les programmes activés ci-dessous sont montrés. Ceux que vous créerez plus tard n’apparaîtront pas sur cette carte.");
    expect(en.ce_show_chart).toBe("Chart button");
  });
});
