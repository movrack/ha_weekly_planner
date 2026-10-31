// Filter choices come from program entities, never from a catalogue of supported device types.
import type { Program } from "./types";

export type DomainLocalize = (key: string, ...args: unknown[]) => string;

/** Retain configured filters even when their last device/program has disappeared. */
export function programDomains(programs: Pick<Program, "entities">[], selected: string[] = []): string[] {
  return [...new Set([
    ...programs.flatMap((p) => p.entities.map((e) => e.entity_id.split(".")[0])),
    ...selected,
  ])].filter(Boolean).sort();
}

export function domainChoices(domains: string[], lang: string, localize?: DomainLocalize) {
  return domains.map((id) => ({ id, label: localize?.(`component.${id}.title`) || id }))
    .sort((a, b) => a.label.localeCompare(b.label, lang) || a.id.localeCompare(b.id));
}

const iconCache = new Map<string, Promise<string>>();

/** Icon Home Assistant itself uses for a domain (its icon translations); `fallback` when it has none. */
export function domainIcon(hass: { callWS?: <T>(msg: Record<string, unknown>) => Promise<T> }, domain: string, fallback = "mdi:shape-outline"): Promise<string> {
  let cached = iconCache.get(domain);
  if (!cached) {
    cached = Promise.resolve()
      .then(() => hass.callWS!<{ resources?: Record<string, { _?: { default?: string } }> }>({ type: "frontend/get_icons", category: "entity_component", integration: domain }))
      .then((r) => r?.resources?.[domain]?._?.default ?? fallback)
      .catch(() => { iconCache.delete(domain); return fallback; });
    iconCache.set(domain, cached);
  }
  return cached;
}
