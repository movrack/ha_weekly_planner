import { describe, expect, it } from "vitest";
import { labelName, linkedValueText, presetTemperature } from "../labels";

const act = (preset: string, extra: object = {}) => ({ kind: "service" as const, service: "climate.set_preset_mode", data: { preset_mode: preset }, ...extra });
const vt = (comfort: unknown, presets = ["eco", "comfort"]) => ({ entity_id: "climate.x", state: "heat", attributes: { preset_modes: presets, comfort_temp: comfort, eco_temp: 15 } });
const hass = (states: Record<string, any>, unit?: string): any => ({
  language: "fr", states: Object.fromEntries(Object.entries(states).map(([k, v]) => [k, { ...v, entity_id: k }])), config: { time_zone: "UTC", unit_system: unit ? { temperature: unit } : undefined },
});

describe("preset temperature in a setting's name", () => {
  const label = { name: "Comfort", action: act("comfort"), show_value: true };

  it("adds the value read from the thermostat, and follows it when it changes", () => {
    expect(labelName(hass({ "climate.a": vt(19) }), label, "climate.a")).toBe("Comfort (19 °C)");
    expect(labelName(hass({ "climate.a": vt(20.5) }), label, "climate.a")).toBe("Comfort (20,5 °C)");
  });
  it("is off by default and for other actions", () => {
    const h = hass({ "climate.a": vt(19) });
    expect(labelName(h, { ...label, show_value: false }, "climate.a")).toBe("Comfort");
    expect(labelName(h, { name: "Cool", action: { kind: "service", service: "climate.set_hvac_mode", data: { hvac_mode: "cool" } }, show_value: true }, "climate.a")).toBe("Cool");
    expect(labelName(h, { name: "Comfort", show_value: true })).toBe("Comfort");
  });
  it("uses the unit of the instance", () => {
    expect(labelName(hass({ "climate.a": vt(66) }, "°F"), label, "climate.a")).toBe("Comfort (66 °F)");
  });
  it("shows nothing when the value cannot be read", () => {
    expect(labelName(hass({ "climate.a": vt(undefined) }), label, "climate.a")).toBe("Comfort");
    expect(labelName(hass({ "climate.a": vt("") }), label, "climate.a")).toBe("Comfort");
    expect(labelName(hass({}), label, "climate.a")).toBe("Comfort");
    expect(presetTemperature(hass({}), { kind: "scene", scene: "scene.x" })).toBeUndefined();
    expect(presetTemperature(hass({}), { kind: "service", service: "climate.set_preset_mode" })).toBeUndefined();
  });
  it("reads the nested preset_temperatures attribute, else the number entity; 0 means unused", () => {
    const nested = { entity_id: "climate.a", state: "heat", attributes: { preset_modes: ["comfort"], preset_temperatures: { comfort_temp: 19 } } };
    expect(labelName(hass({ "climate.a": nested }), label, "climate.a")).toBe("Comfort (19 °C)");
    const bare = { entity_id: "climate.a", state: "heat", attributes: { preset_modes: ["comfort"] } };
    const number = { entity_id: "number.a_preset_comfort_temp", state: "21", attributes: {} };
    expect(labelName(hass({ "climate.a": bare, [number.entity_id]: number }), label, "climate.a")).toBe("Comfort (21 °C)");
    const zero = { ...nested, attributes: { ...nested.attributes, preset_temperatures: { comfort_temp: 0 } } };
    expect(labelName(hass({ "climate.a": zero, [number.entity_id]: { ...number, state: "unavailable" } }), label, "climate.a")).toBe("Comfort");
  });
  it("reads a numeric string", () => {
    expect(presetTemperature(hass({ "climate.a": vt("19.5") }), act("comfort"), "climate.a")).toBe(19.5);
  });
  it("without a device: shown only when every thermostat agrees", () => {
    const same = hass({ "climate.a": vt(19), "climate.b": vt(19), "sensor.s": { entity_id: "s", state: "1", attributes: {} } });
    expect(labelName(same, label)).toBe("Comfort (19 °C)");
    expect(labelName(hass({ "climate.a": vt(19), "climate.b": vt(21) }), label)).toBe("Comfort");
    expect(labelName(hass({ "climate.a": vt(19, ["eco"]) }), label)).toBe("Comfort");
  });
  it("the action's own target wins over the device", () => {
    const h = hass({ "climate.a": vt(19), "climate.b": vt(21) });
    expect(labelName(h, { ...label, action: act("comfort", { target_entity_id: "climate.b" }) }, "climate.a")).toBe("Comfort (21 °C)");
  });
});

import { vi } from "vitest";
import { flat, handlers } from "./helpers/tpl";
import { WpLabelPicker } from "../components/label-picker";

describe("value read from a linked entity", () => {
  const cover = (sources: any) => ({ name: "Favourite", show_value: true, action: { kind: "service" as const, service: "cover.set_cover_position", data_sources: sources } });
  const states = { "number.fav": { state: "40", attributes: { unit_of_measurement: "%" } }, "sensor.mode": { state: "eco", attributes: {} }, "sensor.t": { state: "unavailable", attributes: {} },
    "climate.a": { state: "heat", attributes: { temperature: 21.5 } } };
  it("shows the entity's value with its unit, for any kind of action", () => {
    expect(labelName(hass(states), cover({ position: { entity_id: "number.fav", type: "number" } }))).toBe("Favourite (40 %)");
    expect(labelName(hass(states), cover({ mode: { entity_id: "sensor.mode", type: "string" } }))).toBe("Favourite (eco)");
    expect(labelName(hass(states), cover({ t: { entity_id: "climate.a", attribute: "temperature", type: "number" } }))).toBe("Favourite (21,5)");
  });
  it("joins several values and leaves out unreadable ones", () => {
    const l = cover({ a: { entity_id: "number.fav", type: "number" }, b: { entity_id: "sensor.t", type: "number" }, c: { entity_id: "sensor.mode", type: "string" }, d: { entity_id: "sensor.none", type: "string" } });
    expect(labelName(hass(states), l)).toBe("Favourite (40 %, eco)");
    expect(linkedValueText(hass(states), cover({ b: { entity_id: "sensor.t", type: "number" } }).action)).toBeUndefined();
  });
  it("falls back to the plain name when off, without sources or for a scene", () => {
    expect(labelName(hass(states), { ...cover({ p: { entity_id: "number.fav", type: "number" } }), show_value: false })).toBe("Favourite");
    expect(labelName(hass(states), cover(undefined))).toBe("Favourite");
    expect(linkedValueText(hass(states), { kind: "scene", scene: "scene.x" })).toBeUndefined();
  });
});

describe("label form option", () => {
  const preset = { id: "c", name: "Comfort", color: "#26a69a", action: act("comfort"), show_value: true };
  const picker = () => {
    const el: any = new WpLabelPicker();
    el.hass = { language: "en", states: {}, config: { time_zone: "UTC" }, callWS: vi.fn(async () => ({ label: { id: "c" }, programs: [] })) };
    el.data = { labels: [preset], programs: [], status: {} };
    el.program = { id: "p", revision: 1, entities: [{ entity_id: "climate.a", default_label: null, label_overrides: {} }], profiles: [] };
    el.entityIds = ["climate.a"];
    el.value = "c";
    el.dispatchEvent = vi.fn();
    return el;
  };
  it("is offered for a preset mode only, loaded from the label and saved", async () => {
    const el = picker();
    el._open(true);
    expect([el._canShowValue, el._showValue]).toEqual([true, true]);
    el._set({ showValue: false });
    expect(el._draft().showValue).toBe(false);
    el._set({ showValue: true });
    await el._save();
    expect(el.hass.callWS.mock.calls[0][0].label.show_value).toBe(true);
    el._set({ action: { kind: "service", service: "cover.open_cover" } });
    expect(el._canShowValue).toBe(false);
    el._set({ action: { kind: "service", service: "cover.set_cover_position", data_sources: { position: { entity_id: "number.f", type: "number" } } } });
    expect(el._canShowValue).toBe(true);
  });
  it("the title of the open form follows the box before saving", () => {
    const el = picker();
    el.hass.states = { "climate.a": { entity_id: "climate.a", state: "heat", attributes: { preset_temperatures: { comfort_temp: 19 } } } };
    el.data = { labels: [{ ...preset, show_value: false }], programs: [], status: {} };
    el._open(true);
    const text = () => JSON.stringify(flat(el.render()));
    expect(text()).not.toContain("Comfort (19 °C)");
    el._set({ showValue: true });
    expect(text()).toContain("Comfort (19 °C)");
  });
  it("an embedded form has its own save and cancel: save asks the parent to save the setting", () => {
    const el = picker();
    el.embedded = true;
    el._open(true);
    const tpl = el._renderForm();
    expect(flat(tpl)).toContain("Save the setting");
    const clicks = handlers(tpl).filter((h) => h.event === "click");
    clicks[clicks.length - 2].fn();
    expect(el.dispatchEvent.mock.calls.at(-1)[0].type).toBe("label-commit");
    clicks[clicks.length - 1].fn();
    expect(el._form).toBe(false);
  });
});

import { replaceLabel, usesLabel } from "../labels";

const slot = (label: string) => ({ id: label, label, start: { time: "07:00" } }) as any;
const program = (): any => ({
  id: "p", revision: 3, name: "Bureau",
  entities: [{ entity_id: "climate.a", default_label: "old", label_overrides: { old: act("eco"), other: act("comfort") } }],
  profiles: [{ id: "m", name: "M", days: [[slot("old"), slot("keep")], [], [], [], [], [], []], holiday: { day: [slot("old")] } }],
});

describe("replacing a setting everywhere", () => {
  it("replaces it in the slots, the rest of the time and the day off; drops its values for a device", () => {
    const out = replaceLabel(program(), "old", "new");
    expect(out.profiles[0].days[0].map((s: any) => s.label)).toEqual(["new", "keep"]);
    expect((out.profiles[0].holiday as any).day[0].label).toBe("new");
    expect(out.entities[0].default_label).toBe("new");
    expect(Object.keys(out.entities[0].label_overrides)).toEqual(["other"]);
    expect(out.revision).toBe(3);
    expect(usesLabel(out, "old")).toBe(false);
    expect(usesLabel(program(), "old")).toBe(true);
  });
  it("leaves a program that has no day off or no override alone", () => {
    const p = program();
    p.profiles[0].holiday = { copy: 0 };
    p.entities[0].label_overrides = undefined;
    const out = replaceLabel(p, "old", "new");
    expect(out.profiles[0].holiday).toEqual({ copy: 0 });
    expect(out.entities[0].label_overrides).toEqual({});
    const none = program();
    none.profiles[0].holiday = null;
    expect(replaceLabel(none, "old", "new").profiles[0].holiday).toBeNull();
  });
});

describe("replace and delete in the picker", () => {
  const make = (programs: any[], callWS: any) => {
    const el: any = new WpLabelPicker();
    el.hass = { language: "en", states: {}, config: { time_zone: "UTC" }, callWS };
    el.data = { labels: [{ id: "old", name: "Old", color: "#111111", action: act("eco") }, { id: "new", name: "New", color: "#222222", action: act("eco") }], programs, status: {} };
    el.program = programs[0];
    el.entityIds = ["climate.a"];
    el.value = "old";
    el.dispatchEvent = vi.fn();
    return el;
  };
  it("saves every program that uses it with the replacement, then deletes it, then tells the window", async () => {
    const callWS = vi.fn(async (m: any) => (m.type === "weekly_planner/program/save" ? { program: { ...m.program, revision: 4 } } : undefined));
    const el = make([program()], callWS);
    el._confirmDel = true;
    await el._replaceAndDelete(el.data.labels[0]);
    expect(callWS).not.toHaveBeenCalled();  // nothing chosen yet
    el._replaceBy = "new";
    await el._replaceAndDelete(el.data.labels[0]);
    expect(callWS.mock.calls.map((c: any[]) => c[0].type)).toEqual(["weekly_planner/program/save", "weekly_planner/label/delete"]);
    expect(callWS.mock.calls[0][0].program.profiles[0].days[0][0].label).toBe("new");
    const events = el.dispatchEvent.mock.calls.map(([e]: any[]) => [e.type, e.detail]);
    expect(events).toContainEqual(["label-replaced", { from: "old", to: "new", revisions: { p: 4 } }]);
    expect(events).toContainEqual(["label-change", "new"]);
    expect([el._confirmDel, el._replaceBy, el._saving]).toEqual([false, null, false]);
  });
  it("a refused save stops before the delete and says why", async () => {
    const reject = (code: string) => vi.fn(async () => { throw { code }; });
    const el = make([program()], reject("conflict"));
    el._replaceBy = "new";
    await el._replaceAndDelete(el.data.labels[0]);
    expect(el._delError).toContain("changed elsewhere");
    expect(el._saving).toBe(false);
    el.hass.callWS = reject("unauthorized");
    await el._replaceAndDelete(el.data.labels[0]);
    expect(el._delError).toContain("administrator");
    el.hass.callWS = reject("x");
    await el._replaceAndDelete(el.data.labels[0]);
    expect(el._delError).toBeTruthy();
  });
  it("the choice is made with chips among the other settings", () => {
    const el = make([program()], vi.fn());
    const tpl = el._renderDelete(el.data.labels[0]);
    expect(flat(tpl)).toContain("New");
    handlers(tpl).filter((h: any) => h.event === "click")[0].fn();
    expect(el._replaceBy).toBe("new");
  });
});

import { WpSchedule } from "../components/schedule-dialog";

describe("the schedule window follows a setting replaced and deleted", () => {
  it("replaces it in its draft (with the new revision), the rest-of-time choice, the open row and the picker", () => {
    const view: any = new WpSchedule();
    view._draft = program();
    view._restLabel = "old";
    view._group = { slot: slot("old") };
    const key = view._pickerKey;
    view._onLabelReplaced({ from: "old", to: "new", revisions: { p: 9 } });
    expect(view._draft.revision).toBe(9);
    expect(view._draft.profiles[0].days[0][0].label).toBe("new");
    expect([view._restLabel, view._group.slot.label, view._pickerKey]).toEqual(["new", "new", key + 1]);
    // another program, another row: left as they are
    view._draft = { ...program(), id: "q" };
    view._restLabel = "keep";
    view._group = { slot: slot("keep") };
    view._onLabelReplaced({ from: "old", to: "new", revisions: { p: 9 } });
    expect([view._draft.revision, view._restLabel, view._group.slot.label]).toEqual([3, "keep", "keep"]);
    view._draft = null;
    view._group = null;
    view._onLabelReplaced({ from: "old", to: "new", revisions: {} });
  });
});
