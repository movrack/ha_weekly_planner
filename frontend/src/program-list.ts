// The list of the programs panel: sort (creation order, name, priority) and filters (type, room, device).

import { roomKey, roomOptions } from "./program-areas";
import { domainOf } from "./type-names";
import type { HomeAssistant, Program } from "./types";

export type ProgramSort = "created" | "name" | "priority";

/** `rooms` holds room keys; NO_ROOM stands for the programs without a room. */
export interface ListView { sort: ProgramSort; types: string[]; rooms: string[]; devices: string[] }

export const NO_ROOM = "";
export const emptyView = (): ListView => ({ sort: "created", types: [], rooms: [], devices: [] });

/** How many filters are on (the sort is not a filter). */
export const filterCount = (v: ListView): number => v.types.length + v.rooms.length + v.devices.length;

const byName = (a: Program, b: Program) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });

/** Creation order is the order of the data; name is A to Z; priority is the rank (1 first), then the name. */
export function sortPrograms(programs: Program[], sort: ProgramSort): Program[] {
  if (sort === "name") return [...programs].sort(byName);
  if (sort === "priority") return [...programs].sort((a, b) => a.priority - b.priority || byName(a, b));
  return programs;
}

/** A program passes when, for each kind of filter that is on, it matches at least one of the chosen values. */
export function viewPrograms(hass: HomeAssistant | undefined, programs: Program[], view: ListView): Program[] {
  const keep = (p: Program) =>
    (!view.types.length || p.entities.some((e) => view.types.includes(domainOf(e.entity_id))))
    && (!view.rooms.length || view.rooms.includes(roomKey(hass, p.area)))
    && (!view.devices.length || p.entities.some((e) => view.devices.includes(e.entity_id)));
  return sortPrograms(programs.filter(keep), view.sort);
}

export interface Facets {
  types: { id: string; count: number }[];
  rooms: { key: string; label: string; count: number }[];
  devices: { id: string; count: number }[];
}

/** What can be chosen in each filter, with the number of programs concerned (a program counts once per value). */
export function facets(hass: HomeAssistant | undefined, programs: Program[]): Facets {
  const types = new Map<string, number>();
  const devices = new Map<string, number>();
  const rooms = new Map<string, number>();
  const bump = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
  for (const p of programs) {
    new Set(p.entities.map((e) => domainOf(e.entity_id))).forEach((d) => bump(types, d));
    new Set(p.entities.map((e) => e.entity_id)).forEach((id) => bump(devices, id));
    bump(rooms, roomKey(hass, p.area));
  }
  const labels = new Map(roomOptions(hass, programs).map((o) => [o.key, o.label]));
  return {
    types: [...types].map(([id, count]) => ({ id, count })),
    devices: [...devices].map(([id, count]) => ({ id, count })),
    rooms: [...rooms].map(([key, count]) => ({ key, label: labels.get(key) ?? key, count })),
  };
}
