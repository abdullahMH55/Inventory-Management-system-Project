import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import type { AppError } from './errors';
import { qk } from './query-keys';

/**
 * The plumbing half of every create/update/delete: run the mutation, then
 * invalidate the affected lists. Each feature supplies only the mutationFn and
 * which keys to invalidate.
 *
 * Invalidation is awaited inside onSuccess on purpose: isPending stays true
 * until the lists have refetched, so a form sheet closes onto fresh data rather
 * than onto the stale row it just edited.
 *
 * The dashboard stats and reports live under their own keys, so they are
 * invalidated here for EVERY crud mutation — nearly all of them move a count or
 * a value, and refetching three small endpoints is cheap. That keeps the
 * "record a sale, the dashboard updates itself" property with no per-feature wiring.
 *
 * There is no onError: forms render mutation.error via FormError, and
 * DeleteConfirm renders it inline. A global handler would fight both.
 */
export function useCrudMutation<TData, TVars>(options: {
  mutationFn: (vars: TVars) => Promise<TData>;
  invalidates: readonly QueryKey[];
  onDone?: (data: TData, vars: TVars) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<TData, AppError, TVars>({
    mutationFn: options.mutationFn,
    onSuccess: async (data, vars) => {
      const keys = [...options.invalidates, qk.dashboard.all(), qk.reports.all()];
      await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      options.onDone?.(data, vars);
    },
  });
}
