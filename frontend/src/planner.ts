// Shared data access: one subscription per page, helpers to read programs and labels.

import type { HomeAssistant, PlannerData, Program } from "./types";

type Listener = (data: PlannerData) => void;

let current: PlannerData | undefined;
let unsubscribe: Promise<() => void> | undefined;
const listeners = new Set<Listener>();

let retryTimer: ReturnType<typeof setTimeout> | undefined;
let retryDelay = 1000;
let generation = 0;

function connectPlanner(hass: HomeAssistant): void {
  if (unsubscribe || !listeners.size) return;
  const token = generation;
  const pending = hass.connection.subscribeMessage<PlannerData>((data) => {
    if (token !== generation) return;
    retryDelay = 1000;
    current = data;
    listeners.forEach((listener) => listener(data));
  }, { type: "weekly_planner/subscribe" });
  unsubscribe = pending;
  pending.catch(() => {
    if (unsubscribe !== pending || token !== generation) return;
    unsubscribe = undefined;
    if (!listeners.size) return;
    retryTimer = setTimeout(() => {
      retryTimer = undefined;
      connectPlanner(hass);
    }, retryDelay);
    retryDelay = Math.min(retryDelay * 2, 30_000);
  });
}

export function subscribePlanner(hass: HomeAssistant, listener: Listener): () => void {
  listeners.add(listener);
  if (current) listener(current);
  if (!retryTimer) connectPlanner(hass);
  return () => {
    listeners.delete(listener);
    if (listeners.size) return;
    generation++;
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = undefined;
    retryDelay = 1000;
    unsubscribe?.then((unsub) => unsub()).catch(() => undefined);
    unsubscribe = undefined;
    current = undefined;
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

const numberFormats = new Map<string, Intl.NumberFormat>();

export function fmtNum(lang: string, n: number): string {
  let format = numberFormats.get(lang);
  if (!format) numberFormats.set(lang, (format = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 })));
  return format.format(n);
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
