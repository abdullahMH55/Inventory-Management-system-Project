import { Skeleton } from '@/shared/components/ui/skeleton';

/**
 * The real layout with the content greyed out, at the geometry the data will
 * land in. A centred spinner would collapse and then reflow the whole page the
 * moment it resolves.
 */
export function DashboardSkeleton() {
  return (
    <div className="p-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex flex-col divide-y divide-rule border-y border-rule lg:flex-row lg:divide-y-0">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex-1 px-5 py-4 first:pl-0 lg:border-l lg:border-rule lg:first:border-l-0">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2.5 h-6 w-24" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Skeleton className="h-4 w-28" />
          <div className="mt-3 border-t border-rule pt-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="mb-2.5 h-8 w-full" />
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="h-4 w-32" />
          <div className="mt-3 border-t border-rule pt-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="mb-2.5 h-8 w-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-3 h-56 w-full" />
      </div>
    </div>
  );
}
