import { z } from 'zod';

/** Mirrors ProductResponse. */
export const productSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  stock: z.number().int(),
  categoryId: z.number().int(),
  // Always "" on the list endpoint: ProductRepository.GetByUserIdAsync does not
  // Include(p => p.Category), while the detail endpoint does. The dashboard
  // fills it in client-side from the categories list.
  categoryName: z.string(),
});

export type Product = z.infer<typeof productSchema>;

/**
 * Mirrors CreateProductRequest. z.number() (not coerce) so an empty number input
 * arrives as NaN and is rejected, rather than coerced to 0 and slipping a
 * zero-price or the "no category" sentinel through.
 */
export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255, 'Name is too long'),
  description: z.string().trim().max(2000).optional(),
  price: z
    .number({ message: 'Price is required' })
    .positive('Price must be greater than 0'),
  stock: z
    .number({ message: 'Stock is required' })
    .int('Whole units only')
    .min(0, 'Stock cannot be negative'),
  categoryId: z
    .number({ message: 'Choose a category' })
    .int()
    .positive('Choose a category'),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export type ProductCreate = {
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: number;
};
export type ProductUpdate = ProductCreate & { id: number };
