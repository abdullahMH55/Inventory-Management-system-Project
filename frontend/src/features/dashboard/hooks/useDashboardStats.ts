import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/query-keys';
import { dashboardApi } from '../api/dashboard.api';

/**
 * Server-computed stats. Keyed by the threshold so changing the low-stock
 * selector refetches with the new lowStockThreshold and the count moves.
 */
export function useDashboardStats(threshold: number) {
  return useQuery({
    queryKey: qk.dashboard.stats(threshold),
    queryFn: () => dashboardApi.stats(threshold),
  });
}
