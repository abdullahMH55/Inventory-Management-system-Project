import { Boxes, Plus } from 'lucide-react';
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
import { useCategories } from '../hooks/useCategories';
import { useDeleteCategory } from '../hooks/useCategoryMutations';
import { CategoryFormSheet } from '../components/CategoryFormSheet';
import type { Category } from '../schemas/category.schema';

const searchFields = (category: Category) => [category.name, category.description ?? ''];

const columns: Column<Category>[] = [
  {
    id: 'name',
    header: 'Name',
    sortBy: (c) => c.name,
    cell: (c) => <span className="font-medium">{c.name}</span>,
  },
  {
    id: 'description',
    header: 'Description',
    hideBelow: 'sm',
    cell: (c) => (
      <span className="text-muted-foreground">{c.description || '—'}</span>
    ),
  },
];

export default function CategoriesPage() {
  const query = useCategories();
  const del = useDeleteCategory();
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  // Hooks stay at the top level; QueryState only gates the rendered output.
  const { query: q, setQuery, results, isFiltered } = useListSearch(
    query.data ?? [],
    searchFields,
  );

  return (
    <QueryState query={query} skeleton={<TableSkeleton columns={3} />}>
      {(categories) => (
          <div className="p-6">
            <ListToolbar
              query={q}
              onQueryChange={setQuery}
              placeholder="Search categories"
              count={results.length}
              total={categories.length}
              noun={['category', 'categories']}
              action={
                <Button onClick={() => setEditing('new')}>
                  <Plus className="size-4" aria-hidden />
                  New category
                </Button>
              }
            />

            <DataTable
              rows={results}
              columns={columns}
              rowKey={(c) => c.id}
              defaultSort={{ columnId: 'name', dir: 'asc' }}
              caption="Categories"
              rowActions={(c) => (
                <RowActions
                  label={c.name}
                  onEdit={() => setEditing(c)}
                  onDelete={() => setDeleting(c)}
                />
              )}
              empty={
                isFiltered ? (
                  <EmptyState
                    title={`No categories match “${q}”`}
                    action={
                      <Button variant="ghost" size="sm" onClick={() => setQuery('')}>
                        Clear search
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    icon={Boxes}
                    title="No categories yet"
                    description="Group your products so the shelves make sense."
                    action={<Button onClick={() => setEditing('new')}>New category</Button>}
                  />
                )
              }
            />

            {editing !== null ? (
              <CategoryFormSheet
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
              description="Products keep their data, but this grouping is removed. A category with products cannot be deleted."
              isPending={del.isPending}
              error={del.error}
              onConfirm={() => {
                if (deleting) {
                  del.mutate(deleting.id, {
                    onSuccess: () => setDeleting(null),
                    // A 404 means it is already gone: the user's intent is satisfied.
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
