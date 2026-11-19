import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { t } from "../i18n";
import { flat, handlers } from "./helpers/tpl";
import { attrs, spansOf, listCard as card, simpleProgram as program, slot, stubBrowser, unstubBrowser } from "./helpers/planner-card";

beforeEach(stubBrowser);
afterEach(unstubBrowser);

describe("missing data never breaks the small helpers", () => {
  it("no data: not editable, no create button, no mode line, no day-off line, no notes", () => {
    const c = card([]);
    const p = program("p", "P", ["cover.a"]);
    c._data = undefined;
    expect(c._needsCreate(p, "cover.a")).toBe(false);
    expect(c._barEditable(p, 1)).toBe(false);
    expect(flat(c._modeLine())).toBe("");
    expect(flat(c._noSchedule(p))).toBe("");
    expect(flat(c._holidayLine([p]))).toBe("");
    expect(flat(c._holidayRow("cover.a", p))).toBe("");
    expect(c._holidaySpans("cover.a", p)).toBeNull();
    expect(flat(c._programToggle(p))).toContain('role="switch"');
    expect(c._lockedText(p)).toBe("");
  });
  it("a program missing from the status: no note, no skip line, no holiday line, no next change", () => {
    const c = card([], {}, { status: {}, holiday_today: true });
    const p = program("p", "P", ["cover.a"]);
    expect(flat(c._noSchedule(p))).toBe("");
    expect(flat(c._holidayLine([p]))).toBe("");
    expect(flat(c._skipped("cover.a", [p]))).toBe("");
    expect(c._next("cover.a", [p])).toBeUndefined();
    c._data.status = { p: { skip_next: "2026-11-05T08:00:00Z" } };
    expect(flat(c._skipped("cover.a", [p]))).toBe(""); // no target list
    c._data.status = { p: { skip_next_targets: [{ entity_id: "cover.a", label: "l" }] } };
    expect(flat(c._skipped("cover.a", [p]))).toBe(""); // nothing skipped
  });
  it("the next change comes from the first enabled program that has one", () => {
    const a = program("pa", "A", ["cover.a"]), b = program("pb", "B", ["cover.a"]), off = program("pc", "C", ["cover.a"], { enabled: false });
    const c = card([a, b, off], {}, { status: { pb: { next_actions: { "cover.a": { at: "x", label: "l" } } }, pc: { next_actions: { "cover.a": { at: "off", label: "l" } } } } });
    expect(c._next("cover.a", [a, b])).toEqual({ at: "x", label: "l" });
    expect(c._next("cover.a", [off])).toBeUndefined();
  });
  it("the skipped line names the setting, else the action, else the rest", () => {
    const p = program("p", "P", ["cover.a"]);
    const target = (extra: any) => ({ p: { skip_next: "2026-11-05T08:00:00Z", skip_next_targets: [{ entity_id: "cover.a", ...extra }] } });
    const c = card([p], {}, { status: target({ label: "l" }) });
    expect(flat(c._skipped("cover.a", [p])).replace(/\u00a0/g, " ")).toContain(t("en", "skip_named", { what: "Open", when: "tomorrow 8 am" }));
    c._data.status = target({ label: "gone", action: { kind: "service", service: "cover.close_cover" } });
    expect(flat(c._skipped("cover.a", [p]))).not.toContain("Open");
    expect(flat(c._skipped("cover.a", [p]))).toContain("mdi:skip-next");
    c._data.status = target({ label: "gone" });
    expect(flat(c._skipped("cover.a", [p])).replace(/\u00a0/g, " ")).toContain(t("en", "skip_named", { what: t("en", "rest_none_short"), when: "tomorrow 8 am" }));
  });
  it("the day-off line says the same text once, different texts with the names; a copy of the real day says nothing", () => {
    const a = program("pa", "A", ["cover.a"]), b = program("pb", "B", ["cover.b"]), n = program("pn", "N", ["cover.c"]);
    const c = card([a, b, n], {}, { holiday_today: true, status: { pa: { holiday: { copy: 6 } }, pb: { holiday: { copy: 6 } }, pn: { holiday: { copy: 2 } } } });
    const same = flat(c._holidayLine([a, b, n]));
    expect(same.match(/<p>/g)).toHaveLength(1);
    expect(same).not.toContain("A ·");
    c._data.status.pb.holiday = { copy: 5 };
    const diff = flat(c._holidayLine([a, b, n]));
    expect(diff.match(/<p>/g)).toHaveLength(2);
    expect(diff).toContain("A · ");
    expect(diff).toContain("B · ");
    expect(diff).not.toContain("N · ");
    c._data.holiday_today = false;
    expect(flat(c._holidayLine([a]))).toBe("");
    c._data.holiday_today = true;
    expect(flat(c._holidayLine([n]))).toBe(""); // a copy of today's real weekday: nothing to tell
  });
  it("the focus goes back to the switch of the program, looked up by its selector", () => {
    const c = card([]);
    const other = { dataset: { program: "zz" }, focus: vi.fn() }, mine = { dataset: { program: "p1" }, focus: vi.fn() };
    const q = vi.fn(() => [other]);
    Object.defineProperty(c, "renderRoot", { value: { querySelectorAll: q }, configurable: true });
    expect(() => c._focusSwitch("p1")).not.toThrow();
    expect(q).toHaveBeenCalledWith("button.hours[role=switch]");
    expect(other.focus).not.toHaveBeenCalled();
    q.mockReturnValue([other, mine]);
    c._focusSwitch("p1");
    expect(mine.focus).toHaveBeenCalledWith({ preventScroll: true });
    const tabs = vi.fn(() => [{ dataset: { tab: "p1" }, focus: vi.fn() }]);
    Object.defineProperty(c, "renderRoot", { value: { querySelectorAll: tabs }, configurable: true });
    Object.defineProperty(c, "updateComplete", { value: Promise.resolve(true), configurable: true });
    const p = program("p1", "Duo", ["cover.a", "cover.b"]);
    handlers(c._deviceTabs(p)).find((h) => h.event === "keydown")!.fn({ key: "End", preventDefault: () => {} });
    return Promise.resolve().then(() => Promise.resolve()).then(() => expect(tabs).toHaveBeenCalledWith('.devtab[aria-selected="true"]'));
  });
});

describe("spans of a day: guards", () => {
  const run = (c: any, ent = "cover.a") => c._computeSpans(ent, [c._data.programs[0]], 0);
  it("the cache key separates program lists even when the ids run together", () => {
    const mk = (id: string, start: string) => program(id, id, ["cover.a"], {}, Array.from({ length: 7 }, () => [slot(id, { time: start }, { time: "23:00" })]));
    const a = mk("a", "01:00"), bc = mk("bc", "02:00"), ab = mk("ab", "03:00"), cc = mk("c", "04:00");
    const c = card([a, bc, ab, cc]);
    const starts = (ps: any[]) => c._spans("cover.a", ps, 0).map((s: any) => s.start).sort((x: number, y: number) => x - y);
    expect(starts([a, bc])).toEqual([60, 120]);
    expect(starts([ab, cc])).toEqual([180, 240]);
  });
  it("a one-shot has no end base, even when the row carries one", () => {
    const c = card([program("p1", "A", ["cover.a"], {}, Array.from({ length: 7 }, () => [slot("m", { time: "10:00" }, null)]))]);
    c._deviceDays = () => ({ today: [{ slot_id: "m", start: "2026-11-04T10:00:00Z", end: null, ignored: null, end_base: "2026-11-04T09:50:00Z" }], previous: [] });
    expect(run(c)[0].endBase).toBeNull();
  });
  it("without a preview, a slot that crosses midnight with a random start or end is left out", () => {
    const days = Array.from({ length: 7 }, () => [
      slot("rs", { time: "22:00", random_minutes: 5 }, { time: "02:00" }), slot("re", { time: "22:00" }, { time: "02:00", random_minutes: 5 }), slot("ok", { time: "22:00" }, { time: "02:00" })]);
    const c = card([program("p1", "A", ["cover.a"], {}, days)]);
    c._deviceDays = () => ({ today: undefined, previous: undefined });
    expect(run(c).filter((s: any) => s.spill).map((s: any) => s.slotId)).toEqual(["ok"]);
  });
  it("the bar of a device uses its own default setting for the rest of the time; the spans are the program's", () => {
    const p = program("p1", "Duo", ["cover.a", "cover.b"]);
    p.entities[0].default_label = "l"; p.entities[1].default_label = "l2";
    const c = card([p]);
    c._lockedText = () => "";
    c._deviceDays = () => ({ today: [], previous: [] });
    const attr = (e: string) => attrs(c._bar(e, p, 0, "today"));
    expect(attr("cover.a")[".rest"]).toBe("Open");
    expect(attr("cover.b")[".rest"]).toBe("Close");
    const q = program("q", "Q", ["cover.a"]);
    c._data.programs.push(q);
    c._deviceDays = () => ({ today: [{ slot_id: "d", start: "2026-11-04T08:00:00Z", end: "2026-11-04T09:00:00Z", ignored: null }], previous: [] });
    c._spanCache.clear();
    const spans = spansOf(c._bar("cover.a", p, 0, "today"))[0];
    expect(spans.map((s: any) => s.slotId)).toEqual(["d"]);
  });
  it("a day off copied from a missing day is empty; a slot the device does not take is left out", () => {
    const p = program("p1", "A", ["cover.a"], {}, undefined, { copy: 0 });
    p.profiles[0].days[0] = [{ ...slot("x"), entities: ["cover.other"] }, slot("y")];
    const c = card([p], {}, { holiday_entity: "binary_sensor.h" });
    expect(c._holidaySpans("cover.a", p).map((s: any) => s.slotId)).toEqual(["y"]);
    const q = program("q1", "B", ["cover.a"], {}, undefined, { off: true, copy: 3 });
    expect(c._holidayCopy(q)).toBeNull();
    expect(c._holidaySpans("cover.a", q)).toBeNull();
    expect(c._holidayCopy(program("q2", "C", ["cover.a"], {}, undefined, { copy: 3 }))).toBe(3);
    expect(c._holidayCopy(program("q3", "D", ["cover.a"]))).toBeNull();
  });
  it("the comparison asks for each weekday its next occurrence", () => {
    const c = card([], { schedule_view: "compare" });
    const p = program("p", "P", ["cover.a"]);
    c._spans = vi.fn(() => []); c._holidaySpans = vi.fn(() => null);
    for (let d = 0; d < 7; d++) { c._cmpDay = d; flat(c._compare([[p]], false)); } // each chip shows its own day
    expect(c._spans.mock.calls.map((x: any[]) => x[2])).toEqual([5, 6, 0, 1, 2, 3, 4]);
  });
});

describe("opening a schedule", () => {
  it("never asks to create unless told", () => {
    const c = card([]);
    delete c._open; // the real one: the fixture replaces it with a mock
    c._open({ kind: "program", programId: "p" });
    expect(c._dialog).toEqual({ kind: "schedule", scope: { kind: "program", programId: "p" }, day: undefined, create: false });
  });
});
