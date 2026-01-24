import { http } from '../index';
import type { components } from '@/src/generated/openapi';
import type { ApiResponse } from '../types';

type CampaignDto = components['schemas']['CampaignDto'];
type CreateCampaignDto = components['schemas']['CreateCampaignDto'];
type UpdateCampaignDto = components['schemas']['UpdateCampaignDto'];
type CampaignListResponseDto = components['schemas']['CampaignListResponseDto'];

export const campaignsRealAdapter = {
  async listCampaigns(): Promise<CampaignDto[]> {
    const response = await http<ApiResponse<CampaignListResponseDto>>('/v1/campaigns');
    return response.data.items;
  },

  async getCampaign(id: string): Promise<CampaignDto> {
    const response = await http<ApiResponse<CampaignDto>>(`/v1/campaigns/${id}`);
    return response.data;
  },

  async createCampaign(payload: CreateCampaignDto): Promise<CampaignDto> {
    const response = await http<ApiResponse<CampaignDto>>('/v1/campaigns', { 
      method: 'POST', 
      body: payload 
    });
    return response.data;
  },

  async updateCampaign(id: string, payload: UpdateCampaignDto): Promise<CampaignDto> {
    const response = await http<ApiResponse<CampaignDto>>(`/v1/campaigns/${id}`, { 
      method: 'PATCH', 
      body: payload 
    });
    return response.data;
  },

  async deleteCampaign(id: string): Promise<void> {
    await http(`/v1/campaigns/${id}`, { method: 'DELETE' });
  },
};
