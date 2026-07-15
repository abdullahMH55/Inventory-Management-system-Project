import { cn } from '@/shared/lib/cn';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import type { DashboardStats } from '../lib/stats';

/**
 * One ruled band divided by hairlines, not four cards.
 *
 * A row of identical cards is the reflex answer for a dashboard and it reads as
 * four unrelated things. These five figures describe one inventory, so they sit
 * in one instrument.
 */
function Cell({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'low' | 'out';
}) {
  return (
    <div className="min-w-0 flex-1 px-5 py-4 first:pl-0 lg:border-l lg:border-rule lg:first:border-l-0">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'numeric mt-1.5 text-2xl leading-none',
          tone === 'low' && 'text-stock-low',
          tone === 'out' && 'text-stock-out',
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function StatBand({ stats, threshold }: { stats: DashboardStats; threshold: number }) {
  return (
    <section
      className="grid grid-cols-2 divide-y divide-rule border-y border-rule sm:grid-cols-3 lg:flex lg:divide-y-0"
      aria-label="Inventory summary"
    >
      <Cell
        label="Products"
        value={formatNumber(stats.totalProducts)}
        hint={`${formatNumber(stats.totalStockUnits)} units on hand`}
      />
      <Cell
        label="Stock value"
        value={formatCurrency(stats.inventoryValueCents)}
        hint="Price x quantity on hand"
      />
      <Cell
        label="Low stock"
        value={formatNumber(stats.lowStockCount)}
        // The threshold is a local preference, not data, so the tile says what it means.
        hint={`≤ ${threshold} units left`}
        tone={stats.lowStockCount > 0 ? 'low' : undefined}
      />
      <Cell
        label="Out of stock"
        value={formatNumber(stats.outOfStockCount)}
        hint="Nothing left to sell"
        tone={stats.outOfStockCount > 0 ? 'out' : undefined}
      />
      <Cell
        label="Sales value"
        value={formatCurrency(stats.salesValueCents)}
        // Not "revenue": Sale.Status is free text and nothing server-side knows
        // what a cancelled sale is, so every sale ever recorded counts here.
        hint="All sales ever recorded"
      />
    </section>
  );
}
