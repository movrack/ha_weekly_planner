import { describe, expect, it, vi } from "vitest";
import { PALETTE, PALETTE_NAMES } from "../labels";
import { strings, t } from "../i18n";
import { WpLabelPicker } from "../components/label-picker";
import { find, flat, handlers } from "./helpers/tpl";
import { clicks, close, mk, open, values } from "./helpers/label-picker";

// What the label picker shows and what its buttons do. The state itself is in label-picker.test.ts.
const ten = { id: "ten", name: "10", color: PALETTE[0], action: open.action };
const two = { id: "two", name: "2", color: PALETTE[1], action: open.action };
const numbered = (props: any = {}) => mk({ data: { labels: [ten, two], programs: [] }, value: "ten", entityIds: ["cover.a", "cover.b"], ...props });
const both = (props: any = {}) => {
  const el = mk({ entityIds: ["cover.a", "cover.b"], ...props });
  el.program.entities[0].allowed_services = ["cover.open_cover"];
  return el;
};

describe("the chips", () => {
  it("sorts numeric names by value", () => {
    const text = flat(numbered().render());
    expect(text.indexOf("<span>2</span>")).toBeLessThan(text.indexOf("<span>10</span>"));
  });
  it("shows the colour of each setting, marks the chosen one and names the group", () => {
    const view = numbered().render();
    const text = flat(view);
    expect(text).toContain(`background:${PALETTE[0]}`);
    expect(text).toContain(`aria-label=${t("en", "action")}`);
    expect(values(view, "aria-checked=")).toEqual([false, true]);
    expect(text).toContain('class="chip on"');
    expect(text).toContain('class="chip "');
  });
  it("shows the colour in the chip and identifies the new-setting button, also while a form is open", () => {
    const el = both();
    expect(flat(el.render())).toContain(`<i class="dot" style="background:${open.color}"></i><span>Open</span>`);
    expect(flat(el.render())).toContain('class="chip add "');
    expect(flat(el.render())).toContain(`<span>${t("en", "lb_new")}</span>`);
    el._open(true);
    expect(flat(el.render())).toContain('class="chip add "');
  });
  it("offers a None choice that the parent hears, and that is checked when nothing is chosen", () => {
    const el = numbered({ allowNone: true });
    let view = el.render();
    expect(flat(view)).toContain(`<span>${t("en", "rest_none")}</span>`);
    expect(values(view, "aria-checked=")).toEqual([false, false, true]);
    clicks(view)[1].fn(); expect(el.dispatchEvent.mock.calls[0][0].detail).toBe("two");
    clicks(view)[0].fn(); expect(el.dispatchEvent.mock.calls[1][0].detail).toBeNull();
    el.value = null; view = el.render();
    expect(values(view, "aria-checked=")).toEqual([true, false, false]);
  });
  it("shows an unknown chosen setting as a question mark that does nothing when clicked", () => {
    const el = numbered({ allowNone: true, value: "missing" });
    const view = el.render();
    expect(flat(view)).toContain("<span>?</span>");
    expect(values(view, "aria-checked=")).toEqual([false, false, false, true]);
    clicks(view)[3].fn();
    expect(el.dispatchEvent).not.toHaveBeenCalled();
    el.value = "ten";
    expect(flat(el.render())).not.toContain("<span>?</span>");
  });
  it.each([["Home Assistant", { hass: undefined }], ["the data", { data: undefined }]])("shows nothing without %s", (_what, props) => {
    expect(flat(numbered(props).render())).toBe("");
  });
  it("names the other programs that share a setting, not the current one", () => {
    const el = numbered();
    el.data.programs = ["Office", "Upstairs", "Downstairs"].map((name) => ({ name, entities: [{ default_label: "ten" }], profiles: [] }));
    const view = flat(el.render());
    expect(view).toContain(t("en", "used_by", { names: "Upstairs, Downstairs" }));
    expect(view).not.toContain("Office, Upstairs");
  });
});

describe("the chosen setting's summary", () => {
  it("shows the summary, the edit and delete buttons and the device value link, not the form", () => {
    const view = flat(both().render());
    expect(view).toContain('class="sum"'); expect(view).not.toContain('class="form"');
    expect(view).not.toContain('class="delbox"');
    expect(view).toContain(t("en", "rename_label")); expect(view).toContain(t("en", "lb_delete"));
    expect(view).toContain('class="pen "'); expect(view).not.toContain('class="pen on"');
    expect(view).toContain(t("en", "lb_value_here")); expect(view).toContain('<span class="who">Bedroom</span>');
  });
  it("leaves out the device name when there is a single device", () => {
    const view = flat(mk({ entityIds: ["cover.b"] }).render());
    expect(view).toContain(t("en", "lb_value_here"));
    expect(view).not.toContain('class="who"');
  });
  it("gives edit and delete separate names and titles", () => {
    const view = mk()._renderDetails(open);
    const names = [t("en", "rename_label"), t("en", "lb_delete")];
    expect(flat(view).match(/class="pen "/g)).toHaveLength(2);
    expect(values(view, "aria-label=")).toEqual(names);
    expect(values(view, "title=")).toEqual(names);
  });
  it("marks the delete button active while the confirmation is open", () => {
    const el = mk();
    el._confirmDel = true;
    expect(flat(el._renderDetails(open))).toContain('class="pen on"');
  });
  it("hides the form again once it is closed", () => {
    const el = mk();
    el._open(true); el._close();
    expect(flat(el._renderDetails(open))).not.toContain('class="form"');
  });
  it("shows the form instead of the summary while editing", () => {
    const el = mk();
    el._open(true);
    expect(flat(el.render())).toContain('class="form"'); expect(flat(el.render())).not.toContain('class="sum"');
  });
  it("shows only the details in the read-only strip and the form again when it is lifted", () => {
    const el = mk({ readonlySettings: true });
    el._open(true);
    expect(flat(el.render())).not.toContain('class="form"'); expect(flat(el.render())).toContain('class="sum"');
    el._open(false);
    expect(flat(el.render())).toContain('class="details"'); expect(flat(el.render())).not.toContain('class="form"');
    el.readonlySettings = false;
    expect(flat(el.render())).toContain('class="form"'); expect(flat(el.render())).not.toContain('class="details"');
  });
  it("hides the new-setting chip when compact", () => {
    expect(flat(mk({ compact: true }).render())).not.toContain('class="chip add');
  });
  it("offers delete except in the read-only strip", () => {
    expect(flat(mk().render())).toContain("mdi:delete-outline");
    expect(flat(mk().render())).toContain(t("en", "lb_delete"));
    expect(flat(mk({ readonlySettings: true }).render())).not.toContain("mdi:delete-outline");
  });
  it("shows the delete box under the chips once the bin is clicked, but never in the read-only strip", () => {
    const el = mk();
    el._confirmDel = true;
    expect(flat(el.render())).toContain('class="delbox"');
    el.readonlySettings = true;
    expect(flat(el.render())).not.toContain('class="delbox"');
  });
  it("presents a delete refusal as one explanation without a duplicate heading", () => {
    const el = mk();
    el._delError = "Cannot delete a setting in use";
    expect(flat(el._renderDelete(open))).toContain('<div class="co-body"><p>Cannot delete a setting in use</p></div>');
  });
});

describe("the buttons of the summary", () => {
  it("the pen opens the form of the chosen setting, then closes it, then reopens it", () => {
    const el = mk();
    const pen = () => clicks(el._renderDetails(open))[0];
    pen().fn(); expect([el._form, el._editId]).toEqual([true, "l"]);
    expect(flat(el._renderDetails(open))).toContain('class="pen on"');
    pen().fn(); expect(el._form).toBe(false);
    // A closed edit retains its id; the pencil must reopen it.
    pen().fn(); expect(el._form).toBe(true);
  });
  it("the pen switches a new-setting form to the chosen setting", () => {
    const el = mk();
    el._open(false);
    clicks(el._renderDetails(open))[0].fn();
    expect(el._editId).toBe("l");
  });
  it("the bin asks, then withdraws the question, and clears an old refusal each time", () => {
    const el = mk();
    const bin = () => clicks(el._renderDetails(open))[1];
    el._delError = "old"; bin().fn();
    expect([el._confirmDel, el._delError]).toEqual([true, ""]);
    expect(flat(el._renderDetails(open))).toContain("aria-expanded=");
    el._delError = "old"; bin().fn();
    expect([el._confirmDel, el._delError]).toEqual([false, ""]);
  });
  it("the new-setting chip opens an empty form, then closes it, then reopens it", () => {
    const el = mk();
    const add = () => clicks(el.render()).find((h) => h.before.slice(-150).includes('class="chip add'))!;
    add().fn(); expect([el._form, el._editId]).toEqual([true, null]);
    expect(flat(el.render())).toContain('class="chip add on"');
    expect(flat(el.render())).not.toContain('class="details"');
    add().fn(); expect(el._form).toBe(false);
    add().fn(); expect(el._editId).toBeNull();
  });
});

describe("a device's own value", () => {
  it("opens, is edited and is reset while the other draft changes stay", () => {
    const el = both({  });
    el._open(true);
    let view = el._valueEditor("cover.a", "l");
    expect(values(view, "aria-expanded=")).toEqual([false]);
    expect(flat(view)).toContain('class="link "');
    expect(flat(view)).toContain(" · Office");
    clicks(view)[0].fn();
    view = el._valueEditor("cover.a", "l");
    expect(values(view, "aria-expanded=")).toEqual([true]);
    expect(values(view, ".action=")).toEqual([open.action]);
    expect(values(view, ".allowed=")).toEqual([["cover.open_cover"]]);
    el._ov = { "cover.b": null }; el._error = "previous";
    const event = { detail: { kind: "service", service: "cover.close_cover" }, stopPropagation: vi.fn() };
    handlers(view).find((h) => h.event === "action-change")!.fn(event);
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(el._error).toBe("");
    expect(el._ov).toEqual({ "cover.b": null, "cover.a": event.detail });
    view = el._valueEditor("cover.a", "l");
    expect(flat(view)).toContain('class="link own"');
    expect(flat(view)).toContain(t("en", "lb_common_value"));
    expect(values(view, ".action=")).toEqual([event.detail]);
    clicks(view)[1].fn();
    expect(el._ov).toEqual({ "cover.b": null, "cover.a": null });
  });
  it("closes again when its link is clicked a second time", () => {
    const el = both({  });
    el._open(true);
    clicks(el._valueEditor("cover.a", "l"))[0].fn();
    clicks(el._valueEditor("cover.a", "l"))[0].fn();
    expect(el._valueFor).toBeNull();
  });
  it("leaves out the device name when editing a single device", () => {
    const el = mk();
    const view = flat(el._valueEditor("cover.a", "l"));
    expect(view).not.toContain(" · ");
    expect(view).toContain(`>${t("en", "lb_value_here")}</button>`);
  });
});

describe("the form", () => {
  it("binds the common action to the first device and keeps name and action changes", () => {
    const el = both({  });
    el._open(true);
    const view = el._renderForm();
    expect(flat(view)).toContain(t("en", "lb_name"));
    expect(values(view, "entity-id=")).toContain("cover.a");
    expect(values(view, ".allowed=")).toContainEqual(["cover.open_cover"]);
    handlers(view).find((h) => h.event === "input")!.fn({ target: { value: "  Night " } });
    expect(el._name).toBe("  Night ");
    const event = { detail: { kind: "scene", scene: "scene.night" }, stopPropagation: vi.fn() };
    handlers(view).find((h) => h.event === "action-change")!.fn(event);
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(el._action).toEqual(event.detail);
  });
  it.each([[["cover.a", "cover.b"], [true]], [[], [false]]])("keeps the advanced values open when only a device overrides: devices %j", (entityIds, expected) => {
    const el = both({ entityIds });
    el._open(true);
    const view = el._renderForm();
    expect(values(view, "?advanced-open=")).toEqual(expected);
    if (!entityIds.length) expect(values(view, "entity-id=")).toEqual([""]);
  });
  it("shows an error as an alert", () => {
    const el = mk();
    el._open(true);
    el._error = "Cannot save";
    const error = flat(el._renderForm());
    expect(error).toContain('role="alert"'); expect(error).toContain("tone-error");
    expect(error).toContain('<div class="co-body"><p>Cannot save</p></div>');
  });
  it.each([[false, false, false], [true, false, true], [false, true, true]])("disables save and delete while saving=%s disabled=%s", (saving, disabled, expected) => {
    const el = mk(); el._open(true); el._saving = saving; el.disabled = disabled;
    expect(values(el._renderForm(), "?disabled=").slice(-1)).toEqual([expected]);
    expect(values(el._renderDelete(open), "?disabled=")).toEqual([expected]);
  });
  it("wires the save, cancel and confirmed delete buttons", async () => {
    const el = mk(); el._open(true);
    expect(flat(el._renderForm())).toContain(t("en", "save"));
    expect(flat(el._renderForm())).toContain(t("en", "cancel"));
    const buttons = clicks(el._renderForm());
    buttons[buttons.length - 2].fn();
    await Promise.resolve(); await Promise.resolve();
    expect(el.hass.callWS).toHaveBeenCalledWith(expect.objectContaining({ type: "weekly_planner/label/save" }));
    el._open(true);
    const cancel = clicks(el._renderForm()); cancel[cancel.length - 1].fn();
    expect(el._form).toBe(false);
    clicks(el._renderDelete(open))[0].fn();
    await Promise.resolve();
    expect(el.hass.callWS).toHaveBeenCalledWith({ type: "weekly_planner/label/delete", label_id: "l" });
  });
});

describe("the colour swatches", () => {
  const key = (el: any, k: string) => {
    const focus = vi.fn();
    const buttons = PALETTE.map(() => ({ focus }));
    const ev = { key: k, preventDefault: vi.fn(), currentTarget: { querySelectorAll: vi.fn(() => buttons) } };
    handlers(el._swatches()).find((h) => h.event === "keydown")!.fn(ev);
    return { ev, focus };
  };
  const n = PALETTE.length;
  it.each([
    ["ArrowRight", 0, 1], ["ArrowDown", n - 1, 0], ["ArrowLeft", 0, n - 1], ["ArrowUp", 3, 2], ["Home", 4, 0], ["End", 1, n - 1],
  ])("%s on swatch %i chooses swatch %i, keeps the browser still and moves the focus", (k, from, to) => {
    const el = mk();
    el._color = PALETTE[from];
    const r = key(el, k);
    expect(el._color).toBe(PALETTE[to]);
    expect(r.ev.preventDefault).toHaveBeenCalledTimes(1);
    expect(r.focus).toHaveBeenCalledTimes(1);
    expect(r.ev.currentTarget.querySelectorAll).toHaveBeenCalledWith("button.sw:not(.custom)");
  });
  it.each([["ArrowLeft", n - 1], ["ArrowRight", 0]])("%s from a custom colour goes to swatch %i", (k, to) => {
    const el = mk();
    el._color = "#123456";
    key(el, k);
    expect(el._color).toBe(PALETTE[to]);
  });
  it("ignores other keys", () => {
    const el = mk();
    el._color = PALETTE[2];
    const r = key(el, "x");
    expect(el._color).toBe(PALETTE[2]);
    expect([r.ev.preventDefault.mock.calls.length, r.focus.mock.calls.length, r.ev.currentTarget.querySelectorAll.mock.calls.length]).toEqual([0, 0, 0]);
  });
  it("ignores keys when the picker is disabled", () => {
    const el = mk({ disabled: true });
    el._color = PALETTE[2];
    key(el, "ArrowRight");
    expect(el._color).toBe(PALETTE[2]);
  });
  it("still chooses the neighbour when there is no button to focus", () => {
    const el = mk(); el._color = PALETTE[0];
    const event = { key: "ArrowRight", preventDefault: vi.fn(), currentTarget: { querySelectorAll: () => [] } };
    expect(() => handlers(el._swatches()).find((h) => h.event === "keydown")!.fn(event)).not.toThrow();
    expect(el._color).toBe(PALETTE[1]);
  });
  it.each([0, 1])("marks swatch %i as chosen and as the only tab stop", (at) => {
    const el = mk(); el._color = PALETTE[at];
    const html = flat(el._swatches());
    expect(html.match(/role="radio"/g)).toHaveLength(PALETTE.length);
    expect(html).toContain(t("en", "lb_color"));
    expect(html).not.toContain('class="sw custom"');
    expect(values(el._swatches(), "aria-checked=").indexOf(true)).toBe(at);
    expect(values(el._swatches(), "class=")).toEqual(PALETTE.map((_, i) => (i === at ? "on" : "")));
    expect(values(el._swatches(), "tabindex=")).toEqual(PALETTE.map((_, i) => (i === at ? 0 : -1)));
  });
  it("a click chooses the swatch", () => {
    const el = mk();
    handlers(el._swatches()).filter((h) => h.event === "click")[2].fn();
    expect(el._color).toBe(PALETTE[2]);
  });
  it.each(["#abc", "#ABCD", " #abc ", "#12345678"])("a valid custom colour %s is shown as the chosen swatch with its accessible name", (color) => {
    const el = mk(); el._color = color;
    const view = flat(el._swatches());
    expect(view).toContain('class="sw custom" role="radio" aria-checked="true" tabindex="0"');
    expect(view).toContain(`aria-label=${t("en", "color_custom")}`);
    expect(view).toContain(`title=${t("en", "color_custom")}`);
    expect(view).toContain(`background:${color}`);
    expect(values(el._swatches(), "tabindex=")).toEqual(PALETTE.map(() => -1));
  });
  it.each(["x#abc", "#abc!", "#ab", "#123456789", "nonsense"])("a malformed custom colour %s is not shown and the first swatch stays the tab stop", (color) => {
    const el = mk(); el._color = color;
    expect(flat(el._swatches())).not.toContain('class="sw custom"');
    expect(values(el._swatches(), "tabindex=")[0]).toBe(0);
  });
});

describe("the colour swatches", () => {
  const swatchPicker = (color: string) => {
    const el = new WpLabelPicker() as any;
    el.hass = { language: "en" }; el._color = color; el.disabled = false;
    el._set = vi.fn();
    return el;
  };
  it("names each swatch by colour and checks exactly the current one", () => {
    const tpl = swatchPicker(PALETTE[1])._swatches();
    const html = flat(tpl);
    expect(html).not.toContain("aria-label=#");
    const checked = (tpl.values[2] as any[]).filter((x) => x.values[0] === true);
    expect(checked).toHaveLength(1);
    expect(PALETTE_NAMES).toHaveLength(PALETTE.length);
    for (const k of PALETTE_NAMES) expect((strings("en") as any)[k]).toBeTruthy();
    const fr = swatchPicker(PALETTE[0]); fr.hass.language = "fr";
    expect(flat(fr._swatches())).toContain("Rouge");
  });
  it("adds a checked, named custom swatch for a colour outside the palette; the palette swatches stay unchecked", () => {
    const tpl = swatchPicker("#c0b54a")._swatches();
    const html = flat(tpl);
    expect((tpl.values[2] as any[]).filter((x) => x.values[0] === true)).toHaveLength(0);
    expect(html).toContain('role="radio" aria-checked="true" tabindex="0"');
    expect(html).toContain("sw custom");
    expect(html).toContain("background:#c0b54a");
    expect(html).toContain("Custom color");
    expect(flat(swatchPicker(PALETTE[1])._swatches())).not.toContain("sw custom");
    const fr = swatchPicker("#c0b54a"); fr.hass.language = "fr";
    expect(flat(fr._swatches())).toContain("Couleur personnalisée");
  });
  it("moves with the arrow keys as a radiogroup", () => {
    const el = swatchPicker(PALETTE[0]);
    const btns = Array.from({ length: PALETTE.length }, () => ({ focus: vi.fn() }));
    const ev = { key: "ArrowRight", preventDefault: vi.fn(), currentTarget: { querySelectorAll: () => btns } };
    find(el._swatches(), "keydown", "radiogroup").fn(ev);
    expect(el._set).toHaveBeenCalledWith({ color: PALETTE[1] });
    expect(btns[1].focus).toHaveBeenCalled();
    find(el._swatches(), "keydown", "radiogroup").fn({ ...ev, key: "ArrowLeft" });
    expect(el._set).toHaveBeenLastCalledWith({ color: PALETTE[PALETTE.length - 1] });
  });
  it("has a 44 px hit area", () => {
    expect((WpLabelPicker.styles as any[]).map((s) => s.cssText).join("")).toMatch(/\.sw \{ width: 44px; height: 44px/);
  });
});
