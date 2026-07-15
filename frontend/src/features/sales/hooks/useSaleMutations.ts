import { qk } from '@/shared/api/query-keys';
import { useCrudMutation } from '@/shared/api/mutations';
import { salesApi } from '../api/sales.api';

// Create and delete move stock, so products must refresh too.
export const useCreateSale = () =>
  useCrudMutation({
    mutationFn: salesApi.create,
    invalidates: [qk.sales.all(), qk.products.all()],
  });

// Patch is header only: no stock movement, so sales alone.
export const usePatchSale = () =>
  useCrudMutation({ mutationFn: salesApi.patch, invalidates: [qk.sales.all()] });

export const useDeleteSale = () =>
  useCrudMutation({
    mutationFn: salesApi.remove,
    invalidates: [qk.sales.all(), qk.products.all()],
  });
