import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpSchedule } from "../components/schedule-dialog";
import { WpModeNotice } from "../components/mode-notice";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { confirmAction } from "../components/confirm";
import { flat, handlers, find } from "./helpers/tpl";
import type { Program } from "../types";

vi.mock("../components/confirm", () => ({ confirmAction: vi.fn(async () => true), pauseChoice: vi.fn(async () => "none") }));
vi.mock("../preview-cache", async (orig) => ({ ...(await orig<typeof import("../preview-cache")>()),
  fetchPreviewResponse: vi.fn(async () => ({ slots: [] })) }));

const slot = (id: string, s = "08:00", e = "10:00") => ({ id, start: { time: s }, end: { time: e }, label: "comfort", seed: "keep" });
const week = (first: any[] = []) => { const d = Array.from({ length: 7 }, () => [] as any[]); d[0] = first; d[2] = first.map((x) => ({ ...x, id: `${x.id}b` })); return d; };
const mode = (over: Record<string, unknown> = {}) =>
  ({ selector: "input_select.m", default: "Home", active: "Home", options: ["Home", "Winter", "Away"], available: true, ...over });
const mkProgram = (): Program => ({ id: "p", name: "Office", revision: 1, priority: 10, enabled: true, reapply: true, conditions: [],
  entities: [{ entity_id: "switch.demo", default_label: null, label_overrides: {} }],
  profiles: [{ id: "h", name: "Home", days: week([slot("a")]) }, { id: "o", name: "Old", days: week([slot("c", "06:00", "07:00")]) }] } as any);

function make(modeInfo: any = mode(), program = mkProgram()) {
  const view = new WpSchedule() as any;
  const events: any[] = [];
  view.hass = { language: "en", config: { time_zone: "UTC" }, states: { "switch.demo": { entity_id: "switch.demo", state: "on", attributes: {} } },
    services: { switch: { turn_on: { name: "On", target: { entity: { domain: "switch" } } } } },
    callWS: vi.fn(async (m: any) => (m.type === "weekly_planner/program/save" ? { program: { ...m.program, revision: m.program.revision + 1 } } : {})) };
  view.dispatchEvent = (e: any) => { events.push(e); return true; };
  view.scope = { kind: "program", programId: "p" };
  view.data = { programs: [program], status: {}, can_edit: true, read_only: false, mode: modeInfo,
    labels: [{ id: "comfort", name: "Comfort", color: "#f00", action: { kind: "service", service: "switch.turn_on" } }] };
  view.renderRoot = { querySelector: () => null };
  view.requestUpdate = vi.fn();
  return { view, events, program };
}
beforeEach(() => {
  (globalThis as any).CustomEvent ??= class { type: string; detail: unknown; constructor(t: string, i: any) { this.type = t; this.detail = i?.detail; } };
  vi.stubGlobal("requestAnimationFrame", (f: () => void) => f());
  vi.mocked(confirmAction).mockReset(); vi.mocked(confirmAction).mockResolvedValue(true);
});
afterEach(() => vi.unstubAllGlobals());

describe("mode choice in the schedules screen", () => {
  it("shows no mode choice without a selector, and uses the first schedules", () => {
    const { view, program } = make(mode({ selector: null, active: null, options: [] }));
    const html = flat(view.render());
    expect(html).not.toContain("tablist"); expect(html).not.toContain("mode_not_active");
    expect(view._modeProfile(program).id).toBe("h");
    expect(view._modeOnly).toBe(false);
  });
  it("opens on the active mode: one tab per option, then the program's modes without option", () => {
    const { view } = make(mode({ active: "Winter" }));
    expect(view._openMode).toBe("Winter");
    expect(view._modes()).toEqual([
      { name: "Home", orphan: false }, { name: "Winter", orphan: false }, { name: "Away", orphan: false }, { name: "Old", orphan: true }]);
    const html = flat(view.render());
    expect(html).toContain('role="tablist"');
    expect(html.match(/role="tab"/g)).toHaveLength(4);
    expect(html.match(/mdi:check/g)).toHaveLength(1);
    expect(html).toContain("no option");
    expect(html).toContain("modechip on ");
    expect(html).toContain("modechip  orphan");
  });
  it("marks only the opened tab as selected and reachable by Tab", () => {
    const { view } = make();
    const html = flat(view.render());
    expect(html.match(/aria-selected=/g)).toHaveLength(4);
    expect(handlers(view.render()).filter((h) => h.event === "keydown")).toHaveLength(4);
  });
  it("says a mode that is not active is not, and shows its own schedules", () => {
    const { view } = make();
    expect(flat(view.render())).not.toContain("This mode is not active");
    expect(view._rows()).toHaveLength(1);
    view._pickMode("Old");
    const html = flat(view.render());
    expect(html).toContain("This mode is not active");
    expect(view._modeOnly).toBe(true);
    expect(view._rows()[0].group.slot.id).toBe("c");
    expect(html).not.toContain('class="switch"');
  });
  it("shows an empty week for a mode with no schedules yet", () => {
    const { view } = make();
    view._pickMode("Away");
    expect(view._modeProfile(view._programs[0])).toBeUndefined();
    expect(view._rows()).toHaveLength(0);
    expect(flat(view.render())).toContain("No schedule");
  });
  it("moves between the modes with the arrow keys", () => {
    const { view } = make();
    const modes = view._modes();
    const key = (k: string) => view._modeKey({ key: k, preventDefault() {} }, modes);
    key("ArrowRight"); expect(view._openMode).toBe("Winter");
    key("End"); expect(view._openMode).toBe("Old");
    key("ArrowRight"); expect(view._openMode).toBe("Home");
    key("ArrowLeft"); expect(view._openMode).toBe("Old");
    key("Home"); expect(view._openMode).toBe("Home");
    key("x"); expect(view._openMode).toBe("Home");
  });
  it("does not switch mode while a row is being edited", () => {
    const { view } = make();
    view._open = "new";
    view._pickMode("Winter");
    expect(view._openMode).toBe("Home");
    expect(flat(view.render())).toContain("disabled=");
  });
  it("follows the active mode until another one is chosen, and ignores a mode that is gone", () => {
    const { view } = make();
    view.data = { ...view.data, mode: mode({ active: "Winter" }) };
    expect(view._openMode).toBe("Winter");
    view._viewMode = "Gone";
    expect(view._openMode).toBe("Winter");
  });
  it("creates the mode's schedules on the first save", async () => {
    const { view } = make();
    view._pickMode("Away");
    view._add();
    await view._saveRow();
    const saved = view.hass.callWS.mock.calls.map((c: any) => c[0]).find((m: any) => m.type === "weekly_planner/program/save").program;
    expect(saved.profiles).toHaveLength(3);
    const created = saved.profiles[2];
    expect(created.name).toBe("Away");
    expect(created.id).toMatch(/^[0-9a-f]{12}$/);
    expect(created.days.flat()).toHaveLength(7);
    expect(saved.profiles[0].days.flat()).toHaveLength(2); // the other modes are untouched
  });
  it("edits the existing schedules of the opened mode, not those of the active one", async () => {
    const { view } = make();
    view._pickMode("Old");
    view._add();
    await view._saveRow();
    const saved = view.hass.callWS.mock.calls.map((c: any) => c[0]).find((m: any) => m.type === "weekly_planner/program/save").program;
    expect(saved.profiles).toHaveLength(2);
    expect(saved.profiles[1].days.flat().length).toBeGreaterThan(2);
    expect(saved.profiles[0].days.flat()).toHaveLength(2);
  });
});

describe("copy from another mode", () => {
  it("is offered with a selector and another mode that has schedules", () => {
    const { view } = make();
    expect(view._copySources()).toEqual(["Old"]);
    const html = flat(view.render());
    expect(html).toContain("Copy from another mode");
    expect(html).not.toContain("Copy the schedules of");
  });
  it("is not offered without a selector, without sources, read-only, or while editing", () => {
    expect(flat(make(mode({ selector: null, options: [], active: null })).view.render())).not.toContain("Copy from another mode");
    const none = mkProgram(); none.profiles[1].days = week();
    expect(flat(make(mode(), none).view.render())).not.toContain("Copy from another mode");
    const ro = make(); ro.view.data.read_only = true;
    expect(flat(ro.view.render())).not.toContain("Copy from another mode");
    const ed = make(); ed.view._open = "new";
    expect(flat(ed.view.render())).not.toContain("Copy from another mode");
  });
  it("opens the list of source modes", () => {
    const { view } = make();
    find(view.render(), "click", "row copy").fn();
    const html = flat(view.render());
    expect(html).toContain("Copy the schedules of");
    expect(html).toContain("Old</button>");
  });
  it("copies the seven days as new independent slots without asking when the mode is empty", async () => {
    const { view, events } = make();
    view._pickMode("Away");
    await view._copyFrom("Old");
    expect(confirmAction).not.toHaveBeenCalled();
    const saved = view.hass.callWS.mock.calls.map((c: any) => c[0]).find((m: any) => m.type === "weekly_planner/program/save").program;
    const away = saved.profiles.find((p: any) => p.name === "Away");
    expect(away.days.flat().map((s: any) => s.start.time)).toEqual(["06:00", "06:00"]);
    const ids = away.days.flat().map((s: any) => s.id);
    expect(ids).not.toContain("c"); expect(ids).not.toContain("cb");
    expect(away.days.flat().every((s: any) => s.seed === undefined)).toBe(true);
    expect(saved.profiles.find((p: any) => p.name === "Old").days.flat().map((s: any) => s.id)).toEqual(["c", "cb"]);
    expect(events.some((e) => e.type === "schedule-program-saved")).toBe(true);
    expect(view._note).toContain("Schedules copied from Old");
  });
  it("asks before replacing existing schedules, and stops on No", async () => {
    const { view } = make();
    vi.mocked(confirmAction).mockResolvedValueOnce(false);
    await view._copyFrom("Old");
    expect(confirmAction).toHaveBeenCalledWith(view, "Home already has schedules. Replace them with those of Old?", "Replace", "No");
    expect(view.hass.callWS).not.toHaveBeenCalled();
    await view._copyFrom("Old");
    const saved = view.hass.callWS.mock.calls[0][0].program;
    expect(saved.profiles.find((p: any) => p.name === "Home").days.flat().map((s: any) => s.start.time)).toEqual(["06:00", "06:00"]);
    expect(saved.profiles).toHaveLength(2);
  });
  it("copies nothing onto itself and nothing without a selector", async () => {
    const { view } = make();
    await view._copyFrom("Home");
    const none = make(mode({ selector: null, options: [], active: null }));
    await none.view._copyFrom("Old");
    expect(view.hass.callWS).not.toHaveBeenCalled(); expect(none.view.hass.callWS).not.toHaveBeenCalled();
  });
});

describe("mode notices", () => {
  const notice = (m: any, lang = "en") => {
    const n = new WpModeNotice() as any;
    n.hass = { language: lang, callWS: vi.fn(async () => ({})) };
    n.data = { mode: mode(m) };
    return n;
  };
  const recent = () => new Date(Date.now() - 3600_000).toISOString();

  it("renders nothing without a selector or without anything to say", () => {
    expect(flat(notice({ selector: null, proposals: [{ old: "X", candidates: ["Y"] }] }).render())).toBe("");
    expect(flat(notice({}).render())).toBe("");
    expect(flat(notice({ renamed: [{ old: "A", new: "B", at: new Date(Date.now() - 8 * 86400_000).toISOString() }] }).render())).toBe("");
  });
  it("proposes each candidate and the deletion, in both languages", () => {
    const n = notice({ proposals: [{ old: "Winter", candidates: ["Cold", "Snow"] }] });
    const html = flat(n.render());
    expect(html).toContain("The mode Winter is no longer in the selector. Did it become…?");
    expect(html).toContain("Cold"); expect(html).toContain("Snow"); expect(html).toContain("No, delete it");
    const fr = flat(notice({ proposals: [{ old: "Hiver", candidates: ["Froid"] }] }, "fr").render());
    expect(fr).toContain("Le mode Hiver n’existe plus dans le sélecteur. Est-ce devenu… ?");
    expect(fr).toContain("Non, le supprimer");
  });
  it("calls resolve with the chosen candidate", async () => {
    const n = notice({ proposals: [{ old: "Winter", candidates: ["Cold", "Snow"] }] });
    const clicks = handlers(n.render()).filter((h) => h.event === "click");
    await clicks[1].fn();
    expect(n.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/mode/resolve", old: "Winter", new: "Snow" });
  });
  it("deletes a mode only after a confirmation", async () => {
    const n = notice({ proposals: [{ old: "Winter", candidates: ["Cold"] }] });
    const del = () => handlers(n.render()).filter((h) => h.event === "click")[1].fn();
    vi.mocked(confirmAction).mockResolvedValueOnce(false);
    await del();
    expect(n.hass.callWS).not.toHaveBeenCalled();
    await del();
    expect(n.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/mode/resolve", old: "Winter", new: null });
    expect(vi.mocked(confirmAction).mock.calls[0][1]).toBe("Delete the mode Winter and all its schedules?");
  });
  it("offers only the deletion for an orphan with no candidate", () => {
    const n = notice({ orphans: ["Old", "Winter"], proposals: [{ old: "Winter", candidates: ["Cold"] }] });
    const html = flat(n.render());
    expect(html.match(/No, delete it/g)).toHaveLength(2);
    expect(html).toContain("The mode Old is no longer in the selector.</p>");
    expect(html).not.toContain("The mode Old is no longer in the selector. Did");
  });
  it("shows the last recent rename with an undo button", async () => {
    const n = notice({ renamed: [{ old: "A", new: "B", at: recent() }, { old: "Hiver", new: "Winter", at: recent() }] });
    const html = flat(n.render());
    expect(html).toContain("Renamed from Hiver"); expect(html).not.toContain("Renamed from A");
    await handlers(n.render()).filter((h) => h.event === "click")[0].fn();
    expect(n.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/mode/undo_rename", new: "Winter" });
  });
  it("shows a failure and keeps working", async () => {
    const n = notice({ proposals: [{ old: "W", candidates: ["C"] }] });
    n.hass.callWS.mockRejectedValueOnce(new Error("nope"));
    await handlers(n.render()).filter((h) => h.event === "click")[0].fn();
    expect(flat(n.render())).toContain("Error: nope");
    expect(n._busy).toBe(false);
  });
  it("is on the card under the mode line, and in the schedules screen", () => {
    const c = new WeeklyPlannerCard() as any;
    c.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, services: {}, callWS: vi.fn() };
    c._config = {};
    c._data = { labels: [], status: {}, can_edit: true, read_only: false, vacation: false, programs: [], mode: mode({ proposals: [{ old: "W", candidates: ["C"] }] }) };
    const html = flat(c.render());
    expect(html.indexOf("mode-line")).toBeLessThan(html.indexOf("wp-mode-notice"));
    expect(flat(make().view.render())).toContain("wp-mode-notice");
  });
});
