// The card reloads the page by itself when the integration serves a newer bundle (spec § 10.8).

const KEY = "weekly_planner_reloaded_for";

/** Version of the running bundle: the `?v=` of the URL it was loaded from (null: loaded without one). */
export function runningVersion(url: string = import.meta.url): string | null {
  try {
    return new URL(url).searchParams.get("v");
  } catch {
    return null;
  }
}

/** Reload when both versions are known and differ, unless this page already reloaded once for that version. */
export function shouldReload(running: string | null, served: string | null | undefined, remembered: string | null): boolean {
  return Boolean(running && served && running !== served && remembered !== served);
}

/** Reloads the page (once per served version) when it is idle and the bundle is out of date. */
export function reloadIfOutdated(served: string | null | undefined, idle: boolean): boolean {
  if (!idle) return false;
  let remembered: string | null = null;
  try {
    remembered = sessionStorage.getItem(KEY);
  } catch {
    /* no storage: the check below still avoids a loop within this page */
  }
  if (!shouldReload(runningVersion(), served, remembered)) return false;
  try {
    sessionStorage.setItem(KEY, served as string);
  } catch {
    /* ignored */
  }
  location.reload();
  return true;
}
