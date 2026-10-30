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
  /** The field only applies to devices with these features or attribute values. */
  filter?: { supported_features?: number[]; attribute?: Record<string, unknown[]> };
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
  default?: unknown;
}

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

/** Prefer Home Assistant's translated explanation, then the integration's description. */
export function serviceDescription(hass: HomeAssistant, id: string): string {
  const [domain, service] = id.split(".");
  return translate(hass, `component.${domain}.services.${service}.description`) || infoOf(hass, id)?.description || "";
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

/** Services offered for an entity, sorted by their translated name; `allowed` restricts them (undefined: all, empty: none). */
export function servicesFor(hass: HomeAssistant, entityId: string, allowed?: string[]): ServiceChoice[] {
  const domain = entityDomain(entityId);
  const entity = hass.states[entityId];
  const out: ServiceChoice[] = [];
  for (const [d, services] of Object.entries(hass.services ?? {})) {
    if (d === "homeassistant") continue;
    for (const [service, info] of Object.entries(services as Record<string, ServiceInfo>)) {
      if (!info.target) continue;
      const filters = info.target.entity;
      const anyEntity = !filters || (Array.isArray(filters) && !filters.length);
      if (!accepts(filters, entity, domain) && !(d === domain && anyEntity)) continue;
      // Technical services (a required free text or raw object, e.g. "send command") are left out.
      const fields = Object.values(info.fields ?? {}) as { required?: boolean; selector?: Record<string, unknown> }[];
      if (fields.some((f) => f.required && (!f.selector || "text" in f.selector || "object" in f.selector))) continue;
      const id = `${d}.${service}`;
      if (allowed !== undefined && !allowed.includes(id)) continue;
      out.push({ id, domain: d, service, label: serviceLabel(hass, id) });
    }
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

/** Domains of the services offered for an entity (for the translations to load). */
export function serviceDomains(hass: HomeAssistant, entityId: string): string[] {
  return [...new Set(servicesFor(hass, entityId).map((s) => s.domain))];
}

/** Whether a field applies to the device (its features and attributes); without a device every field does. */
function fieldApplies(field: ServiceFieldInfo, entity: HassEntity | undefined): boolean {
  const filter = field.filter;
  if (!filter || !entity) return true;
  const features = Number(entity.attributes.supported_features ?? 0);
  if (filter.supported_features?.length && !filter.supported_features.some((bit) => (features & bit) === bit)) return false;
  for (const [attr, values] of Object.entries(filter.attribute ?? {})) {
    const value = entity.attributes[attr];
    const list = Array.isArray(value) ? value : [value];
    if (!list.some((v) => values.includes(v))) return false;
  }
  return true;
}

/**
 * Input fields of a service for a device: required first, without advanced or target fields, nor the fields the
 * device does not support. An optional field that another service of the domain sets on its own (the mode in
 * "set temperature", as "set mode" exists) is left out: one action, one thing. A service whose fields are all
 * optional needs at least one: its first field becomes required.
 */
export function serviceFields(hass: HomeAssistant, id: string, entityId?: string): ServiceField[] {
  const [domain, service] = id.split(".");
  const entity = entityId ? hass.states[entityId] : undefined;
  const own = hass.services?.[domain] ?? {};
  const out: ServiceField[] = [];
  const walk = (fields: Record<string, ServiceFieldInfo> | undefined) => {
    for (const [key, field] of Object.entries(fields ?? {})) {
      if (field.fields) {
        walk(field.fields);
        continue;
      }
      if (field.advanced || TARGET_FIELDS.has(key) || field.selector?.target || !fieldApplies(field, entity)) continue;
      if (!field.required && service !== `set_${key}` && `set_${key}` in own) continue;
      out.push({
        key,
        selector: field.selector ?? { text: {} },
        // The mode of a "set mode" service is always needed, whatever the description says.
        required: Boolean(field.required) || (domain === "climate" && service === `set_${key}` && key in LIST_ATTRIBUTE),
        default: (field as { default?: unknown }).default,
        label: translate(hass, `component.${domain}.services.${service}.fields.${key}.name`) || field.name || key,
      });
    }
  };
  walk(infoOf(hass, id)?.fields);
  if (out.length && !out.some((f) => f.required)) out[0] = { ...out[0], required: true };
  return [...out.filter((f) => f.required), ...out.filter((f) => !f.required)];
}

/** Data to start from when a service is chosen: its required fields get a usable value. */
export function startData(hass: HomeAssistant, id: string, entityId: string): Record<string, unknown> {
  const attrs = hass.states[entityId]?.attributes ?? {};
  const data: Record<string, unknown> = {};
  for (const f of serviceFields(hass, id, entityId)) {
    if (!f.required) continue;
    const number = f.selector.number as { min?: number } | undefined;
    if (f.default !== undefined) data[f.key] = f.default;
    else if (f.key === "temperature") data[f.key] = typeof attrs.temperature === "number" ? attrs.temperature : 19;
    else if (number) data[f.key] = f.key === "position" ? 50 : number.min ?? 0;
  }
  return data;
}

/** Required fields still empty (labels of them), so a form does not save a call that must fail. */
export function missingFields(
  hass: HomeAssistant, id: string, data: Record<string, unknown> | undefined, entityId?: string, sources?: Record<string, { entity_id: string }>,
): string[] {
  return serviceFields(hass, id, entityId)
    .filter((f) => sources?.[f.key] ? !sources[f.key].entity_id : f.required && (data?.[f.key] === undefined || data[f.key] === "" || data[f.key] === null))
    .map((f) => f.label);
}

/** Attribute listing the possible values of a field, for the services that pick one of the device's modes. */
export const LIST_ATTRIBUTE: Record<string, string> = {
  hvac_mode: "hvac_modes", preset_mode: "preset_modes", fan_mode: "fan_modes", swing_mode: "swing_modes",
  swing_horizontal_mode: "swing_horizontal_modes",
};

/**
 * Options (value + translated label) of a "pick one of the device's modes" field, read from the device's
 * attribute list; undefined when the field is not one or the device lists nothing.
 */
export function deviceOptions(hass: HomeAssistant, entityId: string, field: ServiceField): { value: string; label: string }[] | undefined {
  const sel = field.selector;
  const state = sel.state as { attribute?: string } | undefined;
  if (!state && !sel.select) return undefined;
  const attribute = state?.attribute ?? LIST_ATTRIBUTE[field.key];
  const stateObj = hass.states[entityId];
  const list = attribute ? stateObj?.attributes[attribute] : undefined;
  if (!Array.isArray(list) || !list.length) return undefined;
  const h = hass as unknown as {
    formatEntityState?: (s: HassEntity, v?: string) => string;
    formatEntityAttributeValue?: (s: HassEntity, a: string, v?: unknown) => string;
  };
  const single = attribute!.replace(/_list$/, "").replace(/s$/, "");
  return list.map((value) => {
    const v = String(value);
    let label = "";
    try {
      label = field.key === "hvac_mode" ? h.formatEntityState?.(stateObj, v) ?? "" : h.formatEntityAttributeValue?.(stateObj, single, v) ?? "";
    } catch {
      label = "";
    }
    return { value: v, label: label || v };
  });
}
