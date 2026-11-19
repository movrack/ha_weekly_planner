import { describe, expect, it, vi } from "vitest";
import { normalizeConfig } from "../config";
import { strings, t } from "../i18n";
import { WeeklyPlannerCard, commonWordPrefix } from "../weekly-planner-card";
import { WeeklyPlannerCardEditor } from "../card-editor";
import { flat, handlers } from "./helpers/tpl";
import { attrOf, card, hass, names, noClocksOf, nowsOf, program, selectedOf, uniformProgram, wednesdayCard, week, weekOf } from "./helpers/planner-card";

const A = () => program("pa", "Zeta", ["light.z"]);
const B = () => program("pb", "Alpha", ["cover.a"]);
const C = () => program("pc", "Beta", ["cover.b"]);
const firstDay = names;
const render = (c: any) => c._list(c._data.programs);
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

describe("short device names (words every name starts with are left out)", () => {
  it.each([
    ["any run of spaces splits the words, names are rebuilt with single spaces", ["Volet bureau", "Volet  cuisine"], ["bureau", "cuisine"]],
    ["runs of spaces count as one separator between the shared words too", ["Volet  a b", "Volet  a c"], ["b", "c"]],
    ["words are compared ignoring case", ["volet bureau", "VOLET cuisine"], ["bureau", "cuisine"]],
    ["only the shared first words go, the rest keeps its own case", ["Volet bureau", "Volet cuisine", "Volet salle de bain", "volet salle de jeux"],
      ["bureau", "cuisine", "salle de bain", "salle de jeux"]],
    ["the shared words stop at the first different one", ["Volet salon est", "Volet salon ouest"], ["est", "ouest"]],
    ["one name alone stays whole", ["Volet bureau"], ["Volet bureau"]],
    ["without a shared word the names stay untouched, spaces included", ["Alpha  one", "Beta two"], ["Alpha  one", "Beta two"]],
    ["a name that would be left empty keeps every name whole", ["Volet", "Volet bureau"], ["Volet", "Volet bureau"]],
    ["names that would become the same keep every name whole", ["A b", "A  b"], ["A b", "A  b"]],
    ["identical names stay whole", ["Volet a", "Volet a"], ["Volet a", "Volet a"]],
  ])("%s", (_why, input, expected) => {
    const cut = commonWordPrefix(input);
    expect(input.map(cut)).toEqual(expected);
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

describe("compare rows", () => {
  const two = () => [uniformProgram("p1", "Zeta", ["cover.z"]), uniformProgram("p2", "Beta", ["cover.a", "cover.b"]), uniformProgram("p3", "Gamma", ["cover.c"])];
  it("only the first device of the first program of a later group carries the gap, only when grouped", () => {
    const c = wednesdayCard([]);
    const [a, b, g] = two();
    const day = flat(c._compare([[a], [b, g]], true)); // one day only
    expect(day.match(/class=crow gap>/g)).toHaveLength(1);
    expect(day.match(/class=crow>/g)).toHaveLength(3);
    expect(flat(c._compare([[a], [b, g]], false))).not.toContain("gap");
    expect(flat(c._compare([[a, g]], true))).not.toContain("gap");
  });
  it("a switched off program is greyed (class 'crow off', 'crow gap off' after a gap, no stray spaces) and read with the paused word", () => {
    const c = wednesdayCard([]);
    const [a, b] = two();
    b.enabled = false;
    const html = flat(c._compare([[a], [b]], true));
    expect(html).toContain("class=crow gap off>");
    expect(html).toContain("class=crow>");
    expect(html).not.toMatch(/class=crow {2}/);
    expect(flat(c._compare([[a, b]], false))).toContain("class=crow off>");
    // a paused device is read with the paused word, after its own name, a running one without
    const read = flat(c._compare([[a], [b]], false));
    expect(read).toContain("aria-label=Zeta, Wednesday");
    expect(read).toContain(`aria-label=Beta, cover.a ${t("en", "compare_paused")}, Wednesday`);
  });
  it("today is Wednesday: one is-today group and one is-today title, the others stay plain", () => {
    const c = wednesdayCard([]);
    const html = flat(weekOf(c, [[two()[0]]], false));
    expect(html.match(/class="cday is-today"/g)).toHaveLength(1);
    expect(html.match(/class="cday "/g)).toHaveLength(6);
    expect(html).toMatch(/class="cday is-today" role="tabpanel" aria-label=Wednesday/);
    expect(flat(c._compare([[two()[0]]], false)).match(/class="cdchip is-today"/g)).toHaveLength(1); // the chip of today is in bold
  });
  it("the hour axis has five labels at 0, 25, 50, 75 and 100 %, 24 h reading as the day end", () => {
    const c = wednesdayCard([]);
    const html = flat(c._compare([[two()[0]]], false));
    const axis = html.slice(html.indexOf('class="caxis"'));
    expect([...axis.matchAll(/class="h(\d+)" style="left:([\d.]+)%">([^<]*)</g)].map((m) => [m[1], m[2], m[3]])).toEqual([
      ["0", "0", "12 am"], ["6", "25", "6 am"], ["12", "50", "12 pm"], ["18", "75", "6 pm"], ["24", "100", "24 h"]]);
  });
  it("the edit button carries the translated name and opens the chooser (several) or the program (one)", () => {
    const c = wednesdayCard([]);
    const [a, b] = two();
    const html = flat(c._compare([[a, b]], false));
    expect(html).toContain(`aria-label=${t("en", "compare_edit")} title=${t("en", "compare_edit")}`);
    const tpl = c._compare([[a, b]], false);
    handlers(tpl).find((h: any) => h.event === "click")!.fn();
    expect(c._dialog).toEqual({ kind: "pick", programs: [a, b] });
    handlers(c._compare([[a]], false)).find((h: any) => h.event === "click")!.fn();
    expect(c._dialog).toEqual({ kind: "schedule", scope: { kind: "program", programId: "p1" } });
  });
  it("the scope of a device is its program, plus the device when the program has several", () => {
    const c = wednesdayCard([]);
    const [a, b] = two();
    expect(c._scopeOf(a, "cover.z")).toEqual({ kind: "program", programId: "p1" });
    expect(c._scopeOf(b, "cover.b")).toEqual({ kind: "program", programId: "p2", entityId: "cover.b" });
  });
  it("a program is not running when off, or when everything is paused", () => {
    const c = wednesdayCard([uniformProgram("p1", "A", ["cover.a"])]);
    expect(c._notRunning(c._data.programs[0])).toBe(false);
    c._data.vacation = true;
    expect(c._notRunning(c._data.programs[0])).toBe(true);
    c._data.vacation = false;
    c._data.programs[0].enabled = false;
    expect(c._notRunning(c._data.programs[0])).toBe(true);
    c._data = undefined;
    expect(c._notRunning({ enabled: true })).toBe(false);
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
  it("a row shows the short device name; the full name stays in the title and the accessible name", () => {
    const h = flat(render(card([program("p1", "Volet bureau", ["cover.a"]), program("p2", "Volet cuisine", ["cover.b"])])));
    expect(names(h).slice(0, 2)).toEqual(["bureau", "cuisine"]);
    expect(h).toContain("title=Volet bureau");
    expect(h).toContain("aria-label=Volet bureau, Monday");
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

describe("comparison bars tell what they show", () => {
  it("each bar's label lists its stretches with their times, after the device and the day", () => {
    const p = uniformProgram("p1", "Volet bureau", ["cover.a"]);
    const c = wednesdayCard([p]);
    c._spans = vi.fn(() => [{ start: 480, end: 540, label: "Open", color: "#0f0", labelId: "l", slotId: "d", ignored: null }]);
    const labels = attrOf(weekOf(c, [[p]], false), /aria-label=$/).filter((x) => typeof x === "string" && x.includes("Open"));
    expect(labels.length).toBe(7);
    expect(labels[0]).toMatch(/^Volet bureau, .+: Open 8 am–9 am$/);
  });
});


// Comparison view: the "Mode : …" line and the Edit button share one row (no empty band between them).
describe("comparison view header row", () => {
  const raw = (WeeklyPlannerCard as unknown as { styles: unknown }).styles;
  const css = (Array.isArray(raw) ? raw : [raw]).map((s) => (s as { cssText?: string }).cssText ?? "").join("");

  it("lifts the edit button onto the mode line", () => {
    expect(css).toContain(".mode-line + .compare .cedit { margin-top: -26px; }");
  });

  it("keeps the mode text clear of the button", () => {
    expect(css).toContain(".mode-line:has(+ .compare) { padding-bottom: 0; padding-right: 76px; }");
  });
});

