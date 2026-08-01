import { campaignDocumentsMockAdapter } from '../mock/campaignDocuments.mock';
import { campaignDocumentsRealAdapter } from '../real/campaignDocuments.real';
import ENV from '@/lib/env';
import type {
  CampaignDocument,
  CampaignDocumentDownload,
  CampaignDocumentList,
  CampaignDocumentUploadInput,
  CampaignDocumentUploadOptions,
} from '@/shared/types/campaignDocument';

const adapter = ENV.API.isMock ? campaignDocumentsMockAdapter : campaignDocumentsRealAdapter;

export const campaignDocumentsRepository = {
  listDocuments: (campaignId: string, page?: number, pageSize?: number): Promise<CampaignDocumentList> =>
    adapter.listDocuments(campaignId, page, pageSize),

  uploadDocument: (
    campaignId: string,
    input: CampaignDocumentUploadInput,
    options?: CampaignDocumentUploadOptions,
  ): Promise<CampaignDocument> => adapter.uploadDocument(campaignId, input, options),

  getDownload: (campaignId: string, documentId: string): Promise<CampaignDocumentDownload> =>
    adapter.getDownload(campaignId, documentId),
};
