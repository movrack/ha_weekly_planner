import { describe, expect, it, vi } from "vitest";
import { t } from "../i18n";
import { flat, handlers } from "./helpers/tpl";
import { A, editor, mk, slot, useBarEditorGlobals } from "./helpers/bar-editor";

useBarEditorGlobals();

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

describe("save details", () => {
  it("a save error identifies the conflicting device by friendly name or raw id", async () => {
    for (const known of [true, false]) {
      const el = editor();
      el.hass.states = known ? { "cover.a": { attributes: { friendly_name: "Kitchen" } } } : {};
      el.hass.callWS = vi.fn().mockRejectedValue({ message: "overlapping_slots:cover.a" });
      expect(await el._commit((days: any[][]) => days.map((day, i) => i === 0 ? [] : day), [0])).toBe(false);
      expect(el._error).toContain(known ? "Kitchen" : "cover.a");
    }
  });
  it("an overlapping save never merges slots of an untargeted day", async () => {
    const el = editor();
    const adjacent = [slot("left", "00:00", "06:00"), slot("right", "06:00", "12:00")];
    el.hass.callWS = vi.fn(async () => ({}));
    expect(await el._commit((days: any[][]) => days.map((day, i) => i === 0 ? [] : i === 1 ? adjacent : day), [0], true)).toBe(true);
    expect(el.hass.callWS.mock.calls[0][0].program.profiles[0].days[1]).toEqual(adjacent);
  });
  it("a second successful edit resets the draft-expiry timer", async () => {
    const el = editor(); let revision = 1;
    el.hass.callWS = vi.fn(async ({ program }: any) => ({ program: { ...program, revision: ++revision } }));
    const setEnd = (time: string) => (days: any[][]) => days.map((day, i) => i === 0 ? day.map(s => ({ ...s, end: { time } })) : day);
    await el._commit(setEnd("13:00"), [0], true);
    vi.advanceTimersByTime(1000);
    await el._commit(setEnd("14:00"), [0], true);
    vi.advanceTimersByTime(1500);
    expect(el._draft[0].end).toEqual({ time: "14:00" });
    expect(el._awaitRev).toBe(3);
    vi.advanceTimersByTime(999);
    expect(el._draft).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(el._draft).toBeNull();
  });
});

describe("choosing between one device and all", () => {
  it("shared-device choices name the affected devices and invoke their own action", () => {
    const el = editor();
    el.program.entities.push({ entity_id: "cover.b" }, { entity_id: "cover.c" });
    el.hass.states = { "cover.a": { attributes: { friendly_name: "Kitchen" } }, "cover.b": { attributes: { friendly_name: "Hall" } } };
    el._ask = { count: 2, others: ["cover.b"] }; el._answer = vi.fn(); el._askCancel = vi.fn();
    expect(flat(el._askBox())).toContain('Kitchen');
    expect(flat(el._askBox())).toContain('Hall');
    const clicks = handlers(el._askBox()).filter(h => h.event === "click");
    clicks[0].fn(); clicks[1].fn(); clicks[2].fn();
    expect(el._answer.mock.calls).toEqual([["one"], ["all"]]);
    expect(el._askCancel).toHaveBeenCalledOnce();
    el._ask = { count: 3, others: ["cover.b", "cover.c"] };
    expect(flat(el._askBox())).toContain('All devices (3)');
    el.hass.states = {}; el._ask = { count: 2, others: ["cover.b", "cover.c"] };
    expect(flat(el._askBox())).toContain('cover.a');
    expect(flat(el._askBox())).toContain('cover.b, cover.c');
    el._ask = null; expect(flat(el._askBox())).toBe("");
  });
});

describe("one device or all", () => {
  const shared = () => mk([A], {}, ["cover.a", "cover.b"]);
  it("an edit of a slot used by one device only is saved at once, on the profile asked", () => {
    const el = mk([{ ...A, entities: ["cover.a"] }], {}, ["cover.a", "cover.b"]);
    el._commit = vi.fn(async () => true);
    const op = vi.fn(() => null);
    el._edit(op, [0], ["a"]);
    expect(el._commit).toHaveBeenCalledTimes(1);
    expect(el._commit.mock.calls[0].slice(1)).toEqual([[0], false, "h"]);
    expect(el._ask).toBeNull();
    const single = mk();
    single._commit = vi.fn(async () => true);
    single._edit(op, [0], ["a"]);
    expect(single._commit).toHaveBeenCalled();
    el._edit(op, [2], ["a"], "other");
    expect(el._commit.mock.calls[1].slice(1)).toEqual([[2], false, "other"]);
  });
  it("a shared slot asks first: the draft shows the result, the question knows who else is concerned", () => {
    const el = shared();
    el._commit = vi.fn(async () => true);
    const next = [[{ ...A, end: { time: "09:30" } }], [], [], [], [], [], []];
    const op = vi.fn(() => next);
    el._edit(op, [0], ["a"]);
    expect(el._commit).not.toHaveBeenCalled();
    expect(el._draft).toEqual(next[0]);
    expect(el._ask).toMatchObject({ touched: [0], ids: ["a"], profileId: "h", count: 2, others: ["cover.b"] });
    const noPreview = shared();
    noPreview._commit = vi.fn();
    noPreview._draft = [A];
    noPreview._edit(() => null, [0], ["a"]);
    expect(noPreview._draft).toEqual([A]);
    const gone = shared();
    gone._edit(() => [[], [], [], [], [], [], []].map((d, i) => (i === 0 ? undefined : d)) as any, [0], ["a"]);
    expect(gone._draft).toBeNull();
    const noDevice = shared(); noDevice.entityId = "";
    noDevice._commit = vi.fn(async () => true);
    noDevice._edit(op, [0], ["a"]);
    expect(noDevice._commit).toHaveBeenCalled();
  });
  it("'all' saves the edit as asked; 'this device' isolates the slot first; no question, no answer; cancel drops the draft", () => {
    const el = shared();
    el._commit = vi.fn(async () => true);
    el._answer("all");
    expect(el._commit).not.toHaveBeenCalled();
    const op = vi.fn((days: any, of: (id: string) => string = (x) => x) => days.map((d: any[]) => d.map((s) => (s.id === of("a") ? { ...s, end: { time: "09:30" } } : s))));
    el._ask = { op, touched: [0], ids: ["a"], profileId: "h", count: 2, others: ["cover.b"] };
    el._answer("all");
    expect(el._ask).toBeNull();
    expect(el._commit.mock.calls[0].slice(1)).toEqual([[0], false, "h"]);
    const days = [[A], [], [], [], [], [], []];
    expect(el._commit.mock.calls[0][0](days)[0][0].end).toEqual({ time: "09:30" });
    el._ask = { op, touched: [0], ids: ["a"], profileId: "h", count: 2, others: ["cover.b"] };
    el._selected = { kind: "slot", id: "a" };
    el._answer("one");
    expect(el._commit.mock.calls[1].slice(1)).toEqual([[0], false, "h"]);
    const out = el._commit.mock.calls[1][0](days);
    expect(out[0].length).toBe(2); // the slot was split: one copy for this device, one for the other
    expect(el._selected).toEqual({ kind: "slot", id: expect.not.stringMatching(/^a$/) });
    el._ask = { op: () => null, touched: [0], ids: ["a"], profileId: "h", count: 2, others: [] };
    el._answer("one");
    expect(el._commit.mock.calls[2][0](days)).toBeNull();
    el._ask = { op, touched: [0, 0], ids: ["a"], profileId: "h", count: 2, others: [] };
    el.weekday = 2;
    el._answer("one");
    expect(el._commit.mock.calls[3][1]).toEqual([0, 2]);
    el._draft = [A]; el._ask = {};
    el._askCancel();
    expect([el._ask, el._draft]).toEqual([null, null]);
  });
});
