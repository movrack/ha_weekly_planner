// Display-only chart sources: no scheduling or device-service knowledge.
import type { ChartSource, HomeAssistant } from "./types";

export interface SourcePoint { t: number; s: string; a: Record<string, any> }
export const badState = (value: string): boolean => value === "unknown" || value === "unavailable" || value.trim() === "";
export const stateNumber = (value: string): number | null => !badState(value) && Number.isFinite(Number(value)) ? Number(value) : null;
export const sourceUnit = (hass: HomeAssistant, id: string, history: readonly SourcePoint[] = []): string =>
  String(hass.states[id]?.attributes.unit_of_measurement ?? history[history.length - 1]?.a.unit_of_measurement ?? "");

export function sourceKind(hass: HomeAssistant, id: string): ChartSource["kind"] {
  const entity = hass.states[id];
  if (!entity) return "states";
  if (Array.isArray(entity.attributes.options)) return "states";
  return sourceUnit(hass, id) || entity.attributes.state_class || stateNumber(entity.state) !== null ? "numeric" : "states";
}

/** Stable colours survive removal, reordering and opening the same program in another client. */
export function sourceColor(id: string, state = ""): string {
  let hash = 2166136261;
  for (const ch of `${id}\0${state}`) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619);
  return `hsl(${(hash >>> 0) % 360} 68% 43%)`;
}

export function knownStates(hass: HomeAssistant, source: ChartSource, history: readonly SourcePoint[] = []): string[] {
  const entity = hass.states[source.entity_id];
  const choices = Array.isArray(entity?.attributes.options) ? entity.attributes.options.filter((s: unknown): s is string => typeof s === "string") : [];
  return [...new Set([...choices, ...(entity && !badState(entity.state) ? [entity.state] : []),
    ...history.map(p => p.s).filter(s => !badState(s)), ...(source.states ?? [])])].sort();
}

export function stateName(hass: HomeAssistant, id: string, state: string): string {
  const entity = hass.states[id];
  return entity ? hass.formatEntityState?.({ ...entity, state }, state) ?? state : state;
}

export interface StateInterval { from: number; to: number; state: string | null; selected: boolean; missing: boolean }
/** The API's carried initial state is used; missing history before the first observation stays missing. */
export function stateIntervals(history: readonly SourcePoint[], selected: readonly string[], from: number, to: number): StateInterval[] {
  if (to <= from) return [];
  const pts = [...history].sort((a,b) => a.t - b.t);
  const out: StateInterval[] = [];
  let cursor = from;
  let value: string | null = null;
  const add = (end: number) => {
    if (end <= cursor) return;
    out.push({ from: cursor, to: end, state: value, selected: value !== null && selected.includes(value), missing: value === null || badState(value) });
    cursor = end;
  };
  for (const point of pts) {
    if (point.t <= from) { value = point.s; continue; }
    if (point.t >= to) break;
    add(point.t); value = point.s;
  }
  add(to);
  return out;
}

/** Unit groups in insertion order. Sources with the same unit use one scale; missing entities add no scale. */
export function sourceUnits(hass: HomeAssistant, sources: readonly ChartSource[], mainUnit: string | null): string[] {
  return [...new Set([...(mainUnit === null ? [] : [mainUnit]), ...sources.filter(s => s.kind === "numeric" && hass.states[s.entity_id]).map(s => sourceUnit(hass, s.entity_id))])];
}

export interface NumericAxis { unit: string; color: string; lo: number; hi: number }
/** Three unit scales at most; bounds are reduced without spreading potentially large histories. */
export function numericAxes(hass: HomeAssistant, sources: readonly ChartSource[], history: Record<string, SourcePoint[]>,
  primary: { unit: string; lo: number; hi: number } | null): { axes: NumericAxis[]; overflow: boolean } {
  const axes: NumericAxis[] = primary ? [{ ...primary, color: "var(--primary-color)" }] : [];
  let overflow = false;
  for (const source of sources.filter(s => s.kind === "numeric")) {
    if (!hass.states[source.entity_id] && !(history[source.entity_id] ?? []).some(p => stateNumber(p.s) !== null)) continue;
    const unit = sourceUnit(hass, source.entity_id, history[source.entity_id]);
    let axis = axes.find(a => a.unit === unit);
    if (!axis) {
      if (axes.length === 3) { overflow = true; continue; }
      axis = { unit, color: sourceColor(source.entity_id), lo: Infinity, hi: -Infinity }; axes.push(axis);
    }
    for (const point of history[source.entity_id] ?? []) {
      const value = stateNumber(point.s);
      if (value !== null) { axis.lo = Math.min(axis.lo, value - 1); axis.hi = Math.max(axis.hi, value + 1); }
    }
  }
  for (const axis of axes) {
    if (!Number.isFinite(axis.lo)) { axis.lo = 0; axis.hi = 1; }
    else { axis.lo = Math.floor(axis.lo); axis.hi = Math.ceil(axis.hi); }
  }
  return { axes, overflow };
}

export function axisTicks(lo: number, hi: number): number[] {
  const range = hi - lo;
  if (!(range > 0) || !Number.isFinite(range)) return [lo];
  const base = 10 ** Math.floor(Math.log10(range / 4));
  const step = [1, 2, 5, 10].map(n => n * base).find(n => range / n <= 4) ?? base * 10;
  const out: number[] = [];
  for (let i = 0, v = Math.ceil(lo / step) * step; i < 6 && v <= hi + step * 1e-9; i++, v += step) out.push(v);
  return out;
}

/** Every loaded local day starts with its own initial state, or a gap; never carry through a failed day. */
export function mergeSourceDays(days: readonly { start: number; end: number; history: SourcePoint[] }[]): SourcePoint[] {
  const out: SourcePoint[] = [];
  for (const day of days) {
    const sorted = [...day.history].sort((a,b) => a.t - b.t);
    let initial: SourcePoint | undefined;
    for (const p of sorted) { if (p.t <= day.start) initial = p; else break; }
    out.push(initial ? { ...initial, t: day.start } : { t: day.start, s: "unknown", a: {} });
    out.push(...sorted.filter(p => p.t > day.start && p.t < day.end));
  }
  return [...new Map(out.map(p => [p.t, p])).values()].sort((a,b) => a.t - b.t);
}
