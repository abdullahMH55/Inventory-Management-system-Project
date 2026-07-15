import { qk } from '@/shared/api/query-keys';
import { useCrudMutation } from '@/shared/api/mutations';
import { productsApi } from '../api/products.api';

export const useCreateProduct = () =>
  useCrudMutation({ mutationFn: productsApi.create, invalidates: [qk.products.all()] });

// Sales and purchases carry the product name, so an edit must refresh them too.
export const useUpdateProduct = () =>
  useCrudMutation({
    mutationFn: productsApi.update,
    invalidates: [qk.products.all(), qk.sales.all(), qk.purchases.all()],
  });

export const useDeleteProduct = () =>
  useCrudMutation({
    mutationFn: productsApi.remove,
    invalidates: [qk.products.all(), qk.sales.all(), qk.purchases.all()],
  });
