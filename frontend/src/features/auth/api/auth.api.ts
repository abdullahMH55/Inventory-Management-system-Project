import { api } from '@/shared/api/client';
import { AppError } from '@/shared/api/errors';
import { request } from '@/shared/lib/zod';
import {
  authResponseSchema,
  type AuthUser,
  type LoginInput,
  type RegisterBody,
} from '../schemas/auth.schema';

export const authApi = {
  login: (body: LoginInput): Promise<AuthUser> =>
    request(authResponseSchema, api.post('/Auth/login', body)),

  register: (body: RegisterBody): Promise<AuthUser> =>
    request(authResponseSchema, api.post('/Auth/register', body)),

  logout: (): Promise<void> => api.post('/Auth/logout').then(() => undefined),

  /**
   * Returns null on 401 instead of throwing, and that is the crux of the whole
   * auth design: "logged out" becomes a *successful* query with data === null.
   * The query then never retries and never renders an error, so isPending means
   * exactly one thing, "we have not heard back yet", which is what lets the
   * guard avoid flashing the login page on refresh.
   *
   * A 500 or a network failure still throws, because those are not answers.
   */
  me: async (): Promise<AuthUser | null> => {
    try {
      return await request(authResponseSchema, api.get('/Auth/me'));
    } catch (error) {
      if (error instanceof AppError && error.status === 401) return null;
      throw error;
    }
  },
};
