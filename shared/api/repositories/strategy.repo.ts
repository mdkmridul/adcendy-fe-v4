import type { StrategyRun, StrategyVersion, SubmitStrategyFeedbackPayload } from '@/shared/types/strategy';
import type { ID } from '@/shared/types/common';
import { strategyMockAdapter } from '../mock/strategy.mock';
import { strategyRealAdapter } from '../real/strategy.real';

import ENV from '@/lib/env';

// Route to mock or real adapter based on DATA_SOURCE environment variable
const adapter = ENV.API.isMock ? strategyMockAdapter : strategyRealAdapter;

// Log adapter selection in development
if (ENV.features.apiLogging && typeof window !== 'undefined') {
  console.log('[Strategy Repository] Using adapter:', ENV.API.dataSource);
}

export const strategyRepository = {
  async startRun(campaignId: ID): Promise<{ strategyRunId: ID }> {
    return adapter.startRun(campaignId);
  },

  async getRun(id: ID): Promise<StrategyRun> {
    return adapter.getRun(id);
  },

  async listVersions(campaignId: ID): Promise<StrategyVersion[]> {
    return adapter.listVersions(campaignId);
  },

  async getLatest(campaignId: ID): Promise<StrategyVersion> {
    return adapter.getLatest(campaignId);
  },

  async getVersion(strategyVersionId: ID): Promise<StrategyVersion> {
    return adapter.getVersion(strategyVersionId);
  },

  async submitFeedback(strategyVersionId: ID, payload: SubmitStrategyFeedbackPayload): Promise<void> {
    return adapter.submitFeedback(strategyVersionId, payload);
  },
};
