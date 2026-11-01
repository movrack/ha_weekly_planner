// Continuous timeline chart of one device (spec § 10.4), the same for every device: the Home Assistant history of the day
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
import { addDaysIso, dateFormat, localMinutes, localDateIso, localWeekday, nominal, spillover } from "../time";
import { fetchPreviewResponse, deviceSpans } from "../preview-cache";
import { applies } from "../slots";
import { nowTip, sunDir, sunTip } from "./day-bar";
import "./tip";
import "./chart-options";
import { entityHistories } from "../chart-history";
import { sourceColor, sourceUnit, numericAxes, axisTicks, mergeSourceDays, stateNumber, stateIntervals, stateName } from "../chart-sources";
import type { SourcePoint } from "../chart-sources";
import { minuteAt, slideTimeline, zoomTimeline, tickStep, ticksIn } from "../chart-zoom";
import type { ZoomWindow } from "../chart-zoom";
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
/** Drag shorter than this (px) is a tap or a click, not a pan or a selection. */
const DRAG_PX = 6;
/** A click this soon after a zoom gesture ended belongs to it (it must not open the history). */
const CLICK_GUARD_MS = 350;
/** With a zoom, a click waits this long for a second one (double click = reset). */
const DOUBLE_MS = 300;
const PAD_CURVE = { l: 38, r: 10, t: 22, b: 22 };
const PAD_BAND = { l: 8, r: 10, t: 22, b: 22 };
const ON_STATES = new Set(["on", "open", "heat", "home", "playing", "cleaning", "unlocked", "armed_home", "armed_away"]);

@customElement("wp-chart")
export class WpChart extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;
  @property({ attribute: "entity-id" }) entityId = "";
  /** The chart-options panel (extra entities) is offered in the schedule window only, never on the dashboard card. */
  @property({ type: Boolean, attribute: "show-options" }) showOptions = false;
  @property() date = "";
  /** Resolved slots of the day (null when the preview failed: nominal times are used). */
  @property({ attribute: false }) slots: PreviewSlot[] | null = null;

  @state() private _width = 320;
  @state() private _loaded: Loaded | null = null;
  /** Visible real-minute interval around the selected day; null = that whole day. Per chart view: reset when the day or device changes. */
  @state() private _zoom: ZoomWindow | null = null;
  /** Rubber band being drawn (x in chart px). */
  @state() private _band: { a: number; b: number } | null = null;
  private _ptrs = new Map<number, { x: number; y: number }>();
  private _gesture: (
    | { kind: "pinch"; win: ZoomWindow; dist: number; anchor: number }
    | { kind: "pan"; win: ZoomWindow; x0: number; y0: number; moved: boolean }
    | { kind: "select"; x0: number; moved: boolean }
  ) | null = null;
  private _sourceKey = "";
  @state() private _sourceHistory: Record<string, SourcePoint[]> = {};
  @state() private _sourceFailures: string[] = [];
  @state() private _displayProgram: Program | null = null;
  private get _sources() {
    const program = this._displayProgram?.id === this.program.id && this._displayProgram.revision > this.program.revision ? this._displayProgram : this.program;
    return program.entities.find(e => e.entity_id === this.entityId)?.chart_sources ?? [];
  }
  private _dayData = new Map<string, { loaded: Loaded; slots: PreviewSlot[] | null }>();
  private _panLoadTimer?: ReturnType<typeof setTimeout>;
  private _guardUntil = 0;
  private _openTimer?: ReturnType<typeof setTimeout>;
  @state() private _failed = false;
  @state() private _previewFailed = false;
  private _model: Model | null = null;
  private _token = 0;
  private _observer?: ResizeObserver;
  private _stopRefresh?: () => void;
  private _refresh = (): void => {
    if (document.hidden || !this.hass || !this.date) return;
    const { startMs } = dayBounds(this.date, this._tz);
    if (startMs + this._win.from * 60_000 <= Date.now() && Date.now() < startMs + this._win.to * 60_000) void this._load();
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
    clearTimeout(this._openTimer);
    clearTimeout(this._panLoadTimer);
  }

  firstUpdated(): void {
    const box = this.renderRoot.querySelector(".box");
    if (box) this._observer?.observe(box);
  }

  willUpdate(changed: Map<string, unknown>): void {
    if (!this.hass || !this.program || !this.data || !this.date) return;
    const source = `${this.entityId}|${this.date}|${this._tz}|${this.program.id}|${Math.max(this.program.revision, this._displayProgram?.id === this.program.id ? this._displayProgram.revision : 0)}|${activeProfile(this.program, this.data).id}`;
    if (changed.has("entityId") || changed.has("date")) {
      this._zoom = null; this._band = null; this._gesture = null; this._ptrs.clear();
    }
    if (source !== this._sourceKey) {
      this._sourceKey = source;
      this._dayData.clear(); this._loaded = null; this._sourceHistory = {}; this._sourceFailures = [];
      clearTimeout(this._panLoadTimer);
      void this._load();
    } else if (changed.has("slots")) {
      const initial = this._dayData.get(this.date);
      if (initial) initial.slots = this.slots;
    }
    if (changed.has("slots") || changed.has("data") || changed.has("program") || changed.has("entityId")
      || changed.has("date") || changed.has("_loaded")) {
      this._model = this._loaded ? this._buildVisible() : null;
    }
  }

  private _visibleDates(): string[] {
    const { startMs } = dayBounds(this.date, this._tz);
    const win = this._win;
    const first = localDateIso(new Date(startMs + win.from * 60_000), this._tz);
    const last = localDateIso(new Date(startMs + win.to * 60_000 - 1), this._tz);
    const out = [first];
    while (out[out.length - 1] !== last && out.length < 3) out.push(addDaysIso(out[out.length - 1], 1));
    return out;
  }

  private async _load(): Promise<void> {
    if (!this.hass || !this.entityId || !this.date) return;
    const token = ++this._token;
    this._failed = false;
    const dates = this._visibleDates();
    const profile = activeProfile(this.program, this.data).id;
    const results = await Promise.all(dates.map(async date => {
      const bounds = dayBounds(date, this._tz);
      const failures: string[] = [];
      const [history, preview, sources] = await Promise.all([
        this._loadAt(date),
        this._previewAt(date, profile).catch(() => null),
        this._sources.length ? entityHistories(this.hass, this._sources.map(s => s.entity_id), bounds.startMs, bounds.endMs, id => failures.push(id)) : Promise.resolve({} as Record<string, SourcePoint[]>),
      ]);
      return { date, ...history, slots: preview, sources, failures };
    }));
    if (token !== this._token) return;
    this._dayData = new Map(results.map(r => [r.date, { loaded: r.loaded, slots: r.slots }]));
    this._failed = results.some(r => r.failed);
    this._previewFailed = results.some(r => r.slots === null);
    this._loaded = results[0]?.loaded ?? { hist: [], log: [], sent: [] };
    this._sourceHistory = Object.fromEntries(this._sources.map(source => {
      return [source.entity_id, mergeSourceDays(results.map(r => {
        const bounds = dayBounds(r.date, this._tz);
        return { start: bounds.startMs, end: bounds.endMs, history: r.sources[source.entity_id] ?? [] };
      }))];
    }));
    this._sourceFailures = [...new Set(results.flatMap(r => r.failures))];
    this._model = this._buildVisible();
  }

  private async _previewAt(date: string, profileId: string): Promise<PreviewSlot[]> {
    // Parent views already combine the selected day's previous-day tails.
    if (date === this.date && this.slots !== null) return this.slots;
    const response = await fetchPreviewResponse(this.hass, this.program.id, this.program.revision, date, profileId);
    const current = deviceSpans(response, this.entityId);
    if (response.by_entity) return current; // this response already includes previous-day tails
    const previous = await fetchPreviewResponse(this.hass, this.program.id, this.program.revision, addDaysIso(date, -1), profileId);
    const midnight = dayBounds(date, this._tz).startMs;
    return [...deviceSpans(previous, this.entityId).filter(slot => slot.end && Date.parse(slot.start) < midnight && Date.parse(slot.end) > midnight), ...current];
  }

  private async _loadAt(date: string): Promise<{ loaded: Loaded; failed: boolean }> {
    const key = `${this.entityId}|${date}|${this._tz}`;
    const { startMs, endMs } = dayBounds(date, this._tz);
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
      return { loaded: {
        hist: parseHistory(hist[this.entityId]).filter(p => p.t <= Math.min(endMs, now)),
        log: parseLogbook(log),
        sent: (jour.segments ?? []).filter((e: any) => e.entity_id === this.entityId).map((e: any) => Date.parse(e.at)),
      }, failed: false };
    } catch {
      return { loaded: { hist: [], log: [], sent: [] }, failed: true };
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

  private _build(loaded: Loaded, date = this.date, preview = this.slots): Model {
    const tz = this._tz;
    const { startMs, endMs } = dayBounds(date, tz);
    const span = Math.round((endMs - startMs) / 60_000);
    const now = Date.now();
    const pastEnd = Math.max(0, Math.min(span, (now - startMs) / 60_000));
    const toM = (ms: number) => (ms - startMs) / 60_000;
    const domain = entityDomain(this.entityId);
    const profile = activeProfile(this.program, this.data);
    const slotById = new Map<string, Slot>();
    for (const p of this.program.profiles) for (const sl of p.days.flat()) slotById.set(sl.id, sl);

    // planned actions: a marker at the start of each slot, and the default at the end of a slot with an end
    const wd = weekdayOf(date);
    interface Range { s: number; e: number | null; slot: Slot; spill?: boolean; ignored?: boolean }
    const ranges: Range[] = [];
    // only this device's slots (`applies`); the server preview is already per device (`by_entity`)
    const mine = (slot: Slot) => applies(slot, this.entityId);
    if (!preview) for (const { slot, end } of spillover(profile.days[(wd + 6) % 7].filter(mine))) {
      if (!slot.start.random_minutes && !slot.end?.random_minutes) ranges.push({ s: 0, e: end, slot, spill: true });
    }
    if (preview) {
      for (const r of preview) {
        const slot = slotById.get(r.slot_id);
        if (!slot || !mine(slot)) continue;
        const start = toM(Date.parse(r.start)), end = r.end ? toM(Date.parse(r.end)) : null;
        if (start >= span || (end === null ? start < 0 : end <= 0)) continue;
        ranges.push({ s: Math.max(0, start), e: end === null ? null : Math.min(span, end), slot,
          spill: start < 0, ignored: Boolean(r.ignored) });
      }
    } else {
      for (const slot of (span === 1440 ? profile.days[wd] : []).filter(mine)) {
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
    const add = (m: number, label: Label | undefined, end: boolean, extra: Partial<Marker> = {}, slot?: Slot) => {
      if (!label || m < 0 || m > span) return;
      const action = appliedAction(this.hass, this.program, this.entityId, label, slot);
      if (action) markers.push({ m, label, value: actionValue(action), end, ...extra });
    };
    for (const r of ranges) {
      if (!r.spill) add(r.s, labelOf(this.data, r.slot.label), false,
        { sun: sunDir(r.slot.start), spec: r.slot.start, ignored: r.ignored }, r.slot);
    }
    // the planned value as a staircase; the hollow circle only where the value really returns to the default
    const valueOf = (label: Label | undefined) => actionValue(appliedAction(this.hass, this.program, this.entityId, label));
    const planned = buildPlanned(
      ranges.filter((r) => !r.ignored).flatMap((r) => {
        const label = labelOf(this.data, r.slot.label);
        return label && appliedAction(this.hass, this.program, this.entityId, label, r.slot)
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

  /** Build each local day independently before placing it on the continuous real-minute axis. */
  private _buildVisible(): Model {
    if (!this._dayData.size) return this._build(this._loaded!);
    const base = dayBounds(this.date, this._tz);
    const days = [...this._dayData].sort(([a], [b]) => a.localeCompare(b)).map(([date, entry]) => ({
      model: this._build(entry.loaded, date, entry.slots),
      offset: (dayBounds(date, this._tz).startMs - base.startMs) / 60_000,
    }));
    const first = days[0].model;
    const now = (Date.now() - base.startMs) / 60_000;
    const lines: Model["lines"] = [];
    for (const key of ["main", "set", "measured"] as const) {
      const pts = days.flatMap(({ model, offset }) => {
        const line = model.lines.find(l => l.key === key);
        if (!line) return [];
        const end = Math.min(model.span, model.pastEnd);
        const last = line.pts[line.pts.length - 1];
        return [...line.pts.filter(p => p.m <= end).map(p => ({ ...p, m: p.m + offset })),
          ...(last && end >= last.m ? [{ m: end + offset, v: last.v }] : []),
          { m: end + offset, v: null }];
      });
      if (pts.length) lines.push({ key, pts });
    }
    return { ...first, span: (base.endMs - base.startMs) / 60_000, pastEnd: now,
      isToday: now >= this._win.from && now <= this._win.to,
      kind: days.some(d => d.model.kind === "curve") ? "curve" : "band", lines,
      lo: Math.min(...days.map(d => d.model.lo)), hi: Math.max(...days.map(d => d.model.hi)),
      bands: days.flatMap(({ model, offset }) => model.bands.map(b => ({ ...b, s: b.s + offset, e: b.e + offset }))),
      markers: days.flatMap(({ model, offset }) => model.markers.map(m => ({ ...m, m: m.m + offset }))),
      shade: days.flatMap(({ model, offset }) => model.shade.map(z => ({ ...z, from: z.from + offset, to: z.to + offset }))),
      manual: days.flatMap(({ model, offset }) => model.manual.map(([a,b]) => [a + offset, b + offset] as Span)),
      planned: {
        zones: days.flatMap(({ model, offset }) => model.planned.zones.map(z => ({ ...z, from: z.from + offset, to: z.to + offset }))),
        steps: days.flatMap(({ model, offset }) => model.planned.steps.map(z => ({ ...z, from: z.from + offset, to: z.to + offset }))),
        risers: days.flatMap(({ model, offset }) => model.planned.risers.map(z => ({ ...z, m: z.m + offset }))),
        returns: days.flatMap(({ model, offset }) => model.planned.returns.map(m => m + offset)),
      },
    };
  }

  // ---- interaction ----

  /** Path of the Home Assistant history of the device for this day (opened by a tap on the chart). */
  private get _historyPath(): string {
    const { startMs } = dayBounds(this.date, this._tz);
    const q = new URLSearchParams({
      entity_id: this.entityId, start_date: new Date(startMs + this._win.from * 60_000).toISOString(), end_date: new Date(startMs + this._win.to * 60_000).toISOString(),
    });
    return `/history?${q.toString()}`;
  }

  private _open(): void {
    clearTimeout(this._openTimer);
    this.dispatchEvent(new CustomEvent("open-history", { detail: this._historyPath, bubbles: true, composed: true }));
  }

  // ---- zoom (pinch, drag, wheel, keys) ----

  private get _pad() {
    if (!this._model) return PAD_CURVE;
    return this._plotConfig(this._model).pad;
  }

  private _plotConfig(model: Model) {
    const groups = numericAxes(this.hass, this._sources, this._sourceHistory,
      model.kind === "curve" ? { unit: model.unit, lo: model.lo, hi: model.hi } : null);
    if (model.kind === "curve" && groups.axes.length) groups.axes[0].color = model.lines[0]?.key === "measured" ? "var(--accent-color, #ff9800)" : model.lines[0]?.key === "set" ? "var(--primary-text-color)" : "var(--primary-color)";
    const curve = model.kind === "curve" || groups.axes.length > 0;
    return { ...groups, curve, pad: { ...(curve ? PAD_CURVE : PAD_BAND), r: 10 + Math.max(0, groups.axes.length - 1) * 38 } };
  }
  private get _span(): number { const b = dayBounds(this.date, this._tz); return (b.endMs - b.startMs) / 60_000; }
  private get _win(): ZoomWindow { return this._zoom ?? { from: 0, to: this._span }; }

  private _setZoom(w: ZoomWindow | null): void {
    this._zoom = w && !(Math.abs(w.from) < 1e-6 && Math.abs(w.to - this._span) < 1e-6) ? w : null;
    clearTimeout(this._panLoadTimer);
    // Invalidate in-flight responses immediately, even before the debounced replacement starts.
    this._token++;
    this._panLoadTimer = setTimeout(() => void this._load(), 120);
  }

  /** x of a pointer in chart px (the svg may be drawn smaller than its width). */
  private _px(e: { clientX: number }): number {
    const r = (this.renderRoot.querySelector("svg") as SVGSVGElement | null)?.getBoundingClientRect();
    return r && r.width > 0 ? ((e.clientX - r.left) * this._width) / r.width : e.clientX;
  }

  private _frac(x: number): number {
    const pad = this._pad;
    return (x - pad.l) / (this._width - pad.l - pad.r);
  }

  private _down(e: PointerEvent): void {
    if (!this._model || (e.pointerType === "mouse" && e.button !== 0)) return;
    const x = this._px(e);
    this._ptrs.set(e.pointerId, { x, y: e.clientY });
    try { (e.currentTarget as Element | null)?.setPointerCapture?.(e.pointerId); } catch { /* pointer already gone */ }
    if (this._ptrs.size === 2) {
      const [a, b] = [...this._ptrs.values()];
      const win = this._win;
      this._band = null;
      this._gesture = { kind: "pinch", win, dist: Math.hypot(a.x - b.x, a.y - b.y),
        anchor: minuteAt(win, this._frac((a.x + b.x) / 2)) };
      this._guardUntil = Date.now() + CLICK_GUARD_MS;
    } else if (this._ptrs.size === 1) {
      if (e.pointerType === "mouse" && e.shiftKey) this._gesture = { kind: "select", x0: x, moved: false };
      else this._gesture = { kind: "pan", win: this._win, x0: x, y0: e.clientY, moved: false };
    }
  }

  private _move(e: PointerEvent): void {
    const g = this._gesture;
    const p = this._ptrs.get(e.pointerId);
    if (!g || !p || !this._model) return;
    p.x = this._px(e);
    p.y = e.clientY;
    const pad = this._pad;
    const plotW = this._width - pad.l - pad.r;
    if (g.kind === "pinch") {
      const [a, b] = [...this._ptrs.values()];
      if (!b) return;
      this._setZoom(zoomTimeline(g.win, Math.hypot(a.x - b.x, a.y - b.y) / (g.dist || 1), g.anchor,
        this._frac((a.x + b.x) / 2), this._span));
    } else if (g.kind === "pan") {
      if (!g.moved && Math.abs(p.y - g.y0) > Math.max(DRAG_PX, Math.abs(p.x - g.x0))) { this._gesture = null; return; }
      if (!g.moved && Math.abs(p.x - g.x0) < DRAG_PX) return;
      g.moved = true;
      this._guardUntil = Date.now() + CLICK_GUARD_MS;
      this._setZoom(slideTimeline(g.win, (-(p.x - g.x0) / plotW) * (g.win.to - g.win.from)));
    } else {
      if (!g.moved && Math.abs(p.x - g.x0) < DRAG_PX) return;
      g.moved = true;
      this._guardUntil = Date.now() + CLICK_GUARD_MS;
      this._band = { a: g.x0, b: p.x };
    }
  }

  private _up(e: PointerEvent): void {
    const p = this._ptrs.get(e.pointerId);
    if (!p) return;
    this._ptrs.delete(e.pointerId);
    const g = this._gesture;
    if (g?.kind === "select" && g.moved && e.type === "pointerup") {
      const win = this._win;
      const selected = Math.abs(p.x - g.x0) / (this._width - this._pad.l - this._pad.r) * (win.to - win.from);
      this._setZoom(zoomTimeline(win, (win.to - win.from) / Math.max(30, selected),
        minuteAt(win, this._frac((g.x0 + p.x) / 2)), .5, this._span));
    }
    if (g?.kind === "select" || !this._ptrs.size) this._gesture = null;
    if (g?.kind === "select" || g?.kind === "pan") this._guardUntil = g.moved ? Date.now() + CLICK_GUARD_MS : this._guardUntil;
    this._band = null;
    if (g?.kind === "pinch") {
      // one finger stays: it goes on panning from where it is, without a jump
      const rest = [...this._ptrs.values()][0];
      this._gesture = rest && this._zoom ? { kind: "pan", win: this._zoom, x0: rest.x, y0: rest.y, moved: true } : null;
      this._guardUntil = Date.now() + CLICK_GUARD_MS;
    }
  }

  private _wheel(e: WheelEvent): void {
    if (!this._model) return;
    if (e.ctrlKey) {
      // ctrl + wheel (also a trackpad pinch) zooms around the pointer
      e.preventDefault();
      const win = this._win;
      this._setZoom(zoomTimeline(win, Math.exp(-e.deltaY * 0.01), minuteAt(win, this._frac(this._px(e))),
        this._frac(this._px(e)), this._span));
    } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      const w = this._win;
      this._setZoom(slideTimeline(w, (e.deltaX / (this._width - this._pad.l - this._pad.r)) * (w.to - w.from)));
    }
  }

  private _zoomKey(e: KeyboardEvent): boolean {
    const win = this._win;
    const mid = (win.from + win.to) / 2;
    if (e.key === "+" || e.key === "=") this._setZoom(zoomTimeline(win, 1.5, mid, 0.5, this._span));
    else if (e.key === "-") this._setZoom(zoomTimeline(win, 1 / 1.5, mid, 0.5, this._span));
    else if (e.key === "0") this._setZoom(null);
    else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      this._setZoom(slideTimeline(win, (e.key === "ArrowLeft" ? -0.25 : 0.25) * (win.to - win.from)));
    } else return false;
    e.preventDefault();
    return true;
  }

  private _reset(): void {
    clearTimeout(this._openTimer);
    this._setZoom(null);
  }

  /** A click opens the history, unless it ends a zoom gesture; with a zoom it waits for a possible double click. */
  private _click(): void {
    if (Date.now() < this._guardUntil) return;
    clearTimeout(this._openTimer);
    if (this._zoom) this._openTimer = setTimeout(() => this._open(), DOUBLE_MS);
    else this._open();
  }

  /** "08:00" at a minute of the day. */
  private _clock(m: number, span: number): string {
    if (m === span && span === 1440 && this._win.from >= 0 && this._win.to <= span) return "24:00";
    const { startMs } = dayBounds(this.date, this._tz);
    return dateFormat("en-GB", { timeZone: this._tz, ...(this._win.from < 0 || this._win.to > span ? { day: "numeric", month: "numeric" } : {}), hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .format(new Date(startMs + m * 60_000));
  }

  private _windowDate(): string {
    const start = dayBounds(this.date, this._tz).startMs;
    const fmt = dateFormat(this._lang, { timeZone: this._tz, day: "numeric", month: "short", year: "numeric" });
    const a = fmt.format(new Date(start + this._win.from * 60_000));
    const b = fmt.format(new Date(start + this._win.to * 60_000 - 1));
    return a === b ? a : `${a} – ${b}`;
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
    return html`<div class="box">${body}</div>${model ? html`<div class="zoombar">
        <button class="zreset" aria-label=${t(lang, "chart_previous")} @click=${() => this._setZoom(slideTimeline(this._win, -(this._win.to - this._win.from)))}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <span class="zdate">${this._windowDate()}</span>
        <button class="zreset" aria-label=${t(lang, "chart_next")} @click=${() => this._setZoom(slideTimeline(this._win, this._win.to - this._win.from))}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        ${this._zoom ? html`
        <span class="zwin">${t(lang, "chart_zoom_window", { from: this._clock(this._zoom.from, model.span), to: this._clock(this._zoom.to, model.span) })}</span>
        <button class="zreset return-day" type="button" @click=${() => this._reset()}>
          <ha-icon icon="mdi:magnify-minus-outline"></ha-icon><span>${t(lang, "chart_return")}</span></button>` : nothing}
        <small class="panhelp">${t(lang, "chart_pan_help")}</small>
      </div>` : nothing}${model ? html`${this._legend(model)}
      <div class="availability" role="status">
        ${this._failed ? html`<p>${t(lang, "chart_history_failed")}</p>`
          : !model.lines.length && !model.bands.length
            ? html`<p>${t(lang, model.pastEnd <= this._win.from ? "chart_future_history" : "chart_no_history")}</p>` : nothing}
        ${this._previewFailed ? html`<p>${t(lang, "chart_preview_failed")}</p>` : nothing}
        ${!this._previewFailed && !model.markers.some((m) => !m.ignored) && !model.planned.zones.length
          ? html`<p>${t(lang, "chart_no_planned")}</p>` : nothing}
      </div>` : nothing}
      ${this.showOptions ? html`<wp-chart-options .hass=${this.hass} .data=${this.data} .program=${this._displayProgram?.id === this.program.id && this._displayProgram.revision > this.program.revision ? this._displayProgram : this.program}
        .entityId=${this.entityId} .mainUnit=${this._primaryUnit()} .histories=${this._sourceHistory}
        @chart-sources-saved=${(e: CustomEvent<Program>) => { e.stopPropagation(); this._displayProgram = e.detail; }}></wp-chart-options>` : nothing}`;
  }

  private _primaryUnit(): string | null {
    const domain = entityDomain(this.entityId);
    if (["climate", "cover", "light"].includes(domain) || this._model?.kind === "curve" || this.hass.states[this.entityId]?.attributes.unit_of_measurement || this.hass.states[this.entityId]?.attributes.state_class || stateNumber(this.hass.states[this.entityId]?.state ?? "") !== null) return this._model?.unit
      ?? String(this.hass.states[this.entityId]?.attributes.unit_of_measurement ?? (domain === "climate" ? this.hass.config.unit_system?.temperature ?? "°C" : "%"));
    return null;
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
    const config = this._plotConfig(model);
    const { curve } = config;
    const H = curve ? 150 : 84;
    const PAD = config.pad;
    const win = this._zoom ?? { from: 0, to: model.span };
    const zoomed = Boolean(this._zoom);
    const x = (m: number) => PAD.l + ((m - win.from) / (win.to - win.from)) * (W - PAD.l - PAD.r);
    const primary = config.axes[0] ?? { lo: model.lo, hi: model.hi };
    const axisY = (v: number, axis: { lo: number; hi: number }) => PAD.t + (1 - (v - axis.lo) / (axis.hi - axis.lo || 1)) * (H - PAD.t - PAD.b);
    const y = (v: number) => axisY(v, primary);
    const { startMs } = dayBounds(this.date, this._tz);
    const step = tickStep(win.to - win.from);
    const tickFmt = dateFormat("en-GB", { timeZone: this._tz, hour: "2-digit", ...(step < 60 ? { minute: "2-digit" } : {}), hourCycle: "h23" });
    const tickText = (m: number) => {
      // the end of the day reads "24h", never a second "0h"
      if (Math.abs(m - model.span) < 1e-6 && win.from >= 0 && win.to <= model.span) return step < 60 ? "24:00" : "24h";
      const instant = new Date(startMs + m * 60_000);
      const s = tickFmt.format(instant);
      if (localMinutes(instant, this._tz) === 0 && (win.from < 0 || win.to > model.span)) return `${dateFormat(lang, { timeZone: this._tz, day: "numeric", month: "numeric" }).format(instant)} ${s}h`;
      return step < 60 ? s : `${Number(s)}h`;
    };
    const ticksX = ticksIn(win, step);
    const inPlot = (m: number) => m >= win.from - 1e-6 && m <= win.to + 1e-6;
    const anchorOf = (m: number) => {
      if (!zoomed) return m === 0 ? "start" : "middle";
      const px = x(m);
      return px - PAD.l < 16 ? "start" : W - PAD.r - px < 16 ? "end" : "middle";
    };
    // round values on the vertical axis (1, 2, 5, 10… apart), never 17.3 or 20.7
    const ticksY = curve ? axisTicks(primary.lo, primary.hi) : [];
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
    const nowLine = model.isToday && inPlot(model.pastEnd)
      ? svg`<line class="now" x1=${x(model.pastEnd)} x2=${x(model.pastEnd)} y1=${PAD.t - 4} y2=${H - PAD.b}></line>
        <g class="nowicon" aria-hidden="true" transform="translate(${x(model.pastEnd) - 6}, ${PAD.t - 17}) scale(0.5)"><path d=${CLOCK}></path></g>` : nothing;
    return html`<div class="cwrap">
      <svg width=${W} height=${H} viewBox="0 0 ${W} ${H}" tabindex="0" role="button"
        aria-label=${t(lang, "chart_open", { name: this._shownName })}
        @click=${() => this._click()}
        @dblclick=${() => this._reset()}
        @pointerdown=${(e: PointerEvent) => this._down(e)}
        @pointermove=${(e: PointerEvent) => this._move(e)}
        @pointerup=${(e: PointerEvent) => this._up(e)}
        @pointercancel=${(e: PointerEvent) => this._up(e)}
        @wheel=${(e: WheelEvent) => this._wheel(e)}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this._open(); } else this._zoomKey(e);
        }}>
        ${zoomed ? svg`<defs><clipPath id="plot"><rect x=${PAD.l - 3} y="0" width=${W - PAD.l - PAD.r + 6} height=${H}></rect></clipPath></defs>` : nothing}
        <g clip-path=${zoomed ? "url(#plot)" : nothing}>${curve ? shades : nothing}</g>
        ${ticksY.map((v) => svg`<line class="grid" x1=${PAD.l} x2=${W - PAD.r} y1=${y(v)} y2=${y(v)}></line>
          <text class="ylab" style=${`fill:${config.axes[0]?.color ?? "var(--secondary-text-color)"}`} x=${PAD.l - 4} y=${y(v) + 3} text-anchor="end">${Number(v.toFixed(1))}</text>`)}
        ${curve ? svg`<text class="unit" x="2" y="10" style=${`fill:${config.axes[0]?.color ?? "var(--primary-text-color)"}`}>${config.axes[0]?.unit ?? model.unit}</text>` : nothing}
        ${config.axes.slice(1).map((axis, index) => {
          const ax = W - PAD.r + 8 + index * 38;
          const labels = axisTicks(axis.lo, axis.hi);
          return svg`<g class="source-axis" style=${`fill:${axis.color};color:${axis.color}`}>
            <text x=${ax} y="10" style="fill:inherit">${axis.unit}</text>
            ${labels.map(v => svg`<text x=${ax} y=${axisY(v, axis) + 3} style="fill:inherit">${Number(v.toFixed(1))}</text>`)}</g>`;
        })}
        ${ticksX.map((m) => svg`<text class="xlab" x=${x(m)} y=${H - 6} text-anchor=${anchorOf(m)}>${tickText(m)}</text>`)}
        <g clip-path=${zoomed ? "url(#plot)" : nothing}>
        ${curve ? nothing : svg`
          <rect class="track" x=${PAD.l} y=${bandY} width=${W - PAD.l - PAD.r} height=${bandH} rx="6"></rect>
          ${model.bands.map((b) => svg`<rect class="band ${b.on ? "on" : ""}" x=${x(b.s)} y=${bandY} width=${Math.max(1, x(b.e) - x(b.s))} height=${bandH}></rect>`)}
          ${shades}
          ${model.bands.map((b) => {
            // the text is centred on the part of the band that is visible
            const s0 = Math.max(b.s, win.from), e0 = Math.min(b.e, win.to);
            const w = x(e0) - x(s0);
            return e0 > s0 && fitText(b.text, w) ? svg`<text class="btxt" x=${x(s0) + w / 2} y=${bandY + bandH / 2 + 4} text-anchor="middle">${fitText(b.text, w)}</text>` : nothing;
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
        ${[...model.markers].filter((mk) => !zoomed || inPlot(mk.m)).sort((a, b) => a.m - b.m).map(mark)}
        ${this._sources.filter(s => s.kind === "numeric").map(source => {
          const axis = config.axes.find(a => a.unit === sourceUnit(this.hass, source.entity_id, this._sourceHistory[source.entity_id]));
          if (!axis) return nothing;
          const pts = this._sourceHistory[source.entity_id] ?? [];
          const from = startMs + win.from * 60000, to = Math.min(Date.now(), startMs + win.to * 60000);
          if (to <= from) return nothing;
          let initial: SourcePoint | undefined;
          for (const p of pts) { if (p.t <= from) initial = p; else break; }
          const visible = [...(initial ? [{ ...initial, t: from }] : []), ...pts.filter(p => p.t > from && p.t <= to)];
          const points = visible.map(p => ({ m: (p.t - startMs) / 60000, v: stateNumber(p.s) }));
          return svg`<path class="source-line" d=${this._path(points, { ...model, pastEnd: (to - startMs) / 60000 }, x, v => axisY(v, axis), false)}
            style=${`stroke:${sourceColor(source.entity_id)}`}><title>${friendlyName(this.hass, source.entity_id)} · ${axis.unit}</title></path>`;
        })}
        ${nowLine}
        </g>
        ${this._band ? svg`<rect class="rubber" x=${Math.min(this._band.a, this._band.b)} y=${PAD.t - 4}
          width=${Math.abs(this._band.b - this._band.a)} height=${H - PAD.t - PAD.b + 4}></rect>` : nothing}
        <rect class="hit" x="0" y="0" width=${W} height=${H}></rect>
      </svg>
      ${model.markers.filter((mk) => mk.sun && (!zoomed || inPlot(mk.m))).map((mk) => html`<wp-tip class="suntip ${mk.ignored ? "faded" : ""}"
        style="left:${x(mk.m)}px;top:${cyOf(mk)}px;--c:${mk.label.color}" text=${sunTip(lang, mk.spec, mk.m)}>
        <span class="sunc"><ha-icon icon=${mk.sun === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span></wp-tip>`)}
      ${model.isToday && (!zoomed || inPlot(model.pastEnd)) ? html`<wp-tip class="nowtip" style="left:${x(model.pastEnd)}px;top:${PAD.t - 11}px"
        text=${nowTip(lang, localMinutes(new Date(), this._tz))}></wp-tip>` : nothing}
    </div>
    ${config.overflow ? html`<p class="source-warning" role="status">${t(lang, "chart_sources_overflow")}</p>` : nothing}
    ${this._renderSourceRows(model, win, PAD)}
    <div class="source-legend">${this._sources.filter(s => s.kind === "numeric").map(source => html`<span>
      <i style=${`background:${sourceColor(source.entity_id)}`}></i>${friendlyName(this.hass, source.entity_id)} · ${sourceUnit(this.hass, source.entity_id, this._sourceHistory[source.entity_id])}
      ${this._sourceFailures.includes(source.entity_id) ? html`<small>${t(lang, "chart_source_history_failed")}</small>`
        : !(this._sourceHistory[source.entity_id] ?? []).some(p => stateNumber(p.s) !== null) ? html`<small>${t(lang, "chart_source_no_history")}</small>` : nothing}
    </span>`)}</div>`;
  }

  private _renderSourceRows(model: Model, win: ZoomWindow, pad: { l: number; r: number }) {
    const startMs = dayBounds(this.date, this._tz).startMs;
    const from = startMs + win.from * 60000, end = startMs + win.to * 60000;
    const to = Math.min(Date.now(), end);
    const x = (ms: number) => pad.l + (ms - from) / (end - from) * (this._width - pad.l - pad.r);
    return html`<div class="source-bands">
      ${this._sources.filter(s => s.kind === "states").map(source => {
        const history = this._sourceHistory[source.entity_id] ?? [];
        const periods = stateIntervals(history, source.states ?? [], from, to);
        return html`<div class="source-row"><div class="source-name">${friendlyName(this.hass, source.entity_id)}</div>
          <svg width=${this._width} height="22" viewBox="0 0 ${this._width} 22" aria-label=${friendlyName(this.hass, source.entity_id)}
            @pointerdown=${(e: PointerEvent) => this._down(e)} @pointermove=${(e: PointerEvent) => this._move(e)}
            @pointerup=${(e: PointerEvent) => this._up(e)} @pointercancel=${(e: PointerEvent) => this._up(e)} @wheel=${(e: WheelEvent) => this._wheel(e)}>
            <rect x=${pad.l} y="2" width=${Math.max(0, x(Math.max(from,to)) - pad.l)} height="16" fill="var(--divider-color)" opacity=".2"></rect>
            ${periods.map(period => svg`<rect class=${period.missing ? "source-gap" : ""} x=${x(period.from)} y="2" width=${Math.max(0, x(period.to) - x(period.from))} height="16"
              fill=${period.missing ? "var(--secondary-text-color)" : period.selected ? sourceColor(source.entity_id, period.state!) : "var(--divider-color)"}
              opacity=${period.missing ? ".16" : period.selected ? "1" : ".4"}
              stroke=${period.missing ? "var(--secondary-text-color)" : "none"} stroke-dasharray=${period.missing ? "2 3" : "none"}>
              <title>${period.missing ? t(this._lang, "chart_source_gap") : stateName(this.hass, source.entity_id, period.state!)}</title></rect>`)}
          </svg>
          <div class="state-legend">${(source.states ?? []).map(state => html`<span><i style=${`background:${sourceColor(source.entity_id, state)}`}></i>${stateName(this.hass, source.entity_id, state)}</span>`)}
            <span><i class="neutral"></i>${t(this._lang, "chart_source_other")}</span>
            ${periods.some(p => p.missing) ? html`<span><i class="missing"></i>${t(this._lang, "chart_source_gap")}</span>` : nothing}
            ${this._sourceFailures.includes(source.entity_id) ? html`<span>${t(this._lang, "chart_source_history_failed")}</span>` : nothing}
          </div></div>`;
      })}
      ${model.kind === "band" && this._sources.some(s => s.kind === "numeric") ? html`<div class="source-row"><div class="source-name">${this._shownName}</div><svg width=${this._width} height="22">
        ${model.bands.filter(b => b.e > win.from && b.s < win.to).map(b => svg`<rect x=${x(startMs + Math.max(b.s, win.from) * 60000)} y="2" width=${Math.max(0, x(startMs + Math.min(b.e, win.to) * 60000) - x(startMs + Math.max(b.s, win.from) * 60000))} height="16" fill=${b.on ? "var(--primary-color)" : "var(--divider-color)"}><title>${b.text}</title></rect>`)}
      </svg></div>` : nothing}
    </div>`;
  }

  static styles = css`
    :host { display: block; }
    .source-line { fill:none; stroke-width:2; stroke-linejoin:round; }
    .source-legend, .state-legend { display:flex; gap:4px 12px; flex-wrap:wrap; font-size:12px; color:var(--secondary-text-color); }
    .source-legend span, .state-legend span { display:inline-flex; align-items:center; gap:5px; }
    .source-legend i, .state-legend i { display:inline-block; width:10px; height:10px; border-radius:50%; flex:none; }
    .source-legend small { margin-left:4px; } .source-name { font-size:12px; margin-top:8px; overflow-wrap:anywhere; }
    .neutral { background:var(--divider-color); } .missing { border:1px dashed var(--secondary-text-color); opacity:.5; }
    .source-warning { color:var(--error-color); font-size:13px; }
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
    /* vertical scroll of the page stays with the browser; horizontal moves and two fingers are ours (zoom) */
    svg { display: block; user-select: none; outline: none; max-width: 100%; cursor: pointer; touch-action: pan-y; }
    .rubber { fill: var(--primary-color); opacity: 0.2; stroke: var(--primary-color); stroke-width: 1; pointer-events: none; }
    .zoombar { display: flex; align-items: center; justify-content: space-between; gap: 4px 8px; margin-top: 2px; flex-wrap: wrap; }
    .panhelp { flex-basis: 100%; color: var(--secondary-text-color); }
    .zdate { font-size: 13px; }
    .zwin { color: var(--secondary-text-color); font-size: 14px; white-space: nowrap; }
    .zreset {
      display: inline-flex; align-items: center; gap: 6px; min-height: 44px; min-width: 44px; padding: 0 12px;
      border: 1px solid var(--divider-color); border-radius: 22px; background: transparent; color: var(--primary-color);
      font: inherit; font-size: 14px; cursor: pointer; white-space: nowrap; --mdc-icon-size: 20px;
    }
    .zreset:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
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
