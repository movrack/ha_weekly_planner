import { describe, expect, it, vi } from "vitest";
import { WpSchedule } from "../components/schedule-dialog";
import type { Program } from "../types";

function setup(lang = "en", start: any = { time: "08:00" }, end: any = { time: "10:00" }) {
  const slot = { id: "a", start, end, label: "comfort" };
  const days = () => Array.from({ length: 7 }, () => [] as any[]);
  const program: Program = {
    id: "p", name: "Office", revision: 1, priority: 10, enabled: true, reapply: true,
    conditions: [], entities: [{ entity_id: "switch.demo", default_label: null, label_overrides: {} }], active_profile: "home",
    profiles: [{ id: "home", name: "Home", days: days() }],
  };
  program.profiles[0].days[0] = [slot];
  const view = new WpSchedule() as any;
  view.hass = { language: lang, config: { time_zone: "UTC" }, states: {}, callWS: vi.fn(async (m) => ({ program: m.program })) };
  view.dispatchEvent = vi.fn();
  view.scope = { kind: "program", programId: program.id };
  view.data = { programs: [program], status: {}, can_edit: true, read_only: false, labels: [{ id: "comfort", name: "Comfort", color: "#f00" }, { id: "eco", name: "Eco", color: "#0f0" }] };
  return { view, program };
}

describe("precise overlap message", () => {
  it("names the day, both slots and their times (en)", () => {
    const { view, program } = setup();
    const profile = structuredClone(program.profiles[0]);
    profile.days[0].push({ id: "b", start: { time: "09:00" }, end: { time: "11:00" }, label: "eco" });
    const text = view._overlapText(profile);
    expect(text).toContain("Mon");
    expect(text).toContain("Comfort");
    expect(text).toContain("Eco");
    expect(text).toMatch(/8\sam/);
    expect(text).toMatch(/11\sam/);
  });
  it("is in French too", () => {
    const { view, program } = setup("fr");
    const profile = structuredClone(program.profiles[0]);
    profile.days[0].push({ id: "b", start: { time: "09:00" }, end: { time: "11:00" }, label: "eco" });
    expect(view._overlapText(profile)).toContain("chevauche");
  });
  it("falls back to the generic sentence when nothing overlaps", () => {
    const { view, program } = setup();
    expect(view._overlapText(program.profiles[0])).toBe("Two schedules overlap.");
  });
});

describe("duplicate a long solar slot", () => {
  it("never produces an offset beyond 240 or an empty copy", () => {
    const { view, program } = setup("en", { sun: "sunset", offset: 0 }, { time: "23:00" });
    view.hass.states["sun.sun"] = { attributes: { next_setting: "2026-01-05T17:50:00+00:00" } };
    const row = view._rows()[0];
    view._openRow(row.key, program, row.group);
    view._duplicate();
    const { start, end } = view._group.slot;
    for (const spec of [start, end]) if ("offset" in spec) expect(Math.abs(spec.offset)).toBeLessThanOrEqual(240);
    expect(end).toEqual({ time: "24:00" });
    expect(start).toEqual({ time: "23:00" });
  });
});
