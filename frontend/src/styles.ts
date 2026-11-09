// Shared look of the card: design tokens and the one notice component ("callout").
// Every notice, banner or message (success, warning, error, info) is drawn by `calloutStyles`: a rounded block,
// a 1 px border and a light tint in the tone colour, an mdi icon in the tone colour, then the text in the normal
// text colour (never coloured text on a coloured background, so it stays readable in light and dark).

import { css, html, nothing, unsafeCSS } from "lit";

export type Tone = "success" | "warning" | "error" | "info";

/** Tone colours (Home Assistant theme variables with their usual fallbacks) and default icons. */
export const tones: Record<Tone, { color: string; icon: string }> = {
  success: { color: "var(--success-color, #43a047)", icon: "mdi:check-circle-outline" },
  warning: { color: "var(--warning-color, #ff9800)", icon: "mdi:alert-outline" },
  error: { color: "var(--error-color, #db4437)", icon: "mdi:alert-circle-outline" },
  info: { color: "var(--info-color, #039be5)", icon: "mdi:information-outline" },
};

/** Percentages of the derived colour tokens; frozen by __tests__/contrast-tokens.test.ts (WCAG ratios for several primaries). */
export const tokenFormulas = { textPct: 55, fillPct: 60, fillLightness: 0.55, dangerTextPct: 55, dangerFillPct: 70, dangerBorderPct: 60, borderPct: 50, iconPct: 60 } as const;
const tf = tokenFormulas;

/**
 * Accessible colours derived from the Home Assistant theme (the theme itself is never changed). Custom properties inherit
 * through shadow roots, but every component includes `tokenStyles` so it also works on its own.
 *  - --wp-primary-text: primary colour used as TEXT or thin line (mixed towards the theme text colour: darker in a light theme,
 *    lighter in a dark one), at least 4.5:1 on the surface.
 *  - --wp-primary-fill: primary colour used as a background under WHITE text. Same hue and chroma, fixed OKLCH lightness
 *    (`fillLightness`), so in light AND dark themes it is at least 4.5:1 with white text and at least 3:1 against the dark
 *    card surface (component boundary), whatever the primary. Browsers without relative colours keep the darker mix with black.
 *  - --wp-danger-text / --wp-danger-fill: the same for the error colour.
 *  - --wp-danger-border: error colour mixed towards the theme text colour (lighter in a dark theme), 1 px border of the danger button so its boundary reaches 3:1 on a dark surface.
 *  - --wp-field-border: border of fields, selects and chips, at least 3:1 on the surface (divider colour is about 1.3:1).
 * The `:focus-visible` rule gives every interactive element the same 2 px ring.
 */
export const tokenStyles = css`
  :host {
    --wp-primary-text: color-mix(in srgb, var(--primary-color, #03a9f4) ${unsafeCSS(String(tf.textPct))}%, var(--primary-text-color, #212121));
    --wp-primary-fill: color-mix(in srgb, var(--primary-color, #03a9f4) ${unsafeCSS(String(tf.fillPct))}%, #000);
    --wp-danger-text: color-mix(in srgb, var(--error-color, #db4437) ${unsafeCSS(String(tf.dangerTextPct))}%, var(--primary-text-color, #212121));
    --wp-danger-fill: color-mix(in srgb, var(--error-color, #db4437) ${unsafeCSS(String(tf.dangerFillPct))}%, #000);
    --wp-danger-border: color-mix(in srgb, var(--error-color, #db4437) ${unsafeCSS(String(tf.dangerBorderPct))}%, var(--primary-text-color, #212121));
    --wp-field-border: color-mix(in srgb, var(--primary-text-color, #212121) ${unsafeCSS(String(tf.borderPct))}%, transparent);
  }
  @supports (color: oklch(from red l c h)) {
    :host { --wp-primary-fill: oklch(from var(--primary-color, #03a9f4) ${unsafeCSS(String(tf.fillLightness))} c h); }
  }
  :is(button, input, select, textarea, summary, a[href], [tabindex]:not([tabindex="-1"])):focus-visible {
    outline: 2px solid var(--wp-primary-text); outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
  }
`;

/** Text colour (white or black) readable on a hex background such as a label colour; white for anything it cannot parse. */
export function readableOn(color: string): { fg: string; shadow: string } {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!m) return { fg: "#fff", shadow: "rgba(0, 0, 0, 0.6)" };
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  const lin = [0, 2, 4].map((i) => { const v = parseInt(h.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  const L = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  return L > 0.179 ? { fg: "#000", shadow: "none" } : { fg: "#fff", shadow: "rgba(0, 0, 0, 0.6)" };
}

export const radiusNotice = "10px";
/** Share of the tone colour in the tint (the rest is transparent, so the card background shows through). */
export const tintPercent = 16;

const toneRules = (Object.keys(tones) as Tone[]).map((k) => `.callout.tone-${k} { --co-color: ${tones[k].color}; }`).join("\n");
const iconPct = String(tf.iconPct);

/** One definition of the notice look. Markup: `callout()` below, or `.callout.tone-X > ha-icon + .co-body`. */
export const calloutStyles = css`
  ${tokenStyles}
  .callout { display: flex; gap: 10px; align-items: flex-start; margin: 0 0 10px; padding: 10px 12px; box-sizing: border-box;
    border-radius: ${unsafeCSS(radiusNotice)}; border: 1px solid var(--co-color, var(--divider-color));
    background: color-mix(in srgb, var(--co-color, var(--divider-color)) ${unsafeCSS(String(tintPercent))}%, transparent);
    color: var(--primary-text-color); --mdc-icon-size: 24px; }
  ${unsafeCSS(toneRules)}
  /* icon: the tone colour mixed towards the text colour so it reaches 3:1 on its own tint, in light and dark */
  .callout > ha-icon { color: color-mix(in srgb, var(--co-color) ${unsafeCSS(iconPct)}%, var(--primary-text-color, #212121)); flex: none; }
  .callout .co-body { flex: 1; min-width: 0; font-size: 0.875rem; line-height: 1.4; overflow-wrap: anywhere; }
  .callout .co-body b { display: block; font-size: 1rem; }
  .callout .co-body p { margin: 2px 0 0; font-size: 0.875rem; line-height: 1.4; color: var(--primary-text-color); }
  .callout .co-body b:empty, .callout .co-body p:empty { display: none; }
  .callout .co-body > :first-child { margin-top: 0; }
  .callout .btns { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .callout .btn { max-width: 100%; min-height: 44px; height: auto; white-space: normal; text-align: center; overflow-wrap: anywhere; }
`;

/** A callout: icon in the tone colour, an optional bold title, an optional normal text, optional extra content (buttons). */
export function callout(tone: Tone, title: string, text?: string, opts: { role?: string; icon?: string; extra?: unknown } = {}) {
  return html`<div class="callout tone-${tone}" role="${opts.role ?? nothing}">
    <ha-icon icon="${opts.icon ?? tones[tone].icon}"></ha-icon>
    <div class="co-body">${title ? html`<b>${title}</b>` : nothing}${text ? html`<p>${text}</p>` : nothing}${opts.extra ?? nothing}</div></div>`;
}
