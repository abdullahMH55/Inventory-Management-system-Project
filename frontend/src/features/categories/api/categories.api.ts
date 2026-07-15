import { z } from 'zod';
import { api } from '@/shared/api/client';
import { request } from '@/shared/lib/zod';
import {
  categorySchema,
  type Category,
  type CategoryCreate,
  type CategoryUpdate,
} from '../schemas/category.schema';

export const categoriesApi = {
  list: (): Promise<Category[]> => request(z.array(categorySchema), api.get('/Categories')),

  create: (body: CategoryCreate): Promise<Category> =>
    request(categorySchema, api.post('/Categories', body)),

  // The id in the URL is derived from the body, so they can never diverge and
  // the server's "Id mismatch" 400 is unreachable.
  update: (body: CategoryUpdate): Promise<Category> =>
    request(categorySchema, api.put(`/Categories/${body.id}`, body)),

  remove: (id: number): Promise<number> => api.delete(`/Categories/${id}`).then(() => id),
};
