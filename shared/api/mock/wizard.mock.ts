import type { WizardStepState, WizardPreview, SaveWizardStepPayload } from '@/shared/types/wizard';
import type { ID } from '@/shared/types/common';
import { setMockCampaignCurrentStep, updateMockCampaignClassification } from './campaigns.mock';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const mockWizardSteps = new Map<string, Map<string, WizardStepState>>();

export const wizardMockAdapter = {
  async getWizardState(campaignId: ID) {
    await delay(120);

    const campaignSteps = mockWizardSteps.get(campaignId);
    const step1 = campaignSteps?.get('STEP_1')?.data ?? {};
    const step2 = campaignSteps?.get('STEP_2')?.data ?? {};
    const step3 = campaignSteps?.get('STEP_3')?.data ?? {};
    const step4 = campaignSteps?.get('STEP_4')?.data ?? {};
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
          step4Json: step4,
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
      const step1Data = payload.data as Record<string, unknown>;
      updateMockCampaignClassification(campaignId, {
        title: step1Data.title as string | undefined,
        marketLocation: step1Data.marketLocation as string | undefined,
        websiteUrl: (step1Data.primaryUrl as string | null | undefined) ?? undefined,
      });
    }

    const nextStep =
      stepKey === 'STEP_1' ? 2 :
      stepKey === 'STEP_2' ? 3 :
      stepKey === 'STEP_3' ? 4 :
      stepKey === 'STEP_4' ? 5 :
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
    const step1 = (campaignSteps?.get('STEP_1')?.data ?? {}) as Record<string, any>;
    const step2 = (campaignSteps?.get('STEP_2')?.data ?? {}) as Record<string, any>;
    const step3 = (campaignSteps?.get('STEP_3')?.data ?? {}) as Record<string, any>;
    const step4 = (campaignSteps?.get('STEP_4')?.data ?? {}) as Record<string, any>;

    return {
      campaign: {
        id: campaignId,
        title: step1.title || 'Sample Campaign',
        status: 'DRAFT',
        websiteUrl: step1.primaryUrl || 'https://example.com',
      },
      steps: {
        step1: {
          title: step1.title || 'Sample Campaign',
          marketingTargetType: step1.marketingTargetType || 'single_product',
          focusName: step1.focusName || 'CRM software for service-led SMBs',
          sourceType: step1.sourceType || 'website',
          primaryUrl: step1.primaryUrl || 'https://example.com',
          marketLocation: step1.marketLocation || 'Bengaluru',
        },
        step2: {
          businessType: step2.businessType || 'SAAS',
          businessModel: step2.businessModel || 'B2B',
          marketScope: step2.marketScope || 'NATIONAL',
          businessDescription: step2.businessDescription || 'A growing business focused on practical outcomes for Indian customers.',
          productCategory: step2.productCategory || 'Software',
          productOrService: step2.productOrService || 'CRM software for service-led SMBs',
          offerSummary: step2.offerSummary || 'Simple CRM built for service-led teams that need fast setup.',
          priceRange: step2.priceRange || 'INR 2,500/month',
          differentiators: step2.differentiators || ['Fast onboarding', 'Made for small teams'],
          salesChannels: step2.salesChannels || [
            { channel: 'own_website', rank: 1, customName: null },
            { channel: 'instagram', rank: 2, customName: null },
          ],
          socialHandles: step2.socialHandles || [{ platform: 'instagram', handle: '@adcendy' }],
          digitalPresenceLinks: step2.digitalPresenceLinks || [
            { type: 'linkedin', url: 'https://linkedin.com/company/adcendy', label: 'Company page' },
          ],
        },
        step3: {
          targetPersona: step3.targetPersona || 'Small business owners who need simple tools and fast support.',
          targetAudience: step3.targetAudience || 'Indian service SMBs with 2 to 20 person teams.',
          language: step3.language || 'English, Hindi',
          painPoints: step3.painPoints || ['Low follow-up consistency', 'Limited time for marketing'],
          desiredOutcome: step3.desiredOutcome || 'Generate a confident growth strategy for the next 90 days.',
        },
        step4: {
          constraints: step4.constraints || ['Lean in-house marketing bandwidth'],
          monthlyMarketingSpend: step4.monthlyMarketingSpend || 'under_5k',
          primaryGoal: step4.primaryGoal || 'more_customers',
          marketingHandler: step4.marketingHandler || 'self',
          pastMarketing: step4.pastMarketing || null,
          whatsWorking: step4.whatsWorking || 'Organic Instagram content drives most inbound interest.',
          biggestFrustration: step4.biggestFrustration || 'Leads are inconsistent month to month.',
          monthlyRevenue: step4.monthlyRevenue || '25k_1l',
          monthlyOrderVolume: step4.monthlyOrderVolume || 40,
          productCost: step4.productCost || 450,
          avgCustomerRetention: step4.avgCustomerRetention || 'some_repeat',
          repeatPurchaseFrequency: step4.repeatPurchaseFrequency || 'every_few_months',
          googleAnalyticsConnected: step4.googleAnalyticsConnected ?? false,
          monthlyWebsiteTraffic: step4.monthlyWebsiteTraffic || '500_2000',
          emailListSize: step4.emailListSize || 'under_500',
          knownCompetitors: step4.knownCompetitors || ['Zoho', 'LeadSquared'],
          additionalContext: step4.additionalContext || 'Strong referrals offline, but weak online discovery.',
        },
      },
      derived: {
        estimatedCac: 780,
        estimatedMarginPerUnit: 1350,
        estimatedCltv: 5400,
        cacCltvRatio: '1:6.9',
        budgetCategory: 'starter',
        executionCapacity: 'lean but actionable',
        primaryChannelDependency: 'highly',
      },
    };
  },

  async commitAndGenerate(
    campaignId: ID,
    _payload?: {
      version?: number;
      confirmFocus?: boolean;
      confirmBusiness?: boolean;
      confirmAudience?: boolean;
      confirmGoals?: boolean;
      readyToGenerate?: boolean;
      dataConsentOptIn?: boolean;
    },
  ): Promise<{ strategyRunId: ID }> {
    await delay(300);
    return {
      strategyRunId: `strategy-run-${Date.now()}`,
    };
  },
};
