// Generic actions: the Home Assistant services whose target accepts an entity (`hass.services`),
// their translated names and the input fields of each one.

import { entityDomain } from "./planner";
import type { HassEntity, HomeAssistant } from "./types";

type Localize = (key: string, ...args: unknown[]) => string;

interface EntityFilter {
  domain?: string | string[];
  supported_features?: (number | number[])[];
}

export interface ServiceInfo {
  name?: string;
  description?: string;
  fields?: Record<string, ServiceFieldInfo>;
  target?: { entity?: EntityFilter | EntityFilter[] } | null;
}

interface ServiceFieldInfo {
  name?: string;
  required?: boolean;
  advanced?: boolean;
  selector?: Record<string, unknown> | null;
  fields?: Record<string, ServiceFieldInfo>;
}

export interface ServiceChoice {
  id: string;
  domain: string;
  service: string;
  label: string;
}

export interface ServiceField {
  key: string;
  selector: Record<string, unknown>;
  required: boolean;
  label: string;
}

/** Domains whose actions are the rich, built-in ones (end time, default, override detection). */
export const SPECIFIC_DOMAINS = ["climate", "cover", "light", "switch", "input_boolean", "fan"];

export const isGenericDomain = (domain: string): boolean => !SPECIFIC_DOMAINS.includes(domain);
export const isGenericEntity = (entityId: string): boolean => isGenericDomain(entityDomain(entityId));

const TARGET_FIELDS = new Set(["entity_id", "device_id", "area_id", "floor_id", "label_id"]);
let loaded: Localize | undefined;
const requested = new Set<string>();

/** Loads the translations of the services of some integrations (once per domain). */
export async function loadServiceNames(hass: HomeAssistant, domains: string[]): Promise<boolean> {
  const fresh = [...new Set(domains)].filter((d) => !requested.has(d));
  if (!fresh.length || !hass.loadBackendTranslation) return false;
  fresh.forEach((d) => requested.add(d));
  try {
    const results = await Promise.all(fresh.map((d) => hass.loadBackendTranslation!("services", d)));
    loaded = results[results.length - 1] ?? loaded;
    return true;
  } catch {
    fresh.forEach((d) => requested.delete(d));
    return false;
  }
}

function translate(hass: HomeAssistant, key: string): string {
  for (const fn of [hass.localize, loaded]) {
    const text = fn?.(key);
    if (text) return text;
  }
  return "";
}

const infoOf = (hass: HomeAssistant, id: string): ServiceInfo | undefined => {
  const [domain, service] = id.split(".");
  return hass.services?.[domain]?.[service] as ServiceInfo | undefined;
};

/** Translated name of a service, else the name of `hass.services`, else its id. */
export function serviceLabel(hass: HomeAssistant, id: string): string {
  const [domain, service] = id.split(".");
  return translate(hass, `component.${domain}.services.${service}.name`) || infoOf(hass, id)?.name || id;
}

function accepts(filters: EntityFilter | EntityFilter[] | undefined, entity: HassEntity | undefined, domain: string): boolean {
  const list = Array.isArray(filters) ? filters : filters ? [filters] : [];
  const features = Number(entity?.attributes.supported_features ?? 0);
  return list.some((f) => {
    const domains = f.domain === undefined ? [] : Array.isArray(f.domain) ? f.domain : [f.domain];
    if (!domains.includes(domain)) return false;
    if (!f.supported_features?.length) return true;
    return f.supported_features.some((bit) =>
      Array.isArray(bit) ? bit.every((b) => (features & b) === b) : (features & bit) === bit);
  });
}

/** Services offered for an entity, sorted by their translated name. */
export function servicesFor(hass: HomeAssistant, entityId: string): ServiceChoice[] {
  const domain = entityDomain(entityId);
  const entity = hass.states[entityId];
  const out: ServiceChoice[] = [];
  for (const [d, services] of Object.entries(hass.services ?? {})) {
    if (d === "homeassistant") continue;
    for (const [service, info] of Object.entries(services as Record<string, ServiceInfo>)) {
      if (!info.target) continue;
      if (d !== domain && !accepts(info.target.entity, entity, domain)) continue;
      const id = `${d}.${service}`;
      out.push({ id, domain: d, service, label: serviceLabel(hass, id) });
    }
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

/** Domains of the services offered for an entity (for the translations to load). */
export function serviceDomains(hass: HomeAssistant, entityId: string): string[] {
  return [...new Set(servicesFor(hass, entityId).map((s) => s.domain))];
}

/** Input fields of a service: required first, without advanced or target fields. */
export function serviceFields(hass: HomeAssistant, id: string): ServiceField[] {
  const [domain, service] = id.split(".");
  const out: ServiceField[] = [];
  const walk = (fields: Record<string, ServiceFieldInfo> | undefined) => {
    for (const [key, field] of Object.entries(fields ?? {})) {
      if (field.fields) {
        walk(field.fields);
        continue;
      }
      if (field.advanced || TARGET_FIELDS.has(key) || field.selector?.target) continue;
      out.push({
        key,
        selector: field.selector ?? { text: {} },
        required: Boolean(field.required),
        label: translate(hass, `component.${domain}.services.${service}.fields.${key}.name`) || field.name || key,
      });
    }
  };
  walk(infoOf(hass, id)?.fields);
  return [...out.filter((f) => f.required), ...out.filter((f) => !f.required)];
}
