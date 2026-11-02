import { describe, expect, it, vi } from "vitest";
import { TIMELINE, timelineGeometry, timelineX } from "../timeline-geometry";
import { WpChart } from "../components/chart";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { WpSchedule } from "../components/schedule-dialog";
import { flat } from "./helpers/tpl";

describe("schedule and chart horizontal geometry", () => {
  it.each([360, 1400, 335.625])("aligns midnight, noon and day end at width %s", width => {
    const barLeft = TIMELINE.label + TIMELINE.gap;
    const barRight = width - TIMELINE.right;
    const plot = timelineGeometry(width);
    expect(plot).toEqual({ left: barLeft, right: barRight, width: barRight - barLeft });
    for (const minute of [0, 360, 720, 1080, 1440]) {
      expect(timelineX(width, minute, 0, 1440)).toBe(barLeft + minute / 1440 * (barRight - barLeft));
    }
    // Zoom/pan keep the same viewport endpoints; only the visible time interval changes.
    expect(timelineX(width, -120, -120, 600)).toBe(barLeft);
    expect(timelineX(width, 600, -120, 600)).toBe(barRight);
  });
  it("keeps schedule layouts connected to shared label/gap constants", () => {
    const card = String(WeeklyPlannerCard.styles), dialog = String(WpSchedule.styles);
    expect(card).toContain(`width: ${TIMELINE.label}px`);
    expect(card).toContain(`gap: ${TIMELINE.gap}px`);
    expect(dialog).toContain(`grid-template-columns: ${TIMELINE.label}px minmax(0, 1fr); gap: ${TIMELINE.gap}px`);
  });
  it.each([360, 1400])("does not shrink plots for zero, one or two right axes at width %s", width => {
    const c: any = new WpChart();
    c._width = width; c.entityId = "sensor.main";
    c.hass = { config: { time_zone: "UTC" }, states: {
      "sensor.extra": { state: "50", attributes: { unit_of_measurement: "%" } },
      "sensor.third": { state: "5", attributes: { unit_of_measurement: "W" } },
    } };
    c.program = { id: "p", revision: 1, entities: [{ entity_id: c.entityId, chart_sources: [] }] };
    const model = { kind: "curve", unit: "°C", lo: 10, hi: 30, lines: [] };
    for (const sources of [[], [{ entity_id: "sensor.extra", kind: "numeric" }], [
      { entity_id: "sensor.extra", kind: "numeric" }, { entity_id: "sensor.third", kind: "numeric" },
    ]]) {
      c.program.entities[0].chart_sources = sources;
      const pad = c._plotConfig(model).pad;
      expect(pad.l).toBe(timelineGeometry(width).left);
      expect(width - pad.r).toBe(timelineGeometry(width).right);
      // Program and complementary state bands use that exact padding too.
      c.date = "2026-11-02";
      const bands = flat(c._renderSourceRows({ ...model, planned: { zones: [{ from: 0, to: 1440, name: "Eco", color: "blue", value: null }] } }, { from: 0, to: 1440 }, pad));
      expect(bands).toContain(`x=${pad.l} y="2" width=${width - pad.l - pad.r}`);
    }
  });
  it.each([360, 1400, 335.625])("renders time ticks, program and state bands on the same endpoints at %s", width => {
    const c: any = new WpChart();
    const date = "2026-11-02", start = Date.parse(`${date}T00:00:00Z`);
    vi.useFakeTimers(); vi.setSystemTime(start + 86400000);
    try {
      c._width = width; c.date = date; c.entityId = "sensor.main";
      c.hass = { language: "en", config: { time_zone: "UTC" }, states: {
        "sensor.extra": { state: "50", attributes: { unit_of_measurement: "%" } },
        "binary_sensor.extra": { state: "on", attributes: {} },
      } };
      c.program = { id: "p", entities: [{ entity_id: c.entityId, chart_sources: [
        { entity_id: "sensor.extra", kind: "numeric" },
        { entity_id: "binary_sensor.extra", kind: "states", states: ["on"] },
      ] }] };
      c._sourceHistory = { "binary_sensor.extra": [{ t: start, s: "on", a: {} }] };
      const model = { kind: "curve", unit: "°C", lo: 10, hi: 30, lines: [], span: 1440,
        pastEnd: 1440, isToday: false, markers: [], shade: [], manual: [], bands: [],
        planned: { steps: [], risers: [], zones: [{ from: 0, to: 1440, name: "Eco", color: "blue", value: null }] } };
      const out = flat(c._renderChart(model));
      const { left, right, width: plotWidth } = timelineGeometry(width);
      expect(out).toContain(`class="xlab" x=${left} y=144 text-anchor=start>0h`);
      expect(out).toContain(`class="xlab" x=${right} y=144 text-anchor=end>24h`);
      expect(out).toContain(`x=${left} y="2" width=${plotWidth} height="20"`);
      expect(out).toContain(`x=${left} y="2" width=${plotWidth} height="16"`);
      // A secondary scale sits inside the right edge instead of moving 24h.
      expect(out).toContain(`class="source-axis" text-anchor="end"`);
      expect(out).toContain(`<text x=${right - 4} y="10"`);
    } finally { vi.useRealTimers(); }
  });
  it("uses theme colors for readable overlaid secondary scales", () => {
    const styles = String(WpChart.styles);
    expect(styles).toContain("paint-order: stroke");
    expect(styles).toContain("stroke: var(--card-background-color, var(--ha-card-background))");
  });

});
