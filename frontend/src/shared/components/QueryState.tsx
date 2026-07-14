import type { ReactNode } from 'react';
import type { AppError } from '@/shared/api/errors';
import { ErrorState } from '@/shared/components/ErrorState';

/**
 * The pending / error / data gate, written once instead of in every list page.
 * Structurally typed so it accepts a plain useQuery result or a hand-combined
 * one (e.g. products + categories).
 */
export function QueryState<T>({
  query,
  skeleton,
  children,
}: {
  query: {
    data: T | undefined;
    isPending: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };
  skeleton: ReactNode;
  children: (data: T) => ReactNode;
}) {
  if (query.isPending) return <>{skeleton}</>;

  if (query.isError) {
    return (
      <div className="p-6">
        <ErrorState error={query.error as AppError} onRetry={() => query.refetch()} />
      </div>
    );
  }

  return <>{children(query.data as T)}</>;
}
