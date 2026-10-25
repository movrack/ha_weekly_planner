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
import { customElement, property } from "lit/decorators.js";
import { strings } from "../i18n";
import "./dialog";

@customElement("wp-confirm")
export class WpConfirm extends LitElement {
  @property() message = "";
  @property({ attribute: "confirm-label" }) confirmLabel = "";
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
          <button class="cancel" @click=${() => this._choose(false)}>${s.cancel}</button>
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

export function confirmAction(host: HTMLElement, message: string, confirmLabel: string): Promise<boolean> {
  return new Promise((resolve) => {
    const el = document.createElement("wp-confirm") as WpConfirm;
    el.message = message;
    el.confirmLabel = confirmLabel;
    const hass = (host as { hass?: { locale?: { language?: string }; language?: string } }).hass;
    el.lang = hass?.locale?.language ?? hass?.language ?? (document.documentElement.lang || "en");
    el.addEventListener("choice", (ev) => {
      el.remove();
      resolve(Boolean((ev as CustomEvent<boolean>).detail));
    });
    (host.shadowRoot ?? host).appendChild(el);
  });
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-confirm": WpConfirm;
  }
}
