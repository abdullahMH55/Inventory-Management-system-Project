import { z } from 'zod';
import { api } from '@/shared/api/client';
import { request } from '@/shared/lib/zod';
import {
  purchaseSchema,
  type Purchase,
  type PurchaseCreate,
  type PurchaseUpdate,
} from '../schemas/purchase.schema';

export const purchasesApi = {
  list: (): Promise<Purchase[]> =>
    request(z.array(purchaseSchema), api.get('/PurchaseProducts')),

  create: (body: PurchaseCreate): Promise<Purchase> =>
    request(purchaseSchema, api.post('/PurchaseProducts', body)),

  update: (body: PurchaseUpdate): Promise<Purchase> =>
    request(purchaseSchema, api.put(`/PurchaseProducts/${body.id}`, body)),

  remove: (id: number): Promise<number> =>
    api.delete(`/PurchaseProducts/${id}`).then(() => id),
};
