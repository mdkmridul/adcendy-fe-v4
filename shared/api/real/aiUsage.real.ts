import { http } from '../index';
import type { AiUsageSummary, GetAiUsageSummaryParams } from '@/shared/types/aiUsage';

export const aiUsageRealAdapter = {
  async getAiUsageSummary(params?: GetAiUsageSummaryParams): Promise<AiUsageSummary> {
    return http<AiUsageSummary>('/admin/ai-usage', { query: params as Record<string, any> });
  },
};
