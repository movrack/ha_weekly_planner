import { afterEach, describe, expect, it, vi } from "vitest";
import { WpProgramEditor } from "../editors/program-editor";
import type { Program } from "../types";

const program = (): Program => ({ id: "p", revision: 1, name: "Office", priority: 10, enabled: true, reapply: true,
  conditions: [], entities: [{ entity_id: "light.office", default_label: null, label_overrides: {} }], active_profile: "home",
  profiles: ["home", "vacation"].map((id) => ({ id, name: id, days: [[], [], [], [], [], [], []] })),
  mode_source: { entity_id: "input_select.house", mappings: { Home: "home", Vacation: "vacation" } },
});
const editor = () => {
  vi.stubGlobal("customElements", { get: () => undefined });
  const e = new WpProgramEditor() as any;
  e._p = program(); e._origin = structuredClone(e._p); e._isNew = false; e._profileId = "home";
  e.data = { programs: [e._p], status: { p: { active_profile: "home" } }, labels: [], can_edit: true, read_only: false };
  e.hass = { language: "en", states: {}, callWS: vi.fn().mockResolvedValue({}) };
  return e;
};
afterEach(() => vi.unstubAllGlobals());

describe("program mode drafts", () => {
  it("remaps external source references when duplicating a program", () => {
    const e = editor();
    e._duplicate();
    const ids = e._p.profiles.map((p: { id: string }) => p.id);
    expect(ids).not.toContain("home");
    expect(ids).not.toContain("vacation");
    expect(Object.values(e._p.mode_source.mappings)).toEqual(ids);
    expect(e._p.mode_source.entity_id).toBe("input_select.house");
  });
  it("refuses incomplete associations before saving and detects duplicate states", () => {
    const e = editor();
    e._p.mode_source.mappings[""] = "home";
    expect(e._validate()).toBeTruthy();
    e._sourceState("", "Home");
    expect(e._error).toBeTruthy();
    expect(e._p.mode_source.mappings[""]).toBe("home");
  });
  it("does not send a manual activation while external control is configured", async () => {
    const e = editor();
    await e._changeActiveMode("vacation");
    expect(e.hass.callWS).not.toHaveBeenCalled();
  });
  it("adopts saved mode hours without dropping draft settings or accepting a stale push", () => {
    const e = editor();
    const saved = structuredClone(e._p);
    saved.revision = 2;
    saved.profiles[0].days[0] = [{ id: "slot", label: "comfort", start: { time: "08:00" }, end: { time: "10:00" } }];
    e._p.priority = 20;
    e._adoptModeSchedule(saved);
    expect(e._p.priority).toBe(20);
    expect(e._origin.priority).toBe(10);
    expect(e._p.profiles[0].days[0]).toHaveLength(1);
    expect(e._origin.profiles[0].days[0]).toHaveLength(1);
    e._closeModeSchedule(); // pushed data still has revision 1
    expect(e._p.profiles[0].days[0]).toHaveLength(1);
  });

});
