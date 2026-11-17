import type { HomeAssistant, Program } from "./types";

type Areas = HomeAssistant["areas"];
type AreaSource = { areas?: Areas } | undefined | null;

/** Comparison form of a room text: lower case, no accents, runs of spaces, `_` and `-` as one space. */
export function normalizeRoom(text: string | null | undefined): string {
  return (text ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[\s_-]+/g, " ").trim();
}

/** Key of a stored room text: the id of the Home Assistant area it matches, else its normalized form. "" when empty. */
export function roomKey(hass: AreaSource, text: string | null | undefined): string {
  const raw = (text ?? "").trim();
  if (!raw) return "";
  const norm = normalizeRoom(raw);
  if (!norm) return "";
  const areas = Object.values(hass?.areas ?? {}).sort((a, b) => a.area_id.localeCompare(b.area_id));
  const found = areas.find((a) => a.area_id === raw)
    ?? areas.find((a) => normalizeRoom(a.name) === norm)
    ?? areas.find((a) => normalizeRoom(a.area_id) === norm);
  return found ? found.area_id : norm;
}

const upperFirst = new Intl.Collator(undefined, { caseFirst: "upper" });

/** Display name of a room key: the area name, else the first original text (alphabetical), unchanged. */
export function roomLabel(hass: AreaSource, key: string, texts: readonly (string | null | undefined)[]): string {
  const area = hass?.areas?.[key];
  if (area && area.area_id === key) return area.name;
  const own = texts.filter((t): t is string => typeof t === "string" && t.length > 0).sort(upperFirst.compare);
  return own[0] ?? key;
}

/** `filter.area` as a list: one room text or a list of room texts (several rooms), empty entries dropped. */
export const areaList = (v: unknown): string[] =>
  (Array.isArray(v) ? v : typeof v === "string" ? [v] : []).filter((x): x is string => typeof x === "string" && x.trim() !== "");

/** The keys of the rooms chosen by `filter.area` (empty set: no room filter). */
export const roomKeys = (hass: AreaSource, v: unknown): Set<string> => new Set(areaList(v).map((a) => roomKey(hass, a)).filter(Boolean));

/** What to store in `filter.area` for the chosen room values: nothing, one text (as before), or a list. */
export const areaValue = (values: string[]): string | string[] | undefined => (values.length === 0 ? undefined : values.length === 1 ? values[0] : values);

export interface RoomOption { key: string; value: string; label: string }

/** Program metadata only (device rooms never assign a room): one option per room, merged spellings, plus the current selection. */
export function roomOptions(hass: AreaSource, programs: Pick<Program, "area">[], selected?: string | string[]): RoomOption[] {
  const byKey = new Map<string, string[]>();
  for (const text of [...programs.map((p) => p.area), ...areaList(selected)]) {
    const key = roomKey(hass, text);
    if (!key) continue;
    byKey.set(key, [...(byKey.get(key) ?? []), text as string]);
  }
  return [...byKey].map(([key, texts]) => {
    const label = roomLabel(hass, key, texts);
    return { key, value: hass?.areas?.[key] ? key : label, label };
  }).sort((a, b) => a.label.localeCompare(b.label));
}
