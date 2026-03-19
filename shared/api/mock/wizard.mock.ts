import type { WizardStepState, WizardPreview, SaveWizardStepPayload } from '@/shared/types/wizard';
import type { ID } from '@/shared/types/common';
import { setMockCampaignCurrentStep, updateMockCampaignClassification } from './campaigns.mock';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock in-memory wizard steps
const mockWizardSteps = new Map<string, Map<string, WizardStepState>>();

export const wizardMockAdapter = {
  async getWizardState(campaignId: ID) {
    await delay(120);

    const campaignSteps = mockWizardSteps.get(campaignId);
    const step1 = campaignSteps?.get('STEP_1')?.data ?? {};
    const step2 = campaignSteps?.get('STEP_2')?.data ?? {};
    const step3 = campaignSteps?.get('STEP_3')?.data ?? {};
    const lastCompletedStep = campaignSteps ? campaignSteps.size : 0;

    return {
      draft: {
        campaignId,
        status: lastCompletedStep >= 3 ? 'READY_TO_GENERATE' : 'IN_PROGRESS',
        lastCompletedStep,
        version: 1,
        steps: {
          step1Json: step1,
          step2Json: step2,
          step3Json: step3,
        },
      },
    };
  },

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
        version: 1,
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
      version: payload.version ?? 1,
    };
    mockWizardSteps.get(campaignId)!.set(stepKey, step);

    if (stepKey === 'STEP_1') {
      updateMockCampaignClassification(campaignId, {
        title: payload.data.title,
        marketLocation: payload.data.marketLocation,
        businessType: payload.data.businessType,
        businessModel: payload.data.businessModel,
        marketScope: payload.data.marketScope,
        websiteUrl: payload.data.websiteUrl,
      });
    }

    const nextStep =
      stepKey === 'STEP_1' ? 2 :
      stepKey === 'STEP_2' ? 3 :
      stepKey === 'STEP_3' ? 4 :
      1;
    setMockCampaignCurrentStep(campaignId, nextStep);

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
    const step1 = campaignSteps?.get('STEP_1')?.data ?? {};
    const step2 = campaignSteps?.get('STEP_2')?.data ?? {};
    const step3 = campaignSteps?.get('STEP_3')?.data ?? {};

    return {
      campaign: {
        id: campaignId,
        title: step1.title || 'Sample Campaign',
        status: 'DRAFT',
        websiteUrl: step1.websiteUrl || 'https://example.com',
      },
      steps: {
        step1: {
          title: step1.title || 'Sample Campaign',
          marketLocation: step1.marketLocation || 'San Francisco',
          businessType: step1.businessType || 'SAAS',
          businessModel: step1.businessModel || 'B2B',
          marketScope: step1.marketScope || 'NATIONAL',
          websiteUrl: step1.websiteUrl || 'https://example.com',
        },
        step2: {
          offerSummary: step2.offerSummary || 'Market intelligence platform for growth teams',
          priceRange: step2.priceRange || '$2,000-$5,000 / month',
          differentiators: step2.differentiators || ['Fast setup', 'Clear strategic outputs'],
          constraints: step2.constraints || ['Limited internal analytics support'],
        },
        step3: {
          targetPersona: step3.targetPersona || 'Growth leaders at mid-market SaaS companies',
          language: step3.language || 'English',
          painPoints: step3.painPoints || ['Unclear positioning', 'Weak conversion from existing traffic'],
          desiredOutcome: step3.desiredOutcome || 'Generate a confident acquisition strategy',
        },
      },
      derived: null,
    };
  },

  async commitAndGenerate(
    campaignId: ID,
    _payload?: {
      version?: number;
      confirmBusinessInfo?: boolean;
      confirmOffer?: boolean;
      confirmAudience?: boolean;
      readyToGenerate?: boolean;
      dataConsentOptIn?: boolean;
    }
  ): Promise<{ strategyRunId: ID }> {
    await delay(300);
    return {
      strategyRunId: `strategy-run-${Date.now()}`,
    };
  },
};
