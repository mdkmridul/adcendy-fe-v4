import { campaignDocumentsMockAdapter } from '../mock/campaignDocuments.mock';
import { campaignDocumentsRealAdapter } from '../real/campaignDocuments.real';
import ENV from '@/lib/env';
import type {
  CampaignDocumentDownload,
  CampaignDocumentList,
} from '@/shared/types/campaignDocument';

const adapter = ENV.API.isMock ? campaignDocumentsMockAdapter : campaignDocumentsRealAdapter;

export const campaignDocumentsRepository = {
  listDocuments: async (campaignId: string): Promise<CampaignDocumentList> =>
    adapter.listDocuments(campaignId),
  getDownload: async (campaignId: string, documentId: string): Promise<CampaignDocumentDownload> =>
    adapter.getDownload(campaignId, documentId),
};
