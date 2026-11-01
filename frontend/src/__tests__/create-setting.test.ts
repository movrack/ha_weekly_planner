import { describe, expect, it, vi } from "vitest";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { WpSchedule } from "../components/schedule-dialog";
import { find, flat } from "./helpers/tpl";

const slot = { id: "s", start: { time: "08:00" }, end: { time: "09:00" }, label: "l" };
const program = (id: string, entities: string[], filled: boolean) => ({
  id, name: id, revision: 1, priority: 10, enabled: true, reapply: true, conditions: [], active_profile: "a",
  entities: entities.map((e) => ({ entity_id: e, default_label: null, label_overrides: {} })),
  profiles: [{ id: "a", name: "A", days: [filled ? [slot] : [], [], [], [], [], [], []] }],
});

function card(programs: any[], flags: Partial<{ can_edit: boolean; read_only: boolean }> = {}, view = "schedule") {
  const c = new WeeklyPlannerCard() as any;
  c.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, services: {} };
  c._config = { schedule_view: view };
  c._data = { programs, labels: [], status: {}, can_edit: true, read_only: false, ...flags };
  return c;
}

describe("Create a setting (card)", () => {
  it("shows one primary button for a device without any setting", () => {
    const c = card([program("p", ["switch.a"], false)]);
    const html = flat(c._bySchedule(c._data.programs));
    expect(html.match(/class="create"/g)).toHaveLength(1);
    expect(html).toContain("mdi:plus");
    expect(html).not.toContain("wp-bar-editor");
  });
  it("shows one button per empty device of a program with several devices (D4)", () => {
    const c = card([program("p", ["switch.a", "switch.b"], false)]);
    expect(flat(c._bySchedule(c._data.programs)).match(/class="create"/g)).toHaveLength(2);
  });
  it("does not show it when there are slots", () => {
    const c = card([program("p", ["switch.a"], true)]);
    const html = flat(c._bySchedule(c._data.programs));
    expect(html).not.toContain('class="create"');
    expect(html).toContain("wp-bar-editor");
  });
  it("is hidden when read-only or for non-editors", () => {
    for (const flags of [{ read_only: true }, { can_edit: false }]) {
      const c = card([program("p", ["switch.a"], false)], flags);
      expect(flat(c._bySchedule(c._data.programs))).not.toContain('class="create"');
    }
  });
  it("opens the schedule dialog of that program, ready to create", () => {
    const c = card([program("p", ["switch.a"], false)]);
    find(c._bySchedule(c._data.programs), "click", 'class="create"').fn();
    expect(c._dialog).toEqual({ kind: "schedule", scope: { kind: "program", programId: "p" }, day: undefined, create: true });
  });
  it("also works in the compact list", () => {
    const c = card([program("p", ["switch.a"], false)], {}, "list");
    c._expandedProgram = "p";
    expect(flat(c._compactList(c._data.programs))).toContain('class="create"');
  });
});

describe("Create a setting (dialog)", () => {
  function dialog(filled: boolean, create: boolean, flags: any = {}) {
    const v = new WpSchedule() as any;
    v.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, services: {}, callWS: vi.fn() };
    v.scope = { kind: "program", programId: "p" };
    v.data = { programs: [program("p", ["switch.a"], filled)], status: {}, can_edit: true, read_only: false, labels: [{ id: "l", name: "L", color: "#f00", action: { kind: "service", service: "switch.turn_on" } }], ...flags };
    v.create = create;
    v.requestUpdate = vi.fn();
    v.renderRoot = { querySelector: () => null };
    return v;
  }
  it("labels the add button 'Create a setting' when empty, 'Add a schedule' otherwise", () => {
    expect(flat(dialog(false, false).render())).toContain("Create a setting");
    const full = flat(dialog(true, false).render());
    expect(full).not.toContain("Create a setting");
    expect(full).toContain("Add a schedule");
  });
  it("opens the new-slot form straight away when created from the card", () => {
    const v = dialog(false, true);
    v.firstUpdated();
    expect(v._open).toBe("new");
  });
  it("does not open the form when there are slots or the user cannot edit", () => {
    const a = dialog(true, true); a.firstUpdated(); expect(a._open).toBeNull();
    const b = dialog(false, true, { read_only: true }); b.firstUpdated(); expect(b._open).toBeNull();
  });
});
