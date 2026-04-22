/** Normalizes list responses from sendPaginated / various API shapes. */
export function extractPaginatedList(res: unknown): any[] {
  if (res == null || typeof res !== 'object') return [];
  const r = res as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data;
  const inner = r.data;
  if (inner && typeof inner === 'object' && Array.isArray((inner as Record<string, unknown>).products)) {
    return (inner as { products: unknown[] }).products;
  }
  if (Array.isArray(r.products)) return r.products;
  return [];
}
