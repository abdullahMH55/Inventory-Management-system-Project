import { create } from 'zustand';

/**
 * Deliberately almost empty.
 *
 * TanStack Query owns the session: it is server state, and /me is the only way
 * to read an HttpOnly cookie. Zustand holds only what the server cannot tell
 * us, which is why the session expired rather than the user simply never
 * having signed in.
 *
 * There is no `user` here and no persist middleware, on purpose. Persisting a
 * user to localStorage while the real session is a 24h sliding cookie
 * guarantees drift: the cookie lapses, localStorage still claims a session, and
 * the app renders the shell and then 401s every panel.
 */
type AuthUiState = {
  sessionExpired: boolean;
  setExpired: () => void;
  clearExpired: () => void;
};

export const useAuthStore = create<AuthUiState>()((set) => ({
  sessionExpired: false,
  setExpired: () => set({ sessionExpired: true }),
  clearExpired: () => set({ sessionExpired: false }),
}));
