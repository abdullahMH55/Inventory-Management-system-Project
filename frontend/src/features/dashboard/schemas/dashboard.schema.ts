import { z } from 'zod';

/** Mirrors DashboardStatsResponse. Money is decimal dollars, not cents. */
export const dashboardStatsSchema = z.object({
  totalProducts: z.number().int(),
  totalStockUnits: z.number().int(),
  inventoryValue: z.number(),
  salesValue: z.number(),
  lowStockCount: z.number().int(),
  outOfStockCount: z.number().int(),
  categoriesCount: z.number().int(),
  customersCount: z.number().int(),
  suppliersCount: z.number().int(),
  salesCount: z.number().int(),
  purchasesCount: z.number().int(),
  lowStockThreshold: z.number().int(),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

/** Mirrors TopProductResponse. No revenue: per-line price is not stored server-side. */
export const topProductSchema = z.object({
  productId: z.number().int(),
  productName: z.string(),
  unitsSold: z.number().int(),
});

export type TopProduct = z.infer<typeof topProductSchema>;

/** Mirrors SalesSummaryPointResponse. `total` is decimal dollars. */
export const salesSummaryPointSchema = z.object({
  period: z.string(),
  total: z.number(),
  count: z.number().int(),
});

export type SalesSummaryPoint = z.infer<typeof salesSummaryPointSchema>;
