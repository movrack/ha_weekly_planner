// 24-hour chart of one entity (spec § 10.4): planned staircase colored by mode, applied and
// measured curves from the recorder, shaded zones. Hand-made SVG, no library.
// The x axis is in real minutes from the server-zone midnight, so a time-change day is 23 or 25 h.

import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { strings, t } from "../i18n";
import { activeProfile, entityDomain, friendlyName, slotColor, slotLabel } from "../planner";
import { localMinutes, localWeekday, nominal, spillover } from "../time";
import type { HomeAssistant, Mode, PlannerData, PreviewSlot, Program, Setpoint, Slot } from "../types";

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

interface Seg { s: number; e: number; v: number | null; color: string; label: string }
interface Pt { m: number; v: number | null; heating?: boolean; open?: boolean }
type Interval = [number, number];

interface Model {
  span: number;
  pastEnd: number; // minutes already elapsed (0 for a future day, span for a past day)
  isToday: boolean;
  planned: Seg[];
  applied: Pt[];
  measured: Pt[];
  heat: Interval[];
  win: Interval[];
  over: Interval[];
  lo: number;
  hi: number;
  unit: string;
}

interface HistPoint { t: number; s: string; a: Record<string, any> }
interface Loaded { hist: HistPoint[]; win: HistPoint[]; journal: any[] }

const cache = new Map<string, { at: number; p: Promise<any> }>();
function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.p;
  const p = load();
  cache.set(key, { at: Date.now(), p });
  p.catch(() => cache.delete(key));
  return p;
}

const GRAY = "var(--disabled-text-color, #9e9e9e)";

function parseHistory(raw: unknown): HistPoint[] {
  if (!Array.isArray(raw)) return [];
  const out: HistPoint[] = [];
  let attrs: Record<string, any> = {};
  for (const item of raw as any[]) {
    if (item.a) attrs = item.a;
    const sec = item.lu ?? item.lc ?? item.last_updated_ts;
    const t = typeof sec === "number" ? sec * 1000 : Date.parse(item.last_updated ?? "");
    if (Number.isNaN(t)) continue;
    out.push({ t, s: String(item.s ?? item.state ?? ""), a: attrs });
  }
  return out;
}

const isBad = (s: string) => s === "unavailable" || s === "unknown" || s === "";
const num = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) ? x : null);

@customElement("wp-chart")
export class WpChart extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;
  @property({ attribute: "entity-id" }) entityId = "";
  @property() date = "";
  /** Two lines only (planned and measured); no applied curve, no zones. */
  @property({ type: Boolean }) simple = false;
  /** Resolved slots of the day (null when the preview failed: nominal times are used). */
  @property({ attribute: false }) slots: PreviewSlot[] | null = null;

  @state() private _width = 320;
  @state() private _loaded: Loaded | null = null;
  @state() private _failed = false;
  @state() private _cursor: number | null = null;
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
    this._cursor = null;
    const { startMs, endMs } = dayBounds(this.date, this._tz);
    const now = Date.now();
    const live = endMs > now;
    const ttl = live ? 60_000 : Infinity;
    const windowId = this._windowSensor();
    try {
      const histP = startMs < now
        ? cached(`h|${key}|${windowId}`, ttl, () =>
          this.hass.callWS<Record<string, unknown>>({
            type: "history/history_during_period",
            start_time: new Date(startMs).toISOString(),
            end_time: new Date(Math.min(endMs, now)).toISOString(),
            entity_ids: windowId ? [this.entityId, windowId] : [this.entityId],
            minimal_response: false, no_attributes: false, significant_changes_only: false,
          }))
        : Promise.resolve({} as Record<string, unknown>);
      const days = Math.min(14, Math.max(1, Math.ceil((now - startMs) / 86_400_000) + 1));
      const jourP = startMs < now
        ? cached(`j|${this.entityId}|${days}`, 60_000, () =>
          this.hass.callWS<{ segments: any[] }>({ type: "weekly_planner/journal", entity_id: this.entityId, days }))
          .catch(() => ({ segments: [] as any[] }))
        : Promise.resolve({ segments: [] as any[] });
      const [hist, jour] = await Promise.all([histP, jourP]);
      if (token !== this._token) return;
      this._loaded = {
        hist: parseHistory(hist[this.entityId]),
        win: windowId ? parseHistory(hist[windowId]) : [],
        journal: (jour.segments ?? []).filter((e: any) => e.entity_id === this.entityId),
      };
    } catch {
      if (token === this._token) this._failed = true;
    }
  }

  /** A window binary sensor of a thermostat (id contains the climate name and "window"). */
  private _windowSensor(): string | null {
    if (entityDomain(this.entityId) !== "climate") return null;
    const name = this.entityId.split(".")[1];
    return Object.keys(this.hass.states).find(
      (id) => id.startsWith("binary_sensor.") && id.includes(name) && id.includes("window"),
    ) ?? null;
  }

  // ---- values ----

  private _modeSetpoint(modeId: string | undefined, entityId: string): Setpoint | null {
    const mode = this.data.modes.find((m: Mode) => m.id === modeId);
    return mode ? mode.exceptions?.[entityId] ?? mode.value : null;
  }

  private _slotSetpoint(slot: Slot): Setpoint | null {
    return slot.actions.by_entity[this.entityId]
      ?? this._modeSetpoint(slot.actions.by_type[entityDomain(this.entityId)], this.entityId);
  }

  /** Numeric level of a setpoint for the chart (null: nothing to draw). */
  private _value(sp: Setpoint | null | undefined): number | null {
    if (!sp) return null;
    const domain = entityDomain(this.entityId);
    if (domain === "climate") {
      const direct = num(sp.temperature);
      if (direct !== null) return direct;
      if (sp.kind === "preset") return this._presetTemperature(String(sp.preset));
      return null; // off / hvac_mode only
    }
    if (domain === "cover") {
      if (sp.kind === "open") return 100;
      if (sp.kind === "close") return 0;
      return sp.kind === "position" ? num(sp.position) : null;
    }
    if (domain === "light") {
      if (sp.kind === "off") return 0;
      if (sp.kind === "on") return num(sp.brightness) ?? 100;
      return null;
    }
    return sp.kind === "value" ? num(sp.value) : null;
  }

  private _presetTemperature(preset: string): number | null {
    const a = this.hass.states[this.entityId]?.attributes ?? {};
    const direct = num(a.preset_temperatures?.[preset]) ?? num(a[`${preset}_temp`]) ?? num(a[`${preset}_temperature`]);
    if (direct !== null) return direct;
    // No temperature known: one level per preset between the thermostat limits.
    const modes: string[] = Array.isArray(a.preset_modes) ? a.preset_modes : [];
    const idx = modes.indexOf(preset);
    if (idx < 0) return null;
    const lo = num(a.min_temp) ?? 5;
    const hi = num(a.max_temp) ?? 30;
    return lo + ((idx + 1) / (modes.length + 1)) * (hi - lo);
  }

  private _live(point: HistPoint): { applied: number | null; measured: number | null } {
    const domain = entityDomain(this.entityId);
    if (isBad(point.s)) return { applied: null, measured: null };
    if (domain === "climate") return { applied: num(point.a.temperature), measured: num(point.a.current_temperature) };
    if (domain === "cover") return { applied: num(point.a.current_position), measured: null };
    if (domain === "light") {
      const b = point.s === "on" ? num(point.a.brightness) : 0;
      return { applied: b === null ? (point.s === "on" ? 100 : 0) : (b / 255) * 100, measured: null };
    }
    const n = Number(point.s);
    return { applied: Number.isFinite(n) ? n : null, measured: null };
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
    const modes = this.data.modes;
    const profile = activeProfile(this.program, this.data);
    const slotById = new Map<string, Slot>();
    for (const p of this.program.profiles) for (const sl of p.days.flat()) slotById.set(sl.id, sl);
    const fallback = t(this._lang, "override");

    // planned from the resolved slots
    const wd = weekdayOf(this.date);
    interface Range { s: number; e: number; slot: Slot }
    const ranges: Range[] = [];
    for (const { slot, end } of spillover(profile.days[(wd + 6) % 7])) ranges.push({ s: 0, e: end, slot });
    if (this.slots) {
      for (const r of this.slots) {
        const slot = slotById.get(r.slot_id);
        if (!slot || r.ignored) continue;
        const s = Math.max(0, toM(Date.parse(r.start)));
        const e = r.end ? Math.min(span, toM(Date.parse(r.end))) : s + 5;
        if (e > s) ranges.push({ s, e, slot });
      }
    } else {
      for (const slot of profile.days[wd]) {
        const s = nominal(slot.start);
        if (s === null) continue;
        const e = nominal(slot.end ?? null);
        ranges.push({ s, e: e === null ? s + 5 : e > s ? e : span, slot });
      }
    }
    ranges.sort((a, b) => a.s - b.s);

    const entityDefault = this.program.entities.find((e) => e.entity_id === this.entityId)?.default;
    const defaultSp: Setpoint | null = !entityDefault ? null
      : entityDefault.kind === "mode" ? this._modeSetpoint(String(entityDefault.value), this.entityId)
        : entityDefault.kind === "setpoint" ? (entityDefault.value as Setpoint) : null;
    const defaultMode = entityDefault?.kind === "mode" ? modes.find((m) => m.id === entityDefault.value) : undefined;
    const keepPrevious = entityDefault?.kind === "previous";

    const plan: Seg[] = [];
    let cursor = 0;
    const gap = (to: number) => {
      if (to <= cursor) return;
      const last = plan[plan.length - 1];
      plan.push(keepPrevious && last
        ? { ...last, s: cursor, e: to }
        : { s: cursor, e: to, v: this._value(defaultSp), color: defaultMode?.color ?? GRAY, label: defaultMode?.name ?? t(this._lang, "default_state") });
      cursor = to;
    };
    for (const r of ranges) {
      const s = Math.max(r.s, cursor);
      if (r.e <= s) continue;
      gap(s);
      const sp = this._slotSetpoint(r.slot);
      plan.push({
        s, e: r.e, v: this._value(sp), color: slotColor(r.slot, this.program, modes),
        label: slotLabel(r.slot, this.program, modes, this._lang),
      });
      cursor = r.e;
    }
    gap(span);
    const planAt = (m: number) => plan.find((p) => m >= p.s && m < p.e) ?? plan[plan.length - 1];

    // past: what was actually decided
    const jr = loaded.journal
      .map((e) => ({ m: toM(Date.parse(e.at)), e }))
      .filter((x) => !Number.isNaN(x.m))
      .sort((a, b) => a.m - b.m);
    const jourAt = (m: number): Seg | null => {
      let found: (typeof jr)[number] | null = null;
      for (const x of jr) if (x.m <= m) found = x; else break;
      if (!found) return null;
      const slot = found.e.slot_id ? slotById.get(found.e.slot_id) : undefined;
      return {
        s: found.m, e: found.m, v: this._value(found.e.setpoint),
        color: slot ? slotColor(slot, this.program, modes) : GRAY,
        label: slot ? slotLabel(slot, this.program, modes, this._lang) : "",
      };
    };
    const cuts = new Set<number>([0, span, pastEnd]);
    plan.forEach((p) => { cuts.add(p.s); cuts.add(p.e); });
    jr.forEach((x) => { if (x.m > 0 && x.m < span) cuts.add(x.m); });
    const sorted = [...cuts].filter((c) => c >= 0 && c <= span).sort((a, b) => a - b);
    const planned: Seg[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const s = sorted[i];
      const e = sorted[i + 1];
      if (e - s < 0.01) continue;
      const mid = (s + e) / 2;
      const j = mid < pastEnd ? jourAt(mid) : null;
      const base = j ?? planAt(mid);
      planned.push({ s, e, v: base.v, color: base.color, label: base.label });
    }

    // recorder series
    const applied: Pt[] = [];
    const measured: Pt[] = [];
    const heat: Interval[] = [];
    for (const p of loaded.hist) {
      const m = Math.max(0, toM(p.t));
      const v = this._live(p);
      applied.push({ m, v: v.applied, heating: p.a.hvac_action === "heating" });
      measured.push({ m, v: v.measured });
    }
    const intervals = (pts: { m: number }[], pred: (i: number) => boolean): Interval[] => {
      const out: Interval[] = [];
      pts.forEach((p, i) => {
        if (!pred(i)) return;
        const end = i + 1 < pts.length ? pts[i + 1].m : pastEnd;
        if (end > p.m) {
          const last = out[out.length - 1];
          if (last && Math.abs(last[1] - p.m) < 0.01) last[1] = end; else out.push([p.m, end]);
        }
      });
      return out;
    };
    heat.push(...intervals(applied, (i) => Boolean(applied[i].heating)));
    const winPts = loaded.win.map((p) => ({ m: Math.max(0, toM(p.t)), open: p.s === "on" }));
    const win = intervals(winPts, (i) => winPts[i].open);

    const at = (pts: Pt[], m: number): number | null => {
      let v: number | null = null;
      let seen = false;
      for (const p of pts) if (p.m <= m) { v = p.v; seen = true; } else break;
      return seen ? v : null;
    };
    const plannedAt = (m: number) => planned.find((p) => m >= p.s && m < p.e)?.v ?? null;
    const tol = domain === "climate" ? 0.5 : 5;
    const over: Interval[] = [];
    let run: number | null = null;
    const limit = Math.floor(pastEnd);
    for (let m = 0; m <= limit + 1; m++) {
      const p = m <= limit ? plannedAt(m + 0.5) : null;
      const a = m <= limit ? at(applied, m + 0.5) : null;
      const differ = p !== null && a !== null && Math.abs(p - a) > tol;
      if (differ && run === null) run = m;
      if (!differ && run !== null) {
        if (m - run > 2) over.push([run, m]);
        run = null;
      }
    }

    // vertical range
    const values = [...planned.map((p) => p.v), ...applied.map((p) => p.v), ...measured.map((p) => p.v)]
      .filter((v): v is number => v !== null);
    let lo = 0;
    let hi = 100;
    if (domain !== "cover" && domain !== "light" && values.length) {
      lo = Math.floor(Math.min(...values) - 1);
      hi = Math.ceil(Math.max(...values) + 1);
      if (hi - lo < 2) hi = lo + 2;
    }
    const unit = domain === "climate" ? "°C"
      : domain === "cover" || domain === "light" ? "%"
        : (this.hass.states[this.entityId]?.attributes.unit_of_measurement ?? "");
    return {
      span, pastEnd, isToday: startMs <= now && now < endMs, planned, applied, measured, heat, win, over, lo, hi, unit,
    };
  }

  // ---- interaction ----

  private _pointer(ev: PointerEvent): void {
    const model = this._model;
    if (!model) return;
    const rect = (ev.currentTarget as SVGElement).getBoundingClientRect();
    const x = ev.clientX - rect.left;
    this._cursor = this._clampM(((x - PAD.l) / (rect.width - PAD.l - PAD.r)) * model.span, model.span);
  }

  private _clampM(m: number, span: number): number {
    return Math.max(0, Math.min(span - 1, Math.round(m)));
  }

  private _key(ev: KeyboardEvent): void {
    const model = this._model;
    if (!model) return;
    const cur = this._cursor ?? Math.round(model.isToday ? model.pastEnd : model.span / 2);
    let next: number | null = null;
    if (ev.key === "ArrowLeft") next = cur - 15;
    else if (ev.key === "ArrowRight") next = cur + 15;
    else if (ev.key === "Home") next = 0;
    else if (ev.key === "End") next = model.span - 1;
    else if (ev.key === "Escape" && this._cursor !== null) {
      ev.stopPropagation();
      this._cursor = null;
      return;
    }
    if (next === null) return;
    ev.preventDefault();
    this._cursor = this._clampM(next, model.span);
  }

  // ---- render ----

  private _fmt(v: number | null, unit: string): string {
    return v === null ? "–" : `${Number(v.toFixed(1))}${unit ? " " + unit : ""}`;
  }

  private _clock(m: number): string {
    const { startMs } = dayBounds(this.date, this._tz);
    return new Intl.DateTimeFormat(this._lang, { timeZone: this._tz, hour: "2-digit", minute: "2-digit" })
      .format(new Date(startMs + m * 60_000));
  }

  private _valueAt(pts: Pt[], m: number): number | null {
    let v: number | null = null;
    for (const p of pts) if (p.m <= m) v = p.v; else break;
    return v;
  }

  private _path(pts: Pt[], model: Model, x: (m: number) => number, y: (v: number) => number, step: boolean): string {
    let d = "";
    let pen = false;
    let lastY = 0;
    pts.forEach((p, i) => {
      const end = i + 1 < pts.length ? pts[i + 1].m : model.pastEnd;
      if (p.v === null || end < p.m) { pen = false; return; }
      const py = y(p.v);
      if (step) {
        d += pen ? `V${py.toFixed(1)}H${x(end).toFixed(1)}` : `M${x(p.m).toFixed(1)},${py.toFixed(1)}H${x(end).toFixed(1)}`;
      } else {
        d += `${pen ? "L" : "M"}${x(p.m).toFixed(1)},${py.toFixed(1)}`;
        if (i + 1 === pts.length) d += `L${x(end).toFixed(1)},${py.toFixed(1)}`;
      }
      pen = true;
      lastY = py;
    });
    void lastY;
    return d;
  }

  render() {
    if (!this.hass || !this.data) return nothing;
    const s = strings(this._lang);
    const model = this._model;
    const name = friendlyName(this.hass, this.entityId);
    let body;
    if (this._failed) body = html`<div class="note">${s.no_data}</div>`;
    else if (!model) body = html`<div class="note">${s.chart_loading}</div>`;
    else if (!model.planned.some((p) => p.v !== null) && !model.applied.some((p) => p.v !== null)
      && !model.measured.some((p) => p.v !== null)) body = html`<div class="note">${s.no_data}</div>`;
    else body = this._renderChart(model, name);
    return html`<div class="box">${body}</div>${model ? this._legend(model) : nothing}`;
  }

  private _legend(model: Model) {
    const s = strings(this._lang);
    const item = (cls: string, label: string) => html`<span class="key"><i class=${cls}></i>${label}</span>`;
    return html`<div class="legend">
      ${item("planned", s.planned)}
      ${!this.simple && model.applied.some((p) => p.v !== null) ? item("applied", s.applied) : nothing}
      ${model.measured.some((p) => p.v !== null) ? item("measured", s.measured) : nothing}
      ${!this.simple && model.win.length ? item("zone win", s.window_open) : nothing}
      ${!this.simple && model.heat.length ? item("zone heat", s.heating) : nothing}
      ${!this.simple && model.over.length ? item("zone over", s.overridden) : nothing}
    </div>`;
  }

  private _renderChart(model: Model, name: string) {
    const s = strings(this._lang);
    const W = this._width;
    const H = HEIGHT;
    const x = (m: number) => PAD.l + (m / model.span) * (W - PAD.l - PAD.r);
    const y = (v: number) => PAD.t + (1 - (v - model.lo) / (model.hi - model.lo)) * (H - PAD.t - PAD.b);
    const { startMs } = dayBounds(this.date, this._tz);
    const ticksY = [0, 1, 2, 3].map((i) => model.lo + ((model.hi - model.lo) * i) / 3);
    const ticksX: number[] = [];
    for (let m = 0; m <= model.span; m += 180) ticksX.push(m);
    const zone = (list: Interval[], cls: string) =>
      list.map(([a, b]) => svg`<rect class="z ${cls}" x=${x(a)} y=${PAD.t} width=${Math.max(1, x(b) - x(a))}
        height=${H - PAD.t - PAD.b}></rect>`);
    const c = this._cursor;
    let tip: unknown = nothing;
    let line: unknown = nothing;
    let live = "";
    if (c !== null) {
      const seg = model.planned.find((p) => c >= p.s && c < p.e);
      const rows: [string, string][] = [];
      rows.push([s.planned, `${this._fmt(seg?.v ?? null, model.unit)}${seg?.label ? " · " + seg.label : ""}`]);
      if (c <= model.pastEnd) {
        if (!this.simple && model.applied.some((p) => p.v !== null)) rows.push([s.applied, this._fmt(this._valueAt(model.applied, c), model.unit)]);
        if (model.measured.some((p) => p.v !== null)) rows.push([s.measured, this._fmt(this._valueAt(model.measured, c), model.unit)]);
      }
      const flags: string[] = [];
      const within = (list: Interval[]) => list.some(([a, b]) => c >= a && c < b);
      if (within(model.win)) flags.push(s.window_open);
      if (within(model.heat)) flags.push(s.heating);
      if (within(model.over)) flags.push(s.overridden);
      live = `${this._clock(c)} — ${rows.map(([k, v]) => `${k} ${v}`).join(", ")}${flags.length ? ", " + flags.join(", ") : ""}`;
      const left = Math.min(Math.max(x(c), 70), W - 70);
      line = svg`<line class="cursor" x1=${x(c)} x2=${x(c)} y1=${PAD.t} y2=${H - PAD.b}></line>`;
      tip = html`<div class="tip" style="left:${left}px">
        <b>${this._clock(c)}</b>
        ${rows.map(([k, v]) => html`<div><span>${k}</span> ${v}</div>`)}
        ${flags.map((f) => html`<div class="flag">${f}</div>`)}
      </div>`;
    }
    const nowLine = model.isToday
      ? svg`<line class="now" x1=${x(model.pastEnd)} x2=${x(model.pastEnd)} y1=${PAD.t} y2=${H - PAD.b}></line>` : nothing;
    return html`
      <svg width=${W} height=${H} viewBox="0 0 ${W} ${H}" tabindex="0" role="application"
        aria-label=${t(this._lang, "chart_aria", { name })}
        @pointerdown=${this._pointer} @pointermove=${(e: PointerEvent) => (e.pointerType === "mouse" || e.buttons ? this._pointer(e) : undefined)}
        @pointerleave=${(e: PointerEvent) => { if (e.pointerType === "mouse") this._cursor = null; }}
        @keydown=${this._key}>
        ${ticksY.map((v) => svg`<line class="grid" x1=${PAD.l} x2=${W - PAD.r} y1=${y(v)} y2=${y(v)}></line>
          <text class="ylab" x=${PAD.l - 4} y=${y(v) + 3} text-anchor="end">${Number(v.toFixed(model.unit === "°C" ? 1 : 0))}</text>`)}
        ${ticksX.map((m) => svg`<text class="xlab" x=${x(m)} y=${H - 6}
          text-anchor=${m === 0 ? "start" : "middle"}>${Math.floor(localMinutes(new Date(startMs + m * 60_000), this._tz) / 60)}h</text>`)}
        ${this.simple ? nothing : svg`${zone(model.win, "win")}${zone(model.heat, "heat")}${zone(model.over, "over")}`}
        ${model.planned.map((p, i) => {
          const prev = model.planned[i - 1];
          return p.v === null ? nothing : svg`
            ${prev && prev.v !== null ? svg`<line class="riser" x1=${x(p.s)} x2=${x(p.s)} y1=${y(prev.v)} y2=${y(p.v)}></line>` : nothing}
            <line class="plan" x1=${x(p.s)} x2=${x(p.e)} y1=${y(p.v)} y2=${y(p.v)} style="stroke:${p.color}"></line>`;
        })}
        ${this.simple ? nothing : svg`<path class="applied" d=${this._path(model.applied, model, x, y, true)}></path>`}
        <path class="measured" d=${this._path(model.measured, model, x, y, false)}></path>
        ${nowLine}${line}
        <rect class="hit" x=${PAD.l} y=${PAD.t} width=${W - PAD.l - PAD.r} height=${H - PAD.t - PAD.b}></rect>
      </svg>
      ${tip}
      <div class="sr" aria-live="polite">${live}</div>`;
  }

  static styles = css`
    :host { display: block; }
    .box { position: relative; width: 100%; min-height: 40px; }
    svg { display: block; touch-action: pan-y; user-select: none; outline: none; max-width: 100%; }
    svg:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; border-radius: 4px; }
    .grid { stroke: var(--divider-color, rgba(127, 127, 127, 0.3)); stroke-width: 1; }
    text { fill: var(--secondary-text-color); font-size: 10px; }
    .plan { stroke-width: 4; stroke-linecap: butt; }
    .riser { stroke: var(--divider-color, #999); stroke-width: 1.5; }
    .applied { fill: none; stroke: var(--primary-text-color); stroke-width: 1.6; stroke-dasharray: 5 3; }
    .measured { fill: none; stroke: var(--accent-color, #ff9800); stroke-width: 1.8; }
    .z.win { fill: var(--info-color, #2196f3); opacity: 0.18; }
    .z.heat { fill: var(--warning-color, #ff5722); opacity: 0.14; }
    .z.over { fill: var(--secondary-text-color); opacity: 0.2; }
    .now { stroke: var(--primary-text-color); stroke-width: 1; stroke-dasharray: 2 2; }
    .cursor { stroke: var(--primary-text-color); stroke-width: 1; }
    .hit { fill: transparent; cursor: crosshair; }
    .tip {
      position: absolute; top: 0; transform: translateX(-50%); pointer-events: none; z-index: 1;
      background: var(--card-background-color, #fff); color: var(--primary-text-color);
      border: 1px solid var(--divider-color); border-radius: 8px; padding: 4px 8px; font-size: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25); white-space: nowrap;
    }
    .tip span { color: var(--secondary-text-color); }
    .tip .flag { color: var(--secondary-text-color); font-style: italic; }
    .note { padding: 24px 0; text-align: center; color: var(--secondary-text-color); font-size: 13px; }
    .legend { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 4px; font-size: 11px; color: var(--secondary-text-color); }
    .key { display: inline-flex; align-items: center; gap: 5px; }
    .key i { display: inline-block; width: 16px; height: 0; border-top: 3px solid var(--primary-color); }
    .key i.applied { border-top: 2px dashed var(--primary-text-color); }
    .key i.measured { border-top: 2px solid var(--accent-color, #ff9800); }
    .key i.zone { height: 10px; border: none; width: 12px; border-radius: 2px; }
    .key i.win { background: var(--info-color, #2196f3); opacity: 0.4; }
    .key i.heat { background: var(--warning-color, #ff5722); opacity: 0.35; }
    .key i.over { background: var(--secondary-text-color); opacity: 0.4; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  `;
}

const HEIGHT = 160;
const PAD = { l: 38, r: 10, t: 10, b: 22 };
