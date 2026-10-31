import { describe, expect, it } from "vitest";
import { strings, t } from "../i18n";

describe("setting naming", () => {
  it("never shows the old label wording to the user", () => {
    for (const lang of ["en", "fr"]) {
      const all = Object.entries(strings(lang)).filter(([, v]) => typeof v === "string") as [string, string][];
      for (const [key, value] of all) {
        if (key.endsWith("_label")) continue; // "Days"
        expect(value, `${lang}.${key}`).not.toMatch(/étiquette|\blabels?\b/i);
      }
    }
  });
  it("names the concept Setting / Réglage", () => {
    expect(t("en", "lb_new")).toBe("New setting");
    expect(t("fr", "lb_new")).toBe("Nouveau réglage");
    expect(t("fr", "lb_err_save")).toBe("Réglage non enregistré.");
  });
});
