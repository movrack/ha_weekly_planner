// "Weekly Planner" sidebar panel (administrators): the programs are managed here, the card only displays them.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import "./editors/program-editor";
import "./components/priority-list";
import { competition, sharedDevices } from "./priority-groups";
import { displayName } from "./components/gestures";
import { subscribePlanner } from "./planner";
import { t } from "./i18n";
import { setTimeFormat } from "./time";
import { tokenStyles } from "./styles";
import { langOf } from "./editors/shared";
import type { HomeAssistant, PlannerData, Program } from "./types";

/** What the panel shows next to the list: nothing, a program, or the form of a program being created. */
export type PanelSelection = string | null;

@customElement("wp-programs-panel")
export class WpProgramsPanel extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: Boolean }) narrow = false;
  @state() _data?: PlannerData;
  @state() _selected: PanelSelection = null;
  /** What just happened, shown above the list after a save or a delete. */
  @state() _notice = "";
  /** The list and editor, or the screen that orders the competing programs (#60). */
  @state() _screen: "programs" | "priorities" = "programs";
  /** Previous order of the group just changed (the "Order saved · Undo" banner), and the message of a refused order. */
  @state() _undo?: string[];
  @state() _orderError = "";
  /** The permanent live region (screen readers) and the card just moved (highlighted for a moment). */
  @state() _said = "";
  @state() _flash = "";
  private _flashTimer?: ReturnType<typeof setTimeout>;
  private _unsub?: () => void;

  get _lang(): string { return langOf(this.hass); }
  get _isAdmin(): boolean { return Boolean(this.hass?.user?.is_admin); }
  get _canManage(): boolean { return this._isAdmin && Boolean(this._data?.can_edit) && !this._data?.read_only; }

  willUpdate(): void {
    setTimeFormat(this.hass);
  }

  updated(): void {
    if (this.isConnected && this.hass && !this._unsub) this._unsub = subscribePlanner(this.hass, (data) => { this._data = data; });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsub?.();
    this._unsub = undefined;
    clearTimeout(this._flashTimer);
    this._clearUndo();
  }

  _clearUndo(): void { this._undo = undefined; }

  /** Moves the focus once the next render is done. */
  _focusAfterRender(selector: string): void {
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>(selector)?.focus());
  }

  _openPriorities(): void {
    this._screen = "priorities"; this._selected = null; this._notice = "";
    this._focusAfterRender(".prio h2");
  }

  _leavePriorities(): void {
    this._screen = "programs"; this._orderError = ""; this._said = ""; this._flash = ""; this._clearUndo();
    this._focusAfterRender(".prio-open");
  }

  /** Saves the order of one group at once; shows it at once and puts it back when the server refuses. */
  async _saveOrder(ids: string[], undoTo?: string[]): Promise<void> {
    const data = this._data;
    if (!data || !this.hass) return;
    const before = data.programs;
    this._orderError = "";
    this._data = { ...data, programs: before.map((p) => (ids.includes(p.id) ? { ...p, priority: ids.indexOf(p.id) + 1 } : p)) };
    try {
      const result = await this.hass.callWS<{ programs: { id: string; revision: number; priority: number }[] }>({
        type: "weekly_planner/program/priorities",
        order: ids.map((id) => ({ id, revision: before.find((p) => p.id === id)?.revision ?? 0 })),
      });
      const done = new Map(result.programs.map((p) => [p.id, p]));
      if (this._data) this._data = { ...this._data, programs: this._data.programs.map((p) => (done.has(p.id) ? { ...p, ...done.get(p.id) } : p)) };
      // the banner stays until the next move, the end of this screen or its own button
      this._undo = undoTo;
    } catch (err) {
      if (this._data) this._data = { ...this._data, programs: before };
      this._clearUndo();
      this._said = "";
      this._orderError = t(this._lang, (err as { code?: string })?.code === "conflict" ? "prio_conflict" : "prio_error");
    }
  }

  _reorder(group: Program[], e: CustomEvent<string[]>): void {
    e.stopPropagation();
    void this._saveOrder(e.detail, group.map((p) => p.id));
  }

  /** The list tells which card moved: say it in the live region and highlight the card for a moment. */
  _moved(e: CustomEvent<{ id: string; text: string }>): void {
    e.stopPropagation();
    this._said = e.detail.text;
    this._flash = e.detail.id;
    clearTimeout(this._flashTimer);
    this._flashTimer = setTimeout(() => { this._flash = ""; }, 1500);
  }

  async _undoOrder(): Promise<void> {
    const previous = this._undo;
    if (!previous) return;
    await this._saveOrder(previous);
    if (!this._orderError) this._said = t(this._lang, "prio_restored");
    // the banner is gone: the focus goes to the heading of the group
    this._focusAfterRender(`.prio h3[data-members~="${previous[0]}"]`);
  }

  _priorities(data: PlannerData) {
    const lang = this._lang;
    const { groups, alone } = competition(data.programs);
    const hass = this.hass!;
    const names = (ids: Iterable<string>) => [...ids].map((id) => displayName(hass, id)).join(", ");
    return html`<section class="prio">
      <h2 class="sr" tabindex="-1">${t(lang, "prio_title")}</h2>
      <p class="hint">${t(lang, groups.length ? "prio_intro" : "prio_none")}</p>
      ${this._orderError ? html`<p class="notice" role="alert">${this._orderError}</p>` : nothing}
      ${groups.map((group) => html`<div class="block"><h3 tabindex="-1" data-members=${group.map((p) => p.id).join(" ")}>${names(sharedDevices(group))}</h3>
        <wp-priority-list .hass=${this.hass} .programs=${group} quiet .flashId=${this._flash}
          @priority-change=${(e: CustomEvent<string[]>) => this._reorder(group, e)}
          @priority-moved=${(e: CustomEvent<{ id: string; text: string }>) => this._moved(e)}></wp-priority-list></div>`)}
      ${alone.length ? html`<div class="block"><h3>${t(lang, "prio_alone")}</h3>
        <ul class="alone">${alone.map((p) => html`<li class=${p.enabled ? "" : "off"}><span class="name">${p.name}</span>
          <span class="sub">${names(p.entities.map((e) => e.entity_id))}</span></li>`)}</ul></div>` : nothing}
      ${this._undo ? html`<div class="undo-bar"><span>${t(lang, "prio_saved")}</span>
        <button class="link" aria-label=${t(lang, "prio_undo_label")} @click=${() => void this._undoOrder()}><ha-icon icon="mdi:undo"></ha-icon>${t(lang, "prio_undo")}</button></div>` : nothing}
      <div class="done-row"><button class="done" @click=${() => this._leavePriorities()}>${t(lang, "prio_done")}</button></div>
    </section>`;
  }

  _open(id: string): void { this._selected = id; this._notice = ""; }
  _back(): void { this._selected = null; this._notice = ""; }

  /** A saved program is known at once (the next push may not include it yet); the panel goes back to the list. */
  _saved(e: CustomEvent<Program>): void {
    e.stopPropagation();
    const program = e.detail;
    if (this._data) this._data = { ...this._data, programs: [...this._data.programs.filter((p) => p.id !== program.id), program] };
    this._selected = null;
    this._notice = t(this._lang, "panel_saved", { name: program.name });
  }

  _deleted(e: CustomEvent<string>): void {
    e.stopPropagation();
    const name = this._data?.programs.find((p) => p.id === e.detail)?.name ?? "";
    if (this._data) this._data = { ...this._data, programs: this._data.programs.filter((p) => p.id !== e.detail) };
    this._selected = null;
    this._notice = name ? t(this._lang, "panel_deleted", { name }) : "";
  }

  _list(programs: Program[]) {
    const lang = this._lang;
    return html`<nav class="list" aria-label=${t(lang, "panel_title")}>
      <button class="row prio-open" @click=${() => this._openPriorities()}>
        <ha-icon icon="mdi:swap-vertical"></ha-icon><span class="txt"><span class="name">${t(lang, "prio_button")}</span>
          <span class="sub">${t(lang, "prio_button_sub")}</span></span>
      </button>
      ${programs.map((p) => html`<button class="row ${this._selected === p.id ? "on" : ""} ${p.enabled ? "" : "off"}" aria-current=${this._selected === p.id ? "true" : "false"}
        @click=${() => this._open(p.id)}>
        <ha-icon icon=${p.icon ?? "mdi:calendar-clock"}></ha-icon>
        <span class="txt"><span class="name">${p.name}</span>
          <span class="sub">${t(lang, p.entities.length === 0 ? "panel_devices_none" : p.entities.length === 1 ? "panel_devices_one" : "panel_devices", { n: String(p.entities.length) })}${p.enabled ? "" : ` · ${t(lang, "paused")}`}</span></span>
      </button>`)}
      ${programs.length ? nothing : html`<p class="empty" role="status">${t(lang, "no_program")}</p>`}
      <button class="row new ${this._selected === "new" ? "on" : ""}" @click=${() => this._open("new")}>
        <ha-icon icon="mdi:plus"></ha-icon><span class="txt"><span class="name">${t(lang, "new_program")}</span></span>
      </button>
    </nav>`;
  }

  _editor(data: PlannerData) {
    const selected = this._selected;
    if (selected === null) return html`<p class="hint">${t(this._lang, "panel_select")}</p>`;
    const program = selected === "new" ? undefined : data.programs.find((p) => p.id === selected);
    if (selected !== "new" && !program) return html`<p class="hint">${t(this._lang, "panel_select")}</p>`;
    return keyed(selected, html`<wp-program-editor embedded .hass=${this.hass} .data=${data} .program=${program}
      @program-saved=${(e: CustomEvent<Program>) => this._saved(e)}
      @program-deleted=${(e: CustomEvent<string>) => this._deleted(e)}></wp-program-editor>`);
  }

  render() {
    if (!this.hass) return nothing;
    const lang = this._lang;
    const data = this._data;
    // narrow screens: the list, then the editor in its place (with a way back)
    const showList = !this.narrow || this._selected === null;
    const showEditor = !this.narrow || this._selected !== null;
    return html`<header>
        ${this.narrow ? html`<ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>` : nothing}
        ${this._screen === "priorities" || (this.narrow && this._selected !== null)
          ? html`<button class="back" aria-label=${t(lang, "panel_back")} title=${t(lang, "panel_back")} @click=${() => (this._screen === "priorities" ? this._leavePriorities() : this._back())}><ha-icon icon="mdi:arrow-left"></ha-icon></button>`
          : nothing}
        <h1>${t(lang, this._screen === "priorities" ? "prio_title" : "panel_title")}</h1>
      </header>
      <span class="sr" role="status" aria-live="polite">${this._said}</span>
      ${!this._isAdmin ? html`<p class="hint" role="alert">${t(lang, "panel_admin_only")}</p>`
        : !data ? html`<p class="hint">…</p>`
        : !this._canManage ? html`<p class="hint" role="status">${t(lang, "read_only")}</p>`
        : html`${this._notice ? html`<p class="notice" role="status">${this._notice}</p>` : nothing}
          ${this._screen === "priorities" ? html`<main class="narrow">${this._priorities(data)}</main>`
            : html`<main class=${this.narrow ? "narrow" : ""}>
              ${showList ? this._list(data.programs) : nothing}
              ${showEditor ? html`<section class="edit">${this._editor(data)}</section>` : nothing}
            </main>`}`}`;
  }

  static styles = css`
    ${tokenStyles}
    :host { display: block; min-height: 100%; background: var(--primary-background-color); color: var(--primary-text-color); }
    header { display: flex; align-items: center; gap: 8px; min-height: 56px; padding: 0 16px; background: var(--app-header-background-color, var(--card-background-color)); border-bottom: 1px solid var(--divider-color); box-sizing: border-box; }
    h1 { margin: 0; font-size: 1.25rem; font-weight: 500; }
    button.back { width: 48px; height: 48px; border: none; background: none; color: inherit; border-radius: 24px; cursor: pointer; --mdc-icon-size: 24px; display: inline-flex; align-items: center; justify-content: center; }
    main { display: grid; grid-template-columns: minmax(240px, 320px) minmax(0, 1fr); gap: 16px; padding: 16px; max-width: 1200px; margin: 0 auto; box-sizing: border-box; }
    main.narrow { grid-template-columns: minmax(0, 1fr); }
    .list { display: flex; flex-direction: column; gap: 8px; align-self: start; }
    .row { display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 12px; border-radius: 12px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: inherit; font: inherit; text-align: left; cursor: pointer; --mdc-icon-size: 24px; }
    .row.on { border: 2px solid var(--wp-primary-text); }
    .row.off .name { color: var(--secondary-text-color); }
    .row.new { border-style: dashed; color: var(--wp-primary-text); }
    .row:focus-visible, button.back:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
    .txt { display: flex; flex-direction: column; min-width: 0; }
    .name { font-weight: 600; overflow-wrap: anywhere; }
    .sub { font-size: 0.8125rem; color: var(--secondary-text-color); }
    .edit { min-width: 0; padding: 16px; border-radius: 12px; background: var(--card-background-color); border: 1px solid var(--divider-color); }
    .notice { margin: 16px 16px 0; padding: 8px 12px; border-radius: 10px; background: var(--secondary-background-color); border: 1px solid var(--divider-color); max-width: 1168px; box-sizing: border-box; }
    .row.prio-open { color: var(--wp-primary-text); }
    .prio h2 { margin: 0 0 4px; font-size: 1.125rem; font-weight: 500; }
    .prio h3 { margin: 0 0 8px; font-size: 0.9375rem; font-weight: 600; overflow-wrap: anywhere; }
    .prio .hint { margin: 0 0 12px; }
    .block { margin: 0 0 16px; padding: 12px; border-radius: 12px; background: var(--secondary-background-color); }
    .alone { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    .alone li { display: flex; flex-direction: column; padding: 8px 12px; border-radius: 12px; border: 1px solid var(--divider-color); background: var(--card-background-color); }
    .alone li.off .name { color: var(--secondary-text-color); }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    .undo-bar { position: sticky; bottom: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 4px 12px calc(12px + env(safe-area-inset-bottom, 0px)); margin-bottom: 8px; border-radius: 12px; background: var(--card-background-color); border: 1px solid var(--divider-color); box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15); }
    .link:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; border-radius: 8px; }
    .prio .notice { margin: 0 0 12px; display: flex; align-items: center; gap: 8px; max-width: none; }
    .done-row { display: flex; justify-content: flex-end; padding: 8px 0 16px; }
    .done { min-height: 48px; padding: 0 24px; border: none; border-radius: 24px; background: var(--primary-color); color: var(--text-primary-color, #fff); font: inherit; font-weight: 500; cursor: pointer; }
    .link { display: inline-flex; align-items: center; gap: 4px; min-height: 48px; padding: 0 8px; border: none; background: none; color: var(--wp-primary-text); font: inherit; cursor: pointer; --mdc-icon-size: 20px; }
    .hint, .empty { margin: 16px; color: var(--secondary-text-color); }
  `;
}

declare global { interface HTMLElementTagNameMap { "wp-programs-panel": WpProgramsPanel } }
