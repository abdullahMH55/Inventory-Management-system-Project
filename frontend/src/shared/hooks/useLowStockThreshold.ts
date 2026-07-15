import { useLocalStorageState } from '@/shared/hooks/useLocalStorageState';

export const THRESHOLD_OPTIONS = [5, 10, 20, 50] as const;

/**
 * There is no reorder point anywhere in the schema, so "low" is a device-local
 * opinion rather than data. It lives in localStorage, not zustand: nothing else
 * reads it, and it is per-device by nature.
 *
 * When Product eventually grows a real ReorderPoint column, this hook is the
 * thing that gets deleted.
 */
export function useLowStockThreshold() {
  return useLocalStorageState<number>('ims.lowStockThreshold', 10);
}
