import { http } from '../index';
import type { WizardStepState, WizardPreview, SaveWizardStepPayload } from '@/shared/types/wizard';
import type { ID } from '@/shared/types/common';

export const wizardRealAdapter = {
  async getStep(campaignId: ID, stepKey: string): Promise<WizardStepState> {
    return http<WizardStepState>(`/campaigns/${campaignId}/wizard/${stepKey}`);
  },

  async saveStep(campaignId: ID, stepKey: string, payload: SaveWizardStepPayload): Promise<WizardStepState> {
    return http<WizardStepState>(`/campaigns/${campaignId}/wizard/${stepKey}`, {
      method: 'POST',
      body: payload,
    });
  },

  async getPreview(campaignId: ID): Promise<WizardPreview> {
    return http<WizardPreview>(`/campaigns/${campaignId}/wizard/preview`);
  },

  async commitAndGenerate(campaignId: ID): Promise<{ strategyRunId: ID }> {
    return http<{ strategyRunId: ID }>(`/campaigns/${campaignId}/wizard/commit`, {
      method: 'POST',
    });
  },
};
