import type { WizardStepState, WizardPreview, SaveWizardStepPayload } from '@/shared/types/wizard';
import type { ID } from '@/shared/types/common';
import { wizardMockAdapter } from '../mock/wizard.mock';
import { wizardRealAdapter } from '../real/wizard.real';

import ENV from '@/lib/env';

const adapter = ENV.API.isMock ? wizardMockAdapter : wizardRealAdapter;

export const wizardRepository = {
  async getStep(campaignId: ID, stepKey: string): Promise<WizardStepState> {
    return adapter.getStep(campaignId, stepKey);
  },

  async saveStep(campaignId: ID, stepKey: string, payload: SaveWizardStepPayload): Promise<WizardStepState> {
    return adapter.saveStep(campaignId, stepKey, payload);
  },

  async getPreview(campaignId: ID): Promise<WizardPreview> {
    return adapter.getPreview(campaignId);
  },

  async commitAndGenerate(campaignId: ID): Promise<{ strategyRunId: ID }> {
    return adapter.commitAndGenerate(campaignId);
  },
};
