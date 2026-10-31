// Shared cache of `weekly_planner/preview` answers: the card and every schedule dialog ask for the same
// (program, revision, date, mode) and now share one websocket call, in flight or answered.

import type { HomeAssistant, PreviewSlot } from "./types";

const TTL_MS = 10 * 60_000;
const MAX_ENTRIES = 400;

interface Entry { at: number; promise: Promise<PreviewSlot[]> }

const entries = new Map<string, Entry>();
const latestRevision = new Map<string, number>();
let version: string | null | undefined;

/** Forget every cached answer (card version change, reload). */
export function clearPreviewCache(): void {
  entries.clear();
  latestRevision.clear();
}

/**
 * Called with every pushed snapshot: a new card version drops everything; a program that changed revision
 * (or disappeared) drops its entries.
 */
export function syncPreviewCache(data: { card_version?: string | null; programs: { id: string; revision: number }[] }): void {
  if (version !== undefined && data.card_version !== version) clearPreviewCache();
  version = data.card_version;
  const known = new Set<string>();
  for (const p of data.programs) {
    known.add(p.id);
    if (latestRevision.get(p.id) !== p.revision) dropProgram(p.id);
    latestRevision.set(p.id, p.revision);
  }
  for (const id of [...latestRevision.keys()]) if (!known.has(id)) { dropProgram(id); latestRevision.delete(id); }
}

function dropProgram(programId: string): void {
  const prefix = `${programId}\u0000`;
  for (const key of [...entries.keys()]) if (key.startsWith(prefix)) entries.delete(key);
}

/**
 * Resolved slots of a program for a date and mode; concurrent and repeated calls share one request. `profileId` is
 * the mode the answer is for (part of the key); with `send` false the request leaves the mode to the server, which
 * answers for the active one (the card passes the active mode so a mode change never reuses a stale answer).
 */
export function fetchPreview(hass: HomeAssistant, programId: string, revision: number, date: string, profileId?: string, send = true): Promise<PreviewSlot[]> {
  const key = [programId, revision, date, profileId ?? ""].join("\u0000");
  const now = Date.now();
  const hit = entries.get(key);
  if (hit && now - hit.at < TTL_MS) return hit.promise;
  if (entries.size >= MAX_ENTRIES) entries.delete(entries.keys().next().value as string);
  const promise = hass.callWS<{ slots: PreviewSlot[] }>({
    type: "weekly_planner/preview", program_id: programId, date, ...(profileId && send ? { profile_id: profileId } : {}),
  }).then((res) => res.slots);
  entries.set(key, { at: now, promise });
  promise.catch(() => { if (entries.get(key)?.promise === promise) entries.delete(key); }); // never keep a failure
  return promise;
}
