import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/query-keys';
import { productsApi } from '../api/products.api';

export function useProducts() {
  return useQuery({ queryKey: qk.products.list(), queryFn: productsApi.list });
}
