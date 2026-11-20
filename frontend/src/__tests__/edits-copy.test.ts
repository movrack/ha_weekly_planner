// Copying one slot to other days: conflicts, replacement around the copied range, devices, one-shots.
import { describe, expect, it } from "vitest";
import { copyConflicts, copyToDays } from "../edits";
import type { Slot } from "../types";
import { brief, ctx, days7 as days, ids, sl, show } from "./helpers/edits";

const day = (...slots: Slot[]) => slots;
const src = { day: 0, id: "s" };
/** Copies the slot of `src` (10:00-11:00, label x) onto day 1 holding `existing`, ids n1, n2, n3. */
const over = (existing: Slot[], extra: Partial<Slot> = {}, c = ctx({ newId: ids() })) =>
  copyToDays(days({ 0: day(sl("s", "10:00", "11:00", { label: "x", ...extra })), 1: existing }), src, [1], c)[1];

describe("conflicts of a copy", () => {
  it("only overlapping slots of a shared device, never the source day, touching is not overlapping", () => {
    const d = days({
      0: day(sl("s", "10:00", "11:00")),
      1: day(sl("x", "11:00", "12:00")), 2: day(sl("x", "09:00", "10:00")), 3: day(sl("x", "10:30", "11:30")),
      4: day(sl("x", "09:00", "12:00")), 5: day(sl("x", "10:30", null)), 6: day(sl("x", "10:30", "11:30", { entities: ["d9"] })),
    });
    d[0] = day(sl("s", "10:00", "11:00", { entities: ["d1"] }));
    expect(copyConflicts(d, src, [0, 1, 2, 3, 4, 5, 6], ctx())).toEqual([3, 4]);
    d[6] = day(sl("x", "10:30", "11:30", { entities: ["d1"] }));
    expect(copyConflicts(d, src, [6], ctx())).toEqual([6]);
  });

  it("no conflict for a missing source, a source day out of range or a one-shot", () => {
    const d = days({ 0: day(sl("s", "10:00", null)), 1: day(sl("x", "09:00", "12:00")) });
    expect(copyConflicts(d, src, [1], ctx())).toEqual([]);
    expect(copyConflicts(d, { day: 0, id: "zz" }, [1], ctx())).toEqual([]);
    expect(copyConflicts(d, { day: 9, id: "s" }, [1], ctx())).toEqual([]);
  });
});

describe("copying a slot to other days", () => {
  it("copies directly to free days, with new ids, leaving the other days as they were", () => {
    const d = days({ 2: [sl("c", "12:00", "14:00", { label: "t19" })] });
    const from = { day: 2, id: "c" };
    expect(copyConflicts(d, from, [3, 4], ctx())).toEqual([]);
    const out = copyToDays(d, from, [3, 4], ctx({ newId: ids() }));
    expect(show(out[3])).toEqual(["12:00-14:00:t19"]);
    expect(out[3][0].id).not.toBe("c");
    expect(out[0]).toBe(d[0]);
    expect(out[2]).toBe(d[2]);
  });

  it("only the chosen days change, not the source day or a skipped day", () => {
    const d = days({ 0: day(sl("s", "10:00", "11:00")) });
    const out = copyToDays(d, src, [0, 1, 2, 3], ctx({ newId: ids() }), [2]);
    expect(out.map((x) => x.length)).toEqual([1, 1, 0, 1, 0, 0, 0]);
    expect(out[0]).toBe(d[0]);
    expect(out[1][0].id).toBe("n1");
    expect(out[3][0].id).toBe("n2");
  });

  it("makes its own ids when none is given, different for each day", () => {
    const out = copyToDays(days({ 0: day(sl("s", "10:00", "11:00")) }), src, [1, 2], ctx());
    expect(out[1][0].id).toBeTruthy();
    expect(typeof out[1][0].id).toBe("string");
    expect(out[1][0].id).not.toBe(out[2][0].id);
  });

  it("a missing source changes nothing", () => {
    const d = days({ 0: day(sl("s", "10:00", "11:00")) });
    expect(copyToDays(d, { day: 0, id: "zz" }, [1], ctx())).toBe(d);
    expect(copyToDays(d, { day: 9, id: "s" }, [1], ctx())).toBe(d);
  });

  it("copies a sun slot as a sun slot", () => {
    const d = days({ 2: [sl("c", { sun: "sunset" }, null, { label: "close" })] });
    expect(copyToDays(d, { day: 2, id: "c" }, [5], ctx())[5][0].start).toEqual({ sun: "sunset" });
  });
});

describe("a copy over existing slots", () => {
  it("replaces around the copied range: nothing outside it is lost", () => {
    const d = days({ 2: [sl("c", "12:00", "14:00", { label: "t19" })], 3: [sl("w", "08:45", "17:00")] });
    expect(copyConflicts(d, { day: 2, id: "c" }, [3, 4], ctx())).toEqual([3]);
    const out = copyToDays(d, { day: 2, id: "c" }, [3], ctx({ newId: ids() }));
    expect(show(out[3])).toEqual(["08:45-12:00:t18", "12:00-14:00:t19", "14:00-17:00:t18"]);
  });

  it("trims one side, swallows a smaller slot, and keeps the days to skip", () => {
    const d = days({
      2: [sl("c", "12:00", "14:00", { label: "t19" })],
      3: [sl("a", "10:00", "13:00", { label: "x" }), sl("b", "13:30", "13:45", { label: "y" }), sl("d", "13:45", "16:00", { label: "z" })],
      4: [sl("e", "11:00", "15:00", { label: "x" })],
    });
    const out = copyToDays(d, { day: 2, id: "c" }, [3, 4], ctx({ newId: ids() }), [4]);
    expect(show(out[3])).toEqual(["10:00-12:00:x", "12:00-14:00:t19", "14:00-16:00:z"]);
    expect(out[4]).toBe(d[4]);
  });

  it("merges the copy with a neighbour of the same label", () => {
    const d = days({ 2: [sl("c", "12:00", "14:00", { label: "t19" })], 3: [sl("a", "10:00", "12:00", { label: "t19" })] });
    expect(show(copyToDays(d, { day: 2, id: "c" }, [3], ctx({ newId: ids() }))[3])).toEqual(["10:00-14:00:t19"]);
  });

  it("splits a long slot that crosses midnight and keeps its tail", () => {
    const d = days({ 2: [sl("c", "23:00", "23:30", { label: "k" })], 3: [sl("a", "22:00", "06:00", { label: "x" })] });
    const out = copyToDays(d, { day: 2, id: "c" }, [3], ctx({ newId: ids() }));
    expect(show(out[3])).toEqual(["22:00-23:00:x", "23:00-23:30:k", "23:30-06:00:x"]);
  });

  it("handles 00:00 / 24:00 ranges and a one-shot (no duplicate)", () => {
    const d = days({
      2: [sl("c", "00:00", "24:00", { label: "t19" }), sl("o", "17:00", null, { label: "off" })],
      3: [sl("a", "08:00", "12:00", { label: "x" }), sl("o2", "17:00", null, { label: "off" })],
    });
    expect(show(copyToDays(d, { day: 2, id: "c" }, [3], ctx({ newId: ids() }))[3]).sort()).toEqual(["00:00-24:00:t19", "17:00-_:off"].sort());
    expect(copyConflicts(d, { day: 2, id: "o" }, [3], ctx())).toEqual([]);
    expect(show(copyToDays(d, { day: 2, id: "o" }, [3], ctx({ newId: ids() }))[3])).toEqual(["08:00-12:00:x", "17:00-_:off"]);
    expect(show(copyToDays(d, { day: 2, id: "o" }, [4], ctx({ newId: ids() }))[4])).toEqual(["17:00-_:off"]);
  });

  it("slots touching the range are left untouched (sun times kept)", () => {
    const before: Slot = { ...sl("e1", "08:00", "10:00"), end: { sun: "sunrise", offset: 180 } }; // 10:00
    const after: Slot = { ...sl("e2", "11:00", "13:00"), start: { sun: "sunrise", offset: 240 } }; // 11:00
    const out = over([before, after], {}, ctx({ newId: ids() }));
    expect(out[0]).toBe(before);
    expect(out[2]).toBe(after);
    expect(out[1].id).toBe("n1");
  });

  it("a slot that starts or ends exactly on the range is not split into an empty piece", () => {
    expect(brief(over([sl("e", "10:00", "12:00")]))).toEqual(["n1:10:00-11:00:x", "e:11:00-12:00:t18"]);
    expect(brief(over([sl("e", "09:00", "11:00")]))).toEqual(["e:09:00-10:00:t18", "n1:10:00-11:00:x"]);
    expect(brief(over([sl("e", "09:00", "12:00")]))).toEqual(["e:09:00-10:00:t18", "n1:10:00-11:00:x", "n2:11:00-12:00:t18"]);
  });
});

describe("a copy and the devices of the slots", () => {
  const devices = ["d1", "d2", "d3"];

  it("over slots without a device list, nothing is left of the covered part (no stray piece)", () => {
    const out = over([sl("e", "10:00", "11:00", { entities: ["d1", "d2"] })], {}, ctx({ devices, newId: ids() }));
    expect(brief(out)).toEqual(["n1:10:00-11:00:x"]);
  });

  it("a slot for other devices keeps the range for them, limited to those devices", () => {
    const out = over([sl("e", "09:00", "12:00", { entities: ["d1", "d2"] })], { entities: ["d1"] }, ctx({ devices, newId: ids() }));
    const row = (s: Slot) => [s.id, s.label, "time" in s.start ? s.start.time : "", s.end && "time" in s.end ? s.end.time : "", s.entities, s.seed];
    expect(out.map(row)).toEqual([
      ["e", "t18", "09:00", "10:00", ["d1", "d2"], undefined],
      ["n2", "t18", "10:00", "11:00", ["d2"], "e"],
      ["n1", "x", "10:00", "11:00", ["d1"], undefined],
      ["n3", "t18", "11:00", "12:00", ["d1", "d2"], undefined],
    ]);
  });

  it("a cut limited to some devices over a slot without list and without program devices leaves nothing of it", () => {
    expect(brief(over([sl("e", "10:00", "11:00")], { entities: ["d1"] }))).toEqual(["n1:10:00-11:00:x"]);
  });

  it("the piece left for the other devices has a list field, except when it is for every device", () => {
    const rest = over([sl("e", "10:00", "11:00")], { entities: ["d3"] }, ctx({ devices, newId: ids() })).find((s) => s.label === "t18")!;
    expect("entities" in rest).toBe(true);
    expect(rest.entities).toEqual(["d1", "d2"]);
    const all = over([sl("e", "10:00", "11:00")], { entities: ["d9"] }, ctx({ devices: ["d1", "d2"], newId: ids() }));
    expect("entities" in all.find((s) => s.label === "t18")!).toBe(false);
  });
});

describe("copy of a one-shot", () => {
  const one = sl("s", "10:00", null, { label: "x", entities: ["d1"] });
  it.each([
    ["the same one is there: not added", sl("e", "10:00", null, { label: "x", entities: ["d1"] }), 1],
    ["another time: added", sl("e", "10:15", null, { label: "x", entities: ["d1"] }), 2],
    ["another label: added", sl("e", "10:00", null, { label: "y", entities: ["d1"] }), 2],
    ["another device: added", sl("e", "10:00", null, { label: "x", entities: ["d2"] }), 2],
    ["a ranged slot at that time: added", sl("e", "10:00", "11:00", { label: "x", entities: ["d1"] }), 2],
    ["the same one for every device: added", sl("e", "10:00", null, { label: "x" }), 2],
  ])("when %s", (_what, existing, count) => {
    const out = copyToDays(days({ 0: day(one), 1: day(existing) }), src, [1], ctx({ newId: ids() }))[1];
    expect(out).toHaveLength(count);
  });
});
