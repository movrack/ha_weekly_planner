import { describe, expect, it, vi } from "vitest";
import { WpTimesDay } from "../components/times-day";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { normalizeConfig } from "../config";
import { strings } from "../i18n";
import { find, flat } from "./helpers/tpl";
import type { TimesRow } from "../times-list";

const row = (extra: Partial<TimesRow> = {}): TimesRow => ({
  key: "a|480", startMin: 480, color: "#0a0", label: "Heat", slotId: "a", carry: null, until: { day: "today", min: 540 },
  oneShot: false, sun: null, rule: null, random: false, now: false, ...extra,
});
function comp(props: Partial<WpTimesDay>): any {
  const c = new WpTimesDay() as any;
  Object.assign(c, { lang: "en", ...props });
  return c;
}

describe("wp-times-day", () => {
  it("is a real list, a row is a button only when editing is allowed", () => {
    const view = flat(comp({ rows: [row()], editable: true }).render());
    expect(view).toContain("<ul");
    expect(view).toContain("<li");
    expect(view).toContain("<button");
    const ro = flat(comp({ rows: [row()], editable: false }).render());
    expect(ro).toContain("<ul");
    expect(ro).not.toContain("<button");
  });

  it("says 'Now' in words with aria-current, not by colour only", () => {
    const html = flat(comp({ rows: [row({ now: true })] }).render());
    expect(html).toContain("Now");
    expect(html).toContain("time");
  });

  it("writes since yesterday, until tomorrow, the sun rule and the random mention", () => {
    const html = flat(comp({ rows: [
      row({ carry: "from_yesterday", startMin: 1320, until: { day: "today", min: 360 } }),
      row({ key: "b", until: { day: "tomorrow", min: 360 }, sun: "up", rule: { sun: "sunrise", offset: -15 }, random: true }),
    ] }).render());
    expect(html).toContain("since yesterday 10 pm");
    expect(html).toContain("until tomorrow 6 am");
    expect(html).toContain("Sunrise − 15 min");
    expect(html).toContain("random time");
  });

  it("an empty day says so and gives the rest-of-time setting, only when ready", () => {
    const ready = flat(comp({ rows: [], state: "ready", rest: "Eco" }).render());
    expect(ready).toContain("No times today");
    expect(ready).toContain("The rest of the time: Eco");
    for (const state of ["loading", "failed"] as const) {
      const html = flat(comp({ rows: [], state, rest: "Eco" }).render());
      expect(html).not.toContain("No times today");
      expect(html).not.toContain("The rest of the time");
    }
    expect(flat(comp({ state: "loading" }).render())).toContain("Loading");
    expect(flat(comp({ state: "failed" }).render())).toContain("could not be loaded");
  });

  it("emits open-day on a tap, and nothing when read-only", () => {
    const on = vi.fn();
    const c = comp({ editable: true }) as any;
    c.dispatchEvent = on;
    c._open();
    expect(on).toHaveBeenCalledTimes(1);
    const ro = comp({ editable: false }) as any;
    ro.dispatchEvent = on;
    ro._open();
    expect(on).toHaveBeenCalledTimes(1);
  });
});

describe("times: config, editor and texts", () => {
  it("accepts schedule_view times", () => {
    expect(normalizeConfig({ type: "x", schedule_view: "times" }).schedule_view).toBe("times");
  });
  it("has the same keys in English and French", () => {
    for (const k of ["ce_times", "times_none", "times_rest", "times_loading", "times_failed", "times_until", "times_until_tomorrow",
      "times_since_yesterday", "times_random", "times_now", "times_list_label", "times_row_open"]) {
      expect((strings("en") as any)[k]).toBeTruthy();
      expect((strings("fr") as any)[k]).toBeTruthy();
    }
    expect(strings("fr").ce_times).toBe("Horaires du jour");
  });
});

const slot = { id: "s", start: { time: "08:00" }, end: { time: "09:00" }, label: "l" };
const program = (id: string, entities: string[], extra: any = {}) => ({
  id, name: id, revision: 1, priority: 10, enabled: true, reapply: true, conditions: [],
  entities: entities.map((e) => ({ entity_id: e, default_label: null, label_overrides: {} })),
  profiles: [{ id: "a", name: "A", days: [[slot], [slot], [slot], [slot], [slot], [slot], [slot]] }], ...extra,
});
const label = { id: "l", name: "Heat", color: "#f00", action: { kind: "service", service: "switch.turn_on" } };

function card(programs: any[], flags: any = {}, preview: boolean | "failed" = true) {
  const c = new WeeklyPlannerCard() as any;
  c.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, services: {} };
  c._config = { schedule_view: "times" };
  c._now = new Date("2026-11-10T08:30:00Z");
  c._data = { programs, labels: [label], status: {}, can_edit: true, read_only: false, ...flags };
  if (preview === true) {
    c._preview = { "2026-11-10": Object.fromEntries(programs.map((p) => [p.id, { slots: [
      { slot_id: "s", start: "2026-11-10T08:00:00Z", end: "2026-11-10T09:00:00Z", ignored: null, sun: false }] }])) };
  } else if (preview === "failed") c._failedPreviewKey = "k";
  return c;
}

describe("the card with schedule_view times", () => {
  it("shows the daily times instead of the bar, one list for a one-device program", () => {
    const c = card([program("p", ["switch.a"])]);
    const html = flat(c._bySchedule(c._data.programs));
    expect(html).toContain("wp-times-day");
    expect(html).not.toContain("wp-bar-editor class");
    expect(c._todayBlock("switch.a", c._data.programs[0], () => {}).values[0]).toHaveLength(1); // one row
  });

  it("shows only the chosen device of a program with several devices, with tabs", () => {
    const c = card([program("p", ["switch.a", "switch.b"])]);
    const html = flat(c._bySchedule(c._data.programs));
    expect(html).toContain('role="tablist"');
    expect(html.match(/<wp-times-day/g)).toHaveLength(1);
    c._pickDevice(c._data.programs[0], "switch.b");
    expect(flat(c._bySchedule(c._data.programs))).toContain("switch.b");
  });

  it("hides a disabled program's spans (nothing to list)", () => {
    const c = card([program("p", ["switch.a"], { enabled: false })]);
    expect(c._todayBlock("switch.a", c._data.programs[0], () => {}).values[0]).toEqual([]);
  });

  it("opens the editor on the program when a row is tapped", () => {
    const c = card([program("p", ["switch.a"])]);
    find(c._bySchedule(c._data.programs), "open-day", "wp-times-day").fn();
    expect(c._dialog).toMatchObject({ kind: "schedule", scope: { kind: "program", programId: "p" } });
  });

  it("is not editable when read-only, for non-editors, or when the mode follows another", () => {
    for (const flags of [{ read_only: true }, { can_edit: false }]) {
      const c = card([program("p", ["switch.a"])], flags);
      expect(flat(c._bySchedule(c._data.programs))).not.toContain("?editable=true");
      expect(c._todayBlock("switch.a", c._data.programs[0], () => {}).values.includes(false)).toBe(true);
    }
    const p = program("p", ["switch.a"]);
    p.profiles.push({ id: "b", name: "B", follows: "A", days: [[], [], [], [], [], [], []] } as any);
    const c = card([p], { mode: { selector: "x", options: ["A", "B"], active: "B" } });
    const editable = (cc: any) => cc._todayBlock("switch.a", cc._data.programs[0], () => {}).values[3];
    expect(editable(c)).toBe(false);
    expect(editable(card([program("p", ["switch.a"])]))).toBe(true);
  });

  it("never says 'no times' while the preview is loading, and tells a failure apart", () => {
    const loading = card([program("p", ["switch.a"])], {}, false);
    expect(loading._previewState(loading._data.programs[0], "switch.a")).toBe("loading");
    expect(loading._todayBlock("switch.a", loading._data.programs[0], () => {}).values[1]).toBe("loading");
    expect(loading._todayBlock("switch.a", loading._data.programs[0], () => {}).values[0]).toEqual([]);
    const failed = card([program("p", ["switch.a"])], {}, "failed");
    expect(failed._previewState(failed._data.programs[0], "switch.a")).toBe("failed");
    expect(card([program("p", ["switch.a"])])._previewState(program("p", ["switch.a"]), "switch.a")).toBe("ready");
  });

  it("the compact list also uses it, and the create button keeps priority", () => {
    const c = card([program("p", ["switch.a"])]);
    c._config = { schedule_view: "times" };
    expect(flat(c._compactList(c._data.programs))).not.toContain("wp-times-day"); // collapsed
    c._expandedProgram = "p";
    expect(flat(c._compactList(c._data.programs))).toContain("wp-times-day");
    const empty = card([program("p", ["switch.a"], { profiles: [{ id: "a", name: "A", days: [[], [], [], [], [], [], []] }] })]);
    expect(flat(empty._bySchedule(empty._data.programs))).toContain('class="create"');
    expect(flat(empty._bySchedule(empty._data.programs))).not.toContain("<wp-times-day");
  });

  it("the week and the chart stay in bars", () => {
    const c = card([program("p", ["switch.a"])]);
    const html = flat(c._extras({ kind: "program", programId: "p" }, "switch.a", c._data.programs));
    expect(html).toContain('class="weekbtn"');
    expect(html).toContain("chartbtn");
  });
});
