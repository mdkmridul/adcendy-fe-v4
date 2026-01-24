import { http } from '../index';
import type { components } from '@/src/generated/openapi';
import type { ApiResponse } from '../types';

type WizardStateDto = components['schemas']['WizardStateDto'];
type WizardPreviewDto = components['schemas']['WizardPreviewDto'];
type WizardStepResponseDto = components['schemas']['WizardStepResponseDto'];
type CommitWizardResponseDto = components['schemas']['CommitWizardResponseDto'];
type SaveWizardStepDto = components['schemas']['SaveWizardStepDto'];

export const wizardRealAdapter = {
  async getWizardState(campaignId: string): Promise<WizardStateDto> {
    const response = await http<ApiResponse<WizardStateDto>>(`/v1/campaigns/${campaignId}/wizard`);
    return response.data;
  },

  async getStep(campaignId: string, stepNumber: number): Promise<WizardStepResponseDto> {
    const response = await http<ApiResponse<WizardStepResponseDto>>(`/v1/campaigns/${campaignId}/wizard/steps/${stepNumber}`);
    return response.data;
  },

  async saveStep(campaignId: string, stepNumber: number, payload: SaveWizardStepDto): Promise<WizardStepResponseDto> {
    const response = await http<ApiResponse<WizardStepResponseDto>>(`/v1/campaigns/${campaignId}/wizard/steps/${stepNumber}`, {
      method: 'POST',
      body: payload,
    });
    return response.data;
  },

  async getPreview(campaignId: string): Promise<WizardPreviewDto> {
    const response = await http<ApiResponse<WizardPreviewDto>>(`/v1/campaigns/${campaignId}/preview`);
    return response.data;
  },

  async commitAndGenerate(campaignId: string): Promise<CommitWizardResponseDto> {
    const response = await http<ApiResponse<CommitWizardResponseDto>>(`/v1/campaigns/${campaignId}/wizard/commit`, {
      method: 'POST',
    });
    return response.data;
  },
};
