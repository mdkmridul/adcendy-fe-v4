import { http } from '../index';
import type { components } from '@/src/generated/openapi';
import type { ApiResponse } from '../types';
import type { Campaign } from '@/shared/types/campaign';

type CampaignDto = components['schemas']['CampaignDto'];
type CreateCampaignDto = components['schemas']['CreateCampaignDto'];
type UpdateCampaignDto = components['schemas']['UpdateCampaignDto'];
type CampaignListResponseDto = components['schemas']['CampaignListResponseDto'];

/**
 * Map backend CampaignDto to frontend Campaign type
 */
function mapCampaignDtoToCampaign(dto: CampaignDto): Campaign {
  return {
    id: dto.id,
    name: dto.title,
    city: dto.marketLocation as string || '',
    niche: dto.detectedCategoryKeyword as string || '',
    businessType: dto.businessType || null,
    website: dto.websiteUrl as string || null,
    status: dto.status,
    currentStep: dto.currentStep,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export const campaignsRealAdapter = {
  async listCampaigns(): Promise<Campaign[]> {
    const response = await http<ApiResponse<CampaignListResponseDto>>('/v1/campaigns');
    return response.data.items.map(mapCampaignDtoToCampaign);
  },

  async getCampaign(id: string): Promise<Campaign> {
    const response = await http<ApiResponse<CampaignDto>>(`/v1/campaigns/${id}`);
    return mapCampaignDtoToCampaign(response.data);
  },

  async createCampaign(payload: CreateCampaignDto): Promise<Campaign> {
    const response = await http<ApiResponse<CampaignDto>>('/v1/campaigns', { 
      method: 'POST', 
      body: payload 
    });
    return mapCampaignDtoToCampaign(response.data);
  },

  async updateCampaign(id: string, payload: UpdateCampaignDto): Promise<Campaign> {
    const response = await http<ApiResponse<CampaignDto>>(`/v1/campaigns/${id}`, { 
      method: 'PATCH', 
      body: payload 
    });
    return mapCampaignDtoToCampaign(response.data);
  },

  async deleteCampaign(id: string): Promise<void> {
    await http(`/v1/campaigns/${id}`, { method: 'DELETE' });
  },
};
