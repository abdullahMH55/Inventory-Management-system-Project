import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EmptyState } from '@/shared/components/EmptyState';
import { LineChart } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/format';
import type { SeriesPoint } from '../lib/series';

function shortDay(day: string): string {
  const [, month, date] = day.split('-');
  return `${date}/${month}`;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="numeric mt-0.5 text-sm text-popover-foreground">
        {formatCurrency(payload[0].value ?? 0)}
      </p>
    </div>
  );
}

export function SalesChart({ series, hasSales }: { series: SeriesPoint[]; hasSales: boolean }) {
  return (
    <section aria-labelledby="sales-chart-heading">
      <h2 id="sales-chart-heading" className="pb-3 text-sm font-medium">
        Sales, last 30 days
      </h2>

      {!hasSales ? (
        <div className="border-t border-rule">
          <EmptyState
            icon={LineChart}
            title="No sales yet"
            // An empty axis would imply a measured zero. There is nothing to measure.
            description="Once you record a sale, its value will be plotted here by day."
          />
        </div>
      ) : (
        <div className="h-56 border-t border-rule pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" vertical={false} />

              <XAxis
                dataKey="day"
                tickFormatter={shortDay}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--rule)' }}
                minTickGap={28}
              />
              <YAxis
                tickFormatter={(cents: number) => formatCurrency(cents)}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                width={72}
              />

              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--rule)' }} />

              <Area
                // Linear, not monotone: these are discrete daily totals, and a
                // spline curves through the zero days and overshoots, implying
                // sales on days that had none.
                type="linear"
                dataKey="valueCents"
                stroke="var(--chart-1)"
                strokeWidth={1.5}
                fill="url(#salesFill)"
                // State, not decoration: the line is the data, it does not need to perform.
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
