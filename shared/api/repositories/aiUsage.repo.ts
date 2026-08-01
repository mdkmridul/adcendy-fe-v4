import type {
  AiDailyUsage,
  AiUsageSummary,
  GetAiDailyUsageParams,
  GetAiUsageSummaryParams,
} from '@/shared/types/aiUsage';
import { aiUsageMockAdapter } from '../mock/aiUsage.mock';
import { aiUsageRealAdapter } from '../real/aiUsage.real';

import ENV, { createRuntimeRepositoryAdapter } from '@/lib/env';

// Route to mock or real adapter based on DATA_SOURCE environment variable
const adapter = createRuntimeRepositoryAdapter(aiUsageMockAdapter, aiUsageRealAdapter);

// Log adapter selection in development
if (ENV.features.apiLogging && typeof window !== 'undefined') {
  console.log('[AI Usage Repository] Using adapter:', ENV.API.dataSource);
}

export const aiUsageRepository = {
  async getAiUsageSummary(params?: GetAiUsageSummaryParams): Promise<AiUsageSummary> {
    return adapter.getAiUsageSummary(params);
  },

  async getDailyUsage(params?: GetAiDailyUsageParams): Promise<AiDailyUsage[]> {
    return adapter.getDailyUsage(params);
  },
};
