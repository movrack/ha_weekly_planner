import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { t, strings } from "../i18n";
import { formatPauseEnd } from "../time";
import { WpConditionsEditor } from "../editors/shared";
import { WpProgramsPanel } from "../programs-panel";
import { flat } from "./helpers/tpl";
import { card, program, stubBrowser, unstubBrowser } from "./helpers/planner-card";

vi.mock("../planner", async (orig) => ({ ...(await orig<object>()), subscribePlanner: () => () => {} }));

beforeEach(stubBrowser);
afterEach(unstubBrowser);

describe("novice review 2026-11-22 wording", () => {
  it("the mode line says which mode the active one reuses, only when every program agrees", () => {
    const p = program("p", "P", ["cover.a"]);
    p.profiles.push({ id: "v", name: "Vacation", days: [[], [], [], [], [], [], []], follows: "A" });
    const c = card([p], {}, { mode: { selector: "input_select.m", options: ["A", "Vacation"], active: "Vacation" } });
    expect(flat(c._modeLine([p]))).toContain("Mode: Vacation (same schedules as A)");
    expect(flat(c._modeLine([]))).toContain("Mode: Vacation</p>");
    c._data.mode.active = "A";
    expect(flat(c._modeLine([p]))).toContain("Mode: A</p>");
    expect(t("fr", "mode_shown_follows", { name: "Vacances", source: "Présent" })).toBe("Mode : Vacances (mêmes horaires que Présent)");
  });

  it("one word per action, plain words in the condition form", () => {
    expect(strings("fr").strip_erase).toBe(strings("fr").delete);
    expect(strings("en").strip_erase).toBe("Delete");
    const el = new WpConditionsEditor() as any;
    el.hass = { language: "fr", states: {} };
    el.conditions = [{ entity_id: "light.a", op: "eq", value: "on" }];
    const out = flat(el.render());
    for (const jargon of ["Opérateur", "Détail", ">Valeur<", ">=<", "≠"]) expect(out).not.toContain(jargon);
    for (const w of ["Comparaison", "Ce qu’on vérifie (facultatif)", "Valeur attendue (par ex. 20, « on » = allumé, « off » = éteint)", ">est<", "n’est pas"]) expect(out).toContain(w);
  });

  it("explains the shared setting, the random delay and the single action in plain words", () => {
    expect(t("fr", "used_by", { names: "Maison" })).toBe("Attention : modifier ce réglage modifie aussi Maison.");
    expect(t("fr", "random_time")).toContain("quelques minutes");
    expect(t("fr", "no_end")).toBe("Une seule action");
    expect(t("fr", "with_end")).toBe("Jusqu’à une heure");
    expect(t("fr", "pause_none")).toBe("Jusqu’à ce que je la reprenne");
    expect(t("fr", "mode_followed_by", { modes: "Vacances" })).toBe("Vacances utilise les mêmes horaires");
    expect(t("fr", "mode_followed_by_many", { modes: "A, B" })).toBe("A, B utilisent les mêmes horaires");
  });

  it("a pause reads the same everywhere: 'En pause' then the resume date or the absence of one", () => {
    expect(t("fr", "paused_until", { when: "x" })).toBe("En pause jusqu’au x");
    expect(t("fr", "program_disabled")).toBe("En pause (sans date de reprise)");
    expect(t("fr", "stopped")).toBe(t("fr", "program_disabled"));
    expect(formatPauseEnd("2026-11-09T21:30:00+00:00", "Europe/Paris", "fr")).toBe("lun. 9 nov. à 22 h 30");
  });

  it("the day-off sentence is not said twice: the note under the bar only says how to change it", () => {
    expect(t("fr", "holiday_locked_copy", { day: "lundi" })).not.toContain("Jour férié");
    expect(t("fr", "holiday_locked_copy", { day: "lundi" })).not.toContain("suit les horaires");
  });

  it("a greyed program of the priority screen says it is paused; the filter reset gives its reason", () => {
    const panel = new WpProgramsPanel() as any;
    panel.hass = { language: "en", states: {}, user: { is_admin: true } };
    const prog = (id: string, enabled: boolean) => ({ id, name: `Prog ${id}`, enabled, icon: null, entities: [{ entity_id: `a.${id}` }], profiles: [], conditions: [], priority: 1 });
    panel._data = { programs: [prog("1", false)], can_edit: true, read_only: false };
    expect(flat(panel._priorities(panel._data))).toContain("Paused");
    panel._data = { programs: [prog("1", true)], can_edit: true, read_only: false, labels: [], status: {} };
    const dlg = flat(panel._filterDialog(panel._data));
    expect(dlg).toContain('aria-describedby=why-reset-dialog');
    expect(dlg).toContain("No filter set.");
  });

  it("the single Edit button of a compare block names its program", () => {
    const p = program("p", "Hall light", ["cover.a"]);
    const c = card([p]);
    const out = flat(c._list([p]));
    expect(out).toContain("Edit schedules, Hall light");
  });
});
