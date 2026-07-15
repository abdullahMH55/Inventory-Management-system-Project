import { z } from 'zod';
import { api } from '@/shared/api/client';
import { request } from '@/shared/lib/zod';
import {
  dashboardStatsSchema,
  salesSummaryPointSchema,
  topProductSchema,
  type DashboardStats,
  type SalesSummaryPoint,
  type TopProduct,
} from '../schemas/dashboard.schema';

export type SalesSummaryParams = { from?: string; to?: string; groupBy?: 'day' | 'month' };
export type TopProductsParams = { from?: string; to?: string; limit?: number };

export const dashboardApi = {
  stats: (lowStockThreshold: number): Promise<DashboardStats> =>
    request(dashboardStatsSchema, api.get('/Dashboard/stats', { params: { lowStockThreshold } })),

  topProducts: (params: TopProductsParams): Promise<TopProduct[]> =>
    request(z.array(topProductSchema), api.get('/Reports/topProducts', { params })),

  salesSummary: (params: SalesSummaryParams): Promise<SalesSummaryPoint[]> =>
    request(z.array(salesSummaryPointSchema), api.get('/Reports/salesSummary', { params })),
};
