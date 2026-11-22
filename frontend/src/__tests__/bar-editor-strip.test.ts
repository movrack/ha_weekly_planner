import { describe, expect, it, vi } from "vitest";
import { t } from "../i18n";
import { confirmAction } from "../components/confirm";
import { flat, handlers } from "./helpers/tpl";
import { attributes, editor, slot, useBarEditorGlobals } from "./helpers/bar-editor";

vi.mock("../components/confirm", () => ({ confirmAction: vi.fn(async () => true) }));
useBarEditorGlobals();

describe("copy conflict choices", () => {
  it("shows before and after schedules, toggles one day's choice, and submits all choices", () => {
    const el = editor();
    el.program.profiles[0].days[1] = [slot("busy", "10:00", "14:00")];
    el._conflict = { id: "a", to: [1, 2], days: [1], skip: [] };
    let tpl = el._conflictDialog();
    expect(flat(tpl)).toContain('Tuesday');
    expect(flat(tpl)).toContain('role="radiogroup"');
    expect(attributes(tpl, "aria-checked")).toEqual([true, false]);
    expect(attributes(tpl, "?disabled")).toEqual([false]);
    const radios = handlers(tpl).filter(h => h.event === "click");
    radios[1].fn();
    expect(el._conflict.skip).toEqual([1]);
    tpl = el._conflictDialog();
    const values: any[] = [];
    function spans(v: any): void {
      if (Array.isArray(v)) { v.forEach(spans); return; }
      if (!v?.strings) return;
      v.strings.forEach((s: string, i: number) => {
        if (s.endsWith('.spans=')) values.push(v.values[i]);
        else spans(v.values[i]);
      });
    }
    spans(tpl);
    expect(values[0]).toEqual(values[1]); // skip retains the destination's schedule
    expect(values[0][0]).toMatchObject({ start: 600, end: 840 });
    handlers(tpl).filter(h => h.event === "click")[1].fn();
    expect(el._conflict.skip).toEqual([1]); // no duplicate
    handlers(el._conflictDialog()).filter(h => h.event === "click")[0].fn();
    expect(el._conflict.skip).toEqual([]);
    el._doCopy = vi.fn();
    handlers(el._conflictDialog()).filter(h => h.event === "click").slice(-1)[0]!.fn();
    expect(el._doCopy).toHaveBeenCalledWith("a", [1, 2], []);
    const stopPropagation = vi.fn();
    handlers(el._conflictDialog()).find(h => h.event === "closed")!.fn({ stopPropagation });
    expect(stopPropagation).toHaveBeenCalledOnce();
    expect(el._conflict).toBeNull();
  });
  it("disables submission only when every destination is skipped and cancels without saving", () => {
    const el = editor(); el._conflict = { id: "a", to: [1, 2], days: [1, 2], skip: [1, 2] };
    expect(attributes(el._conflictDialog(), "?disabled")).toEqual([true]);
    el._conflict.skip = [1];
    expect(attributes(el._conflictDialog(), "?disabled")).toEqual([false]);
    handlers(el._conflictDialog()).filter(h => h.event === "click").slice(-2)[0]!.fn();
    expect(el._conflict).toBeNull();
    expect(flat(el._conflictDialog())).toBe("");
  });
  it("copies only non-skipped days and returns null for a source removed since the dialog opened", async () => {
    const el = editor(); el._edit = vi.fn(); el._copyOpen = true; el._copyDays = [1, 2]; el._conflict = {};
    await el._doCopy("a", [1, 2], [2]);
    expect([el._copyOpen, el._copyDays, el._conflict]).toEqual([false, [], null]);
    const [op, touched, ids] = el._edit.mock.calls[0];
    expect([touched, ids]).toEqual([[1], ["a"]]);
    const days = el.program.profiles[0].days;
    expect(op(days, (id: string) => id)[1][0].start).toEqual({ time: "06:00" });
    expect(op(days, (id: string) => id)[2]).toEqual([]);
    expect(op(days, () => "gone")).toBeNull();
    await el._doCopy("a", [1], [1]);
    expect(el._edit).toHaveBeenCalledOnce();
  });
});

describe("strip controls", () => {
  it("only enables a cut for a splittable duration or a gap with a default label", () => {
    const el = editor(); el._selected = { kind: "slot", id: "a" };
    expect(attributes(el._strip(), "?disabled")[1]).toBe(false);
    el.program.profiles[0].days[0][0].end = undefined;
    expect(attributes(el._strip(), "?disabled")[1]).toBe(true);
    expect(flat(el._strip())).toMatch(/id=why-cut role="status">Split in two needs/);
    el.program.profiles[0].days[0] = [slot("a", "06:00", "06:05")];
    expect(attributes(el._strip(), "?disabled")[1]).toBe(true);
    expect(flat(el._strip())).toContain(`id=why-cut role="status">${t("en", "strip_cut_short")}</p>`);
    el.program.profiles[0].days[0] = [];
    el._selected = { kind: "gap", start: 0, end: 1440 };
    expect(attributes(el._strip(), "?disabled")[1]).toBe(false);
    el.data.labels = []; el.program.entities[0].default_label = null;
    expect(attributes(el._strip(), "?disabled")[1]).toBe(true);
    expect(flat(el._strip())).toContain(`id=why-cut role="status">${t("en", "strip_cut_nodefault")}</p>`);
    expect(flat(el._strip())).toContain('content-copy'); // kept, greyed (no schedule here)
    expect(attributes(el._strip(), "?disabled").slice(0, 3)).toEqual([true, true, true]);
    expect(flat(el._strip())).toContain('id=why-strip role="status">No schedule here.</p>');
  });
  it("stays on screen with nothing chosen on the bar, every action greyed with the reason (EN and FR)", () => {
    const el = editor(); el._selected = null;
    const out = flat(el._strip());
    expect(out).toContain(`id=why-strip role="status">${t("en", "strip_no_sel")}</p>`);
    expect(attributes(el._strip(), "?disabled")).toEqual([true, true, true, true]);
    expect(out.match(/aria-describedby=why-strip/g)).toHaveLength(3);
    expect(t("fr", "strip_no_sel")).not.toBe(t("en", "strip_no_sel"));
  });
  it("Clear and Copy to are usable on a schedule and stay on screen, greyed with their reason, on a gap", () => {
    const el = editor(); el._selected = { kind: "slot", id: "a" };
    expect(attributes(el._strip(), "?disabled")[0]).toBe(false);
    expect(attributes(el._strip(), "aria-disabled")).toContain("false");
    expect(flat(el._strip())).not.toContain("why-strip");
    el._selected = { kind: "gap", start: 0, end: 1440 };
    const out = flat(el._strip());
    expect(out).toContain("mdi:close-circle-outline");
    expect(out.match(/aria-describedby=why-strip/g)).toHaveLength(2);
    expect(t("fr", "strip_no_slot")).toBe("Aucun horaire ici.");
  });
  it("opens a day picker, clears its previous choices and routes its buttons", () => {
    const el = editor(); el._selected = { kind: "slot", id: "a" };
    el._nothing = vi.fn(); el._cut = vi.fn(); el._copyGo = vi.fn();
    let clicks = handlers(el._strip()).filter(h => h.event === "click");
    clicks[0].fn(); expect(el._nothing).toHaveBeenCalledOnce();
    clicks[1].fn(); expect(el._cut).toHaveBeenCalledOnce();
    el._copyDays = [4]; clicks[2].fn();
    expect([el._copyOpen, el._copyDays]).toEqual([true, []]);
    expect(flat(el._strip())).toContain('copy-hint');
    expect(flat(el._strip()).match(/role="checkbox"/g)).toHaveLength(6);
    clicks = handlers(el._strip()).filter(h => h.event === "click");
    clicks[3].fn(); expect(el._copyDays).toEqual([1]);
    expect(attributes(el._strip(), "aria-checked")).toEqual([true, false, false, false, false, false]);
    expect(flat(el._strip())).not.toContain('copy-hint');
    clicks.slice(-1)[0]!.fn(); expect(el._copyGo).toHaveBeenCalledOnce();
    el._pickLabel = vi.fn(); const stopPropagation = vi.fn();
    handlers(el._strip()).find(h => h.event === "label-change")!.fn({ detail: "l", stopPropagation });
    expect(stopPropagation).toHaveBeenCalledOnce(); expect(el._pickLabel).toHaveBeenCalledWith("l");
  });
  it("hides the strip only while a slot is dragged, and greys it with a reason while the shared-devices question is open", () => {
    const el = editor(); el._selected = { kind: "slot", id: "a" };
    expect(flat(el.render())).toContain('class="strip"');
    el._moving = true; expect(flat(el.render())).not.toContain('class="strip"');
    el._moving = false; el._ask = { count: 1, others: [] };
    const asking = flat(el.render());
    expect(asking).toContain('class="strip"');
    expect(asking).toContain(`id=why-strip role="status">${t("en", "strip_ask_first")}</p>`);
    expect(attributes(el._strip(), "?disabled")).toEqual([true, true, true, true]);
    expect(t("fr", "strip_ask_first")).not.toBe(t("en", "strip_ask_first"));
    el._ask = null; el.editing = false;
    expect(flat(el.render())).not.toContain('class="strip"');
  });
});

describe("strip edit operations", () => {
  it("erasing asks which schedule, then deletes only its remapped slot on the chosen day", async () => {
    const el = editor(); el._selected = { kind: "slot", id: "a" }; el._edit = vi.fn();
    vi.mocked(confirmAction).mockResolvedValueOnce(false);
    await el._nothing();
    expect(el._selected).toEqual({ kind: "slot", id: "a" });
    expect(el._edit).not.toHaveBeenCalled();
    vi.mocked(confirmAction).mockResolvedValueOnce(true);
    await el._nothing();
    expect(vi.mocked(confirmAction).mock.calls.slice(-1)[0]?.slice(1)).toEqual(["Delete this schedule? Open · 6 am – 12 pm", "Yes, delete it", "No, keep it"]);
    expect(el._selected).toBeNull();
    const [op, touched, ids] = el._edit.mock.calls[0];
    expect([touched, ids]).toEqual([[0], ["a"]]);
    const days = [[slot(), slot("copy"), slot("keep", "16:00", "17:00")], [slot("other")], [], [], [], [], []];
    expect(op(days, () => "copy").map((d: any[]) => d.map(s => s.id))).toEqual([["a", "keep"], ["other"], [], [], [], [], []]);
    vi.mocked(confirmAction).mockClear();
    await el._nothing();
    expect(confirmAction).not.toHaveBeenCalled();
    el._selected = { kind: "gap", start: 720, end: 1440 }; await el._nothing();
    expect(confirmAction).not.toHaveBeenCalled();
  });
  it("cutting a slot keeps its first half and focuses the resulting handle", async () => {
    const el = editor(); el._selected = { kind: "slot", id: "a" }; el._edit = vi.fn();
    const focus = vi.fn(); const querySelector = vi.fn(() => ({ focus }));
    Object.defineProperty(el, "renderRoot", { value: { querySelector }, configurable: true });
    Object.defineProperty(el, "updateComplete", { value: { then: (callback: () => void) => { callback(); return Promise.resolve(); } } });
    el._cut(); await Promise.resolve();
    expect(el._hsel).toEqual({ id: "a", edge: "end" });
    expect(el._keep.size).toBe(0);
    expect(querySelector).toHaveBeenCalledWith('[data-h="a:end"]');
    expect(focus).toHaveBeenCalledOnce();
    const [op, touched, ids] = el._edit.mock.calls[0];
    expect([touched, ids]).toEqual([[0], ["a"]]);
    const days = [[slot("copy")], [], [], [], [], [], []];
    expect(op(days, () => "copy")[0][0].end).toEqual({ time: "09:00" });
    expect(op(days, () => "gone")).toBeNull();
    expect(el._selected).toEqual({ kind: "slot", id: "a" });
  });
  it("cutting a gap selects a stable new slot and protects it against merging", async () => {
    const el = editor([]); el._selected = { kind: "gap", start: 0, end: 1440 }; el._edit = vi.fn();
    Object.defineProperty(el, "updateComplete", { value: { then: (callback: () => void) => { callback(); return Promise.resolve(); } } });
    Object.defineProperty(el, "renderRoot", { value: { querySelector: () => null }, configurable: true });
    el._cut(); await Promise.resolve();
    const id = el._selected.id;
    expect(id).toEqual(expect.any(String));
    expect(el._keep.has(id)).toBe(true);
    expect(el._hsel).toEqual({ id, edge: "start" });
    const [op, touched, ids] = el._edit.mock.calls[0];
    expect([touched, ids]).toEqual([[0], []]);
    const out = op(el.program.profiles[0].days, (s: string) => s);
    expect(out[0]).toEqual([{ id, start: { time: "12:00" }, end: { time: "24:00" }, conditions: [], label: "l" }]);
    expect(op(el.program.profiles[0].days, (s: string) => s)[0][0].id).toBe(id);
  });
  it("does not cut a missing selection, a one-shot or an unlabelled gap", () => {
    const el = editor(); el._edit = vi.fn();
    el._cut(); expect(el._edit).not.toHaveBeenCalled();
    el._selected = { kind: "slot", id: "a" }; el.program.profiles[0].days[0][0].end = undefined;
    el._cut(); expect(el._edit).not.toHaveBeenCalled();
    el.program.profiles[0].days[0] = []; el.data.labels = []; el.program.entities[0].default_label = null;
    el._selected = { kind: "gap", start: 0, end: 1440 };
    el._cut(); expect(el._edit).not.toHaveBeenCalled();
  });
  it("picking a label on a gap creates and selects the same stable slot on every rebuild", () => {
    const el = editor([]); el._edit = vi.fn();
    el._pickLabel("l"); expect(el._edit).not.toHaveBeenCalled();
    el._selected = { kind: "gap", start: 0, end: 1440 };
    el._pickLabel(null); expect(el._edit).not.toHaveBeenCalled();
    el._pickLabel("l");
    const [op, touched, ids] = el._edit.mock.calls[0];
    const id = el._selected.id;
    expect([touched, ids]).toEqual([[0], []]);
    const out = op(el.program.profiles[0].days, (x: string) => x);
    expect(out[0][0]).toMatchObject({ id, label: "l", start: { time: "00:00" }, end: { time: "24:00" } });
    expect(op(el.program.profiles[0].days, (x: string) => x)[0][0].id).toBe(id);
  });
  it("copying requires a slot and destination, sorts a copied list and opens only actual conflicts", () => {
    const el = editor(); el._doCopy = vi.fn();
    el._copyDays = [2, 1];
    el._copyGo(); expect(el._doCopy).not.toHaveBeenCalled();
    el._selected = { kind: "slot", id: "a" }; el._copyDays = [];
    el._copyGo(); expect(el._doCopy).not.toHaveBeenCalled();
    el._copyDays = [2, 1]; el._copyGo();
    expect(el._doCopy).toHaveBeenCalledWith("a", [1, 2], []);
    expect(el._copyDays).toEqual([2, 1]);
    el.program.profiles[0].days[2] = [slot("busy")];
    el._copyGo();
    expect(el._conflict).toEqual({ id: "a", to: [1, 2], days: [2], skip: [] });
    expect(el._doCopy).toHaveBeenCalledOnce();
    el._toggleDay(2); expect(el._copyDays).toEqual([1]);
    el._toggleDay(3); expect(el._copyDays).toEqual([1, 3]);
  });
});

describe("names of the strip and conflict controls", () => {
  it("the strip names its actions, day group and time group without losing the selected label", () => {
    const el = editor(); el._selected = { kind: "slot", id: "a" };
    const tpl = el._strip();
    expect(attributes(tpl, "aria-label")).toEqual(["In time", "Split in two. Split this schedule in two parts, one after the other in time", "On other days", "Copy to other days Copy this schedule to other days"]);
    expect(attributes(tpl, "title")).toEqual(["Split this schedule in two parts, one after the other in time", "Copy this schedule to other days"]);
    expect(attributes(tpl, ".entityIds")).toEqual([["cover.a"]]);
    expect(attributes(tpl, ".value")).toEqual(["l"]);
    const markup = flat(tpl);
    expect(markup).toContain('>Delete</button>');
    expect(markup).toContain('>Split in two</button>');
    expect(markup).toContain('>Copy to other days</button>');
    el._copyOpen = true;
    expect(attributes(el._strip(), "aria-expanded")).toEqual([true]);
    expect(attributes(el._strip(), "aria-label").slice(-1)[0]).toBe("Copy");
    expect(attributes(el._strip(), "title").slice(-1)[0]).toBe("Copy");
    expect(flat(el._strip())).toContain('Choose at least one day.');
    el._selected = { kind: "gap", start: 720, end: 1440 };
    expect(attributes(el._strip(), ".value")).toEqual([null]);
    expect(flat(el._strip())).not.toContain('class="copy"');
  });
  it("the time bubble is not shown when the hover tip already says the same time", () => {
    const el = editor();
    el._bubble = { m: 480 };
    expect(el._showBubble).toBe(true);
    Object.defineProperty(el, "_tipText", { get: () => `Comfort · ${el._clock(480)} – 11 am` });
    expect(el._showBubble).toBe(false);
  });
  it("the conflict dialog names before, after and each radio choice and carries transformed spans", () => {
    const el = editor(); el.program.profiles[0].days[1] = [slot("busy", "10:00", "14:00")];
    el._conflict = { id: "a", to: [1], days: [1], skip: [] };
    const tpl = el._conflictDialog();
    expect(attributes(tpl, "heading")).toEqual(["Tuesday already has schedules"]);
    expect(attributes(tpl, "aria-label")).toEqual(["Tuesday"]);
    expect(attributes(tpl, ".now")).toEqual([null, null]);
    const spans = attributes(tpl, ".spans");
    expect(spans[0].map((s: any) => [s.start, s.end])).toEqual([[600, 840]]);
    expect(spans[1].map((s: any) => [s.start, s.end])).toEqual([[360, 840]]);
    const markup = flat(tpl);
    for (const text of [">Before</span>", ">After</span>", ">Replace</button>", ">Do not copy this day</button>", ">Cancel</button>", ">Copy</button>"]) expect(markup).toContain(text);
    expect(attributes(tpl, "class")).toEqual(["on", ""]);
    el._conflict.skip = [1];
    expect(attributes(el._conflictDialog(), "class")).toEqual(["", "on"]);
    expect(attributes(el._conflictDialog(), "aria-checked")).toEqual([false, true]);
  });
});
