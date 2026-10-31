import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpDialog } from "../components/dialog";

let listeners: Map<string, (e: any) => void>;
let doc: any;
let opener: any;

const esc = (over: Partial<{ defaultPrevented: boolean }> = {}) => {
  const ev = { key: "Escape", defaultPrevented: false, stopPropagation: vi.fn(), ...over };
  listeners.get("keydown")?.(ev);
  return ev;
};

function open(): any {
  const d = new WpDialog() as any;
  d.dispatchEvent = vi.fn();
  d.open = true;
  d.updated(new Map([["open", false]]));
  return d;
}

beforeEach(() => {
  listeners = new Map();
  opener = { focus: vi.fn(), isConnected: true };
  doc = {
    body: {}, activeElement: opener,
    addEventListener: vi.fn((n, cb) => listeners.set(n, cb)),
    removeEventListener: vi.fn((n) => listeners.delete(n)),
  };
  vi.stubGlobal("document", doc);
  vi.stubGlobal("requestAnimationFrame", () => 0);
});
afterEach(() => vi.unstubAllGlobals());

describe("wp-dialog keyboard and focus", () => {
  it("closes on Escape heard at the page level (focus lost to body)", () => {
    const d = open();
    doc.activeElement = doc.body;
    esc();
    expect(d.open).toBe(false);
    expect(listeners.has("keydown")).toBe(false);
  });

  it("returns focus to the opening button on close", () => {
    const d = open();
    doc.activeElement = doc.body;
    d.close();
    expect(opener.focus).toHaveBeenCalled();
  });

  it("only the newest dialog answers Escape", () => {
    const first = open();
    const second = open();
    esc();
    expect(second.open).toBe(false);
    expect(first.open).toBe(true);
  });

  it("ignores an Escape another control already handled", () => {
    const d = open();
    esc({ defaultPrevented: true });
    expect(d.open).toBe(true);
    d.close();
  });
});
