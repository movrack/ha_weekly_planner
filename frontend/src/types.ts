// Data shapes exchanged with the integration (see docs/SPEC.md § 8).

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  language: string;
  locale?: { language: string };
  config: { time_zone: string; unit_system?: { temperature?: string } };
  user?: { is_admin: boolean; name: string };
  themes?: { darkMode?: boolean };
  services?: Record<string, Record<string, unknown>>;
  localize?: (key: string, ...args: unknown[]) => string;
  loadBackendTranslation?: (category: string, integration?: string | string[], configFlow?: boolean) =>
    Promise<(key: string, ...args: unknown[]) => string>;
  formatEntityState?: (stateObj: HassEntity, state?: string) => string;
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<unknown>;
  connection: {
    subscribeMessage<T>(cb: (msg: T) => void, msg: Record<string, unknown>): Promise<() => void>;
  };
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
}

export type TimeSpec =
  | { time: string; random_minutes?: number }
  | { sun: "dawn" | "sunrise" | "sunset" | "dusk"; offset?: number; earliest?: string; latest?: string; random_minutes?: number };

/** What a label does: a service called on the entity, or a scene. */
export interface ActionValueSource {
  entity_id: string;
  attribute?: string;
  type: "number" | "boolean" | "string" | "native";
}

export type Action =
  | { kind: "service"; service: string; target_entity_id?: string; data?: Record<string, unknown>; data_sources?: Record<string, ActionValueSource> }
  | { kind: "scene"; scene: string };

/** Shared by every program (spec § 6): slots and defaults only point at labels. */
export interface Label {
  id: string;
  name: string;
  color: string;
  action: Action;
}

export interface Condition {
  entity_id: string;
  attribute?: string | null;
  op?: "eq" | "ne" | "lt" | "gt";
  value: string | number | boolean;
}

export interface Slot {
  id: string;
  start: TimeSpec;
  end?: TimeSpec | null;
  conditions?: Condition[];
  color?: string | null;
  /** Id of the label this slot applies. */
  label: string;
  /** Devices this slot targets (absent: every device of the program, also added later; never empty). */
  entities?: string[];
  /** Random-delay seed (default: the slot id); kept when a slot is split so its delay is not redrawn. */
  seed?: string;
}

export interface Profile {
  id: string;
  name: string;
  days: Slot[][]; // 0 = Monday … 6 = Sunday
}

export interface ChartSource {
  entity_id: string;
  kind: "numeric" | "states";
  states?: string[];
}

export interface ProgramEntity {
  /** Display-only histories, shared by all cards of this program/device. */
  chart_sources?: ChartSource[];
  entity_id: string;
  /** "The rest of the time": label applied when a slot with an end finishes (null: nothing). */
  default_label: string | null;
  /** Value of a label for this device only. */
  label_overrides: Record<string, Action>;
  /** Services offered for this device (`domain.service`); restrict_services makes an empty list mean none. */
  allowed_services?: string[];
  /** Explicit restriction, including an empty selection. Missing keeps legacy empty = all. */
  restrict_services?: boolean;
}

export interface Program {
  id: string;
  revision: number;
  created_at?: string;
  name: string;
  icon?: string | null;
  area?: string | null;
  priority: number;
  enabled: boolean;
  reapply: boolean;
  conditions: Condition[];
  entities: ProgramEntity[];
  active_profile?: string | null;
  mode_source?: { entity_id: string; mappings: Record<string, string> };
  profiles: Profile[];
}

export interface ProgramStatus {
  program_id: string;
  active_profile: string | null;
  mode_source_state?: string | null;
  mode_source_status?: "matched" | "unmapped" | "unavailable";
  current_slots: Record<string, string>;
  next_change: string | null;
  skip_next: string | null;
  /** Devices whose own timeline changes at the skipped moment, and what they would have received then. */
  skip_next_targets?: { entity_id: string; action: Action | null; label: string | null }[];
  next_actions?: Record<string, { at: string; action: Action; label: string | null }>;
}

export interface PlannerData {
  vacation: boolean;
  labels: Label[];
  programs: Program[];
  status: Record<string, ProgramStatus>;
  warnings?: Record<string, { entity_id: string; code: string; detail: string }[]>;
  read_only: boolean;
  can_edit: boolean;
  is_admin?: boolean;
  /** Version (hash) of the card bundle the integration serves now. */
  card_version?: string | null;
  /** Defaults for a new program (absent on older integrations). */
  defaults?: { reapply: boolean; priority: number };
}

export interface PreviewSlot {
  slot_id: string;
  start: string;
  end: string | null;
  ignored: string | null;
  sun: boolean;
  /** Devices the slot targets, when the program uses per-device schedules (absent: every device). */
  entities?: string[];
}

/** Occurrences of a program as `weekly_planner/preview` returns them. */
export interface PreviewResponse {
  slots: PreviewSlot[];
  /** Present as soon as one slot of the program has `entities`: the complete timeline of each device
   * (previous-day overnight spill included); the top-level `slots` is then not trimmed per device. */
  by_entity?: Record<string, PreviewSlot[]>;
}

export interface CardConfig {
  type: string;
  title?: string;
  program?: string;
  filter?: { types?: string[]; area?: string; programs?: string[] };
  schedule_view?: "bars" | "radial" | "radial_12h" | "list";
  /** Deprecated: accepted and ignored (the week list is always collapsible); kept so existing YAML never breaks. */
  show_week?: boolean;
  show_chart?: boolean;
  /** Optional: start with the day chart collapsed. */
  chart_collapsed?: boolean;
  /** Deprecated: accepted and ignored; kept so existing YAML never breaks. */
  show_advanced?: boolean;
}
