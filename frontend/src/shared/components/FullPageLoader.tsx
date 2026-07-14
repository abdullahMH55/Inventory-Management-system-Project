import { Skeleton } from '@/shared/components/ui/skeleton';

/**
 * Shown while the session is still unknown (the /me query has not resolved).
 *
 * It is shaped like AppShell on purpose: same sidebar width, same topbar
 * height. A centred spinner would collapse into a completely different layout
 * the instant data lands, and the page would visibly jump.
 */
export function FullPageLoader() {
  return (
    <div className="flex h-dvh" aria-busy="true" aria-label="Loading">
      <aside className="hidden w-60 shrink-0 border-r border-rule bg-panel p-4 md:block">
        <Skeleton className="h-6 w-32" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-rule bg-panel px-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="size-8 rounded-full" />
        </header>
        <main className="flex-1 p-6">
          <Skeleton className="h-24 w-full" />
        </main>
      </div>
    </div>
  );
}
