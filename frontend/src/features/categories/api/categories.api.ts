import { z } from 'zod';
import { api } from '@/shared/api/client';
import { request } from '@/shared/lib/zod';
import { categorySchema, type Category } from '../schemas/category.schema';

export const categoriesApi = {
  list: (): Promise<Category[]> => request(z.array(categorySchema), api.get('/Categories')),
};
