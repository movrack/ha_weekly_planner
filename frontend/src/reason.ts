import { css, html, nothing } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

/**
 * Owner rule (2026-11-21): an element never disappears. When it cannot be used it stays shown, greyed and disabled, with a
 * short visible reason that its `aria-describedby` points to. These helpers are the one place for the attributes and the
 * message; the reason is shown outside the greyed zone so that it keeps its full contrast.
 */

/** `aria-disabled` value of an element that is not usable right now. */
export const ariaDisabled = (on: boolean): string => (on ? "true" : "false");

/** `aria-describedby` of an element: the id of its reason when it is not usable, nothing otherwise. */
export const describedBy = (on: boolean, id: string) => ifDefined(on ? id : undefined);

/** The visible reason (a status message) shown next to what is greyed. */
export const whyNote = (id: string, text: string, show = true) => show ? html`<p class="why" id=${id} role="status">${text}</p>` : nothing;

/** Style of the reason, shared by every component that shows one. */
export const whyStyles = css`
  .why { margin: 4px 0 8px; font-size: 0.8125rem; color: var(--secondary-text-color); }
`;
