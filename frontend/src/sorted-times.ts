/** First position whose time is strictly greater than value, in a sorted array. */
export function upperBound(times: readonly number[], value: number): number {
  let lo = 0, hi = times.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (times[mid] <= value) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function hasNearby(times: readonly number[], value: number, tolerance: number): boolean {
  const at = upperBound(times, value + tolerance);
  return at > 0 && times[at - 1] >= value - tolerance;
}
