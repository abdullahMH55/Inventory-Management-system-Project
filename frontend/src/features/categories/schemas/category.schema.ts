import { z } from 'zod';

/** Mirrors CategoryResponse. */
export const categorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  // productCount is now populated server-side, but the products list is the
  // source of truth for counts on the dashboard; this is only a convenience.
  productCount: z.number().int(),
});

export type Category = z.infer<typeof categorySchema>;

/** The form mirrors CreateCategoryRequest: Name required (<=255), Description optional. */
export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255, 'Name is too long'),
  description: z.string().trim().max(2000).optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export type CategoryCreate = { name: string; description: string | null };
export type CategoryUpdate = CategoryCreate & { id: number };
