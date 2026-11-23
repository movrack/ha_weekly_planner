// Duplicating a program from the programs panel: the copy keeps the devices, settings and schedules of the source.

import { newId } from "./planner";
import type { Program, Slot } from "./types";

const NAME_MAX = 60;

const cloneSlots = (slots: Slot[]): Slot[] => slots.map((s) => ({ ...structuredClone(s), id: newId() }));

/** A program to save as a new one: new profile and slot ids, no id, no revision, no creation date; the server puts it last. */
export function copyProgram(source: Program, name: string): Omit<Program, "id"> {
  const copy: Partial<Program> = structuredClone(source);
  delete copy.id;
  delete copy.created_at;
  return {
    ...(copy as Program),
    revision: 0,
    name,
    profiles: source.profiles.map((profile) => ({ ...structuredClone(profile), id: newId(), days: profile.days.map(cloneSlots) })),
  };
}

/** The name of the copy ("Copie Salon"), within the name limit and not already taken ("Copie Salon 2", "Copie Salon 3"…). */
export function copyName(make: (name: string) => string, source: string, taken: Iterable<string>): string {
  const used = new Set([...taken].map((n) => n.trim().toLowerCase()));
  const base = make(source).slice(0, NAME_MAX);
  if (!used.has(base.toLowerCase())) return base;
  for (let n = 2; ; n++) {
    const suffix = ` ${n}`;
    const name = `${make(source).slice(0, NAME_MAX - suffix.length)}${suffix}`;
    if (!used.has(name.toLowerCase())) return name;
  }
}
