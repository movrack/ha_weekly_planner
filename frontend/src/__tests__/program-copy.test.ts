import { describe, expect, it } from "vitest";
import { copyName, copyProgram } from "../program-copy";
import type { Program } from "../types";

const source = {
  id: "p", revision: 4, created_at: "2026-01-01", name: "Salon", priority: 3, enabled: true, reapply: true, area: "salon", conditions: [],
  entities: [{ entity_id: "climate.a", default_label: null, label_overrides: {}, allowed_services: [], restrict_services: true }],
  profiles: [{ id: "home", name: "Home", days: [[{ id: "s1", label: "comfort", start: { time: "08:00" } }], [], [], [], [], [], []] }],
} as unknown as Program;

describe("copyProgram", () => {
  it("keeps the settings and devices, drops the identity, and gives every profile and slot a new id", () => {
    const copy = copyProgram(source, "Copie Salon") as any;
    expect(copy).toMatchObject({ name: "Copie Salon", revision: 0, priority: 3, area: "salon", entities: source.entities });
    expect(copy).not.toHaveProperty("id");
    expect(copy).not.toHaveProperty("created_at");
    expect(copy.profiles[0].id).not.toBe("home");
    expect(copy.profiles[0].name).toBe("Home");
    expect(copy.profiles[0].days[0][0]).toMatchObject({ label: "comfort", start: { time: "08:00" } });
    expect(copy.profiles[0].days[0][0].id).not.toBe("s1");
  });

  it("is a deep copy: changing it leaves the source untouched", () => {
    const copy = copyProgram(source, "x") as any;
    copy.entities[0].entity_id = "light.z"; copy.profiles[0].days[0][0].label = "off";
    expect(source.entities[0].entity_id).toBe("climate.a");
    expect(source.profiles[0].days[0][0].label).toBe("comfort");
  });
});

describe("copyName", () => {
  const make = (n: string) => `Copie ${n}`;
  it("prefixes the name", () => expect(copyName(make, "Salon", [])).toBe("Copie Salon"));
  it("adds a number while the name is taken, whatever the case", () => {
    expect(copyName(make, "Salon", ["Copie Salon"])).toBe("Copie Salon 2");
    expect(copyName(make, "Salon", ["copie salon", "COPIE SALON 2"])).toBe("Copie Salon 3");
  });
  it("stays within 60 characters, with or without a number", () => {
    const long = "x".repeat(70);
    const first = copyName(make, long, []);
    expect(first).toHaveLength(60);
    const second = copyName(make, long, [first]);
    expect(second).toHaveLength(60);
    expect(second.endsWith(" 2")).toBe(true);
  });
});
