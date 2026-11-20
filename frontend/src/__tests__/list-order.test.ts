import { describe, expect, it } from "vitest";
import { groupItems, moveId, sortItems, sortMode, type Sortable } from "../list-order";
import { normalizeConfig } from "../config";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { WeeklyPlannerCardEditor } from "../card-editor";
import { flat } from "./helpers/tpl";

const it_ = (id: string, name: string, type: string, area?: string): Sortable => ({ id, name, type, area });
const items = [
  it_("1", "Salon", "cover", "Salon"), it_("2", "Bureau", "climate", "Bureau"), it_("3", "Zèbre", "cover"),
  it_("4", "Alpha", "climate", "Salon"), it_("5", "Lampe", "light", ""), it_("6", "Mystère", ""),
];
const label = (t: string) => ({ cover: "Volet", climate: "Thermostat", light: "Lumière" } as Record<string, string>)[t] ?? t;
const o = { typeLabel: label, lang: "fr" };
const ids = (l: Sortable[]) => l.map((i) => i.id);

describe("list order", () => {
  it("type: types A-Z by displayed name, then name; unknown type last", () => {
    expect(ids(sortItems(items, "type", o))).toEqual(["5", "4", "2", "1", "3", "6"]);
  });
  it("type order follows the card language labels, not the domain", () => {
    expect(ids(sortItems(items, "type", { ...o, typeLabel: (t) => ({ cover: "A", climate: "B", light: "C" } as any)[t] ?? t }))).toEqual(["1", "3", "4", "2", "5", "6"]);
  });
  it("area: rooms A-Z, names inside, no room last", () => {
    expect(ids(sortItems(items, "area", o))).toEqual(["2", "4", "1", "5", "6", "3"]);
  });
  it("an empty room is last, whichever side of the comparison it is on", () => {
    const a = (id: string, area: string) => ({ id, name: id, type: "t", area });
    expect(ids(sortItems([a("1", ""), a("2", "Bureau")], "area"))).toEqual(["2", "1"]);
    expect(ids(sortItems([a("2", "Bureau"), a("1", "")], "area"))).toEqual(["2", "1"]);
    expect(ids(sortItems([a("2", "Bureau"), a("1", ""), a("3", "Cave")], "area"))).toEqual(["2", "3", "1"]);
  });
  it("types without a label function sort by their domain", () => {
    const a = (id: string, type: string) => ({ id, name: id, type });
    expect(ids(sortItems([a("1", "zz"), a("2", "aa")], "type"))).toEqual(["2", "1"]);
  });
  it("name: A-Z whatever the type", () => {
    expect(ids(sortItems(items, "name", o))).toEqual(["4", "2", "5", "6", "1", "3"]);
  });
  it("is stable on equal names (id breaks the tie) and does not mutate", () => {
    const same = [it_("b", "X", "t"), it_("a", "X", "t")];
    expect(ids(sortItems(same, "name"))).toEqual(["a", "b"]);
    expect(ids(same)).toEqual(["b", "a"]);
  });
  it("custom: saved order, missing appended by type then name, unknown and duplicate ids ignored", () => {
    expect(ids(sortItems(items, "custom", { ...o, order: ["3", "gone", "1", "3"] }))).toEqual(["3", "1", "5", "4", "2", "6"]);
    expect(ids(sortItems(items, "custom", o))).toEqual(ids(sortItems(items, "type", o)));
  });
  it("headers only for type and area; Others group is last", () => {
    expect(groupItems(items, "type", o).map((g) => [g.key, g.header])).toEqual([["light", true], ["climate", true], ["cover", true], ["", true]]);
    expect(groupItems(items, "area", o).map((g) => g.key)).toEqual(["Bureau", "Salon", ""]);
    for (const m of ["name", "custom"] as const) expect(groupItems(items, m, o)).toHaveLength(1);
    expect(groupItems(items, "name", o)[0].header).toBe(false);
    const one = { id: "1", name: "1", type: "t" };
    expect(groupItems([one], "name")).toEqual([{ key: "", header: false, items: [one] }]);
    expect(groupItems([one], "custom")[0].key).toBe("");
  });
  it("sorts exactly like localeCompare (accents, case, digits, languages) and translates each type once", () => {
    const words = ["éclair", "Eclair", "eclair", "Zèbre", "zebre", "Ölf", "oelf", "Programme 10", "Programme 2", "ß", "ss", "_x", "", "Åsa", "Ana"];
    const many = words.map((w, i) => it_(`i${i}`, w, ["cover", "climate", ""][i % 3], w));
    for (const lang of ["fr", "de", "sv", "en", undefined]) {
      const ref = [...many].sort((a, b) => a.name.localeCompare(b.name, lang) || a.id.localeCompare(b.id));
      expect(ids(sortItems(many, "name", { lang }))).toEqual(ids(ref));
    }
    let calls = 0;
    sortItems(many, "type", { ...o, typeLabel: (t) => (calls++, label(t)) });
    expect(calls).toBe(2);
  });
  it("moveId moves and clamps", () => {
    expect(moveId(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveId(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    expect(moveId(["a", "b"], 5, 0)).toEqual(["a", "b"]);
    expect(moveId(["a", "b"], 2, 0)).toEqual(["a", "b"]);
    expect(moveId(["a", "b"], -1, 0)).toEqual(["a", "b"]);
    expect(moveId(["a", "b"], 1, 0)).toEqual(["b", "a"]);
    expect(moveId(["a", "b"], 0, 9)).toEqual(["b", "a"]);
  });
  it("sortMode defaults to type", () => {
    expect(sortMode(undefined)).toBe("type");
    expect(sortMode("bogus")).toBe("type");
    expect(sortMode("custom")).toBe("custom");
  });
});

describe("sort configuration", () => {
  it("keeps valid sort and order, drops wrong ones without touching the rest", () => {
    expect(normalizeConfig({ type: "x", sort: "area", order: ["a", "b"] })).toEqual({ type: "x", sort: "area", order: ["a", "b"] });
    expect(normalizeConfig({ type: "x", sort: "random", order: 3 })).toEqual({ type: "x" });
    expect(normalizeConfig({ type: "x", order: ["a", 1, ""] })).toEqual({ type: "x", order: ["a"] });
  });
});

const prog = (id: string, name: string, domain: string, area = "") => ({ id, name, area, revision: 1, priority: 0, enabled: true, reapply: true, conditions: [], profiles: [],
  entities: [{ entity_id: `${domain}.x`, default_label: null, label_overrides: {} }] });
const programs = [prog("a", "Zeta", "cover", "Salon"), prog("b", "Beta", "climate"), prog("c", "Alpha", "cover", "Salon")];

function card(config: any) {
  const c = new WeeklyPlannerCard() as any;
  c.hass = { language: "en", states: {}, localize: (k: string) => ({ "component.cover.title": "Cover", "component.climate.title": "Climate" } as any)[k] ?? "" };
  c._config = config;
  c._bySchedule = (ps: any[]) => `[${ps.map((p) => p.id)}]`;
  c._compactList = (ps: any[]) => `<${ps.map((p) => p.id)}>`;
  return c;
}

describe("card list", () => {
  it("defaults to type order with a heading per type", () => {
    const text = flat(card({})._list(programs));
    expect(text).toContain("Climate");
    expect(text.indexOf("[b]")).toBeLessThan(text.indexOf("[c,a]"));
    expect(text.indexOf("Cover")).toBeLessThan(text.indexOf("[c,a]"));
  });
  it("area: heading per room, Others last; name and custom: no heading", () => {
    const t = flat(card({ sort: "area" })._list(programs));
    expect(t).toContain("Salon");
    expect(t.indexOf("[c,a]")).toBeLessThan(t.indexOf("[b]"));
    expect(t).toContain("Others");
    expect(flat(card({ sort: "name" })._list(programs))).not.toContain("class=\"group\"");
    expect(flat(card({ sort: "custom", order: ["b", "gone", "a"] })._list(programs))).toBe("[b,a,c]");
  });
  it("area: merged spellings share one heading with the Home Assistant area name", () => {
    const c = card({ sort: "area" });
    c.hass.areas = { chambre_celine_manu: { area_id: "chambre_celine_manu", name: "Chambre Céline Manu" } };
    const t = flat(c._list([prog("x", "X", "cover", "chambre_celine_manu"), prog("y", "Y", "cover", "Chambre Céline Manu"), prog("z", "Z", "cover", "Bureau")]));
    expect(t.match(/class="group"/g)).toHaveLength(2);
    expect(t).toContain("Chambre Céline Manu");
    expect(t).not.toContain("chambre_celine_manu");
    expect(t.indexOf("Bureau")).toBeLessThan(t.indexOf("Chambre Céline Manu"));
  });
  it("the compact list view is ordered too", () => {
    expect(flat(card({ sort: "name", schedule_view: "list" })._list(programs))).toBe("<c,b,a>");
  });
  it("grouped list: group h2, program h3; name sort keeps h2", () => {
    const c = card({});
    c._bySchedule = WeeklyPlannerCard.prototype["_bySchedule"].bind(c);
    c._line = () => "";
    c._deviceTabs = () => ""; c._noSchedule = () => ""; c._disabledBadge = () => ""; c._programToggle = () => ""; c._shownDevice = () => "x.x"; c._open = () => {};
    const multi = [{ ...programs[0], entities: [programs[0].entities[0], programs[0].entities[0]] }];
    const grouped = flat(c._list(multi));
    expect(grouped).toContain('<h2 class="group">');
    expect(grouped).toContain("<h3>");
    expect(grouped).not.toMatch(/<h2>Zeta/);
    const plain = flat(card({ sort: "name" }) && Object.assign(c, { _config: { sort: "name" } })._list(multi));
    expect(plain).toContain("<h2>");
    expect(plain).not.toContain("<h3>");
  });
  it("raw domain is the fallback type name", () => {
    const c = card({}); c.hass.localize = undefined;
    expect(c._typeLabel("vacuum")).toBe("vacuum");
  });
});

describe("editor order list", () => {
  const editor = () => {
    const e = new WeeklyPlannerCardEditor() as any;
    e.hass = { language: "en", states: {}, user: { is_admin: true } };
    e._data = { programs, can_edit: true };
    e._config = { type: "x", filter: {}, sort: "custom", order: ["b", "ghost", "a"] };
    const sent: any[] = [];
    e._dispatch = (c: any) => sent.push(c);
    return { e, sent };
  };
  it("lists shown programs in the custom order and moves one", () => {
    const { e, sent } = editor();
    expect(e._customRows().map((r: any) => r.id)).toEqual(["b", "a", "c"]);
    e._move(["b", "a", "c"], 2, 1);
    expect(sent[sent.length - 1].order).toEqual(["b", "c", "a", "ghost"]);
  });
  it("the two content radios sit in a fieldset with a visible legend, and the hints are tied to their switch", () => {
    const { e } = editor();
    const t = flat(e.render());
    expect(t).toMatch(/<fieldset class="group"><legend>What the card shows<\/legend>/);
    expect(t).not.toContain("radiogroup");
    expect(t).toContain('id="ce-show-chart-hint"');
    expect(t).toContain('id="ce-chart-open-hint"');
    expect(t).toContain('id="ce-order-hint"');
    expect(t).toContain('aria-describedby="ce-order-hint"');
  });
  it("with a room chosen, the programs and the type chips below only list that room", () => {
    const { e } = editor();
    e._data = { programs: [
      { ...programs[0], name: "Alpha", area: "Bureau" }, { ...programs[1], name: "Beta", area: "bureau" }, { ...programs[2], name: "Gamma", area: "Cuisine" },
    ], can_edit: true };
    e._config = { type: "x", filter: { area: "Bureau" } };
    const t = flat(e.render());
    const list = t.slice(t.indexOf('class="program-list"'));
    expect(list).toContain("Alpha");
    expect(list).toContain("Beta");
    expect(list).not.toContain("Gamma");
    e._config = { type: "x", filter: {} };
    expect(flat(e.render())).toContain("Gamma");
    e._config = { type: "x", filter: { area: "Salon" } };
    expect(flat(e.render())).toContain("No program in the chosen rooms.");
  });
  it("the block reads intro, room chips, types, then the programs list that starts with All programs", () => {
    const { e } = editor();
    e._data = { programs: [{ ...programs[0], area: "Bureau" }, { ...programs[1], area: "Cuisine" }], can_edit: true };
    e._config = { type: "x", filter: {} };
    const t = flat(e.render());
    const at = (s: string) => t.indexOf(s);
    expect(at('<details class="display-programs">')).toBeGreaterThan(-1);
    const order = ["</summary>", "Choose what this card shows", 'id="ce-area-label"', 'id="ce-programs-label"', 'id="ce-all-hint"'].map(at);
    expect(order.every((i) => i > -1)).toBe(true);
    expect([...order]).toEqual([...order].sort((a, b) => a - b));
    expect(at("</details>")).toBeGreaterThan(at('id="ce-all-hint"'));
    // every field reads label, field, help (owner rule, 2026-11-15)
    const room = [at('id="ce-area-label"'), at("All rooms"), at('id="ce-area-help"')];
    expect(room.every((i) => i > -1) && room[0] < room[1] && room[1] < room[2]).toBe(true);
    const types = [at('id="ce-types-label"'), at("data-type="), at('id="ce-types-hint"')];
    expect(types.every((i) => i > -1) && types[0] < types[1] && types[1] < types[2]).toBe(true);
    expect(t).not.toContain('<select id="ce-area"');
    const chips = t.slice(at('id="ce-area-label"'), at('id="ce-area-help"'));
    expect(chips).toContain("All rooms");
    expect(chips).toContain("Bureau");
    expect(chips).toContain("Cuisine");
    expect(t).toContain("Programs you create later will also appear on this card.");
    expect(t).not.toContain("will no longer appear");
    e._config = { type: "x", filter: { programs: ["a"] } };
    const off = flat(e.render());
    expect(off).toContain("Only the programs turned on below are shown. Programs you create later will not appear on this card.");
    expect(off).not.toContain("Show all programs again");
  });
  it("room chips add and remove rooms (several can be chosen); All rooms clears them", () => {
    const { e } = editor();
    e._data = { programs: [{ ...programs[0], area: "Bureau" }, { ...programs[1], area: "Cuisine" }, { ...programs[2], area: "Salon" }], can_edit: true };
    const click = (filter: any) => {
      e._config = { type: "x", filter };
      const sent: any[] = [];
      e._setFilter = (f: any) => sent.push(f);
      const handlers: any[] = [];
      const walk = (v: any): void => { if (Array.isArray(v)) v.forEach(walk); else if (v?.strings) v.values.forEach((x: any, i: number) => { if (/@click=$/.test(v.strings[i]) && typeof x === "function") handlers.push(x); walk(x); }); };
      walk(e._roomField());
      return { sent, handlers }; // [0] = All rooms, then Bureau, Cuisine, Salon
    };
    let r = click({});
    r.handlers[1](); r.handlers[0]();
    expect(r.sent).toEqual([{ area: "Bureau" }, { area: undefined }]);
    r = click({ area: "Bureau" });
    r.handlers[2]();
    expect(r.sent).toEqual([{ area: ["Bureau", "Cuisine"] }]);
    r = click({ area: ["Bureau", "Cuisine"] });
    r.handlers[1]();
    expect(r.sent).toEqual([{ area: "Cuisine" }]);
    r.handlers[0]();
    expect(r.sent[1]).toEqual({ area: undefined });
    r = click({ area: ["Bureau", "Cuisine"] });
    expect(flat(e._roomField()).match(/aria-pressed="?true/g)).toHaveLength(2);
  });
  it("with several rooms chosen, the list below keeps the programs of all of them", () => {
    const { e } = editor();
    e._data = { programs: [
      { ...programs[0], name: "Alpha", area: "Bureau" }, { ...programs[1], name: "Beta", area: "Cuisine" }, { ...programs[2], name: "Gamma", area: "Salon" },
    ], can_edit: true };
    e._config = { type: "x", filter: { area: ["bureau", "Cuisine"] } };
    const t = flat(e.render());
    const list = t.slice(t.indexOf('class="program-list"'));
    expect(list).toContain("Alpha");
    expect(list).toContain("Beta");
    expect(list).not.toContain("Gamma");
  });
  it("renders a handle and up/down buttons with labels; the field only shows outside one-program mode", () => {
    const { e } = editor();
    const t = flat(e._sortField());
    expect(t).toContain("List order");
    expect(t).toContain("Move Beta up");
    expect(t).toContain("Move Alpha down");
    expect(t).toContain("Drag Alpha");
    expect(t).toContain('tabindex="-1" aria-hidden="true"');
    expect(t).toContain("disabled");
    expect(e._tr("ce_moved", { name: "Beta", n: "2", total: "3" })).toBe("Beta moved to position 2 of 3");
    expect(t).toContain("role=\"status\"");
    e._config.sort = "type";
    expect(flat(e._sortField())).not.toContain("order-list");
  });
  it("shows the custom hint only for Custom and marks the moved row", () => {
    const { e } = editor();
    expect(flat(e._sortField())).toContain("Use the arrows");
    e._move(["b", "a", "c"], 0, 1);
    expect(e._moved).toBe("b");
    expect(flat(e._sortField())).toContain("moved");
    e._config.sort = "name";
    expect(flat(e._sortField())).not.toContain("Use the arrows");
  });
  it("ignores a move outside the list", () => {
    const { e, sent } = editor();
    e._move(["b", "a"], 0, -1);
    expect(sent).toHaveLength(0);
  });
});
