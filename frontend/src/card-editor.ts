// Visual editor of the card (Lovelace "edit card" panel).

import { repeat } from "lit/directives/repeat.js";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { entityDomain, filterPrograms, friendlyName, subscribePlanner } from "./planner";
import { syncSelectValues } from "./select-value";
import { areaList, areaValue, roomKey, roomKeys, roomOptions } from "./program-areas";
import { domainIcon, programDomains, type DomainLocalize } from "./domains";
import { normalizeConfig, withDefaults } from "./config";
import { allPrograms, isOn, toggleAllOff, toggleProgram, programRows, toggleType, typeGroups, typeState, type FilterPatch } from "./filter-editor";
import { t } from "./i18n";
import { whyNote, whyStyles } from "./reason";
import { moveId, sortItems, sortMode, SORTS } from "./list-order";
import { setTimeFormat } from "./time";
import type { CardConfig, HomeAssistant, PlannerData } from "./types";
import { editorStyles, langOf } from "./editors/shared";
import type { K } from "./editors/shared";

/** How long a config we sent may be contradicted by Home Assistant's stale copy (one dialog re-render, a few ms). */
const ECHO_GUARD_MS = 1500;

/** Order-independent identity of a card config (normalised), to compare what HA hands back with what we sent. */
const configKey = (c: CardConfig): string => JSON.stringify(c, (_k, v: unknown) =>
  v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v);

@customElement("weekly-planner-card-editor")
export class WeeklyPlannerCardEditor extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _config: CardConfig = { type: "custom:weekly-planner-card" };
  @state() private _programs: { id: string; name: string }[] = [];
  @state() private _data?: PlannerData;
  /** Icon Home Assistant gives each domain (a type header shows it). */
  @state() private _typeIcons = new Map<string, string>();
  private _iconKey = "";
  private _unsub?: () => void;
  private _domainLoadKey = "";
  private _domainLocalize?: DomainLocalize;

  /** Last config sent to Home Assistant, and the one it replaced, for a short while (see setConfig). */
  private _sent?: { config: string; previous: string; until: number; resent: number };

  setConfig(config: CardConfig): void {
    const next = normalizeConfig(config);
    // Home Assistant's edit dialog re-renders with the config it stored *before* our config-changed when a hass
    // update lands in the same WebSocket frame (e.g. during a display change): hui-card-element-editor then
    // hands us that stale config. Keep our choice and send it again, so HA stores the new one.
    const sent = this._sent;
    if (sent && Date.now() < sent.until) {
      const key = configKey(next);
      if (key === sent.config) return;
      if (key === sent.previous && sent.resent < 5) {
        sent.resent += 1;
        this._dispatch(this._config);
        return;
      }
    }
    this._sent = undefined;
    this._config = { ...next };
  }

  private get _lang() { return langOf(this.hass); }
  private _tr(key: K, vars?: Record<string, string>) { return t(this._lang, key, vars); }

  connectedCallback(): void {
    super.connectedCallback();
    this.requestUpdate();
  }

  willUpdate(): void {
    setTimeFormat(this.hass);
  }

  updated(): void {
    syncSelectValues(this.renderRoot);
    this._loadDomainNames();
    if (this.isConnected && this.hass && !this._unsub) {
      this._unsub = subscribePlanner(this.hass, (data) => this._setData(data));
    }
  }

  private _setData(data: PlannerData): void {
    this._data = data;
    this._programs = data.programs.map((p) => ({ id: p.id, name: p.name }));
  }

  /** HA owns domain names and their translations, including domains unknown to this card. */
  private _loadDomainNames(): void {
    if (this.hass && this._data) this._loadDomainIcons(programDomains(this._data.programs, this._config.filter?.types));
    if (!this.hass?.loadBackendTranslation || !this._data) return;
    const domains = programDomains(this._data.programs, this._config.filter?.types);
    const key = `${this._lang}|${domains.join(",")}`;
    if (key === this._domainLoadKey) return;
    this._domainLoadKey = key;
    this._domainLocalize = undefined;
    if (!domains.length) return;
    void this.hass.loadBackendTranslation("title", domains).then((localize) => {
      if (key !== this._domainLoadKey) return;
      this._domainLocalize = localize;
      this.requestUpdate();
    }).catch(() => {
      if (key === this._domainLoadKey) this._domainLoadKey = "";
    });
  }

  private _loadDomainIcons(domains: string[]): void {
    const key = domains.join(",");
    if (key === this._iconKey || !domains.length) return;
    this._iconKey = key;
    void Promise.all(domains.map(async (d) => [d, await domainIcon(this.hass!, d)] as const)).then((pairs) => {
      this._typeIcons = new Map(pairs);
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsub?.();
    this._unsub = undefined;
  }

  private get _canManage(): boolean {
    return Boolean(this.hass?.user?.is_admin && this._data?.can_edit && !this._data?.read_only);
  }

  private _emit(input: CardConfig): void {
    // First user change writes the full effective configuration, so the YAML matches what the editor shows.
    const config = withDefaults(input);
    this._sent = { config: configKey(config), previous: configKey(this._config), until: Date.now() + ECHO_GUARD_MS, resent: 0 };
    this._config = config;
    this._dispatch(config);
  }

  private _dispatch(config: CardConfig): void {
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }

  private _set(key: keyof CardConfig, value: unknown): void {
    const next = { ...this._config } as Record<string, unknown>;
    if (value === undefined || value === "" || value === null) delete next[key];
    else next[key] = value;
    this._emit(next as unknown as CardConfig);
  }

  private get _isProgram(): boolean {
    return this._config.program !== undefined;
  }

  private _setMode(program: boolean): void {
    const next = { ...this._config } as CardConfig;
    if (program) {
      delete next.filter;
      next.program = this._programs[0]?.id ?? "";
    } else {
      delete next.program;
      next.filter = { ...next.filter, types: next.filter?.types ?? [] };
    }
    this._emit(next);
  }

  private _setFilter(patch: { types?: string[]; area?: string | string[]; programs?: string[] }): void {
    const filter = { ...(this._config.filter ?? {}), ...patch };
    for (const k of ["types", "programs"] as const) if (filter[k] === undefined) delete filter[k];
    if (!filter.types?.length) delete filter.types;
    if (!areaList(filter.area).length) delete filter.area;
    const next = { ...this._config, filter } as CardConfig;
    this._emit(next);
  }

  private _typeLabel(type: string): string {
    return this.hass?.localize?.(`component.${type}.title`) || this._domainLocalize?.(`component.${type}.title`) || type;
  }

  private _switch(checked: boolean, label: string, onChange: (on: boolean) => void, partial = false, disabled = false, describedBy = "") {
    return html`<ha-switch class=${partial ? "partial" : ""} .checked=${checked} .disabled=${disabled} aria-label=${label} aria-describedby=${describedBy || nothing}
      @change=${(e: Event) => onChange((e.target as HTMLInputElement).checked)}></ha-switch>`;
  }

  /** A change in the "programs to display" tree (the help under "All programs" says what the switch means in each state). */
  private _treeChange(patch: FilterPatch | { types: undefined; programs: undefined }): void {
    this._setFilter(patch);
  }

  /** The room filter as single-choice chips, like the types (owner, 2026-11-14): "All rooms" first, one chip per room. */
  private _roomField() {
    const areas = roomOptions(this.hass, this._data?.programs ?? [], this._config.filter?.area);
    const chosen = roomKeys(this.hass, this._config.filter?.area);
    // several rooms can be chosen: a chip adds or removes its room; "All rooms" (no room chosen) clears them
    const toggle = (key: string) => {
      const kept = areas.filter((a) => chosen.has(a.key) && a.key !== key);
      const values = chosen.has(key) ? kept : [...kept, areas.find((a) => a.key === key)!];
      this._setFilter({ area: areaValue(values.map((a) => a.value)) });
    };
    const chip = (text: string, on: boolean, click: () => void) => html`<button class="chip ${on ? "on" : "off"}" aria-pressed=${on ? "true" : "false"}
      @click=${click}>${on ? html`<ha-icon class="check-on" icon="mdi:check"></ha-icon>` : nothing}${text}</button>`;
    return html`<div class="quick" role="group" aria-labelledby="ce-area-label" aria-describedby="ce-area-help">
      <div class="label" id="ce-area-label">${this._tr("ce_area")}</div>
      <div class="chips">${chip(this._tr("ce_all_areas"), chosen.size === 0, () => this._setFilter({ area: undefined }))}${areas.map((a) => chip(a.label, chosen.has(a.key), () => toggle(a.key)))}</div>
      <p id="ce-area-help" class="hint">${this._tr("ce_area_hint")}</p></div>`;
  }

  private _displayPrograms() {
    const filter = this._config.filter;
    const programs = this._data?.programs ?? [];
    const all = filter?.programs === undefined && !filter?.types?.length;
    // a room is chosen: the list below only offers the programs of that room (the others keep their state)
    const rooms = roomKeys(this.hass, filter?.area);
    const room = rooms.size ? rooms : null;
    const visible = room === null ? programs : programs.filter((p) => room.has(roomKey(this.hass, p.area)));
    const { groups } = typeGroups(visible, filter, (ty) => this._typeLabel(ty), this._lang);
    const { orphans } = typeGroups(programs, filter, (ty) => this._typeLabel(ty), this._lang);
    const byId = new Map(programs.map((p) => [p.id, p]));
    const rows = programRows(visible, (id) => (this.hass ? friendlyName(this.hass, id) : id), this._lang);
    const count = all && room === null ? this._tr("ce_all_programs")
      : this._tr("ce_of_total", { on: String(visible.filter((p) => isOn(p, filter, programs)).length + orphans.length), total: String(visible.length + orphans.length) });
    return html`<details class="display-programs">
      <summary>${this._tr("ce_display_programs")} · ${count}</summary>
      <p class="hint">${this._tr("ce_display_programs_hint")}</p>
      ${this._roomField()}
      ${!rows.length && !orphans.length ? html`<p class="hint">${this._tr(room !== null && programs.length ? "ce_room_empty" : "ce_no_types")}</p>` : nothing}
      ${groups.length ? html`<div class="quick" role="group" aria-labelledby="ce-types-label" aria-describedby="ce-types-hint">
        <div class="label" id="ce-types-label">${this._tr("ce_quick_types")}</div>
        <div class="chips">${groups.map((g) => {
          const state = typeState(g, programs, filter);
          const on = g.programs.filter((x) => isOn(byId.get(x.id)!, filter, programs)).length;
          const counter = g.programs.length ? String(this._tr("ce_type_count", { on: String(on), total: String(g.programs.length) })) : "";
          const label = this._tr("ce_type_chip", { type: g.label });
          return html`<button class="chip ${state}" data-type=${g.type} aria-pressed=${state === "on" ? "true" : state === "partial" ? "mixed" : "false"}
            aria-label=${counter ? `${label} (${counter})` : label}
            @click=${() => this._treeChange(toggleType(programs, filter, g.type, state === "off", visible))}>
            ${state === "on" ? html`<ha-icon class="check-on" icon="mdi:check"></ha-icon>` : nothing}
            <ha-icon icon=${this._typeIcons.get(g.type) ?? "mdi:shape-outline"}></ha-icon>${g.label}${counter ? html` <span class="count">${counter}</span>` : nothing}</button>`;
        })}</div>
        <p id="ce-types-hint" class="hint">${this._tr("ce_quick_types_hint")}</p>
      </div>` : nothing}
      <div class="label" id="ce-programs-label">${this._tr("ce_programs_list")}</div>
      <div class="program-list" role="group" aria-labelledby="ce-programs-label">
        <div class="switch-row"><span class="grow">${this._tr("ce_all_programs")}</span>
          ${this._switch(all, this._tr("ce_all_programs"), (on) => this._treeChange(on ? allPrograms() : toggleAllOff(programs, filter, visible)), false, false, "ce-all-hint")}</div>
        <p id="ce-all-hint" class="hint" role="status">${this._tr(all ? "ce_all_programs_hint" : "ce_all_programs_hint_off")}</p>
        ${rows.map((p) => html`<div class="switch-row program-row" data-program=${p.id}>
          <span class="grow titles"><span class="type-title">${p.name}</span>
            <span class="type-names">${p.domains.map((d) => html`<ha-icon class="mini" icon=${this._typeIcons.get(d) ?? "mdi:shape-outline"}></ha-icon>`)}${p.devices.length ? p.devices.join(", ") : this._tr("ce_no_device")}</span></span>
          ${this._switch(isOn(byId.get(p.id)!, filter, programs), p.name, (v) => this._treeChange(toggleProgram(programs, filter, p.id, v)))}</div>`)}
        ${orphans.length ? html`<div class="label">${this._tr("ce_other_programs")}</div>${orphans.map((id) => html`<div class="switch-row"><span class="grow">${id}</span>
          ${this._switch(true, id, () => this._treeChange({ programs: (filter?.programs ?? []).filter((x) => x !== id) }))}</div>`)}` : nothing}
      </div>
    </details>`;
  }

  /** Programs the card shows, in the personal order (`order`; missing ones last, unknown ids ignored). */
  private _customRows() {
    const programs = this._data ? filterPrograms(this._data, this._config, this.hass) : [];
    const items = programs.map((p) => ({ id: p.id, name: p.name, type: entityDomain(p.entities[0]?.entity_id ?? ""), area: roomKey(this.hass, p.area) }));
    return sortItems(items, "custom", { order: this._config.order, typeLabel: (ty) => this._typeLabel(ty), lang: this._lang });
  }

  /** Saves the new order of the shown programs; saved ids of hidden programs stay after them. */
  private _setOrder(ids: string[]): void {
    const rest = (this._config.order ?? []).filter((id) => !ids.includes(id));
    this._set("order", [...ids, ...rest]);
  }

  @state() private _moved = "";
  @state() private _announce = "";
  private _movedTimer?: ReturnType<typeof setTimeout>;

  private _move(ids: string[], from: number, to: number): void {
    if (to < 0 || to >= ids.length || to === from) return;
    this._moved = ids[from];
    clearTimeout(this._movedTimer);
    this._movedTimer = setTimeout(() => (this._moved = ""), 1000);
    this._setOrder(moveId(ids, from, to));
    const name = this._customRows().find((r) => r.id === ids[from])?.name ?? "";
    this._announce = this._tr("ce_moved", { name, n: String(to + 1), total: String(ids.length) });
    setTimeout(() => (this._announce = ""), 3000);
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>(`[data-order="${ids[from]}"] .move:not([disabled])`)?.focus());
  }

  /** Drag by the handle only (the page still scrolls elsewhere); the row under the pointer gives the new place. */
  private _drag(e: PointerEvent, ids: string[], from: number): void {
    const handle = e.currentTarget as HTMLElement;
    const list = handle.closest(".order-list")!;
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    let to = from;
    const rows = () => Array.from(list.querySelectorAll<HTMLElement>(".order-row"));
    const mark = () => rows().forEach((r, i) => r.classList.toggle("target", i === to && to !== from));
    const over = (ev: PointerEvent) => {
      const at = rows().findIndex((r) => { const b = r.getBoundingClientRect(); return ev.clientY >= b.top && ev.clientY <= b.bottom; });
      if (at >= 0) { to = at; mark(); }
    };
    const end = () => {
      handle.removeEventListener("pointermove", over);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", cancel);
      rows().forEach((r) => r.classList.remove("target"));
      if (to !== from) this._setOrder(moveId(ids, from, to));
    };
    const cancel = () => { to = from; end(); };
    handle.addEventListener("pointermove", over);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", cancel);
  }

  private _sortField() {
    const sort = sortMode(this._config.sort);
    const rows = sort === "custom" ? this._customRows() : [];
    const ids = rows.map((r) => r.id);
    return html`<div class="field"><label for="ce-sort">${this._tr("ce_sort")}</label>
        <select id="ce-sort" data-value=${sort} @change=${(e: Event) => this._set("sort", (e.target as HTMLSelectElement).value)}>
          ${SORTS.map((v) => html`<option value=${v} ?selected=${v === sort}>${this._tr(`ce_sort_${v}`)}</option>`)}
        </select></div>
      ${sort === "custom" ? html`<ol class="order-list" aria-label=${this._tr("ce_order_list")} aria-describedby="ce-order-hint">
        ${repeat(rows, (r) => r.id, (r, i) => html`<li class="order-row ${r.id === this._moved ? "moved" : ""}" data-order=${r.id}>
          <button class="handle" tabindex="-1" aria-hidden="true" aria-label=${this._tr("ce_drag", { name: r.name })} @pointerdown=${(e: PointerEvent) => this._drag(e, ids, i)}><ha-icon icon="mdi:drag"></ha-icon></button>
          <span class="grow titles"><span class="type-title">${r.name}</span>
            <span class="type-names"><ha-icon class="mini" icon=${this._typeIcons.get(r.type) ?? "mdi:shape-outline"}></ha-icon>${r.type ? this._typeLabel(r.type) : this._tr("sort_other")}</span></span>
          <button class="move up" aria-label=${this._tr("ce_move_up", { name: r.name })} ?disabled=${i === 0} @click=${() => this._move(ids, i, i - 1)}><ha-icon icon="mdi:arrow-up"></ha-icon></button>
          <button class="move down" aria-label=${this._tr("ce_move_down", { name: r.name })} ?disabled=${i === ids.length - 1} @click=${() => this._move(ids, i, i + 1)}><ha-icon icon="mdi:arrow-down"></ha-icon></button></li>`)}
      </ol><p id="ce-order-hint" class="hint">${this._tr("ce_sort_custom_hint")}</p><p class="sr-only" role="status">${this._announce}</p>` : nothing}`;
  }

  render() {
    const c = this._config;
    return html`
      ${this._canManage ? html`<a class="btn manage-programs" href="/weekly-planner"><ha-icon icon="mdi:calendar-edit"></ha-icon>${this._tr("ce_manage_programs")}</a>`
        : !this._data ? nothing : html`<button type="button" class="btn manage-programs" disabled aria-disabled="true" aria-describedby="why-manage"><ha-icon icon="mdi:calendar-edit"></ha-icon>${this._tr("ce_manage_programs")}</button>
          ${whyNote("why-manage", this._tr(this._data?.read_only ? "read_only" : "manage_admins_only"))}`}
      <div class="field"><label for="ce-title">${this._tr("ce_title")}</label>
        <input id="ce-title" type="text" .value=${c.title ?? ""} @input=${(e: Event) => this._set("title", (e.target as HTMLInputElement).value)} /></div>

      <fieldset class="group"><legend>${this._tr("ce_mode")}</legend><div class="row">
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(true)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(false)} /> ${this._tr("ce_filtered")}</label>
      </div></fieldset>

      ${this._isProgram
        ? html`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" data-value=${c.program ?? ""} @change=${(e: Event) => this._set("program", (e.target as HTMLSelectElement).value)}>
              ${this._programs.length === 0 ? html`<option value="">${this._tr("no_program")}</option>` : nothing}
              ${!this._programs.some((p) => p.id === c.program) && c.program ? html`<option value=${c.program} selected>${c.program}</option>` : nothing}
              ${this._programs.map((p) => html`<option value=${p.id} ?selected=${p.id === c.program}>${p.name}</option>`)}
            </select>
          </div>`
        : this._displayPrograms()}

      ${this._isProgram ? nothing : this._sortField()}
      <div class="field"><label for="ce-view">${this._tr("ce_schedule_view")}</label>
        <select id="ce-view" data-value=${c.schedule_view ?? "bars"} @change=${(e: Event) => this._set("schedule_view", (e.target as HTMLSelectElement).value)}>
          <option value="bars">${this._tr("ce_bars")}</option>
          <option value="radial">${this._tr("ce_radial")}</option>
          <option value="radial_12h">${this._tr("ce_radial_12h")}</option>
          <option value="list">${this._tr("ce_list")}</option>
          <option value="times">${this._tr("ce_times")}</option>
          <option value="compare">${this._tr("ce_compare")}</option>
        </select>
      </div>
      <div class="switch-row"><span class="grow">${this._tr("ce_show_schedule_list")}</span>
        ${this._switch(c.show_schedule_list === true, this._tr("ce_show_schedule_list"), (on) => this._set("show_schedule_list", on))}</div>
      <div class="switch-row"><span class="grow">${this._tr("ce_show_chart")}</span>
        ${this._switch(c.show_chart !== false, this._tr("ce_show_chart"), (on) => this._set("show_chart", on), false, false, "ce-show-chart-hint")}</div>
      <p id="ce-show-chart-hint" class="hint">${this._tr("ce_show_chart_hint")}</p>
      <div class="switch-row"><span class="grow">${this._tr("ce_chart_open")}</span>
        ${this._switch(c.chart_collapsed === false, this._tr("ce_chart_open"), (on) => this._set("chart_collapsed", !on), false, c.show_chart === false, "ce-chart-open-hint")}</div>
      <p id="ce-chart-open-hint" class="hint">${this._tr("ce_chart_open_hint")}</p>
    `;

  }

  static styles = [editorStyles, whyStyles, css`:host { display: block; padding: 4px 0; } .hint { line-height: 1.5; } .display-programs { margin: 12px 0; border: 1px solid var(--wp-field-border); border-radius: 8px; padding: 8px 12px; } summary { min-height: 44px; align-content: center; cursor: pointer; } .display-programs .check { min-height: 44px; overflow-wrap: anywhere; } .switch-row { display: flex; align-items: center; gap: 8px; min-height: 48px; overflow-wrap: anywhere; } .type-head { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; min-height: 48px; border: 0; background: none; color: inherit; text-align: start; cursor: pointer; } .type-body[hidden] { display: none; } ha-switch { padding: 12px 8px; margin: -12px -8px; flex: none; } ha-switch.partial { --mdc-theme-secondary: var(--warning-color, #ffa600); } .type-icon { flex: none; color: var(--secondary-text-color); } .titles { display: flex; flex-direction: column; flex: 1 1 0; min-width: 0; } .type-title { font-size: 1rem; overflow-wrap: normal; word-break: keep-all; } .type-names { font-size: 0.875rem; color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .mini { --mdc-icon-size: 16px; vertical-align: -3px; margin-inline-end: 4px; } .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 12px; } .chip { display: inline-flex; align-items: center; gap: 4px; min-height: 44px; padding: 0 12px; border: 1px solid var(--wp-field-border); border-radius: 22px; background: none; color: var(--primary-text-color); font: inherit; cursor: pointer; } .chip.on { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; } .chip.partial { border: 2px dashed var(--wp-primary-text); } .chip .count { font-size: 0.8125rem; opacity: .85; color: inherit; } .chip.on .count { opacity: 1; color: #fff; } .quick .hint { margin: 4px 0 0; } .count { font-size: 0.875rem; color: var(--secondary-text-color); } .count b { color: var(--primary-text-color); } .type-head.static { cursor: default; } .chev-space { flex: none; width: 24px; } .order-list { list-style: none; margin: 0 0 12px; padding: 0; } .order-row { display: flex; align-items: center; gap: 4px; min-height: 56px; border-bottom: 1px solid var(--divider-color); } .order-row.target { border-top: 2px solid var(--wp-primary-text); } .order-row.moved { background: var(--wp-field-border); box-shadow: inset 4px 0 0 var(--wp-primary-text); } .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; } .order-row button.move { width: 48px; height: 48px; } .order-row button { flex: none; width: 44px; height: 48px; display: inline-flex; align-items: center; justify-content: center; border: 0; background: none; color: var(--primary-text-color); cursor: pointer; } .order-row button[disabled] { opacity: .35; cursor: default; } .order-row .handle { touch-action: none; cursor: grab; } .order-row .grow { flex: 1 1 0; min-width: 0; } .manage-programs { margin-bottom: 12px; text-decoration: none; } button.manage-programs[disabled] { opacity: .5; cursor: default; margin-bottom: 0; }`];
}

declare global {
  interface HTMLElementTagNameMap {
    "weekly-planner-card-editor": WeeklyPlannerCardEditor;
  }
}
