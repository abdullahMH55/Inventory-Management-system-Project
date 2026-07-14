import type { Purchase } from '@/features/purchases/schemas/purchase.schema';
import type { Sale } from '@/features/sales/schemas/sale.schema';
import { parseApiDate, toCents } from '@/shared/lib/format';

export type ActivityItem = {
  id: string;
  kind: 'sale' | 'purchase';
  at: Date;
  title: string;
  subtitle: string;
  amountCents?: number;
  quantity?: number;
};

/**
 * There is no movement ledger server-side, so recent activity is stitched from
 * the sales and purchases tables.
 *
 * The id is prefixed, and that is not cosmetic: sales and purchases are separate
 * tables that both start at Id = 1, so a raw id would produce duplicate React
 * keys and genuinely mis-rendered rows.
 */
export function mergeActivity(sales: Sale[], purchases: Purchase[], limit = 8): ActivityItem[] {
  const items: ActivityItem[] = [
    ...sales.map((sale) => ({
      id: `sale-${sale.id}`,
      kind: 'sale' as const,
      at: parseApiDate(sale.date),
      title: `Sold to ${sale.customerName || 'unknown customer'}`,
      subtitle:
        sale.status?.trim() ||
        `${sale.saleProducts.length} ${sale.saleProducts.length === 1 ? 'item' : 'items'}`,
      amountCents: toCents(sale.totalPrice),
    })),
    ...purchases.map((purchase) => ({
      id: `purchase-${purchase.id}`,
      kind: 'purchase' as const,
      at: parseApiDate(purchase.dateIn),
      title: `Restocked ${purchase.productName || 'a product'}`,
      subtitle: purchase.supplierName ? `from ${purchase.supplierName}` : 'Purchase',
      quantity: purchase.quantity,
    })),
  ];

  return items
    // One unparseable date must not take the whole feed down.
    .filter((item) => !Number.isNaN(item.at.getTime()))
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, limit);
}
