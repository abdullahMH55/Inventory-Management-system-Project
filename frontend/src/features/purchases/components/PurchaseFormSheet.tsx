import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Field } from '@/shared/components/Field';
import { FormRow } from '@/shared/components/FormRow';
import { FormSheet } from '@/shared/components/FormSheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { useServerFieldErrors } from '@/features/auth/hooks/useServerFieldErrors';
import type { Product } from '@/features/products/schemas/product.schema';
import type { Supplier } from '@/features/suppliers/schemas/supplier.schema';
import { nullIfBlank } from '@/shared/lib/form';
import {
  fromDateTimeLocalValue,
  parseApiDate,
  toDateTimeLocalValue,
} from '@/shared/lib/format';
import { useCreatePurchase, useUpdatePurchase } from '../hooks/usePurchaseMutations';
import { purchaseFormSchema, type Purchase, type PurchaseFormValues } from '../schemas/purchase.schema';

export function PurchaseFormSheet({
  editing,
  products,
  suppliers,
  onClose,
}: {
  editing: Purchase | 'new';
  products: Product[];
  suppliers: Supplier[];
  onClose: () => void;
}) {
  const isEdit = editing !== 'new';
  const create = useCreatePurchase();
  const update = useUpdatePurchase();
  const mutation = isEdit ? update : create;

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      productId: isEdit ? editing.productId : undefined,
      supplierId: isEdit ? editing.supplierId : undefined,
      quantity: isEdit ? editing.quantity : undefined,
      dateIn: isEdit
        ? toDateTimeLocalValue(parseApiDate(editing.dateIn))
        : toDateTimeLocalValue(new Date()),
      notes: isEdit ? (editing.notes ?? '') : '',
    },
  });

  useServerFieldErrors(form, mutation.error ?? null);
  const formError =
    mutation.error && mutation.error.kind !== 'validation' ? mutation.error.message : null;

  const submit = form.handleSubmit((values) => {
    const body = {
      productId: values.productId,
      supplierId: values.supplierId,
      quantity: values.quantity,
      dateIn: fromDateTimeLocalValue(values.dateIn),
      notes: nullIfBlank(values.notes),
    };
    if (isEdit) {
      update.mutate({ id: editing.id, ...body }, { onSuccess: onClose });
    } else {
      create.mutate(body, { onSuccess: onClose });
    }
  });

  return (
    <FormSheet
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={isEdit ? 'Edit purchase' : 'Record a purchase'}
      description={isEdit ? undefined : 'Adds the received units to the product’s stock.'}
      submitLabel={isEdit ? 'Save changes' : 'Record'}
      isPending={mutation.isPending}
      error={formError}
      onSubmit={submit}
      className="sm:max-w-md"
    >
      <FormRow
        label="Product"
        error={form.formState.errors.productId?.message}
        hint={isEdit ? 'The product cannot be changed. Delete and re-add to move stock.' : undefined}
      >
        {({ id, describedBy, invalid }) => (
          <Controller
            control={form.control}
            name="productId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ''}
                onValueChange={(value) => field.onChange(Number(value))}
                // Locked in edit mode: changing it would corrupt stock, and the
                // server rejects it too. The value stays in form state so the PUT
                // still carries the original product.
                disabled={isEdit || mutation.isPending}
              >
                <SelectTrigger
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  className="w-full"
                >
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </FormRow>

      <FormRow label="Supplier" error={form.formState.errors.supplierId?.message}>
        {({ id, describedBy, invalid }) => (
          <Controller
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ''}
                onValueChange={(value) => field.onChange(Number(value))}
                disabled={mutation.isPending}
              >
                <SelectTrigger
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  className="w-full"
                >
                  <SelectValue placeholder="Choose a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </FormRow>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Quantity"
          type="number"
          step="1"
          min="1"
          inputMode="numeric"
          placeholder="0"
          disabled={mutation.isPending}
          error={form.formState.errors.quantity?.message}
          {...form.register('quantity', { valueAsNumber: true })}
        />
        <Field
          label="Received"
          type="datetime-local"
          disabled={mutation.isPending}
          error={form.formState.errors.dateIn?.message}
          {...form.register('dateIn')}
        />
      </div>

      <FormRow label="Notes" hint="Optional" error={form.formState.errors.notes?.message}>
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            disabled={mutation.isPending}
            {...form.register('notes')}
          />
        )}
      </FormRow>
    </FormSheet>
  );
}
