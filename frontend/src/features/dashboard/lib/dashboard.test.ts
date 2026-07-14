import { describe, expect, it } from 'vitest';
import type { Category } from '@/features/categories/schemas/category.schema';
import type { Product } from '@/features/products/schemas/product.schema';
import type { Purchase } from '@/features/purchases/schemas/purchase.schema';
import type { Sale } from '@/features/sales/schemas/sale.schema';
import { mergeActivity } from './activity';
import { buildSalesSeries } from './series';
import { computeStats, selectLowStock } from './stats';

const product = (over: Partial<Product> = {}): Product => ({
  id: 1,
  name: 'Product',
  description: null,
  price: 10,
  stock: 5,
  categoryId: 1,
  categoryName: '', // what the list endpoint actually returns
  ...over,
});

const sale = (over: Partial<Sale> = {}): Sale => ({
  id: 1,
  customerId: 1,
  customerName: 'Karim Haddad',
  date: '2026-07-10T10:30:00',
  totalPrice: 100,
  status: null,
  saleProducts: [],
  ...over,
});

const purchase = (over: Partial<Purchase> = {}): Purchase => ({
  id: 1,
  productId: 1,
  productName: 'USB-C cable, 2m',
  supplierId: 1,
  supplierName: 'Nile Components',
  quantity: 10,
  dateIn: '2026-07-11T09:00:00',
  notes: null,
  ...over,
});

describe('computeStats', () => {
  it('returns zeroes rather than NaN for a brand-new account', () => {
    const stats = computeStats([], [], 10);

    expect(stats).toEqual({
      totalProducts: 0,
      totalStockUnits: 0,
      inventoryValueCents: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      salesValueCents: 0,
    });
  });

  it('accumulates money in integer cents so float error never reaches the tile', () => {
    // 19.99 * 3 in floats is 59.97000000000001.
    const stats = computeStats([product({ price: 19.99, stock: 3 })], [], 10);

    expect(stats.inventoryValueCents).toBe(5997);
    expect(stats.salesValueCents).toBe(0);
  });

  it('sums many sales without drifting', () => {
    const sales = Array.from({ length: 10 }, (_, i) => sale({ id: i + 1, totalPrice: 0.1 }));

    // 0.1 summed ten times as floats is 0.9999999999999999.
    expect(computeStats([], sales, 10).salesValueCents).toBe(100);
  });

  it('counts out of stock separately from low stock', () => {
    const stats = computeStats(
      [
        product({ id: 1, stock: 0 }),
        product({ id: 2, stock: 4 }),
        product({ id: 3, stock: 10 }),
        product({ id: 4, stock: 11 }),
      ],
      [],
      10,
    );

    expect(stats.outOfStockCount).toBe(1);
    // Inclusive of the threshold, exclusive of zero, which is its own state.
    expect(stats.lowStockCount).toBe(2);
    expect(stats.totalStockUnits).toBe(25);
  });
});

describe('selectLowStock', () => {
  const categories: Category[] = [
    { id: 1, name: 'Cables', description: null, productCount: 0 },
    { id: 2, name: 'Power', description: null, productCount: 0 },
  ];

  it('fills in the category name the list endpoint leaves blank', () => {
    const rows = selectLowStock([product({ stock: 2, categoryId: 2 })], categories, 10);

    expect(rows[0].resolvedCategory).toBe('Power');
  });

  it('prefers the server value if the missing Include is ever added', () => {
    const rows = selectLowStock(
      [product({ stock: 2, categoryId: 2, categoryName: 'From server' })],
      categories,
      10,
    );

    expect(rows[0].resolvedCategory).toBe('From server');
  });

  it('falls back when a product points at a category that is not in the list', () => {
    const rows = selectLowStock([product({ stock: 1, categoryId: 999 })], categories, 10);

    expect(rows[0].resolvedCategory).toBe('Uncategorised');
  });

  it('puts the scarcest first', () => {
    const rows = selectLowStock(
      [
        product({ id: 1, name: 'B', stock: 7 }),
        product({ id: 2, name: 'A', stock: 0 }),
        product({ id: 3, name: 'C', stock: 3 }),
        product({ id: 4, name: 'D', stock: 40 }),
      ],
      categories,
      10,
    );

    expect(rows.map((row) => row.stock)).toEqual([0, 3, 7]);
  });
});

describe('mergeActivity', () => {
  it('does not collide a sale and a purchase that share an id', () => {
    const items = mergeActivity([sale({ id: 1 })], [purchase({ id: 1 })]);

    // Both tables start at 1. A raw id here would give duplicate React keys.
    expect(items.map((item) => item.id).sort()).toEqual(['purchase-1', 'sale-1']);
  });

  it('interleaves both sources newest first', () => {
    const items = mergeActivity(
      [sale({ id: 1, date: '2026-07-01T10:00:00' }), sale({ id: 2, date: '2026-07-09T10:00:00' })],
      [purchase({ id: 1, dateIn: '2026-07-05T10:00:00' })],
    );

    expect(items.map((item) => item.id)).toEqual(['sale-2', 'purchase-1', 'sale-1']);
  });

  it('drops an unparseable date instead of failing the whole feed', () => {
    const items = mergeActivity([sale({ id: 1, date: 'not-a-date' }), sale({ id: 2 })], []);

    expect(items.map((item) => item.id)).toEqual(['sale-2']);
  });

  it('describes a sale by its status, or by item count when there is none', () => {
    const [withStatus, withoutStatus] = mergeActivity(
      [
        sale({ id: 1, status: 'Fulfilled', date: '2026-07-09T10:00:00' }),
        sale({
          id: 2,
          status: '   ', // whitespace is not a status
          date: '2026-07-08T10:00:00',
          saleProducts: [
            { id: 1, productId: 1, productName: 'Cable', quantity: 2, dateOut: '2026-07-08T10:00:00', notes: null },
          ],
        }),
      ],
      [],
    );

    expect(withStatus.subtitle).toBe('Fulfilled');
    expect(withoutStatus.subtitle).toBe('1 item');
  });

  it('honours the limit', () => {
    const sales = Array.from({ length: 20 }, (_, i) => sale({ id: i + 1 }));

    expect(mergeActivity(sales, [], 8)).toHaveLength(8);
  });
});

describe('buildSalesSeries', () => {
  const now = new Date('2026-07-14T12:00:00');

  it('zero-fills the window so a quiet account does not draw a fake trend', () => {
    const series = buildSalesSeries([sale({ date: '2026-07-14T09:00:00', totalPrice: 25 })], 30, now);

    expect(series).toHaveLength(30);
    expect(series[0]).toEqual({ day: '2026-06-15', valueCents: 0 });
    expect(series.at(-1)).toEqual({ day: '2026-07-14', valueCents: 2500 });
  });

  it('adds up several sales landing on the same day', () => {
    const series = buildSalesSeries(
      [
        sale({ id: 1, date: '2026-07-13T09:00:00', totalPrice: 10.5 }),
        sale({ id: 2, date: '2026-07-13T17:00:00', totalPrice: 4.5 }),
      ],
      30,
      now,
    );

    expect(series.find((point) => point.day === '2026-07-13')?.valueCents).toBe(1500);
  });

  it('ignores sales older than the window', () => {
    const series = buildSalesSeries([sale({ date: '2020-01-01T09:00:00', totalPrice: 999 })], 30, now);

    expect(series.every((point) => point.valueCents === 0)).toBe(true);
  });
});
