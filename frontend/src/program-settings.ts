// Three-way merge of settings drafts: preserve live schedules and unrelated remote edits.
import type { Program } from "./types";

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const object = (x: unknown): x is Record<string, unknown> => x !== null && typeof x === "object" && !Array.isArray(x);

function merge(base: unknown, draft: unknown, live: unknown): unknown {
  if (same(base, draft)) return live;
  if (same(base, live) || same(draft, live)) return draft;
  if (object(base) && object(draft) && object(live)) {
    const out: Record<string, unknown> = {};
    for (const key of new Set([...Object.keys(base), ...Object.keys(draft), ...Object.keys(live)])) {
      const value = merge(base[key], draft[key], live[key]);
      if (value !== undefined) out[key] = value;
    }
    return out;
  }
  if (Array.isArray(base) && Array.isArray(draft) && Array.isArray(live)) {
    const items = [...base, ...draft, ...live];
    const key = ["id", "entity_id"].find((k) => items.length && items.every((x) => object(x) && typeof x[k] === "string"));
    if (key) {
      const map = (xs: Record<string, unknown>[]) => new Map(xs.map((x) => [x[key], x]));
      const b = map(base), d = map(draft), l = map(live);
      return [...new Set([...d.keys(), ...l.keys(), ...b.keys()])]
        .map((id) => merge(b.get(id), d.get(id), l.get(id))).filter((x) => x !== undefined);
    }
  }
  throw new Error("settings_conflict");
}

export function mergeProgramSettings(base: Program, draft: Program, live: Program): Program {
  return { ...merge(base, { ...draft, revision: base.revision }, live) as Program, revision: live.revision };
}
