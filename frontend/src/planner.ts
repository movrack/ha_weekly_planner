// Shared data access: one subscription per page, helpers to read programs and modes.

import { describeSetpoint } from "./editors/setpoint-editor";
import { strings } from "./i18n";
import type { HomeAssistant, Mode, PlannerData, Program, Setpoint, Slot } from "./types";

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

export function mainType(program: Program): string {
  return program.main_type || entityDomain(program.entities[0]?.entity_id ?? "climate");
}

export function activeProfile(program: Program, data: PlannerData) {
  const wanted = data.status[program.id]?.active_profile ?? program.active_profile;
  return program.profiles.find((p) => p.id === wanted) ?? program.profiles[0];
}

/** Mode shown for a slot: the mode of the program's main type, if any. */
export function slotMode(slot: Slot, program: Program, modes: Mode[]): Mode | undefined {
  const id = slot.actions.by_type[mainType(program)] ?? Object.values(slot.actions.by_type)[0];
  return modes.find((m) => m.id === id);
}

export function slotColor(slot: Slot, program: Program, modes: Mode[]): string {
  return slot.color || slotMode(slot, program, modes)?.color || "var(--secondary-text-color)";
}

/** Short text of a slot: its mode, else the direct setpoint of the first entity (+ count). */
export function slotLabel(
  slot: Slot, program: Program, modes: Mode[], lang: string,
): string {
  const mode = slotMode(slot, program, modes);
  if (mode) return mode.name;
  const direct = program.entities
    .map((e) => slot.actions.by_entity[e.entity_id])
    .filter((sp): sp is Setpoint => Boolean(sp));
  if (!direct.length) return "";
  return direct.length > 1 ? `${describeSetpoint(lang, direct[0])} +${direct.length - 1}` : describeSetpoint(lang, direct[0]);
}

export function friendlyName(hass: HomeAssistant, entityId: string): string {
  return hass.states[entityId]?.attributes.friendly_name ?? entityId;
}

export function filterPrograms(data: PlannerData, config: { program?: string; filter?: { types?: string[]; area?: string } }): Program[] {
  if (config.program) return data.programs.filter((p) => p.id === config.program);
  const types = config.filter?.types;
  const area = config.filter?.area;
  return data.programs
    .filter((p) => !types?.length || p.entities.some((e) => types.includes(entityDomain(e.entity_id))))
    .filter((p) => !area || p.area === area)
    .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
}

export function newId(): string {
  return Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}

/* ---- plain-language helpers (simple mode) ---- */

export function fmtNum(lang: string, n: number): string {
  return new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(n);
}

export const fmtTemp = (lang: string, n: number): string => `${fmtNum(lang, n)} °C`;

/** Translated preset name (falls back to the raw value). */
export function presetLabel(lang: string, preset: string): string {
  const text = (strings(lang) as Record<string, unknown>)[`preset_${preset}`];
  return typeof text === "string" ? text : preset;
}

/** Setpoint a mode applies to an entity (its exception, else its value). */
export const modeSetpoint = (mode: Mode, entityId: string): Setpoint => mode.exceptions?.[entityId] ?? mode.value;

/** True when a setpoint can be applied to this entity right now (e.g. the preset exists). */
export function applicable(hass: HomeAssistant, entityId: string, sp: Setpoint): boolean {
  const attrs = hass.states[entityId]?.attributes ?? {};
  const x = sp as Record<string, any>;
  if (sp.kind === "preset") return (attrs.preset_modes as string[] | undefined)?.includes(x.preset) ?? false;
  if (sp.kind === "hvac_mode") return (attrs.hvac_modes as string[] | undefined)?.includes(x.hvac_mode) ?? false;
  if (sp.kind === "tilt") return attrs.current_tilt_position !== undefined;
  return true;
}

/** Short plain-language text of a setpoint: mode name when a mode has this value, else a translation. */
export function describeSp(lang: string, modes: Mode[], entityId: string, sp: Setpoint): string {
  const key = JSON.stringify(sp);
  const mode = modes.find((m) => JSON.stringify(modeSetpoint(m, entityId)) === key);
  if (mode) return mode.name;
  const x = sp as Record<string, any>;
  const s = strings(lang);
  switch (sp.kind) {
    case "preset": return presetLabel(lang, String(x.preset));
    case "temperature": return fmtTemp(lang, Number(x.temperature));
    case "open": return s.sp_open;
    case "close": return s.sp_close;
    case "off": return s.sp_off;
    case "on": return x.brightness !== undefined ? `${s.sp_on} · ${x.brightness} %` : s.sp_on;
    default: return describeSetpoint(lang, sp);
  }
}
