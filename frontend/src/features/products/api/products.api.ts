import { z } from 'zod';
import { api } from '@/shared/api/client';
import { request } from '@/shared/lib/zod';
import { productSchema, type Product } from '../schemas/product.schema';

export const productsApi = {
  // Unpaginated: the endpoint returns the caller's entire product table.
  list: (): Promise<Product[]> => request(z.array(productSchema), api.get('/Products')),
};
