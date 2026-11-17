import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpSchedule } from "../components/schedule-dialog";
import { fetchPreviewResponse } from "../preview-cache";
import { t } from "../i18n";
import { flat } from "./helpers/tpl";
vi.mock("../preview-cache", async (original) => ({ ...(await original<typeof import("../preview-cache")>()), fetchPreviewResponse: vi.fn() }));
const program = (id = "p", priority = 1, name = "Office", ids = ["switch.a", "switch.b"]): any => ({
  id, priority, name, revision: 2, enabled: true, reapply: true, conditions: [],
  entities: ids.map(entity_id => ({ entity_id, default_label: null, label_overrides: {} })),
  profiles: [{ id: "home", name: "Home", days: Array.from({ length: 7 }, () => []) }],
});
function make(programs = [program()], scope: any = { kind: "program", programId: "p" }): any {
  const view: any = new WpSchedule();
  view.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, services: {}, callWS: vi.fn() };
  view.data = { programs, labels: [], status: {}, can_edit: true, read_only: false };
  view.scope = scope;
  view.requestUpdate = vi.fn();
  return view;
}
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-16T12:00:00Z")); vi.mocked(fetchPreviewResponse).mockReset(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe("schedule mutation regressions", () => {
  it("filters both scopes and sorts shared programs by priority then name without changing pushed order", () => {
    const programs = [program("z", 5, "Zeta"), program("b", 1, "Beta"), program("a", 1, "Alpha"), program("other", 0, "Other", ["switch.other"])];
    const view = make(programs, { kind: "device", entityId: "switch.a" });
    expect(view._programs.map((p: any) => p.id)).toEqual(["a", "b", "z"]);
    expect(programs.map(p => p.id)).toEqual(["z", "b", "a", "other"]);
    view.scope = { kind: "program", programId: "b" };
    expect(view._programs.map((p: any) => p.id)).toEqual(["b"]);
    expect(view._title).toBe("Beta");
    view.scope.programId = "missing";
    expect(view._entities).toEqual([]); expect(view._eid).toBe(""); expect(view._title).toBe("");
    expect(view._devices()).toEqual([]);
  });
  it("uses the selected valid device, then the opening device, then the first device", () => {
    const view = make();
    view.scope.entityId = "switch.b";
    expect(view._eid).toBe("switch.b");
    view._pick = "switch.a"; expect(view._eid).toBe("switch.a");
    view._pick = "missing"; expect(view._eid).toBe("switch.b");
    view.scope.entityId = "missing"; expect(view._eid).toBe("switch.a");
    view.scope = { kind: "device", entityId: "switch.b" };
    expect(view._entities).toEqual(["switch.b"]);
  });
  it("resolves default device lists from the edited program rather than the first owner", () => {
    const view = make([program(), program("second", 2, "Second", ["switch.a", "switch.c"])], { kind: "device", entityId: "switch.a" });
    view._programId = "second";
    expect(view._devices()).toEqual(["switch.a", "switch.c"]);
    view._programId = "missing"; expect(view._devices()).toEqual(["switch.a", "switch.b"]);
  });
  it("prefers a cached chart owner only when its id matches and revision is strictly newer", () => {
    const view = make(); const pushed = view.data.programs[0];
    for (const [id, revision, expected] of [["p", 1, false], ["p", 2, false], ["p", 3, true], ["other", 9, false]] as const) {
      view._chartProgram = { ...pushed, id, revision };
      expect(view._chartOwner()).toBe(expected ? view._chartProgram : pushed);
    }
    view.data.programs = []; expect(view._chartOwner()).toBeUndefined();
  });
  it("uses pushed programs on equal revisions and cached programs when the push is absent", () => {
    const view = make(); const pushed = view.data.programs[0];
    view._saved.p = { ...pushed, revision: 2, name: "Cached" };
    expect(view._live("p")).toBe(pushed);
    view._saved.p.revision = 3; expect(view._live("p")).toBe(view._saved.p);
    view.data.programs = []; expect(view._live("p")).toBe(view._saved.p);
    expect(view._live("missing")).toBeUndefined();
  });
  it("ignores a deleted mode choice and has no modes without a selector", () => {
    const view = make(); expect(view._modes()).toEqual([]); expect(view._modeOnly).toBe(false);
    view.data.mode = { selector: "input_select.mode", options: ["Home", "Away"], active: "Home", default: "Away" };
    view._viewMode = "Deleted"; expect(view._openMode).toBe("Home");
    view._viewMode = "Away"; expect(view._openMode).toBe("Away"); expect(view._modeOnly).toBe(true);
    view._viewMode = null; view.data.mode.active = null; expect(view._openMode).toBe("Away");
    view.data.mode.default = null; expect(view._openMode).toBe("Home");
    view.data.mode.options = []; view.data.programs[0].profiles = []; expect(view._openMode).toBeNull(); expect(view._modeOnly).toBe(false);
  });
  it("finds a concurrently created edit profile by name and does not invent one outside an edit", () => {
    const view = make(); const p = view.data.programs[0];
    expect(view._editProfile(p)).toBeUndefined();
    view._editProfileId = "new"; view._editMode = "Home";
    expect(view._editProfile(p)).toBe(p.profiles[0]);
    view._editMode = "Away";
    expect(view._editProfile(p)).toEqual({ id: "new", name: "Away", days: [[], [], [], [], [], [], []] });
  });
  it.each([-14, 7])("accepts the chart boundary %i and clears old preview", offset => {
    const view = make(); view._resp = [{}, {}]; view._go(offset);
    expect(view._offset).toBe(offset); expect(view._resp).toBeNull();
    view._resp = [{ kept: true }, {}]; view._go(offset < 0 ? -1 : 1);
    expect(view._offset).toBe(offset); expect(view._resp).toEqual([{ kept: true }, {}]);
  });
  it.each([-14, 7, -15, 8])("opens a focused day at permitted offsets only (%i)", offset => {
    const view = make(); view._loadNames = vi.fn(); view._add = vi.fn();
    view.day = { weekday: 0, offset }; view.firstUpdated();
    expect(view._offset).toBe(offset >= -14 && offset <= 7 ? offset : 0);
    expect(view._focus).toBe(0); expect(view._add).toHaveBeenCalledWith([0]); expect(view._loadNames).toHaveBeenCalledOnce();
  });
  it("does not auto-create by default and honors a focused day even when create is requested", () => {
    const view = make(); view._loadNames = vi.fn(); view._add = vi.fn();
    view.firstUpdated(); expect(view._add).not.toHaveBeenCalled();
    view.create = true; view.day = { weekday: 4, offset: 1 }; view.firstUpdated();
    expect(view._add).toHaveBeenCalledWith([4]);
  });
  it("clears the device choice only when an existing scope changes", () => {
    const view = make(); view.chart = false; view._pick = "switch.b";
    view.willUpdate(new Map()); expect(view._pick).toBe("switch.b");
    view.willUpdate(new Map([["scope", undefined]])); expect(view._pick).toBe("switch.b");
    view.willUpdate(new Map([["scope", {}]])); expect(view._pick).toBe("");
  });
  it("requests yesterday and today with the selected mode and discards an answer for an obsolete key", async () => {
    const view = make(); view._loaded = "current";
    vi.mocked(fetchPreviewResponse).mockResolvedValue({ slots: [] } as any);
    await view._loadPreview("p", 2, "2026-11-16", "obsolete", "home");
    expect(view._resp).toBeNull();
    expect(vi.mocked(fetchPreviewResponse).mock.calls.map(c => c.slice(1))).toEqual([
      ["p", 2, "2026-11-15", "home"], ["p", 2, "2026-11-16", "home"],
    ]);
    await view._loadPreview("p", 2, "2026-11-16", "current", "home");
    expect(view._resp).toEqual([{ slots: [] }, { slots: [] }]);
  });
  it("keeps newer preview answers when an older request resolves or fails later", async () => {
    const view = make(); view._loaded = "key";
    let resolve!: (value: any) => void; let reject!: (error: unknown) => void;
    vi.mocked(fetchPreviewResponse).mockReturnValueOnce(new Promise(r => { resolve = r; })).mockResolvedValueOnce({ slots: [] } as any);
    const old = view._loadPreview("p", 1, "2026-11-16", "key");
    vi.mocked(fetchPreviewResponse).mockResolvedValue({ slots: [{ slot_id: "new" }] } as any);
    await view._loadPreview("p", 2, "2026-11-16", "key"); const newest = view._resp;
    resolve({ slots: [{ slot_id: "old" }] }); await old; expect(view._resp).toBe(newest);
    vi.mocked(fetchPreviewResponse).mockReturnValueOnce(new Promise((_r, r) => { reject = r; }));
    const failing = view._loadPreview("p", 3, "2026-11-16", "key");
    await view._loadPreview("p", 4, "2026-11-16", "key"); const latest = view._resp;
    reject(new Error("late failure")); await failing; expect(view._resp).toBe(latest);
  });
  it.each([
    ["unknown_label", "err_label"], ["earliest_after_latest", "err_sun_bounds"], ["random_window_too_short", "random_too_short"],
    ["overlapping_slots", "w_err_overlap"], ["offset", "err_time_range"], ["invalid_random_minutes", "err_time_range"],
    ["at most", "err_time_range"], ["at least", "err_time_range"], ["out of range", "err_time_range"],
    ["INVALID_TIME", "err_time_range"], ["invalid_clock", "err_time_range"], ["unexpected", "ss_err_save"],
  ])("translates save error %s", async (message, key) => {
    const view = make(); view.hass.callWS.mockRejectedValue({ message });
    expect(await view._saveProgram(view.data.programs[0])).toBe("error");
    expect(view._error).toBe(t("en", key as any)); expect(view._saving).toBe(false);
  });
  it("leaves Escape to the dialog unless a row editor is open", () => {
    const view = make(); const event = { preventDefault: vi.fn() }; view._cancel = vi.fn();
    view._onEscape(event); expect(event.preventDefault).not.toHaveBeenCalled(); expect(view._cancel).not.toHaveBeenCalled();
    view._open = "new"; view._onEscape(event); expect(event.preventDefault).toHaveBeenCalledOnce(); expect(view._cancel).toHaveBeenCalledOnce();
  });
  it("renders no initial error or note and starts with closed mode options", () => {
    const view = make(); expect(view._optsOpen).toBe(false); expect(view._shared).toBe(false); expect(view._dropBusy).toBe(false);
    expect(flat(view.render())).not.toContain("Stryker was here");
  });
});
