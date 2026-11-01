import { describe, expect, it, vi } from "vitest";
import { WpLabelPicker } from "../components/label-picker";
import type { HomeAssistant, PlannerData, Program } from "../types";

const flat = (v: any): string => {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(flat).join("");
  if (v && v.strings) return v.strings.map((s: string, i: number) => s + (i < v.values.length ? flat(v.values[i]) : "")).join("");
  return "";
};

const label = (id: string, name: string) => ({ id, name, color: "#f00", action: { kind: "service", service: "climate.set_temperature", data: { temperature: 21 } } });
const prog = (name: string, def: string | null): Program => ({ id: name, name, entities: [{ entity_id: "climate.a", default_label: def }], profiles: [] }) as unknown as Program;

function make(users: Program[], callWS: any, props: Record<string, unknown> = {}) {
  const hass = { language: "en", callWS, states: { "climate.a": { entity_id: "climate.a", state: "heat", attributes: {} } },
    services: { climate: { set_temperature: { target: { entity: { domain: "climate" } } } } } } as unknown as HomeAssistant;
  const data = { labels: [label("a", "Comfort"), label("b", "Eco")], programs: users } as unknown as PlannerData;
  const el = new WpLabelPicker() as any;
  Object.assign(el, { hass, data, program: prog("Office", null), entityIds: ["climate.a"], value: "a" }, props);
  return el;
}

describe("delete a setting from the modal", () => {
  it("shows a delete button (44px+ target, icon, label) except in the read-only strip", () => {
    expect(flat(make([], vi.fn()).render())).toContain("mdi:delete-outline");
    expect(flat(make([], vi.fn(), { readonlySettings: true }).render())).not.toContain("mdi:delete-outline");
    expect(flat(make([], vi.fn()).render())).toContain("Delete the setting");
  });
  it("asks before deleting and says it disappears for everyone", () => {
    const el = make([], vi.fn());
    el._confirmDel = true;
    const html = flat(el.render());
    expect(html).toContain("disappears for every device");
    expect(html).toContain("Cancel");
  });
  it("refuses when a program uses it, naming the programs, with no delete button", () => {
    const el = make([prog("Salon", "a"), prog("Bureau", "a")], vi.fn());
    el._confirmDel = true;
    const html = flat(el.render());
    expect(html).toContain("still used by: Salon, Bureau");
    expect(html).not.toContain("danger-line\" ?disabled");
    expect(html).toContain("Close");
  });
  it("calls the server and tells the parent when it succeeds", async () => {
    const callWS = vi.fn().mockResolvedValue(undefined);
    const el = make([], callWS);
    const seen: unknown[] = [];
    el.addEventListener("label-change", (e: CustomEvent) => seen.push(e.detail));
    el._confirmDel = true;
    await el._delete(el.data.labels[0]);
    expect(callWS).toHaveBeenCalledWith({ type: "weekly_planner/label/delete", label_id: "a" });
    expect(seen).toEqual([null]);
    expect(el._confirmDel).toBe(false);
  });
  it("shows the server refusal (in_use) and a generic error otherwise", async () => {
    const el = make([], vi.fn().mockRejectedValue({ code: "in_use", message: "Salon" }));
    el._confirmDel = true;
    await el._delete(el.data.labels[0]);
    expect(flat(el.render())).toContain("still used by: Salon");
    const el2 = make([], vi.fn().mockRejectedValue({ code: "boom" }));
    el2._confirmDel = true;
    await el2._delete(el2.data.labels[0]);
    expect(flat(el2.render())).toContain("Could not delete the setting.");
  });
});
