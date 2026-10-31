import { beforeEach, describe, expect, it, vi } from "vitest";
import { WpSchedule } from "../components/schedule-dialog";
import { confirmAction } from "../components/confirm";
import type { Program } from "../types";

vi.mock("../components/confirm", () => ({ confirmAction: vi.fn() }));

const templateText = (value: any): string => typeof value === "string" ? value
  : Array.isArray(value) ? value.map(templateText).join(" ") : value?.values ? templateText(value.values) : "";

function setup(focusedDay: number | null = null) {
  const slot = { id: "monday", start: { time: "08:00" }, end: { time: "10:00" }, label: "comfort" };
  const days = () => Array.from({ length: 7 }, () => [] as typeof slot[]);
  const program: Program = {
    id: "p", name: "Office", revision: 1, priority: 10, enabled: true, reapply: true,
    conditions: [], entities: [{ entity_id: "switch.demo", default_label: null, label_overrides: {} }], active_profile: "home",
    profiles: [{ id: "home", name: "Home", days: days() }, { id: "away", name: "Away", days: days() }],
  };
  program.profiles[0].days[0] = [slot];
  program.profiles[0].days[1] = [{ ...slot, id: "tuesday" }];
  program.profiles[1].days[0] = [{ ...slot, id: "away-monday" }];
  const view = new WpSchedule() as any;
  view.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, callWS: vi.fn(async (message) => ({ program: message.program })) };
  view.dispatchEvent = vi.fn();
  view.scope = { kind: "program", programId: program.id };
  view.data = { programs: [program], status: {}, can_edit: true, read_only: false, labels: [] };
  view._focus = focusedDay;
  const row = view._rows()[0];
  view._openRow(row.key, program, row.group);
  return { view, program, key: row.key };
}

beforeEach(() => {
  vi.mocked(confirmAction).mockReset();
  vi.mocked(confirmAction).mockResolvedValue(true);
});

describe("delete an edited schedule slot", () => {
  it("keeps Delete visible while the slot has a pending label draft", () => {
    const { view, program, key } = setup();
    view._labelDraft = { problem: "Unsaved label" };
    expect(templateText(view._renderEditor(program, key))).toContain("Delete");
    expect(templateText(view._renderEditor(program, "new"))).toContain("Delete");
  });

  it("deletes a new unsaved slot by discarding its draft without a server write", async () => {
    const { view } = setup();
    view._open = "new";
    view._openId = null;
    view._labelDraft = { problem: "Unsaved label" };
    await view._deleteRow();
    expect(confirmAction).not.toHaveBeenCalled();
    expect(view.hass.callWS).not.toHaveBeenCalled();
    expect(view._open).toBeNull();
    expect(view._group).toBeNull();
    expect(view._labelDraft).toBeNull();
  });

  it("deletes only the focused day and original mode without saving the label draft", async () => {
    const { view, program } = setup(0);
    view._labelDraft = { problem: "Invalid label draft" };
    view.data.status.p = { active_profile: "away" };
    await view._deleteRow();
    expect(confirmAction).toHaveBeenCalledOnce();
    expect(view.hass.callWS).toHaveBeenCalledOnce();
    const message = view.hass.callWS.mock.calls[0][0];
    expect(message.type).toBe("weekly_planner/program/save");
    expect(message.program.profiles[0].days[0]).toEqual([]);
    expect(message.program.profiles[0].days[1]).toEqual(program.profiles[0].days[1]);
    expect(message.program.profiles[1]).toEqual(program.profiles[1]);
    expect(view._labelDraft).toBeNull();
  });

  it("preserves the edit and draft when deletion confirmation is cancelled", async () => {
    const { view } = setup();
    const draft = { problem: "Unsaved label" };
    view._labelDraft = draft;
    vi.mocked(confirmAction).mockResolvedValue(false);
    await view._deleteRow();
    expect(view.hass.callWS).not.toHaveBeenCalled();
    expect(view._labelDraft).toBe(draft);
    expect(view._openId).not.toBeNull();
  });

  it("cannot delete while a save is in progress or editing is forbidden", async () => {
    const { view } = setup();
    view._saving = true;
    await view._deleteRow();
    view._saving = false;
    view.data.can_edit = false;
    await view._deleteRow();
    expect(confirmAction).not.toHaveBeenCalled();
    expect(view.hass.callWS).not.toHaveBeenCalled();
  });
});

describe("duplicate a solar slot", () => {
  it("never produces a sun offset beyond the server limit", () => {
    const { view } = setup();
    view._group.slot.start = { sun: "sunrise", offset: 0 };
    view._group.slot.end = { time: "23:00" };
    view._problem = () => "";
    view._duplicate();
    const { start, end } = view._group.slot;
    expect("time" in start).toBe(true);
    expect(end && "time" in end).toBe(true);
  });

  it("keeps the sun event when the shifted offset stays in range", () => {
    const { view } = setup();
    view._group.slot.start = { sun: "sunset", offset: 0 };
    view._group.slot.end = { sun: "dusk", offset: 0 };
    view._problem = () => "";
    view._duplicate();
    expect(view._group.slot.start).toMatchObject({ sun: "sunset" });
  });

  it("shows a specific message for range errors", async () => {
    const { view, program } = setup();
    view.hass.callWS = vi.fn(async () => { throw { message: "value must be at most 240 for dictionary value @ offset" }; });
    await view._saveProgram(program);
    expect(view._error).toBe("A time is out of range. Shorten the delay or pick a time.");
  });
});
