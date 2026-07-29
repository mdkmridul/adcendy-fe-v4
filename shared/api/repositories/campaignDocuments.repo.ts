import { campaignDocumentsMockAdapter } from '../mock/campaignDocuments.mock';
import { campaignDocumentsRealAdapter } from '../real/campaignDocuments.real';
import ENV from '@/lib/env';
import type {
  CampaignArtifactDownload,
  CampaignArtifactList,
  CampaignArtifactTrigger,
  CampaignDocument,
  CampaignDocumentDownload,
  CampaignDocumentList,
  CampaignDocumentUploadInput,
  CampaignDocumentUploadOptions,
} from '@/shared/types/campaignDocument';

const adapter = ENV.API.isMock
  ? campaignDocumentsMockAdapter
  : campaignDocumentsRealAdapter;

export const campaignDocumentsRepository = {
  listDocuments: (
    campaignId: string,
    page?: number,
    pageSize?: number,
  ): Promise<CampaignDocumentList> =>
    adapter.listDocuments(campaignId, page, pageSize),

  uploadDocument: (
    campaignId: string,
    input: CampaignDocumentUploadInput,
    options?: CampaignDocumentUploadOptions,
  ): Promise<CampaignDocument> =>
    adapter.uploadDocument(campaignId, input, options),

  getDownload: (
    campaignId: string,
    documentId: string,
  ): Promise<CampaignDocumentDownload> =>
    adapter.getDownload(campaignId, documentId),

  listArtifacts: (
    campaignId: string,
    page?: number,
    pageSize?: number,
  ): Promise<CampaignArtifactList> =>
    adapter.listArtifacts(campaignId, page, pageSize),

  getArtifactDownload: (
    campaignId: string,
    artifactId: string,
  ): Promise<CampaignArtifactDownload> =>
    adapter.getArtifactDownload(campaignId, artifactId),

  requestPdfArtifact: (
    campaignId: string,
    runId?: string,
  ): Promise<CampaignArtifactTrigger> =>
    adapter.requestPdfArtifact(campaignId, runId),
};
