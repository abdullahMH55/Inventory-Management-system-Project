import type { Category } from '@/features/categories/schemas/category.schema';
import type { Product } from '@/features/products/schemas/product.schema';
import { categoryNameMap, resolveCategoryName } from '@/features/products/lib/resolve';
import type { Sale } from '@/features/sales/schemas/sale.schema';
import { toCents } from '@/shared/lib/format';

export type DashboardStats = {
  totalProducts: number;
  totalStockUnits: number;
  inventoryValueCents: number;
  lowStockCount: number;
  outOfStockCount: number;
  salesValueCents: number;
};

/**
 * No aggregate endpoint exists, so every figure here is derived from the full
 * list responses.
 *
 * All money is accumulated in integer cents. The API sends decimal as a JSON
 * number, and summing those floats drifts: 19.99 * 3 lands on 59.97000000000001.
 */
export function computeStats(
  products: Product[],
  sales: Sale[],
  threshold: number,
): DashboardStats {
  let totalStockUnits = 0;
  let inventoryValueCents = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  for (const product of products) {
    totalStockUnits += product.stock;
    inventoryValueCents += toCents(product.price) * product.stock;

    if (product.stock <= 0) outOfStockCount += 1;
    else if (product.stock <= threshold) lowStockCount += 1;
  }

  return {
    totalProducts: products.length,
    totalStockUnits,
    inventoryValueCents,
    lowStockCount,
    outOfStockCount,
    // Every sale ever recorded. Sale.Status is free text with no cancelled or
    // refunded concept server-side, so this cannot honestly be called revenue
    // and the tile does not call it that.
    salesValueCents: sales.reduce((total, sale) => total + toCents(sale.totalPrice), 0),
  };
}

export type LowStockRow = Product & { resolvedCategory: string };

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
