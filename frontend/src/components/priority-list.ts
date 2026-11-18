// Reorderable list of the programs of one competing group (issue #60): rank, name, the program's other devices.
// Dragging works by the handle only (pointer events, touch friendly); the up/down buttons serve keyboard and screen readers.
// The list never changes the data: it tells the order the person chose (`priority-change`, ids) and the parent saves it.
// `priority-moved` ({ id, text }) carries the sentence for screen readers; a parent with its own live region sets `quiet`.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { displayName } from "./gestures";
import { moveTo, sharedDevices } from "../priority-groups";
import { t } from "../i18n";
import { tokenStyles } from "../styles";
import { langOf } from "../editors/shared";
import type { HomeAssistant, Program } from "../types";

interface Drag { id: string; order: string[]; from: string[] }

@customElement("wp-priority-list")
export class WpPriorityList extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  /** The group, in rank order. */
  @property({ attribute: false }) programs: Program[] = [];
  /** The program being edited, marked in the list. */
  @property() currentId = "";
  @property({ type: Boolean }) disabled = false;
  /** The parent has its own live region: this list writes no announcement. */
  @property({ type: Boolean }) quiet = false;
  /** Ids whose rank is not saved yet (tagged "not saved"). */
  @property({ attribute: false }) unsaved: string[] = [];
  /** Id of a card to highlight for a moment (the one just moved). */
  @property() flashId = "";
  @state() private _drag?: Drag;
  @state() private _said = "";
  private _focus?: { id: string; button: "up" | "down" };
  /** The last announcement comes from this list's own move (the programs change with it). */
  private _own = false;

  private get _lang(): string { return langOf(this.hass); }
  private get _ids(): string[] { return this.programs.map((p) => p.id); }

  private _emit(order: string[], moved: string): void {
    const rank = order.indexOf(moved) + 1;
    const name = this.programs.find((p) => p.id === moved)?.name ?? "";
    const text = t(this._lang, "prio_moved", { name, rank: String(rank), total: String(order.length) });
    this._said = text;
    this._own = true;
    this.dispatchEvent(new CustomEvent("priority-change", { detail: order, bubbles: true, composed: true }));
    this.dispatchEvent(new CustomEvent("priority-moved", { detail: { id: moved, text }, bubbles: true, composed: true }));
  }

  willUpdate(changed: Map<string, unknown>): void {
    // programs replaced from outside (undo, a push): an old announcement no longer describes the list
    if (changed.has("programs") && !this._own) this._said = "";
  }

  private _step(id: string, delta: -1 | 1): void {
    const ids = this._ids;
    const at = ids.indexOf(id);
    const to = at + delta;
    if (this.disabled || to < 0 || to >= ids.length) return;
    this._focus = { id, button: delta < 0 ? "up" : "down" };
    this._emit(moveTo(ids, id, to), id);
  }

  updated(): void {
    this._own = false;
    const target = this._focus;
    if (!target) return;
    this._focus = undefined;
    const row = [...this.renderRoot.querySelectorAll<HTMLElement>(".prow")].find((r) => r.dataset.id === target.id);
    const wanted = row?.querySelector<HTMLButtonElement>(`.${target.button}`);
    // at the end of the list the button is disabled: focus moves to its twin
    (wanted && !wanted.disabled ? wanted : row?.querySelector<HTMLButtonElement>(target.button === "up" ? ".down" : ".up"))?.focus();
  }

  /* ---- drag by the handle ---- */

  private _down(e: PointerEvent, id: string): void {
    if (this.disabled || (e.button !== undefined && e.button > 0)) return;
    e.preventDefault();
    // the list (not the handle) holds the pointer: rows move in the DOM while dragging, a moved handle would lose it
    this.renderRoot.querySelector<HTMLElement>(".plist")?.setPointerCapture?.(e.pointerId);
    this._drag = { id, order: this._ids, from: this._ids };
  }

  private _move(e: PointerEvent): void {
    const drag = this._drag;
    if (!drag) return;
    const middles = [...this.renderRoot.querySelectorAll<HTMLElement>(".prow")]
      .filter((r) => r.dataset.id !== drag.id)
      .map((r) => { const box = r.getBoundingClientRect(); return box.top + box.height / 2; });
    const order = moveTo(drag.order, drag.id, middles.filter((m) => m < e.clientY).length);
    if (order.join() !== drag.order.join()) this._drag = { ...drag, order };
  }

  private _up(): void {
    const drag = this._drag;
    this._drag = undefined;
    if (drag && drag.order.join() !== drag.from.join()) this._emit(drag.order, drag.id);
  }

  private _cancel(): void { this._drag = undefined; }

  private _row(p: Program, index: number, last: number) {
    const lang = this._lang;
    const shared = sharedDevices(this.programs);
    const others = p.entities.filter((e) => !shared.has(e.entity_id)).map((e) => displayName(this.hass!, e.entity_id));
    const dragging = this._drag?.id === p.id;
    return html`<li class="prow ${p.enabled ? "" : "off"} ${dragging ? "dragging" : ""} ${p.id === this.currentId ? "cur" : ""} ${p.id === this.flashId ? "flash" : ""}" data-id=${p.id}>
      <span class="rank" aria-hidden="true">${index + 1}</span>
      <div class="ptxt"><span class="pname"><span class="sr">${t(lang, "prio_rank", { n: String(index + 1) })}</span> ${p.name}</span>
        ${p.id === this.currentId ? html`<span class="psub">${t(lang, "prio_current")}</span>` : nothing}
        ${p.enabled ? nothing : html`<span class="psub">${t(lang, "paused")}</span>`}
        ${this.unsaved.includes(p.id) ? html`<span class="tag">${t(lang, "pe_unsaved")}</span>` : nothing}</div>
      <div class="pctl">
        <button class="up" aria-label=${t(lang, "prio_up", { name: p.name })} ?disabled=${this.disabled || index === 0}
          @click=${() => this._step(p.id, -1)}><ha-icon icon="mdi:arrow-up"></ha-icon></button>
        <button class="down" aria-label=${t(lang, "prio_down", { name: p.name })} ?disabled=${this.disabled || index === last}
          @click=${() => this._step(p.id, 1)}><ha-icon icon="mdi:arrow-down"></ha-icon></button>
        <button class="grip" tabindex="-1" aria-hidden="true" title=${t(lang, "prio_drag")} ?disabled=${this.disabled}
          @pointerdown=${(e: PointerEvent) => this._down(e, p.id)}><ha-icon icon="mdi:drag"></ha-icon></button>
      </div>
      ${others.length ? html`<p class="pdev">${t(lang, "prio_also", { devices: others.join(", ") })}</p>` : nothing}
    </li>`;
  }

  render() {
    const order = this._drag?.order ?? this._ids;
    const shown = order.map((id) => this.programs.find((p) => p.id === id)).filter((p): p is Program => Boolean(p));
    return html`<ol class="plist" @pointermove=${(e: PointerEvent) => this._move(e)} @pointerup=${() => this._up()} @pointercancel=${() => this._cancel()}>
        ${shown.map((p, i) => this._row(p, i, shown.length - 1))}</ol>
      ${this.quiet ? nothing : html`<span class="sr" role="status" aria-live="polite">${this._said}</span>`}`;
  }

  static styles = css`
    ${tokenStyles}
    :host { display: block; }
    ol, ul { list-style: none; margin: 0; padding: 0; }
    .plist { display: flex; flex-direction: column; gap: 8px; }
    .prow { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; align-items: center; gap: 0 8px; padding: 6px 8px; border-radius: 12px; border: 1px solid var(--divider-color); background: var(--card-background-color); }
    .prow.cur { border: 2px solid var(--wp-primary-text); }
    .prow.dragging { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); position: relative; z-index: 1; }
    .prow.flash { animation: wp-flash 1.5s ease-out; }
    @keyframes wp-flash { from { background: var(--secondary-background-color); box-shadow: 0 0 0 2px var(--wp-primary-text); } to { background: var(--card-background-color); box-shadow: 0 0 0 2px transparent; } }
    @media (prefers-reduced-motion: reduce) { .prow.flash { animation: none; background: var(--secondary-background-color); } }
    .prow.off .pname { color: var(--secondary-text-color); }
    .rank { width: 28px; height: 28px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; background: var(--secondary-background-color); }
    .ptxt { min-width: 0; display: flex; flex-direction: column; }
    .pname { font-weight: 600; overflow-wrap: anywhere; }
    .psub, .tag { font-size: 0.8125rem; color: var(--secondary-text-color); }
    .tag { font-style: italic; }
    .pdev { grid-column: 2 / -1; margin: 0 0 2px; font-size: 0.8125rem; color: var(--secondary-text-color); overflow-wrap: anywhere; }
    .pctl { display: flex; }
    .pctl button { width: 48px; height: 48px; border: none; background: none; color: inherit; border-radius: 24px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; --mdc-icon-size: 24px; }
    .pctl button:disabled { opacity: 0.35; cursor: default; }
    .pctl button:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
    .grip { cursor: grab; touch-action: none; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  `;
}

declare global { interface HTMLElementTagNameMap { "wp-priority-list": WpPriorityList } }
