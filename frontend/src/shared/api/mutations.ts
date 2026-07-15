import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import type { AppError } from './errors';

/**
 * The plumbing half of every create/update/delete: run the mutation, then
 * invalidate the affected lists. Each feature supplies only the mutationFn and
 * which keys to invalidate.
 *
 * Invalidation is awaited inside onSuccess on purpose: isPending stays true
 * until the lists have refetched, so a form sheet closes onto fresh data rather
 * than onto the stale row it just edited. Every key passed here is a qk.X.all()
 * prefix, so the dashboard's queries refresh with no cross-feature import.
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
      await Promise.all(
        options.invalidates.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
      options.onDone?.(data, vars);
    },
  });
}
