// Zoom of the time axis of the day chart: pure window maths (minutes from the local midnight), no DOM.
// A window is the visible part [from, to] of the day [0, span]; `null` in the chart means the whole day.

export interface ZoomWindow { from: number; to: number }

/** Narrowest window the chart can show (minutes). */
export const MIN_WINDOW = 30;

const EPS = 1e-6;

/** Keep a window inside [0, span]: length between MIN_WINDOW and span, shifted (never squeezed) back into the day. */
export function clampWindow(w: ZoomWindow, span: number): ZoomWindow {
  const min = Math.min(MIN_WINDOW, span);
  const len = Math.min(span, Math.max(min, w.to - w.from));
  const from = Math.min(Math.max(0, w.from), span - len);
  return { from, to: from + len };
}

/** True when the window shows the whole day (no zoom). */
export function isFullDay(w: ZoomWindow, span: number): boolean {
  return w.from <= EPS && w.to >= span - EPS;
}

/** The window to keep as state: null for the whole day. */
export function normalise(w: ZoomWindow, span: number): ZoomWindow | null {
  const c = clampWindow(w, span);
  return isFullDay(c, span) ? null : c;
}

/**
 * Zoom around a point: `scale` > 1 zooms in. The minute `anchor` stays under the same fraction `frac` (0..1) of the
 * plot width, so a pinch keeps the content under the fingers (and a moving centre pans).
 */
export function zoomAround(w: ZoomWindow, scale: number, anchor: number, frac: number, span: number): ZoomWindow {
  const len = Math.min(span, Math.max(Math.min(MIN_WINDOW, span), (w.to - w.from) / (scale > 0 ? scale : 1)));
  const f = Math.min(1, Math.max(0, frac));
  return clampWindow({ from: anchor - f * len, to: anchor - f * len + len }, span);
}

/** Pinch: the window at the start of the gesture, scaled by the ratio of the finger distances. */
export function pinchWindow(start: ZoomWindow, startDist: number, dist: number, anchor: number, frac: number,
  span: number): ZoomWindow {
  if (!(startDist > 0) || !(dist > 0)) return clampWindow(start, span);
  return zoomAround(start, dist / startDist, anchor, frac, span);
}

/** Slide the window by `delta` minutes, staying inside the day. */
export function panWindow(w: ZoomWindow, delta: number, span: number): ZoomWindow {
  return clampWindow({ from: w.from + delta, to: w.to + delta }, span);
}

/** Rubber band: two minutes (in any order) to a window, at least MIN_WINDOW wide, inside the day. */
export function rangeToWindow(a: number, b: number, span: number): ZoomWindow {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  if (hi - lo >= MIN_WINDOW) return clampWindow({ from: lo, to: hi }, span);
  const mid = (lo + hi) / 2;
  return clampWindow({ from: mid - MIN_WINDOW / 2, to: mid + MIN_WINDOW / 2 }, span);
}

/** Minute under a fraction (0..1) of the plot width. */
export function minuteAt(w: ZoomWindow, frac: number): number {
  return w.from + Math.min(1, Math.max(0, frac)) * (w.to - w.from);
}

const STEPS = [5, 10, 15, 30, 60, 120, 180, 360];

/** Distance between two time labels (minutes): the smallest round step giving at most about 8 labels. */
export function tickStep(len: number): number {
  return STEPS.find((s) => len / s <= 8.5) ?? STEPS[STEPS.length - 1];
}

/** Minutes of the labels inside the window: multiples of the step. */
export function ticksIn(w: ZoomWindow, step: number): number[] {
  const out: number[] = [];
  for (let m = Math.ceil(w.from / step - EPS) * step + 0; m <= w.to + EPS; m += step) out.push(m);
  return out;
}

/** Continuous navigation across local-day boundaries; the interval keeps its real duration. */
export function slideTimeline(w: ZoomWindow, delta: number): ZoomWindow {
  return { from: w.from + delta, to: w.to + delta };
}

/** Zoom a continuous timeline without clamping its location to the initially selected day. */
export function zoomTimeline(w: ZoomWindow, scale: number, anchor: number, frac: number, maxSpan: number): ZoomWindow {
  const len = Math.max(MIN_WINDOW, Math.min(maxSpan, (w.to - w.from) / (scale > 0 ? scale : 1)));
  const from = anchor - Math.max(0, Math.min(1, frac)) * len;
  return { from, to: from + len };
}
