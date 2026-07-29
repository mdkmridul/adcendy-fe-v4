import { http } from '../index';
import { ApiError } from '../errors';
import type { ApiResponse } from '../types';
import type { CampaignStatus } from '@/shared/types/campaign';
import type {
  SaveWizardStepPayload,
  WizardCommitResponseV2,
  WizardOptionsResponseV2,
  WizardPreview,
  WizardStateResponseV2,
  WizardStepState,
} from '@/shared/types/wizard';

type LegacyStepKey = WizardStepState['stepKey'];

type Step7CommitPayload = {
  version?: number;
  confirmFocus: boolean;
  confirmBusiness: boolean;
  confirmAudience: boolean;
  confirmGoals: boolean;
  confirmEconomics: boolean;
  readyToGenerate: boolean;
  dataConsentOptIn: boolean;
};

const LEGACY_STEP_KEYS: LegacyStepKey[] = ['STEP_1', 'STEP_2', 'STEP_3', 'STEP_4', 'STEP_5', 'STEP_6', 'STEP_7'];

const MARKETING_TARGET_TO_V2: Record<string, string> = {
  single_product: 'product_or_service',
  brand_store: 'whole_business',
  category_collection: 'product_or_service',
};

const MARKETING_TARGET_FROM_V2: Record<string, string> = {
  whole_business: 'whole_business',
  product_or_service: 'product_or_service',
  launch: 'launch',
  market_expansion: 'market_expansion',
  specific_audience: 'specific_audience',
  other: 'other',
  single_product: 'product_or_service',
  brand_store: 'whole_business',
  category_collection: 'product_or_service',
};

const SOURCE_TYPE_TO_V2: Record<string, string> = {
  website: 'website',
  manual_only: 'manual_only',
  marketplace: 'digital_presence_only',
  social: 'digital_presence_only',
  gmb: 'digital_presence_only',
  digital_presence_only: 'digital_presence_only',
};

const SOURCE_TYPE_FROM_V2: Record<string, string> = {
  website: 'website',
  manual_only: 'manual_only',
  digital_presence_only: 'digital_presence_only',
  marketplace: 'digital_presence_only',
  social: 'digital_presence_only',
  gmb: 'digital_presence_only',
};

const MARKET_SCOPE_TO_V2: Record<string, string> = {
  LOCAL: 'local',
  REGIONAL: 'regional',
  NATIONAL: 'national',
  GLOBAL: 'global',
  local: 'local',
  regional: 'regional',
  national: 'national',
  international: 'international',
  global: 'global',
};

const MARKET_SCOPE_FROM_V2: Record<string, string> = {
  local: 'LOCAL',
  regional: 'REGIONAL',
  national: 'NATIONAL',
  international: 'GLOBAL',
  global: 'GLOBAL',
};

const PRIMARY_GOAL_TO_V2: Record<string, string> = {
  more_sales: 'revenue_growth',
  more_customers: 'lead_generation',
  new_market: 'market_expansion',
  launch_product: 'launch_readiness',
  reduce_channel_dependence: 'retention',
  brand_awareness: 'awareness',
  beat_competitor: 'market_expansion',
};

const PRIMARY_GOAL_FROM_V2: Record<string, string> = {
  revenue_growth: 'more_sales',
  lead_generation: 'more_customers',
  awareness: 'brand_awareness',
  launch_readiness: 'launch_product',
  retention: 'reduce_channel_dependence',
  market_expansion: 'new_market',
  other: 'beat_competitor',
};

const MARKETING_HANDLER_TO_V2: Record<string, string> = {
  self: 'founder_led',
  team_member: 'internal_marketer',
  freelancer_agency: 'agency',
  nobody: 'not_sure',
  founder_led: 'founder_led',
  internal_marketer: 'internal_marketer',
  agency: 'agency',
  in_house_team: 'in_house_team',
  not_sure: 'not_sure',
};

const MARKETING_HANDLER_FROM_V2: Record<string, string> = {
  founder_led: 'self',
  internal_marketer: 'team_member',
  agency: 'freelancer_agency',
  in_house_team: 'team_member',
  not_sure: 'nobody',
};

const CAMPAIGN_STATUS_BY_WIZARD_STATUS: Record<WizardStateResponseV2['status'], CampaignStatus> = {
  in_progress: 'DRAFT',
  pending_review: 'IN_REVIEW',
  committed: 'SUBMITTED_FOR_REVIEW',
  committed_blocked_data_consent: 'DRAFT',
};

const MARKETING_TARGET_VALUES_V2 = [
  'whole_business',
  'product_or_service',
  'launch',
  'market_expansion',
  'specific_audience',
  'other',
] as const;

const SOURCE_TYPE_VALUES_V2 = [
  'website',
  'manual_only',
  'digital_presence_only',
] as const;

const MARKET_SCOPE_VALUES_V2 = [
  'local',
  'regional',
  'national',
  'international',
  'global',
] as const;

const AUDIENCE_MODEL_VALUES_V2 = [
  'single_sided',
  'b2b2c',
  'marketplace_platform',
  'multi_sided',
  'not_sure',
] as const;

const LIFECYCLE_STAGE_VALUES_V2 = [
  'pre_launch',
  'launch',
  'growth',
  'scaling',
  'mature',
] as const;

const REPORT_LANGUAGE_VALUES_V2 = [
  'english',
  'hindi',
  'regional_other',
] as const;

const PRIMARY_CONVERSION_PATH_VALUES_V2 = [
  'buy_online',
  'book_demo',
  'book_call',
  'whatsapp',
  'retail_visit',
  'app_signup',
  'other',
] as const;

const PRIMARY_GOAL_VALUES_V2 = [
  'revenue_growth',
  'lead_generation',
  'awareness',
  'launch_readiness',
  'retention',
  'market_expansion',
  'other',
] as const;

const MARKETING_HANDLER_VALUES_V2 = [
  'founder_led',
  'internal_marketer',
  'agency',
  'in_house_team',
  'not_sure',
] as const;

const CONTENT_CAPACITY_VALUES_V2 = [
  'none',
  'low',
  'medium',
  'high',
  'not_sure',
] as const;

const KNOWN_COMPETITOR_STATUS_VALUES_V2 = [
  'provided',
  'none_known',
  'not_sure',
] as const;

const CURRENT_MARKETING_ACTIVITY_STATUS_VALUES_V2 = [
  'active',
  'paused',
  'discontinued',
] as const;

const CURRENT_MARKETING_ACTIVITY_ASSESSMENT_VALUES_V2 = [
  'clearly_working',
  'unclear',
  'not_working',
  'not_sure',
] as const;

function unwrapResponseData<T>(response: ApiResponse<T> | T): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

function ensureObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function hasOwnData(value: unknown) {
  return Object.keys(ensureObject(value)).length > 0;
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeNullableString(value: unknown) {
  const normalized = normalizeString(value);
  return normalized.length > 0 ? normalized : null;
}

function normalizeBoolean(value: unknown, defaultValue = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true;
    }

    if (value.toLowerCase() === 'false') {
      return false;
    }
  }

  return defaultValue;
}

function normalizeGoogleAnalyticsConnected(value: unknown): boolean | 'unknown' | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }

    if (normalized === 'unknown' || normalized === 'not_sure') {
      return 'unknown';
    }
  }

  return undefined;
}

function normalizeNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function normalizeStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeString(item))
      .filter((item) => item.length > 0);
  }

  const one = normalizeString(value);
  return one ? [one] : [];
}

function normalizeStringOrList(value: unknown) {
  if (Array.isArray(value)) {
    const normalized = normalizeStringList(value);
    return normalized.length ? normalized : undefined;
  }

  const one = normalizeNullableString(value);
  return one ?? undefined;
}

function normalizeNumericString(value: unknown) {
  const numeric = normalizeNumber(value);
  if (numeric !== undefined) {
    return `${numeric}`;
  }

  const normalized = normalizeNullableString(value);
  return normalized ?? undefined;
}

function isProductsServicesKeyRejected(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 400) {
    return false;
  }

  const detailString = JSON.stringify(error.details ?? '').toLowerCase();
  const messageString = String(error.message ?? '').toLowerCase();
  return (
    detailString.includes('productsservices') ||
    messageString.includes('productsservices')
  );
}

function normalizeCurrentMarketingActivity(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ensureObject(item))
    .map((item) => {
      const status = pickAllowedValue(
        item.status,
        CURRENT_MARKETING_ACTIVITY_STATUS_VALUES_V2,
      );
      const workingAssessment = pickAllowedValue(
        item.workingAssessment,
        CURRENT_MARKETING_ACTIVITY_ASSESSMENT_VALUES_V2,
      );

      return stripUndefined({
        channel: normalizeNullableString(item.channel),
        status,
        workingAssessment: workingAssessment ?? null,
        evidence: normalizeNullableString(item.evidence),
        monthlySpend: normalizeNullableString(item.monthlySpend),
        timeRunning: normalizeNullableString(item.timeRunning),
        reasonStopped: normalizeNullableString(item.reasonStopped),
      });
    })
    .filter((item) => normalizeString(item.channel) && normalizeString(item.status));
}

function normalizeSocialHandles(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ensureObject(item))
    .map((item) => ({
      platform: normalizeString(item.platform),
      handle: normalizeString(item.handle),
    }))
    .filter((item) => item.platform && item.handle);
}

function normalizeDigitalPresenceLinks(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ensureObject(item))
    .map((item) => ({
      type: normalizeString(item.type),
      url: normalizeString(item.url),
      label: normalizeNullableString(item.label),
    }))
    .filter((item) => item.type && item.url);
}

function normalizeSalesChannels(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ensureObject(item))
    .map((item) => ({
      channel: normalizeString(item.channel),
      rank: normalizeNumber(item.rank) ?? 0,
      customName: normalizeNullableString(item.customName),
    }))
    .filter((item) => item.channel && item.rank > 0)
    .sort((left, right) => left.rank - right.rank);
}

function mapWithFallback(value: unknown, mapping: Record<string, string>, fallback?: string) {
  const key = normalizeString(value);
  if (!key) {
    return fallback;
  }

  return mapping[key] ?? key;
}

function pickAllowedValue(
  value: unknown,
  allowedValues: readonly string[],
  fallback?: string,
) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return fallback;
  }

  return allowedValues.includes(normalized) ? normalized : fallback;
}

function stripUndefined(payload: Record<string, unknown>) {
  const cleaned: Record<string, unknown> = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  });

  return cleaned;
}

function buildPrimaryConversionPath(salesChannels: Array<{ channel: string; rank: number }>) {
  const primaryChannel = salesChannels[0]?.channel;

  if (primaryChannel === 'whatsapp') {
    return 'whatsapp';
  }

  if (primaryChannel === 'retail_store') {
    return 'retail_visit';
  }

  if (primaryChannel === 'direct_sales') {
    return 'book_call';
  }

  if (primaryChannel === 'app') {
    return 'app_signup';
  }

  if (primaryChannel) {
    return 'buy_online';
  }

  return 'other';
}

function extractKnownCompetitors(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return normalizeString(item);
      }

      const record = ensureObject(item);
      return (
        normalizeString(record.name) ||
        normalizeString(record.domain) ||
        normalizeString(record.market)
      );
    })
    .filter((item) => item.length > 0);
}

function normalizeLanguage(value: unknown) {
  const normalized = normalizeString(value).toLowerCase();

  if (!normalized) {
    return 'not_sure';
  }

  if (normalized === 'english' || normalized === 'hindi' || normalized === 'regional_other' || normalized === 'mixed' || normalized === 'not_sure') {
    return normalized;
  }

  const hasEnglish = normalized.includes('english');
  const hasHindi = normalized.includes('hindi');

  if (hasEnglish && hasHindi) {
    return 'mixed';
  }

  if (hasHindi) {
    return 'hindi';
  }

  if (hasEnglish) {
    return 'english';
  }

  if (normalized.includes('regional')) {
    return 'regional_other';
  }

  return 'not_sure';
}

function inferReportLanguage(language: string) {
  if (language === 'english' || language === 'hindi' || language === 'regional_other') {
    return language;
  }

  return null;
}

async function patchWizardStep(
  campaignId: string,
  stepNumber: number,
  version: number | undefined,
  payload: Record<string, unknown>,
) {
  const cleanedPayload = stripUndefined(payload);
  if (!Object.keys(cleanedPayload).length) {
    return null;
  }

  const response = await http<ApiResponse<WizardStateResponseV2> | WizardStateResponseV2>(
    `/api/v2/wizard/steps/${stepNumber}`,
    {
      method: 'PATCH',
      body: {
        campaignId,
        version: version ?? 0,
        payload: cleanedPayload,
      },
    },
  );

  return unwrapResponseData(response);
}

function buildLegacyStepDataFromState(
  state: WizardStateResponseV2,
  stepKey: LegacyStepKey,
): Record<string, unknown> {
  const step1 = ensureObject(state.steps.step1);
  const step2 = ensureObject(state.steps.step2);
  const step3 = ensureObject(state.steps.step3);
  const step4 = ensureObject(state.steps.step4);
  const step5 = ensureObject(state.steps.step5);
  const step6 = ensureObject(state.steps.step6);
  const step7 = ensureObject(state.steps.step7);

  if (stepKey === 'STEP_1') {
    return stripUndefined({
      title: normalizeNullableString(step1.title),
      marketingTargetType: mapWithFallback(step1.marketingTargetType, MARKETING_TARGET_FROM_V2),
      focusName: normalizeNullableString(step1.focusName),
      sourceType: mapWithFallback(step1.sourceType, SOURCE_TYPE_FROM_V2),
      primaryUrl: normalizeNullableString(step1.primaryUrl),
      targetMarkets: normalizeStringList(step1.targetMarkets),
      primaryMarket: normalizeNullableString(step1.primaryMarket),
      marketLocation: normalizeNullableString(step1.marketLocation) ?? normalizeNullableString(step1.primaryMarket),
      marketScope: mapWithFallback(step1.marketScope, MARKET_SCOPE_FROM_V2),
      operationalLocations: normalizeStringList(step1.operationalLocations),
      regionalLanguageExpansionEnabled: normalizeBoolean(step1.regionalLanguageExpansionEnabled),
      regionalLanguages: normalizeStringList(step1.regionalLanguages),
    });
  }

  if (stepKey === 'STEP_2') {
    const normalizedProductsServices = normalizeStringList(
      step2.productsServices ?? step2.productOrService,
    );

    return stripUndefined({
      businessName: normalizeNullableString(step2.businessName),
      industryCategory: normalizeNullableString(step2.industryCategory),
      businessType: normalizeNullableString(step2.businessType),
      businessModel: normalizeNullableString(step2.businessModel),
      marketScope: mapWithFallback(step1.marketScope, MARKET_SCOPE_FROM_V2),
      audienceModel: normalizeNullableString(step2.audienceModel),
      lifecycleStage: normalizeNullableString(step2.lifecycleStage),
      businessDescription: normalizeNullableString(step2.businessDescription),
      productCategory: normalizeNullableString(step2.productCategory),
      productOrService: normalizedProductsServices,
      productsServices: normalizedProductsServices,
      offerSummary: normalizeNullableString(step2.offerSummary),
      priceRange: normalizeNullableString(step2.priceRange),
      differentiators: normalizeStringList(step2.differentiators),
      sensitiveCategoryFlags: normalizeStringList(step2.sensitiveCategoryFlags),
      complianceSensitiveClaims: normalizeStringOrList(step2.complianceSensitiveClaims),
    });
  }

  if (stepKey === 'STEP_3') {
    return stripUndefined({
      primaryTargetSegment: normalizeNullableString(step3.primaryTargetSegment),
      targetPersona: normalizeNullableString(step3.targetPersona),
      targetAudience: normalizeNullableString(step3.targetAudience),
      audienceSegments: normalizeStringList(step3.audienceSegments),
      language: normalizeNullableString(step3.language),
      reportLanguage: normalizeNullableString(step3.reportLanguage),
      painPoints: normalizeStringList(step3.painPoints),
      desiredOutcome: normalizeNullableString(step3.desiredOutcome),
      decisionProcess: normalizeNullableString(step3.decisionProcess),
      buyerRoles: normalizeStringList(step3.buyerRoles),
    });
  }

  if (stepKey === 'STEP_4') {
    return stripUndefined({
      salesChannels: normalizeSalesChannels(step4.salesChannels),
      primaryConversionPath: normalizeNullableString(step4.primaryConversionPath),
      socialHandles: normalizeSocialHandles(step4.socialHandles),
      digitalPresenceLinks: normalizeDigitalPresenceLinks(step4.digitalPresenceLinks),
      trustSignals: normalizeStringList(step4.trustSignals),
      googleAnalyticsConnected: normalizeGoogleAnalyticsConnected(step4.googleAnalyticsConnected),
      monthlyWebsiteTraffic: normalizeNullableString(step4.monthlyWebsiteTraffic),
      emailListSize: normalizeNullableString(step4.emailListSize),
    });
  }

  if (stepKey === 'STEP_5') {
    return stripUndefined({
      constraints: normalizeStringList(step5.constraints),
      monthlyMarketingSpend: normalizeNullableString(step5.monthlyMarketingSpend),
      paidMediaBudgetRange: normalizeNullableString(step5.paidMediaBudgetRange),
      primaryGoal: mapWithFallback(step5.primaryGoal, PRIMARY_GOAL_FROM_V2),
      marketingHandler: mapWithFallback(step5.marketingHandler, MARKETING_HANDLER_FROM_V2),
      contentCapacity: normalizeNullableString(step5.contentCapacity),
      salesCapacity: normalizeNullableString(step5.salesCapacity),
      currentMarketingActivity: Array.isArray(step5.currentMarketingActivity)
        ? step5.currentMarketingActivity
        : undefined,
      pastMarketing: normalizeNullableString(step5.pastMarketing),
      whatsWorking: normalizeNullableString(step5.whatsWorking),
      biggestFrustration: normalizeNullableString(step5.biggestFrustration),
      knownCompetitorStatus: normalizeNullableString(step5.knownCompetitorStatus),
      knownCompetitors: extractKnownCompetitors(step5.knownCompetitors),
      channelsToAvoid: normalizeStringList(step5.channelsToAvoid),
      channelsStronglyPreferred: normalizeStringList(step5.channelsStronglyPreferred),
      executionConstraints: normalizeStringList(step5.executionConstraints),
      additionalContext: normalizeNullableString(step5.additionalContext),
    });
  }

  if (stepKey === 'STEP_6') {
    return stripUndefined({
      averageOrderValue: normalizeNullableString(step6.averageOrderValue),
      averageContractValue: normalizeNullableString(step6.averageContractValue),
      grossMarginPercentage: normalizeNullableString(step6.grossMarginPercentage),
      monthlyRevenue: normalizeNullableString(step6.monthlyRevenue),
      monthlyOrderVolume: normalizeNullableString(step6.monthlyOrderVolume),
      productCost: normalizeNullableString(step6.productCost),
      monthlyOrdersPerSubscriber: normalizeNullableString(step6.monthlyOrdersPerSubscriber),
      monthlyChurnRate: normalizeNullableString(step6.monthlyChurnRate),
      avgCustomerRetention: normalizeNullableString(step6.avgCustomerRetention),
      repeatPurchaseFrequency: normalizeNullableString(step6.repeatPurchaseFrequency),
      salesCycleLength: normalizeNullableString(step6.salesCycleLength),
    });
  }

  return stripUndefined({
    confirmFocus: normalizeBoolean(step7.confirmFocus),
    confirmBusiness: normalizeBoolean(step7.confirmBusiness),
    confirmAudience: normalizeBoolean(step7.confirmAudience),
    confirmGoals: normalizeBoolean(step7.confirmGoals),
    confirmEconomics: normalizeBoolean(step7.confirmEconomics),
    readyToGenerate: normalizeBoolean(step7.readyToGenerate),
    dataConsentOptIn: Object.prototype.hasOwnProperty.call(step7, 'dataConsentOptIn')
      ? normalizeBoolean(step7.dataConsentOptIn, true)
      : undefined,
  });
}

function buildPreviewStep4FromState(state: WizardStateResponseV2) {
  const step4 = ensureObject(state.steps.step4);
  const step5 = ensureObject(state.steps.step5);
  const step6 = ensureObject(state.steps.step6);
  const step7 = ensureObject(state.steps.step7);

  return stripUndefined({
    constraints: normalizeStringList(step5.constraints),
    monthlyMarketingSpend: normalizeNullableString(step5.monthlyMarketingSpend),
    paidMediaBudgetRange: normalizeNullableString(step5.paidMediaBudgetRange),
    primaryGoal: mapWithFallback(step5.primaryGoal, PRIMARY_GOAL_FROM_V2),
    marketingHandler: mapWithFallback(step5.marketingHandler, MARKETING_HANDLER_FROM_V2),
    contentCapacity: normalizeNullableString(step5.contentCapacity),
    salesCapacity: normalizeNullableString(step5.salesCapacity),
    currentMarketingActivity: Array.isArray(step5.currentMarketingActivity)
      ? step5.currentMarketingActivity
      : undefined,
    averageOrderValue: normalizeNullableString(step6.averageOrderValue),
    averageContractValue: normalizeNullableString(step6.averageContractValue),
    grossMarginPercentage: normalizeNullableString(step6.grossMarginPercentage),
    pastMarketing: normalizeNullableString(step5.pastMarketing),
    whatsWorking: normalizeNullableString(step5.whatsWorking),
    biggestFrustration: normalizeNullableString(step5.biggestFrustration),
    monthlyRevenue: normalizeNullableString(step6.monthlyRevenue),
    monthlyOrderVolume: normalizeNullableString(step6.monthlyOrderVolume),
    productCost: normalizeNullableString(step6.productCost),
    monthlyOrdersPerSubscriber: normalizeNullableString(step6.monthlyOrdersPerSubscriber),
    monthlyChurnRate: normalizeNullableString(step6.monthlyChurnRate),
    avgCustomerRetention: normalizeNullableString(step6.avgCustomerRetention),
    repeatPurchaseFrequency: normalizeNullableString(step6.repeatPurchaseFrequency),
    salesCycleLength: normalizeNullableString(step6.salesCycleLength),
    trustSignals: normalizeStringList(step4.trustSignals),
    googleAnalyticsConnected: normalizeGoogleAnalyticsConnected(step4.googleAnalyticsConnected),
    monthlyWebsiteTraffic: normalizeNullableString(step4.monthlyWebsiteTraffic),
    emailListSize: normalizeNullableString(step4.emailListSize),
    knownCompetitorStatus: normalizeNullableString(step5.knownCompetitorStatus),
    knownCompetitors: extractKnownCompetitors(step5.knownCompetitors),
    channelsToAvoid: normalizeStringList(step5.channelsToAvoid),
    channelsStronglyPreferred: normalizeStringList(step5.channelsStronglyPreferred),
    executionConstraints: normalizeStringList(step5.executionConstraints),
    additionalContext: normalizeNullableString(step5.additionalContext),
    dataConsentOptIn: Object.prototype.hasOwnProperty.call(step7, 'dataConsentOptIn')
      ? normalizeBoolean(step7.dataConsentOptIn, true)
      : undefined,
  });
}

function buildPreviewFromState(state: WizardStateResponseV2): WizardPreview {
  const step1 = buildLegacyStepDataFromState(state, 'STEP_1');
  const businessStep = buildLegacyStepDataFromState(state, 'STEP_2');
  const step3 = buildLegacyStepDataFromState(state, 'STEP_3');
  const channelsStep = buildLegacyStepDataFromState(state, 'STEP_4');
  const step2 = {
    ...businessStep,
    salesChannels: channelsStep.salesChannels,
    socialHandles: channelsStep.socialHandles,
    digitalPresenceLinks: channelsStep.digitalPresenceLinks,
  } as WizardPreview['steps']['step2'];
  const step4 = buildPreviewStep4FromState(state) as WizardPreview['steps']['step4'];

  return {
    campaign: {
      id: state.campaignId,
      title: normalizeString(step1.title) || 'Untitled Campaign',
      status: CAMPAIGN_STATUS_BY_WIZARD_STATUS[state.status],
      websiteUrl: step1.primaryUrl,
    },
    steps: {
      step1,
      step2,
      step3,
      step4,
    },
    derived: null,
  };
}

function buildLegacyStepState(
  campaignId: string,
  stepKey: LegacyStepKey,
  state: WizardStateResponseV2,
): WizardStepState {
  return {
    campaignId,
    stepKey,
    data: buildLegacyStepDataFromState(state, stepKey),
    updatedAt: state.updatedAt ?? new Date().toISOString(),
    version: state.version,
  };
}

function buildStep2Payload(data: Record<string, unknown>) {
  const sensitiveCategoryFlags = normalizeStringList(data.sensitiveCategoryFlags);
  const complianceSensitiveClaims = normalizeStringOrList(data.complianceSensitiveClaims);
  const normalizedProductsServices = normalizeStringList(
    data.productsServices ?? data.productOrService,
  );

  return stripUndefined({
    businessName:
      normalizeNullableString(data.businessName) ??
      normalizeNullableString(data.title) ??
      normalizeNullableString(data.focusName),
    industryCategory:
      normalizeNullableString(data.industryCategory) ??
      normalizeNullableString(data.productCategory),
    businessType: normalizeNullableString(data.businessType),
    businessModel: normalizeNullableString(data.businessModel),
    audienceModel: pickAllowedValue(
      data.audienceModel,
      AUDIENCE_MODEL_VALUES_V2,
      'not_sure',
    ),
    lifecycleStage: pickAllowedValue(
      data.lifecycleStage,
      LIFECYCLE_STAGE_VALUES_V2,
      'growth',
    ),
    businessDescription: normalizeNullableString(data.businessDescription),
    productCategory: normalizeNullableString(data.productCategory),
    productsServices: normalizedProductsServices.length ? normalizedProductsServices : undefined,
    offerSummary: normalizeNullableString(data.offerSummary),
    priceRange: normalizeNullableString(data.priceRange),
    differentiators: normalizeStringOrList(data.differentiators),
    sensitiveCategoryFlags: sensitiveCategoryFlags.length ? sensitiveCategoryFlags : undefined,
    complianceSensitiveClaims,
  });
}

function buildStep2PayloadLegacy(data: Record<string, unknown>) {
  const step2Payload = buildStep2Payload(data);
  const productsServices = normalizeStringList(step2Payload.productsServices);
  return stripUndefined({
    ...step2Payload,
    productsServices: undefined,
    productOrService: productsServices.length ? productsServices : undefined,
  });
}

function buildStep3Payload(data: Record<string, unknown>) {
  const targetPersona = normalizeNullableString(data.targetPersona) ?? '';
  const targetAudience = normalizeNullableString(data.targetAudience);
  const primaryTargetSegment =
    normalizeNullableString(data.primaryTargetSegment) ??
    targetAudience ??
    targetPersona;
  const language = normalizeLanguage(data.language);
  const reportLanguage =
    pickAllowedValue(
      normalizeNullableString(data.reportLanguage),
      REPORT_LANGUAGE_VALUES_V2,
    ) ?? inferReportLanguage(language);
  const audienceSegments = normalizeStringList(data.audienceSegments);
  const buyerRoles = normalizeStringList(data.buyerRoles);

  return stripUndefined({
    primaryTargetSegment,
    targetPersona,
    targetAudience,
    audienceSegments: audienceSegments.length
      ? audienceSegments
      : targetAudience
        ? [targetAudience]
        : undefined,
    language,
    reportLanguage,
    painPoints: normalizeStringList(data.painPoints),
    desiredOutcome: normalizeNullableString(data.desiredOutcome),
    decisionProcess: normalizeNullableString(data.decisionProcess) ?? 'not_sure',
    buyerRoles: buyerRoles.length ? buyerRoles : undefined,
  });
}

function buildStep4Payload(data: Record<string, unknown>) {
  const salesChannels = normalizeSalesChannels(data.salesChannels);
  const primaryConversionPath = pickAllowedValue(
    data.primaryConversionPath,
    PRIMARY_CONVERSION_PATH_VALUES_V2,
  );

  return stripUndefined({
    salesChannels,
    primaryConversionPath: primaryConversionPath ?? buildPrimaryConversionPath(salesChannels),
    socialHandles: normalizeSocialHandles(data.socialHandles),
    digitalPresenceLinks: normalizeDigitalPresenceLinks(data.digitalPresenceLinks),
    trustSignals: normalizeStringList(data.trustSignals),
    googleAnalyticsConnected: normalizeGoogleAnalyticsConnected(data.googleAnalyticsConnected),
    monthlyWebsiteTraffic: normalizeNullableString(data.monthlyWebsiteTraffic),
    emailListSize: normalizeNullableString(data.emailListSize),
  });
}

function buildStep5Payload(data: Record<string, unknown>) {
  const knownCompetitors = normalizeStringList(data.knownCompetitors);
  const channelsToAvoid = normalizeStringList(data.channelsToAvoid);
  const channelsStronglyPreferred = normalizeStringList(data.channelsStronglyPreferred);
  const executionConstraints = normalizeStringList(data.executionConstraints);
  const currentMarketingActivity = normalizeCurrentMarketingActivity(data.currentMarketingActivity);

  return stripUndefined({
    primaryGoal: pickAllowedValue(
      mapWithFallback(data.primaryGoal, PRIMARY_GOAL_TO_V2),
      PRIMARY_GOAL_VALUES_V2,
      'other',
    ),
    monthlyMarketingSpend: normalizeNullableString(data.monthlyMarketingSpend),
    paidMediaBudgetRange: normalizeNullableString(data.paidMediaBudgetRange) ?? normalizeNullableString(data.monthlyMarketingSpend),
    marketingHandler: pickAllowedValue(
      mapWithFallback(data.marketingHandler, MARKETING_HANDLER_TO_V2),
      MARKETING_HANDLER_VALUES_V2,
      'not_sure',
    ),
    contentCapacity: pickAllowedValue(
      data.contentCapacity,
      CONTENT_CAPACITY_VALUES_V2,
      'not_sure',
    ),
    salesCapacity: normalizeNullableString(data.salesCapacity),
    currentMarketingActivity: currentMarketingActivity.length ? currentMarketingActivity : undefined,
    pastMarketing: normalizeNullableString(data.pastMarketing),
    whatsWorking: normalizeNullableString(data.whatsWorking),
    biggestFrustration: normalizeNullableString(data.biggestFrustration),
    knownCompetitorStatus: pickAllowedValue(
      data.knownCompetitorStatus,
      KNOWN_COMPETITOR_STATUS_VALUES_V2,
      knownCompetitors.length ? 'provided' : 'not_sure',
    ),
    knownCompetitors: knownCompetitors.length ? knownCompetitors : undefined,
    constraints: normalizeStringList(data.constraints),
    channelsToAvoid: channelsToAvoid.length ? channelsToAvoid : undefined,
    channelsStronglyPreferred: channelsStronglyPreferred.length ? channelsStronglyPreferred : undefined,
    executionConstraints: executionConstraints.length ? executionConstraints : undefined,
    additionalContext: normalizeNullableString(data.additionalContext),
  });
}

function buildStep6Payload(data: Record<string, unknown>) {
  const averageOrderValue = normalizeNumericString(data.averageOrderValue);
  const averageContractValue = normalizeNumericString(data.averageContractValue);
  const grossMarginPercentage = normalizeNumericString(data.grossMarginPercentage);
  const monthlyRevenue = normalizeNullableString(data.monthlyRevenue);
  const monthlyOrderVolume = normalizeNullableString(data.monthlyOrderVolume);
  const productCost = normalizeNullableString(data.productCost);
  const monthlyOrdersPerSubscriber = normalizeNumericString(data.monthlyOrdersPerSubscriber);
  const monthlyChurnRate = normalizeNumericString(data.monthlyChurnRate);
  const avgCustomerRetention = normalizeNullableString(data.avgCustomerRetention);
  const repeatPurchaseFrequency = normalizeNullableString(data.repeatPurchaseFrequency);
  const salesCycleLength = normalizeNumericString(data.salesCycleLength);
  return stripUndefined({
    averageOrderValue,
    averageContractValue,
    grossMarginPercentage,
    monthlyRevenue,
    monthlyOrderVolume,
    productCost,
    monthlyOrdersPerSubscriber,
    monthlyChurnRate,
    avgCustomerRetention,
    repeatPurchaseFrequency,
    salesCycleLength,
  });
}

function buildStep7PayloadFromGoals(data: Record<string, unknown>) {
  return stripUndefined({
    version: normalizeNumber(data.version),
    confirmFocus: normalizeBoolean(data.confirmFocus),
    confirmBusiness: normalizeBoolean(data.confirmBusiness),
    confirmAudience: normalizeBoolean(data.confirmAudience),
    confirmGoals: normalizeBoolean(data.confirmGoals),
    confirmEconomics: normalizeBoolean(data.confirmEconomics),
    readyToGenerate: normalizeBoolean(data.readyToGenerate),
    dataConsentOptIn: normalizeBoolean(data.dataConsentOptIn, true),
  });
}

async function saveAgainstV2State(
  campaignId: string,
  stepKey: LegacyStepKey,
  payload: SaveWizardStepPayload,
) {
  const stepData = ensureObject(payload.data);
  let version = payload.version;
  let latestState: WizardStateResponseV2 | null = null;

  const applyPatch = async (stepNumber: number, patchPayload: Record<string, unknown>) => {
    const nextState = await patchWizardStep(campaignId, stepNumber, version, patchPayload);
    if (!nextState) {
      return;
    }

    latestState = nextState;
    version = nextState.version;
  };

  if (stepKey === 'STEP_1') {
    const marketLocation = normalizeNullableString(stepData.marketLocation);
    const targetMarkets = normalizeStringList(stepData.targetMarkets);
    const operationalLocations = normalizeStringList(stepData.operationalLocations);
    const regionalLanguages = normalizeStringList(stepData.regionalLanguages);
    const hasRegionalLanguageExpansionFlag =
      Object.prototype.hasOwnProperty.call(stepData, 'regionalLanguageExpansionEnabled');

    await applyPatch(1, {
      title: normalizeNullableString(stepData.title),
      marketingTargetType: pickAllowedValue(
        mapWithFallback(stepData.marketingTargetType, MARKETING_TARGET_TO_V2),
        MARKETING_TARGET_VALUES_V2,
      ),
      focusName: normalizeNullableString(stepData.focusName),
      sourceType: pickAllowedValue(
        mapWithFallback(stepData.sourceType, SOURCE_TYPE_TO_V2),
        SOURCE_TYPE_VALUES_V2,
      ),
      primaryUrl: normalizeNullableString(stepData.primaryUrl),
      targetMarkets: targetMarkets.length
        ? targetMarkets
        : marketLocation
          ? [marketLocation]
          : undefined,
      primaryMarket: normalizeNullableString(stepData.primaryMarket) ?? marketLocation,
      marketScope: pickAllowedValue(
        mapWithFallback(stepData.marketScope, MARKET_SCOPE_TO_V2),
        MARKET_SCOPE_VALUES_V2,
      ),
      operationalLocations: operationalLocations.length
        ? operationalLocations
        : marketLocation
          ? [marketLocation]
          : undefined,
      regionalLanguageExpansionEnabled: hasRegionalLanguageExpansionFlag
        ? normalizeBoolean(stepData.regionalLanguageExpansionEnabled)
        : undefined,
      regionalLanguages: regionalLanguages.length ? regionalLanguages : undefined,
      marketLocation,
    });
  } else if (stepKey === 'STEP_2') {
    await applyPatch(1, {
      marketScope: pickAllowedValue(
        mapWithFallback(stepData.marketScope, MARKET_SCOPE_TO_V2),
        MARKET_SCOPE_VALUES_V2,
      ),
    });
    try {
      await applyPatch(2, buildStep2Payload(stepData));
    } catch (error) {
      if (!isProductsServicesKeyRejected(error)) {
        throw error;
      }

      await applyPatch(2, buildStep2PayloadLegacy(stepData));
    }
  } else if (stepKey === 'STEP_3') {
    await applyPatch(3, buildStep3Payload(stepData));
  } else if (stepKey === 'STEP_4') {
    await applyPatch(4, buildStep4Payload(stepData));
  } else if (stepKey === 'STEP_5') {
    await applyPatch(5, buildStep5Payload(stepData));
  } else if (stepKey === 'STEP_6') {
    await applyPatch(6, buildStep6Payload(stepData));
  } else if (stepKey === 'STEP_7') {
    await applyPatch(7, buildStep7PayloadFromGoals(stepData));
  }

  if (!latestState) {
    latestState = await wizardRealAdapter.getWizardState(campaignId);
  }

  return buildLegacyStepState(campaignId, stepKey, latestState);
}

export const wizardRealAdapter = {
  async listSteps(campaignId: string): Promise<WizardStepState[]> {
    const wizardState = await this.getWizardState(campaignId);

    return LEGACY_STEP_KEYS
      .map((stepKey) => buildLegacyStepState(campaignId, stepKey, wizardState))
      .filter((step) => hasOwnData(step.data));
  },

  async getWizardState(campaignId: string): Promise<WizardStateResponseV2> {
    const response = await http<ApiResponse<WizardStateResponseV2> | WizardStateResponseV2>(
      `/api/v2/wizard/state/${campaignId}`,
    );

    return unwrapResponseData(response);
  },

  async getWizardOptions(): Promise<WizardOptionsResponseV2> {
    const response = await http<ApiResponse<WizardOptionsResponseV2> | WizardOptionsResponseV2>(
      '/api/v2/wizard/options',
    );

    return unwrapResponseData(response);
  },

  async getStep(campaignId: string, stepKey: string): Promise<WizardStepState> {
    const wizardState = await this.getWizardState(campaignId);
    return buildLegacyStepState(campaignId, stepKey as LegacyStepKey, wizardState);
  },

  async saveStep(campaignId: string, stepKey: string, payload: SaveWizardStepPayload): Promise<WizardStepState> {
    return saveAgainstV2State(campaignId, stepKey as LegacyStepKey, payload);
  },

  async getPreview(campaignId: string): Promise<WizardPreview> {
    const state = await this.getWizardState(campaignId);
    return buildPreviewFromState(state);
  },

  async commitAndGenerate(
    campaignId: string,
    payload: Step7CommitPayload,
    idempotencyKey: string,
  ): Promise<WizardCommitResponseV2> {
    const response = await http<ApiResponse<WizardCommitResponseV2> | WizardCommitResponseV2>(
      '/api/v2/wizard/commit',
      {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: {
          campaignId,
          version: payload.version ?? 0,
          step7: {
            readyToGenerate: payload.readyToGenerate,
            dataConsentOptIn: payload.dataConsentOptIn,
          },
        },
      },
    );

    return unwrapResponseData(response);
  },

  async listReviewerTasks(pipelineRunId: string, status = 'pending_review'): Promise<Array<Record<string, unknown>>> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/reviewer-tasks', {
      query: {
        pipelineRunId,
        status,
      },
    });
    const payload = unwrapResponseData(response);

    if (Array.isArray(payload)) {
      return payload as Array<Record<string, unknown>>;
    }

    const record = ensureObject(payload);
    if (Array.isArray(record.items)) {
      return record.items as Array<Record<string, unknown>>;
    }

    return [];
  },

  async respondReviewerTask(taskId: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await http<ApiResponse<Record<string, unknown>> | Record<string, unknown>>(
      `/api/v2/reviewer-tasks/${taskId}/respond`,
      {
        method: 'POST',
        body: payload,
      },
    );

    return unwrapResponseData(response);
  },

  async getPipelineRunOutput(runId: string): Promise<Record<string, unknown>> {
    const response = await http<ApiResponse<Record<string, unknown>> | Record<string, unknown>>(
      `/api/v2/pipeline-runs/${runId}/output`,
    );

    return unwrapResponseData(response);
  },

  async assemblePipelineRunOutput(
    runId: string,
    payload: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    const response = await http<ApiResponse<Record<string, unknown>> | Record<string, unknown>>(
      `/api/v2/pipeline-runs/${runId}/output/assemble`,
      {
        method: 'POST',
        body: payload,
      },
    );

    return unwrapResponseData(response);
  },
};
