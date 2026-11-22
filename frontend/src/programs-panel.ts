// "Weekly Planner" sidebar panel (open to everyone): the programs are managed here, the card only displays them.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import "./editors/program-editor";
import "./components/priority-list";
import "./components/overview";
import { competition, sharedDevices } from "./priority-groups";
import { displayName } from "./components/gestures";
import { subscribePlanner } from "./planner";
import { copyName, copyProgram } from "./program-copy";
import { NO_ROOM, emptyView, facets, filterCount, sortPrograms, viewPrograms } from "./program-list";
import type { ListView, ProgramSort } from "./program-list";
import { domainOf, typeName } from "./type-names";
import type { TypeNames } from "./type-names";
import { errorText, t } from "./i18n";
import { setTimeFormat } from "./time";
import { collapse, tokenStyles } from "./styles";
import { ariaDisabled, describedBy, whyNote, whyStyles } from "./reason";
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
  @state() _screen: "programs" | "priorities" | "duplicate" = "programs";
  /** Narrow screens: the list column shows the programs or the overview (the card as a compact list); the actions stay. */
  @state() _listMode: "list" | "overview" = "list";
  /** Duplicate screen: the program chosen to copy, a copy in progress, and its error. */
  @state() _dupId = "";
  @state() _dupBusy = false;
  @state() _dupError = "";
  /** The list: sort and filters, the window that sets them, and the device type names once loaded. */
  @state() _view: ListView = emptyView();
  /** Which window is open: the sort or the filters (two separate buttons). */
  @state() _dialog: "" | "sort" | "filter" = "";
  /** The open section of the filter window: an accordion, so opening one closes the others. */
  @state() _facet: "" | "types" | "rooms" | "devices" = "";
  @state() _typeNames?: TypeNames;
  private _typeKey = "";
  /** Previous order of the group just changed (the "Order saved · Undo" banner), and the message of a refused order. */
  @state() _undo?: string[];
  @state() _orderError = "";
  /** The permanent live region (screen readers) and the card just moved (highlighted for a moment). */
  @state() _said = "";
  @state() _flash = "";
  private _flashTimer?: ReturnType<typeof setTimeout>;
  private _unsub?: () => void;

  get _lang(): string { return langOf(this.hass); }
  get _canManage(): boolean { return Boolean(this._data?.can_edit) && !this._data?.read_only; }

  willUpdate(): void {
    setTimeFormat(this.hass);
  }

  updated(): void {
    if (this.isConnected && this.hass && !this._unsub) this._unsub = subscribePlanner(this.hass, (data) => { this._data = data; });
    this._loadTypeNames();
  }

  /** The names of the device types ("Volet") for the Type filter, loaded once per set of domains. */
  _loadTypeNames(): void {
    const domains = [...new Set((this._data?.programs ?? []).flatMap((p) => p.entities.map((e) => domainOf(e.entity_id))))].sort();
    const key = domains.join(",");
    if (!this.hass?.loadBackendTranslation || !domains.length || key === this._typeKey) return;
    this._typeKey = key;
    void this.hass.loadBackendTranslation("title", domains).then((localize) => {
      if (key === this._typeKey) this._typeNames = localize;
    }).catch(() => { if (key === this._typeKey) this._typeKey = ""; });
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

  _openSort(): void { this._dialog = "sort"; }
  _openFilter(): void { this._dialog = "filter"; this._facet = ""; }
  _toggleFacet(kind: "types" | "rooms" | "devices"): void { this._facet = this._facet === kind ? "" : kind; }

  /** Closes the window through the dialog itself (it frees the page behind it); the focus goes back to its button. */
  _closeDialog(): void {
    const dialog = this.renderRoot?.querySelector<HTMLElement & { close(): void }>("wp-dialog");
    if (dialog) dialog.close();
    else this._dialog = "";
  }

  _setSort(sort: ProgramSort): void { this._view = { ...this._view, sort }; }

  _toggleFilter(kind: "types" | "rooms" | "devices", value: string): void {
    const chosen = this._view[kind];
    this._view = { ...this._view, [kind]: chosen.includes(value) ? chosen.filter((v) => v !== value) : [...chosen, value] };
  }

  /** Clears the filters only: the sort chosen stays. */
  _resetFilters(): void { this._view = { ...emptyView(), sort: this._view.sort }; }

  _setListMode(mode: "list" | "overview"): void { this._listMode = mode; }

  /** The card as a compact list, for the programs the list shows (every program when no filter is on), in the order of the list. */
  _overview(programs: Program[]) {
    const shown = viewPrograms(this.hass, programs, this._view).map((p) => p.id);
    return html`<wp-overview .hass=${this.hass} .programs=${filterCount(this._view) ? shown : undefined} .order=${shown}></wp-overview>`;
  }

  _openDuplicate(): void {
    this._screen = "duplicate"; this._selected = null; this._notice = ""; this._dupId = ""; this._dupError = "";
    this._focusAfterRender(".dup h2");
  }

  _leaveDuplicate(): void {
    this._screen = "programs"; this._dupId = ""; this._dupError = "";
    this._focusAfterRender(".dup-open");
  }

  /** Copies the chosen program straight away: "Copie <name>", added at the end of the list, the screen goes back to the list. */
  async _duplicate(): Promise<void> {
    const data = this._data;
    const source = data?.programs.find((p) => p.id === this._dupId);
    if (!data || !source || !this.hass || this._dupBusy) return;
    const lang = this._lang;
    this._dupBusy = true;
    this._dupError = "";
    try {
      const name = copyName((n) => t(lang, "panel_copy_name", { name: n }), source.name, data.programs.map((p) => p.name));
      const result = await this.hass.callWS<{ program: Program }>({ type: "weekly_planner/program/save", program: copyProgram(source, name) });
      const saved = result.program;
      if (this._data) this._data = { ...this._data, programs: [...this._data.programs.filter((p) => p.id !== saved.id), saved] };
      this._screen = "programs";
      this._dupId = "";
      this._notice = t(lang, "panel_duplicated", { name: saved.name });
      this._focusAfterRender(".dup-open");
    } catch (err) {
      this._dupError = errorText(lang, err);
    } finally {
      this._dupBusy = false;
    }
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
    const shown = viewPrograms(this.hass, programs, this._view);
    const filtered = filterCount(this._view) > 0;
    const has = programs.length > 0;
    const overview = this.narrow && this._listMode === "overview" && programs.length > 0;
    return html`<nav class="list" aria-label=${t(lang, "panel_title")}>
      <h2 class="grp" id="panel-actions">${t(lang, "panel_actions")}</h2>
      <button class="row act new ${this._selected === "new" ? "on" : ""}" @click=${() => this._open("new")}>
        <ha-icon icon="mdi:plus"></ha-icon><span class="txt"><span class="name">${t(lang, "new_program")}</span></span>
      </button>
      <button class="row act dup-open" ?disabled=${!has} aria-disabled=${ariaDisabled(!has)} aria-describedby=${describedBy(!has, "why-dup-open")} @click=${() => this._openDuplicate()}>
        <ha-icon icon="mdi:content-copy"></ha-icon><span class="txt"><span class="name">${t(lang, "panel_dup_open")}</span></span>
      </button>
      ${whyNote("why-dup-open", t(lang, "panel_create_first"), !has)}
      <button class="row act prio-open" @click=${() => this._openPriorities()}>
        <ha-icon icon="mdi:swap-vertical"></ha-icon><span class="txt"><span class="name">${t(lang, "prio_button")}</span>
          <span class="sub">${t(lang, "prio_button_sub")}</span></span>
      </button>

      <div class="grp-row"><h2 class="grp" id="panel-programs">${t(lang, "panel_programs")}</h2>
        ${this.narrow ? html`<div class="seg" role="radiogroup" aria-label=${t(lang, "panel_programs")}>
          ${(["list", "overview"] as const).map((mode) => html`<button role="radio" aria-checked=${this._listMode === mode} class=${this._listMode === mode ? "on" : ""}
            ?disabled=${!has} aria-disabled=${ariaDisabled(!has)} aria-describedby=${describedBy(!has, "why-tools")}
            @click=${() => this._setListMode(mode)}>${t(lang, mode === "list" ? "panel_list_mode" : "panel_overview")}</button>`)}</div>` : nothing}</div>
      <span class="tools">
          <button class="link sort-open" aria-haspopup="dialog" ?disabled=${!has} aria-disabled=${ariaDisabled(!has)} aria-describedby=${describedBy(!has, "why-tools")} @click=${() => this._openSort()}>
            <ha-icon icon="mdi:sort"></ha-icon>${t(lang, "panel_sort_open")}${this._view.sort === "created" ? "" : ` · ${t(lang, `panel_sort_${this._view.sort}`)}`}</button>
          <button class="link filter-open" aria-haspopup="dialog" ?disabled=${!has} aria-disabled=${ariaDisabled(!has)} aria-describedby=${describedBy(!has, "why-tools")} @click=${() => this._openFilter()}>
            <ha-icon icon="mdi:filter-variant"></ha-icon>${t(lang, "panel_filter_open")}${filterCount(this._view) ? ` · ${filterCount(this._view)}` : ""}</button></span>
      ${whyNote("why-tools", t(lang, "panel_create_first"), !has)}
      <p class="filter-note" role=${filtered ? "status" : nothing}>${filtered ? t(lang, "panel_filter_shown", { n: String(shown.length), total: String(programs.length) }) : nothing}
        <button class="link" ?disabled=${!filtered} aria-disabled=${ariaDisabled(!filtered)} aria-describedby=${describedBy(!filtered, "why-reset")} @click=${() => this._resetFilters()}>${t(lang, "panel_filter_reset")}</button></p>
      ${whyNote("why-reset", t(lang, "panel_no_filter"), !filtered)}
      ${overview ? html`<section class="ov">${this._overview(programs)}</section>` : html`${shown.map((p) => html`<button class="row ${this._selected === p.id ? "on" : ""} ${p.enabled ? "" : "off"}" aria-current=${this._selected === p.id ? "true" : "false"}
        @click=${() => this._open(p.id)}>${this._rowBody(p)}</button>`)}
      ${programs.length ? shown.length ? nothing : html`<p class="empty" role="status">${t(lang, "panel_filter_none")}</p>` : html`<p class="empty" role="status">${t(lang, "no_program")}</p>`}`}
    </nav>`;
  }

  /** The icon, name and device count of a program, shared by the list and the duplicate screen. */
  _rowBody(p: Program) {
    const lang = this._lang;
    return html`<ha-icon icon=${p.icon ?? "mdi:calendar-clock"}></ha-icon>
      <span class="txt"><span class="name">${p.name}</span>
        <span class="sub">${t(lang, p.entities.length === 0 ? "panel_devices_none" : p.entities.length === 1 ? "panel_devices_one" : "panel_devices", { n: String(p.entities.length) })}${p.enabled ? "" : ` · ${t(lang, "paused")}`}</span></span>`;
  }

  /** The sort: creation order (the default), name or priority. */
  _sortDialog() {
    const lang = this._lang;
    return html`<wp-dialog open compact heading=${t(lang, "panel_filter_sort")} @closed=${() => { this._dialog = ""; this._focusAfterRender(".sort-open"); }}>
      <fieldset class="fs">
        ${(["created", "name", "priority"] as const).map((s) => html`<label class="opt"><input type="radio" name="sort" .checked=${this._view.sort === s} @change=${() => this._setSort(s)} />
          <span class="optname">${t(lang, `panel_sort_${s}`)}</span></label>`)}
      </fieldset>
      <div class="done-row"><button class="done" @click=${() => this._closeDialog()}>${t(lang, "prio_done")}</button></div>
    </wp-dialog>`;
  }

  /** The filters by type, room and device (a filter with a single choice is not shown); Reset clears them and keeps the sort. */
  _filterDialog(data: PlannerData) {
    const lang = this._lang;
    const hass = this.hass!;
    const view = this._view;
    const found = facets(hass, data.programs);
    const byLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" });
    const types = found.types.map((x) => ({ value: x.id, count: x.count, label: typeName(hass, this._typeNames, x.id) || x.id })).sort(byLabel);
    const rooms = found.rooms.map((x) => ({ value: x.key, count: x.count, label: x.key === NO_ROOM ? t(lang, "panel_filter_no_room") : x.label }))
      .sort((a, b) => Number(a.value === NO_ROOM) - Number(b.value === NO_ROOM) || byLabel(a, b));
    const devices = found.devices.map((x) => ({ value: x.id, count: x.count, label: displayName(hass, x.id) })).sort(byLabel);
    const group = (title: string, kind: "types" | "rooms" | "devices", items: { value: string; label: string; count: number }[]) => {
      if (items.length < 2) return nothing;
      const open = this._facet === kind;
      const on = view[kind].length;
      return html`<div class="acc">
        <h3 class="acc-h"><button class="acc-btn" id=${`acc-${kind}-btn`} aria-expanded=${open} aria-controls=${`acc-${kind}`} @click=${() => this._toggleFacet(kind)}>
          <span>${title}${on ? ` · ${on}` : ""}</span><ha-icon icon=${open ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon></button></h3>
        ${collapse(open, html`<div role="group" aria-labelledby=${`acc-${kind}-btn`}>
          ${items.map((i) => html`<label class="opt"><input type="checkbox" .checked=${view[kind].includes(i.value)} @change=${() => this._toggleFilter(kind, i.value)} />
            <span class="optname">${i.label}</span><span class="count">${i.count}</span></label>`)}
        </div>`, `acc-${kind}`)}</div>`;
    };
    const total = data.programs.length;
    return html`<wp-dialog open compact heading=${t(lang, "panel_filter_open")} @closed=${() => { this._dialog = ""; this._focusAfterRender(".filter-open"); }}>
      ${group(t(lang, "panel_filter_type"), "types", types)}${group(t(lang, "panel_filter_room"), "rooms", rooms)}${group(t(lang, "panel_filter_device"), "devices", devices)}
      <p class="filter-count" role="status">${t(lang, "panel_filter_shown", { n: String(viewPrograms(hass, data.programs, view).length), total: String(total) })}</p>
      <div class="done-row">
        <button class="link" ?disabled=${filterCount(view) === 0} @click=${() => this._resetFilters()}>${t(lang, "panel_filter_reset")}</button>
        <button class="done" @click=${() => this._closeDialog()}>${t(lang, "prio_done")}</button>
      </div>
    </wp-dialog>`;
  }

  /** "Duplicate a program": choose one program, then Duplicate. */
  _duplicateScreen(data: PlannerData) {
    const lang = this._lang;
    return html`<section class="dup">
      <h2 class="sr" tabindex="-1">${t(lang, "panel_dup_open")}</h2>
      <p class="hint">${t(lang, "panel_dup_hint")}</p>
      ${this._dupError ? html`<p class="notice" role="alert">${this._dupError}</p>` : nothing}
      <div class="list" role="radiogroup" aria-label=${t(lang, "panel_dup_open")}>
        ${sortPrograms(data.programs, this._view.sort).map((p) => html`<button class="row ${this._dupId === p.id ? "on" : ""} ${p.enabled ? "" : "off"}" role="radio" aria-checked=${this._dupId === p.id ? "true" : "false"}
          @click=${() => { this._dupId = p.id; }}>${this._rowBody(p)}</button>`)}
      </div>
      <div class="done-row">
        <button class="link" @click=${() => this._leaveDuplicate()}>${t(lang, "cancel")}</button>
        <button class="done" ?disabled=${!this._dupId || this._dupBusy} @click=${() => void this._duplicate()}>${t(lang, "duplicate")}</button>
      </div>
    </section>`;
  }

  _editor(data: PlannerData) {
    const selected = this._selected;
    // the pane is titled by what it shows: the overview while nothing is open, the settings of a program once one is
    if (selected === null) return data.programs.length
      ? html`<h2 class="pane-title">${t(this._lang, "panel_overview")}</h2>${this._overview(data.programs)}`
      : html`<p class="hint">${t(this._lang, "panel_select")}</p>`;
    const program = selected === "new" ? undefined : data.programs.find((p) => p.id === selected);
    if (selected !== "new" && !program) return html`<p class="hint">${t(this._lang, "panel_select")}</p>`;
    return keyed(selected, html`<h2 class="pane-title">${t(this._lang, "panel_settings")}</h2><wp-program-editor embedded .hass=${this.hass} .data=${data} .program=${program}
      @program-saved=${(e: CustomEvent<Program>) => this._saved(e)}
      @program-deleted=${(e: CustomEvent<string>) => this._deleted(e)}></wp-program-editor>`);
  }

  /** The page title: the screen shown (priorities, duplicate), the program being edited on a narrow screen (its sheet replaces the list), else the panel. */
  _title(): string {
    const lang = this._lang;
    if (this._screen === "priorities") return t(lang, "prio_title");
    if (this._screen === "duplicate") return t(lang, "panel_dup_open");
    if (this.narrow && this._selected === "new") return t(lang, "new_program");
    if (this.narrow && this._selected !== null) return this._data?.programs.find((p) => p.id === this._selected)?.name ?? t(lang, "panel_title");
    return t(lang, "panel_title");
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
        ${this._screen !== "programs" || (this.narrow && this._selected !== null)
          ? html`<button class="back" aria-label=${t(lang, "panel_back")} title=${t(lang, "panel_back")} @click=${() => (this._screen === "priorities" ? this._leavePriorities() : this._screen === "duplicate" ? this._leaveDuplicate() : this._back())}><ha-icon icon="mdi:arrow-left"></ha-icon></button>`
          : nothing}
        <h1>${this._title()}</h1>
      </header>
      <span class="sr" role="status" aria-live="polite">${this._said}</span>
      ${!data ? html`<p class="hint">…</p>`
        : !this._canManage ? html`<p class="hint" role="status">${t(lang, "read_only")}</p>`
        : html`${this._notice ? html`<p class="notice" role="status">${this._notice}</p>` : nothing}
          ${this._screen === "priorities" ? html`<main class="narrow">${this._priorities(data)}</main>`
            : this._screen === "duplicate" ? html`<main class="narrow">${this._duplicateScreen(data)}</main>`
            : html`<main class=${this.narrow ? "narrow" : ""}>
              ${showList ? this._list(data.programs) : nothing}
              ${showEditor ? html`<section class="edit">${this._editor(data)}</section>` : nothing}
            </main>`}
          ${this._dialog === "sort" ? this._sortDialog() : this._dialog === "filter" ? this._filterDialog(data) : nothing}`}`;
  }

  static styles = css`
    ${tokenStyles}
    ${whyStyles}
    .why { margin: 4px 16px 8px; }
    .link:disabled, .seg button:disabled, .row.act:disabled { opacity: 0.5; cursor: default; }
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
    .done-row { display: flex; justify-content: flex-end; align-items: center; gap: 8px; padding: 8px 0 16px; }
    .done:disabled { opacity: 0.5; cursor: default; }
    .dup .list { margin-bottom: 8px; }
    .row.act { color: var(--wp-primary-text); }
    .ov { min-width: 0; }
    .pane-title { margin: 0 0 12px; font-size: 1.125rem; font-weight: 500; color: var(--primary-text-color); }
    .seg { display: inline-flex; border: 1px solid var(--divider-color); border-radius: 24px; overflow: hidden; }
    .seg button { min-width: 48px; min-height: 48px; padding: 0 16px; border: none; background: none; color: var(--primary-text-color); font: inherit; cursor: pointer; }
    .seg button.on { background: var(--wp-primary-fill); color: #fff; font-weight: 500; }
    .seg button:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: -2px; }
    .grp { margin: 8px 4px 0; font-size: 0.875rem; font-weight: 600; line-height: 1.3; color: var(--primary-text-color); }
    .grp:first-child { margin-top: 0; }
    .grp-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px 8px; margin-top: 8px; }
    .grp-row .grp { margin: 0 4px; }
    .tools { display: inline-flex; flex-wrap: wrap; gap: 0 4px; }
    .filter-note { margin: 0 4px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; font-size: 0.875rem; color: var(--secondary-text-color); }
    .acc-h { margin: 0; font-size: 0.875rem; }
    .acc-btn { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; min-height: 48px; padding: 0 4px; border: none; border-bottom: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit; font-weight: 600; cursor: pointer; text-align: left; }
    .acc-btn:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
    .fs { border: 0; margin: 0 0 8px; padding: 0; min-width: 0; }
    .fs legend { padding: 0; margin-bottom: 4px; font-size: 0.875rem; font-weight: 600; color: var(--primary-text-color); }
    .opt { display: flex; align-items: center; gap: 12px; min-height: 48px; cursor: pointer; }
    .opt input { width: 20px; height: 20px; flex: none; accent-color: var(--primary-color); }
    .optname { flex: 1; min-width: 0; overflow-wrap: anywhere; }
    .count { color: var(--secondary-text-color); font-size: 0.8125rem; }
    .filter-count { margin: 8px 0 0; color: var(--secondary-text-color); font-size: 0.875rem; }
    .done { min-height: 48px; padding: 0 24px; border: none; border-radius: 24px; background: var(--wp-primary-fill); color: #fff; font: inherit; font-weight: 500; cursor: pointer; }
    .link { display: inline-flex; align-items: center; gap: 4px; min-height: 48px; padding: 0 8px; border: none; background: none; color: var(--wp-primary-text); font: inherit; cursor: pointer; --mdc-icon-size: 20px; }
    .hint, .empty { margin: 16px; color: var(--secondary-text-color); }
  `;
}

declare global { interface HTMLElementTagNameMap { "wp-programs-panel": WpProgramsPanel } }
