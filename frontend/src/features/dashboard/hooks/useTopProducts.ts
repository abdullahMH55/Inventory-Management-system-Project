import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/query-keys';
import { dashboardApi } from '../api/dashboard.api';

/** All-time best sellers by units. */
export function useTopProducts(limit = 5) {
  const params = { limit };
  return useQuery({
    queryKey: qk.reports.topProducts(params),
    queryFn: () => dashboardApi.topProducts(params),
  });
}
