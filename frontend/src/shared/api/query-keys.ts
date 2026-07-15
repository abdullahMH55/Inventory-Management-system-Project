/**
 * One key factory for the whole app.
 *
 * This is the seam that makes the dashboard self-updating: the dashboard reads
 * the same list queries the feature hooks do, so a future useCreateProduct that
 * invalidates qk.products.all() refreshes the dashboard for free, with no
 * cross-feature import and no refactor.
 */
export const qk = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  products: {
    all: () => ['products'] as const,
    list: () => ['products', 'list'] as const,
  },
  categories: {
    all: () => ['categories'] as const,
    list: () => ['categories', 'list'] as const,
  },
  sales: {
    all: () => ['sales'] as const,
    list: () => ['sales', 'list'] as const,
  },
  purchases: {
    all: () => ['purchases'] as const,
    list: () => ['purchases', 'list'] as const,
  },
  customers: {
    all: () => ['customers'] as const,
    list: () => ['customers', 'list'] as const,
  },
  suppliers: {
    all: () => ['suppliers'] as const,
    list: () => ['suppliers', 'list'] as const,
  },
} as const;
