import { describe, expect, it } from "vitest";
import { WpDayBar } from "../components/day-bar";

const bar = (width: number, label: string, start = 0, end = 300) => {
  const el: any = new WpDayBar();
  el._width = width;
  el.spans = [{ start, end, color: "#8bc34a", label }];
  return el;
};

describe("day bar: a long name gives up its bracket before giving up", () => {
  it("full name when it fits", () => {
    expect(bar(1000, "Comfort (19 °C)")._labelBox({ start: 0, end: 300, label: "Comfort (19 °C)", color: "#000" })?.text).toBe("Comfort (19 °C)");
  });
  it("the name without its bracket when only that fits", () => {
    const el = bar(400, "Comfort (19 °C)");  // 300 min of 1440 at 400 px: 83 px, 119 needed, 63 needed
    expect(el._labelBox(el.spans[0])?.text).toBe("Comfort");
    expect(el.visibleText()).toBe("Comfort");
  });
  it("nothing when even that does not fit, or when there is no bracket to drop", () => {
    expect(bar(150, "Comfort (19 °C)")._labelBox({ start: 0, end: 300, label: "Comfort (19 °C)", color: "#000" })).toBeNull();
    const plain = bar(400, "A very long name indeed");
    expect(plain._labelBox(plain.spans[0])).toBeNull();
  });
});
