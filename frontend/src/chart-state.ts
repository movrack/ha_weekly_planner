// Which day charts are shown on the card. Per device (browser) only. A saved choice (open or closed) wins;
// without one, the card option `chart_collapsed` (default: collapsed) gives the initial state.
const KEY = "weekly-planner:chart-choices";
const LEGACY_KEY = "weekly-planner:open-charts"; // list of open charts (0.21.0 development builds)

export function loadChartChoices(): Map<string, boolean> {
  const out = new Map<string, boolean>();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const [k, v] of Object.entries(raw)) if (typeof v === "boolean") out.set(k, v);
      return out;
    }
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "[]");
    if (Array.isArray(legacy)) for (const k of legacy) if (typeof k === "string") out.set(k, true);
  } catch {
    // unreadable storage: no saved choice
  }
  return out;
}

export function saveChartChoices(choices: Map<string, boolean>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(choices)));
  } catch {
    // storage blocked or full: the choice just is not remembered
  }
}

export function isChartOpen(choices: Map<string, boolean>, key: string, collapsedByDefault: boolean): boolean {
  return choices.get(key) ?? !collapsedByDefault;
}

/** Open the Home Assistant history page of a chart (path given by the chart). */
export function openHistory(path: string): void {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
}
