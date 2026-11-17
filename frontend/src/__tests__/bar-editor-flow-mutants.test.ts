import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LitElement } from "lit";
import { WpBarEditor } from "../components/bar-editor";

// Mutation survivors of the bar editor: life cycle, listeners, keyboard nudges and the choice between "this device" and "all".
const label = { id: "l", name: "Open", color: "#0f0", action: { kind: "service", service: "cover.open_cover" } };
const A = { id: "a", label: "l", start: { time: "08:00" }, end: { time: "09:00" } };
const mk = (slots: any[] = [A], devices = ["cover.a"], props: any = {}) => {
  const el: any = new WpBarEditor();
  el.lang = "en"; el.tz = "UTC"; el.editing = false; el.weekday = 0; el.entityId = devices[0];
  el.hass = { language: "en", states: {}, services: { cover: { open_cover: {}, close_cover: {} } }, config: { time_zone: "UTC" } };
  el.program = { id: "p", revision: 3, entities: devices.map((e) => ({ entity_id: e, default_label: null, label_overrides: {} })), profiles: [{ id: "h", name: "A", days: [slots, [], [], [], [], [], []] }] };
  el.data = { programs: [el.program], labels: [label], status: {} };
  el.spans = [];
  el.dispatchEvent = vi.fn();
  Object.assign(el, props);
  return el;
};
const events = (el: any) => el.dispatchEvent.mock.calls.map(([e]: any[]) => e.type);

let doc: any;
beforeEach(() => {
  vi.useFakeTimers();
  doc = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
  vi.stubGlobal("document", doc);
  vi.stubGlobal("window", { setTimeout: globalThis.setTimeout, clearTimeout: vi.fn(globalThis.clearTimeout), localStorage: { getItem: () => null, setItem: () => {} } });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("life cycle", () => {
  it("the sun times of the day are read from the preview; the draft goes once the saved revision arrived", () => {
    const sun = { id: "s", label: "l", start: { sun: "sunrise" }, end: { sun: "sunset" } };
    const el = mk([sun, { id: "f", label: "l", start: { time: "01:00" }, end: { time: "02:00" } }]);
    el.preview = [{ slot_id: "s", start: "2026-11-04T06:15:00Z", end: "2026-11-04T16:45:00Z" }, { slot_id: "f", start: "2026-11-04T01:00:00Z", end: "2026-11-04T02:00:00Z" }, { slot_id: "zz", start: "x", end: "y" }];
    el.willUpdate(new Map([["preview", 1]]));
    expect([...el._sun]).toEqual([[JSON.stringify({ sun: "sunrise" }), 375], [JSON.stringify({ sun: "sunset" }), 1005]]);
    expect(el._at({ sun: "sunrise" })).toBe(375);
    expect(el._at({ time: "10:30" })).toBe(630);
    el.preview = [{ slot_id: "s", start: "2026-11-04T06:15:00Z", end: null }];
    el.willUpdate(new Map([["data", 1]]));
    expect([...el._sun].length).toBe(1);
    el.preview = undefined;
    el._sun = new Map([["x", 1]]);
    el.willUpdate(new Map([["program", 1]]));
    expect(el._sun.size).toBe(0);
    el._sun = new Map([["x", 1]]);
    el.willUpdate(new Map([["other", 1]]));
    expect(el._sun.size).toBe(1);
    el._draft = [A]; el._awaitRev = 5;
    el.willUpdate(new Map([["program", 1]]));
    expect(el._draft).not.toBeNull(); // revision 3 < 5
    el.program = { ...el.program, revision: 5 };
    el.willUpdate(new Map([["program", 1]]));
    expect([el._draft, el._awaitRev]).toEqual([null, null]);
    el._draft = [A]; el._awaitRev = null;
    el.willUpdate(new Map([["program", 1]]));
    expect(el._draft).not.toBeNull();
  });
  it("entering the edit mode listens to the page and clears the hint; leaving resets everything", () => {
    const el = mk();
    el._hint = true;
    el.editing = true;
    el.updated(new Map([["editing", false]]));
    expect(el._hint).toBe(false);
    expect(doc.addEventListener).toHaveBeenCalledWith("pointerdown", el._outside, true);
    expect(doc.addEventListener).toHaveBeenCalledWith("keydown", el._escape);
    const focus = vi.fn();
    Object.defineProperty(el, "renderRoot", { value: { querySelector: vi.fn(() => ({ focus })) }, configurable: true });
    el.updated(new Map([["editing", false]]));
    expect(focus).not.toHaveBeenCalled();
    el._kbd = true; el._listening = false;
    el.updated(new Map([["editing", false]]));
    expect(el.renderRoot.querySelector).toHaveBeenLastCalledWith(".hd");
    expect(focus).toHaveBeenCalledTimes(1);
    el.updated(new Map());
    expect(focus).toHaveBeenCalledTimes(1);
    el._selected = { kind: "slot", id: "a" }; el._hsel = { id: "a", edge: "start" }; el._copyOpen = true; el._conflict = {}; el._keep.add("x"); el._bubble = { m: 1 };
    el._ask = { op: () => null }; el._draft = [A]; el.editing = false;
    el.updated(new Map([["editing", true]]));
    expect([el._kbd, el._selected, el._hsel, el._copyOpen, el._conflict, el._keep.size, el._bubble, el._ask, el._draft]).toEqual([false, null, null, false, null, 0, null, null, null]);
    expect(focus).toHaveBeenCalledTimes(2);
    expect(el.renderRoot.querySelector).toHaveBeenLastCalledWith(".zone");
    expect(doc.removeEventListener).toHaveBeenCalledWith("pointerdown", el._outside, true);
    expect(doc.removeEventListener).toHaveBeenCalledWith("keydown", el._escape);
    el._draft = [A]; el._ask = null;
    el.updated(new Map([["editing", true]]));
    expect(el._draft).toEqual([A]); // no question pending: the draft stays
  });
  it("listeners are added and removed once; connecting follows the names; disconnecting stops every timer", () => {
    const up = vi.spyOn(LitElement.prototype, "connectedCallback").mockImplementation(() => {});
    const down = vi.spyOn(LitElement.prototype, "disconnectedCallback").mockImplementation(() => {});
    const el = mk();
    el._listen(true); el._listen(true);
    expect(doc.addEventListener).toHaveBeenCalledTimes(2);
    el._listen(false); el._listen(false);
    expect(doc.removeEventListener).toHaveBeenCalledTimes(2);
    const off = vi.fn();
    const services = vi.fn();
    el.requestUpdate = services;
    el.connectedCallback();
    expect(up).toHaveBeenCalled();
    el._offNames = off;
    el._press = { timer: 5 }; el._listening = true;
    el.disconnectedCallback();
    expect(down).toHaveBeenCalled();
    expect(off).toHaveBeenCalled();
    expect(doc.removeEventListener).toHaveBeenCalledTimes(4);
    expect((globalThis as any).window.clearTimeout).toHaveBeenCalledWith(5);
    expect((globalThis as any).window.clearTimeout.mock.calls.length).toBeGreaterThanOrEqual(5);
    const bare = mk();
    expect(() => bare.disconnectedCallback()).not.toThrow();
  });
  it("a touch outside leaves the edit mode, one inside or on the snack bar does not; Escape leaves unless a question is open", () => {
    vi.stubGlobal("HTMLElement", class {});
    const el = mk();
    el._outside({ composedPath: () => [el, {}] });
    expect(events(el)).toEqual([]);
    el._outside({ composedPath: () => [{}] });
    expect(events(el)).toEqual(["edit-exit"]);
    const snack = Object.assign(new (globalThis as any).HTMLElement(), { classList: { contains: (c: string) => c === "snack" } });
    el.dispatchEvent.mockClear();
    el._outside({ composedPath: () => [snack] });
    expect(events(el)).toEqual([]);
    const other = Object.assign(new (globalThis as any).HTMLElement(), { classList: { contains: () => false } });
    el._outside({ composedPath: () => [other] });
    expect(events(el)).toEqual(["edit-exit"]);
    el.dispatchEvent.mockClear();
    el._escape({ key: "Enter" });
    expect(events(el)).toEqual([]);
    el._escape({ key: "Escape" });
    expect(events(el)).toEqual(["edit-exit"]);
    el.dispatchEvent.mockClear();
    el._conflict = {};
    el._escape({ key: "Escape" });
    expect(events(el)).toEqual([]);
  });
  it("selecting the same thing twice unselects; any selection closes the copy box", () => {
    const el = mk();
    el._copyOpen = true; el._copyDays = [1];
    el._select({ kind: "slot", id: "a" });
    expect([el._selected, el._copyOpen, el._copyDays]).toEqual([{ kind: "slot", id: "a" }, false, []]);
    el._select({ kind: "slot", id: "a" });
    expect(el._selected).toBeNull();
    el._select({ kind: "gap", start: 0, end: 5 });
    el._select({ kind: "gap", start: 0, end: 6 });
    expect(el._selected).toEqual({ kind: "gap", start: 0, end: 6 });
  });
  it("the draft is dropped with its timer; an error shows for 5 s", () => {
    const el = mk();
    el._draft = [A]; el._awaitRev = 4;
    el._dropDraft();
    expect([el._draft, el._awaitRev]).toEqual([null, null]);
    expect((globalThis as any).window.clearTimeout).toHaveBeenCalled();
    el._fail("Boom");
    expect(el._error).toBe("Boom");
    vi.advanceTimersByTime(4999);
    expect(el._error).toBe("Boom");
    vi.advanceTimersByTime(1);
    expect(el._error).toBe("");
    expect(el._with([[1], [2], [3]], 1, [9])).toEqual([[1], [9], [3]]);
  });
});

describe("keyboard nudges", () => {
  const ref = { id: "a", edge: "start" as const };
  it("an arrow moves the boundary by 15 minutes into the draft and shows the time; a commit follows after the delay", () => {
    const el = mk();
    el._edit = vi.fn();
    const ev = (key: string) => ({ key, preventDefault: vi.fn() });
    const other = ev("Tab");
    el._key(other, ref);
    expect(other.preventDefault).not.toHaveBeenCalled();
    expect(el._draft).toBeNull();
    const right = ev("ArrowRight");
    el._key(right, ref);
    expect(right.preventDefault).toHaveBeenCalled();
    expect(el._bubble).toEqual({ m: 495 });
    expect(el._draft[0].start).toEqual({ time: "08:15" });
    el._key(ev("ArrowLeft"), ref);
    expect(el._bubble).toEqual({ m: 480 });
    el._key(ev("ArrowLeft"), ref);
    expect(el._bubble).toEqual({ m: 465 });
    expect(el._nudge).toMatchObject({ m: 465, profileId: "h", weekday: 0 });
    expect(el._edit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(5000);
    expect(el._edit).toHaveBeenCalledTimes(1);
    expect(el._nudge).toBeUndefined();
    expect(el._bubble).toBeNull();
    expect(el._edit.mock.calls[0][1]).toEqual([0]);
    expect(el._edit.mock.calls[0][2]).toEqual(["a"]);
    expect(el._edit.mock.calls[0][3]).toBe("h");
  });
  it("the committed edit moves the boundary on the days it receives", () => {
    const el = mk();
    el._edit = vi.fn();
    el._key({ key: "ArrowRight", preventDefault: () => {} }, { id: "a", edge: "end" });
    el._flushNudge();
    const op = el._edit.mock.calls[0][0];
    const days = [[A], [], [], [], [], [], []];
    const out = op(days, (id: string) => id);
    expect(out[0][0].end).toEqual({ time: "09:15" });
    expect(out[1]).toEqual([]);
    expect(op(days, (id: string) => "zz")).toBeNull();
    el._flushNudge(); // nothing pending
    expect(el._edit).toHaveBeenCalledTimes(1);
  });
  it("a nudge begun on another schedule is committed first and its draft dropped", () => {
    const el = mk();
    el._edit = vi.fn();
    el._key({ key: "ArrowRight", preventDefault: () => {} }, ref);
    el._nudge.profileId = "old";
    el._key({ key: "ArrowRight", preventDefault: () => {} }, ref);
    expect(el._edit).toHaveBeenCalledTimes(1);
    expect(el._edit.mock.calls[0][3]).toBe("old");
    expect(el._bubble).toEqual({ m: 495 }); // restarted from the saved day
    const unknown = mk();
    const ev = { key: "ArrowLeft", preventDefault: vi.fn() };
    unknown._key(ev, { id: "zz", edge: "start" });
    expect(unknown._draft).toBeNull();
    expect(unknown._nudge).toBeUndefined();
    const edge = mk([{ ...A, start: { time: "00:00" } }]);
    edge._key({ key: "ArrowLeft", preventDefault: () => {} }, ref);
    expect(edge._draft?.[0].start ?? { time: "00:00" }).toEqual({ time: "00:00" }); // cannot go before midnight
  });
  it("a boundary is moved together with the slots that share it", () => {
    const el = mk([A, { id: "b", label: "l", start: { time: "09:00" }, end: { time: "10:00" } }]);
    expect(el._boundaryIds({ id: "a", edge: "end" }, el._ctx()).sort()).toEqual(["a", "b"]);
    expect(el._boundaryIds({ id: "a", edge: "start" }, el._ctx())).toEqual(["a"]);
    expect(el._boundaryIds({ id: "zz", edge: "start" }, el._ctx())).toEqual(["zz"]);
  });
});

describe("one device or all", () => {
  const shared = () => mk([A], ["cover.a", "cover.b"]);
  it("an edit of a slot used by one device only is saved at once, on the profile asked", () => {
    const el = mk([{ ...A, entities: ["cover.a"] }], ["cover.a", "cover.b"]);
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
