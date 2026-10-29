// Alternative 24-hour reading of the same resolved spans as the editable day bar.
import { LitElement, css, html, svg, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { BarSpan } from "./day-bar";
import { fmtClock } from "../time";
import { t } from "../i18n";

@customElement("wp-radial-day")
export class WpRadialDay extends LitElement {
  @property({ attribute: false }) spans: BarSpan[] = [];
  @property({ type: Number }) now: number | null = null;
  @property() lang = "en";
  @property() rest = "";
  @property() restColor = "var(--divider-color, #888)";

  private _open(): void {
    this.dispatchEvent(new CustomEvent("open-day", { bubbles: true, composed: true }));
  }

  render() {
    const spans = this.spans.filter((s) => !s.ignored);
    return html`<button @click=${this._open} aria-label=${t(this.lang, "hours")}>
      <svg viewBox="0 0 320 320" aria-hidden="true">
        <circle cx="160" cy="160" r="112" fill="none" stroke=${this.restColor} stroke-width="36" />
        ${spans.map((s) => {
          const length = Math.max(0, Math.min(1440, s.end) - Math.max(0, s.start)) / 1440 * 100;
          if (s.marker) {
            const a = s.start / 1440 * Math.PI * 2 - Math.PI / 2;
            return svg`<circle cx=${160 + 112 * Math.cos(a)} cy=${160 + 112 * Math.sin(a)} r="7" fill=${s.color} stroke="var(--primary-text-color)" stroke-width="2" />`;
          }
          return svg`<circle cx="160" cy="160" r="112" fill="none" stroke=${s.color} stroke-width="36"
            pathLength="100" stroke-dasharray="${length} ${100 - length}" stroke-dashoffset=${-s.start / 1440 * 100} transform="rotate(-90 160 160)" />`;
        })}
        ${[0, 6, 12, 18].map((h) => {
          const a = h / 24 * Math.PI * 2 - Math.PI / 2;
          return svg`<text x=${160 + 145 * Math.cos(a)} y=${165 + 145 * Math.sin(a)} text-anchor="middle">${String(h).padStart(2, "0")}</text>`;
        })}
        ${this.now === null ? nothing : (() => {
          const a = this.now / 1440 * Math.PI * 2 - Math.PI / 2;
          return svg`<line x1=${160 + 90 * Math.cos(a)} y1=${160 + 90 * Math.sin(a)} x2=${160 + 134 * Math.cos(a)} y2=${160 + 134 * Math.sin(a)} stroke="var(--primary-text-color)" stroke-width="3" />`;
        })()}
        <text x="160" y="156" text-anchor="middle">${this.now === null ? "24 h" : fmtClock(this.lang, this.now)}</text>
        <text x="160" y="180" text-anchor="middle">${t(this.lang, "hours")}</text>
      </svg></button>
      <div class="legend">
        ${this.rest ? html`<span><i style=${`background:${this.restColor}`}></i>${t(this.lang, "rest_of_time")}: ${this.rest}</span>` : nothing}
        ${spans.map((s) => html`<span><i style=${`background:${s.color}`}></i>${fmtClock(this.lang, s.start)}${s.marker ? "" : `–${fmtClock(this.lang, s.end)}`} · ${s.label}</span>`)}
      </div>`;
  }
  static styles = css`
    :host { display: block; }
    button { display: block; max-width: 360px; width: 100%; margin: auto; padding: 0; color: inherit; border: 0; background: none; cursor: pointer; border-radius: 50%; }
    svg { display: block; width: 100%; } text { fill: var(--primary-text-color); font-size: 14px; }
    .legend { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 13px; padding: 4px 0 12px; }
    span { display: inline-flex; align-items: center; gap: 6px; } i { width: 10px; height: 10px; border-radius: 50%; flex: none; }
  `;
}
