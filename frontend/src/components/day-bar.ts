// A 24-hour bar of colored slots (read-only). Used in the week view and the day view.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { DAY } from "../time";

export interface BarSpan {
  start: number; // minutes 0–1440
  end: number;
  color: string;
  label: string;
  sun?: boolean;
  ignored?: string | null;
}

@customElement("wp-day-bar")
export class WpDayBar extends LitElement {
  @property({ attribute: false }) spans: BarSpan[] = [];
  @property({ type: Number }) now: number | null = null;
  @property({ type: Boolean }) thin = false;
  @property({ type: Boolean, attribute: "show-hours" }) showHours = false;

  @state() private _width = 0;
  private _ro?: ResizeObserver;

  connectedCallback(): void {
    super.connectedCallback();
    if (typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver((entries) => {
        const w = Math.round(entries[0]?.contentRect.width ?? 0);
        if (w !== this._width) this._width = w;
      });
      this._ro.observe(this);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._ro?.disconnect();
  }

  /** A label is only drawn when its span is at least 60 px wide (never cut off). */
  private _fits(s: BarSpan): boolean {
    return !this.thin && this._width > 0 && ((s.end - s.start) / DAY) * this._width >= 60;
  }

  render() {
    const pct = (m: number) => `${(m / DAY) * 100}%`;
    return html`
      <div class="bar ${this.thin ? "thin" : ""}" role="img"
        aria-label=${this.spans.map((s) => s.label).join(", ")}>
        ${this.spans.map(
          (s) => html`<div
            class="span ${s.ignored ? "ignored" : ""}"
            style="left:${pct(s.start)};width:${pct(Math.max(s.end - s.start, 5))};--c:${s.color}"
            title=${s.label}
          >${this._fits(s) ? html`<span>${s.sun ? html`<ha-icon icon="mdi:weather-sunny"></ha-icon>` : nothing}${s.label}</span>` : nothing}</div>`,
        )}
        ${this.now !== null ? html`<div class="now" style="left:${pct(this.now)}"></div>` : nothing}
      </div>
      ${this.showHours
        ? html`<div class="hours">${[0, 6, 12, 18, 24].map((h) => html`<span style="left:${pct(h * 60)}">${h}h</span>`)}</div>`
        : nothing}
    `;
  }

  static styles = css`
    :host { display: block; }
    .bar {
      position: relative; height: 28px; border-radius: 14px; overflow: hidden;
      background: var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .bar.thin { height: 10px; border-radius: 5px; }
    .span {
      position: absolute; top: 0; bottom: 0; background: var(--c);
      display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .span.ignored {
      background: repeating-linear-gradient(135deg, var(--c) 0 4px, transparent 4px 8px);
      opacity: 0.5;
    }
    .span span {
      display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 14px; color: #fff;
      color: #fff; font-size: 11px; font-weight: 600; white-space: nowrap;
      text-shadow: 0 0 2px rgba(0, 0, 0, 0.6); padding: 0 6px; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
    }
    .now {
      position: absolute; top: -2px; bottom: -2px; width: 2px; margin-left: -1px;
      background: var(--primary-text-color); box-shadow: 0 0 0 1px var(--card-background-color);
    }
    .hours { position: relative; height: 16px; font-size: 10px; color: var(--secondary-text-color); }
    .hours span { position: absolute; transform: translateX(-50%); top: 2px; }
    .hours span:first-child { transform: none; }
    .hours span:last-child { transform: translateX(-100%); }
  `;
}
