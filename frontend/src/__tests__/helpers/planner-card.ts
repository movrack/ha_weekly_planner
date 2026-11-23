// Shared fixtures for the tests of the card's schedule views (comparison, compact list, header): "Lit without DOM",
// the card is built with `new` and its template results are read as text or walked for bound values and handlers.
import { vi } from "vitest";
import { WeeklyPlannerCard } from "../../weekly-planner-card";
import { flat } from "./tpl";

export const MONDAY = new Date("2026-11-02T09:00:00Z");
export const WEDNESDAY = new Date("2026-11-04T09:00:00Z");

/** A slot of label "l"; `start` and `end` are "HH:MM" strings or complete time objects (`{ sun: … }`); `end` null makes a one-shot. */
export const slot = (id: string, start: string | object = "08:00", end: string | object | null = "09:00"): any => {
  const time = (v: string | object) => (typeof v === "string" ? { time: v } : v);
  return { id, label: "l", start: time(start), ...(end ? { end: time(end) } : {}) };
};
export const label = { id: "l", name: "Open", color: "#0f0", action: { kind: "service", service: "cover.open_cover" } };
export const label2 = { id: "l2", name: "Close", color: "#f00", action: { kind: "service", service: "cover.close_cover" } };
export const hass: any = {
  language: "en", config: { time_zone: "UTC" }, states: {},
  services: { cover: { open_cover: { fields: {} }, close_cover: { fields: {} } }, light: { turn_on: { fields: {} } } },
};

/** A program whose Sunday differs from the other days (10:00-11:00 against 08:00-09:00); `holiday` is its day-off setting. */
export const program = (id: string, name: string, ids: string[], extra: any = {}, holiday?: any): any => ({
  id, name, revision: 1, priority: 1, enabled: true, reapply: true, conditions: [],
  entities: ids.map((e) => ({ entity_id: e, default_label: null, label_overrides: {} })),
  profiles: [{ id: "pr", name: "A", days: Array.from({ length: 7 }, (_, i) => (i === 6 ? [slot("sun", "10:00", "11:00")] : [slot("d")])),
    ...(holiday !== undefined ? { holiday } : {}) }], ...extra });
/** A program with the same day on all seven days unless `days` says otherwise. */
export const uniformProgram = (id: string, name: string, ids: string[], days?: any[], holiday?: any, extra: any = {}): any => ({
  id, name, revision: 1, priority: 1, enabled: true, reapply: true, conditions: [],
  entities: ids.map((e) => ({ entity_id: e, default_label: null, label_overrides: {} })),
  profiles: [{ id: "pr", name: "A", days: days ?? Array.from({ length: 7 }, () => [slot("d")]), ...(holiday ? { holiday } : {}) }], ...extra });

/** A card in the comparison view (config entries override), at `now` (a Monday by default), `_open` mocked. */
export const card = (programs: any[], config: any = {}, data: any = {}, now: Date = MONDAY): any => {
  const c = new WeeklyPlannerCard() as any;
  c.hass = hass;
  c._config = { schedule_view: "compare", ...config };
  c._now = now;
  c._data = { labels: [label], programs, status: {}, can_edit: true, read_only: false, ...data };
  c._open = vi.fn();
  return c;
};

/** Every value bound to an attribute whose name ends the preceding markup (booleans do not show in the flattened text). */
export const attrOf = (tpl: any, re: RegExp): any[] => {
  const found: any[] = [];
  const walk = (v: any): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v?.strings) v.values.forEach((x: any, i: number) => { if (re.test(v.strings[i])) found.push(x); else walk(x); });
  };
  walk(tpl);
  return found;
};
export const spansOf = (tpl: any): any[][] => attrOf(tpl, /\.spans=$/);
export const nowsOf = (tpl: any): any[] => attrOf(tpl, /\.now=$/);
export const noClocksOf = (tpl: any): any[] => attrOf(tpl, /\?no-clock=$/);
export const selectedOf = (tpl: any): boolean[] => attrOf(tpl, /aria-checked=$/);

/** One render per day the comparison can show: Monday to Sunday, then the day off when the card has one. */
export const everyDay = (c: any, render: () => any): any[] => {
  const out: any[] = [];
  for (let d = 0; d < 8; d++) {
    c._cmpDay = d;
    const tpl = render();
    if (d < 7 || flat(tpl).includes("cday-off")) out.push(tpl);
  }
  c._cmpDay = null;
  return out;
};
/** The comparison of the card's programs, every day. */
export const week = (c: any): any[] => everyDay(c, () => c._list(c._data.programs));
/** The comparison of explicit groups, every day. */
export const weekOf = (c: any, groups: any[][], grouped: boolean): any[] => everyDay(c, () => c._compare(groups, grouped));

/** The device names shown in the rows of rendered text. */
export const names = (html: string): string[] => [...html.matchAll(/class="cn">([^<]*)</g)].map((m) => m[1]);

/** The same card on a Wednesday. */
export const wednesdayCard = (programs: any[], config: any = {}, data: any = {}): any => card(programs, config, data, WEDNESDAY);

// ---- The card's list views (week, list, times, radial): a Wednesday, `type: "x"`, two settings, a hass that answers calls.
export const mkHass = (over: any = {}): any => ({
  language: "en", config: { time_zone: "UTC" }, states: {},
  services: { cover: { open_cover: { fields: {} }, close_cover: { fields: {} } } },
  callWS: vi.fn(async () => ({ slots: [] })), ...over });
/** A program with the same day on all seven days; `extra` overrides its fields, `days` and `holiday` its only profile. */
export const simpleProgram = (id: string, name: string, ids: string[], extra: any = {}, days?: any[], holiday?: any): any =>
  uniformProgram(id, name, ids, days, holiday, extra);
export const listCard = (programs: any[], config: any = {}, data: any = {}, hassOver: any = mkHass()): any => {
  const c = new WeeklyPlannerCard() as any;
  c.hass = hassOver;
  c._config = { type: "x", ...config };
  c._now = WEDNESDAY;
  c._data = { labels: [label, label2], programs, status: {}, can_edit: true, read_only: false, ...data };
  c._open = vi.fn();
  return c;
};
/** Value bound to each attribute name of a template tree (first one wins), directives included. */
export const attrs = (tpl: any): Record<string, any> => {
  const found: Record<string, any> = {};
  const walk = (v: any): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v?.strings) v.values.forEach((x: any, i: number) => { const m = /([.?@]?[\w-]+)=$/.exec(v.strings[i]); if (m && !(m[1] in found)) found[m[1]] = x; if (!m || typeof x === "object") walk(x); });
    else if (v?._$litDirective$ && Array.isArray(v.values)) walk(v.values);
  };
  walk(tpl);
  return found;
};
/** Fake timers and a window with real timers and a storage that remembers writes (read it back with `storage()`). */
export const stubBrowser = (): void => {
  vi.useFakeTimers();
  const storage = { getItem: () => null, setItem: vi.fn() };
  vi.stubGlobal("window", { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout, localStorage: storage });
  vi.stubGlobal("localStorage", storage);
};
export const unstubBrowser = (): void => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.clearAllMocks(); };
export const storage = (): any => (globalThis as any).localStorage;
