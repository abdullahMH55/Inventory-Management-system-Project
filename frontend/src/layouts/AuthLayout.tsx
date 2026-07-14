import { Outlet } from 'react-router-dom';
import { formatCurrency } from '@/shared/lib/format';

/**
 * Split screen: the form on the left, the product on the right.
 *
 * The right panel is a ledger, not a stock photograph. It shows the thing the
 * app is actually for (ruled rows, aligned mono figures, a low-stock line
 * carrying the one status colour) so the first screen already teaches the
 * visual language the dashboard uses.
 */

const LEDGER_ROWS = [
  { sku: 'CBL-0031', name: 'USB-C cable, 2m', stock: 142, price: 899 },
  { sku: 'KEY-0114', name: 'Mechanical keyboard', stock: 38, price: 7450 },
  { sku: 'HUB-0007', name: 'Docking station', stock: 6, price: 12900, low: true },
  { sku: 'MSE-0052', name: 'Wireless mouse', stock: 87, price: 2999 },
  { sku: 'PWR-0128', name: 'Power bank, 20k', stock: 54, price: 4550 },
];

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Outlet />
        </div>
      </div>

      <aside
        className="relative hidden border-l border-rule bg-panel md:block md:w-1/2"
        aria-hidden
      >
        <div className="flex h-full flex-col justify-center px-12 lg:px-16">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Stock on hand
          </p>

          <table className="mt-6 w-full max-w-md border-collapse">
            <tbody>
              {LEDGER_ROWS.map((row) => (
                <tr key={row.sku} className="border-b border-rule/70 last:border-0">
                  <td className="py-3 pr-4 align-baseline">
                    <span className="numeric block text-[0.6875rem] text-muted-foreground">
                      {row.sku}
                    </span>
                    <span className="block text-sm text-panel-foreground">{row.name}</span>
                  </td>
                  <td className="py-3 pr-4 text-right align-baseline">
                    <span
                      className="numeric text-sm"
                      style={{ color: row.low ? 'var(--stock-low)' : undefined }}
                    >
                      {row.stock}
                    </span>
                  </td>
                  <td className="numeric py-3 text-right align-baseline text-sm text-muted-foreground">
                    {formatCurrency(row.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-8 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
            Know what you have, what it is worth, and what is about to run out.
          </p>
        </div>
      </aside>
    </div>
  );
}
