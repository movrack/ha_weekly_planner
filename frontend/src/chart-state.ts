// Which day charts are shown on the card. Per card and device, in this browser only. A saved choice (open or closed) wins;
// without one, the card option `chart_collapsed` (default: collapsed) gives the initial state.
const KEY = "weekly-planner:chart-choices";
/** Same kind of saved choice for the week bars (open or folded), kept apart from the chart ones. */
export const WEEK_KEY = "weekly-planner:week-choices";
const LEGACY_KEY = "weekly-planner:open-charts"; // list of open charts (0.21.0 development builds)

export function loadChartChoices(key: string = KEY): Map<string, boolean> {
  const out = new Map<string, boolean>();
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? "null");
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const [k, v] of Object.entries(raw)) if (typeof v === "boolean") out.set(k, v);
      return out;
    }
    const legacy = key === KEY ? JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "[]") : [];
    if (Array.isArray(legacy)) for (const k of legacy) if (typeof k === "string") out.set(k, true);
  } catch {
    // unreadable storage: no saved choice
  }
  return out;
}

export function saveChartChoices(choices: Map<string, boolean>, key: string = KEY): void {
  try {
    localStorage.setItem(key, JSON.stringify(Object.fromEntries(choices)));
  } catch {
    // storage blocked or full: the choice just is not remembered
  }
}

/**
 * Identity of a card for the remembered choices: its title and what it shows (program or filter). Lovelace gives a
 * card no id, so two cards with the same title and content share their choices; cards that differ keep their own.
 * `chart_epoch` is part of it: the editor raises it each time "Chart open by default" changes, so every device starts afresh
 * with the new default instead of an old saved choice winning (no epoch keeps the identity it always had).
 */
export function cardIdentity(config: { title?: string; program?: string; filter?: unknown; chart_epoch?: number; week_epoch?: number }, epoch: "chart_epoch" | "week_epoch" = "chart_epoch"): string {
  const parts: unknown[] = [config.title ?? "", config.program ?? null, config.program === undefined ? config.filter ?? null : null];
  if (config[epoch]) parts.push(config[epoch]);
  const text = JSON.stringify(parts);
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/** Key of one device's chart choice on one card. */
export const chartKey = (card: string, scope: string, entityId: string): string => `${card}|${scope}|${entityId}`;

export function isChartOpen(choices: Map<string, boolean>, key: string, collapsedByDefault: boolean): boolean {
  return choices.get(key) ?? !collapsedByDefault;
}

/** Open the Home Assistant history page of a chart (path given by the chart). */
export function openHistory(path: string): void {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
}
