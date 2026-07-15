import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useServerFieldErrors } from '@/features/auth/hooks/useServerFieldErrors';
import { Field } from '@/shared/components/Field';
import { FormError } from '@/shared/components/FormError';
import { FormRow } from '@/shared/components/FormRow';
import { QueryState } from '@/shared/components/QueryState';
import { TableSkeleton } from '@/shared/components/TableSkeleton';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/shared/lib/format';
import { nullIfBlank } from '@/shared/lib/form';
import { useSales } from '../hooks/useSales';
import { useCreateSale } from '../hooks/useSaleMutations';
import { SaleLinesEditor } from '../components/SaleLinesEditor';
import { saleErrorProductId } from '../lib/sale-errors';
import { mergeLines } from '../lib/sale-lines';
import { saleFormSchema, type SaleFormValues } from '../schemas/sale.schema';

export default function SaleFormPage() {
  const navigate = useNavigate();
  const customersQuery = useCustomers();
  const productsQuery = useProducts();
  const salesQuery = useSales();
  const create = useCreateSale();

  const customers = customersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const sales = salesQuery.data ?? [];

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const statuses = useMemo(
    () => [...new Set(sales.map((s) => s.status?.trim()).filter((s): s is string => !!s))],
    [sales],
  );

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customerId: undefined,
      date: toDateTimeLocalValue(new Date()),
      status: '',
      lines: [{ productId: undefined as unknown as number, quantity: undefined as unknown as number }],
    },
  });

  useServerFieldErrors(form, create.error ?? null);
  const formError = create.error && create.error.kind !== 'validation' ? create.error.message : null;

  const lineArray = useFieldArray({ control: form.control, name: 'lines' });

  const submit = form.handleSubmit((values) => {
    const dateOut = fromDateTimeLocalValue(values.date);
    const lines = mergeLines(values.lines);

    create.mutate(
      {
        customerId: values.customerId,
        date: fromDateTimeLocalValue(values.date),
        status: nullIfBlank(values.status),
        saleProducts: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          dateOut,
          notes: line.notes ?? null,
        })),
      },
      {
        onSuccess: () => navigate(ROUTES.sales),
        onError: (error) => {
          // Point the offending row at the server's message when we can identify it.
          const productId = saleErrorProductId(error, lines, productById);
          if (productId != null) {
            const index = values.lines.findIndex((l) => l.productId === productId);
            if (index >= 0) form.setError(`lines.${index}.quantity`, { message: error.message });
          }
        },
      },
    );
  });

  const gate = {
    data:
      customersQuery.data && productsQuery.data && salesQuery.data ? products : undefined,
    isPending: customersQuery.isPending || productsQuery.isPending || salesQuery.isPending,
    isError: customersQuery.isError || productsQuery.isError || salesQuery.isError,
    error: customersQuery.error ?? productsQuery.error ?? salesQuery.error,
    refetch: () => {
      void customersQuery.refetch();
      void productsQuery.refetch();
      void salesQuery.refetch();
    },
  };

  const ready = customers.length > 0 && products.length > 0;

  return (
    <QueryState query={gate} skeleton={<TableSkeleton columns={3} />}>
      {() => (
        <div className="mx-auto max-w-2xl p-6">
          <Link
            to={ROUTES.sales}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to sales
          </Link>

          <h1 className="text-lg font-medium tracking-tight">Record a sale</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stock comes down by what you sell. The server sets the final total from
            current prices.
          </p>

          {!ready ? (
            <div className="mt-6 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              You need at least one {customers.length === 0 ? 'customer' : 'product'} first.{' '}
              <Link
                to={customers.length === 0 ? ROUTES.customers : ROUTES.products}
                className="font-medium text-primary hover:underline"
              >
                Add one
              </Link>
              .
            </div>
          ) : (
            <form className="mt-6 grid gap-5" onSubmit={submit} noValidate>
              <FormError message={formError} />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormRow label="Customer" error={form.formState.errors.customerId?.message}>
                  {({ id, describedBy, invalid }) => (
                    <Controller
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <Select
                          value={field.value ? String(field.value) : ''}
                          onValueChange={(value) => field.onChange(Number(value))}
                          disabled={create.isPending}
                        >
                          <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid} className="w-full">
                            <SelectValue placeholder="Choose a customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </FormRow>

                <Field
                  label="Date"
                  type="datetime-local"
                  disabled={create.isPending}
                  error={form.formState.errors.date?.message}
                  {...form.register('date')}
                />
              </div>

              <Field
                label="Status"
                hint="Optional, free text (e.g. Fulfilled, Pending)"
                list="sale-status-options"
                disabled={create.isPending}
                error={form.formState.errors.status?.message}
                {...form.register('status')}
              />
              <datalist id="sale-status-options">
                {statuses.map((status) => (
                  <option key={status} value={status} />
                ))}
              </datalist>

              <SaleLinesEditor
                form={form}
                products={products}
                disabled={create.isPending}
                fields={lineArray.fields}
                append={lineArray.append}
                remove={lineArray.remove}
              />

              <div className="flex justify-end gap-2 border-t border-rule pt-4">
                <Button type="button" variant="outline" render={<Link to={ROUTES.sales} />} nativeButton={false}>
                  Cancel
                </Button>
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
                  Record sale
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </QueryState>
  );
}
