// Our own modal (no dependency on Home Assistant's internal ha-dialog, spec § 10.3).
// Full screen on phones, centered card on larger screens; closes on Escape or backdrop.

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("wp-dialog")
export class WpDialog extends LitElement {
  @property() heading = "";
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) wide = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._onKey);
  }

  private _onKey = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") {
      ev.stopPropagation();
      this.close();
    }
  };

  updated(changed: Map<string, unknown>): void {
    if (changed.has("open") && this.open) {
      requestAnimationFrame(() => this.renderRoot.querySelector<HTMLElement>(".panel")?.focus());
    }
  }

  close(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent("closed", { bubbles: true, composed: true }));
  }

  render() {
    if (!this.open) return html``;
    return html`
      <div class="backdrop" @click=${() => this.close()}></div>
      <div class="panel ${this.wide ? "wide" : ""}" role="dialog" aria-modal="true"
        aria-label=${this.heading} tabindex="-1">
        <header>
          <slot name="header-start"></slot>
          <h2>${this.heading}</h2>
          <slot name="header-actions"></slot>
          <button class="icon" @click=${() => this.close()} aria-label=${document.documentElement.lang?.startsWith("fr") ? "Fermer" : "Close"}><ha-icon icon="mdi:close"></ha-icon></button>
        </header>
        <div class="content"><slot></slot></div>
        <footer><slot name="footer"></slot></footer>
      </div>
    `;
  }

  static styles = css`
    :host { position: fixed; inset: 0; z-index: 9; pointer-events: none; }
    :host([open]) { pointer-events: auto; }
    .backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.45); }
    .panel {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: min(560px, calc(100vw - 32px)); max-height: calc(100vh - 64px);
      display: flex; flex-direction: column; outline: none;
      background: var(--card-background-color, #fff); color: var(--primary-text-color);
      border-radius: var(--ha-card-border-radius, 16px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }
    .panel.wide { width: min(880px, calc(100vw - 32px)); }
    header { display: flex; align-items: center; gap: 8px; padding: 16px 16px 8px 20px; }
    h2 { flex: 1; margin: 0; font-size: 20px; font-weight: 500; }
    .content { padding: 8px 20px 16px; overflow-y: auto; }
    footer { display: flex; justify-content: flex-end; gap: 8px; padding: 8px 16px 16px; }
    footer:empty { display: none; }
    button.icon {
      border: none; background: none; color: inherit; --mdc-icon-size: 24px; width: 48px; height: 48px;
      display: inline-flex; align-items: center; justify-content: center; border-radius: 24px; cursor: pointer;
    }
    button.icon:hover { background: var(--secondary-background-color); }
    @media (max-width: 600px) {
      .panel, .panel.wide {
        left: 0; top: 0; transform: none; width: 100vw; height: 100vh; max-height: none; border-radius: 0;
      }
    }
  `;
}
