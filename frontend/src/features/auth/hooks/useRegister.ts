import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import type { AppError } from '@/shared/api/errors';
import { qk } from '@/shared/api/query-keys';
import { authApi } from '../api/auth.api';
import type { AuthUser, RegisterBody } from '../schemas/auth.schema';
import { useAuthStore } from '../stores/auth.store';

/**
 * Register signs the user in server-side (AuthController.Register issues the
 * cookie), so this is identical to login: seed the session and go. It also
 * means the first screen a new account ever sees is the empty dashboard.
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearExpired = useAuthStore((state) => state.clearExpired);

  return useMutation<AuthUser, AppError, RegisterBody>({
    mutationFn: authApi.register,
    onSuccess: (user) => {
      queryClient.setQueryData(qk.auth.me(), user);
      clearExpired();
      navigate(ROUTES.dashboard, { replace: true });
    },
  });
}
