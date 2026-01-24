import { http } from '../index';
import type { StrategyRun, StrategyVersion, SubmitStrategyFeedbackPayload } from '@/shared/types/strategy';
import type { ID } from '@/shared/types/common';

export const strategyRealAdapter = {
  async getRun(id: ID): Promise<StrategyRun> {
    return http<StrategyRun>(`/strategy-runs/${id}`);
  },

  async listVersions(campaignId: ID): Promise<StrategyVersion[]> {
    return http<StrategyVersion[]>(`/campaigns/${campaignId}/strategy/versions`);
  },

  async getLatest(campaignId: ID): Promise<StrategyVersion> {
    return http<StrategyVersion>(`/campaigns/${campaignId}/strategy/latest`);
  },

  async submitFeedback(strategyVersionId: ID, payload: SubmitStrategyFeedbackPayload): Promise<void> {
    await http(`/strategy-versions/${strategyVersionId}/feedback`, {
      method: 'POST',
      body: payload,
    });
  },
};
