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

/** Mirrors CreatePurchaseProductRequest. There is no cost field: the API has none. */
export const purchaseFormSchema = z.object({
  productId: z.number({ message: 'Choose a product' }).int().positive('Choose a product'),
  supplierId: z.number({ message: 'Choose a supplier' }).int().positive('Choose a supplier'),
  quantity: z
    .number({ message: 'Quantity is required' })
    .int('Whole units only')
    .positive('At least 1'),
  dateIn: z.string().min(1, 'Date is required'),
  notes: z.string().trim().max(1000).optional(),
});

export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

export type PurchaseCreate = {
  productId: number;
  supplierId: number;
  quantity: number;
  dateIn: string;
  notes: string | null;
};
export type PurchaseUpdate = PurchaseCreate & { id: number };
