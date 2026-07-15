import { useMemo } from 'react';
import { useSession } from '@/features/auth/hooks/useSession';
import { useProducts } from '@/features/products/hooks/useProducts';
import { usePurchases } from '@/features/purchases/hooks/usePurchases';
import { useSales } from '@/features/sales/hooks/useSales';
import { ErrorState } from '@/shared/components/ErrorState';
import { useLowStockThreshold } from '@/shared/hooks/useLowStockThreshold';
import type { AppError } from '@/shared/api/errors';
import { ActivityFeed } from '../components/ActivityFeed';
import { DashboardEmptyState } from '../components/DashboardEmptyState';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { LowStockTable } from '../components/LowStockTable';
import { SalesChart } from '../components/SalesChart';
import { StatBand } from '../components/StatBand';
import { TopProducts } from '../components/TopProducts';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useSalesSummary } from '../hooks/useSalesSummary';
import { useTopProducts } from '../hooks/useTopProducts';
import { mergeActivity } from '../lib/activity';
import { fillDailySeries } from '../lib/series';
import { selectLowStock } from '../lib/stats';

/** Greeting the clock, not the template: "Morning" at 9pm is a small lie. */
function greeting(hour = new Date().getHours()): string {
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

export default function DashboardPage() {
  const { user } = useSession();
  const [threshold, setThreshold] = useLowStockThreshold();

  // The stat band and chart come from the server; the low-stock table and
  // activity feed still need actual rows, so those keep their list queries.
  const statsQuery = useDashboardStats(threshold);
  const summaryQuery = useSalesSummary();
  const topQuery = useTopProducts();
  const productsQuery = useProducts();
  const salesQuery = useSales();
  const purchasesQuery = usePurchases();

  const queries = [statsQuery, summaryQuery, topQuery, productsQuery, salesQuery, purchasesQuery];

  const products = productsQuery.data ?? [];
  const lowStock = useMemo(() => selectLowStock(products, [], threshold), [products, threshold]);
  const activity = useMemo(
    () => mergeActivity(salesQuery.data ?? [], purchasesQuery.data ?? []),
    [salesQuery.data, purchasesQuery.data],
  );
  const series = useMemo(() => fillDailySeries(summaryQuery.data ?? []), [summaryQuery.data]);

  if (queries.some((q) => q.isPending)) return <DashboardSkeleton />;

  if (queries.some((q) => q.isError)) {
    const error = queries.find((q) => q.error)?.error as AppError | undefined;
    return (
      <div className="grid h-full place-items-center p-6">
        <ErrorState error={error} onRetry={() => queries.forEach((q) => void q.refetch())} />
      </div>
    );
  }

  const stats = statsQuery.data!;

  // A genuinely blank account, which is where every new registration lands.
  if (stats.totalProducts === 0 && stats.salesCount === 0 && stats.purchasesCount === 0) {
    return (
      <DashboardEmptyState
        hasCategories={stats.categoriesCount > 0}
        hasProducts={stats.totalProducts > 0}
        hasSales={stats.salesCount > 0}
      />
    );
  }

  const firstName = user?.name.split(' ')[0];

  return (
    <div className="p-6">
      <header className="pb-5">
        <h1 className="text-lg font-medium tracking-tight">
          {firstName ? `${greeting()}, ${firstName}` : 'Overview'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Where your stock stands right now.</p>
      </header>

      <StatBand stats={stats} threshold={threshold} />

      {/* Partial-empty is not the same as empty: each panel owns its own empty
          state, so products-but-no-sales still shows the table and the band. */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <LowStockTable rows={lowStock} threshold={threshold} onThresholdChange={setThreshold} />
        <ActivityFeed items={activity} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <SalesChart series={series} hasSales={stats.salesCount > 0} />
        <TopProducts items={topQuery.data ?? []} />
      </div>
    </div>
  );
}
