import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpBarEditor } from "../components/bar-editor";
import { WpLabelPicker } from "../components/label-picker";
import type { HomeAssistant, PlannerData, Program } from "../types";

// Flattens a lit template, static markup and values interleaved in document order.
const flat = (v: any): string => {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(flat).join("");
  if (v && v.strings) return v.strings.map((s: string, i: number) => s + (i < v.values.length ? flat(v.values[i]) : "")).join("");
  return "";
};

const hass = { language: "en", states: { "climate.a": { entity_id: "climate.a", state: "heat", attributes: {} } },
  services: { climate: { set_temperature: { target: { entity: { domain: "climate" } } } } } } as unknown as HomeAssistant;
const data = { labels: [{ id: "t21", name: "Comfort", color: "#ff0000", action: { kind: "service", service: "climate.set_temperature", data: { temperature: 21 } } }], programs: [] } as unknown as PlannerData;
const program = { id: "p", name: "Office", entities: [{ entity_id: "climate.a", default_label: "t21" }], profiles: [] } as unknown as Program;

const picker = (props: Record<string, unknown>) => {
  const el = new WpLabelPicker() as any;
  Object.assign(el, { hass, data, program, entityIds: ["climate.a"], value: "t21" }, props);
  return flat(el.render());
};

describe("setting picker: choose versus configure", () => {
  it("modal picker keeps the pencil and the new-setting chip", () => {
    const html = picker({});
    expect(html).toContain("mdi:pencil");
    expect(html).toContain("mdi:plus");
  });
  it("inline picker (readonly) can choose but has no pencil, no new, no form", () => {
    const html = picker({ compact: true, readonlySettings: true });
    expect(html).toContain("Comfort");
    expect(html).not.toContain("mdi:pencil");
    expect(html).not.toContain("mdi:plus");
    expect(html).not.toContain("class=\"form");
  });
  it("readonly closes a form that was open", () => {
    const html = picker({ readonlySettings: true, _form: true, _editId: "t21" });
    expect(html).toContain("Comfort");
    expect(html).not.toContain("mdi:pencil");
    expect(html).not.toContain("<input");
    expect(html).not.toContain("mdi:plus");
  });
});

describe("bar panel", () => {
  beforeEach(() => vi.stubGlobal("window", { setTimeout, clearTimeout, localStorage: { getItem: () => null, setItem: () => undefined } }));
  afterEach(() => vi.unstubAllGlobals());
  const strip = (slot: boolean) => {
    const el = new WpBarEditor() as any;
    Object.assign(el, { hass, data, program, entityId: "climate.a", lang: "en" });
    Object.defineProperty(el, "_sel", { get: () => ({
      target: slot ? { kind: "slot", id: "1" } : { kind: "gap", start: 0, end: 1440 },
      slot: slot ? { id: "1", start: { time: "08:00" }, end: { time: "12:00" }, label: "t21" } : undefined, start: 480, end: 720 }) });
    el._ctx = () => ({ defaultLabel: "t21", at: () => 0 });
    return flat(el._strip());
  };
  it("puts None, cut and Copy to above the settings", () => {
    const html = strip(true);
    const none = html.indexOf("mdi:close-circle-outline"), cut = html.indexOf("mdi:content-cut");
    const copy = html.indexOf("mdi:content-copy"), picker = html.indexOf("<wp-label-picker");
    expect(none).toBeGreaterThan(-1);
    expect(none).toBeLessThan(cut);
    expect(cut).toBeLessThan(copy);
    expect(copy).toBeLessThan(picker);
  });
  it("opens the copy days above the settings too", () => {
    const el = new WpBarEditor() as any;
    el._copyOpen = true;
    Object.assign(el, { hass, data, program, entityId: "climate.a", lang: "en", weekday: 0 });
    Object.defineProperty(el, "_sel", { get: () => ({ target: { kind: "slot", id: "1" }, slot: { id: "1", label: "t21" }, start: 480, end: 720 }) });
    el._ctx = () => ({ defaultLabel: "t21", at: () => 0 });
    const html = flat(el._strip());
    expect(html.indexOf("class=\"copy\"")).toBeGreaterThan(-1);
    expect(html.indexOf("class=\"copy\"")).toBeLessThan(html.indexOf("<wp-label-picker"));
  });
  it("hands the settings picker as choose-only", () => {
    expect(strip(true)).toContain("readonly-settings");
    expect(strip(false)).toContain("readonly-settings");
  });
});

describe("setting picker behaviour in the modal", () => {
  const make = (props: Record<string, unknown> = {}) => {
    const el = new WpLabelPicker() as any;
    Object.assign(el, { hass, data, program, entityIds: ["climate.a"], value: "t21" }, props);
    el.dispatchEvent = vi.fn();
    return el;
  };
  it("opens the form on the chosen setting, then on a new one, and closes it", () => {
    const el = make({ embedded: true });
    el._open(true);
    expect(el._form).toBe(true);
    expect(el._name).toBe("Comfort");
    const form = flat(el.render());
    expect(form).toContain("<input");
    expect(form).toContain("lb-name");
    el._open(false);
    expect(el._editId).toBeNull();
    expect(el._name).toBe("");
    el._close();
    expect(el._form).toBe(false);
    const drafts = el.dispatchEvent.mock.calls.map((c: any[]) => c[0].detail);
    expect(drafts.at(-1)).toBeNull();
    expect(drafts[0].id).toBe("t21");
  });
  it("does not open an edit form without a chosen setting", () => {
    const el = make({ value: null });
    el._open(true);
    expect(el._form).toBe(false);
  });
  it("reports why the form cannot be saved yet", () => {
    const el = make();
    el._open(false);
    expect(el._draft().problem).toBeTruthy();
    el._set({ name: "Eco", action: { kind: "service", service: "climate.set_temperature", data: { temperature: 16 } } });
    expect(el._draft().problem).toBe("");
    el._set({ action: { kind: "service", service: "" } });
    expect(el._draft().problem).toBeTruthy();
  });
  it("choosing a setting closes the form and reports the choice", () => {
    const el = make();
    el._open(true);
    el._choose("t21");
    expect(el._form).toBe(false);
    expect(el.dispatchEvent.mock.calls.at(-1)[0].detail).toBe("t21");
  });
  it("offers None, an unknown chosen setting and a per-device value box", () => {
    expect(flat(make({ allowNone: true, value: null }).render())).toContain("role=\"radio\"");
    expect(flat(make({ value: "gone" }).render())).toContain(">?<");
    const el = make();
    el._open(true);
    el._valueFor = "climate.a";
    const form = flat(el.render());
    expect(form).toContain("wp-action-picker");
  });
  it("marks a setting shared with another program", () => {
    const shared = { ...data, programs: [program, { id: "q", name: "Hall", profiles: [{ id: "x", name: "x", days: [[{ id: "s", label: "t21" }], [], [], [], [], [], []] }], entities: [{ entity_id: "climate.a", default_label: null }] }] } as unknown as PlannerData;
    expect(flat(make({ data: shared }).render())).toContain("Shared");
  });
});
