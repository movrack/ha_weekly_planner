import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { WpSlotForm, solarMeaningText } from "../components/slot-form";
import { setTimeFormat } from "../time";
import { flat, handlers } from "./helpers/tpl";
import { form } from "./helpers/slot-form";

const mk = (slot: any = {}, props: Record<string, unknown> = {}) => form(slot, [0], props);

beforeEach(() => {
  (globalThis as any).CustomEvent ??= class { type: string; detail: unknown; constructor(t: string, i: any) { this.type = t; this.detail = i?.detail; } };
});

describe("slot form: time field and its 12 h hint", () => {
  afterEach(() => setTimeFormat(null));
  const change = (el: any, which: string, value: string) => el._fromInput(which, value);

  it("the hint is given for H:MM and HH:MM only, in 12 h", () => {
    const { el } = mk();
    setTimeFormat({ locale: { time_format: "12" } });
    expect(el._hintText("start", "7:30")).toBe("7:30 am");
    expect(el._hintText("start", "07:30")).toBe("7:30 am");
    expect(el._hintText("start", "07:30:15")).toBeNull();
    expect(el._hintText("start", "x07:30")).toBeNull();
    expect(el._hintText("start", "")).toBeNull();
    expect(el._hintText("start", undefined)).toBeNull();
    setTimeFormat({ locale: { time_format: "language" } });
    expect(el._hintText("start", "07:30")).toBeNull();
  });
  it("what is typed wins over the stored value, and typing then leaving clears it", () => {
    const { el } = mk();
    setTimeFormat({ locale: { time_format: "12" } });
    el._type("start", { target: { value: "21:15" } });
    expect(el._hintText("start", "08:00")).toBe("9:15 pm");
    el._typedDone("start");
    expect(el._hintText("start", "08:00")).toBe("8 am");
  });
  it("a time field shows 24:00 as 00:00, with its hint, and wires input and change", () => {
    setTimeFormat({ locale: { time_format: "12" } });
    const { el } = mk({ end: { time: "24:00" } });
    const out = flat(el.render());
    expect(out).toContain("= midnight");
    expect(out).toContain("hint12-end");
    expect(out).toContain("hint12-start");
    expect(out).toContain("= 8 am");
    const typeHandler = handlers(el.render()).filter((h) => h.event === "input")[0];
    typeHandler.fn({ target: { value: "10:00" } });
    expect(el._typed.start).toBe("10:00");
    const changeHandler = handlers(el.render()).filter((h) => h.event === "change")[0];
    el._typed = { start: "10:00" };
    changeHandler.fn({ target: { value: "10:00" } });
    expect(el._typed.start).toBeUndefined();
  });
  it("no hint and no describedby outside 12 h or for a sun time", () => {
    const { el } = mk({ start: { sun: "sunset", offset: 0 } });
    const out = flat(el.render());
    expect(out).not.toContain("hint12-start");
  });
  it("a typed time is taken only as HH:MM; a bad text changes nothing", () => {
    const { el, seen } = mk();
    change(el, "start", "10:30:00");
    change(el, "start", "x10:30");
    change(el, "start", "10:3");
    expect(seen).toEqual([]);
    change(el, "start", "10:30");
    expect(seen[0].slot.start).toEqual({ time: "10:30", random_minutes: undefined });
  });
  it("midnight is 24:00 for an end and 00:00 for a start; the random delay is kept", () => {
    const a = mk({ end: { time: "09:00", random_minutes: 5 } });
    change(a.el, "end", "00:00");
    expect(a.seen[0].slot.end).toEqual({ time: "24:00", random_minutes: 5 });
    const b = mk({ start: { time: "08:00", random_minutes: 7 } });
    change(b.el, "start", "00:00");
    expect(b.seen[0].slot.start).toEqual({ time: "00:00", random_minutes: 7 });
    const c = mk();
    change(c.el, "end", "10:00");
    expect(c.seen[0].slot.end.time).toBe("10:00");
  });
  it("a sun limit is set only as HH:MM, and the delay only as a whole number from 0 to 240", () => {
    const { el, seen } = mk({ start: { sun: "sunset", offset: 0 } });
    el._limit("start", "earliest", "18:00:00");
    el._limit("start", "earliest", "x18:00");
    expect(seen).toEqual([]);
    el._limit("start", "earliest", "18:00");
    expect(seen[0].slot.start).toEqual({ sun: "sunset", offset: 0, earliest: "18:00" });
    el._random("start", 240);
    expect(seen[1].slot.start.random_minutes).toBe(240);
    el._random("start", 241);
    el._random("start", 1.5);
    el._random("start", -1);
    expect(seen).toHaveLength(2);
    el._random("end", 5);
    el._random("start", 0);
    expect(seen[2].slot.start.random_minutes).toBeUndefined();
  });
  it("the sun choice marks the chosen event as pressed", () => {
    const { el } = mk({ start: { sun: "sunset", offset: 0 } });
    el._advTouched = true; el._advOpen = true;
    const out = flat(el.render());
    expect(out).toMatch(/class="chip on"[^>]*><ha-icon icon=mdi:weather-sunset-down/);
    expect(out).not.toMatch(/class="chip on"[^>]*><ha-icon icon=mdi:weather-sunset-up/);
  });
});

describe("slot form: sun wording, fold, delay input, label change", () => {
  it("an offset is written with its sign and in minutes, or hours and minutes from 60", () => {
    const text = (offset: number) => solarMeaningText("en", { sun: "sunset", offset });
    expect(text(-90)).toContain("sunset − 1 h 30");
    expect(text(45)).toContain("sunset + 45 min");
    expect(text(60)).toContain("sunset + 1 h");
    expect(text(60)).not.toContain("1 h 00");
    expect(text(59)).toContain("59 min");
    expect(text(120)).toContain("+ 2 h");
  });
  it("a random sun time says its offset sign too", () => {
    const { el } = mk({ start: { sun: "sunset", offset: -30, random_minutes: 10 } });
    expect(flat(el.render())).toContain("sunset − 30 min");
    const plus = mk({ start: { sun: "sunset", offset: 20, random_minutes: 10 } });
    expect(flat(plus.el.render())).toContain("sunset + 20 min");
  });
  it("the advanced fold opens for a slot that needs it, and closes again for another slot", () => {
    const { el } = mk({ id: "a", start: { sun: "sunset", offset: 0 } });
    el.willUpdate();
    expect(el._advOpen).toBe(true);
    el._advTouched = true; el._advOpen = false;
    el.willUpdate();
    expect(el._advOpen).toBe(false);
    el.group = { ...el.group, slot: { ...el.group.slot, id: "b", start: { time: "08:00" } } };
    el._advOpen = true; el._advTouched = true;
    el.willUpdate();
    expect([el._advOpen, el._advTouched, el._advSlot]).toEqual([false, false, "b"]);
    const plain = mk({ id: "c" });
    plain.el.willUpdate();
    expect(plain.el._advOpen).toBe(false);
    const delayed = mk({ id: "d", end: { time: "09:00", random_minutes: 5 } });
    delayed.el.willUpdate();
    expect(delayed.el._advOpen).toBe(false); // the delay is on the end: only the end fold opens
    expect(delayed.el._advOpenEnd).toBe(true);
    const noGroup = new WpSlotForm() as any;
    expect(() => noGroup.willUpdate()).not.toThrow();
  });
  it("the delay input applies a valid value only", () => {
    const { el, seen } = mk({ start: { time: "08:00", random_minutes: 15 } });
    el._advTouched = true; el._advOpen = true;
    const h = handlers(el.render()).filter((x) => x.event === "change" && x.before.includes('type="number"'))[0];
    h.fn({ target: { validity: { valid: false }, value: "30" } });
    expect(seen).toEqual([]);
    h.fn({ target: { validity: { valid: true }, value: "30" } });
    expect(seen[0].slot.start.random_minutes).toBe(30);
  });
  it("a new label rewrites the device list only when there is a label change, a list and a device", () => {
    const entities = ["switch.a", "switch.b"];
    const base = { entities } as any;
    const a = mk(base, { device: "switch.a" });
    a.el._set({ start: { time: "07:00" } });
    expect(a.seen[0].slot.entities).toEqual(entities);
    const b = mk({}, { device: "switch.a" });
    b.el._set({ label: "x" });
    expect(b.seen[0].slot.entities).toBeUndefined();
    const c = mk(base, { device: "" });
    c.el._set({ label: "x" });
    expect(c.seen[0].slot.entities).toEqual(entities);
  });
});
