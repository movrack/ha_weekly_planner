import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WeeklyPlannerCardEditor } from "../card-editor";
import { WpBarEditor } from "../components/bar-editor";
import { WpDayBar } from "../components/day-bar";
import { t } from "../i18n";

const text = (v: any): string => typeof v === "string" ? v : Array.isArray(v) ? v.map(text).join("|") : v?.values ? text(v.values) : v?.strings ? v.strings.join("") : "";

describe("card editor program selector", () => {
  const make = (editing: string | null) => {
    const ed = new WeeklyPlannerCardEditor() as any;
    ed.hass = { language: "en", user: { is_admin: true } };
    ed._data = { programs: [], can_edit: true, read_only: false };
    ed._editors.set("new", { dispatchEvent: vi.fn() });
    ed._programEditor = () => "";
    ed._editing = editing;
    return text(ed._settings());
  };
  it("shows the resume label only while another entry is selected", () => {
    expect(make("")).toContain(t("en", "ce_resume_creation"));
    expect(make("new")).not.toContain(t("en", "ce_resume_creation"));
  });
});

describe("labels", () => {
  it("shows hour labels by locale on the axis", () => {
    const bar = new WpDayBar() as any;
    bar.showHours = true; bar.lang = "en";
    expect(text(bar.render())).toContain("12 am");
    bar.lang = "fr";
    expect(text(bar.render())).toContain("6 h");
  });
});

describe("bar keyboard access", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { setTimeout, clearTimeout, localStorage: { getItem: () => null, setItem: () => undefined } });
  });
  afterEach(() => vi.unstubAllGlobals());
  const bar = (editable = true) => {
    const el = new WpBarEditor() as any;
    el.editable = editable; el.lang = "en";
    el.dispatchEvent = vi.fn();
    return el;
  };
  const key = (k: string, same = true) => {
    const target = {};
    return { key: k, target, currentTarget: same ? target : {}, preventDefault: vi.fn() };
  };
  it("Enter and Space enter the edit mode of an editable bar", () => {
    for (const k of ["Enter", " "]) {
      const el = bar();
      el._zoneKey(key(k));
      expect(el.dispatchEvent.mock.calls[0][0].type).toBe("edit-request");
    }
  });
  it("opens the day when the bar is not editable", () => {
    const el = bar(false);
    el._zoneKey(key("Enter"));
    expect(el.dispatchEvent.mock.calls[0][0].type).toBe("open-day");
  });
  it("ignores keys that come from a handle inside", () => {
    const el = bar();
    el._zoneKey(key("Enter", false));
    expect(el.dispatchEvent).not.toHaveBeenCalled();
  });
});

describe("touch targets and stacking (CSS contract)", () => {
  const css = (c: any) => [c.styles].flat(Infinity).map((s: any) => s?.cssText ?? "").join("\n");
  it("day buttons of the slot form are at least 44 px wide", async () => {
    const { WpSlotForm } = await import("../components/slot-form");
    const text = css(WpSlotForm);
    expect(text).toMatch(/\.day \{[^}]*min-width: 44px/);
    expect(text).toMatch(/\.days \{[^}]*gap: 0/);
  });
  it("hint bubble is stacked above the now line (z-index 5)", () => {
    const hint = css(WpBarEditor).match(/\.hint \{[^}]*z-index: (\d+)/);
    expect(Number(hint?.[1])).toBeGreaterThan(5);
  });
  it("week-list day name buttons are 44 px wide", async () => {
    const { WeeklyPlannerCard } = await import("../weekly-planner-card");
    expect(css(WeeklyPlannerCard)).toMatch(/\.wnamebtn \{[^}]*width: 44px/);
  });
});
