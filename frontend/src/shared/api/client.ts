import axios from 'axios';
import { emitUnauthorized } from './auth-events';
import { normalizeError } from './errors';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  // The whole cookie story lives here: the session cookie is HttpOnly, so the
  // browser must be told to send it. There is no bearer token to attach.
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  // No global transformResponse: ASP.NET's text/plain bodies must stay strings
  // so normalizeError can recover messages like "Id mismatch".
});

/**
 * Endpoints where a 401 is an answer, not an expired session.
 *
 * Without this list, a wrong password on /login would trip the global handler,
 * wipe the session and navigate away before the user could read the error. And
 * a 401 from /me is simply "you are logged out", which is the normal bootstrap
 * result for any visitor.
 */
const NO_GLOBAL_401 = [/\/Auth\/login$/i, /\/Auth\/register$/i, /\/Auth\/me$/i];

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const appError = normalizeError(error);
    const url: string = (error as { config?: { url?: string } })?.config?.url ?? '';

    if (appError.status === 401 && !NO_GLOBAL_401.some((pattern) => pattern.test(url))) {
      emitUnauthorized();
    }

    // From here down, every rejection in the app is an AppError.
    return Promise.reject(appError);
  },
);
