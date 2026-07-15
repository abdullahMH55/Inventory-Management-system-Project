import { toCents } from '@/shared/lib/format';
import type { SalesSummaryPoint } from '../schemas/dashboard.schema';

export type SeriesPoint = { day: string; valueCents: number };

function isoDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Zero-fill the trailing window from the server's daily summary points.
 *
 * GROUP BY only returns days that had sales, so the empty days are added here.
 * Without that, a quiet account draws a misleading few-point line instead of a
 * mostly-flat one. Each point's decimal total is converted to cents once (a
 * single value, no accumulation, so no float drift).
 */
export function fillDailySeries(
  points: SalesSummaryPoint[],
  days = 30,
  now = new Date(),
): SeriesPoint[] {
  const totalByDay = new Map(points.map((point) => [point.period, point.total]));

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const series: SeriesPoint[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(start);
    day.setDate(day.getDate() - offset);
    const key = isoDay(day);
    series.push({ day: key, valueCents: toCents(totalByDay.get(key) ?? 0) });
  }
  return series;
}
