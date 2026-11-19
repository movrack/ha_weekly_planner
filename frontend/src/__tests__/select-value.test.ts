import { describe, expect, it } from "vitest";
import { syncSelectValues } from "../select-value";

// A select that counts how often its value is written.
const select = (value: string, dataset: Record<string, string>) => {
  const writes: string[] = [];
  const el: any = { dataset, writes, get value() { return value; }, set value(v: string) { value = v; writes.push(v); } };
  return el;
};

describe("syncSelectValues", () => {
  it("sets a select to its data-value, empties one with an empty or no data-value, and leaves one already on its value alone", () => {
    const changed = select("x", { value: "y" }), none = select("z", {}), empty = select("x", { value: "" }), same = select("a", { value: "a" });
    syncSelectValues({ querySelectorAll: () => [changed, none, empty, same] } as any);
    expect(changed.value).toBe("y");
    expect(none.value).toBe("");
    expect(empty.value).toBe("");
    expect(same.writes).toEqual([]);
  });
});
