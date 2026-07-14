import { QueryClient } from '@tanstack/react-query';
import type { AppError } from '@/shared/api/errors';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        // The API has no pagination and no ETags, so every refetch pulls four
        // full tables. Refetching on every window focus is a storm, not a feature.
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const status = (error as AppError).status;
          // Never retry a 401/404/409/validation: the answer will not change.
          if (status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}
