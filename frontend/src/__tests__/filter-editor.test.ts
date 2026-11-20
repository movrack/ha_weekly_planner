import { describe, expect, it } from "vitest";
import { allPrograms, isOn, programRows, toggleAllOff, toggleProgram, toggleType, typeGroups, typeState } from "../filter-editor";
import { filterPrograms } from "../planner";
import type { PlannerData, Program } from "../types";

const progOf = (id: string, name: string, ents: string[], area = ""): Program => ({
  id, name, revision: 1, area, priority: 0, enabled: true, reapply: true, conditions: [], profiles: [],
  entities: ents.map((entity_id) => ({ entity_id, default_label: null, label_overrides: {} })),
} as any);
const prog = (id: string, ...ents: string[]): Program => progOf(id, id.toUpperCase(), ents);
const programs = [prog("a", "cover.x"), prog("b", "cover.y"), prog("c", "vacuum.z"), prog("d", "future.q")];
const data = { programs } as unknown as PlannerData;
const shown = (filter: any) => filterPrograms(data, { filter }).map((p) => p.id).sort();
const apply = (filter: any, patch: any) => { const f = { ...filter, ...patch }; for (const k of ["types", "programs"]) if (f[k] === undefined) delete f[k]; return f; };

describe("editor type groups and switches", () => {
  it("groups by domain with HA label and raw fallback, sorted by label", () => {
    const { groups } = typeGroups(programs, undefined, (t) => (t === "vacuum" ? "Aspirateur" : t === "cover" ? "Ouverture" : ""), "fr");
    expect(groups.map((g) => [g.type, g.label])).toEqual([["vacuum", "Aspirateur"], ["future", "future"], ["cover", "Ouverture"]].sort((a, b) => a[1].localeCompare(b[1], "fr")));
    expect(groups.find((g) => g.type === "cover")!.programs.map((p) => p.id)).toEqual(["a", "b"]);
  });
  it("keeps selected types without program and unknown selected ids", () => {
    const { groups, orphans } = typeGroups(programs, { types: ["retired"], programs: ["gone", "a"] }, (t) => t, "en");
    expect(groups.map((g) => g.type)).toContain("retired");
    expect(orphans).toEqual(["gone"]);
  });
  it("legacy types-only config: matching programs are on, others off", () => {
    const f = { types: ["cover"] };
    expect(programs.map((p) => isOn(p, f))).toEqual([true, true, false, false]);
    const g = typeGroups(programs, f, (t) => t, "en").groups;
    expect(g.map((x) => [x.type, typeState(x, programs, f)])).toContainEqual(["cover", "on"]);
    expect(g.map((x) => [x.type, typeState(x, programs, f)])).toContainEqual(["vacuum", "off"]);
  });
  it("one program off makes the type partial and the card shows exactly the rest", () => {
    const f = apply({}, toggleProgram(programs, {}, "a", false));
    expect(shown(f)).toEqual(["b", "c", "d"]);
    const cover = typeGroups(programs, f, (t) => t, "en").groups.find((x) => x.type === "cover")!;
    expect(typeState(cover, programs, f)).toBe("partial");
  });
  it("type switch off/on selects all of its programs only", () => {
    const off = apply({}, toggleType(programs, {}, "cover", false));
    expect(shown(off)).toEqual(["c", "d"]);
    const on = apply(off, toggleType(programs, off, "cover", true));
    expect(shown(on)).toEqual(["a", "b", "c", "d"]);
  });
  it("enabling a program outside a legacy type filter widens types without revealing its siblings", () => {
    const f0 = { types: ["cover"] };
    const f = apply(f0, toggleProgram(programs, f0, "c", true));
    expect(f.types).toEqual(["cover", "vacuum"]);
    expect(shown(f)).toEqual(["a", "b", "c"]);
    const f2 = apply(f0, toggleType(programs, f0, "cover", false));
    expect(shown(f2)).toEqual([]);
  });
  it("keeps orphan ids and empty selected types; removing an empty type is explicit", () => {
    const f0 = { types: ["cover", "retired"], programs: ["gone", "a"] };
    const f = apply(f0, toggleProgram(programs, f0, "b", true));
    expect(f.programs).toEqual(["a", "b", "gone"]);
    expect(f.types).toEqual(["cover", "retired"]);
    expect(apply(f, toggleType(programs, f, "retired", false)).types).toEqual(["cover"]);
  });
  it("master switch: on clears every restriction, off selects nothing but keeps types", () => {
    expect(apply({ types: ["cover"], programs: ["a"] }, allPrograms())).toEqual({});
    expect(shown(apply({}, toggleAllOff(programs, {})))).toEqual([]);
    expect(toggleAllOff(programs, { types: ["cover"] }).types).toEqual(["cover"]);
  });
});

describe("programs designated by name", () => {
  const named = (id: string, name: string, ...ents: string[]): Program => ({ ...prog(id, ...ents), name });
  const list = [named("a1", "Bureau", "light.a"), named("b2", "Lampe du salon", "light.b"), named("c3", "Éléphant", "cover.c"), named("d4", "bureau", "cover.d"), named("e5", "e5", "cover.e")];
  const nd = { programs: list } as unknown as PlannerData;
  const ids = (cfg: any) => filterPrograms(nd, cfg).map((p) => p.id).sort();
  it("matches a name, case and accent insensitive, trimmed", () => {
    expect(ids({ filter: { programs: ["  LAMPE DU SALON "] } })).toEqual(["b2"]);
    expect(ids({ filter: { programs: ["elephant"] } })).toEqual(["c3"]);
    expect(ids({ filter: { programs: ["éLÉPHANT"] } })).toEqual(["c3"]);
  });
  it("duplicate names: all matching programs shown", () => {
    expect(ids({ filter: { programs: ["Bureau"] } })).toEqual(["a1", "d4"]);
  });
  it("unmatched entry ignored silently; empty list still none", () => {
    expect(ids({ filter: { programs: ["Nope", "a1"] } })).toEqual(["a1"]);
    expect(ids({ filter: { programs: ["Nope"] } })).toEqual([]);
    expect(ids({ filter: { programs: [] } })).toEqual([]);
  });
  it("mixed ids and names; id configs unchanged", () => {
    expect(ids({ filter: { programs: ["c3", "Lampe du salon"] } })).toEqual(["b2", "c3"]);
    expect(ids({ filter: { programs: ["a1"] } })).toEqual(["a1"]);
  });
  it("id wins over a name equal to it", () => {
    const l = [named("x", "y"), named("y", "other")];
    expect(filterPrograms({ programs: l } as unknown as PlannerData, { filter: { programs: ["y"] } }).map((p) => p.id)).toEqual(["y"]);
  });
  it("program accepts a name or an id", () => {
    expect(ids({ program: "Bureau" })).toEqual(["a1", "d4"]);
    expect(ids({ program: "c3" })).toEqual(["c3"]);
    expect(ids({ program: "Unknown" })).toEqual([]);
  });
  it("combines with type filter", () => {
    expect(ids({ filter: { types: ["cover"], programs: ["Bureau"] } })).toEqual(["d4"]);
  });
  it("editor: a name counts as selecting; edit rewrites ids, keeps unmatched", () => {
    const f = { programs: ["Lampe du salon", "ghost"] };
    expect(list.map((p) => isOn(p, f, list))).toEqual([false, true, false, false, false]);
    expect(typeGroups(list, f, (t) => t, "en").orphans).toEqual(["ghost"]);
    expect(toggleProgram(list, f, "a1", true).programs).toEqual(["a1", "b2", "ghost"]);
    expect(toggleProgram(list, f, "b2", false).programs).toEqual(["ghost"]);
    expect(toggleType(list, { programs: ["Bureau"] }, "light", true).programs).toEqual(["a1", "b2", "d4"]);
  });
});

describe("multi-type programs: one row, quick type helper", () => {
  const multi = [prog("t", "climate.bureau", "cover.bureau"), prog("u", "cover.salon"), prog("v", "climate.salon")];
  const label = (t: string) => t;
  it("lists each program once, with all its devices", () => {
    const rows = programRows(multi, (id) => id.toUpperCase(), "en");
    expect(rows.map((r) => r.id)).toEqual(["t", "u", "v"]);
    expect(rows[0].domains).toEqual(["climate", "cover"]);
    expect(rows[0].devices).toEqual(["CLIMATE.BUREAU", "COVER.BUREAU"]);
  });
  it("type groups count distinct programs per type", () => {
    const { groups } = typeGroups(multi, {}, label, "en");
    expect(groups.map((g) => [g.type, g.programs.length])).toEqual([["climate", 2], ["cover", 2]]);
    const f = apply({}, toggleProgram(multi, {}, "t", false));
    expect(groups.map((g) => typeState(g, multi, f))).toEqual(["partial", "partial"]);
    expect(multi.filter((p) => isOn(p, f, multi)).length).toBe(2);
  });
  it("a type helper toggles the multi-type program without duplicating it", () => {
    const off = apply({}, toggleType(multi, {}, "cover", false));
    expect(filterPrograms({ programs: multi } as unknown as PlannerData, { filter: off }).map((p) => p.id)).toEqual(["v"]);
    const on = apply(off, toggleType(multi, off, "cover", true));
    expect(filterPrograms({ programs: multi } as unknown as PlannerData, { filter: on }).map((p) => p.id).sort()).toEqual(["t", "u", "v"]);
    expect(on.programs).toEqual(["t", "u", "v"]);
  });
});

describe("a room is chosen: only the listed programs change", () => {
  const visible = [programs[0], programs[1]]; // a, b (both covers); c and d are in another room
  it("master switch off deselects the listed programs only", () => {
    const f = apply({}, toggleAllOff(programs, {}, visible));
    expect(f.programs.sort()).toEqual(["c", "d"]);
  });
  it("master switch off without a room still selects nothing", () => {
    expect(apply({}, toggleAllOff(programs, {})).programs).toEqual([]);
  });
  it("a type switch only touches the listed members of that type", () => {
    const off = apply({}, toggleType(programs, {}, "cover", false, visible));
    expect(off.programs.sort()).toEqual(["c", "d"]);
    const on = apply(off, toggleType(programs, off, "cover", true, [programs[0]]));
    expect(on.programs.sort()).toEqual(["a", "c", "d"]);
  });
});

// The "programs to display" logic: edge cases of switches, groups, rows and the program just created.

describe("isOn", () => {
  it("without a filter everything is on; a program name selects when no list of programs is given", () => {
    const p = progOf("a", "Alpha", ["cover.x"]);
    expect(isOn(p)).toBe(true);
    expect(isOn(p, undefined)).toBe(true);
    expect(isOn(p, { programs: ["a"] })).toBe(true);
    expect(isOn(p, { programs: ["b"] })).toBe(false);
    expect(isOn(p, { programs: [] })).toBe(false);
    expect(isOn(p, { types: [] })).toBe(true);
  });
  it("one matching domain is enough", () => {
    const two = progOf("m", "M", ["cover.x", "light.y"]);
    expect(isOn(two, { types: ["cover"] })).toBe(true);
    expect(isOn(two, { types: ["fan"] })).toBe(false);
    expect(isOn(two, { types: ["fan", "light"], programs: ["m"] })).toBe(true);
  });
});

describe("groups and rows", () => {
  const label = (t: string) => (t === "x" ? "Same" : t === "y" ? "Same" : "");
  it("groups with the same label are ordered by type; programs with the same name by id; empty types are ignored", () => {
    const programs = [progOf("b", "Same", ["y.1"]), progOf("a", "Same", ["x.1"]), progOf("c", "Same", ["x.2"]), progOf("d", "Same", ["x.3"])];
    const { groups } = typeGroups(programs, { types: ["", "z"] }, label, "en");
    expect(groups.map((g) => g.type)).toEqual(["x", "y", "z"]);
    expect(groups[0].programs.map((p) => p.id)).toEqual(["a", "c", "d"]);
    expect(groups.find((g) => g.type === "z")!.label).toBe("z");
    expect(groups.map((g) => g.type)).not.toContain("");
  });
  it("names sort by language, then ids; rows carry the domains and the device names", () => {
    const programs = [progOf("2", "Zed", ["light.a", "light.b", "cover.c"]), progOf("1", "Zed", ["cover.d"]), progOf("0", "alpha", ["fan.e"])];
    const rows = programRows(programs, (e) => e.toUpperCase(), "en");
    expect(rows.map((r) => r.id)).toEqual(["0", "1", "2"]);
    expect(rows[2]).toEqual({ id: "2", name: "Zed", domains: ["light", "cover"], devices: ["LIGHT.A", "LIGHT.B", "COVER.C"] });
  });
});

describe("type state", () => {
  it("an empty type is on without a type filter or when listed, off otherwise", () => {
    const g = { type: "retired", label: "r", programs: [] };
    expect(typeState(g, [])).toBe("on");
    expect(typeState(g, [], { types: [] })).toBe("on");
    expect(typeState(g, [], { types: ["retired"] })).toBe("on");
    expect(typeState(g, [], { types: ["other"] })).toBe("off");
  });
});

describe("switches", () => {
  const programs = [progOf("a", "A", ["cover.x"]), progOf("c", "C", ["vacuum.z"])];
  it("a program switched on widens the types to its domains; switched off it never does; unknown ids widen nothing", () => {
    expect(toggleProgram(programs, { types: ["cover"] }, "c", true)).toEqual({ programs: ["a", "c"], types: ["cover", "vacuum"] });
    expect(toggleProgram(programs, { types: ["cover"] }, "c", false)).toEqual({ programs: ["a"], types: ["cover"] });
    expect(toggleProgram(programs, { types: ["cover"] }, "zz", true)).toEqual({ programs: ["a"], types: ["cover"] });
    expect(toggleProgram(programs, undefined, "a", false)).toEqual({ programs: ["c"] });
  });
  it("a type switched on widens the types with it; off with members keeps the type; off without members removes it", () => {
    expect(toggleType(programs, { types: ["cover"] }, "vacuum", true)).toEqual({ programs: ["a", "c"], types: ["cover", "vacuum"] });
    expect(toggleType(programs, { types: ["cover", "vacuum"] }, "vacuum", false)).toEqual({ programs: ["a"], types: ["cover", "vacuum"] });
    expect(toggleType(programs, { types: ["cover", "retired"] }, "retired", false).types).toEqual(["cover"]);
    expect(toggleType(programs, { types: ["cover", "retired"] }, "retired", true).types).toEqual(["cover", "retired"]);
    expect(toggleType(programs, { types: ["cover"] }, "vacuum", false).types).toEqual(["cover"]);
    expect(toggleType(programs, undefined, "vacuum", false)).toEqual({ programs: ["a"] });
    expect(toggleType(programs, { types: ["cover"] }, "cover", false, [programs[1]]).programs).toEqual(["a"]); // only visible programs change (a is not visible, so it keeps its state)
  });
  it("orphan references are kept as they are", () => {
    expect(toggleProgram(programs, { programs: ["gone", "a"] }, "c", true)).toEqual({ programs: ["a", "c", "gone"] });
  });
});
