// Labels (spec § 6): which ones suit a device, what a label does to a device, how it is shown.

import { fmtNum } from "./planner";
import { serviceLabel, servicesFor } from "./services";
import type { Action, HassEntity, HomeAssistant, Label, PlannerData, Program, Slot } from "./types";

/** 12 distinct colours; a new label takes the first one not used yet. */
export const PALETTE = [
  "#f44336", "#ff9800", "#ffc107", "#8bc34a", "#26a69a", "#03a9f4",
  "#3f51b2", "#9c27b0", "#e91e63", "#795548", "#607d8b", "#009688",
];

export function nextColor(labels: Label[]): string {
  const used = new Set(labels.map((l) => l.color.toLowerCase()));
  return PALETTE.find((c) => !used.has(c)) ?? PALETTE[labels.length % PALETTE.length];
}

export const sameAction = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

export const labelOf = (data: PlannerData, id: string | null | undefined): Label | undefined =>
  id ? data.labels.find((l) => l.id === id) : undefined;

/** Scenes that contain the entity (attribute `entity_id` of `scene.*`). */
export function scenesOf(hass: HomeAssistant, entityId: string): HassEntity[] {
  return Object.values(hass.states)
    .filter((s) => s.entity_id.startsWith("scene.") && Array.isArray(s.attributes.entity_id) && s.attributes.entity_id.includes(entityId))
    .sort((a, b) => String(a.attributes.friendly_name ?? a.entity_id).localeCompare(String(b.attributes.friendly_name ?? b.entity_id)));
}

/** Can this action be applied to the entity? (service target accepts it, scene contains it) */
export function compatible(hass: HomeAssistant, entityId: string, action: Action): boolean {
  if (action.kind === "scene") {
    const members = hass.states[action.scene]?.attributes.entity_id;
    return Array.isArray(members) ? members.includes(entityId) : true;
  }
  if (action.service.split(".")[0] === entityId.split(".")[0]) return true;
  return servicesFor(hass, entityId).some((s) => s.id === action.service);
}

/** Labels offered for devices: compatible with at least one of them. */
export function labelsFor(hass: HomeAssistant, data: PlannerData, entityIds: string[]): Label[] {
  return data.labels.filter((l) => entityIds.some((e) => compatible(hass, e, l.action)));
}

/** What a label does to an entity of a program: its own value for the device, else the label's. */
export function entityAction(program: Program, entityId: string, label: Label | undefined): Action | undefined {
  if (!label) return undefined;
  const own = program.entities.find((e) => e.entity_id === entityId)?.label_overrides?.[label.id];
  return own ?? label.action;
}

export const hasOverride = (program: Program, entityId: string, labelId: string): boolean =>
  Boolean(program.entities.find((e) => e.entity_id === entityId)?.label_overrides?.[labelId]);

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** Number an action sets, for the chart: a temperature, a position or a brightness (null: none). */
export function actionValue(action: Action | undefined): number | null {
  if (!action || action.kind !== "service") return null;
  const d = action.data ?? {};
  return num(d.temperature) ?? num(d.position) ?? num(d.brightness_pct);
}

/** Short text of an action: "18 °C", "30 %", the scene name, else the translated service. */
export function actionText(hass: HomeAssistant, lang: string, action: Action | undefined): string {
  if (!action) return "";
  if (action.kind === "scene") return String(hass.states[action.scene]?.attributes.friendly_name ?? action.scene);
  const d = action.data ?? {};
  if (num(d.temperature) !== null) return `${fmtNum(lang, Number(d.temperature))} °C`;
  if (num(d.position) !== null) return `${d.position} %`;
  if (num(d.brightness_pct) !== null) return `${d.brightness_pct} %`;
  return serviceLabel(hass, action.service);
}

/** Names of the programs using a label (slots of any profile, defaults, values for a device). */
export function labelUsers(data: PlannerData, labelId: string): string[] {
  return data.programs.filter((p) =>
    p.entities.some((e) => e.default_label === labelId || labelId in (e.label_overrides ?? {}))
    || p.profiles.some((profile) => profile.days.some((day) => day.some((s: Slot) => s.label === labelId)))).map((p) => p.name);
}
