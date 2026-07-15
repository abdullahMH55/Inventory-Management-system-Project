import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

/** Teaches the interface. Never just "nothing here". */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 px-6 py-10 text-center',
        className,
      )}
    >
      {Icon ? <Icon className="size-5 text-muted-foreground/70" aria-hidden /> : null}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="max-w-[46ch] text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
