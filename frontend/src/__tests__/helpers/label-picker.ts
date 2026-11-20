// Shared set-up of the label picker tests: one factory, the two settings it starts with, and small template readers.
import { vi } from "vitest";
import { WpLabelPicker } from "../../components/label-picker";
import { PALETTE } from "../../labels";
import { handlers } from "./tpl";

export const open = { id: "l", name: "Open", color: PALETTE[2], action: { kind: "service", service: "cover.open_cover" } };
export const close = { id: "l2", name: "Close", color: PALETTE[3], action: { kind: "service", service: "cover.close_cover" } };

/** A picker on `cover.a`, with the settings `open` (chosen) and `close`; `cover.b` has its own value for `open`. */
export const mk = (props: any = {}) => {
  const el: any = new WpLabelPicker();
  el.hass = {
    language: "en",
    states: { "cover.a": { attributes: { friendly_name: "Office" } }, "cover.b": { attributes: { friendly_name: "Bedroom" } } },
    services: { cover: { open_cover: { fields: {}, target: { entity: { domain: "cover" } } }, close_cover: { fields: {} } } },
    callWS: vi.fn(async () => ({ label: { id: "new" }, programs: [] })),
  };
  el.data = { labels: [open, close], programs: [], status: {} };
  el.program = {
    id: "p", name: "Office", revision: 1, profiles: [],
    entities: [
      { entity_id: "cover.a", default_label: null, label_overrides: {} },
      { entity_id: "cover.b", default_label: null, label_overrides: { l: close.action } },
    ],
  };
  el.entityIds = ["cover.a"];
  el.value = "l";
  el.dispatchEvent = vi.fn();
  Object.assign(el, props);
  return el;
};

/** The `[type, detail]` of every event the picker dispatched. */
export const events = (el: any) => el.dispatchEvent.mock.calls.map(([e]: any[]) => [e.type, e.detail]);

/** The values bound right after `suffix` (for example `aria-checked=`), in document order. */
export function values(v: any, suffix: string): any[] {
  if (Array.isArray(v)) return v.flatMap((x) => values(x, suffix));
  if (!v?.strings) return [];
  return v.values.flatMap((x: any, i: number) => (v.strings[i].endsWith(suffix) ? [x] : values(x, suffix)));
}

export const clicks = (v: any) => handlers(v).filter((h) => h.event === "click");
