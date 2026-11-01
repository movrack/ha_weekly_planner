// Home Assistant owns default entity and device-class icons; no local domain catalogue.
import type { HomeAssistant } from "./types";
interface Icons { default?: string; }
interface IconResult { resources?: Record<string, Record<string, Icons>>; }
const cache = new WeakMap<HomeAssistant["connection"], Map<string, Promise<Record<string, Icons>>>>();

export async function defaultEntityIcon(hass: HomeAssistant, entityId: string): Promise<string> {
  const entity = hass.states[entityId];
  const explicit = entity?.attributes.icon;
  if (typeof explicit === "string" && explicit.startsWith("mdi:")) return explicit;
  const domain = entityId.split(".")[0];
  let domains = cache.get(hass.connection);
  if (!domains) cache.set(hass.connection, domains = new Map());
  let request = domains.get(domain);
  if (!request) {
    request = hass.callWS<IconResult>({ type: "frontend/get_icons", category: "entity_component", integration: domain })
      .then((result) => result.resources?.[domain] ?? {});
    domains.set(domain, request);
  }
  try {
    const icons = await request;
    const icon = icons[String(entity?.attributes.device_class)]?.default ?? icons._?.default;
    return icon?.startsWith("mdi:") ? icon : "mdi:calendar-clock";
  } catch {
    domains.delete(domain);
    return "mdi:calendar-clock";
  }
}
