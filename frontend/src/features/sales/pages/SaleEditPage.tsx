import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { ROUTES } from '@/app/routes';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import type { Customer } from '@/features/customers/schemas/customer.schema';
import { useServerFieldErrors } from '@/features/auth/hooks/useServerFieldErrors';
import { DeleteConfirm } from '@/shared/components/DeleteConfirm';
import { EmptyState } from '@/shared/components/EmptyState';
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
import {
  formatCurrency,
  formatDate,
  fromDateTimeLocalValue,
  parseApiDate,
  toCents,
  toDateTimeLocalValue,
} from '@/shared/lib/format';
import { nullIfBlank } from '@/shared/lib/form';
import { useSales } from '../hooks/useSales';
import { useDeleteSale, usePatchSale } from '../hooks/useSaleMutations';
import type { Sale } from '../schemas/sale.schema';

const editSchema = z.object({
  customerId: z.number().int().positive('Choose a customer'),
  date: z.string().min(1, 'Date is required'),
  status: z.string().trim().max(50).optional(),
});
type EditValues = z.infer<typeof editSchema>;

function SaleEditForm({ sale, customers }: { sale: Sale; customers: Customer[] }) {
  const navigate = useNavigate();
  const patch = usePatchSale();
  const del = useDeleteSale();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      customerId: sale.customerId,
      date: toDateTimeLocalValue(parseApiDate(sale.date)),
      status: sale.status ?? '',
    },
  });

  useServerFieldErrors(form, patch.error ?? null);
  const formError = patch.error && patch.error.kind !== 'validation' ? patch.error.message : null;

  const submit = form.handleSubmit((values) => {
    patch.mutate(
      {
        id: sale.id,
        customerId: values.customerId,
        date: fromDateTimeLocalValue(values.date),
        status: nullIfBlank(values.status),
      },
      { onSuccess: () => navigate(ROUTES.sales) },
    );
  });

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link
        to={ROUTES.sales}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to sales
      </Link>

      <h1 className="text-lg font-medium tracking-tight">Edit sale</h1>

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
                    disabled={patch.isPending}
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
            disabled={patch.isPending}
            error={form.formState.errors.date?.message}
            {...form.register('date')}
          />
        </div>

        <Field
          label="Status"
          hint="Optional, free text"
          disabled={patch.isPending}
          error={form.formState.errors.status?.message}
          {...form.register('status')}
        />

        <div>
          <p className="pb-2 text-sm font-medium">Items</p>
          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Line items cannot be changed after a sale is recorded. To correct them, delete this sale
            (stock is restored) and record it again.
          </p>

          <table className="mt-3 w-full border-collapse text-sm">
            <tbody>
              {sale.saleProducts.map((line) => (
                <tr key={line.id} className="border-b border-rule/60">
                  <td className="py-2 pr-4">{line.productName}</td>
                  <td className="numeric py-2 text-right text-muted-foreground">x{line.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="numeric mt-3 text-right text-sm">
            Total {formatCurrency(toCents(sale.totalPrice))}
            <span className="ml-2 text-xs text-muted-foreground">recorded {formatDate(sale.date)}</span>
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-rule pt-4">
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            onClick={() => setConfirmingDelete(true)}
          >
            Delete and start again
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" render={<Link to={ROUTES.sales} />} nativeButton={false}>
              Cancel
            </Button>
            <Button type="submit" disabled={patch.isPending}>
              {patch.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
              Save changes
            </Button>
          </div>
        </div>
      </form>

      <DeleteConfirm
        open={confirmingDelete}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmingDelete(false);
            del.reset();
          }
        }}
        title="Delete this sale?"
        description="The sold units are returned to stock. You can then record the sale again with the right items."
        confirmLabel="Delete sale"
        isPending={del.isPending}
        error={del.error}
        onConfirm={() =>
          del.mutate(sale.id, {
            onSuccess: () => navigate(ROUTES.sales),
            onError: (error) => {
              if (error.kind === 'notfound') navigate(ROUTES.sales);
            },
          })
        }
      />
    </div>
  );
}

export default function SaleEditPage() {
  const params = useParams();
  const saleId = Number(params.id);
  const salesQuery = useSales();
  const customersQuery = useCustomers();

  const gate = {
    data: salesQuery.data && customersQuery.data ? salesQuery.data : undefined,
    isPending: salesQuery.isPending || customersQuery.isPending,
    isError: salesQuery.isError || customersQuery.isError,
    error: salesQuery.error ?? customersQuery.error,
    refetch: () => {
      void salesQuery.refetch();
      void customersQuery.refetch();
    },
  };

  return (
    <QueryState query={gate} skeleton={<TableSkeleton columns={3} />}>
      {(sales) => {
        const sale = sales.find((s) => s.id === saleId);
        if (!sale) {
          return (
            <div className="p-6">
              <EmptyState
                title="Sale not found"
                description="It may have been deleted."
                action={
                  <Button render={<Link to={ROUTES.sales} />} nativeButton={false}>
                    Back to sales
                  </Button>
                }
              />
            </div>
          );
        }
        return <SaleEditForm sale={sale} customers={customersQuery.data ?? []} />;
      }}
    </QueryState>
  );
}
