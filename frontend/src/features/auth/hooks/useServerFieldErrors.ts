import { useEffect } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import type { AppError } from '@/shared/api/errors';

/**
 * Push server-side validation failures onto the matching form fields.
 *
 * This is where camelCasing the PascalCase ModelState keys in normalizeError
 * pays off: "Email" already arrives as `email`, which is the react-hook-form
 * field name, so there is no mapping table to keep in sync.
 */
export function useServerFieldErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  error: AppError | null,
) {
  useEffect(() => {
    if (error?.kind !== 'validation' || !error.fieldErrors) return;

    const fields = form.getValues();
    for (const [field, messages] of Object.entries(error.fieldErrors)) {
      if (field in fields && messages[0]) {
        form.setError(field as Path<T>, { message: messages[0] });
      }
    }
  }, [error, form]);
}
