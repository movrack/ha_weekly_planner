// Test helpers for Lit components without a DOM: flatten a template result to text and find its event handlers.
export const flat = (v: any): string => {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map(flat).join("");
  if (v && v.strings) return v.strings.map((s: string, i: number) => s + (i < v.values.length ? flat(v.values[i]) : "")).join("");
  if (v && v._$litDirective$ && Array.isArray(v.values)) return flat(v.values);
  return "";
};

export interface Handler { event: string; fn: (...args: any[]) => any; before: string }

/** Every `@event=${fn}` of a template tree in document order, with the markup that precedes it. */
export function handlers(v: any, out: Handler[] = [], acc = { text: "" }): Handler[] {
  if (Array.isArray(v)) { v.forEach((x) => handlers(x, out, acc)); return out; }
  if (v && v.strings) {
    v.strings.forEach((s: string, i: number) => {
      acc.text += s;
      if (i >= v.values.length) return;
      const val = v.values[i];
      const m = /@([\w-]+)=$/.exec(s);
      if (m && typeof val === "function") out.push({ event: m[1], fn: val, before: acc.text });
      else handlers(val, out, acc);
    });
  } else if (v && v._$litDirective$ && Array.isArray(v.values)) handlers(v.values, out, acc);
  else if (typeof v === "string") acc.text += v;
  return out;
}

/** The handlers of `event` whose markup (since the previous handler of that kind) mentions `mark`. */
export const find = (v: any, event: string, mark: string): Handler => {
  const all = handlers(v).filter((h) => h.event === event);
  const h = all.find((x) => x.before.slice(-400).includes(mark));
  if (!h) throw new Error(`no @${event} near ${mark}`);
  return h;
};

export const target = (props: Record<string, unknown>, extra: Record<string, unknown> = {}) => ({ target: props, currentTarget: props, stopPropagation() {}, preventDefault() {}, ...extra });
