// Visual editor of the card (Lovelace "edit card" panel).

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./editors/program-editor";
import type { WpProgramEditor } from "./editors/program-editor";
import { subscribePlanner } from "./planner";
import { syncSelectValues } from "./select-value";
import { programAreas } from "./program-areas";
import { domainChoices, programDomains, type DomainLocalize } from "./domains";
import { t } from "./i18n";
import type { CardConfig, HomeAssistant, PlannerData, Program } from "./types";
import { editorStyles, langOf } from "./editors/shared";
import type { K } from "./editors/shared";

@customElement("weekly-planner-card-editor")
export class WeeklyPlannerCardEditor extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _config: CardConfig = { type: "custom:weekly-planner-card" };
  @state() private _programs: { id: string; name: string }[] = [];
  @state() private _data?: PlannerData;
  @state() private _section: "display" | "programs" = "display";
  @state() private _editing: string | null = null;
  @state() private _createdName = "";
  @state() private _createdProgramId: string | null = null;
  @state() private _scheduleProgramId: string | null = null;
  // Retain the editor itself, including its origin, pending name form and focused tab.
  // Switching sections/programs must not discard an unapplied shared-settings draft.
  private _editors = new Map<string, WpProgramEditor>();
  private _unsub?: () => void;
  private _domainLoadKey = "";
  private _domainLocalize?: DomainLocalize;

  setConfig(config: CardConfig): void {
    if (this._config.program !== config.program) { this._editing = null; this._createdName = ""; this._createdProgramId = null; }
    this._config = { ...config };
  }

  private get _lang() { return langOf(this.hass); }
  private _tr(key: K, vars?: Record<string, string>) { return t(this._lang, key, vars); }

  connectedCallback(): void {
    super.connectedCallback();
    this.requestUpdate();
  }

  updated(): void {
    syncSelectValues(this.renderRoot);
    this._loadDomainNames();
    if (this.isConnected && this.hass && !this._unsub) {
      this._unsub = subscribePlanner(this.hass, (data) => {
        this._data = data;
        this._programs = data.programs.map((p) => ({ id: p.id, name: p.name }));
      });
    }
  }

  /** HA owns domain names and their translations, including domains unknown to this card. */
  private _loadDomainNames(): void {
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

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsub?.();
    this._unsub = undefined;
  }

  private _saved(e: CustomEvent<Program>): void {
    e.stopPropagation();
    const program = e.detail;
    const editor = e.currentTarget as WpProgramEditor;
    const previous = [...this._editors].find(([, candidate]) => candidate === editor)?.[0];
    const selected = this._editing ?? this._config.program ?? "";
    const wasSelected = previous === selected;
    if (previous !== undefined) {
      this._editors.delete(previous);
      this._editors.set(program.id, editor);
    }
    if (this._data) this._data = { ...this._data, programs: [...this._data.programs.filter((p) => p.id !== program.id), program] };
    this._programs = this._data?.programs.map((p) => ({ id: p.id, name: p.name })) ?? [];
    if (wasSelected && (selected === "new" || selected !== program.id)) {
      const config = { ...this._config, program: program.id };
      delete config.filter;
      this._emit(config);
    }
    if (wasSelected) this._editing = program.id;
    if (wasSelected && selected === "new") {
      this._createdName = program.name;
      this._createdProgramId = program.id;
      this._section = "display";
    }
  }

  private _programEditor(selected: string, program?: Program) {
    let editor = this._editors.get(selected);
    if (!editor) {
      editor = document.createElement("wp-program-editor") as WpProgramEditor;
      editor.embedded = true;
      editor.addEventListener("program-saved", (e) => this._saved(e as CustomEvent<Program>));
      editor.addEventListener("program-deleted", (e) => {
        e.stopPropagation();
        const id = (e as CustomEvent<string>).detail;
        this._editors.delete(id);
        this._editing = "";
        if (this._config.program === id) this._setMode(false);
      });
      this._editors.set(selected, editor);
    }
    editor.hass = this.hass!;
    editor.data = this._data!;
    editor.program = program;
    return editor;
  }

  private _settings() {
    const data = this._data;
    if (!data || !this.hass?.user?.is_admin || !data.can_edit || data.read_only) return nothing;
    const programs = data.programs;
    const selected = this._editing ?? (this._isProgram && this._config.program ? this._config.program : "");
    const program = data.programs.find((p) => p.id === selected);
    return html`<section class="program-settings">
      <h3>${this._tr(selected === "new" ? "new_program" : "ce_program_settings")}</h3>
      <div class="field"><label for="ce-settings-program">${this._tr("ce_edit_program")}</label>
        <select id="ce-settings-program" data-value=${selected} @change=${(e: Event) => {
          const value = (e.target as HTMLSelectElement).value;
          if (value === "new") this._newProgram();
          else this._editing = value;
        }}>
          <option value="" ?selected=${!selected}>${this._tr("ce_choose_program")}</option>
          <hr />
          <option value="new" ?selected=${selected === "new"}>${this._tr(this._editors.has("new") ? "ce_resume_creation" : "new_program")}</option>
          <hr />
          ${programs.map((p) => html`<option value=${p.id} ?selected=${selected === p.id}>${p.name}</option>`)}
        </select>
      </div>
      ${selected === "new" || program ? this._programEditor(selected, program) : nothing}
    </section>`;
  }

  private get _canManage(): boolean {
    return Boolean(this.hass?.user?.is_admin && this._data?.can_edit && !this._data?.read_only);
  }

  private _newProgram(): void {
    this._createdName = "";
    this._createdProgramId = null;
    this._editing = "new";
    this._section = "programs";
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>("#ce-settings-program")?.focus());
  }

  private _emit(config: CardConfig): void {
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }

  private _set(key: keyof CardConfig, value: unknown): void {
    const next = { ...this._config } as Record<string, unknown>;
    if (value === undefined || value === "" || value === null) delete next[key];
    else next[key] = value;
    if (key === "program") { this._editing = null; this._createdName = ""; this._createdProgramId = null; }
    this._emit(next as unknown as CardConfig);
  }

  private get _isProgram(): boolean {
    return this._config.program !== undefined;
  }

  private _setMode(program: boolean): void {
    this._editing = null;
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

  private _setFilter(patch: { types?: string[]; area?: string; programs?: string[] }): void {
    const filter = { ...(this._config.filter ?? {}), ...patch };
    if (!filter.types?.length) delete filter.types;
    if (!filter.area) delete filter.area;
    const next = { ...this._config, filter } as CardConfig;
    this._emit(next);
  }

  private _displayPrograms() {
    const selected = this._config.filter?.programs;
    const choices = [...this._programs];
    for (const id of selected ?? []) {
      if (!choices.some((p) => p.id === id)) choices.push({ id, name: id });
    }
    return html`<details class="display-programs">
      <summary>${this._tr("ce_display_programs")} · ${selected === undefined ? this._tr("ce_all_programs") : selected.length}</summary>
      <p class="hint">${this._tr("ce_display_programs_hint")}</p>
      <label class="check"><input type="checkbox" .checked=${selected === undefined}
        @change=${(e: Event) => this._setFilter({ programs: (e.target as HTMLInputElement).checked ? undefined : choices.map((p) => p.id) })} />${this._tr("ce_all_programs")}</label>
      <div role="group" aria-label=${this._tr("ce_display_programs")}>
        ${choices.map((p) => html`<label class="check"><input type="checkbox" .checked=${selected === undefined || selected.includes(p.id)}
          @change=${(e: Event) => {
            const ids = selected ?? choices.map((choice) => choice.id);
            this._setFilter({ programs: (e.target as HTMLInputElement).checked ? [...new Set([...ids, p.id])] : ids.filter((id) => id !== p.id) });
          }} />${p.name}</label>`)}
      </div>
    </details>`;
  }

  private _tabKey = (event: KeyboardEvent): void => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    this._section = event.key === "Home" ? "display" : event.key === "End" ? "programs" : this._section === "display" ? "programs" : "display";
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>(`#ce-tab-${this._section}`)?.focus());
  };

  render() {
    const c = this._config;
    const types = c.filter?.types ?? [];
    const areas = programAreas(this._data?.programs ?? [], c.filter?.area);
    const choices = domainChoices(programDomains(this._data?.programs ?? [], types), this._lang,
      (key) => this.hass?.localize?.(key) || this._domainLocalize?.(key) || "");
    const display = html`
      ${this._createdName ? html`<div class="created-next-step"><p class="hint" role="status">${this._tr("ce_created", { name: this._createdName })}</p>
        <button class="btn primary" @click=${() => { this._scheduleProgramId = this._createdProgramId; }}><ha-icon icon="mdi:calendar-edit"></ha-icon>${this._tr("ce_define_schedule")}</button></div>` : nothing}
      ${this._editors.has("new") ? html`<p class="hint" role="status">${this._tr("ce_draft_kept")}</p>` : nothing}
      <div class="field"><label for="ce-title">${this._tr("ce_title")}</label>
        <input id="ce-title" type="text" .value=${c.title ?? ""} @input=${(e: Event) => this._set("title", (e.target as HTMLInputElement).value)} /></div>

      <div class="row" role="radiogroup" aria-label=${this._tr("ce_mode")}>
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(true)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(false)} /> ${this._tr("ce_filtered")}</label>
      </div>

      ${this._isProgram
        ? html`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" data-value=${c.program ?? ""} @change=${(e: Event) => this._set("program", (e.target as HTMLSelectElement).value)}>
              ${this._programs.length === 0 ? html`<option value="">${this._tr("no_program")}</option>` : nothing}
              ${!this._programs.some((p) => p.id === c.program) && c.program ? html`<option value=${c.program} selected>${c.program}</option>` : nothing}
              ${this._programs.map((p) => html`<option value=${p.id} ?selected=${p.id === c.program}>${p.name}</option>`)}
            </select>
            ${this._canManage ? html`<div class="program-actions">
              <button class="btn" @click=${this._newProgram}><ha-icon icon="mdi:plus"></ha-icon>${this._tr(this._editors.has("new") ? "ce_resume_creation" : "new_program")}</button>
              ${c.program ? html`<button class="btn" @click=${() => { this._editing = c.program!; this._section = "programs"; }}><ha-icon icon="mdi:pencil"></ha-icon>${this._tr("ce_edit_selected")}</button>` : nothing}
            </div>` : nothing}</div>`
        : html`
            <div class="label">${this._tr("ce_types")}</div>
            <div class="row" role="group" aria-label=${this._tr("ce_types")}>
              ${choices.map(({ id: ty, label }) => html`<label class="check" style="flex:1 1 150px"><input type="checkbox" .checked=${types.includes(ty)}
                @change=${(e: Event) => this._setFilter({ types: (e.target as HTMLInputElement).checked ? [...types, ty] : types.filter((x) => x !== ty) })} />
                ${label}</label>`)}
            </div>
            ${!choices.length ? html`<p class="hint">${this._tr("ce_no_types")}</p>` : nothing}
            <p class="hint">${this._tr("ce_types_hint")}</p>
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <select id="ce-area" data-value=${c.filter?.area ?? ""} aria-describedby="ce-area-help"
                @change=${(e: Event) => this._setFilter({ area: (e.target as HTMLSelectElement).value })}>
                <option value="">${this._tr("ce_all_areas")}</option>
                ${areas.map((area) => html`<option value=${area}>${area}</option>`)}
              </select><p id="ce-area-help" class="hint">${this._tr("ce_area_hint")}</p></div>
            ${this._displayPrograms()}`}

      <div class="field"><label for="ce-view">${this._tr("ce_schedule_view")}</label>
        <select id="ce-view" data-value=${c.schedule_view ?? "bars"} @change=${(e: Event) => this._set("schedule_view", (e.target as HTMLSelectElement).value)}>
          <option value="bars">${this._tr("ce_bars")}</option>
          <option value="radial">${this._tr("ce_radial")}</option>
          <option value="radial_12h">${this._tr("ce_radial_12h")}</option>
          <option value="list">${this._tr("ce_list")}</option>
        </select>
      </div>
      <label class="check"><input type="checkbox" .checked=${c.show_chart !== false}
        @change=${(e: Event) => this._set("show_chart", (e.target as HTMLInputElement).checked)} /> ${this._tr("ce_show_chart")}</label>
    `;
    const admin = this._canManage;
    return html`
      ${admin ? html`<nav role="tablist" aria-label=${this._tr("settings")}>
        <button id="ce-tab-display" role="tab" aria-controls="ce-panel" tabindex=${this._section === "display" ? 0 : -1} @keydown=${this._tabKey} aria-selected=${this._section === "display"} @click=${() => { this._section = "display"; }}>${this._tr("ce_display")}</button>
        <button id="ce-tab-programs" role="tab" aria-controls="ce-panel" tabindex=${this._section === "programs" ? 0 : -1} @keydown=${this._tabKey} aria-selected=${this._section === "programs"} @click=${() => { this._section = "programs"; }}>${this._tr("ce_program_settings")}</button>
      </nav>` : nothing}
      <div id="ce-panel" role="tabpanel" aria-labelledby=${admin ? `ce-tab-${this._section}` : nothing}>${admin && this._section === "programs" ? this._settings() : display}</div>
      ${this._scheduleProgramId && this._data?.programs.some((p) => p.id === this._scheduleProgramId) ? html`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${{ kind: "program", programId: this._scheduleProgramId }} .chart=${false}
        @closed=${(e: Event) => { e.stopPropagation(); this._scheduleProgramId = null; }}></wp-schedule>` : nothing}`;
  }

  static styles = [editorStyles, css`:host { display: block; padding: 4px 0; } h3 { margin: 12px 0; font-size: 16px; } .program-settings { padding-top: 4px; } nav { display: flex; border-bottom: 1px solid var(--divider-color); margin-bottom: 12px; } nav button { flex: 1; min-height: 48px; border: 0; border-bottom: 3px solid transparent; background: none; color: var(--secondary-text-color); cursor: pointer; } nav button[aria-selected="true"] { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; } .hint { line-height: 1.5; } .display-programs { margin: 12px 0; border: 1px solid var(--divider-color); border-radius: 8px; padding: 8px 12px; } summary { min-height: 44px; align-content: center; cursor: pointer; } .display-programs .check { min-height: 44px; overflow-wrap: anywhere; } .program-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }`];
}

declare global {
  interface HTMLElementTagNameMap {
    "weekly-planner-card-editor": WeeklyPlannerCardEditor;
  }
}
