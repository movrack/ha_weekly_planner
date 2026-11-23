// Accessibility review of 2026-11-22: the findings confirmed on the real screen, one test each.
import { describe, expect, it, vi } from "vitest";
import { WpProgramsPanel } from "../programs-panel";
import { WeeklyPlannerCardEditor } from "../card-editor";
import { WpProgramEditor } from "../editors/program-editor";
import { WpEntityPicker } from "../editors/shared";
import { WpTip } from "../components/tip";
import { WpBarEditor } from "../components/bar-editor";
import { WpDialog } from "../components/dialog";
import { WpSchedule } from "../components/schedule-dialog";
import { t } from "../i18n";
import { bindings } from "./helpers/tpl";

vi.mock("../planner", () => ({ subscribePlanner: () => () => {}, newId: () => "id" }));
vi.mock("../time", () => ({ setTimeFormat: vi.fn() }));

const css = (c: any) => [c.styles].flat(Infinity).map((s: any) => s?.cssText ?? "").join("\n");
const rule = (sheet: string, selector: string) => sheet.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`))?.[1] ?? "";

describe("a11y review 2026-11-22", () => {
  it("1: the selected Liste/Aperçu button and the Done button use the white-text fill token (>= 4.5:1), not the raw primary colour", () => {
    const sheet = css(WpProgramsPanel);
    for (const sel of [".seg button.on", ".done"]) {
      const r = rule(sheet, sel);
      expect(r).toContain("background: var(--wp-primary-fill)");
      expect(r).toContain("color: #fff");
      expect(r).not.toContain("var(--primary-color)");
    }
  });

  it("3: the card editor switch is a 48 px target itself (its label part), not only a padded host that ignores clicks", () => {
    const sheet = css(WeeklyPlannerCardEditor);
    expect(rule(sheet, "ha-switch::part(base)")).toMatch(/min-height: 48px/);
    expect(rule(sheet, "ha-switch::part(base)")).toMatch(/min-width: 48px/);
    expect(rule(sheet, "ha-switch")).not.toContain("padding");
  });

  it("4: the icon picker of the program sheet has a readable name (the label, not the raw 'mdi:desk')", () => {
    vi.stubGlobal("customElements", { get: (n: string) => (n === "ha-selector" ? class {} : undefined) });
    const e = new WpProgramEditor() as any;
    e.hass = { language: "en", states: {}, locale: { language: "en" } }; e.data = { programs: [], labels: [] };
    e._p = { name: "Office", icon: "mdi:desk", entities: [], profiles: [] };
    const tpl = e._renderGeneral();
    expect(bindings(tpl, ".label")).toContain(t("en", "pe_icon"));
    expect(bindings(tpl, ".required")).toContain(false);
    expect(t("fr", "pe_icon")).toBe("Icône");
    vi.unstubAllGlobals();
  });

  it("6: the day zone description does not say a finger must be held (Enter and the mouse work too), EN and FR", () => {
    expect(t("en", "zone_action")).toBe("Opens the editor");
    expect(t("fr", "zone_action")).toBe("Ouvre l’éditeur");
  });

  it("8: on a narrow screen the page title follows the sheet: the program name, or New program", () => {
    const p = new WpProgramsPanel() as any;
    p.hass = { language: "en", states: {}, user: { is_admin: true } };
    p._data = { programs: [{ id: "a", name: "Office" }] };
    expect(p._title()).toBe(t("en", "panel_title"));
    p.narrow = true;
    p._selected = "a";
    expect(p._title()).toBe("Office");
    p._selected = "new";
    expect(p._title()).toBe(t("en", "new_program"));
    p._selected = "gone";
    expect(p._title()).toBe(t("en", "panel_title"));
    p.narrow = false;
    p._selected = "a";
    expect(p._title()).toBe(t("en", "panel_title"));
    p._screen = "priorities";
    expect(p._title()).toBe(t("en", "prio_title"));
  });
});

describe("a11y live pass 2 (2026-11-22): contracts measured on the real screen at 360 px", () => {
  it("5: the sun icon (32 px) and the bar zone keep a 44 px tap area without changing the drawing", () => {
    expect(rule(css(WpTip), ".hit::before")).toMatch(/inset: -6px/); // 32 + 2 x 6 = 44
    expect(rule(css(WpBarEditor), ".zone::before")).toMatch(/inset: -10px 0/); // 28 + 2 x 10 = 48
    expect(rule(css(WpBarEditor), ".hours")).toContain("pointer-events: none"); // the axis must not cover the lower half of that area
  });

  it("7: the placeholder of the HA entity picker uses the contrasted secondary text token", () => {
    expect(rule(css(WpEntityPicker), "ha-entity-picker")).toContain("--secondary-text-color: var(--wp-picker-secondary)");
    expect(css(WpEntityPicker)).toContain("--wp-picker-secondary: var(--ha-color-text-secondary, var(--secondary-text-color))");
  });

  it("8: the window header and the running switch wrap instead of pushing the switch off a 180 px screen", () => {
    expect(rule(css(WpDialog), "header")).toContain("flex-wrap: wrap");
    expect(rule(css(WpDialog), "h2")).not.toContain("white-space: nowrap");
    expect(rule(css(WpSchedule), ".switch")).toContain("flex-wrap: wrap");
    expect(rule(css(WpSchedule), ".switch .grow")).toContain("min-width: 0");
  });
});
