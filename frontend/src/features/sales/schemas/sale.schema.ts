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

export const saleLineFormSchema = z.object({
  productId: z.number({ message: 'Choose a product' }).int().positive('Choose a product'),
  quantity: z
    .number({ message: 'Quantity is required' })
    .int('Whole units only')
    .positive('At least 1'),
  notes: z.string().trim().max(500).optional(),
});

export const saleFormSchema = z.object({
  customerId: z.number({ message: 'Choose a customer' }).int().positive('Choose a customer'),
  date: z.string().min(1, 'Date is required'),
  // Free text server-side; a plain input with a datalist, not a fake enum.
  status: z.string().trim().max(50).optional(),
  lines: z.array(saleLineFormSchema).min(1, 'Add at least one product'),
});

export type SaleFormValues = z.infer<typeof saleFormSchema>;

/** POST body: each line also carries dateOut (= the sale date; see the form). */
export type SaleCreate = {
  customerId: number;
  date: string;
  status: string | null;
  saleProducts: { productId: number; quantity: number; dateOut: string; notes: string | null }[];
};

/** PATCH body: header only. Line items are not editable by any endpoint. */
export type SalePatch = {
  customerId?: number;
  date?: string;
  status?: string | null;
};
