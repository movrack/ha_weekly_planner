// "Hold to edit" hint on the bars (spec 14.12): shown on every plain tap, for HOLD_HINT_MS.

export const HOLD_HINT_MS = 6000;
/** Long press that enters the edit mode (bars, the Schedules list and the Comparison), and how far a finger may move before it is a scroll. */
export const LONG_PRESS_MS = 450;
export const MOVE_PX = 8;

/**
 * Long press, keyboard and hint of a row that opens an editor (Schedules list, Comparison): a press held for LONG_PRESS_MS
 * (mouse included) or Enter / Space opens it; a plain click or tap only shows the hint, for HOLD_HINT_MS.
 * `go` is what a row opens; the owner re-renders through `host.requestUpdate()` when `hint` changes.
 */
export class HoldPress {
  hint = false;
  /** Which row the hint belongs to (the `at` given to `down`), so that a list of rows shows it next to the one touched. */
  hintAt?: string;
  private _hintTimer?: ReturnType<typeof setTimeout>;
  private _press?: { id: number; x: number; y: number; fired: boolean; at?: string; timer?: ReturnType<typeof setTimeout> };

  constructor(private readonly host: { requestUpdate(): void }) {}

  /** A press is going on (the context menu of a long press is blocked meanwhile). */
  get active(): boolean {
    return this._press !== undefined;
  }

  down(e: PointerEvent, go: () => void, at?: string): void {
    if (e.button !== 0) return;
    this._press = { id: e.pointerId, x: e.clientX, y: e.clientY, fired: false, at };
    this._press.timer = setTimeout(() => {
      if (!this._press) return;
      this._press.fired = true;
      navigator.vibrate?.(12);
      this.clearHint();
      go();
    }, LONG_PRESS_MS);
  }

  move(e: PointerEvent): void {
    const p = this._press;
    if (p && p.id === e.pointerId && !p.fired && Math.hypot(e.clientX - p.x, e.clientY - p.y) > MOVE_PX) this.cancel();
  }

  up(e: PointerEvent): void {
    const p = this._press;
    if (!p || p.id !== e.pointerId) return;
    this.cancel();
    if (!p.fired) this._tapHint(p.at); // a plain click or tap never edits: it only says how
  }

  cancel(): void {
    clearTimeout(this._press?.timer);
    this._press = undefined;
  }

  /** Enter or Space on the row itself. */
  key(e: KeyboardEvent, go: () => void): void {
    if (e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    this.clearHint();
    go();
  }

  /** A click with no pointer behind it (screen reader, voice "click") opens like Enter does. */
  click(e: MouseEvent, go: () => void): void {
    if (e.detail !== 0) return;
    this.clearHint();
    go();
  }

  clearHint(): void {
    clearTimeout(this._hintTimer);
    this._hintTimer = undefined;
    if (this.hint) {
      this.hint = false;
      this.host.requestUpdate();
    }
  }

  dispose(): void {
    this.cancel();
    clearTimeout(this._hintTimer);
  }

  private _tapHint(at?: string): void {
    clearTimeout(this._hintTimer);
    this.hint = true;
    this.hintAt = at;
    this.host.requestUpdate();
    this._hintTimer = setTimeout(() => this.clearHint(), HOLD_HINT_MS);
  }
}
