import { describe, expect, it } from "vitest";
import { mergeProgramSettings } from "../program-settings";
import type { Program } from "../types";

const program = (): Program => ({
  id: "p", revision: 1, name: "Office", priority: 10, enabled: true, reapply: true, conditions: [],
  entities: [{ entity_id: "climate.office", default_label: null, label_overrides: {}, allowed_services: [] }],
  profiles: [{ id: "winter", name: "Winter", days: [[], [], [], [], [], [], []] }],
});

describe("program settings saved against fresh data", () => {
  it("keeps schedules and enabled state changed while renaming a program", () => {
    const base = program(), draft = structuredClone(base), live = structuredClone(base);
    draft.name = "New name";
    live.revision++;
    live.enabled = false;
    live.profiles[0].days[0].push({ id: "s", start: { time: "08:00" }, label: "comfort", conditions: [] });
    const out = mergeProgramSettings(base, draft, live);
    expect(out.name).toBe("New name");
    expect(out.enabled).toBe(false);
    expect(out.profiles).toEqual(live.profiles);
    expect(out.revision).toBe(2);
  });
  it("renames a profile without losing a concurrent schedule edit", () => {
    const base = program(), draft = structuredClone(base), live = structuredClone(base);
    draft.profiles[0].name = "Summer";
    live.profiles[0].days[1].push({ id: "s", start: { time: "09:00" }, label: "eco", conditions: [] });
    const out = mergeProgramSettings(base, draft, live);
    expect(out.profiles[0].name).toBe("Summer");
    expect(out.profiles[0].days).toEqual(live.profiles[0].days);
  });
  it("preserves per-device defaults while changing offered actions", () => {
    const base = program(), draft = structuredClone(base), live = structuredClone(base);
    draft.entities[0].allowed_services = ["climate.set_temperature"];
    live.entities[0].default_label = "eco";
    expect(mergeProgramSettings(base, draft, live).entities[0]).toMatchObject({ default_label: "eco", allowed_services: ["climate.set_temperature"] });
  });
  it("rejects conflicting changes to the same setting", () => {
    const base = program();
    expect(() => mergeProgramSettings(base, { ...base, name: "Mine" }, { ...base, name: "Theirs" })).toThrow("settings_conflict");
  });
  it("refuses deleting a profile whose schedules changed remotely", () => {
    const base = program(), draft = structuredClone(base), live = structuredClone(base);
    draft.profiles = [];
    live.profiles[0].name = "Updated";
    expect(() => mergeProgramSettings(base, draft, live)).toThrow("settings_conflict");
  });
  it("preserves a concurrently added device", () => {
    const base = program(), draft = structuredClone(base), live = structuredClone(base);
    draft.entities[0].allowed_services = ["climate.turn_off"];
    live.entities.push({ entity_id: "climate.bedroom", default_label: null, label_overrides: {} });
    expect(mergeProgramSettings(base, draft, live).entities).toHaveLength(2);
  });
});
