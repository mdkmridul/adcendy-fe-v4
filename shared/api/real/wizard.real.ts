import { http } from '../index';
import type { components } from '@/src/generated/openapi';
import type { ApiResponse } from '../types';
import type { WizardPreview, WizardStepState } from '@/shared/types/wizard';

type StrategyWizardResultDto = components['schemas']['StrategyWizardResultDto'];
type StrategyWizardPreviewDto = components['schemas']['StrategyWizardPreviewDto'];
type StrategyWizardValidationDto = components['schemas']['StrategyWizardValidationDto'];

// Map step keys to numbers
const STEP_MAP: Record<string, number> = {
  'STEP_1': 1,
  'STEP_2': 2,
  'STEP_3': 3,
  'STEP_4': 4,
  'PREVIEW': 5,
};

export const wizardRealAdapter = {
  async listSteps(campaignId: string): Promise<WizardStepState[]> {
    const wizardState = await this.getWizardState(campaignId);

    return (['STEP_1', 'STEP_2', 'STEP_3', 'STEP_4'] as const)
      .map((stepKey) => {
        const stepNumber = STEP_MAP[stepKey];
        const stepData = wizardState.draft.steps[`step${stepNumber}Json` as keyof typeof wizardState.draft.steps];

        if (!stepData) {
          return null;
        }

        return {
          campaignId,
          stepKey,
          data: stepData,
          updatedAt: new Date().toISOString(),
          version: wizardState.draft.version,
        } satisfies WizardStepState;
      })
      .filter(Boolean) as WizardStepState[];
  },

  async getWizardState(campaignId: string): Promise<StrategyWizardResultDto> {
    const response = await http<ApiResponse<StrategyWizardResultDto>>(`/v1/campaigns/${campaignId}/wizard`);
    return response.data;
  },

  async getStep(campaignId: string, stepKey: string): Promise<WizardStepState> {
    // Get the full wizard state
    const wizardState = await this.getWizardState(campaignId);
    const stepNumber = STEP_MAP[stepKey];
    
    // Extract the specific step data from the wizard state
    const stepData = wizardState.draft.steps[`step${stepNumber}Json` as keyof typeof wizardState.draft.steps];
    
    return {
      campaignId,
      stepKey: stepKey as WizardStepState['stepKey'],
      data: stepData || {},
      updatedAt: new Date().toISOString(),
      lastCompletedStep: wizardState.draft.lastCompletedStep,
      status: wizardState.draft.status,
      version: wizardState.draft.version, // Include version for optimistic locking
    } as WizardStepState;
  },

  async saveStep(campaignId: string, stepKey: string, payload: any): Promise<WizardStepState> {
    const stepNumber = STEP_MAP[stepKey];
    const response = await http<ApiResponse<StrategyWizardResultDto>>(`/v1/campaigns/${campaignId}/wizard/steps/${stepNumber}`, {
      method: 'PATCH',
      body: {
        ...payload.data, // Step data
        version: payload.version, // Include version for conflict detection
      },
    });

    return {
      campaignId,
      stepKey: stepKey as WizardStepState['stepKey'],
      data: payload.data ?? {},
      updatedAt: new Date().toISOString(),
      version: response.data.draft.version,
    };
  },

  async getPreview(campaignId: string): Promise<WizardPreview> {
    const response = await http<ApiResponse<StrategyWizardPreviewDto>>(`/v1/campaigns/${campaignId}/preview`);
    return response.data as WizardPreview;
  },

  async validateWizard(campaignId: string): Promise<StrategyWizardValidationDto> {
    const response = await http<ApiResponse<StrategyWizardValidationDto>>(`/v1/campaigns/${campaignId}/wizard/validate`, {
      method: 'POST',
    });
    return response.data;
  },

  async commitAndGenerate(
    campaignId: string,
    payload: {
      version?: number;
      confirmFocus: boolean;
      confirmBusiness: boolean;
      confirmAudience: boolean;
      confirmGoals: boolean;
      readyToGenerate: boolean;
      dataConsentOptIn: boolean;
    }
  ): Promise<StrategyWizardResultDto> {
    console.log('[Wizard] Commit payload:', payload);
    const response = await http<ApiResponse<StrategyWizardResultDto>>(`/v1/campaigns/${campaignId}/wizard/commit`, {
      method: 'POST',
      body: payload,
    });
    return response.data;
  },
};
