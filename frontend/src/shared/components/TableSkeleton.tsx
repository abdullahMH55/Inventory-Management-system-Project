import { Skeleton } from '@/shared/components/ui/skeleton';

/**
 * A table shell at the final geometry, so the real table does not reflow when
 * data lands. Rendered by list pages while their query is pending.
 */
export function TableSkeleton({ columns, rows = 6 }: { columns: number; rows?: number }) {
  return (
    <div className="p-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-full max-w-xs" />
      <div className="mt-4 border-t border-rule">
        <div className="flex gap-4 border-b border-rule py-2">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 border-b border-rule/60 py-3">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
