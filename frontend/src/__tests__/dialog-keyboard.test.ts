import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpDialog, collectFocusable } from "../components/dialog";
import { flat } from "./helpers/tpl";

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
    documentElement: { lang: "en" }, body: {}, activeElement: opener,
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

// The focus-trap tests build their own fake elements; `FakeSlot` stands in for HTMLSlotElement.
class FakeSlot { children: any[] = []; constructor(public assigned: any[] = []) {} assignedElements() { return this.assigned; } }
const fake = (children: any[] = [], over: Record<string, unknown> = {}): any => ({
  children, matches: () => true, hasAttribute: () => false, getAttribute: () => null, focus: vi.fn(), tagName: "DIV", ...over,
});
describe("wp-dialog focus trap", () => {
  beforeEach(() => { vi.stubGlobal("HTMLSlotElement", FakeSlot); });
  it("the owner can cancel the escape event: a cancelled one keeps the dialog open", () => {
    const dlg = new WpDialog() as any;
    dlg.open = true;
    dlg.addEventListener = undefined;
    dlg.dispatchEvent = vi.fn((e: Event) => { e.preventDefault(); return false; });
    const stop = vi.fn();
    dlg._onKey({ key: "Escape", stopPropagation: stop });
    expect(dlg.open).toBe(true);
    dlg.dispatchEvent = vi.fn(() => true);
    dlg._onKey({ key: "Escape", stopPropagation: stop });
    expect(dlg.open).toBe(false);
  });
  it("collects tab stops through slots and skips disabled, hidden and tabindex -1 ones", () => {
    const a = fake(), b = fake(), off = fake([], { hasAttribute: (n: string) => n === "disabled" }), skip = fake([], { getAttribute: () => "-1" });
    const slot = new FakeSlot([b, off, skip]);
    const root: any = { children: [a, slot] };
    expect(collectFocusable(root)).toEqual([a, b]);
  });

  function trapped() {
    const a = fake(), b = fake(), c = fake();
    const panel = fake([a, b, c], { focus: vi.fn() });
    const d = new WpDialog() as any;
    d.renderRoot = { querySelector: () => panel };
    d.open = true;
    return { d, a, b, c, panel };
  }
  const tab = (shiftKey = false) => ({ key: "Tab", shiftKey, defaultPrevented: false, preventDefault: vi.fn(), composedPath: () => [] });

  it("wraps Tab from the last control to the first, and Shift+Tab from the first to the last", () => {
    const { d, a, b, c } = trapped();
    d.updated(new Map([["open", false]]));
    doc.activeElement = c;
    const ev = tab(); d._onKey(ev);
    expect(ev.preventDefault).toHaveBeenCalled(); expect(a.focus).toHaveBeenCalled();
    doc.activeElement = a; d._onKey(tab(true)); expect(c.focus).toHaveBeenCalled();
    doc.activeElement = a; d._onKey(tab()); expect(b.focus).toHaveBeenCalled();
    d.disconnectedCallback();
  });

  it("brings the focus back in when it fell to the page (Tab heard on the document)", () => {
    const { d, a } = trapped();
    d.updated(new Map([["open", false]]));
    doc.activeElement = doc.body;
    d._onDocKey(tab());
    expect(a.focus).toHaveBeenCalled();
    d.disconnectedCallback();
  });

  it("goes to the dialog itself when it holds no control", () => {
    const { d, panel } = trapped();
    panel.children = [];
    d.updated(new Map([["open", false]]));
    d._onKey(tab());
    expect(panel.focus).toHaveBeenCalled();
    d.disconnectedCallback();
  });

  it("makes the rest of the page inert while open and restores it on close; the opener gets the focus back", () => {
    const opener = fake([], { isConnected: true });
    doc.activeElement = opener;
    const s1 = fake(), s2 = fake([], { hasAttribute: (n: string) => n === "inert" });
    s1.setAttribute = vi.fn(); s1.removeAttribute = vi.fn(); s2.setAttribute = vi.fn(); s2.removeAttribute = vi.fn();
    const { d } = trapped();
    const parent: any = { children: [d, s1, s2], parentNode: null };
    Object.defineProperty(d, "parentNode", { value: parent });
    d.updated(new Map([["open", false]]));
    expect(s1.setAttribute).toHaveBeenCalledWith("inert", "");
    expect(s2.setAttribute).not.toHaveBeenCalled();
    d.close();
    expect(s1.removeAttribute).toHaveBeenCalledWith("inert");
    expect(s2.removeAttribute).not.toHaveBeenCalled();
    expect(opener.focus).toHaveBeenCalled();
  });

  it("has no hidden title control: the heading is plain text and the expand button is explicit, last, and named", () => {
    const { d } = trapped();
    const html = flat(d.render());
    expect(html).toContain("<h2>");
    expect(html).not.toContain('class="heading"');
    expect(html.indexOf('class="expand"')).toBeGreaterThan(html.indexOf("<footer>"));
    expect(html).toContain("Enlarge / reduce");
    expect(html).toContain("mdi:arrow-expand-horizontal");
  });
});
