import { describe, expect, it, vi } from "vitest";
import { WpSchedule } from "../components/schedule-dialog";
import type { Program } from "../types";

const flat = (v: any): string => {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(flat).join("");
  if (v && v.strings) return v.strings.map((s: string, i: number) => s + (i < v.values.length ? flat(v.values[i]) : "")).join("");
  return "";
};

function screen(viewMode?: string) {
  const days = () => Array.from({ length: 7 }, () => [] as any[]);
  const program: Program = {
    id: "p", name: "Office", revision: 1, priority: 10, enabled: true, reapply: true, conditions: [],
    entities: [{ entity_id: "switch.demo", default_label: null, label_overrides: {} }], active_profile: "home",
    profiles: [{ id: "home", name: "Home", days: days() }, { id: "away", name: "Away", days: days() }],
  };
  const view = new WpSchedule() as any;
  view.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, callWS: vi.fn() };
  view.scope = { kind: "program", programId: "p" };
  view.data = { programs: [program], status: {}, can_edit: true, read_only: false, labels: [] };
  if (viewMode) view._viewProfileId = viewMode;
  view._renderRest = () => "[REST]";
  view._renderWeek = () => "[WEEK]";
  view._renderChart = () => "[CHART]";
  view._renderRow = () => "[ROW]";
  return view;
}

describe("schedule screen order", () => {
  it("is switch, mode, rest of the time, slots + add, 7 days, day chart, delete", () => {
    const html = flat(screen().render());
    const at = ['class="switch"', 'class="mode-select"', "[REST]", 'class="list"', "row add", "[WEEK]", "[CHART]", "danger-line alone"].map((m) => html.indexOf(m));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });
  it("keeps hiding the switch, the rest row and Delete when only another mode is edited", () => {
    const html = flat(screen("away").render());
    expect(html).not.toContain('class="switch"');
    expect(html).not.toContain("[REST]");
    expect(html).not.toContain("danger-line alone");
    expect(html.indexOf("class=\"mode-select\"")).toBeLessThan(html.indexOf("[WEEK]"));
    expect(html.indexOf("row add")).toBeLessThan(html.indexOf("[WEEK]"));
    expect(html.indexOf("[WEEK]")).toBeLessThan(html.indexOf("[CHART]"));
  });
  it("lets the toggle and Delete stay in the tab order at their place (DOM order = visual order)", () => {
    const html = flat(screen().render());
    expect(html.indexOf("type=\"checkbox\"")).toBeLessThan(html.indexOf("<select"));
    expect(html.indexOf("<select")).toBeLessThan(html.indexOf("row add"));
    expect(html.indexOf("row add")).toBeLessThan(html.indexOf("mdi:delete-outline"));
  });
});
