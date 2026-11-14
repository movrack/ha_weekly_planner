// "Daily times": today as a plain list, one row per span (time, setting, then what else is worth knowing).
// A reading view: a row is a button only when editing is allowed, and then it opens the editor on today.

import { tokenStyles } from "../styles";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { t } from "../i18n";
import { fmtClock } from "../time";
import { sunRuleText } from "../times-list";
import type { TimesRow } from "../times-list";

@customElement("wp-times-day")
export class WpTimesDay extends LitElement {
  @property({ attribute: false }) rows: TimesRow[] = [];
  /** Where the preview stands: only "ready" may say that the day is empty. */
  @property() state: "ready" | "loading" | "failed" = "ready";
  /** Name of the setting applied the rest of the time (shown when the day is empty). */
  @property() rest = "";
  @property({ type: Boolean }) editable = false;
  /** A day off runs today: the rows are only read and the empty state offers no "Add a schedule" button. */
  @property({ type: Boolean }) locked = false;
  @property() lang = "en";
  /** Program (and device) the list belongs to: names the rows when several lists share the screen. */
  @property({ attribute: "device-name" }) deviceName = "";

  private _open(): void {
    if (!this.editable) return;
    this.dispatchEvent(new CustomEvent("open-day", { bubbles: true, composed: true }));
  }

  private _retry(): void {
    this.dispatchEvent(new CustomEvent("retry", { bubbles: true, composed: true }));
    // the button goes away when loading starts: keep the focus on the status region
    this.renderRoot?.querySelector<HTMLElement>(".status")?.focus();
  }

  private _button(text: string, icon: string, click: () => void) {
    return html`<button class="action" @click=${click}><ha-icon icon=${icon}></ha-icon>${text}</button>`;
  }

  private _primary(r: TimesRow): string {
    const time = fmtClock(this.lang, r.startMin);
    if (r.carry) return t(this.lang, "times_since_yesterday", { time });
    // a random start: the time shown is the one drawn for today, so it is said as approximate
    return r.random ? t(this.lang, "times_around", { time }) : time;
  }

  private _details(r: TimesRow) {
    const parts: unknown[] = [];
    if (r.done) parts.push(t(this.lang, "times_done"));
    if (r.until) {
      const time = r.until.min === null ? "" : fmtClock(this.lang, r.until.min);
      parts.push(r.until.day === "tomorrow" ? t(this.lang, "times_until_tomorrow", { time }) : t(this.lang, "times_until", { time }));
    }
    if (r.rule && r.sun) {
      parts.push(html`<span class="sun"><ha-icon icon=${r.sun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon>${sunRuleText(this.lang, r.rule)}</span>`);
    }
    if (r.random) parts.push(t(this.lang, "times_random"));
    return parts.length ? html`<span class="more">${parts.map((p) => html`<span>${p}</span>`)}</span>` : nothing;
  }

  private _row(r: TimesRow) {
    const content = html`
      <span class="dot" style="background:${r.color}" aria-hidden="true"></span>
      <span class="text">
        <span class="main"><span class="time">${this._primary(r)}</span><span class="label">${r.label}</span>
          ${r.now ? html`<span class="now"><ha-icon icon="mdi:clock-outline"></ha-icon>${t(this.lang, "times_now")}</span>` : nothing}</span>
        ${this._details(r)}
      </span>`;
    const name = this.deviceName ? `${this.deviceName}, ${r.label}` : r.label;
    return html`<li class=${r.now ? "current" : r.done ? "done" : ""} aria-current=${r.now ? "time" : nothing}>${this.editable && !this.locked
      ? html`<button class="row" title=${t(this.lang, "times_row_open", { name })} @click=${() => this._open()}>${content}</button>`
      : html`<div class="row">${content}</div>`}</li>`;
  }

  /** Loading, failed or empty: a message and maybe a button. Null when the list is shown. */
  private _message() {
    if (this.state === "loading") return html`<p class="msg">${t(this.lang, "times_loading")}</p>`;
    if (this.state === "failed") return html`<p class="msg">${t(this.lang, "times_failed")}</p>`;
    if (!this.rows.length) {
      return html`<p class="msg"><strong>${t(this.lang, "times_none")}</strong>
        ${this.rest ? html`<span>${t(this.lang, "times_rest", { name: this.rest })}</span>` : nothing}</p>`;
    }
    return nothing;
  }

  render() {
    // the status region stays in the page and only its content changes, so a screen reader announces it
    const shown = this.state === "ready" && this.rows.length > 0;
    return html`<div class="status" role="status" aria-live="polite" tabindex="-1">${this._message()}</div>
      ${shown ? html`<ul role="list" aria-label=${t(this.lang, "times_list_label")}>${this.rows.map((r) => this._row(r))}</ul>`
      : this.state === "failed" ? this._button(t(this.lang, "times_retry"), "mdi:refresh", () => this._retry())
      : this.state === "ready" && this.editable && !this.locked ? this._button(t(this.lang, "times_add"), "mdi:plus", () => this._open())
      : nothing}`;
  }

  static styles = css`
    ${tokenStyles}
    :host { display: block; --wp-times-detail: color-mix(in srgb, var(--primary-text-color) 75%, var(--card-background-color, transparent)); }
    ul { list-style: none; margin: 0; padding: 0; }
    li + li { border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2)); }
    .row {
      display: flex; align-items: flex-start; gap: 12px; width: 100%; min-height: 44px; box-sizing: border-box; padding: 8px 4px;
      margin: 0; border: 0; background: none; color: var(--primary-text-color); font: inherit; text-align: left;
    }
    button.row { cursor: pointer; border-radius: 8px; }
    button.row:hover { background: var(--secondary-background-color); }
    button.row:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
    .dot { flex: none; width: 14px; height: 14px; margin-top: 5px; border-radius: 7px; box-shadow: 0 0 0 1px var(--divider-color, rgba(127, 127, 127, 0.5)); }
    .text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .main { display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 10px; line-height: 1.5; font-size: 1rem; }
    .time { font-weight: 600; min-width: 0; overflow-wrap: anywhere; }
    .label { min-width: 0; overflow-wrap: anywhere; }
    .more { display: flex; flex-wrap: wrap; column-gap: 12px; font-size: 1rem; line-height: 1.5; color: var(--wp-times-detail); overflow-wrap: anywhere; }
    .sun { display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 16px; }
    .now {
      display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 16px; padding: 0 8px; border-radius: 10px;
      background: var(--wp-primary-fill); color: #fff; font-size: 1rem; font-weight: 600; line-height: 1.5;
    }
    /* a finished row: lighter weight and a softer grey (still >= 4.5:1), and the word "done" says it, so colour is never the only cue */
    li.done .main { color: color-mix(in srgb, var(--primary-text-color) 68%, var(--card-background-color, transparent)); }
    li.done .more { color: color-mix(in srgb, var(--primary-text-color) 68%, var(--card-background-color, transparent)); }
    li.done button.row:hover { background: none; }
    .status { outline: none; }
    li.done .time { font-weight: 400; }
    li.current { background: color-mix(in srgb, var(--wp-primary-fill) 16%, transparent); border-radius: 8px; box-shadow: inset 4px 0 0 var(--wp-primary-fill); }
    .msg { margin: 0; padding: 12px 4px; display: flex; flex-direction: column; gap: 2px; color: var(--primary-text-color); }
    .msg span { font-size: 1rem; color: var(--wp-times-detail); }
    .action {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px; box-sizing: border-box; max-width: 100%; min-height: 48px; margin: 8px 0 0;
      padding: 8px 16px; border: 1px solid var(--wp-field-border); border-radius: 8px; background: none; color: var(--wp-primary-text);
      font: inherit; font-weight: 600; text-align: center; overflow-wrap: anywhere; cursor: pointer; --mdc-icon-size: 20px;
    }
    .action:hover { background: var(--secondary-background-color); }
  `;
}
