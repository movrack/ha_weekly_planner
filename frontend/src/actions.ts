// Pure logic of the schedule screens: what a slot does to a device, grouping the same slot across
// days, the actions offered per device type, and the short texts shown on rows and cards.

import { t } from "./i18n";
import {
  entityDomain, fmtNum, friendlyName, modeEffect, modeSetpoint, newId, presetLabel, presetTemperature,
} from "./planner";
import { isGenericEntity, serviceLabel } from "./services";
import { DAY, STEP, fmtClock } from "./time";
import type { HomeAssistant, Mode, Profile, Program, ProgramEntity, Setpoint, Slot, TimeSpec } from "./types";

export const NBSP = " ";
export const nb = (text: string): string => text.replace(/ /g, NBSP);

/* ------------------------------------------------------------------ action of a slot */

/** What a slot (or a default) does: a setpoint, optionally linked to a common mode. */
export interface Act {
  sp: Setpoint;
  modeId?: string;
  /** Default only: leave the device as it is, or return to its previous state. */
  special?: "none" | "previous";
}

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

/** Act a slot gives to an entity: its own setpoint wins over the common mode of its type. */
export function readAct(slot: Slot, entityId: string, modes: Mode[]): Act | null {
  const direct = slot.actions.by_entity[entityId];
  if (direct) {
    return { sp: direct };
  }
  const modeId = slot.actions.by_type[entityDomain(entityId)];
  const mode = modes.find((m) => m.id === modeId);
  return mode ? { sp: modeSetpoint(mode, entityId), modeId: mode.id } : null;
}

/** Writes the act of an entity into a slot (a common mode is kept as a mode when it is safe). */
export function writeAct(slot: Slot, program: Program, entityId: string, act: Act): Slot {
  const domain = entityDomain(entityId);
  const byType = { ...slot.actions.by_type };
  const byEntity = { ...slot.actions.by_entity };
  const alone = program.entities.filter((e) => entityDomain(e.entity_id) === domain).length <= 1;
  if (act.modeId && alone) {
    byType[domain] = act.modeId;
    delete byEntity[entityId];
  } else {
    byEntity[entityId] = act.sp;
    if (alone) delete byType[domain];
  }
  return { ...slot, actions: { by_type: byType, by_entity: byEntity } };
}

/** Act of the "rest of the time" of an entity. */
export function readDefault(entity: ProgramEntity, modes: Mode[]): Act {
  const d = entity.default ?? { kind: "none" };
  if (d.kind === "mode") {
    const mode = modes.find((m) => m.id === d.value);
    if (mode) return { sp: modeSetpoint(mode, entity.entity_id), modeId: mode.id };
  }
  if (d.kind === "setpoint" && d.value && typeof d.value === "object") return { sp: d.value };
  return { sp: { kind: "off" }, special: d.kind === "previous" ? "previous" : "none" };
}

export function writeDefault(act: Act): ProgramEntity["default"] {
  if (act.special) return { kind: act.special };
  if (act.modeId) return { kind: "mode", value: act.modeId };
  return { kind: "setpoint", value: act.sp };
}

/* ------------------------------------------------------------------ texts */

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** Short text of an action: "18 °C", "Confort", "Ouvrir", "Scène Soir". */
export function actText(hass: HomeAssistant, lang: string, modes: Mode[], entityId: string, act: Act | Setpoint): string {
  const a: Act = "sp" in act ? (act as Act) : { sp: act as Setpoint };
  const sp = a.sp as Record<string, unknown>;
  const mode = a.modeId ? modes.find((m) => m.id === a.modeId) : undefined;
  const domain = entityDomain(entityId);
  switch (sp.kind) {
    case "scene": return String(hass.states[String(sp.scene)]?.attributes.friendly_name ?? sp.scene);
    case "service": return serviceLabel(hass, String(sp.service));
    case "temperature": return `${fmtNum(lang, Number(sp.temperature))} °C`;
    case "preset": {
      if (mode) return mode.name;
      const temp = presetTemperature(hass, entityId, String(sp.preset));
      return temp !== null ? `${presetLabel(lang, String(sp.preset))} ${fmtNum(lang, temp)} °C` : presetLabel(lang, String(sp.preset));
    }
    case "open": return t(lang, "act_open");
    case "close": return t(lang, "act_close");
    case "position": return `${sp.position} %`;
    case "off": return domain === "climate" ? t(lang, "sp_off") : t(lang, "act_off");
    case "on": {
      const parts = [t(lang, "act_on")];
      if (num(sp.brightness) !== null) parts.push(`${sp.brightness} %`);
      if (sp.effect) parts.push(String(sp.effect));
      if (num(sp.color_temp_kelvin) !== null) parts.push(`${sp.color_temp_kelvin} K`);
      return parts.join(" ");
    }
    default: return mode?.name ?? String(sp.kind);
  }
}

/** Current state of a device, as short as possible: "15 °C", "Fermé", "Allumée 40 %". */
export function stateText(hass: HomeAssistant, lang: string, entityId: string): string {
  const st = hass.states[entityId];
  if (!st) return "?";
  if (st.state === "unavailable" || st.state === "unknown") return "—";
  const a = st.attributes;
  switch (entityDomain(entityId)) {
    case "climate": {
      if (st.state === "off") return t(lang, "sp_off");
      const target = num(a.temperature);
      return target !== null ? `${fmtNum(lang, target)} °C` : st.state;
    }
    case "cover": {
      const p = num(a.current_position);
      if (st.state === "open" && p !== null && p < 100) return `${p} %`;
      return st.state === "open" ? t(lang, "sp_open") : st.state === "closed" ? t(lang, "sp_close") : `${p ?? ""} %`;
    }
    case "light": {
      if (st.state !== "on") return t(lang, "sp_off");
      const b = num(a.brightness);
      return b !== null ? `${t(lang, "sp_on")} ${Math.round((b / 255) * 100)} %` : t(lang, "sp_on");
    }
    default:
      if (isGenericEntity(entityId)) return hass.formatEntityState?.(st) ?? st.state;
      return st.state === "on" ? t(lang, "sp_on") : st.state === "off" ? t(lang, "sp_off") : st.state;
  }
}

/** Does this act call a Home Assistant service (one-shot, never an end)? */
export const isServiceAct = (act: Act | null | undefined): boolean => act?.sp.kind === "service";

/** Colour of a slot on the day bar. */
export function actColor(modes: Mode[], entityId: string, act: Act | null): string {
  if (!act) return "var(--disabled-text-color, #9e9e9e)";
  const mode = act.modeId ? modes.find((m) => m.id === act.modeId) : modes.find((m) => same(modeSetpoint(m, entityId), act.sp));
  if (mode) return mode.color;
  const sp = act.sp as Record<string, unknown>;
  switch (sp.kind) {
    case "temperature": {
      const v = Math.max(10, Math.min(24, Number(sp.temperature)));
      return `hsl(${Math.round(210 - ((v - 10) / 14) * 180)}, 70%, 48%)`;
    }
    case "preset": return "#ff9800";
    case "open": return "#ffc107";
    case "close": return "#455a64";
    case "position": return "#8bc34a";
    case "on": return "#ffb300";
    case "off": return "#616161";
    case "scene": return "#7e57c2";
    case "service": return "#26a69a";
    default: return "var(--secondary-text-color)";
  }
}

/* ------------------------------------------------------------------ time of a slot */

export type SunName = "sunrise" | "sunset";

export function isSun(spec: TimeSpec): spec is Extract<TimeSpec, { sun: string }> {
  return "sun" in spec;
}

const offsetWord = (lang: string, minutes: number): string => {
  const abs = Math.abs(minutes);
  const d = abs < 60 ? `${abs} min` : abs % 60 ? `${Math.floor(abs / 60)} h ${String(abs % 60).padStart(2, "0")}` : `${abs / 60} h`;
  return `${minutes > 0 ? "+" : "−"}${d}`;
};

/** "8 h 45", "Coucher", "Coucher +30 min". Non-breaking spaces. */
export function specText(lang: string, spec: TimeSpec, minutes?: number): string {
  if ("time" in spec) {
    const [h, m] = spec.time.split(":").map(Number);
    return nb(h * 60 + m >= DAY ? "24 h" : fmtClock(lang, h * 60 + m));
  }
  const name = t(lang, (spec.sun === "sunrise" || spec.sun === "sunset" ? `sun_${spec.sun}_short` : `sun_${spec.sun}`) as never);
  const off = spec.offset ? ` ${offsetWord(lang, spec.offset)}` : "";
  void minutes;
  return nb(`${name}${off}`);
}

/** Moves a time by the step (15 min), or the offset of a sun time. */
export function shiftSpec(spec: TimeSpec, delta: number): TimeSpec {
  if ("time" in spec) {
    const [h, m] = spec.time.split(":").map(Number);
    const next = Math.max(0, Math.min(DAY, Math.round((h * 60 + m + delta) / STEP) * STEP));
    return { time: next >= DAY ? "24:00" : `${String(Math.floor(next / 60)).padStart(2, "0")}:${String(next % 60).padStart(2, "0")}` };
  }
  return { ...spec, offset: Math.max(-240, Math.min(240, (spec.offset ?? 0) + delta)) };
}

/* ------------------------------------------------------------------ days */

export const WEEKDAYS = [0, 1, 2, 3, 4];
export const WEEKEND = [5, 6];
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export function daysText(lang: string, short: string[], days: number[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  if (same(sorted, ALL_DAYS)) return t(lang, "all_days_text");
  if (same(sorted, WEEKDAYS)) return `${short[0]}–${short[4]}`;
  if (same(sorted, WEEKEND)) return t(lang, "weekend");
  return sorted.map((d) => short[d]).join(NBSP);
}

/* ------------------------------------------------------------------ grouping slots across days */

export interface SlotGroup {
  /** Template slot (id of the first day). */
  slot: Slot;
  days: number[];
  /** Existing slot id of each day, kept when the group is written back. */
  ids: Record<number, string>;
  fresh?: boolean;
}

/** Stable JSON (sorted keys) used to compare slots. */
export function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${stable(o[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function slotKey(slot: Slot): string {
  const { id: _id, ...rest } = slot;
  return stable({ ...rest, conditions: slot.conditions ?? [], end: slot.end ?? null, color: slot.color ?? null });
}

/** Identical slots of the profile days become one group carrying its days. */
export function groupSlots(
  profile: Profile, include: (slot: Slot) => boolean, minutes: (spec: TimeSpec) => number,
): SlotGroup[] {
  const groups = new Map<string, SlotGroup>();
  profile.days.forEach((slots, day) => {
    for (const slot of slots) {
      if (!include(slot)) continue;
      const key = slotKey(slot);
      let g = groups.get(key);
      if (g && g.days.includes(day)) {
        g = undefined;
        groups.set(`${key}#${slot.id}`, { slot, days: [day], ids: { [day]: slot.id } });
        continue;
      }
      if (!g) {
        g = { slot, days: [], ids: {} };
        groups.set(key, g);
      }
      g.days.push(day);
      g.ids[day] = slot.id;
    }
  });
  return [...groups.values()].sort(
    (a, b) => minutes(a.slot.start) - minutes(b.slot.start) || a.days[0] - b.days[0],
  );
}

/** Writes the groups back as one slot per day; slots rejected by `include` are left alone. */
export function writeGroups(
  profile: Profile, groups: SlotGroup[], include: (slot: Slot) => boolean, minutes: (spec: TimeSpec) => number,
): Profile {
  const days: Slot[][] = profile.days.map((d) => d.filter((s) => !include(s)));
  for (const g of groups) {
    for (const day of g.days) {
      days[day].push({ ...structuredClone(g.slot), id: g.ids[day] ?? newId() });
    }
  }
  return { ...profile, days: days.map((d) => d.sort((a, b) => minutes(a.start) - minutes(b.start))) };
}

/* ------------------------------------------------------------------ actions offered per device */

export interface Choice {
  id: string;
  label: string;
  act: Act;
  group: "basic" | "own" | "scene" | "common";
  /** The choice has its own input (temperature, position, light settings). */
  param?: "temperature" | "position" | "light";
}

const HIDDEN_PRESETS = new Set(["none", "temporary", "permanent"]);

/** Home Assistant scenes that contain the entity (attribute `entity_id` of `scene.*`). */
export function scenesOf(hass: HomeAssistant, entityId: string): { id: string; name: string }[] {
  return Object.values(hass.states)
    .filter((s) => s.entity_id.startsWith("scene.") && Array.isArray(s.attributes.entity_id) && s.attributes.entity_id.includes(entityId))
    .map((s) => ({ id: s.entity_id, name: String(s.attributes.friendly_name ?? s.entity_id) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Options offered for a device: its own modes, then HA scenes, then the common modes. */
export function actionChoices(
  hass: HomeAssistant, lang: string, modes: Mode[], entityId: string, withScenes = true,
): Choice[] {
  const domain = entityDomain(entityId);
  const a = hass.states[entityId]?.attributes ?? {};
  const out: Choice[] = [];
  const add = (c: Choice) => {
    if (!out.some((o) => o.id === c.id || (c.group === "common" && same(o.act.sp, c.act.sp)))) out.push(c);
  };
  const basic = (id: string, label: string, sp: Setpoint, param?: Choice["param"]) =>
    add({ id, label, act: { sp }, group: "basic", param });

  if (domain === "climate") {
    basic("temperature", t(lang, "act_temp"), { kind: "temperature", temperature: num(a.temperature) ?? 19 }, "temperature");
    for (const preset of (a.preset_modes as string[] | undefined) ?? []) {
      if (HIDDEN_PRESETS.has(preset)) continue;
      add({ id: `preset:${preset}`, label: actText(hass, lang, [], entityId, { kind: "preset", preset }), group: "own",
        act: { sp: { kind: "preset", preset } } });
    }
    if (((a.hvac_modes as string[] | undefined) ?? []).includes("off")) basic("off", t(lang, "sp_off"), { kind: "off" });
  } else if (domain === "cover") {
    basic("open", t(lang, "act_open"), { kind: "open" });
    basic("close", t(lang, "act_close"), { kind: "close" });
    basic("position", t(lang, "act_pos"), { kind: "position", position: num(a.current_position) ?? 50 }, "position");
  } else if (domain === "light") {
    basic("on", t(lang, "act_on"), { kind: "on" }, "light");
    basic("off", t(lang, "act_off"), { kind: "off" });
  } else if (["switch", "input_boolean", "fan"].includes(domain)) {
    basic("on", t(lang, "act_on"), { kind: "on" });
    basic("off", t(lang, "act_off"), { kind: "off" });
  }
  if (withScenes) {
    for (const s of scenesOf(hass, entityId)) {
      add({ id: s.id, label: s.name, group: "scene", act: { sp: { kind: "scene", scene: s.id } } });
    }
  }
  const type = domain === "input_boolean" ? "switch" : domain;
  const key = (label: string) => label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(" ")[0];
  for (const m of modes.filter((x) => x.type === type)) {
    // A common mode named like one of the device's own modes ("Hors-gel") would be a duplicate.
    if (out.some((o) => o.group === "own" && key(o.label) === key(m.name))) continue;
    const effect = modeEffect(hass, lang, m, entityId);
    add({ id: `mode:${m.id}`, label: effect ? `${m.name} ${effect}` : m.name, group: "common", act: { sp: modeSetpoint(m, entityId), modeId: m.id } });
  }
  return out;
}

/** Choice matching an act (a mode first, then a parameterised kind, then an equal setpoint). */
export function selectedChoice(choices: Choice[], act: Act | null): Choice | undefined {
  if (!act) return undefined;
  const byMode = act.modeId ? choices.find((c) => c.act.modeId === act.modeId) : undefined;
  if (byMode) return byMode;
  const kind = (act.sp as Record<string, unknown>).kind;
  return choices.find((c) => c.param && (c.act.sp as Record<string, unknown>).kind === kind && !c.act.modeId)
    ?? choices.find((c) => !c.act.modeId && same(c.act.sp, act.sp))
    ?? choices.find((c) => same(c.act.sp, act.sp));
}

/* ------------------------------------------------------------------ entities of a scope */

/** Device name for headers and cards. */
export const deviceName = (hass: HomeAssistant, entityId: string): string => friendlyName(hass, entityId);
