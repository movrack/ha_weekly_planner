// Shared data access: one subscription per page, helpers to read programs and labels.

import type { HomeAssistant, PlannerData, Program } from "./types";

type Listener = (data: PlannerData) => void;

let current: PlannerData | undefined;
let unsubscribe: Promise<() => void> | undefined;
const listeners = new Set<Listener>();

export function subscribePlanner(hass: HomeAssistant, listener: Listener): () => void {
  listeners.add(listener);
  if (current) listener(current);
  if (!unsubscribe) {
    unsubscribe = hass.connection.subscribeMessage<PlannerData>(
      (data) => {
        current = data;
        listeners.forEach((l) => l(data));
      },
      { type: "weekly_planner/subscribe" },
    );
    unsubscribe.catch(() => {
      unsubscribe = undefined;
    });
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && unsubscribe) {
      unsubscribe.then((unsub) => unsub()).catch(() => undefined);
      unsubscribe = undefined;
      current = undefined;
    }
  };
}

export const entityDomain = (entityId: string): string => entityId.split(".")[0];

export function activeProfile(program: Program, data: PlannerData) {
  const wanted = data.status[program.id]?.active_profile ?? program.active_profile;
  return program.profiles.find((p) => p.id === wanted) ?? program.profiles[0];
}

export function friendlyName(hass: HomeAssistant, entityId: string): string {
  return hass.states[entityId]?.attributes.friendly_name ?? entityId;
}

export function filterPrograms(data: PlannerData, config: { program?: string; filter?: { types?: string[]; area?: string; programs?: string[] } }): Program[] {
  if (config.program) return data.programs.filter((p) => p.id === config.program);
  const types = config.filter?.types;
  const area = config.filter?.area;
  return data.programs
    .filter((p) => !types?.length || p.entities.some((e) => types.includes(entityDomain(e.entity_id))))
    .filter((p) => !area || p.area === area)
    .filter((p) => config.filter?.programs === undefined || config.filter.programs.includes(p.id))
    .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
}

export function newId(): string {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}

/* ---- number formatting ---- */

export function fmtNum(lang: string, n: number): string {
  return new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(n);
}

/**
 * Make Home Assistant's own form elements (ha-selector, icon picker) available. They are loaded lazily
 * by the frontend; opening a built-in card editor once defines them. Resolves false when not possible.
 */
export async function ensureHaSelector(): Promise<boolean> {
  if (customElements.get("ha-selector")) return true;
  try {
    const helpers = await (window as unknown as { loadCardHelpers?: () => Promise<any> }).loadCardHelpers?.();
    const card = await helpers?.createCardElement({ type: "button", entity: "sun.sun" });
    await (card?.constructor as { getConfigElement?: () => Promise<unknown> })?.getConfigElement?.();
    await Promise.race([customElements.whenDefined("ha-selector"), new Promise((r) => setTimeout(r, 3000))]);
  } catch {
    /* keep the plain text field */
  }
  return Boolean(customElements.get("ha-selector"));
}
