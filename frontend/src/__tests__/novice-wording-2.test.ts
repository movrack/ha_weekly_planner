// Second novice review (2026-11-22): plain wording, EN and FR, one group of assertions per finding group.
import { describe, expect, it } from "vitest";
import { t, strings } from "../i18n";

describe("novice review 2: plain wording", () => {
  it("devices are chosen, not 'selected entities'", () => {
    expect(t("en", "choose_device")).toBe("Choose a device");
    expect(t("fr", "choose_device")).toBe("Choisir un appareil");
  });

  it("the day-off switch and its copy choice no longer contradict each other", () => {
    expect(t("fr", "holiday_switch")).toBe("Horaires à part les jours fériés");
    expect(t("fr", "holiday_copy")).toBe("Prendre les horaires de :");
    expect(t("en", "holiday_copy")).toBe("Use the schedule of:");
    for (const lang of ["en", "fr"]) expect(t(lang, "holiday_switch")).not.toMatch(/different|différent/i);
  });

  it("the button that deletes a whole program says so; the row delete stays short", () => {
    expect(t("fr", "delete_schedule")).toBe("Supprimer ce programme");
    expect(t("en", "delete_schedule")).toBe("Delete this program");
    expect(strings("fr").delete).toBe("Supprimer");
  });

  it("the program form is short and plain", () => {
    expect(t("fr", "pe_area")).toBe("Pièce (facultative)");
    expect(t("fr", "pe_redo")).toBe("Refaire");
    expect(t("fr", "pe_conditions_hint")).toContain("ne marche que si");
    expect(t("fr", "pe_shared_save_hint")).not.toContain("Annuler");
    expect(t("en", "pe_shared_save_hint")).not.toContain("Cancelling");
    expect(strings("en")).not.toHaveProperty("pe_create_save_hint");
    for (const lang of ["en", "fr"]) expect(t(lang, "pe_area_hint").length).toBeLessThan(70);
    expect(t("en", "cond_remove")).toBe("Delete this condition");
  });

  it("the program switch says it once; the active mode is not tagged '(Active)'", () => {
    expect(t("fr", "schedule_on")).toBe("Programme en marche");
    expect(t("en", "schedule_on")).toBe("Program running");
  });

  it("the program sheet title is not the word of the Comfort / Night settings", () => {
    expect(t("fr", "panel_settings")).toBe("Fiche du programme");
    expect(t("en", "panel_settings")).toBe("Program details");
    expect(t("fr", "panel_settings")).not.toBe(t("fr", "settings_legend"));
    expect(t("fr", "action_none_allowed")).toContain("Fiche du programme");
  });

  it("the pencil and the bin of a shared setting carry a visible text", () => {
    expect(t("fr", "lb_edit_short")).toBe("Modifier");
    expect(t("fr", "lb_delete")).toBe("Supprimer ce réglage");
    expect(t("en", "lb_delete")).toBe("Delete this setting");
  });
});
