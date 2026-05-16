import { http } from '../index';
import type { components } from '@/src/generated/openapi';
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

type CampaignDto = components['schemas']['CampaignDto'];

type CampaignDtoWithClassification = CampaignDto & {
  businessModel?: BusinessModel | null;
  marketScope?: MarketScope | null;
};

function coerceString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function coerceNullableString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
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
  return typeof value === 'string' ? (value as CampaignStatus) : 'DRAFT';
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

/**
 * Map backend CampaignDto to frontend Campaign type
 */
function mapCampaignDtoToCampaign(dto: CampaignDto): Campaign {
  const campaignDto = dto as CampaignDtoWithClassification;
  const campaignRecord = campaignDto as unknown as Record<string, unknown>;
  const campaignName =
    coerceString(campaignDto.title) ||
    coerceString(campaignRecord.name) ||
    coerceString(campaignRecord.campaignTitle) ||
    coerceString(campaignRecord.focusName) ||
    'Untitled Campaign';
  const campaignCity =
    coerceString(campaignDto.marketLocation) ||
    coerceString(campaignRecord.primaryMarket) ||
    coerceString(campaignRecord.city);

  return {
    id: campaignDto.id,
    name: campaignName,
    city: campaignCity,
    niche: coerceString(campaignDto.detectedCategoryKeyword),
    businessType: coerceBusinessType(campaignDto.businessType),
    businessModel: coerceBusinessModel(campaignDto.businessModel),
    marketScope: coerceMarketScope(campaignDto.marketScope),
    website: coerceNullableString(campaignDto.websiteUrl),
    status: coerceCampaignStatus(campaignDto.status),
    currentStep: campaignDto.currentStep,
    createdAt: campaignDto.createdAt,
    updatedAt: campaignDto.updatedAt,
  };
}

export const campaignsRealAdapter = {
  async listCampaigns(): Promise<Campaign[]> {
    const response = await http<unknown>('/api/v2/campaigns');
    return extractCampaignItems(response).map(mapCampaignDtoToCampaign);
  },

  async getCampaign(id: string): Promise<Campaign> {
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
    const response = await http<ApiResponse<CampaignDto>>('/v1/campaigns', { 
      method: 'POST', 
      body: payload as unknown as Record<string, unknown>,
    });
    return mapCampaignDtoToCampaign(response.data);
  },

  async updateCampaign(id: string, payload: UpdateCampaignPayload): Promise<Campaign> {
    const response = await http<ApiResponse<CampaignDto>>(`/v1/campaigns/${id}`, { 
      method: 'PATCH', 
      body: payload as unknown as Record<string, unknown>,
    });
    return mapCampaignDtoToCampaign(response.data);
  },

  async deleteCampaign(id: string): Promise<void> {
    await http(`/v1/campaigns/${id}`, { method: 'DELETE' });
  },
};
