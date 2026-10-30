// One cadence per page; charts decide whether their day needs new data.
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
const refresh = () => { if (!document.hidden) listeners.forEach((listener) => listener()); };

export function subscribeChartRefresh(listener: () => void): () => void {
  listeners.add(listener);
  if (timer === undefined) {
    timer = setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(timer);
      timer = undefined;
      document.removeEventListener("visibilitychange", refresh);
    }
  };
}
