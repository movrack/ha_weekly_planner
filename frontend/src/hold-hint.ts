// "Hold to edit" hint on the bars (spec 14.12): shown for the first few plain taps on a device, then never again.

const KEY = "weekly_planner.hold_hint";
export const HOLD_HINT_MAX = 3;
export const HOLD_HINT_MS = 2000;

function read(): number {
  try {
    const n = Number(window.localStorage.getItem(KEY));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function write(n: number): void {
  try { window.localStorage.setItem(KEY, String(n)); } catch { /* storage unavailable: the hint just shows less durably */ }
}

/** Should the hint show now? Counts this showing (per device). */
export function takeHoldHint(): boolean {
  const n = read();
  if (n >= HOLD_HINT_MAX) return false;
  write(n + 1);
  return true;
}

/** The user found the long press: no more hint. */
export function dismissHoldHint(): void {
  if (read() < HOLD_HINT_MAX) write(HOLD_HINT_MAX);
}
