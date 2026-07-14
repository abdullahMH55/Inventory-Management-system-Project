import { useCallback, useState } from 'react';

/** A per-device UI preference. Never a session, and never anything the server owns. */
export function useLocalStorageState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? fallback : (JSON.parse(stored) as T);
    } catch {
      return fallback;
    }
  });

  const set = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // A full or blocked localStorage must not break the UI.
      }
    },
    [key],
  );

  return [value, set] as const;
}
