import { describe, expect, it, vi } from "vitest";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { activeProfile } from "../planner";
import { flat } from "./helpers/tpl";

const days = () => [[], [], [], [], [], [], []];
const program = (id: string, names: string[], devices = 1) => ({
  id, name: `P ${id}`, revision: 1, priority: 10, enabled: true, reapply: true, conditions: [],
  entities: Array.from({ length: devices }, (_, i) => ({ entity_id: `switch.${id}${i}`, default_label: null, label_overrides: {} })),
  profiles: names.map((n) => ({ id: `${id}-${n}`, name: n, days: days() })),
});
const mode = (over: Record<string, unknown> = {}) =>
  ({ selector: "input_select.mode", default: "Home", active: "Winter", options: ["Home", "Winter"], available: true, ...over });

function card(data: Record<string, unknown>, lang = "en", view?: string) {
  const c = new WeeklyPlannerCard() as any;
  c.hass = { language: lang, config: { time_zone: "UTC" }, states: {}, services: {}, callWS: vi.fn(async () => ({})) };
  c._config = view ? { schedule_view: view } : {};
  c._data = { labels: [], status: {}, can_edit: true, read_only: false, vacation: false, programs: [], ...data };
  return c;
}

describe("global mode on the card", () => {
  const programs = [program("a", ["Home", "Winter"]), program("b", ["Home"], 2)];

  it("shows the active mode once, as plain text, above the programs", () => {
    const html = flat(card({ programs, mode: mode() }).render());
    expect(html.match(/Mode: Winter/g)).toHaveLength(1);
    expect(html).toContain('class="mode-line"');
    expect(html).not.toContain("<button class=\"mode-line");
  });
  it("shows it once in the list view too, and in French", () => {
    const html = flat(card({ programs, mode: mode() }, "fr", "list").render());
    expect(html.match(/Mode : Winter/g)).toHaveLength(1);
  });
  it("shows nothing without a selector, without options or without an active mode", () => {
    for (const m of [mode({ selector: null, active: null, options: [] }), mode({ options: [] }), mode({ active: null }), undefined]) {
      expect(flat(card({ programs, mode: m }).render())).not.toContain("mode-line");
    }
  });
  it("no longer writes a mode next to each program", () => {
    const html = flat(card({ programs, mode: mode() }).render());
    expect(html).not.toContain("mode-name");
  });
  it("says a program has no schedule for the mode, in both views and both languages", () => {
    const status = { a: { no_schedule_for_mode: true }, b: { no_schedule_for_mode: false } };
    const c = card({ programs, mode: mode(), status });
    const html = flat(c.render());
    expect(html.match(/No schedule for this mode/g)).toHaveLength(1);
    const list = flat(card({ programs, mode: mode(), status }, "fr", "list").render());
    expect(list.match(/Aucun horaire pour ce mode/g)).toHaveLength(1);
    const multi = card({ programs: [program("b", ["Home"], 2)], mode: mode(), status: { b: { no_schedule_for_mode: true } } });
    expect(flat(multi.render())).toContain("No schedule for this mode");
  });
  it("never calls the removed mode commands", () => {
    const c = card({ programs, mode: mode() });
    c.render();
    const sent = JSON.stringify(c.hass.callWS.mock.calls);
    expect(sent).not.toContain("set_profile");
    expect(sent).not.toContain("active_profile");
    expect(sent).not.toContain("mode_source");
  });
});

describe("schedules followed by a program", () => {
  const p = program("a", ["Home", "Winter"]) as any;
  it("follows the active mode by name, the first schedules without a mode", () => {
    expect(activeProfile(p, { mode: mode() } as any).id).toBe("a-Winter");
    expect(activeProfile(p, { mode: mode({ active: "Home" }) } as any).id).toBe("a-Home");
    expect(activeProfile(p, {} as any).id).toBe("a-Home");
    expect(activeProfile(p, { mode: mode({ selector: null, active: null }) } as any).id).toBe("a-Home");
  });
  it("is an empty week when the program has nothing for the mode", () => {
    const profile = activeProfile(p, { mode: mode({ active: "Away" }) } as any);
    expect(profile.id).toBe("");
    expect(profile.days).toHaveLength(7);
    expect(profile.days.every((d) => d.length === 0)).toBe(true);
  });
});

describe("one device at a time", () => {
  const three = program("t", ["Home"], 3);
  it("shows tabs and only the first device by default, nothing for one device", () => {
    const c = card({ programs: [three, program("s", ["Home"], 1)] });
    const html = flat(c.render());
    expect(html).toContain('role="tablist"');
    expect(html.match(/role="tab"/g)).toHaveLength(3);
    expect(html).toContain("Devices of P t");
    expect(html.match(/aria-selected=/g)).toHaveLength(3);
    expect(flat(c._deviceTabs(program("s", ["Home"], 1)))).toBe("");
    expect(c._shownDevice(three)).toBe("switch.t0");
  });
  it("keeps the choice per program through re-renders and snapshot updates, falls back when it disappears", () => {
    const c = card({ programs: [three] });
    c._pickDevice(three, "switch.t2");
    c.render();
    expect(c._shownDevice(three)).toBe("switch.t2");
    c._data = { ...c._data, programs: [{ ...three, revision: 2 }] };
    expect(c._shownDevice(c._data.programs[0])).toBe("switch.t2");
    const fewer = { ...three, entities: three.entities.slice(0, 2) };
    expect(c._shownDevice(fewer)).toBe("switch.t0");
  });
  it("selects with a click and the arrow keys (wrapping), Home and End", () => {
    const c = card({ programs: [three] });
    c.renderRoot = { querySelectorAll: () => [] };
    Object.defineProperty(c, "updateComplete", { value: Promise.resolve(true) });
    const tabs = c._deviceTabs(three);
    const keydown = (k: string) => { const ev = { key: k, preventDefault: vi.fn() }; flat(c._deviceTabs(three)); return (tabsHandler(c._deviceTabs(three)))(ev); };
    const tabsHandler = (t: any) => t.values.find((v: any) => typeof v === "function");
    expect(tabs).toBeTruthy();
    keydown("ArrowLeft"); expect(c._shownDevice(three)).toBe("switch.t2");
    keydown("ArrowRight"); expect(c._shownDevice(three)).toBe("switch.t0");
    keydown("End"); expect(c._shownDevice(three)).toBe("switch.t2");
    keydown("Home"); expect(c._shownDevice(three)).toBe("switch.t0");
    keydown("ArrowDown"); expect(c._shownDevice(three)).toBe("switch.t1");
    keydown("ArrowUp"); expect(c._shownDevice(three)).toBe("switch.t0");
    keydown("x"); expect(c._shownDevice(three)).toBe("switch.t0");
  });
  it("lists only the chosen device in the section and the list views", () => {
    const c = card({ programs: [three] });
    expect(flat(c._bySchedule([three])).match(/class="create"/g)).toHaveLength(1); // one device line, not three
    c._pickDevice(three, "switch.t1");
    c._expandedProgram = "t";
    const list = flat(c._compactList([three]));
    expect(list).toContain("mdi:check");
  });
});
