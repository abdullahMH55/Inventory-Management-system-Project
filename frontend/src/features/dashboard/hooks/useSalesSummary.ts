import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { qk } from '@/shared/api/query-keys';
import { dashboardApi } from '../api/dashboard.api';

const pad = (n: number) => String(n).padStart(2, '0');
const toApiDateTime = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
  `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

/**
 * Sales value per day over the trailing window. `to` is end-of-today (not
 * midnight) so today's sales, which carry a time, fall inside the inclusive
 * `<= to` range the API uses. The range is day-granular so the query key is
 * stable within a day and does not refetch on every render.
 */
export function useSalesSummary(days = 30) {
  // Same string all day, so the memo (and query key) is stable until midnight.
  const dayAnchor = new Date().toDateString();
  const params = useMemo(() => {
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);
    const to = new Date();
    to.setHours(23, 59, 59, 0);
    return { from: toApiDateTime(from), to: toApiDateTime(to), groupBy: 'day' as const };
  }, [days, dayAnchor]);

  return useQuery({
    queryKey: qk.reports.salesSummary(params),
    queryFn: () => dashboardApi.salesSummary(params),
  });
}
