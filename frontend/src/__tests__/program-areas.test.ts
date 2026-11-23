import { describe, expect, it } from "vitest";
import { areaList, areaValue, normalizeRoom, roomChoices, roomKey, roomKeys, roomLabel, roomOptions } from "../program-areas";
import { filterPrograms } from "../planner";
import { groupItems } from "../list-order";

const hass = { areas: {
  chambre_celine_manu: { area_id: "chambre_celine_manu", name: "Chambre Céline Manu" },
  salle_a_manger: { area_id: "salle_a_manger", name: "Salle à manger" },
} };

describe("normalizeRoom", () => {
  it("lowers case, drops accents, merges separators", () => {
    expect(normalizeRoom("Chambre_Céline-Manu")).toBe("chambre celine manu");
    expect(normalizeRoom("  Salle   à  manger ")).toBe("salle a manger");
    expect(normalizeRoom("Bureau")).toBe("bureau");
    expect(normalizeRoom(null)).toBe("");
  });
});

describe("roomKey", () => {
  it("matches area id, name, then normalized id", () => {
    expect(roomKey(hass, "chambre_celine_manu")).toBe("chambre_celine_manu");
    expect(roomKey(hass, "Chambre Céline Manu")).toBe("chambre_celine_manu");
    expect(roomKey(hass, "salle-a-manger")).toBe("salle_a_manger");
  });
  it("prefers the id match, then the first id, when several areas match", () => {
    const h = { areas: { b: { area_id: "b", name: "Hall" }, a: { area_id: "a", name: "hall" }, hall: { area_id: "hall", name: "X" } } };
    expect(roomKey(h, "hall")).toBe("hall");
    expect(roomKey(h, "HALL")).toBe("a");
  });
  it("falls back to the normalized text, with or without areas", () => {
    expect(roomKey(hass, "Bureau")).toBe("bureau");
    expect(roomKey({}, "Chambre_Céline")).toBe("chambre celine");
    expect(roomKey(undefined, "Bureau")).toBe("bureau");
    expect(roomKey(hass, "")).toBe("");
    expect(roomKey(hass, null)).toBe("");
  });
});

describe("roomLabel", () => {
  it("uses the area name, else the first text alphabetically, unchanged", () => {
    expect(roomLabel(hass, "chambre_celine_manu", ["chambre_celine_manu"])).toBe("Chambre Céline Manu");
    expect(roomLabel(hass, "bureau", ["bureau", "Bureau"])).toBe("Bureau");
    expect(roomLabel(undefined, "salon", ["Salon_"])).toBe("Salon_");
  });
});

describe("room options of the card editor", () => {
  const programs = [{ area: "bureau" }, { area: "Bureau" }, { area: "chambre_celine_manu" }, { area: null }];
  it("merges spellings, labels with area names, sorted", () => {
    expect(roomOptions(hass, programs)).toEqual([
      { key: "bureau", value: "Bureau", label: "Bureau" },
      { key: "chambre_celine_manu", value: "chambre_celine_manu", label: "Chambre Céline Manu" },
    ]);
  });
  it("keeps a selection that matches no program, and merges an old value", () => {
    expect(roomOptions(hass, programs, "Old room").map((o) => o.label)).toEqual(["Bureau", "Chambre Céline Manu", "Old room"]);
    expect(roomOptions(hass, programs, "BUREAU")).toHaveLength(2);
    expect(roomOptions(hass, programs, "Chambre Céline Manu")).toHaveLength(2);
    expect(roomOptions(undefined, [], "Old area")).toEqual([{ key: "old area", value: "Old area", label: "Old area" }]);
    expect(roomOptions(undefined, [], "")).toEqual([]);
  });
});

describe("room filter and sort", () => {
  const prog = (id: string, area: string) => ({ id, name: id, area, priority: 0, entities: [] });
  const data: any = { programs: [prog("a", "bureau"), prog("b", "Bureau"), prog("c", "chambre_celine_manu"), prog("d", "")] };
  it("keeps programs whose spelling differs from the selected one", () => {
    const ids = (area: string) => filterPrograms(data, { filter: { area } }, hass).map((p) => p.id);
    expect(ids("Bureau")).toEqual(["a", "b"]);
    expect(ids("BUREAU")).toEqual(["a", "b"]);
    expect(ids("chambre_celine_manu")).toEqual(["c"]);
    expect(ids("Chambre Céline Manu")).toEqual(["c"]);
  });
  it("sort area groups merged spellings under one key and heading", () => {
    const items = data.programs.map((p: any) => ({ id: p.id, name: p.id, type: "x", area: roomKey(hass, p.area), p }));
    const groups = groupItems(items, "area", {});
    expect(groups.map((g) => g.key)).toEqual(["bureau", "chambre_celine_manu", ""]);
    expect(groups.map((g) => roomLabel(hass, g.key, g.items.map((i: any) => i.p.area)))).toEqual(["Bureau", "Chambre Céline Manu", ""]);
  });
  it("several rooms: areaList, roomKeys and areaValue", () => {
    expect(areaList("Bureau")).toEqual(["Bureau"]);
    expect(areaList(["Bureau", " ", 3, "Cuisine"])).toEqual(["Bureau", "Cuisine"]);
    expect(areaList(undefined)).toEqual([]);
    expect([...roomKeys(hass, ["bureau", "Chambre Céline Manu", "Bureau"])].sort()).toEqual(["bureau", "chambre_celine_manu"]);
    expect(areaValue([])).toBeUndefined();
    expect(areaValue(["a"])).toBe("a");
    expect(areaValue(["a", "b"])).toEqual(["a", "b"]);
  });
  it("several rooms: the filter keeps the programs of any chosen room; the options keep missing selections", () => {
    const ids = (area: any) => filterPrograms(data, { filter: { area } }, hass).map((p: any) => p.id).sort();
    expect(ids(["Bureau", "chambre_celine_manu"])).toEqual(["a", "b", "c"]);
    expect(ids(["Bureau"])).toEqual(["a", "b"]);
    expect(roomOptions(hass, data.programs, ["Bureau", "Ancienne pièce"]).map((o: any) => o.label)).toContain("Ancienne pièce");
  });
});

describe("rooms: edge cases of keys, labels and options", () => {
  const hass: any = { areas: { salon_de_jeux: { area_id: "salon_de_jeux", name: "Games" }, k: { area_id: "other", name: "N" }, dash: { area_id: "dash", name: "-" } } };
  it("a punctuation-only text has no room, even when an area is named like it", () => {
    expect(roomKey(hass, "-")).toBe("");
    expect(roomKey(hass, " _ ")).toBe("");
    expect(roomKey(hass, "")).toBe("");
    expect(roomKey(hass, null)).toBe("");
  });
  it("a text finds its area by id, by name, then by the id in its normalized form", () => {
    expect(roomKey(hass, "salon_de_jeux")).toBe("salon_de_jeux");
    expect(roomKey(hass, "Games")).toBe("salon_de_jeux");
    expect(roomKey(hass, "Salon de jeux")).toBe("salon_de_jeux");
    expect(roomKey(hass, "Unknown  Room")).toBe("unknown room");
    expect(roomKey(undefined, "Été_Chaud")).toBe("ete chaud");
    expect(normalizeRoom("  A--B__C  ")).toBe("a b c");
  });
  it("the label is the area name only when the key is the id of that area; else the first text, upper case first", () => {
    expect(roomLabel(hass, "salon_de_jeux", ["x"])).toBe("Games");
    expect(roomLabel(hass, "k", ["x"])).toBe("x");
    expect(roomLabel(hass, "zz", ["b", "B"])).toBe("B");
    expect(roomLabel(hass, "zz", [null, undefined, "", "a"] as any)).toBe("a");
    expect(roomLabel(hass, "zz", [])).toBe("zz");
    expect(roomLabel(undefined, "zz", [""])).toBe("zz");
  });
  it("room lists drop blanks; room keys drop the ones with no key; options are merged and sorted by label", () => {
    expect(areaList(["a", " ", 3, "b"])).toEqual(["a", "b"]);
    expect(areaList("x")).toEqual(["x"]);
    expect(areaList(5)).toEqual([]);
    expect([...roomKeys(hass, ["-", "Kitchen"])]).toEqual(["kitchen"]);
    const opts = roomOptions(undefined, [{ area: "Zed" }, { area: "alpha" }, { area: "ALPHA" }, { area: null }, {}] as any, ["Zed"]);
    expect(opts.map((o) => [o.key, o.value, o.label])).toEqual([["alpha", "ALPHA", "ALPHA"], ["zed", "Zed", "Zed"]]);
    const withArea = roomOptions(hass, [{ area: "Games" }, { area: "beta" }] as any);
    expect(withArea.map((o) => [o.key, o.value, o.label])).toEqual([["beta", "beta", "beta"], ["salon_de_jeux", "salon_de_jeux", "Games"]]);
  });
});

describe("roomChoices", () => {
  it("lists every Home Assistant room, the rooms programs already use (spellings merged) and the current one, sorted", () => {
    const programs = [{ area: "bureau" }, { area: "Salle à manger" }, { area: null }];
    expect(roomChoices(hass, programs).map((o) => [o.value, o.label])).toEqual([
      ["bureau", "bureau"],
      ["chambre_celine_manu", "Chambre Céline Manu"],
      ["salle_a_manger", "Salle à manger"],
    ]);
    expect(roomChoices(hass, programs, "Old room").map((o) => o.label)).toEqual(["bureau", "Chambre Céline Manu", "Old room", "Salle à manger"]);
    expect(roomChoices(undefined, [{ area: "Bureau" }]).map((o) => o.label)).toEqual(["Bureau"]);
  });
});
