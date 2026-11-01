import { describe, expect, it } from "vitest";
import { filterPrograms } from "../planner";
import type { CardConfig, PlannerData, Program } from "../types";

const program = (id: string, domain: string, area = "office", priority = 0): Program => ({
  id, name: id, revision: 1, area, priority, enabled: true, reapply: true,
  conditions: [], profiles: [],
  entities: [{ entity_id: `${domain}.${id}`, default_label: null, label_overrides: {} }],
});
const data: PlannerData = {
  vacation: false, labels: [], status: {}, read_only: false, can_edit: true,
  programs: [program("third", "cover"), program("first", "cover"), program("second", "cover"),
    program("other_type", "future_domain"), program("other_area", "cover", "bedroom")],
};
const ids = (filter?: CardConfig["filter"], selected?: string) => filterPrograms(data, { filter, program: selected }).map((p) => p.id);

describe("card program selection", () => {
  it("can display two of three programs of the same type", () => {
    expect(ids({ types: ["cover"], programs: ["first", "third"] })).toEqual(["first", "third"]);
  });

  it("intersects explicit program IDs with type and area filters", () => {
    expect(ids({ types: ["cover"], area: "office", programs: ["first", "other_type", "other_area"] })).toEqual(["first"]);
  });

  it("keeps legacy cards unrestricted when the program selection is absent", () => {
    expect(ids({ types: ["cover"], area: "office" })).toEqual(["first", "second", "third"]);
  });

  it("shows no programs for an explicitly empty selection", () => {
    expect(ids({ programs: [] })).toEqual([]);
  });

  it("does not substitute other programs when a selected program disappears", () => {
    expect(ids({ programs: ["deleted"] })).toEqual([]);
  });

  it("gives single-program mode precedence over list filters", () => {
    expect(ids({ types: ["cover"], programs: [] }, "other_type")).toEqual(["other_type"]);
  });

  it("leaves the shared programs and selection unchanged", () => {
    const programs = ["third", "first"];
    const original = data.programs.map((p) => p.id);
    expect(ids({ programs })).toEqual(["first", "third"]);
    expect(programs).toEqual(["third", "first"]);
    expect(data.programs.map((p) => p.id)).toEqual(original);
    expect(data.programs.every((p) => p.enabled)).toBe(true);
  });
});
