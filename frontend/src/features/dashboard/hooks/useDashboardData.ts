import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { categoriesApi } from '@/features/categories/api/categories.api';
import { productsApi } from '@/features/products/api/products.api';
import { purchasesApi } from '@/features/purchases/api/purchases.api';
import { salesApi } from '@/features/sales/api/sales.api';
import type { AppError } from '@/shared/api/errors';
import { qk } from '@/shared/api/query-keys';
import { mergeActivity } from '../lib/activity';
import { buildSalesSeries } from '../lib/series';
import { computeStats, selectLowStock } from '../lib/stats';

/**
 * Four full-table reads, because the API has no aggregate endpoint. They share
 * their keys with the feature hooks, so this is one cache entry per resource and
 * a future product mutation invalidating qk.products.all() refreshes the
 * dashboard without knowing the dashboard exists.
 *
 * This does not scale: there is no pagination, and the sales response inlines
 * every line item. Fine at demo size, wrong at 5,000 sales. The real fix is a
 * server-side /api/Dashboard/stats.
 */
export function useDashboardData(threshold: number) {
  const results = useQueries({
    queries: [
      { queryKey: qk.products.list(), queryFn: productsApi.list },
      { queryKey: qk.categories.list(), queryFn: categoriesApi.list },
      { queryKey: qk.sales.list(), queryFn: salesApi.list },
      { queryKey: qk.purchases.list(), queryFn: purchasesApi.list },
    ],
    combine: (queries) => {
      const [products, categories, sales, purchases] = queries;

      return {
        products: products.data ?? [],
        categories: categories.data ?? [],
        sales: sales.data ?? [],
        purchases: purchases.data ?? [],
        isPending: queries.some((query) => query.isPending),
        isError: queries.some((query) => query.isError),
        error: queries.find((query) => query.error)?.error as AppError | undefined,
        // A genuinely blank account: everything loaded, nothing in it. Not the
        // same as "no sales yet", which is a per-card empty state.
        isEmpty:
          queries.every((query) => query.isSuccess) &&
          (products.data?.length ?? 0) === 0 &&
          (sales.data?.length ?? 0) === 0 &&
          (purchases.data?.length ?? 0) === 0,
        refetchAll: () => {
          for (const query of queries) void query.refetch();
        },
      };
    },
  });

  const { products, categories, sales, purchases } = results;

  // TanStack Query's structural sharing keeps `data` referentially stable when
  // nothing changed, so these memos actually hold, and moving the threshold
  // only re-runs the two that depend on it.
  const stats = useMemo(
    () => computeStats(products, sales, threshold),
    [products, sales, threshold],
  );

  const lowStock = useMemo(
    () => selectLowStock(products, categories, threshold),
    [products, categories, threshold],
  );

  const activity = useMemo(() => mergeActivity(sales, purchases), [sales, purchases]);
  const series = useMemo(() => buildSalesSeries(sales), [sales]);

  return { ...results, stats, lowStock, activity, series };
}
