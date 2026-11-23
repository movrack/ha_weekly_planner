// Labels (spec § 6): which ones suit a device, what a label does to a device, how it is shown.

import { holidayOwnSlots } from "./holiday";
import { fmtNum } from "./planner";
import { serviceLabel, servicesFor } from "./services";
import { applies } from "./slots";
import type { Action, HassEntity, HomeAssistant, Label, PlannerData, Program, Slot } from "./types";

/** 12 distinct colours; a new label takes the first one not used yet. */
export const PALETTE = [
  "#f44336", "#ff9800", "#ffc107", "#8bc34a", "#26a69a", "#03a9f4",
  "#3f51b2", "#9c27b0", "#e91e63", "#795548", "#607d8b", "#009688",
];

/** i18n key of each palette colour's name, by hue (same order as PALETTE). */
export const PALETTE_NAMES = [
  "color_red", "color_orange", "color_yellow", "color_light_green", "color_cyan", "color_light_blue",
  "color_indigo", "color_purple", "color_pink", "color_brown", "color_blue_grey", "color_green",
] as const;

export function nextColor(labels: Label[]): string {
  const used = new Set(labels.map((l) => l.color.toLowerCase()));
  return PALETTE.find((c) => !used.has(c)) ?? PALETTE[labels.length % PALETTE.length];
}

export const labelOf = (data: PlannerData, id: string | null | undefined): Label | undefined =>
  id ? data.labels.find((l) => l.id === id) : undefined;

const SERVICE_ID = /^[a-z0-9_]+\.[a-z0-9_]+$/;

const toNumber = (raw: unknown): number => (typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN);

/** One thermostat's temperature for a preset: attribute `preset_temperatures.<preset>_temp`, else the number entity `number.<name>_preset_<preset>_temp`, else attribute `<preset>_temp`. 0 means "preset not used". */
function readPreset(hass: HomeAssistant, entityId: string, preset: string): number {
  const key = `${preset.toLowerCase()}_temp`;
  const attrs = hass.states[entityId]?.attributes ?? {};
  const nested = (attrs.preset_temperatures as Record<string, unknown> | undefined)?.[key];
  const candidates = [nested, hass.states[`number.${entityId.split(".")[1]}_preset_${key}`]?.state, attrs[key]];
  for (const raw of candidates) {
    const n = toNumber(raw);
    if (Number.isFinite(n) && n !== 0) return n;
  }
  return NaN;
}

/**
 * Temperature of a preset mode, read from the thermostat (Versatile Thermostat: `preset_temperatures`, its number
 * entities). On several thermostats: shown only when they all agree. Undefined when unreadable.
 */
export function presetTemperature(hass: HomeAssistant, action: Action, entityId?: string): number | undefined {
  if (action.kind !== "service" || action.service !== "climate.set_preset_mode") return undefined;
  const preset = action.data?.preset_mode;
  if (typeof preset !== "string" || !preset) return undefined;
  const target = action.target_entity_id ?? entityId;
  const ids = target
    ? [target]
    : Object.values(hass.states).filter((s) => s.entity_id.startsWith("climate.") && Array.isArray(s.attributes.preset_modes) && s.attributes.preset_modes.includes(preset)).map((s) => s.entity_id);
  const values = new Set<number>();
  for (const id of ids) {
    const n = readPreset(hass, id, preset);
    if (Number.isFinite(n)) values.add(n);
    else if (target) return undefined;
  }
  return values.size === 1 ? [...values][0] : undefined;
}

/**
 * Value an action reads from an entity ("Value of an entity" on a field: `data_sources`), with its unit:
 * a favourite position "40 %", a temperature "19 °C". Several linked values are joined; unreadable ones are left out.
 */
export function linkedValueText(hass: HomeAssistant, action: Action): string | undefined {
  if (action.kind !== "service" || !action.data_sources) return undefined;
  const out: string[] = [];
  for (const source of Object.values(action.data_sources)) {
    const state = hass.states[source.entity_id];
    const raw = source.attribute ? state?.attributes[source.attribute] : state?.state;
    if (raw === undefined || raw === null || raw === "" || raw === "unknown" || raw === "unavailable") continue;
    const n = toNumber(raw);
    const unit = source.attribute ? "" : String(state?.attributes.unit_of_measurement ?? "");
    out.push(Number.isFinite(n) ? `${fmtNum(hass.language, n)}${unit ? ` ${unit}` : ""}` : String(raw));
  }
  return out.length ? out.join(", ") : undefined;
}

/**
 * Name to show for a setting. A name that is a raw service id ("vacuum.start", what an unnamed setting got
 * from its action) is shown with Home Assistant's translated service name, else the service part made readable.
 * With `show_value`, the value the action reads from an entity follows ("Favourite (40 %)"), else, for a preset mode,
 * its temperature ("Comfort (19 °C)"). The stored name is never changed.
 */
export function labelName(hass: HomeAssistant, label: Pick<Label, "name"> & Partial<Pick<Label, "action" | "show_value">>, entityId?: string): string {
  const base = baseName(hass, label.name);
  if (!label.show_value || !label.action) return base;
  const linked = linkedValueText(hass, label.action);
  if (linked !== undefined) return `${base} (${linked})`;
  const value = presetTemperature(hass, label.action, entityId);
  if (value === undefined) return base;
  return `${base} (${fmtNum(hass.language, value)} ${hass.config.unit_system?.temperature ?? "°C"})`;
}

function baseName(hass: HomeAssistant, name: string): string {
  if (!SERVICE_ID.test(name)) return name;
  const translated = serviceLabel(hass, name);
  if (translated !== name) return translated;
  const part = name.split(".")[1].replace(/_/g, " ");
  return part.charAt(0).toUpperCase() + part.slice(1);
}

/** Integrations whose service names the labels show: the one of each action, and the one of a name that is a raw service id. */
export function labelDomains(labels: Label[]): string[] {
  const out = new Set<string>();
  for (const l of labels) {
    if (l.action.kind === "service") out.add(l.action.service.split(".")[0]);
    if (SERVICE_ID.test(l.name)) out.add(l.name.split(".")[0]);
  }
  return [...out];
}

/** Scenes that contain the entity (attribute `entity_id` of `scene.*`). */
export function scenesOf(hass: HomeAssistant, entityId: string): HassEntity[] {
  return Object.values(hass.states)
    .filter((s) => s.entity_id.startsWith("scene.") && Array.isArray(s.attributes.entity_id) && s.attributes.entity_id.includes(entityId))
    .sort((a, b) => String(a.attributes.friendly_name ?? a.entity_id).localeCompare(String(b.attributes.friendly_name ?? b.entity_id)));
}

/** Services the owner offers for a device of a program (empty: all). */
export const allowedOf = (program: Program | null | undefined, entityId: string): string[] | undefined => {
  const entity = program?.entities.find((e) => e.entity_id === entityId);
  return entity?.restrict_services || entity?.allowed_services?.length ? entity.allowed_services ?? [] : undefined;
};

/** Can this action be applied to the entity? (service target accepts it, scene contains it, service allowed) */
export function compatible(hass: HomeAssistant, entityId: string, action: Action, allowed?: string[]): boolean {
  if (action.kind === "scene") {
    const members = hass.states[action.scene]?.attributes.entity_id;
    return Array.isArray(members) ? members.includes(entityId) : true;
  }
  if (allowed !== undefined && !allowed.includes(action.service)) return false;
  const target = action.target_entity_id ?? entityId;
  if (!target) return false;
  if (action.service.split(".")[0] === target.split(".")[0]) return true;
  return servicesFor(hass, target).some((s) => s.id === action.service);
}

/**
 * Labels offered for devices: compatible with at least one of them. A service label aimed at another entity
 * (`target_entity_id`) is offered only when that entity belongs to the program (or is one of the devices);
 * a label the program already uses always stays.
 */
export function labelsFor(hass: HomeAssistant, data: PlannerData, entityIds: string[], program?: Program | null): Label[] {
  const mine = new Set([...entityIds, ...(program?.entities.map((e) => e.entity_id) ?? [])]);
  return data.labels.filter((l) => {
    const a = l.action;
    const elsewhere = a.kind === "service" && a.target_entity_id !== undefined && a.target_entity_id !== "" && !mine.has(a.target_entity_id);
    if (elsewhere && !(program && usesLabel(program, l.id))) return false;
    return entityIds.some((e) => compatible(hass, e, a, allowedOf(program, e)));
  });
}

/** What a label does to an entity of a program: its own value for the device, else the label's. */
export function entityAction(program: Program, entityId: string, label: Label | undefined): Action | undefined {
  if (!label) return undefined;
  const own = program.entities.find((e) => e.entity_id === entityId)?.label_overrides?.[label.id];
  return own ?? label.action;
}

/**
 * What the engine really does for this device: the label's action (own value or global) only if the device
 * can take it (service accepted by the entity, scene containing it, service allowed). Else undefined: the
 * slot is ignored for that device, so the card must not draw it there.
 */
export function appliedAction(
  hass: HomeAssistant, program: Program, entityId: string, label: Label | undefined, slot?: Pick<Slot, "entities">,
): Action | undefined {
  // a slot that does not target this device does nothing to it (`applies`); no slot: a default label
  if (slot && !applies(slot, entityId)) return undefined;
  const action = entityAction(program, entityId, label);
  return action && compatible(hass, entityId, action, allowedOf(program, entityId)) ? action : undefined;
}

/**
 * Devices of the program (except `except`) that this label really acts on (`appliedAction`, never a domain test):
 * the only ones "Also for: …" may offer. No label yet: none.
 */
export function compatibleDevices(hass: HomeAssistant, program: Program, label: Label | undefined, except = ""): string[] {
  if (!label) return [];
  return program.entities.map((e) => e.entity_id).filter((eid) => eid !== except && Boolean(appliedAction(hass, program, eid, label)));
}

export const hasOverride =(program: Program, entityId: string, labelId: string): boolean =>
  Boolean(program.entities.find((e) => e.entity_id === entityId)?.label_overrides?.[labelId]);

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** Number an action sets, for the chart: a temperature, a position or a brightness (null: none). */
export function actionValue(action: Action | undefined): number | null {
  if (!action || action.kind !== "service" || action.target_entity_id) return null;
  const d = action.data ?? {};
  return num(action.data_sources?.temperature ? null : d.temperature) ?? num(action.data_sources?.position ? null : d.position) ?? num(action.data_sources?.brightness_pct ? null : d.brightness_pct);
}

/** Short text of an action: "18 °C", "30 %", the scene name, else the translated service. */
export function actionText(hass: HomeAssistant, lang: string, action: Action | undefined): string {
  if (!action) return "";
  if (action.kind === "scene") return String(hass.states[action.scene]?.attributes.friendly_name ?? action.scene);
  if (action.target_entity_id) return `${serviceLabel(hass, action.service)} · ${hass.states[action.target_entity_id]?.attributes.friendly_name ?? action.target_entity_id}`;
  if (Object.keys(action.data_sources ?? {}).length) return actionSourceText(hass, action);
  const d = action.data ?? {};
  if (num(d.temperature) !== null) return `${fmtNum(lang, Number(d.temperature))} °C`;
  if (num(d.position) !== null) return `${d.position} %`;
  if (num(d.brightness_pct) !== null) return `${d.brightness_pct} %`;
  return serviceLabel(hass, action.service);
}

/** A source remains identifiable even while its value is unavailable. Never present it as a fixed target. */
function actionSourceText(hass: HomeAssistant, action: Extract<Action, { kind: "service" }>): string {
  return Object.values(action.data_sources ?? {}).map((source) => {
    const state = hass.states[source.entity_id];
    const name = String(state?.attributes.friendly_name ?? source.entity_id);
    const value = source.attribute ? state?.attributes[source.attribute] : state?.state;
    const available = state && !["unknown", "unavailable"].includes(state.state) && value !== undefined && value !== null;
    return `${name}${source.attribute ? ` · ${source.attribute}` : ""}${available && ["string", "number", "boolean"].includes(typeof value) ? ` (${value})` : ""}`;
  }).join(" · ");
}

/**
 * Translated service and its main values, for a read-only summary: "Set target temperature · 19 °C".
 * Scenes give their name; values that are not plain (objects) are left out.
 */
export function actionSummary(hass: HomeAssistant, lang: string, action: Action | undefined, entityId?: string): string {
  if (!action) return "";
  if (action.kind === "scene") return actionText(hass, lang, action);
  const values: string[] = [];
  const target = action.target_entity_id ?? entityId;
  const stateObj = target ? hass.states[target] : undefined;
  const fmt = (hass as unknown as { formatEntityState?: (s: HassEntity, v?: string) => string }).formatEntityState;
  for (const [key, value] of Object.entries(action.data ?? {})) {
    if (action.data_sources?.[key]) continue;
    if (typeof value === "number") {
      values.push(key === "temperature" ? `${fmtNum(lang, value)} °C` : key === "position" || key === "brightness_pct" ? `${value} %` : fmtNum(lang, value));
    } else if (typeof value === "string" && value) {
      let text = value;
      try { if (key === "hvac_mode" && stateObj && fmt) text = fmt(stateObj, value) || value; } catch { text = value; }
      values.push(text);
    }
  }
  if (Object.keys(action.data_sources ?? {}).length) values.push(actionSourceText(hass, action));
  return [serviceLabel(hass, action.service), ...(action.target_entity_id ? [String(hass.states[action.target_entity_id]?.attributes.friendly_name ?? action.target_entity_id)] : []), ...values].join(" · ");
}

/** Does the program use the label (slots of any profile, defaults, values for a device)? */
export const usesLabel = (p: Program, labelId: string): boolean =>
  p.entities.some((e) => e.default_label === labelId || labelId in (e.label_overrides ?? {}))
  || p.profiles.some((profile) => profile.days.some((day) => day.some((s: Slot) => s.label === labelId)) || holidayOwnSlots(profile).some((s: Slot) => s.label === labelId));

/** Names of the programs using a label (slots of any profile, defaults, values for a device). */
export const labelUsers = (data: PlannerData, labelId: string): string[] => data.programs.filter((p) => usesLabel(p, labelId)).map((p) => p.name);

/** A copy of the program where `to` replaces `from` (slots, "the rest of the time"); the values of `from` for a device go with it. */
export function replaceLabel(program: Program, from: string, to: string): Program {
  const swap = (slot: Slot): Slot => (slot.label === from ? { ...slot, label: to } : slot);
  return {
    ...program,
    entities: program.entities.map((e) => {
      const overrides = { ...(e.label_overrides ?? {}) };
      delete overrides[from];
      return { ...e, default_label: e.default_label === from ? to : e.default_label, label_overrides: overrides };
    }),
    profiles: program.profiles.map((profile) => ({
      ...profile,
      days: profile.days.map((day) => day.map(swap)),
      ...(profile.holiday && "day" in profile.holiday && profile.holiday.day ? { holiday: { ...profile.holiday, day: profile.holiday.day.map(swap) } } : {}),
    })),
  };
}
