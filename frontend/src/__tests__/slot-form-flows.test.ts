import { beforeEach, describe, expect, it } from "vitest";
import { WpSlotForm } from "../components/slot-form";
import { flat, handlers, find } from "./helpers/tpl";

beforeEach(() => {
  (globalThis as any).CustomEvent ??= class { type: string; detail: unknown; constructor(t: string, i: any) { this.type = t; this.detail = i?.detail; } };
});

const form = (slot: any, days = [0, 1, 2, 3, 4, 5, 6], props: Record<string, unknown> = {}) => {
  const el = new WpSlotForm() as any;
  const seen: any[] = [];
  el.dispatchEvent = (e: any) => { seen.push(e.detail); return true; };
  Object.assign(el, { hass: { language: "en", config: {}, states: {} }, data: { labels: [], programs: [] }, program: { id: "p", entities: [], profiles: [] },
    entityIds: [], dayOnly: null, group: { slot: { id: "s", label: "l", start: { time: "08:00" }, end: { time: "09:00" }, ...slot }, days, ids: {} } }, props);
  return { el, seen };
};
const sel = (r: any, ev: string, i: number, mark = "") => handlers(r).filter((h) => h.event === ev && h.before.includes(mark))[i];

describe("slot form", () => {
  it("renders nothing without a group", () => {
    const { el } = form({}); el.group = undefined;
    expect(flat(el.render())).toBe("");
  });
  it("steps the start and end by 15 minutes and parses typed times", () => {
    const { el, seen } = form({});
    const r = el.render();
    const clicks = handlers(r).filter((h) => h.event === "click" && h.before.slice(-300).includes("step"));
    clicks[0].fn(); expect(seen[0].slot.start).toEqual({ time: "07:45" });
    clicks[1].fn(); expect(seen[1].slot.start).toEqual({ time: "08:15" });
    const changes = handlers(r).filter((h) => h.event === "change" && h.before.slice(-200).includes("type=\"time\""));
    changes[0].fn({ target: { value: "10:30" } });
    expect(seen[2].slot.start).toEqual({ time: "10:30", random_minutes: undefined });
    changes[0].fn({ target: { value: "bad" } });
    expect(seen).toHaveLength(3);
    const end = form({ end: { time: "09:00" } });
    end.el._fromInput("end", "00:00"); expect(end.seen[0].slot.end.time).toBe("24:00");
  });
  it("switches between a fixed time and sun times, keeping offsets and limits", () => {
    const { el, seen } = form({ start: { time: "07:00" } });
    el._toggleSun("start", "sunrise");
    expect(seen[0].slot.start).toEqual({ sun: "sunrise", offset: 0 });
    const sun = form({ start: { sun: "sunrise", offset: 10, earliest: "06:00", latest: "08:00", random_minutes: 5 } });
    sun.el._toggleSun("start", "sunset");
    expect(sun.seen[0].slot.start).toEqual({ sun: "sunset", offset: 10, earliest: "06:00", latest: "08:00", random_minutes: 5 });
    sun.el._toggleSun("start", "sunrise");
    expect(sun.seen[1].slot.start).toEqual({ time: "08:00", random_minutes: 5 });
    const off = form({ start: { sun: "sunrise", offset: 10 } });
    off.el._last = { start: "07:30", end: "09:00" };
    off.el._toggleSun("start", "sunrise"); expect(off.seen[0].slot.start).toEqual({ time: "07:30", random_minutes: undefined });
    form({ end: null }).el._toggleSun("end", "sunset");
  });
  it("edits and clears the not-before / not-after limits and flags impossible ones", () => {
    const { el, seen } = form({ start: { sun: "sunset", offset: 0, earliest: "22:00", latest: "20:00" } });
    const html = flat(el.render());
    expect(html).toContain("role=\"alert\""); expect(html).toContain("limits");
    const r = el.render();
    sel(r, "change", 0, "sun_earliest".length ? "limit" : "").fn({ target: { value: "19:00" } });
    expect(seen[0].slot.start.earliest).toBe("19:00");
    sel(r, "click", 0, "clear").fn(); expect(seen[1].slot.start).not.toHaveProperty("earliest");
    el._limit("start", "latest", "bad"); expect(seen).toHaveLength(2);
    form({ start: { time: "08:00" } }).el._limit("start", "latest", "20:00");
  });
  it("sets and clears a random delay inside the allowed range", () => {
    const { el, seen } = form({ start: { time: "08:00", random_minutes: 20 } });
    const r = el.render();
    expect(flat(r)).toContain("random_minutes".length ? "type=\"number\"" : "");
    sel(r, "change", 0, "checkbox").fn({ target: { checked: false } });
    expect(seen[0].slot.start).toEqual({ time: "08:00" });
    sel(r, "change", 0, "number").fn({ target: { validity: { valid: false }, value: "5" } });
    expect(seen).toHaveLength(1);
    sel(r, "change", 1, "").fn;
    el._random("start", 30); expect(seen[1].slot.start.random_minutes).toBe(30);
    el._random("start", 999); el._random("start", 1.5); expect(seen).toHaveLength(2);
    const plain = form({});
    sel(plain.el.render(), "change", 0, "checkbox").fn({ target: { checked: true } });
    expect(plain.seen[0].slot.start.random_minutes).toBe(15);
  });
  it("adds and removes the end, one-shot or with a time", () => {
    const { el, seen } = form({ end: null });
    const r = el.render();
    const clicks = handlers(r).filter((h) => h.event === "click");
    const chips = clicks.slice(clicks.length - 12, clicks.length - 10);
    chips[0].fn(); expect(seen[0].slot.end).toBeNull();
    chips[1].fn(); expect(seen[1].slot.end).toEqual({ time: "09:00" });
    form({ start: { sun: "sunrise" }, end: null }).el._toggleEnd(true);
    const late = form({ start: { time: "23:59" } }); late.el._toggleEnd(true); expect(late.seen[0].slot.end.time).toBe("23:55");
  });
  it("toggles days and uses the all / weekdays / weekend shortcuts", () => {
    const { el, seen } = form({}, [0, 1]);
    const r = el.render();
    const days = handlers(r).filter((h) => h.event === "click" && h.before.slice(-300).includes("class=\"day"));
    days[2].fn(); expect(seen[0].days).toEqual([0, 1, 2]);
    days[0].fn(); expect(seen[1].days).toEqual([1]);
    const shortcuts = handlers(r).filter((h) => h.event === "click" && h.before.slice(-250).includes("chip small"));
    shortcuts[0].fn(); expect(seen[2].days).toHaveLength(7);
    shortcuts[1].fn(); expect(seen[3].days).toEqual([0, 1, 2, 3, 4]);
    shortcuts[2].fn(); expect(seen[4].days).toEqual([5, 6]);
    const all = form({}); handlers(all.el.render()).filter((h) => h.event === "click" && h.before.slice(-250).includes("chip small"))[0].fn();
    expect(all.seen[0].days).toEqual([]);
  });
  it("shows one day with a button to apply to others, and relays the label choice", () => {
    const { el, seen } = form({}, [2], { dayOnly: 2 });
    const html = flat(el.render());
    expect(html).toContain("class=\"only\""); expect(html).not.toContain("class=\"days\"");
    find(el.render(), "click", "chip\" ?disabled").fn();
    expect(el._more).toBe(true); expect(flat(el.render())).toContain("class=\"days\"");
    find(el.render(), "label-change", "wp-label-picker").fn({ stopPropagation() {}, detail: "x" });
    find(el.render(), "label-change", "wp-label-picker").fn({ stopPropagation() {}, detail: null });
    expect(seen.map((s) => s.slot.label)).toEqual(["x", ""]);
  });
});
