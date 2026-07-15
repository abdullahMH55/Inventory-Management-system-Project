import { Plus, ReceiptText } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { useProducts } from '@/features/products/hooks/useProducts';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { DeleteConfirm } from '@/shared/components/DeleteConfirm';
import { EmptyState } from '@/shared/components/EmptyState';
import { ListToolbar } from '@/shared/components/ListToolbar';
import { QueryState } from '@/shared/components/QueryState';
import { RowActions } from '@/shared/components/RowActions';
import { TableSkeleton } from '@/shared/components/TableSkeleton';
import { Button } from '@/shared/components/ui/button';
import { useListSearch } from '@/shared/hooks/useListSearch';
import { formatCurrency, formatDate, formatNumber, parseApiDate, toCents } from '@/shared/lib/format';
import { useSales } from '../hooks/useSales';
import { useDeleteSale } from '../hooks/useSaleMutations';
import type { Sale } from '../schemas/sale.schema';

const searchFields = (s: Sale) => [
  s.customerName,
  s.status ?? '',
  ...s.saleProducts.map((line) => line.productName),
];

const columns: Column<Sale>[] = [
  {
    id: 'date',
    header: 'Date',
    sortBy: (s) => parseApiDate(s.date).getTime(),
    cell: (s) => <span className="text-muted-foreground">{formatDate(s.date)}</span>,
  },
  {
    id: 'customer',
    header: 'Customer',
    sortBy: (s) => s.customerName,
    cell: (s) => <span className="font-medium">{s.customerName || 'Unknown'}</span>,
  },
  {
    id: 'items',
    header: 'Items',
    hideBelow: 'sm',
    cell: (s) => (
      <span className="text-muted-foreground">
        {formatNumber(s.saleProducts.length)} {s.saleProducts.length === 1 ? 'item' : 'items'}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    sortBy: (s) => s.status ?? '',
    hideBelow: 'md',
    cell: (s) => <span className="text-muted-foreground">{s.status?.trim() || '—'}</span>,
  },
  {
    id: 'total',
    header: 'Total',
    sortBy: (s) => s.totalPrice,
    align: 'right',
    cell: (s) => <span className="numeric">{formatCurrency(toCents(s.totalPrice))}</span>,
  },
];

export default function SalesPage() {
  const salesQuery = useSales();
  // These gate whether a sale can be recorded at all.
  const customersQuery = useCustomers();
  const productsQuery = useProducts();
  const del = useDeleteSale();
  const navigate = useNavigate();

  const [deleting, setDeleting] = useState<Sale | null>(null);

  const { query, setQuery, results, isFiltered } = useListSearch(salesQuery.data ?? [], searchFields);

  const canRecord = (customersQuery.data?.length ?? 0) > 0 && (productsQuery.data?.length ?? 0) > 0;

  return (
    <QueryState query={salesQuery} skeleton={<TableSkeleton columns={6} />}>
      {(sales) => (
        <div className="p-6">
          <ListToolbar
            query={query}
            onQueryChange={setQuery}
            placeholder="Search sales"
            count={results.length}
            total={sales.length}
            noun={['sale', 'sales']}
            action={
              <Button render={<Link to={ROUTES.salesNew} />} nativeButton={false} disabled={!canRecord}>
                <Plus className="size-4" aria-hidden />
                Record sale
              </Button>
            }
          />

          <DataTable
            rows={results}
            columns={columns}
            rowKey={(s) => s.id}
            defaultSort={{ columnId: 'date', dir: 'desc' }}
            caption="Sales"
            rowActions={(s) => (
              <RowActions
                label={`sale to ${s.customerName}`}
                editLabel="Edit"
                onEdit={() => navigate(ROUTES.saleEdit(s.id))}
                onDelete={() => setDeleting(s)}
              />
            )}
            empty={
              isFiltered ? (
                <EmptyState
                  title="No sales match"
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setQuery('')}>
                      Clear search
                    </Button>
                  }
                />
              ) : !canRecord ? (
                <EmptyState
                  icon={ReceiptText}
                  title="Add a customer and a product first"
                  description="A sale records what a customer bought and takes it out of stock."
                  action={
                    <Button
                      render={
                        <Link to={customersQuery.data?.length ? ROUTES.products : ROUTES.customers} />
                      }
                      nativeButton={false}
                    >
                      {customersQuery.data?.length ? 'Go to products' : 'Go to customers'}
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={ReceiptText}
                  title="No sales yet"
                  description="Record what you sell to keep stock and revenue in step."
                  action={
                    <Button render={<Link to={ROUTES.salesNew} />} nativeButton={false}>
                      Record sale
                    </Button>
                  }
                />
              )
            }
          />

          <DeleteConfirm
            open={deleting !== null}
            onOpenChange={(open) => {
              if (!open) {
                setDeleting(null);
                del.reset();
              }
            }}
            title="Delete this sale?"
            description="The sold units are returned to stock."
            confirmLabel="Delete sale"
            isPending={del.isPending}
            error={del.error}
            onConfirm={() => {
              if (deleting) {
                del.mutate(deleting.id, {
                  onSuccess: () => setDeleting(null),
                  onError: (error) => {
                    if (error.kind === 'notfound') setDeleting(null);
                  },
                });
              }
            }}
          />
        </div>
      )}
    </QueryState>
  );
}
