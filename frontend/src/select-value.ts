/** Synchronize native selects after Lit commits their dynamic option children. Never emits changes. */
export function syncSelectValues(root: ParentNode): void {
  for (const select of root.querySelectorAll<HTMLSelectElement>("select[data-value]")) {
    const value = select.dataset.value ?? "";
    if (select.value !== value) select.value = value;
  }
}
