// Which display views the card editor offers, and which of them use a given option. Pure: no Home Assistant access.
import type { CardConfig } from "./types";

export type View = NonNullable<CardConfig["schedule_view"]>;

/** Views that draw the optional "Schedules" list under the graphic (`show_schedule_list`; see `_scheduleList` of the card). */
const SCHEDULE_LIST_VIEWS: readonly View[] = ["bars", "radial", "radial_12h"];

export const usesScheduleList = (view: View | undefined): boolean => SCHEDULE_LIST_VIEWS.includes(view ?? "bars");
