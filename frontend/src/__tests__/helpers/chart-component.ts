import { afterEach, beforeEach, vi } from "vitest";
import { WpChart } from "../../components/chart";

/** Midnight UTC of the day the chart tests show; the fake clock stands at noon of that day. */
export const dayStart = Date.parse("2026-11-02T00:00:00Z");

/** A chart on 2026-11-02 for climate.room: Eco by default, Comfort 08:45-17:00 on the first day. */
export function chart(extra: any = {}): any {
  const c: any = new WpChart();
  c.date = "2026-11-02"; c.entityId = "climate.room";
  c.hass = { language: "en", config: { time_zone: "UTC" }, states: { "climate.room": { state: "heat", attributes: {} } }, callWS: vi.fn(async () => ({})) };
  c.data = { status: {}, labels: [
    { id: "eco", name: "Eco", color: "blue", action: { kind: "service", service: "climate.set_temperature", data: { temperature: 16 } } },
    { id: "comfort", name: "Comfort", color: "red", action: { kind: "service", service: "climate.set_temperature", data: { temperature: 21 } } },
  ]};
  c.program = { id: "p", name: "Room", revision: 1, entities: [{ entity_id: c.entityId, default_label: "eco" }], profiles: [{ id: "home", days: Array.from({ length: 7 }, () => []) }] };
  c.program.profiles[0].days[0] = [{ id: "slot", label: "comfort", start: { time: "08:45" }, end: { time: "17:00" } }];
  Object.assign(c, extra);
  return c;
}

/** Fake timers at noon of that day and a minimal `document`; call once at the top of a test file. */
export function useChartDay(): void {
  beforeEach(() => {
    vi.useFakeTimers(); vi.setSystemTime(dayStart + 12 * 3600000);
    vi.stubGlobal("document", { hidden: false, documentElement: { lang: "en" }, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
}
