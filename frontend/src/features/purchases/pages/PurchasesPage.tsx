import { Plus, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { DeleteConfirm } from '@/shared/components/DeleteConfirm';
import { EmptyState } from '@/shared/components/EmptyState';
import { ListToolbar } from '@/shared/components/ListToolbar';
import { QueryState } from '@/shared/components/QueryState';
import { RowActions } from '@/shared/components/RowActions';
import { TableSkeleton } from '@/shared/components/TableSkeleton';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useListSearch } from '@/shared/hooks/useListSearch';
import { formatDate, formatNumber, parseApiDate } from '@/shared/lib/format';
import { usePurchases } from '../hooks/usePurchases';
import { useDeletePurchase } from '../hooks/usePurchaseMutations';
import { PurchaseFormSheet } from '../components/PurchaseFormSheet';
import type { Purchase } from '../schemas/purchase.schema';

const searchFields = (p: Purchase) => [p.productName, p.supplierName, p.notes ?? ''];

const columns: Column<Purchase>[] = [
  {
    id: 'dateIn',
    header: 'Received',
    sortBy: (p) => parseApiDate(p.dateIn).getTime(),
    cell: (p) => <span className="text-muted-foreground">{formatDate(p.dateIn)}</span>,
  },
  {
    id: 'product',
    header: 'Product',
    sortBy: (p) => p.productName,
    cell: (p) => <span className="font-medium">{p.productName}</span>,
  },
  {
    id: 'supplier',
    header: 'Supplier',
    sortBy: (p) => p.supplierName,
    hideBelow: 'sm',
    cell: (p) => <span className="text-muted-foreground">{p.supplierName}</span>,
  },
  {
    id: 'quantity',
    header: 'Qty in',
    sortBy: (p) => p.quantity,
    align: 'right',
    cell: (p) => <span className="numeric text-stock-ok">+{formatNumber(p.quantity)}</span>,
  },
  {
    id: 'notes',
    header: 'Notes',
    hideBelow: 'md',
    cell: (p) => <span className="text-muted-foreground">{p.notes || '—'}</span>,
  },
];

export default function PurchasesPage() {
  const purchasesQuery = usePurchases();
  const productsQuery = useProducts();
  const suppliersQuery = useSuppliers();
  const del = useDeletePurchase();

  const [editing, setEditing] = useState<Purchase | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Purchase | null>(null);
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  const purchases = purchasesQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const suppliers = suppliersQuery.data ?? [];

  const bySupplier = useMemo(
    () =>
      supplierFilter === 'all'
        ? purchases
        : purchases.filter((p) => p.supplierId === Number(supplierFilter)),
    [purchases, supplierFilter],
  );

  const { query, setQuery, results, isFiltered } = useListSearch(bySupplier, searchFields);

  const gate = {
    data:
      purchasesQuery.data && productsQuery.data && suppliersQuery.data ? purchases : undefined,
    isPending: purchasesQuery.isPending || productsQuery.isPending || suppliersQuery.isPending,
    isError: purchasesQuery.isError || productsQuery.isError || suppliersQuery.isError,
    error: purchasesQuery.error ?? productsQuery.error ?? suppliersQuery.error,
    refetch: () => {
      void purchasesQuery.refetch();
      void productsQuery.refetch();
      void suppliersQuery.refetch();
    },
  };

  const canRecord = products.length > 0 && suppliers.length > 0;

  return (
    <QueryState query={gate} skeleton={<TableSkeleton columns={5} />}>
      {() => (
        <div className="p-6">
          <ListToolbar
            query={query}
            onQueryChange={setQuery}
            placeholder="Search purchases"
            count={results.length}
            total={purchases.length}
            noun={['purchase', 'purchases']}
            filters={
              suppliers.length > 0 ? (
                <Select
                  value={supplierFilter}
                  onValueChange={(value) => setSupplierFilter(value ?? 'all')}
                >
                  <SelectTrigger className="w-auto gap-1.5" aria-label="Filter by supplier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All suppliers</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={String(supplier.id)}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : undefined
            }
            action={
              <Button onClick={() => setEditing('new')} disabled={!canRecord}>
                <Plus className="size-4" aria-hidden />
                Record purchase
              </Button>
            }
          />

          <DataTable
            rows={results}
            columns={columns}
            rowKey={(p) => p.id}
            defaultSort={{ columnId: 'dateIn', dir: 'desc' }}
            caption="Purchases"
            rowActions={(p) => (
              <RowActions
                label={`purchase of ${p.productName}`}
                onEdit={() => setEditing(p)}
                onDelete={() => setDeleting(p)}
              />
            )}
            empty={
              isFiltered || supplierFilter !== 'all' ? (
                <EmptyState
                  title="No purchases match"
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setQuery('');
                        setSupplierFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                />
              ) : !canRecord ? (
                <EmptyState
                  icon={Truck}
                  title="Add a product and a supplier first"
                  description="A purchase records units received from a supplier into a product's stock."
                  action={
                    <Button
                      render={
                        <Link to={products.length === 0 ? ROUTES.products : ROUTES.suppliers} />
                      }
                      nativeButton={false}
                    >
                      {products.length === 0 ? 'Go to products' : 'Go to suppliers'}
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Truck}
                  title="No purchases yet"
                  description="Record stock as it arrives to keep your quantities honest."
                  action={<Button onClick={() => setEditing('new')}>Record purchase</Button>}
                />
              )
            }
          />

          {editing !== null ? (
            <PurchaseFormSheet
              key={editing === 'new' ? 'new' : editing.id}
              editing={editing}
              products={products}
              suppliers={suppliers}
              onClose={() => setEditing(null)}
            />
          ) : null}

          <DeleteConfirm
            open={deleting !== null}
            onOpenChange={(open) => {
              if (!open) {
                setDeleting(null);
                del.reset();
              }
            }}
            title={deleting ? `Delete this purchase?` : ''}
            description="The received units are removed from stock. If they have already been sold, this cannot be undone and will be rejected."
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
