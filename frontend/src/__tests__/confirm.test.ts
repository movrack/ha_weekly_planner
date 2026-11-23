import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WpChoice, WpConfirm, WpPauseChoice, chooseAction, confirmAction, pauseChoice } from "../components/confirm";
import { WpDialog } from "../components/dialog";
import { find, flat, handlers } from "./helpers/tpl";

beforeEach(() => {
  (globalThis as any).CustomEvent ??= class { type: string; detail: unknown; constructor(t: string, i: any) { this.type = t; this.detail = i?.detail; } };
  vi.stubGlobal("customElements", { get: () => undefined });
  vi.stubGlobal("document", { documentElement: { lang: "en" }, activeElement: null, body: {}, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());

const clicks = (tpl: any) => handlers(tpl).filter((h) => h.event === "click");
const bindings = (tpl: any, suffix: string): unknown[] => {
  const found: unknown[] = [];
  const visit = (value: any): void => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value?.strings) value.strings.forEach((part: string, i: number) => {
      if (part.endsWith(suffix)) found.push(value.values[i]);
      else visit(value.values[i]);
    });
  };
  visit(tpl);
  return found;
};
/** `document.createElement` hands back one fake dialog that records its listeners. */
const stubDialog = () => {
  const listeners: Record<string, (e: any) => void> = {};
  const created: any = { addEventListener: (n: string, f: any) => { listeners[n] = f; }, remove: vi.fn() };
  (document as any).createElement = () => created;
  return { listeners, created };
};

describe("wp-confirm", () => {
  it("starts with empty labels and uses English when the document language is empty", () => {
    const el = new WpConfirm() as any;
    expect([el.message, el.confirmLabel, el.cancelLabel, el.lang]).toEqual(["", "", "", "en"]);
    (document as any).documentElement.lang = "";
    expect(new WpConfirm().lang).toBe("en");
  });
  it("reports the choice and keeps dialog close events inside the element", () => {
    const el = new WpConfirm() as any;
    Object.assign(el, { message: "Sure?", confirmLabel: "Delete", lang: "en" });
    const closeDialog = vi.fn(); const querySelector = vi.fn(() => ({ close: closeDialog })); el.renderRoot = { querySelector };
    const seen: any[] = []; el.dispatchEvent = (e: any) => { seen.push({ type: e.type, detail: e.detail }); return true; };
    const r = el.render();
    expect(flat(r)).toContain("Sure?"); expect(flat(r)).toContain("Delete");
    el._closed({ stopPropagation: vi.fn() }); // closed before any button choice keeps the false default
    find(r, "click", "danger").fn();
    const closed = vi.fn();
    find(r, "closed", "wp-dialog").fn({ stopPropagation: closed });
    find(r, "click", "cancel").fn();
    const cancelled = vi.fn();
    find(r, "closed", "wp-dialog").fn({ stopPropagation: cancelled });
    expect(seen).toEqual([
      { type: "choice", detail: false },
      { type: "choice", detail: true },
      { type: "choice", detail: false },
    ]);
    expect(closed).toHaveBeenCalledOnce(); expect(cancelled).toHaveBeenCalledOnce();
    expect(closeDialog).toHaveBeenCalledTimes(2);
    expect(querySelector).toHaveBeenCalledWith("wp-dialog");
  });
  it("shows its own cancel label or the translated default", () => {
    const el = new WpConfirm() as any;
    el.message = "Sure?"; el.confirmLabel = "Delete"; el.lang = "en";
    expect(flat(el.render())).toContain(">Cancel<");
    el.cancelLabel = "Keep it";
    expect(flat(el.render())).toContain(">Keep it<");
  });
  it("can be chosen before its dialog exists", () => {
    const el = new WpConfirm() as any;
    el.renderRoot = { querySelector: () => null };
    expect(() => el._choose(true)).not.toThrow();
  });
});

describe("confirmAction", () => {
  it("uses the host locale or page language and resolves with the choice", async () => {
    const { listeners, created } = stubDialog();
    const append = vi.fn();
    const yes = confirmAction({ shadowRoot: { appendChild: append }, hass: { locale: { language: "fr" } } } as any, "m", "ok", "no");
    expect(created).toMatchObject({ message: "m", confirmLabel: "ok", cancelLabel: "no", lang: "fr" });
    listeners.choice({ detail: true });
    expect(await yes).toBe(true); expect(created.remove).toHaveBeenCalled();
    const host: any = { appendChild: append, hass: { language: "de" } };
    const no = confirmAction(host, "m", "ok");
    expect(created).toMatchObject({ lang: "de", cancelLabel: "" });
    listeners.choice({ detail: false });
    expect(await no).toBe(false);
    (document as any).documentElement.lang = "nl";
    void confirmAction({ appendChild: append } as any, "m", "ok");
    expect(created.lang).toBe("nl");
    (document as any).documentElement.lang = "";
    void confirmAction({ appendChild: append } as any, "m", "ok");
    expect(created.lang).toBe("en");
  });
  it("uses the host itself when its shadow root is null", async () => {
    const { listeners, created } = stubDialog();
    const host: any = { appendChild: vi.fn(), shadowRoot: null };
    const c = confirmAction(host, "?", "Yes");
    expect(host.appendChild).toHaveBeenCalledWith(created);
    listeners.choice({ detail: true });
    expect(await c).toBe(true);
  });
});

describe("wp-choice", () => {
  const mount = () => {
    const el = new WpChoice() as any;
    el.message = "Which one?"; el.lang = "en";
    el.options = [{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }];
    const close = vi.fn(); const querySelector = vi.fn(() => ({ close })); el.renderRoot = { querySelector };
    const seen: any[] = []; el.dispatchEvent = (e: any) => { seen.push({ type: e.type, detail: e.detail }); return true; };
    return { el, close, querySelector, seen };
  };
  it("starts with empty message and options and uses English when the document language is empty", () => {
    const el = new WpChoice() as any;
    expect([el.message, el.options, el.lang]).toEqual(["", [], "en"]);
    (document as any).documentElement.lang = "";
    expect(new WpChoice().lang).toBe("en");
  });
  it("lists the options and a Cancel; an option closes the dialog with its id", () => {
    const { el, close, querySelector, seen } = mount();
    const r = el.render();
    expect(flat(r)).toContain("Alpha");
    expect(flat(r)).toContain("Beta");
    expect(clicks(r)).toHaveLength(3);
    clicks(r)[1].fn();
    expect(close).toHaveBeenCalledOnce();
    expect(querySelector).toHaveBeenCalledWith("wp-dialog");
    const stop = vi.fn();
    el._closed({ stopPropagation: stop });
    expect(stop).toHaveBeenCalledOnce();
    expect(seen).toEqual([{ type: "choice", detail: "b" }]);
  });
  it("Cancel (or Escape, or a tap outside) chooses nothing", () => {
    const { el, seen } = mount();
    clicks(el.render())[0].fn();
    clicks(el.render())[2].fn();
    el._closed({ stopPropagation: vi.fn() });
    expect(seen).toEqual([{ type: "choice", detail: null }]);
    const other = mount();
    other.el._closed({ stopPropagation: vi.fn() }); // closed without any choice
    expect(other.seen).toEqual([{ type: "choice", detail: null }]);
  });
  it("no dialog button when the dialog has no wp-dialog yet", () => {
    const el = new WpChoice() as any;
    el.renderRoot = { querySelector: () => null };
    expect(() => el._choose("a")).not.toThrow();
  });
});

describe("chooseAction", () => {
  const host = (hass?: any) => ({ appendChild: vi.fn(), hass }) as any;
  it("builds the dialog in the host's language, adds it to the host, resolves with the id and removes it", async () => {
    const { listeners, created } = stubDialog();
    const h = host({ locale: { language: "fr" }, language: "en" });
    const p = chooseAction(h, "Quel ?", [{ id: "a", label: "A" }]);
    expect(created).toMatchObject({ message: "Quel ?", lang: "fr", options: [{ id: "a", label: "A" }] });
    expect(h.appendChild).toHaveBeenCalledWith(created);
    listeners.choice({ detail: "a" });
    expect(await p).toBe("a");
    expect(created.remove).toHaveBeenCalledOnce();
  });
  it("resolves null for a cancelled or empty choice; language falls back to hass.language, then the page", async () => {
    let s = stubDialog();
    let p = chooseAction(host({ language: "de" }), "?", []);
    expect(s.created.lang).toBe("de");
    s.listeners.choice({ detail: null });
    expect(await p).toBeNull();
    s = stubDialog();
    (document as any).documentElement.lang = "nl";
    p = chooseAction(host({}), "?", []);
    expect(s.created.lang).toBe("nl");
    s.listeners.choice({ detail: undefined });
    expect(await p).toBeNull();
    s = stubDialog();
    p = chooseAction(host(), "?", []);
    expect(s.created.lang).toBe("nl");
    s.listeners.choice({ detail: "x" });
    expect(await p).toBe("x");
    s = stubDialog();
    (document as any).documentElement.lang = "";
    p = chooseAction(host(), "?", []);
    expect(s.created.lang).toBe("en");
    s.listeners.choice({ detail: "x" });
    expect(await p).toBe("x");
  });
  it("adds the dialog to the host's shadow root when it has one", async () => {
    const s = stubDialog();
    const appended = vi.fn();
    const h: any = { shadowRoot: { appendChild: appended }, appendChild: vi.fn() };
    const p = chooseAction(h, "?", []);
    expect(appended).toHaveBeenCalledWith(s.created);
    expect(h.appendChild).not.toHaveBeenCalled();
    s.listeners.choice({ detail: "z" });
    await p;
  });
});

describe("wp-pause-choice", () => {
  const mount = (lang = "en", message = "Pause?") => {
    const el = new WpPauseChoice() as any;
    Object.assign(el, { message, lang });
    const close = vi.fn(); const querySelector = vi.fn(() => ({ close }));
    el.renderRoot = { querySelector };
    const seen: any[] = []; el.dispatchEvent = (e: any) => { seen.push({ type: e.type, detail: e.detail }); return true; };
    return { el, seen, close, querySelector };
  };
  const done = (r: any) => find(r, "closed", "wp-dialog").fn({ stopPropagation() {} });
  const confirmWith = (el: any) => { const r = el.render(); clicks(r).slice(-1)[0].fn(); el._closed({ stopPropagation: vi.fn() }); };
  it("starts with empty message and custom fields and uses English when the document language is empty", () => {
    const el = new WpPauseChoice() as any;
    expect([el.message, el.lang, el._custom, el._hours]).toEqual(["", "en", "1", "0"]);
    (document as any).documentElement.lang = "";
    expect(new WpPauseChoice().lang).toBe("en");
  });
  it("shows a Duration label, a Indefinite / Pause switch, the durations, then Confirm and Cancel", () => {
    const { el } = mount("fr", "Office");
    const out = flat(el.render());
    for (const w of ["Jusqu’à quand ?", "Jusqu’à ce que je la reprenne", "Pour une durée", "Pause", "1 jour", "7 jours", "jours", "Confirmer", "Annuler"]) expect(out).toContain(w);
  });
  it("confirms 1 day (24 h) by default", () => {
    const { el, seen, close, querySelector } = mount("fr", "Office");
    const r = el.render();
    expect(flat(r)).toContain("aria-pressed=false class=");
    expect(flat(r)).toContain("aria-pressed=true class=on");
    expect(flat(r)).toContain("max=8760");
    clicks(r).slice(-1)[0].fn(); // Confirm (last click)
    done(r);
    expect(seen).toEqual([{ type: "choice", detail: 24 }]);
    expect(close).toHaveBeenCalledOnce();
    expect(querySelector).toHaveBeenCalledWith("wp-dialog");
  });
  it.each([
    ["1 hour", 2, "1h", "1", "0", 1, ["aria-pressed=true class=on\n              @click=>1 hour</button>", "aria-pressed=false class=\n              @click=>1 day</button>", "aria-pressed=false class=\n              @click=>7 days</button>", '<div class="custom muted">']],
    ["1 day", 3, 1, "0", "1", 24, ["aria-pressed=false class=\n              @click=>1 hour</button>", "aria-pressed=true class=on\n              @click=>1 day</button>", "aria-pressed=false class=\n              @click=>7 days</button>", '<div class="custom muted">']],
    ["7 days", 4, 7, "0", "7", 168, ["aria-pressed=false class=\n              @click=>1 hour</button>", "aria-pressed=false class=\n              @click=>1 day</button>", "aria-pressed=true class=on\n              @click=>7 days</button>", '<div class="custom muted">']],
  ] as const)("the %s quick button sets the fields and answers in hours", (_name, button, pick, hours, custom, answer, expectedMarkup) => {
    const { el, seen } = mount();
    if (button === 3) { el._pick = "x"; el._hours = "5"; el._custom = "0"; }
    clicks(el.render())[button].fn(); // after Indefinite and Pause for
    expect([el._pick, el._hours, el._custom]).toEqual([pick, hours, custom]);
    const selected = flat(el.render());
    for (const expected of expectedMarkup) expect(selected).toContain(expected);
    confirmWith(el);
    expect(seen).toEqual([{ type: "choice", detail: answer }]);
  });
  it("hides the durations with Indefinite and confirms 'none'; Cancel gives null", () => {
    const { el, seen, close } = mount("fr", "Office");
    clicks(el.render())[0].fn(); // Indefinite
    const r = el.render();
    expect(flat(r)).not.toContain("7 jours");
    expect(flat(r)).toContain("restent arrêtés");
    clicks(r).slice(-1)[0].fn();
    done(r);
    const c = mount("fr", "Office");
    clicks(c.el.render()).slice(-1)[0].fn(); // set a result before Cancel resets it
    clicks(c.el.render()).slice(-2)[0].fn();
    done(c.el.render());
    expect(seen).toEqual([{ type: "choice", detail: "none" }]);
    expect(c.seen).toEqual([{ type: "choice", detail: null }]);
  });
  it("Pause for switches back from Indefinite", () => {
    const { el } = mount();
    const initial = flat(el.render());
    expect(initial).toContain("aria-pressed=false class=");
    expect(initial).toContain("aria-pressed=true class=on");
    clicks(el.render())[0].fn();
    expect(el._unlimited).toBe(true);
    const unlimited = flat(el.render());
    expect(unlimited).toContain("aria-pressed=true class=on\n            @click=>Until I resume it</button>");
    expect(unlimited).toContain("aria-pressed=false class=\n            @click=>For a set time</button>");
    clicks(el.render())[1].fn();
    expect(el._unlimited).toBe(false);
    const paused = flat(el.render());
    expect(paused).toContain("aria-pressed=false class=\n            @click=>Until I resume it</button>");
    expect(paused).toContain("aria-pressed=true class=on\n            @click=>For a set time</button>");
    expect(paused).toContain('<div class="custom muted">');
  });
  it("takes days and hours: 1 hour to 365 days in total, whole numbers, and refuses the rest", () => {
    const { el, seen, close } = mount("fr", "Office");
    for (const [v, ok] of [["10", true], ["365", true], ["0", false], ["366", false], ["2.5", false], ["", false]] as const) {
      el._custom = v; el._hours = "0";
      expect(el._customHours()).toBe(ok ? Number(v) * 24 : null);
    }
    el._custom = "2"; el._hours = "5"; expect(el._customHours()).toBe(53);       // 2 days 5 hours
    el._custom = "0"; el._hours = "6"; expect(el._customHours()).toBe(6);        // hours alone
    el._custom = "0"; el._hours = "1"; expect(el._customHours()).toBe(1);        // minimum valid total
    el._custom = "1"; el._hours = ""; expect(el._customHours()).toBe(24);        // blank hours mean zero
    el._custom = ""; el._hours = "1"; expect(el._customHours()).toBe(1);         // blank days mean zero
    el._custom = "0"; el._hours = "1.5"; expect(el._customHours()).toBeNull();   // hours must be whole
    el._custom = "-1"; el._hours = "25"; expect(el._customHours()).toBeNull();  // days cannot be negative
    el._custom = "365"; el._hours = "1"; expect(el._customHours()).toBeNull();   // over a year
    el._custom = "1"; el._hours = "-1"; expect(el._customHours()).toBeNull();
    el._custom = "3"; el._hours = "0";
    const r = el.render();
    handlers(r).filter((h) => h.event === "input")[1]!.fn({ target: { value: "21" } });   // the days field
    expect(el._custom).toBe("21");
    expect(el._pick).toBe("x");
    el._custom = "0";
    const invalid = el.render();
    expect(bindings(invalid, "?disabled=")).toEqual([true]);
    clicks(invalid).slice(-1)[0].fn(); expect(seen).toEqual([]);   // invalid: nothing sent
    expect(close).not.toHaveBeenCalled();
    el._custom = "12";
    const valid = el.render();
    expect(bindings(valid, "?disabled=")).toEqual([false]);
    handlers(valid).find((h) => h.event === "keydown")!.fn({ key: "Enter" });
    done(valid);
    expect(seen).toEqual([{ type: "choice", detail: 288 }]);
  });
  it("the hours and days fields select the custom length, on focus and on input; Enter in the hours field confirms", () => {
    const { el, seen, close } = mount();
    const r = el.render();
    const focus = handlers(r).filter((h) => h.event === "focus");
    const input = handlers(r).filter((h) => h.event === "input");
    const keys = handlers(r).filter((h) => h.event === "keydown");
    focus[0].fn();
    expect(el._pick).toBe("x");
    expect(flat(el.render())).toContain('<div class="custom ">');
    el._pick = 1; focus[1].fn();
    expect(el._pick).toBe("x");
    expect(flat(el.render())).toContain('<div class="custom ">');
    input[0].fn({ target: { value: "5" } });
    expect(el._hours).toBe("5");
    keys[1].fn({ key: "Escape" }); // days field, another key: nothing
    expect(seen).toEqual([]);
    keys[0].fn({ key: "Escape" }); // hours field: another key also does nothing
    expect(seen).toEqual([]);
    expect(close).not.toHaveBeenCalled();
    el._custom = "0";
    keys[1].fn({ key: "Enter" }); // days field: Enter also confirms 5 h
    el._closed({ stopPropagation: vi.fn() });
    expect(seen).toEqual([{ type: "choice", detail: 5 }]);
    expect(close).toHaveBeenCalledOnce();
  });
  it("units agree with the number: English singular only for 1, French for 0 and 1", () => {
    const en = mount("en").el, fr = mount("fr").el;
    const frCanada = mount("fr-CA").el;
    for (const [el, n, one] of [[en, 1, true], [en, 0, false], [en, 2, false], [fr, 0, true], [fr, 1, true], [fr, 2, false], [fr, -1, false], [frCanada, 0, true]] as const) expect(el._singular(n)).toBe(one);
    en._hours = "1"; en._custom = "1";
    expect(flat(en.render())).toMatch(/hour[^s]/);
    fr._hours = "0"; fr._custom = "2";
    expect(flat(fr.render())).toContain("jours");
  });
  it("a pause closed without a choice answers null", () => {
    const { el, seen } = mount();
    const stop = vi.fn();
    el._closed({ stopPropagation: stop });
    expect(stop).toHaveBeenCalledOnce();
    expect(seen).toEqual([{ type: "choice", detail: null }]);
  });
  it("can cancel when its dialog is not yet available", () => {
    const { el, seen } = mount();
    el.renderRoot = { querySelector: () => null };
    clicks(el.render()).slice(-2)[0].fn();
    el._closed({ stopPropagation: vi.fn() });
    expect(seen).toEqual([{ type: "choice", detail: null }]);
  });
});

describe("pauseChoice", () => {
  it("uses the host language or page language and resolves with the choice", async () => {
    const { listeners, created } = stubDialog();
    const p = pauseChoice({ appendChild: vi.fn(), hass: { language: "fr" } } as any, "Office");
    expect(created).toMatchObject({ message: "Office", lang: "fr" });
    listeners.choice({ detail: 14 });
    expect(await p).toBe(14);
    (document as any).documentElement.lang = "nl";
    const other = stubDialog();
    const q = pauseChoice({ appendChild: vi.fn() } as any, "x");
    expect(other.created.lang).toBe("nl"); // no hass: the page's language
    other.listeners.choice({ detail: "none" });
    expect(await q).toBe("none");
    expect(other.created.remove).toHaveBeenCalledOnce();
    (document as any).documentElement.lang = "";
    const emptyPage = stubDialog();
    const r = pauseChoice({ appendChild: vi.fn() } as any, "x");
    expect(emptyPage.created.lang).toBe("en");
    emptyPage.listeners.choice({ detail: null });
    expect(await r).toBeNull();
  });
});

describe("dialog roles of the confirmations", () => {
  it.each([
    [WpConfirm, ".foot", "button.danger"],
    [WpChoice, ".choices", "button.choice"],
    [WpPauseChoice, ".durations", "button.go:disabled"],
  ] as const)("keeps the %s layout styles", (component, firstRule, secondRule) => {
    expect(component.styles.cssText).toContain(firstRule);
    expect(component.styles.cssText).toContain(secondRule);
  });
  it("wp-dialog is a dialog by default, an alertdialog on request, and links its description inside its own shadow root", () => {
    vi.stubGlobal("requestAnimationFrame", () => 0);
    const d = new WpDialog() as any;
    d.open = true;
    expect(flat(d.render())).toContain("role=dialog");
    expect(flat(d.render())).not.toContain("aria-describedby=wp-desc");
    d.dialogRole = "alertdialog"; d.description = "Delete it?";
    const html = flat(d.render());
    expect(html).toContain("role=alertdialog");
    expect(html).toContain("aria-describedby=wp-desc");
    expect(html).toContain('id="wp-desc"');
    expect(html).toContain("Delete it?");
  });
  it("wp-confirm is an alertdialog described by its message; wp-choice and wp-pause-choice are dialogs with a description", () => {
    const c = new WpConfirm() as any; c.message = "Delete Salon?"; c.lang = "en";
    expect(flat(c.render())).toContain('dialog-role="alertdialog"');
    expect(flat(c.render())).toContain("description=Delete Salon?");
    const ch = new WpChoice() as any; ch.message = "Which one?"; ch.lang = "en";
    expect(flat(ch.render())).not.toContain("alertdialog");
    expect(flat(ch.render())).toContain("description=Which one?");
    const p = new WpPauseChoice() as any; p.message = "Pause?"; p.lang = "en";
    expect(flat(p.render())).toContain("description=Pause?");
  });
  it("confirmations are content-sized on a phone (compact bottom sheet) and keep the alertdialog role", () => {
    const confirm = new WpConfirm();
    confirm.message = "Delete?";
    const choice = new WpChoice();
    choice.options = [{ id: "a", label: "A" }];
    expect(flat(confirm.render())).toContain("compact");
    expect(flat(confirm.render())).toContain("alertdialog");
    expect(flat(choice.render())).toContain("compact");
  });
});
