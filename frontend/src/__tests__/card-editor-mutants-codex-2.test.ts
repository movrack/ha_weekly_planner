import { describe, expect, it, vi } from "vitest";
import { WeeklyPlannerCardEditor } from "../card-editor";
import { flat, handlers } from "./helpers/tpl";

const make = (config: any = {}) => {
  const el: any = new WeeklyPlannerCardEditor();
  el.hass = { language: "en", states: {}, user: { is_admin: true } };
  el._config = { type: "custom:weekly-planner-card", ...config };
  el._programs = [{ id: "a", name: "Alpha" }, { id: "b", name: "Beta" }];
  el._data = { programs: [], can_edit: true, read_only: false };
  return el;
};
const eventNear = (tpl: any, event: string, marker: string) => handlers(tpl).find((h) => h.event === event && h.before.slice(-250).includes(marker))!.fn;

describe("card editor form commands", () => {
  it("connects each display field to its config property", () => {
    const el = make({ program: "a" });
    const set = vi.spyOn(el, "_set").mockImplementation(() => {});
    const mode = vi.spyOn(el, "_setMode").mockImplementation(() => {});
    const template = el.render();
    for (const [id, event, value, key] of [
      ["ce-title", "input", "Living room", "title"],
      ["ce-program", "change", "b", "program"],
      ["ce-view", "change", "compare", "schedule_view"],
    ]) {
      eventNear(template, event, `id="${id}"`)({ target: { value } });
      expect(set).toHaveBeenLastCalledWith(key, value);
    }
    const changes = handlers(template).filter((h) => h.event === "change" && h.before.slice(-200).includes('name="ce-mode"'));
    expect(changes).toHaveLength(2);
    changes[0].fn(); expect(mode).toHaveBeenLastCalledWith(true);
    changes[1].fn(); expect(mode).toHaveBeenLastCalledWith(false);
  });
  it("config events bubble through the dashboard shadow root", () => {
    const el = make();
    const dispatch = vi.spyOn(el, "dispatchEvent");
    el._set("title", "Kitchen");
    const event = dispatch.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe("config-changed");
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.detail.config.title).toBe("Kitchen");
  });
  it("opens the selected program settings and switches both tabs", () => {
    const el = make({ program: "b" });
    const tpl = el.render();
    const clicks = handlers(tpl).filter((h) => h.event === "click");
    const edit = clicks.filter((h) => h.before.endsWith('class="btn" @click=')).slice(-1)[0]!;
    edit.fn();
    expect(el._editing).toBe("b"); expect(el._section).toBe("programs");
    eventNear(tpl, "click", 'id="ce-tab-display"')(); expect(el._section).toBe("display");
    eventNear(tpl, "click", 'id="ce-tab-programs"')(); expect(el._section).toBe("programs");
  });
  it("opens the newly created schedule and consumes its close event", () => {
    const el = make();
    el._createdName = "New room"; el._createdProgramId = "n";
    const tpl = el.render();
    const action = handlers(tpl).find((h) => h.event === "click" && h.before.slice(-120).includes('class="btn primary"'))!;
    action.fn();
    expect(el._scheduleProgramId).toBe("n");
    expect(flat(el.render())).not.toContain("<wp-schedule");
    el._data.programs = [{ id: "n", name: "New room", entities: [], area: "" }];
    const opened = el.render();
    expect(flat(opened)).toContain("<wp-schedule");
    const stopPropagation = vi.fn();
    handlers(opened).find((h) => h.event === "closed")!.fn({ stopPropagation });
    expect(stopPropagation).toHaveBeenCalledOnce();
    expect(el._scheduleProgramId).toBeNull();
  });
  it("selects an existing program in settings and resumes a new draft", () => {
    const el = make();
    el._data.programs = [{ id: "a", name: "Alpha" }];
    const editor = vi.spyOn(el, "_programEditor").mockReturnValue("EDITOR");
    const fresh = vi.spyOn(el, "_newProgram").mockImplementation(() => {});
    let tpl = el._settings();
    eventNear(tpl, "change", 'id="ce-settings-program"')({ target: { value: "a" } });
    expect(el._editing).toBe("a");
    tpl = el._settings();
    expect(flat(tpl)).toContain("EDITOR");
    expect(editor).toHaveBeenLastCalledWith("a", el._data.programs[0]);
    eventNear(tpl, "change", 'id="ce-settings-program"')({ target: { value: "new" } });
    expect(fresh).toHaveBeenCalledOnce();
    eventNear(tpl, "change", 'id="ce-settings-program"')({ target: { value: "" } });
    expect(el._editing).toBe("");
  });
});
