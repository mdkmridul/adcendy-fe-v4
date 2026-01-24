import type { StrategyRun, StrategyVersion, SubmitStrategyFeedbackPayload } from '@/shared/types/strategy';
import type { ID } from '@/shared/types/common';
import { strategyMockAdapter } from '../mock/strategy.mock';
import { strategyRealAdapter } from '../real/strategy.real';

import ENV from '@/lib/env';

const adapter = ENV.API.isMock ? strategyMockAdapter : strategyRealAdapter;

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
