import { Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import {
  Controller,
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type UseFormReturn,
} from 'react-hook-form';
import type { Product } from '@/features/products/schemas/product.schema';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/cn';
import { formatCurrency, formatNumber, toCents } from '@/shared/lib/format';
import type { SaleFormValues } from '../schemas/sale.schema';
import { estimateTotalCents, mergeLines, stockWarnings } from '../lib/sale-lines';

/**
 * The editable line-item grid, and the running total.
 *
 * The aggregate is computed here rather than in the parent: per-line
 * form.watch works reliably in the component that renders the inputs, whereas
 * watching the whole array from the parent (which owns the field array) does
 * not re-render on nested changes. So the total lives with the lines.
 */
export function SaleLinesEditor({
  form,
  products,
  disabled,
  fields,
  append,
  remove,
}: {
  form: UseFormReturn<SaleFormValues>;
  products: Product[];
  disabled: boolean;
  fields: FieldArrayWithId<SaleFormValues, 'lines', 'id'>[];
  append: UseFieldArrayAppend<SaleFormValues, 'lines'>;
  remove: UseFieldArrayRemove;
}) {
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const linesError = form.formState.errors.lines?.message;

  // Reactive per-line reads; these are the subscriptions that actually fire.
  const watched = fields.map((_, index) => form.watch(`lines.${index}`));
  const complete = watched.filter(
    (l): l is { productId: number; quantity: number; notes?: string } =>
      !!l && typeof l.productId === 'number' && typeof l.quantity === 'number' && l.quantity > 0,
  );
  const merged = mergeLines(complete);
  const totalCents = estimateTotalCents(merged, productById);
  const warnings = stockWarnings(merged, productById);
  const willMerge = merged.length < complete.length;

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <Label>Products</Label>
        {linesError ? <span className="text-sm text-destructive">{linesError}</span> : null}
      </div>

      <div className="border-t border-rule">
        {fields.map((field, index) => {
          const line = watched[index];
          const product = line?.productId ? productById.get(line.productId) : undefined;
          const tone = product ? warnings.get(product.id) : undefined;
          const lineCents = product && line?.quantity ? toCents(product.price) * line.quantity : 0;

          return (
            <div key={field.id} className="grid grid-cols-[1fr_5.5rem_auto] gap-3 border-b border-rule/60 py-3">
              <div className="min-w-0">
                <Controller
                  control={form.control}
                  name={`lines.${index}.productId`}
                  render={({ field: f }) => (
                    <Select
                      value={f.value ? String(f.value) : ''}
                      onValueChange={(value) => f.onChange(Number(value))}
                      disabled={disabled}
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-label={`Product for line ${index + 1}`}
                        aria-invalid={!!form.formState.errors.lines?.[index]?.productId}
                      >
                        <SelectValue placeholder="Choose a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name} · {formatNumber(p.stock)} left · {formatCurrency(toCents(p.price))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {tone ? (
                  <p className={cn('mt-1 text-xs', tone === 'out' ? 'text-stock-out' : 'text-stock-low')}>
                    {tone === 'out'
                      ? `Only ${formatNumber(product?.stock ?? 0)} left as of the last refresh`
                      : 'This empties the stock'}
                  </p>
                ) : null}
                {product && lineCents > 0 ? (
                  <p className="numeric mt-1 text-xs text-muted-foreground">{formatCurrency(lineCents)}</p>
                ) : null}
              </div>

              <Input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="Qty"
                aria-label={`Quantity for line ${index + 1}`}
                aria-invalid={!!form.formState.errors.lines?.[index]?.quantity}
                disabled={disabled}
                {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove line ${index + 1}`}
                disabled={disabled || fields.length === 1}
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        disabled={disabled}
        onClick={() => append({ productId: undefined as unknown as number, quantity: undefined as unknown as number })}
      >
        Add product
      </Button>

      {willMerge ? (
        <p className="mt-3 text-xs text-muted-foreground" role="status" aria-live="polite">
          Repeated products will be combined into one line before saving.
        </p>
      ) : null}

      <div className="mt-4 flex items-baseline justify-between border-t border-rule pt-4">
        <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Total (calculated)</p>
        <p className="numeric text-lg">{formatCurrency(totalCents)}</p>
      </div>
      <p className="mt-1 text-right text-xs text-muted-foreground">
        The server sets the final total from current prices.
      </p>
    </div>
  );
}
