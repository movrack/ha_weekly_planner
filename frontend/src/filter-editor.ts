// Pure logic of the card editor's "programs to display" tree (one switch per program; quick type helpers).
// Config mapping: `filter.types` (legacy, kept) and `filter.programs` (explicit ids) are both honoured by
// filterPrograms(). A program is "on" when it passes both. Any edit materialises the selection in
// `filter.programs`; `filter.types` is only ever widened (to let an enabled program through) or, for a type
// with no program left, removed. Nothing is hardcoded: groups come from the entities' domains.
import { entityDomain, selectedProgramIds } from "./planner";
import type { Program } from "./types";

export interface FilterConfig { types?: string[]; area?: string; programs?: string[] }
export type FilterPatch = { types?: string[]; programs?: string[] };
export interface TypeGroup { type: string; label: string; programs: { id: string; name: string }[] }

const domainsOf = (p: Pick<Program, "entities">): string[] => [...new Set(p.entities.map((e) => entityDomain(e.entity_id)))];

/** `all` = every program (needed so an id wins over a same-valued name); defaults to just `p`. */
export function isOn(p: Program, filter?: FilterConfig, all: Pick<Program, "id" | "name">[] = [p]): boolean {
  const types = filter?.types;
  const typeOk = !types?.length || domainsOf(p).some((d) => types.includes(d));
  return typeOk && (filter?.programs === undefined || selectedProgramIds(all, filter.programs).has(p.id));
}

/** Programs grouped by domain (sorted by label); selected-but-empty types and unknown selected ids are retained. */
export function typeGroups(programs: Program[], filter: FilterConfig | undefined, labelOf: (type: string) => string, lang: string) {
  const map = new Map<string, TypeGroup>();
  const group = (type: string) => {
    let g = map.get(type);
    if (!g) map.set(type, (g = { type, label: labelOf(type) || type, programs: [] }));
    return g;
  };
  for (const p of programs) for (const d of domainsOf(p)) group(d).programs.push({ id: p.id, name: p.name });
  for (const t of filter?.types ?? []) if (t) group(t);
  const groups = [...map.values()].sort((a, b) => a.label.localeCompare(b.label, lang) || a.type.localeCompare(b.type));
  for (const g of groups) g.programs.sort((a, b) => a.name.localeCompare(b.name, lang) || a.id.localeCompare(b.id));
  return { groups, orphans: orphanRefs(programs, filter) };
}

export interface ProgramRow { id: string; name: string; domains: string[]; devices: string[] }

/** One row per program (never repeated per type), sorted by name; `deviceName` gives each device's display name. */
export function programRows(programs: Program[], deviceName: (entityId: string) => string, lang: string): ProgramRow[] {
  return programs.map((p) => ({ id: p.id, name: p.name, domains: domainsOf(p), devices: p.entities.map((e) => deviceName(e.entity_id)) }))
    .sort((a, b) => a.name.localeCompare(b.name, lang) || a.id.localeCompare(b.id));
}

/** Entries of `filter.programs` that designate no program (neither by id nor by name); kept as-is. */
const orphanRefs = (programs: Program[], filter?: FilterConfig): string[] =>
  (filter?.programs ?? []).filter((ref) => !selectedProgramIds(programs, [ref]).size);

export function typeState(g: TypeGroup, programs: Program[], filter?: FilterConfig): "on" | "off" | "partial" {
  if (!g.programs.length) return !filter?.types?.length || filter.types.includes(g.type) ? "on" : "off";
  const byId = new Map(programs.map((p) => [p.id, p]));
  const on = g.programs.filter((x) => byId.get(x.id) && isOn(byId.get(x.id)!, filter, programs)).length;
  return on === 0 ? "off" : on === g.programs.length ? "on" : "partial";
}

function build(programs: Program[], filter: FilterConfig | undefined, ids: Set<string>, widen: string[]): FilterPatch {
  const orphans = orphanRefs(programs, filter);
  const types = filter?.types ?? [];
  const patch: FilterPatch = { programs: [...programs.map((p) => p.id).filter((id) => ids.has(id)), ...orphans] };
  if (types.length) patch.types = [...new Set([...types, ...widen])];
  return patch;
}

const currentIds = (programs: Program[], filter?: FilterConfig) => new Set(programs.filter((p) => isOn(p, filter, programs)).map((p) => p.id));

export function toggleProgram(programs: Program[], filter: FilterConfig | undefined, id: string, on: boolean): FilterPatch {
  const ids = currentIds(programs, filter);
  const p = programs.find((x) => x.id === id);
  if (on) ids.add(id); else ids.delete(id);
  return build(programs, filter, ids, on && p ? domainsOf(p) : []);
}

export function toggleType(programs: Program[], filter: FilterConfig | undefined, type: string, on: boolean): FilterPatch {
  const ids = currentIds(programs, filter);
  const members = programs.filter((p) => domainsOf(p).includes(type));
  for (const p of members) { if (on) ids.add(p.id); else ids.delete(p.id); }
  const patch = build(programs, filter, ids, on ? [type] : []);
  if (!on && !members.length && patch.types) patch.types = patch.types.filter((t) => t !== type);
  return patch;
}

/** "All programs": no id list, no type restriction (future programs included). */
export const allPrograms = (): { types: undefined; programs: undefined } => ({ types: undefined, programs: undefined });

/** Master switch turned off: nothing selected yet (configured types stay), refine with the type/program switches. */
export function toggleAllOff(programs: Program[], filter?: FilterConfig): FilterPatch {
  return build(programs, filter, new Set(), []);
}

/** Card config after creating `created`: it must be what the card shows. Single-program mode points to it; list
 *  mode keeps its mode and only widens the filter (id list, types, area) when it would otherwise hide the new program. */
export function selectCreated<T extends { program?: string; filter?: FilterConfig }>(config: T, programs: Program[], created: Program): T {
  if (config.program !== undefined) {
    const { filter: _drop, ...rest } = config;
    return { ...rest, program: created.id } as T;
  }
  const all = programs.some((p) => p.id === created.id) ? programs : [...programs, created];
  let filter: FilterConfig = { ...(config.filter ?? {}) };
  if (filter.area && created.area !== filter.area) delete filter.area;
  if (!isOn(created, filter, all)) filter = { ...filter, ...toggleProgram(all, filter, created.id, true) };
  return { ...config, filter } as T;
}
