import { QueryClientProvider, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, type PropsWithChildren } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { onUnauthorized } from '@/shared/api/auth-events';
import { qk } from '@/shared/api/query-keys';

/**
 * The one subscriber to the interceptor's unauthorized event. It lives here
 * because this is the only place that holds both the query client and the store.
 *
 * It does not navigate. It flips the session to null, and the guard's
 * <Navigate/> does the rest.
 */
function UnauthorizedBridge({ children }: PropsWithChildren) {
  const queryClient: QueryClient = useQueryClient();

  useEffect(
    () =>
      onUnauthorized(() => {
        useAuthStore.getState().setExpired();
        queryClient.setQueryData(qk.auth.me(), null);
        // Drop the previous session's data: every list is user-scoped server-side.
        queryClient.clear();
      }),
    [queryClient],
  );

  return children;
}

export function Providers({ client, children }: PropsWithChildren<{ client: QueryClient }>) {
  return (
    <QueryClientProvider client={client}>
      <UnauthorizedBridge>{children}</UnauthorizedBridge>
    </QueryClientProvider>
  );
}
