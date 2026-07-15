import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatCurrency, formatNumber, formatRelative } from '@/shared/lib/format';
import type { ActivityItem } from '../lib/activity';

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <section className="min-w-0" aria-labelledby="activity-heading">
      <h2 id="activity-heading" className="pb-3 text-sm font-medium">
        Recent movement
      </h2>

      {items.length === 0 ? (
        <div className="border-t border-rule">
          <EmptyState
            icon={History}
            title="No movement yet"
            description="Sales and restocks will appear here as they happen."
          />
        </div>
      ) : (
        <ul className="border-t border-rule">
          {items.map((item) => {
            const isSale = item.kind === 'sale';
            const Icon = isSale ? ArrowUpRight : ArrowDownLeft;

            return (
              <li
                key={item.id}
                className="flex items-baseline gap-3 border-b border-rule/60 py-2.5"
              >
                <Icon
                  className="size-3.5 shrink-0 translate-y-0.5 text-muted-foreground"
                  aria-hidden
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.subtitle} · {formatRelative(item.at)}
                  </p>
                </div>

                <span className="numeric shrink-0 text-sm">
                  {isSale
                    ? formatCurrency(item.amountCents ?? 0)
                    : `+${formatNumber(item.quantity ?? 0)}`}
                  <span className="sr-only">{isSale ? ' sold' : ' units restocked'}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
