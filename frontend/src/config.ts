// Tolerant normalisation of the card YAML. Unknown keys are kept untouched (lossless round trip with the
// visual editor and for other tools); known keys with a wrong type fall back to their safe default.
import type { CardConfig } from "./types";

const VIEWS = ["bars", "radial", "radial_12h", "list"] as const;
const strings = (v: unknown): string[] | undefined => {
  if (typeof v === "string") return v ? [v] : [];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x !== "") : undefined;
};

export function normalizeConfig(raw: unknown): CardConfig {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Weekly Planner card: the configuration must be a YAML mapping.");
  const c = { ...(raw as Record<string, unknown>) };
  for (const k of ["title", "program"]) if (c[k] !== undefined && typeof c[k] !== "string") { if (typeof c[k] === "number") c[k] = String(c[k]); else delete c[k]; }
  for (const k of ["show_chart", "chart_collapsed"]) if (c[k] !== undefined && typeof c[k] !== "boolean") delete c[k];
  if (c.schedule_view !== undefined && !(VIEWS as readonly unknown[]).includes(c.schedule_view)) delete c.schedule_view;
  if (c.filter !== undefined) {
    if (!c.filter || typeof c.filter !== "object" || Array.isArray(c.filter)) delete c.filter;
    else {
      const f = { ...(c.filter as Record<string, unknown>) };
      for (const k of ["types", "programs"]) if (f[k] !== undefined) { const v = strings(f[k]); if (v) f[k] = v; else delete f[k]; }
      if (f.area !== undefined && typeof f.area !== "string") delete f.area;
      c.filter = f;
    }
  }
  return c as unknown as CardConfig;
}

/** Settings the visual editor shows, with their effective defaults (title omitted: empty). */
export function configDefaults(): Pick<CardConfig, "schedule_view" | "show_chart" | "chart_collapsed"> {
  return { schedule_view: "bars", show_chart: true, chart_collapsed: true };
}

/** Full effective configuration: missing keys get the defaults shown by the editor, so YAML == visual. */
export function withDefaults(c: CardConfig): CardConfig {
  const out = { ...configDefaults(), ...c } as CardConfig;
  if (out.program === undefined && out.filter === undefined) out.filter = {};
  return out;
}
