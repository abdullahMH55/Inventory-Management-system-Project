import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/query-keys';
import { categoriesApi } from '../api/categories.api';

export function useCategories() {
  return useQuery({ queryKey: qk.categories.list(), queryFn: categoriesApi.list });
}
