import { qk } from '@/shared/api/query-keys';
import { useCrudMutation } from '@/shared/api/mutations';
import { purchasesApi } from '../api/purchases.api';

// Every purchase mutation moves stock, so products must refresh too.
export const useCreatePurchase = () =>
  useCrudMutation({
    mutationFn: purchasesApi.create,
    invalidates: [qk.purchases.all(), qk.products.all()],
  });

export const useUpdatePurchase = () =>
  useCrudMutation({
    mutationFn: purchasesApi.update,
    invalidates: [qk.purchases.all(), qk.products.all()],
  });

export const useDeletePurchase = () =>
  useCrudMutation({
    mutationFn: purchasesApi.remove,
    invalidates: [qk.purchases.all(), qk.products.all()],
  });
