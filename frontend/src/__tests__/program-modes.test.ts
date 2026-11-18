import { afterEach, describe, expect, it, vi } from "vitest";
import { WpProgramEditor } from "../editors/program-editor";
import type { Program } from "../types";

const program = (): Program => ({ id: "p", revision: 1, name: "Office", priority: 10, enabled: true, reapply: true,
  conditions: [], entities: [{ entity_id: "light.office", default_label: null, label_overrides: {} }],
  profiles: ["home", "vacation"].map((id) => ({ id, name: id, days: [[], [], [], [], [], [], []] })),
});
const editor = () => {
  vi.stubGlobal("customElements", { get: () => undefined });
  const e = new WpProgramEditor() as any;
  e._p = program(); e._origin = structuredClone(e._p); e._isNew = false;
  e.data = { programs: [e._p], status: {}, labels: [], can_edit: true, read_only: false };
  e.hass = { language: "en", states: {}, callWS: vi.fn().mockResolvedValue({}) };
  return e;
};
afterEach(() => vi.unstubAllGlobals());

describe("program mode drafts", () => {
  it("gives a duplicated program its own schedule ids", () => {
    const e = editor();
    e._duplicate();
    const ids = e._p.profiles.map((p: { id: string }) => p.id);
    expect(ids).not.toContain("home");
    expect(ids).not.toContain("vacation");
    expect(e._p.mode_source).toBeUndefined();
    expect(e._p.active_profile).toBeUndefined();
  });
  it("never calls the removed set_profile command", () => {
    const e = editor();
    expect(e._changeActiveMode).toBeUndefined();
    expect(e._renderModeSource).toBeUndefined();
  });

});
