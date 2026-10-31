import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearPreviewCache, fetchPreview, syncPreviewCache } from "../preview-cache";
import type { HomeAssistant } from "../types";

const slots = [{ slot_id: "s", start: "2026-01-02T08:00:00Z", end: null, ignored: null, sun: false }];
const hassWith = (impl = async () => ({ slots })) => ({ callWS: vi.fn(impl) }) as unknown as HomeAssistant & { callWS: ReturnType<typeof vi.fn> };

beforeEach(() => clearPreviewCache());

describe("preview cache", () => {
  it("shares one websocket call between two consumers, in flight and after", async () => {
    const hass = hassWith();
    const [a, b] = await Promise.all([fetchPreview(hass, "p", 1, "2026-01-02"), fetchPreview(hass, "p", 1, "2026-01-02")]);
    expect(a).toBe(b);
    await fetchPreview(hass, "p", 1, "2026-01-02");
    expect(hass.callWS).toHaveBeenCalledTimes(1);
    expect(hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/preview", program_id: "p", date: "2026-01-02" });
  });

  it("keys on revision, date and mode, and sends profile_id only when given", async () => {
    const hass = hassWith();
    await fetchPreview(hass, "p", 1, "2026-01-02");
    await fetchPreview(hass, "p", 2, "2026-01-02");
    await fetchPreview(hass, "p", 1, "2026-01-03");
    await fetchPreview(hass, "p", 1, "2026-01-02", "away");
    expect(hass.callWS).toHaveBeenCalledTimes(4);
    expect(hass.callWS.mock.calls[3][0]).toMatchObject({ profile_id: "away" });
  });

  it("the card (active mode, implicit) and a dialog on the same mode share a call; another mode does not", async () => {
    const hass = hassWith();
    await fetchPreview(hass, "p", 1, "d", "home", false);
    await fetchPreview(hass, "p", 1, "d", "home");
    expect(hass.callWS).toHaveBeenCalledTimes(1);
    expect(hass.callWS.mock.calls[0][0]).not.toHaveProperty("profile_id");
    await fetchPreview(hass, "p", 1, "d", "away", false);
    expect(hass.callWS).toHaveBeenCalledTimes(2);
  });

  it("drops a program's entries when its revision changes, and all of them on a new card version", async () => {
    const hass = hassWith();
    syncPreviewCache({ card_version: "v1", programs: [{ id: "p", revision: 1 }, { id: "q", revision: 1 }] });
    await fetchPreview(hass, "p", 1, "d"); await fetchPreview(hass, "q", 1, "d");
    syncPreviewCache({ card_version: "v1", programs: [{ id: "p", revision: 1 }, { id: "q", revision: 1 }] });
    await fetchPreview(hass, "p", 1, "d");
    expect(hass.callWS).toHaveBeenCalledTimes(2);
    syncPreviewCache({ card_version: "v1", programs: [{ id: "p", revision: 2 }, { id: "q", revision: 1 }] });
    await fetchPreview(hass, "p", 1, "d"); await fetchPreview(hass, "q", 1, "d");
    expect(hass.callWS).toHaveBeenCalledTimes(3);
    syncPreviewCache({ card_version: "v2", programs: [{ id: "p", revision: 2 }, { id: "q", revision: 1 }] });
    await fetchPreview(hass, "q", 1, "d");
    expect(hass.callWS).toHaveBeenCalledTimes(4);
  });

  it("never keeps a failed call", async () => {
    const hass = hassWith();
    hass.callWS.mockRejectedValueOnce(new Error("boom"));
    await expect(fetchPreview(hass, "p", 1, "d")).rejects.toThrow("boom");
    await expect(fetchPreview(hass, "p", 1, "d")).resolves.toEqual(slots);
    expect(hass.callWS).toHaveBeenCalledTimes(2);
  });
});
