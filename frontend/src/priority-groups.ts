// Competition between programs and their rank (issue #60). Python counterpart: custom_components/weekly_planner/priorities.py.
// Programs that share at least one device compete, transitively; schedules and modes are ignored. Rank 1 wins.

import type { Program } from "./types";

export type Ranked = Pick<Program, "id" | "priority" | "entities"> & { created_at?: string };

/** Id of the program being created in a group order sent with its save. */
export const NEW_ID = "new";

const DEFAULT_PRIORITY = 10;
const devices = (p: Ranked): string[] => p.entities.map((e) => e.entity_id);

/** Smallest priority first, then the oldest program. */
export function byRank(a: Ranked, b: Ranked): number {
  return (a.priority ?? DEFAULT_PRIORITY) - (b.priority ?? DEFAULT_PRIORITY) || (a.created_at ?? "").localeCompare(b.created_at ?? "");
}

/** Groups linked through shared devices (singletons included), each in rank order. */
export function components<T extends Ranked>(programs: T[]): T[][] {
  const parent = programs.map((_, i) => i);
  const find = (i: number): number => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  const owner = new Map<string, number>();
  programs.forEach((p, i) => {
    for (const d of devices(p)) {
      const first = owner.get(d);
      if (first === undefined) owner.set(d, i); else parent[find(i)] = find(first);
    }
  });
  const groups = new Map<number, T[]>();
  programs.forEach((p, i) => groups.set(find(i), [...(groups.get(find(i)) ?? []), p]));
  return [...groups.values()].map((g) => [...g].sort(byRank));
}

/** The competing groups (two programs or more) and the programs that compete with nobody. */
export function competition<T extends Ranked>(programs: T[]): { groups: T[][]; alone: T[] } {
  const all = components(programs);
  return { groups: all.filter((g) => g.length > 1), alone: all.filter((g) => g.length === 1).map((g) => g[0]) };
}

/** Devices used by at least two programs of the group. */
export function sharedDevices(group: Ranked[]): Set<string> {
  const seen = new Map<string, number>();
  for (const p of group) for (const d of new Set(devices(p))) seen.set(d, (seen.get(d) ?? 0) + 1);
  return new Set([...seen].filter(([, n]) => n > 1).map(([d]) => d));
}

function interleave<T extends Ranked>(groups: T[][]): T[] {
  return groups.flatMap((g) => g.map((p, position) => ({ p, position })))
    .sort((a, b) => a.position - b.position || (a.p.created_at ?? "").localeCompare(b.p.created_at ?? ""))
    .map((x) => x.p);
}

/**
 * Order of the group of `saved` once saved (`programs` holds it) and whether the server rewrites the ranks.
 * A program that newly competes goes last; joining several groups interleaves them by rank. `before` is the
 * device list of the saved program as stored (empty for a new program). Empty when it competes with nobody.
 */
export function placeSaved<T extends Ranked>(programs: T[], saved: T, before: string[]): { group: T[]; renumber: boolean } {
  const joined = components(programs.filter((p) => p.id !== saved.id))
    .filter((g) => g.some((m) => devices(m).some((d) => devices(saved).includes(d))));
  if (!joined.length) return { group: [], renumber: false };
  const newly = joined.some((g) => !g.some((m) => devices(m).some((d) => before.includes(d))));
  return newly
    ? { group: [...interleave(joined), saved], renumber: true }
    : { group: [saved, ...joined.flat()].sort(byRank), renumber: false };
}

/** `group` reordered as `order` says; unknown ids are ignored and members not listed follow. */
export function applyOrder<T extends { id: string }>(group: T[], order: string[]): T[] {
  const listed = [...new Set(order.filter((id) => group.some((p) => p.id === id)))];
  return [...listed.map((id) => group.find((p) => p.id === id)!), ...group.filter((p) => !listed.includes(p.id))];
}

/** `ids` with `id` taken out and put at position `to` (among the others). */
export function moveTo(ids: string[], id: string, to: number): string[] {
  const rest = ids.filter((x) => x !== id);
  rest.splice(Math.max(0, Math.min(rest.length, to)), 0, id);
  return rest;
}
