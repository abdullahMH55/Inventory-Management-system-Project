import { z } from 'zod';
import { api } from '@/shared/api/client';
import { request } from '@/shared/lib/zod';
import { saleSchema, type Sale, type SaleCreate, type SalePatch } from '../schemas/sale.schema';

export const salesApi = {
  list: (): Promise<Sale[]> => request(z.array(saleSchema), api.get('/Sales')),

  create: (body: SaleCreate): Promise<Sale> => request(saleSchema, api.post('/Sales', body)),

  // Header only. There is no endpoint that edits line items correctly, so we
  // deliberately never touch /api/SaleProducts. To change lines, delete and
  // recreate (delete restores stock).
  patch: ({ id, ...body }: SalePatch & { id: number }): Promise<Sale> =>
    request(saleSchema, api.patch(`/Sales/${id}`, body)),

  remove: (id: number): Promise<number> => api.delete(`/Sales/${id}`).then(() => id),
};
