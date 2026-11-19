// The shared styles: reduced motion, every transition component shares the tokens, font sizes in rem (zoom).
import { describe, expect, it } from "vitest";
import { collapse, collapseStyles, tokenStyles } from "../styles";
import { flat } from "./helpers/tpl";

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

describe("fold animation", () => {
  it("animates the height of a fold both ways, and keeps a closed fold out of the keyboard and screen reader order", () => {
    const css = collapseStyles.cssText;
    expect(css).toMatch(/\.wp-collapse \{[^}]*grid-template-rows: 0fr[^}]*transition: grid-template-rows/);
    expect(css).toMatch(/\.wp-collapse\.open \{[^}]*grid-template-rows: 1fr/);
    expect(css).toMatch(/\.wp-collapse > \.wp-collapse-in \{[^}]*min-height: 0[^}]*visibility: hidden/);
    expect(css).toMatch(/\.wp-collapse\.open > \.wp-collapse-in \{[^}]*visibility: visible/);
  });

  it("is part of the shared tokens, so every component that draws a fold has it", () => {
    expect(tokenStyles.cssText).toContain(".wp-collapse");
    expect(tokenStyles.cssText).toContain("@keyframes wp-appear");
    expect(tokenStyles.cssText).toContain("details::details-content");
  });

  it("has no motion at all when the user asks for reduced motion, folds and native details included", () => {
    const reduced = collapseStyles.cssText.slice(collapseStyles.cssText.indexOf("prefers-reduced-motion"));
    for (const selector of [".wp-collapse", ".wp-appear", "details::details-content"]) expect(reduced).toContain(selector);
    expect(reduced).toContain("transition: none !important");
    expect(reduced).toContain("animation: none !important");
  });

  it("collapse() draws its content whether open or not; closed it is inert and has no open class", () => {
    const closed = flat(collapse(false, "BODY", "acc-x"));
    expect(closed).toContain('class="wp-collapse "');
    expect(closed).toContain("id=acc-x");
    expect(closed).toContain("BODY");
    const open = flat(collapse(true, "BODY"));
    expect(open).toContain('class="wp-collapse open"');
    expect(open).not.toContain("id=acc-x");
    expect(open).toContain('<div class="wp-collapse-in">');
  });
});
