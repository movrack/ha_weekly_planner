import { describe, expect, it, vi } from "vitest";
import { randomDelayRangeText, WpSlotForm } from "../components/slot-form";
import { groupSlots, shiftSpec, slotKey, specText } from "../actions";
import { mergeAdjacent, moveBoundary } from "../edits";
import { clockToMinutes } from "../time";
import type { Slot, TimeSpec } from "../types";
const at = (spec: TimeSpec) => "time" in spec ? clockToMinutes(spec.time) : 420 + (spec.offset ?? 0);
function form() {
  const view = new WpSlotForm() as any;
  view.group = { slot: { id: "s", start: { time: "08:00" }, end: { time: "10:00" }, label: "a" }, days: [0], ids: { 0: "s" } };
  view.dispatchEvent = vi.fn((event: CustomEvent) => { view.group = event.detail; return true; });
  return view;
}
describe("daily random delay", () => {
  it("bounds delay, preserves it through time edits and removes it explicitly", () => {
    const view = form();
    view._random("start", 15);
    view._fromInput("start", "08:07");
    expect(view.group.slot.start).toEqual({ time: "08:07", random_minutes: 15 });
    view._toggleSun("start", "sunset");
    expect(view.group.slot.start).toEqual({ sun: "sunset", offset: 0, random_minutes: 15 });
    view._toggleSun("start", "sunset");
    expect(view.group.slot.start).toEqual({ time: "08:07", random_minutes: 15 });
    view._random("start", 241); view._random("start", 1.5);
    expect(view.group.slot.start.random_minutes).toBe(15);
    expect(view.group.slot.end.random_minutes).toBeUndefined();
    view._random("start", 0);
    expect(JSON.parse(JSON.stringify(view.group.slot.start))).toEqual({ time: "08:07" });
  });
  it("retains delay in steps and names the window in summaries", () => {
    expect(shiftSpec({ time: "08:00", random_minutes: 15 }, 15)).toEqual({ time: "08:15", random_minutes: 15 });
    expect(shiftSpec({ sun: "sunset", offset: -15, random_minutes: 30 }, 15)).toEqual({ sun: "sunset", offset: 0, random_minutes: 30 });
    expect(specText("en", { time: "08:00", random_minutes: 15 }).replaceAll("\u00a0", " ")).toContain("Within the next 15 minutes");
  });
  it("separates windows in groups and preserves random shared boundaries", () => {
    const a: Slot = { id: "a", label: "x", start: { time: "08:00", random_minutes: 15 }, end: { time: "09:00", random_minutes: 15 } };
    const b: Slot = { ...a, id: "b", start: { time: "09:00", random_minutes: 15 }, end: { time: "10:00" } };
    expect(slotKey(a)).not.toBe(slotKey({ ...a, start: { time: "08:00", random_minutes: 30 } }));
    expect(groupSlots({ id: "p", name: "p", days: [[a], [{ ...a, id: "c", start: { time: "08:00" } }], [], [], [], [], []] }, () => true, at)).toHaveLength(2);
    expect(mergeAdjacent([a, b], { at })).toHaveLength(2);
    const moved = moveBoundary([a], { id: "a", edge: "start" }, 510, { at });
    expect(moved?.slots[0].start).toEqual({ time: "08:30" });
    expect(moved?.slots[0].end).toEqual(a.end);
  });
});

it("draws actual previous-day delayed tails and next-day one-shots from previews", async () => {
  const { WeeklyPlannerCard } = await import("../weekly-planner-card");
  const card = new WeeklyPlannerCard() as any;
  card.hass = { language: "en", config: { time_zone: "UTC" } };
  card._now = new Date("2026-01-02T12:00:00Z");
  const overnight: Slot = { id: "overnight", label: "a", start: { time: "23:00", random_minutes: 15 }, end: { time: "00:10", random_minutes: 15 } };
  const shot: Slot = { id: "shot", label: "a", start: { time: "23:55", random_minutes: 15 } };
  const program = { id: "p", enabled: true, active_profile: "home", entities: [{ entity_id: "switch.x", label_overrides: {} }],
    profiles: [{ id: "home", days: [[], [], [], [overnight, shot], [], [], []] }] };
  card._data = { labels: [{ id: "a", name: "On", color: "red", action: { kind: "service", service: "switch.turn_on" } }], status: {}, programs: [program] };
  card._preview = { "2026-01-01": { p: [
    { slot_id: "overnight", start: "2026-01-01T23:07:00Z", end: "2026-01-02T00:22:00Z" },
    { slot_id: "shot", start: "2026-01-02T00:06:00Z", end: null },
  ] }, "2026-01-02": { p: [] } };
  const spans = card._spans("switch.x", [program]);
  expect(spans.map((s: any) => [s.slotId, s.start, s.end, s.spill])).toEqual([
    ["overnight", 0, 22, true], ["shot", 6, 16, false],
  ]);
  card._preview = {};
  expect(card._spans("switch.x", [program])).toEqual([]);
});


describe("random delay explanation", () => {
  it("shows the exact requested fixed-time range in French", () => {
    expect(randomDelayRangeText("fr", { time: "16:45", random_minutes: 15 }))
      .toBe("Aléatoirement entre 16:45 et 17:00");
  });
  it("shows solar endpoints as event-relative offsets", () => {
    expect(randomDelayRangeText("fr", { sun: "sunset", offset: 60, random_minutes: 15 }))
      .toBe("Aléatoirement entre Coucher + 1h et Coucher + 1h15");
    expect(randomDelayRangeText("fr", { sun: "sunrise", offset: -15, random_minutes: 30 }))
      .toBe("Aléatoirement entre Lever − 15 min et Lever + 15 min");
  });
  it("marks the following day when the fixed delay crosses midnight", () => {
    expect(randomDelayRangeText("fr", { time: "23:50", random_minutes: 15 }))
      .toBe("Aléatoirement entre 23:50 et 00:05 (Jour suivant)");
    expect(randomDelayRangeText("fr", { time: "24:00", random_minutes: 15 }))
      .toBe("Aléatoirement entre 00:00 (Jour suivant) et 00:15 (Jour suivant)");
  });
  it("localizes the range in English without losing minute precision", () => {
    expect(randomDelayRangeText("en", { time: "16:47", random_minutes: 17 }))
      .toBe("Randomly between 16:47 and 17:04");
    expect(randomDelayRangeText("en", { sun: "sunset", offset: 60, random_minutes: 15 }))
      .toBe("Randomly between Sunset + 1h and Sunset + 1h15");
  });
  it("expresses solar clamping before the delay and retains the final latest cap", () => {
    expect(randomDelayRangeText("fr", { sun: "sunset", offset: 60, earliest: "18:00", latest: "22:00", random_minutes: 15 }))
      .toBe("Aléatoirement entre Coucher + 1h (Pas avant 18:00, Pas après 22:00) et Coucher + 1h (Pas avant 18:00, Pas après 22:00) + 15 min (Pas après 22:00)");
  });
});
