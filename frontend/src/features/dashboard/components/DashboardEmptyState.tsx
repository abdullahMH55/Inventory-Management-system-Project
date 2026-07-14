import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/cn';

/**
 * Register signs the user in, so this is the first screen every new account ever
 * sees. It is not a dead end: the steps tick themselves off as the underlying
 * queries start returning data, so it doubles as onboarding progress.
 */
export function DashboardEmptyState({
  hasCategories,
  hasProducts,
  hasSales,
}: {
  hasCategories: boolean;
  hasProducts: boolean;
  hasSales: boolean;
}) {
  const steps = [
    {
      done: hasCategories,
      label: 'Create a category',
      hint: 'Group your products: cables, tools, whatever fits your shop.',
      to: ROUTES.categories,
    },
    {
      done: hasProducts,
      label: 'Add your first product',
      hint: 'Give it a price and how many you have on hand.',
      to: ROUTES.products,
    },
    {
      done: hasSales,
      label: 'Record a sale',
      hint: 'Stock comes down automatically when you do.',
      to: ROUTES.sales,
    },
  ];

  const next = steps.find((step) => !step.done);

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h2 className="text-lg font-medium tracking-tight">Set up your inventory</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Nothing here yet. Three steps and this page fills itself in.
      </p>

      <ol className="mt-8 border-t border-rule">
        {steps.map((step) => (
          <li key={step.label} className="flex items-start gap-3 border-b border-rule py-4">
            <span
              className={cn(
                'mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border',
                step.done
                  ? 'border-stock-ok bg-stock-ok text-background'
                  : 'border-rule text-transparent',
              )}
              aria-hidden
            >
              <Check className="size-2.5" strokeWidth={3} />
            </span>

            <div className="min-w-0 flex-1">
              <p className={cn('text-sm', step.done && 'text-muted-foreground line-through')}>
                {step.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{step.hint}</p>
            </div>

            <span className="sr-only">{step.done ? 'Done' : 'Not done'}</span>
          </li>
        ))}
      </ol>

      {next ? (
        <Button className="mt-8" render={<Link to={next.to} />}>
          {next.label}
        </Button>
      ) : null}
    </div>
  );
}
