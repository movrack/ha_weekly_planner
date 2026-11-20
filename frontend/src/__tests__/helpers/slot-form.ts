// A slot form with a slot, its days and extra properties; `seen` collects the details of the events it sends.
import { WpSlotForm } from "../../components/slot-form";

export const form = (slot: any, days = [0, 1, 2, 3, 4, 5, 6], props: Record<string, unknown> = {}) => {
  const el = new WpSlotForm() as any;
  const seen: any[] = [];
  el.dispatchEvent = (e: any) => { seen.push(e.detail); return true; };
  Object.assign(el, { hass: { language: "en", config: {}, states: {} }, data: { labels: [], programs: [] }, program: { id: "p", entities: [], profiles: [] },
    entityIds: [], dayOnly: null, group: { slot: { id: "s", label: "l", start: { time: "08:00" }, end: { time: "09:00" }, ...slot }, days, ids: {} } }, props);
  return { el, seen };
};
