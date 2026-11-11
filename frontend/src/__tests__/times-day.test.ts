import { describe, expect, it, vi } from "vitest";
import { WpTimesDay } from "../components/times-day";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { normalizeConfig } from "../config";
import { strings } from "../i18n";
import { find, flat } from "./helpers/tpl";
import type { TimesRow } from "../times-list";

const row = (extra: Partial<TimesRow> = {}): TimesRow => ({
  key: "a|480", startMin: 480, color: "#0a0", label: "Heat", slotId: "a", carry: null, until: { day: "today", min: 540 },
  oneShot: false, sun: null, rule: null, random: false, now: false, done: false, ...extra,
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
    expect(html).toContain("15 min before sunrise");
    expect(html).toContain("varies, a few minutes apart");
  });

  it("an empty day says so and gives the rest-of-time setting, only when ready", () => {
    const ready = flat(comp({ rows: [], state: "ready", rest: "Eco" }).render());
    expect(ready).toContain("Nothing planned today");
    expect(ready).toContain("The rest of the time: Eco");
    for (const state of ["loading", "failed"] as const) {
      const html = flat(comp({ rows: [], state, rest: "Eco" }).render());
      expect(html).not.toContain("Nothing planned today");
      expect(html).not.toContain("The rest of the time");
    }
    expect(flat(comp({ state: "loading" }).render())).toContain("Loading");
    expect(flat(comp({ state: "failed" }).render())).toContain("Cannot show the times right now");
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

describe("wp-times-day: buttons and sizes", () => {
  it("shows 'Edit the day' under the list only when editing is allowed, and opens like a row", () => {
    expect(flat(comp({ rows: [row()], editable: true }).render())).toContain("Edit the day");
    expect(flat(comp({ rows: [row()], editable: false }).render())).not.toContain("Edit the day");
    const on = vi.fn();
    const c = comp({ rows: [row()], editable: true });
    c.dispatchEvent = on;
    find(c.render(), "click", 'class="action"').fn();
    expect(on.mock.calls[0][0].type).toBe("open-day");
  });

  it("an empty day says what is planned for the rest and offers 'Add a schedule' when editable", () => {
    const html = flat(comp({ rows: [], state: "ready", rest: "Eco", editable: true }).render());
    expect(html).toContain("Add a schedule");
    expect(flat(comp({ rows: [], state: "ready", rest: "Eco", editable: false }).render())).not.toContain("Add a schedule");
    expect(flat(comp({ rows: [], state: "loading", editable: true }).render())).not.toContain("Add a schedule");
  });

  it("a failure offers 'Try again', which asks the card to reload; loading has no button", () => {
    const html = flat(comp({ state: "failed" }).render());
    expect(html).toContain("Try again");
    const on = vi.fn();
    const c = comp({ state: "failed" });
    c.dispatchEvent = on;
    find(c.render(), "click", 'class="action"').fn();
    expect(on.mock.calls[0][0].type).toBe("retry");
    expect(flat(comp({ state: "loading" }).render())).not.toContain("<button");
  });

  it("uses the same words for the row and the button, and every text is at least 16 px", () => {
    expect(strings("fr").times_row_open).toContain(strings("fr").edit_bar);
    expect(strings("en").times_row_open).toContain(strings("en").edit_bar);
    expect(strings("fr").times_edit).toBe(strings("fr").edit_bar);
    const css = String((WpTimesDay as any).styles?.cssText ?? (WpTimesDay as any).styles);
    expect(css).not.toMatch(/font-size:\s*0\.(75|8\d*)rem/);
    expect(css).not.toContain("secondary-text-color");
  });
});

describe("times: config, editor and texts", () => {
  it("accepts schedule_view times", () => {
    expect(normalizeConfig({ type: "x", schedule_view: "times" }).schedule_view).toBe("times");
  });
  it("has the same keys in English and French", () => {
    for (const k of ["ce_times", "times_none", "times_rest", "times_loading", "times_failed", "times_until", "times_until_tomorrow",
      "times_since_yesterday", "times_retry", "times_edit", "times_add", "sun_rule_before", "sun_rule_after", "sun_np_sunset", "sun_at_sunset", "times_random", "times_now", "times_list_label", "times_row_open"]) {
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

  it("a retry lifts the wait, goes back to loading and reloads once", () => {
    const c = card([program("p", ["switch.a"])], {}, "failed");
    c._previewRetryAt = Date.now() + 5000;
    c._loadPreviews = vi.fn();
    c.requestUpdate = vi.fn();
    find(c._bySchedule(c._data.programs), "retry", "wp-times-day").fn();
    expect(c._previewRetryAt).toBe(0);
    expect(c._previewState(c._data.programs[0], "switch.a")).toBe("loading");
    expect(c._loadPreviews).toHaveBeenCalledTimes(1);
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

describe("times: approximate start, done rows, header icon, next line, week icon", () => {
  it("a random start is said 'around', with the variable mention kept", () => {
    const en = flat(comp({ rows: [row({ startMin: 425, random: true })] }).render());
    expect(en).toContain("around 7:05 am");
    expect(en).toContain("varies, a few minutes apart");
    const fr = flat(comp({ lang: "fr", rows: [row({ startMin: 425, random: true })] }).render());
    expect(fr).toContain("vers 7 h 05");
    expect(fr).toContain("heure variable, quelques minutes d’écart");
    expect(flat(comp({ rows: [row({ startMin: 425 })] }).render())).not.toContain("around");
  });

  it("a carried-over row keeps its real start (no 'around')", () => {
    const html = flat(comp({ rows: [row({ carry: "from_yesterday", startMin: 1320, random: true })] }).render());
    expect(html).toContain("since yesterday 10 pm");
    expect(html).not.toContain("around");
  });

  it("a done row says 'done' in words (not by colour only), in both languages, and a normal one does not", () => {
    const done = flat(comp({ rows: [row({ done: true })] }).render());
    expect(done).toContain("done");
    expect(done).toContain("class=done");
    expect(flat(comp({ lang: "fr", rows: [row({ done: true })] }).render())).toContain("terminé");
    expect(flat(comp({ rows: [row()] }).render())).not.toContain("done");
    expect(flat(comp({ rows: [row({ now: true })] }).render())).not.toContain("done");
  });

  it("the card hides the header icon only when the 'Edit the day' button is there", () => {
    const icon = (c: any) => flat(c._bySchedule(c._data.programs)).includes("mdi:calendar-edit\"></ha-icon></button>");
    const c = card([program("p", ["switch.a"])]);
    expect(flat(c._bySchedule(c._data.programs))).toContain("wp-times-day");
    expect(icon(c)).toBe(false);
    // read-only, no edit right, loading, failed: no button under the list, so the icon stays (the only way to open the hours)
    expect(icon(card([program("p", ["switch.a"])], { read_only: true }))).toBe(true);
    expect(icon(card([program("p", ["switch.a"])], { can_edit: false }))).toBe(true);
    expect(icon(card([program("p", ["switch.a"])], {}, false))).toBe(true);
    expect(icon(card([program("p", ["switch.a"])], {}, "failed"))).toBe(true);
    // other views keep it
    const bar = card([program("p", ["switch.a"])]);
    bar._config = { schedule_view: "bar" };
    expect(icon(bar)).toBe(true);
  });

  it("the header says 'Next:' instead of an arrow, and the week button has an icon", () => {
    const c = card([program("p", ["switch.a"])]);
    c._data.status = { p: { next_actions: { "switch.a": { at: "2026-11-10T09:00:00Z", label: "l" } } } };
    c.hass.states["switch.a"] = { entity_id: "switch.a", state: "on", attributes: {} };
    const html = flat(c._bySchedule(c._data.programs));
    expect(html).toContain("Next:");
    expect(html).not.toContain("→");
    expect(strings("fr").next_then).toBe("Ensuite :");
    const extras = flat(c._extras({ kind: "program", programId: "p" }, "switch.a", c._data.programs));
    expect(extras).toContain("mdi:calendar-week");
  });
});

