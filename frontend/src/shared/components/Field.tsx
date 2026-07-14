import { useId, type ComponentProps } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/cn';

/**
 * A labelled input that wires up aria-invalid and aria-describedby, so a
 * screen reader announces the error with the field rather than leaving it
 * floating as unassociated text.
 */
export function Field({
  label,
  error,
  className,
  ...inputProps
}: { label: string; error?: string } & ComponentProps<typeof Input>) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(error && 'border-destructive')}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
