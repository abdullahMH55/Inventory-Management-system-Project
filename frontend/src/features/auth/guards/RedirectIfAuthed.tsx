import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { FullPageLoader } from '@/shared/components/FullPageLoader';
import { useSession } from '../hooks/useSession';

/** Keeps a signed-in user off /login and /register. */
export function RedirectIfAuthed() {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) return <FullPageLoader />;
  if (isAuthenticated) return <Navigate to={ROUTES.dashboard} replace />;

  return <Outlet />;
}
