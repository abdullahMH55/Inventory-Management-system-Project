import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Providers } from '@/app/providers';
import { createQueryClient } from '@/app/query-client';
import { router } from '@/app/router';
import { authApi } from '@/features/auth/api/auth.api';
import { qk } from '@/shared/api/query-keys';
import './index.css';

const queryClient = createQueryClient();

// Fire /me before the first render rather than waiting for a component to
// mount and ask. The request is then already in flight while React paints, so
// the "session unknown" loader is typically a single frame instead of a
// visible flash.
void queryClient.prefetchQuery({ queryKey: qk.auth.me(), queryFn: authApi.me });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers client={queryClient}>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
