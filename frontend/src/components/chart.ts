// 24-hour chart of one device (spec § 10.4), the same for every device: the Home Assistant history of the day
// (a curve for a number, else a band of states), the planned actions as markers (with their value), a "now"
// line, and the manual changes in red. Tapping the chart opens the Home Assistant history. Hand-made SVG.
// The x axis is in real minutes from the server-zone midnight, so a time-change day is 23 or 25 h.

import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { t } from "../i18n";
import { actionValue, entityAction, labelOf } from "../labels";
import { activeProfile, entityDomain, friendlyName } from "../planner";
import { localWeekday, nominal, spillover } from "../time";
import type { HomeAssistant, Label, PlannerData, PreviewSlot, Program, Slot } from "../types";

// ---- date helpers (server time zone) -------------------------------------------------------

function offsetMs(ms: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(ms));
  const n = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second"));
  return asUtc - Math.floor(ms / 1000) * 1000;
}

function midnightMs(dateIso: string, timeZone: string): number {
  const [y, m, d] = dateIso.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d);
  const first = guess - offsetMs(guess, timeZone);
  return guess - offsetMs(first, timeZone);
}

export function addDaysIso(dateIso: string, days: number): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Real start/end (UTC ms) of a local day: 23, 24 or 25 hours long. */
export function dayBounds(dateIso: string, timeZone: string): { startMs: number; endMs: number } {
  return { startMs: midnightMs(dateIso, timeZone), endMs: midnightMs(addDaysIso(dateIso, 1), timeZone) };
}

export function weekdayOf(dateIso: string): number {
  const [y, m, d] = dateIso.split("-").map(Number);
  return localWeekday(new Date(Date.UTC(y, m - 1, d, 12)), "UTC");
}

// ---- model -----------------------------------------------------------------------------------

interface HistPoint { t: number; s: string; a: Record<string, any> }
interface LogEntry { t: number; state: string; user: boolean; context: boolean }
interface Loaded { hist: HistPoint[]; log: LogEntry[]; sent: number[] }
interface Pt { m: number; v: number | null }
type Span = [number, number];

/** A planned action: where it happens, what label it comes from, its value when it has one. */
interface Marker { m: number; label: Label; value: number | null; end: boolean }

interface Model {
  span: number;
  pastEnd: number; // minutes already elapsed (0 for a future day, span for a past day)
  isToday: boolean;
  kind: "curve" | "band";
  /** Curves: measured (climate), set (climate) or the single main one. */
  lines: { key: "measured" | "set" | "main"; pts: Pt[] }[];
  bands: { s: number; e: number; state: string; text: string; on: boolean }[];
  markers: Marker[];
  manual: Span[];
  lo: number;
  hi: number;
  unit: string;
}

const NEAR = 60_000; // a change within a minute of a decision or an action of Weekly Planner (its journal) is its own
const cache = new Map<string, { at: number; p: Promise<any> }>();
function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.p;
  const p = load();
  cache.set(key, { at: Date.now(), p });
  p.catch(() => cache.delete(key));
  return p;
}

function parseHistory(raw: unknown): HistPoint[] {
  if (!Array.isArray(raw)) return [];
  const out: HistPoint[] = [];
  let attrs: Record<string, any> = {};
  for (const item of raw as any[]) {
    if (item.a) attrs = item.a;
    const sec = item.lu ?? item.lc ?? item.last_updated_ts;
    const ms = typeof sec === "number" ? sec * 1000 : Date.parse(item.last_updated ?? "");
    if (Number.isNaN(ms)) continue;
    out.push({ t: ms, s: String(item.s ?? item.state ?? ""), a: attrs });
  }
  return out;
}

/** Logbook entries: `when` is in seconds (or milliseconds in older versions). */
function parseLogbook(raw: unknown): LogEntry[] {
  if (!Array.isArray(raw)) return [];
  return (raw as any[]).map((e) => {
    const when = Number(e.when);
    return {
      t: when > 1e12 ? when : when * 1000,
      state: String(e.state ?? ""),
      user: Boolean(e.context_user_id),
      // an automation, a script or a service call of an integration: not a person
      context: Boolean(e.context_event_type || e.context_domain || e.context_service || e.context_entity_id || e.context_message),
    };
  }).filter((e) => !Number.isNaN(e.t));
}

/** The text cut to the room it has (about 6 px a letter), empty when there is no room for a few letters. */
function fitText(text: string, width: number): string {
  const max = Math.floor((width - 8) / 6);
  if (max < 4) return "";
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

const isBad = (s: string) => s === "unavailable" || s === "unknown" || s === "";
const num = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) ? x : null);
const ON_STATES = new Set(["on", "open", "heat", "home", "playing", "cleaning", "unlocked", "armed_home", "armed_away"]);

@customElement("wp-chart")
export class WpChart extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;
  @property({ attribute: "entity-id" }) entityId = "";
  @property() date = "";
  /** Resolved slots of the day (null when the preview failed: nominal times are used). */
  @property({ attribute: false }) slots: PreviewSlot[] | null = null;

  @state() private _width = 320;
  @state() private _loaded: Loaded | null = null;
  @state() private _failed = false;
  private _model: Model | null = null;
  private _token = 0;
  private _observer?: ResizeObserver;

  private get _lang(): string { return this.hass?.locale?.language ?? this.hass?.language ?? "en"; }
  private get _tz(): string { return this.hass.config.time_zone; }

  connectedCallback(): void {
    super.connectedCallback();
    this._observer = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0].contentRect.width);
      if (w > 120 && w !== this._width) this._width = w;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  firstUpdated(): void {
    const box = this.renderRoot.querySelector(".box");
    if (box) this._observer?.observe(box);
  }

  willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("entityId") || changed.has("date")) void this._load();
    if (changed.has("slots") || changed.has("data") || changed.has("program") || changed.has("entityId")
      || changed.has("date") || changed.has("_loaded")) {
      this._model = this._loaded ? this._build(this._loaded) : null;
    }
  }

  private async _load(): Promise<void> {
    if (!this.hass || !this.entityId || !this.date) return;
    const key = `${this.entityId}|${this.date}`;
    const token = ++this._token;
    this._loaded = null;
    this._failed = false;
    const { startMs, endMs } = dayBounds(this.date, this._tz);
    const now = Date.now();
    const ttl = endMs > now ? 60_000 : Infinity;
    const past = startMs < now;
    const end = new Date(Math.min(endMs, now)).toISOString();
    try {
      const histP = past
        ? cached(`h|${key}`, ttl, () => this.hass.callWS<Record<string, unknown>>({
          type: "history/history_during_period",
          start_time: new Date(startMs).toISOString(), end_time: end, entity_ids: [this.entityId],
          minimal_response: false, no_attributes: false, significant_changes_only: false,
        }))
        : Promise.resolve({} as Record<string, unknown>);
      // the logbook knows who changed a state; failing is fine, the chart just shows no manual change
      const logP = past
        ? cached(`l|${key}`, ttl, () => this.hass.callWS<unknown>({
          type: "logbook/get_events",
          start_time: new Date(startMs).toISOString(), end_time: end, entity_ids: [this.entityId],
        })).catch(() => [])
        : Promise.resolve([]);
      const days = Math.min(14, Math.max(1, Math.ceil((now - startMs) / 86_400_000) + 1));
      const jourP = past
        ? cached(`j|${this.entityId}|${days}`, 60_000, () =>
          this.hass.callWS<{ segments: any[] }>({ type: "weekly_planner/journal", entity_id: this.entityId, days }))
          .catch(() => ({ segments: [] as any[] }))
        : Promise.resolve({ segments: [] as any[] });
      const [hist, log, jour] = await Promise.all([histP, logP, jourP]);
      if (token !== this._token) return;
      this._loaded = {
        hist: parseHistory(hist[this.entityId]),
        log: parseLogbook(log),
        sent: (jour.segments ?? []).filter((e: any) => e.entity_id === this.entityId).map((e: any) => Date.parse(e.at)),
      };
    } catch {
      if (token === this._token) this._failed = true;
    }
  }

  // ---- values ----

  /** What a history point says as numbers: the curves of the device. */
  private _live(p: HistPoint): { measured: number | null; set: number | null; main: number | null } {
    const none = { measured: null, set: null, main: null };
    if (isBad(p.s)) return none;
    switch (entityDomain(this.entityId)) {
      case "climate": return { measured: num(p.a.current_temperature), set: p.s === "off" ? null : num(p.a.temperature), main: null };
      case "cover": return { ...none, main: num(p.a.current_position) ?? (p.s === "open" ? 100 : p.s === "closed" ? 0 : null) };
      case "light": {
        const b = p.s === "on" ? num(p.a.brightness) : 0;
        return { ...none, main: b === null ? (p.s === "on" ? 100 : 0) : (b / 255) * 100 };
      }
      default: {
        const n = Number(p.s);
        return { ...none, main: Number.isFinite(n) ? n : null };
      }
    }
  }

  private _numeric(hist: HistPoint[]): boolean {
    const domain = entityDomain(this.entityId);
    if (["climate", "cover", "light"].includes(domain)) return true;
    const states = hist.filter((p) => !isBad(p.s));
    return states.length > 0 && states.every((p) => Number.isFinite(Number(p.s)));
  }

  // ---- build ----

  private _build(loaded: Loaded): Model {
    const tz = this._tz;
    const { startMs, endMs } = dayBounds(this.date, tz);
    const span = Math.round((endMs - startMs) / 60_000);
    const now = Date.now();
    const pastEnd = Math.max(0, Math.min(span, (now - startMs) / 60_000));
    const toM = (ms: number) => (ms - startMs) / 60_000;
    const domain = entityDomain(this.entityId);
    const profile = activeProfile(this.program, this.data);
    const slotById = new Map<string, Slot>();
    for (const p of this.program.profiles) for (const sl of p.days.flat()) slotById.set(sl.id, sl);

    // planned actions: a marker at the start of each slot, and the default at the end of a slot with an end
    const wd = weekdayOf(this.date);
    interface Range { s: number; e: number | null; slot: Slot; spill?: boolean }
    const ranges: Range[] = [];
    for (const { slot, end } of spillover(profile.days[(wd + 6) % 7])) ranges.push({ s: 0, e: end, slot, spill: true });
    if (this.slots) {
      for (const r of this.slots) {
        const slot = slotById.get(r.slot_id);
        if (!slot || r.ignored) continue;
        ranges.push({ s: Math.max(0, toM(Date.parse(r.start))), e: r.end ? Math.min(span, toM(Date.parse(r.end))) : null, slot });
      }
    } else {
      for (const slot of profile.days[wd]) {
        const s = nominal(slot.start);
        if (s === null) continue;
        const e = nominal(slot.end ?? null);
        ranges.push({ s, e: e === null ? null : e > s ? e : span, slot });
      }
    }
    const entity = this.program.entities.find((e) => e.entity_id === this.entityId);
    const defaultLabel = labelOf(this.data, entity?.default_label);
    const markers: Marker[] = [];
    const add = (m: number, label: Label | undefined, end: boolean) => {
      if (!label || m < 0 || m > span) return;
      const action = entityAction(this.program, this.entityId, label);
      if (action) markers.push({ m, label, value: actionValue(action), end });
    };
    for (const r of ranges) {
      if (!r.spill) add(r.s, labelOf(this.data, r.slot.label), false);
      if (r.e !== null) add(r.e, defaultLabel, true);
    }
    markers.sort((a, b) => a.m - b.m);

    // history
    const numeric = this._numeric(loaded.hist);
    const lines: Model["lines"] = [];
    const bands: Model["bands"] = [];
    if (numeric) {
      const series: Record<"measured" | "set" | "main", Pt[]> = { measured: [], set: [], main: [] };
      for (const p of loaded.hist) {
        const m = Math.max(0, toM(p.t));
        const v = this._live(p);
        series.measured.push({ m, v: v.measured });
        series.set.push({ m, v: v.set });
        series.main.push({ m, v: v.main });
      }
      for (const key of ["measured", "set", "main"] as const) {
        if (series[key].some((p) => p.v !== null)) lines.push({ key, pts: series[key] });
      }
    } else {
      loaded.hist.forEach((p, i) => {
        const s = Math.max(0, toM(p.t));
        const e = i + 1 < loaded.hist.length ? toM(loaded.hist[i + 1].t) : pastEnd;
        if (e <= s || isBad(p.s)) return;
        const last = bands[bands.length - 1];
        if (last && last.state === p.s && Math.abs(last.e - s) < 0.5) {
          last.e = e; // same state again (only an attribute changed): one band
          return;
        }
        const st = this.hass.states[this.entityId];
        bands.push({ s, e, state: p.s, on: ON_STATES.has(p.s),
          text: st ? (this.hass.formatEntityState?.({ ...st, state: p.s, attributes: p.a }, p.s) ?? p.s) : p.s });
      });
    }

    // manual changes: display only. A change is manual when the logbook gives a user for it, or when nothing
    // tells where it comes from and Weekly Planner did not send anything at that time.
    const nearSent = (ms: number) => loaded.sent.some((s) => Math.abs(s - ms) <= NEAR);
    const starts: number[] = [];
    for (const e of loaded.log) {
      if (isBad(e.state)) continue;
      if (e.user || (!e.context && !nearSent(e.t))) starts.push(toM(e.t));
    }
    // changes of a value that is set without changing the state never reach the logbook: they are compared
    // with what Weekly Planner sent (the user cannot be known)
    const setKey = domain === "climate" ? "set" : domain === "light" ? "main" : null;
    const setLine = lines.find((l) => l.key === setKey);
    const changeTimes: number[] = [];
    if (setLine) {
      let prev: number | null = null;
      for (const p of setLine.pts) {
        if (p.v !== null && prev !== null && Math.abs(p.v - prev) > 0.01) {
          const ms = startMs + p.m * 60_000;
          changeTimes.push(p.m);
          const automated = loaded.log.some((e) => e.context && !e.user && Math.abs(e.t - ms) <= NEAR);
          if (!nearSent(ms) && !automated && !starts.some((s) => Math.abs(s - p.m) <= 1)) starts.push(p.m);
        }
        if (p.v !== null) prev = p.v;
      }
    }
    starts.sort((a, b) => a - b);
    const stops = [...markers.map((m) => m.m), ...loaded.sent.map(toM), ...changeTimes, ...bands.map((b) => b.s),
      ...starts];
    const manual: Span[] = [];
    for (const s of starts) {
      if (s < 0 || s > pastEnd) continue;
      const next = stops.filter((x) => x > s + 0.5).sort((a, b) => a - b)[0];
      const e = Math.min(next ?? pastEnd, pastEnd);
      if (e > s) manual.push([s, e]);
      else manual.push([s, Math.min(s + 5, span)]);
    }

    // vertical range
    let lo = 0;
    let hi = 100;
    if (numeric && domain !== "cover" && domain !== "light") {
      const values = [...lines.flatMap((l) => l.pts.map((p) => p.v)), ...markers.map((m) => m.value)]
        .filter((v): v is number => v !== null);
      if (values.length) {
        lo = Math.floor(Math.min(...values) - 1);
        hi = Math.ceil(Math.max(...values) + 1);
        if (hi - lo < 2) hi = lo + 2;
      }
    }
    const unit = domain === "climate" ? "°C" : domain === "cover" || domain === "light" ? "%"
      : (this.hass.states[this.entityId]?.attributes.unit_of_measurement ?? "");
    return { span, pastEnd, isToday: startMs <= now && now < endMs, kind: numeric ? "curve" : "band",
      lines, bands, markers, manual, lo, hi, unit };
  }

  // ---- interaction ----

  /** Path of the Home Assistant history of the device for this day (opened by a tap on the chart). */
  private get _historyPath(): string {
    const { startMs, endMs } = dayBounds(this.date, this._tz);
    const q = new URLSearchParams({
      entity_id: this.entityId, start_date: new Date(startMs).toISOString(), end_date: new Date(endMs).toISOString(),
    });
    return `/history?${q.toString()}`;
  }

  private _open(): void {
    this.dispatchEvent(new CustomEvent("open-history", { detail: this._historyPath, bubbles: true, composed: true }));
  }

  // ---- render ----

  private _path(pts: Pt[], model: Model, x: (m: number) => number, y: (v: number) => number, step: boolean, within?: Span): string {
    let d = "";
    let pen = false;
    pts.forEach((p, i) => {
      const next = i + 1 < pts.length ? pts[i + 1].m : model.pastEnd;
      let a = p.m;
      let b = next;
      if (within) {
        a = Math.max(a, within[0]);
        b = Math.min(b, within[1]);
        if (b < a) { pen = false; return; }
      }
      if (p.v === null) { pen = false; return; }
      const py = y(p.v);
      if (step) {
        d += pen ? `V${py.toFixed(1)}H${x(b).toFixed(1)}` : `M${x(a).toFixed(1)},${py.toFixed(1)}H${x(b).toFixed(1)}`;
      } else {
        d += `${pen ? "L" : "M"}${x(a).toFixed(1)},${py.toFixed(1)}`;
        if (i + 1 === pts.length || (within && b < next)) d += `L${x(b).toFixed(1)},${py.toFixed(1)}`;
      }
      pen = true;
    });
    return d;
  }

  render() {
    if (!this.hass || !this.data) return nothing;
    const lang = this._lang;
    const model = this._model;
    let body;
    if (this._failed) body = html`<div class="note">${t(lang, "no_data")}</div>`;
    else if (!model) body = html`<div class="note">${t(lang, "chart_loading")}</div>`;
    else body = this._renderChart(model);
    return html`<div class="box">${body}</div>${model ? this._legend(model) : nothing}`;
  }

  private _legend(model: Model) {
    const lang = this._lang;
    const item = (cls: string, label: string, color?: string) =>
      html`<span class="key"><i class=${cls} style=${color ? `--k:${color}` : ""}></i>${label}</span>`;
    const has = (key: string) => model.lines.some((l) => l.key === key);
    return html`<div class="legend">
      ${model.markers.length ? item("planned", t(lang, "planned")) : nothing}
      ${has("measured") ? item("measured", t(lang, "measured")) : nothing}
      ${has("set") ? item("set", t(lang, "ch_set")) : nothing}
      ${model.manual.length ? item("manual", t(lang, "manual")) : nothing}
    </div>`;
  }

  private _renderChart(model: Model) {
    const lang = this._lang;
    const W = this._width;
    const curve = model.kind === "curve";
    const H = curve ? 150 : 84;
    const PAD = { l: curve ? 38 : 8, r: 10, t: 22, b: 22 };
    const x = (m: number) => PAD.l + (m / model.span) * (W - PAD.l - PAD.r);
    const y = (v: number) => PAD.t + (1 - (v - model.lo) / (model.hi - model.lo)) * (H - PAD.t - PAD.b);
    const { startMs } = dayBounds(this.date, this._tz);
    const hourOf = (m: number) => new Intl.DateTimeFormat("en-GB", { timeZone: this._tz, hour: "2-digit", hourCycle: "h23" })
      .format(new Date(startMs + m * 60_000));
    const ticksX: number[] = [];
    for (let m = 0; m <= model.span; m += 180) ticksX.push(m);
    const ticksY = curve ? [0, 1, 2, 3].map((i) => model.lo + ((model.hi - model.lo) * i) / 3) : [];
    const top = PAD.t - 12;
    const bandY = PAD.t;
    const bandH = H - PAD.t - PAD.b;
    const mark = (mk: Marker) => {
      const cy = curve && mk.value !== null ? y(mk.value) : top;
      const color = mk.label.color;
      return svg`
        <line class="drop" x1=${x(mk.m)} x2=${x(mk.m)} y1=${cy} y2=${H - PAD.b}></line>
        <circle class="mk ${mk.end ? "end" : ""}" cx=${x(mk.m)} cy=${cy} r="5" style="--c:${color}"></circle>
        ${mk.value !== null ? svg`<text class="val" x=${Math.min(Math.max(x(mk.m), 14), W - 14)} y=${Math.max(cy - 8, 9)} text-anchor="middle">${Number(mk.value.toFixed(1))}</text>` : nothing}`;
    };
    const nowLine = model.isToday
      ? svg`<line class="now" x1=${x(model.pastEnd)} x2=${x(model.pastEnd)} y1=${PAD.t - 4} y2=${H - PAD.b}></line>` : nothing;
    return html`
      <svg width=${W} height=${H} viewBox="0 0 ${W} ${H}" tabindex="0" role="button"
        aria-label=${t(lang, "chart_open", { name: friendlyName(this.hass, this.entityId) })}
        @click=${() => this._open()}
        @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this._open(); } }}>
        ${ticksY.map((v) => svg`<line class="grid" x1=${PAD.l} x2=${W - PAD.r} y1=${y(v)} y2=${y(v)}></line>
          <text class="ylab" x=${PAD.l - 4} y=${y(v) + 3} text-anchor="end">${Number(v.toFixed(model.unit === "°C" ? 1 : 0))}</text>`)}
        ${ticksX.map((m) => svg`<text class="xlab" x=${x(m)} y=${H - 6} text-anchor=${m === 0 ? "start" : "middle"}>${Number(hourOf(m))}h</text>`)}
        ${curve ? nothing : svg`
          <rect class="track" x=${PAD.l} y=${bandY} width=${W - PAD.l - PAD.r} height=${bandH} rx="6"></rect>
          ${model.bands.map((b) => {
            const w = x(b.e) - x(b.s);
            return svg`<rect class="band ${b.on ? "on" : ""}" x=${x(b.s)} y=${bandY} width=${Math.max(1, w)} height=${bandH}></rect>
              ${fitText(b.text, w) ? svg`<text class="btxt" x=${x(b.s) + w / 2} y=${bandY + bandH / 2 + 4} text-anchor="middle">${fitText(b.text, w)}</text>` : nothing}`;
          })}
          ${model.manual.map(([a, b]) => svg`<rect class="red-band" x=${x(a)} y=${bandY} width=${Math.max(3, x(b) - x(a))} height=${bandH}></rect>`)}`}
        ${curve ? model.lines.map((l) => svg`<path class="line ${l.key}" d=${this._path(l.pts, model, x, y, l.key === "set")}></path>`) : nothing}
        ${curve ? model.manual.map((span) => {
          const base = model.lines.find((l) => l.key === "set") ?? model.lines.find((l) => l.key === "main") ?? model.lines[0];
          const pt = base?.pts.find((p, i) => p.v !== null && (base.pts[i + 1]?.m ?? Infinity) > span[0]);
          const dot = pt?.v ?? null;
          return svg`${base ? svg`<path class="line red" d=${this._path(base.pts, model, x, y, base.key === "set", span)}></path>` : nothing}
            ${dot !== null ? svg`<circle class="reddot" cx=${x(span[0])} cy=${y(dot)} r="3.5"></circle>` : nothing}`;
        }) : nothing}
        ${model.markers.map(mark)}
        ${nowLine}
        <rect class="hit" x="0" y="0" width=${W} height=${H}></rect>
      </svg>`;
  }

  static styles = css`
    :host { display: block; }
    .box { position: relative; width: 100%; min-height: 40px; }
    svg { display: block; user-select: none; outline: none; max-width: 100%; cursor: pointer; }
    svg:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; border-radius: 4px; }
    .grid { stroke: var(--divider-color, rgba(127, 127, 127, 0.3)); stroke-width: 1; }
    text { fill: var(--secondary-text-color); font-size: 10px; }
    text.val { fill: var(--primary-text-color); font-weight: 600; }
    text.btxt { fill: var(--primary-text-color); font-size: 11px; }
    .line { fill: none; stroke-width: 1.8; stroke-linejoin: round; }
    .line.measured { stroke: var(--accent-color, #ff9800); }
    .line.set { stroke: var(--primary-text-color); stroke-width: 1.6; stroke-dasharray: 5 3; }
    .line.main { stroke: var(--primary-color); stroke-width: 2; }
    .line.red { stroke: var(--error-color, #db4437); stroke-width: 3; stroke-dasharray: none; }
    .reddot { fill: var(--error-color, #db4437); }
    .track { fill: var(--divider-color, rgba(127, 127, 127, 0.2)); opacity: 0.5; }
    .band { fill: var(--secondary-text-color); opacity: 0.35; stroke: var(--card-background-color); stroke-width: 1; }
    .band.on { fill: var(--primary-color); opacity: 0.4; }
    .red-band { fill: var(--error-color, #db4437); opacity: 0.55; }
    .drop { stroke: var(--secondary-text-color); stroke-width: 1; stroke-dasharray: 1 3; opacity: 0.6; }
    .mk { fill: var(--c); stroke: var(--card-background-color); stroke-width: 1.5; }
    .mk.end { fill: var(--card-background-color); stroke: var(--c); stroke-width: 2; }
    .now { stroke: var(--primary-text-color); stroke-width: 1.5; }
    .hit { fill: transparent; }
    .note { padding: 24px 0; text-align: center; color: var(--secondary-text-color); font-size: 13px; }
    .legend { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 4px; font-size: 12px; color: var(--secondary-text-color); }
    .key { display: inline-flex; align-items: center; gap: 5px; }
    .key i { display: inline-block; width: 16px; height: 0; border-top: 3px solid var(--primary-color); }
    .key i.measured { border-top: 2px solid var(--accent-color, #ff9800); }
    .key i.set { border-top: 2px dashed var(--primary-text-color); }
    .key i.planned { width: 10px; height: 10px; border: 2px solid var(--secondary-text-color); border-radius: 50%; }
    .key i.manual { border-top: 3px solid var(--error-color, #db4437); }
  `;
}
