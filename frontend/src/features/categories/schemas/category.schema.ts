import { z } from 'zod';

/** Mirrors CategoryResponse. */
export const categorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  // Always 0: CategoryRepository never Includes Products, yet CategoryService
  // reads c.Products.Count. Never render this. Derive counts from the products list.
  productCount: z.number().int(),
});

export type Category = z.infer<typeof categorySchema>;
