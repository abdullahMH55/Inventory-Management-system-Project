import { z } from 'zod';

/**
 * Mirrors PurchaseProductResponse. The list endpoint Includes Product and
 * Supplier, so both names are populated.
 *
 * Note there is no unit cost on a purchase, so cost of goods and purchase spend
 * cannot be computed from this API at all.
 */
export const purchaseSchema = z.object({
  id: z.number().int(),
  productId: z.number().int(),
  productName: z.string(),
  supplierId: z.number().int(),
  supplierName: z.string(),
  quantity: z.number().int(),
  dateIn: z.string(),
  notes: z.string().nullable(),
});

export type Purchase = z.infer<typeof purchaseSchema>;
