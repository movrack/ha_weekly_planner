import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpChoice, WpConfirm, WpPauseChoice, chooseAction, confirmAction, pauseChoice } from "../components/confirm";
import { flat, handlers } from "./helpers/tpl";

// Coverage floors: the choice dialog, its helper, and the pause dialog's quick buttons and fields.
beforeEach(() => {
  (globalThis as any).CustomEvent ??= class { type: string; detail: unknown; constructor(t: string, i: any) { this.type = t; this.detail = i?.detail; } };
  vi.stubGlobal("customElements", { get: () => undefined });
  vi.stubGlobal("document", { documentElement: { lang: "en" }, activeElement: null, body: {}, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());

const clicks = (tpl: any) => handlers(tpl).filter((h) => h.event === "click");

describe("wp-choice", () => {
  const mount = () => {
    const el = new WpChoice() as any;
    el.message = "Which one?"; el.lang = "en";
    el.options = [{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }];
    const close = vi.fn(); el.renderRoot = { querySelector: () => ({ close }) };
    const seen: any[] = []; el.dispatchEvent = (e: any) => { seen.push(e.detail); return true; };
    return { el, close, seen };
  };
  it("lists the options and a Cancel; an option closes the dialog with its id", () => {
    const { el, close, seen } = mount();
    const r = el.render();
    expect(flat(r)).toContain("Alpha");
    expect(flat(r)).toContain("Beta");
    expect(clicks(r)).toHaveLength(3);
    clicks(r)[1].fn();
    expect(close).toHaveBeenCalledOnce();
    const stop = vi.fn();
    el._closed({ stopPropagation: stop });
    expect(stop).toHaveBeenCalledOnce();
    expect(seen).toEqual(["b"]);
  });
  it("Cancel (or Escape, or a tap outside) chooses nothing", () => {
    const { el, seen } = mount();
    clicks(el.render())[2].fn();
    el._closed({ stopPropagation: vi.fn() });
    expect(seen).toEqual([null]);
    const other = mount();
    other.el._closed({ stopPropagation: vi.fn() }); // closed without any choice
    expect(other.seen).toEqual([null]);
  });
  it("no dialog button when the dialog has no wp-dialog yet", () => {
    const el = new WpChoice() as any;
    el.renderRoot = { querySelector: () => null };
    expect(() => el._choose("a")).not.toThrow();
  });
});

describe("chooseAction", () => {
  const host = (hass?: any) => ({ appendChild: vi.fn(), hass }) as any;
  const stub = () => {
    const listeners: Record<string, (e: any) => void> = {};
    const created: any = { addEventListener: (n: string, f: any) => { listeners[n] = f; }, remove: vi.fn() };
    (document as any).createElement = () => created;
    return { listeners, created };
  };
  it("builds the dialog in the host's language, adds it to the host, resolves with the id and removes it", async () => {
    const { listeners, created } = stub();
    const h = host({ locale: { language: "fr" }, language: "en" });
    const p = chooseAction(h, "Quel ?", [{ id: "a", label: "A" }]);
    expect(created).toMatchObject({ message: "Quel ?", lang: "fr", options: [{ id: "a", label: "A" }] });
    expect(h.appendChild).toHaveBeenCalledWith(created);
    listeners.choice({ detail: "a" });
    expect(await p).toBe("a");
    expect(created.remove).toHaveBeenCalledOnce();
  });
  it("resolves null for a cancelled or empty choice; language falls back to hass.language, then the page", async () => {
    let s = stub();
    let p = chooseAction(host({ language: "de" }), "?", []);
    expect(s.created.lang).toBe("de");
    s.listeners.choice({ detail: null });
    expect(await p).toBeNull();
    s = stub();
    p = chooseAction(host({}), "?", []);
    expect(s.created.lang).toBe("en");
    s.listeners.choice({ detail: undefined });
    expect(await p).toBeNull();
    s = stub();
    p = chooseAction(host(), "?", []);
    expect(s.created.lang).toBe("en");
    s.listeners.choice({ detail: "x" });
    expect(await p).toBe("x");
  });
  it("uses the host itself when it has no shadow root, like confirmAction", async () => {
    const s = stub();
    const appended = vi.fn();
    const h: any = { shadowRoot: { appendChild: appended }, appendChild: vi.fn() };
    const p = chooseAction(h, "?", []);
    expect(appended).toHaveBeenCalledWith(s.created);
    expect(h.appendChild).not.toHaveBeenCalled();
    s.listeners.choice({ detail: "z" });
    await p;
    const s2 = stub();
    const c = confirmAction({ appendChild: vi.fn(), shadowRoot: null } as any, "?", "Yes");
    s2.listeners.choice({ detail: true });
    expect(await c).toBe(true);
  });
});

describe("wp-confirm: the cancel label", () => {
  it("shows its own cancel label or the translated default", () => {
    const el = new WpConfirm() as any;
    el.message = "Sure?"; el.confirmLabel = "Delete"; el.lang = "en";
    expect(flat(el.render())).toContain(">Cancel<");
    el.cancelLabel = "Keep it";
    expect(flat(el.render())).toContain(">Keep it<");
  });
});

describe("wp-pause-choice: quick buttons and fields", () => {
  const mount = (lang = "en") => {
    const el = new WpPauseChoice() as any;
    el.message = "Pause?"; el.lang = lang;
    el.renderRoot = { querySelector: () => ({ close: vi.fn() }) };
    const seen: any[] = []; el.dispatchEvent = (e: any) => { seen.push(e.detail); return true; };
    return { el, seen };
  };
  const confirmWith = (el: any) => { const r = el.render(); clicks(r).slice(-1)[0].fn(); el._closed({ stopPropagation: vi.fn() }); };
  it("1 hour, 1 day and 7 days set the fields and the answer in hours", () => {
    const a = mount();
    clicks(a.el.render())[2].fn(); // 1 hour (after Indefinite and Pause for)
    expect([a.el._pick, a.el._hours, a.el._custom]).toEqual(["1h", "1", "0"]);
    confirmWith(a.el);
    const b = mount();
    clicks(b.el.render())[4].fn();
    expect([b.el._pick, b.el._hours, b.el._custom]).toEqual([7, "0", "7"]);
    confirmWith(b.el);
    const c = mount();
    clicks(c.el.render())[3].fn();
    expect([c.el._pick, c.el._hours, c.el._custom]).toEqual([1, "0", "1"]);
    confirmWith(c.el);
    expect([a.seen, b.seen, c.seen]).toEqual([[1], [168], [24]]);
  });
  it("Pause for switches back from Indefinite", () => {
    const { el } = mount();
    clicks(el.render())[0].fn();
    expect(el._unlimited).toBe(true);
    clicks(el.render())[1].fn();
    expect(el._unlimited).toBe(false);
  });
  it("the hours and days fields select the custom length, on focus and on input; Enter in the hours field confirms", () => {
    const { el, seen } = mount();
    const r = el.render();
    const focus = handlers(r).filter((h) => h.event === "focus");
    const input = handlers(r).filter((h) => h.event === "input");
    const keys = handlers(r).filter((h) => h.event === "keydown");
    focus[0].fn();
    expect(el._pick).toBe("x");
    el._pick = 1; focus[1].fn();
    expect(el._pick).toBe("x");
    input[0].fn({ target: { value: "5" } });
    expect(el._hours).toBe("5");
    keys[1].fn({ key: "Escape" }); // days field, another key: nothing
    expect(seen).toEqual([]);
    el._custom = "0";
    keys[0].fn({ key: "Enter" }); // hours field: 5 h
    el._closed({ stopPropagation: vi.fn() });
    expect(seen).toEqual([5]);
  });
  it("units agree with the number: English singular only for 1, French for 0 and 1", () => {
    const en = mount("en").el, fr = mount("fr").el;
    for (const [el, n, one] of [[en, 1, true], [en, 0, false], [en, 2, false], [fr, 0, true], [fr, 1, true], [fr, 2, false]] as const) expect(el._singular(n)).toBe(one);
    en._hours = "1"; en._custom = "1";
    expect(flat(en.render())).toMatch(/hour[^s]/);
    fr._hours = "0"; fr._custom = "2";
    expect(flat(fr.render())).toContain("jours");
  });
  it("a pause closed without a choice answers null; the helper hands that on", async () => {
    const { el, seen } = mount();
    el._closed({ stopPropagation: vi.fn() });
    expect(seen).toEqual([null]);
    const listeners: Record<string, (e: any) => void> = {};
    const created: any = { addEventListener: (n: string, f: any) => { listeners[n] = f; }, remove: vi.fn() };
    (document as any).createElement = () => created;
    const p = pauseChoice({ appendChild: vi.fn() } as any, "x");
    expect(created.lang).toBe("en");
    listeners.choice({ detail: "none" });
    expect(await p).toBe("none");
  });
});
