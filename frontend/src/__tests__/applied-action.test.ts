import { describe, expect, it } from "vitest";
import { WeeklyPlannerCard } from "../weekly-planner-card";
import { appliedAction } from "../labels";

const hass: any = {
  language: "en", config: { time_zone: "UTC" },
  states: { "climate.a": { entity_id: "climate.a", state: "heat", attributes: {} }, "cover.b": { entity_id: "cover.b", state: "open", attributes: {} } },
  services: { climate: { set_temperature: { fields: {} } }, cover: { open_cover: { fields: {} }, close_cover: { fields: {} } } },
};
const temp = { id: "t", name: "Temp", color: "#00f", action: { kind: "service", service: "climate.set_temperature", data: { temperature: 15 } } };
const open = { id: "o", name: "Open", color: "#0f0", action: { kind: "service", service: "cover.open_cover" } };
// a label whose global action is for the thermostat, with a value valid for the cover
const mixed = { id: "m", name: "Mixed", color: "#f00", action: temp.action };
const slot = (label: string) => ({ id: "s" + label, start: { time: "08:00" }, end: { time: "09:00" }, label });

function setup(entities: any[], labels: any[], slots: any[]) {
  const program = { id: "p", name: "p", revision: 1, priority: 10, enabled: true, reapply: true, conditions: [], active_profile: "a", entities,
    profiles: [{ id: "a", name: "A", days: Array.from({ length: 7 }, () => slots) }] };
  const c = new WeeklyPlannerCard() as any;
  c.hass = hass;
  c._config = {};
  c._data = { programs: [program], labels, status: {}, can_edit: true, read_only: false };
  return { c, program };
}
const ent = (entity_id: string, extra = {}) => ({ entity_id, default_label: null, label_overrides: {}, ...extra });

describe("slots drawn only on devices that accept their action", () => {
  it("cover row excludes the thermostat label, thermostat row keeps it", () => {
    const { c, program } = setup([ent("climate.a"), ent("cover.b")], [temp, open], [slot("t"), slot("o")]);
    expect(c._spans("cover.b", [program]).map((s: any) => s.slotId)).toEqual(["so"]);
    expect(c._spans("climate.a", [program]).map((s: any) => s.slotId)).toEqual(["st"]);
  });
  it("a device with only incompatible slots gets no bar (same as empty)", () => {
    const { c, program } = setup([ent("cover.b")], [temp], [slot("t")]);
    expect(c._spans("cover.b", [program])).toEqual([]);
  });
  it("a label with a value valid for the cover is drawn on the cover", () => {
    const own = { kind: "service", service: "cover.open_cover" };
    const { c, program } = setup([ent("climate.a"), ent("cover.b", { label_overrides: { m: own } })], [mixed], [slot("m")]);
    expect(c._spans("cover.b", [program])).toHaveLength(1);
    expect(c._spans("climate.a", [program])).toHaveLength(1);
  });
  it("respects allowed_services", () => {
    const { c, program } = setup([ent("cover.b", { restrict_services: true, allowed_services: ["cover.close_cover"] })], [open], [slot("o")]);
    expect(c._spans("cover.b", [program])).toEqual([]);
    expect(appliedAction(hass, program as any, "cover.b", open as any)).toBeUndefined();
  });
});
