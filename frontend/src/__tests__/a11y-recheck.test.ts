// Fixes of the accessibility re-check (2026-11-09): dialog roles, Escape order, markers out of the tab order, names.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpDialog } from "../components/dialog";
import { WpConfirm, WpChoice, WpPauseChoice } from "../components/confirm";
import { WpDayBar } from "../components/day-bar";
import { WpTip } from "../components/tip";
import { labelDomains } from "../labels";
import { onServiceNames, loadServiceNames } from "../services";
import { flat } from "./helpers/tpl";

beforeEach(() => {
  vi.stubGlobal("document", { documentElement: { lang: "en" }, body: {}, activeElement: null, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  vi.stubGlobal("requestAnimationFrame", () => 0);
});
afterEach(() => vi.unstubAllGlobals());

describe("dialog roles", () => {
  it("wp-dialog is a dialog by default, an alertdialog on request, and links its description inside its own shadow root", () => {
    const d = new WpDialog() as any;
    d.open = true;
    expect(flat(d.render())).toContain("role=dialog");
    expect(flat(d.render())).not.toContain("aria-describedby=wp-desc");
    d.dialogRole = "alertdialog"; d.description = "Delete it?";
    const html = flat(d.render());
    expect(html).toContain("role=alertdialog");
    expect(html).toContain("aria-describedby=wp-desc");
    expect(html).toContain('id="wp-desc"');
    expect(html).toContain("Delete it?");
  });
  it("wp-confirm is an alertdialog described by its message; wp-choice and wp-pause-choice are dialogs with a description", () => {
    const c = new WpConfirm() as any; c.message = "Delete Salon?"; c.lang = "en";
    expect(flat(c.render())).toContain('dialog-role="alertdialog"');
    expect(flat(c.render())).toContain("description=Delete Salon?");
    const ch = new WpChoice() as any; ch.message = "Which one?"; ch.lang = "en";
    expect(flat(ch.render())).not.toContain("alertdialog");
    expect(flat(ch.render())).toContain("description=Which one?");
    const p = new WpPauseChoice() as any; p.message = "Pause?"; p.lang = "en";
    expect(flat(p.render())).toContain("description=Pause?");
  });
  it("Escape lets the owner handle it first: a cancelled escape event keeps the dialog open", () => {
    const d = new WpDialog() as any;
    d.open = true;
    d.addEventListener = undefined;
    d.dispatchEvent = vi.fn((e: Event) => { e.preventDefault(); return false; });
    const stop = vi.fn();
    d._onKey({ key: "Escape", stopPropagation: stop });
    expect(d.open).toBe(true);
    d.dispatchEvent = vi.fn(() => true);
    d._onKey({ key: "Escape", stopPropagation: stop });
    expect(d.open).toBe(false);
  });
});

describe("tab stops and names of the markers", () => {
  it("a wp-tip with no-tab is not a tab stop and says its label; otherwise it is a tab stop named by its text", () => {
    const tip = new WpTip() as any; tip.text = "Now · 2:45 pm";
    expect(flat(tip.render())).toContain("tabindex=0");
    tip.noTab = true; tip.label = "Now · 2:45 pm, Office";
    const html = flat(tip.render());
    expect(html).toContain("tabindex=-1");
    expect(html).toContain("aria-label=Now · 2:45 pm, Office");
  });
  it("the day bar's now marker leaves the tab order and carries the device; the hour axis is hidden from screen readers", () => {
    const bar = new WpDayBar() as any; bar.now = 885; bar.lang = "en"; bar.deviceName = "Office"; bar.showHours = true;
    const html = flat(bar.render());
    expect(html).toContain("no-tab");
    expect(html).toMatch(/label=Now · [^\n]*, Office/);
    expect(html).toContain('class="hours" aria-hidden="true"');
  });
  it("the day bar of a zone keeps its markers out of the tab order (no-tab) and its hour axis is drawn by the editor, outside the button", () => {
    const bar = new WpDayBar() as any; bar.lang = "en"; bar.noTab = true;
    bar.spans = [{ start: 600, end: 610, color: "#e91e63", label: "Start", slotId: "a", marker: true }];
    expect(flat(bar.render())).toContain("?no-tab");
  });
  it("the day bar reports the names it draws (the ones that fit), for the name of its zone", () => {
    const bar = new WpDayBar() as any; bar.lang = "en"; bar._width = 300;
    bar.spans = [
      { start: 0, end: 600, color: "#e91e63", label: "Vacuum start", slotId: "a" },
      { start: 600, end: 610, color: "#4caf50", label: "Tiny", slotId: "b" },
    ];
    expect(bar.visibleText()).toBe("Vacuum start");
    const seen: string[] = [];
    bar.dispatchEvent = vi.fn((e: CustomEvent) => { seen.push(e.detail); return true; });
    bar.updated(); bar.updated();
    expect(seen).toEqual(["Vacuum start"]);
  });
});

describe("service names of the labels", () => {
  it("loads the integration of an action AND of a name that is a raw service id", () => {
    const l = (name: string, service?: string): any => ({ id: name, name, color: "#fff", action: service ? { kind: "service", service } : { kind: "scene", entity_id: "scene.x" } });
    expect(labelDomains([l("vacuum.start", "vacuum.start"), l("Eco", "climate.set_temperature"), l("climate.eco"), l("scene.x")]).sort())
      .toEqual(["climate", "scene", "vacuum"]);
  });
  it("tells every listener when translations arrive, not only the component that asked", async () => {
    const heard = vi.fn();
    const off = onServiceNames(heard);
    const hass: any = { loadBackendTranslation: vi.fn(async () => () => "") };
    await loadServiceNames(hass, ["vacuum_recheck"]);
    expect(heard).toHaveBeenCalledTimes(1);
    off();
    await loadServiceNames(hass, ["other_recheck"]);
    expect(heard).toHaveBeenCalledTimes(1);
  });
});
