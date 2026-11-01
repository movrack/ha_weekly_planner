// 24-hour chart of one device (spec § 10.4), the same for every device: the Home Assistant history of the day
// (a curve for a number, else a band of states), the planned actions as markers (with their value), a "now"
// line, and the manual changes in red. Tapping the chart opens the Home Assistant history. Hand-made SVG.
// The x axis is in real minutes from the server-zone midnight, so a time-change day is 23 or 25 h.

import { upperBound, hasNearby } from "../sorted-times";
import { subscribeChartRefresh } from "../chart-refresh";
import { activePeriods, buildPlanned, shadeActive } from "../planned";
import type { Planned, Shade } from "../planned";
import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { t } from "../i18n";
import { actionValue, appliedAction, labelOf } from "../labels";
import { activeProfile, entityDomain, friendlyName } from "../planner";
import { addDaysIso, dateFormat, localMinutes, localWeekday, nominal, spillover } from "../time";
import { nowTip, sunDir, sunTip } from "./day-bar";
import "./tip";
import type { HomeAssistant, Label, PlannerData, PreviewSlot, Program, Slot, TimeSpec } from "../types";

// ---- date helpers (server time zone) -------------------------------------------------------

function offsetMs(ms: number, timeZone: string): number {
  const parts = dateFormat("en-GB", {
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

export { addDaysIso } from "../time";

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
interface Marker {
  m: number; label: Label; value: number | null; end: boolean;
  /** The time follows the sun: its icon side and the stored time (for the tooltip). */
  sun?: "up" | "down" | null; spec?: TimeSpec | null;
  /** Hidden by another slot (shown faded: still asked for, nothing happens). */
  ignored?: boolean;
}

interface Model {
  span: number;
  pastEnd: number; // minutes already elapsed (0 for a future day, span for a past day)
  isToday: boolean;
  kind: "curve" | "band";
  /** Curves: measured (climate), set (climate) or the single main one. */
  lines: { key: "measured" | "set" | "main"; pts: Pt[] }[];
  bands: { s: number; e: number; state: string; text: string; on: boolean }[];
  markers: Marker[];
  planned: Planned;
  shade: Shade[];
  manual: Span[];
  lo: number;
  hi: number;
  unit: string;
}

const NEAR = 60_000; // a change within a minute of a decision or an action of Weekly Planner (its journal) is its own
const caches = new WeakMap<object, Map<string, { at: number; p: Promise<any> }>>();
function cached<T>(scope: object, key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  let cache = caches.get(scope);
  if (!cache) { cache = new Map(); caches.set(scope, cache); }
  const entries = cache;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) {
    cache.delete(key); cache.set(key, hit);
    return hit.p;
  }
  const p = load();
  cache.set(key, { at: Date.now(), p });
  while (cache.size > 64) cache.delete(cache.keys().next().value!);
  p.catch(() => { if (entries.get(key)?.p === p) entries.delete(key); });
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

// mdi:clock-outline
const CLOCK = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z";

const isBad = (s: string) => s === "unavailable" || s === "unknown" || s === "";
const num = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) ? x : null);
/** Narrowest drawn active band (px) and height of its strip along the time axis (px). */
export const SHADE_MIN = 3;
export const SHADE_EDGE = 3;
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
  private _stopRefresh?: () => void;
  private _refresh = (): void => {
    if (document.hidden || !this.hass || !this.date) return;
    const { startMs, endMs } = dayBounds(this.date, this._tz);
    if (startMs <= Date.now() && Date.now() < endMs) void this._load();
  };

  private get _lang(): string { return this.hass?.locale?.language ?? this.hass?.language ?? "en"; }
  private get _tz(): string { return this.hass.config.time_zone; }

  connectedCallback(): void {
    super.connectedCallback();
    this._stopRefresh = subscribeChartRefresh(this._refresh);
    this._observer = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0].contentRect.width);
      if (w > 120 && w !== this._width) this._width = w;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer?.disconnect();
    this._stopRefresh?.();
    this._stopRefresh = undefined;
    this._token++;
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
        ? cached(this.hass.connection ?? this.hass, `h|${key}`, ttl, () => this.hass.callWS<Record<string, unknown>>({
          type: "history/history_during_period",
          start_time: new Date(startMs).toISOString(), end_time: end, entity_ids: [this.entityId],
          minimal_response: false, no_attributes: false, significant_changes_only: false,
        }))
        : Promise.resolve({} as Record<string, unknown>);
      // the logbook knows who changed a state; failing is fine, the chart just shows no manual change
      const logP = past
        ? cached(this.hass.connection ?? this.hass, `l|${key}`, ttl, () => this.hass.callWS<unknown>({
          type: "logbook/get_events",
          start_time: new Date(startMs).toISOString(), end_time: end, entity_ids: [this.entityId],
        })).catch(() => [])
        : Promise.resolve([]);
      const days = Math.min(14, Math.max(1, Math.ceil((now - startMs) / 86_400_000) + 1));
      const jourP = past
        ? cached(this.hass.connection ?? this.hass, `j|${this.entityId}|${days}`, 60_000, () =>
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
      if (token === this._token) {
        this._failed = true;
        // History is optional: keep the day's planned actions visible when HA cannot return it.
        this._loaded = { hist: [], log: [], sent: [] };
      }
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
        // a numeric sensor reports a measured quantity
        return { ...none, measured: Number.isFinite(n) ? n : null };
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
    interface Range { s: number; e: number | null; slot: Slot; spill?: boolean; ignored?: boolean }
    const ranges: Range[] = [];
    if (!this.slots) for (const { slot, end } of spillover(profile.days[(wd + 6) % 7])) {
      if (!slot.start.random_minutes && !slot.end?.random_minutes) ranges.push({ s: 0, e: end, slot, spill: true });
    }
    if (this.slots) {
      for (const r of this.slots) {
        const slot = slotById.get(r.slot_id);
        if (!slot) continue;
        const start = toM(Date.parse(r.start)), end = r.end ? toM(Date.parse(r.end)) : null;
        if (start >= span || (end === null ? start < 0 : end <= 0)) continue;
        ranges.push({ s: Math.max(0, start), e: end === null ? null : Math.min(span, end), slot,
          spill: start < 0, ignored: Boolean(r.ignored) });
      }
    } else {
      for (const slot of profile.days[wd]) {
        // Only server previews know the daily random delay; never invent an exact prediction.
        if (slot.start.random_minutes || slot.end?.random_minutes) continue;
        const s = nominal(slot.start);
        if (s === null) continue;
        const e = nominal(slot.end ?? null);
        ranges.push({ s, e: e === null ? null : e > s ? e : span, slot });
      }
    }
    const entity = this.program.entities.find((e) => e.entity_id === this.entityId);
    const defaultLabel = labelOf(this.data, entity?.default_label);
    const markers: Marker[] = [];
    const add = (m: number, label: Label | undefined, end: boolean, extra: Partial<Marker> = {}) => {
      if (!label || m < 0 || m > span) return;
      const action = appliedAction(this.hass, this.program, this.entityId, label);
      if (action) markers.push({ m, label, value: actionValue(action), end, ...extra });
    };
    for (const r of ranges) {
      if (!r.spill) add(r.s, labelOf(this.data, r.slot.label), false,
        { sun: sunDir(r.slot.start), spec: r.slot.start, ignored: r.ignored });
    }
    // the planned value as a staircase; the hollow circle only where the value really returns to the default
    const valueOf = (label: Label | undefined) => actionValue(appliedAction(this.hass, this.program, this.entityId, label));
    const planned = buildPlanned(
      ranges.filter((r) => !r.ignored).flatMap((r) => {
        const label = labelOf(this.data, r.slot.label);
        return label && appliedAction(this.hass, this.program, this.entityId, label)
          ? [{ start: r.s, end: r.e, color: label.color, value: valueOf(label) }] : [];
      }),
      defaultLabel ? { color: defaultLabel.color, value: valueOf(defaultLabel), active: Boolean(appliedAction(this.hass, this.program, this.entityId, defaultLabel)) } : null,
      span,
    );
    for (const m of planned.returns) add(m, defaultLabel, true);
    // real activity of the device (display only): one full-height band per active period, past only, whatever
    // setting was in force (a period outside every planned setting is shown too)
    const shade = shadeActive(
      activePeriods(loaded.hist.map((p) => ({ m: toM(p.t), state: p.s, attrs: p.a })), domain, pastEnd), pastEnd);
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
    const sentTimes = [...loaded.sent].sort((a, b) => a - b);
    const automatedTimes = loaded.log.filter((e) => e.context && !e.user).map((e) => e.t).sort((a, b) => a - b);
    const nearSent = (ms: number) => hasNearby(sentTimes, ms, NEAR);
    const starts: number[] = [];
    // an entry without a user and with the same state as before is HA coming back (restart, reload), not a change
    let prevState: string | undefined = loaded.hist[0]?.s;
    for (const e of loaded.log) {
      if (isBad(e.state)) continue;
      const same = e.state === prevState;
      prevState = e.state;
      if (e.user || (!e.context && !same && !nearSent(e.t))) starts.push(toM(e.t));
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
          const automated = hasNearby(automatedTimes, ms, NEAR);
          if (!nearSent(ms) && !automated && !starts.some((s) => Math.abs(s - p.m) <= 1)) starts.push(p.m);
        }
        if (p.v !== null) prev = p.v;
      }
    }
    starts.sort((a, b) => a - b);
    const stops = [...markers.map((m) => m.m), ...loaded.sent.map(toM), ...changeTimes, ...bands.map((b) => b.s),
      ...starts].sort((a, b) => a - b);
    const manual: Span[] = [];
    for (const s of starts) {
      // the value carried over from the day before is not a change of this day
      if (s <= 1 || s > pastEnd) continue;
      const next = stops[upperBound(stops, s + 0.5)];
      const e = Math.min(next ?? pastEnd, pastEnd);
      if (e > s) manual.push([s, e]);
      else manual.push([s, Math.min(s + 5, span)]);
    }

    // vertical range
    let lo = 0;
    let hi = 100;
    if (numeric && domain !== "cover" && domain !== "light") {
      const values = [...lines.flatMap((l) => l.pts.map((p) => p.v)), ...markers.map((m) => m.value), ...planned.steps.map((st) => st.value)]
        .filter((v): v is number => v !== null);
      if (values.length) {
        lo = Math.floor(values.reduce((a, b) => Math.min(a, b), Infinity) - 1);
        hi = Math.ceil(values.reduce((a, b) => Math.max(a, b), -Infinity) + 1);
        if (hi - lo < 2) hi = lo + 2;
      }
    }
    // The unit comes from the device itself; only a device that states none (climate has no
    // unit_of_measurement, a cover or light position is a percentage) falls back to what Home Assistant uses for it.
    const unit = String(this.hass.states[this.entityId]?.attributes.unit_of_measurement
      ?? (domain === "climate" ? this.hass.config?.unit_system?.temperature ?? "°C" : domain === "cover" || domain === "light" ? "%" : ""));
    return { span, pastEnd, isToday: startMs <= now && now < endMs, kind: numeric ? "curve" : "band",
      lines, bands, markers, planned, shade, manual, lo, hi, unit };
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

  /**
   * Path of a recorded series, by its role. A value that is SET (cover position, light brightness, setpoint: the
   * "main" and "set" series) holds until the next recorded change: staircase (horizontal, vertical jump at the
   * change time, last value held up to "now"), never an oblique line that would invent a progressive movement.
   * A MEASURED probe value (the "measured" series) is a continuous quantity sampled by history: a line through
   * the recorded points, then the last value held up to "now".
   */
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
    if (!model) body = html`<div class="note">${t(lang, "chart_loading")}</div>`;
    else body = this._renderChart(model);
    return html`<div class="box">${body}</div>${model ? html`${this._legend(model)}
      <div class="availability" role="status">
        ${this._failed ? html`<p>${t(lang, "chart_history_failed")}</p>`
          : !model.lines.length && !model.bands.length
            ? html`<p>${t(lang, model.pastEnd === 0 ? "chart_future_history" : "chart_no_history")}</p>` : nothing}
        ${!model.markers.some((m) => !m.ignored) && !model.planned.zones.length
          ? html`<p>${t(lang, "chart_no_planned")}</p>` : nothing}
      </div>` : nothing}`;
  }

  /** Name the person sees on the card for this chart: the program's own name for a one-device program. */
  private get _shownName(): string {
    return this.program?.entities.length === 1 ? this.program.name : friendlyName(this.hass, this.entityId);
  }

  private _legend(model: Model) {
    const lang = this._lang;
    const item = (cls: string, label: string, color?: string) =>
      html`<span class="key"><i class=${cls} style=${color ? `--k:${color}` : ""}></i>${label}</span>`;
    const has = (key: string) => model.lines.some((l) => l.key === key);
    return html`<div class="legend">
      ${model.markers.length || model.planned.steps.length ? item("planned", t(lang, "planned")) : nothing}
      ${has("measured") ? item("measured", t(lang, "measured")) : nothing}
      ${has("set") ? item("set", t(lang, "ch_set")) : nothing}
      ${model.shade.length ? item("active", t(lang, "active_key")) : nothing}
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
    const hourOf = (m: number) => dateFormat("en-GB", { timeZone: this._tz, hour: "2-digit", hourCycle: "h23" })
      .format(new Date(startMs + m * 60_000));
    const ticksX: number[] = [];
    for (let m = 0; m <= model.span; m += 180) ticksX.push(m);
    // round values on the vertical axis (1, 2, 5, 10… apart), never 17.3 or 20.7
    const ticksY: number[] = [];
    if (curve) {
      const range = model.hi - model.lo;
      const step = [1, 2, 5, 10, 20, 25, 50].find((x) => range / x <= 4) ?? 100;
      for (let v = Math.ceil(model.lo / step) * step; v <= model.hi + 1e-9; v += step) ticksY.push(v);
    }
    const top = PAD.t - 12;
    const bandY = PAD.t;
    const bandH = H - PAD.t - PAD.b;
    // Active periods: a translucent band over the whole plot height with a solid strip along the time axis, at
    // least SHADE_MIN px wide so a short period (a cover moving, a switch on for a minute) stays visible.
    const shades = model.shade.map((sh) => {
      const w = Math.max(SHADE_MIN, x(sh.to) - x(sh.from));
      return svg`<rect class="shade" x=${x(sh.from)} y=${bandY} width=${w} height=${bandH}></rect>
        <rect class="shade-edge" x=${x(sh.from)} y=${bandY + bandH - SHADE_EDGE} width=${w} height=${SHADE_EDGE}></rect>`;
    });
    const cyOf = (mk: Marker) => (curve && mk.value !== null ? y(mk.value) : top);
    // Value texts of two markers close together (the start of a step and the return to the default, or the last
    // markers of the day squeezed against the right edge) would print over each other ("15 15"): keep the first.
    const shown: { x: number; y: number }[] = [];
    const labelAt = (mk: Marker, cy: number) => {
      const lx = Math.min(Math.max(x(mk.m), 14), W - 14), ly = Math.max(cy - 8, 9);
      if (shown.some((o) => Math.abs(o.x - lx) < 26 && Math.abs(o.y - ly) < 12)) return null;
      shown.push({ x: lx, y: ly });
      return { lx, ly };
    };
    const mark = (mk: Marker) => {
      const cy = cyOf(mk);
      const at = mk.value !== null ? labelAt(mk, cy) : null;
      const color = mk.label.color;
      return svg`
        <line class="drop" x1=${x(mk.m)} x2=${x(mk.m)} y1=${cy} y2=${H - PAD.b}></line>
        ${mk.sun ? nothing : svg`<circle class="mk ${mk.end ? "end" : ""} ${mk.ignored ? "faded" : ""}" cx=${x(mk.m)} cy=${cy} r="5" style="--c:${color}"></circle>`}
        ${mk.value !== null && at ? svg`<text class="val" x=${at.lx} y=${at.ly} text-anchor="middle">${Number(mk.value.toFixed(1))}</text>` : nothing}`;
    };
    // the reference curve is the same for every manual interval: look it up once per render
    const base = curve ? model.lines.find((l) => l.key === "set") ?? model.lines.find((l) => l.key === "main") ?? model.lines[0] : undefined;
    const nowLine = model.isToday
      ? svg`<line class="now" x1=${x(model.pastEnd)} x2=${x(model.pastEnd)} y1=${PAD.t - 4} y2=${H - PAD.b}></line>
        <g class="nowicon" aria-hidden="true" transform="translate(${x(model.pastEnd) - 6}, ${PAD.t - 17}) scale(0.5)"><path d=${CLOCK}></path></g>` : nothing;
    return html`<div class="cwrap">
      <svg width=${W} height=${H} viewBox="0 0 ${W} ${H}" tabindex="0" role="button"
        aria-label=${t(lang, "chart_open", { name: this._shownName })}
        @click=${() => this._open()}
        @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this._open(); } }}>
        ${curve ? shades : nothing}
        ${ticksY.map((v) => svg`<line class="grid" x1=${PAD.l} x2=${W - PAD.r} y1=${y(v)} y2=${y(v)}></line>
          <text class="ylab" x=${PAD.l - 4} y=${y(v) + 3} text-anchor="end">${Number(v.toFixed(1))}</text>`)}
        ${curve && model.unit ? svg`<text class="unit" x="2" y="10">${model.unit}</text>` : nothing}
        ${ticksX.map((m) => svg`<text class="xlab" x=${x(m)} y=${H - 6} text-anchor=${m === 0 ? "start" : "middle"}>${Number(hourOf(m))}h</text>`)}
        ${curve ? nothing : svg`
          <rect class="track" x=${PAD.l} y=${bandY} width=${W - PAD.l - PAD.r} height=${bandH} rx="6"></rect>
          ${model.bands.map((b) => svg`<rect class="band ${b.on ? "on" : ""}" x=${x(b.s)} y=${bandY} width=${Math.max(1, x(b.e) - x(b.s))} height=${bandH}></rect>`)}
          ${shades}
          ${model.bands.map((b) => {
            const w = x(b.e) - x(b.s);
            return fitText(b.text, w) ? svg`<text class="btxt" x=${x(b.s) + w / 2} y=${bandY + bandH / 2 + 4} text-anchor="middle">${fitText(b.text, w)}</text>` : nothing;
          })}
          ${model.manual.map(([a, b]) => svg`<rect class="red-band" x=${x(a)} y=${bandY} width=${Math.max(3, x(b) - x(a))} height=${bandH}></rect>`)}`}
        ${curve ? model.lines.map((l) => svg`<path class="line ${l.key}" d=${this._path(l.pts, model, x, y, l.key !== "measured")}></path>`) : nothing}
        ${curve ? model.manual.map((span) => {
          const pt = base?.pts.find((p, i) => p.v !== null && (base.pts[i + 1]?.m ?? Infinity) > span[0]);
          const dot = pt?.v ?? null;
          return svg`${base ? svg`<path class="line red" d=${this._path(base.pts, model, x, y, base.key !== "measured", span)}></path>` : nothing}
            ${dot !== null ? svg`<circle class="reddot" cx=${x(span[0])} cy=${y(dot)} r="3.5"></circle>` : nothing}`;
        }) : nothing}
        ${curve ? model.planned.steps.map((st) => svg`<path class="plan" d="M${x(st.from).toFixed(1)},${y(st.value).toFixed(1)}H${x(st.to).toFixed(1)}" style="--c:${st.color}"></path>`) : nothing}
        ${curve ? model.planned.risers.map((r) => svg`<line class="riser" x1=${x(r.m)} x2=${x(r.m)} y1=${y(r.from)} y2=${y(r.to)} style="--c:${r.color}"></line>`) : nothing}
        ${[...model.markers].sort((a, b) => a.m - b.m).map(mark)}
        ${nowLine}
        <rect class="hit" x="0" y="0" width=${W} height=${H}></rect>
      </svg>
      ${model.markers.filter((mk) => mk.sun).map((mk) => html`<wp-tip class="suntip ${mk.ignored ? "faded" : ""}"
        style="left:${x(mk.m)}px;top:${cyOf(mk)}px;--c:${mk.label.color}" text=${sunTip(lang, mk.spec, mk.m)}>
        <span class="sunc"><ha-icon icon=${mk.sun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span></wp-tip>`)}
      ${model.isToday ? html`<wp-tip class="nowtip" style="left:${x(model.pastEnd)}px;top:${PAD.t - 11}px"
        text=${nowTip(lang, localMinutes(new Date(), this._tz))}></wp-tip>` : nothing}
    </div>`;
  }

  static styles = css`
    :host { display: block; }
    .box { position: relative; width: 100%; min-height: 40px; }
    .availability { color: var(--secondary-text-color); font-size: 13px; line-height: 1.5; }
    .availability p { margin: 4px 0; }
    .cwrap { position: relative; width: fit-content; max-width: 100%; }
    .nowtip { position: absolute; transform: translate(-50%, -50%); }
    .suntip { position: absolute; transform: translate(-50%, -50%); }
    .sunc {
      width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center;
      --mdc-icon-size: 14px; background: var(--card-background-color, #fff); color: var(--primary-text-color);
      box-shadow: 0 0 0 2px var(--c);
    }
    .faded { opacity: 0.45; }
    svg { display: block; user-select: none; outline: none; max-width: 100%; cursor: pointer; }
    svg:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; border-radius: 4px; }
    .grid { stroke: var(--divider-color, rgba(127, 127, 127, 0.3)); stroke-width: 1; }
    text { fill: var(--secondary-text-color); font-size: 10px; }
    text.unit { font-size: 11px; }
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
    /* active periods: same colour in light and dark themes, translucent so the curve stays readable on top */
    .shade { fill: var(--wp-active-color, var(--primary-color)); opacity: 0.28; }
    .shade-edge { fill: var(--wp-active-color, var(--primary-color)); }
    .plan { fill: none; stroke: var(--c); stroke-width: 3; stroke-linecap: butt; }
    .riser { stroke: var(--c); stroke-width: 1.2; opacity: 0.8; }
    .drop { stroke: var(--secondary-text-color); stroke-width: 1; stroke-dasharray: 1 3; opacity: 0.6; }
    .mk { fill: var(--c); stroke: var(--card-background-color); stroke-width: 1.5; }
    .mk.end { fill: var(--card-background-color); stroke: var(--c); stroke-width: 2; }
    .now { stroke: var(--primary-text-color); stroke-width: 1.5; }
    .nowicon path { fill: var(--primary-text-color); }
    .hit { fill: transparent; }
    .note { padding: 24px 0; text-align: center; color: var(--secondary-text-color); font-size: 13px; }
    .legend { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 4px; font-size: 14px; color: var(--secondary-text-color); }
    .key { display: inline-flex; align-items: center; gap: 5px; }
    .key i { display: inline-block; width: 16px; height: 0; border-top: 3px solid var(--primary-color); }
    .key i.measured { border-top: 2px solid var(--accent-color, #ff9800); }
    .key i.set { border-top: 2px dashed var(--primary-text-color); }
    /* a filled dot at the left, like the marker drawn at the start of each planned step (.mk, r=5), then the line */
    .key i.planned { position: relative; width: 24px; height: 0; border-top: 3px solid var(--secondary-text-color); border-radius: 2px; }
    .key i.planned::before {
      content: ""; position: absolute; left: 0; top: -6.5px; width: 10px; height: 10px; box-sizing: border-box; border-radius: 50%;
      background: var(--secondary-text-color); border: 1.5px solid var(--card-background-color);
    }

    /* the band of the chart in small: translucent block with the solid strip at its foot */
    .key i.active { position: relative; width: 16px; height: 12px; box-sizing: border-box; border-top: 0;
      border-bottom: 3px solid var(--wp-active-color, var(--primary-color)); }
    .key i.active::before {
      content: ""; position: absolute; inset: 0; background: var(--wp-active-color, var(--primary-color)); opacity: 0.28;
    }
    .key i.manual { border-top: 3px solid var(--error-color, #db4437); }
  `;
}
