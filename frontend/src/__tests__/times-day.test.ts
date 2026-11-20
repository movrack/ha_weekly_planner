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
  it("is a real list; a row is never a button (the icon at the top right edits)", () => {
    const view = flat(comp({ rows: [row()], editable: true }).render());
    expect(view).toContain("<ul");
    expect(view).toContain("<li");
    expect(view).not.toContain("<button");
    expect(view).toContain("Heat");
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
  it("has no 'Edit the day' text button: the header icon opens the editor, and a row opens it when editing is allowed", () => {
    expect(flat(comp({ rows: [row()], editable: true }).render())).not.toContain("Edit the day</button>");
    expect(flat(comp({ rows: [row()], editable: true }).render())).not.toContain('class="action"');
  });

  it("an empty editable day keeps one 'Add a schedule' button (owner's exception); a read-only one has none", () => {
    const empty = flat(comp({ rows: [], state: "ready", rest: "Eco", editable: true }).render());
    expect(empty).toContain("Add a schedule");
    expect(empty).toContain("mdi:plus");
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

  it("every text is at least 16 px", () => {
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
      "times_since_yesterday", "times_retry", "sun_rule_before", "sun_rule_after", "sun_np_sunset", "sun_at_sunset", "times_random", "times_now", "times_list_label"]) {
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

  it("the header icon is there in the times view too, as in every other view", () => {
    const icon = (c: any) => flat(c._bySchedule(c._data.programs)).includes("mdi:calendar-edit\"></ha-icon><span class=\"hl\">");
    const c = card([program("p", ["switch.a"])]);
    expect(flat(c._bySchedule(c._data.programs))).toContain("wp-times-day");
    expect(icon(c)).toBe(true);
    expect(icon(card([program("p", ["switch.a"])], { read_only: true }))).toBe(true);
    expect(icon(card([program("p", ["switch.a"])], {}, "failed"))).toBe(true);
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

describe("wp-times-day: details of a row and of its events", () => {
  const ev = (c: any, action: (c: any) => void) => {
    const on = vi.fn();
    c.dispatchEvent = on;
    action(c);
    return on.mock.calls.map(([e]: any[]) => e as CustomEvent);
  };
  it("has the defaults of a ready, read-only English list", () => {
    const c = new WpTimesDay() as any;
    expect([c.rows, c.state, c.rest, c.editable, c.lang, c.deviceName]).toEqual([[], "ready", "", false, "en", ""]);
  });
  it("open-day and retry cross the shadow root and bubble", () => {
    const [open] = ev(comp({ editable: true }), (c) => c._open());
    expect([open.type, open.bubbles, open.composed]).toEqual(["open-day", true, true]);
    const [retry] = ev(comp({ state: "failed" }), (c) => c._retry());
    expect([retry.type, retry.bubbles, retry.composed]).toEqual(["retry", true, true]);
  });
  it("a retry puts the focus on the status region, and does not fail when there is none", () => {
    const focus = vi.fn();
    const c = comp({ state: "failed" });
    c.dispatchEvent = vi.fn();
    c.renderRoot = { querySelector: (sel: string) => (sel === ".status" ? { focus } : null) };
    c._retry();
    expect(focus).toHaveBeenCalledTimes(1);
    c.renderRoot = { querySelector: () => null };
    expect(() => c._retry()).not.toThrow();
  });
  it("says until when, 'until tomorrow' for the next day, nothing when the end is unknown", () => {
    expect(flat(comp({ rows: [row({ until: { day: "today", min: 540 } })] }).render())).toContain("until 9 am");
    const tom = flat(comp({ rows: [row({ until: { day: "tomorrow", min: 120 } })] }).render());
    expect(tom).toContain("until tomorrow 2 am");
    const unknown = flat(comp({ rows: [row({ until: { day: "tomorrow", min: null } })] }).render());
    expect(unknown).toMatch(/until tomorrow\s*</);
    expect(unknown).not.toContain("undefined");
    expect(unknown).not.toContain("Stryker");
    const one = flat(comp({ rows: [row({ until: null, oneShot: true })] }).render());
    expect(one).not.toContain("until");
    expect(one).not.toContain('class="more"');
  });
  it("the sun rule needs both the rule and the side; the icon follows the side", () => {
    const rule = { sun: "sunset" as const, offset: 10 };
    const up = flat(comp({ rows: [row({ sun: "up", rule })] }).render());
    expect(up).toContain("mdi:weather-sunset-up");
    expect(up).toContain("10 min after sunset");
    const down = flat(comp({ rows: [row({ sun: "down", rule })] }).render());
    expect(down).toContain("mdi:weather-sunset-down");
    expect(flat(comp({ rows: [row({ sun: "up", rule: null })] }).render())).not.toContain('class="sun"');
    expect(flat(comp({ rows: [row({ sun: null, rule })] }).render())).not.toContain('class="sun"');
  });
  it("the random mention only appears for a random start", () => {
    expect(flat(comp({ rows: [row()] }).render())).not.toContain("varies");
    expect(flat(comp({ rows: [row({ random: true })] }).render())).toContain("varies");
  });
  it("marks the current row and the done row, by class and aria-current", () => {
    const now = flat(comp({ rows: [row({ now: true })] }).render());
    expect(now).toContain("<li class=current");
    expect(now).toContain("aria-current=time");
    const done = flat(comp({ rows: [row({ done: true })] }).render());
    expect(done).toContain("<li class=done");
    expect(done).toContain("done");
    expect(done).not.toContain("aria-current=time");
    const plain = flat(comp({ rows: [row()] }).render());
    expect(plain).toMatch(/<li class= /);
    expect(plain).not.toContain("aria-current=time");
  });
  it("the list has its role and its name; the empty day has none", () => {
    const html = flat(comp({ rows: [row()] }).render());
    expect(html).toContain('role="list"');
    expect(html).toContain("Today’s times");
    expect(flat(comp({ rows: [] }).render())).not.toContain("<ul");
    expect(flat(comp({ rows: [row()], state: "loading" }).render())).not.toContain("<ul");
  });
  it("the status region is live and focusable only by script", () => {
    const html = flat(comp({ rows: [row()] }).render());
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('tabindex="-1"');
  });
  it("the retry button carries its icon and retries; no text button opens the day (the header icon does)", () => {
    const edit = comp({ rows: [row()], editable: true });
    expect(flat(edit.render())).not.toContain('class="action"');
    const retry = comp({ state: "failed" });
    expect(flat(retry.render())).toContain("mdi:refresh");
    expect(ev(retry, (x) => find(x.render(), "click", 'class="action"').fn())[0].type).toBe("retry");
    const add = comp({ rows: [], state: "ready", editable: true });
    expect(ev(add, (x) => find(x.render(), "click", 'class="action"').fn())[0].type).toBe("open-day");
  });
});

describe("wp-times-day: Schedules list rows (hold)", () => {
  const rowHandler = (c: any, ev: string) => find(c.render(), ev, 'class="row press"').fn;
  const opened = (c: any) => {
    const seen: any[] = [];
    c.dispatchEvent = (e: any) => seen.push(e);
    return seen;
  };
  const pe = (extra: any = {}) => ({ button: 0, pointerId: 1, clientX: 10, clientY: 10, ...extra });

  it("a row is a focusable named button only when editable, not locked and in hold mode", () => {
    const html = flat(comp({ rows: [row()], editable: true, hold: true, deviceName: "Bath" }).render());
    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="0"');
    // the name comes from the visible text (WCAG 2.5.3): no aria-label, the device in a visually hidden span, the real action as description
    expect(html).not.toContain("aria-label=\"Bath");
    expect(html).toContain('<span class="sr">Bath,</span>');
    expect(html).toContain("Opens this schedule for editing");
    expect(html).not.toContain("aria-description=\"Keep your finger");
    expect(flat(comp({ rows: [row()], editable: true, hold: true }).render())).not.toContain('class="sr"');
    expect(strings("fr").times_row_action).toBe("Ouvre cet horaire pour le modifier");
    for (const props of [{ hold: false }, { editable: false }, { locked: true }]) {
      const view = flat(comp({ rows: [row()], editable: true, hold: true, ...props }).render());
      expect(view).not.toContain('role="button"');
      expect(view).not.toContain('tabindex="0"');
    }
  });

  it("a long press opens that schedule, a plain click only gives the hint", () => {
    vi.useFakeTimers();
    try {
      const c = comp({ rows: [row({ slotId: "x" })], editable: true, hold: true });
      const seen = opened(c);
      rowHandler(c, "pointerdown")(pe());
      vi.advanceTimersByTime(500);
      expect(seen).toHaveLength(1);
      expect(seen[0].type).toBe("open-day");
      expect(seen[0].detail).toEqual({ slotId: "x" });
      rowHandler(c, "pointerup")(pe());
      expect(seen).toHaveLength(1);
      rowHandler(c, "pointerdown")(pe());
      rowHandler(c, "pointerup")(pe());
      vi.advanceTimersByTime(500);
      expect(seen).toHaveLength(1);
      expect(flat(c.render())).toMatch(/class="hint"[^>]*>Keep your finger/);
      vi.advanceTimersByTime(7000);
      expect(flat(c.render())).not.toMatch(/class="hint"[^>]*>Keep your finger/);
    } finally { vi.useRealTimers(); }
  });

  it("moving the finger is a scroll, not a press; a cancel stops the press", () => {
    vi.useFakeTimers();
    try {
      const c = comp({ rows: [row()], editable: true, hold: true });
      const seen = opened(c);
      rowHandler(c, "pointerdown")(pe());
      rowHandler(c, "pointermove")(pe({ clientY: 60 }));
      vi.advanceTimersByTime(600);
      rowHandler(c, "pointerdown")(pe({ button: 2 }));
      rowHandler(c, "pointerdown")(pe());
      rowHandler(c, "pointercancel")();
      vi.advanceTimersByTime(600);
      expect(seen).toHaveLength(0);
      rowHandler(c, "pointerup")(pe({ pointerId: 9 }));
      expect(flat(c.render())).not.toMatch(/class="hint"[^>]*>Keep your finger/);
    } finally { vi.useRealTimers(); }
  });

  it("Enter and Space open it, other keys and a mouse click do not, a screen-reader click does", () => {
    const c = comp({ rows: [row({ slotId: "x" })], editable: true, hold: true });
    const seen = opened(c);
    const el: any = {};
    const key = (k: string) => { const e = { key: k, target: el, currentTarget: el, preventDefault: vi.fn() }; rowHandler(c, "keydown")(e); return e; };
    expect(key("Enter").preventDefault).toHaveBeenCalled();
    key(" ");
    key("a");
    expect(seen.map((e: any) => e.detail)).toEqual([{ slotId: "x" }, { slotId: "x" }]);
    rowHandler(c, "click")({ detail: 1 });
    expect(seen).toHaveLength(2);
    rowHandler(c, "click")({ detail: 0 });
    expect(seen).toHaveLength(3);
    rowHandler(c, "keydown")({ key: "Enter", target: {}, currentTarget: el, preventDefault: vi.fn() });
    expect(seen).toHaveLength(3);
    const ctx = { preventDefault: vi.fn() };
    rowHandler(c, "contextmenu")(ctx);
    expect(ctx.preventDefault).not.toHaveBeenCalled();
  });

  it("blocks the context menu during a press and cleans up when removed", () => {
    vi.useFakeTimers();
    try {
      const c = comp({ rows: [row()], editable: true, hold: true });
      opened(c);
      rowHandler(c, "pointerdown")(pe());
      const ctx = { preventDefault: vi.fn() };
      rowHandler(c, "contextmenu")(ctx);
      expect(ctx.preventDefault).toHaveBeenCalled();
      c.disconnectedCallback();
      expect(c._press).toBeUndefined();
    } finally { vi.useRealTimers(); }
  });
});
