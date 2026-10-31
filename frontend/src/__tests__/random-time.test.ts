import { describe, expect, it, vi } from "vitest";
import { randomDelayRangeText, solarMeaningText, solarTodayText, WpSlotForm } from "../components/slot-form";
import { t } from "../i18n";
import { groupSlots, shiftSpec, slotKey, specText } from "../actions";
import { mergeAdjacent, moveBoundary } from "../edits";
import { clockToMinutes } from "../time";
import { specMinutes, sunBoundsInvalid } from "../slots";
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
  const sunHass = (setting: string) => ({ states: { "sun.sun": { attributes: { next_setting: setting } } }, config: { time_zone: "UTC" } }) as any;
  const today = new Date().toISOString().slice(0, 11);
  it("says in plain words the fixed-time range, for a start and an end", () => {
    expect(randomDelayRangeText("fr", { time: "16:45", random_minutes: 15 })).toBe("Chaque jour, démarre au hasard entre 16:45 et 17:00.");
    expect(randomDelayRangeText("fr", { time: "16:45", random_minutes: 15 }, "end")).toBe("Chaque jour, se termine au hasard entre 16:45 et 17:00.");
  });
  it("describes a solar delay relative to the event when today's sun time is unknown", () => {
    expect(randomDelayRangeText("fr", { sun: "sunset", offset: 30, random_minutes: 15 }))
      .toBe("Chaque jour, démarre au hasard entre coucher + 30 min et 15 min plus tard.");
    expect(randomDelayRangeText("fr", { sun: "sunrise", offset: -15, random_minutes: 30 }, "end"))
      .toBe("Chaque jour, se termine au hasard entre lever − 15 min et 30 min plus tard.");
  });
  it("adds the bounds only in the relative wording, once", () => {
    expect(randomDelayRangeText("fr", { sun: "sunset", offset: 30, earliest: "18:00", latest: "19:00", random_minutes: 15 }))
      .toBe("Chaque jour, démarre au hasard entre coucher + 30 min et 15 min plus tard, mais pas avant 18:00 ni après 19:00.");
  });
  it("uses the resolved clock times of today, clamped and capped by the latest bound", () => {
    const hass = sunHass(`${today}17:30:00Z`);
    expect(randomDelayRangeText("fr", { sun: "sunset", offset: 30, earliest: "18:00", random_minutes: 15 }, "start", hass))
      .toBe("Chaque jour, démarre au hasard entre 18:00 et 18:15.");
    expect(randomDelayRangeText("fr", { sun: "sunset", offset: 30, earliest: "18:00", latest: "18:10", random_minutes: 15 }, "start", hass))
      .toBe("Chaque jour, démarre au hasard entre 18:00 et 18:10.");
  });
  it("ignores a sun time that is not today's", () => {
    expect(randomDelayRangeText("en", { sun: "sunset", random_minutes: 15 }, "start", sunHass("2001-01-01T17:30:00Z")))
      .toBe("Every day, starts at a random time between sunset and 15 min later.");
  });
  it("marks the following day when the fixed delay crosses midnight", () => {
    expect(randomDelayRangeText("fr", { time: "23:50", random_minutes: 15 }))
      .toBe("Chaque jour, démarre au hasard entre 23:50 et 00:05 (Jour suivant).");
  });
  it("localizes the range in English without losing minute precision", () => {
    expect(randomDelayRangeText("en", { time: "16:47", random_minutes: 17 }, "end"))
      .toBe("Every day, ends at a random time between 16:47 and 17:04.");
  });
});

describe("solar time help", () => {
  const hass = { states: { "sun.sun": { attributes: { next_setting: `${new Date().toISOString().slice(0, 11)}17:00:00Z` } } }, config: { time_zone: "UTC" } } as any;
  const spec = { sun: "sunset", offset: 30, earliest: "18:00", latest: "19:00" } as const;
  it("explains the real time with offset and only the bounds that are set", () => {
    expect(solarMeaningText("fr", spec)).toBe("Heure réelle : coucher du soleil + 30 min, mais pas avant 18:00 ni après 19:00.");
    expect(solarMeaningText("fr", { sun: "sunrise", offset: -15, latest: "08:00" })).toBe("Heure réelle : lever du soleil − 15 min, mais pas après 08:00.");
    expect(solarMeaningText("en", { sun: "sunset", earliest: "18:00" })).toBe("Actual time: sunset, but not earlier than 18:00.");
    expect(solarMeaningText("fr", { sun: "sunset" })).toBe("");
  });
  it("shows today's result only when computable", () => {
    expect(solarTodayText("fr", hass, spec)).toBe("Aujourd’hui : 18:00");
    expect(solarTodayText("fr", undefined, spec)).toBe("");
    expect(solarTodayText("fr", { states: {}, config: { time_zone: "UTC" } } as any, spec)).toBe("");
  });
  it("uses clear labels and error text", () => {
    expect(t("fr", "sun_earliest")).toBe("Au plus tôt à");
    expect(t("fr", "sun_latest")).toBe("Au plus tard à");
    expect(t("fr", "err_sun_bounds")).toBe("« Au plus tôt » doit précéder « Au plus tard ».");
    expect(t("en", "sun_earliest")).toBe("Not earlier than");
  });
});

it("memoizes card spans until the data, previews, clock or config are replaced", async () => {
  const { WeeklyPlannerCard } = await import("../weekly-planner-card");
  const card = new WeeklyPlannerCard() as any;
  card.hass = { language: "en", config: { time_zone: "UTC" } };
  card._now = new Date("2026-01-02T12:00:00Z");
  const program = { id: "p", enabled: true, active_profile: "home", entities: [{ entity_id: "switch.x", label_overrides: {} }],
    profiles: [{ id: "home", days: [[], [], [], [], [], [], []] }] };
  card._data = { labels: [], status: {}, programs: [program] };
  const first = card._spans("switch.x", [program]);
  expect(card._spans("switch.x", [program])).toBe(first);
  card._preview = {};
  expect(card._spans("switch.x", [program])).not.toBe(first);
});

it("caches Intl date formatters per locale and options", async () => {
  const { dateFormat, localDateIso } = await import("../time");
  expect(dateFormat("en-GB", { timeZone: "UTC" })).toBe(dateFormat("en-GB", { timeZone: "UTC" }));
  expect(dateFormat("en-GB", { timeZone: "UTC" })).not.toBe(dateFormat("en-GB", { timeZone: "Europe/Paris" }));
  expect(localDateIso(new Date("2026-01-01T23:30:00Z"), "Europe/Paris")).toBe("2026-01-02");
});

describe("solar not-before / not-after limits", () => {
  const sunForm = () => {
    const view = form();
    view.group = { ...view.group, slot: { ...view.group.slot, start: { sun: "sunset", offset: 15 } } };
    return view;
  };
  it("sets, clears and ignores malformed limits", () => {
    const view = sunForm();
    view._limit("start", "earliest", "18:07");
    view._limit("start", "latest", "21:00");
    expect(view.group.slot.start).toEqual({ sun: "sunset", offset: 15, earliest: "18:07", latest: "21:00" });
    view._limit("start", "earliest", "bad");
    expect(view.group.slot.start.earliest).toBe("18:07");
    view._limit("start", "earliest", "");
    expect(view.group.slot.start).toEqual({ sun: "sunset", offset: 15, latest: "21:00" });
    expect("earliest" in view.group.slot.start).toBe(false);
  });
  it("ignores fixed times", () => {
    const view = form();
    view._limit("start", "latest", "21:00");
    expect(view.group.slot.start).toEqual({ time: "08:00" });
  });
  it("keeps limits through offset, delay, sun switch, grouping and duplication", () => {
    const view = sunForm();
    view._limit("start", "earliest", "18:00");
    view._limit("start", "latest", "21:00");
    view._update("start", shiftSpec(view.group.slot.start, 15));
    view._random("start", 30);
    view._toggleSun("start", "sunrise");
    expect(view.group.slot.start).toEqual({ sun: "sunrise", offset: 30, earliest: "18:00", latest: "21:00", random_minutes: 30 });
    view._random("start", 0);
    expect(view.group.slot.start).toEqual({ sun: "sunrise", offset: 30, earliest: "18:00", latest: "21:00" });
    const a: Slot = { id: "a", label: "x", start: { sun: "sunset", earliest: "18:00" }, end: null };
    expect(slotKey(a)).not.toBe(slotKey({ ...a, start: { sun: "sunset", earliest: "19:00" } }));
    expect(slotKey(a)).toBe(slotKey(structuredClone(a)));
    expect(structuredClone(a).start).toEqual({ sun: "sunset", earliest: "18:00" });
  });
  it("replaces the spec when a bar is dragged to an exact time", () => {
    const a: Slot = { id: "a", label: "x", start: { sun: "sunset", earliest: "18:00", latest: "21:00" }, end: { time: "23:00" } };
    const moved = moveBoundary([a], { id: "a", edge: "start" }, 1140, { at });
    expect(moved?.slots[0].start).toEqual({ time: "19:00" });
  });
  it("applies limits to the displayed minutes and flags reversed limits", () => {
    const hass = { states: {}, config: { time_zone: "UTC" } } as any;
    expect(specMinutes(hass, { sun: "sunset", earliest: "20:00" })).toBe(1200);
    expect(specMinutes(hass, { sun: "sunset", latest: "18:00" })).toBe(1080);
    expect(sunBoundsInvalid({ sun: "sunset", earliest: "21:00", latest: "18:00" })).toBe(true);
    expect(sunBoundsInvalid({ sun: "sunset", earliest: "18:00", latest: "18:00" })).toBe(false);
    expect(sunBoundsInvalid({ time: "08:00" })).toBe(false);
  });
  it("shows reversed limits in the form", async () => {
    const view = sunForm();
    view.hass = { language: "en", states: {}, config: { time_zone: "UTC" } };
    const text = (spec: TimeSpec) => { const r: any = view._limits("start", spec, "Start"); return JSON.stringify(r.strings) + JSON.stringify(r.values.map((v: any) => v?.strings ?? v)); };
    expect(text({ sun: "sunset", earliest: "21:00", latest: "18:00" })).toContain("alert");
    expect(text({ sun: "sunset", earliest: "18:00", latest: "21:00" })).not.toContain("alert");
  });
});
