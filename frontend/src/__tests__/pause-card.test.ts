import { beforeEach, describe, expect, it, vi } from "vitest";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { pauseChoice } from "../components/confirm";
import { formatPauseEnd, pauseEnd } from "../time";
import { flat } from "./helpers/tpl";

vi.mock("../components/confirm", () => ({ confirmAction: vi.fn(async () => true), pauseChoice: vi.fn() }));

const program = (over: Record<string, unknown> = {}) => ({
  id: "p", name: "Office", revision: 1, priority: 10, enabled: true, reapply: true, conditions: [],
  entities: [{ entity_id: "switch.a", default_label: null, label_overrides: {} }],
  profiles: [{ id: "a", name: "A", days: [[], [], [], [], [], [], []] }], ...over,
});

function card(programs: any[]) {
  const c = new WeeklyPlannerCard() as any;
  c.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, services: {}, callWS: vi.fn(async () => ({})) };
  c._config = {};
  c._data = { programs, labels: [], status: {}, can_edit: true, read_only: false };
  return c;
}

beforeEach(() => vi.mocked(pauseChoice).mockReset());

describe("timed pause (card)", () => {
  it("sends the chosen number of days, or a plain stop for no limit", async () => {
    const c = card([program()]);
    vi.mocked(pauseChoice).mockResolvedValueOnce(14);
    await c._toggleProgram(c._data.programs[0]);
    expect(c.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/program/pause", program_id: "p", days: 14 });
    vi.mocked(pauseChoice).mockResolvedValueOnce("none");
    await c._toggleProgram(c._data.programs[0]);
    expect(c.hass.callWS).toHaveBeenLastCalledWith({ type: "weekly_planner/program/set_enabled", program_id: "p", enabled: false });
  });
  it("does nothing when the choice is cancelled", async () => {
    const c = card([program()]);
    vi.mocked(pauseChoice).mockResolvedValueOnce(null);
    await c._toggleProgram(c._data.programs[0]);
    expect(c.hass.callWS).not.toHaveBeenCalled();
    expect(c._toggling.size).toBe(0);
  });
  it("resumes a paused program without asking", async () => {
    const c = card([program({ enabled: false, paused_until: "2026-11-09T21:30:00+00:00" })]);
    await c._toggleProgram(c._data.programs[0]);
    expect(pauseChoice).not.toHaveBeenCalled();
    expect(c.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/program/set_enabled", program_id: "p", enabled: true });
  });
  it("shows the end of the pause, or the plain stop text", () => {
    const paused = card([program({ enabled: false, paused_until: "2026-11-09T21:30:00+00:00" })]);
    expect(flat(paused._compactList(paused._data.programs))).toContain("Paused until Mon,\u00a0Nov\u00a09,\u00a09:30\u00a0pm");
    const stopped = card([program({ enabled: false })]);
    const out = flat(stopped._compactList(stopped._data.programs));
    expect(out).toContain("Disabled"); expect(out).not.toContain("Paused until");
  });
  it("formats the end in French and picks the earliest end", () => {
    expect(formatPauseEnd("2026-11-09T21:30:00+00:00", "Europe/Paris", "fr")).toBe("lun. 9 nov., 22 h 30");
    expect(pauseEnd([{ enabled: false, paused_until: "2026-11-10T00:00:00+00:00" }, { enabled: false, paused_until: "2026-11-09T00:00:00+00:00" }, { enabled: true }]))
      .toBe("2026-11-09T00:00:00+00:00");
    expect(pauseEnd([{ enabled: true, paused_until: "2026-11-10T00:00:00+00:00" }])).toBeNull();
  });
});
