import { describe, expect, it, vi } from "vitest";
import { WpSchedule } from "../components/schedule-dialog";
import type { PlannerData, Program } from "../types";

const program = (): Program => ({
  id: "p", revision: 1, name: "Office", priority: 10, enabled: true, reapply: true, conditions: [], entities: [],
  active_profile: "day",
  profiles: ["day", "night"].map((id) => ({ id, name: id, days: [[], [], [], [], [], [], []] })),
});

// Exercise the component's save boundary without a browser or layout dependencies.
const screen = () => {
  const p = program();
  const view = new WpSchedule() as any;
  view.scope = { kind: "program", programId: p.id };
  view.data = { programs: [p], status: {}, labels: [] } as unknown as PlannerData;
  view.hass = { language: "en", config: { time_zone: "UTC" }, callWS: vi.fn() };
  return { view, p };
};

describe("schedule mode isolation", () => {
  it("selects a mode without changing the active mode", () => {
    const { view, p } = screen();
    view._viewProfileId = "night";
    expect(view._modeProfile(p).id).toBe("night");
    expect(p.active_profile).toBe("day");
    expect(view._modeOnly).toBe(true);
  });

  it("keeps the row's captured mode when the active mode changes", () => {
    const { view, p } = screen();
    view._open = "new";
    view._programId = p.id;
    view._editProfileId = "day";
    view.data.status[p.id] = { active_profile: "night" };
    expect(view._modeProfile(p).id).toBe("day");
    expect(view._editProfile(p).id).toBe("day");
  });

  it("refuses saving a remotely deleted mode without writing labels or a program", async () => {
    const { view, p } = screen();
    view._programId = p.id;
    view._editProfileId = "night";
    p.profiles = p.profiles.filter((profile) => profile.id !== "night");
    await view._saveRow();
    expect(view.hass.callWS).not.toHaveBeenCalled();
    expect(view._error).toBeTruthy();
  });
});
