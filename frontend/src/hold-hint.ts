// "Hold to edit" hint on the bars (spec 14.12): shown for the first five plain taps on a device, then never again.

const KEY = "weekly_planner.hold_hint";
const HOLD_HINT_MAX = 5;
export const HOLD_HINT_MS = 6000;

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

/** The user found the long press: no more hint. */
export function dismissHoldHint(): void {
  if (read() < HOLD_HINT_MAX) write(HOLD_HINT_MAX);
}
