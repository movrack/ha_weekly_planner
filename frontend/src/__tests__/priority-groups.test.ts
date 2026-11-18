import { describe, expect, it } from "vitest";
import { applyOrder, byRank, competition, components, moveTo, placeSaved, sharedDevices } from "../priority-groups";

const prog = (id: string, devices: string[], priority = 1, created = "2026-01-01") =>
  ({ id, priority, created_at: created, entities: devices.map((entity_id) => ({ entity_id })) }) as any;
const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

describe("priority groups", () => {
  it("groups programs that share a device, transitively, in rank order", () => {
    const programs = [prog("a", ["x"], 2), prog("b", ["x", "y"], 1), prog("c", ["y"], 3), prog("d", ["z"]), prog("e", ["w"])];
    const { groups, alone } = competition(programs);
    expect(groups.map(ids)).toEqual([["b", "a", "c"]]);
    expect(ids(alone)).toEqual(["d", "e"]);
  });

  it("gives a tie to the oldest program, and a missing priority counts as 10", () => {
    expect(ids(components([prog("new", ["x"], 1, "2026-02-01"), prog("old", ["x"], 1, "2026-01-01")])[0])).toEqual(["old", "new"]);
    expect(byRank({ ...prog("a", []), priority: undefined as any }, prog("b", [], 10))).toBe(0);
    expect(byRank(prog("a", [], 3), prog("b", [], 9))).toBeLessThan(0);
  });

  it("highlights only the devices used by two programs of the group", () => {
    expect([...sharedDevices([prog("a", ["x", "y"]), prog("b", ["x"]), prog("c", ["z", "z"])])]).toEqual(["x"]);
  });

  it.each([
    ["nobody to compete with", [prog("a", ["x"])], prog("s", ["y"]), [], [], false],
    ["a new program goes last", [prog("a", ["x"], 1), prog("b", ["x"], 2)], prog("s", ["x"], 1), [], ["a", "b", "s"], true],
    ["a program keeping its competition keeps its rank", [prog("a", ["x"], 1), prog("b", ["x"], 3)], prog("s", ["x"], 2), ["x"], ["a", "s", "b"], false],
    ["a device added that joins another group", [prog("a", ["x"], 1), prog("b", ["y"], 1), prog("c", ["y"], 2)], prog("s", ["x", "y"], 1), ["x"], ["a", "b", "c", "s"], true],
  ])("places a saved program: %s", (_name, others, saved, before, order, renumber) => {
    const placed = placeSaved([...others, saved], saved, before);
    expect([ids(placed.group), placed.renumber]).toEqual([order, renumber]);
  });

  it("interleaves two merged groups by rank, oldest first, the merging program last", () => {
    const others = [prog("a1", ["x"], 1, "2026-01-02"), prog("a2", ["x"], 2), prog("b1", ["y"], 1, "2026-01-01"), prog("b2", ["y"], 5), prog("b3", ["y"], 9)];
    const merging = prog("s", ["x", "y"], 1);
    expect(ids(placeSaved([...others, merging], merging, []).group)).toEqual(["b1", "a1", "a2", "b2", "b3", "s"]);
  });

  it("applies a chosen order, ignoring unknown ids and keeping the unlisted members after", () => {
    const group = [prog("a", ["x"]), prog("b", ["x"]), prog("c", ["x"])];
    expect(ids(applyOrder(group, ["c", "gone", "a", "c"]))).toEqual(["c", "a", "b"]);
  });

  it.each([
    [["a", "b", "c"], "a", 2, ["b", "c", "a"]],
    [["a", "b", "c"], "c", 0, ["c", "a", "b"]],
    [["a", "b", "c"], "b", 9, ["a", "c", "b"]],
    [["a", "b", "c"], "b", -3, ["b", "a", "c"]],
  ])("moves %j: %s to %i", (order, id, to, expected) => {
    expect(moveTo(order, id, to)).toEqual(expected);
  });
});
