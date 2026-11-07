import { beforeEach, describe, expect, it } from "vitest";
import { WpSlotForm } from "../components/slot-form";
import { t } from "../i18n";
import { flat, handlers } from "./helpers/tpl";

beforeEach(() => {
  (globalThis as any).CustomEvent ??= class {
    type: string; detail: unknown;
    constructor(type: string, init: any) { this.type = type; this.detail = init.detail; }
  };
});

function form(start: any = { sun: "sunrise" }, end: any = { sun: "sunset" }) {
  const el = new WpSlotForm() as any;
  const seen: any[] = [];
  Object.assign(el, { hass: { language: "en", config: {}, states: {} },
    group: { slot: { id: "s", label: "l", start, end }, days: [0], ids: {} } });
  el.dispatchEvent = (event: any) => { seen.push(event.detail); el.group = event.detail; return true; };
  const block = (which = "start") => el._timeBlock(which, which);
  const toggle = (which: string, checked: boolean) => {
    const handler = handlers(block(which)).find((h) => h.event === "change" && h.before.slice(-200).includes(`id=sun-option-${which}`));
    expect(handler).toBeDefined();
    handler!.fn({ target: { checked } });
  };
  return { el, seen, block, toggle };
}

const fields = (block: any) => (flat(block).match(/class="limit"/g) ?? []).length;

function checked(value: any): boolean | undefined {
  if (!value?.strings) return undefined;
  if (value.strings.some((s: string) => s.includes('id=')) && value.values.some((v: unknown) => typeof v === "string" && v.startsWith("sun-option-"))) {
    const i = value.strings.findIndex((s: string) => s.endsWith('.checked='));
    return value.values[i];
  }
  for (const child of value.values) {
    const result = checked(child);
    if (result !== undefined) return result;
  }
  return undefined;
}

describe("solar time limits option", () => {
  it("starts unchecked with hidden bounds, before the random delay", () => {
    const { block } = form();
    const text = flat(block());
    expect(fields(block())).toBe(0);
    expect(checked(block())).toBe(false);
    expect(text.indexOf(t("en", "sun_limit_option"))).toBeLessThan(text.indexOf(t("en", "random_time")));
  });
  it.each([{ earliest: "06:00" }, { latest: "08:00" }, { earliest: "06:00", latest: "08:00" }])(
    "opens automatically for existing bounds %o", (bounds) => {
      const { block } = form({ sun: "dawn", ...bounds });
      expect(fields(block())).toBe(2);
      expect(checked(block())).toBe(true);
    },
  );
  it("reveals empty inputs without changing data and keeps start/end independent", () => {
    const { block, toggle, seen } = form();
    toggle("start", true);
    expect(fields(block())).toBe(2);
    expect(fields(block("end"))).toBe(0);
    expect(seen).toHaveLength(0);
    toggle("end", true);
    toggle("start", false);
    expect(fields(block())).toBe(0);
    expect(fields(block("end"))).toBe(2);
  });
  it("clears both bounds while preserving other values and the other boundary", () => {
    const end = { sun: "dusk", earliest: "18:00", latest: "22:00" };
    const { toggle, block, seen } = form({ sun: "sunrise", offset: 12, random_minutes: 15, earliest: "06:00", latest: "08:00" }, end);
    toggle("start", false);
    expect(seen[0].slot.start).toEqual({ sun: "sunrise", offset: 12, random_minutes: 15 });
    expect(seen[0].slot.end).toEqual(end);
    expect(fields(block())).toBe(0);
    expect(fields(block("end"))).toBe(2);
  });
  it("leaves fixed times and absent ends unchanged", () => {
    const { el, block, seen } = form({ time: "08:00", random_minutes: 5 }, null);
    expect(flat(block())).not.toContain(t("en", "sun_limit_option"));
    expect(flat(block())).toContain(t("en", "random_time"));
    el._setLimitOption("start", false);
    el._setLimitOption("end", false);
    expect(seen).toHaveLength(0);
  });
  it("resets the empty option when switching through a fixed time", () => {
    const { el, block, toggle } = form();
    toggle("start", true);
    el._toggleSun("start", "sunrise");
    expect(flat(block())).not.toContain(t("en", "sun_limit_option"));
    el._toggleSun("start", "sunrise");
    expect(fields(block())).toBe(0);
    expect(checked(block())).toBe(false);
  });
  it("preserves explanation, today's preview and invalid-bound error", () => {
    const { el, block } = form({ sun: "sunrise", earliest: "22:00", latest: "06:00" });
    el.hass = { language: "fr", config: { time_zone: "UTC" }, states: {
      "sun.sun": { attributes: { next_rising: new Date().toISOString() } },
    } };
    const text = flat(block());
    expect(text).toContain(t("fr", "sun_limit_option"));
    expect(text).toContain('class="sun-help"');
    expect(text).toContain("Aujourd’hui");
    expect(text).toContain(t("fr", "err_sun_bounds"));
  });
});
