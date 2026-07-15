import { createBrowserRouter, Outlet } from 'react-router-dom';
import { RedirectIfAuthed } from '@/features/auth/guards/RedirectIfAuthed';
import { RequireAuth } from '@/features/auth/guards/RequireAuth';
import { AppShell } from '@/layouts/AppShell';
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
            element: <AppShell />,
            children: [
              {
                path: ROUTES.dashboard,
                lazy: lazyPage(() => import('@/features/dashboard/pages/DashboardPage')),
              },
              {
                path: ROUTES.categories,
                lazy: lazyPage(() => import('@/features/categories/pages/CategoriesPage')),
              },
              {
                path: ROUTES.customers,
                lazy: lazyPage(() => import('@/features/customers/pages/CustomersPage')),
              },
              {
                path: ROUTES.suppliers,
                lazy: lazyPage(() => import('@/features/suppliers/pages/SuppliersPage')),
              },
              // Routed but not built yet. The links are live so the dashboard's
              // empty-state calls to action have a real destination.
              ...[ROUTES.products, ROUTES.sales, ROUTES.purchases].map((path) => ({
                path,
                lazy: lazyPage(() => import('@/shared/components/UpcomingPage')),
              })),
            ],
          },
        ],
      },
      { path: '*', lazy: lazyPage(() => import('@/shared/components/NotFoundPage')) },
    ],
  },
]);
