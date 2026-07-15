import { z } from 'zod';
import { api } from '@/shared/api/client';
import { request } from '@/shared/lib/zod';
import {
  supplierSchema,
  type Supplier,
  type SupplierCreate,
  type SupplierUpdate,
} from '../schemas/supplier.schema';

export const suppliersApi = {
  list: (): Promise<Supplier[]> => request(z.array(supplierSchema), api.get('/Suppliers')),

  create: (body: SupplierCreate): Promise<Supplier> =>
    request(supplierSchema, api.post('/Suppliers', body)),

  update: (body: SupplierUpdate): Promise<Supplier> =>
    request(supplierSchema, api.put(`/Suppliers/${body.id}`, body)),

  remove: (id: number): Promise<number> => api.delete(`/Suppliers/${id}`).then(() => id),
};
