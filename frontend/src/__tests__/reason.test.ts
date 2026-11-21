import { describe, expect, it } from "vitest";
import { ariaDisabled, describedBy, whyNote, whyStyles } from "../reason";
import { flat } from "./helpers/tpl";

// The shared helpers of the "an element never disappears" rule: the attributes and the visible reason.
describe("reason helpers", () => {
  it("writes aria-disabled as a string", () => {
    expect([ariaDisabled(true), ariaDisabled(false)]).toEqual(["true", "false"]);
  });
  it("points aria-describedby to the reason only when the element is not usable", () => {
    expect(JSON.stringify(describedBy(true, "why-x"))).toContain("why-x");
    expect(String(JSON.stringify(describedBy(false, "why-x")))).not.toContain("why-x");
  });
  it("shows the reason as a status message, or nothing", () => {
    const shown = flat(whyNote("why-x", "Because."));
    expect(shown).toContain('class="why"');
    expect(shown).toContain('role="status"');
    expect(shown).toContain("Because.");
    expect(flat(whyNote("why-x", "Because.", false))).toBe("");
  });
  it("styles the reason with the secondary text colour", () => {
    expect(whyStyles.cssText).toContain("var(--secondary-text-color)");
  });
});
