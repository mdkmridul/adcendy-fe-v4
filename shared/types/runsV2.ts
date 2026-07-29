import type { components } from '@/src/generated/openapi';

export type PipelineRunStatusV2 =
  components['schemas']['PipelineRunStatusV2'];
export type PipelineRunRequiredActionV2 =
  components['schemas']['PipelineRunRequiredActionV2'];
export type PipelineRunStatusResponseV2 =
  components['schemas']['PipelineRunStatusResponseV2'];
export type PipelineRunStartV2 =
  components['schemas']['PipelineRunStartV2'];
export type PipelineRunRetryV2 =
  components['schemas']['PipelineRunRetryV2'];
export type CampaignRunRecoveryV2 =
  components['schemas']['CampaignRunRecoveryV2'];
export type WizardRunReferenceV2 =
  components['schemas']['WizardRunReferenceV2'];
export type WizardStateRunRecoveryV2 =
  components['schemas']['WizardStateRunRecoveryV2'];

export type CampaignRunRecoveryMode = 'active' | 'latest';
