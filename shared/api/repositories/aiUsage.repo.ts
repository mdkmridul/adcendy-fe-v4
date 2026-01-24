import type { AiUsageSummary, GetAiUsageSummaryParams } from '@/shared/types/aiUsage';
import { aiUsageMockAdapter } from '../mock/aiUsage.mock';
import { aiUsageRealAdapter } from '../real/aiUsage.real';

import ENV from '@/lib/env';

const adapter = ENV.API.isMock ? aiUsageMockAdapter : aiUsageRealAdapter;

export const aiUsageRepository = {
  async getAiUsageSummary(params?: GetAiUsageSummaryParams): Promise<AiUsageSummary> {
    return adapter.getAiUsageSummary(params);
  },
};
