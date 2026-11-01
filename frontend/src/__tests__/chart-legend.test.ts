import { describe, expect, it } from "vitest";
import { WpChart } from "../components/chart";

const css = (c: any) => [c.styles].flat(Infinity).map((s: any) => s?.cssText ?? "").join("\n");

describe("chart legend planned symbol", () => {
  const text = css(WpChart);
  it("has a filled dot at the left, same size as the step marker, then the line", () => {
    expect(text).toMatch(/\.key i\.planned::before \{[^}]*left: 0[^}]*width: 10px; height: 10px[^}]*border-radius: 50%/);
    expect(text).toMatch(/\.key i\.planned::before \{[^}]*background: var\(--secondary-text-color\)/);
    expect(text).toMatch(/\.key i\.planned \{[^}]*position: relative[^}]*border-top: 3px solid var\(--secondary-text-color\)/);
  });
  it("leaves Measured and Set swatches as plain lines", () => {
    expect(text).toMatch(/\.key i\.measured \{ border-top: 2px solid/);
    expect(text).toMatch(/\.key i\.set \{ border-top: 2px dashed/);
    expect(text).not.toContain(".key i.measured::before");
    expect(text).not.toContain(".key i.set::before");
  });
});
