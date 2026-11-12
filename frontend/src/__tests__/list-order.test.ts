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
  });
  it("moveId moves and clamps", () => {
    expect(moveId(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveId(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    expect(moveId(["a", "b"], 5, 0)).toEqual(["a", "b"]);
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
  it("the compact list view is ordered too", () => {
    expect(flat(card({ sort: "name", schedule_view: "list" })._list(programs))).toBe("<c,b,a>");
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
  it("renders a handle and up/down buttons with labels; the field only shows outside one-program mode", () => {
    const { e } = editor();
    const t = flat(e._sortField());
    expect(t).toContain("List order");
    expect(t).toContain("Move Beta up");
    expect(t).toContain("Move Alpha down");
    expect(t).toContain("Drag Alpha");
    expect(flat(e._sortField())).toContain("disabled");
    e._config.sort = "type";
    expect(flat(e._sortField())).not.toContain("order-list");
  });
  it("ignores a move outside the list", () => {
    const { e, sent } = editor();
    e._move(["b", "a"], 0, -1);
    expect(sent).toHaveLength(0);
  });
});
