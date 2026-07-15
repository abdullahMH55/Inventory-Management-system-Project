import { qk } from '@/shared/api/query-keys';
import { useCrudMutation } from '@/shared/api/mutations';
import { categoriesApi } from '../api/categories.api';

export const useCreateCategory = () =>
  useCrudMutation({ mutationFn: categoriesApi.create, invalidates: [qk.categories.all()] });

// Products carry the category name, so a rename must refresh them too.
export const useUpdateCategory = () =>
  useCrudMutation({
    mutationFn: categoriesApi.update,
    invalidates: [qk.categories.all(), qk.products.all()],
  });

export const useDeleteCategory = () =>
  useCrudMutation({
    mutationFn: categoriesApi.remove,
    invalidates: [qk.categories.all(), qk.products.all()],
  });
