// Our own modal (no dependency on Home Assistant's internal ha-dialog, spec § 10.3).
// Full screen on phones, centered card on larger screens; closes on Escape or backdrop.

import { tokenStyles } from "../styles";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { strings } from "../i18n";

/** Open dialogs, oldest first: only the newest one answers Escape. */
const openDialogs: WpDialog[] = [];

/** The focused element, looking through shadow roots. */
function deepActive(): HTMLElement | null {
  let el: Element | null = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el && el !== document.body ? (el as HTMLElement) : null;
}

const FOCUSABLE = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex], [contenteditable="true"]';
const SKIP_TAGS = new Set(["HEAD", "SCRIPT", "STYLE", "LINK", "META", "TEMPLATE"]);

function isFocusable(el: HTMLElement): boolean {
  if (!el.matches(FOCUSABLE) || el.hasAttribute("disabled") || el.hasAttribute("hidden") || el.hasAttribute("inert")) return false;
  const tab = el.getAttribute("tabindex");
  if (tab !== null && Number(tab) < 0) return false;
  return typeof el.checkVisibility === "function" ? el.checkVisibility() : true;
}

/** Tab stops under `root` in document order, looking through shadow roots and slots (the flattened tree). */
export function collectFocusable(root: ParentNode, out: HTMLElement[] = []): HTMLElement[] {
  for (const el of Array.from(root.children) as HTMLElement[]) {
    if (el instanceof HTMLSlotElement) {
      const assigned = el.assignedElements({ flatten: true }) as HTMLElement[];
      for (const a of assigned.length ? assigned : (Array.from(el.children) as HTMLElement[])) {
        if (isFocusable(a)) out.push(a);
        collectFocusable(a.shadowRoot ?? a, out);
      }
      continue;
    }
    if (isFocusable(el)) out.push(el);
    collectFocusable(el.shadowRoot ?? el, out);
  }
  return out;
}

/** What each open dialog made inert (shared count, so stacked dialogs restore correctly). */
const inertState = new Map<Element, { n: number; own: boolean }>();

function inertOthers(from: Element): Element[] {
  const done: Element[] = [];
  const mark = (el: Element) => {
    if (SKIP_TAGS.has(el.tagName)) return;
    const st = inertState.get(el);
    if (st) st.n++;
    else {
      const own = !el.hasAttribute("inert");
      if (own) el.setAttribute("inert", "");
      inertState.set(el, { n: 1, own });
    }
    done.push(el);
  };
  let node: Node | null = from;
  while (node) {
    const slot: HTMLSlotElement | null = (node as Element).assignedSlot ?? null;
    if (slot) {
      for (const sib of slot.assignedElements()) if (sib !== node) mark(sib);
      node = slot;
      continue;
    }
    const parent: Node | null = node.parentNode ?? (node as ShadowRoot).host ?? null;
    if (!parent) break;
    const kids = (parent as ParentNode).children;
    if (kids && node.parentNode) for (const sib of Array.from(kids)) if (sib !== node) mark(sib);
    node = parent === document ? null : parent;
  }
  return done;
}

function restoreInert(list: Element[]): void {
  for (const el of list) {
    const st = inertState.get(el);
    if (!st) continue;
    if (--st.n <= 0) {
      inertState.delete(el);
      if (st.own) el.removeAttribute("inert");
    }
  }
}

@customElement("wp-dialog")
export class WpDialog extends LitElement {
  @property() heading = "";
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) wide = false;
  /** Content-sized on a phone (bottom sheet) instead of full screen: confirmations and choices. */
  @property({ type: Boolean, reflect: true }) compact = false;
  /** Two-column content from 768 px (the schedule screen): a wider panel on tablets and desktops only. */
  @property({ type: Boolean }) columns = false;

  /** "alertdialog" for a destructive confirmation; the others are plain dialogs. */
  @property({ attribute: "dialog-role" }) dialogRole: "dialog" | "alertdialog" = "dialog";
  /** Text that describes the dialog (the message of a confirmation): linked with aria-describedby inside this shadow root. */
  @property() description = "";

  @state() private _expanded = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._onKey);
    this._release();
  }

  private _opener: HTMLElement | null = null;
  private _tracked = false;
  private _inerted: Element[] = [];

  private _track(): void {
    if (this._tracked) return;
    this._tracked = true;
    this._opener = deepActive();
    this._inerted = inertOthers(this);
    openDialogs.push(this);
    document.addEventListener("keydown", this._onDocKey);
  }

  /** Stops listening and gives the focus back to the element that opened the dialog. */
  private _release(): void {
    if (!this._tracked) return;
    this._tracked = false;
    const at = openDialogs.indexOf(this);
    if (at >= 0) openDialogs.splice(at, 1);
    if (!openDialogs.length) document.removeEventListener("keydown", this._onDocKey);
    restoreInert(this._inerted);
    this._inerted = [];
    const opener = this._opener;
    this._opener = null;
    if (opener?.isConnected) {
      opener.focus({ preventScroll: true });
      // the opener may be disabled or re-rendered for a moment (a switch busy while its dialog was open)
      if (deepActive() !== opener) requestAnimationFrame(() => { if (opener.isConnected && !deepActive()) opener.focus({ preventScroll: true }); });
    }
  }

  // Escape still closes when the focus fell back to the page (for example after a row was opened).
  private _onDocKey = (ev: KeyboardEvent) => {
    if (ev.key === "Tab" && !ev.defaultPrevented && openDialogs[openDialogs.length - 1] === this && !ev.composedPath().includes(this)) {
      this._trap(ev);
      return;
    }
    if (ev.key !== "Escape" || ev.defaultPrevented || openDialogs[openDialogs.length - 1] !== this) return;
    ev.stopPropagation();
    this._escape();
  };

  /** Escape: the owner may handle it first (cancelable "escape" event, for example to close an inner editor); else the dialog closes. */
  private _escape(): void {
    const ev = new CustomEvent("escape", { cancelable: true });
    this.dispatchEvent(ev);
    if (!ev.defaultPrevented) this.close();
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

  /** Tab and Shift+Tab stay inside the dialog: wrap at both ends, and come back in when the focus fell out. */
  private _trap(ev: KeyboardEvent): void {
    const panel = this._panel();
    if (!panel) return;
    const list = collectFocusable(panel);
    ev.preventDefault();
    if (!list.length) { panel.focus(); return; }
    const at = list.indexOf(deepActive() as HTMLElement);
    if (ev.shiftKey) list[at <= 0 ? list.length - 1 : at - 1].focus();
    else list[at < 0 || at === list.length - 1 ? 0 : at + 1].focus();
  }

  /** The first control of the content (no text field on a phone: it would raise the keyboard), else the dialog itself. */
  private _focusFirst(): void {
    const panel = this._panel();
    if (!panel) return;
    const content = panel.querySelector<HTMLElement>(".content");
    const first = content ? collectFocusable(content).find((el) => !(this._isPhone() && el.matches('input:not([type="checkbox"]):not([type="radio"]), textarea'))) : undefined;
    (first ?? panel).focus();
  }

  private _onKey = (ev: KeyboardEvent) => {
    if (ev.key === "Tab" && !ev.defaultPrevented && openDialogs[openDialogs.length - 1] === this) {
      this._trap(ev);
      return;
    }
    if (ev.key === "Escape") {
      ev.stopPropagation();
      this._escape();
    }
  };

  updated(changed: Map<string, unknown>): void {
    if (!changed.has("open")) return;
    if (this.open) {
      this._track();
      requestAnimationFrame(() => { if (this.open) this._focusFirst(); });
    } else this._release();
  }

  close(): void {
    this.open = false;
    this._release();
    this.dispatchEvent(new CustomEvent("closed", { bubbles: true, composed: true }));
  }

  render() {
    if (!this.open) return html``;
    return html`
      <div class="backdrop" @click=${() => this.close()}></div>
      <div class="panel ${this._expanded ? "expanded" : this.wide ? "wide" : this.columns ? "columns" : ""}" role=${this.dialogRole} aria-modal="true"
        aria-label=${this.heading} aria-describedby=${this.description ? "wp-desc" : nothing} tabindex="-1">
        ${this.description ? html`<span id="wp-desc" class="sr-only">${this.description}</span>` : nothing}
        <header @pointerdown=${this._hdown} @pointermove=${this._hmove} @pointerup=${this._hup}
          @pointercancel=${this._hcancel}>
          <slot name="header-start"></slot>
          <h2>${this.heading}</h2>
          <slot name="header-actions"></slot>
          <button class="icon" @click=${() => this.close()} aria-label=${document.documentElement.lang?.startsWith("fr") ? "Fermer" : "Close"}><ha-icon icon="mdi:close"></ha-icon></button>
        </header>
        <div class="content"><slot></slot></div>
        <footer><slot name="footer"></slot></footer>
        <button class="expand" aria-expanded=${this._expanded} aria-label=${strings(document.documentElement.lang || "en").expand_dialog}
          title=${strings(document.documentElement.lang || "en").expand_dialog}
          @click=${() => { this._expanded = !this._expanded; }}><ha-icon icon=${this._expanded ? "mdi:arrow-collapse-horizontal" : "mdi:arrow-expand-horizontal"}></ha-icon></button>
      </div>
    `;
  }

  static styles = css`
    ${tokenStyles}
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
    @media (min-width: 768px) { .panel.columns { width: min(960px, calc(100vw - 32px)); } }
    .panel.expanded { width: min(1400px, calc(100vw - 32px)); }
    .expand {
      position: absolute; top: 16px; right: 68px; width: 48px; height: 48px; border: none; background: none; color: inherit;
      --mdc-icon-size: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 24px; cursor: pointer;
    }
    .expand:hover { background: var(--secondary-background-color); }
    .expand:focus-visible, button.icon:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    h2 { padding-right: 52px; }
    header { display: flex; align-items: center; gap: 12px; padding: 16px 16px 8px 20px; }
    header { touch-action: none; }
    h2 {
      flex: 1; min-width: 0; margin: 0; font-size: 1.25rem; font-weight: 500;
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
      h2 { font-size: 1.125rem; padding-right: 0; }
      .expand { display: none; }
      .panel, .panel.wide, .panel.expanded {
        left: 0; top: 0; transform: none; width: 100vw; height: 100vh; max-height: none; border-radius: 0;
      }
      /* confirmation / choice: content-sized bottom sheet over the backdrop instead of a full screen */
      :host([compact]) .panel, :host([compact]) .panel.wide, :host([compact]) .panel.expanded {
        left: 0; right: 0; top: auto; bottom: 0; width: 100%; height: auto; max-height: 90vh; max-height: 90dvh;
        border-radius: var(--ha-card-border-radius, 16px) var(--ha-card-border-radius, 16px) 0 0;
      }
    }
  `;
}
