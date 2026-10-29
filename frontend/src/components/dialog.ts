// Our own modal (no dependency on Home Assistant's internal ha-dialog, spec § 10.3).
// Full screen on phones, centered card on larger screens; closes on Escape or backdrop.

import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("wp-dialog")
export class WpDialog extends LitElement {
  @property() heading = "";
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) wide = false;

  @state() private _expanded = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._onKey);
  }

  // Swipe down from the header closes the dialog on phones (button equivalent: the close button).
  private _sw?: { id: number; y: number; x: number; dy: number };

  private _isPhone(): boolean {
    return typeof matchMedia === "function" && matchMedia("(max-width: 600px)").matches;
  }

  private _panel(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(".panel");
  }

  private _hdown(ev: PointerEvent): void {
    if (!this._isPhone() || ev.pointerType === "mouse") return;
    if (ev.composedPath().some((n) => n instanceof HTMLElement && n.tagName === "BUTTON")) return;
    this._sw = { id: ev.pointerId, y: ev.clientY, x: ev.clientX, dy: 0 };
    (ev.currentTarget as HTMLElement).setPointerCapture?.(ev.pointerId);
  }

  private _hmove(ev: PointerEvent): void {
    const sw = this._sw;
    if (!sw || ev.pointerId !== sw.id) return;
    sw.dy = Math.max(0, ev.clientY - sw.y);
    const panel = this._panel();
    if (panel) {
      panel.style.transition = "none";
      panel.style.transform = `translateY(${sw.dy}px)`;
    }
  }

  private _hup(ev: PointerEvent): void {
    const sw = this._sw;
    if (!sw || ev.pointerId !== sw.id) return;
    this._sw = undefined;
    const panel = this._panel();
    const dx = Math.abs(ev.clientX - sw.x);
    if (panel) {
      panel.style.transition = "";
      panel.style.transform = "";
    }
    if (sw.dy >= 100 && dx < sw.dy) this.close();
  }

  private _hcancel(): void {
    this._sw = undefined;
    const panel = this._panel();
    if (panel) {
      panel.style.transition = "";
      panel.style.transform = "";
    }
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
      <div class="panel ${this._expanded ? "expanded" : this.wide ? "wide" : ""}" role="dialog" aria-modal="true"
        aria-label=${this.heading} tabindex="-1">
        <header @pointerdown=${this._hdown} @pointermove=${this._hmove} @pointerup=${this._hup}
          @pointercancel=${this._hcancel}>
          <slot name="header-start"></slot>
          <h2><button class="heading" aria-expanded=${this._expanded}
            title=${document.documentElement.lang?.startsWith("fr") ? "Agrandir / réduire" : "Expand / reduce"}
            @click=${() => { this._expanded = !this._expanded; }}>${this.heading}</button></h2>
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
    .panel.expanded { width: min(1400px, calc(100vw - 32px)); }
    .heading { display: block; width: 100%; min-height: 44px; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: inherit; color: inherit; border: 0; background: none; cursor: pointer; }
    header { display: flex; align-items: center; gap: 12px; padding: 16px 16px 8px 20px; }
    header { touch-action: none; }
    h2 {
      flex: 1; min-width: 0; margin: 0; font-size: 20px; font-weight: 500;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .content { padding: 8px 20px 16px; overflow-y: auto; }
    footer { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; padding: 8px 20px 20px; }
    footer:empty { display: none; }
    button.icon {
      border: none; background: none; color: inherit; --mdc-icon-size: 24px; width: 48px; height: 48px;
      display: inline-flex; align-items: center; justify-content: center; border-radius: 24px; cursor: pointer;
    }
    button.icon:hover { background: var(--secondary-background-color); }
    @media (max-width: 600px) {
      h2 { font-size: 18px; }
      .panel, .panel.wide, .panel.expanded {
        left: 0; top: 0; transform: none; width: 100vw; height: 100vh; max-height: none; border-radius: 0;
      }
    }
  `;
}
