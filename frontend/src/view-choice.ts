// Which display views the card editor offers, and which of them use a given option. Pure: no Home Assistant access.
import type { CardConfig } from "./types";

export type View = NonNullable<CardConfig["schedule_view"]>;

/** Views that draw the optional "Schedules" list under the graphic (`show_schedule_list`; see `_scheduleList` of the card). */
const SCHEDULE_LIST_VIEWS: readonly View[] = ["bars", "radial", "radial_12h"];

export const usesScheduleList = (view: View | undefined): boolean => SCHEDULE_LIST_VIEWS.includes(view ?? "bars");

/** Views for one program (the card draws one device line each) and for several (the compact list and the comparison). */
const ONE: readonly View[] = ["bars", "radial", "radial_12h", "times"];
const MANY: readonly View[] = ["list", "compare"];
/** Every view, in the order of the selector. */
const VIEWS: readonly View[] = ["bars", "radial", "radial_12h", "list", "times", "compare"];

/**
 * The views offered for `count` shown programs: several programs get the compact list and the comparison, exactly one
 * gets the other views. With none (or before the data arrives) every view stays offered: nothing is drawn yet, and
 * forcing a choice while the selection is being made would only lose the user's pick.
 */
export const viewsFor = (count: number | undefined): readonly View[] => {
  if (!count) return VIEWS;
  return VIEWS.filter((v) => (count > 1 ? MANY : ONE).includes(v));
};

/** The view used when the saved one is not offered any more (the first one offered, the closest to the former default). */
export const defaultViewFor = (count: number | undefined): View => viewsFor(count)[0];

export const viewAllowed = (view: View | undefined, count: number | undefined): boolean => viewsFor(count).includes(view ?? "bars");
