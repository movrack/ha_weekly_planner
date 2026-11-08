import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpSchedule } from "../components/schedule-dialog";
import { WpModeNotice } from "../components/mode-notice";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { chooseAction, confirmAction } from "../components/confirm";
import { activeFollow, activeProfile, effectiveProfile } from "../planner";
import { flat, handlers, find } from "./helpers/tpl";
import type { Program } from "../types";

vi.mock("../components/confirm", () => ({
  confirmAction: vi.fn(async () => true), pauseChoice: vi.fn(async () => "none"), chooseAction: vi.fn(async () => "source") }));
vi.mock("../preview-cache", async (orig) => ({ ...(await orig<typeof import("../preview-cache")>()),
  fetchPreviewResponse: vi.fn(async () => ({ slots: [] })) }));

const slot = (id: string, s = "08:00", e = "10:00") => ({ id, start: { time: s }, end: { time: e }, label: "comfort", seed: "keep" });
const week = (first: any[] = []) => { const d = Array.from({ length: 7 }, () => [] as any[]); d[0] = first; return d; };
const empty = () => week();
const mode = (over: Record<string, unknown> = {}) =>
  ({ selector: "input_select.m", default: "Home", active: "Holiday", options: ["Home", "Away", "Holiday"], available: true, ...over });
/** Home has schedules, Away has others, Holiday follows Home. */
const mkProgram = (): Program => ({ id: "p", name: "Office", revision: 1, priority: 10, enabled: true, reapply: true, conditions: [],
  entities: [{ entity_id: "switch.demo", default_label: null, label_overrides: {} }],
  profiles: [{ id: "h", name: "Home", days: week([slot("a")]) }, { id: "o", name: "Away", days: week([slot("c", "06:00", "07:00")]) },
    { id: "v", name: "Holiday", days: empty(), follows: "Home" }] } as any);

function make(modeInfo: any = mode(), program = mkProgram()) {
  const view = new WpSchedule() as any;
  view.hass = { language: "en", config: { time_zone: "UTC" }, states: { "switch.demo": { entity_id: "switch.demo", state: "on", attributes: {} } },
    services: { switch: { turn_on: { name: "On", target: { entity: { domain: "switch" } } } } },
    callWS: vi.fn(async (m: any) => (m.type === "weekly_planner/program/save" ? { program: { ...m.program, revision: m.program.revision + 1 } }
      : m.type === "weekly_planner/program/mode_follow" ? { program: { ...program, revision: program.revision + 1 } } : {})) };
  view.dispatchEvent = () => true;
  view.scope = { kind: "program", programId: "p" };
  view.data = { programs: [program], status: {}, can_edit: true, read_only: false, mode: modeInfo,
    labels: [{ id: "comfort", name: "Comfort", color: "#f00", action: { kind: "service", service: "switch.turn_on" } }] };
  view.renderRoot = { querySelector: () => null };
  view.requestUpdate = vi.fn();
  return { view, program };
}
const wsCalls = (view: any, type: string) => view.hass.callWS.mock.calls.map((c: any) => c[0]).filter((m: any) => m.type === type);
const follow = { type: "weekly_planner/program/mode_follow" };

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (f: () => void) => f());
  vi.mocked(confirmAction).mockReset(); vi.mocked(confirmAction).mockResolvedValue(true);
  vi.mocked(chooseAction).mockReset(); vi.mocked(chooseAction).mockResolvedValue("source");
});
afterEach(() => vi.unstubAllGlobals());

describe("resolution of a followed mode", () => {
  it("applies the schedules of the source, one step only", () => {
    const p = mkProgram();
    expect(effectiveProfile(p, p.profiles[2]).id).toBe("h");
    expect(effectiveProfile(p, p.profiles[0])).toBe(p.profiles[0]);
    expect(activeProfile(p, { mode: mode() } as any).id).toBe("h");
    expect(activeProfile(p, { mode: mode({ active: "Away" }) } as any).id).toBe("o");
    expect(activeFollow(p, { mode: mode() } as any)).toBe("Home");
    expect(activeFollow(p, { mode: mode({ active: "Away" }) } as any)).toBeNull();
    expect(activeFollow(p, { mode: mode({ active: "Unknown" }) } as any)).toBeNull();
  });
  it("ignores a link to a missing source or to a mode that follows", () => {
    const p = mkProgram();
    p.profiles[2].follows = "Gone";
    expect(effectiveProfile(p, p.profiles[2]).id).toBe("v");
    p.profiles[2].follows = "Away"; p.profiles[1].follows = "Home";
    expect(effectiveProfile(p, p.profiles[2]).id).toBe("v");
    expect(activeFollow(p, { mode: mode() } as any)).toBeNull();
  });
  it("makes the bars of the card read-only while the active mode follows (they open the screen instead)", () => {
    const c = new WeeklyPlannerCard() as any;
    c.hass = { language: "en", config: { time_zone: "UTC" }, states: {}, services: {}, callWS: vi.fn() };
    c._config = {};
    c._data = { labels: [], status: {}, can_edit: true, read_only: false, vacation: false, programs: [mkProgram()], mode: mode() };
    expect(flat(c._bar("switch.demo", c._data.programs[0], 0, "today", () => {}))).toContain("?editable=");
    const bar = c._bar("switch.demo", c._data.programs[0], 0, "today", () => {});
    expect(bar.values).toContain(false);
    c._data = { ...c._data, mode: mode({ active: "Away" }) };
    expect(c._bar("switch.demo", c._data.programs[0], 0, "today", () => {}).values).toContain(true);
  });
});

describe("the schedules screen of a mode that follows", () => {
  it("shows the schedules of the source, flags the tab, and offers the choice of the followed mode", () => {
    const { view } = make();
    expect(view._openMode).toBe("Holiday");
    expect(view._rows().map((r: any) => r.group.slot.id)).toEqual(["a"]);
    const html = flat(view.render());
    expect(html).toContain("follows Home");
    expect(html).toContain("This mode follows:");
    expect(html).toContain("Home</option>");
    expect(html).not.toContain("Copy from another mode");
  });
  it("offers only valid sources: not itself, not a mode that follows, not a mode with no schedules, none for a followed mode", () => {
    const { view, program } = make();
    program.profiles.push({ id: "n", name: "Night", days: empty(), follows: "Away" } as any);
    view.data = { ...view.data, mode: mode({ options: ["Home", "Away", "Holiday", "Night", "Fresh"] }) };
    expect(view._followSources(program)).toEqual(["Home", "Away"]);
    view._viewMode = "Fresh";
    expect(view._followSources(program)).toEqual(["Home", "Away"]); // a mode with no schedule yet may follow
    view._viewMode = "Home";
    expect(view._followSources(program)).toEqual([]); // Holiday follows Home: Home cannot follow
    expect(flat(view.render())).toContain("Followed by: Holiday");
    expect(flat(view.render())).not.toContain("This mode follows:");
  });
  it("shows nothing to choose when no mode can be followed, and only a note when read-only", () => {
    const only = mkProgram(); only.profiles = [only.profiles[0]];
    expect(flat(make(mode({ active: "Home", options: ["Home"] }), only).view.render())).not.toContain("This mode follows:");
    const ro = make(); ro.view.data.read_only = true;
    const html = flat(ro.view.render());
    expect(html).not.toContain("<select"); expect(html).toContain("Same schedules as Home.");
  });
  it("follows a mode after the choice; confirms first when the mode has schedules of its own", async () => {
    const { view } = make(mode({ active: "Away" }));
    const select = { value: "Home" };
    await view._onFollowChange(view._programs[0], { target: select });
    expect(confirmAction).toHaveBeenCalledWith(view, "Away already has schedules. They will be deleted and replaced by those of Home.", "Follow Home", "No");
    expect(wsCalls(view, follow.type)).toEqual([{ ...follow, program_id: "p", mode: "Away", follows: "Home" }]);
  });
  it("does nothing when the confirmation is refused, and puts the choice back", async () => {
    const { view } = make(mode({ active: "Away" }));
    vi.mocked(confirmAction).mockResolvedValueOnce(false);
    const select = { value: "Home" };
    await view._onFollowChange(view._programs[0], { target: select });
    expect(view.hass.callWS).not.toHaveBeenCalled();
    expect(select.value).toBe("");
  });
  it("follows without asking when the mode has no schedule", async () => {
    const { view } = make(mode({ active: "Fresh", options: ["Home", "Away", "Holiday", "Fresh"] }));
    await view._onFollowChange(view._programs[0], { target: { value: "Away" } });
    expect(confirmAction).not.toHaveBeenCalled();
    expect(wsCalls(view, follow.type)[0]).toMatchObject({ mode: "Fresh", follows: "Away" });
  });
  it("stops following with a copy, says so, and ignores an unchanged choice", async () => {
    const { view } = make();
    await view._onFollowChange(view._programs[0], { target: { value: "Home" } });
    expect(view.hass.callWS).not.toHaveBeenCalled();
    await view._onFollowChange(view._programs[0], { target: { value: "" } });
    expect(wsCalls(view, follow.type)).toEqual([{ ...follow, program_id: "p", mode: "Holiday", follows: null }]);
    expect(view._note).toBe("Holiday no longer follows Home: it has its own copy of the schedules. You can edit them now.");
  });
  it("shows the error of a refusal and keeps the choice", async () => {
    const { view } = make();
    view.hass.callWS.mockRejectedValueOnce(new Error("Mode 'Holiday' cannot follow itself"));
    const select = { value: "" };
    await view._onFollowChange(view._programs[0], { target: select });
    expect(view._error).toContain("cannot follow itself");
    expect(select.value).toBe("Home");
    expect(view._saving).toBe(false);
  });
});

describe("editing a mode that follows", () => {
  const row = (view: any) => view._rows()[0];
  it("asks first: edit the source (also valid here), or stop following", async () => {
    const { view } = make();
    const { program, group, key } = row(view);
    view._openRow(key, program, group);
    await Promise.resolve(); await Promise.resolve();
    expect(chooseAction).toHaveBeenCalledWith(view, "Holiday follows Home: it has the same schedules.", [
      { id: "source", label: "Edit Home (also applies to this mode)" }, { id: "stop", label: "Stop following" }]);
    expect(view._open).toBe(key);
    expect(view._editProfileId).toBe("h"); // the source's schedules are the ones edited
  });
  it("saves the edit in the source and leaves the follower untouched", async () => {
    const { view } = make();
    const { program, group, key } = row(view);
    view._openRow(key, program, group);
    await Promise.resolve(); await Promise.resolve();
    await view._saveRow();
    const saved = wsCalls(view, "weekly_planner/program/save")[0].program;
    expect(saved.profiles).toHaveLength(3);
    expect(saved.profiles[2]).toMatchObject({ id: "v", follows: "Home" });
    expect(saved.profiles[2].days.flat()).toHaveLength(0);
  });
  it("stops following on request: nothing is opened, the user taps again", async () => {
    const { view } = make();
    vi.mocked(chooseAction).mockResolvedValueOnce("stop");
    const { program, group, key } = row(view);
    view._openRow(key, program, group);
    await vi.waitFor(() => expect(wsCalls(view, follow.type)).toHaveLength(1));
    expect(wsCalls(view, follow.type)[0]).toMatchObject({ mode: "Holiday", follows: null });
    await vi.waitFor(() => expect(view._note).toContain("no longer follows Home"));
    expect(view._open).toBeNull();
  });
  it("changes nothing when the question is cancelled", async () => {
    const { view } = make();
    vi.mocked(chooseAction).mockResolvedValueOnce(null);
    const { program, group, key } = row(view);
    view._openRow(key, program, group);
    await vi.waitFor(() => expect(chooseAction).toHaveBeenCalled());
    await Promise.resolve(); await Promise.resolve();
    expect(view._open).toBeNull(); expect(view.hass.callWS).not.toHaveBeenCalled();
  });
  it("asks before adding a schedule too, and before the first one of an empty source", async () => {
    const { view } = make();
    view._add();
    await vi.waitFor(() => expect(chooseAction).toHaveBeenCalledTimes(1));
    await Promise.resolve();
    expect(view._open).toBe("new");
    expect(view._editProfileId).toBe("h");
  });
  it("does not ask for a mode that follows nobody", () => {
    const { view } = make(mode({ active: "Away" }));
    const { program, group, key } = view._rows()[0];
    view._openRow(key, program, group);
    expect(chooseAction).not.toHaveBeenCalled();
    expect(view._open).toBe(key);
  });
});

describe("notice of a source that went away", () => {
  const notice = (m: any, lang = "en") => {
    const n = new WpModeNotice() as any;
    n.hass = { language: lang, callWS: vi.fn(async () => ({})) };
    n.data = { mode: mode(m) };
    return n;
  };
  const at = (ms: number) => new Date(Date.now() - ms).toISOString();
  it("says which modes keep a copy, for a week", () => {
    const n = notice({ follow_lost: [{ source: "Away", modes: ["Holiday", "Night"], programs: ["p"], at: at(3600_000) }] });
    expect(flat(n.render())).toContain("Holiday, Night no longer follows Away, which is gone. It keeps a copy of its last schedules.");
    expect(flat(notice({ follow_lost: [{ source: "Away", modes: ["Holiday"], programs: ["p"], at: at(8 * 86400_000) }] }).render())).toBe("");
    expect(flat(notice({ follow_lost: [{ source: "Hiver", modes: ["Vacances"], programs: ["p"], at: at(1000) }] }, "fr").render()))
      .toContain("Vacances ne suit plus Hiver, qui n’existe plus.");
  });
  it("is shown with the other notices", () => {
    const n = notice({ follow_lost: [{ source: "Away", modes: ["Holiday"], programs: ["p"], at: at(1000) }],
      renamed: [{ old: "A", new: "B", at: at(1000) }] });
    const html = flat(n.render());
    expect(html).toContain("no longer follows Away"); expect(html).toContain("The mode A was renamed");
    expect(handlers(n.render()).filter((h) => h.event === "click")).toHaveLength(2);
  });
});
void find;
