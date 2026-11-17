import { expect, it, vi } from "vitest";
import { WpLabelPicker } from "../components/label-picker";
import { PALETTE } from "../labels";
import { t } from "../i18n";
import { flat, handlers } from "./helpers/tpl";

const action = { kind: "service", service: "cover.open_cover" };
const own = { kind: "service", service: "cover.close_cover" };
function make() {
  const el: any = new WpLabelPicker();
  el.hass = { language: "en", states: { "cover.a": { attributes: { friendly_name: "Office" } }, "cover.b": { attributes: { friendly_name: "Bedroom" } } }, services: { cover: { open_cover: { target: { entity: { domain: "cover" } }, fields: {} }, close_cover: { fields: {} } } }, callWS: vi.fn() };
  el.data = { labels: [{ id: "ten", name: "10", color: PALETTE[0], action }, { id: "two", name: "2", color: PALETTE[1], action }], programs: [] };
  el.program = { id: "p", name: "Office", revision: 1, entities: [{ entity_id: "cover.a" }, { entity_id: "cover.b", label_overrides: { ten: own } }], profiles: [] };
  el.entityIds = ["cover.a", "cover.b"]; el.value = "ten";
  el.dispatchEvent = vi.fn();
  return el;
}
function values(v: any, suffix: string): any[] {
  if (Array.isArray(v)) return v.flatMap(x => values(x, suffix));
  if (!v?.strings) return [];
  return v.values.flatMap((x: any, i: number) => v.strings[i].endsWith(suffix) ? [x] : values(x, suffix));
}
const clicks = (v: any) => handlers(v).filter(h => h.event === "click");

it("sorts numeric label names and exposes selection, color and a working None choice", () => {
  const el = make(); el.allowNone = true;
  let view = el.render(); let text = flat(view);
  expect(text.indexOf('<span>2</span>')).toBeLessThan(text.indexOf('<span>10</span>'));
  expect(text).toContain(`background:${PALETTE[0]}`);
  expect(text).toContain(`aria-label=${t("en", "action")}`);
  expect(text).toContain(`<span>${t("en", "rest_none")}</span>`);
  expect(values(view, "aria-checked=")).toEqual([false, false, true]);
  expect(text).toContain('class="chip on"'); expect(text).toContain('class="chip "');
  clicks(view)[1].fn(); expect(el.dispatchEvent.mock.calls[0][0].detail).toBe("two");
  clicks(view)[0].fn(); expect(el.dispatchEvent.mock.calls[1][0].detail).toBeNull();
  el.value = null; view = el.render();
  expect(values(view, "aria-checked=")).toEqual([true, false, false]);
  el.value = "missing"; view = el.render();
  expect(flat(view)).toContain("<span>?</span>");
  expect(values(view, "aria-checked=")).toEqual([false, false, false, true]);
  const count = el.dispatchEvent.mock.calls.length;
  clicks(view)[3].fn(); expect(el.dispatchEvent).toHaveBeenCalledTimes(count);
  el.value = "ten"; expect(flat(el.render())).not.toContain("<span>?</span>");
  el.hass = undefined; expect(flat(el.render())).toBe("");
  el.hass = make().hass; el.data = undefined; expect(flat(el.render())).toBe("");
});

it("keeps only the form being edited visible and restores summaries for readonly settings", () => {
  const el = make();
  const before = flat(el.render());
  expect(before).toContain('class="sum"'); expect(before).not.toContain('class="form"');
  expect(before).not.toContain('class="delbox"');
  expect(before).toContain(t("en", "rename_label")); expect(before).toContain(t("en", "lb_delete"));
  expect(before).toContain('class="pen "'); expect(before).not.toContain('class="pen on"');
  expect(before).toContain(t("en", "lb_value_here")); expect(before).toContain('<span class="who">Bedroom</span>');
  el.entityIds = ["cover.b"];
  expect(flat(el.render())).not.toContain('class="who"');
  el._open(true);
  expect(flat(el.render())).toContain('class="form"'); expect(flat(el.render())).not.toContain('class="sum"');
  el.readonlySettings = true;
  expect(flat(el.render())).not.toContain('class="form"'); expect(flat(el.render())).toContain('class="sum"');
  el._open(false);
  expect(flat(el.render())).toContain('class="details"'); expect(flat(el.render())).not.toContain('class="form"');
  el.readonlySettings = false;
  expect(flat(el.render())).toContain('class="form"'); expect(flat(el.render())).not.toContain('class="details"');
  el._close(); el.compact = true;
  expect(flat(el.render())).not.toContain('class="chip add');
});

it("names other programs that share a setting without repeating the current program", () => {
  const el = make();
  el.data.programs = ["Office", "Upstairs", "Downstairs"].map(name => ({ name, entities: [{ default_label: "ten" }], profiles: [] }));
  const view = flat(el.render());
  expect(view).toContain(t("en", "used_by", { names: "Upstairs, Downstairs" }));
  expect(view).not.toContain("Office, Upstairs");
});

it.each(["#ABCD", " #abc ", "#12345678"])("shows valid custom color %s with accessible name and title", color => {
  const el = make(); el._color = color;
  const view = flat(el._swatches());
  expect(view).toContain('class="sw custom"');
  expect(view).toContain(`aria-label=${t("en", "color_custom")}`);
  expect(view).toContain(`title=${t("en", "color_custom")}`);
  expect(view).toContain(`background:${color}`);
});
it.each(["x#abc", "#abc!", "#ab", "#123456789"])("rejects malformed custom color %s", color => {
  const el = make(); el._color = color;
  expect(flat(el._swatches())).not.toContain('class="sw custom"');
  expect(values(el._swatches(), "tabindex=")[0]).toBe(0);
});
it("marks only the selected palette swatch and tolerates a missing focus target", () => {
  const el = make(); el._color = PALETTE[0];
  expect(values(el._swatches(), "class=")).toEqual(["on", ...PALETTE.slice(1).map(() => "")]);
  expect(flat(el._swatches())).toContain(t("en", "lb_color"));
  expect(flat(el._swatches())).not.toContain('class="sw custom"');
  expect(values(el._swatches(), "tabindex=")).toEqual([0, ...PALETTE.slice(1).map(() => -1)]);
  const event = { key: "ArrowRight", preventDefault: vi.fn(), currentTarget: { querySelectorAll: () => [] } };
  expect(() => handlers(el._swatches()).find(h => h.event === "keydown")!.fn(event)).not.toThrow();
  expect(el._color).toBe(PALETTE[1]);
});

it("saves overrides into the matching fresh program and leaves unrelated devices intact", async () => {
  const el = make(); el._ov = { "cover.a": own };
  const other = { ...el.program, id: "other", revision: 8 };
  const untouched = { entity_id: "cover.c", default_label: "two" };
  const fresh = { ...el.program, revision: 12, entities: [...el.program.entities, untouched] };
  el.hass.callWS = vi.fn(async (msg: any) => msg.type === "weekly_planner/get" ? { programs: [other, fresh] } : {});
  await el._saveOverrides("ten");
  const saved = el.hass.callWS.mock.calls[1][0].program;
  expect(saved.id).toBe("p"); expect(saved.revision).toBe(12);
  expect(saved.entities[2]).toBe(untouched);
  expect(saved.entities[0].label_overrides).toEqual({ ten: own });
  el.hass.callWS = vi.fn(async (msg: any) => { if (msg.type === "weekly_planner/get") return { programs: [fresh] }; throw null; });
  await expect(el._saveOverrides("ten")).rejects.toBeNull();
});

it.each(["save", "delete"])("keeps %s pending until the server settles and handles null rejection", async operation => {
  const el = make(); el._open(true);
  let reject!: (error: unknown) => void;
  el.hass.callWS = vi.fn(() => new Promise((_resolve, fail) => { reject = fail; }));
  const pending = operation === "save" ? el._save() : el._delete(el.data.labels[0]);
  expect(el._saving).toBe(true);
  reject(null); await pending;
  expect(el._saving).toBe(false);
  expect(operation === "save" ? el._error : el._delError).toBe(t("en", operation === "save" ? "lb_err_save" : "lb_err_delete"));
});
