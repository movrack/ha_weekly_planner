// Notices about modes: a mode that is no longer offered by the selector (is it a renamed one? or delete it),
// and the last automatic rename, which can be undone for a week. Shown on the card and in the schedules screen.
// Anyone can press the buttons here; the server refuses what the user is not allowed to do.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { confirmAction } from "./confirm";
import { errorText, t } from "../i18n";
import { langOf } from "../editors/shared";
import { callout, calloutStyles } from "../styles";
import type { HomeAssistant, PlannerData } from "../types";

const WEEK_MS = 7 * 24 * 3600 * 1000;

@customElement("wp-mode-notice")
export class WpModeNotice extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @state() private _busy = false;
  @state() private _error = "";

  private get _lang(): string { return langOf(this.hass); }

  private async _call(msg: Record<string, unknown>): Promise<void> {
    if (this._busy) return;
    this._busy = true;
    this._error = "";
    try {
      await this.hass.callWS(msg);
    } catch (err) {
      this._error = errorText(this._lang, err);
    } finally {
      this._busy = false;
    }
  }

  private _resolve(old: string, next: string | null): Promise<void> {
    return this._call({ type: "weekly_planner/mode/resolve", old, new: next });
  }

  private async _delete(old: string): Promise<void> {
    if (!(await confirmAction(this, t(this._lang, "mode_gone_confirm", { old }), t(this._lang, "slot_delete_yes"), t(this._lang, "slot_delete_no")))) return;
    await this._resolve(old, null);
  }

  /** The last rename, while it is recent enough to be undone. */
  private _lastRename() {
    const list = this.data.mode?.renamed ?? [];
    const last = list[list.length - 1];
    if (!last) return undefined;
    const at = Date.parse(last.at);
    return Number.isFinite(at) && Date.now() - at <= WEEK_MS ? last : undefined;
  }

  /** Modes that stopped following a mode that went away, while the news is recent. */
  private _followLost() {
    return (this.data.mode?.follow_lost ?? []).filter((r) => {
      const at = Date.parse(r.at);
      return Number.isFinite(at) && Date.now() - at <= WEEK_MS;
    });
  }

  render() {
    const mode = this.data?.mode;
    if (!this.hass || !mode?.selector) return nothing;
    const lang = this._lang;
    const proposals = mode.proposals ?? [];
    const proposed = new Set(proposals.map((p) => p.old));
    const asks = [...proposals, ...(mode.orphans ?? []).filter((o) => !proposed.has(o)).map((old) => ({ old, candidates: [] as string[] }))];
    const renamed = this._lastRename();
    const lost = this._followLost();
    if (!asks.length && !renamed && !lost.length) return nothing;
    return html`
      ${lost.map((r) => callout("warning", "", t(lang, "mode_follow_lost", { modes: r.modes.join(", "), source: r.source }), { role: "status" }))}
      ${asks.map((a) => html`<div class="callout tone-warning" role="status">
        <ha-icon icon="mdi:alert-outline"></ha-icon><div class="co-body">
        <p>${t(lang, "mode_gone", { old: a.old })}${a.candidates.length ? html` ${t(lang, "mode_gone_ask")}` : nothing}</p>
        <div class="btns">
          ${a.candidates.map((c) => html`<button class="btn" ?disabled=${this._busy} @click=${() => void this._resolve(a.old, c)}>
            <ha-icon icon="mdi:arrow-right-bold-outline"></ha-icon>${c}</button>`)}
          <button class="btn del" ?disabled=${this._busy} @click=${() => void this._delete(a.old)}>
            <ha-icon icon="mdi:delete-outline"></ha-icon>${t(lang, "mode_gone_delete")}</button>
        </div></div>
      </div>`)}
      ${renamed ? callout("warning", "", t(lang, "mode_renamed", { old: renamed.old, new: renamed.new }), { role: "status", extra: html`
        <div class="btns"><button class="btn" ?disabled=${this._busy}
          @click=${() => void this._call({ type: "weekly_planner/mode/undo_rename", new: renamed.new })}>
          <ha-icon icon="mdi:undo"></ha-icon>${t(lang, "mode_undo")}</button>
          <button class="btn" ?disabled=${this._busy}
          @click=${() => void this._call({ type: "weekly_planner/mode/dismiss_rename", new: renamed.new })}>
          <ha-icon icon="mdi:check"></ha-icon>${t(lang, "ok")}</button></div>` }) : nothing}
      ${this._error ? callout("error", "", this._error, { role: "alert" }) : nothing}`;
  }

  static styles = [calloutStyles, css`
    :host { display: block; }
    .btn {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border-radius: 24px; font: inherit; font-size: 0.9375rem;
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 20px;
    }
    .btn.del { color: var(--wp-danger-text); border-color: var(--wp-danger-text); }
    .btn:disabled { opacity: 0.5; cursor: default; }
    .btn:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-mode-notice": WpModeNotice;
  }
}
