import { TrendingUp } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatNumber } from '@/shared/lib/format';
import type { TopProduct } from '../schemas/dashboard.schema';

export function TopProducts({ items }: { items: TopProduct[] }) {
  return (
    <section className="min-w-0" aria-labelledby="top-products-heading">
      <h2 id="top-products-heading" className="pb-3 text-sm font-medium">
        Best sellers
      </h2>

      {items.length === 0 ? (
        <div className="border-t border-rule">
          <EmptyState
            icon={TrendingUp}
            title="No sales yet"
            description="Your best-selling products will show up here."
          />
        </div>
      ) : (
        <ol className="border-t border-rule">
          {items.map((item, index) => (
            <li
              key={item.productId}
              className="flex items-baseline gap-3 border-b border-rule/60 py-2.5"
            >
              <span className="numeric w-4 shrink-0 text-xs text-muted-foreground">{index + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm">{item.productName}</span>
              <span className="numeric shrink-0 text-sm">
                {formatNumber(item.unitsSold)}
                <span className="text-xs text-muted-foreground"> sold</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
