import { afterEach, expect, it, vi } from "vitest";
import { WpBarEditor } from "../components/bar-editor";

// A gesture or an undo belongs to the mode that was active when it started, even if the mode changes meanwhile.
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const makeProgram = () => ({ id: "qa-program", revision: 1, name: "QA", priority: 10, enabled: true,
  entities: [], profiles: ["a", "b"].map((id) => ({ id, name: id,
    days: [[{ id, start: { time: id === "a" ? "08:00" : "18:00" }, end: { time: "23:00" }, label: "l" }], [], [], [], [], [], []] })) });

it("an undo restores the mode the edit was made in, even after the active mode changed", async () => {
  vi.stubGlobal("window", { clearTimeout: vi.fn(), setTimeout: vi.fn(() => 0) });
  const bar = new WpBarEditor() as any;
  let program = makeProgram();
  bar.program = program;
  bar.data = { programs: [program], status: {}, mode: { selector: "input_select.m", default: "a", active: "a", options: ["a", "b"], available: true }, labels: [] };
  bar.entityId = "switch.demo"; bar.weekday = 0;
  bar.hass = { states: {}, services: {}, callWS: async (message: any) => {
    program = { ...structuredClone(message.program), revision: message.program.revision + 1 };
    bar.program = program; return { program };
  } };
  let undo!: () => Promise<boolean>;
  bar._emit = (_: string, detail: any) => { undo = detail.undo; };
  await bar._commit((days: any[]) => days.map((day, i) => i ? day : [{ ...day[0], start: { time: "09:00" } }]), [0]);
  bar.data.mode.active = "b";
  await undo();
  expect(program.profiles[0].days[0][0].start.time).toBe("08:00");
  expect(program.profiles[1].days[0][0].start.time).toBe("18:00");
});


function gestureBar(id: string) {
  vi.stubGlobal("window", { clearTimeout: vi.fn(), setTimeout: vi.fn(() => 0) });
  const bar = new WpBarEditor() as any;
  let program = { ...makeProgram(), id };
  bar.program = program;
  bar.data = { programs: [program], status: {}, mode: { selector: "input_select.m", default: "a", active: "a", options: ["a", "b"], available: true }, labels: [] };
  bar.entityId = "switch.demo"; bar.weekday = 0;
  bar._emit = vi.fn();
  bar.hass = { states: {}, services: {}, callWS: vi.fn(async (message: any) => {
    program = { ...structuredClone(message.program), revision: message.program.revision + 1 };
    bar.program = program; return { program };
  }) };
  return { bar, result: () => program, switchMode: () => { bar.data.mode.active = "b"; } };
}

it("a keyboard nudge stays in the mode it started in until its delayed commit", async () => {
  const { bar, result, switchMode } = gestureBar("qa-nudge-origin");
  bar._key({ key: "ArrowRight", preventDefault: vi.fn() }, { id: "a", edge: "start" });
  switchMode();
  bar._flushNudge();
  await Promise.resolve();
  expect(result().profiles[0].days[0][0].start.time).toBe("08:15");
  expect(result().profiles[1].days[0][0].start.time).toBe("18:00");
});

it("a pointer drag stays in the mode it started in when another mode activates before release", async () => {
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
