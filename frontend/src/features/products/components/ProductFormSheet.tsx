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
import type { Category } from '@/features/categories/schemas/category.schema';
import { nullIfBlank } from '@/shared/lib/form';
import { useCreateProduct, useUpdateProduct } from '../hooks/useProductMutations';
import { productFormSchema, type Product, type ProductFormValues } from '../schemas/product.schema';

export function ProductFormSheet({
  editing,
  categories,
  onClose,
}: {
  editing: Product | 'new';
  categories: Category[];
  onClose: () => void;
}) {
  const isEdit = editing !== 'new';
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const mutation = isEdit ? update : create;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: isEdit ? editing.name : '',
      description: isEdit ? (editing.description ?? '') : '',
      price: isEdit ? editing.price : undefined,
      stock: isEdit ? editing.stock : undefined,
      categoryId: isEdit ? editing.categoryId : undefined,
    },
  });

  useServerFieldErrors(form, mutation.error ?? null);
  const formError =
    mutation.error && mutation.error.kind !== 'validation' ? mutation.error.message : null;

  const submit = form.handleSubmit((values) => {
    const body = {
      name: values.name,
      description: nullIfBlank(values.description),
      price: values.price,
      stock: values.stock,
      categoryId: values.categoryId,
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
      title={isEdit ? 'Edit product' : 'New product'}
      submitLabel={isEdit ? 'Save changes' : 'Create'}
      isPending={mutation.isPending}
      error={formError}
      onSubmit={submit}
      className="sm:max-w-md"
    >
      <Field
        label="Name"
        placeholder="USB-C cable, 2m"
        disabled={mutation.isPending}
        error={form.formState.errors.name?.message}
        {...form.register('name')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Price"
          type="number"
          step="0.01"
          min="0.01"
          inputMode="decimal"
          placeholder="0.00"
          disabled={mutation.isPending}
          error={form.formState.errors.price?.message}
          {...form.register('price', { valueAsNumber: true })}
        />
        <Field
          label="Stock"
          type="number"
          step="1"
          min="0"
          inputMode="numeric"
          placeholder="0"
          disabled={mutation.isPending}
          error={form.formState.errors.stock?.message}
          {...form.register('stock', { valueAsNumber: true })}
        />
      </div>

      <FormRow
        label="Category"
        error={form.formState.errors.categoryId?.message}
        hint={categories.length === 0 ? 'Create a category first' : undefined}
      >
        {({ id, describedBy, invalid }) => (
          <Controller
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ''}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  className="w-full"
                  disabled={mutation.isPending || categories.length === 0}
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </FormRow>

      <FormRow
        label="Description"
        hint="Optional"
        error={form.formState.errors.description?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            disabled={mutation.isPending}
            {...form.register('description')}
          />
        )}
      </FormRow>
    </FormSheet>
  );
}
