import { describe, expect, it, vi } from "vitest";
import { defaultEntityIcon } from "../icons";
import type { HomeAssistant } from "../types";

describe("HA default entity icons", () => {
  it("uses HA metadata for unknown domains and device classes, and caches it", async () => {
    const callWS = vi.fn().mockResolvedValue({ resources: { custom: { _: { default: "mdi:star" }, special: { default: "mdi:moon-full" } } } });
    const hass = { connection: {}, states: { "custom.a": { attributes: { device_class: "special" } } }, callWS } as unknown as HomeAssistant;
    expect(await defaultEntityIcon(hass, "custom.a")).toBe("mdi:moon-full");
    expect(await defaultEntityIcon(hass, "custom.b")).toBe("mdi:star");
    expect(callWS).toHaveBeenCalledTimes(1);
  });
  it("preserves explicit metadata icons and falls back on unavailable metadata", async () => {
    const hass = { connection: {}, states: { "custom.a": { attributes: { icon: "mdi:heart" } } }, callWS: vi.fn().mockRejectedValue(new Error("offline")) } as unknown as HomeAssistant;
    expect(await defaultEntityIcon(hass, "custom.a")).toBe("mdi:heart");
    expect(await defaultEntityIcon(hass, "custom.b")).toBe("mdi:calendar-clock");
  });
});
