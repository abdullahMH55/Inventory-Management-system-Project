import { z } from 'zod';

/** Mirrors SupplierResponse (identical shape to Customer). */
export const supplierSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
});

export type Supplier = z.infer<typeof supplierSchema>;

/** Mirrors CreateSupplierRequest: Name required (<=255), the rest optional. */
export const supplierFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z
    .string()
    .trim()
    .max(255)
    .email('Enter a valid email')
    .or(z.literal(''))
    .optional(),
  phone: z.string().trim().max(50).optional(),
  address: z.string().trim().max(1000).optional(),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;

export type SupplierCreate = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};
export type SupplierUpdate = SupplierCreate & { id: number };
