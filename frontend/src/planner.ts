// Shared data access: one subscription per page, helpers to read programs and labels.

import { syncPreviewCache } from "./preview-cache";
import type { HomeAssistant, PlannerData, Profile, Program, Slot } from "./types";

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
    syncPreviewCache(data);
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

/** Stand-in for a program with no schedule for the active mode (only "the rest of the time" applies). */
const NO_SCHEDULE = { id: "", name: "", days: [[], [], [], [], [], [], []] } as Profile;

/**
 * The schedules a program follows now. The mode is global: the schedules named after the active mode,
 * the first ones when there is no mode, none (an empty week) when the program has none for that mode.
 */
export function activeProfile(program: Program, data: PlannerData): Profile {
  const own = ownProfile(program, data);
  return own ? effectiveProfile(program, own) : NO_SCHEDULE;
}

/** The schedules named after the active mode (the first ones without a mode), whatever they follow. */
function ownProfile(program: Program, data: PlannerData): Profile | undefined {
  const mode = data.mode?.selector ? data.mode.active : null;
  return mode == null ? program.profiles[0] : program.profiles.find((p) => p.name === mode);
}

/** The schedules that apply for `profile`: those of the mode it follows (one step), else its own. */
export function effectiveProfile(program: Program, profile: Profile): Profile {
  if (!profile.follows) return profile;
  const source = program.profiles.find((p) => p.name === profile.follows);
  return source && source !== profile && !source.follows ? source : profile;
}

/** Name of the mode the active mode of the program follows; null when it follows none. */
export function activeFollow(program: Program, data: PlannerData): string | null {
  const own = ownProfile(program, data);
  return own && effectiveProfile(program, own) !== own ? own.follows ?? null : null;
}

export function friendlyName(hass: HomeAssistant, entityId: string): string {
  return hass.states[entityId]?.attributes.friendly_name ?? entityId;
}

/** Case-, accent- and surrounding-space-insensitive form of a program name. */
export const normalizeName = (name: string): string => name.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();

/**
 * Ids of the programs designated by `refs`. Each ref is a program id (exact match, wins) or else a program
 * name (normalized; every program with that name matches). A ref matching nothing is ignored.
 */
export function selectedProgramIds(programs: Pick<Program, "id" | "name">[], refs: string[]): Set<string> {
  const ids = new Set<string>();
  const known = new Set(programs.map((p) => p.id));
  for (const ref of refs) {
    if (known.has(ref)) { ids.add(ref); continue; }
    const wanted = normalizeName(String(ref));
    if (!wanted) continue;
    for (const p of programs) if (normalizeName(p.name) === wanted) ids.add(p.id);
  }
  return ids;
}

export function filterPrograms(data: PlannerData, config: { program?: string; filter?: { types?: string[]; area?: string; programs?: string[] } }): Program[] {
  if (config.program) { const one = selectedProgramIds(data.programs, [config.program]); return data.programs.filter((p) => one.has(p.id)); }
  const types = config.filter?.types;
  const area = config.filter?.area;
  const chosen = config.filter?.programs === undefined ? undefined : selectedProgramIds(data.programs, config.filter.programs);
  return data.programs
    .filter((p) => !types?.length || p.entities.some((e) => types.includes(entityDomain(e.entity_id))))
    .filter((p) => !area || p.area === area)
    .filter((p) => !chosen || chosen.has(p.id))
    .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
}

export function newId(): string {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}

/** Independent copies of slots: fresh ids, and no explicit random seed (it follows the new id). */
export function cloneSlots(slots: Slot[]): Slot[] {
  return slots.map((s) => {
    const copy = { ...structuredClone(s), id: newId() };
    delete copy.seed;
    return copy;
  });
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
