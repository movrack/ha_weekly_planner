// Bounded, connection-scoped, batched HA state history shared by all external-source charts.
import type { HomeAssistant } from "./types";
import type { SourcePoint } from "./chart-sources";
interface Entry { at: number; promise: Promise<SourcePoint[]> }
const caches = new WeakMap<object, Map<string, Entry>>();
const LIMIT = 128;
export function parseSourceHistory(raw: unknown): SourcePoint[] {
  let attrs: Record<string, any> = {};
  return !Array.isArray(raw) ? [] : raw.flatMap((p: any) => {
    if (p.a ?? p.attributes) attrs = p.a ?? p.attributes;
    const sec = p.lu ?? p.lc ?? p.last_updated_ts;
    const t = typeof sec === "number" ? sec * 1000 : Date.parse(p.last_updated ?? "");
    return Number.isFinite(t) ? [{ t, s: String(p.s ?? p.state ?? ""), a: attrs }] : [];
  });
}
export async function entityHistories(hass: HomeAssistant, ids: readonly string[], start: number, end: number, onFailure?: (id: string) => void): Promise<Record<string, SourcePoint[]>> {
  const now = Date.now();
  if (start >= now) return Object.fromEntries(ids.map(id => [id, []]));
  const scope = hass.connection ?? hass;
  let cache = caches.get(scope);
  if (!cache) { cache = new Map(); caches.set(scope, cache); }
  const entries = cache;
  const ttl = end > now ? 60_000 : Infinity;
  const key = (id: string) => `${id}|${start}|${end}`;
  const local = new Map<string, Promise<SourcePoint[]>>();
  for (const id of ids) { const hit = entries.get(key(id)); if (hit && now - hit.at < ttl) local.set(id, hit.promise); }
  const missing = [...new Set(ids)].filter(id => {
    const found = entries.get(key(id));
    return !found || now - found.at >= ttl;
  });
  if (missing.length) {
    const request = hass.callWS<Record<string, unknown>>({ type: "history/history_during_period",
      start_time: new Date(start).toISOString(), end_time: new Date(Math.min(end, now)).toISOString(),
      entity_ids: missing, minimal_response: false, no_attributes: false, significant_changes_only: false });
    for (const id of missing) {
      const promise = request.then(raw => parseSourceHistory(raw[id]).filter(p => p.t <= Math.min(end, now)));
      const entry = { at: now, promise };
      local.set(id, promise);
      entries.delete(key(id)); entries.set(key(id), entry);
      promise.catch(() => { if (entries.get(key(id)) === entry) entries.delete(key(id)); });
    }
    while (entries.size > LIMIT) entries.delete(entries.keys().next().value!);
  }
  const pairs = await Promise.all([...new Set(ids)].map(async id => {
    const promise = local.get(id);
    if (!promise) return [id, []] as const;
    return [id, await promise.catch(() => { onFailure?.(id); return []; })] as const;
  }));
  return Object.fromEntries(pairs);
}
