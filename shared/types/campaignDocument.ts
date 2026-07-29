import type { components } from '@/src/generated/files-v1';

export type CampaignDocument = components['schemas']['Document'];
export type CampaignDocumentList = components['schemas']['DocumentList'];
export type CampaignDocumentDownload =
  components['schemas']['DocumentDownload'];
export type CampaignArtifact = components['schemas']['Artifact'];
export type CampaignArtifactList = components['schemas']['ArtifactList'];
export type CampaignArtifactDownload =
  components['schemas']['ArtifactDownload'];
export type CampaignArtifactTrigger =
  components['schemas']['ArtifactTrigger'];
export type CampaignArtifactStatus =
  components['schemas']['ArtifactStatus'];

export interface CampaignDocumentUploadInput {
  file: File;
  title?: string;
  description?: string;
  availableAt?: string;
}

export interface CampaignDocumentUploadOptions {
  signal?: AbortSignal;
  onProgress?: (percentage: number) => void;
}
