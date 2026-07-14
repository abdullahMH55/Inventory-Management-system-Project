import { useId, type ReactNode } from 'react';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/cn';

type RenderArgs = { id: string; describedBy: string | undefined; invalid: boolean };

/**
 * Label + error + a11y wiring for controls that are not a plain Input (selects,
 * textareas). The generated id has to reach a Base UI trigger, so the control
 * is a render prop rather than children. Field.tsx stays the shorthand for the
 * Input case.
 */
export function FormRow({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: (args: RenderArgs) => ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({ id, describedBy, invalid: !!error })}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
