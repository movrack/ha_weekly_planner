import { beforeEach, describe, expect, it, vi } from "vitest";
import { WpLabelPicker } from "../components/label-picker";
import { PALETTE, nextColor } from "../labels";
import { loadServiceNames } from "../services";
import { t } from "../i18n";
import { flat, handlers } from "./helpers/tpl";
import { close, events, mk, open } from "./helpers/label-picker";

// The label picker's state: the form, the validation, the saves, the deletion and the choice.
// Only `updated()` talks to the service names; everything else runs against the real module.
vi.mock("../services", async (importOriginal) => ({ ...(await importOriginal<object>()), loadServiceNames: vi.fn() }));
beforeEach(() => { vi.mocked(loadServiceNames).mockReset().mockResolvedValue(false); });

describe("a new picker", () => {
  it("starts without entities, selection, form or delete prompt", () => {
    const el: any = new WpLabelPicker();
    expect([el.entityIds, el.value, el.allowNone, el._name, el._color, el._error, el._confirmDel, el._loaded]).toEqual([[], null, false, "", "", "", false, ""]);
  });
});

describe("form open and close", () => {
  it("editing takes the chosen setting as a copy and starts with no device values", () => {
    const el = mk();
    el._open(true);
    expect([el._form, el._editId, el._name, el._color, el._error]).toEqual([true, "l", "Open", PALETTE[2], ""]);
    expect(el._action).toEqual(open.action);
    expect(el._action).not.toBe(open.action);
    expect([el._ov, el._valueFor]).toEqual([{}, null]);
  });
  it("a new setting starts empty with the next free colour and drops what was left of the last form", () => {
    const el = mk();
    el._error = "x"; el._ov = { a: null }; el._valueFor = "cover.a";
    el._open(false);
    expect([el._form, el._editId, el._name, el._color, el._action, el._error, el._ov, el._valueFor]).toEqual([true, null, "", nextColor(el.data.labels), null, "", {}, null]);
  });
  it("editing with no setting chosen opens no form", () => {
    const el = mk({ value: "zz" });
    el._open(true);
    expect(el._form).toBe(false);
  });
  it("closing the form clears its error", () => {
    const el = mk();
    el._open(true);
    el._error = "x";
    el._close();
    expect([el._form, el._error]).toEqual([false, ""]);
  });
  it("a patch sets only what it names and clears the error", () => {
    const el = mk();
    el._open(true);
    el._error = "x";
    el._set({ name: "Other" });
    expect([el._name, el._color, el._action, el._error]).toEqual(["Other", PALETTE[2], open.action, ""]);
    el._set({ color: "#123456" });
    expect(el._color).toBe("#123456");
    el._set({ action: null });
    expect(el._action).toBeNull();
    el._set({ name: "" });
    expect(el._name).toBe("");
  });
});

describe("validation", () => {
  it("asks for the name first, then the action", () => {
    const el = mk();
    el._open(false);
    expect(el._formProblem).toBe(t("en", "lb_err_name"));
    el._name = "   ";
    expect(el._formProblem).toBe(t("en", "lb_err_name"));
    el._name = "N";
    expect(el._formProblem).toBe(t("en", "lb_err_action"));
  });
  it.each([
    ["no service", { kind: "service", service: "" }, t("en", "lb_err_action")],
    ["an empty target", { kind: "service", service: "cover.open_cover", target_entity_id: "" }, t("en", "lb_err_action")],
    ["a service", { kind: "service", service: "cover.open_cover" }, ""],
    ["a scene", { kind: "scene", scene: "scene.x" }, ""],
  ])("a named setting with %s", (_case, action, problem) => {
    const el = mk();
    el._open(false);
    el._name = "N";
    el._action = action;
    expect(el._formProblem).toBe(problem);
  });
  it("a required field of the service must be filled", () => {
    const el = mk();
    el._open(false);
    el._name = "N";
    el.hass.services.cover.open_cover = { fields: { position: { required: true, selector: { number: {} } } } };
    el._action = { kind: "service", service: "cover.open_cover" };
    expect(el._formProblem).toBe(t("en", "lb_err_fields"));
    el._action = { kind: "service", service: "cover.open_cover", data: { position: 50 } };
    expect(el._formProblem).toBe("");
    el._action = { kind: "service", service: "cover.open_cover", target_entity_id: "cover.b" };
    expect(el._formProblem).toBe(t("en", "lb_err_fields"));
  });
  it("required fields are checked against the explicitly targeted device", () => {
    const el = mk({ entityIds: ["cover.a"] });
    el._open(false);
    el._name = "Open";
    el.hass.states = { "cover.a": { attributes: { supported_features: 1 } }, "cover.b": { attributes: { supported_features: 0 } } };
    el.hass.services = { cover: { open_cover: { fields: { position: { required: true, filter: { supported_features: [1] }, selector: { number: {} } } } } } };
    el._action = { kind: "service", service: "cover.open_cover", target_entity_id: "cover.b" };
    expect(el._formProblem).toBe("");
    el._action.target_entity_id = "cover.a";
    expect(el._formProblem).toBe(t("en", "lb_err_fields"));
  });
});

describe("a device's own value", () => {
  it("is the one changed in the form, else the saved one, else none", () => {
    const el = mk();
    expect(el._ownValue("cover.a", "l")).toBeNull();
    expect(el._ownValue("cover.b", "l")).toEqual(close.action);
    expect(el._ownValue("cover.b", "zz")).toBeNull();
    expect(el._ownValue("cover.x", "l")).toBeNull();
    el._ov = { "cover.b": null, "cover.a": open.action };
    expect(el._ownValue("cover.b", "l")).toBeNull();
    expect(el._ownValue("cover.a", "l")).toBe(open.action);
  });
});

describe("saving", () => {
  it("saves the setting with its id when editing, then the device values, closes and tells the parent", async () => {
    const el = mk();
    el._open(true);
    el._name = "  Opened ";
    el.hass.callWS = vi.fn(async (msg: any) => msg.type === "weekly_planner/label/save" ? { label: { id: "l" } } : msg.type === "weekly_planner/get" ? { programs: [JSON.parse(JSON.stringify(el.program))] } : {});
    el._ov = { "cover.a": close.action, "cover.b": null };
    await el._save();
    const calls = el.hass.callWS.mock.calls.map((c: any[]) => c[0]);
    expect(calls[0]).toEqual({ type: "weekly_planner/label/save", label: { id: "l", name: "Opened", color: PALETTE[2], action: open.action, show_value: false } });
    const saved = calls.find((c: any) => c.type === "weekly_planner/program/save").program;
    expect(saved.entities[0].label_overrides).toEqual({ l: close.action });
    expect(saved.entities[1].label_overrides).toEqual({});
    expect(el._form).toBe(false);
    expect(el._saving).toBe(false);
    expect(events(el).pop()).toEqual(["label-change", "l"]);
  });
  it("a problem stops the save and shows its text", async () => {
    const el = mk();
    el._open(false);
    await el._save();
    expect(el._error).toBe(t("en", "lb_err_name"));
    expect(el.hass.callWS).not.toHaveBeenCalled();
    expect(el._saving).toBe(false);
  });
  it("a new setting is saved without an id and chosen once saved", async () => {
    const el = mk();
    el._open(false);
    el._name = "New"; el._action = open.action;
    await el._save();
    expect(el.hass.callWS.mock.calls[0][0]).toEqual({ type: "weekly_planner/label/save", label: { name: "New", color: nextColor(el.data.labels), action: open.action, show_value: false } });
    expect(events(el).pop()).toEqual(["label-change", "new"]);
  });
  it.each([
    ["not allowed", { code: "unauthorized" }, t("en", "err_unauthorized")],
    ["a general failure", new Error("x"), t("en", "lb_err_save")],
    ["a null rejection", null, t("en", "lb_err_save")],
  ])("a refused save (%s) says why and the form stays open", async (_case, failure, text) => {
    const el = mk();
    el._open(true);
    el.hass.callWS = vi.fn(async () => { throw failure; });
    await el._save();
    expect(el._error).toBe(text);
    expect([el._form, el._saving]).toEqual([true, false]);
  });
  it.each(["save", "delete"])("%s stays pending until the server answers, then handles a null rejection", async (operation) => {
    const el = mk();
    el._open(true);
    let reject!: (error: unknown) => void;
    el.hass.callWS = vi.fn(() => new Promise((_resolve, fail) => { reject = fail; }));
    const pending = operation === "save" ? el._save() : el._delete(el.data.labels[0]);
    expect(el._saving).toBe(true);
    reject(null); await pending;
    expect(el._saving).toBe(false);
    expect(operation === "save" ? el._error : el._delError).toBe(t("en", operation === "save" ? "lb_err_save" : "lb_err_delete"));
  });
});

describe("saving the device values", () => {
  const fresh = (el: any) => ({ programs: [{ ...el.program, revision: 2 }] });
  const isGet = (m: any) => m.type === "weekly_planner/get";
  it("saves nothing without a change", async () => {
    const el = mk();
    await el._saveOverrides("l");
    expect(el.hass.callWS).not.toHaveBeenCalled();
  });
  it("a conflict is retried once on fresh data", async () => {
    const el = mk();
    el._ov = { "cover.a": open.action };
    let saves = 0;
    el.hass.callWS = vi.fn(async (m: any) => { if (isGet(m)) return fresh(el); saves++; if (saves === 1) throw { code: "conflict" }; return {}; });
    await el._saveOverrides("l");
    expect(saves).toBe(2);
    expect(el.hass.callWS.mock.calls.filter((c: any[]) => isGet(c[0]))).toHaveLength(2);
  });
  it("a second conflict stops quietly after two attempts", async () => {
    const el = mk();
    el._ov = { "cover.a": open.action };
    let saves = 0;
    el.hass.callWS = vi.fn(async (m: any) => { if (isGet(m)) return fresh(el); saves++; throw { code: "conflict" }; });
    await el._saveOverrides("l");
    expect(saves).toBe(2);
  });
  it("any other error is raised", async () => {
    const el = mk();
    el._ov = { "cover.a": open.action };
    el.hass.callWS = vi.fn(async (m: any) => { if (isGet(m)) return fresh(el); throw { code: "other" }; });
    await expect(el._saveOverrides("l")).rejects.toEqual({ code: "other" });
  });
  it("a program that has vanished is left alone", async () => {
    const el = mk();
    el._ov = { "cover.a": open.action };
    el.hass.callWS = vi.fn(async () => ({ programs: [] }));
    await el._saveOverrides("l");
    expect(el.hass.callWS).toHaveBeenCalledTimes(1);
  });
  it("sets, clears and keeps the other values of each device", async () => {
    const el = mk();
    el._ov = { "cover.a": open.action, "cover.b": null };
    el.hass.callWS = vi.fn(async (m: any) => isGet(m)
      ? { programs: [{ ...el.program, entities: [{ entity_id: "cover.a", label_overrides: undefined }, { entity_id: "cover.b", label_overrides: { l: close.action, k: open.action } }] }] }
      : {});
    await el._saveOverrides("l");
    const sent = el.hass.callWS.mock.calls[1][0];
    expect(sent.type).toBe("weekly_planner/program/save");
    expect(sent.program.entities.map((e: any) => e.label_overrides)).toEqual([{ l: open.action }, { k: open.action }]);
  });
  it("is written into the matching fresh program and leaves unrelated devices intact", async () => {
    const el = mk({ entityIds: ["cover.a", "cover.b"] });
    el._ov = { "cover.a": close.action };
    const other = { ...el.program, id: "other", revision: 8 };
    const untouched = { entity_id: "cover.c", default_label: "l2" };
    const freshProgram = { ...el.program, revision: 12, entities: [...el.program.entities, untouched] };
    el.hass.callWS = vi.fn(async (msg: any) => isGet(msg) ? { programs: [other, freshProgram] } : {});
    await el._saveOverrides("l");
    const saved = el.hass.callWS.mock.calls[1][0].program;
    expect(saved.id).toBe("p"); expect(saved.revision).toBe(12);
    expect(saved.entities[2]).toBe(untouched);
    expect(saved.entities[0].label_overrides).toEqual({ l: close.action });
    el.hass.callWS = vi.fn(async (msg: any) => { if (isGet(msg)) return { programs: [freshProgram] }; throw null; });
    await expect(el._saveOverrides("l")).rejects.toBeNull();
  });
});

describe("deleting", () => {
  it("tells the parent there is no setting any more and closes everything", async () => {
    const el = mk();
    el._confirmDel = true; el._delError = "x"; el._form = true;
    await el._delete(open);
    expect(el.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/label/delete", label_id: "l" });
    expect([el._confirmDel, el._delError, el._form, el._saving]).toEqual([false, "", false, false]);
    expect(events(el)).toEqual([["label-change", null]]);
  });
  it("tells a listening parent with a composed, bubbling event", async () => {
    const el = mk();
    el.dispatchEvent = WpLabelPicker.prototype.dispatchEvent.bind(el);
    const seen: CustomEvent[] = [];
    el.addEventListener("label-change", (e: CustomEvent) => seen.push(e));
    await el._delete(open);
    expect(seen.map((e) => [e.detail, e.bubbles, e.composed])).toEqual([[null, true, true]]);
  });
  it.each([
    ["names the programs that use it", { code: "in_use", message: "Alpha, Beta" }, t("en", "lb_delete_used", { name: "Open", programs: "Alpha, Beta" })],
    ["names no program when the server gives none", { code: "in_use" }, t("en", "lb_delete_used", { name: "Open", programs: "" })],
    ["says it is not allowed", { code: "unauthorized" }, t("en", "err_unauthorized")],
    ["says it failed otherwise", new Error("x"), t("en", "lb_err_delete")],
  ])("a refusal %s", async (_case, failure, text) => {
    const el = mk();
    el.hass.callWS = vi.fn(async () => { throw failure; });
    await el._delete(open);
    expect(el._delError).toBe(text);
    expect(el._saving).toBe(false);
  });
  it("the delete box asks once", () => {
    const el = mk();
    const ask = flat(el._renderDelete(open));
    expect(ask).toContain(`<p>${t("en", "lb_delete_ask", { name: "Open" })}</p>`);
    expect(ask).toContain("danger-line");
    expect(ask).toContain(`mdi:delete-outline"></ha-icon>${t("en", "delete")}`);
    expect(ask).toContain(`>${t("en", "cancel")}</button>`);
  });
  it("the delete box says who uses the setting and offers to replace it everywhere", () => {
    const el = mk();
    el.data.programs = [{ id: "p1", name: "Alpha", entities: [], profiles: [{ days: [[{ label: "l" }]] }] }];
    const used = flat(el._renderDelete(open));
    expect(used).toContain(t("en", "lb_delete_used", { name: "Open", programs: "Alpha" }));
    expect(used).toContain("tone-warning");
    expect(used).toContain(`<div class="co-body"><p>${t("en", "lb_delete_used", { name: "Open", programs: "Alpha" })}</p></div>`);
    expect(used).toContain(t("en", "lb_replace_with"));
    expect(used).toContain(t("en", "lb_replace_go"));
    expect(used).toContain(`>${t("en", "cancel")}</button>`);
  });
  it("the delete box shows the last refusal", () => {
    const el = mk();
    el._delError = "oops";
    expect(flat(el._renderDelete(open))).toContain("oops");
  });
  it.each([
    ["asking", "", 1],
    ["showing a refusal", "x", 0],
  ])("cancelling the delete box while %s clears the confirmation and the refusal", (_state, error, button) => {
    const el = mk();
    el._delError = error;
    const tpl = el._renderDelete(open);
    el._confirmDel = true; el._delError = "x";
    handlers(tpl).filter((h) => h.event === "click")[button].fn();
    expect([el._confirmDel, el._delError]).toEqual([false, ""]);
  });
});

describe("choosing", () => {
  it("closes the confirmation and the form, and tells the parent", () => {
    const el = mk();
    el._confirmDel = true; el._delError = "x"; el._form = true;
    el._choose("l2");
    expect([el._confirmDel, el._delError, el._form]).toEqual([false, "", false]);
    expect(events(el)).toEqual([["label-change", "l2"]]);
    el.dispatchEvent.mockClear();
    el._choose(null);
    expect(events(el)).toEqual([["label-change", null]]);
  });
  it("sends a composed, bubbling label-change", () => {
    const el = mk();
    el._choose("l");
    expect(el.dispatchEvent.mock.calls[0][0]).toMatchObject({ type: "label-change", detail: "l", bubbles: true, composed: true });
  });
});

describe("telling the window when the form opens and closes", () => {
  it("emits label-form-change on open and on close, never for the first closed render", () => {
    const el = mk();
    const seen: boolean[] = [];
    el.dispatchEvent = vi.fn((e: CustomEvent) => { seen.push(e.detail); return true; });
    el.updated(new Map([["_form", undefined]]));
    expect(seen).toEqual([]);
    el._open(false);
    el.updated(new Map([["_form", false]]));
    el._close();
    el.updated(new Map([["_form", true]]));
    el.updated(new Map([["_name", ""]]));
    expect(seen).toEqual([true, false]);
  });
  it("emits for a form that is already open on the first render (start-new)", () => {
    const el = mk();
    const seen: boolean[] = [];
    el.dispatchEvent = vi.fn((e: CustomEvent) => { seen.push(e.detail); return true; });
    el._open(false);
    el.updated(new Map([["_form", undefined]]));
    expect(seen).toEqual([true]);
  });
});

describe("loading the names of the services", () => {
  it.each([true, false])("a chosen service action loads the names of its domain once and refreshes only when they changed (%s)", async (changed) => {
    const el = mk();
    vi.mocked(loadServiceNames).mockResolvedValue(changed);
    el.requestUpdate = vi.fn();
    el.updated();
    await Promise.resolve(); await Promise.resolve();
    expect(el.requestUpdate).toHaveBeenCalledTimes(changed ? 1 : 0);
    expect(loadServiceNames).toHaveBeenCalledWith(el.hass, ["cover"]);
    el.updated();
    expect(loadServiceNames).toHaveBeenCalledTimes(1);
  });
  it.each([
    ["Home Assistant is missing", { hass: undefined }],
    ["no setting is chosen", { value: null }],
    ["the chosen setting is unknown", { value: "zz" }],
    ["the chosen setting is a scene", { value: "s", data: { labels: [{ id: "s", name: "S", color: "#0", action: { kind: "scene", scene: "scene.x" } }], programs: [] } }],
  ])("nothing is loaded when %s", (_case, props) => {
    const el = mk(props);
    expect(() => el.updated()).not.toThrow();
    expect(loadServiceNames).not.toHaveBeenCalled();
  });
});

describe("unsaved changes and start-new", () => {
  it("is not dirty with the form closed, nor straight after it opens", () => {
    const el = mk();
    expect(el.dirty).toBe(false);
    el._open(true);
    expect(el.dirty).toBe(false);
    el._open(false);
    expect(el.dirty).toBe(false);
  });
  it("turns dirty when a field of the form changes, and clean again once the form closes", () => {
    const el = mk();
    el._open(false);
    el._set({ name: "Night" });
    expect(el.dirty).toBe(true);
    el._close();
    expect(el.dirty).toBe(false);
  });
  it("a device value or an action change also counts", () => {
    const el = mk();
    el._open(true);
    el._ov = { "cover.a": null };
    expect(el.dirty).toBe(true);
    el._open(true);
    el._set({ showValue: true });
    expect(el.dirty).toBe(true);
  });
  it("start-new opens the form for a new setting once, only when it can be edited", () => {
    const a = mk({ startNew: true });
    a.firstUpdated();
    expect([a._form, a._editId]).toEqual([true, null]);
    const b = mk();
    b.firstUpdated();
    expect(b._form).toBe(false);
    const c = mk({ startNew: true, readonlySettings: true });
    c.firstUpdated();
    expect(c._form).toBe(false);
    const d = mk({ startNew: true, disabled: true });
    d.firstUpdated();
    expect(d._form).toBe(false);
  });
});
