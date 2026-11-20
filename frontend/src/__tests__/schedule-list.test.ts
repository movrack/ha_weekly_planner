import { describe, expect, it } from "vitest";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { WeeklyPlannerCardEditor } from "../card-editor";
import { WpTimesDay } from "../components/times-day";
import { WpSchedule } from "../components/schedule-dialog";
import { normalizeConfig } from "../config";
import { strings } from "../i18n";
import { find, flat } from "./helpers/tpl";

const slot = { id: "s", start: { time: "08:00" }, end: { time: "09:00" }, label: "l" };
const program = (id: string, entities: string[]) => ({
  id, name: id, revision: 1, priority: 10, enabled: true, reapply: true, conditions: [],
  entities: entities.map((e) => ({ entity_id: e, default_label: null, label_overrides: {} })),
  profiles: [{ id: "a", name: "A", days: [[slot], [slot], [slot], [slot], [slot], [slot], [slot]] }],
});
const label = { id: "l", name: "Heat", color: "#f00", action: { kind: "service", service: "switch.turn_on" } };

function card(config: any, flags: any = {}, entities = ["switch.a"]) {
  const c = new WeeklyPlannerCard() as any;
  c.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, services: {} };
  c._config = config;
  c._now = new Date("2026-11-10T08:30:00Z");
  const p = program("p", entities);
  c._data = { programs: [p], labels: [label], status: {}, can_edit: true, read_only: false, ...flags };
  c._preview = { "2026-11-10": { p: { slots: [{ slot_id: "s", start: "2026-11-10T08:00:00Z", end: "2026-11-10T09:00:00Z", ignored: null, sun: false }] } } };
  return c;
}

describe("show_schedule_list: config and editor", () => {
  it("keeps a boolean and drops any other type", () => {
    expect(normalizeConfig({ type: "x", show_schedule_list: true }).show_schedule_list).toBe(true);
    expect(normalizeConfig({ type: "x", show_schedule_list: "yes" }).show_schedule_list).toBeUndefined();
  });

  it("has a switch in the editor, off by default, written to the config", () => {
    const ed = new WeeklyPlannerCardEditor() as any;
    const out: any[] = [];
    ed.addEventListener("config-changed", (e: any) => out.push(e.detail.config));
    ed.setConfig({ type: "x", filter: {} });
    expect(flat(ed.render())).toContain("Show the schedules");
    ed._set("show_schedule_list", true);
    expect(out[0].show_schedule_list).toBe(true);
  });

  it("has the same texts in English and French", () => {
    expect(strings("en").ce_show_schedule_list).toBe("Show the schedules");
    expect(strings("fr").ce_show_schedule_list).toBe("Afficher les horaires");
    expect(strings("en").schedules_title).toBe("Schedules");
    expect(strings("fr").schedules_title).toBe("Horaires");
  });
});

describe("show_schedule_list: the card", () => {
  const list = (c: any) => flat(c._bySchedule(c._data.programs));

  it("shows nothing when the option is off or missing", () => {
    for (const view of ["bars", "radial", "radial_12h"]) {
      expect(list(card({ schedule_view: view }))).not.toContain("schedule-list");
      expect(list(card({ schedule_view: view, show_schedule_list: false }))).not.toContain("schedule-list");
    }
  });

  it("shows the labelled list on bars, circular and 12 h circular, before the Week button", () => {
    for (const view of ["bars", "radial", "radial_12h"]) {
      const html = list(card({ schedule_view: view, show_schedule_list: true }));
      expect(html).toContain("wp-times-day");
      expect(html).toContain("Schedules");
      expect(html).toMatch(/aria-labelledby=sl-[\w-]+>\s*<h3 id=sl-[\w-]+ class="sl-title"/);
      expect(html.indexOf("schedule-list")).toBeLessThan(html.indexOf("weekbtn"));
      expect(html.indexOf("wp-bar-editor")).toBeLessThan(html.indexOf("schedule-list"));
    }
  });

  it("stays out of Daily times (one list only) and the compact list", () => {
    const times = card({ schedule_view: "times", show_schedule_list: true });
    expect(list(times)).not.toContain("schedule-list");
    const compact = card({ schedule_view: "list", show_schedule_list: true });
    compact._expandedProgram = "p";
    expect(flat(compact._compactList(compact._data.programs))).not.toContain("schedule-list");
    expect(flat(compact._scheduleList("switch.a", compact._data.programs[0], () => {}))).not.toContain("schedule-list");
  });

  it("lists the device shown of a multi-device program", () => {
    const c = card({ schedule_view: "bars", show_schedule_list: true }, {}, ["switch.a", "switch.b"]);
    expect(list(c).match(/<wp-times-day/g)).toHaveLength(1);
  });

  it("a row opens the editor of its own schedule, today, only when editing is allowed", () => {
    const c = card({ schedule_view: "bars", show_schedule_list: true });
    const tpl = c._bySchedule(c._data.programs);
    expect(flat(tpl)).toContain("?hold=");
    find(tpl, "open-day", "wp-times-day").fn(new CustomEvent("open-day", { detail: { slotId: "s" } }));
    expect(c._dialog).toMatchObject({ kind: "schedule", scope: { kind: "program", programId: "p" }, slotId: "s", day: { offset: 0 } });
    for (const flags of [{ read_only: true }, { can_edit: false }]) {
      const ro = card({ schedule_view: "bars", show_schedule_list: true }, flags);
      expect(ro._todayBlock("switch.a", ro._data.programs[0], () => {}).values.includes(false)).toBe(true);
    }
  });

  it("the schedule window opens the editor of the slot it is given", () => {
    const d = new WpSchedule() as any;
    const group = { ids: { 1: "s" }, days: [1], slot };
    const opened: any[] = [];
    d._rows = () => [{ program: { id: "p" }, group, key: "p|s" }];
    d._openRow = (...a: any[]) => opened.push(a);
    d._loadNames = () => {};
    Object.assign(d, { day: { weekday: 1, offset: 0 }, slotId: "s" });
    d.firstUpdated();
    expect(opened).toHaveLength(1);
    expect(opened[0][0]).toBe("p|s");
    opened.length = 0;
    d.slotId = "nope";
    d.firstUpdated();
    expect(opened).toHaveLength(0);
  });

  it("rows are at least 48 px high", () => {
    const css = String((WpTimesDay as any).styles?.cssText ?? (WpTimesDay as any).styles);
    expect(css).toMatch(/\.row \{[^}]*min-height: 48px/);
  });
});
