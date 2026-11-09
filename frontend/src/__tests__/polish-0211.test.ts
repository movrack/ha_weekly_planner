// Minor UI items: reduced motion, content-sized confirmations, rem font sizes, spoken clocks in texts.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tokenStyles } from "../styles";
import { WpConfirm, WpChoice } from "../components/confirm";
import { WpDialog } from "../components/dialog";
import { solarTodayText } from "../components/slot-form";
import { flat } from "./helpers/tpl";

// @ts-ignore vite raw glob
const raw = import.meta.glob(["../*.ts", "../components/*.ts", "../editors/*.ts"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

beforeEach(() => {
  vi.stubGlobal("customElements", { get: () => undefined });
  vi.stubGlobal("document", { documentElement: { lang: "en" }, activeElement: null, body: {}, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());

describe("shared styles", () => {
  it("switch off transitions and animations when the user asks for reduced motion", () => {
    const css = tokenStyles.cssText;
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("transition: none !important");
    expect(css).toContain("animation: none !important");
  });
  it("every component with a transition includes the shared tokens", () => {
    for (const [f, text] of Object.entries(raw)) {
      if (/transition:\s*[a-z]/.test(text.replace(/panel\.style\.transition/g, ""))) expect(text, f).toMatch(/tokenStyles|editorStyles|calloutStyles/);
    }
  });
  it("font sizes in the card CSS are in rem (SVG text and test data excepted)", () => {
    const bad: string[] = [];
    for (const [f, text] of Object.entries(raw)) {
      text.split("\n").forEach((l: string, i: number) => {
        if (/font-size:\s*[0-9.]+px/.test(l) && !/(^|[\s}])(svg )?text(\.[\w-]+)?\s*\{/.test(l)) bad.push(`${f}:${i + 1}`);
      });
    }
    expect(bad).toEqual([]);
  });
});

describe("confirmation dialogs", () => {
  it("are content-sized on a phone (compact bottom sheet) and keep the alertdialog role", () => {
    const confirm = new WpConfirm();
    confirm.message = "Delete?";
    const choice = new WpChoice();
    choice.options = [{ id: "a", label: "A" }];
    expect(flat(confirm.render())).toContain("compact");
    expect(flat(confirm.render())).toContain("alertdialog");
    expect(flat(choice.render())).toContain("compact");
    expect(WpDialog.styles.toString()).toContain(":host([compact]) .panel");
  });
});

describe("solar today text", () => {
  it("uses the spoken clock", () => {
    const hass = { states: { "sun.sun": { attributes: { next_setting: `${new Date().toISOString().slice(0, 11)}17:30:00Z` } } }, config: { time_zone: "UTC" } } as never;
    expect(solarTodayText("fr", hass, { sun: "sunset" })).toBe("Aujourd’hui : 17 h 30");
  });
});
