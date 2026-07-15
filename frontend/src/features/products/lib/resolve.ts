import type { Category } from '@/features/categories/schemas/category.schema';
import type { Product } from '../schemas/product.schema';

/**
 * The single home for turning a product's category into a display name.
 *
 * Prefers the server's value, which is now populated on the list endpoint, and
 * falls back to a client-side join for safety (and so nothing broke while the
 * backend fix was in flight). If the id points nowhere, it is uncategorised.
 */
export function resolveCategoryName(product: Product, nameById: Map<number, string>): string {
  return product.categoryName || nameById.get(product.categoryId) || 'Uncategorised';
}

export function categoryNameMap(categories: Category[]): Map<number, string> {
  return new Map(categories.map((category) => [category.id, category.name]));
}
