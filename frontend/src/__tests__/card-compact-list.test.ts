import { describe, expect, it, vi } from "vitest";
import { t } from "../i18n";
import { flat, handlers } from "./helpers/tpl";
import { attrOf, label, label2, uniformProgram, wednesdayCard } from "./helpers/planner-card";

// The compact list of programs (view "list"): one row each, details opened on demand.
describe("compact list", () => {
    const setup = (extra: any = {}, view = "list") => {
    const p = uniformProgram("p1", "Volet bureau", ["cover.a", "cover.b"], undefined, undefined, extra);
    const q = uniformProgram("p2", "Volet cuisine", ["cover.c"]);
    const c = wednesdayCard([p, q], { schedule_view: view }, { labels: [label, label2], status: { p1: { next_actions: {
      "cover.a": { at: "2026-11-04T18:00:00Z", label: "l", action: {} }, "cover.b": { at: "2026-11-04T12:00:00Z", label: "l2", action: {} } } } } });
    c._bar = vi.fn(() => "BAR"); c._extras = vi.fn(() => "EXTRAS"); c._deviceTabs = vi.fn(() => "TABS"); c._createButton = vi.fn(() => "CREATE");
    c._todayBlock = vi.fn(() => "TODAY");
    return c;
  };
  it("a row: short name, full name in title, default icon, next change of the soonest device", () => {
    const c = setup();
    const html = flat(c._compactList(c._data.programs)).replace(/\s+/g, " ");
    expect(html).toContain('class="sname">bureau<');
    expect(html).toContain('class="sname">cuisine<');
    expect(html).toContain("title=Volet bureau");
    expect(html).toContain("icon=mdi:calendar-clock");
    expect(html).toContain(`<span class="sinfo" title=Close at 12 pm><span class="sl">Close at 12 pm</span></span>`);
    expect(attrOf(c._compactList(c._data.programs), /aria-expanded=$/)).toEqual([false, false]);
    expect(html).toContain("aria-controls=compact-p1");
    // the accessible name keeps the full name and the next change
    expect(html).toContain(`aria-label=Volet bureau, Close at 12 pm`);
    expect(html).toContain("aria-label=Volet cuisine");
    expect(html).toContain("icon=mdi:chevron-down");
    expect(html).not.toContain("compact-details");
  });
  it("a change on another day says 'action · when'", () => {
    const c = setup();
    c._data.status.p1.next_actions = { "cover.b": { at: "2026-11-05T08:00:00Z", label: "l2", action: {} } };
    const html = flat(c._compactList([c._data.programs[0]]));
    expect(html).toContain(`aria-label=Volet bureau, ${t("en", "next_on", { action: "Close", when: "tomorrow 8 am" })}`);
    expect(html).not.toContain(t("en", "next_at", { action: "Close", time: "tomorrow 8 am" }));
  });
  it("the same date in the local time zone counts as today even when the UTC day differs", () => {
    const c = setup();
    c._data.status.p1.next_actions = { "cover.b": { at: "2026-11-04T23:30:00Z", label: "l2", action: {} } };
    c.hass = { ...c.hass, config: { time_zone: "Asia/Tokyo" } };
    c._now = new Date("2026-11-04T20:00:00Z"); // 05:00 on the 5th in Tokyo, the next change 08:30 the same day
    expect(flat(c._compactList([c._data.programs[0]]))).toContain(t("en", "next_at", { action: "Close", time: "8:30 am" }));
  });
  it("without a next change: the hours text when running, nothing when switched off; own icon kept", () => {
    const c = setup({ icon: "mdi:blinds" });
    const html = flat(c._compactList(c._data.programs));
    expect(html).toContain("icon=mdi:blinds");
    expect(html).toContain(`class="sinfo">${t("en", "hours")}<`); // second program has no next
    c._data.programs[1].enabled = false;
    c._data.programs[0].enabled = false;
    const off = flat(c._compactList(c._data.programs));
    expect(off).not.toContain(`class="sinfo">${t("en", "hours")}<`);
    expect(off).not.toContain('class="sl"');
  });
  it("the next change is the earliest even when listed last; a setting that no longer exists is named by its action", () => {
    const c = setup();
    c._data.status.p1.next_actions["cover.b"].label = "gone";
    c._data.status.p1.next_actions["cover.b"].action = { kind: "service", service: "cover.close_cover" };
    expect(flat(c._compactList([c._data.programs[0]]))).not.toContain('class="sl">Open');
    c._data.status.p1.next_actions["cover.b"].at = "2026-11-04T19:00:00Z";
    c._data.status.p1.next_actions["cover.b"].label = "l2";
    expect(flat(c._compactList([c._data.programs[0]]))).toContain('class="sl">Open');
  });
  it("the row opens and closes its details, and leaves any edit", () => {
    const c = setup();
    c._edit = { x: 1 };
    handlers(c._compactList([c._data.programs[0]])).find((h: any) => h.event === "click")!.fn();
    expect(c._expandedProgram).toBe("p1");
    expect(c._edit).toBeNull();
    const html = flat(c._compactList([c._data.programs[0]]));
    expect(attrOf(c._compactList([c._data.programs[0]]), /aria-expanded=$/)).toEqual([true]);
    expect(html).toContain("icon=mdi:chevron-up");
    expect(html).toContain('id=compact-p1 class="compact-details wp-appear" role="region" aria-label=Volet bureau');
    handlers(c._compactList([c._data.programs[0]])).find((h: any) => h.event === "click")!.fn();
    expect(c._expandedProgram).toBeNull();
  });
  it("the hours button names the program and opens its schedules", () => {
    const c = setup();
    const tpl = c._compactList([c._data.programs[0]]);
    expect(flat(tpl)).toContain(`aria-label=${t("en", "hours_of", { name: "Volet bureau" })} title=${t("en", "hours")}`);
    expect(flat(tpl)).toContain(`<span class="hl">${t("en", "edit_word")}</span>`);
    const clicks = handlers(tpl).filter((h: any) => h.event === "click");
    clicks[clicks.length - 1].fn();
    expect(c._open).toHaveBeenCalledWith({ kind: "program", programId: "p1" });
  });
  it("expanded: a program with several devices shows only the shown one, with the device in its scope", () => {
    const c = setup();
    c._expandedProgram = "p1";
    c._shownDevice = () => "cover.b";
    const html = flat(c._compactList([c._data.programs[0]]));
    expect(html).toContain("TABS");
    expect(html.match(/class="today"/g)).toHaveLength(1);
    expect(c._bar).toHaveBeenCalledTimes(1);
    expect(c._bar.mock.calls[0].slice(0, 1)).toEqual(["cover.b"]);
    expect(c._extras.mock.calls[0][0]).toEqual({ kind: "program", programId: "p1", entityId: "cover.b" });
    expect(html).toContain("EXTRAS");
    expect(html).toContain(`title=${t("en", "today")}>${t("en", "today_short")}<`);
    c._bar.mockClear();
    c._shownDevice = () => "cover.a";
    flat(c._compactList([c._data.programs[0]]));
    expect(c._bar.mock.calls.map((x: any[]) => x[0])).toEqual(["cover.a"]);
  });
  it("expanded in the list view: the bar of its only device, then the extras of the program", () => {
    const c = setup();
    c._expandedProgram = "p2";
    const html = flat(c._compactList([c._data.programs[1]]));
    expect(c._bar).toHaveBeenCalledWith("cover.c", c._data.programs[1], 0, "today");
    expect(c._extras.mock.calls[0][2]).toEqual([c._data.programs[1]]);
    expect(html).toContain("BAR");
    expect(html).toContain("EXTRAS");
  });
  it("expanded: a one-device program uses its program scope; times view uses the today block; a missing schedule offers to create one", () => {
    const c = setup({}, "times");
    c._expandedProgram = "p2";
    flat(c._compactList([c._data.programs[1]]));
    expect(c._extras.mock.calls[0][0]).toEqual({ kind: "program", programId: "p2" });
    expect(c._todayBlock).toHaveBeenCalledTimes(1);
    expect(c._bar).not.toHaveBeenCalled();
    c._todayBlock.mock.calls[0][2](); // the block's own button opens the schedules
    expect(c._open).toHaveBeenCalledWith({ kind: "program", programId: "p2" });
    const create = setup();
    create._expandedProgram = "p2";
    create._needsCreate = () => true;
    const html = flat(create._compactList([create._data.programs[1]]));
    expect(html).toContain("CREATE");
    expect(create._createButton).toHaveBeenCalledWith({ kind: "program", programId: "p2" });
    expect(html).not.toContain("EXTRAS");
  });
});
