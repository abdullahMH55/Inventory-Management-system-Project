import { Package, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { useCategories } from '@/features/categories/hooks/useCategories';
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
import { formatCurrency, toCents } from '@/shared/lib/format';
import { useProducts } from '../hooks/useProducts';
import { useDeleteProduct } from '../hooks/useProductMutations';
import { ProductFormSheet } from '../components/ProductFormSheet';
import { StockValue } from '../components/StockValue';
import { categoryNameMap, resolveCategoryName } from '../lib/resolve';
import type { Product } from '../schemas/product.schema';

const searchFields = (p: Product) => [p.name, p.description ?? '', p.categoryName];

export default function ProductsPage() {
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();
  const del = useDeleteProduct();

  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const nameById = useMemo(() => categoryNameMap(categories), [categories]);

  const byCategory = useMemo(
    () =>
      categoryFilter === 'all'
        ? products
        : products.filter((p) => p.categoryId === Number(categoryFilter)),
    [products, categoryFilter],
  );

  const { query, setQuery, results, isFiltered } = useListSearch(byCategory, searchFields);

  const columns: Column<Product>[] = [
    {
      id: 'name',
      header: 'Name',
      sortBy: (p) => p.name,
      cell: (p) => <span className="font-medium">{p.name}</span>,
    },
    {
      id: 'category',
      header: 'Category',
      sortBy: (p) => resolveCategoryName(p, nameById),
      hideBelow: 'sm',
      cell: (p) => (
        <span className="text-muted-foreground">{resolveCategoryName(p, nameById)}</span>
      ),
    },
    {
      id: 'stock',
      header: 'Stock',
      sortBy: (p) => p.stock,
      align: 'right',
      cell: (p) => <StockValue stock={p.stock} />,
    },
    {
      id: 'price',
      header: 'Price',
      sortBy: (p) => p.price,
      align: 'right',
      cell: (p) => <span className="numeric text-muted-foreground">{formatCurrency(toCents(p.price))}</span>,
    },
  ];

  const gate = {
    data: productsQuery.data && categoriesQuery.data ? products : undefined,
    isPending: productsQuery.isPending || categoriesQuery.isPending,
    isError: productsQuery.isError || categoriesQuery.isError,
    error: productsQuery.error ?? categoriesQuery.error,
    refetch: () => {
      void productsQuery.refetch();
      void categoriesQuery.refetch();
    },
  };

  return (
    <QueryState query={gate} skeleton={<TableSkeleton columns={5} />}>
      {() => (
        <div className="p-6">
          <ListToolbar
            query={query}
            onQueryChange={setQuery}
            placeholder="Search products"
            count={results.length}
            total={products.length}
            noun={['product', 'products']}
            filters={
              categories.length > 0 ? (
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value ?? 'all')}
                >
                  <SelectTrigger className="w-auto gap-1.5" aria-label="Filter by category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : undefined
            }
            action={
              <Button onClick={() => setEditing('new')} disabled={categories.length === 0}>
                <Plus className="size-4" aria-hidden />
                New product
              </Button>
            }
          />

          <DataTable
            rows={results}
            columns={columns}
            rowKey={(p) => p.id}
            defaultSort={{ columnId: 'name', dir: 'asc' }}
            caption="Products"
            rowActions={(p) => (
              <RowActions label={p.name} onEdit={() => setEditing(p)} onDelete={() => setDeleting(p)} />
            )}
            empty={
              isFiltered || categoryFilter !== 'all' ? (
                <EmptyState
                  title="No products match"
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setQuery('');
                        setCategoryFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                />
              ) : categories.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="Add a category first"
                  description="Products live inside categories, so make one before adding stock."
                  action={
                    <Button render={<Link to={ROUTES.categories} />} nativeButton={false}>
                      Go to categories
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Package}
                  title="No products yet"
                  description="Add what you keep in stock, with its price and quantity on hand."
                  action={<Button onClick={() => setEditing('new')}>New product</Button>}
                />
              )
            }
          />

          {editing !== null ? (
            <ProductFormSheet
              key={editing === 'new' ? 'new' : editing.id}
              editing={editing}
              categories={categories}
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
            description="A product that appears in sales or purchases cannot be deleted."
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
