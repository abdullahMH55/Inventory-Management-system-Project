import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import type { AppError } from '@/shared/api/errors';
import { qk } from '@/shared/api/query-keys';
import { authApi } from '../api/auth.api';

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<void, AppError>({
    mutationFn: authApi.logout,
    // onSettled, not onSuccess: if logout fails server-side, the user still
    // asked to leave and must not be stranded inside the app.
    onSettled: () => {
      queryClient.setQueryData(qk.auth.me(), null);
      // Correctness, not hygiene. Every list is user-scoped server-side, so a
      // stale cache would render the previous account's products to the next one.
      queryClient.clear();
      navigate(ROUTES.login, { replace: true });
    },
  });
}
