import { z } from 'zod';
import { api } from '@/shared/api/client';
import { request } from '@/shared/lib/zod';
import { saleSchema, type Sale } from '../schemas/sale.schema';

export const salesApi = {
  list: (): Promise<Sale[]> => request(z.array(saleSchema), api.get('/Sales')),
};
