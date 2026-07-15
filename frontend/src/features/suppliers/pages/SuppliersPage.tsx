import { Factory, Plus } from 'lucide-react';
import { useState } from 'react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { DeleteConfirm } from '@/shared/components/DeleteConfirm';
import { EmptyState } from '@/shared/components/EmptyState';
import { ListToolbar } from '@/shared/components/ListToolbar';
import { QueryState } from '@/shared/components/QueryState';
import { RowActions } from '@/shared/components/RowActions';
import { TableSkeleton } from '@/shared/components/TableSkeleton';
import { Button } from '@/shared/components/ui/button';
import { useListSearch } from '@/shared/hooks/useListSearch';
import { useSuppliers } from '../hooks/useSuppliers';
import { useDeleteSupplier } from '../hooks/useSupplierMutations';
import { SupplierFormSheet } from '../components/SupplierFormSheet';
import type { Supplier } from '../schemas/supplier.schema';

const searchFields = (s: Supplier) => [s.name, s.email ?? '', s.phone ?? '', s.address ?? ''];

const columns: Column<Supplier>[] = [
  {
    id: 'name',
    header: 'Name',
    sortBy: (s) => s.name,
    cell: (s) => <span className="font-medium">{s.name}</span>,
  },
  {
    id: 'email',
    header: 'Email',
    sortBy: (s) => s.email ?? '',
    hideBelow: 'sm',
    cell: (s) => <span className="text-muted-foreground">{s.email || '—'}</span>,
  },
  {
    id: 'phone',
    header: 'Phone',
    hideBelow: 'md',
    cell: (s) => <span className="numeric text-muted-foreground">{s.phone || '—'}</span>,
  },
];

export default function SuppliersPage() {
  const query = useSuppliers();
  const del = useDeleteSupplier();
  const [editing, setEditing] = useState<Supplier | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const { query: q, setQuery, results, isFiltered } = useListSearch(query.data ?? [], searchFields);

  return (
    <QueryState query={query} skeleton={<TableSkeleton columns={4} />}>
      {(suppliers) => (
        <div className="p-6">
          <ListToolbar
            query={q}
            onQueryChange={setQuery}
            placeholder="Search suppliers"
            count={results.length}
            total={suppliers.length}
            noun={['supplier', 'suppliers']}
            action={
              <Button onClick={() => setEditing('new')}>
                <Plus className="size-4" aria-hidden />
                New supplier
              </Button>
            }
          />

          <DataTable
            rows={results}
            columns={columns}
            rowKey={(s) => s.id}
            defaultSort={{ columnId: 'name', dir: 'asc' }}
            caption="Suppliers"
            rowActions={(s) => (
              <RowActions label={s.name} onEdit={() => setEditing(s)} onDelete={() => setDeleting(s)} />
            )}
            empty={
              isFiltered ? (
                <EmptyState
                  title={`No suppliers match “${q}”`}
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setQuery('')}>
                      Clear search
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Factory}
                  title="No suppliers yet"
                  description="Add who you buy from. You will pick one when you record a purchase."
                  action={<Button onClick={() => setEditing('new')}>New supplier</Button>}
                />
              )
            }
          />

          {editing !== null ? (
            <SupplierFormSheet
              key={editing === 'new' ? 'new' : editing.id}
              editing={editing}
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
            title={deleting ? `Delete “${deleting.name}”?` : ''}
            description="A supplier with recorded purchases cannot be deleted."
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
