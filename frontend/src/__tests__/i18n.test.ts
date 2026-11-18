import { describe, expect, it } from "vitest";
import { ordinal } from "../i18n";

describe("ordinal", () => {
  it.each([[1, "1st"], [2, "2nd"], [3, "3rd"], [4, "4th"], [11, "11th"], [12, "12th"], [21, "21st"], [112, "112th"]])(
    "writes rank %i as %s in English", (n, text) => { expect(ordinal("en", n)).toBe(text); });

  it.each([[1, "1er"], [2, "2e"], [3, "3e"], [11, "11e"]])(
    "writes rank %i as %s in French", (n, text) => { expect(ordinal("fr", n)).toBe(text); });
});
