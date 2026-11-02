/** Shared horizontal geometry of schedule rows and their time-series plots (CSS pixels). */
export const TIMELINE = { label: 36, gap: 8, right: 0 } as const;

export function timelineGeometry(width: number) {
  const left = TIMELINE.label + TIMELINE.gap;
  const right = width - TIMELINE.right;
  return { left, right, width: right - left };
}

/** The same affine time mapping is used by curves, program bands and source rows. */
export function timelineX(width: number, minute: number, from: number, to: number): number {
  const geometry = timelineGeometry(width);
  return geometry.left + (minute - from) / (to - from) * geometry.width;
}
