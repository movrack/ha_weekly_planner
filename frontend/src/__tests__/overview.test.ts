import { afterEach, describe, expect, it, vi } from "vitest";
import { WpOverview, overviewConfig } from "../components/overview";

describe("overviewConfig", () => {
  it("is the compact list of the card, in the given order, for every program when none is chosen", () => {
    expect(overviewConfig(undefined, ["b", "a"])).toEqual({ type: "custom:weekly-planner-card", schedule_view: "list", sort: "custom", order: ["b", "a"], filter: {} });
  });
  it("keeps only the chosen programs when there is a filter, even an empty one", () => {
    expect(overviewConfig(["a"], ["a"]).filter).toEqual({ programs: ["a"] });
    expect(overviewConfig([], []).filter).toEqual({ programs: [] });
  });
});

describe("wp-overview", () => {
  afterEach(() => vi.unstubAllGlobals());
  const make = () => {
    const card = { setConfig: vi.fn(), hass: undefined as unknown };
    vi.stubGlobal("document", { createElement: vi.fn(() => card) });
    const el = new WpOverview() as any;
    return { el, card };
  };

  it("creates the card once, gives it its configuration before it is drawn, and its hass", () => {
    const { el, card } = make();
    el.hass = { language: "en" }; el.order = ["a", "b"];
    el.willUpdate();
    expect(document.createElement).toHaveBeenCalledWith("weekly-planner-card");
    expect(card.setConfig).toHaveBeenCalledTimes(1);
    expect(card.setConfig.mock.calls[0][0]).toMatchObject({ schedule_view: "list", order: ["a", "b"] });
    expect(card.hass).toBe(el.hass);
    expect(el.render().values[0]).toBe(card);
  });

  it("sets the configuration again only when it changes (the card reloads its previews then), and always the new hass", () => {
    const { el, card } = make();
    el.order = ["a"];
    el.willUpdate(); el.willUpdate();
    expect(card.setConfig).toHaveBeenCalledTimes(1);
    el.hass = { language: "fr" }; el.willUpdate();
    expect(card.setConfig).toHaveBeenCalledTimes(1);
    expect(card.hass).toEqual({ language: "fr" });
    el.programs = ["a"]; el.willUpdate();
    expect(card.setConfig).toHaveBeenCalledTimes(2);
    expect(card.setConfig.mock.calls[1][0].filter).toEqual({ programs: ["a"] });
    expect(document.createElement).toHaveBeenCalledTimes(1);
  });
});
