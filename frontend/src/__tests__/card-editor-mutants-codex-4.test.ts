import { afterEach, expect, it, vi } from "vitest";
import { WeeklyPlannerCardEditor } from "../card-editor";
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
it("accepts the replaced configuration exactly when the echo guard expires", () => {
  vi.useFakeTimers(); vi.setSystemTime(10000);
  const el: any = new WeeklyPlannerCardEditor();
  el.setConfig({ type: "custom:weekly-planner-card", title: "Before" });
  el._set("title", "After");
  const sent = vi.spyOn(el, "dispatchEvent");
  vi.advanceTimersByTime(1500);
  el.setConfig({ type: "custom:weekly-planner-card", title: "Before" });
  expect(el._config.title).toBe("Before");
  expect(el._sent).toBeUndefined();
  expect(sent).not.toHaveBeenCalled();
});
it("recognizes reordered nested object keys without replacing the current configuration", () => {
  vi.useFakeTimers(); vi.setSystemTime(10000);
  const el: any = new WeeklyPlannerCardEditor();
  el.setConfig({ type: "custom:weekly-planner-card", filter: { area: ["z", "a"], programs: ["b", "a"] } });
  el._set("title", "After");
  const config = el._config;
  const guard = el._sent;
  el.setConfig({ chart_collapsed: true, show_chart: true, schedule_view: "bars", title: "After", filter: { programs: ["b", "a"], area: ["z", "a"] }, type: "custom:weekly-planner-card" });
  expect(el._config).toBe(config);
  expect(el._sent).toBe(guard);
});
it("refreshes icons when a different domain set has the same concatenated spelling", async () => {
  const el: any = new WeeklyPlannerCardEditor();
  vi.useFakeTimers();
  el.hass = { states: {} };
  el._loadDomainIcons(["ab", "c"]);
  await vi.advanceTimersByTimeAsync(0);
  expect(el._iconKey).toBe("ab,c");
  el._loadDomainIcons(["a", "bc"]);
  await vi.advanceTimersByTimeAsync(0);
  expect(el._iconKey).toBe("a,bc");
  expect([...el._typeIcons.keys()]).toEqual(["a", "bc"]);
});
