import { describe, expect, it } from "vitest";
import { applies } from "../slots";
import type { Slot } from "../types";

const base: Slot = { id: "a", start: { time: "07:00" }, end: { time: "22:00" }, label: "x" };

describe("applies (per-device schedules)", () => {
  it("targets every device when the slot has no list", () => {
    expect(applies(base, "climate.office")).toBe(true);
    expect(applies(base, "cover.added_later")).toBe(true);
  });

  it("targets only the listed devices", () => {
    const slot = { ...base, entities: ["climate.office"] };
    expect(applies(slot, "climate.office")).toBe(true);
    expect(applies(slot, "cover.office")).toBe(false);
  });

  it("an empty list targets nobody (forbidden by the server, helper stays total)", () => {
    expect(applies({ ...base, entities: [] }, "climate.office")).toBe(false);
  });
});
