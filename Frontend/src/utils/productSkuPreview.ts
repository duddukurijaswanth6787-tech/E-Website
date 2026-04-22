/** Mirrors backend helpers for client-side SKU prefix preview (suffix is illustrative). */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function abbrevCategoryForSku(name: string): string {
  const slug = slugify(name).replace(/-/g, '');
  if (slug.length >= 2) return slug.slice(0, 2);
  return `${slug}xx`.slice(0, 2);
}

export function abbrevColorForSku(color: string): string {
  const parts = color
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`;
  const w = parts[0] || 'xx';
  return w.length >= 2 ? w.slice(0, 2) : `${w}x`.slice(0, 2);
}

/** Main category + color only (matches backend; subcategory is not in the code). */
export function buildSemanticSkuPrefix(categoryName: string, color: string): string {
  const c = abbrevCategoryForSku(categoryName);
  const col = abbrevColorForSku(color);
  return `${c}-${col}`;
}

/** Example code shown in admin preview; server assigns the next free ###. */
export function previewSemanticSku(mainCategoryName: string, color: string): string {
  const prefix = buildSemanticSkuPrefix(mainCategoryName, color?.trim() || 'na');
  return `${prefix}-001`;
}
