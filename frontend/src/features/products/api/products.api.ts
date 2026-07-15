import { z } from 'zod';
import { api } from '@/shared/api/client';
import { request } from '@/shared/lib/zod';
import {
  productSchema,
  type Product,
  type ProductCreate,
  type ProductUpdate,
} from '../schemas/product.schema';

export const productsApi = {
  // Unpaginated: the endpoint returns the caller's entire product table.
  list: (): Promise<Product[]> => request(z.array(productSchema), api.get('/Products')),

  create: (body: ProductCreate): Promise<Product> =>
    request(productSchema, api.post('/Products', body)),

  update: (body: ProductUpdate): Promise<Product> =>
    request(productSchema, api.put(`/Products/${body.id}`, body)),

  remove: (id: number): Promise<number> => api.delete(`/Products/${id}`).then(() => id),
};
