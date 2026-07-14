import { PlugZap, TriangleAlert } from 'lucide-react';
import type { AppError } from '@/shared/api/errors';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/cn';

/**
 * In dev, most failures are "the API is not running" rather than a real server
 * error, so a network AppError gets its own copy instead of a generic apology.
 */
export function ErrorState({
  error,
  onRetry,
  className,
}: {
  error?: AppError;
  onRetry?: () => void;
  className?: string;
}) {
  const isNetwork = error?.kind === 'network';
  const Icon = isNetwork ? PlugZap : TriangleAlert;

  const title = isNetwork ? 'Cannot reach the server' : 'Something went wrong';
  const description = isNetwork
    ? 'The API is not responding. Check that it is running on port 5166, then try again.'
    : (error?.message ?? 'The request failed.');

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 px-6 py-10 text-center',
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className="size-5 text-destructive" aria-hidden />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-[52ch] text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
