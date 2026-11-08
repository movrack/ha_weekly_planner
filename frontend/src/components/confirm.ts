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
      <wp-dialog open heading=${s.cf_title} @closed=${this._closed}>
        <p class="msg">${this.message}</p>
        <div slot="footer" class="foot">
          <button class="danger" @click=${() => this._choose(true)}>${this.confirmLabel}</button>
          <button class="cancel" @click=${() => this._choose(false)}>${this.cancelLabel || s.cancel}</button>
        </div>
      </wp-dialog>
    `;
  }

  static styles = css`
    .msg { font-size: 16px; line-height: 1.4; margin: 8px 0 16px; }
    .foot { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 24px; }
    button {
      min-height: 48px; padding: 0 20px; border-radius: 24px; font: inherit; font-size: 16px; cursor: pointer;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
    }
    button.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
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

/** Pause length choice: big buttons for 1 day, 7 days, a number of days of your own, or no limit. */
export type PauseChoice = number | "none" | null;
const MAX_PAUSE_DAYS = 365;

@customElement("wp-pause-choice")
export class WpPauseChoice extends LitElement {
  @property() message = "";
  @property() lang = document.documentElement.lang || "en";

  private _result: PauseChoice = null;
  @state() private _custom = "3";

  private _choose(value: PauseChoice): void {
    this._result = value;
    this.renderRoot.querySelector<HTMLElement & { close(): void }>("wp-dialog")?.close();
  }

  private _closed = (ev: Event): void => {
    ev.stopPropagation();
    this.dispatchEvent(new CustomEvent("choice", { detail: this._result }));
  };

  private _customDays(): number | null {
    const n = Number(this._custom);
    return Number.isInteger(n) && n >= 1 && n <= MAX_PAUSE_DAYS ? n : null;
  }

  render() {
    const s = strings(this.lang);
    const custom = this._customDays();
    return html`
      <wp-dialog open heading=${s.pause_for} @closed=${this._closed}>
        <p class="msg">${this.message}</p>
        <div class="choices">
          <button class="choice" @click=${() => this._choose(1)}>${s.pause_1d}</button>
          <button class="choice" @click=${() => this._choose(7)}>${s.pause_7d}</button>
          <div class="custom">
            <input type="number" inputmode="numeric" min="1" max=${MAX_PAUSE_DAYS} step="1" aria-label=${s.pause_x_days}
              .value=${this._custom} @input=${(e: Event) => { this._custom = (e.target as HTMLInputElement).value; }}
              @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter" && custom) this._choose(custom); }} />
            <span class="unit">${s.pause_days_unit}</span>
            <button class="choice go" ?disabled=${custom === null} @click=${() => custom && this._choose(custom)}>${s.pause_go}</button>
          </div>
          <button class="choice open" @click=${() => this._choose("none")}>${s.pause_none}</button>
        </div>
        <div slot="footer" class="foot">
          <button class="cancel" @click=${() => this._choose(null)}>${s.cancel}</button>
        </div>
      </wp-dialog>
    `;
  }

  static styles = css`
    .msg { font-size: 16px; line-height: 1.4; margin: 8px 0 12px; overflow-wrap: anywhere; }
    .choices { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .foot { display: flex; width: 100%; justify-content: flex-end; }
    button {
      min-height: 56px; padding: 0 12px; border-radius: 28px; font: inherit; font-size: 16px; cursor: pointer;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
    }
    button.choice { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600; }
    .custom { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; }
    .custom input {
      flex: none; width: 88px; min-height: 56px; box-sizing: border-box; padding: 0 12px; border-radius: 28px; text-align: center;
      font: inherit; font-size: 18px; border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
    }
    .custom .unit { flex: 1; font-size: 16px; }
    .custom button.go { flex: none; min-width: 96px; }
    button.choice:disabled { opacity: .4; cursor: default; }
    button.choice.open { grid-column: 1 / -1; background: none; color: var(--primary-text-color); border-color: var(--primary-color); }
    .foot button { min-height: 48px; padding: 0 20px; border-radius: 24px; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
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
