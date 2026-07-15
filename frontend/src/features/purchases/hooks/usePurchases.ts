import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/query-keys';
import { purchasesApi } from '../api/purchases.api';

export function usePurchases() {
  return useQuery({ queryKey: qk.purchases.list(), queryFn: purchasesApi.list });
}
