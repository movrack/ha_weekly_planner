import { describe, expect, it, vi } from "vitest";
import { WpChartOptions } from "../components/chart-options";
import { t } from "../i18n";
import { flat, handlers } from "./helpers/tpl";

// Mutation survivors of the chart options: saving of the sources, aliases, states and the markup.
const prog = (revision = 1, sources: any[] = []) => ({ id: "p", name: "P", revision, area: "", priority: 1, enabled: true, reapply: true, conditions: [], profiles: [],
  entities: [{ entity_id: "cover.a", default_label: null, label_overrides: {}, chart_sources: sources }, { entity_id: "cover.b", default_label: null, label_overrides: {} }] });
const mk = (props: any = {}) => {
  const el: any = new WpChartOptions();
  const program = prog();
  el.hass = { language: "en", states: { "sensor.t": { entity_id: "sensor.t", state: "21", attributes: { unit_of_measurement: "°C", friendly_name: "Temp" } }, "switch.s": { entity_id: "switch.s", state: "on", attributes: { friendly_name: "Switch" } } },
    callWS: vi.fn(async (m: any) => m.type === "weekly_planner/get" ? { can_edit: true, read_only: false, programs: [prog()] } : { program: { ...prog(2), entities: m.program.entities } }) };
  el.data = { can_edit: true, read_only: false, programs: [program], labels: [], status: {} };
  el.program = program; el.entityId = "cover.a";
  el.dispatchEvent = vi.fn();
  el.willUpdate();
  Object.assign(el, props);
  return el;
};
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

describe("identity and reading", () => {
  it("a new program or device resets the draft, the answers and the saving count; the same one keeps them", () => {
    const el = mk();
    el._draft = [{ entity_id: "x", kind: "numeric" }]; el._saved = prog(2); el._saving = 2; el._error = "e"; el._done = true;
    el.willUpdate();
    expect([el._draft?.length, el._saving, el._error, el._done]).toEqual([1, 2, "e", true]);
    const g = el._generation;
    el.entityId = "cover.b";
    el.willUpdate();
    expect([el._draft, el._saved, el._saving, el._error, el._done]).toEqual([null, null, 0, "", false]);
    expect(el._generation).toBe(g + 1);
    el.program = { ...el.program, id: "q" };
    el.willUpdate();
    expect(el._generation).toBe(g + 2);
  });
  it("language, rights and the live program: the language of the locale first; editing needs the right and no read-only", () => {
    const el = mk();
    expect(el._lang).toBe("en");
    el.hass = { ...el.hass, locale: { language: "fr" } };
    expect(el._lang).toBe("fr");
    el.hass = { language: "de" };
    expect(el._lang).toBe("de");
    el.hass = {};
    expect(el._lang).toBe("en");
    el.hass = undefined;
    expect(el._lang).toBe("en");
    expect(el._editable).toBe(true);
    el.data = { can_edit: true, read_only: true };
    expect(el._editable).toBe(false);
    el.data = { can_edit: false, read_only: false };
    expect(el._editable).toBeFalsy();
    el.data = undefined;
    expect(el._editable).toBeUndefined();
    const live = mk();
    live._saved = prog(2, [{ entity_id: "sensor.t", kind: "numeric" }]);
    expect(live._live).toBe(live._saved);
    expect(live._sources).toEqual([{ entity_id: "sensor.t", kind: "numeric" }]);
    live._saved = prog(1, [{ entity_id: "sensor.t", kind: "numeric" }]);
    expect(live._live).toBe(live.program); // not newer
    live._saved = { ...prog(5), id: "other" };
    expect(live._live).toBe(live.program);
    live._saved = null;
    expect(live._sources).toEqual([]);
    live._draft = [{ entity_id: "z", kind: "states" }];
    expect(live._sources).toEqual([{ entity_id: "z", kind: "states" }]);
  });
});

describe("saving the sources", () => {
  const src = [{ entity_id: "sensor.t", kind: "numeric" }];
  it("saves on fresh data, tells the parent, shows 'saved' and drops the draft", async () => {
    const el = mk();
    el._change(src);
    expect([el._draft, el._saving, el._done, el._error]).toEqual([src, 1, false, ""]);
    await flush();
    const calls = el.hass.callWS.mock.calls.map((c: any[]) => c[0]);
    expect(calls[0]).toEqual({ type: "weekly_planner/get" });
    expect(calls[1].type).toBe("weekly_planner/program/save");
    expect(calls[1].program.entities[0].chart_sources).toEqual(src);
    expect(calls[1].program.entities[1].chart_sources).toBeUndefined();
    expect(el.dispatchEvent.mock.calls[0][0].type).toBe("chart-sources-saved");
    expect(el.dispatchEvent.mock.calls[0][0].detail.revision).toBe(2);
    expect([el._draft, el._done, el._saving]).toEqual([null, true, 0]);
    expect(el._saved.revision).toBe(2);
  });
  it("nothing is saved without the right to edit", () => {
    const el = mk();
    el.data = { can_edit: true, read_only: true };
    el._change(src);
    expect(el._draft).toBeNull();
    expect(el.hass.callWS).not.toHaveBeenCalled();
  });
  it("a conflict is retried once; a second one, a lost right or a vanished device is an error with its reason", async () => {
    const el = mk();
    let saves = 0;
    el.hass.callWS = vi.fn(async (m: any) => { if (m.type === "weekly_planner/get") return { can_edit: true, programs: [prog()] }; saves++; if (saves === 1) throw { code: "conflict" }; return { program: prog(2) }; });
    el._change(src);
    await flush();
    expect(saves).toBe(2);
    expect(el._done).toBe(true);
    const twice = mk();
    twice.hass.callWS = vi.fn(async (m: any) => { if (m.type === "weekly_planner/get") return { can_edit: true, programs: [prog()] }; throw { code: "conflict", message: "busy" }; });
    twice._change(src);
    await flush();
    expect(twice.hass.callWS.mock.calls.filter((c: any[]) => c[0].type === "weekly_planner/get")).toHaveLength(2);
    expect(twice._error).toBe(`${t("en", "chart_sources_save_failed")} busy`);
    expect([twice._draft, twice._saving]).toEqual([null, 0]);
    for (const fresh of [{ can_edit: false, read_only: false, programs: [prog()] }, { can_edit: true, read_only: true, programs: [prog()] }, { can_edit: true, programs: [] }, { can_edit: true, programs: [{ ...prog(), entities: [] }] }]) {
      const bad = mk();
      bad.hass.callWS = vi.fn(async () => fresh);
      bad._change(src);
      await flush();
      expect(bad._error).toContain(t("en", "chart_sources_save_failed"));
    }
    const plain = mk();
    plain.hass.callWS = vi.fn(async (m: any) => { if (m.type === "weekly_planner/get") return { can_edit: true, programs: [prog()] }; throw {}; });
    plain._change(src);
    await flush();
    expect(plain._error).toBe(t("en", "chart_sources_save_failed"));
  });
  it("an alias the server refuses has its own message; other refusals do not", async () => {
    const fail = async (code: string, message: string, alias: boolean) => {
      const el = mk();
      el.hass.callWS = vi.fn(async (m: any) => { if (m.type === "weekly_planner/get") return { can_edit: true, programs: [prog()] }; throw { code, message }; });
      el._change([{ entity_id: "sensor.t", kind: "numeric", ...(alias ? { alias: "A" } : {}) }]);
      await flush();
      return el._error;
    };
    expect(await fail("invalid", "bad alias", true)).toBe(t("en", "chart_alias_schema_failed"));
    expect(await fail("invalid_format", "alias too long", true)).toBe(t("en", "chart_alias_schema_failed"));
    expect(await fail("invalid", "bad alias", false)).toBe(`${t("en", "chart_sources_save_failed")} bad alias`);
    expect(await fail("other", "bad alias", true)).toBe(`${t("en", "chart_sources_save_failed")} bad alias`);
    expect(await fail("invalid", "something else", true)).toBe(`${t("en", "chart_sources_save_failed")} something else`);
    expect(await fail("invalid", "  ", true)).toBe(t("en", "chart_sources_save_failed"));
  });
  it("answers for another device or an older change are not applied; saves run one after the other", async () => {
    const el = mk();
    const order: string[] = [];
    el.hass.callWS = vi.fn(async (m: any) => { order.push(m.type === "weekly_planner/get" ? "get" : "save"); return m.type === "weekly_planner/get" ? { can_edit: true, programs: [prog()] } : { program: prog(2) }; });
    el._change(src);
    el._change([...src, { entity_id: "sensor.u", kind: "numeric" }]);
    await flush();
    expect(order).toEqual(["get", "save", "get", "save"]);
    expect(el._draft).toBeNull();
    const other = mk();
    other._change(src);
    other.entityId = "cover.b";
    other.willUpdate();
    await flush();
    expect(other.dispatchEvent).not.toHaveBeenCalled();
    expect(other._saving).toBe(0);
    const older = mk();
    older._change(src);
    older._sequence = 99;
    await flush();
    expect(older._done).toBe(false);
    expect(older._draft).toEqual(src);
  });
});

describe("adding, naming and choosing states", () => {
  it("a source is added with its kind and current state; the device itself, doubles and empty ids are ignored; four units are too many", () => {
    const el = mk();
    el._change = vi.fn();
    el._add("");
    el._add("cover.a");
    el._add("sensor.t");
    expect(el._change).toHaveBeenCalledTimes(1);
    expect(el._change.mock.calls[0][0]).toEqual([{ entity_id: "sensor.t", kind: "numeric" }]);
    el._draft = [{ entity_id: "sensor.t", kind: "numeric" }];
    el._add("sensor.t");
    expect(el._change).toHaveBeenCalledTimes(1);
    const s = mk(); s._change = vi.fn();
    s._add("switch.s");
    expect(s._change.mock.calls[0][0]).toEqual([{ entity_id: "switch.s", kind: "states", states: ["on"] }]);
    s.hass.states["switch.u"] = { entity_id: "switch.u", state: "unavailable", attributes: {} };
    s._draft = null;
    s._add("switch.u");
    expect(s._change.mock.calls[1][0]).toEqual([{ entity_id: "switch.u", kind: "states", states: [] }]);
    s._add("switch.missing");
    expect(s._change.mock.calls[2][0]).toEqual([{ entity_id: "switch.missing", kind: "states", states: [] }]);
    const full = mk(); full._change = vi.fn();
    for (const [i, u] of ["a", "b", "c"].entries()) full.hass.states[`sensor.${u}`] = { entity_id: `sensor.${u}`, state: "1", attributes: { unit_of_measurement: `U${i}` } };
    full._draft = ["a", "b", "c"].map((u) => ({ entity_id: `sensor.${u}`, kind: "numeric" }));
    full.hass.states["sensor.d"] = { entity_id: "sensor.d", state: "1", attributes: { unit_of_measurement: "U4" } };
    full._add("sensor.d");
    expect(full._change).not.toHaveBeenCalled();
    expect(full._error).toBe(t("en", "chart_sources_axes_full"));
  });
  it("an alias is trimmed, limited to 60 characters, and an empty one removes it", () => {
    const el = mk();
    el._change = vi.fn();
    el._draft = [{ entity_id: "sensor.t", kind: "numeric", alias: "Old" }, { entity_id: "sensor.u", kind: "numeric", alias: "Keep" }];
    const first = el._draft[0];
    el._alias(first, "  New ");
    expect(el._change.mock.calls[0][0]).toEqual([{ entity_id: "sensor.t", kind: "numeric", alias: "New" }, { entity_id: "sensor.u", kind: "numeric", alias: "Keep" }]);
    el._alias(first, "   ");
    expect(el._change.mock.calls[1][0][0]).toEqual({ entity_id: "sensor.t", kind: "numeric" });
    el._alias(first, "x".repeat(61));
    expect(el._change).toHaveBeenCalledTimes(2);
    el._alias(first, "x".repeat(60));
    expect(el._change).toHaveBeenCalledTimes(3);
  });
  it("a state is added to or removed from the chosen ones of one source only", () => {
    const el = mk();
    el._change = vi.fn();
    el._draft = [{ entity_id: "switch.s", kind: "states", states: ["on"] }, { entity_id: "switch.u", kind: "states" }];
    el._toggle(el._draft[0], "off");
    expect(el._change.mock.calls[0][0]).toEqual([{ entity_id: "switch.s", kind: "states", states: ["on", "off"] }, { entity_id: "switch.u", kind: "states" }]);
    el._toggle(el._draft[0], "on");
    expect(el._change.mock.calls[1][0][0].states).toEqual([]);
    el._toggle(el._draft[1], "on");
    expect(el._change.mock.calls[2][0][1].states).toEqual(["on"]);
  });
});

describe("markup", () => {
  it("nothing without data; sources show their name, unit, colour, alias field, a warning when missing and the states of a states source", () => {
    const el = mk();
    el._draft = [{ entity_id: "sensor.t", kind: "numeric", alias: "My T" }, { entity_id: "switch.s", kind: "states", states: ["on"] }, { entity_id: "sensor.gone", kind: "numeric" }];
    el.histories = {};
    const html = flat(el.render()).replace(/\s+/g, " ");
    expect(html).toContain(`<summary>${t("en", "chart_options")}</summary>`);
    expect(html).toContain("<span>Temp <small>");
    expect(html).toContain(`<small>${t("en", "chart_source_missing")}</small>`);
    expect(html.match(/chart_source_missing/g)?.length ?? html.split(t("en", "chart_source_missing")).length - 1).toBeGreaterThan(0);
    expect(html).toContain('<div class="states" role="group"');
    expect(html).toContain('placeholder=Temp');
    expect(html).toContain('maxlength="60"');
    expect(html).toContain(`aria-label=${t("en", "chart_source_remove", { name: "Temp" })}`);
    expect(html).toContain("mdi:close");
    expect(html).toContain("<wp-entity-picker");
    for (const drop of ["hass", "data", "program"]) { const e = mk(); e[drop] = undefined; expect(flat(e.render())).toBe(""); }
  });
  it("a read-only user cannot change anything: fields are disabled and there is no picker", () => {
    const el = mk();
    el.data = { can_edit: true, read_only: true };
    el._draft = [{ entity_id: "switch.s", kind: "states", states: ["on"] }];
    const html = flat(el.render());
    expect(html).not.toContain("<wp-entity-picker");
    const disabled: any[] = [];
    const walk = (v: any): void => { if (Array.isArray(v)) v.forEach(walk); else if (v?.strings) v.values.forEach((x: any, i: number) => { if (/\?disabled=$/.test(v.strings[i])) disabled.push(x); else walk(x); }); };
    walk(el.render());
    expect(disabled.length).toBeGreaterThan(0);
    expect(disabled.every((d) => d === true)).toBe(true);
  });
  it("the status line says saving, saved or nothing; an error is an alert; the buttons act on their source", () => {
    const el = mk();
    el._draft = [{ entity_id: "sensor.t", kind: "numeric" }, { entity_id: "switch.s", kind: "states", states: [] }];
    expect(flat(el.render())).not.toContain("tone-error");
    el._saving = 1;
    expect(flat(el.render())).toContain(t("en", "chart_sources_saving"));
    el._saving = 0; el._done = true;
    const done = flat(el.render());
    expect(done).toContain(t("en", "chart_sources_saved"));
    expect(done).not.toContain(t("en", "chart_sources_saving"));
    el._done = false; el._error = "Broken";
    expect(flat(el.render())).toContain('role="alert"');
    el._change = vi.fn(); el._add = vi.fn(); el._alias = vi.fn(); el._toggle = vi.fn();
    const hs = handlers(el.render());
    hs.find((h) => h.event === "click")!.fn();
    expect(el._change).toHaveBeenCalledWith([{ entity_id: "switch.s", kind: "states", states: [] }]);
    hs.find((h) => h.event === "wp-change")!.fn({ stopPropagation: vi.fn(), detail: "sensor.z" });
    expect(el._add).toHaveBeenCalledWith("sensor.z");
    const input = hs.find((h) => h.event === "change" && h.before.includes("maxlength"));
    if (input) { input.fn({ target: { value: "Z" } }); expect(el._alias).toHaveBeenCalled(); }
  });
});
