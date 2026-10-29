// Data shapes exchanged with the integration (see docs/SPEC.md § 8).

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  language: string;
  locale?: { language: string };
  config: { time_zone: string };
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
  | { time: string }
  | { sun: "dawn" | "sunrise" | "sunset" | "dusk"; offset?: number; earliest?: string; latest?: string };

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
}

export interface Profile {
  id: string;
  name: string;
  days: Slot[][]; // 0 = Monday … 6 = Sunday
}

export interface ProgramEntity {
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
}

export interface PreviewSlot {
  slot_id: string;
  start: string;
  end: string | null;
  ignored: string | null;
  sun: boolean;
}

export interface CardConfig {
  type: string;
  title?: string;
  program?: string;
  filter?: { types?: string[]; area?: string; programs?: string[] };
  schedule_view?: "bars" | "radial" | "radial_12h" | "list";
  show_week?: boolean;
  show_chart?: boolean;
  show_advanced?: boolean;
}
