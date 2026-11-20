// Zoom of the time axis of the day chart: pure window maths (minutes from the local midnight), no DOM.
// A window is the visible part [from, to] of the day [0, span]; `null` in the chart means the whole day.

export interface ZoomWindow { from: number; to: number }

/** Narrowest window the chart can show (minutes). */
const MIN_WINDOW = 30;

const EPS = 1e-6;

/** Minute under a fraction (0..1) of the plot width. */
export function minuteAt(w: ZoomWindow, frac: number): number {
  return w.from + Math.min(1, Math.max(0, frac)) * (w.to - w.from);
}

const STEPS = [5, 10, 15, 30, 60, 120, 180, 360];

/** Distance between two time labels (minutes): the smallest round step giving at most about 8 labels. */
export function tickStep(len: number, maxLabels = 8.5): number {
  return STEPS.find((s) => len / s <= maxLabels) ?? STEPS[STEPS.length - 1];
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
