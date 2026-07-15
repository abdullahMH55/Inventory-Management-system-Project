import { ChevronDown, ChevronUp } from 'lucide-react';
import { Fragment, useMemo, useState, type Key, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { compareRows, type SortDir } from '@/shared/lib/table';

export type Column<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Omit to make the column unsortable. */
  sortBy?: (row: T) => string | number;
  align?: 'right';
  hideBelow?: 'sm' | 'md';
  headClassName?: string;
  cellClassName?: string;
};

const HIDE: Record<'sm' | 'md', string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
};

/**
 * The one table in the app. Reproduces the ledger look (hairline rules,
 * uppercase micro-headers) built on the ui/table primitive. Sort state is
 * internal; the caller supplies columns, a default sort, and an empty state.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  defaultSort,
  empty,
  caption,
  rowActions,
  expanded,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => Key;
  defaultSort: { columnId: string; dir: SortDir };
  empty: ReactNode;
  caption: string;
  rowActions?: (row: T) => ReactNode;
  expanded?: (row: T) => ReactNode;
}) {
  const [sort, setSort] = useState(defaultSort);

  const sorted = useMemo(() => {
    const column = columns.find((c) => c.id === sort.columnId);
    if (!column?.sortBy) return rows;
    const by = column.sortBy;
    return [...rows].sort(
      (a, b) => compareRows(a, b, by, sort.dir) || String(rowKey(a)).localeCompare(String(rowKey(b))),
    );
  }, [rows, columns, sort, rowKey]);

  const toggle = (columnId: string) =>
    setSort((prev) =>
      prev.columnId === columnId
        ? { columnId, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { columnId, dir: 'asc' },
    );

  const colSpan = columns.length + (rowActions ? 1 : 0);

  if (rows.length === 0) {
    return <div className="border-t border-rule">{empty}</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-y border-rule text-left">
            {columns.map((column) => {
              const active = sort.columnId === column.id;
              const sortable = !!column.sortBy;
              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className={cn(
                    'py-2 pr-4 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground',
                    column.align === 'right' && 'text-right',
                    column.hideBelow && HIDE[column.hideBelow],
                    column.headClassName,
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggle(column.id)}
                      className={cn(
                        'inline-flex items-center gap-1 uppercase tracking-[0.08em] transition-colors hover:text-foreground',
                        column.align === 'right' && 'flex-row-reverse',
                        active && 'text-foreground',
                      )}
                    >
                      {column.header}
                      {active ? (
                        sort.dir === 'asc' ? (
                          <ChevronUp className="size-3" aria-hidden />
                        ) : (
                          <ChevronDown className="size-3" aria-hidden />
                        )
                      ) : null}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
            {rowActions ? <th className="w-10" /> : null}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const detail = expanded?.(row);
            return (
              <Fragment key={rowKey(row)}>
                <tr className="border-b border-rule/60">
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        'py-2.5 pr-4',
                        column.align === 'right' && 'text-right',
                        column.hideBelow && HIDE[column.hideBelow],
                        column.cellClassName,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                  {rowActions ? (
                    <td className="py-2.5 text-right">{rowActions(row)}</td>
                  ) : null}
                </tr>
                {detail ? (
                  <tr className="border-b border-rule/60">
                    <td colSpan={colSpan} className="bg-muted/30 px-4 py-3">
                      {detail}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
