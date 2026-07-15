import type { Category } from '@/features/categories/schemas/category.schema';
import type { Product } from '@/features/products/schemas/product.schema';
import { categoryNameMap, resolveCategoryName } from '@/features/products/lib/resolve';

export type LowStockRow = Product & { resolvedCategory: string };

/**
 * The low-stock rows for the dashboard table. The counts and values themselves
 * now come from the server stats endpoint; this still runs client-side because
 * the table needs the actual product rows, scarcest first.
 */
export function selectLowStock(
  products: Product[],
  categories: Category[],
  threshold: number,
): LowStockRow[] {
  const nameById = categoryNameMap(categories);

  return products
    .filter((product) => product.stock <= threshold)
    .map((product) => ({
      ...product,
      resolvedCategory: resolveCategoryName(product, nameById),
    }))
    .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name));
}
