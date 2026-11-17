import { expect, it, vi } from "vitest";
import { WpLabelPicker } from "../components/label-picker";
import { loadServiceNames } from "../services";
import { PALETTE } from "../labels";
import { t } from "../i18n";
import { flat } from "./helpers/tpl";

vi.mock("../services", async importOriginal => ({ ...await importOriginal<object>(), loadServiceNames: vi.fn() }));
function make() {
  const el: any = new WpLabelPicker();
  el.hass = { language: "en", states: {}, services: {} };
  el.data = { labels: [{ id: "l", name: "Open", color: PALETTE[0], action: { kind: "service", service: "cover.open_cover" } }], programs: [] };
  el.program = { id: "p", name: "Room", entities: [], profiles: [] };
  el.value = "l";
  return el;
}
function values(v: any, suffix: string): any[] {
  if (Array.isArray(v)) return v.flatMap(x => values(x, suffix));
  if (!v?.strings) return [];
  return v.values.flatMap((x: any, i: number) => v.strings[i].endsWith(suffix) ? [x] : values(x, suffix));
}
it.each([true, false])("refreshes service names only when loading changed them (%s)", async changed => {
  const el = make();
  vi.mocked(loadServiceNames).mockReset().mockResolvedValue(changed);
  el.requestUpdate = vi.fn();
  el.updated();
  await Promise.resolve(); await Promise.resolve();
  expect(el.requestUpdate).toHaveBeenCalledTimes(changed ? 1 : 0);
  expect(loadServiceNames).toHaveBeenCalledWith(el.hass, ["cover"]);
  el.updated();
  expect(loadServiceNames).toHaveBeenCalledTimes(1);
});
it("does not request service names without a service domain or Home Assistant", () => {
  vi.mocked(loadServiceNames).mockReset().mockResolvedValue(false);
  const el = make(); el.hass = undefined; el.updated();
  expect(loadServiceNames).not.toHaveBeenCalled();
  el.hass = make().hass; el.value = null; el.updated();
  expect(loadServiceNames).not.toHaveBeenCalled();
});
it("validates required fields against the explicitly targeted device", () => {
  const el = make(); el._name = "Open";
  el.hass.states = { "cover.a": { attributes: { supported_features: 1 } }, "cover.b": { attributes: { supported_features: 0 } } };
  el.hass.services = { cover: { open_cover: { fields: { position: { required: true, filter: { supported_features: [1] }, selector: { number: {} } } } } } };
  el.entityIds = ["cover.a"];
  el._action = { kind: "service", service: "cover.open_cover", target_entity_id: "cover.b" };
  expect(el._formProblem).toBe("");
  el._action.target_entity_id = "cover.a";
  expect(el._formProblem).toBe(t("en", "lb_err_fields"));
});
it("gives edit and delete separate accessible names, titles and active states", () => {
  const el = make(); const label = el.data.labels[0];
  const names = [t("en", "rename_label"), t("en", "lb_delete")];
  let view = el._renderDetails(label);
  expect(flat(view).match(/class="pen "/g)).toHaveLength(2);
  expect(values(view, "aria-label=")).toEqual(names);
  expect(values(view, "title=")).toEqual(names);
  el._confirmDel = true;
  expect(flat(el._renderDetails(label))).toContain('class="pen on"');
  expect(flat(view)).toContain('class="pen "');
  el._open(true); el._close();
  expect(flat(el._renderDetails(label))).not.toContain('class="form"');
});
it("shows each label color in its chip and identifies the new-label button", () => {
  const el = make();
  el.entityIds = ["cover.a"];
  el.program.entities = [{ entity_id: "cover.a" }];
  el.hass.services = { cover: { open_cover: { fields: {}, target: { entity: { domain: "cover" } } } } };
  let view = flat(el.render());
  expect(view).toContain(`<i class="dot" style="background:${PALETTE[0]}"></i><span>Open</span>`);
  expect(view).toContain('class="chip add "');
  expect(view).toContain(`<span>${t("en", "lb_new")}</span>`);
  el._open(true); view = flat(el.render());
  expect(view).toContain('class="chip add "');
});
it("presents a delete refusal as one explanation without a duplicate heading", () => {
  const el = make(); el._delError = "Cannot delete a setting in use";
  const view = flat(el._renderDelete(el.data.labels[0]));
  expect(view).toContain('<div class="co-body"><p>Cannot delete a setting in use</p></div>');
});
it("omits the device suffix when editing a single device value", () => {
  const el = make(); el.entityIds = ["cover.a"];
  const view = flat(el._valueEditor("cover.a", "l"));
  expect(view).toContain(`>${t("en", "lb_value_here")}</button>`);
});
