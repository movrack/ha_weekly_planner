import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpActionPicker } from "../components/action-picker";
import { WpDialog } from "../components/dialog";
import { flat, handlers, find } from "./helpers/tpl";

beforeEach(() => {
  (globalThis as any).CustomEvent ??= class { type: string; detail: unknown; constructor(t: string, i: any) { this.type = t; this.detail = i?.detail; } };
  vi.stubGlobal("customElements", { get: () => undefined });
  vi.stubGlobal("document", { documentElement: { lang: "en" }, activeElement: null, body: {}, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());

const hass: any = {
  language: "en",
  states: {
    "climate.t": { entity_id: "climate.t", state: "heat", attributes: { friendly_name: "Thermo" } },
    "sensor.x": { entity_id: "sensor.x", state: "21", attributes: { unit: "C", other: 1 } },
    "sensor.off": { entity_id: "sensor.off", state: "unavailable", attributes: {} },
    "scene.cosy": { entity_id: "scene.cosy", state: "x", attributes: { friendly_name: "Cosy", entity_id: ["climate.t"] } },
  },
  services: { climate: {
    set_temperature: { name: "Set temperature", description: "Sets it", target: { entity: { domain: "climate" } }, fields: { temperature: { required: true, selector: { number: {} } }, label: { selector: { text: {} } }, mode: { selector: { select: { multiple: true, options: ["a"] } } }, flag: { selector: { boolean: {} } } } },
    turn_off: { name: "Turn off", target: { entity: { domain: "climate" } } },
  } },
};

const picker = (props: Record<string, unknown> = {}) => {
  const el = new WpActionPicker() as any;
  Object.assign(el, { hass, entityId: "climate.t", action: null }, props);
  const seen: any[] = []; el.dispatchEvent = (e: any) => { seen.push(e.detail); return true; };
  return { el, seen };
};

describe("wp-action-picker advanced options", () => {
  const rich = { ...hass, services: { climate: { set_temperature: { name: "Set temperature", target: { entity: { domain: "climate" } },
    fields: { temperature: { required: true, selector: { number: {} } }, target_temp_high: { selector: { number: {} } }, target_temp_low: { selector: { number: {} } } } } } } };
  const svc = (data: Record<string, unknown> = {}, extra: Record<string, unknown> = {}) =>
    picker({ hass: rich, action: { kind: "service", service: "climate.set_temperature", data: { temperature: 20, ...data } }, ...extra });
  it("keeps the action and its main value visible, and the rest folded by default", () => {
    const html = flat(svc().el.render());
    expect(html).toContain('id="action"');
    expect(html).toContain("temperature");
    expect(html).toContain('class="wp-collapse "'); expect(html).not.toContain("wp-collapse open");   // the rest is drawn but folded
    expect(html).toContain("aria-expanded=");
  });
  it("shows the target choice and the upper / lower temperatures once opened", () => {
    const { el } = svc();
    find(el.render(), "click", "opts").fn();
    const html = flat(el.render());
    expect(html).toContain("action-target-mode");
    expect(html).toContain("target_temp_high");
    expect(html).toContain("target_temp_low");
  });
  it("opens by itself when a temperature bound is set", () => {
    const html = flat(svc({ target_temp_low: 18 }).el.render());
    expect(html).toContain("action-target-mode");
    expect(html).toContain("target_temp_high");
  });
  it("opens by itself when another entity is targeted, or when a parent asks for it", () => {
    expect(flat(svc({}, { action: { kind: "service", service: "climate.set_temperature", target_entity_id: "climate.t", data: { temperature: 20 } } }).el.render())).toContain("action-target-mode");
    expect(flat(svc({}, { advancedOpen: true }).el.render())).toContain('<slot name="advanced">');
    expect(flat(svc().el.render())).not.toContain("wp-collapse open");
  });
});

describe("wp-action-picker", () => {
  it("renders nothing without hass and lists the services and scenes of the device", () => {
    expect(flat(picker({ hass: undefined }).el.render())).toBe("");
    const html = flat(picker().el.render());
    expect(html).toContain("Set temperature"); expect(html).toContain("Cosy");
  });
  it("shows the none-allowed hint and keeps the chosen service visible", () => {
    expect(flat(picker({ allowed: [] }).el.render())).toContain("action_none_allowed".length ? "role=\"status\"" : "");
    const html = flat(picker({ allowed: ["climate.turn_off"], action: { kind: "service", service: "climate.set_temperature", data: {} } }).el.render());
    expect(html).toContain("Set temperature");
    const unknown = flat(picker({ action: { kind: "service", service: "foo.bar" } }).el.render());
    expect(unknown).toContain("foo.bar");
  });
  it("emits a service with its starting data, or a scene, when the choice changes", () => {
    const { el, seen } = picker();
    const r = el.render();
    find(r, "change", "id=\"action\"").fn({ target: { value: "climate.turn_off" } });
    find(r, "change", "id=\"action\"").fn({ target: { value: "scene.cosy" } });
    find(r, "change", "id=\"action\"").fn({ target: { value: "" } });
    expect(seen[0]).toMatchObject({ kind: "service", service: "climate.turn_off" });
    expect(seen[1]).toEqual({ kind: "scene", scene: "scene.cosy" });
    expect(seen).toHaveLength(2);
  });
  it("switches the target between the device and another entity", () => {
    const { el, seen } = picker({ action: { kind: "service", service: "climate.turn_off" } });
    expect(flat(el.render())).not.toContain("wp-collapse open");
    find(el.render(), "click", "opts").fn();
    find(el.render(), "change", "action-target-mode").fn({ target: { value: "other" } });
    expect(seen[0]).toEqual({ kind: "service", service: "", target_entity_id: "" });
    const ext = picker({ action: { kind: "service", service: "climate.turn_off", target_entity_id: "climate.t" } });
    const r = ext.el.render();
    expect(flat(r)).toContain("wp-entity-picker");
    find(r, "wp-change", "wp-entity-picker").fn({ stopPropagation() {}, detail: "climate.t" });
    expect(ext.seen).toEqual([]);
    find(r, "wp-change", "wp-entity-picker").fn({ stopPropagation() {}, detail: "climate.x" });
    expect(ext.seen[0].target_entity_id).toBe("climate.x");
    find(r, "change", "action-target-mode").fn({ target: { value: "device" } });
    expect(ext.seen[1]).toEqual({ kind: "service", service: "" });
  });
  it("edits service data with the plain field and drops empty values", () => {
    const { el, seen } = picker({ action: { kind: "service", service: "climate.set_temperature", data: { temperature: 20, label: "x" } } });
    const r = el.render();
    expect(flat(r)).toContain("type=\"text\"");
    const hs = handlers(r).filter((h) => h.event === "change" && /<input type="text"/.test(h.before.slice(-120)));
    hs[0].fn({ target: { value: "22" } });
    expect(seen[0].data.temperature).toBe("22");
    el._setData("label", "");
    expect(seen[1].data).not.toHaveProperty("label");
    el._setData("mode", []);
    expect(seen[2].data).not.toHaveProperty("mode");
    picker({ action: { kind: "scene", scene: "scene.cosy" } }).el._setData("a", 1);
  });
  it("uses ha-selector when it is available", () => {
    vi.stubGlobal("customElements", { get: (n: string) => (n === "ha-selector" ? class {} : undefined) });
    const { el, seen } = picker({ action: { kind: "service", service: "climate.set_temperature", data: {} } });
    const r = el.render();
    expect(flat(r)).toContain("ha-selector");
    find(r, "value-changed", "ha-selector").fn({ stopPropagation() {}, detail: { value: 19 } });
    expect(seen[0].data.temperature).toBe(19);
    expect(el._context({ key: "hvac_mode", selector: {} })).toMatchObject({ entity_id: "climate.t", filter_attribute: "hvac_modes" });
    expect(el._selectorOf({ key: "temperature", selector: { number: {} }, required: true, label: "t" })).toEqual({ number: {} });
  });
  it("binds a field to another entity and previews its value", () => {
    const base = { kind: "service", service: "climate.set_temperature", data: {} };
    const { el, seen } = picker({ action: { ...base, data_sources: { temperature: { entity_id: "sensor.x", type: "number", attribute: "unit" } } } });
    const r = el.render();
    const html = flat(r);
    expect(html).toContain("value_current"in {} ? "" : "role=\"status\"");
    find(r, "change", "id=source-temperature").fn({ target: { value: "fixed" } });
    expect(seen[0].data_sources).toEqual({});
    find(r, "wp-change", "wp-entity-picker").fn({ stopPropagation() {}, detail: "sensor.off" });
    expect(seen[1].data_sources.temperature.entity_id).toBe("sensor.off");
    find(r, "change", "id=attribute-temperature").fn({ target: { value: "other" } });
    expect(seen[2].data_sources.temperature).toEqual({ entity_id: "sensor.x", type: "number", attribute: "other" });
    find(r, "change", "id=attribute-temperature").fn({ target: { value: "" } });
    expect(seen[3].data_sources.temperature).toEqual({ entity_id: "sensor.x", type: "number" });
    const fixed = picker({ action: { ...base }, advancedOpen: true });
    const fr = fixed.el.render();
    const kinds: Record<string, string> = { temperature: "number", flag: "boolean", mode: "native", label: "string" };
    for (const [key, type] of Object.entries(kinds)) {
      find(fr, "change", `id=source-${key}`).fn({ target: { value: "entity" } });
      expect(fixed.seen.slice(-1)[0].data_sources[key]).toEqual({ entity_id: "", type });
    }
  });
  it("shows the unavailable value and loads names once on update", async () => {
    const { el } = picker({ action: { kind: "service", service: "climate.set_temperature", data_sources: { temperature: { entity_id: "sensor.off", type: "number" } } } });
    expect(flat(el.render())).toContain("sensor.off");
    el.renderRoot = { querySelectorAll: () => [] };
    el.requestUpdate = vi.fn();
    el.updated(); el.updated();
    expect(el._loadedFor).toBe("climate.t");
  });
});

describe("wp-dialog", () => {
  const dlg = (props: Record<string, unknown> = {}) => {
    const el = new WpDialog() as any; Object.assign(el, { heading: "Title", open: true }, props);
    const seen: string[] = []; el.dispatchEvent = (e: any) => { seen.push(e.type); return true; };
    const panel: any = { style: {}, focus: vi.fn(), querySelector: () => null };
    el.renderRoot = { querySelector: () => panel };
    return { el, seen, panel };
  };
  it("renders nothing when closed and a labelled panel when open", () => {
    expect(flat(dlg({ open: false }).el.render())).toBe("");
    const html = flat(dlg({ wide: true }).el.render());
    expect(html).toContain("role=dialog"); expect(html).toContain("wide"); expect(html).toContain("Close");
    expect(flat(dlg({ columns: true }).el.render())).toContain("columns");
  });
  it("closes from the backdrop, the close button and Escape; expands from the explicit button", () => {
    const { el, seen } = dlg();
    const r = el.render();
    handlers(r).filter((h) => h.event === "click")[0].fn();
    expect(seen).toEqual(["closed"]); expect(el.open).toBe(false);
    el.open = true;
    find(el.render(), "click", "expand").fn();
    expect(flat(el.render())).toContain("mdi:arrow-collapse-horizontal");
    const stop = vi.fn();
    el._onKey({ key: "Enter", stopPropagation: stop }); expect(stop).not.toHaveBeenCalled();
    el._onKey({ key: "Escape", stopPropagation: stop }); expect(seen).toEqual(["closed", "escape", "closed"]);
    document.documentElement.lang = "fr"; el.open = true;
    expect(flat(el.render())).toContain("Fermer");
  });
  it("tracks open dialogs: only the newest answers Escape on the document", () => {
    vi.stubGlobal("requestAnimationFrame", (f: () => void) => f());
    const a = dlg().el, b = dlg().el;
    a.updated(new Map([["open", false]])); b.updated(new Map([["open", false]]));
    a.updated(new Map([["x", 1]]));
    a.updated(new Map([["open", false]]));
    b.updated(new Map([["open", false]]));
    const stop = vi.fn();
    a._onDocKey({ key: "Escape", defaultPrevented: false, stopPropagation: stop });
    expect(stop).not.toHaveBeenCalled();
    b._onDocKey({ key: "Escape", defaultPrevented: true, stopPropagation: stop });
    b._onDocKey({ key: "a", defaultPrevented: false, stopPropagation: stop });
    b._onDocKey({ key: "Escape", defaultPrevented: false, stopPropagation: stop });
    expect(stop).toHaveBeenCalledTimes(1); expect(b.open).toBe(false);
    a.open = false; a.updated(new Map([["open", true]]));
    expect(a._tracked).toBe(false);
    a.disconnectedCallback();
  });
  it("closes on a long downward swipe of the header on a phone only", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const Fake = class { tagName = ""; }; vi.stubGlobal("HTMLElement", Fake);
    const { el, panel, seen } = dlg();
    const p = (o: any) => ({ pointerType: "touch", pointerId: 1, clientX: 10, clientY: 0, composedPath: () => [], currentTarget: { setPointerCapture: vi.fn() }, ...o });
    el._hdown(p({})); el._hmove(p({ clientY: 60 }));
    expect(panel.style.transform).toBe("translateY(60px)");
    el._hup(p({ clientY: 60 })); expect(seen).toEqual([]);
    el._hdown(p({})); el._hmove(p({ clientY: 150 })); el._hup(p({ clientY: 150 }));
    expect(seen).toEqual(["closed"]);
    el._hdown(p({})); el._hmove(p({ pointerId: 9, clientY: 50 })); el._hup(p({ pointerId: 9 }));
    el._hcancel(); expect(panel.style.transform).toBe("");
    el._hdown(p({ pointerType: "mouse" })); el._hdown(p({ composedPath: () => [Object.assign(new Fake(), { tagName: "BUTTON" })] }));
    expect(el._sw).toBeUndefined();
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    el._hdown(p({})); expect(el._sw).toBeUndefined();
    el._hmove(p({})); el._hup(p({}));
  });
});
