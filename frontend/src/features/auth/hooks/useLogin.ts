import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import type { AppError } from '@/shared/api/errors';
import { qk } from '@/shared/api/query-keys';
import { authApi } from '../api/auth.api';
import type { AuthUser, LoginInput } from '../schemas/auth.schema';
import { useAuthStore } from '../stores/auth.store';

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const clearExpired = useAuthStore((state) => state.clearExpired);

  return useMutation<AuthUser, AppError, LoginInput>({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      // Set-Cookie already landed with this response, so seed the cache rather
      // than spending a round trip re-asking /me who we are.
      queryClient.setQueryData(qk.auth.me(), user);
      clearExpired();
      navigate(location.state?.from ?? ROUTES.dashboard, { replace: true });
    },
    // No onError: the form renders mutation.error inline. A redirect here would
    // wipe a wrong-password message before it could be read.
  });
}
