import { describe, expect, it, vi } from "vitest";
import { editor, mk, A, pointer, slot, useBarEditorGlobals } from "./helpers/bar-editor";

useBarEditorGlobals();

describe("pointer edits and day transfers", () => {
  it("a held handle becomes a whole-slot move only after 450 ms", () => {
    const el = editor();
    const down = pointer(180, 60); // 06:00 at 320 pixels per day
    el._ovDown(down);
    expect(down.currentTarget.setPointerCapture).toHaveBeenCalledWith(7);
    expect(down.preventDefault).toHaveBeenCalledOnce();
    expect(el._drag).toMatchObject({ ref: { id: "a", edge: "start" }, moved: false });
    vi.advanceTimersByTime(449);
    expect(el._mv).toBeUndefined();
    vi.advanceTimersByTime(1);
    expect(el._drag).toBeUndefined();
    expect(el._hsel).toBeNull();
    expect(el._mv).toMatchObject({ id: 7, slotId: "a", x0: 180, y0: 60, moved: false, profileId: "h", weekday: 0 });
    expect(navigator.vibrate).toHaveBeenCalledWith(12);
    el._zoneCancel();
    el._ovCancel();
    expect(el._mv).toBeUndefined();
  });
  it("a released handle cannot start a delayed whole-slot move", () => {
    const el = editor();
    el._ovDown(pointer(180, 60));
    el._ovUp(pointer(180, 60));
    vi.advanceTimersByTime(450);
    expect(el._drag).toBeUndefined();
    expect(el._mv).toBeUndefined();
    expect(navigator.vibrate).not.toHaveBeenCalled();
  });
  it("a moved handle stays a boundary drag and saves its original day and handle", () => {
    const el = editor();
    el._edit = vi.fn();
    el._ovDown(pointer(180, 60));
    el._ovMove(pointer(182, 60));
    expect(el._draft).toBeNull();
    el._ovMove(pointer(190, 60));
    expect(el._draft[0].start).toEqual({ time: "06:45" });
    vi.advanceTimersByTime(450);
    expect(el._mv).toBeUndefined();
    el._ovUp(pointer(190, 60, 8));
    expect(el._edit).not.toHaveBeenCalled();
    el._ovUp(pointer(190, 60));
    expect(el._drag).toBeUndefined();
    expect(el._bubble).toBeNull();
    const [op, touched, ids, profile] = el._edit.mock.calls[0];
    expect([touched, ids, profile]).toEqual([[0], ["a"], "h"]);
    const days = el.program.profiles[0].days;
    expect(op(days, (id: string) => id)[0][0].start).toEqual({ time: "06:45" });
    expect(op(days, () => "gone")).toBeNull();
  });
  it("tap selection respects pointer identity and the eight-pixel movement limit", () => {
    const el = editor();
    el._ovDown(pointer(140, 60)); // gap, away from handles
    expect(el._tap.target).toEqual({ kind: "gap", start: 0, end: 360 });
    el._ovUp(pointer(140, 60, 9));
    expect(el._selected).toBeNull();
    expect(el._tap).toBeDefined();
    el._ovUp(pointer(148, 60));
    expect(el._selected).toEqual({ kind: "gap", start: 0, end: 360 });
    el._selected = null;
    el._ovDown(pointer(140, 60));
    el._ovUp(pointer(148.01, 60));
    expect(el._selected).toBeNull();
    el._ovDown(pointer(220, 60)); // body of the slot
    expect(el._mv.slotId).toBe("a");
    el._ovUp(pointer(220, 60));
    expect(el._selected).toEqual({ kind: "slot", id: "a" });
    expect(el._mv).toBeUndefined();
  });
  it("only another day of the same program and device accepts a drop", () => {
    const el = editor();
    const other = editor();
    other.program = el.program;
    other.weekday = 1;
    el.getRootNode = () => ({ elementsFromPoint: vi.fn(() => [other]) });
    expect(el._barAt(12, 34)).toBe(other);
    other.entityId = "cover.b";
    expect(el._barAt(12, 34)).toBeNull();
    other.entityId = el.entityId;
    other.program = { ...el.program, id: "different" };
    expect(el._barAt(12, 34)).toBeNull();
    other.program = el.program;
    other.weekday = 0;
    expect(el._barAt(12, 34)).toBeNull();
    el.getRootNode = () => ({ elementsFromPoint: () => [el] });
    expect(el._barAt(12, 34)).toBeNull();
    el.getRootNode = () => ({});
    expect(el._barAt(12, 34)).toBeNull();
  });
  it("cross-day drag previews the destination then writes both days on release", () => {
    const el = editor();
    const dest = editor(); dest.program = el.program; dest.weekday = 2;
    el.getRootNode = () => ({ elementsFromPoint: () => [dest] });
    el._edit = vi.fn();
    el._mvBegin(pointer(220, 60), "a");
    expect(el._mvMove(pointer(224, 63))).toBe(true);
    expect(el._moving).toBe(false);
    expect(el._mvMove(pointer(230, 60, 8))).toBe(false);
    el._mvMove(pointer(230, 60));
    expect(el._moving).toBe(true);
    expect(dest.drop).toBe(true);
    expect(el._mv.delta).toBe(45);
    expect(el._draft).toBeNull();
    expect(el._bubble.text).toContain("Wed");
    expect(el._bubble.m).toBe(405);
    expect(el._mvUp(pointer(230, 60))).toBe(true);
    expect(dest.drop).toBe(false);
    expect(el._moving).toBe(false);
    expect(el._bubble).toBeNull();
    const [op, touched, ids, profile] = el._edit.mock.calls[0];
    expect([touched, ids, profile]).toEqual([[0, 2], ["a"], "h"]);
    const out = op(el.program.profiles[0].days, (id: string) => id);
    expect(out[0]).toEqual([]);
    expect(out[2][0]).toMatchObject({ start: { time: "06:45" }, end: { time: "12:45" }, label: "l" });
    expect(op(el.program.profiles[0].days, () => "missing")).toBeNull();
  });
  it("switching drop targets removes the old highlight and cancellation restores the source", () => {
    const el = editor(); const first = editor(); const second = editor();
    el._mvBegin(pointer(220, 60), "a");
    el._setDrop(first);
    expect(first.drop).toBe(true);
    el._setDrop(second);
    expect([first.drop, second.drop]).toEqual([false, true]);
    el._setDrop(second);
    expect(second.drop).toBe(true);
    el._mv.moved = true; el._draft = [slot("draft")]; el._moving = true; el._bubble = { m: 99 };
    el._mvCancel();
    expect([second.drop, el._draft, el._moving, el._bubble, el._mv]).toEqual([false, null, false, null, undefined]);
    el._draft = [slot("untouched")];
    el._mvCancel();
    expect(el._draft[0].id).toBe("untouched");
  });
  it("overlapping destination refuses a transfer and shows an error", () => {
    const el = editor(); const dest = editor(); dest.weekday = 1;
    el.program.profiles[0].days[1] = [slot("busy")];
    el._edit = vi.fn();
    el._mvBegin(pointer(220, 60), "a");
    Object.assign(el._mv, { moved: true, to: dest }); dest.drop = true;
    expect(el._mvUp(pointer(220, 60))).toBe(true);
    expect(el._edit).not.toHaveBeenCalled();
    expect(el._error).toMatch(/overlap/i);
    expect(dest.drop).toBe(false);
  });
  it("a same-day whole-slot drag saves a reusable edit and ignores other pointers", () => {
    const el = editor();
    el.getRootNode = () => ({});
    el._edit = vi.fn();
    el._mvBegin(pointer(220, 60), "a");
    el._mvMove(pointer(230, 60));
    expect(el._draft[0]).toMatchObject({ start: { time: "06:45" }, end: { time: "12:45" } });
    expect(el._mvUp(pointer(230, 60, 8))).toBe(false);
    expect(el._edit).not.toHaveBeenCalled();
    el._mvUp(pointer(230, 60));
    const [op, touched, ids, profile] = el._edit.mock.calls[0];
    expect([touched, ids, profile]).toEqual([[0], ["a"], "h"]);
    expect(op(el.program.profiles[0].days, (id: string) => id)[0][0].start).toEqual({ time: "06:45" });
    expect(op(el.program.profiles[0].days, () => "missing")).toBeNull();
  });
});

describe("gesture thresholds and interruptions", () => {
  it("starts whole-slot motion exactly at eight pixels and boundary motion at three", () => {
    const el = editor(); el.getRootNode = () => ({});
    el._mvBegin(pointer(220, 60), "a");
    el._mvMove(pointer(228, 60));
    expect(el._mv.moved).toBe(true);
    expect(el._moving).toBe(true);
    el._mvCancel();
    el._ovDown(pointer(180, 60));
    el._ovMove(pointer(183, 60));
    expect(el._drag.moved).toBe(true);
    el._ovCancel();
    expect(el._drag).toBeUndefined();
    expect(el._draft).toBeNull();
  });
  it("updates hover only when neither a tap nor a drag is pending", () => {
    const el = editor();
    el._ovMove(pointer(180, 60)); expect(el._hover).toBe(true);
    el._ovMove(pointer(140, 60)); expect(el._hover).toBe(false);
    el._tap = { id: 7 }; el._ovMove(pointer(180, 60)); expect(el._hover).toBe(false);
    el._tap = undefined; el._ovDown(pointer(180, 60)); el._hover = true;
    el._ovMove(pointer(140, 60, 8)); expect(el._hover).toBe(true);
    el._ovCancel();
    el.view = "radial";
    el._ovMove(pointer(372, 210)); expect(el._hover).toBe(true);
    el._ovMove(pointer(260, 210)); expect(el._hover).toBe(false);
  });
  it("ignores non-primary presses and commits pending keyboard nudges before a pointer edit", () => {
    const el = editor(); el._edit = vi.fn();
    el._key({ key: "ArrowRight", preventDefault: vi.fn() }, { id: "a", edge: "start" });
    el._ovDown({ ...pointer(200, 60), button: 2 });
    expect(el._edit).not.toHaveBeenCalled();
    expect(el._nudge).toBeDefined();
    el._ovDown(pointer(200, 60));
    expect(el._edit).toHaveBeenCalledOnce();
    expect(el._nudge).toBeUndefined();
    el._ovCancel();
    vi.advanceTimersByTime(700);
    expect(el._edit).toHaveBeenCalledOnce();
  });
  it("long-press conversion rejects a different pointer, a changed gap or a missing drag", () => {
    for (const interruption of ["pointer", "gap", "missing"]) {
      const el = editor(); el._ovDown(pointer(180, 60));
      if (interruption === "pointer") el._drag.id = 8;
      if (interruption === "gap") el.program.profiles[0].days[0] = [];
      if (interruption === "missing") el._drag = undefined;
      vi.advanceTimersByTime(450);
      expect(el._mv).toBeUndefined();
      expect(navigator.vibrate).not.toHaveBeenCalled();
    }
  });
  it("a slot tap more than eight pixels away does not select it on release", () => {
    const el = editor();
    el._ovDown(pointer(220, 60));
    el._ovUp(pointer(229, 60));
    expect(el._selected).toBeNull();
    el._ovDown(pointer(220, 60));
    el._ovUp(pointer(228, 60));
    expect(el._selected).toEqual({ kind: "slot", id: "a" });
  });
  it("cancelling an unmoved boundary keeps an existing draft but cancels the long-press timer", () => {
    const el = editor();
    el._draft = [slot()];
    el._ovDown(pointer(180, 60));
    el._ovCancel();
    expect(el._draft).toEqual([slot()]);
    vi.advanceTimersByTime(450);
    expect(el._mv).toBeUndefined();
    expect(navigator.vibrate).not.toHaveBeenCalled();
  });
  it("a cross-day release with a vanished source reports failure without saving", () => {
    const el = editor(); const dest = editor(); dest.weekday = 1;
    el._edit = vi.fn(); el._mvBegin(pointer(220, 60), "a");
    el._mv.to = dest; el._mv.moved = true;
    el.program.profiles[0].days[0] = [];
    expect(el._mvUp(pointer(220, 60))).toBe(true);
    expect(el._edit).not.toHaveBeenCalled();
    expect(el._error).not.toBe("");
  });
});

describe("one-shots and vanished modes during a drag", () => {
  it("selects a one-shot with a handle tap, and ignores missing handles", () => {
    const el = editor([{ id: "a", label: "l", start: { time: "06:00" } }]);
    el._ovDown(pointer(180, 60));
    el._selected = null; // handle release selects its one-shot marker
    el._ovUp(pointer(180, 60));
    expect(el._selected).toEqual({ kind: "slot", id: "a" });
    el._selected = null;
    el._ovDown(pointer(180, 60)); el.program.profiles[0].days[0] = []; el._selected = null;
    el._ovUp(pointer(180, 60));
    expect(el._selected).toBeNull();
  });
  it("a drag whose original mode disappears cancels without leaving a draft", () => {
    const el = editor();
    el._ovDown(pointer(180, 60)); el._drag.profileId = "gone";
    el._ovMove(pointer(200, 60));
    expect([el._drag, el._draft, el._bubble]).toEqual([undefined, null, null]);
    el._mvBegin(pointer(220, 60), "a"); el._mv.profileId = "gone";
    expect(el._mvMove(pointer(240, 60))).toBe(true);
    expect([el._mv, el._draft, el._moving]).toEqual([undefined, null, false]);
  });
  it("keeps a one-shot in place and explains refusal when its body is dragged", () => {
    const el = editor([{ id: "a", label: "l", start: { time: "06:00" } }]);
    el._edit = vi.fn(); el._mvBegin(pointer(180, 60), "a");
    expect(el._mv.refused).toBe(true);
    el._mvMove(pointer(190, 60));
    expect(el._error).not.toBe(""); expect(el._draft).toBeNull();
    el._mvUp(pointer(190, 60));
    expect(el._edit).not.toHaveBeenCalled();
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
    expect(edge._draft[0].start).toEqual({ time: "00:00" }); // cannot go before midnight
  });
  it("a boundary is moved together with the slots that share it", () => {
    const el = mk([A, { id: "b", label: "l", start: { time: "09:00" }, end: { time: "10:00" } }]);
    expect(el._boundaryIds({ id: "a", edge: "end" }, el._ctx()).sort()).toEqual(["a", "b"]);
    expect(el._boundaryIds({ id: "a", edge: "start" }, el._ctx())).toEqual(["a"]);
    expect(el._boundaryIds({ id: "zz", edge: "start" }, el._ctx())).toEqual(["zz"]);
  });
});
