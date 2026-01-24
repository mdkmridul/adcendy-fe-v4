import type { WizardStepState, WizardPreview, SaveWizardStepPayload } from '@/shared/types/wizard';
import type { ID } from '@/shared/types/common';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock in-memory wizard steps
const mockWizardSteps = new Map<string, Map<string, WizardStepState>>();

export const wizardMockAdapter = {
  async getStep(campaignId: ID, stepKey: string): Promise<WizardStepState> {
    await delay(150);
    const campaignSteps = mockWizardSteps.get(campaignId);
    const step = campaignSteps?.get(stepKey);
    if (!step) {
      return {
        campaignId,
        stepKey: stepKey as any,
        data: {},
        updatedAt: new Date().toISOString(),
      };
    }
    return step;
  },

  async saveStep(campaignId: ID, stepKey: string, payload: SaveWizardStepPayload): Promise<WizardStepState> {
    await delay(200);
    if (!mockWizardSteps.has(campaignId)) {
      mockWizardSteps.set(campaignId, new Map());
    }
    const step: WizardStepState = {
      campaignId,
      stepKey: stepKey as any,
      data: payload.data,
      updatedAt: new Date().toISOString(),
    };
    mockWizardSteps.get(campaignId)!.set(stepKey, step);
    return step;
  },

  async listSteps(campaignId: ID): Promise<WizardStepState[]> {
    await delay(100);
    const campaignSteps = mockWizardSteps.get(campaignId);
    if (!campaignSteps) {
      return [];
    }
    return Array.from(campaignSteps.values());
  },

  async getPreview(campaignId: ID): Promise<WizardPreview> {
    await delay(200);
    const campaignSteps = mockWizardSteps.get(campaignId);
    return {
      campaignId,
      summary: {
        city: campaignSteps?.get('STEP_1')?.data?.city || 'San Francisco',
        niche: campaignSteps?.get('STEP_1')?.data?.niche || 'B2B SaaS',
        offer: campaignSteps?.get('STEP_2')?.data?.offerSummary || 'Market Intelligence Platform',
        audience: campaignSteps?.get('STEP_3')?.data?.customerPersona || 'Enterprise buyers',
        budget: campaignSteps?.get('STEP_1')?.data?.budgetMonthly || 50000,
      },
      signals: {
        searchVolume: 8500,
        competitionLevel: 'HIGH',
        trends: ['market research', 'competitive intelligence', 'AI analytics'],
      },
    };
  },

  async commitAndGenerate(campaignId: ID): Promise<{ strategyRunId: ID }> {
    await delay(300);
    return {
      strategyRunId: `strategy-run-${Date.now()}`,
    };
  },
};
