import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ErrorState } from '@/shared/components/ErrorState';
import { FullPageLoader } from '@/shared/components/FullPageLoader';
import { ROUTES } from '@/app/routes';
import { useSession } from '../hooks/useSession';

export function RequireAuth() {
  const { isAuthenticated, isLoading, isError, error, refetch } = useSession();
  const location = useLocation();

  // On a hard refresh there is no synchronous way to know whether the HttpOnly
  // cookie is still valid, so the client has to ask. Rendering <Navigate/>
  // during that unknown window IS the flash of the login page. Render the
  // loader instead and wait for an actual answer.
  if (isLoading) return <FullPageLoader />;

  // A dead API is not a logged-out user. Bouncing to /login here would tell the
  // user a lie and lose their location.
  if (isError) {
    return (
      <div className="grid h-dvh place-items-center p-6">
        <ErrorState error={error} onRetry={() => void refetch()} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.login}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
}
