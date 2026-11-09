// Alternative clock readings of the same resolved spans as the editable day bar.
import { tokenStyles } from "../styles";
import { LitElement, css, html, svg, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sunTip, nowTip, type BarSpan } from "./day-bar";
import { radialSegments } from "../radial";
import { fmtClock } from "../time";
import { t } from "../i18n";
import "./tip";

/** Geometry shared with the edit overlay: observing a hover never intercepts a gesture. */
export function radialHoverTarget(spans: BarSpan[], now: number | null, double: boolean,
  x: number, y: number, rect: { left: number; top: number; width: number }): number | "now" | null {
  const px = (x - rect.left) * 320 / rect.width - 160;
  const py = (y - rect.top) * 320 / rect.width - 160;
  const distance = Math.hypot(px, py);
  const period = double ? 720 : 1440;
  const minute = ((Math.atan2(py, px) + Math.PI / 2) / (2 * Math.PI) + 1) % 1 * period;
  const ring = double && distance < 95 ? 0 : double ? 1 : 0;
  const radius = double && ring === 0 ? 78 : 112;
  const width = double ? 24 : 36;
  if (Math.abs(distance - radius) > width / 2 + 4) return null;
  if (now !== null && (!double || (now >= 720 ? 1 : 0) === ring)) {
    const delta = Math.abs(minute - (now - ring * period));
    if (Math.min(delta, period - delta) / period * Math.PI * 2 * radius * rect.width / 320 <= 8) return "now";
  }
  const m = minute + ring * period;
  for (let i = spans.length - 1; i >= 0; i--) {
    const span = spans[i];
    if (span.ignored) continue;
    if (span.marker ? Math.abs(m - span.start) / period * Math.PI * 2 * radius * rect.width / 320 <= 8
      : m >= span.start && m < span.end) return i;
  }
  return null;
}

const TRACK = "var(--divider-color, rgba(127, 127, 127, 0.2))";
const point = (turn: number, radius: number) => {
  const a = turn * Math.PI * 2 - Math.PI / 2;
  return { x: 160 + radius * Math.cos(a), y: 160 + radius * Math.sin(a) };
};

@customElement("wp-radial-day")
export class WpRadialDay extends LitElement {
  @property({ attribute: false }) spans: BarSpan[] = [];
  @property({ type: Number }) now: number | null = null;
  @property({ type: Boolean }) double = false;
  /** Device of the dial: said by the "now" marker. */
  @property({ attribute: "device-name" }) deviceName = "";
  @property() lang = "en";
  @property() rest = "";
  /** Full selected occurrence, kept visible for touch and updated by the editor draft. */
  @property({ attribute: false }) selectedTime = "";
  @property({ type: Boolean }) passive = false;

  private _open(): void {
    if (this.passive) return;
    this.dispatchEvent(new CustomEvent("open-day", { bubbles: true, composed: true }));
  }

  private _icon(turn: number, radius: number, icon: string, text: string, now = false) {
    const p = point(turn, radius);
    return html`<wp-tip text=${text} label=${now && this.deviceName ? `${text}, ${this.deviceName}` : text} ?no-tab=${now} style=${`left:${p.x / 3.2}%;top:${p.y / 3.2}%`}>
      <span class="icon"><ha-icon icon=${icon}></ha-icon></span></wp-tip>`;
  }

  render() {
    const segments = radialSegments(this.spans, this.double);
    const spans = [...new Set(segments.map((s) => s.source))];
    const outsideSelection = this.double || this.selectedTime.length > 45;
    const selection = this.selectedTime ? html`<div class=${outsideSelection ? "selected-time outside" : "selected-time"}
      title=${this.selectedTime} aria-label=${this.selectedTime} role="status">${this.selectedTime}</div>` : nothing;
    const period = this.double ? 720 : 1440;
    const width = this.double ? 24 : 36;
    const radius = (ring: number) => this.double && ring === 0 ? 78 : 112;
    const now = this.now !== null && Number.isFinite(this.now) && this.now >= 0 && this.now < 1440 ? this.now : null;
    const nowRing = this.double && now !== null && now >= 720 ? 1 : 0;
    const nowTurn = now === null ? 0 : (now - nowRing * period) / period;
    return html`<div class="dial"><button tabindex=${this.passive ? -1 : 0} @click=${this._open} aria-label=${t(this.lang, "hours")}>
      <svg viewBox="0 0 320 320" aria-hidden="true">
        ${(this.double ? [0, 1] : [0]).map((ring) => svg`<circle class="track" cx="160" cy="160" r=${radius(ring)} fill="none" stroke=${TRACK} stroke-width=${width} />`)}
        ${segments.map((s) => {
          if (s.source.marker) {
            const p = point(s.offset, radius(s.ring));
            return svg`<circle cx=${p.x} cy=${p.y} r="7" fill=${s.source.color} stroke="var(--primary-text-color)" stroke-width="2" />`;
          }
          return svg`<circle cx="160" cy="160" r=${radius(s.ring)} fill="none" stroke=${s.source.color} stroke-width=${width}
            pathLength="100" stroke-dasharray="${s.fraction * 100} ${100 - s.fraction * 100}" stroke-dashoffset=${-s.offset * 100} transform="rotate(-90 160 160)" />`;
        })}
        ${(this.double ? [0, 1] : [0]).map((ring) => Array.from({ length: period / 60 }, (_, h) => {
          const major = h % (this.double ? 3 : 6) === 0;
          const p = point(h * 60 / period, radius(ring) + width / 2);
          const q = point(h * 60 / period, radius(ring) + width / 2 - (major ? width : 6));
          return svg`<line class="tick" x1=${p.x} y1=${p.y} x2=${q.x} y2=${q.y} stroke="var(--primary-text-color)" stroke-opacity=".35" stroke-width="1" />`;
        }))}
        ${(this.double ? [0, 1] : [0]).map((ring) =>
          (this.double ? (ring === 0 ? [12, 3, 6, 9] : [24, 15, 18, 21]) : [0, 6, 12, 18]).map((h, i) => {
            const p = point(i / 4, this.double && ring === 0 ? 53 : 145);
            return svg`<text class="hour" x=${p.x} y=${p.y + 5} text-anchor="middle">${this.double ? h : String(h).padStart(2, "0")}</text>`;
          }))}
        ${now === null ? nothing : (() => {
          const p = point(nowTurn, radius(nowRing) - width / 2 - 4);
          const q = point(nowTurn, radius(nowRing) + width / 2 + 4);
          return svg`<line x1=${p.x} y1=${p.y} x2=${q.x} y2=${q.y} stroke="var(--primary-text-color)" stroke-width="3" />`;
        })()}
        ${this.selectedTime ? nothing : svg`<text x="160" y="156" text-anchor="middle">${now === null ? "24 h" : fmtClock(this.lang, now)}</text>
        <text x="160" y="180" text-anchor="middle">${t(this.lang, "hours")}</text>`}
      </svg></button>
      ${outsideSelection ? nothing : selection}
      ${segments.flatMap((s) => {
        const icons = [];
        if (s.start === s.source.start && s.source.startSun) icons.push(this._icon(s.offset, radius(s.ring),
          s.source.startSun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down", sunTip(this.lang, s.source.startSpec, s.start)));
        if (!s.source.marker && s.end === s.source.end && s.end < 1440 && s.source.endSun) icons.push(this._icon(s.offset + s.fraction, radius(s.ring),
          s.source.endSun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down", sunTip(this.lang, s.source.endSpec, s.end)));
        return icons;
      })}
      ${now === null ? nothing : this._icon(nowTurn, radius(nowRing) - width / 2 - 12, "mdi:clock-outline", nowTip(this.lang, now), true)}
      </div>
      ${outsideSelection ? selection : nothing}
      ${this.double ? html`<div class="rings">${t(this.lang, "radial_rings")}</div>` : nothing}
      <div class="legend">
        ${this.rest ? html`<span><i style=${`background:${TRACK}`}></i>${t(this.lang, "rest_of_time")}: ${this.rest}</span>` : nothing}
        ${spans.map((s) => html`<span><i style=${`background:${s.color}`}></i>${s.marker ? fmtClock(this.lang, s.start) : t(this.lang, "range_from_to", { from: fmtClock(this.lang, s.start), to: fmtClock(this.lang, s.end) })} · ${s.label}</span>`)}
      </div>`;
  }
  static styles = css`
    ${tokenStyles}
    :host { display: block; }
    .dial { position: relative; max-width: 360px; margin: auto; }
    button { display: block; width: 100%; padding: 0; color: inherit; border: 0; background: none; cursor: pointer; border-radius: 50%; }
    button:focus-visible { outline: 2px solid var(--wp-primary-text); }
    svg { display: block; width: 100%; } text { fill: var(--primary-text-color); font-size: 14px; }
    wp-tip { position: absolute; transform: translate(-50%, -50%); }
    .icon { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: var(--card-background-color, #fff); color: var(--primary-text-color); box-shadow: 0 0 0 1px var(--divider-color); }
    ha-icon { --mdc-icon-size: 14px; }
    .selected-time {
      position: absolute; left: 34%; top: 50%; transform: translateY(-50%); width: 32%;
      box-sizing: border-box; padding: 3px; border-radius: 8px; text-align: center; pointer-events: none;
      background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121);
      font-size: 0.75rem; font-weight: 600; line-height: 1.25; overflow-wrap: anywhere;
    }
    .selected-time.outside {
      position: static; transform: none; width: 100%; max-width: 360px; margin: 0 auto 8px;
      padding: 6px 10px; border: 1px solid var(--divider-color); font-size: 0.875rem; line-height: 1.4;
    }
    .rings { text-align: center; font-size: 0.75rem; color: var(--secondary-text-color); margin: 0 0 8px; }
    .legend { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 0.8125rem; padding: 4px 0 12px; }
    .legend span { display: inline-flex; align-items: center; gap: 6px; } i { width: 10px; height: 10px; border-radius: 50%; flex: none; }
  `;
}
