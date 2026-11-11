// Properties of the preview cache that the first tests left open (mutation testing).
// Equivalent mutant, ignored: the "" stand-in of an absent mode in the key (any constant makes the same key).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearPreviewCache, fetchPreview, fetchPreviewResponse, syncPreviewCache } from "../preview-cache";
import type { HomeAssistant } from "../types";

const slots = [{ slot_id: "s", start: "2026-01-02T08:00:00Z", end: null, ignored: null, sun: false }];
const hassWith = (impl: (...a: unknown[]) => unknown = async () => ({ slots })) =>
  ({ callWS: vi.fn(impl) }) as unknown as HomeAssistant & { callWS: ReturnType<typeof vi.fn> };
const sync = (programs: [string, number][], card_version = "v1") =>
  syncPreviewCache({ card_version, programs: programs.map(([id, revision]) => ({ id, revision })) });

beforeEach(() => clearPreviewCache());
afterEach(() => vi.useRealTimers());

describe("lifetime of an entry", () => {
  it("answers from the cache for 10 minutes, and asks again at exactly 10 minutes", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-02T08:00:00Z"));
    const hass = hassWith();
    await fetchPreview(hass, "p", 1, "d");
    vi.setSystemTime(new Date("2026-01-02T08:09:59.999Z"));
    await fetchPreview(hass, "p", 1, "d");
    expect(hass.callWS).toHaveBeenCalledTimes(1);
    vi.setSystemTime(new Date("2026-01-02T08:10:00Z"));
    await fetchPreview(hass, "p", 1, "d");
    expect(hass.callWS).toHaveBeenCalledTimes(2);
  });

  it("an entry older than 10 minutes is asked again", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-02T08:00:00Z"));
    const hass = hassWith();
    await fetchPreview(hass, "p", 1, "d");
    vi.setSystemTime(new Date("2026-01-02T09:00:00Z"));
    await fetchPreview(hass, "p", 1, "d");
    expect(hass.callWS).toHaveBeenCalledTimes(2);
  });

  it("keeps at most 400 entries: the 401st drops the oldest, and only then", async () => {
    const hass = hassWith();
    for (let i = 0; i < 400; i++) await fetchPreview(hass, "p", 1, `d${i}`);
    await fetchPreview(hass, "p", 1, "d1"); // 400 entries: nothing evicted yet
    expect(hass.callWS).toHaveBeenCalledTimes(400);
    await fetchPreview(hass, "p", 1, "d400"); // the 401st
    expect(hass.callWS).toHaveBeenCalledTimes(401);
    await fetchPreview(hass, "p", 1, "d0"); // the oldest is gone
    expect(hass.callWS).toHaveBeenCalledTimes(402);
  });
});

describe("answers", () => {
  it("an empty or missing answer gives no slots and no by_entity", async () => {
    const empty = await fetchPreviewResponse(hassWith(async () => ({})), "p", 1, "d");
    expect(empty).toStrictEqual({ slots: [] });
    const none = await fetchPreviewResponse(hassWith(async () => undefined), "p", 1, "other");
    expect(none).toStrictEqual({ slots: [] });
  });

  it("keeps by_entity when the program has per-device lists", async () => {
    const by_entity = { "light.a": slots };
    const res = await fetchPreviewResponse(hassWith(async () => ({ slots, by_entity })), "p", 1, "d");
    expect(res).toStrictEqual({ slots, by_entity });
  });

  it("fetchPreviewResponse sends the mode by default", async () => {
    const hass = hassWith();
    await fetchPreviewResponse(hass, "p", 1, "d", "away");
    expect(hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/preview", program_id: "p", date: "d", profile_id: "away" });
  });
});

describe("failures", () => {
  it("a late failure does not drop the newer entry that replaced its own", async () => {
    let reject!: (e: Error) => void;
    const hass = hassWith();
    hass.callWS.mockImplementationOnce(() => new Promise((_, r) => { reject = r; }));
    const first = fetchPreview(hass, "p", 1, "d");
    first.catch(() => undefined);
    clearPreviewCache();
    const second = fetchPreview(hass, "p", 1, "d"); // new entry for the same key
    reject(new Error("late"));
    await expect(first).rejects.toThrow("late");
    expect(await second).toEqual(slots);
    await fetchPreview(hass, "p", 1, "d");
    expect(hass.callWS).toHaveBeenCalledTimes(2);
  });

  it("a failure whose entry is already gone is silent", async () => {
    let reject!: (e: Error) => void;
    const hass = hassWith(() => new Promise((_, r) => { reject = r; }));
    const first = fetchPreview(hass, "p", 1, "d");
    first.catch(() => undefined);
    clearPreviewCache();
    reject(new Error("late"));
    await expect(first).rejects.toThrow("late");
    await new Promise((r) => setTimeout(r, 0)); // an error thrown in the cleanup would be reported as unhandled
  });
});

describe("following the pushed snapshots", () => {
  it("a program that disappears loses its entries and is a new one when it comes back", async () => {
    const hass = hassWith();
    sync([["p", 1], ["q", 1]]);
    await fetchPreview(hass, "p", 1, "d");
    await fetchPreview(hass, "q", 1, "d");
    sync([["q", 1]]); // p disappears: its entry goes
    await fetchPreview(hass, "q", 1, "d");
    expect(hass.callWS).toHaveBeenCalledTimes(2);
    await fetchPreview(hass, "p", 1, "d");
    expect(hass.callWS).toHaveBeenCalledTimes(3);
    sync([["p", 1], ["q", 1]]); // p comes back: unknown revision, so its entry goes again
    await fetchPreview(hass, "p", 1, "d");
    expect(hass.callWS).toHaveBeenCalledTimes(4);
    await fetchPreview(hass, "q", 1, "d");
    expect(hass.callWS).toHaveBeenCalledTimes(4);
  });

  it("after a clear, the next snapshot treats every program as new", async () => {
    const hass = hassWith();
    sync([["p", 1]]);
    clearPreviewCache();
    await fetchPreview(hass, "p", 1, "d");
    sync([["p", 1]]);
    await fetchPreview(hass, "p", 1, "d");
    expect(hass.callWS).toHaveBeenCalledTimes(2);
  });

  it("the very first snapshot does not clear what was fetched before it", async () => {
    vi.resetModules();
    const fresh = await import("../preview-cache");
    const hass = hassWith();
    await fresh.fetchPreview(hass, "r", 1, "d"); // before any snapshot: no program is tracked yet
    fresh.syncPreviewCache({ card_version: "v1", programs: [] });
    await fresh.fetchPreview(hass, "r", 1, "d");
    expect(hass.callWS).toHaveBeenCalledTimes(1);
  });
});
