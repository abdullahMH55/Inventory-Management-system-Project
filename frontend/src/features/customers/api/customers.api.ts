import { z } from 'zod';
import { api } from '@/shared/api/client';
import { request } from '@/shared/lib/zod';
import {
  customerSchema,
  type Customer,
  type CustomerCreate,
  type CustomerUpdate,
} from '../schemas/customer.schema';

export const customersApi = {
  list: (): Promise<Customer[]> => request(z.array(customerSchema), api.get('/Customers')),

  create: (body: CustomerCreate): Promise<Customer> =>
    request(customerSchema, api.post('/Customers', body)),

  update: (body: CustomerUpdate): Promise<Customer> =>
    request(customerSchema, api.put(`/Customers/${body.id}`, body)),

  remove: (id: number): Promise<number> => api.delete(`/Customers/${id}`).then(() => id),
};
