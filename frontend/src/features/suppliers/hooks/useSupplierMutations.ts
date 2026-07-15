import { qk } from '@/shared/api/query-keys';
import { useCrudMutation } from '@/shared/api/mutations';
import { suppliersApi } from '../api/suppliers.api';

export const useCreateSupplier = () =>
  useCrudMutation({ mutationFn: suppliersApi.create, invalidates: [qk.suppliers.all()] });

// Purchases carry the supplier name, so a rename must refresh them too.
export const useUpdateSupplier = () =>
  useCrudMutation({
    mutationFn: suppliersApi.update,
    invalidates: [qk.suppliers.all(), qk.purchases.all()],
  });

export const useDeleteSupplier = () =>
  useCrudMutation({
    mutationFn: suppliersApi.remove,
    invalidates: [qk.suppliers.all(), qk.purchases.all()],
  });
