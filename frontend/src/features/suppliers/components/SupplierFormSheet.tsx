import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Field } from '@/shared/components/Field';
import { FormRow } from '@/shared/components/FormRow';
import { FormSheet } from '@/shared/components/FormSheet';
import { Textarea } from '@/shared/components/ui/textarea';
import { useServerFieldErrors } from '@/features/auth/hooks/useServerFieldErrors';
import { nullIfBlank } from '@/shared/lib/form';
import { useCreateSupplier, useUpdateSupplier } from '../hooks/useSupplierMutations';
import { supplierFormSchema, type Supplier, type SupplierFormValues } from '../schemas/supplier.schema';

export function SupplierFormSheet({
  editing,
  onClose,
}: {
  editing: Supplier | 'new';
  onClose: () => void;
}) {
  const isEdit = editing !== 'new';
  const create = useCreateSupplier();
  const update = useUpdateSupplier();
  const mutation = isEdit ? update : create;

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: isEdit ? editing.name : '',
      email: isEdit ? (editing.email ?? '') : '',
      phone: isEdit ? (editing.phone ?? '') : '',
      address: isEdit ? (editing.address ?? '') : '',
    },
  });

  useServerFieldErrors(form, mutation.error ?? null);
  const formError =
    mutation.error && mutation.error.kind !== 'validation' ? mutation.error.message : null;

  const submit = form.handleSubmit((values) => {
    const body = {
      name: values.name,
      email: nullIfBlank(values.email),
      phone: nullIfBlank(values.phone),
      address: nullIfBlank(values.address),
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
      title={isEdit ? 'Edit supplier' : 'New supplier'}
      submitLabel={isEdit ? 'Save changes' : 'Create'}
      isPending={mutation.isPending}
      error={formError}
      onSubmit={submit}
    >
      <Field
        label="Name"
        placeholder="Nile Components"
        disabled={mutation.isPending}
        error={form.formState.errors.name?.message}
        {...form.register('name')}
      />
      <Field
        label="Email"
        type="email"
        placeholder="sales@nilecomp.com"
        hint="Optional"
        disabled={mutation.isPending}
        error={form.formState.errors.email?.message}
        {...form.register('email')}
      />
      <Field
        label="Phone"
        placeholder="+20 2 555 0111"
        disabled={mutation.isPending}
        error={form.formState.errors.phone?.message}
        {...form.register('phone')}
      />
      <FormRow label="Address" hint="Optional" error={form.formState.errors.address?.message}>
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            disabled={mutation.isPending}
            {...form.register('address')}
          />
        )}
      </FormRow>
    </FormSheet>
  );
}
