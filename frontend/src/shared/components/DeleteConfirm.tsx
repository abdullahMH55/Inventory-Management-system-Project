import { LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AppError } from '@/shared/api/errors';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { FormError } from '@/shared/components/FormError';

/**
 * Controlled, error-aware destructive confirmation.
 *
 * The whole reason it is controlled: on error it STAYS OPEN and renders the
 * server's message. This is where the 409 "category still has products" and the
 * 400 "would drive stock negative" land. It closes only on success, which the
 * consumer signals by flipping `open` in the mutation's onDone.
 */
export function DeleteConfirm({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  isPending,
  error,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  isPending: boolean;
  error?: AppError | null;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <div className="px-0">
            <FormError message={error.message} />
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              // Keep the dialog open on error: confirm must not auto-close.
              event.preventDefault();
              onConfirm();
            }}
          >
            {isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
