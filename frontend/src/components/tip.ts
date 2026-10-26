// A small tooltip for an icon: shown on mouse hover and keyboard focus, and for about 2 s after a tap. The hit
// target is at least 32 px; pointer events stop here so a tap neither enters bar editing nor selects a slot.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

const SHOWN_MS = 2000;

@customElement("wp-tip")
export class WpTip extends LitElement {
  /** The text of the tooltip, also its accessible name. */
  @property() text = "";
  /** Does not catch the pointer (the handles below the icon have priority); keyboard and the bubble stay. */
  @property({ type: Boolean }) passive = false;
  @state() private _show = false;
  @state() private _shift = 0;
  private _timer?: ReturnType<typeof setTimeout>;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this._timer);
  }

  private _on(): void {
    this._show = true;
  }

  private _off(): void {
    clearTimeout(this._timer);
    this._show = false;
  }

  private _down(e: PointerEvent): void {
    e.stopPropagation();
    if (e.pointerType === "mouse") return;
    this._on();
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._off(), SHOWN_MS);
  }

  /** Keeps the bubble inside the window. */
  protected updated(): void {
    if (!this._show) {
      if (this._shift) this._shift = 0;
      return;
    }
    const bubble = this.renderRoot.querySelector<HTMLElement>(".bubble");
    if (!bubble) return;
    const rect = bubble.getBoundingClientRect();
    const natural = rect.left - this._shift;
    const right = rect.right - this._shift;
    const shift = natural < 4 ? 4 - natural : right > window.innerWidth - 4 ? window.innerWidth - 4 - right : 0;
    if (Math.abs(shift - this._shift) > 0.5) this._shift = shift;
  }

  render() {
    return html`<span class="hit" part="hit" tabindex="0" role="img" aria-label=${this.text}
        @pointerenter=${(e: PointerEvent) => { if (e.pointerType === "mouse") this._on(); }}
        @pointerleave=${(e: PointerEvent) => { if (e.pointerType === "mouse") this._off(); }}
        @focus=${() => this._on()} @blur=${() => this._off()}
        @pointerdown=${(e: PointerEvent) => this._down(e)}
        @pointerup=${(e: Event) => e.stopPropagation()}
        @click=${(e: Event) => e.stopPropagation()}
        @contextmenu=${(e: Event) => e.preventDefault()}
        @keydown=${(e: KeyboardEvent) => { if (e.key === "Escape") this._off(); }}>
        <slot></slot></span>
      ${this._show && this.text ? html`<span class="bubble" role="tooltip" style="--shift:${this._shift}px">${this.text}</span>` : nothing}`;
  }

  static styles = css`
    :host { display: inline-flex; position: relative; pointer-events: auto; }
    :host([passive]) { pointer-events: none; }
    .hit {
      min-width: 32px; min-height: 32px; display: inline-flex; align-items: center; justify-content: center;
      outline: none; border-radius: 16px; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
    }
    .hit:focus-visible { outline: 2px solid var(--primary-color); }
    .bubble {
      position: absolute; bottom: calc(100% + 2px); left: 50%; transform: translateX(calc(-50% + var(--shift, 0px)));
      z-index: 10; padding: 4px 8px; border-radius: 6px; white-space: nowrap; pointer-events: none;
      background: var(--primary-text-color); color: var(--card-background-color, #fff); font-size: 12px; font-weight: 500;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-tip": WpTip;
  }
}
