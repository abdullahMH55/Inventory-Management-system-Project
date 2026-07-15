import { useMemo, useState } from 'react';
import { matchesQuery } from '@/shared/lib/table';

/**
 * Client-side search over an already-loaded list. The API has no usable search
 * (its /search endpoint is substring-on-name only and 400s on an empty term),
 * and the full table is already in the cache, so filtering here is both more
 * capable and cheaper than a round trip.
 *
 * `toFields` must be a stable (module-level) function, not an inline closure,
 * or the memo never holds.
 */
export function useListSearch<T>(rows: T[], toFields: (row: T) => string[]) {
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => (query.trim() ? rows.filter((row) => matchesQuery(toFields(row), query)) : rows),
    [rows, query, toFields],
  );

  return { query, setQuery, results, isFiltered: query.trim().length > 0 };
}
