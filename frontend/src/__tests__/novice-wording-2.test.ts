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
});
