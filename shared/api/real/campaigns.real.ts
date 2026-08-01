import { http } from '../index';
import type { ApiResponse } from '../types';
import type {
  BusinessModel,
  BusinessType,
  Campaign,
  CampaignStatus,
  CreateCampaignPayload,
  MarketScope,
  UpdateCampaignPayload,
} from '@/shared/types/campaign';

type CampaignDto = Record<string, unknown>;

function coerceString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function coerceNullableString(value: unknown) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return normalized.length > 0 ? normalized : null;
}

function coerceNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function coerceStringList(value: unknown) {
  const coerceListItem = (item: unknown) => {
    const direct = coerceNullableString(item);
    if (direct) {
      return direct;
    }

    if (isRecord(item)) {
      return (
        coerceNullableString(item.name) ||
        coerceNullableString(item.title) ||
        coerceNullableString(item.value) ||
        null
      );
    }

    return null;
  };

  if (Array.isArray(value)) {
    return value
      .map((item) => coerceListItem(item))
      .filter((item): item is string => Boolean(item));
  }

  if (isRecord(value)) {
    const fromRecord =
      coerceNullableString(value.name) ||
      coerceNullableString(value.title) ||
      coerceNullableString(value.value);
    return fromRecord ? [fromRecord] : [];
  }

  const normalized = coerceNullableString(value);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function coerceNullableRecord(value: unknown) {
  return isRecord(value) ? value : null;
}

function coerceBusinessType(value: unknown) {
  return typeof value === 'string' ? (value as BusinessType) : null;
}

function coerceBusinessModel(value: unknown) {
  return typeof value === 'string' ? (value as BusinessModel) : null;
}

function coerceMarketScope(value: unknown) {
  return typeof value === 'string' ? (value as MarketScope) : null;
}

function coerceCampaignStatus(value: unknown) {
  if (typeof value !== 'string') {
    return 'DRAFT';
  }

  const normalized = value.trim().toUpperCase();

  if (normalized === 'IN_PROGRESS') {
    return 'DRAFT';
  }

  if (normalized === 'PENDING_REVIEW') {
    return 'IN_REVIEW';
  }

  if (normalized === 'COMMITTED') {
    return 'SUBMITTED_FOR_REVIEW';
  }

  if (normalized === 'COMMITTED_BLOCKED_DATA_CONSENT') {
    return 'DRAFT';
  }

  if (normalized === 'WIZARD_DRAFT') {
    return 'DRAFT';
  }

  if (normalized === 'STRATEGY_GENERATION') {
    return 'SUBMITTED_FOR_REVIEW';
  }

  if (
    normalized === 'DRAFT' ||
    normalized === 'SUBMITTED_FOR_REVIEW' ||
    normalized === 'IN_REVIEW' ||
    normalized === 'GENERATING_DELIVERABLES' ||
    normalized === 'DELIVERABLE_GENERATION_FAILED' ||
    normalized === 'ACTIVE' ||
    normalized === 'FAILED' ||
    normalized === 'ARCHIVED'
  ) {
    return normalized as CampaignStatus;
  }

  return 'DRAFT';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function extractCampaignItems(payload: unknown): CampaignDto[] {
  if (Array.isArray(payload)) {
    return payload as CampaignDto[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.items)) {
    return payload.items as CampaignDto[];
  }

  if (Array.isArray(payload.campaigns)) {
    return payload.campaigns as CampaignDto[];
  }

  if ('data' in payload) {
    return extractCampaignItems(payload.data);
  }

  return [];
}

function getPathValue(root: Record<string, unknown>, path: string[]) {
  let current: unknown = root;

  for (const key of path) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[key];
  }

  return current;
}

function pickNullableStringByPath(root: Record<string, unknown>, paths: string[][]) {
  for (const path of paths) {
    const normalized = coerceNullableString(getPathValue(root, path));
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function pickStringByPath(root: Record<string, unknown>, paths: string[][], fallback = '') {
  return pickNullableStringByPath(root, paths) ?? fallback;
}

function pickNumberByPath(root: Record<string, unknown>, paths: string[][], fallback = 0) {
  for (const path of paths) {
    const value = getPathValue(root, path);
    const normalized = coerceNumber(value, Number.NaN);
    if (!Number.isNaN(normalized)) {
      return normalized;
    }
  }

  return fallback;
}

function pickStringListByPath(root: Record<string, unknown>, paths: string[][]) {
  for (const path of paths) {
    const normalized = coerceStringList(getPathValue(root, path));
    if (normalized.length > 0) {
      return normalized;
    }
  }

  return [];
}

function findStepRecord(root: Record<string, unknown>, stepKey: 'step1' | 'step2' | 'step5') {
  const legacyStepKey =
    stepKey === 'step1' ? 'STEP_1' : stepKey === 'step2' ? 'STEP_2' : 'STEP_5';
  const snakeStepKey =
    stepKey === 'step1' ? 'step_1' : stepKey === 'step2' ? 'step_2' : 'step_5';

  const step = [
    getPathValue(root, [stepKey]),
    getPathValue(root, [snakeStepKey]),
    getPathValue(root, [legacyStepKey]),
    getPathValue(root, ['steps', stepKey]),
    getPathValue(root, ['steps', snakeStepKey]),
    getPathValue(root, ['steps', legacyStepKey]),
    getPathValue(root, ['wizardState', stepKey]),
    getPathValue(root, ['wizardState', snakeStepKey]),
    getPathValue(root, ['wizardState', legacyStepKey]),
    getPathValue(root, ['wizardState', 'steps', stepKey]),
    getPathValue(root, ['wizardState', 'steps', snakeStepKey]),
    getPathValue(root, ['wizardState', 'steps', legacyStepKey]),
    getPathValue(root, ['wizard', stepKey]),
    getPathValue(root, ['wizard', snakeStepKey]),
    getPathValue(root, ['wizard', legacyStepKey]),
    getPathValue(root, ['wizard', 'steps', stepKey]),
    getPathValue(root, ['wizard', 'steps', snakeStepKey]),
    getPathValue(root, ['wizard', 'steps', legacyStepKey]),
    getPathValue(root, ['snapshot', stepKey]),
    getPathValue(root, ['snapshot', snakeStepKey]),
    getPathValue(root, ['snapshot', legacyStepKey]),
    getPathValue(root, ['snapshot', 'steps', stepKey]),
    getPathValue(root, ['snapshot', 'steps', snakeStepKey]),
    getPathValue(root, ['snapshot', 'steps', legacyStepKey]),
    getPathValue(root, ['latestSnapshot', stepKey]),
    getPathValue(root, ['latestSnapshot', snakeStepKey]),
    getPathValue(root, ['latestSnapshot', legacyStepKey]),
    getPathValue(root, ['latestSnapshot', 'steps', stepKey]),
    getPathValue(root, ['latestSnapshot', 'steps', snakeStepKey]),
    getPathValue(root, ['latestSnapshot', 'steps', legacyStepKey]),
    getPathValue(root, ['state', stepKey]),
    getPathValue(root, ['state', snakeStepKey]),
    getPathValue(root, ['state', legacyStepKey]),
    getPathValue(root, ['state', 'steps', stepKey]),
    getPathValue(root, ['state', 'steps', snakeStepKey]),
    getPathValue(root, ['state', 'steps', legacyStepKey]),
  ].find((value) => isRecord(value));

  return coerceNullableRecord(step) ?? {};
}

function unwrapResponseData<T>(response: ApiResponse<T> | T): T {
  if (response && typeof response === 'object' && 'data' in (response as Record<string, unknown>)) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

function hasStringValue(value: string | null | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasStringListValue(value: string[] | undefined) {
  return Array.isArray(value) && value.some((item) => hasStringValue(item));
}

function needsCampaignFieldBackfill(campaign: Campaign) {
  return (
    !hasStringValue(campaign.v2SourceType) ||
    !hasStringValue(campaign.v2PrimaryMarket) ||
    !hasStringListValue(campaign.v2TargetMarkets) ||
    !hasStringValue(campaign.v2BusinessName) ||
    !hasStringValue(campaign.v2IndustryCategory) ||
    !hasStringListValue(campaign.v2PrimaryOfferings) ||
    !hasStringValue(campaign.v2PrimaryGoal)
  );
}

function shouldLoadWizardBackfill(campaign: Campaign) {
  return campaign.status === 'DRAFT' && needsCampaignFieldBackfill(campaign);
}

function mergeCampaignBackfill(campaign: Campaign, patch: Partial<Campaign>) {
  const patchTargetMarkets = patch.v2TargetMarkets?.filter((value) => hasStringValue(value));
  const patchPrimaryOfferings = patch.v2PrimaryOfferings?.filter((value) => hasStringValue(value));

  return {
    ...campaign,
    title:
      hasStringValue(campaign.title) ? campaign.title : coerceString(patch.title, campaign.title),
    name:
      hasStringValue(campaign.name) ? campaign.name : coerceString(patch.name, campaign.name),
    city:
      hasStringValue(campaign.city)
        ? campaign.city
        : coerceString(patch.v2PrimaryMarket, coerceString(patch.city, campaign.city)),
    niche:
      hasStringValue(campaign.niche)
        ? campaign.niche
        : coerceString(patch.v2IndustryCategory, coerceString(patch.niche, campaign.niche)),
    status:
      campaign.status === 'DRAFT' && patch.status && patch.status !== 'DRAFT'
        ? patch.status
        : campaign.status,
    currentStep:
      campaign.currentStep > 0
        ? campaign.currentStep
        : coerceNumber(patch.currentStep, campaign.currentStep),
    updatedAt:
      hasStringValue(campaign.updatedAt)
        ? campaign.updatedAt
        : coerceString(patch.updatedAt, campaign.updatedAt),
    v2SourceType:
      hasStringValue(campaign.v2SourceType)
        ? campaign.v2SourceType
        : coerceNullableString(patch.v2SourceType),
    v2PrimaryMarket:
      hasStringValue(campaign.v2PrimaryMarket)
        ? campaign.v2PrimaryMarket
        : coerceNullableString(patch.v2PrimaryMarket),
    v2TargetMarkets:
      hasStringListValue(campaign.v2TargetMarkets)
        ? campaign.v2TargetMarkets
        : patchTargetMarkets?.length
          ? patchTargetMarkets
          : campaign.v2TargetMarkets,
    v2BusinessName:
      hasStringValue(campaign.v2BusinessName)
        ? campaign.v2BusinessName
        : coerceNullableString(patch.v2BusinessName),
    v2IndustryCategory:
      hasStringValue(campaign.v2IndustryCategory)
        ? campaign.v2IndustryCategory
        : coerceNullableString(patch.v2IndustryCategory),
    v2PrimaryOfferings:
      hasStringListValue(campaign.v2PrimaryOfferings)
        ? campaign.v2PrimaryOfferings
        : patchPrimaryOfferings?.length
          ? patchPrimaryOfferings
          : campaign.v2PrimaryOfferings,
    v2PrimaryGoal:
      hasStringValue(campaign.v2PrimaryGoal)
        ? campaign.v2PrimaryGoal
        : coerceNullableString(patch.v2PrimaryGoal),
  };
}

async function loadCampaignBackfillFromWizardState(campaignId: string) {
  try {
    const response = await http<ApiResponse<unknown> | unknown>(`/api/v2/wizard/state/${campaignId}`);
    const payload = unwrapResponseData(response);
    const stateRecord = isRecord(payload) ? payload : {};
    const step1 = findStepRecord(stateRecord, 'step1');
    const step2 = findStepRecord(stateRecord, 'step2');
    const step5 = findStepRecord(stateRecord, 'step5');

    const title =
      pickNullableStringByPath(step1, [['title'], ['focusName'], ['focus_name']]) ||
      pickNullableStringByPath(step2, [['businessName'], ['business_name']]);
    const v2SourceType = pickNullableStringByPath(step1, [['sourceType'], ['source_type']]);
    const v2PrimaryMarket = pickNullableStringByPath(step1, [
      ['primaryMarket'],
      ['primary_market'],
      ['marketLocation'],
      ['market_location'],
    ]);
    const v2TargetMarkets = [
      ...pickStringListByPath(step1, [['targetMarkets'], ['target_markets']]),
      ...pickStringListByPath(step1, [['operationalLocations'], ['operational_locations']]),
    ].filter((value, index, list) => list.indexOf(value) === index);
    const v2BusinessName = pickNullableStringByPath(step2, [['businessName'], ['business_name']]);
    const v2IndustryCategory = pickNullableStringByPath(step2, [
      ['industryCategory'],
      ['industry_category'],
      ['productCategory'],
      ['product_category'],
    ]);
    const v2PrimaryOfferings = [
      ...pickStringListByPath(step2, [['productsServices'], ['products_services']]),
      ...pickStringListByPath(step2, [['productOrService'], ['product_or_service']]),
    ].filter((value, index, list) => list.indexOf(value) === index);
    const v2PrimaryGoal = pickNullableStringByPath(step5, [['primaryGoal'], ['primary_goal']]);
    const status = coerceCampaignStatus(pickNullableStringByPath(stateRecord, [['status']]));
    const currentStep = pickNumberByPath(stateRecord, [['lastCompletedStep'], ['last_completed_step']], 0);
    const updatedAt = pickNullableStringByPath(stateRecord, [['updatedAt'], ['updated_at']]);

    return {
      title: title ?? undefined,
      name: title ?? undefined,
      city: v2PrimaryMarket ?? undefined,
      niche: v2IndustryCategory ?? undefined,
      status,
      currentStep,
      updatedAt: updatedAt ?? undefined,
      v2SourceType: v2SourceType ?? undefined,
      v2PrimaryMarket: v2PrimaryMarket ?? undefined,
      v2TargetMarkets: v2TargetMarkets.length > 0 ? v2TargetMarkets : undefined,
      v2BusinessName: v2BusinessName ?? undefined,
      v2IndustryCategory: v2IndustryCategory ?? undefined,
      v2PrimaryOfferings: v2PrimaryOfferings.length > 0 ? v2PrimaryOfferings : undefined,
      v2PrimaryGoal: v2PrimaryGoal ?? undefined,
    } as Partial<Campaign>;
  } catch {
    return null;
  }
}

/**
 * Map backend CampaignDto to frontend Campaign type
 */
function mapCampaignDtoToCampaign(dto: unknown): Campaign {
  const campaignRecord = isRecord(dto) ? dto : {};
  const step1 = findStepRecord(campaignRecord, 'step1');
  const step2 = findStepRecord(campaignRecord, 'step2');
  const step5 = findStepRecord(campaignRecord, 'step5');

  const v2SourceType = pickNullableStringByPath(campaignRecord, [
    ['v2SourceType'],
    ['v2_source_type'],
    ['sourceType'],
    ['source_type'],
  ]) ?? pickNullableStringByPath(step1, [['sourceType'], ['source_type']]);

  const v2PrimaryMarket =
    pickNullableStringByPath(campaignRecord, [
      ['v2PrimaryMarket'],
      ['v2_primary_market'],
      ['primaryMarket'],
      ['primary_market'],
      ['marketLocation'],
      ['market_location'],
    ]) ??
    pickNullableStringByPath(step1, [
      ['primaryMarket'],
      ['primary_market'],
      ['marketLocation'],
      ['market_location'],
    ]);

  const v2TargetMarkets = [
    ...pickStringListByPath(campaignRecord, [
      ['v2TargetMarkets'],
      ['v2_target_markets'],
      ['targetMarkets'],
      ['target_markets'],
      ['operationalLocations'],
      ['operational_locations'],
    ]),
    ...pickStringListByPath(step1, [
      ['targetMarkets'],
      ['target_markets'],
      ['operationalLocations'],
      ['operational_locations'],
    ]),
  ].filter((value, index, list) => list.indexOf(value) === index);

  const v2BusinessName =
    pickNullableStringByPath(campaignRecord, [
      ['v2BusinessName'],
      ['v2_business_name'],
      ['businessName'],
      ['business_name'],
    ]) ?? pickNullableStringByPath(step2, [['businessName'], ['business_name']]);

  const v2IndustryCategory =
    pickNullableStringByPath(campaignRecord, [
      ['v2IndustryCategory'],
      ['v2_industry_category'],
      ['industryCategory'],
      ['industry_category'],
      ['detectedCategoryKeyword'],
      ['detected_category_keyword'],
    ]) ??
    pickNullableStringByPath(step2, [
      ['industryCategory'],
      ['industry_category'],
      ['productCategory'],
      ['product_category'],
    ]);

  const v2PrimaryOfferings = [
    ...pickStringListByPath(campaignRecord, [
      ['v2PrimaryOfferings'],
      ['v2_primary_offerings'],
      ['primaryOfferings'],
      ['primary_offerings'],
      ['productsServices'],
      ['products_services'],
      ['productOrService'],
      ['product_or_service'],
    ]),
    ...pickStringListByPath(step2, [
      ['productsServices'],
      ['products_services'],
      ['productOrService'],
      ['product_or_service'],
    ]),
  ].filter((value, index, list) => list.indexOf(value) === index);

  const v2PrimaryGoal =
    pickNullableStringByPath(campaignRecord, [
      ['v2PrimaryGoal'],
      ['v2_primary_goal'],
      ['primaryGoal'],
      ['primary_goal'],
    ]) ?? pickNullableStringByPath(step5, [['primaryGoal'], ['primary_goal']]);

  const campaignTitle =
    pickStringByPath(campaignRecord, [
      ['title'],
      ['name'],
      ['campaignTitle'],
      ['campaign_title'],
      ['focusName'],
      ['focus_name'],
    ]) ||
    pickStringByPath(step1, [['title'], ['focusName'], ['focus_name']]) ||
    v2BusinessName ||
    'Untitled Campaign';

  const campaignCity =
    v2PrimaryMarket ||
    pickStringByPath(campaignRecord, [
      ['marketLocation'],
      ['market_location'],
      ['primaryMarket'],
      ['primary_market'],
      ['city'],
    ]) ||
    v2TargetMarkets[0] ||
    '';

  const createdAt =
    pickStringByPath(campaignRecord, [['createdAt'], ['created_at']], '') || new Date().toISOString();
  const updatedAt =
    pickStringByPath(campaignRecord, [
      ['updatedAt'],
      ['updated_at'],
      ['wizardState', 'updatedAt'],
      ['wizardState', 'updated_at'],
      ['wizard', 'updatedAt'],
      ['wizard', 'updated_at'],
    ]) || createdAt;

  return {
    id:
      pickStringByPath(campaignRecord, [['id'], ['campaignId'], ['campaign_id']], '') ||
      `campaign-${campaignTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title: campaignTitle,
    name: campaignTitle,
    city: campaignCity,
    niche:
      pickStringByPath(campaignRecord, [['detectedCategoryKeyword'], ['detected_category_keyword']], '') ||
      coerceString(v2IndustryCategory),
    businessType: coerceBusinessType(getPathValue(campaignRecord, ['businessType'])),
    businessModel: coerceBusinessModel(getPathValue(campaignRecord, ['businessModel'])),
    marketScope: coerceMarketScope(getPathValue(campaignRecord, ['marketScope'])),
    website:
      pickNullableStringByPath(campaignRecord, [
        ['websiteUrl'],
        ['website_url'],
        ['website'],
      ]) ??
      pickNullableStringByPath(step1, [['primaryUrl'], ['primary_url']]),
    status: coerceCampaignStatus(
      pickNullableStringByPath(campaignRecord, [
        ['status'],
        ['campaignStatus'],
        ['campaign_status'],
        ['wizardState', 'status'],
        ['wizard', 'status'],
      ]),
    ),
    currentStep: pickNumberByPath(
      campaignRecord,
      [
        ['currentStep'],
        ['current_step'],
        ['lastCompletedStep'],
        ['last_completed_step'],
        ['wizardState', 'lastCompletedStep'],
        ['wizardState', 'last_completed_step'],
        ['wizard', 'lastCompletedStep'],
        ['wizard', 'last_completed_step'],
      ],
      0,
    ),
    createdAt,
    updatedAt,
    v2SourceType,
    v2PrimaryMarket,
    v2TargetMarkets: v2TargetMarkets.length > 0 ? v2TargetMarkets : undefined,
    v2BusinessName,
    v2IndustryCategory,
    v2PrimaryOfferings: v2PrimaryOfferings.length > 0 ? v2PrimaryOfferings : undefined,
    v2PrimaryGoal,
  };
}

export const campaignsRealAdapter = {
  async listCampaigns(): Promise<Campaign[]> {
    const response = await http<unknown>('/api/v2/campaigns');
    const mapped = extractCampaignItems(response).map(mapCampaignDtoToCampaign);

    return Promise.all(
      mapped.map(async (campaign) => {
        if (!shouldLoadWizardBackfill(campaign)) {
          return campaign;
        }

        const patch = await loadCampaignBackfillFromWizardState(campaign.id);
        if (!patch) {
          return campaign;
        }

        return mergeCampaignBackfill(campaign, patch);
      }),
    );
  },

  async getCampaign(id: string): Promise<Campaign> {
    try {
      const listResponse = await http<unknown>('/api/v2/campaigns');
      const match = extractCampaignItems(listResponse)
        .map(mapCampaignDtoToCampaign)
        .find((campaign) => campaign.id === id);

      if (match) {
        if (!shouldLoadWizardBackfill(match)) {
          return match;
        }

        const patch = await loadCampaignBackfillFromWizardState(match.id);
        if (!patch) {
          return match;
        }

        return mergeCampaignBackfill(match, patch);
      }
    } catch {
      // Fallback to legacy campaign detail endpoint when v2 list is unavailable.
    }

    const response = await http<ApiResponse<CampaignDto>>(`/v1/campaigns/${id}`);
    return mapCampaignDtoToCampaign(response.data);
  },

  async createDraftCampaign(): Promise<Campaign> {
    const response = await http<ApiResponse<CampaignDto>>('/v1/campaigns', {
      method: 'POST',
      body: {
        title: 'Untitled Campaign',
      },
    });
    return mapCampaignDtoToCampaign(response.data);
  },

  async createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
    const { websiteUrl, ...campaignPayload } = payload;
    const response = await http<ApiResponse<CampaignDto>>('/v1/campaigns', { 
      method: 'POST', 
      body: {
        ...campaignPayload,
        ...(websiteUrl ? { primaryUrl: websiteUrl } : {}),
      } as unknown as Record<string, unknown>,
    });
    return mapCampaignDtoToCampaign(response.data);
  },

  async updateCampaign(id: string, payload: UpdateCampaignPayload): Promise<Campaign> {
    const { websiteUrl, ...campaignPayload } = payload;
    const response = await http<ApiResponse<CampaignDto>>(`/v1/campaigns/${id}`, { 
      method: 'PATCH', 
      body: {
        ...campaignPayload,
        ...(websiteUrl ? { primaryUrl: websiteUrl } : {}),
      } as unknown as Record<string, unknown>,
    });
    return mapCampaignDtoToCampaign(response.data);
  },

  async deleteCampaign(id: string): Promise<void> {
    await http(`/v1/campaigns/${id}`, { method: 'DELETE' });
  },
};
