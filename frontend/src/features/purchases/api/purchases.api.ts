import { z } from 'zod';
import { api } from '@/shared/api/client';
import { request } from '@/shared/lib/zod';
import { purchaseSchema, type Purchase } from '../schemas/purchase.schema';

export const purchasesApi = {
  list: (): Promise<Purchase[]> =>
    request(z.array(purchaseSchema), api.get('/PurchaseProducts')),
};
