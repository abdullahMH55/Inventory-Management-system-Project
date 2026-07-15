/**
 * The form-level error banner: a wrong password, a 409, a network failure.
 * Field-level validation errors do not come here; they sit on the fields.
 * Extracted from the original LoginForm markup so the treatment is identical
 * everywhere a form can fail.
 */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <p
      className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
      role="alert"
      aria-live="polite"
    >
      {message}
    </p>
  );
}
