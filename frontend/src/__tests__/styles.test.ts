// The shared styles: reduced motion, every transition component shares the tokens, font sizes in rem (zoom).
import { describe, expect, it } from "vitest";
import { tokenStyles } from "../styles";

// @ts-ignore vite raw glob
const raw = import.meta.glob(["../*.ts", "../components/*.ts", "../editors/*.ts"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

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
