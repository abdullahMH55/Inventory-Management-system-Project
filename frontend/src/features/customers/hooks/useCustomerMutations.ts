import { qk } from '@/shared/api/query-keys';
import { useCrudMutation } from '@/shared/api/mutations';
import { customersApi } from '../api/customers.api';

export const useCreateCustomer = () =>
  useCrudMutation({ mutationFn: customersApi.create, invalidates: [qk.customers.all()] });

// Sales carry the customer name, so a rename must refresh them too.
export const useUpdateCustomer = () =>
  useCrudMutation({
    mutationFn: customersApi.update,
    invalidates: [qk.customers.all(), qk.sales.all()],
  });

export const useDeleteCustomer = () =>
  useCrudMutation({
    mutationFn: customersApi.remove,
    invalidates: [qk.customers.all(), qk.sales.all()],
  });
