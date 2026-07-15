import { useSession } from '@/features/auth/hooks/useSession';
import { ErrorState } from '@/shared/components/ErrorState';
import { ActivityFeed } from '../components/ActivityFeed';
import { DashboardEmptyState } from '../components/DashboardEmptyState';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { LowStockTable } from '../components/LowStockTable';
import { SalesChart } from '../components/SalesChart';
import { StatBand } from '../components/StatBand';
import { useDashboardData } from '../hooks/useDashboardData';
import { useLowStockThreshold } from '@/shared/hooks/useLowStockThreshold';

/** Greeting the clock, not the template: "Morning" at 9pm is a small lie. */
function greeting(hour = new Date().getHours()): string {
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

export default function DashboardPage() {
  const { user } = useSession();
  const [threshold, setThreshold] = useLowStockThreshold();
  const data = useDashboardData(threshold);

  // First load only. A background refetch keeps the data on screen and says so
  // in the topbar instead; dropping back to the skeleton is what makes a
  // dashboard flicker.
  if (data.isPending) return <DashboardSkeleton />;

  if (data.isError) {
    return (
      <div className="grid h-full place-items-center p-6">
        <ErrorState error={data.error} onRetry={data.refetchAll} />
      </div>
    );
  }

  // A genuinely blank account, which is where every new registration lands.
  if (data.isEmpty) {
    return (
      <DashboardEmptyState
        hasCategories={data.categories.length > 0}
        hasProducts={data.products.length > 0}
        hasSales={data.sales.length > 0}
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
        <p className="mt-1 text-sm text-muted-foreground">
          Where your stock stands right now.
        </p>
      </header>

      <StatBand stats={data.stats} threshold={threshold} />

      {/* Partial-empty is not the same as empty: each panel owns its own empty
          state, so products-but-no-sales still shows the table and the band. */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <LowStockTable
          rows={data.lowStock}
          threshold={threshold}
          onThresholdChange={setThreshold}
        />
        <ActivityFeed items={data.activity} />
      </div>

      <div className="mt-8">
        <SalesChart series={data.series} hasSales={data.sales.length > 0} />
      </div>
    </div>
  );
}
