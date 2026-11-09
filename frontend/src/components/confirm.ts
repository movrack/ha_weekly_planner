// Confirmation before a destructive action (spec § 10.7). The destructive button sits on the
// left, away from Cancel, so it cannot be hit by mistake.
//
// Usage from any component with a shadow root:
//   import { confirmAction } from "../components/confirm";
//   if (await confirmAction(this, "Supprimer « Bureau » ?", "Supprimer")) { …delete… }
// `confirmAction` appends a <wp-confirm> to the host's shadow root (or to the host itself when it
// has none), resolves true when the destructive button is pressed and false on Cancel, Escape or
// backdrop, then removes the element. The `closed` event of the dialog never leaves the element,
// so it cannot close a parent dialog.

import { tokenStyles } from "../styles";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { strings } from "../i18n";
import "./dialog";

@customElement("wp-confirm")
export class WpConfirm extends LitElement {
  @property() message = "";
  @property({ attribute: "confirm-label" }) confirmLabel = "";
  @property({ attribute: "cancel-label" }) cancelLabel = "";
  @property() lang = document.documentElement.lang || "en";

  private _result = false;

  private _choose(value: boolean): void {
    this._result = value;
    this.renderRoot.querySelector<HTMLElement & { close(): void }>("wp-dialog")?.close();
  }

  private _closed = (ev: Event): void => {
    ev.stopPropagation();
    this.dispatchEvent(new CustomEvent("choice", { detail: this._result }));
  };

  render() {
    const s = strings(this.lang);
    return html`
      <wp-dialog open compact dialog-role="alertdialog" description=${this.message} heading=${s.cf_title} @closed=${this._closed}>
        <p class="msg">${this.message}</p>
        <div slot="footer" class="foot">
          <button class="danger" @click=${() => this._choose(true)}>${this.confirmLabel}</button>
          <button class="cancel" @click=${() => this._choose(false)}>${this.cancelLabel || s.cancel}</button>
        </div>
      </wp-dialog>
    `;
  }

  static styles = css`
    ${tokenStyles}
    .msg { font-size: 1rem; line-height: 1.4; margin: 8px 0 16px; }
    .foot { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 24px; }
    button {
      min-height: 48px; padding: 0 20px; border-radius: 24px; font: inherit; font-size: 1rem; cursor: pointer;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color);
    }
    button.danger { background: var(--wp-danger-fill); border-color: var(--wp-danger-border); color: #fff; }
    button:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
  `;
}

export function confirmAction(host: HTMLElement, message: string, confirmLabel: string, cancelLabel = ""): Promise<boolean> {
  return new Promise((resolve) => {
    const el = document.createElement("wp-confirm") as WpConfirm;
    el.message = message;
    el.confirmLabel = confirmLabel;
    el.cancelLabel = cancelLabel;
    const hass = (host as { hass?: { locale?: { language?: string }; language?: string } }).hass;
    el.lang = hass?.locale?.language ?? hass?.language ?? (document.documentElement.lang || "en");
    el.addEventListener("choice", (ev) => {
      el.remove();
      resolve(Boolean((ev as CustomEvent<boolean>).detail));
    });
    (host.shadowRoot ?? host).appendChild(el);
  });
}

/** One of several actions, each a big button; Cancel, Escape or a tap outside choose nothing (null). */
@customElement("wp-choice")
export class WpChoice extends LitElement {
  @property() message = "";
  @property({ attribute: false }) options: { id: string; label: string }[] = [];
  @property() lang = document.documentElement.lang || "en";

  private _result: string | null = null;

  private _choose(value: string | null): void {
    this._result = value;
    this.renderRoot.querySelector<HTMLElement & { close(): void }>("wp-dialog")?.close();
  }

  private _closed = (ev: Event): void => {
    ev.stopPropagation();
    this.dispatchEvent(new CustomEvent("choice", { detail: this._result }));
  };

  render() {
    const s = strings(this.lang);
    return html`
      <wp-dialog open compact description=${this.message} heading=${s.cf_choose} @closed=${this._closed}>
        <p class="msg">${this.message}</p>
        <div class="choices">
          ${this.options.map((o) => html`<button class="choice" @click=${() => this._choose(o.id)}>${o.label}</button>`)}
        </div>
        <div slot="footer" class="foot">
          <button class="cancel" @click=${() => this._choose(null)}>${s.cancel}</button>
        </div>
      </wp-dialog>
    `;
  }

  static styles = css`
    ${tokenStyles}
    .msg { font-size: 1rem; line-height: 1.4; margin: 8px 0 12px; overflow-wrap: anywhere; }
    .choices { display: grid; gap: 12px; }
    .foot { display: flex; width: 100%; justify-content: flex-end; }
    button {
      min-height: 56px; padding: 8px 16px; border-radius: 28px; font: inherit; font-size: 1rem; cursor: pointer; overflow-wrap: anywhere;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color);
    }
    button.choice { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; font-weight: 600; }
    button:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
  `;
}

export function chooseAction(host: HTMLElement, message: string, options: { id: string; label: string }[]): Promise<string | null> {
  return new Promise((resolve) => {
    const el = document.createElement("wp-choice") as WpChoice;
    el.message = message;
    el.options = options;
    const hass = (host as { hass?: { locale?: { language?: string }; language?: string } }).hass;
    el.lang = hass?.locale?.language ?? hass?.language ?? (document.documentElement.lang || "en");
    el.addEventListener("choice", (ev) => {
      el.remove();
      resolve((ev as CustomEvent<string | null>).detail ?? null);
    });
    (host.shadowRoot ?? host).appendChild(el);
  });
}

/** Pause length choice: a "Duration" label, a switch Pause / No limit, the durations when it is a pause, then Confirm.
 *  A pause is answered in HOURS (1 day = 24). */
export type PauseChoice = number | "none" | null;
const MAX_PAUSE_DAYS = 365;

@customElement("wp-pause-choice")
export class WpPauseChoice extends LitElement {
  @property() message = "";
  @property() lang = document.documentElement.lang || "en";

  private _result: PauseChoice = null;
  @state() private _unlimited = false;
  @state() private _pick: "1h" | 1 | 7 | "x" = 1;
  @state() private _custom = "1";
  @state() private _hours = "0";

  /** French uses the singular for 0 and 1 ("0 jour"); English only for 1. */
  private _singular(n: number): boolean {
    return this.lang.startsWith("fr") ? n >= 0 && n < 2 : n === 1;
  }

  private _finish(value: PauseChoice): void {
    this._result = value;
    this.renderRoot.querySelector<HTMLElement & { close(): void }>("wp-dialog")?.close();
  }

  private _closed = (ev: Event): void => {
    ev.stopPropagation();
    this.dispatchEvent(new CustomEvent("choice", { detail: this._result }));
  };

  /** Hours of the custom pause (days x 24 + hours), or null while a field is not a whole number or the total is out of range. */
  private _customHours(): number | null {
    const d = Number(this._custom === "" ? "0" : this._custom);
    const h = Number(this._hours === "" ? "0" : this._hours);
    if (!Number.isInteger(d) || !Number.isInteger(h) || d < 0 || h < 0) return null;
    const total = d * 24 + h;
    return total >= 1 && total <= MAX_PAUSE_DAYS * 24 ? total : null;
  }

  /** What Confirm would send, or undefined while the number of days is not valid. */
  private _value(): PauseChoice | undefined {
    if (this._unlimited) return "none";
    if (this._pick === "x") return this._customHours() ?? undefined;
    return this._pick === "1h" ? 1 : this._pick * 24;
  }

  private _confirm(): void {
    const v = this._value();
    if (v !== undefined) this._finish(v);
  }

  render() {
    const s = strings(this.lang);
    return html`
      <wp-dialog open description=${this.message} heading=${s.pause_title} @closed=${this._closed}>
        <p class="msg">${this.message}</p>
        <div class="label" id="dur">${s.pause_duration}</div>
        <div class="switch" role="group" aria-labelledby="dur">
          <button aria-pressed=${String(this._unlimited)} class=${this._unlimited ? "on" : ""}
            @click=${() => { this._unlimited = true; }}>${s.pause_none}</button>
          <button aria-pressed=${String(!this._unlimited)} class=${this._unlimited ? "" : "on"}
            @click=${() => { this._unlimited = false; }}>${s.pause_for}</button>
        </div>
        ${this._unlimited ? html`<p class="hint">${s.pause_none_hint}</p>` : html`
          <div class="label sub" id="len">${s.pause_length}</div>
          <div class="durations" role="group" aria-labelledby="len">
            <button aria-pressed=${String(this._pick === "1h")} class=${this._pick === "1h" ? "on" : ""}
              @click=${() => { this._pick = "1h"; this._hours = "1"; this._custom = "0"; }}>${s.pause_1h}</button>
            <button aria-pressed=${String(this._pick === 1)} class=${this._pick === 1 ? "on" : ""}
              @click=${() => { this._pick = 1; this._hours = "0"; this._custom = "1"; }}>${s.pause_1d}</button>
            <button aria-pressed=${String(this._pick === 7)} class=${this._pick === 7 ? "on" : ""}
              @click=${() => { this._pick = 7; this._hours = "0"; this._custom = "7"; }}>${s.pause_7d}</button>
            <div class="custom ${this._pick === "x" ? "" : "muted"}">
              <input type="number" inputmode="numeric" min="0" max=${MAX_PAUSE_DAYS * 24} step="1" aria-label=${s.pause_x_hours}
                .value=${this._hours} @focus=${() => { this._pick = "x"; }}
                @input=${(e: Event) => { this._hours = (e.target as HTMLInputElement).value; this._pick = "x"; }}
                @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter") this._confirm(); }} />
              <span class="unit">${this._singular(Number(this._hours)) ? s.pause_hour_unit : s.pause_hours_unit}</span>
              <input type="number" inputmode="numeric" min="0" max=${MAX_PAUSE_DAYS} step="1" aria-label=${s.pause_x_days}
                .value=${this._custom} @focus=${() => { this._pick = "x"; }}
                @input=${(e: Event) => { this._custom = (e.target as HTMLInputElement).value; this._pick = "x"; }}
                @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter") this._confirm(); }} />
              <span class="unit">${this._singular(Number(this._custom)) ? s.pause_day_unit : s.pause_days_unit}</span>
            </div>
          </div>`}
        <div class="actions">
          <button class="cancel" @click=${() => this._finish(null)}>${s.cancel}</button>
          <button class="go" ?disabled=${this._value() === undefined} @click=${() => this._confirm()}>${s.pause_validate}</button>
        </div>
      </wp-dialog>
    `;
  }

  static styles = css`
    ${tokenStyles}
    .msg { font-size: 1rem; line-height: 1.4; margin: 8px 0 12px; overflow-wrap: anywhere; }
    .label { font-size: 0.875rem; font-weight: 600; color: var(--secondary-text-color); margin: 4px 0 8px; }
    .hint { font-size: 0.875rem; color: var(--secondary-text-color); margin: 12px 0 0; }
    .switch { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .durations { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .label.sub { margin: 16px 0 8px; }
    button {
      min-height: 56px; padding: 0 12px; border-radius: 28px; font: inherit; font-size: 1rem; cursor: pointer;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color);
    }
    button.on { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; font-weight: 600; }
    .custom.muted { opacity: .75; }
    .custom { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; }
    .custom input {
      flex: none; width: 72px; min-height: 56px; box-sizing: border-box; padding: 0 12px; border-radius: 28px; text-align: center;
      font: inherit; font-size: 1.125rem; border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color);
    }
    .custom .unit { font-size: 1rem; margin-right: 8px; }
    .actions { display: grid; grid-template-columns: 1fr 2fr; gap: 12px; margin-top: 20px; }
    button.go { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; font-weight: 600; }
    button.go:disabled { opacity: .4; cursor: default; }
    button:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
  `;
}

export function pauseChoice(host: HTMLElement, message: string): Promise<PauseChoice> {
  return new Promise((resolve) => {
    const el = document.createElement("wp-pause-choice") as WpPauseChoice;
    el.message = message;
    const hass = (host as { hass?: { locale?: { language?: string }; language?: string } }).hass;
    el.lang = hass?.locale?.language ?? hass?.language ?? (document.documentElement.lang || "en");
    el.addEventListener("choice", (ev) => {
      el.remove();
      resolve((ev as CustomEvent<PauseChoice>).detail);
    });
    (host.shadowRoot ?? host).appendChild(el);
  });
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-confirm": WpConfirm;
    "wp-pause-choice": WpPauseChoice;
  }
}
