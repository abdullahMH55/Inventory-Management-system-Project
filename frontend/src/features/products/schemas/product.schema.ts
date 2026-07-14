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
