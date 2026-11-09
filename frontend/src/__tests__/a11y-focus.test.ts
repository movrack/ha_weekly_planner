import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpDialog, collectFocusable } from "../components/dialog";
import { WpLabelPicker } from "../components/label-picker";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { PALETTE, PALETTE_NAMES } from "../labels";
import { errorText, strings } from "../i18n";
import { find, flat, handlers } from "./helpers/tpl";

class FakeSlot { children: any[] = []; constructor(public assigned: any[] = []) {} assignedElements() { return this.assigned; } }
const fake = (children: any[] = [], over: Record<string, unknown> = {}): any => ({
  children, matches: () => true, hasAttribute: () => false, getAttribute: () => null, focus: vi.fn(), tagName: "DIV", ...over,
});

let doc: any;
beforeEach(() => {
  doc = { documentElement: { lang: "en" }, body: {}, activeElement: null, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  vi.stubGlobal("document", doc);
  vi.stubGlobal("HTMLSlotElement", FakeSlot);
  vi.stubGlobal("requestAnimationFrame", () => 0);
});
afterEach(() => vi.unstubAllGlobals());

describe("dialog focus trap", () => {
  it("collects tab stops through slots and skips disabled, hidden and tabindex -1 ones", () => {
    const a = fake(), b = fake(), off = fake([], { hasAttribute: (n: string) => n === "disabled" }), skip = fake([], { getAttribute: () => "-1" });
    const slot = new FakeSlot([b, off, skip]);
    const root: any = { children: [a, slot] };
    expect(collectFocusable(root)).toEqual([a, b]);
  });

  function trapped() {
    const a = fake(), b = fake(), c = fake();
    const panel = fake([a, b, c], { focus: vi.fn() });
    const d = new WpDialog() as any;
    d.renderRoot = { querySelector: () => panel };
    d.open = true;
    return { d, a, b, c, panel };
  }
  const tab = (shiftKey = false) => ({ key: "Tab", shiftKey, defaultPrevented: false, preventDefault: vi.fn(), composedPath: () => [] });

  it("wraps Tab from the last control to the first, and Shift+Tab from the first to the last", () => {
    const { d, a, b, c } = trapped();
    d.updated(new Map([["open", false]]));
    doc.activeElement = c;
    const ev = tab(); d._onKey(ev);
    expect(ev.preventDefault).toHaveBeenCalled(); expect(a.focus).toHaveBeenCalled();
    doc.activeElement = a; d._onKey(tab(true)); expect(c.focus).toHaveBeenCalled();
    doc.activeElement = a; d._onKey(tab()); expect(b.focus).toHaveBeenCalled();
    d.disconnectedCallback();
  });

  it("brings the focus back in when it fell to the page (Tab heard on the document)", () => {
    const { d, a } = trapped();
    d.updated(new Map([["open", false]]));
    doc.activeElement = doc.body;
    d._onDocKey(tab());
    expect(a.focus).toHaveBeenCalled();
    d.disconnectedCallback();
  });

  it("goes to the dialog itself when it holds no control", () => {
    const { d, panel } = trapped();
    panel.children = [];
    d.updated(new Map([["open", false]]));
    d._onKey(tab());
    expect(panel.focus).toHaveBeenCalled();
    d.disconnectedCallback();
  });

  it("makes the rest of the page inert while open and restores it on close; the opener gets the focus back", () => {
    const opener = fake([], { isConnected: true });
    doc.activeElement = opener;
    const s1 = fake(), s2 = fake([], { hasAttribute: (n: string) => n === "inert" });
    s1.setAttribute = vi.fn(); s1.removeAttribute = vi.fn(); s2.setAttribute = vi.fn(); s2.removeAttribute = vi.fn();
    const { d } = trapped();
    const parent: any = { children: [d, s1, s2], parentNode: null };
    Object.defineProperty(d, "parentNode", { value: parent });
    d.updated(new Map([["open", false]]));
    expect(s1.setAttribute).toHaveBeenCalledWith("inert", "");
    expect(s2.setAttribute).not.toHaveBeenCalled();
    d.close();
    expect(s1.removeAttribute).toHaveBeenCalledWith("inert");
    expect(s2.removeAttribute).not.toHaveBeenCalled();
    expect(opener.focus).toHaveBeenCalled();
  });

  it("has no hidden title control: the heading is plain text and the expand button is explicit, last, and named", () => {
    const { d } = trapped();
    const html = flat(d.render());
    expect(html).toContain("<h2>");
    expect(html).not.toContain('class="heading"');
    expect(html.indexOf('class="expand"')).toBeGreaterThan(html.indexOf("<footer>"));
    expect(html).toContain("Enlarge / reduce");
    expect(html).toContain("mdi:arrow-expand-horizontal");
  });
});

describe("colour swatches", () => {
  const picker = (color: string) => {
    const el = new WpLabelPicker() as any;
    el.hass = { language: "en" }; el._color = color; el.disabled = false;
    el._set = vi.fn();
    return el;
  };
  it("names each swatch by colour and checks exactly the current one", () => {
    const tpl = picker(PALETTE[1])._swatches();
    const html = flat(tpl);
    expect(html).not.toContain("aria-label=#");
    const checked = (tpl.values[2] as any[]).filter((x) => x.values[0] === true);
    expect(checked).toHaveLength(1);
    expect(PALETTE_NAMES).toHaveLength(PALETTE.length);
    for (const k of PALETTE_NAMES) expect((strings("en") as any)[k]).toBeTruthy();
    const fr = picker(PALETTE[0]); fr.hass.language = "fr";
    expect(flat(fr._swatches())).toContain("Rouge");
  });
  it("adds a checked, named custom swatch for a colour outside the palette; the palette swatches stay unchecked", () => {
    const tpl = picker("#c0b54a")._swatches();
    const html = flat(tpl);
    expect((tpl.values[2] as any[]).filter((x) => x.values[0] === true)).toHaveLength(0);
    expect(html).toContain('role="radio" aria-checked="true" tabindex="0"');
    expect(html).toContain("sw custom");
    expect(html).toContain("background:#c0b54a");
    expect(html).toContain("Custom color");
    expect(flat(picker(PALETTE[1])._swatches())).not.toContain("sw custom");
    const fr = picker("#c0b54a"); fr.hass.language = "fr";
    expect(flat(fr._swatches())).toContain("Couleur personnalisée");
  });
  it("moves with the arrow keys as a radiogroup", () => {
    const el = picker(PALETTE[0]);
    const btns = Array.from({ length: PALETTE.length }, () => ({ focus: vi.fn() }));
    const ev = { key: "ArrowRight", preventDefault: vi.fn(), currentTarget: { querySelectorAll: () => btns } };
    find(el._swatches(), "keydown", "radiogroup").fn(ev);
    expect(el._set).toHaveBeenCalledWith({ color: PALETTE[1] });
    expect(btns[1].focus).toHaveBeenCalled();
    find(el._swatches(), "keydown", "radiogroup").fn({ ...ev, key: "ArrowLeft" });
    expect(el._set).toHaveBeenLastCalledWith({ color: PALETTE[PALETTE.length - 1] });
  });
  it("has a 44 px hit area", () => {
    expect((WpLabelPicker.styles as any[]).map((s) => s.cssText).join("")).toMatch(/\.sw \{ width: 44px; height: 44px/);
  });
});

describe("card names and notices", () => {
  const program = (n: number) => ({ id: "p", name: "Salon", revision: 1, priority: 10, enabled: true, reapply: true, conditions: [],
    entities: Array.from({ length: n }, (_, i) => ({ entity_id: `switch.d${i}`, default_label: null, label_overrides: {} })),
    profiles: [{ id: "a", name: "A", days: [[], [], [], [], [], [], []] }] });
  function card(p: any) {
    const c = new WeeklyPlannerCard() as any;
    c.hass = { language: "en", config: { time_zone: "UTC" }, states: { "switch.d0": { entity_id: "switch.d0", state: "on", attributes: { friendly_name: "Lamp" } }, "switch.d1": { entity_id: "switch.d1", state: "on", attributes: { friendly_name: "Fan" } } }, services: {}, callWS: vi.fn() };
    c._config = {}; c._data = { programs: [p], labels: [], status: {}, can_edit: true, read_only: false };
    return c;
  }
  it("puts the program (and device) name in Week and Chart buttons", () => {
    const p = program(2);
    const html = flat(card(p)._extras({ kind: "program", programId: "p" }, "switch.d1", [p]));
    expect(html).toContain("Week, Salon, Fan");
    expect(html).toContain("Chart of the day, Salon, Fan");
  });
  it("names the schedules button and the program switch without the state", () => {
    const p = program(1);
    const c = card(p);
    const html = flat(c._line("switch.d0", [p], { name: "Salon", button: { kind: "program", programId: "p" }, open: { kind: "program", programId: "p" } }));
    expect(html).toContain("Schedules, Salon");
    expect(html).toContain("aria-label=Salon");
    expect(html).not.toContain("Salon: ");
    expect(c._deviceLabel(p, "switch.d0")).toBe("Salon");
    expect(c._deviceLabel(program(2), "switch.d1")).toBe("Salon, Fan");
  });
  it("lets the status line wrap but keeps the time in one piece", () => {
    const css = (WeeklyPlannerCard.styles as any[]).map((s) => s.cssText).join("");
    expect(css).toMatch(/\.now \{[^}]*flex-wrap: wrap/);
    expect(css).toMatch(/\.next \{[^}]*flex-wrap: wrap/);
    expect(css).toMatch(/\.next \.lbl \{[^}]*overflow-wrap: anywhere/);
    expect(css).toMatch(/\.nw \{ white-space: nowrap/);
  });
  it("shows a plain sentence for a technical failure and keeps the detail out of sight", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(errorText("fr", new Error("Service weekly_planner.x not found"))).toBe("Un problème est survenu de notre côté. Réessayez dans un instant.");
    expect(errorText("en", { message: "unknown_command" })).not.toContain("unknown_command");
    expect(errorText("en", new Error("Name already used"))).toBe("Error: Name already used");
    expect(warn).toHaveBeenCalled();
  });
});
