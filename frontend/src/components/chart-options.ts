// Shared, persisted display options for a program/device. Never dispatches a device service.
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { friendlyName } from "../planner";
import { sourceColor, sourceKind, sourceUnit, sourceUnits, knownStates, stateName, badState } from "../chart-sources";
import type { SourcePoint } from "../chart-sources";
import type { ChartSource, HomeAssistant, PlannerData, Program } from "../types";
import { t } from "../i18n";
import "../editors/shared";

@customElement("wp-chart-options")
export class WpChartOptions extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;
  @property() entityId = "";
  @property({ attribute: false }) mainUnit: string | null = null;
  @property({ attribute: false }) histories: Record<string, SourcePoint[]> = {};
  @state() private _draft: ChartSource[] | null = null;
  @state() private _saved: Program | null = null;
  @state() private _saving = 0;
  @state() private _error = "";
  @state() private _done = false;
  private _queue = Promise.resolve();
  private _identity = "";
  private _generation = 0;

  willUpdate(): void {
    const identity = `${this.program?.id}|${this.entityId}`;
    if (identity === this._identity) return;
    this._identity = identity; this._generation++;
    this._draft = null; this._saved = null; this._saving = 0; this._error = ""; this._done = false;
  }
  private _sequence = 0;
  private get _lang() { return this.hass?.locale?.language ?? this.hass?.language ?? "en"; }
  private get _editable() { return this.data?.can_edit && !this.data.read_only; }
  private get _live() { return this._saved && this._saved.id === this.program.id && this._saved.revision > this.program.revision ? this._saved : this.program; }
  private get _sources(): ChartSource[] { return this._draft ?? this._live.entities.find(e => e.entity_id === this.entityId)?.chart_sources ?? []; }

  private _change(sources: ChartSource[]): void {
    if (!this._editable) return;
    this._draft = sources; this._done = false; this._error = "";
    const sequence = ++this._sequence;
    const generation = this._generation;
    const hass = this.hass;
    const programId = this.program.id, entityId = this.entityId;
    this._saving++;
    this._queue = this._queue.then(async () => {
      try {
        for (let attempt = 0; attempt < 2; attempt++) {
          const fresh = await hass.callWS<PlannerData>({ type: "weekly_planner/get" });
          if (!fresh.can_edit || fresh.read_only) throw new Error("unauthorized");
          const program = fresh.programs.find(p => p.id === programId);
          if (!program || !program.entities.some(e => e.entity_id === entityId)) throw new Error("gone");
          const next = { ...program, entities: program.entities.map(e => e.entity_id === entityId ? { ...e, chart_sources: sources } : e) };
          try {
            const result = await hass.callWS<{ program: Program }>({ type: "weekly_planner/program/save", program: next });
            if (generation === this._generation && this.program.id === programId && this.entityId === entityId) {
              this._saved = result.program;
              this.dispatchEvent(new CustomEvent("chart-sources-saved", { detail: result.program, bubbles: true, composed: true }));
              if (sequence === this._sequence) { this._draft = null; this._done = true; }
            }
            return;
          } catch (err) {
            if ((err as { code?: string }).code !== "conflict" || attempt) throw err;
          }
        }
      } catch {
        if (generation === this._generation && sequence === this._sequence) { this._draft = null; this._error = t(this._lang, "chart_sources_save_failed"); }
      } finally { if (generation === this._generation) this._saving--; }
    });
  }

  private _add(id: string): void {
    if (!id || id === this.entityId || this._sources.some(s => s.entity_id === id)) return;
    const kind = sourceKind(this.hass, id);
    const source: ChartSource = { entity_id: id, kind,
      ...(kind === "states" ? { states: !badState(this.hass.states[id]?.state ?? "") ? [this.hass.states[id].state] : [] } : {}) };
    const next = [...this._sources, source];
    if (sourceUnits(this.hass, next, this.mainUnit).length > 3) { this._error = t(this._lang, "chart_sources_axes_full"); return; }
    this._change(next);
  }

  private _toggle(source: ChartSource, state: string): void {
    const selected = source.states ?? [];
    this._change(this._sources.map(s => s.entity_id === source.entity_id
      ? { ...s, states: selected.includes(state) ? selected.filter(v => v !== state) : [...selected, state] } : s));
  }

  render() {
    if (!this.hass || !this.data || !this.program) return nothing;
    const lang = this._lang;
    return html`<details><summary>${t(lang, "chart_options")}</summary>
      ${this._sources.map(source => html`<section>
        <div class="source"><i style=${`background:${sourceColor(source.entity_id)}`}></i>
          <span>${friendlyName(this.hass, source.entity_id)}${source.kind === "numeric" ? html` <small>${sourceUnit(this.hass, source.entity_id)}</small>` : nothing}</span>
          <button ?disabled=${!this._editable} aria-label=${t(lang, "chart_source_remove", { name: friendlyName(this.hass, source.entity_id) })}
            @click=${() => this._change(this._sources.filter(s => s.entity_id !== source.entity_id))}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>
        ${!this.hass.states[source.entity_id] ? html`<small>${t(lang, "chart_source_missing")}</small>` : nothing}
        ${source.kind === "states" ? html`<div class="states" role="group" aria-label=${t(lang, "chart_source_states")}>
          ${knownStates(this.hass, source, this.histories[source.entity_id]).map(value => html`<label>
            <input type="checkbox" ?checked=${source.states?.includes(value)} ?disabled=${!this._editable} @change=${() => this._toggle(source, value)}>
            <i style=${`background:${sourceColor(source.entity_id, value)}`}></i>${stateName(this.hass, source.entity_id, value)}</label>`)}
          ${!knownStates(this.hass, source, this.histories[source.entity_id]).length ? html`<small>${t(lang, "chart_source_no_states")}</small>` : nothing}
        </div>` : nothing}
      </section>`)}
      ${this._editable ? html`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${t(lang, "chart_source_add")}
        .exclude=${[this.entityId, ...this._sources.map(s => s.entity_id)]}
        @wp-change=${(e: CustomEvent<string>) => { e.stopPropagation(); this._add(e.detail); }}></wp-entity-picker>` : nothing}
      <p role="status">${this._saving ? t(lang, "chart_sources_saving") : this._done ? t(lang, "chart_sources_saved") : ""}</p>
      ${this._error ? html`<p class="error" role="alert">${this._error}</p>` : nothing}
    </details>`;
  }
  static styles = css`
    :host { display:block; margin-top:8px; }
    details { border:1px solid var(--divider-color); border-radius:12px; padding:0 10px; }
    summary { min-height:44px; display:list-item; align-content:center; cursor:pointer; font-size:14px; }
    section { padding:8px 0; border-top:1px solid var(--divider-color); }
    .source { display:flex; gap:8px; align-items:center; } .source span { flex:1; overflow-wrap:anywhere; }
    i { display:inline-block; width:10px; height:10px; border-radius:50%; flex:none; }
    button { min-width:44px; min-height:44px; border:0; background:transparent; color:inherit; cursor:pointer; --mdc-icon-size:20px; }
    button:disabled { opacity:.4; } .states { display:flex; flex-wrap:wrap; gap:4px 12px; }
    label { display:flex; align-items:center; gap:6px; min-height:44px; font-size:14px; }
    small, p { color:var(--secondary-text-color); font-size:12px; } p:empty { display:none; } .error { color:var(--error-color); }
  `;
}
