// Filter choices come from program entities, never from a catalogue of supported device types.
import type { Program } from "./types";

export type DomainLocalize = (key: string, ...args: unknown[]) => string;

/** Retain configured filters even when their last device/program has disappeared. */
export function programDomains(programs: Pick<Program, "entities">[], selected: string[] = []): string[] {
  return [...new Set([
    ...programs.flatMap((p) => p.entities.map((e) => e.entity_id.split(".")[0])),
    ...selected,
  ])].filter(Boolean).sort();
}

export function domainChoices(domains: string[], lang: string, localize?: DomainLocalize) {
  return domains.map((id) => ({ id, label: localize?.(`component.${id}.title`) || id }))
    .sort((a, b) => a.label.localeCompare(b.label, lang) || a.id.localeCompare(b.id));
}
