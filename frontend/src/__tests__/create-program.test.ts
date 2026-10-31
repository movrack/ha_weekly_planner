import { afterEach, describe, expect, it, vi } from "vitest";
import { WeeklyPlannerCardEditor } from "../card-editor";
import { WpProgramEditor } from "../editors/program-editor";
import { t } from "../i18n";
import { selectCreated } from "../filter-editor";
import type { CardConfig, PlannerData, Program } from "../types";

const prog = (id: string, name: string, extra: Partial<Program> = {}): Program => ({ id, revision: 1, name, priority: 10, enabled: true, reapply: true,
  conditions: [], entities: [{ entity_id: "light.a", default_label: null, label_overrides: {} }], profiles: [], ...extra } as Program);
const old = prog("old", "Old"), other = prog("other", "Other", { entities: [{ entity_id: "climate.a", default_label: null, label_overrides: {} }] });
const created = prog("new1", "Created");
const data = (programs: Program[]) => ({ programs, labels: [], status: {}, can_edit: true, read_only: false }) as unknown as PlannerData;

const cardEditor = (config: CardConfig) => {
  const ed = new WeeklyPlannerCardEditor() as any;
  ed.hass = { language: "en", user: { is_admin: true } };
  ed.dispatchEvent = vi.fn();
  ed._config = config;
  ed._setData(data([old, other]));
  const editor = { dispatchEvent: vi.fn() };
  ed._editors.set("new", editor);
  ed._editing = "new";
  ed._section = "programs";
  const emitted = () => ed.dispatchEvent.mock.calls.map((c: any) => c[0].detail.config);
  const save = () => ed._saved({ stopPropagation: () => undefined, detail: created, currentTarget: editor });
  return { ed, emitted, save };
};

describe("after creating a program", () => {
  it("single-program mode selects the created program, even if the push arrives late or stale", () => {
    const { ed, emitted, save } = cardEditor({ type: "x", program: "old" });
    save();
    expect(emitted().at(-1).program).toBe("new1");
    expect(emitted().at(-1).filter).toBeUndefined();
    expect(ed._section).toBe("display");
    expect(ed._editing).toBe("new1");
    expect(ed._createdProgramId).toBe("new1");
    expect(ed._programs.map((p: any) => p.id)).toContain("new1");
    ed._setData(data([old, other])); // snapshot sent before the save: must not drop the new program
    expect(ed._programs.map((p: any) => p.id)).toContain("new1");
    ed._setData(data([old, other, created])); // real update
    expect(ed._justCreated).toBeUndefined();
    expect(ed._programs.map((p: any) => p.id)).toEqual(["old", "other", "new1"]);
  });
  it("list mode with an explicit list keeps the mode, adds the id and selects it in the settings", () => {
    const { ed, emitted, save } = cardEditor({ type: "x", filter: { programs: ["old"] } });
    save();
    const c = emitted().at(-1);
    expect(c.program).toBeUndefined();
    expect(c.filter.programs).toEqual(["old", "new1"]);
    expect(ed._editing).toBe("new1");
    expect(ed._section).toBe("display");
  });
  it("list mode widens a type or area filter that would hide it", () => {
    const c = selectCreated({ filter: { types: ["climate"], area: "Kitchen" } } as CardConfig, [old, other], created);
    expect(c.filter?.area).toBeUndefined();
    expect(c.filter?.types).toContain("light");
    expect(c.filter?.programs).toContain("new1");
  });
  it("list mode showing everything stays as is", () => {
    const { emitted, save } = cardEditor({ type: "x", filter: {} });
    save();
    expect(emitted().at(-1).filter).toEqual({});
  });
});

describe("creation form errors", () => {
  afterEach(() => vi.unstubAllGlobals());
  const form = () => {
    vi.stubGlobal("customElements", { get: () => undefined });
    const e = new WpProgramEditor() as any;
    e._p = prog("", "", { entities: [] }); e._isNew = true; e._origin = undefined; e._profileId = "";
    e.data = data([]); e.hass = { language: "en", states: {}, connection: {}, callWS: vi.fn().mockResolvedValue({}) };
    return e;
  };
  const text = (v: any): string => typeof v === "string" ? v : Array.isArray(v) ? v.map(text).join("") : v?.strings ? v.strings.map((s: string, i: number) => s + (i < v.values.length ? text(v.values[i]) : "")).join("") : "";
  it("puts the name error in the name field, not under the device picker", async () => {
    const e = form();
    await e._save();
    expect(e._nameError).toBe("The name is required.");
    expect(e._error).toBe("");
    const html = text(e.render());
    expect(html.indexOf("f-name-error")).toBeGreaterThan(html.indexOf('id="f-name"'));
    expect(html.indexOf("f-name-error")).toBeLessThan(html.indexOf(t("en", "tab_entities")));
    expect(html).toContain('aria-describedby=');
    expect(html).toContain("aria-invalid");
  });
  it("puts the missing-device error under the device picker", async () => {
    const e = form();
    e._p.name = "Office";
    await e._save();
    expect(e._entitiesError).toBe("Add at least one entity.");
    expect(e._nameError).toBe("");
    const html = text(e.render());
    expect(html.indexOf("pe-entities-error")).toBeGreaterThan(html.indexOf(t("en", "tab_entities")));
  });
  it("shows a server error as the global one, above the buttons", async () => {
    const e = form();
    e._p.name = "Office"; e._p.entities = [{ entity_id: "light.a", default_label: null, label_overrides: {} }];
    e.embedded = true;
    e.hass.callWS = vi.fn().mockRejectedValue({ code: "x", message: "boom" });
    await e._save();
    expect(e._error).toContain("boom");
    expect(e._nameError).toBe("");
    const html = text(e.render());
    expect(html.indexOf("boom")).toBeLessThan(html.indexOf("apply-bar"));
  });
  it("clears the name error when the name is edited, the device error when one is added", () => {
    const e = form();
    e._nameError = "x"; e._entitiesError = "y"; e._error = "z";
    e._patch({ name: "A" });
    expect(e._nameError).toBe("");
    expect(e._entitiesError).toBe("y");
    e._patch({ entities: [{ entity_id: "light.a", default_label: null, label_overrides: {} }] });
    expect(e._entitiesError).toBe("");
    expect(e._error).toBe("");
  });
});
