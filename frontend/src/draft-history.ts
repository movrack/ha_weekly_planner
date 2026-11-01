// Local undo/redo snapshots for JSON-shaped editor drafts; never writes to Home Assistant.
const LIMIT = 50;
const GROUP_WINDOW_MS = 700;

export class DraftHistory<T> {
  private _past: T[] = [];
  private _future: T[] = [];
  private _group?: string;
  private _recordedAt?: number;

  get canUndo(): boolean { return this._past.length > 0; }
  get canRedo(): boolean { return this._future.length > 0; }

  /** Adjacent edits with a named group share one undo step during a short typing burst. */
  record(before: T, after: T, group?: string, now = Date.now()): void {
    // A render or unchanged field must not invalidate a redo branch.
    if (JSON.stringify(before) === JSON.stringify(after)) return;
    const grouped = Boolean(group) && group === this._group && this._recordedAt !== undefined
      && now >= this._recordedAt && now - this._recordedAt <= GROUP_WINDOW_MS;
    if (!grouped) this._push(this._past, before);
    this._future = [];
    this._group = group || undefined;
    this._recordedAt = now;
  }

  undo(current: T): T | undefined {
    this._resetGroup();
    if (!this.canUndo) return undefined;
    this._push(this._future, current);
    return this._past.pop();
  }

  redo(current: T): T | undefined {
    this._resetGroup();
    if (!this.canRedo) return undefined;
    this._push(this._past, current);
    return this._future.pop();
  }

  clear(): void {
    this._past = [];
    this._future = [];
    this._resetGroup();
  }

  private _push(stack: T[], value: T): void {
    stack.push(structuredClone(value));
    if (stack.length > LIMIT) stack.shift();
  }

  private _resetGroup(): void {
    this._group = undefined;
    this._recordedAt = undefined;
  }
}
