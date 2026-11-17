import { describe, expect, it, vi } from "vitest";
import { WpLabelPicker } from "../components/label-picker";
import { PALETTE } from "../labels";
import { t } from "../i18n";
import { flat, handlers } from "./helpers/tpl";

const action = { kind: "service", service: "cover.open_cover" };
function make() {
  const el: any = new WpLabelPicker();
  el.hass = { language: "en", states: { "cover.a": { attributes: { friendly_name: "Office" } }, "cover.b": { attributes: { friendly_name: "Bedroom" } } }, services: { cover: { open_cover: { fields: {}, target: { entity: { domain: "cover" } } }, close_cover: { fields: {} } } }, callWS: vi.fn(async () => ({ label: { id: "l" } })) };
  el.data = { labels: [{ id: "l", name: "Open", color: PALETTE[0], action }], programs: [] };
  el.program = { id: "p", name: "Office", entities: [{ entity_id: "cover.a", allowed_services: ["cover.open_cover"] }, { entity_id: "cover.b", label_overrides: { l: { kind: "service", service: "cover.close_cover" } } }], profiles: [] };
  el.entityIds = ["cover.a", "cover.b"];
  el.value = "l";
  el.dispatchEvent = vi.fn();
  return el;
}
function values(v: any, suffix: string): any[] {
  if (Array.isArray(v)) return v.flatMap(x => values(x, suffix));
  if (!v?.strings) return [];
  return v.values.flatMap((x: any, i: number) => v.strings[i].endsWith(suffix) ? [x] : values(x, suffix));
}
const clicks = (v: any) => handlers(v).filter(h => h.event === "click");

describe("label picker mutation interactions", () => {
  it("starts without entities, a selection, a form or a delete prompt and emits composed bubbling changes", () => {
    const el: any = new WpLabelPicker();
    expect([el.entityIds, el.value, el.allowNone, el._name, el._color, el._error, el._confirmDel, el._loaded]).toEqual([[], null, false, "", "", "", false, ""]);
    el.dispatchEvent = vi.fn();
    el._choose("l");
    expect(el.dispatchEvent.mock.calls[0][0]).toMatchObject({ type: "label-change", detail: "l", bubbles: true, composed: true });
  });

  it("opens, edits and resets a device value while preserving other draft changes", () => {
    const el = make(); el.embedded = true; el._open(true);
    let view = el._valueEditor("cover.a", "l");
    expect(values(view, "aria-expanded=")).toEqual([false]);
    expect(flat(view)).toContain('class="link "');
    expect(flat(view)).toContain(" · Office");
    clicks(view)[0].fn();
    view = el._valueEditor("cover.a", "l");
    expect(values(view, "aria-expanded=")).toEqual([true]);
    expect(values(view, ".action=")).toEqual([action]);
    expect(values(view, ".allowed=")).toEqual([["cover.open_cover"]]);
    el._ov = { "cover.b": null }; el._error = "previous";
    const event = { detail: { kind: "service", service: "cover.close_cover" }, stopPropagation: vi.fn() };
    handlers(view).find(h => h.event === "action-change")!.fn(event);
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(el._error).toBe("");
    expect(el._ov).toEqual({ "cover.b": null, "cover.a": event.detail });
    expect(el.dispatchEvent.mock.calls[el.dispatchEvent.mock.calls.length - 1][0].detail.overrides).toHaveLength(2);
    view = el._valueEditor("cover.a", "l");
    expect(flat(view)).toContain('class="link own"');
    expect(flat(view)).toContain(t("en", "lb_common_value"));
    expect(values(view, ".action=")).toEqual([event.detail]);
    clicks(view)[1].fn();
    expect(el._ov).toEqual({ "cover.b": null, "cover.a": null });
    expect(el.dispatchEvent.mock.calls[el.dispatchEvent.mock.calls.length - 1][0].detail.overrides).toContainEqual({ entityId: "cover.a", action: null });
    clicks(el._valueEditor("cover.a", "l"))[0].fn();
    expect(el._valueFor).toBeNull();
    el.entityIds = ["cover.a"];
    expect(flat(el._valueEditor("cover.a", "l"))).not.toContain(" · ");
  });

  it("binds the common action form, reports input changes and keeps advanced values open if only one device overrides", () => {
    const el = make(); el.embedded = true; el._open(true);
    let view = el._renderForm();
    expect(flat(view)).toContain(t("en", "lb_name"));
    expect(values(view, "entity-id=")).toContain("cover.a");
    expect(values(view, ".allowed=")).toContainEqual(["cover.open_cover"]);
    expect(values(view, "?advanced-open=")).toEqual([true]);
    handlers(view).find(h => h.event === "input")!.fn({ target: { value: "  Night " } });
    expect(el._draft().name).toBe("Night");
    const event = { detail: { kind: "scene", scene: "scene.night" }, stopPropagation: vi.fn() };
    handlers(view).find(h => h.event === "action-change")!.fn(event);
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(el._draft().action).toEqual(event.detail);
    expect(el.dispatchEvent.mock.calls[el.dispatchEvent.mock.calls.length - 1][0].detail.action).toEqual(event.detail);
    el.entityIds = []; view = el._renderForm();
    expect(values(view, "entity-id=")).toEqual([""]);
    expect(values(view, "?advanced-open=")).toEqual([false]);
    el._error = "Cannot save";
    const error = flat(el._renderForm());
    expect(error).toContain('role="alert"'); expect(error).toContain("tone-error");
    expect(error).toContain("Cannot save"); expect(error).not.toContain("Stryker");
  });

  it.each([[false, false, false], [true, false, true], [false, true, true]])("disables save and delete while saving=%s disabled=%s", (saving, disabled, expected) => {
    const el = make(); el._open(true); el._saving = saving; el.disabled = disabled;
    expect(values(el._renderForm(), "?disabled=").slice(-1)).toEqual([expected]);
    expect(values(el._renderDelete(el.data.labels[0]), "?disabled=")).toEqual([expected]);
  });

  it("wires the save, cancel and confirmed delete buttons", async () => {
    const el = make(); el._open(true);
    expect(flat(el._renderForm())).toContain(t("en", "save"));
    expect(flat(el._renderForm())).toContain(t("en", "cancel"));
    const buttons = clicks(el._renderForm());
    buttons[buttons.length - 2].fn();
    await Promise.resolve(); await Promise.resolve();
    expect(el.hass.callWS).toHaveBeenCalledWith(expect.objectContaining({ type: "weekly_planner/label/save" }));
    el._open(true);
    const cancel = clicks(el._renderForm()); cancel[cancel.length - 1].fn();
    expect(el._form).toBe(false);
    clicks(el._renderDelete(el.data.labels[0]))[0].fn();
    await Promise.resolve();
    expect(el.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/label/delete", label_id: "l" });
  });

  it("switches between new and existing forms and toggles delete confirmation", () => {
    const el = make();
    const pen = () => clicks(el._renderDetails(el.data.labels[0]))[0];
    pen().fn(); expect([el._form, el._editId]).toEqual([true, "l"]);
    expect(flat(el._renderDetails(el.data.labels[0]))).toContain('class="pen on"');
    pen().fn(); expect(el._form).toBe(false);
    // A closed edit retains its id; the pencil must reopen it.
    pen().fn(); expect(el._form).toBe(true);
    el._open(false); pen().fn(); expect(el._editId).toBe("l");
    const del = () => clicks(el._renderDetails(el.data.labels[0]))[1];
    el._delError = "old"; del().fn();
    expect([el._confirmDel, el._delError]).toEqual([true, ""]);
    expect(flat(el._renderDetails(el.data.labels[0]))).toContain('aria-expanded=');
    el._delError = "old"; del().fn(); expect([el._confirmDel, el._delError]).toEqual([false, ""]);
    const add = () => clicks(el.render()).find(h => h.before.slice(-150).includes('class="chip add'))!;
    add().fn(); expect([el._form, el._editId]).toEqual([true, null]);
    expect(flat(el.render())).toContain('class="chip add on"');
    expect(flat(el.render())).not.toContain('class="details"');
    add().fn(); expect(el._form).toBe(false);
    add().fn(); expect(el._editId).toBeNull();
  });
});
