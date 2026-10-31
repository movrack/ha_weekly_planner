import { describe, expect, it } from "vitest";
import { DraftHistory } from "../draft-history";

interface Draft { name: string; device: { services: string[] }; }
const draft = (name: string): Draft => ({ name, device: { services: ["example.enable"] } });

describe("local draft undo and redo", () => {
  it("groups a typing burst but keeps a pause or another field as separate steps", () => {
    const history = new DraftHistory<string>();
    history.record("", "A", "name", 0);
    history.record("A", "AB", "name", 700);
    history.record("AB", "ABC", "name", 1401);
    history.record("ABC", "ABCD", "icon", 1402);
    expect(history.undo("ABCD")).toBe("ABC");
    expect(history.undo("ABC")).toBe("AB");
    expect(history.undo("AB")).toBe("");
    expect(history.canUndo).toBe(false);
    expect(history.redo("")).toBe("AB");
    expect(history.redo("AB")).toBe("ABC");
    expect(history.redo("ABC")).toBe("ABCD");
    expect(history.canRedo).toBe(false);
  });

  it("keeps unnamed changes separate even at the same time", () => {
    const history = new DraftHistory<number>();
    history.record(0, 1, undefined, 0);
    history.record(1, 2, "", 0);
    expect(history.undo(2)).toBe(1);
    expect(history.undo(1)).toBe(0);
  });

  it("retains only the latest fifty undo steps", () => {
    const history = new DraftHistory<number>();
    for (let value = 0; value < 60; value++) history.record(value, value + 1);
    let current = 60;
    let count = 0;
    while (history.canUndo) {
      current = history.undo(current)!;
      count++;
    }
    expect(count).toBe(50);
    expect(current).toBe(10);
    for (let value = 11; value <= 60; value++) {
      expect(history.redo(current)).toBe(value);
      current = value;
    }
  });

  it("isolates recorded and redo snapshots from later mutations", () => {
    const history = new DraftHistory<Draft>();
    const before = draft("Before"), after = draft("After");
    history.record(before, after);
    before.device.services.push("example.remove");
    const restored = history.undo(after)!;
    expect(restored).toEqual(draft("Before"));
    after.name = "Mutated";
    after.device.services.length = 0;
    const redone = history.redo(restored)!;
    expect(redone).toEqual(draft("After"));
    restored.device.services.length = 0;
    expect(history.undo(redone)).toEqual(draft("Before"));
  });

  it("keeps redo after a no-op and clears it when making a new branch", () => {
    const history = new DraftHistory<Draft>();
    const a = draft("A"), b = draft("B"), c = draft("C"), d = draft("D");
    history.record(a, b, "name", 0);
    history.record(b, c, "name", 1000);
    expect(history.undo(c)).toEqual(b);
    history.record(b, structuredClone(b), "name", 1001);
    expect(history.canRedo).toBe(true);
    history.record(b, d, "name", 1002);
    expect(history.canRedo).toBe(false);
    expect(history.undo(d)).toEqual(b);
    expect(history.undo(b)).toEqual(a);
  });

  it("starts a fresh group after redo and after clear", () => {
    const history = new DraftHistory<number>();
    history.record(0, 1, "field", 0);
    expect(history.undo(1)).toBe(0);
    expect(history.redo(0)).toBe(1);
    history.record(1, 2, "field", 1);
    expect(history.undo(2)).toBe(1);
    history.clear();
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);
    expect(history.undo(1)).toBeUndefined();
    expect(history.redo(1)).toBeUndefined();
    history.record(1, 3, "field", 2);
    expect(history.undo(3)).toBe(1);
  });
});
