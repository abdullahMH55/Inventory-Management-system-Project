import { LoaderCircle } from 'lucide-react';
import type { FormEventHandler, ReactNode } from 'react';
import { FormError } from '@/shared/components/FormError';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { cn } from '@/shared/lib/cn';

/**
 * The create/edit shell for the record entities (not the sale, which is a
 * route). Keeps the list visible behind it. The <form> wraps body and footer so
 * the footer submit works, and close-while-pending is blocked so a save cannot
 * be interrupted.
 *
 * `error` should be the non-validation error only; field errors sit on the
 * fields. The caller filters with `error?.kind !== 'validation'`.
 */
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  isPending,
  error,
  onSubmit,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  isPending: boolean;
  error?: string | null;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next);
      }}
    >
      <SheetContent className={cn('w-full sm:max-w-sm', className)}>
        <form onSubmit={onSubmit} className="flex h-full flex-col" noValidate>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4">
            <div className="grid gap-4">
              <FormError message={error} />
              {children}
            </div>
          </div>

          <SheetFooter className="flex-row justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
              {submitLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
