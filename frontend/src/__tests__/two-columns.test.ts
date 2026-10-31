import { describe, expect, it, vi } from "vitest";
import { WpSchedule } from "../components/schedule-dialog";
import { WpDialog } from "../components/dialog";
import type { Program } from "../types";

const flat = (v: any): string => {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(flat).join("");
  if (v && v.strings) return v.strings.map((s: string, i: number) => s + (i < v.values.length ? flat(v.values[i]) : "")).join("");
  return "";
};
const css = (c: any) => [c.styles].flat(Infinity).map((s: any) => s?.cssText ?? "").join("\n");

function screen() {
  const days = () => Array.from({ length: 7 }, () => [] as any[]);
  const program: Program = {
    id: "p", name: "Office", revision: 1, priority: 10, enabled: true, reapply: true, conditions: [],
    entities: [{ entity_id: "switch.demo", default_label: null, label_overrides: {} }], active_profile: "home",
    profiles: [{ id: "home", name: "Home", days: days() }],
  };
  const view = new WpSchedule() as any;
  view.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, callWS: vi.fn() };
  view.scope = { kind: "program", programId: "p" };
  view.data = { programs: [program], status: {}, can_edit: true, read_only: false, labels: [] };
  view._renderRest = () => "[REST]";
  view._renderWeek = () => "[WEEK]";
  view._renderChart = () => "[CHART]";
  view._renderRow = () => "[ROW]";
  return view;
}

describe("two-column schedule modal (CSS only)", () => {
  const text = css(WpSchedule);
  it("switches to a grid from 768 px and keeps the phone layout below", () => {
    const at = text.indexOf("@media (min-width: 768px)");
    expect(at).toBeGreaterThan(0);
    expect(text.slice(0, at)).toMatch(/\.cols, \.params \{ display: block/);
    expect(text.slice(at)).toMatch(/\.cols \{[^}]*display: grid/);
  });
  it("places parameters and Delete on the left, week then chart on the right", () => {
    expect(text).toContain('grid-template-areas: "params week" "params chart" "delete chart"');
    expect(text).toMatch(/\.params \{ grid-area: params/);
    expect(text).toMatch(/\.area-week \{ grid-area: week/);
    expect(text).toMatch(/\.area-chart \{ grid-area: chart/);
    expect(text).toMatch(/\.area-delete \{ grid-area: delete/);
  });
  it("widens only the schedule dialog, only from 768 px, and keeps the phone sheet", () => {
    const d = css(WpDialog);
    expect(d).toMatch(/@media \(min-width: 768px\) \{ \.panel\.columns \{ width: min\(960px/);
    expect(d).toContain("@media (max-width: 600px)");
    const html = flat(screen().render());
    expect(html).toContain("<wp-dialog open columns");
  });
  it("keeps the DOM in the phone order: switch, mode, rest, list, add, week, chart, delete", () => {
    const html = flat(screen().render());
    const at = ['class="switch"', 'class="mode-select"', "[REST]", 'class="list"', "row add", "[WEEK]", "[CHART]", "danger-line alone"].map((m) => html.indexOf(m));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
    expect(html.indexOf('class="params"')).toBeLessThan(html.indexOf('class="switch"'));
    expect(html.indexOf("row add")).toBeLessThan(html.indexOf('class="area-week"'));
    expect(html.indexOf('class="area-week"')).toBeLessThan(html.indexOf('class="area-chart"'));
    expect(html.indexOf('class="area-chart"')).toBeLessThan(html.indexOf('class="area-delete"'));
  });
  it("keeps the open slot editor in the parameters column and leaves hidden parts empty", () => {
    const view = screen();
    view._open = "new";
    view._group = { };
    view._renderEditor = () => "[EDITOR]";
    const html = flat(view.render());
    const params = html.indexOf('class="params"');
    expect(html.indexOf("[EDITOR]")).toBeGreaterThan(params);
    expect(html.indexOf("[EDITOR]")).toBeLessThan(html.indexOf('class="area-week"'));
    expect(html).not.toContain("[CHART]");
    expect(html).not.toContain("danger-line alone");
  });
});
