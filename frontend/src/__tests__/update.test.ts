import { afterEach, describe, expect, it, vi } from "vitest";
import { reloadIfOutdated, runningVersion, shouldReload } from "../update";

describe("card update", () => {
  it("reads its version from its own URL", () => {
    expect(runningVersion("http://ha/weekly_planner_static/weekly-planner-card.js?v=abc123def456")).toBe("abc123def456");
    expect(runningVersion("https://x/y.js?v=1.2")).toBe("1.2");
    expect(runningVersion("http://ha/weekly-planner-card.js")).toBeNull();
    expect(runningVersion("not a url")).toBeNull();
    expect(runningVersion()).toBeNull(); // the bundle under test was loaded without ?v=
  });
  it.each([
    ["both known and different", "a", "b", null, true],
    ["both known and equal", "a", "a", null, false],
    ["running version unknown", null, "b", null, false],
    ["served version null", "a", null, null, false],
    ["served version undefined", "a", undefined, null, false],
    ["already reloaded for the served version", "a", "b", "b", false],
    ["reloaded for an older served version", "a", "c", "b", true],
  ] as const)("reloads only when both are known and differ, once per served version: %s", (_name, running, served, remembered, expected) => {
    expect(shouldReload(running, served, remembered)).toBe(expected);
  });
});

describe("reloadIfOutdated: the page reloads itself once per served version", () => {
  const reloadIf = (served: string | null | undefined, idle: boolean) => reloadIfOutdated(served, idle, "old1");
  const setup = (stored: string | null, broken = false) => {
    const store = new Map<string, string>(stored ? [["weekly_planner_reloaded_for", stored]] : []);
    const reload = vi.fn();
    vi.stubGlobal("sessionStorage", broken ? { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } }
      : { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) });
    vi.stubGlobal("location", { reload });
    return { store, reload };
  };
  afterEach(() => vi.unstubAllGlobals());
  it("a bundle loaded without ?v= never reloads by itself", () => {
    const { reload } = setup(null);
    expect(reloadIfOutdated("new2", true)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
  it("does nothing while the page is busy", () => {
    const { reload } = setup(null);
    expect(reloadIf("new2", false)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
  it("reloads when idle and outdated, and remembers the version it reloaded for", () => {
    const { store, reload } = setup(null);
    expect(reloadIf("new2", true)).toBe(true);
    expect(reload).toHaveBeenCalledOnce();
    expect(store.get("weekly_planner_reloaded_for")).toBe("new2");
  });
  it("does not reload again for a version it already reloaded for, nor when the versions match", () => {
    const { reload } = setup("new2");
    expect(reloadIf("new2", true)).toBe(false);
    expect(reloadIf("old1", true)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
  it("still reloads when the storage is blocked", () => {
    const { reload } = setup(null, true);
    expect(reloadIf("new2", true)).toBe(true);
    expect(reload).toHaveBeenCalledOnce();
  });
});
