import { createBrowserRouter, Outlet } from 'react-router-dom';
import { RedirectIfAuthed } from '@/features/auth/guards/RedirectIfAuthed';
import { RequireAuth } from '@/features/auth/guards/RequireAuth';
import { AuthLayout } from '@/layouts/AuthLayout';
import { FullPageLoader } from '@/shared/components/FullPageLoader';
import { ROUTES } from './routes';

/** Pages default-export their component; React Router wants a `Component` key. */
const lazyPage = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await load()).default,
});

export const router = createBrowserRouter([
  {
    // A root route exists purely to own HydrateFallback: without it, React
    // Router warns and renders nothing while a lazy route's chunk loads.
    element: <Outlet />,
    HydrateFallback: FullPageLoader,
    children: [
      {
        element: <RedirectIfAuthed />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              {
                path: ROUTES.login,
                lazy: lazyPage(() => import('@/features/auth/pages/LoginPage')),
              },
              {
                path: ROUTES.register,
                lazy: lazyPage(() => import('@/features/auth/pages/RegisterPage')),
              },
            ],
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: ROUTES.dashboard,
            lazy: lazyPage(() => import('@/features/dashboard/pages/DashboardPage')),
          },
        ],
      },
    ],
  },
]);
