import { PackageCheck } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/cn';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { THRESHOLD_OPTIONS } from '../hooks/useLowStockThreshold';
import type { LowStockRow } from '../lib/stats';

function StockCell({ stock }: { stock: number }) {
  const out = stock <= 0;

  return (
    <span
      className={cn('numeric text-sm', out ? 'text-stock-out' : 'text-stock-low')}
      title={out ? 'Out of stock' : 'Low stock'}
    >
      {formatNumber(stock)}
      <span className="sr-only">{out ? ' units, out of stock' : ' units, low stock'}</span>
    </span>
  );
}

export function LowStockTable({
  rows,
  threshold,
  onThresholdChange,
}: {
  rows: LowStockRow[];
  threshold: number;
  onThresholdChange: (value: number) => void;
}) {
  return (
    <section className="min-w-0" aria-labelledby="low-stock-heading">
      <div className="flex items-center justify-between gap-4 pb-3">
        <h2 id="low-stock-heading" className="text-sm font-medium">
          Running low
        </h2>

        <Select
          value={String(threshold)}
          onValueChange={(value) => onThresholdChange(Number(value))}
        >
          <SelectTrigger size="sm" className="w-auto gap-1.5" aria-label="Low stock threshold">
            {/* The trigger must read the same as the options: a bare "10" does
                not say what it is a threshold of. */}
            <SelectValue>{(value: string) => `≤ ${value} units`}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {THRESHOLD_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                ≤ {option} units
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <div className="border-t border-rule">
          <EmptyState
            icon={PackageCheck}
            title="Nothing is running low"
            description={`Every product has more than ${threshold} units in stock.`}
          />
        </div>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-rule text-left">
              <th scope="col" className="py-2 pr-4 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Product
              </th>
              <th scope="col" className="hidden py-2 pr-4 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground sm:table-cell">
                Category
              </th>
              <th scope="col" className="py-2 pr-4 text-right text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Left
              </th>
              <th scope="col" className="py-2 text-right text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-rule/60">
                <td className="py-2.5 pr-4">
                  <span className="block truncate">{row.name}</span>
                </td>
                <td className="hidden py-2.5 pr-4 text-muted-foreground sm:table-cell">
                  <span className="block truncate">{row.resolvedCategory}</span>
                </td>
                <td className="py-2.5 pr-4 text-right">
                  <StockCell stock={row.stock} />
                </td>
                <td className="numeric py-2.5 text-right text-muted-foreground">
                  {formatCurrency(Math.round(row.price * 100))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
