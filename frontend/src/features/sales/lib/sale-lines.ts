import type { Product } from '@/features/products/schemas/product.schema';
import { toCents } from '@/shared/lib/format';

export type SaleLineDraft = { productId: number; quantity: number; notes?: string | null };

export type StockTone = 'low' | 'out';

/**
 * Collapse repeated products into one line each, summing quantities.
 *
 * This is not a nicety: the backend validates each line against full stock
 * independently, so two lines of 6 against stock 10 would both pass and then
 * decrement twice. Merging before POST is what prevents negative stock. Notes
 * from the first occurrence win.
 */
export function mergeLines(lines: SaleLineDraft[]): SaleLineDraft[] {
  const byProduct = new Map<number, SaleLineDraft>();

  for (const line of lines) {
    const existing = byProduct.get(line.productId);
    if (existing) {
      existing.quantity += line.quantity;
      existing.notes = existing.notes ?? line.notes ?? null;
    } else {
      byProduct.set(line.productId, { ...line, notes: line.notes ?? null });
    }
  }

  return [...byProduct.values()];
}

/**
 * Client-side estimate of the sale total, in integer cents. The server recomputes
 * this from its own prices; this is only what the user sees while composing.
 */
export function estimateTotalCents(
  lines: SaleLineDraft[],
  productById: Map<number, Product>,
): number {
  let total = 0;
  for (const line of lines) {
    const product = productById.get(line.productId);
    if (product) total += toCents(product.price) * line.quantity;
  }
  return total;
}

/**
 * Per-product stock warnings for the merged lines. Advisory only: the cache can
 * be stale in either direction and the server is the authority, so this never
 * blocks submission.
 */
export function stockWarnings(
  lines: SaleLineDraft[],
  productById: Map<number, Product>,
): Map<number, StockTone> {
  const warnings = new Map<number, StockTone>();

  for (const line of lines) {
    const product = productById.get(line.productId);
    if (!product) continue;

    if (line.quantity > product.stock) warnings.set(line.productId, 'out');
    else if (line.quantity === product.stock) warnings.set(line.productId, 'low');
  }

  return warnings;
}
