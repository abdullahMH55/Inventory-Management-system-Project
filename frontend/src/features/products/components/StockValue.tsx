import { useLowStockThreshold } from '@/shared/hooks/useLowStockThreshold';
import { cn } from '@/shared/lib/cn';
import { formatNumber } from '@/shared/lib/format';

/**
 * A stock count toned by the same threshold the dashboard uses: red at zero,
 * amber at or below the threshold, plain otherwise. These are the reserved
 * status colours, used here for genuine stock meaning.
 */
export function StockValue({ stock }: { stock: number }) {
  const [threshold] = useLowStockThreshold();

  const tone = stock <= 0 ? 'out' : stock <= threshold ? 'low' : 'ok';
  const label = tone === 'out' ? ', out of stock' : tone === 'low' ? ', low stock' : '';

  return (
    <span
      className={cn(
        'numeric',
        tone === 'out' && 'text-stock-out',
        tone === 'low' && 'text-stock-low',
      )}
    >
      {formatNumber(stock)}
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
