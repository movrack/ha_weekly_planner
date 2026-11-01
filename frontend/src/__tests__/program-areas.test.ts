import { describe, expect, it } from "vitest";
import { programAreas } from "../program-areas";

describe("program area choices", () => {
  it("uses distinct program metadata and excludes unassigned areas", () => {
    expect(programAreas([{ area: "Office" }, { area: "Bedroom" }, { area: "Office" }, { area: null }, {}]))
      .toEqual(["Bedroom", "Office"]);
  });

  it("retains an exact configured value after its programs disappear", () => {
    expect(programAreas([{ area: "Office" }], "Old area")).toEqual(["Office", "Old area"]);
    expect(programAreas([], "Old area")).toEqual(["Old area"]);
    expect(programAreas([], "")).toEqual([]);
  });
});
