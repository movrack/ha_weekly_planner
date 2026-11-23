import { describe, expect, it } from "vitest";
import { WpDialog } from "../components/dialog";

// On a phone every dialog width variant must fill the screen; the two-column variant was left at "100% - 32px",
// which left a strip of the page visible on the right in edit mode.
describe("wp-dialog on a phone", () => {
  const css = String((WpDialog as unknown as { styles: { cssText?: string } | Array<{ cssText?: string }> }).styles instanceof Array
    ? (WpDialog as unknown as { styles: Array<{ cssText?: string }> }).styles.map((s) => s.cssText).join("")
    : (WpDialog as unknown as { styles: { cssText?: string } }).styles.cssText);
  const phone = css.slice(css.indexOf("@media (max-width: 600px)"));

  it("makes the two-column variant full width like the others", () => {
    expect(phone).toContain(".panel, .panel.wide, .panel.columns, .panel.expanded {");
  });

  it("keeps the two-column variant full width in a bottom sheet too", () => {
    expect(phone).toContain(":host([compact]) .panel.columns");
  });
});
