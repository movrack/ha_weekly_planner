// WCAG contrast of the card's derived colour tokens (styles.ts: tokenFormulas) against light and dark reference surfaces.
import { describe, expect, it } from "vitest";
import { tokenFormulas } from "../styles";

type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const mix = (a: RGB, pa: number, b: RGB): RGB => a.map((v, i) => (v * pa + b[i] * (100 - pa)) / 100) as RGB;
const lum = (c: RGB) => { const [r, g, b] = c.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const ratio = (a: RGB, b: RGB) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const primaries = ["#009ac7", "#03a9f4", "#ff9800", "#673ab7", "#e91e63", "#4caf50"];
const themes = {
  light: { surface: hex("#ffffff"), text: hex("#212121"), black: hex("#000000"), white: hex("#ffffff") },
  dark: { surface: hex("#1c1c1c"), text: hex("#e1e1e1"), black: hex("#000000"), white: hex("#ffffff") },
};
const F = tokenFormulas;

// OKLCH helpers: the fill keeps hue and chroma of the primary with a fixed lightness (chroma reduced until in gamut, as CSS does).
const toLin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toOk = (c: RGB): [number, number, number] => {
  const [r, g, b] = c.map((v) => toLin(v / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, Math.hypot(A, B), Math.atan2(B, A)];
};
const fromOk = (L: number, C: number, h: number): number[] => {
  const A = C * Math.cos(h), B = C * Math.sin(h);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3, m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3, s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
};
const inGamut = (c: number[]) => c.every((v) => v >= -1e-6 && v <= 1 + 1e-6);
const gam = (v: number) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const fillOf = (pr: RGB): RGB => {
  const [, C, h] = toOk(pr);
  let c = fromOk(F.fillLightness, C, h);
  if (!inGamut(c)) {
    let lo = 0, hi = C;
    for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (inGamut(fromOk(F.fillLightness, mid, h))) lo = mid; else hi = mid; }
    c = fromOk(F.fillLightness, lo, h);
  }
  return c.map((v) => gam(Math.min(1, Math.max(0, v)))) as RGB;
};

describe("contrast tokens", () => {
  for (const [name, th] of Object.entries(themes)) for (const p of primaries) {
    const pr = hex(p);
    it(`${name} ${p}: primary text >= 4.5 on surface, white on fill >= 4.5`, () => {
      expect(ratio(mix(pr, F.textPct, th.text), th.surface)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(th.white, mix(pr, F.fillPct, th.black))).toBeGreaterThanOrEqual(4.5);
    });
    it(`${name} ${p}: OKLCH fill >= 4.5 with white text and >= 3:1 against the surface`, () => {
      const fill = fillOf(pr);
      expect(ratio(th.white, fill)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(fill, th.surface)).toBeGreaterThanOrEqual(3);
    });
  }
  for (const [name, th] of Object.entries(themes)) for (const e of ["#db4437", "#f44336", "#b71c1c"]) {
    it(`${name} ${e}: danger text >= 4.5 on surface and on its tint, white on danger fill >= 4.5`, () => {
      const er = hex(e), d = mix(er, F.dangerTextPct, th.text);
      expect(ratio(d, th.surface)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(d, mix(er, 16, th.surface))).toBeGreaterThanOrEqual(4.5);
      expect(ratio(th.white, mix(er, F.dangerFillPct, th.black))).toBeGreaterThanOrEqual(4.5);
    });
  }
  for (const [name, th] of Object.entries(themes)) for (const e of ["#db4437", "#f44336", "#b71c1c"]) {
    it(`${name} ${e}: danger button border >= 3:1 on surface`, () => {
      expect(ratio(mix(hex(e), F.dangerBorderPct, th.text), th.surface)).toBeGreaterThanOrEqual(3);
    });
  }
  for (const [name, th] of Object.entries(themes)) {
    it(`${name}: field border >= 3:1 on surface`, () => {
      expect(ratio(mix(th.text, F.borderPct, th.surface), th.surface)).toBeGreaterThanOrEqual(3);
    });
    for (const [tone, c] of Object.entries({ success: "#43a047", warning: "#ff9800", error: "#db4437", info: "#039be5" })) {
      it(`${name} ${tone}: icon >= 3:1 on its tint`, () => {
        const col = hex(c), tint = mix(col, 16, th.surface);
        expect(ratio(mix(col, F.iconPct, th.text), tint)).toBeGreaterThanOrEqual(3);
      });
    }
  }
});
