// Touch gesture helpers shared by the views and editors (spec § 10.8). Every gesture
// has a button equivalent elsewhere in the interface.

import type { HomeAssistant } from "../types";

/** Friendly name of an entity; never shows a raw identifier when a readable name can be built. */
export function displayName(hass: HomeAssistant, entityId: string): string {
  const name = hass.states[entityId]?.attributes?.friendly_name;
  if (typeof name === "string" && name) return name;
  const rest = entityId.split(".").slice(1).join(" ").replace(/_/g, " ").trim();
  return rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : entityId;
}

const INTERACTIVE = new Set(["INPUT", "SELECT", "TEXTAREA", "WP-CHART"]);

function startsOnInteractive(ev: Event): boolean {
  return ev.composedPath().some((n) => n instanceof HTMLElement && INTERACTIVE.has(n.tagName));
}

/**
 * Horizontal swipe detector: at least `threshold` px sideways and less than 30° of slope,
 * so that vertical scrolling is never taken for a swipe. Use with `touch-action: pan-y`.
 */
export class SwipeTracker {
  private id = -1;
  private sx = 0;
  private sy = 0;

  constructor(private readonly threshold = 60) {}

  down(ev: PointerEvent): void {
    if (ev.pointerType === "mouse" || !ev.isPrimary || startsOnInteractive(ev)) return;
    this.id = ev.pointerId;
    this.sx = ev.clientX;
    this.sy = ev.clientY;
  }

  /** -1 = swiped right (previous), 1 = swiped left (next), 0 = nothing. */
  up(ev: PointerEvent): -1 | 0 | 1 {
    if (ev.pointerId !== this.id) return 0;
    this.id = -1;
    const dx = ev.clientX - this.sx;
    const dy = ev.clientY - this.sy;
    if (Math.abs(dx) < this.threshold || Math.abs(dy) > Math.abs(dx) * Math.tan(Math.PI / 6)) return 0;
    return dx < 0 ? 1 : -1;
  }

  cancel(): void {
    this.id = -1;
  }
}

/** Long press (500 ms), cancelled when the finger moves more than 10 px. */
export class LongPress {
  private timer = 0;
  private sx = 0;
  private sy = 0;
  fired = false;

  constructor(private readonly onFire: (ev: PointerEvent) => void, private readonly delay = 500) {}

  down(ev: PointerEvent): void {
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    if (ev.composedPath().some((n) => n instanceof HTMLElement && (n.tagName === "BUTTON" || INTERACTIVE.has(n.tagName)))) return;
    this.cancel();
    this.fired = false;
    this.sx = ev.clientX;
    this.sy = ev.clientY;
    this.timer = window.setTimeout(() => {
      this.timer = 0;
      this.fired = true;
      try { navigator.vibrate?.(15); } catch { /* not supported */ }
      this.onFire(ev);
    }, this.delay);
  }

  move(ev: PointerEvent): void {
    if (this.timer && Math.hypot(ev.clientX - this.sx, ev.clientY - this.sy) > 10) this.cancel();
  }

  cancel(): void {
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = 0;
  }
}

const watched = new WeakSet<HTMLElement>();

/**
 * Marks a horizontally scrollable strip with `more-left` / `more-right` classes so that the
 * stylesheet can fade the edges where content is hidden (visual scroll hint).
 */
export function trackScrollHints(el: HTMLElement | null | undefined): void {
  if (!el || watched.has(el)) return;
  watched.add(el);
  const update = () => {
    el.classList.toggle("more-left", el.scrollLeft > 2);
    el.classList.toggle("more-right", el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };
  el.addEventListener("scroll", update, { passive: true });
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(update).observe(el);
  update();
}

export const scrollHintCss = `
  .more-right { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); }
  .more-left { -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to left, #000 calc(100% - 36px), transparent); }
  .more-left.more-right { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); }
`;
