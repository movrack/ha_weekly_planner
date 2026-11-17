import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpBarEditor } from "../components/bar-editor";
import { t } from "../i18n";

const slot = (id = "a", start = "06:00", end = "12:00"): any => ({ id, label: "l", start: { time: start }, end: { time: end } });
let serial = 0;
function editor(slots = [slot()]): any {
  const el: any = new WpBarEditor();
  el.hass = { states: {}, services: { cover: { open_cover: {} } }, config: { time_zone: "UTC" } };
  el.program = { id: `codex-bar-${++serial}`, revision: 1, entities: [{ entity_id: "cover.a", default_label: "l", label_overrides: {} }], profiles: [{ id: "h", name: "Home", days: [slots, [], [], [], [], [], []] }] };
  el.data = { programs: [el.program], labels: [{ id: "l", name: "Open", color: "#00ff00", action: { kind: "service", service: "cover.open_cover" } }], status: {} };
  el.entityId = "cover.a";
  el.editing = true;
  const overlay = { getBoundingClientRect: () => ({ left: 100, top: 50, width: 320, height: 20 }), setPointerCapture: vi.fn() };
  Object.defineProperty(el, "renderRoot", { value: { querySelector: () => overlay }, configurable: true });
  return el;
}
const pointer = (x: number, y: number, id = 7): any => ({ button: 0, pointerId: id, clientX: x, clientY: y, currentTarget: { setPointerCapture: vi.fn() }, preventDefault: vi.fn() });
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("window", { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout });
  vi.stubGlobal("navigator", { vibrate: vi.fn() });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const changed = (days: any[][]) => days.map((day, i) => i === 0 ? day.map(s => ({ ...s, end: { time: "13:00" } })) : day);

describe("save outcomes", () => {
  it("does not save a missing mode, refused operation or unchanged schedule", async () => {
    const el = editor(); el.hass.callWS = vi.fn();
    el._draft = [slot()]; el._awaitRev = 9;
    expect(await el._commit(changed, [0], false, "gone")).toBe(false);
    expect([el._draft, el._awaitRev]).toEqual([null, null]);
    el._draft = [slot()];
    expect(await el._commit(() => null, [0])).toBe(false);
    expect(el._draft).toBeNull();
    el._draft = [slot()];
    expect(await el._commit((days: any) => days, [0])).toBe(true);
    expect(el._draft).toBeNull();
    expect(el.hass.callWS).not.toHaveBeenCalled();
  });
  it("retains the successful draft until the pushed revision or the 2500 ms deadline", async () => {
    const el = editor();
    el.dispatchEvent = vi.fn();
    el.hass.callWS = vi.fn(async ({ program }: any) => ({ program: { ...program, revision: 2 } }));
    expect(await el._commit(changed, [0])).toBe(true);
    expect(el.hass.callWS.mock.calls[0][0]).toMatchObject({ type: "weekly_planner/program/save", program: { revision: 1 } });
    expect(el._awaitRev).toBe(2);
    expect(el._draft[0].end).toEqual({ time: "13:00" });
    expect(el._live.revision).toBe(2);
    expect(el.dispatchEvent.mock.calls[0][0]).toMatchObject({ type: "edited", bubbles: true, composed: true });
    vi.advanceTimersByTime(2499);
    expect(el._draft).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect([el._draft, el._awaitRev]).toEqual([null, null]);
    const before = el.program;
    el.program = { ...el.program, revision: 2 };
    expect(el._live).toBe(el.program);
    el.program = before;
    expect(el._live.revision).toBe(2);
  });
  it("drops a draft immediately when the server revision is already visible or absent", async () => {
    for (const response of ["same", "older", "missing", "undefined"]) {
      const el = editor(); el.dispatchEvent = vi.fn();
      el.hass.callWS = vi.fn(async ({ program }: any) => response === "undefined" ? undefined : response === "missing" ? {} : { program: { ...program, revision: response === "same" ? 1 : 0 } });
      expect(await el._commit(changed, [0], true)).toBe(true);
      expect([el._draft, el._awaitRev]).toEqual([null, null]);
      expect(el.dispatchEvent).not.toHaveBeenCalled();
    }
  });
  it("retries one conflict on fresh data, preserving another mode and concurrent slots", async () => {
    const el = editor();
    const other = { id: "other", name: "Other", days: [[], [], [], [], [], [], []] };
    el.program.profiles.push(other);
    const fresh = { ...el.program, revision: 5, profiles: [{ ...el.program.profiles[0], days: [[slot(), slot("concurrent", "16:00", "17:00")], [], [], [], [], [], []] }, other] };
    el.hass.callWS = vi.fn().mockRejectedValueOnce({ code: "conflict" }).mockResolvedValueOnce({ programs: [fresh] }).mockImplementationOnce(async ({ program }: any) => ({ program: { ...program, revision: 6 } }));
    expect(await el._commit(changed, [0])).toBe(true);
    expect(el.hass.callWS).toHaveBeenCalledTimes(3);
    expect(el.hass.callWS.mock.calls[1][0]).toEqual({ type: "weekly_planner/get" });
    const saved = el.hass.callWS.mock.calls[2][0].program;
    expect(saved.revision).toBe(5);
    expect(saved.profiles[0].days[0].map((s: any) => s.id)).toEqual(["a", "concurrent"]);
    expect(saved.profiles[1]).toEqual(other);
    expect(el._live.revision).toBe(6);
  });
  it("stops after the second conflict instead of fetching indefinitely", async () => {
    const el = editor();
    el.hass.callWS = vi.fn().mockRejectedValueOnce({ code: "conflict" }).mockResolvedValueOnce({ programs: [el.program] }).mockRejectedValue({ code: "conflict" });
    expect(await el._commit(changed, [0])).toBe(false);
    expect(el.hass.callWS).toHaveBeenCalledTimes(3);
    expect(el._error).toBe(t("en", "ss_err_save"));
    expect(el._draft).toBeNull();
  });
  it("reports failure if a refresh fails or no longer contains the program", async () => {
    for (const missing of [true, false]) {
      const el = editor();
      el.hass.callWS = vi.fn().mockRejectedValueOnce({ code: "conflict" });
      if (missing) el.hass.callWS.mockResolvedValueOnce({ programs: [{ ...el.program, id: "other" }] });
      else el.hass.callWS.mockRejectedValueOnce(new Error("Offline"));
      expect(await el._commit(changed, [0])).toBe(false);
      expect(el.hass.callWS).toHaveBeenCalledTimes(2);
      expect(el._error).toBe(t("en", "ss_err_save"));
    }
  });
  it.each([
    [{ code: "unauthorized" }, "err_unauthorized"],
    [{ message: "overlapping_slots" }, "w_err_overlap"],
    [{ code: "invalid" }, "ss_err_save"],
    [undefined, "ss_err_save"],
  ])("reports the appropriate error without retry for %j", async (error, key) => {
    const el = editor(); el.hass.callWS = vi.fn().mockRejectedValue(error);
    expect(await el._commit(changed, [0])).toBe(false);
    expect(el.hass.callWS).toHaveBeenCalledOnce();
    expect(el._error).toBe(t("en", key as any));
    expect(el._draft).toBeNull();
  });
  it("undo restores only the edited slots and emits no second undo notification", async () => {
    const el = editor([slot("later", "16:00", "17:00"), slot()]);
    el.dispatchEvent = vi.fn();
    let rev = 1;
    el.hass.callWS = vi.fn(async ({ program }: any) => ({ program: { ...program, revision: ++rev } }));
    expect(await el._commit((days: any[][]) => days.map((day, i) => i === 0 ? day.filter(s => s.id !== "a") : day), [0])).toBe(true);
    const undo = el.dispatchEvent.mock.calls[0][0].detail.undo;
    expect(await undo()).toBe(true);
    const saved = el.hass.callWS.mock.calls[1][0].program;
    expect(saved.profiles[0].days[0].map((s: any) => s.id)).toEqual(["a", "later"]);
    expect(el.dispatchEvent).toHaveBeenCalledOnce();
  });
});
