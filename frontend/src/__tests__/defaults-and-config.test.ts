import { afterEach, describe, expect, it, vi } from "vitest";
import { WpProgramEditor } from "../editors/program-editor";

afterEach(() => vi.unstubAllGlobals());
const fresh = (defaults?: { reapply: boolean; priority: number }) => {
  vi.stubGlobal("customElements", { get: () => undefined });
  const e = new WpProgramEditor() as any;
  e.hass = { language: "en", states: {}, callWS: vi.fn() };
  e.data = { programs: [], status: {}, labels: [], can_edit: true, read_only: false, ...(defaults ? { defaults } : {}) };
  e.willUpdate();
  return e._p;
};

describe("new program defaults", () => {
  it("uses the integration defaults when provided", () => {
    expect(fresh({ reapply: false, priority: 25 })).toMatchObject({ reapply: false, priority: 25 });
  });
  it("falls back to reapply on and priority 10 without defaults", () => {
    expect(fresh()).toMatchObject({ reapply: true, priority: 10 });
  });
});
