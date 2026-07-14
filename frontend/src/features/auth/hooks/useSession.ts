import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/query-keys';
import type { AppError } from '@/shared/api/errors';
import { authApi } from '../api/auth.api';
import type { AuthUser } from '../schemas/auth.schema';

/**
 * The single source of session truth.
 *
 * Three states that must never be conflated:
 *   isLoading  the cookie has not been checked yet   -> render a loader
 *   isError    the API is unreachable or 500ing      -> NOT logged out
 *   user null  the server says no session            -> logged out
 */
export function useSession() {
  const query = useQuery<AuthUser | null, AppError>({
    queryKey: qk.auth.me(),
    queryFn: authApi.me,
    staleTime: 5 * 60_000,
    retry: false,
    // Deliberate exception to the global default: this is the one cheap query,
    // and refocusing is exactly when a lapsed cookie should be discovered.
    refetchOnWindowFocus: true,
  });

  return {
    user: query.data ?? null,
    isAuthenticated: !!query.data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error ?? undefined,
    refetch: query.refetch,
  };
}
