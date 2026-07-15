import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Field } from '@/shared/components/Field';
import { FormRow } from '@/shared/components/FormRow';
import { FormSheet } from '@/shared/components/FormSheet';
import { Textarea } from '@/shared/components/ui/textarea';
import { useServerFieldErrors } from '@/features/auth/hooks/useServerFieldErrors';
import { nullIfBlank } from '@/shared/lib/form';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useCustomerMutations';
import { customerFormSchema, type Customer, type CustomerFormValues } from '../schemas/customer.schema';

export function CustomerFormSheet({
  editing,
  onClose,
}: {
  editing: Customer | 'new';
  onClose: () => void;
}) {
  const isEdit = editing !== 'new';
  const create = useCreateCustomer();
  const update = useUpdateCustomer();
  const mutation = isEdit ? update : create;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
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
      title={isEdit ? 'Edit customer' : 'New customer'}
      submitLabel={isEdit ? 'Save changes' : 'Create'}
      isPending={mutation.isPending}
      error={formError}
      onSubmit={submit}
    >
      <Field
        label="Name"
        placeholder="Karim Haddad"
        disabled={mutation.isPending}
        error={form.formState.errors.name?.message}
        {...form.register('name')}
      />
      <Field
        label="Email"
        type="email"
        placeholder="karim@example.com"
        hint="Optional"
        disabled={mutation.isPending}
        error={form.formState.errors.email?.message}
        {...form.register('email')}
      />
      <Field
        label="Phone"
        placeholder="+20 10 555 0134"
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
