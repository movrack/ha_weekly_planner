// A 24-hour bar of colored slots (read-only). Used in the week view and the day view.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
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
          >${!this.thin && s.end - s.start >= 90 ? html`<span>${s.sun ? "☀️ " : ""}${s.label}</span>` : nothing}</div>`,
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
      color: #fff; font-size: 11px; font-weight: 600; white-space: nowrap;
      text-shadow: 0 0 2px rgba(0, 0, 0, 0.6); padding: 0 6px;
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
