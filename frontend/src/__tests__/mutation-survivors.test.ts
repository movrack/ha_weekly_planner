// Pins behaviour that mutation testing (Stryker) showed was not asserted anywhere.
import { afterEach, describe, expect, it, vi } from "vitest";
import { shiftSpec, specText } from "../actions";
import { dismissHoldHint, HOLD_HINT_MAX, takeHoldHint } from "../hold-hint";
import { formatWhen } from "../time";

const plain = (s: string) => s.replace(/[  ]/g, " ");

afterEach(() => vi.unstubAllGlobals());

describe("sun offsets in words", () => {
  it("writes minutes, whole hours and hours with minutes with the right sign", () => {
    expect(plain(specText("en", { sun: "sunset", offset: 30 }))).toMatch(/\+30 min$/);
    expect(plain(specText("en", { sun: "sunset", offset: -45 }))).toMatch(/−45 min$/);
    expect(plain(specText("en", { sun: "sunset", offset: 60 }))).toMatch(/\+1 h$/);
    expect(plain(specText("en", { sun: "sunset", offset: 90 }))).toMatch(/\+1 h 30$/);
    expect(plain(specText("en", { sun: "sunset", offset: -125 }))).toMatch(/−2 h 05$/);
  });
});

describe("shiftSpec limits", () => {
  it("clamps a clock between 00:00 and 24:00 and snaps to 15 minutes", () => {
    expect(shiftSpec({ time: "23:55" }, 15)).toEqual({ time: "24:00" });
    expect(shiftSpec({ time: "00:05" }, -15)).toEqual({ time: "00:00" });
    expect(shiftSpec({ time: "08:00" }, 15)).toEqual({ time: "08:15" });
  });

  it("clamps a sun offset to four hours either way", () => {
    expect(shiftSpec({ sun: "sunset", offset: 235 }, 15)).toEqual({ sun: "sunset", offset: 240 });
    expect(shiftSpec({ sun: "sunrise", offset: -235 }, -15)).toEqual({ sun: "sunrise", offset: -240 });
    expect(shiftSpec({ sun: "sunrise" }, 15)).toEqual({ sun: "sunrise", offset: 15 });
  });
});

describe("formatWhen", () => {
  const now = new Date("2026-10-28T10:00:00Z");
  it("adds the date once the moment is more than six days away", () => {
    const soon = plain(formatWhen("2026-11-02T10:00:00Z", "UTC", "en", now));
    const far = plain(formatWhen("2026-11-05T10:00:00Z", "UTC", "en", now));
    expect(soon).toMatch(/^Mon /);
    expect(soon).not.toMatch(/Nov/);
    expect(far).toMatch(/Nov/);
  });
});

describe("hold hint counter", () => {
  it("is shown a limited number of times and never again once dismissed", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v); } },
    });
    for (let i = 0; i < HOLD_HINT_MAX; i++) expect(takeHoldHint()).toBe(true);
    expect(takeHoldHint()).toBe(false);
    store.clear();
    expect(takeHoldHint()).toBe(true);
    dismissHoldHint();
    expect(takeHoldHint()).toBe(false);
    store.set("weekly_planner.hold_hint", "-2");
    expect(takeHoldHint()).toBe(true);
    expect(store.get("weekly_planner.hold_hint")).toBe("1");
  });
});
