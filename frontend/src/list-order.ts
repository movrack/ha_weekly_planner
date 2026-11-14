// Order of the card's list (card option `sort`, and `order` for the personal order). Pure: no Home Assistant access.
// Unit = what the card lists in one row/section (a program); `type` is the Home Assistant domain of its first device.

export const SORTS = ["type", "area", "name", "custom"] as const;
export type SortMode = (typeof SORTS)[number];
export const DEFAULT_SORT: SortMode = "type";

export interface Sortable { id: string; name: string; type: string; area?: string | null }
export interface SortOptions { order?: string[]; typeLabel?: (type: string) => string; lang?: string }
/** `key` is the type or the room of the group; "" is the final "Others" group. `header` is false when no heading is shown. */
export interface ListGroup<T> { key: string; header: boolean; items: T[] }

export const sortMode = (v: unknown): SortMode => ((SORTS as readonly unknown[]).includes(v) ? (v as SortMode) : DEFAULT_SORT);

/** One `Intl.Collator` per language, reused: same result as `localeCompare(b, lang)`, without its per-call cost. */
const collators = new Map<string | undefined, Intl.Collator>();
const cmp = (a: string, b: string, lang?: string): number => {
  let c = collators.get(lang);
  if (!c) collators.set(lang, (c = new Intl.Collator(lang)));
  return c.compare(a, b);
};
const byName = (lang?: string) => (a: Sortable, b: Sortable) => cmp(a.name, b.name, lang) || cmp(a.id, b.id);
const typeKey = (i: Sortable, o: SortOptions): string => (i.type ? o.typeLabel?.(i.type) || i.type : "");
/** Groups A→Z; the "Others" group (empty key) always last. */
const byKey = (lang?: string) => (a: string, b: string) => (a === b ? 0 : a === "" ? 1 : b === "" ? -1 : cmp(a, b, lang));

/** Type headings A→Z by their translated name; each type is translated once per sort (not once per comparison). */
function byType<T extends Sortable>(items: T[], o: SortOptions): T[] {
  const labels = new Map<string, string>();
  const label = (i: Sortable): string => {
    let l = labels.get(i.type);
    if (l === undefined) labels.set(i.type, (l = typeKey(i, o)));
    return l;
  };
  const keys = byKey(o.lang);
  const names = byName(o.lang);
  return [...items].sort((a, b) => keys(label(a), label(b)) || cmp(a.type, b.type) || names(a, b));
}

export function sortItems<T extends Sortable>(items: T[], mode: SortMode, o: SortOptions = {}): T[] {
  switch (mode) {
    case "name": return [...items].sort(byName(o.lang));
    case "area": return [...items].sort((a, b) => byKey(o.lang)(a.area ?? "", b.area ?? "") || byName(o.lang)(a, b));
    case "custom": {
      const byId = new Map(items.map((i) => [i.id, i]));
      const placed = new Set<string>();
      const first: T[] = [];
      for (const id of o.order ?? []) {
        const item = byId.get(id);
        if (item && !placed.has(id)) { placed.add(id); first.push(item); }
      }
      return [...first, ...byType(items.filter((i) => !placed.has(i.id)), o)];
    }
    default: return byType(items, o);
  }
}

/** Sorted items cut into consecutive groups; headings only for `type` and `area`. */
export function groupItems<T extends Sortable>(items: T[], mode: SortMode, o: SortOptions = {}): ListGroup<T>[] {
  const sorted = sortItems(items, mode, o);
  if (mode !== "type" && mode !== "area") return [{ key: "", header: false, items: sorted }];
  const groups: ListGroup<T>[] = [];
  for (const item of sorted) {
    const key = mode === "type" ? item.type : item.area ?? "";
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, header: true, items: [item] });
  }
  return groups;
}

/** Moves the entry at `from` to `to` (both clamped); returns a new array. */
export function moveId(ids: string[], from: number, to: number): string[] {
  if (from < 0 || from >= ids.length) return ids;
  const next = [...ids];
  const [id] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(next.length, to)), 0, id);
  return next;
}
