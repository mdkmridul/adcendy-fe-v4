import type {
  SaveWizardStepPayload,
  WizardCommitResponseV2,
  WizardOptionsResponseV2,
  WizardPreview,
  WizardStateResponseV2,
  WizardStepState,
} from '@/shared/types/wizard';
import type { ID } from '@/shared/types/common';
import { setMockCampaignCurrentStep, updateMockCampaignClassification } from './campaigns.mock';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockWizardSteps = new Map<string, Map<string, WizardStepState>>();
const mockCommittedRuns = new Map<string, { pipelineRunId: string | null; status: WizardCommitResponseV2['pipelineStatus'] }>();

const mockWizardOptions: WizardOptionsResponseV2 = {
  wizardVersion: 'v2',
  stepDefinitions: [
    { stepNumber: 1, stepKey: 'step1_strategy_focus_markets', label: 'Focus', helperText: 'Strategy focus and markets', examples: [] },
    { stepNumber: 2, stepKey: 'step2_business_offer', label: 'Business', helperText: 'Business and offer details', examples: [] },
    { stepNumber: 3, stepKey: 'step3_audience_buying_context', label: 'Audience', helperText: 'Audience and buying context', examples: [] },
    { stepNumber: 4, stepKey: 'step4_sales_channels_digital_footprint', label: 'Channels', helperText: 'Sales channels and digital footprint', examples: [] },
    { stepNumber: 5, stepKey: 'step5_goals_budget_marketing_reality', label: 'Goals', helperText: 'Goals and marketing reality', examples: [] },
    { stepNumber: 6, stepKey: 'step6_economics_measurement', label: 'Economics', helperText: 'Economics and measurement', examples: [] },
    { stepNumber: 7, stepKey: 'step7_review_consent_generate', label: 'Review', helperText: 'Review and consent', examples: [] },
  ],
  fieldOptions: {
    marketingTargetType: [
      { value: 'whole_business', label: 'Whole business' },
      { value: 'product_or_service', label: 'Product or service' },
      { value: 'launch', label: 'Launch' },
      { value: 'market_expansion', label: 'Market expansion' },
      { value: 'specific_audience', label: 'Specific audience' },
      { value: 'other', label: 'Other' },
    ],
    sourceType: [
      { value: 'website', label: 'Website' },
      { value: 'manual_only', label: 'Manual only' },
      { value: 'digital_presence_only', label: 'Digital presence only' },
    ],
    marketScope: [
      { value: 'local', label: 'Local' },
      { value: 'regional', label: 'Regional' },
      { value: 'national', label: 'National' },
      { value: 'international', label: 'International' },
      { value: 'global', label: 'Global' },
    ],
    industryCategory: [
      { value: 'service', label: 'Service' },
      { value: 'product', label: 'Product' },
      { value: 'ecommerce', label: 'Ecommerce' },
      { value: 'saas', label: 'SaaS' },
      { value: 'coaching', label: 'Coaching' },
    ],
    audienceModel: [
      { value: 'single_sided', label: 'Single sided' },
      { value: 'b2b2c', label: 'B2B2C' },
      { value: 'marketplace_platform', label: 'Marketplace platform' },
      { value: 'multi_sided', label: 'Multi sided' },
      { value: 'not_sure', label: 'Not sure' },
    ],
    lifecycleStage: [
      { value: 'pre_launch', label: 'Pre-launch' },
      { value: 'launch', label: 'Launch' },
      { value: 'growth', label: 'Growth' },
      { value: 'scaling', label: 'Scaling' },
      { value: 'mature', label: 'Mature' },
    ],
    sensitiveCategoryFlags: [
      { value: 'none', label: 'None' },
      { value: 'not_sure', label: 'Not sure' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'finance', label: 'Finance' },
    ],
    language: [
      { value: 'english', label: 'English' },
      { value: 'hindi', label: 'Hindi' },
      { value: 'regional_other', label: 'Regional other' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'not_sure', label: 'Not sure' },
    ],
    reportLanguage: [
      { value: 'english', label: 'English' },
      { value: 'hindi', label: 'Hindi' },
      { value: 'regional_other', label: 'Regional other' },
    ],
    primaryConversionPath: [
      { value: 'buy_online', label: 'Buy online' },
      { value: 'book_demo', label: 'Book demo' },
      { value: 'book_call', label: 'Book call' },
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'retail_visit', label: 'Retail visit' },
      { value: 'app_signup', label: 'App signup' },
      { value: 'other', label: 'Other' },
    ],
    primaryGoal: [
      { value: 'revenue_growth', label: 'Revenue growth' },
      { value: 'lead_generation', label: 'Lead generation' },
      { value: 'awareness', label: 'Awareness' },
      { value: 'launch_readiness', label: 'Launch readiness' },
      { value: 'retention', label: 'Retention' },
      { value: 'market_expansion', label: 'Market expansion' },
      { value: 'other', label: 'Other' },
    ],
    marketingHandler: [
      { value: 'founder_led', label: 'Founder led' },
      { value: 'internal_marketer', label: 'Internal marketer' },
      { value: 'agency', label: 'Agency' },
      { value: 'in_house_team', label: 'In house team' },
      { value: 'not_sure', label: 'Not sure' },
    ],
    contentCapacity: [
      { value: 'none', label: 'None' },
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'not_sure', label: 'Not sure' },
    ],
    knownCompetitorStatus: [
      { value: 'provided', label: 'Provided' },
      { value: 'none_known', label: 'None known' },
      { value: 'not_sure', label: 'Not sure' },
    ],
    currentMarketingActivityStatus: [
      { value: 'active', label: 'Active' },
      { value: 'paused', label: 'Paused' },
      { value: 'discontinued', label: 'Discontinued' },
    ],
    currentMarketingActivityAssessment: [
      { value: 'clearly_working', label: 'Clearly working' },
      { value: 'unclear', label: 'Unclear' },
      { value: 'not_working', label: 'Not working' },
      { value: 'not_sure', label: 'Not sure' },
    ],
    dataConsentOptIn: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ],
  },
};

function toRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getVersion(campaignId: string) {
  const campaignSteps = mockWizardSteps.get(campaignId);
  if (!campaignSteps || campaignSteps.size === 0) {
    return 0;
  }

  return Array.from(campaignSteps.values()).reduce((maxVersion, step) => {
    return Math.max(maxVersion, step.version ?? 0);
  }, 0);
}

function buildState(campaignId: string): WizardStateResponseV2 {
  const campaignSteps = mockWizardSteps.get(campaignId);
  const step1 = toRecord(campaignSteps?.get('STEP_1')?.data);
  const step2 = toRecord(campaignSteps?.get('STEP_2')?.data);
  const step3 = toRecord(campaignSteps?.get('STEP_3')?.data);
  const step4 = toRecord(campaignSteps?.get('STEP_4')?.data);
  const version = getVersion(campaignId);
  const runState = mockCommittedRuns.get(campaignId);

  const lastCompletedStep =
    (campaignSteps?.get('STEP_4') ? 7 :
      campaignSteps?.get('STEP_3') ? 4 :
      campaignSteps?.get('STEP_2') ? 3 :
      campaignSteps?.get('STEP_1') ? 1 :
      0);

  return {
    campaignId,
    status: runState?.pipelineRunId ? 'committed' : lastCompletedStep > 0 ? 'in_progress' : 'in_progress',
    version,
    lastCompletedStep,
    committedSnapshotId: runState?.pipelineRunId ? `snapshot-${campaignId}` : null,
    updatedAt: new Date().toISOString(),
    steps: {
      step1: Object.keys(step1).length ? step1 : null,
      step2: Object.keys(step2).length ? step2 : null,
      step3: Object.keys(step3).length ? step3 : null,
      step4: Object.keys(step2).length || Object.keys(step4).length
        ? {
            salesChannels: step2.salesChannels ?? [],
            socialHandles: step2.socialHandles ?? [],
            digitalPresenceLinks: step2.digitalPresenceLinks ?? [],
            trustSignals: step4.trustSignals ?? [],
            googleAnalyticsConnected: step4.googleAnalyticsConnected ?? false,
            monthlyWebsiteTraffic: step4.monthlyWebsiteTraffic ?? null,
            emailListSize: step4.emailListSize ?? null,
          }
        : null,
      step5: Object.keys(step4).length
        ? {
            primaryGoal: step4.primaryGoal ?? null,
            monthlyMarketingSpend: step4.monthlyMarketingSpend ?? null,
            paidMediaBudgetRange: step4.monthlyMarketingSpend ?? null,
            marketingHandler: step4.marketingHandler ?? null,
            contentCapacity: 'not_sure',
            constraints: step4.constraints ?? [],
            knownCompetitorStatus: Array.isArray(step4.knownCompetitors) && step4.knownCompetitors.length ? 'provided' : 'not_sure',
            knownCompetitors: step4.knownCompetitors ?? [],
            whatsWorking: step4.whatsWorking ?? null,
            biggestFrustration: step4.biggestFrustration ?? null,
            additionalContext: step4.additionalContext ?? null,
          }
        : null,
      step6: Object.keys(step4).length
        ? {
            monthlyRevenue: step4.monthlyRevenue ?? null,
            monthlyOrderVolume: step4.monthlyOrderVolume ?? null,
            productCost: step4.productCost ?? null,
            avgCustomerRetention: step4.avgCustomerRetention ?? null,
            repeatPurchaseFrequency: step4.repeatPurchaseFrequency ?? null,
          }
        : null,
      step7: {
        confirmFocus: true,
        confirmBusiness: true,
        confirmAudience: true,
        confirmGoals: true,
        confirmEconomics: true,
        readyToGenerate: Boolean(step4.readyToGenerate),
        dataConsentOptIn: step4.dataConsentOptIn === false ? false : true,
      },
    },
  };
}

export const wizardMockAdapter = {
  async getWizardOptions(): Promise<WizardOptionsResponseV2> {
    await delay(80);
    return mockWizardOptions;
  },

  async getWizardState(campaignId: ID): Promise<WizardStateResponseV2> {
    await delay(100);
    return buildState(campaignId);
  },

  async getStep(campaignId: ID, stepKey: string): Promise<WizardStepState> {
    await delay(120);
    const campaignSteps = mockWizardSteps.get(campaignId);
    const step = campaignSteps?.get(stepKey);
    const version = getVersion(campaignId);

    if (step) {
      return {
        ...step,
        version,
      };
    }

    return {
      campaignId,
      stepKey: stepKey as WizardStepState['stepKey'],
      data: {},
      updatedAt: new Date().toISOString(),
      version,
    };
  },

  async saveStep(campaignId: ID, stepKey: string, payload: SaveWizardStepPayload): Promise<WizardStepState> {
    await delay(150);
    if (!mockWizardSteps.has(campaignId)) {
      mockWizardSteps.set(campaignId, new Map());
    }

    const campaignSteps = mockWizardSteps.get(campaignId)!;
    const nextVersion = (payload.version ?? getVersion(campaignId)) + 1;

    const step: WizardStepState = {
      campaignId,
      stepKey: stepKey as WizardStepState['stepKey'],
      data: payload.data,
      updatedAt: new Date().toISOString(),
      version: nextVersion,
    };

    campaignSteps.set(stepKey, step);

    if (stepKey === 'STEP_1') {
      const step1Data = payload.data as Record<string, unknown>;
      updateMockCampaignClassification(campaignId, {
        title: typeof step1Data.title === 'string' ? step1Data.title : undefined,
        marketLocation: typeof step1Data.marketLocation === 'string' ? step1Data.marketLocation : undefined,
        websiteUrl: typeof step1Data.primaryUrl === 'string' ? step1Data.primaryUrl : undefined,
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
    await delay(80);
    const campaignSteps = mockWizardSteps.get(campaignId);
    if (!campaignSteps) {
      return [];
    }
    return Array.from(campaignSteps.values());
  },

  async getPreview(campaignId: ID): Promise<WizardPreview> {
    await delay(120);
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
          marketingTargetType: step1.marketingTargetType || 'whole_business',
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
          productOrService: step2.productOrService || ['CRM software for service-led SMBs'],
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
          trustSignals: step4.trustSignals || ['4.8 star Google rating', 'Client logos on website'],
          monthlyMarketingSpend: step4.monthlyMarketingSpend || 'under_5k',
          primaryGoal: step4.primaryGoal || 'more_customers',
          marketingHandler: step4.marketingHandler || 'self',
          pastMarketing: step4.pastMarketing || null,
          whatsWorking: step4.whatsWorking || 'Organic Instagram content drives most inbound interest.',
          biggestFrustration: step4.biggestFrustration || 'Leads are inconsistent month to month.',
          monthlyRevenue: step4.monthlyRevenue || '25k_1l',
          monthlyOrderVolume: step4.monthlyOrderVolume || '40-80 orders/month',
          productCost: step4.productCost || 'INR 250-450 per unit',
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
    payload: {
      version?: number;
      confirmFocus: boolean;
      confirmBusiness: boolean;
      confirmAudience: boolean;
      confirmGoals: boolean;
      confirmEconomics: boolean;
      readyToGenerate: boolean;
      dataConsentOptIn: boolean;
    },
  ): Promise<WizardCommitResponseV2> {
    await delay(220);
    const generationTriggered = Boolean(payload.readyToGenerate && payload.dataConsentOptIn);
    const pipelineRunId = generationTriggered ? `pipeline-run-${Date.now()}` : null;
    const pipelineStatus = generationTriggered ? 'RUNNING' : null;

    mockCommittedRuns.set(campaignId, {
      pipelineRunId,
      status: pipelineStatus,
    });

    const wizardState = buildState(campaignId);

    return {
      pipelineRunId,
      pipelineStatus,
      normalizationRecordId: `normalization-${Date.now()}`,
      wizardSnapshotId: `wizard-snapshot-${Date.now()}`,
      reviewerTasks: [],
      wizardState,
      commitAccepted: true,
      dataConsentOptIn: payload.dataConsentOptIn,
      readyToGenerate: payload.readyToGenerate,
      blockedByDataConsent: payload.readyToGenerate && !payload.dataConsentOptIn,
      generationTriggered,
      normalizedContracts: {},
      taxonomy: {
        values: {
          sales_motion: 'unknown',
          customer_type: 'unknown',
          demand_capture_mode: 'unknown',
          purchase_consideration: 'unknown',
          market_geography: 'unknown',
          product_type: 'unknown',
          distribution_model: 'unknown',
          lifecycle_stage: 'unknown',
          industry_category: 'unknown',
        },
        confidence_score: 0,
        low_confidence_dimensions: [],
        evidence: {},
      },
      contextSufficiency: {
        missing_fields: [],
        sufficient: true,
      },
      validationWarnings: [],
    };
  },

  async listReviewerTasks(_pipelineRunId: ID, _status = 'pending_review'): Promise<Array<Record<string, unknown>>> {
    await delay(60);
    return [];
  },

  async respondReviewerTask(taskId: ID, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    await delay(80);
    return {
      id: taskId,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
  },

  async getPipelineRunOutput(runId: ID): Promise<Record<string, unknown>> {
    await delay(100);
    return {
      runId,
      assembled: false,
      output: null,
    };
  },

  async assemblePipelineRunOutput(runId: ID, payload: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    await delay(130);
    return {
      runId,
      assembled: true,
      ...payload,
    };
  },
};
