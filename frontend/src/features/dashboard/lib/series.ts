import type { Sale } from '@/features/sales/schemas/sale.schema';
import { parseApiDate, toCents } from '@/shared/lib/format';

export type SeriesPoint = { day: string; valueCents: number };

function isoDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Daily sales value over a trailing window.
 *
 * The buckets are zero-filled before anything is added to them. Without that, an
 * account with three sales renders a three-point line that lies about the shape
 * of the data: gaps would read as a trend rather than as nothing happening.
 */
export function buildSalesSeries(sales: Sale[], days = 30, now = new Date()): SeriesPoint[] {
  const buckets = new Map<string, number>();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(start);
    day.setDate(day.getDate() - offset);
    buckets.set(isoDay(day), 0);
  }

  for (const sale of sales) {
    const date = parseApiDate(sale.date);
    if (Number.isNaN(date.getTime())) continue;

    const key = isoDay(date);
    const current = buckets.get(key);
    if (current === undefined) continue; // outside the window

    buckets.set(key, current + toCents(sale.totalPrice));
  }

  return [...buckets].map(([day, valueCents]) => ({ day, valueCents }));
}
