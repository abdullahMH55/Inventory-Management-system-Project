import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/query-keys';
import { salesApi } from '../api/sales.api';

export function useSales() {
  return useQuery({ queryKey: qk.sales.list(), queryFn: salesApi.list });
}
