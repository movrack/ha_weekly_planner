import { describe, expect, it } from "vitest";
import { isOn, programRows, selectCreated, toggleAllOff, toggleProgram, toggleType, typeGroups, typeState } from "../filter-editor";
import type { Program } from "../types";

// Mutation survivors of the "programs to display" logic.
const prog = (id: string, name: string, ents: string[], area = ""): Program => ({
  id, name, revision: 1, area, priority: 0, enabled: true, reapply: true, conditions: [], profiles: [],
  entities: ents.map((entity_id) => ({ entity_id, default_label: null, label_overrides: {} })),
} as any);

describe("isOn", () => {
  it("without a filter everything is on; a program name selects when no list of programs is given", () => {
    const p = prog("a", "Alpha", ["cover.x"]);
    expect(isOn(p)).toBe(true);
    expect(isOn(p, undefined)).toBe(true);
    expect(isOn(p, { programs: ["a"] })).toBe(true);
    expect(isOn(p, { programs: ["b"] })).toBe(false);
    expect(isOn(p, { programs: [] })).toBe(false);
    expect(isOn(p, { types: [] })).toBe(true);
  });
  it("one matching domain is enough", () => {
    const two = prog("m", "M", ["cover.x", "light.y"]);
    expect(isOn(two, { types: ["cover"] })).toBe(true);
    expect(isOn(two, { types: ["fan"] })).toBe(false);
    expect(isOn(two, { types: ["fan", "light"], programs: ["m"] })).toBe(true);
  });
});

describe("groups and rows", () => {
  const label = (t: string) => (t === "x" ? "Same" : t === "y" ? "Same" : "");
  it("groups with the same label are ordered by type; programs with the same name by id; empty types are ignored", () => {
    const programs = [prog("b", "Same", ["y.1"]), prog("a", "Same", ["x.1"]), prog("c", "Same", ["x.2"]), prog("d", "Same", ["x.3"])];
    const { groups } = typeGroups(programs, { types: ["", "z"] }, label, "en");
    expect(groups.map((g) => g.type)).toEqual(["x", "y", "z"]);
    expect(groups[0].programs.map((p) => p.id)).toEqual(["a", "c", "d"]);
    expect(groups.find((g) => g.type === "z")!.label).toBe("z");
    expect(groups.map((g) => g.type)).not.toContain("");
  });
  it("names sort by language, then ids; rows carry the domains and the device names", () => {
    const programs = [prog("2", "Zed", ["light.a", "light.b", "cover.c"]), prog("1", "Zed", ["cover.d"]), prog("0", "alpha", ["fan.e"])];
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
  const programs = [prog("a", "A", ["cover.x"]), prog("c", "C", ["vacuum.z"])];
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
  it("switching all off keeps the programs that are not visible", () => {
    expect(toggleAllOff(programs, undefined)).toEqual({ programs: [] });
    expect(toggleAllOff(programs, undefined, [programs[0]])).toEqual({ programs: ["c"] });
  });
  it("orphan references are kept as they are", () => {
    expect(toggleProgram(programs, { programs: ["gone", "a"] }, "c", true)).toEqual({ programs: ["a", "c", "gone"] });
  });
});

describe("created program", () => {
  const hass: any = { areas: { salon: { area_id: "salon", name: "Salon" } } };
  const created = prog("n", "New", ["cover.n"], "Kitchen");
  it("single program mode points to it and drops the filter", () => {
    expect(selectCreated({ program: "old", filter: { types: ["x"] } } as any, [], created)).toEqual({ program: "n" });
  });
  it("list mode: a room that would hide it is dropped, a room it belongs to is kept, a hidden program is widened in", () => {
    const hidden = selectCreated({ filter: { area: "Salon" } } as any, [], created, hass) as any;
    expect("area" in hidden.filter).toBe(false);
    const keep = selectCreated({ filter: { area: "Kitchen" } } as any, [], created, hass) as any;
    expect(keep.filter.area).toBe("Kitchen");
    const many = selectCreated({ filter: { area: ["salon", "kitchen"] } } as any, [], created, hass) as any;
    expect(many.filter.area).toEqual(["salon", "kitchen"]);
    const widened = selectCreated({ filter: { programs: ["a"] } } as any, [prog("a", "A", ["cover.a"])], created) as any;
    expect(widened.filter.programs).toEqual(["a", "n"]);
    const noRoom = selectCreated({ filter: { types: ["cover"] } } as any, [], created) as any;
    expect(noRoom.filter).toEqual({ types: ["cover"] });
    const known = selectCreated({ filter: {} } as any, [created], created) as any;
    expect(known.filter).toEqual({});
  });
});
