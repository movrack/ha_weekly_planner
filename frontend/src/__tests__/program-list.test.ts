import { describe, expect, it } from "vitest";
import { NO_ROOM, emptyView, facets, filterCount, sortPrograms, viewPrograms } from "../program-list";

const hass = { areas: { salon: { area_id: "salon", name: "Salon" } } } as any;
const prog = (id: string, name: string, priority: number, area: string | null, ...entities: string[]) =>
  ({ id, name, priority, area, entities: entities.map((entity_id) => ({ entity_id })) }) as any;
const programs = [
  prog("1", "Volet salon", 2, "salon", "cover.salon"),
  prog("2", "Chauffage bureau", 1, "bureau", "climate.bureau"),
  prog("3", "Volet bureau", 1, "Bureau", "cover.bureau", "sensor.temp"),
  prog("4", "Prise cuisine 10", 3, null, "switch.cuisine"),
  prog("5", "Prise cuisine 9", 3, null, "switch.cuisine"),
];
const ids = (list: { id: string }[]) => list.map((p) => p.id);

describe("sortPrograms", () => {
  it("keeps the creation order by default", () => {
    expect(sortPrograms(programs, "created")).toBe(programs);
  });
  it("sorts by name, A to Z, numbers as numbers and accents ignored", () => {
    expect(ids(sortPrograms(programs, "name"))).toEqual(["2", "5", "4", "3", "1"]);
  });
  it("sorts by priority rank, 1 first, then by name", () => {
    expect(ids(sortPrograms(programs, "priority"))).toEqual(["2", "3", "1", "5", "4"]);
  });
  it("does not change the data it is given", () => {
    sortPrograms(programs, "name");
    expect(ids(programs)).toEqual(["1", "2", "3", "4", "5"]);
  });
});

describe("viewPrograms", () => {
  const view = (over: Partial<ReturnType<typeof emptyView>>) => ({ ...emptyView(), ...over });
  it("shows everything, in creation order, when no filter is on", () => {
    expect(ids(viewPrograms(hass, programs, emptyView()))).toEqual(["1", "2", "3", "4", "5"]);
  });
  it("filters by type: a program passes when one of its devices has a chosen type", () => {
    expect(ids(viewPrograms(hass, programs, view({ types: ["cover"] })))).toEqual(["1", "3"]);
    expect(ids(viewPrograms(hass, programs, view({ types: ["cover", "switch"] })))).toEqual(["1", "3", "4", "5"]);
  });
  it("filters by room, spellings merged, with a choice for the programs without a room", () => {
    expect(ids(viewPrograms(hass, programs, view({ rooms: ["salon"] })))).toEqual(["1"]);
    expect(ids(viewPrograms(hass, programs, view({ rooms: ["bureau"] })))).toEqual(["2", "3"]);
    expect(ids(viewPrograms(hass, programs, view({ rooms: [NO_ROOM] })))).toEqual(["4", "5"]);
  });
  it("filters by device", () => {
    expect(ids(viewPrograms(hass, programs, view({ devices: ["cover.bureau"] })))).toEqual(["3"]);
    expect(ids(viewPrograms(hass, programs, view({ devices: ["sensor.temp", "switch.cuisine"] })))).toEqual(["3", "4", "5"]);
  });
  it("combines the kinds with AND and sorts the result", () => {
    expect(ids(viewPrograms(hass, programs, view({ types: ["cover"], rooms: ["bureau"] })))).toEqual(["3"]);
    expect(ids(viewPrograms(hass, programs, view({ types: ["cover"], sort: "name" })))).toEqual(["3", "1"]);
    expect(viewPrograms(hass, programs, view({ types: ["cover"], rooms: ["salon"], devices: ["cover.bureau"] }))).toEqual([]);
  });
});

describe("filterCount and facets", () => {
  it("counts the filters, not the sort", () => {
    expect(filterCount({ sort: "name", types: ["a"], rooms: ["b", "c"], devices: [] })).toBe(3);
    expect(filterCount(emptyView())).toBe(0);
  });
  it("lists each choice once with the number of programs it concerns", () => {
    const f = facets(hass, programs);
    expect(f.types).toEqual([{ id: "cover", count: 2 }, { id: "climate", count: 1 }, { id: "sensor", count: 1 }, { id: "switch", count: 2 }]);
    expect(f.devices.find((d) => d.id === "switch.cuisine")).toEqual({ id: "switch.cuisine", count: 2 });
    expect(f.rooms).toEqual([
      { key: "salon", label: "Salon", count: 1 },
      { key: "bureau", label: "Bureau", count: 2 },
      { key: NO_ROOM, label: NO_ROOM, count: 2 },
    ]);
  });
});
