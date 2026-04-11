import type { WizardStepState, WizardPreview, SaveWizardStepPayload } from '@/shared/types/wizard';
import type { ID } from '@/shared/types/common';
import { wizardMockAdapter } from '../mock/wizard.mock';
import { wizardRealAdapter } from '../real/wizard.real';

import ENV from '@/lib/env';

// Route to mock or real adapter based on DATA_SOURCE environment variable
const adapter = ENV.API.isMock ? wizardMockAdapter : wizardRealAdapter;

// Log adapter selection in development
if (ENV.features.apiLogging && typeof window !== 'undefined') {
  console.log('[Wizard Repository] Using adapter:', ENV.API.dataSource);
}

export const wizardRepository = {
  async listSteps(campaignId: ID): Promise<WizardStepState[]> {
    return adapter.listSteps(campaignId);
  },

  async getWizardState(campaignId: ID): Promise<any> {
    return adapter.getWizardState(campaignId);
  },

  async getStep(campaignId: ID, stepKey: string): Promise<WizardStepState> {
    return adapter.getStep(campaignId, stepKey);
  },

  async saveStep(campaignId: ID, stepKey: string, payload: SaveWizardStepPayload): Promise<WizardStepState> {
    return adapter.saveStep(campaignId, stepKey, payload);
  },

  async getPreview(campaignId: ID): Promise<WizardPreview> {
    return adapter.getPreview(campaignId);
  },

  async commitAndGenerate(
    campaignId: ID,
    payload: {
      version?: number;
      confirmFocus: boolean;
      confirmBusiness: boolean;
      confirmAudience: boolean;
      confirmGoals: boolean;
      readyToGenerate: boolean;
      dataConsentOptIn: boolean;
    }
  ): Promise<any> {
    return adapter.commitAndGenerate(campaignId, payload);
  },
};
