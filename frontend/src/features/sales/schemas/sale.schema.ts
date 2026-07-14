import { z } from 'zod';

/** Mirrors SaleProductResponse. */
export const saleProductSchema = z.object({
  id: z.number().int(),
  productId: z.number().int(),
  productName: z.string(),
  quantity: z.number().int(),
  dateOut: z.string(),
  notes: z.string().nullable(),
});

/** Mirrors SaleResponse. The list endpoint Includes Customer and SaleProducts, so both are populated. */
export const saleSchema = z.object({
  id: z.number().int(),
  customerId: z.number().int(),
  customerName: z.string(),
  // "2026-07-14T10:30:00": a DateTime with no offset. Kept as a string and
  // parsed at the edge by parseApiDate, which is the one place that assumption lives.
  date: z.string(),
  totalPrice: z.number(),
  // Free text, nullable, unconstrained. There is no cancelled/refunded concept
  // server-side, so no total can be filtered on it honestly.
  status: z.string().nullable(),
  saleProducts: z.array(saleProductSchema).default([]),
});

export type Sale = z.infer<typeof saleSchema>;
export type SaleProduct = z.infer<typeof saleProductSchema>;
