import { Plus, Users } from 'lucide-react';
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
import { useCustomers } from '../hooks/useCustomers';
import { useDeleteCustomer } from '../hooks/useCustomerMutations';
import { CustomerFormSheet } from '../components/CustomerFormSheet';
import type { Customer } from '../schemas/customer.schema';

const searchFields = (c: Customer) => [c.name, c.email ?? '', c.phone ?? '', c.address ?? ''];

const columns: Column<Customer>[] = [
  {
    id: 'name',
    header: 'Name',
    sortBy: (c) => c.name,
    cell: (c) => <span className="font-medium">{c.name}</span>,
  },
  {
    id: 'email',
    header: 'Email',
    sortBy: (c) => c.email ?? '',
    hideBelow: 'sm',
    cell: (c) => <span className="text-muted-foreground">{c.email || '—'}</span>,
  },
  {
    id: 'phone',
    header: 'Phone',
    hideBelow: 'md',
    cell: (c) => <span className="numeric text-muted-foreground">{c.phone || '—'}</span>,
  },
];

export default function CustomersPage() {
  const query = useCustomers();
  const del = useDeleteCustomer();
  const [editing, setEditing] = useState<Customer | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  const { query: q, setQuery, results, isFiltered } = useListSearch(query.data ?? [], searchFields);

  return (
    <QueryState query={query} skeleton={<TableSkeleton columns={4} />}>
      {(customers) => (
        <div className="p-6">
          <ListToolbar
            query={q}
            onQueryChange={setQuery}
            placeholder="Search customers"
            count={results.length}
            total={customers.length}
            noun={['customer', 'customers']}
            action={
              <Button onClick={() => setEditing('new')}>
                <Plus className="size-4" aria-hidden />
                New customer
              </Button>
            }
          />

          <DataTable
            rows={results}
            columns={columns}
            rowKey={(c) => c.id}
            defaultSort={{ columnId: 'name', dir: 'asc' }}
            caption="Customers"
            rowActions={(c) => (
              <RowActions label={c.name} onEdit={() => setEditing(c)} onDelete={() => setDeleting(c)} />
            )}
            empty={
              isFiltered ? (
                <EmptyState
                  title={`No customers match “${q}”`}
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setQuery('')}>
                      Clear search
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Users}
                  title="No customers yet"
                  description="Add the people you sell to. You will pick one when you record a sale."
                  action={<Button onClick={() => setEditing('new')}>New customer</Button>}
                />
              )
            }
          />

          {editing !== null ? (
            <CustomerFormSheet
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
            description="A customer with recorded sales cannot be deleted."
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
