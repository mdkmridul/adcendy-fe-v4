import { z } from 'zod';

export const weeklyMetricsSchema = z.object({
  spend: z.coerce.number().min(0, 'Spend must be non-negative'),
  impressions: z.coerce.number().min(0, 'Impressions must be non-negative'),
  clicks: z.coerce.number().min(0, 'Clicks must be non-negative'),
  leads: z.coerce.number().min(0, 'Leads must be non-negative'),
  purchases: z.coerce.number().min(0, 'Purchases must be non-negative').optional(),
  revenue: z.coerce.number().min(0, 'Revenue must be non-negative').optional(),
});

export type WeeklyMetricsInput = z.infer<typeof weeklyMetricsSchema>;
