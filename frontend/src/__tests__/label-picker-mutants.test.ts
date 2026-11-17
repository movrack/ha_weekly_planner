import { describe, expect, it, vi } from "vitest";
import { WpLabelPicker } from "../components/label-picker";
import { PALETTE, nextColor } from "../labels";
import { t } from "../i18n";
import { flat, handlers } from "./helpers/tpl";

// Mutation survivors of the label picker: the form, the validation, the saves and the colour keys.
const open = { id: "l", name: "Open", color: PALETTE[2], action: { kind: "service", service: "cover.open_cover" } };
const close = { id: "l2", name: "Close", color: PALETTE[3], action: { kind: "service", service: "cover.close_cover" } };
const mk = (props: any = {}) => {
  const el: any = new WpLabelPicker();
  el.hass = { language: "en", states: {}, services: { cover: { open_cover: { fields: {} }, close_cover: { fields: {} } } }, callWS: vi.fn(async () => ({ label: { id: "new" }, programs: [] })) };
  el.data = { labels: [open, close], programs: [], status: {} };
  el.program = { id: "p", revision: 1, entities: [{ entity_id: "cover.a", default_label: null, label_overrides: {} }, { entity_id: "cover.b", default_label: null, label_overrides: { l: { kind: "service", service: "cover.close_cover" } } }], profiles: [] };
  el.entityIds = ["cover.a"];
  el.value = "l";
  el.dispatchEvent = vi.fn();
  Object.assign(el, props);
  return el;
};
const events = (el: any) => el.dispatchEvent.mock.calls.map(([e]: any[]) => [e.type, e.detail]);

describe("form open and close", () => {
  it("editing takes the chosen label as a copy; a new one starts empty with the next colour; no label, no form", () => {
    const el = mk();
    el._open(true);
    expect([el._form, el._editId, el._name, el._color, el._error]).toEqual([true, "l", "Open", PALETTE[2], ""]);
    expect(el._action).toEqual(open.action);
    expect(el._action).not.toBe(open.action);
    expect([el._ov, el._valueFor]).toEqual([{}, null]);
    el._error = "x"; el._ov = { a: null }; el._valueFor = "cover.a";
    el._open(false);
    expect([el._form, el._editId, el._name, el._color, el._action, el._error, el._ov, el._valueFor]).toEqual([true, null, "", nextColor(el.data.labels), null, "", {}, null]);
    const none = mk({ value: "zz" });
    none._open(true);
    expect(none._form).toBe(false);
  });
  it("closing clears the error; an embedding form is told with the draft, or with null when closed", () => {
    const el = mk({ embedded: true });
    el._open(true);
    expect(events(el)).toEqual([["label-draft", { id: "l", name: "Open", color: PALETTE[2], action: open.action, showValue: false, overrides: [], problem: "" }]]);
    el._error = "x";
    el.dispatchEvent.mockClear();
    el._close();
    expect([el._form, el._error]).toEqual([false, ""]);
    expect(events(el)).toEqual([["label-draft", null]]);
    const plain = mk();
    plain._open(true); plain._close();
    expect(events(plain)).toEqual([]);
  });
  it("the draft lists the changes by device, trims the name and carries the problem", () => {
    const el = mk({ embedded: true });
    el._open(false);
    el._name = "  Night  ";
    el._ov = { "cover.a": null, "cover.b": open.action };
    expect(el._draft()).toEqual({ id: null, name: "Night", color: nextColor(el.data.labels), action: null, showValue: false,
      overrides: [{ entityId: "cover.a", action: null }, { entityId: "cover.b", action: open.action }], problem: t("en", "lb_err_action") });
  });
});

describe("validation", () => {
  it("name first, then the action, then the service and its target, then the required fields", () => {
    const el = mk();
    el._open(false);
    expect(el._formProblem).toBe(t("en", "lb_err_name"));
    el._name = "   ";
    expect(el._formProblem).toBe(t("en", "lb_err_name"));
    el._name = "N";
    expect(el._formProblem).toBe(t("en", "lb_err_action"));
    el._action = { kind: "service", service: "" };
    expect(el._formProblem).toBe(t("en", "lb_err_action"));
    el._action = { kind: "service", service: "cover.open_cover", target_entity_id: "" };
    expect(el._formProblem).toBe(t("en", "lb_err_action"));
    el._action = { kind: "service", service: "cover.open_cover" };
    expect(el._formProblem).toBe("");
    el._action = { kind: "scene", scene: "scene.x" };
    expect(el._formProblem).toBe("");
    el.hass.services.cover.open_cover = { fields: { position: { required: true, selector: { number: {} } } } };
    el._action = { kind: "service", service: "cover.open_cover" };
    expect(el._formProblem).toBe(t("en", "lb_err_fields"));
    el._action = { kind: "service", service: "cover.open_cover", data: { position: 50 } };
    expect(el._formProblem).toBe("");
    el._action = { kind: "service", service: "cover.open_cover", target_entity_id: "cover.b" };
    expect(el._formProblem).toBe(t("en", "lb_err_fields"));
  });
  it("a patch sets only what it names, clears the error and reports the draft", () => {
    const el = mk({ embedded: true });
    el._open(true);
    el._error = "x";
    el.dispatchEvent.mockClear();
    el._set({ name: "Other" });
    expect([el._name, el._color, el._action, el._error]).toEqual(["Other", PALETTE[2], open.action, ""]);
    el._set({ color: "#123456" });
    expect(el._color).toBe("#123456");
    el._set({ action: null });
    expect(el._action).toBeNull();
    el._set({ name: "" });
    expect(el._name).toBe("");
    expect(events(el)).toHaveLength(4);
  });
  it("a device value: the one changed in the form, else the saved one, else none", () => {
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
  it("saves the label with its id when editing, then the device values, closes and tells the parent", async () => {
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
  it("a new label is saved without an id; a problem stops the save with its text", async () => {
    const el = mk();
    el._open(false);
    await el._save();
    expect(el._error).toBe(t("en", "lb_err_name"));
    expect(el.hass.callWS).not.toHaveBeenCalled();
    expect(el._saving).toBe(false);
    el._name = "New"; el._action = open.action;
    await el._save();
    expect(el.hass.callWS.mock.calls[0][0]).toEqual({ type: "weekly_planner/label/save", label: { name: "New", color: nextColor(el.data.labels), action: open.action, show_value: false } });
    expect(events(el).pop()).toEqual(["label-change", "new"]);
  });
  it("a refused save says why: not allowed, or a general failure; the form stays open", async () => {
    const el = mk();
    el._open(true);
    el.hass.callWS = vi.fn(async () => { throw { code: "unauthorized" }; });
    await el._save();
    expect(el._error).toBe(t("en", "err_unauthorized"));
    expect([el._form, el._saving]).toEqual([true, false]);
    el.hass.callWS = vi.fn(async () => { throw new Error("x"); });
    await el._save();
    expect(el._error).toBe(t("en", "lb_err_save"));
    el.hass.callWS = vi.fn(async () => { throw null; });
    await el._save();
    expect(el._error).toBe(t("en", "lb_err_save"));
  });
  it("device values: nothing to save without changes; a conflict is retried once on fresh data; other errors are raised; a vanished program is left", async () => {
    const el = mk();
    await el._saveOverrides("l");
    expect(el.hass.callWS).not.toHaveBeenCalled();
    el._ov = { "cover.a": open.action };
    const fresh = () => ({ programs: [{ ...el.program, revision: 2 }] });
    let saves = 0;
    el.hass.callWS = vi.fn(async (m: any) => { if (m.type === "weekly_planner/get") return fresh(); saves++; if (saves === 1) throw { code: "conflict" }; return {}; });
    await el._saveOverrides("l");
    expect(saves).toBe(2);
    expect(el.hass.callWS.mock.calls.filter((c: any[]) => c[0].type === "weekly_planner/get")).toHaveLength(2);
    saves = 0;
    el.hass.callWS = vi.fn(async (m: any) => { if (m.type === "weekly_planner/get") return fresh(); saves++; throw { code: "conflict" }; });
    await el._saveOverrides("l");
    expect(saves).toBe(2); // two attempts, then it stops quietly
    el.hass.callWS = vi.fn(async (m: any) => { if (m.type === "weekly_planner/get") return fresh(); throw { code: "other" }; });
    await expect(el._saveOverrides("l")).rejects.toEqual({ code: "other" });
    el.hass.callWS = vi.fn(async () => ({ programs: [] }));
    await el._saveOverrides("l");
    expect(el.hass.callWS).toHaveBeenCalledTimes(1);
    el.hass.callWS = vi.fn(async (m: any) => { if (m.type === "weekly_planner/get") return { programs: [{ ...el.program, entities: [{ entity_id: "cover.a", label_overrides: undefined }, { entity_id: "cover.b", label_overrides: { l: close.action, k: open.action } }] }] }; return {}; });
    el._ov = { "cover.a": open.action, "cover.b": null };
    await el._saveOverrides("l");
    const sent = el.hass.callWS.mock.calls[1][0];
    expect(sent.type).toBe("weekly_planner/program/save");
    expect(sent.program.entities.map((e: any) => e.label_overrides)).toEqual([{ l: open.action }, { k: open.action }]);
  });
});

describe("deleting and choosing", () => {
  it("a delete tells the parent there is no label any more; a refusal names the programs that use it", async () => {
    const el = mk({ embedded: true });
    el._confirmDel = true; el._delError = "x"; el._form = true;
    await el._delete(open);
    expect(el.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/label/delete", label_id: "l" });
    expect([el._confirmDel, el._delError, el._form, el._saving]).toEqual([false, "", false, false]);
    expect(events(el)).toEqual([["label-draft", null], ["label-change", null]]);
    el.hass.callWS = vi.fn(async () => { throw { code: "in_use", message: "Alpha, Beta" }; });
    await el._delete(open);
    expect(el._delError).toBe(t("en", "lb_delete_used", { name: "Open", programs: "Alpha, Beta" }));
    el.hass.callWS = vi.fn(async () => { throw { code: "in_use" }; });
    await el._delete(open);
    expect(el._delError).toBe(t("en", "lb_delete_used", { name: "Open", programs: "" }));
    el.hass.callWS = vi.fn(async () => { throw { code: "unauthorized" }; });
    await el._delete(open);
    expect(el._delError).toBe(t("en", "err_unauthorized"));
    el.hass.callWS = vi.fn(async () => { throw new Error("x"); });
    await el._delete(open);
    expect(el._delError).toBe(t("en", "lb_err_delete"));
    expect(el._saving).toBe(false);
  });
  it("the delete box asks once, or says who uses the setting and offers to replace it", () => {
    const el = mk();
    el.data.programs = [{ id: "p1", name: "Alpha", entities: [], profiles: [{ days: [[{ label: "l" }]] }] }];
    const used = flat(el._renderDelete(open));
    expect(used).toContain(t("en", "lb_delete_used", { name: "Open", programs: "Alpha" }));
    expect(used).toContain("tone-warning");
    expect(used).toContain(t("en", "lb_replace_go"));
    expect(used).toContain(`>${t("en", "cancel")}</button>`);
    el.data.programs = [];
    const ask = flat(el._renderDelete(open));
    expect(ask).toContain(`<p>${t("en", "lb_delete_ask", { name: "Open" })}</p>`);
    expect(ask).toContain("danger-line");
    expect(ask).toContain(`mdi:delete-outline"></ha-icon>${t("en", "delete")}`);
    expect(ask).toContain(`>${t("en", "cancel")}</button>`);
    el._delError = "oops";
    expect(flat(el._renderDelete(open))).toContain("oops");
    const tpl = el._renderDelete(open);
    el._confirmDel = true;
    handlers(tpl).filter((h) => h.event === "click")[0].fn();
    expect([el._confirmDel, el._delError]).toEqual([false, ""]);
    const ask2 = el._renderDelete(open);
    el._saving = true;
    el._delError = "";
    el.disabled = true;
    expect(flat(el._renderDelete(open))).toContain("danger-line");
    void ask2;
  });
  it("choosing closes the confirmation and the form and tells the parent", () => {
    const el = mk({ embedded: true });
    el._confirmDel = true; el._delError = "x"; el._form = true;
    el._choose("l2");
    expect([el._confirmDel, el._delError, el._form]).toEqual([false, "", false]);
    expect(events(el)).toEqual([["label-draft", null], ["label-change", "l2"]]);
    el.dispatchEvent.mockClear();
    el._choose(null);
    expect(events(el)).toEqual([["label-change", null]]);
  });
});

describe("colour swatches", () => {
  const key = (el: any, k: string) => {
    const focus = vi.fn();
    const buttons = PALETTE.map(() => ({ focus }));
    const ev = { key: k, preventDefault: vi.fn(), currentTarget: { querySelectorAll: vi.fn(() => buttons) } };
    handlers(el._swatches()).find((h) => h.event === "keydown")!.fn(ev);
    return { ev, focus };
  };
  it("arrows, Home and End choose the neighbour colour (wrapping) and move the focus; other keys or a disabled picker do nothing", () => {
    const el = mk();
    const n = PALETTE.length;
    const run = (k: string, at: number) => { el._color = PALETTE[at]; const r = key(el, k); return { color: el._color, prevented: r.ev.preventDefault.mock.calls.length, focused: r.focus.mock.calls.length, query: (r.ev.currentTarget.querySelectorAll.mock.calls as any[][])[0]?.[0] }; };
    expect(run("ArrowRight", 0)).toEqual({ color: PALETTE[1], prevented: 1, focused: 1, query: "button.sw:not(.custom)" });
    expect(run("ArrowDown", n - 1).color).toBe(PALETTE[0]);
    expect(run("ArrowLeft", 0).color).toBe(PALETTE[n - 1]);
    expect(run("ArrowUp", 3).color).toBe(PALETTE[2]);
    expect(run("Home", 4).color).toBe(PALETTE[0]);
    expect(run("End", 1).color).toBe(PALETTE[n - 1]);
    el._color = "#123456";
    key(el, "ArrowLeft");
    expect(el._color).toBe(PALETTE[n - 1]);
    el._color = "#123456";
    key(el, "ArrowRight");
    expect(el._color).toBe(PALETTE[0]);
    expect(run("x", 2)).toEqual({ color: PALETTE[2], prevented: 0, focused: 0, query: undefined });
    el.disabled = true;
    expect(run("ArrowRight", 2).color).toBe(PALETTE[2]);
  });
  it("the swatches say which one is chosen, who is the one tab stop, and show a custom colour", () => {
    const el = mk();
    el._color = PALETTE[1];
    const html = flat(el._swatches());
    expect(html.match(/role="radio"/g)).toHaveLength(PALETTE.length);
    expect(html).not.toContain("custom");
    const attrs = (tpl: any) => { const sel: any[] = [], tab: any[] = []; const walk = (v: any): void => { if (Array.isArray(v)) v.forEach(walk); else if (v?.strings) v.values.forEach((x: any, i: number) => { if (/aria-checked=$/.test(v.strings[i])) sel.push(x); else if (/tabindex=$/.test(v.strings[i])) tab.push(x); else walk(x); }); }; walk(tpl); return { sel, tab }; };
    const a = attrs(el._swatches());
    expect(a.sel.indexOf(true)).toBe(1);
    expect(a.tab.indexOf(0)).toBe(1);
    expect(a.tab.filter((x: number) => x === -1)).toHaveLength(PALETTE.length - 1);
    el._color = "#abc";
    const custom = flat(el._swatches());
    expect(custom).toContain('class="sw custom" role="radio" aria-checked="true" tabindex="0"');
    expect(attrs(el._swatches()).tab.every((x: number) => x === -1 || typeof x === "number")).toBe(true);
    expect(attrs(el._swatches()).tab).toEqual(PALETTE.map(() => -1));
    el._color = "nonsense";
    expect(flat(el._swatches())).not.toContain("custom");
    expect(attrs(el._swatches()).tab[0]).toBe(0);
    handlers(el._swatches()).filter((h) => h.event === "click")[2].fn();
    expect(el._color).toBe(PALETTE[2]);
  });
});

describe("loading the names of the services", () => {
  it("a chosen service action loads the names of its domain once", async () => {
    const el = mk();
    el.hass.loadBackendTranslation = vi.fn(async () => () => "x");
    el.requestUpdate = vi.fn();
    el.updated();
    expect(el.hass.loadBackendTranslation).toHaveBeenCalledTimes(1);
    expect(el.hass.loadBackendTranslation).toHaveBeenCalledWith("services", "cover");
    el.updated();
    expect(el.hass.loadBackendTranslation).toHaveBeenCalledTimes(1);
    const scene = mk({ value: "s", data: { labels: [{ id: "s", name: "S", color: "#0", action: { kind: "scene", scene: "scene.x" } }], programs: [] } });
    scene.hass.loadBackendTranslation = vi.fn();
    scene.updated();
    expect(scene.hass.loadBackendTranslation).not.toHaveBeenCalled();
    const bare = mk({ value: "zz" });
    bare.updated();
    const noHass = mk(); noHass.hass = undefined;
    expect(() => noHass.updated()).not.toThrow();
  });
});
