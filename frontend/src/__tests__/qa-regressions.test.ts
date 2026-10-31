import { afterEach, expect, it, vi } from "vitest";
import { WpBarEditor } from "../components/bar-editor";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { clearPreviewCache } from "../preview-cache";
import { localDateIso, formatWhen } from "../time";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const makeProgram = () => ({ id: "qa-program", revision: 1, name: "QA", priority: 10, enabled: true,
  entities: [], active_profile: "a", profiles: ["a", "b"].map((id) => ({ id, name: id,
    days: [[{ id, start: { time: id === "a" ? "08:00" : "18:00" }, end: { time: "23:00" }, label: "l" }], [], [], [], [], [], []] })) });

it("undo retains the original mode after the active mode changes", async () => {
  vi.stubGlobal("window", { clearTimeout: vi.fn(), setTimeout: vi.fn(() => 0) });
  const bar = new WpBarEditor() as any;
  let program = makeProgram();
  bar.program = program;
  bar.data = { programs: [program], status: { [program.id]: { active_profile: "a" } }, labels: [] };
  bar.entityId = "switch.demo"; bar.weekday = 0;
  bar.hass = { states: {}, services: {}, callWS: async (message: any) => {
    program = { ...structuredClone(message.program), revision: message.program.revision + 1 };
    bar.program = program; return { program };
  } };
  let undo!: () => Promise<boolean>;
  bar._emit = (_: string, detail: any) => { undo = detail.undo; };
  await bar._commit((days: any[]) => days.map((day, i) => i ? day : [{ ...day[0], start: { time: "09:00" } }]), [0]);
  bar.data.status[program.id].active_profile = "b";
  await undo();
  expect(program.profiles[0].days[0][0].start.time).toBe("08:00");
  expect(program.profiles[1].days[0][0].start.time).toBe("18:00");
});

it("recalculates preview for runtime mode changes and recovers a failed load", async () => {
  const card = new WeeklyPlannerCard() as any;
  const program = makeProgram();
  card.hass = { config: { time_zone: "UTC" }, callWS: vi.fn().mockResolvedValue({ slots: [] }) };
  card._config = { program: program.id };
  card._data = { programs: [program], labels: [], status: { [program.id]: { active_profile: "a" } } };
  card._now = new Date("2026-01-02T12:00:00Z");
  await card._loadPreviews();
  expect(card.hass.callWS.mock.calls.map(([message]: any[]) => message.date)).toEqual([
    "2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08",
  ]);
  await card._loadPreviews();
  expect(card.hass.callWS).toHaveBeenCalledTimes(8);
  card._data.status[program.id].active_profile = "b";
  await card._loadPreviews();
  expect(card.hass.callWS).toHaveBeenCalledTimes(16);
  card._previewKey = "";
  clearPreviewCache(); // the shared cache would otherwise answer from the mode already loaded
  card.hass.callWS.mockRejectedValueOnce(new Error("offline"));
  await card._loadPreviews();
  await card._loadPreviews();
  expect(card.hass.callWS).toHaveBeenCalledTimes(24);
  vi.spyOn(Date, "now").mockReturnValue(Date.now() + 6000);
  await card._loadPreviews();
  expect(card.hass.callWS).toHaveBeenCalledTimes(25); // only the failed day is asked again: the 7 others are cached
});

it("builds seven distinct civil dates during a 25-hour day", () => {
  const card = new WeeklyPlannerCard() as any;
  card.hass = { config: { time_zone: "Europe/Brussels" } };
  card._now = new Date("2026-10-24T22:30:00Z");
  const dates = Array.from({ length: 7 }, (_, i) => localDateIso(card._dateAt(i), "Europe/Brussels"));
  expect(dates).toEqual(["2026-10-25", "2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31"]);
  expect(formatWhen("2026-10-26T08:00:00Z", "Europe/Brussels", "en", card._now)).toContain("tomorrow");
});

function gestureBar(id: string) {
  vi.stubGlobal("window", { clearTimeout: vi.fn(), setTimeout: vi.fn(() => 0) });
  const bar = new WpBarEditor() as any;
  let program = { ...makeProgram(), id };
  bar.program = program;
  bar.data = { programs: [program], status: { [id]: { active_profile: "a" } }, labels: [] };
  bar.entityId = "switch.demo"; bar.weekday = 0;
  bar._emit = vi.fn();
  bar.hass = { states: {}, services: {}, callWS: vi.fn(async (message: any) => {
    program = { ...structuredClone(message.program), revision: message.program.revision + 1 };
    bar.program = program; return { program };
  }) };
  return { bar, result: () => program, switchMode: () => { bar.data.status[id].active_profile = "b"; } };
}

it("keeps a keyboard gesture in its starting mode until its delayed commit", async () => {
  const { bar, result, switchMode } = gestureBar("qa-nudge-origin");
  bar._key({ key: "ArrowRight", preventDefault: vi.fn() }, { id: "a", edge: "start" });
  switchMode();
  bar._flushNudge();
  await Promise.resolve();
  expect(result().profiles[0].days[0][0].start.time).toBe("08:15");
  expect(result().profiles[1].days[0][0].start.time).toBe("18:00");
});

it("keeps a pointer drag in its starting mode when another mode activates before release", async () => {
  const { bar, result, switchMode } = gestureBar("qa-drag-origin");
  bar._minuteAt = (x: number) => ({ m: x, ppm: 1 });
  bar._nearest = () => ({ m: 480, refs: [{ id: "a", edge: "start" }] });
  bar._ovDown({ button: 0, clientX: 480, pointerId: 1, currentTarget: {}, preventDefault: vi.fn() });
  switchMode();
  bar._ovMove({ clientX: 495, pointerId: 1 });
  bar._ovUp({ pointerId: 1 });
  await Promise.resolve();
  expect(result().profiles[0].days[0][0].start.time).toBe("08:15");
  expect(result().profiles[1].days[0][0].start.time).toBe("18:00");
});
