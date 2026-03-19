import type {
  CampaignDocumentDownload,
  CampaignDocumentList,
} from '@/shared/types/campaignDocument';

async function delay(ms: number = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const campaignDocumentsMockAdapter = {
  async listDocuments(_campaignId: string): Promise<CampaignDocumentList> {
    await delay();

    return {
      items: [],
      total: 0,
    };
  },

  async getDownload(_campaignId: string, _documentId: string): Promise<CampaignDocumentDownload> {
    await delay(150);
    throw new Error('Document downloads are unavailable in mock mode.');
  },
};
