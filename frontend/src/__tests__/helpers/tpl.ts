// Test helpers for Lit components without a DOM: flatten a template result to text and find its event handlers.
export const flat = (v: any): string => {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map(flat).join("");
  if (v && v.strings) return v.strings.map((s: string, i: number) => s + (i < v.values.length ? flat(v.values[i]) : "")).join("");
  // repeat(items, key, template): render each item through the template
  if (v && v._$litDirective$ && Array.isArray(v.values) && v.values.length === 3 && typeof v.values[2] === "function" && v.values[0]?.[Symbol.iterator])
    return Array.from(v.values[0] as Iterable<unknown>, (item, i) => flat(v.values[2](item, i))).join("");
  if (v && v._$litDirective$ && Array.isArray(v.values)) return flat(v.values);
  return "";
};

export interface Handler { event: string; fn: (...args: any[]) => any; before: string; readonly after: string }

/** Every `@event=${fn}` of a template tree in document order, with the markup that precedes it (`before`) and follows it (`after`). */
export function handlers(v: any, out: Handler[] = [], acc = { text: "" }): Handler[] {
  if (Array.isArray(v)) { v.forEach((x) => handlers(x, out, acc)); return out; }
  if (v && v.strings) {
    v.strings.forEach((s: string, i: number) => {
      acc.text += s;
      if (i >= v.values.length) return;
      const val = v.values[i];
      const m = /@([\w-]+)=$/.exec(s);
      if (m && typeof val === "function") {
        const pos = acc.text.length;
        out.push({ event: m[1], fn: val, before: acc.text, get after() { return acc.text.slice(pos); } });
      }
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

/** Values bound to a Lit attribute/property, in template order, without depending on whitespace. */
export const bindings = (tpl: any, name: string): any[] => {
  if (Array.isArray(tpl)) return tpl.flatMap((v) => bindings(v, name));
  if (!tpl?.strings) return [];
  return tpl.values.flatMap((value: any, i: number) =>
    tpl.strings[i].trimEnd().endsWith(` ${name}=`) ? [value] : bindings(value, name));
};

/** Every value bound right after a static fragment of the template (for example `class="btn primary" ?disabled=`). */
export const valuesAfter = (tpl: any, fragment: string): unknown[] => {
  if (Array.isArray(tpl)) return tpl.flatMap((v) => valuesAfter(v, fragment));
  if (tpl?._$litDirective$ && Array.isArray(tpl.values)) return valuesAfter(tpl.values, fragment);
  if (!tpl?.strings) return [];
  return tpl.values.flatMap((value: unknown, i: number) => (tpl.strings[i].trimEnd().endsWith(fragment) ? [value] : valuesAfter(value, fragment)));
};
