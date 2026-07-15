import type { AppError } from '@/shared/api/errors';
import type { Product } from '@/features/products/schemas/product.schema';
import type { SaleLineDraft } from './sale-lines';

const INSUFFICIENT = /insufficient stock for product '(.+)'/i;
const NOT_FOUND = /product with id (\d+) not found/i;

/**
 * Map a sale-creation error back to the product it is about, so the offending
 * line can be highlighted.
 *
 * The insufficient-stock message interpolates the product NAME, not the id, so
 * this is a heuristic: an exact, case-insensitive name match. If two products
 * share a name it returns null and the caller falls back to the form-level
 * alert. The not-found message does carry an id.
 */
export function saleErrorProductId(
  error: AppError,
  lines: SaleLineDraft[],
  productById: Map<number, Product>,
): number | null {
  const notFound = NOT_FOUND.exec(error.message);
  if (notFound) return Number(notFound[1]);

  const insufficient = INSUFFICIENT.exec(error.message);
  if (!insufficient) return null;

  const name = insufficient[1].toLowerCase();
  const matches = lines
    .map((line) => productById.get(line.productId))
    .filter((product): product is Product => !!product && product.name.toLowerCase() === name);

  // Ambiguous (or absent): let the form-level alert carry it instead.
  return matches.length === 1 ? matches[0].id : null;
}
