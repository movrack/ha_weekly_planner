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
