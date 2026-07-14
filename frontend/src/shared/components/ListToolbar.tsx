import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { Input } from '@/shared/components/ui/input';
import { formatNumber } from '@/shared/lib/format';

/**
 * The row above every list: search box, an optional filter slot, a live count,
 * and the primary action pushed right.
 */
export function ListToolbar({
  query,
  onQueryChange,
  placeholder,
  count,
  total,
  noun,
  filters,
  action,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder: string;
  count: number;
  total: number;
  noun: [singular: string, plural: string];
  filters?: ReactNode;
  action?: ReactNode;
}) {
  const isFiltered = count !== total;
  const word = count === 1 ? noun[0] : noun[1];
  const label = isFiltered
    ? `${formatNumber(count)} of ${formatNumber(total)} ${noun[1]}`
    : `${formatNumber(count)} ${word}`;

  return (
    <div className="flex flex-wrap items-center gap-3 pb-4">
      <div className="relative min-w-48 flex-1 sm:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="pl-8"
        />
      </div>

      {filters}

      <span className="numeric text-xs text-muted-foreground" role="status" aria-live="polite">
        {label}
      </span>

      {action ? <div className="ml-auto">{action}</div> : null}
    </div>
  );
}
