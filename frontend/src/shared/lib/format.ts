import { formatDistanceToNowStrict } from 'date-fns';

/**
 * Money is accumulated in integer cents and formatted exactly once, here.
 *
 * The API sends `decimal` as a JSON number. Summing those floats across a few
 * hundred rows drifts visibly: 19.99 * 3 in floats is 59.97000000000001, and
 * that lands on a stat tile. Every total in the app is therefore built with
 * toCents() and rendered with formatCurrency().
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export function formatCurrency(cents: number): string {
  return currency.format(cents / 100);
}

const number = new Intl.NumberFormat(undefined);

export function formatNumber(value: number): string {
  return number.format(value);
}

/**
 * The API serializes DateTime with no offset ("2026-07-14T10:30:00"), so JS
 * parses it as local time. That is correct on a single dev machine and wrong
 * the moment the API runs on a UTC host and the user is not in UTC. The
 * assumption is isolated here; the real fix is DateTimeOffset server-side.
 */
export function parseApiDate(value: string): Date {
  return new Date(value);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? parseApiDate(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatRelative(value: string | Date): string {
  const date = typeof value === 'string' ? parseApiDate(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
