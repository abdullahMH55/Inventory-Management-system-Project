import { describe, expect, it } from 'vitest';
import { AppError } from '@/shared/api/errors';
import type { Product } from '@/features/products/schemas/product.schema';
import { estimateTotalCents, mergeLines, stockWarnings } from './sale-lines';
import { saleErrorProductId } from './sale-errors';

const product = (over: Partial<Product> = {}): Product => ({
  id: 1,
  name: 'USB-C cable',
  description: null,
  price: 8.99,
  stock: 10,
  categoryId: 1,
  categoryName: 'Cables',
  ...over,
});

const productMap = (...products: Product[]) => new Map(products.map((p) => [p.id, p]));

describe('mergeLines', () => {
  it('sums quantities for a repeated product', () => {
    const merged = mergeLines([
      { productId: 7, quantity: 6 },
      { productId: 7, quantity: 4 },
    ]);

    expect(merged).toEqual([{ productId: 7, quantity: 10, notes: null }]);
  });

  it('keeps distinct products separate and preserves order', () => {
    const merged = mergeLines([
      { productId: 7, quantity: 1 },
      { productId: 3, quantity: 2 },
      { productId: 7, quantity: 1 },
    ]);

    expect(merged).toEqual([
      { productId: 7, quantity: 2, notes: null },
      { productId: 3, quantity: 2, notes: null },
    ]);
  });

  it('keeps the first notes when merging', () => {
    const merged = mergeLines([
      { productId: 7, quantity: 1, notes: 'gift wrap' },
      { productId: 7, quantity: 1, notes: 'later note' },
    ]);

    expect(merged[0].notes).toBe('gift wrap');
  });
});

describe('estimateTotalCents', () => {
  it('accumulates in integer cents so float error never shows', () => {
    // 8.99 * 3 as floats is 26.970000000000002.
    const total = estimateTotalCents([{ productId: 1, quantity: 3 }], productMap(product()));
    expect(total).toBe(2697);
  });

  it('sums across products and ignores unknown ids', () => {
    const total = estimateTotalCents(
      [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
        { productId: 999, quantity: 5 },
      ],
      productMap(product({ id: 1, price: 10 }), product({ id: 2, price: 4.5 })),
    );
    expect(total).toBe(2450);
  });
});

describe('stockWarnings', () => {
  it('flags out when the quantity exceeds stock', () => {
    const warnings = stockWarnings([{ productId: 1, quantity: 11 }], productMap(product({ stock: 10 })));
    expect(warnings.get(1)).toBe('out');
  });

  it('flags low when the quantity exactly empties stock', () => {
    const warnings = stockWarnings([{ productId: 1, quantity: 10 }], productMap(product({ stock: 10 })));
    expect(warnings.get(1)).toBe('low');
  });

  it('says nothing when there is room to spare', () => {
    const warnings = stockWarnings([{ productId: 1, quantity: 3 }], productMap(product({ stock: 10 })));
    expect(warnings.has(1)).toBe(false);
  });
});

describe('saleErrorProductId', () => {
  const err = (message: string) => new AppError({ kind: 'domain', status: 400, message });

  it('maps an insufficient-stock message back to the product by name', () => {
    const id = saleErrorProductId(
      err("Insufficient stock for product 'USB-C cable'"),
      [{ productId: 1, quantity: 20 }],
      productMap(product({ id: 1, name: 'USB-C cable' })),
    );
    expect(id).toBe(1);
  });

  it('returns null when two products share the name it cannot disambiguate', () => {
    const id = saleErrorProductId(
      err("Insufficient stock for product 'Cable'"),
      [
        { productId: 1, quantity: 5 },
        { productId: 2, quantity: 5 },
      ],
      productMap(product({ id: 1, name: 'Cable' }), product({ id: 2, name: 'Cable' })),
    );
    expect(id).toBeNull();
  });

  it('parses the id out of a not-found message', () => {
    const id = saleErrorProductId(
      err('Product with id 42 not found'),
      [{ productId: 42, quantity: 1 }],
      productMap(),
    );
    expect(id).toBe(42);
  });

  it('returns null for an unrelated error', () => {
    const id = saleErrorProductId(err('Something else'), [], productMap());
    expect(id).toBeNull();
  });
});
