import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpDialog } from "../components/dialog";

// The dialog opens in the browser's top layer (popover="manual"), so a pop-up with a transformed or clipped box
// (Bubble Card) can no longer cut it off or hide its top under the pop-up header.
function dialog(support: boolean, openNow = false): any {
  const d = new WpDialog() as any;
  const attrs = new Map<string, string>();
  d.setAttribute = vi.fn((k: string, v: string) => attrs.set(k, v));
  d.hasAttribute = (k: string) => attrs.has(k);
  d.dispatchEvent = vi.fn();
  let shown = openNow;
  d.matches = vi.fn(() => shown);
  if (support) {
    d.showPopover = vi.fn(() => { shown = true; });
    d.hidePopover = vi.fn(() => { shown = false; });
  }
  d._attrs = attrs;
  return d;
}

beforeEach(() => {
  vi.stubGlobal("document", { body: {}, activeElement: null, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  vi.stubGlobal("requestAnimationFrame", () => 0);
});
afterEach(() => vi.unstubAllGlobals());

describe("wp-dialog top layer", () => {
  it("marks itself as a manual popover when the browser knows popovers, and only then", () => {
    const d = dialog(true);
    d._markPopover();
    expect(d._attrs.get("popover")).toBe("manual");
    const old = dialog(false);
    old._markPopover();
    expect(old._attrs.has("popover")).toBe(false);
  });

  it("keeps a popover attribute that is already there", () => {
    const d = dialog(true);
    d._attrs.set("popover", "auto");
    d._markPopover();
    expect(d.setAttribute).not.toHaveBeenCalled();
  });

  it("enters the top layer when it opens, once, and leaves it when it closes", () => {
    const d = dialog(true);
    d.open = true;
    d.updated(new Map([["open", false]]));
    expect(d.showPopover).toHaveBeenCalledTimes(1);
    d.updated(new Map([["open", false]]));
    expect(d.showPopover).toHaveBeenCalledTimes(1); // already open: not shown again
    d.close();
    expect(d.hidePopover).toHaveBeenCalledTimes(1);
    d.open = false;
    d.updated(new Map([["open", true]]));
    expect(d.hidePopover).toHaveBeenCalledTimes(1); // already left
  });

  it("leaves the top layer when it is removed from the page while open", () => {
    const d = dialog(true, true);
    d.disconnectedCallback();
    expect(d.hidePopover).toHaveBeenCalledTimes(1);
  });

  it("falls back to the plain fixed layer when popovers are not supported (no error)", () => {
    const d = dialog(false);
    d.matches = () => { throw new SyntaxError(":popover-open"); };
    d.open = true;
    expect(() => d.updated(new Map([["open", false]]))).not.toThrow();
    expect(() => d.close()).not.toThrow();
  });

  it("does not let the browser's popover defaults shrink or frame the dialog", () => {
    const css = String((WpDialog as any).styles.map?.((s: any) => s.cssText ?? s).join("") ?? (WpDialog as any).styles.cssText);
    expect(css).toMatch(/:host\(\[popover\]\) \{[^}]*margin: 0[^}]*border: 0[^}]*width: 100%; height: 100%/);
  });
});
