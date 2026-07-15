import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Field } from '@/shared/components/Field';
import { FormRow } from '@/shared/components/FormRow';
import { FormSheet } from '@/shared/components/FormSheet';
import { Textarea } from '@/shared/components/ui/textarea';
import { useServerFieldErrors } from '@/features/auth/hooks/useServerFieldErrors';
import { nullIfBlank } from '@/shared/lib/form';
import { useCreateCategory, useUpdateCategory } from '../hooks/useCategoryMutations';
import { categoryFormSchema, type Category, type CategoryFormValues } from '../schemas/category.schema';

/**
 * Mounted only while a category is being created or edited, and keyed by the
 * row id at the call site, so react-hook-form re-derives its defaults on each
 * open with no reset effect.
 */
export function CategoryFormSheet({
  editing,
  onClose,
}: {
  editing: Category | 'new';
  onClose: () => void;
}) {
  const isEdit = editing !== 'new';
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const mutation = isEdit ? update : create;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: isEdit ? editing.name : '',
      description: isEdit ? (editing.description ?? '') : '',
    },
  });

  useServerFieldErrors(form, mutation.error ?? null);
  const formError =
    mutation.error && mutation.error.kind !== 'validation' ? mutation.error.message : null;

  const submit = form.handleSubmit((values) => {
    const body = { name: values.name, description: nullIfBlank(values.description) };
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
      title={isEdit ? 'Edit category' : 'New category'}
      submitLabel={isEdit ? 'Save changes' : 'Create'}
      isPending={mutation.isPending}
      error={formError}
      onSubmit={submit}
    >
      <Field
        label="Name"
        placeholder="Cables & adapters"
        disabled={mutation.isPending}
        error={form.formState.errors.name?.message}
        {...form.register('name')}
      />

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
            placeholder="What goes in this category?"
            disabled={mutation.isPending}
            {...form.register('description')}
          />
        )}
      </FormRow>
    </FormSheet>
  );
}
