// The name of a device type ("Volet" for cover) in the user's language, as Home Assistant knows it.

import type { HomeAssistant } from "./types";

export type TypeNames = (key: string) => string;

export const domainOf = (entityId: string): string => entityId.split(".")[0];

/** The type name of a domain, or "" when Home Assistant does not know it (its own key is returned for an unknown one). */
export function typeName(hass: HomeAssistant | undefined, loaded: TypeNames | undefined, domain: string): string {
  const key = `component.${domain}.title`;
  const known = (name: string | undefined) => (name && name !== key ? name : "");
  return known(hass?.localize?.(key)) || known(loaded?.(key));
}
