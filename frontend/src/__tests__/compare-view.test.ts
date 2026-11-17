import { describe, expect, it, vi } from "vitest";
import { normalizeConfig } from "../config";
import { strings, t } from "../i18n";
import { WeeklyPlannerCard, commonWordPrefix } from "../weekly-planner-card";
import { WeeklyPlannerCardEditor } from "../card-editor";
import { flat, handlers } from "./helpers/tpl";

const slot = (id: string, start = "08:00", end: string | null = "09:00") => ({ id, label: "l", start: { time: start }, ...(end ? { end: { time: end } } : {}) });
const days = () => Array.from({ length: 7 }, (_, i) => (i === 6 ? [slot("sun", "10:00", "11:00")] : [slot("d")]));
const prof = (holiday?: any) => ({ id: "pr", name: "A", days: days(), ...(holiday !== undefined ? { holiday } : {}) });
const label = { id: "l", name: "Open", color: "#0f0", action: { kind: "service", service: "cover.open_cover" } };
const hass: any = { language: "en", config: { time_zone: "UTC" }, states: {}, services: { cover: { open_cover: { fields: {} } }, light: { turn_on: { fields: {} } } } };
const program = (id: string, name: string, ids: string[], extra: any = {}, holiday?: any) => ({
  id, name, revision: 1, priority: 1, enabled: true, reapply: true, conditions: [],
  entities: ids.map((e) => ({ entity_id: e, default_label: null, label_overrides: {} })), profiles: [prof(holiday)], ...extra });
const card = (programs: any[], config: any = {}, data: any = {}) => {
  const c = new WeeklyPlannerCard() as any;
  c.hass = hass;
  c._config = { schedule_view: "compare", ...config };
  c._now = new Date("2026-11-02T09:00:00Z"); // a Monday
  c._data = { labels: [label], programs, status: {}, can_edit: true, read_only: false, ...data };
  c._open = vi.fn();
  return c;
};
const A = () => program("pa", "Zeta", ["light.z"]);
const B = () => program("pb", "Alpha", ["cover.a"]);
const C = () => program("pc", "Beta", ["cover.b"]);
const names = (html: string): string[] => [...html.matchAll(/class="cn">([^<]*)</g)].map((m) => m[1]);
const firstDay = (html: string) => names(html);
const spansOf = (tpl: any): any[][] => {
  const found: any[][] = [];
  const walk = (v: any): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v?.strings) v.values.forEach((x: any, i: number) => { if (/\.spans=$/.test(v.strings[i])) found.push(x); else walk(x); });
  };
  walk(tpl);
  return found;
};
const nowsOf = (tpl: any): any[] => {
  const found: any[] = [];
  const walk = (v: any): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v?.strings) v.values.forEach((x: any, i: number) => { if (/\.now=$/.test(v.strings[i])) found.push(x); else walk(x); });
  };
  walk(tpl);
  return found;
};
const noClocksOf = (tpl: any): any[] => {
  const found: any[] = [];
  const walk = (v: any): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v?.strings) v.values.forEach((x: any, i: number) => { if (/\?no-clock=$/.test(v.strings[i])) found.push(x); else walk(x); });
  };
  walk(tpl);
  return found;
};
const attrOf = (tpl: any, re: RegExp): any[] => {
  const found: any[] = [];
  const walk = (v: any): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v?.strings) v.values.forEach((x: any, i: number) => { if (re.test(v.strings[i])) found.push(x); else walk(x); });
  };
  walk(tpl);
  return found;
};
const selectedOf = (tpl: any): boolean[] => attrOf(tpl, /aria-selected=$/);
const render = (c: any) => c._list(c._data.programs);
/** Every day the comparison can show, one render each: Monday to Sunday, then the day off when the card has one. */
const week = (c: any): any[] => {
  const out: any[] = [];
  for (let d = 0; d < 8; d++) {
    c._cmpDay = d;
    const tpl = render(c);
    if (d < 7 || flat(tpl).includes("cday-off")) out.push(tpl);
  }
  c._cmpDay = null;
  return out;
};
const clicks = (c: any) => handlers(render(c)).filter((h) => h.event === "click");

describe("compare: config and editor", () => {
  it("config accepts compare and rejects unknown values", () => {
    expect(normalizeConfig({ type: "x", schedule_view: "compare" }).schedule_view).toBe("compare");
    expect(normalizeConfig({ type: "x", schedule_view: "nope" }).schedule_view).toBeUndefined();
  });
  it("texts exist in EN and FR", () => {
    expect(t("en", "ce_compare")).toBe("Comparison");
    expect(t("fr", "ce_compare")).toBe("Comparateur");
    expect(t("en", "compare_paused")).toBe("paused");
    expect(t("fr", "compare_paused")).toBe("en pause");
  });
  it("the editor select offers compare", () => {
    const e = new WeeklyPlannerCardEditor() as any;
    e.hass = { language: "en", states: {}, user: { is_admin: true } };
    e._data = { programs: [], can_edit: true };
    e._config = { type: "x", filter: {}, schedule_view: "compare" };
    const html = flat(e.render());
    expect(html).toContain('<option value="compare">');
    expect(html).toContain(t("en", "ce_compare"));
  });
});

describe("compare: structure", () => {
  it("one comparison for the whole card, one day at a time, a chip per day Monday to Sunday", () => {
    const c = card([A(), B()]);
    const h = flat(render(c));
    expect(h.match(/class="compare"/g)).toHaveLength(1);
    const days = strings("en").days;
    expect([...h.matchAll(/class="cday[^"]*" role="tabpanel" aria-label=([^>]*)>/g)].map((m) => m[1])).toEqual(["Monday"]); // today, alone
    expect([...flat(week(c)).matchAll(/class="cday[^"]*" role="tabpanel" aria-label=([^>]*)>/g)].map((m) => m[1])).toEqual(days);
    expect([...h.matchAll(/class="cdchip[^"]*" role="tab" aria-selected=\s+tabindex=-?\d aria-label=(\w+) @click=>/g)].map((m) => m[1])).toEqual(days);
    expect(selectedOf(render(c))).toEqual([true, ...Array(6).fill(false)]); // a single choice, today by default
    for (const d of strings("en").days_short) expect(h).toContain(`>${d}</button>`);
    for (const bad of ["wp-bar-editor", "class=\"phead\"", "role=\"switch\"", "weekbtn", "wp-chart", "class=\"create\"", "class=\"next\"", "<h2"]) expect(h).not.toContain(bad);
  });
  it("one row per device, default order type then name, same in every day", () => {
    const c = card([A(), B(), C()]);
    const h = flat(render(c));
    expect(firstDay(h)).toEqual(["Alpha", "Beta", "Zeta"]);
    expect(names(flat(week(c)))).toHaveLength(21);
  });
  it("sort name and custom order", () => {
    expect(firstDay(flat(render(card([A(), B(), C()], { sort: "name" }))))).toEqual(["Alpha", "Beta", "Zeta"]);
    expect(firstDay(flat(render(card([A(), B(), C()], { sort: "custom", order: ["pa", "pc"] }))))).toEqual(["Zeta", "Beta", "Alpha"]);
  });
  it("devices of one program stay together", () => {
    const multi = program("pm", "Multi", ["light.y", "light.x"]);
    const h = flat(render(card([B(), multi, A()], { sort: "name" })));
    expect(firstDay(h)).toEqual(["Alpha", "Multi, light.y", "Multi, light.x", "Zeta"]);
  });
  it("extra gap between two types only in type / area mode", () => {
    const gaps = (cfg: any, ps = [A(), B(), C()]) => (flat(week(card(ps, cfg))).match(/class=crow gap/g) ?? []).length;
    expect(gaps({})).toBe(7); // cover | light: one gap per day
    expect(gaps({ sort: "type" })).toBe(7);
    expect(gaps({ sort: "name" })).toBe(0);
    expect(gaps({ sort: "custom", order: ["pa"] })).toBe(0);
    const a = Object.assign(A(), { area: "Kitchen" }), b = Object.assign(B(), { area: "Hall" });
    expect(gaps({ sort: "area" }, [a, b])).toBe(7);
  });
  it("one program of one device works; a program without entities adds nothing", () => {
    const one = flat(week(card([A()])));
    expect(names(one)).toEqual(Array(7).fill("Zeta"));
    expect(one).not.toContain("class=crow gap");
    expect(names(flat(week(card([A(), program("pe", "Empty", [])]))))).toEqual(Array(7).fill("Zeta"));
    expect(flat(render(card([program("pe", "Empty", [])])))).toBe("");
    expect(flat(render(card([])))).toBe("");
  });
  it("hour axis once, under the last group", () => {
    const h = flat(render(card([A()])));
    expect(h.match(/class="caxis"/g)).toHaveLength(1);
    expect(h.indexOf("caxis")).toBeGreaterThan(h.lastIndexOf("class=crow"));
  });
});

describe("compare: today, touch and names", () => {
  it("today is bold and only its bars carry the now line", () => {
    const c = card([A(), B()]);
    const tpl = week(c);
    const h = flat(tpl);
    const one = flat(render(c));
    expect(one.match(/cdchip is-today/g)).toHaveLength(1); // one chip is today's, in bold
    expect(h.match(/cday is-today/g)).toHaveLength(1);
    expect(h).not.toMatch(/class="cday today|class=cday today|cdchip today/); // the plain `.today` class of the day row must not leak into this view
    expect(one).toMatch(/cdchip is-today" role="tab" aria-selected=\s+tabindex=0 aria-label=Monday @click=>Mon</);
    const nows = nowsOf(tpl);
    expect(nows).toHaveLength(14);
    expect(nows.filter((n) => n === 540)).toHaveLength(2);
    expect(nows.slice(0, 2)).toEqual([540, 540]);
    expect(nows.slice(2).every((n) => n === null)).toBe(true);
  });
  it("only the first bar of a day carries the clock of the now line (stacked bars would overlap it)", () => {
    const c = card([A(), B()]);
    const flags = noClocksOf(week(c));
    expect(flags).toHaveLength(14);
    for (let day = 0; day < 7; day++) expect(flags.slice(day * 2, day * 2 + 2)).toEqual([false, true]);
  });
  it("on another weekday today moves (Wednesday) and days are their next occurrence", () => {
    const c = card([A()]);
    c._now = new Date("2026-11-04T09:00:00Z");
    const h = flat(render(c));
    expect(h).toMatch(/cdchip is-today" role="tab" aria-selected=\s+tabindex=0 aria-label=Wednesday @click=>/);
    expect(h).toMatch(/cdchip " role="tab" aria-selected=\s+tabindex=-1 aria-label=Monday @click=>/);
    expect(selectedOf(render(c))).toEqual([false, false, true, false, false, false, false]);
    expect(h).toContain('role="tabpanel" aria-label=Wednesday'); // today's day is the one shown
  });
  it("bars and day titles are read only: a click opens nothing; only the icon at the top right edits", () => {
    const multi = program("pm", "Multi", ["light.y", "light.x"]);
    const c = card([A(), B(), multi], { sort: "name" });
    const h = flat(render(c));
    expect(h).not.toContain("<button class=cbar");
    expect(h).not.toMatch(/<button class="?ctitle/);
    const cl = clicks(c);
    expect(cl).toHaveLength(1 + 7); // the icon, then a chip per day
    expect(h).toContain(t("en", "compare_edit"));
    expect(h.indexOf(t("en", "compare_edit"))).toBeLessThan(h.indexOf("cday"));
    cl[0].fn();
    expect(c._dialog.kind).toBe("pick");
    expect(c._dialog.programs.map((p: any) => p.id)).toEqual(["pb", "pm", "pa"]); // Alpha, Multi, Zeta
  });
  it("with one program the icon opens its schedules at once", () => {
    const c = card([A()]);
    clicks(c)[0].fn();
    expect(c._dialog).toEqual({ kind: "schedule", scope: { kind: "program", programId: "pa" } });
  });
  it("the choice screen lists the programs and opens the chosen one", () => {
    const c = card([A(), B()], { sort: "name" });
    c._dialog = { kind: "pick", programs: [B(), A()] };
    const tpl = c._renderDialog();
    const h = flat(tpl);
    expect(h).toContain(t("en", "compare_pick"));
    expect(h).toContain("Alpha");
    expect(h).toContain("Zeta");
    const picks = handlers(tpl).filter((x) => x.event === "click");
    expect(picks).toHaveLength(2);
    picks[1].fn();
    expect(c._open).toHaveBeenLastCalledWith({ kind: "program", programId: "pa" });
    expect(t("fr", "compare_edit")).toBe("Modifier");
  });
  it("words every device name starts with are left out of the short name; the full name stays in title and aria-label", () => {
    const cut = commonWordPrefix(["Volet bureau", "Volet cuisine", "Volet salle de bain", "volet salle de jeux"]);
    expect(["Volet bureau", "Volet salle de bain", "volet salle de jeux"].map(cut)).toEqual(["bureau", "salle de bain", "salle de jeux"]);
    expect(commonWordPrefix(["Alpha", "Zeta"])("Zeta")).toBe("Zeta");
    expect(commonWordPrefix(["Volet"])("Volet")).toBe("Volet"); // one name: nothing to compare
    expect(commonWordPrefix(["Volet", "Volet bureau"])("Volet bureau")).toBe("Volet bureau"); // would leave an empty name
    expect(commonWordPrefix(["Volet a", "Volet a"])("Volet a")).toBe("Volet a");
    const h = flat(render(card([program("p1", "Volet bureau", ["cover.a"]), program("p2", "Volet cuisine", ["cover.b"])])));
    expect(names(h).slice(0, 2)).toEqual(["bureau", "cuisine"]);
    expect(h).toContain("title=Volet bureau");
    expect(h).toContain("aria-label=Volet bureau, Monday");
  });
  it("a sun time with a random delay takes its base from the server's preview, not from its own estimate", () => {
    const sunSlot = { id: "sx", label: "l", start: { sun: "sunset", random_minutes: 20 } };
    const c = card([program("p1", "Volet", ["cover.a"])]);
    c.hass = { ...hass, states: { "sun.sun": { attributes: { next_setting: "2026-11-02T16:55:30Z" } } } }; // an estimate of 16:55
    c._data.programs[0].profiles[0].days[0] = [sunSlot];
    c._deviceDays = () => ({ today: [{ slot_id: "sx", start: "2026-11-02T17:02:00Z", end: null, ignored: null, sun: true, start_base: "2026-11-02T16:54:00Z" }], previous: [] });
    const spans = c._computeSpans("cover.a", [c._data.programs[0]], 0);
    expect(spans[0].startBase).toBe(16 * 60 + 54);
    c._deviceDays = () => ({ today: [{ slot_id: "sx", start: "2026-11-02T17:02:00Z", end: null, ignored: null, sun: true }], previous: [] });
    expect(c._computeSpans("cover.a", [c._data.programs[0]], 0)[0].startBase).toBe(16 * 60 + 55); // older server: the estimate
  });
  it("accessible names and ellipsis: device, day; full name in title", () => {
    const long = program("pl", "A very long device name indeed", ["light.q"]);
    const h = flat(render(card([long])));
    expect(h).toContain("aria-label=A very long device name indeed, Monday");
    expect(h).toContain("title=A very long device name indeed");
    const css = String((WeeklyPlannerCard as any).styles.map((s: any) => s.cssText ?? "").join(""));
    expect(css).toContain("text-overflow: ellipsis");
    expect(css).not.toMatch(/\.cbar[^}]*#[0-9a-f]{3,6}/i);
  });
});

describe("compare: one day at a time", () => {
  const chips = (c: any) => handlers(render(c)).filter((h) => h.event === "click").slice(1); // after the edit icon
  const panels = (c: any) => [...flat(render(c)).matchAll(/role="tabpanel" aria-label=([^>]*)>/g)].map((m) => m[1]);
  it("shows today first and only that day", () => {
    const c = card([A(), B()]);
    c._now = new Date("2026-11-04T09:00:00Z"); // a Wednesday
    expect(panels(c)).toEqual(["Wednesday"]);
    expect(names(flat(render(c)))).toEqual(["Alpha", "Zeta"]);
  });
  it("a chip shows its day and only its day; one choice at a time", () => {
    const c = card([A(), B()]);
    chips(c)[4].fn(); // Friday
    expect(c._cmpDay).toBe(4);
    expect(panels(c)).toEqual(["Friday"]);
    expect(selectedOf(render(c))).toEqual([false, false, false, false, true, false, false]);
    chips(c)[1].fn();
    expect(panels(c)).toEqual(["Tuesday"]);
    expect(selectedOf(render(c)).filter(Boolean)).toHaveLength(1);
  });
  it("a day that is not today carries no now line; today's does", () => {
    const c = card([A()]);
    expect(nowsOf(render(c))).toEqual([540]);
    c._cmpDay = 2;
    expect(nowsOf(render(c))).toEqual([null]);
  });
  it("the day-off chip exists only with a day off, and shows that group", () => {
    const p = program("pb", "Alpha", ["cover.a"], {}, { copy: 6 });
    expect(chips(card([A()]))).toHaveLength(7);
    const c = card([p], {}, { holiday_entity: "binary_sensor.off" });
    expect(chips(c)).toHaveLength(8);
    chips(c)[7].fn();
    expect(flat(render(c))).toContain("cday cday-off");
    expect(panels(c)).toEqual([t("en", "holiday_title")]);
  });
  it("a chosen day-off view falls back to today when the day off disappears", () => {
    const c = card([A()]);
    c._cmpDay = 7;
    expect(panels(c)).toEqual(["Monday"]);
  });
  it("arrow keys move the choice, Home and End jump, other keys do nothing", () => {
    const c = card([A()]);
    const key = handlers(render(c)).find((h) => h.event === "keydown")!;
    const press = (k: string) => { const e = { key: k, preventDefault: vi.fn() }; key.fn(e); return e.preventDefault; };
    expect(press("ArrowRight")).toHaveBeenCalled();
    expect(c._cmpDay).toBe(1);
    const k2 = () => handlers(render(c)).find((h) => h.event === "keydown")!;
    k2().fn({ key: "End", preventDefault: vi.fn() });
    expect(c._cmpDay).toBe(6);
    k2().fn({ key: "ArrowRight", preventDefault: vi.fn() });
    expect(c._cmpDay).toBe(0); // wraps
    k2().fn({ key: "ArrowLeft", preventDefault: vi.fn() });
    expect(c._cmpDay).toBe(6);
    k2().fn({ key: "Home", preventDefault: vi.fn() });
    expect(c._cmpDay).toBe(0);
    const prevented = vi.fn();
    k2().fn({ key: "x", preventDefault: prevented });
    expect(prevented).not.toHaveBeenCalled();
    expect(c._cmpDay).toBe(0);
  });
});

describe("compare: paused", () => {
  it("a paused program is greyed and named with the suffix", () => {
    const paused = Object.assign(A(), { enabled: false });
    const h = flat(week(card([paused, B()])));
    const suffix = t("en", "compare_paused");
    expect(h.match(/class=crow (gap )?off/g)).toHaveLength(7);
    expect(h).toContain(`<span class="cp">${suffix}</span>`);
    expect(h).toContain(`aria-label=Zeta ${suffix}, Monday`);
    expect(h).toContain("aria-label=Alpha, Monday");
    expect(h.match(/class="cp"/g)).toHaveLength(7);
  });
  it("vacation greys everything; French suffix", () => {
    const c = card([A(), B()], {}, { vacation: true });
    c.hass = { ...hass, language: "fr" };
    const h = flat(week(c));
    expect(h.match(/class="cp"/g)).toHaveLength(14);
    expect(h).toContain(`<span class="cp">${t("fr", "compare_paused")}</span>`);
  });
  it("greying keeps the layout (opacity only)", () => {
    const css = (WeeklyPlannerCard as any).styles.map((s: any) => s.cssText ?? "").join("");
    expect(css).toContain(".crow.off wp-day-bar { opacity: 0.7; }");
  });
});

describe("compare: day-off group", () => {
  const dayOff = { holiday_entity: "binary_sensor.off" };
  const group = (h: string) => h.slice(h.indexOf("cday cday-off"));
  it("absent without the day-off entity or when no program has a day off", () => {
    expect(flat(week(card([A()], {}, {})))).not.toContain("cday-off");
    expect(flat(week(card([program("p", "P", ["cover.a"], {}, { copy: 6 })], {}, {})))).not.toContain("cday-off");
    expect(flat(week(card([A()], {}, dayOff)))).not.toContain("cday-off");
    expect(flat(week(card([program("p", "P", ["cover.a"], {}, { copy: 6, off: true })], {}, dayOff)))).not.toContain("cday-off");
  });
  it("lists every device; the ones without a day off get an empty bar with the text", () => {
    const withOff = program("pb", "Alpha", ["cover.a"], {}, { copy: 6 });
    const c = card([withOff, A()], {}, dayOff);
    const tpl = week(c);
    const h = flat(tpl);
    expect(h.indexOf("cday-off")).toBeGreaterThan(h.lastIndexOf("role=\"tabpanel\" aria-label=Sunday"));
    expect(h).toContain(`>${t("en", "holiday_title")}</button>`); // the chip of the day off, after Sunday's
    const g = group(h);
    expect(names(g)).toEqual(["Alpha", "Zeta"]);
    expect(g.match(/class="cnone"/g)).toHaveLength(1);
    expect(g).toContain(`<span class="cnone">${t("en", "compare_not_set")}</span>`);
    expect(g).toContain(`aria-label=Alpha, ${t("en", "holiday_title")}, ${t("en", "holiday_what_copy", { day: "Sunday" })}`);
    expect(g).toContain(`aria-label=Zeta, ${t("en", "holiday_title")}, ${t("en", "compare_not_set")}`);
    const spans = spansOf(tpl);
    expect(spans).toHaveLength(16);
    expect(spans[14].map((s: any) => [s.start, s.end])).toEqual([[600, 660]]); // copy of Sunday
    expect(spans[15]).toEqual([]);
    expect(g.indexOf("caxis")).toBeGreaterThan(0);
  });
  it("French text; own day and the midnight cut", () => {
    const own = program("pb", "Alpha", ["cover.a"], {}, { day: [slot("h", "23:00", "01:00")] });
    const c = card([own], {}, dayOff);
    c.hass = { ...hass, language: "fr" };
    const tpl = week(c);
    expect(flat(tpl)).toContain(t("fr", "holiday_title"));
    expect(spansOf(tpl)[7].map((s: any) => [s.start, s.end])).toEqual([[1380, 1440]]);
    const none = card([own, A()], {}, dayOff);
    none.hass = { ...hass, language: "fr" };
    expect(flat(week(none))).toContain(">comme un jour normal<");
  });
  it("a copied day shows its bar and \"like <day>\"; an own day shows the bar alone", () => {
    const copy = program("pc", "Alpha", ["cover.a"], {}, { copy: 6 });
    const own = program("po", "Beta", ["cover.b"], {}, { day: [slot("h", "08:00", "09:00")] });
    const h = group(flat(week(card([copy, own], {}, dayOff))));
    expect(h.match(/class="ccopy"/g)).toHaveLength(1);
    expect(h).toContain(`<span class="ccopy">${t("en", "holiday_what_copy", { day: "Sunday" })}</span>`);
    expect(h.match(/class="cnone"/g)).toBeNull();
    const rows = h.split('<div class="crow').slice(1);
    expect(rows[0]).toContain("ccopy");
    expect(rows[1]).not.toContain("ccopy");
    expect(rows[1]).not.toContain("cnone");
    const c = card([copy], {}, dayOff);
    c.hass = { ...hass, language: "fr" };
    expect(group(flat(week(c)))).toContain(">comme dimanche<");
  });
  it("today on a day off shows what really runs in today's group", () => {
    const p = program("pb", "Alpha", ["cover.a"], {}, { day: [slot("h", "12:00", "13:00")] });
    const c = card([p], {}, { ...dayOff, holiday_today: true, status: { pb: { holiday: { own: true } } } });
    const spans = spansOf(week(c));
    expect(spans[0].map((s: any) => [s.start, s.end])).toEqual([[720, 780]]); // Monday = today
    expect(spans[1].map((s: any) => [s.start, s.end])).toEqual([[480, 540]]); // Tuesday unchanged
  });
});
